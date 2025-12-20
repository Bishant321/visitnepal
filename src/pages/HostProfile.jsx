import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, MessageSquare, CheckCircle, Award, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Skeleton } from "@/components/ui/skeleton";
import ExperienceCard from "../components/experiences/ExperienceCard";
import ChatWindow from "../components/chat/ChatWindow";

export default function HostProfile() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const hostEmail = urlParams.get("email");
  const [showChat, setShowChat] = useState(false);

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: experiences = [], isLoading: loadingExperiences } = useQuery({
    queryKey: ['hostExperiences', hostEmail],
    queryFn: () => base44.entities.Experience.filter({ created_by: hostEmail }),
    enabled: !!hostEmail,
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ['hostBookings', hostEmail],
    queryFn: async () => {
      const allBookings = await base44.entities.Booking.list();
      const hostExpIds = experiences.map(e => e.id);
      return allBookings.filter(b => hostExpIds.includes(b.experience_id));
    },
    enabled: experiences.length > 0,
  });

  const { data: allUsers = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list(),
  });

  const hostUser = allUsers.find(u => u.email === hostEmail);

  if (isLoading || loadingExperiences) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Skeleton className="h-64 w-full rounded-3xl mb-8" />
        <div className="grid md:grid-cols-3 gap-8">
          <Skeleton className="h-96 w-full" />
          <div className="md:col-span-2">
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!hostEmail || experiences.length === 0) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Host not found</h2>
        <Button onClick={() => navigate(createPageUrl("Experiences"))}>
          Back to Experiences
        </Button>
      </div>
    );
  }

  const averageRating = experiences.reduce((sum, exp) => sum + (exp.rating || 0), 0) / experiences.length;
  const totalReviews = experiences.reduce((sum, exp) => sum + (exp.reviews_count || 0), 0);
  const completedBookings = bookings.filter(b => b.status === "completed").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-red-50/20">
      {/* Hero Section */}
      <div className="relative h-64 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=1920&h=400&fit=crop"
            alt="Host Profile"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-red-900/90 to-amber-900/90" />
        </div>
        <div className="relative z-10 text-center text-white">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-4xl font-bold shadow-2xl mx-auto mb-4 border-4 border-white">
            {hostUser?.full_name?.[0] || experiences[0]?.host_name?.[0] || "H"}
          </div>
          <h1 className="text-4xl font-bold mb-2">{hostUser?.full_name || experiences[0]?.host_name}</h1>
          <div className="flex items-center justify-center gap-4 text-amber-200">
            <div className="flex items-center gap-1">
              <Star className="w-5 h-5 fill-amber-300 text-amber-300" />
              <span className="font-semibold">{averageRating.toFixed(1)}</span>
            </div>
            <span>•</span>
            <span>{totalReviews} reviews</span>
            <span>•</span>
            <span>{experiences.length} experiences</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-xl sticky top-24">
              <CardHeader className="bg-gradient-to-r from-red-50 to-amber-50">
                <CardTitle>Host Information</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                {/* Stats */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-medium">Completed</span>
                    </div>
                    <span className="text-lg font-bold text-green-700">{completedBookings}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-amber-600" />
                      <span className="text-sm font-medium">Rating</span>
                    </div>
                    <span className="text-lg font-bold text-amber-700">{averageRating.toFixed(1)} ⭐</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      <span className="text-sm font-medium">Experiences</span>
                    </div>
                    <span className="text-lg font-bold text-blue-700">{experiences.length}</span>
                  </div>
                </div>

                {/* Bio */}
                {hostUser?.bio && (
                  <div>
                    <h3 className="font-semibold mb-2">About</h3>
                    <p className="text-sm text-gray-600">{hostUser.bio}</p>
                  </div>
                )}

                {/* Verified Badge */}
                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-2 border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-green-900">Verified Host</span>
                  </div>
                  <p className="text-xs text-green-700">
                    Identity verified by VisitNepal
                  </p>
                </div>

                {/* Chat Button */}
                {currentUser && currentUser.email !== hostEmail && (
                  <Button
                    onClick={() => setShowChat(true)}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Contact Host
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Experiences */}
            <Card className="border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-red-50 to-amber-50">
                <CardTitle>Hosted Experiences</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {experiences.map((experience) => (
                    <ExperienceCard
                      key={experience.id}
                      experience={experience}
                      onClick={() => navigate(createPageUrl("ExperienceDetail") + `?id=${experience.id}`)}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Reviews Section */}
            <Card className="border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
                <CardTitle>Reviews</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <Star className="w-16 h-16 text-amber-400 mx-auto mb-4 fill-amber-400" />
                  <h3 className="text-2xl font-bold mb-2">{averageRating.toFixed(1)} Average Rating</h3>
                  <p className="text-gray-600">Based on {totalReviews} reviews across all experiences</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Chat Modal */}
      {showChat && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full">
            <ChatWindow
              experienceId={experiences[0]?.id}
              receiverEmail={hostEmail}
              receiverName={hostUser?.full_name || experiences[0]?.host_name}
              onClose={() => setShowChat(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}