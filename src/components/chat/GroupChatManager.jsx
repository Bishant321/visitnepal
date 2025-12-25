import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, MessageSquare, Trash2, UserPlus, Lock } from "lucide-react";
import { toast } from "sonner";
import GroupChatWindow from "./GroupChatWindow";

export default function GroupChatManager() {
  const queryClient = useQueryClient();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);
  const [formData, setFormData] = useState({
    group_name: "",
    group_description: "",
    members: ""
  });

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: groupChats = [] } = useQuery({
    queryKey: ['groupChats'],
    queryFn: () => base44.entities.GroupChat.filter({
      $or: [
        { admin_email: user?.email },
        { members: { $contains: user?.email } }
      ]
    }, "-created_date"),
    enabled: !!user,
  });

  const { data: travelPlans = [] } = useQuery({
    queryKey: ['travelPlans'],
    queryFn: () => base44.entities.TravelPlan.filter({ created_by: user?.email }),
    enabled: !!user,
  });

  const createGroupMutation = useMutation({
    mutationFn: (data) => base44.entities.GroupChat.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groupChats'] });
      setShowCreateForm(false);
      setFormData({ group_name: "", group_description: "", members: "" });
      toast.success("Group chat created!");
    },
  });

  const deleteGroupMutation = useMutation({
    mutationFn: (id) => base44.entities.GroupChat.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groupChats'] });
      toast.success("Group deleted");
    },
  });

  const handleCreateGroup = () => {
    if (!formData.group_name || !formData.members) {
      toast.error("Please fill required fields");
      return;
    }

    const memberEmails = formData.members.split(',').map(e => e.trim()).filter(e => e);
    if (!memberEmails.includes(user?.email)) {
      memberEmails.push(user.email);
    }

    createGroupMutation.mutate({
      group_name: formData.group_name,
      group_description: formData.group_description,
      members: memberEmails,
      admin_email: user?.email,
      group_type: "general",
      encryption_enabled: true
    });
  };

  const createPlanGroup = (plan) => {
    createGroupMutation.mutate({
      group_name: `${plan.title} - Travel Group`,
      group_description: `Discussion group for ${plan.title}`,
      members: [user?.email],
      admin_email: user?.email,
      group_type: "travel_plan",
      related_id: plan.id,
      encryption_enabled: true
    });
  };

  if (selectedChat) {
    return <GroupChatWindow chat={selectedChat} onBack={() => setSelectedChat(null)} />;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Group Chats</h1>
          <p className="text-gray-600">Collaborate with fellow travelers</p>
        </div>
        <Button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-gradient-to-r from-indigo-600 to-purple-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Group
        </Button>
      </div>

      {showCreateForm && (
        <Card className="mb-8 border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
            <CardTitle>Create Group Chat</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div>
              <Label htmlFor="group_name">Group Name *</Label>
              <Input
                id="group_name"
                value={formData.group_name}
                onChange={(e) => setFormData({...formData, group_name: e.target.value})}
                placeholder="e.g., Everest Trek 2025"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="group_description">Description</Label>
              <Input
                id="group_description"
                value={formData.group_description}
                onChange={(e) => setFormData({...formData, group_description: e.target.value})}
                placeholder="What's this group about?"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="members">Member Emails * (comma separated)</Label>
              <Input
                id="members"
                value={formData.members}
                onChange={(e) => setFormData({...formData, members: e.target.value})}
                placeholder="user1@email.com, user2@email.com"
                className="mt-1"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreateGroup} disabled={createGroupMutation.isPending} className="flex-1">
                Create Group
              </Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {travelPlans.length > 0 && (
        <Card className="mb-8 border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50">
            <CardTitle>Quick Create from Travel Plans</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-4">
              {travelPlans.map((plan) => (
                <div key={plan.id} className="flex items-center justify-between p-4 bg-white rounded-lg border">
                  <div>
                    <p className="font-semibold text-gray-900">{plan.title}</p>
                    <p className="text-sm text-gray-600">{plan.travelers} travelers</p>
                  </div>
                  <Button size="sm" onClick={() => createPlanGroup(plan)}>
                    <Users className="w-3 h-3 mr-1" />
                    Create Group
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {groupChats.map((chat) => (
          <Card key={chat.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer" onClick={() => setSelectedChat(chat)}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{chat.group_name}</h3>
                    <p className="text-sm text-gray-600">{chat.members.length} members</p>
                  </div>
                </div>
                {chat.encryption_enabled && (
                  <Lock className="w-4 h-4 text-green-600" />
                )}
              </div>
              
              {chat.group_description && (
                <p className="text-sm text-gray-600 mb-3">{chat.group_description}</p>
              )}

              <div className="flex items-center gap-2 mb-3">
                <Badge variant="secondary">{chat.group_type}</Badge>
                {chat.admin_email === user?.email && (
                  <Badge className="bg-indigo-100 text-indigo-700">Admin</Badge>
                )}
              </div>

              <div className="flex gap-2">
                <Button size="sm" className="flex-1" onClick={(e) => { e.stopPropagation(); setSelectedChat(chat); }}>
                  <MessageSquare className="w-3 h-3 mr-1" />
                  Open Chat
                </Button>
                {chat.admin_email === user?.email && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => { e.stopPropagation(); deleteGroupMutation.mutate(chat.id); }}
                    className="text-red-600"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {groupChats.length === 0 && (
        <div className="text-center py-20">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 mb-2">No group chats yet</h3>
          <p className="text-gray-500 mb-6">Create a group to chat with your travel companions</p>
        </div>
      )}
    </div>
  );
}