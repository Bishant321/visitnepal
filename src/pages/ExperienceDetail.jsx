import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Star, Clock, MapPin, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Skeleton } from "@/components/ui/skeleton";

export default function ExperienceDetail() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const experienceId = urlParams.get("id");
  const [showBooking, setShowBooking] = useState(false);

  const { data: experiences = [], isLoading } = useQuery({
    queryKey: ['experiences'],
    queryFn: () => base44.entities.Experience.list(),
  });

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const experience = experiences.find(e => e.id === experienceId);

  const [bookingData, setBookingData] = useState({
    booking_date: "",
    participants: 1,
    special_requests: "",
    contact_email: user?.email || "",
    contact_phone: ""
  });

  const createBookingMutation = useMutation({
    mutationFn: (data) => base44.entities.Booking.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      alert("Booking request submitted! The host will contact you shortly.");
      navigate(createPageUrl("MyBookings"));
    },
  });

  const handleBooking = (e) => {
    e.preventDefault();
    
    // Calculate fees
    const subtotal = bookingData.participants * experience.price;
    const platformFee = subtotal * 0.05; // 5% platform fee
    const total = subtotal + platformFee;
    
    // Create booking with payment info
    createBookingMutation.mutate({
      experience_id: experience.id,
      experience_name: experience.name,
      ...bookingData,
      total_price: total,
      payment_breakdown: {
        subtotal: subtotal,
        platform_fee: platformFee,
        total: total
      }
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Skeleton className="h-96 w-full rounded-3xl mb-8" />
        <Skeleton className="h-12 w-3/4 mb-4" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!experience) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Experience not found</h2>
        <Button onClick={() => navigate(createPageUrl("Experiences"))}>
          Back to Experiences
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12">
      <div className="relative h-96 md:h-[500px] overflow-hidden">
        <img
          src={experience.image_url || `https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=1920&h=800&fit=crop`}
          alt={experience.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(createPageUrl("Experiences"))}
          className="absolute top-6 left-6 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full shadow-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>

        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-2xl">
              {experience.name}
            </h1>
            <div className="flex flex-wrap gap-4 text-white/90">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-amber-400" />
                <span className="text-lg">{experience.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                <span className="text-lg">{experience.rating || 0} ({experience.reviews_count || 0} reviews)</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-400" />
                <span className="text-lg">{experience.duration}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-12 relative z-10">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-2xl p-8 bg-white/95 backdrop-blur-sm mb-8">
              <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-indigo-900 to-purple-800 bg-clip-text text-transparent">
                About This Experience
              </h2>
              <p className="text-gray-700 text-lg leading-relaxed mb-8">
                {experience.description}
              </p>

              {experience.highlights && experience.highlights.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-2xl font-bold mb-4 text-gray-900">Highlights</h3>
                  <div className="grid gap-3">
                    {experience.highlights.map((highlight, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-indigo-50 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{highlight}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {experience.includes && experience.includes.length > 0 && (
                <div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-900">What's Included</h3>
                  <div className="flex flex-wrap gap-2">
                    {experience.includes.map((item, index) => (
                      <Badge key={index} variant="secondary" className="bg-purple-100 text-purple-700 px-3 py-1">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="border-0 shadow-2xl sticky top-24">
              <div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50">
                <div className="flex items-baseline justify-between mb-6">
                  <div>
                    <span className="text-4xl font-bold text-gray-900">${experience.price}</span>
                    <span className="text-gray-600 ml-2">per person</span>
                  </div>
                </div>

                {!showBooking ? (
                  <Button
                    onClick={() => setShowBooking(true)}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-6 text-lg"
                  >
                    Book Now
                  </Button>
                ) : (
                  <form onSubmit={handleBooking} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Date</label>
                      <Input
                        type="date"
                        value={bookingData.booking_date}
                        onChange={(e) => setBookingData({...bookingData, booking_date: e.target.value})}
                        required
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Participants</label>
                      <Input
                        type="number"
                        min="1"
                        max={experience.max_participants}
                        value={bookingData.participants}
                        onChange={(e) => setBookingData({...bookingData, participants: parseInt(e.target.value)})}
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Phone</label>
                      <Input
                        type="tel"
                        value={bookingData.contact_phone}
                        onChange={(e) => setBookingData({...bookingData, contact_phone: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Special Requests</label>
                      <Textarea
                        value={bookingData.special_requests}
                        onChange={(e) => setBookingData({...bookingData, special_requests: e.target.value})}
                        rows={3}
                      />
                    </div>
                    <div className="border-t pt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="font-medium">${bookingData.participants * experience.price}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Platform Fee (5%)</span>
                        <span className="font-medium">${(bookingData.participants * experience.price * 0.05).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t">
                        <span className="text-gray-900 font-semibold">Total</span>
                        <span className="font-bold text-xl text-indigo-600">${(bookingData.participants * experience.price * 1.05).toFixed(2)}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        💳 Secure payment processed after host confirmation
                      </p>
                    </div>
                    <Button type="submit" className="w-full bg-gradient-to-r from-indigo-600 to-purple-600">
                      Confirm Booking
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowBooking(false)} className="w-full">
                      Cancel
                    </Button>
                  </form>
                )}

                <div className="mt-6 pt-6 border-t text-sm text-gray-600 space-y-2">
                  <p><strong>Host:</strong> {experience.host_name}</p>
                  {experience.max_participants && (
                    <p><strong>Max participants:</strong> {experience.max_participants}</p>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}