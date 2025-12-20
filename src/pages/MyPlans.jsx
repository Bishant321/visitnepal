import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Calendar, MapPin, Users, Trash2, Sparkles, Share2, Download, Map } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function MyPlans() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: plans = [] } = useQuery({
    queryKey: ['travelPlans'],
    queryFn: () => base44.entities.TravelPlan.filter({ created_by: user?.email }, "-created_date"),
    enabled: !!user,
  });

  const [planData, setPlanData] = useState({
    title: "",
    start_date: "",
    end_date: "",
    budget: "",
    travelers: 1,
    notes: ""
  });

  const createPlanMutation = useMutation({
    mutationFn: (data) => base44.entities.TravelPlan.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['travelPlans'] });
      setShowForm(false);
      setPlanData({
        title: "",
        start_date: "",
        end_date: "",
        budget: "",
        travelers: 1,
        notes: ""
      });
    },
  });

  const deletePlanMutation = useMutation({
    mutationFn: (id) => base44.entities.TravelPlan.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['travelPlans'] });
    },
  });

  const sharePlan = (plan) => {
    const shareText = `Check out my Nepal travel plan: ${plan.title}\nDuration: ${format(new Date(plan.start_date), "MMM d")} - ${format(new Date(plan.end_date), "MMM d, yyyy")}\n\n${plan.notes || ""}`;
    
    if (navigator.share) {
      navigator.share({
        title: plan.title,
        text: shareText,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareText);
      alert("Plan copied to clipboard!");
    }
  };

  const downloadPlan = (plan) => {
    const planData = {
      ...plan,
      downloadedAt: new Date().toISOString()
    };
    localStorage.setItem(`travelPlan_${plan.id}`, JSON.stringify(planData));
    alert("Plan saved for offline access!");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createPlanMutation.mutate(planData);
  };

  const statusColors = {
    planning: "bg-yellow-100 text-yellow-700 border-yellow-200",
    confirmed: "bg-green-100 text-green-700 border-green-200",
    completed: "bg-blue-100 text-blue-700 border-blue-200"
  };

  return (
    <div className="min-h-screen">
      <div className="relative h-64 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1920&h=400&fit=crop"
            alt="Plan Your Journey"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-red-900/90 to-amber-900/90" />
        </div>
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">My Travel Plans</h1>
          <p className="text-xl text-amber-200">Organize your Nepal adventure</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-8 flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center">
          <h2 className="text-2xl font-bold text-gray-900">Your Itineraries</h2>
          <div className="flex gap-3">
            <Button
              onClick={() => navigate(createPageUrl("AIPlanner"))}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              AI Planner
            </Button>
            <Button
              onClick={() => setShowForm(!showForm)}
              className="bg-gradient-to-r from-red-900 to-amber-800 hover:from-red-800 hover:to-amber-700 text-white rounded-xl"
            >
              <Plus className="w-4 h-4 mr-2" />
              Manual Plan
            </Button>
          </div>
        </div>

        {showForm && (
          <Card className="mb-8 border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-red-50 to-amber-50">
              <CardTitle>Create Travel Plan</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="title">Trip Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Everest Base Camp Trek"
                    value={planData.title}
                    onChange={(e) => setPlanData({...planData, title: e.target.value})}
                    required
                    className="mt-1"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start_date">Start Date</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={planData.start_date}
                      onChange={(e) => setPlanData({...planData, start_date: e.target.value})}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="end_date">End Date</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={planData.end_date}
                      onChange={(e) => setPlanData({...planData, end_date: e.target.value})}
                      required
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="budget">Budget</Label>
                    <Input
                      id="budget"
                      placeholder="e.g., $2000-3000"
                      value={planData.budget}
                      onChange={(e) => setPlanData({...planData, budget: e.target.value})}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="travelers">Number of Travelers</Label>
                    <Input
                      id="travelers"
                      type="number"
                      min="1"
                      value={planData.travelers}
                      onChange={(e) => setPlanData({...planData, travelers: parseInt(e.target.value)})}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Add any special requirements or notes..."
                    value={planData.notes}
                    onChange={(e) => setPlanData({...planData, notes: e.target.value})}
                    rows={4}
                    className="mt-1"
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    type="submit"
                    disabled={createPlanMutation.isPending}
                    className="flex-1 bg-gradient-to-r from-red-900 to-amber-800 hover:from-red-800 hover:to-amber-700 text-white"
                  >
                    Create Plan
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {plans.map((plan) => (
            <Card key={plan.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="bg-gradient-to-br from-stone-50 to-amber-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{plan.title}</CardTitle>
                    <Badge className={`${statusColors[plan.status]} border`}>
                      {plan.status}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => { e.stopPropagation(); sharePlan(plan); }}
                      className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                      title="Share plan"
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => { e.stopPropagation(); downloadPlan(plan); }}
                      className="text-green-500 hover:text-green-700 hover:bg-green-50"
                      title="Download for offline"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => { e.stopPropagation(); navigate(createPageUrl("Maps") + "?plan=" + plan.id); }}
                      className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                      title="View on map"
                    >
                      <Map className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => { e.stopPropagation(); deletePlanMutation.mutate(plan.id); }}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4 text-red-600" />
                  <span className="text-sm">
                    {format(new Date(plan.start_date), "MMM d")} - {format(new Date(plan.end_date), "MMM d, yyyy")}
                  </span>
                </div>

                {plan.budget && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <span className="text-sm font-medium">Budget: {plan.budget}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-gray-600">
                  <Users className="w-4 h-4 text-red-600" />
                  <span className="text-sm">{plan.travelers} {plan.travelers === 1 ? 'traveler' : 'travelers'}</span>
                </div>

                {plan.notes && (
                  <p className="text-sm text-gray-600 pt-3 border-t border-stone-200">
                    {plan.notes}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {plans.length === 0 && !showForm && (
          <div className="text-center py-20">
            <div className="w-32 h-32 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <MapPin className="w-16 h-16 text-stone-300" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No travel plans yet</h3>
            <p className="text-gray-500 mb-6">Start planning your Nepal adventure today!</p>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-red-900 to-amber-800 hover:from-red-800 hover:to-amber-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Plan
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}