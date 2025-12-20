import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Calendar, DollarSign, Users, Loader2, CheckCircle, Mountain, Landmark, Heart, Sunrise } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import ReactMarkdown from "react-markdown";

export default function AIPlanner() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState(null);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: destinations = [] } = useQuery({
    queryKey: ['destinations'],
    queryFn: () => base44.entities.Destination.list(),
  });

  const { data: treks = [] } = useQuery({
    queryKey: ['treks'],
    queryFn: () => base44.entities.TrekkingRoute.list(),
  });

  const { data: culturalSites = [] } = useQuery({
    queryKey: ['culturalSites'],
    queryFn: () => base44.entities.CulturalSite.list(),
  });

  const [preferences, setPreferences] = useState({
    duration_days: "",
    budget: "",
    travelers: 1,
    interests: [],
    experience_level: "beginner",
    special_requests: ""
  });

  const interestOptions = [
    { value: "adventure", label: "Adventure & Trekking", icon: Mountain },
    { value: "culture", label: "Culture & Heritage", icon: Landmark },
    { value: "relaxation", label: "Relaxation & Wellness", icon: Heart },
    { value: "nature", label: "Nature & Wildlife", icon: Sunrise },
  ];

  const toggleInterest = (interest) => {
    if (preferences.interests.includes(interest)) {
      setPreferences({
        ...preferences,
        interests: preferences.interests.filter(i => i !== interest)
      });
    } else {
      setPreferences({
        ...preferences,
        interests: [...preferences.interests, interest]
      });
    }
  };

  const generateItinerary = async (e) => {
    e.preventDefault();
    setLoading(true);
    setGeneratedPlan(null);

    try {
      const prompt = `You are a Nepal tourism expert AI planner. Generate a comprehensive, personalized travel itinerary for Nepal based on these preferences:

      **Trip Details:**
      Duration: ${preferences.duration_days} days
      Budget: ${preferences.budget || "Moderate"}
      Travelers: ${preferences.travelers}
      Interests: ${preferences.interests.join(", ")}
      Experience level: ${preferences.experience_level}
      Special requests: ${preferences.special_requests || "None"}

      **Available Options:**
      Destinations: ${destinations.slice(0, 10).map(d => d.name).join(", ")}
      Trekking Routes: ${treks.slice(0, 5).map(t => t.name).join(", ")}
      Cultural Sites: ${culturalSites.slice(0, 10).map(c => c.name).join(", ")}

      **Create a detailed itinerary including:**
      1. **Trip Title** - Creative and descriptive
      2. **Overview** - Why this itinerary is perfect for them
      3. **Day-by-Day Breakdown** - Specific activities, locations, times, transport
      4. **Accommodations** - Recommended hotels/lodges for each location
      5. **Cost Breakdown** - Itemized expenses (accommodation, food, activities, transport)
      6. **Packing List** - Specific items based on season and activities
      7. **Best Time to Visit** - Month recommendations with weather info
      8. **Travel Tips** - Local customs, safety, permits needed
      9. **Offline Resources** - What to download before traveling
      10. **Emergency Contacts** - Important numbers and locations

      Make it practical, actionable, and inspiring! Include specific places to eat, hidden gems, and local experiences.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        add_context_from_internet: false
      });

      setGeneratedPlan({
        content: response,
        preferences: { ...preferences }
      });
    } catch (error) {
      console.error("Error generating itinerary:", error);
    } finally {
      setLoading(false);
    }
  };

  const savePlanMutation = useMutation({
    mutationFn: (data) => base44.entities.TravelPlan.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['travelPlans'] });
      navigate(createPageUrl("MyPlans"));
    },
  });

  const savePlan = () => {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() + 30); // Default start date 30 days from now
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + parseInt(preferences.duration_days || 7));

    savePlanMutation.mutate({
      title: `AI Generated: ${preferences.interests.join(" & ")} Trip`,
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
      budget: preferences.budget,
      travelers: preferences.travelers,
      notes: generatedPlan.content,
      status: "planning"
    });
  };

  return (
    <div className="min-h-screen">
      {/* Hero Header */}
      <div className="relative h-72 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1920&h=400&fit=crop"
            alt="AI Travel Planner"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-purple-900/90 via-red-900/90 to-amber-900/90" />
        </div>
        <div className="relative z-10 text-center text-white px-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-10 h-10 text-amber-300 animate-pulse" />
            <h1 className="text-4xl md:text-5xl font-bold">AI Travel Planner</h1>
            <Sparkles className="w-10 h-10 text-amber-300 animate-pulse" />
          </div>
          <p className="text-xl text-amber-200">Let AI create your perfect Nepal adventure</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <div>
            <Card className="border-0 shadow-2xl sticky top-24">
              <CardHeader className="bg-gradient-to-r from-purple-50 via-red-50 to-amber-50">
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  Tell Us Your Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={generateItinerary} className="space-y-6">
                  {/* Duration */}
                  <div>
                    <Label htmlFor="duration" className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-red-600" />
                      Trip Duration (days)
                    </Label>
                    <Input
                      id="duration"
                      type="number"
                      min="1"
                      max="30"
                      placeholder="e.g., 7"
                      value={preferences.duration_days}
                      onChange={(e) => setPreferences({...preferences, duration_days: e.target.value})}
                      required
                      className="mt-2"
                    />
                  </div>

                  {/* Budget */}
                  <div>
                    <Label htmlFor="budget" className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-red-600" />
                      Budget Range
                    </Label>
                    <select
                      id="budget"
                      value={preferences.budget}
                      onChange={(e) => setPreferences({...preferences, budget: e.target.value})}
                      className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-900"
                      required
                    >
                      <option value="">Select budget</option>
                      <option value="Budget ($20-40/day)">Budget ($20-40/day)</option>
                      <option value="Moderate ($40-80/day)">Moderate ($40-80/day)</option>
                      <option value="Comfortable ($80-150/day)">Comfortable ($80-150/day)</option>
                      <option value="Luxury ($150+/day)">Luxury ($150+/day)</option>
                    </select>
                  </div>

                  {/* Number of Travelers */}
                  <div>
                    <Label htmlFor="travelers" className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-red-600" />
                      Number of Travelers
                    </Label>
                    <Input
                      id="travelers"
                      type="number"
                      min="1"
                      max="20"
                      value={preferences.travelers}
                      onChange={(e) => setPreferences({...preferences, travelers: parseInt(e.target.value)})}
                      className="mt-2"
                    />
                  </div>

                  {/* Interests */}
                  <div>
                    <Label className="mb-3 block">What interests you? (Select all that apply)</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {interestOptions.map((option) => {
                        const Icon = option.icon;
                        const isSelected = preferences.interests.includes(option.value);
                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => toggleInterest(option.value)}
                            className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                              isSelected
                                ? "border-purple-600 bg-purple-50 shadow-lg"
                                : "border-gray-200 hover:border-purple-300"
                            }`}
                          >
                            <Icon className={`w-6 h-6 mx-auto mb-2 ${isSelected ? "text-purple-600" : "text-gray-400"}`} />
                            <p className={`text-sm font-medium text-center ${isSelected ? "text-purple-900" : "text-gray-600"}`}>
                              {option.label}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Experience Level */}
                  <div>
                    <Label htmlFor="experience">Trekking Experience Level</Label>
                    <select
                      id="experience"
                      value={preferences.experience_level}
                      onChange={(e) => setPreferences({...preferences, experience_level: e.target.value})}
                      className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-900"
                    >
                      <option value="beginner">Beginner (Easy walks)</option>
                      <option value="moderate">Moderate (Some hiking)</option>
                      <option value="experienced">Experienced (Challenging treks)</option>
                      <option value="expert">Expert (High altitude)</option>
                    </select>
                  </div>

                  {/* Special Requests */}
                  <div>
                    <Label htmlFor="special">Special Requests or Requirements</Label>
                    <Textarea
                      id="special"
                      placeholder="e.g., Must visit Everest, vegetarian meals, family-friendly activities..."
                      value={preferences.special_requests}
                      onChange={(e) => setPreferences({...preferences, special_requests: e.target.value})}
                      rows={3}
                      className="mt-2"
                    />
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={loading || preferences.interests.length === 0}
                    className="w-full bg-gradient-to-r from-purple-600 via-red-600 to-amber-600 hover:from-purple-700 hover:via-red-700 hover:to-amber-700 text-white py-6 text-lg"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Generating Your Perfect Itinerary...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        Generate AI Itinerary
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Generated Itinerary */}
          <div>
            {loading && (
              <Card className="border-0 shadow-xl">
                <CardContent className="py-20">
                  <div className="text-center">
                    <Loader2 className="w-16 h-16 text-purple-600 animate-spin mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Creating Your Perfect Journey</h3>
                    <p className="text-gray-600">Our AI is crafting a personalized itinerary just for you...</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {generatedPlan && !loading && (
              <Card className="border-0 shadow-2xl">
                <CardHeader className="bg-gradient-to-r from-purple-50 via-red-50 to-amber-50">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                        Your Personalized Itinerary
                      </CardTitle>
                      <div className="flex flex-wrap gap-2">
                        <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                          {generatedPlan.preferences.duration_days} Days
                        </Badge>
                        <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                          {generatedPlan.preferences.budget}
                        </Badge>
                        {generatedPlan.preferences.interests.map((interest) => (
                          <Badge key={interest} className="bg-red-100 text-red-700 border-red-200">
                            {interest}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="prose prose-sm max-w-none mb-6">
                    <ReactMarkdown
                      components={{
                        h1: ({ children }) => <h1 className="text-2xl font-bold mb-4 text-gray-900">{children}</h1>,
                        h2: ({ children }) => <h2 className="text-xl font-bold mb-3 mt-6 text-gray-900">{children}</h2>,
                        h3: ({ children }) => <h3 className="text-lg font-semibold mb-2 mt-4 text-gray-800">{children}</h3>,
                        p: ({ children }) => <p className="mb-3 text-gray-700 leading-relaxed">{children}</p>,
                        ul: ({ children }) => <ul className="list-disc list-inside mb-4 space-y-2">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal list-inside mb-4 space-y-2">{children}</ol>,
                        li: ({ children }) => <li className="text-gray-700">{children}</li>,
                        strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
                      }}
                    >
                      {generatedPlan.content}
                    </ReactMarkdown>
                  </div>

                  <div className="flex gap-3 pt-6 border-t border-gray-200">
                    <Button
                      onClick={savePlan}
                      disabled={savePlanMutation.isPending}
                      className="flex-1 bg-gradient-to-r from-red-900 to-amber-800 hover:from-red-800 hover:to-amber-700 text-white"
                    >
                      {savePlanMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Save to My Plans
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => setGeneratedPlan(null)}
                      variant="outline"
                    >
                      Generate New
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {!generatedPlan && !loading && (
              <Card className="border-0 shadow-xl">
                <CardContent className="py-20">
                  <div className="text-center">
                    <Sparkles className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Ready to Plan Your Adventure?</h3>
                    <p className="text-gray-600 mb-4">Fill out your preferences and let AI create a personalized itinerary for you!</p>
                    <div className="flex flex-wrap gap-3 justify-center">
                      <Badge variant="secondary" className="text-sm">✨ Tailored to your interests</Badge>
                      <Badge variant="secondary" className="text-sm">🗺️ Day-by-day breakdown</Badge>
                      <Badge variant="secondary" className="text-sm">💰 Budget estimates</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}