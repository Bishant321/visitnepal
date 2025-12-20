import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ThumbsUp, MessageSquare, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";

export default function ForumPost() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const postId = urlParams.get("id");
  const [commentText, setCommentText] = useState("");
  const [rating, setRating] = useState(0);

  const { data: posts = [] } = useQuery({
    queryKey: ['forumPosts'],
    queryFn: () => base44.entities.ForumPost.list(),
  });

  const { data: comments = [] } = useQuery({
    queryKey: ['comments', postId],
    queryFn: () => base44.entities.Comment.filter({ post_id: postId }),
    enabled: !!postId,
  });

  const post = posts.find(p => p.id === postId);

  const createCommentMutation = useMutation({
    mutationFn: (data) => base44.entities.Comment.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
      setCommentText("");
      setRating(0);
    },
  });

  const likeCommentMutation = useMutation({
    mutationFn: ({ id, likes }) => base44.entities.Comment.update(id, { likes: likes + 1 }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
    },
  });

  const handleComment = (e) => {
    e.preventDefault();
    createCommentMutation.mutate({
      post_id: postId,
      content: commentText,
      rating: rating > 0 ? rating : undefined
    });
  };

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Post not found</h2>
        <Button onClick={() => navigate(createPageUrl("Forum"))}>Back to Forum</Button>
      </div>
    );
  }

  const categoryColors = {
    experience: "bg-blue-100 text-blue-700 border-blue-200",
    question: "bg-purple-100 text-purple-700 border-purple-200",
    tip: "bg-green-100 text-green-700 border-green-200",
    photo_gallery: "bg-pink-100 text-pink-700 border-pink-200",
    route_advice: "bg-amber-100 text-amber-700 border-amber-200"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-blue-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <Button
          variant="ghost"
          onClick={() => navigate(createPageUrl("Forum"))}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Forum
        </Button>

        <Card className="border-0 shadow-xl mb-8">
          <CardContent className="p-8">
            <div className="flex items-center gap-3 mb-4">
              <Badge className={`${categoryColors[post.category]} border`}>
                {post.category.replace(/_/g, ' ')}
              </Badge>
              {post.location && (
                <span className="text-sm text-gray-500">{post.location}</span>
              )}
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>

            <div className="flex items-center gap-4 text-sm text-gray-500 mb-6 pb-6 border-b">
              <span>Posted by {post.created_by}</span>
              <span>•</span>
              <span>{format(new Date(post.created_date), "MMMM d, yyyy")}</span>
            </div>

            <div className="prose prose-lg max-w-none mb-6">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{post.content}</p>
            </div>

            {post.images && post.images.length > 0 && (
              <div className="grid grid-cols-2 gap-4 mb-6">
                {post.images.map((img, idx) => (
                  <img key={idx} src={img} alt="" className="rounded-lg w-full h-48 object-cover" />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl mb-8">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Comments ({comments.length})
            </h3>

            <form onSubmit={handleComment} className="mb-6">
              <Textarea
                placeholder="Share your thoughts or answer..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                rows={4}
                required
                className="mb-3"
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Rate this post:</span>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`w-5 h-5 ${star <= rating ? "fill-amber-400 text-amber-400" : "text-gray-300"}`}
                      />
                    </button>
                  ))}
                </div>
                <Button type="submit" className="bg-gradient-to-r from-blue-600 to-purple-600">
                  Post Comment
                </Button>
              </div>
            </form>

            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className="font-semibold text-gray-900">{comment.created_by}</span>
                      <span className="text-sm text-gray-500 ml-3">
                        {format(new Date(comment.created_date), "MMM d, yyyy")}
                      </span>
                    </div>
                    {comment.rating && (
                      <div className="flex items-center gap-1">
                        {[...Array(comment.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="text-gray-700 mb-2">{comment.content}</p>
                  <button
                    onClick={() => likeCommentMutation.mutate({ id: comment.id, likes: comment.likes || 0 })}
                    className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-600"
                  >
                    <ThumbsUp className="w-3 h-3" />
                    <span>{comment.likes || 0}</span>
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}