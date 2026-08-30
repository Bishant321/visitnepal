import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, DollarSign, Edit, X, Check, CreditCard, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || "pk_test_dummy");

function PaymentForm({ booking, onSuccess, onCancel }) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    try {
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardElement),
      });

      if (error) {
        toast.error(error.message);
      } else {
        onSuccess(paymentMethod.id);
      }
    } catch (error) {
      toast.error("Payment failed");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handlePayment} className="space-y-4">
      <div className="p-4 bg-gray-50 rounded-lg">
        <CardElement options={{
          style: {
            base: {
              fontSize: '16px',
              color: '#424770',
              '::placeholder': { color: '#aab7c4' },
            },
          },
        }} />
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={!stripe || processing} className="flex-1">
          {processing ? "Processing..." : `Pay $${booking.total_price}`}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

export default function BookingManager({ bookingId, onClose }) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [editData, setEditData] = useState({
    booking_date: "",
    participants: 1,
    special_requests: ""
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ['bookings'],
    queryFn: () => base44.entities.Booking.list("-created_date"),
  });

  const booking = bookings.find(b => b.id === bookingId);

  const updateBookingMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Booking.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      setEditing(false);
      toast.success("Booking updated!");
    },
  });

  const cancelBookingMutation = useMutation({
    mutationFn: (id) => base44.entities.Booking.update(id, { status: "cancelled" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success("Booking cancelled");
    },
  });

  const processPaymentMutation = useMutation({
    mutationFn: ({ id, paymentMethodId }) => base44.entities.Booking.update(id, { 
      payment_status: "paid",
      status: "confirmed"
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      setShowPayment(false);
      toast.success("Payment successful!");
    },
  });

  if (!booking) return null;

  const handleUpdate = () => {
    const updatedData = {
      ...editData,
      total_price: editData.participants * (booking.total_price / booking.participants)
    };
    updateBookingMutation.mutate({ id: booking.id, data: updatedData });
  };

  const handlePaymentSuccess = (paymentMethodId) => {
    processPaymentMutation.mutate({ id: booking.id, paymentMethodId });
  };

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
    confirmed: "bg-green-100 text-green-700 border-green-200",
    completed: "bg-blue-100 text-blue-700 border-blue-200",
    cancelled: "bg-red-100 text-red-700 border-red-200"
  };

  const paymentColors = {
    pending: "bg-orange-100 text-orange-700 border-orange-200",
    paid: "bg-green-100 text-green-700 border-green-200",
    refunded: "bg-gray-100 text-gray-700 border-gray-200"
  };

  return (
    <Card className="border-0 shadow-2xl">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl mb-2">{booking.experience_name}</CardTitle>
            <div className="flex gap-2">
              <Badge className={`${statusColors[booking.status]} border`}>
                {booking.status}
              </Badge>
              <Badge className={`${paymentColors[booking.payment_status]} border`}>
                {booking.payment_status}
              </Badge>
            </div>
          </div>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-6 space-y-6">
        {!editing && !showPayment ? (
          <>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <Calendar className="w-5 h-5 text-indigo-600" />
                <div>
                  <p className="text-sm text-gray-600">Date</p>
                  <p className="font-semibold">{format(new Date(booking.booking_date), "MMM d, yyyy")}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <Users className="w-5 h-5 text-indigo-600" />
                <div>
                  <p className="text-sm text-gray-600">Participants</p>
                  <p className="font-semibold">{booking.participants}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <DollarSign className="w-5 h-5 text-indigo-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Price</p>
                  <p className="font-semibold">${booking.total_price}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <CreditCard className="w-5 h-5 text-indigo-600" />
                <div>
                  <p className="text-sm text-gray-600">Payment</p>
                  <p className="font-semibold capitalize">{booking.payment_status}</p>
                </div>
              </div>
            </div>

            {booking.special_requests && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm font-semibold text-gray-700 mb-1">Special Requests</p>
                <p className="text-gray-600">{booking.special_requests}</p>
              </div>
            )}

            {booking.status !== "cancelled" && booking.status !== "completed" && (
              <div className="flex gap-3">
                {booking.status === "pending" && (
                  <Button onClick={() => setEditing(true)} variant="outline" className="flex-1">
                    <Edit className="w-4 h-4 mr-2" />
                    Modify Booking
                  </Button>
                )}
                {booking.payment_status === "pending" && (
                  <Button onClick={() => setShowPayment(true)} className="flex-1 bg-green-600 hover:bg-green-700">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Pay Now
                  </Button>
                )}
                {booking.status === "pending" && (
                  <Button 
                    onClick={() => cancelBookingMutation.mutate(booking.id)} 
                    variant="outline"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                )}
              </div>
            )}
          </>
        ) : editing ? (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">New Date</label>
              <Input
                type="date"
                value={editData.booking_date}
                onChange={(e) => setEditData({...editData, booking_date: e.target.value})}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Participants</label>
              <Input
                type="number"
                min="1"
                value={editData.participants}
                onChange={(e) => setEditData({...editData, participants: parseInt(e.target.value)})}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Special Requests</label>
              <Input
                value={editData.special_requests}
                onChange={(e) => setEditData({...editData, special_requests: e.target.value})}
                className="mt-1"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleUpdate} disabled={updateBookingMutation.isPending} className="flex-1">
                <Check className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
              <Button variant="outline" onClick={() => setEditing(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Elements stripe={stripePromise}>
            <div className="space-y-4">
              <div className="p-4 bg-indigo-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Payment Summary</h4>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Amount</span>
                  <span className="text-2xl font-bold text-indigo-600">${booking.total_price}</span>
                </div>
              </div>
              <PaymentForm 
                booking={booking} 
                onSuccess={handlePaymentSuccess} 
                onCancel={() => setShowPayment(false)} 
              />
            </div>
          </Elements>
        )}
      </CardContent>
    </Card>
  );
}