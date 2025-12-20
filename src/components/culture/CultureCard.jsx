import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, MapPin, Award } from "lucide-react";
import { motion } from "framer-motion";

const categoryColors = {
  temple: "bg-orange-100 text-orange-700 border-orange-200",
  monastery: "bg-purple-100 text-purple-700 border-purple-200",
  palace: "bg-amber-100 text-amber-700 border-amber-200",
  stupa: "bg-yellow-100 text-yellow-700 border-yellow-200",
  festival: "bg-pink-100 text-pink-700 border-pink-200",
  tradition: "bg-blue-100 text-blue-700 border-blue-200"
};

export default function CultureCard({ site, onClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.03 }}
      transition={{ duration: 0.3 }}
    >
      <Card 
        className="overflow-hidden cursor-pointer border-0 shadow-lg hover:shadow-2xl transition-all duration-300"
        onClick={onClick}
      >
        <div className="relative h-48 overflow-hidden">
          <img
            src={site.image_url || `https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&h=600&fit=crop`}
            alt={site.name}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          
          {site.unesco_heritage && (
            <Badge className="absolute top-3 right-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white border-0 shadow-lg">
              <Award className="w-3 h-3 mr-1" />
              UNESCO
            </Badge>
          )}

          <div className="absolute bottom-3 left-3 right-3">
            <Badge className={`${categoryColors[site.category]} border mb-2`}>
              <Sparkles className="w-3 h-3 mr-1" />
              {site.category}
            </Badge>
            <h3 className="text-white font-bold text-lg drop-shadow-lg">
              {site.name}
            </h3>
            <p className="text-amber-200 text-xs flex items-center gap-1 mt-1">
              <MapPin className="w-3 h-3" />
              {site.location}
            </p>
          </div>
        </div>

        <div className="p-4 bg-gradient-to-br from-white to-amber-50">
          <p className="text-gray-700 text-sm line-clamp-2">
            {site.description}
          </p>
        </div>
      </Card>
    </motion.div>
  );
}