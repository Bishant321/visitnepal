import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, ThumbsUp, Eye, Plus, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";

export default function Forum() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: posts = [] } = useQuery({
    queryKey: ['forumPosts'],
    queryFn: () => base44.entities.ForumPost.list("-created_date"),
  });

  const [postData, setPostData] = useState({
    title: "",
    content: "",
    category: "experience",
    location: "",
    images: []
  });

  const createPostMutation = useMutation({
    mutationFn: (data) => base44.entities.ForumPost.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forumPosts'] });
      setShowForm(false);
      setPostData({ title: "", content: "", category: "experience", location: "", images: [] });
    },
  });

  const likeMutation = useMutation({
    mutationFn: ({ id, likes }) => base44.entities.ForumPost.update(id, { likes: likes + 1 }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forumPosts'] });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createPostMutation.mutate(postData);
  };

  const categories = [
    { value: "all", label: "All Posts" },
    { value: "experience", label: "Travel Experience" },
    { value: "question", label: "Questions" },
    { value: "tip", label: "Tips & Advice" },
    { value: "photo_gallery", label: "Photo Gallery" },
    { value: "route_advice", label: "Route Advice" }
  ];

  const categoryColors = {
    experience: "bg-blue-100 text-blue-700 border-blue-200",
    question: "bg-purple-100 text-purple-700 border-purple-200",
    tip: "bg-green-100 text-green-700 border-green-200",
    photo_gallery: "bg-pink-100 text-pink-700 border-pink-200",
    route_advice: "bg-amber-100 text-amber-700 border-amber-200"
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          post.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen">
      <div className="relative h-64 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1920&h=400&fit=crop"
            alt="Community Forum"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-purple-900/90" />
        </div>
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Community Forum</h1>
          <p className="text-xl text-blue-200">Share experiences, ask questions, and connect with travelers</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-8 flex flex-col md:flex-row gap-4 justify-between">
          <div className="flex-1 flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Post
          </Button>
        </div>

        {showForm && (
          <Card className="mb-8 border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
              <CardTitle>Share with Community</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  placeholder="Post title"
                  value={postData.title}
                  onChange={(e) => setPostData({...postData, title: e.target.value})}
                  required
                />
                <select
                  value={postData.category}
                  onChange={(e) => setPostData({...postData, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  {categories.slice(1).map((cat) => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
                <Input
                  placeholder="Location (optional)"
                  value={postData.location}
                  onChange={(e) => setPostData({...postData, location: e.target.value})}
                />
                <Textarea
                  placeholder="Share your story, tips, or ask a question..."
                  value={postData.content}
                  onChange={(e) => setPostData({...postData, content: e.target.value})}
                  rows={6}
                  required
                />
                <div className="flex gap-3">
                  <Button type="submit" className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600">
                    Post to Community
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="space-y-6">
          {filteredPosts.map((post) => (
            <Card
              key={post.id}
              className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
              onClick={() => navigate(createPageUrl("ForumPost") + `?id=${post.id}`)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge className={`${categoryColors[post.category]} border`}>
                        {post.category.replace(/_/g, ' ')}
                      </Badge>
                      {post.location && (
                        <span className="text-sm text-gray-500">{post.location}</span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{post.title}</h3>
                    <p className="text-gray-600 line-clamp-2">{post.content}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>By {post.created_by}</span>
                    <span>{format(new Date(post.created_date), "MMM d, yyyy")}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        likeMutation.mutate({ id: post.id, likes: post.likes || 0 });
                      }}
                      className="flex items-center gap-1 text-gray-500 hover:text-red-600"
                    >
                      <ThumbsUp className="w-4 h-4" />
                      <span className="text-sm">{post.likes || 0}</span>
                    </button>
                    <div className="flex items-center gap-1 text-gray-500">
                      <Eye className="w-4 h-4" />
                      <span className="text-sm">{post.views || 0}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <div className="text-center py-20">
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No posts yet</h3>
            <p className="text-gray-500 mb-6">Be the first to share your Nepal experience!</p>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
            >
              Create First Post
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}