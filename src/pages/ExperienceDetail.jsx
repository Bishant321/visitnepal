import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Star, Clock, Users, MapPin, CheckCircle, DollarSign, Heart } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Skeleton } from "@/components/ui/skeleton";

export default function ExperienceDetail() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const experienceId = urlParams.get("id");
  const [showBooking, setShowBooking] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const { data: experiences = [], isLoading } = useQuery({
    queryKey: ['experiences'],
    queryFn: () => base44.entities.Experience.list(),
  });

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: wishlist = [] } = useQuery({
    queryKey: ['wishlist'],
    queryFn: () => base44.entities.Wishlist.filter({ created_by: user?.email }),
    enabled: !!user,
  });

  const isInWishlist = wishlist.some(item => item.experience_id === experienceId);

  const experience = experiences.find(e => e.id === experienceId);

  const createBookingMutation = useMutation({
    mutationFn: async (data) => {
      const booking = await base44.entities.Booking.create(data);
      
      // Send confirmation email to user
      await base44.integrations.Core.SendEmail({
        to: data.contact_email,
        subject: `Booking Confirmation - ${data.experience_name}`,
        body: `
          <h2>Booking Confirmed!</h2>
          <p>Hi ${user?.full_name},</p>
          <p>Your booking for <strong>${data.experience_name}</strong> has been confirmed!</p>
          <p><strong>Date:</strong> ${data.booking_date}</p>
          <p><strong>Participants:</strong> ${data.participants}</p>
          <p><strong>Total:</strong> $${data.total_price}</p>
          <p>The host will contact you shortly with more details.</p>
          <p>You can chat with the host anytime from your booking details page.</p>
        `
      });

      // Send notification to host
      await base44.integrations.Core.SendEmail({
        to: experience.host_contact,
        subject: `New Booking Request - ${data.experience_name}`,
        body: `
          <h2>New Booking Request</h2>
          <p>Hi ${experience.host_name},</p>
          <p>You have a new booking request for <strong>${data.experience_name}</strong></p>
          <p><strong>Guest:</strong> ${user?.full_name}</p>
          <p><strong>Date:</strong> ${data.booking_date}</p>
          <p><strong>Participants:</strong> ${data.participants}</p>
          <p><strong>Total:</strong> $${data.total_price}</p>
          <p><strong>Contact:</strong> ${data.contact_email} | ${data.contact_phone}</p>
          ${data.special_requests ? `<p><strong>Special Requests:</strong> ${data.special_requests}</p>` : ''}
        `
      });

      return booking;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      setShowBooking(false);
      toast.success("Booking confirmed! Check your email for details.");
      navigate(createPageUrl("MyBookings"));
    },
  });

  const addToWishlistMutation = useMutation({
    mutationFn: (data) => base44.entities.Wishlist.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      toast.success("Added to wishlist!");
    },
  });

  const removeFromWishlistMutation = useMutation({
    mutationFn: (id) => base44.entities.Wishlist.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      toast.success("Removed from wishlist");
    },
  });

  const toggleWishlist = () => {
    if (isInWishlist) {
      const item = wishlist.find(w => w.experience_id === experienceId);
      if (item) removeFromWishlistMutation.mutate(item.id);
    } else {
      addToWishlistMutation.mutate({
        experience_id: experienceId,
        experience_name: experience.name,
        experience_category: experience.category,
        experience_location: experience.location,
        experience_price: experience.price,
        experience_image_url: experience.image_url
      });
    }
  };

  const handleBookingComplete = (data) => {
    createBookingMutation.mutate({
      experience_id: experience.id,
      experience_name: experience.name,
      ...data,
      status: "confirmed"
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
            {!showBooking && !showChat && (
              <Card className="border-0 shadow-2xl sticky top-24">
                <div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50">
                  <div className="flex items-baseline justify-between mb-6">
                    <div>
                      <span className="text-4xl font-bold text-gray-900">${experience.price}</span>
                      <span className="text-gray-600 ml-2">per person</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Button
                      onClick={() => setShowBooking(true)}
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-6 text-lg"
                    >
                      Book Now
                    </Button>
                    <Button
                      onClick={toggleWishlist}
                      variant="outline"
                      className={`w-full py-3 ${isInWishlist ? 'bg-pink-50 border-pink-300 text-pink-600 hover:bg-pink-100' : 'hover:bg-gray-50'}`}
                    >
                      <Heart className={`w-4 h-4 mr-2 ${isInWishlist ? 'fill-pink-600' : ''}`} />
                      {isInWishlist ? 'Saved to Wishlist' : 'Add to Wishlist'}
                    </Button>
                    <Button
                      onClick={() => setShowChat(true)}
                      variant="outline"
                      className="w-full py-3"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Chat with Host
                    </Button>
                  </div>

                  <div className="mt-6 pt-6 border-t text-sm text-gray-600 space-y-2">
                    <p><strong>Host:</strong> {experience.host_name}</p>
                    {experience.max_participants && (
                      <p><strong>Max participants:</strong> {experience.max_participants}</p>
                    )}
                  </div>
                </div>
              </Card>
            )}

            {showBooking && (
              <div className="sticky top-24">
                <BookingWizard
                  experience={experience}
                  user={user}
                  onComplete={handleBookingComplete}
                  onCancel={() => setShowBooking(false)}
                />
              </div>
            )}

            {showChat && (
              <div className="sticky top-24">
                <ChatWindow
                  experienceId={experience.id}
                  receiverEmail={experience.host_contact}
                  receiverName={experience.host_name}
                  onClose={() => setShowChat(false)}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}