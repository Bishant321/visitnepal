import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mountain, MapPin, Calendar, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const typeIcons = {
  mountain: Mountain,
  city: MapPin,
  heritage_site: Sparkles,
  national_park: Mountain,
  village: MapPin,
  lake: Mountain
};

const typeColors = {
  mountain: "bg-blue-100 text-blue-700 border-blue-200",
  city: "bg-amber-100 text-amber-700 border-amber-200",
  heritage_site: "bg-red-100 text-red-700 border-red-200",
  national_park: "bg-green-100 text-green-700 border-green-200",
  village: "bg-purple-100 text-purple-700 border-purple-200",
  lake: "bg-cyan-100 text-cyan-700 border-cyan-200"
};

export default function DestinationCard({ destination, onClick }) {
  const Icon = typeIcons[destination.type] || Mountain;

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      <Card 
        className="overflow-hidden cursor-pointer border-0 shadow-xl hover:shadow-2xl transition-all duration-500 group"
        onClick={onClick}
      >
        <div className="relative h-64 overflow-hidden">
          <img
            src={destination.image_url || `https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&h=600&fit=crop`}
            alt={destination.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          
          {destination.featured && (
            <Badge className="absolute top-4 right-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-lg">
              <Sparkles className="w-3 h-3 mr-1" />
              Featured
            </Badge>
          )}

          <div className="absolute bottom-0 left-0 right-0 p-5">
            <Badge className={`${typeColors[destination.type]} border mb-3`}>
              <Icon className="w-3 h-3 mr-1" />
              {destination.type.replace(/_/g, ' ')}
            </Badge>
            <h3 className="text-white font-bold text-2xl mb-2 drop-shadow-lg">
              {destination.name}
            </h3>
            <p className="text-amber-200 text-sm flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {destination.region}
            </p>
          </div>
        </div>

        <div className="p-5 bg-gradient-to-br from-white to-stone-50">
          <p className="text-gray-700 text-sm line-clamp-2 mb-3">
            {destination.description}
          </p>
          
          <div className="flex items-center justify-between text-xs">
            {destination.altitude && (
              <div className="flex items-center gap-1 text-gray-600">
                <Mountain className="w-3 h-3" />
                <span>{destination.altitude}</span>
              </div>
            )}
            {destination.best_time_to_visit && (
              <div className="flex items-center gap-1 text-gray-600">
                <Calendar className="w-3 h-3" />
                <span>{destination.best_time_to_visit}</span>
              </div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}