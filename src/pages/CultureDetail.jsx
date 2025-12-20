import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Award, Clock, DollarSign, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Skeleton } from "@/components/ui/skeleton";

export default function CultureDetail() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const siteId = urlParams.get("id");

  const { data: sites = [], isLoading } = useQuery({
    queryKey: ['culturalSites'],
    queryFn: () => base44.entities.CulturalSite.list(),
  });

  const site = sites.find(s => s.id === siteId);

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Skeleton className="h-96 w-full rounded-3xl mb-8" />
        <Skeleton className="h-12 w-3/4 mb-4" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!site) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Cultural site not found</h2>
        <Button onClick={() => navigate(createPageUrl("Culture"))}>
          Back to Cultural Heritage
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12">
      {/* Hero */}
      <div className="relative h-96 md:h-[500px] overflow-hidden">
        <img
          src={site.image_url || `https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=1920&h=800&fit=crop`}
          alt={site.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(createPageUrl("Culture"))}
          className="absolute top-6 left-6 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full shadow-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>

        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-wrap gap-3 mb-4">
              <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-lg">
                <Sparkles className="w-3 h-3 mr-1" />
                {site.category}
              </Badge>
              {site.unesco_heritage && (
                <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 shadow-lg">
                  <Award className="w-3 h-3 mr-1" />
                  UNESCO World Heritage
                </Badge>
              )}
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-2xl">
              {site.name}
            </h1>
            <div className="flex items-center gap-2 text-amber-200 text-lg">
              <MapPin className="w-5 h-5" />
              <span>{site.location}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 -mt-12 relative z-10">
        <Card className="border-0 shadow-2xl p-8 md:p-12 bg-white/95 backdrop-blur-sm">
          {/* Quick Info */}
          {(site.entry_fee || site.opening_hours) && (
            <div className="grid md:grid-cols-2 gap-6 mb-12 pb-12 border-b border-stone-200">
              {site.entry_fee && (
                <div className="flex items-center gap-4 p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl">
                  <DollarSign className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Entry Fee</p>
                    <p className="text-xl font-bold text-gray-900">{site.entry_fee}</p>
                  </div>
                </div>
              )}
              {site.opening_hours && (
                <div className="flex items-center gap-4 p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl">
                  <Clock className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Opening Hours</p>
                    <p className="text-xl font-bold text-gray-900">{site.opening_hours}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Description */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-red-900 to-amber-800 bg-clip-text text-transparent">
              About {site.name}
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed mb-6">
              {site.description}
            </p>
          </div>

          {/* History */}
          {site.history && (
            <div className="mb-12">
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Historical Background</h3>
              <p className="text-gray-700 leading-relaxed">
                {site.history}
              </p>
            </div>
          )}

          {/* Significance */}
          {site.significance && (
            <div className="mb-12 p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl">
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Cultural Significance</h3>
              <p className="text-gray-700 leading-relaxed">
                {site.significance}
              </p>
            </div>
          )}

          {/* Festivals */}
          {site.festivals && site.festivals.length > 0 && (
            <div className="mb-12">
              <h3 className="text-2xl font-bold mb-6 text-gray-900">Festivals & Celebrations</h3>
              <div className="flex flex-wrap gap-3">
                {site.festivals.map((festival, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="bg-gradient-to-r from-pink-100 to-purple-100 text-pink-900 border-pink-200 px-4 py-2 text-sm"
                  >
                    {festival}
                  </Badge>
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