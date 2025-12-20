import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Calendar, Mountain, Sparkles, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Skeleton } from "@/components/ui/skeleton";

export default function DestinationDetail() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const destinationId = urlParams.get("id");

  const { data: destinations = [], isLoading } = useQuery({
    queryKey: ['destinations'],
    queryFn: () => base44.entities.Destination.list(),
  });

  const destination = destinations.find(d => d.id === destinationId);

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Skeleton className="h-96 w-full rounded-3xl mb-8" />
        <Skeleton className="h-12 w-3/4 mb-4" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!destination) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Destination not found</h2>
        <Button onClick={() => navigate(createPageUrl("Destinations"))}>
          Back to Destinations
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12">
      {/* Hero Image */}
      <div className="relative h-96 md:h-[500px] overflow-hidden">
        <img
          src={destination.image_url || `https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1920&h=800&fit=crop`}
          alt={destination.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(createPageUrl("Destinations"))}
          className="absolute top-6 left-6 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full shadow-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>

        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
          <div className="max-w-5xl mx-auto">
            {destination.featured && (
              <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 mb-4 shadow-lg">
                <Sparkles className="w-3 h-3 mr-1" />
                Featured Destination
              </Badge>
            )}
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-2xl">
              {destination.name}
            </h1>
            <div className="flex flex-wrap gap-4 text-white/90">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-amber-400" />
                <span className="text-lg">{destination.region}</span>
              </div>
              {destination.altitude && (
                <div className="flex items-center gap-2">
                  <Mountain className="w-5 h-5 text-amber-400" />
                  <span className="text-lg">{destination.altitude}</span>
                </div>
              )}
              {destination.best_time_to_visit && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-amber-400" />
                  <span className="text-lg">Best: {destination.best_time_to_visit}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 -mt-12 relative z-10">
        <Card className="border-0 shadow-2xl p-8 md:p-12 bg-white/95 backdrop-blur-sm">
          {/* Description */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-red-900 to-amber-800 bg-clip-text text-transparent">
              About {destination.name}
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed">
              {destination.description}
            </p>
          </div>

          {/* Highlights */}
          {destination.highlights && destination.highlights.length > 0 && (
            <div className="mb-12">
              <h3 className="text-2xl font-bold mb-6 text-gray-900">Highlights</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {destination.highlights.map((highlight, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl">
                    <CheckCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{highlight}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Activities */}
          {destination.activities && destination.activities.length > 0 && (
            <div className="mb-12">
              <h3 className="text-2xl font-bold mb-6 text-gray-900">Things to Do</h3>
              <div className="flex flex-wrap gap-3">
                {destination.activities.map((activity, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="bg-gradient-to-r from-red-100 to-amber-100 text-red-900 border-red-200 px-4 py-2 text-sm"
                  >
                    {activity}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Gallery */}
          {destination.gallery && destination.gallery.length > 0 && (
            <div className="mb-12">
              <h3 className="text-2xl font-bold mb-6 text-gray-900">Gallery</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {destination.gallery.map((image, index) => (
                  <div key={index} className="relative h-48 rounded-xl overflow-hidden group">
                    <img
                      src={image}
                      alt={`${destination.name} ${index + 1}`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="text-center pt-8 border-t border-stone-200">
            <Button
              onClick={() => navigate(createPageUrl("MyPlans"))}
              className="bg-gradient-to-r from-red-900 to-amber-800 hover:from-red-800 hover:to-amber-700 text-white px-8 py-6 text-lg rounded-2xl shadow-xl"
            >
              Add to My Travel Plan
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}