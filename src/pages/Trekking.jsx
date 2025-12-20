import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Search, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import TrekkingCard from "../components/trekking/TrekkingCard";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Trekking() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");

  const { data: treks = [], isLoading } = useQuery({
    queryKey: ['treks'],
    queryFn: () => base44.entities.TrekkingRoute.list("-duration_days"),
  });

  const difficulties = ["all", "beginner", "moderate", "difficult", "expert"];

  const filteredTreks = treks.filter(trek => {
    const matchesSearch = trek.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          trek.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty = selectedDifficulty === "all" || trek.difficulty === selectedDifficulty;
    return matchesSearch && matchesDifficulty;
  });

  return (
    <div className="min-h-screen">
      {/* Hero Header */}
      <div className="relative h-80 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=1920&h=600&fit=crop"
            alt="Trekking in Nepal"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-red-900/90 to-amber-900/90" />
        </div>
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">Trekking Routes</h1>
          <p className="text-xl text-amber-200 max-w-2xl mx-auto">
            Embark on unforgettable journeys through the Himalayas
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Search & Filters */}
        <div className="mb-12 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search trekking routes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 rounded-2xl border-gray-300 focus:border-red-900 focus:ring-red-900"
              />
            </div>
            
            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger className="w-full md:w-56 h-14 rounded-2xl border-gray-300">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  <SelectValue placeholder="Difficulty" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {difficulties.map((difficulty) => (
                  <SelectItem key={difficulty} value={difficulty}>
                    {difficulty === "all" ? "All Difficulties" : difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            {filteredTreks.length} {filteredTreks.length === 1 ? 'Route' : 'Routes'} Available
          </h2>
        </div>

        {/* Treks Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            Array(6).fill(0).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-56 w-full rounded-2xl" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))
          ) : (
            filteredTreks.map((trek) => (
              <TrekkingCard
                key={trek.id}
                trek={trek}
                onClick={() => navigate(createPageUrl("TrekkingDetail") + `?id=${trek.id}`)}
              />
            ))
          )}
        </div>

        {filteredTreks.length === 0 && !isLoading && (
          <div className="text-center py-20">
            <div className="w-32 h-32 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-16 h-16 text-stone-300" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No routes found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}