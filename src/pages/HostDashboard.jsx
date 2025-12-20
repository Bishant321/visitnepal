import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Eye, EyeOff, DollarSign, Calendar, Users, Star, MessageSquare } from "lucide-react";
import { format } from "date-fns";

export default function HostDashboard() {
  const queryClient = useQueryClient();
  const [editingExperience, setEditingExperience] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: myExperiences = [] } = useQuery({
    queryKey: ['myExperiences'],
    queryFn: () => base44.entities.Experience.filter({ created_by: user?.email }),
    enabled: !!user,
  });

  const { data: allBookings = [] } = useQuery({
    queryKey: ['allBookings'],
    queryFn: () => base44.entities.Booking.list("-created_date"),
  });

  const myBookings = allBookings.filter(booking => 
    myExperiences.some(exp => exp.id === booking.experience_id)
  );

  const [formData, setFormData] = useState({
    name: "",
    category: "cooking_class",
    location: "",
    description: "",
    duration: "",
    price: "",
    max_participants: "",
    host_name: user?.full_name || "",
    host_contact: user?.email || "",
    image_url: "",
    available: true
  });

  const createExperienceMutation = useMutation({
    mutationFn: (data) => base44.entities.Experience.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myExperiences'] });
      setShowForm(false);
      resetForm();
    },
  });

  const updateExperienceMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Experience.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myExperiences'] });
      setEditingExperience(null);
      resetForm();
    },
  });

  const updateBookingMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.Booking.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allBookings'] });
    },
  });

  const toggleAvailability = (experience) => {
    updateExperienceMutation.mutate({
      id: experience.id,
      data: { available: !experience.available }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingExperience) {
      updateExperienceMutation.mutate({ id: editingExperience.id, data: formData });
    } else {
      createExperienceMutation.mutate(formData);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      category: "cooking_class",
      location: "",
      description: "",
      duration: "",
      price: "",
      max_participants: "",
      host_name: user?.full_name || "",
      host_contact: user?.email || "",
      image_url: "",
      available: true
    });
  };

  const startEdit = (experience) => {
    setEditingExperience(experience);
    setFormData(experience);
    setShowForm(true);
  };

  const totalRevenue = myBookings
    .filter(b => b.status === "confirmed" || b.status === "completed")
    .reduce((sum, b) => sum + (b.total_price || 0), 0);

  const pendingBookings = myBookings.filter(b => b.status === "pending").length;

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
    confirmed: "bg-green-100 text-green-700 border-green-200",
    completed: "bg-blue-100 text-blue-700 border-blue-200",
    cancelled: "bg-red-100 text-red-700 border-red-200"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Host Dashboard</h1>
            <p className="text-gray-600">Manage your experiences and bookings</p>
          </div>
          <Button
            onClick={() => { setShowForm(true); setEditingExperience(null); resetForm(); }}
            className="bg-gradient-to-r from-indigo-600 to-purple-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Experience
          </Button>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Listings</p>
                  <p className="text-3xl font-bold text-gray-900">{myExperiences.length}</p>
                </div>
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                  <Eye className="w-6 h-6 text-indigo-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Pending Bookings</p>
                  <p className="text-3xl font-bold text-yellow-600">{pendingBookings}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Bookings</p>
                  <p className="text-3xl font-bold text-green-600">{myBookings.length}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                  <p className="text-3xl font-bold text-purple-600">${totalRevenue.toFixed(0)}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Experience Form */}
        {showForm && (
          <Card className="border-0 shadow-xl mb-8">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
              <CardTitle>{editingExperience ? "Edit Experience" : "Create New Experience"}</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <Input
                    placeholder="Experience Name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="cooking_class">Cooking Class</option>
                    <option value="cultural_tour">Cultural Tour</option>
                    <option value="homestay">Homestay</option>
                    <option value="adventure">Adventure</option>
                    <option value="workshop">Workshop</option>
                    <option value="guided_trek">Guided Trek</option>
                  </select>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <Input
                    placeholder="Location"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    required
                  />
                  <Input
                    placeholder="Duration (e.g., 3 hours)"
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: e.target.value})}
                    required
                  />
                </div>
                <Textarea
                  placeholder="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={4}
                  required
                />
                <div className="grid md:grid-cols-3 gap-4">
                  <Input
                    type="number"
                    placeholder="Price (USD)"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                    required
                  />
                  <Input
                    type="number"
                    placeholder="Max Participants"
                    value={formData.max_participants}
                    onChange={(e) => setFormData({...formData, max_participants: parseInt(e.target.value)})}
                  />
                  <Input
                    placeholder="Image URL"
                    value={formData.image_url}
                    onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                  />
                </div>
                <div className="flex gap-3">
                  <Button type="submit" className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600">
                    {editingExperience ? "Update Experience" : "Create Experience"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingExperience(null); }}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs defaultValue="listings" className="space-y-6">
          <TabsList className="bg-white shadow-lg">
            <TabsTrigger value="listings">My Listings</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
          </TabsList>

          <TabsContent value="listings" className="space-y-4">
            {myExperiences.map((exp) => (
              <Card key={exp.id} className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <img
                      src={exp.image_url || "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=200&h=150&fit=crop"}
                      alt={exp.name}
                      className="w-32 h-24 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-xl font-bold mb-1">{exp.name}</h3>
                          <div className="flex gap-2">
                            <Badge>{exp.category.replace(/_/g, ' ')}</Badge>
                            <Badge variant="outline">${exp.price}</Badge>
                            <Badge className={exp.available ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}>
                              {exp.available ? "Available" : "Unavailable"}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={() => startEdit(exp)} size="sm" variant="outline">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            onClick={() => toggleAvailability(exp)} 
                            size="sm" 
                            variant={exp.available ? "outline" : "default"}
                          >
                            {exp.available ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">{exp.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                          {exp.rating || 0} ({exp.reviews_count || 0})
                        </span>
                        <span>{exp.location}</span>
                        <span>{exp.duration}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="bookings" className="space-y-4">
            {myBookings.map((booking) => (
              <Card key={booking.id} className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold mb-2">{booking.experience_name}</h3>
                      <div className="flex gap-2">
                        <Badge className={`${statusColors[booking.status]} border`}>
                          {booking.status}
                        </Badge>
                        <Badge variant="outline">
                          {format(new Date(booking.booking_date), "MMM d, yyyy")}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-indigo-600">${booking.total_price}</p>
                      <p className="text-sm text-gray-500">{booking.participants} guests</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <p><strong>Contact:</strong> {booking.contact_email} | {booking.contact_phone}</p>
                    {booking.special_requests && (
                      <p><strong>Special Requests:</strong> {booking.special_requests}</p>
                    )}
                  </div>
                  {booking.status === "pending" && (
                    <div className="flex gap-2">
                      <Button
                        onClick={() => updateBookingMutation.mutate({ id: booking.id, status: "confirmed" })}
                        size="sm"
                        className="bg-green-600"
                      >
                        Confirm Booking
                      </Button>
                      <Button
                        onClick={() => updateBookingMutation.mutate({ id: booking.id, status: "cancelled" })}
                        size="sm"
                        variant="outline"
                        className="border-red-300 text-red-600"
                      >
                        Decline
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            {myBookings.length === 0 && (
              <Card className="border-0 shadow-lg">
                <CardContent className="py-20 text-center">
                  <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">No bookings yet</h3>
                  <p className="text-gray-500">Bookings will appear here once customers book your experiences</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}