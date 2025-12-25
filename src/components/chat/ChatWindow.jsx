import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Send, Paperclip, X, Lock } from "lucide-react";
import { format } from "date-fns";

export default function ChatWindow({ bookingId, experienceId, receiverEmail, receiverName, onClose }) {
  const queryClient = useQueryClient();
  const messagesEndRef = useRef(null);
  const [message, setMessage] = useState("");
  const [attachment, setAttachment] = useState(null);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['chatMessages', bookingId, experienceId],
    queryFn: () => {
      if (bookingId) {
        return base44.entities.ChatMessage.filter({ booking_id: bookingId }, "created_date");
      } else if (experienceId) {
        return base44.entities.ChatMessage.filter({ 
          experience_id: experienceId,
          $or: [
            { sender_email: user?.email, receiver_email: receiverEmail },
            { sender_email: receiverEmail, receiver_email: user?.email }
          ]
        }, "created_date");
      }
      return [];
    },
    enabled: !!user,
    refetchInterval: 3000, // Poll every 3 seconds for new messages
  });

  const sendMessageMutation = useMutation({
    mutationFn: (data) => base44.entities.ChatMessage.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatMessages'] });
      setMessage("");
      setAttachment(null);
    },
  });

  const uploadFileMutation = useMutation({
    mutationFn: (file) => base44.integrations.Core.UploadFile({ file }),
  });

  const handleSend = async () => {
    if (!message.trim() && !attachment) return;

    let attachmentUrl = null;
    if (attachment) {
      const result = await uploadFileMutation.mutateAsync(attachment);
      attachmentUrl = result.file_url;
    }

    sendMessageMutation.mutate({
      booking_id: bookingId,
      experience_id: experienceId,
      sender_email: user?.email,
      sender_name: user?.full_name,
      receiver_email: receiverEmail,
      message: message.trim() || "[Attachment]",
      attachment_url: attachmentUrl
    });
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <Card className="border-0 shadow-2xl h-[600px] flex flex-col">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            💬 Chat with {receiverName}
            <Badge variant="outline" className="ml-2">
              {messages.length} messages
            </Badge>
            <Badge className="bg-green-100 text-green-700 border-green-200">
              <Lock className="w-3 h-3 mr-1" />
              Encrypted
            </Badge>
          </CardTitle>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-lg mb-2">No messages yet</p>
            <p className="text-sm">Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_email === user?.email;
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] ${isMe ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-900'} rounded-2xl px-4 py-2 shadow-md`}>
                  <p className="text-sm font-medium mb-1">{msg.sender_name}</p>
                  <p className="break-words">{msg.message}</p>
                  {msg.attachment_url && (
                    <a href={msg.attachment_url} target="_blank" rel="noopener noreferrer" className="text-xs underline mt-2 block">
                      📎 View Attachment
                    </a>
                  )}
                  <p className="text-xs opacity-75 mt-1">
                    {format(new Date(msg.created_date), "MMM d, h:mm a")}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </CardContent>
      <div className="p-4 border-t bg-gray-50">
        {attachment && (
          <div className="mb-2 p-2 bg-blue-100 rounded-lg flex items-center justify-between">
            <span className="text-sm">📎 {attachment.name}</span>
            <Button size="sm" variant="ghost" onClick={() => setAttachment(null)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}
        <div className="flex gap-2">
          <Input
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1"
          />
          <input
            type="file"
            id="chat-file"
            className="hidden"
            onChange={(e) => setAttachment(e.target.files[0])}
          />
          <Button
            variant="outline"
            size="icon"
            onClick={() => document.getElementById('chat-file').click()}
          >
            <Paperclip className="w-4 h-4" />
          </Button>
          <Button
            onClick={handleSend}
            disabled={sendMessageMutation.isPending || (!message.trim() && !attachment)}
            className="bg-indigo-600"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}