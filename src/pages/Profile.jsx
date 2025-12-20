import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit2, CheckCircle, Briefcase } from "lucide-react";
import AuthStatus from "../components/auth/AuthStatus";

export default function Profile() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const [profileData, setProfileData] = useState({
    preferences: user?.preferences || {},
    travel_style: user?.travel_style || "",
    emergency_contact: user?.emergency_contact || ""
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      setEditing(false);
    },
  });

  const handleUpdate = (e) => {
    e.preventDefault();
    updateProfileMutation.mutate(profileData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-indigo-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8">My Profile</h1>

        <div className="space-y-6">
          <AuthStatus />

          <Card className="border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
              <div className="flex justify-between items-center">
                <CardTitle>Travel Preferences</CardTitle>
                <Button
                  onClick={() => setEditing(!editing)}
                  variant="outline"
                  size="sm"
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  {editing ? "Cancel" : "Edit"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {editing ? (
                <form onSubmit={handleUpdate} className="space-y-4">
                  <div>
                    <Label htmlFor="travel_style">Preferred Travel Style</Label>
                    <Input
                      id="travel_style"
                      placeholder="e.g., Adventure, Cultural, Relaxed"
                      value={profileData.travel_style}
                      onChange={(e) => setProfileData({...profileData, travel_style: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="emergency">Emergency Contact</Label>
                    <Input
                      id="emergency"
                      placeholder="Name & Phone Number"
                      value={profileData.emergency_contact}
                      onChange={(e) => setProfileData({...profileData, emergency_contact: e.target.value})}
                    />
                  </div>
                  <Button type="submit" className="bg-gradient-to-r from-indigo-600 to-purple-600">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </form>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Travel Style</p>
                    <p className="text-gray-900">{profileData.travel_style || "Not set"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Emergency Contact</p>
                    <p className="text-gray-900">{profileData.emergency_contact || "Not set"}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {user?.role === "admin" && (
            <Card className="border-0 shadow-xl mb-6">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl text-white">
                  <Briefcase className="w-8 h-8" />
                  <div>
                    <h3 className="font-bold text-lg">Host Dashboard Available</h3>
                    <p className="text-sm text-indigo-100">Manage your experiences and bookings</p>
                  </div>
                  <button
                    onClick={() => window.location.href = "/HostDashboard"}
                    className="ml-auto px-4 py-2 bg-white text-indigo-600 rounded-lg font-semibold hover:shadow-lg transition-shadow"
                  >
                    Go to Dashboard
                  </button>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl">
                  <p className="text-3xl font-bold text-indigo-600">0</p>
                  <p className="text-gray-600 text-sm mt-1">Plans Created</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl">
                  <p className="text-3xl font-bold text-blue-600">0</p>
                  <p className="text-gray-600 text-sm mt-1">Bookings Made</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
                  <p className="text-3xl font-bold text-purple-600">0</p>
                  <p className="text-gray-600 text-sm mt-1">Forum Posts</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}