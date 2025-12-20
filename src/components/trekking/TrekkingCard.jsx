import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mountain, Clock, TrendingUp, Calendar, DollarSign } from "lucide-react";
import { motion } from "framer-motion";

const difficultyColors = {
  beginner: "bg-green-100 text-green-700 border-green-200",
  moderate: "bg-yellow-100 text-yellow-700 border-yellow-200",
  difficult: "bg-orange-100 text-orange-700 border-orange-200",
  expert: "bg-red-100 text-red-700 border-red-200"
};

export default function TrekkingCard({ trek, onClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3 }}
    >
      <Card 
        className="overflow-hidden cursor-pointer border-0 shadow-xl hover:shadow-2xl transition-all duration-300"
        onClick={onClick}
      >
        <div className="relative h-56 overflow-hidden">
          <img
            src={trek.image_url || `https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=800&h=600&fit=crop`}
            alt={trek.name}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          
          <Badge className={`absolute top-4 right-4 ${difficultyColors[trek.difficulty]} border shadow-lg`}>
            <TrendingUp className="w-3 h-3 mr-1" />
            {trek.difficulty}
          </Badge>

          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="text-white font-bold text-xl drop-shadow-lg">
              {trek.name}
            </h3>
          </div>
        </div>

        <div className="p-5 space-y-3 bg-gradient-to-br from-white to-stone-50">
          <p className="text-gray-700 text-sm line-clamp-2">
            {trek.description}
          </p>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="w-4 h-4 text-red-600" />
              <span className="font-medium">{trek.duration_days} days</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Mountain className="w-4 h-4 text-red-600" />
              <span className="font-medium">{trek.max_altitude}</span>
            </div>
            {trek.best_season && (
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-4 h-4 text-red-600" />
                <span className="text-xs">{trek.best_season}</span>
              </div>
            )}
            {trek.estimated_cost && (
              <div className="flex items-center gap-2 text-gray-600">
                <DollarSign className="w-4 h-4 text-red-600" />
                <span className="text-xs">{trek.estimated_cost}</span>
              </div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}