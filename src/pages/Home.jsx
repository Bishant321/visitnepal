import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Mountain, Compass, Landmark, Map, ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import DestinationCard from "../components/destinations/DestinationCard";
import { motion } from "framer-motion";
import ScrollAnimation3D from "../components/3d/ScrollAnimation3D";

export default function Home() {
  const navigate = useNavigate();

  const { data: destinations = [] } = useQuery({
    queryKey: ['destinations'],
    queryFn: () => base44.entities.Destination.list(),
  });

  const featuredDestinations = destinations.filter(d => d.featured).slice(0, 3);

  const features = [
    {
      icon: Mountain,
      title: "Majestic Mountains",
      description: "Home to 8 of the world's 14 highest peaks including Everest",
      color: "from-blue-600 to-cyan-500"
    },
    {
      icon: Landmark,
      title: "Rich Heritage",
      description: "Ancient temples, monasteries, and UNESCO World Heritage Sites",
      color: "from-amber-600 to-orange-500"
    },
    {
      icon: Compass,
      title: "Adventure Awaits",
      description: "World-class trekking, rafting, and outdoor experiences",
      color: "from-red-600 to-pink-500"
    },
    {
      icon: Sparkles,
      title: "Vibrant Culture",
      description: "Colorful festivals, warm hospitality, and spiritual experiences",
      color: "from-purple-600 to-pink-500"
    }
  ];

  return (
    <div className="min-h-screen">
      <ScrollAnimation3D />
      {/* Hero Section with Image Carousel */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1920&h=1080&fit=crop"
            alt="Mount Everest, Nepal"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />
        </div>

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-2xl">
              Discover the Roof of the World
            </h1>
            <p className="text-xl md:text-2xl text-amber-200 mb-8 font-light">
              Experience Nepal's breathtaking mountains, ancient culture, and warm hospitality
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => navigate(createPageUrl("AIPlanner"))}
                className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 hover:from-purple-700 hover:via-pink-700 hover:to-orange-700 text-white px-8 py-6 text-lg rounded-2xl shadow-2xl shadow-purple-500/50 border-0 animate-pulse"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                AI Travel Planner
              </Button>
              <Button
                onClick={() => navigate(createPageUrl("Destinations"))}
                variant="outline"
                className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 px-8 py-6 text-lg rounded-2xl"
              >
                <Compass className="w-5 h-5 mr-2" />
                Explore Destinations
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center pt-2">
            <div className="w-1 h-3 bg-white/50 rounded-full" />
          </div>
        </div>
      </section>

      {/* Top Attractions Showcase */}
      <section className="py-20 px-4 bg-gradient-to-b from-white to-amber-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-red-900 via-amber-800 to-orange-700 bg-clip-text text-transparent">
              Nepal's Top Attractions
            </h2>
            <p className="text-gray-600 text-lg">
              Don't miss these iconic destinations
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              {
                name: "Mount Everest",
                image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&h=600&fit=crop",
                desc: "World's highest peak"
              },
              {
                name: "Pokhara Valley",
                image: "https://images.unsplash.com/photo-1605640840605-14ac1855827b?w=800&h=600&fit=crop",
                desc: "Gateway to Annapurna"
              },
              {
                name: "Kathmandu Durbar",
                image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&h=600&fit=crop",
                desc: "Ancient royal palace"
              },
              {
                name: "Chitwan National Park",
                image: "https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=800&h=600&fit=crop",
                desc: "Wildlife & jungle safari"
              }
            ].map((attraction, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -8 }}
                className="group cursor-pointer"
              >
                <div className="relative h-64 rounded-2xl overflow-hidden shadow-xl">
                  <img
                    src={attraction.image}
                    alt={attraction.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-white font-bold text-xl mb-1">{attraction.name}</h3>
                    <p className="text-amber-200 text-sm">{attraction.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-white to-stone-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-red-900 via-amber-800 to-orange-700 bg-clip-text text-transparent">
              Why Visit Nepal?
            </h2>
            <p className="text-gray-600 text-lg">
              A land of endless wonders and unforgettable experiences
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8 }}
              >
                <div className="relative group">
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} rounded-3xl opacity-10 group-hover:opacity-20 transition-opacity`} />
                  <div className="relative p-8 rounded-3xl border border-stone-200 bg-white/50 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-300">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 shadow-lg`}>
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-gray-900">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Destinations */}
      {featuredDestinations.length > 0 && (
        <section className="py-20 px-4 bg-gradient-to-b from-stone-50 to-white">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-12">
              <div>
                <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-red-900 to-amber-800 bg-clip-text text-transparent">
                  Featured Destinations
                </h2>
                <p className="text-gray-600">Must-visit places in Nepal</p>
              </div>
              <Button
                onClick={() => navigate(createPageUrl("Destinations"))}
                variant="outline"
                className="hidden md:flex items-center gap-2 border-red-900 text-red-900 hover:bg-red-50"
              >
                View All
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredDestinations.map((destination) => (
                <DestinationCard
                  key={destination.id}
                  destination={destination}
                  onClick={() => navigate(createPageUrl("DestinationDetail") + `?id=${destination.id}`)}
                />
              ))}
            </div>

            <div className="text-center mt-8 md:hidden">
              <Button
                onClick={() => navigate(createPageUrl("Destinations"))}
                className="bg-gradient-to-r from-red-900 to-amber-800 text-white"
              >
                View All Destinations
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Call to Action */}
      <section className="relative py-24 px-4 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1605640840605-14ac1855827b?w=1920&h=600&fit=crop"
            alt="Nepal Culture"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-red-900/90 to-amber-900/90" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Start Planning Your Nepal Adventure
          </h2>
          <p className="text-xl text-amber-200 mb-8">
            Create your personalized travel itinerary and explore the wonders of Nepal
          </p>
          <Button
            onClick={() => navigate(createPageUrl("MyPlans"))}
            className="bg-white text-red-900 hover:bg-amber-50 px-8 py-6 text-lg rounded-2xl shadow-2xl"
          >
            <Map className="w-5 h-5 mr-2" />
            Plan Your Journey
          </Button>
        </div>
      </section>
    </div>
  );
}