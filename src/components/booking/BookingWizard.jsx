import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, CreditCard, CheckCircle, ArrowLeft, ArrowRight } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || "pk_test_51234567890");

function PaymentForm({ bookingData, totalAmount, onSuccess, onBack }) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setError(null);

    try {
      const cardElement = elements.getElement(CardElement);
      const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (stripeError) {
        setError(stripeError.message);
        setProcessing(false);
        return;
      }

      // In production, you would send payment_method.id to your backend
      // For now, we'll simulate success
      onSuccess({
        ...bookingData,
        payment_method_id: paymentMethod.id,
        payment_status: "paid"
      });
    } catch (err) {
      setError(err.message);
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold mb-2">Payment Summary</h3>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>${bookingData.subtotal?.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Platform Fee (5%)</span>
            <span>${bookingData.platform_fee?.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg pt-2 border-t">
            <span>Total</span>
            <span className="text-indigo-600">${totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="p-4 border rounded-lg">
        <label className="text-sm font-medium block mb-2">Card Details</label>
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': { color: '#aab7c4' },
              },
            },
          }}
        />
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onBack} className="flex-1">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button
          type="submit"
          disabled={!stripe || processing}
          className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600"
        >
          {processing ? "Processing..." : `Pay $${totalAmount.toFixed(2)}`}
        </Button>
      </div>

      <p className="text-xs text-center text-gray-500">
        🔒 Secure payment powered by Stripe
      </p>
    </form>
  );
}

export default function BookingWizard({ experience, user, onComplete, onCancel }) {
  const [step, setStep] = useState(1);
  const [bookingData, setBookingData] = useState({
    booking_date: "",
    participants: 1,
    contact_phone: user?.phone_number || "",
    contact_email: user?.email || "",
    special_requests: "",
  });

  const subtotal = bookingData.participants * experience.price;
  const platformFee = subtotal * 0.05;
  const total = subtotal + platformFee;

  const steps = [
    { number: 1, title: "Date & Guests", icon: Calendar },
    { number: 2, title: "Contact Info", icon: Users },
    { number: 3, title: "Payment", icon: CreditCard },
    { number: 4, title: "Confirmation", icon: CheckCircle }
  ];

  const handleNext = () => {
    if (step === 1 && (!bookingData.booking_date || bookingData.participants < 1)) {
      alert("Please select a date and number of participants");
      return;
    }
    if (step === 2 && (!bookingData.contact_phone || !bookingData.contact_email)) {
      alert("Please provide contact information");
      return;
    }
    setStep(step + 1);
  };

  const handlePaymentSuccess = (data) => {
    setBookingData({ ...bookingData, ...data });
    setStep(4);
    setTimeout(() => {
      onComplete({
        ...bookingData,
        ...data,
        total_price: total,
        subtotal,
        platform_fee: platformFee
      });
    }, 2000);
  };

  return (
    <Card className="border-0 shadow-2xl">
      <CardContent className="p-6">
        {/* Progress Steps */}
        <div className="flex justify-between mb-8">
          {steps.map((s) => {
            const Icon = s.icon;
            const isActive = step === s.number;
            const isCompleted = step > s.number;
            return (
              <div key={s.number} className="flex flex-col items-center flex-1">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                  isCompleted ? 'bg-green-500 text-white' :
                  isActive ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {isCompleted ? <CheckCircle className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
                </div>
                <p className={`text-xs font-medium ${isActive ? 'text-indigo-600' : 'text-gray-500'}`}>
                  {s.title}
                </p>
              </div>
            );
          })}
        </div>

        {/* Step 1: Date & Guests */}
        {step === 1 && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold mb-4">Select Date & Guests</h3>
            <div>
              <label className="text-sm font-medium block mb-2">Booking Date</label>
              <Input
                type="date"
                value={bookingData.booking_date}
                onChange={(e) => setBookingData({...bookingData, booking_date: e.target.value})}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">Number of Participants</label>
              <Input
                type="number"
                min="1"
                max={experience.max_participants || 10}
                value={bookingData.participants}
                onChange={(e) => setBookingData({...bookingData, participants: parseInt(e.target.value)})}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Max {experience.max_participants || 10} participants
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between mb-2">
                <span>Price per person:</span>
                <span className="font-medium">${experience.price}</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={onCancel} className="flex-1">Cancel</Button>
              <Button onClick={handleNext} className="flex-1 bg-indigo-600">
                Next <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Contact Info */}
        {step === 2 && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold mb-4">Contact Information</h3>
            <div>
              <label className="text-sm font-medium block mb-2">Email</label>
              <Input
                type="email"
                value={bookingData.contact_email}
                onChange={(e) => setBookingData({...bookingData, contact_email: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">Phone Number</label>
              <Input
                type="tel"
                value={bookingData.contact_phone}
                onChange={(e) => setBookingData({...bookingData, contact_phone: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">Special Requests (Optional)</label>
              <Textarea
                value={bookingData.special_requests}
                onChange={(e) => setBookingData({...bookingData, special_requests: e.target.value})}
                rows={4}
                placeholder="Any dietary restrictions, accessibility needs, or special requests..."
              />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button onClick={handleNext} className="flex-1 bg-indigo-600">
                Next <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Payment */}
        {step === 3 && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold mb-4">Payment Details</h3>
            <Elements stripe={stripePromise}>
              <PaymentForm
                bookingData={{ ...bookingData, subtotal, platform_fee: platformFee }}
                totalAmount={total}
                onSuccess={handlePaymentSuccess}
                onBack={() => setStep(2)}
              />
            </Elements>
          </div>
        )}

        {/* Step 4: Confirmation */}
        {step === 4 && (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h3 className="text-3xl font-bold mb-2">Booking Confirmed!</h3>
            <p className="text-gray-600 mb-6">
              Your booking has been confirmed and payment processed successfully.
            </p>
            <Badge className="bg-green-100 text-green-700 px-4 py-2 text-base">
              Confirmation sent to {bookingData.contact_email}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}