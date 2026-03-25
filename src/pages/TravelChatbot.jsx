import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Send, Bot, User, MapPin, Mountain, Landmark, Compass, Sparkles, Mic, MessageSquare } from "lucide-react";
import ReactMarkdown from "react-markdown";
import VoiceAssistant from "../components/chat/VoiceAssistant";

const QUICK_PROMPTS = [
  { label: "🏔️ Best mountains to visit", text: "What are the best mountains to visit in Nepal?" },
  { label: "🥾 Top trekking routes", text: "What are the top trekking routes in Nepal for beginners?" },
  { label: "🏛️ Cultural heritage sites", text: "Tell me about Nepal's UNESCO World Heritage cultural sites" },
  { label: "🎉 Festivals & culture", text: "What festivals and cultural experiences should I experience in Nepal?" },
  { label: "📅 Best time to visit", text: "When is the best time to visit Nepal?" },
  { label: "💰 Budget travel tips", text: "Give me budget travel tips for Nepal" },
];

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
      <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
      <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
    </div>
  );
}

export default function TravelChatbot() {
  const [mode, setMode] = useState("chat"); // chat | voice
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Namaste! 🙏 I'm your AI Nepal Travel Guide. I can help you discover Nepal's incredible mountains, trekking routes, cultural heritage, and local experiences. What would you like to explore today?"
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const userText = text || input.trim();
    if (!userText) return;

    const newMessages = [...messages, { role: "user", content: userText }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const conversationHistory = newMessages
        .map(m => `${m.role === "user" ? "User" : "Guide"}: ${m.content}`)
        .join("\n\n");

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert AI Nepal Travel Guide chatbot for the VisitNepal app. You help tourists discover Nepal's destinations, trekking routes, cultural heritage, and travel tips.

Your personality: Friendly, knowledgeable, enthusiastic about Nepal. You use emojis occasionally. You always provide practical, accurate, and helpful travel information.

Key knowledge areas:
- Nepal's top destinations: Everest region, Annapurna, Pokhara, Kathmandu Valley, Chitwan, Lumbini, Mustang
- Trekking routes: EBC, Annapurna Circuit, Langtang, Ghorepani Poon Hill, Upper Mustang
- UNESCO Heritage sites: Pashupatinath, Boudhanath, Swayambhunath, Kathmandu Durbar Square, Patan, Bhaktapur, Lumbini, Chitwan, Sagarmatha
- Best seasons: Spring (Mar-May) and Autumn (Sep-Nov) are best for trekking
- Permits: TIMS card, national park permits, ACAP, restricted area permits
- Culture: Hindu and Buddhist traditions, festivals like Dashain, Tihar, Holi, Indra Jatra
- Practical tips: Currency (NPR), visas on arrival, altitude sickness, local food (dal bhat), transport options
- Budget: Range from budget ($20-30/day) to luxury options

CONVERSATION SO FAR:
${conversationHistory}

Now respond to the latest user message. Be concise but informative (2-4 paragraphs max). Include specific destination names, tips, or recommendations. If relevant, suggest related topics they might want to explore.`,
        add_context_from_internet: true,
        model: "gemini_3_flash"
      });

      setMessages(prev => [...prev, { role: "assistant", content: response }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "I'm having trouble connecting right now. Please try again in a moment! 🙏"
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Banner */}
      <div className="relative h-56 flex items-center justify-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1920&h=400&fit=crop"
          alt="Nepal"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-red-900/90 to-amber-900/80" />
        <div className="relative z-10 text-center text-white px-4">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Bot className="w-7 h-7" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold">Nepal Travel AI Guide</h1>
          </div>
          <p className="text-amber-200 text-lg">Ask me anything about exploring Nepal</p>
          <div className="flex items-center justify-center gap-4 mt-3 text-sm text-amber-100">
            <span className="flex items-center gap-1"><Mountain className="w-4 h-4" /> Mountains</span>
            <span className="flex items-center gap-1"><Compass className="w-4 h-4" /> Trekking</span>
            <span className="flex items-center gap-1"><Landmark className="w-4 h-4" /> Culture</span>
            <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> Destinations</span>
          </div>
        </div>
      </div>

      {/* Mode Toggle */}
      <div className="flex justify-center gap-2 pt-4">
        <Button
          onClick={() => setMode("chat")}
          variant={mode === "chat" ? "default" : "outline"}
          className={mode === "chat" ? "bg-gradient-to-r from-red-800 to-amber-700" : ""}
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          Text Chat
        </Button>
        <Button
          onClick={() => setMode("voice")}
          variant={mode === "voice" ? "default" : "outline"}
          className={mode === "voice" ? "bg-gradient-to-r from-red-800 to-amber-700" : ""}
        >
          <Mic className="w-4 h-4 mr-2" />
          Voice Assistant (EN/नेपाली)
        </Button>
      </div>

      <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-6 flex flex-col gap-4">
        {mode === "voice" && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100">
            <VoiceAssistant />
          </div>
        )}

        {mode === "chat" && <>
        {/* Quick Prompt Chips */}
        <div>
          <p className="text-sm text-gray-500 mb-2 font-medium">Quick Questions:</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt.text}
                onClick={() => sendMessage(prompt.text)}
                disabled={loading}
                className="px-3 py-1.5 text-sm bg-white border border-amber-200 rounded-full hover:bg-amber-50 hover:border-amber-400 transition-all disabled:opacity-50 shadow-sm"
              >
                {prompt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 bg-white rounded-2xl shadow-xl border border-gray-100 flex flex-col overflow-hidden" style={{ minHeight: "500px" }}>
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && (
                  <div className="w-9 h-9 bg-gradient-to-br from-red-800 to-amber-700 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                )}
                <div className={`max-w-[80%] rounded-2xl px-5 py-3 shadow-sm ${
                  msg.role === "user"
                    ? "bg-gradient-to-br from-red-800 to-amber-800 text-white"
                    : "bg-gray-50 text-gray-800 border border-gray-100"
                }`}>
                  {msg.role === "assistant" ? (
                    <ReactMarkdown
                      className="prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
                      components={{
                        p: ({ children }) => <p className="my-1 leading-relaxed text-gray-800">{children}</p>,
                        strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
                        ul: ({ children }) => <ul className="my-1 ml-4 list-disc text-gray-800">{children}</ul>,
                        li: ({ children }) => <li className="my-0.5">{children}</li>,
                        h3: ({ children }) => <h3 className="text-base font-bold mt-3 mb-1 text-gray-900">{children}</h3>,
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  ) : (
                    <p className="leading-relaxed">{msg.content}</p>
                  )}
                </div>
                {msg.role === "user" && (
                  <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <User className="w-5 h-5 text-gray-600" />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-3 justify-start">
                <div className="w-9 h-9 bg-gradient-to-br from-red-800 to-amber-700 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="bg-gray-50 border border-gray-100 rounded-2xl">
                  <TypingDots />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t bg-gray-50 p-4">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                placeholder="Ask about Nepal's mountains, trekking, culture, tips..."
                className="flex-1 rounded-xl bg-white"
                disabled={loading}
              />
              <Button
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
                className="bg-gradient-to-r from-red-800 to-amber-700 hover:from-red-900 hover:to-amber-800 rounded-xl px-5"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center flex items-center justify-center gap-1">
              <Sparkles className="w-3 h-3" />
              Powered by AI with real-time Nepal travel information
            </p>
          </div>
        </div>
        </>}
      </div>
    </div>
  );
}