import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Clock, Users, MapPin, DollarSign } from "lucide-react";
import { motion } from "framer-motion";

const categoryColors = {
  cooking_class: "bg-orange-100 text-orange-700 border-orange-200",
  cultural_tour: "bg-purple-100 text-purple-700 border-purple-200",
  homestay: "bg-pink-100 text-pink-700 border-pink-200",
  adventure: "bg-green-100 text-green-700 border-green-200",
  workshop: "bg-blue-100 text-blue-700 border-blue-200",
  guided_trek: "bg-amber-100 text-amber-700 border-amber-200"
};

export default function ExperienceCard({ experience, onClick }) {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3 }}
    >
      <Card 
        className="overflow-hidden cursor-pointer border-0 shadow-lg hover:shadow-2xl transition-all duration-300"
        onClick={onClick}
      >
        <div className="relative h-48 overflow-hidden">
          <img
            src={experience.image_url || `https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&h=400&fit=crop`}
            alt={experience.name}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          
          <Badge className={`absolute top-3 right-3 ${categoryColors[experience.category]} border shadow-lg`}>
            {experience.category.replace(/_/g, ' ')}
          </Badge>

          <div className="absolute bottom-3 left-3 right-3">
            <h3 className="text-white font-bold text-lg drop-shadow-lg mb-1">
              {experience.name}
            </h3>
            <div className="flex items-center gap-1 text-amber-300">
              <Star className="w-4 h-4 fill-amber-300" />
              <span className="text-sm font-semibold">{experience.rating || 0}</span>
              <span className="text-xs text-white/80">({experience.reviews_count || 0})</span>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-3">
          <p className="text-gray-600 text-sm line-clamp-2">
            {experience.description}
          </p>

          <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-indigo-600" />
              <span className="truncate">{experience.location}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-indigo-600" />
              <span>{experience.duration}</span>
            </div>
            {experience.max_participants && (
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3 text-indigo-600" />
                <span>Up to {experience.max_participants}</span>
              </div>
            )}
            <div className="flex items-center gap-1 font-semibold text-indigo-600">
              <DollarSign className="w-3 h-3" />
              <span>${experience.price}</span>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-500">Hosted by {experience.host_name}</p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}