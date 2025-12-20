import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  User, Mail, Phone, MapPin, Calendar, DollarSign, 
  Heart, Trash2, Edit, Save, X, Package, MessageSquare,
  Shield, Clock
} from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Profile() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [profileData, setProfileData] = useState({});

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ['myBookings'],
    queryFn: () => base44.entities.Booking.filter({ created_by: user?.email }, "-created_date"),
    enabled: !!user,
  });

  const { data: plans = [] } = useQuery({
    queryKey: ['travelPlans'],
    queryFn: () => base44.entities.TravelPlan.filter({ created_by: user?.email }, "-created_date"),
    enabled: !!user,
  });

  const { data: posts = [] } = useQuery({
    queryKey: ['myPosts'],
    queryFn: () => base44.entities.ForumPost.filter({ created_by: user?.email }, "-created_date"),
    enabled: !!user,
  });

  const { data: wishlist = [] } = useQuery({
    queryKey: ['wishlist'],
    queryFn: () => base44.entities.Wishlist.filter({ created_by: user?.email }, "-created_date"),
    enabled: !!user,
  });

  const { data: customPOIs = [] } = useQuery({
    queryKey: ['customPOIs'],
    queryFn: () => base44.entities.CustomPOI.filter({ created_by: user?.email }),
    enabled: !!user,
  });

  const { data: customRoutes = [] } = useQuery({
    queryKey: ['customRoutes'],
    queryFn: () => base44.entities.CustomRoute.filter({ created_by: user?.email }),
    enabled: !!user,
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      setEditing(false);
    },
  });

  const removeFromWishlistMutation = useMutation({
    mutationFn: (id) => base44.entities.Wishlist.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
  });

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    updateProfileMutation.mutate(profileData);
  };

  const startEdit = () => {
    setProfileData({
      phone_number: user?.phone_number || "",
      address: user?.address || "",
      emergency_contact: user?.emergency_contact || "",
      travel_preferences: user?.travel_preferences || "",
      bio: user?.bio || ""
    });
    setEditing(true);
  };

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
    confirmed: "bg-green-100 text-green-700 border-green-200",
    completed: "bg-blue-100 text-blue-700 border-blue-200",
    cancelled: "bg-red-100 text-red-700 border-red-200",
    planning: "bg-purple-100 text-purple-700 border-purple-200"
  };

  const totalSpent = bookings
    .filter(b => b.status === "confirmed" || b.status === "completed")
    .reduce((sum, b) => sum + (b.total_price || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-red-50/20">
      {/* Hero Header */}
      <div className="relative h-48 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1920&h=300&fit=crop"
            alt="Profile"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-red-900/90 to-amber-900/90" />
        </div>
        <div className="relative z-10 text-center text-white">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-3xl font-bold shadow-2xl mx-auto mb-4">
            {user?.full_name?.[0] || "N"}
          </div>
          <h1 className="text-3xl font-bold">{user?.full_name || "Traveler"}</h1>
          <p className="text-amber-200">{user?.email}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Bookings</p>
                  <p className="text-3xl font-bold text-red-900">{bookings.length}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Travel Plans</p>
                  <p className="text-3xl font-bold text-amber-800">{plans.length}</p>
                </div>
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Wishlist Items</p>
                  <p className="text-3xl font-bold text-pink-600">{wishlist.length}</p>
                </div>
                <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                  <Heart className="w-6 h-6 text-pink-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Spent</p>
                  <p className="text-3xl font-bold text-green-600">${totalSpent}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="personal" className="space-y-6">
          <TabsList className="bg-white shadow-lg">
            <TabsTrigger value="personal">Personal Info</TabsTrigger>
            <TabsTrigger value="bookings">Booking History</TabsTrigger>
            <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
            <TabsTrigger value="activity">My Activity</TabsTrigger>
          </TabsList>

          {/* Personal Information */}
          <TabsContent value="personal">
            <Card className="border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-red-50 to-amber-50">
                <div className="flex justify-between items-center">
                  <CardTitle>Personal Information</CardTitle>
                  {!editing ? (
                    <Button onClick={startEdit} variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  ) : (
                    <Button onClick={() => setEditing(false)} variant="outline" size="sm">
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {!editing ? (
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <Label className="text-gray-500 mb-2 flex items-center gap-2">
                          <User className="w-4 h-4" />
                          Full Name
                        </Label>
                        <p className="text-lg font-medium">{user?.full_name}</p>
                      </div>
                      <div>
                        <Label className="text-gray-500 mb-2 flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          Email
                        </Label>
                        <p className="text-lg font-medium">{user?.email}</p>
                      </div>
                      <div>
                        <Label className="text-gray-500 mb-2 flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          Phone Number
                        </Label>
                        <p className="text-lg font-medium">{user?.phone_number || "Not set"}</p>
                      </div>
                      <div>
                        <Label className="text-gray-500 mb-2 flex items-center gap-2">
                          <Shield className="w-4 h-4" />
                          Role
                        </Label>
                        <Badge className="bg-red-900 text-white">{user?.role}</Badge>
                      </div>
                      <div>
                        <Label className="text-gray-500 mb-2 flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          Address
                        </Label>
                        <p className="text-lg font-medium">{user?.address || "Not set"}</p>
                      </div>
                      <div>
                        <Label className="text-gray-500 mb-2 flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          Emergency Contact
                        </Label>
                        <p className="text-lg font-medium">{user?.emergency_contact || "Not set"}</p>
                      </div>
                    </div>
                    <div>
                      <Label className="text-gray-500 mb-2">Travel Preferences</Label>
                      <p className="text-lg font-medium">{user?.travel_preferences || "Not set"}</p>
                    </div>
                    <div>
                      <Label className="text-gray-500 mb-2">Bio</Label>
                      <p className="text-lg font-medium">{user?.bio || "Not set"}</p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          placeholder="+977 123456789"
                          value={profileData.phone_number}
                          onChange={(e) => setProfileData({...profileData, phone_number: e.target.value})}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="address">Address</Label>
                        <Input
                          id="address"
                          placeholder="City, Country"
                          value={profileData.address}
                          onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                          className="mt-2"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor="emergency">Emergency Contact</Label>
                        <Input
                          id="emergency"
                          placeholder="Name and phone number"
                          value={profileData.emergency_contact}
                          onChange={(e) => setProfileData({...profileData, emergency_contact: e.target.value})}
                          className="mt-2"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor="preferences">Travel Preferences</Label>
                        <Input
                          id="preferences"
                          placeholder="e.g., Adventure, Culture, Relaxation"
                          value={profileData.travel_preferences}
                          onChange={(e) => setProfileData({...profileData, travel_preferences: e.target.value})}
                          className="mt-2"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          placeholder="Tell us about yourself..."
                          value={profileData.bio}
                          onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                          rows={4}
                          className="mt-2"
                        />
                      </div>
                    </div>
                    <Button type="submit" className="bg-gradient-to-r from-red-900 to-amber-800 text-white">
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Booking History */}
          <TabsContent value="bookings">
            <Card className="border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-red-50 to-amber-50">
                <CardTitle>Booking History</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {bookings.length > 0 ? (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <Card key={booking.id} className="border-2 border-stone-200">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-xl font-bold mb-2">{booking.experience_name}</h3>
                              <div className="flex gap-2 flex-wrap">
                                <Badge className={`${statusColors[booking.status]} border`}>
                                  {booking.status}
                                </Badge>
                                <Badge variant="outline">
                                  <Calendar className="w-3 h-3 mr-1" />
                                  {format(new Date(booking.booking_date), "MMM d, yyyy")}
                                </Badge>
                                <Badge variant="outline">
                                  {booking.participants} {booking.participants === 1 ? 'guest' : 'guests'}
                                </Badge>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-red-900">${booking.total_price}</p>
                              <Badge className="bg-green-100 text-green-700 border-green-200 mt-2">
                                {booking.payment_status}
                              </Badge>
                            </div>
                          </div>
                          {booking.special_requests && (
                            <div className="mt-4 p-3 bg-amber-50 rounded-lg">
                              <p className="text-sm text-gray-600">
                                <strong>Special Requests:</strong> {booking.special_requests}
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No bookings yet</h3>
                    <p className="text-gray-500 mb-6">Start exploring experiences to make your first booking!</p>
                    <Button onClick={() => navigate(createPageUrl("Experiences"))} className="bg-gradient-to-r from-red-900 to-amber-800">
                      Browse Experiences
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Wishlist */}
          <TabsContent value="wishlist">
            <Card className="border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-pink-50 to-red-50">
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-pink-600" />
                  My Wishlist
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {wishlist.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-6">
                    {wishlist.map((item) => (
                      <Card key={item.id} className="border-2 border-stone-200 hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex gap-4">
                            <img
                              src={item.experience_image_url || "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=200&h=150&fit=crop"}
                              alt={item.experience_name}
                              className="w-24 h-24 object-cover rounded-lg"
                            />
                            <div className="flex-1">
                              <h3 className="font-bold text-lg mb-2">{item.experience_name}</h3>
                              <div className="flex gap-2 mb-2">
                                <Badge variant="outline">{item.experience_category}</Badge>
                                <Badge className="bg-green-100 text-green-700">${item.experience_price}</Badge>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{item.experience_location}</p>
                              {item.notes && (
                                <p className="text-xs text-gray-500 italic">{item.notes}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2 mt-4">
                            <Button
                              size="sm"
                              className="flex-1 bg-gradient-to-r from-red-900 to-amber-800"
                              onClick={() => navigate(createPageUrl("ExperienceDetail") + `?id=${item.experience_id}`)}
                            >
                              View Details
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => removeFromWishlistMutation.mutate(item.id)}
                              className="text-red-600 border-red-200"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No saved experiences</h3>
                    <p className="text-gray-500 mb-6">Save experiences to your wishlist for easy access later!</p>
                    <Button onClick={() => navigate(createPageUrl("Experiences"))} className="bg-gradient-to-r from-pink-600 to-red-600">
                      Explore Experiences
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* My Activity */}
          <TabsContent value="activity">
            <div className="space-y-6">
              {/* Travel Plans */}
              <Card className="border-0 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-purple-600" />
                    My Travel Plans ({plans.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  {plans.length > 0 ? (
                    <div className="grid md:grid-cols-2 gap-4">
                      {plans.slice(0, 4).map((plan) => (
                        <Card key={plan.id} className="border-2 border-stone-200">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-bold">{plan.title}</h3>
                              <Badge className={statusColors[plan.status]}>{plan.status}</Badge>
                            </div>
                            <p className="text-sm text-gray-600 flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              {format(new Date(plan.start_date), "MMM d")} - {format(new Date(plan.end_date), "MMM d, yyyy")}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 py-8">No travel plans yet</p>
                  )}
                  {plans.length > 4 && (
                    <Button variant="outline" className="w-full mt-4" onClick={() => navigate(createPageUrl("MyPlans"))}>
                      View All Plans
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Forum Posts */}
              <Card className="border-0 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                    Forum Posts ({posts.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  {posts.length > 0 ? (
                    <div className="space-y-3">
                      {posts.slice(0, 5).map((post) => (
                        <div key={post.id} className="p-4 border-2 border-stone-200 rounded-lg hover:bg-stone-50 cursor-pointer" onClick={() => navigate(createPageUrl("ForumPost") + `?id=${post.id}`)}>
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold mb-1">{post.title}</h4>
                              <div className="flex gap-2">
                                <Badge variant="outline" className="text-xs">{post.category}</Badge>
                                <span className="text-xs text-gray-500">{post.views} views • {post.likes} likes</span>
                              </div>
                            </div>
                            <Clock className="w-4 h-4 text-gray-400" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 py-8">No forum posts yet</p>
                  )}
                  {posts.length > 5 && (
                    <Button variant="outline" className="w-full mt-4" onClick={() => navigate(createPageUrl("Forum"))}>
                      View All Posts
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Custom Map Data */}
              <Card className="border-0 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50">
                  <CardTitle>My Map Data</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h4 className="font-semibold mb-2">Custom POIs</h4>
                      <p className="text-3xl font-bold text-green-700">{customPOIs.length}</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold mb-2">Custom Routes</h4>
                      <p className="text-3xl font-bold text-blue-700">{customRoutes.length}</p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full mt-4" onClick={() => navigate(createPageUrl("Maps"))}>
                    View on Map
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}