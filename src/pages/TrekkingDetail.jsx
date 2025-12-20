import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, Mountain, TrendingUp, Calendar, DollarSign, CheckCircle, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Skeleton } from "@/components/ui/skeleton";

const difficultyColors = {
  beginner: "bg-green-100 text-green-700 border-green-200",
  moderate: "bg-yellow-100 text-yellow-700 border-yellow-200",
  difficult: "bg-orange-100 text-orange-700 border-orange-200",
  expert: "bg-red-100 text-red-700 border-red-200"
};

export default function TrekkingDetail() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const trekId = urlParams.get("id");

  const { data: treks = [], isLoading } = useQuery({
    queryKey: ['treks'],
    queryFn: () => base44.entities.TrekkingRoute.list(),
  });

  const trek = treks.find(t => t.id === trekId);

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Skeleton className="h-96 w-full rounded-3xl mb-8" />
        <Skeleton className="h-12 w-3/4 mb-4" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!trek) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Trek not found</h2>
        <Button onClick={() => navigate(createPageUrl("Trekking"))}>
          Back to Trekking Routes
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12">
      {/* Hero */}
      <div className="relative h-96 md:h-[500px] overflow-hidden">
        <img
          src={trek.image_url || `https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=1920&h=800&fit=crop`}
          alt={trek.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(createPageUrl("Trekking"))}
          className="absolute top-6 left-6 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full shadow-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>

        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
          <div className="max-w-5xl mx-auto">
            <Badge className={`${difficultyColors[trek.difficulty]} border mb-4 shadow-lg`}>
              <TrendingUp className="w-3 h-3 mr-1" />
              {trek.difficulty.charAt(0).toUpperCase() + trek.difficulty.slice(1)}
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-2xl">
              {trek.name}
            </h1>
            <div className="flex flex-wrap gap-6 text-white/90">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-400" />
                <span className="text-lg">{trek.duration_days} days</span>
              </div>
              <div className="flex items-center gap-2">
                <Mountain className="w-5 h-5 text-amber-400" />
                <span className="text-lg">{trek.max_altitude}</span>
              </div>
              {trek.best_season && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-amber-400" />
                  <span className="text-lg">{trek.best_season}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 -mt-12 relative z-10">
        <Card className="border-0 shadow-2xl p-8 md:p-12 bg-white/95 backdrop-blur-sm">
          {/* Overview */}
          <div className="grid md:grid-cols-3 gap-8 mb-12 pb-12 border-b border-stone-200">
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl">
              <Clock className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <p className="text-3xl font-bold text-gray-900 mb-1">{trek.duration_days}</p>
              <p className="text-gray-600">Days</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl">
              <Mountain className="w-8 h-8 text-amber-600 mx-auto mb-3" />
              <p className="text-2xl font-bold text-gray-900 mb-1">{trek.max_altitude}</p>
              <p className="text-gray-600">Max Altitude</p>
            </div>
            {trek.estimated_cost && (
              <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl">
                <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-3" />
                <p className="text-2xl font-bold text-gray-900 mb-1">{trek.estimated_cost}</p>
                <p className="text-gray-600">Estimated Cost</p>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-red-900 to-amber-800 bg-clip-text text-transparent">
              About This Trek
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed">
              {trek.description}
            </p>
          </div>

          {/* Highlights */}
          {trek.highlights && trek.highlights.length > 0 && (
            <div className="mb-12">
              <h3 className="text-2xl font-bold mb-6 text-gray-900">Trek Highlights</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {trek.highlights.map((highlight, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl">
                    <CheckCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{highlight}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Itinerary */}
          {trek.itinerary && trek.itinerary.length > 0 && (
            <div className="mb-12">
              <h3 className="text-2xl font-bold mb-6 text-gray-900">Day-by-Day Itinerary</h3>
              <div className="space-y-4">
                {trek.itinerary.map((day, index) => (
                  <Card key={index} className="p-6 bg-gradient-to-br from-stone-50 to-amber-50/30 border-stone-200">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-red-900 to-amber-800 flex items-center justify-center text-white font-bold shadow-lg">
                        {day.day}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-lg text-gray-900 mb-2">{day.title}</h4>
                        <p className="text-gray-600">{day.description}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Important Information */}
          <div className="mb-12 p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-lg text-gray-900 mb-2">Important Information</h4>
                <ul className="space-y-2 text-gray-700">
                  {trek.permit_required && (
                    <li>• Trekking permits are required for this route</li>
                  )}
                  <li>• Proper acclimatization is essential at high altitudes</li>
                  <li>• Hire experienced guides for safety and better experience</li>
                  <li>• Best season: {trek.best_season || "Spring and Autumn"}</li>
                </ul>
              </div>
            </div>
          </div>

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