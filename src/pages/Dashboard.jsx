import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  User, Calendar, Heart, MessageSquare, Settings, CreditCard, 
  Star, MapPin, Clock, Mail, Phone, Edit2, Save, X, Trash2,
  ShoppingBag, FileText, TrendingUp
} from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import ChatWindow from "../components/chat/ChatWindow";

export default function Dashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editingProfile, setEditingProfile] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);
  const [profileData, setProfileData] = useState({});

  const { data: user, isLoading: loadingUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ['myBookings'],
    queryFn: () => base44.entities.Booking.filter({ created_by: user?.email }, "-created_date"),
    enabled: !!user,
  });

  const { data: wishlist = [] } = useQuery({
    queryKey: ['wishlist'],
    queryFn: () => base44.entities.Wishlist.filter({ created_by: user?.email }),
    enabled: !!user,
  });

  const { data: comments = [] } = useQuery({
    queryKey: ['myComments'],
    queryFn: () => base44.entities.Comment.filter({ created_by: user?.email }, "-created_date"),
    enabled: !!user,
  });

  const { data: forumPosts = [] } = useQuery({
    queryKey: ['myForumPosts'],
    queryFn: () => base44.entities.ForumPost.filter({ created_by: user?.email }),
    enabled: !!user,
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      setEditingProfile(false);
    },
  });

  const removeFromWishlistMutation = useMutation({
    mutationFn: (id) => base44.entities.Wishlist.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
  });

  const handleProfileEdit = () => {
    setProfileData({
      full_name: user?.full_name || "",
      phone: user?.phone || "",
      bio: user?.bio || "",
      location: user?.location || "",
    });
    setEditingProfile(true);
  };

  const handleProfileSave = () => {
    updateProfileMutation.mutate(profileData);
  };

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
    confirmed: "bg-green-100 text-green-700 border-green-200",
    completed: "bg-blue-100 text-blue-700 border-blue-200",
    cancelled: "bg-red-100 text-red-700 border-red-200",
    paid: "bg-green-100 text-green-700",
    refunded: "bg-red-100 text-red-700"
  };

  const stats = [
    { label: "Total Bookings", value: bookings.length, icon: ShoppingBag, color: "text-indigo-600" },
    { label: "Wishlist Items", value: wishlist.length, icon: Heart, color: "text-pink-600" },
    { label: "Reviews Written", value: comments.length, icon: Star, color: "text-amber-600" },
    { label: "Forum Posts", value: forumPosts.length, icon: FileText, color: "text-purple-600" },
  ];

  if (loadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-indigo-50/30 to-purple-50/20 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header with Profile Card */}
        <Card className="border-0 shadow-xl mb-8 overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600" />
          <CardContent className="relative pt-0">
            <div className="flex flex-col md:flex-row md:items-end gap-6 -mt-16">
              <Avatar className="h-32 w-32 border-4 border-white shadow-xl">
                <AvatarImage src={user?.profile_picture} />
                <AvatarFallback className="text-3xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                  {user?.full_name?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-1">{user?.full_name || "User"}</h1>
                <p className="text-gray-600 mb-2">{user?.email}</p>
                <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200">
                  {user?.role === "admin" ? "Admin" : "Member"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <Card key={stat.label} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                  <span className="text-3xl font-bold text-gray-900">{stat.value}</span>
                </div>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="bookings" className="space-y-6">
          <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full bg-white shadow-lg rounded-xl p-2 h-auto">
            <TabsTrigger value="bookings" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
              <ShoppingBag className="w-4 h-4 mr-2" />
              Bookings
            </TabsTrigger>
            <TabsTrigger value="wishlist" className="data-[state=active]:bg-pink-600 data-[state=active]:text-white">
              <Heart className="w-4 h-4 mr-2" />
              Wishlist
            </TabsTrigger>
            <TabsTrigger value="reviews" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white">
              <Star className="w-4 h-4 mr-2" />
              Reviews
            </TabsTrigger>
            <TabsTrigger value="profile" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              <Settings className="w-4 h-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="payment" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
              <CreditCard className="w-4 h-4 mr-2" />
              Payment
            </TabsTrigger>
          </TabsList>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-4">
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5" />
                  My Bookings ({bookings.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {bookings.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">No bookings yet</p>
                    <Button onClick={() => navigate(createPageUrl("Experiences"))}>
                      Browse Experiences
                    </Button>
                  </div>
                ) : (
                  bookings.map((booking) => (
                    <Card key={booking.id} className="border border-gray-200 hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-3">
                              <h3 className="text-xl font-bold text-gray-900">{booking.experience_name}</h3>
                              <Badge className={`${statusColors[booking.status]} border ml-2`}>
                                {booking.status}
                              </Badge>
                            </div>
                            <div className="grid md:grid-cols-2 gap-2 text-sm text-gray-600 mb-4">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-indigo-600" />
                                {format(new Date(booking.booking_date), "MMM d, yyyy")}
                              </div>
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-indigo-600" />
                                {booking.participants} participant{booking.participants > 1 ? 's' : ''}
                              </div>
                              <div className="flex items-center gap-2">
                                <CreditCard className="w-4 h-4 text-indigo-600" />
                                ${booking.total_price}
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className={statusColors[booking.payment_status]}>
                                  {booking.payment_status}
                                </Badge>
                              </div>
                            </div>
                            {booking.special_requests && (
                              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg mb-4">
                                <strong>Special requests:</strong> {booking.special_requests}
                              </p>
                            )}
                            <div className="flex flex-wrap gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => navigate(createPageUrl("ExperienceDetail") + `?id=${booking.experience_id}`)}
                              >
                                View Experience
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => navigate(createPageUrl("HostProfile") + `?email=${booking.created_by}`)}
                              >
                                Host Profile
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedChat({ 
                                  bookingId: booking.id, 
                                  experienceId: booking.experience_id, 
                                  hostName: booking.experience_name 
                                })}
                              >
                                <MessageSquare className="w-4 h-4 mr-1" />
                                Chat
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => navigate(createPageUrl("Maps") + "?booking=" + booking.id)}
                              >
                                <MapPin className="w-4 h-4 mr-1" />
                                Map
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Wishlist Tab */}
          <TabsContent value="wishlist" className="space-y-4">
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-pink-50 to-rose-50">
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5" />
                  My Wishlist ({wishlist.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {wishlist.length === 0 ? (
                  <div className="text-center py-12">
                    <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">No saved experiences yet</p>
                    <Button onClick={() => navigate(createPageUrl("Experiences"))}>
                      Browse Experiences
                    </Button>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {wishlist.map((item) => (
                      <Card key={item.id} className="border hover:shadow-lg transition-shadow overflow-hidden">
                        <div className="aspect-video relative">
                          <img
                            src={item.experience_image_url || "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800"}
                            alt={item.experience_name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => removeFromWishlistMutation.mutate(item.id)}
                            className="absolute top-2 right-2 bg-white/90 hover:bg-white"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-bold text-lg mb-2">{item.experience_name}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {item.experience_location}
                            </span>
                            <span className="font-bold text-indigo-600">${item.experience_price}</span>
                          </div>
                          {item.notes && (
                            <p className="text-sm text-gray-600 mb-3 italic">"{item.notes}"</p>
                          )}
                          <Button
                            size="sm"
                            className="w-full"
                            onClick={() => navigate(createPageUrl("ExperienceDetail") + `?id=${item.experience_id}`)}
                          >
                            View Details
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="space-y-4">
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50">
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  My Reviews & Comments ({comments.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {comments.length === 0 ? (
                  <div className="text-center py-12">
                    <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No reviews yet</p>
                  </div>
                ) : (
                  comments.map((comment) => (
                    <Card key={comment.id} className="border hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {comment.rating && (
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < comment.rating ? "fill-amber-400 text-amber-400" : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                          <span className="text-xs text-gray-500">
                            {format(new Date(comment.created_date), "MMM d, yyyy")}
                          </span>
                        </div>
                        <p className="text-gray-700">{comment.content}</p>
                        <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
                          <Heart className="w-4 h-4" />
                          {comment.likes || 0} likes
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Settings Tab */}
          <TabsContent value="profile" className="space-y-4">
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50">
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Profile Settings
                  </CardTitle>
                  {!editingProfile ? (
                    <Button onClick={handleProfileEdit} variant="outline" size="sm">
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button onClick={handleProfileSave} size="sm">
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                      <Button onClick={() => setEditingProfile(false)} variant="outline" size="sm">
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="full_name" className="text-sm font-medium">Full Name</Label>
                      {editingProfile ? (
                        <Input
                          id="full_name"
                          value={profileData.full_name || ""}
                          onChange={(e) => setProfileData({...profileData, full_name: e.target.value})}
                          className="mt-1"
                        />
                      ) : (
                        <p className="mt-1 text-gray-900">{user?.full_name || "Not set"}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                      <div className="mt-1 flex items-center gap-2 text-gray-600">
                        <Mail className="w-4 h-4" />
                        <span>{user?.email}</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="phone" className="text-sm font-medium">Phone</Label>
                      {editingProfile ? (
                        <Input
                          id="phone"
                          value={profileData.phone || ""}
                          onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                          className="mt-1"
                          placeholder="+1 234 567 8900"
                        />
                      ) : (
                        <div className="mt-1 flex items-center gap-2 text-gray-600">
                          <Phone className="w-4 h-4" />
                          <span>{user?.phone || "Not set"}</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="location" className="text-sm font-medium">Location</Label>
                      {editingProfile ? (
                        <Input
                          id="location"
                          value={profileData.location || ""}
                          onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                          className="mt-1"
                          placeholder="City, Country"
                        />
                      ) : (
                        <div className="mt-1 flex items-center gap-2 text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span>{user?.location || "Not set"}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <Label htmlFor="bio" className="text-sm font-medium">Bio</Label>
                    {editingProfile ? (
                      <textarea
                        id="bio"
                        value={profileData.bio || ""}
                        onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                        rows={4}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Tell us about yourself..."
                      />
                    ) : (
                      <p className="mt-1 text-gray-600">{user?.bio || "No bio yet"}</p>
                    )}
                  </div>

                  <Separator />

                  <div>
                    <Label className="text-sm font-medium">Account Information</Label>
                    <div className="mt-3 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Account Type:</span>
                        <Badge>{user?.role === "admin" ? "Admin" : "Member"}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Member Since:</span>
                        <span>{format(new Date(user?.created_date), "MMMM yyyy")}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payment Methods Tab */}
          <TabsContent value="payment" className="space-y-4">
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment Methods
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20" />
                    <div className="relative">
                      <div className="flex justify-between items-start mb-8">
                        <div>
                          <p className="text-xs text-white/80 mb-1">Card Holder</p>
                          <p className="font-semibold text-lg">{user?.full_name}</p>
                        </div>
                        <CreditCard className="w-10 h-10" />
                      </div>
                      <div className="mb-6">
                        <p className="text-2xl font-mono tracking-wider">•••• •••• •••• 4242</p>
                      </div>
                      <div className="flex justify-between">
                        <div>
                          <p className="text-xs text-white/80 mb-1">Expires</p>
                          <p className="font-semibold">12/25</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-white/80 mb-1">Network</p>
                          <p className="font-semibold">Visa</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900">Payment Options</h3>
                    <div className="grid gap-3">
                      {[
                        { name: "Visa ending in 4242", type: "Credit Card", icon: CreditCard, active: true },
                        { name: "PayPal", type: "Digital Wallet", icon: CreditCard, active: false },
                        { name: "Apple Pay", type: "Digital Wallet", icon: CreditCard, active: false },
                      ].map((method, idx) => (
                        <div
                          key={idx}
                          className={`p-4 border rounded-lg flex items-center justify-between ${
                            method.active ? "border-indigo-300 bg-indigo-50" : "border-gray-200"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <method.icon className="w-5 h-5 text-gray-600" />
                            <div>
                              <p className="font-medium">{method.name}</p>
                              <p className="text-sm text-gray-500">{method.type}</p>
                            </div>
                          </div>
                          {method.active && (
                            <Badge className="bg-green-100 text-green-700">Default</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                    <Button variant="outline" className="w-full">
                      <CreditCard className="w-4 h-4 mr-2" />
                      Add Payment Method
                    </Button>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Payment History</h3>
                    <div className="space-y-2">
                      {bookings.filter(b => b.payment_status === "paid").slice(0, 5).map((booking) => (
                        <div key={booking.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-sm">{booking.experience_name}</p>
                            <p className="text-xs text-gray-500">
                              {format(new Date(booking.created_date), "MMM d, yyyy")}
                            </p>
                          </div>
                          <p className="font-semibold text-green-600">${booking.total_price}</p>
                        </div>
                      ))}
                      {bookings.filter(b => b.payment_status === "paid").length === 0 && (
                        <p className="text-center text-gray-500 py-4">No payment history</p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Chat Modal */}
      {selectedChat && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full">
            <ChatWindow
              bookingId={selectedChat.bookingId}
              experienceId={selectedChat.experienceId}
              receiverEmail={user?.email}
              receiverName={selectedChat.hostName}
              onClose={() => setSelectedChat(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}