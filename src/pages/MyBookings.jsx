import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, DollarSign, Map, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import ChatWindow from "../components/chat/ChatWindow";

export default function MyBookings() {
  const navigate = useNavigate();
  const [selectedChat, setSelectedChat] = useState(null);
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ['myBookings'],
    queryFn: () => base44.entities.Booking.filter({ created_by: user?.email }, "-created_date"),
    enabled: !!user,
  });

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
    confirmed: "bg-green-100 text-green-700 border-green-200",
    completed: "bg-blue-100 text-blue-700 border-blue-200",
    cancelled: "bg-red-100 text-red-700 border-red-200"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-indigo-50 py-12">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8">My Bookings</h1>

        <div className="space-y-6">
          {bookings.map((booking) => (
            <Card key={booking.id} className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
                <div className="flex justify-between items-start">
                  <CardTitle>{booking.experience_name}</CardTitle>
                  <Badge className={`${statusColors[booking.status]} border`}>
                    {booking.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4 text-indigo-600" />
                    <span>{format(new Date(booking.booking_date), "MMM d, yyyy")}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="w-4 h-4 text-indigo-600" />
                    <span>{booking.participants} participant{booking.participants > 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <DollarSign className="w-4 h-4 text-indigo-600" />
                    <span className="font-semibold">${booking.total_price}</span>
                  </div>
                </div>
                {booking.special_requests && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600"><strong>Special requests:</strong> {booking.special_requests}</p>
                  </div>
                )}
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(createPageUrl("HostProfile") + `?email=${booking.created_by}`)}
                    className="border-purple-500 text-purple-600 hover:bg-purple-50"
                  >
                    View Host Profile
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedChat({ bookingId: booking.id, experienceId: booking.experience_id, hostName: booking.experience_name })}
                    className="border-indigo-500 text-indigo-600 hover:bg-indigo-50"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Chat with Host
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(createPageUrl("Maps") + "?booking=" + booking.id)}
                    className="border-blue-500 text-blue-600 hover:bg-blue-50"
                  >
                    <Map className="w-4 h-4 mr-2" />
                    View on Map
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {bookings.length === 0 && (
            <div className="text-center py-20">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No bookings yet</h3>
              <p className="text-gray-500">Start exploring local experiences!</p>
            </div>
          )}
        </div>
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