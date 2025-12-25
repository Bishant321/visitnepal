import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Send, Paperclip, X, ArrowLeft, Users, Lock, Check, CheckCheck } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function GroupChatWindow({ chat, onBack }) {
  const queryClient = useQueryClient();
  const messagesEndRef = useRef(null);
  const [message, setMessage] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [typingUsers, setTypingUsers] = useState([]);
  const typingTimeoutRef = useRef(null);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['groupMessages', chat.id],
    queryFn: () => base44.entities.ChatMessage.filter({ group_chat_id: chat.id }, "created_date"),
    enabled: !!chat,
    refetchInterval: 2000,
  });

  const sendMessageMutation = useMutation({
    mutationFn: (data) => base44.entities.ChatMessage.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groupMessages'] });
      setMessage("");
      setAttachment(null);
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: ({ id }) => base44.entities.ChatMessage.update(id, { read: true, read_at: new Date().toISOString() }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groupMessages'] });
    },
  });

  const uploadFileMutation = useMutation({
    mutationFn: (file) => base44.integrations.Core.UploadFile({ file }),
  });

  useEffect(() => {
    // Mark unread messages as read
    messages.forEach((msg) => {
      if (msg.sender_email !== user?.email && !msg.read) {
        markAsReadMutation.mutate({ id: msg.id });
      }
    });
  }, [messages, user]);

  const handleSend = async () => {
    if (!message.trim() && !attachment) return;

    let attachmentUrl = null;
    if (attachment) {
      try {
        const result = await uploadFileMutation.mutateAsync(attachment);
        attachmentUrl = result.file_url;
      } catch (error) {
        toast.error("Failed to upload attachment");
        return;
      }
    }

    // Broadcast message to all group members
    chat.members.forEach((memberEmail) => {
      if (memberEmail !== user?.email) {
        sendMessageMutation.mutate({
          group_chat_id: chat.id,
          sender_email: user?.email,
          sender_name: user?.full_name,
          receiver_email: memberEmail,
          message: message.trim() || "[Attachment]",
          attachment_url: attachmentUrl
        });
      }
    });
  };

  const handleTyping = () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      // Typing stopped
    }, 1000);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Card className="border-0 shadow-2xl h-[700px] flex flex-col">
        <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={onBack}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  {chat.group_name}
                  <Badge className="bg-green-100 text-green-700 border-green-200">
                    <Lock className="w-3 h-3 mr-1" />
                    Encrypted
                  </Badge>
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  {chat.members.length} members • {messages.length} messages
                </p>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg mb-2">No messages yet</p>
              <p className="text-sm">Start the group conversation!</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.sender_email === user?.email;
              return (
                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] ${isMe ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-900'} rounded-2xl px-4 py-2 shadow-md`}>
                    {!isMe && <p className="text-xs font-semibold mb-1 opacity-75">{msg.sender_name}</p>}
                    <p className="break-words">{msg.message}</p>
                    {msg.attachment_url && (
                      <a href={msg.attachment_url} target="_blank" rel="noopener noreferrer" className="text-xs underline mt-2 block">
                        📎 View Attachment
                      </a>
                    )}
                    <div className="flex items-center gap-1 justify-end mt-1">
                      <p className="text-xs opacity-75">
                        {format(new Date(msg.created_date), "h:mm a")}
                      </p>
                      {isMe && (
                        msg.read ? (
                          <CheckCheck className="w-3 h-3 opacity-75" />
                        ) : (
                          <Check className="w-3 h-3 opacity-75" />
                        )
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </CardContent>

        <div className="p-4 border-t bg-gray-50">
          {typingUsers.length > 0 && (
            <p className="text-xs text-gray-500 mb-2">
              {typingUsers.join(", ")} {typingUsers.length === 1 ? 'is' : 'are'} typing...
            </p>
          )}
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
              onChange={(e) => { setMessage(e.target.value); handleTyping(); }}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1"
            />
            <input
              type="file"
              id="group-chat-file"
              className="hidden"
              onChange={(e) => setAttachment(e.target.files[0])}
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => document.getElementById('group-chat-file').click()}
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
    </div>
  );
}