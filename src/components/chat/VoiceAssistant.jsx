import React, { useState, useEffect, useRef, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Volume2, VolumeX, Globe, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const GREETINGS = {
  en: "Namaste! I am your Nepal Travel Guide. Ask me anything about Nepal's mountains, trekking, culture, and destinations!",
  ne: "नमस्ते! म तपाईंको नेपाल यात्रा गाइड हूँ। नेपालका पहाड, ट्रेकिङ, संस्कृति र गन्तव्यहरूका बारेमा कुनै पनि प्रश्न सोध्नुहोस्!"
};

const STATUS_LABELS = {
  idle: { en: "Tap mic to speak", ne: "बोल्न माइक थिच्नुहोस्" },
  listening: { en: "Listening...", ne: "सुन्दैछु..." },
  thinking: { en: "Thinking...", ne: "सोच्दैछु..." },
  speaking: { en: "Speaking...", ne: "बोल्दैछु..." },
};

function SpeakingWave({ isActive }) {
  const bars = [1, 2, 3, 4, 5, 4, 3, 2, 1];
  return (
    <div className="flex items-center justify-center gap-1 h-10">
      {bars.map((height, i) => (
        <motion.div
          key={i}
          className="w-1.5 bg-white rounded-full"
          animate={isActive
            ? { height: [`${height * 6}px`, `${height * 14}px`, `${height * 6}px`] }
            : { height: "4px" }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.07,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
}

function PulseRings({ isActive, color }) {
  if (!isActive) return null;
  return (
    <>
      {[1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className={`absolute inset-0 rounded-full border-2 ${color}`}
          initial={{ scale: 1, opacity: 0.6 }}
          animate={{ scale: 1 + i * 0.3, opacity: 0 }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: i * 0.4,
            ease: "easeOut"
          }}
        />
      ))}
    </>
  );
}

export default function VoiceAssistant() {
  const [lang, setLang] = useState("en");
  const [status, setStatus] = useState("idle"); // idle | listening | thinking | speaking
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const [supported, setSupported] = useState(true);
  const [history, setHistory] = useState([]);

  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);
  const utteranceRef = useRef(null);

  useEffect(() => {
    if (!('SpeechRecognition' in window) && !('webkitSpeechRecognition' in window)) {
      setSupported(false);
    }
    // Greet on mount
    setTimeout(() => speak(GREETINGS[lang], lang), 800);
    return () => {
      synthRef.current?.cancel();
      recognitionRef.current?.abort();
    };
  }, []);

  const speak = useCallback((text, language = lang) => {
    if (isMuted || !text) return;
    synthRef.current?.cancel();
    const utterance = new SpeechSynthesisUtterance(text);

    // Try to find a voice for the language
    const voices = synthRef.current?.getVoices() || [];
    const langCode = language === "ne" ? "ne" : "en";
    const voice = voices.find(v => v.lang.startsWith(langCode))
      || voices.find(v => v.lang.startsWith("en"));
    if (voice) utterance.voice = voice;
    utterance.lang = language === "ne" ? "ne-NP" : "en-US";
    utterance.rate = language === "ne" ? 0.8 : 0.9;
    utterance.pitch = language === "ne" ? 1.0 : 1.1;

    utterance.onstart = () => setStatus("speaking");
    utterance.onend = () => setStatus("idle");
    utterance.onerror = () => setStatus("idle");

    utteranceRef.current = utterance;
    synthRef.current?.speak(utterance);
  }, [lang, isMuted]);

  const startListening = useCallback(() => {
    if (status !== "idle") return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    synthRef.current?.cancel();
    const recognition = new SpeechRecognition();
    recognition.lang = lang === "ne" ? "ne-NP" : "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setStatus("listening");
    recognition.onresult = async (event) => {
      const spokenText = event.results[0][0].transcript;
      setTranscript(spokenText);
      setStatus("thinking");
      await getAIResponse(spokenText);
    };
    recognition.onerror = () => setStatus("idle");
    recognition.onend = () => {
      if (status === "listening") setStatus("idle");
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [status, lang]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setStatus("idle");
  }, []);

  const getAIResponse = async (userText) => {
    const newHistory = [...history, { role: "user", content: userText }];
    setHistory(newHistory);

    const historyStr = newHistory.slice(-6).map(m => `${m.role === "user" ? "User" : "Guide"}: ${m.content}`).join("\n");

    try {
      const langInstruction = lang === "ne"
        ? "IMPORTANT: You MUST respond entirely in Nepali language (Devanagari script). Do NOT use English at all. Use conversational, simple Nepali."
        : "Respond in clear, friendly English.";

      const reply = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a friendly Nepal Travel Guide voice assistant. ${langInstruction}

Keep responses SHORT (2-3 sentences max) since this is a voice interface. Be warm, helpful, and mention specific Nepal destinations, tips, or facts.

Conversation:
${historyStr}

Respond briefly to the user's latest message.`,
        add_context_from_internet: false,
      });

      setResponse(reply);
      setHistory(prev => [...prev, { role: "assistant", content: reply }]);
      speak(reply, lang);
    } catch (e) {
      const errMsg = lang === "ne" ? "माफ गर्नुहोस्, केही समस्या भयो।" : "Sorry, something went wrong. Please try again.";
      setResponse(errMsg);
      speak(errMsg, lang);
    }
  };

  const toggleLanguage = () => {
    synthRef.current?.cancel();
    recognitionRef.current?.abort();
    setStatus("idle");
    setTranscript("");
    setResponse("");
    setHistory([]);
    const newLang = lang === "en" ? "ne" : "en";
    setLang(newLang);
    setTimeout(() => speak(GREETINGS[newLang], newLang), 300);
  };

  const resetConversation = () => {
    synthRef.current?.cancel();
    recognitionRef.current?.abort();
    setStatus("idle");
    setTranscript("");
    setResponse("");
    setHistory([]);
    setTimeout(() => speak(GREETINGS[lang], lang), 300);
  };

  const statusLabel = STATUS_LABELS[status]?.[lang] || "";
  const isListening = status === "listening";
  const isSpeaking = status === "speaking";
  const isThinking = status === "thinking";

  return (
    <div className="flex flex-col items-center gap-8 py-8 px-4 max-w-lg mx-auto">
      {/* Avatar */}
      <div className="relative flex items-center justify-center">
        {/* Pulse rings */}
        <div className="relative w-48 h-48">
          <PulseRings isActive={isListening} color="border-red-400" />
          <PulseRings isActive={isSpeaking} color="border-amber-400" />

          {/* Main avatar circle */}
          <motion.div
            className="absolute inset-0 rounded-full overflow-hidden shadow-2xl"
            animate={isSpeaking ? { scale: [1, 1.03, 1] } : { scale: 1 }}
            transition={{ duration: 0.5, repeat: isSpeaking ? Infinity : 0 }}
          >
            <img
              src="https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400&h=400&fit=crop&crop=face"
              alt="AI Guide"
              className="w-full h-full object-cover"
            />
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-red-900/70 via-transparent to-transparent" />

            {/* Speaking wave at bottom of avatar */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center">
              <SpeakingWave isActive={isSpeaking} />
            </div>
          </motion.div>

          {/* Status indicator dot */}
          <div className={`absolute bottom-2 right-2 w-5 h-5 rounded-full border-2 border-white shadow ${
            isListening ? "bg-red-500" : isSpeaking ? "bg-amber-500" : isThinking ? "bg-blue-500 animate-pulse" : "bg-green-500"
          }`} />
        </div>
      </div>

      {/* Status label */}
      <div className="text-center">
        <p className="text-lg font-semibold text-gray-700">{statusLabel}</p>
        {isThinking && (
          <div className="flex items-center justify-center gap-1 mt-2">
            {[0, 1, 2].map(i => (
              <motion.div key={i} className="w-2 h-2 bg-indigo-500 rounded-full"
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.15 }} />
            ))}
          </div>
        )}
      </div>

      {/* Transcript */}
      <AnimatePresence mode="wait">
        {transcript && (
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="w-full bg-blue-50 border border-blue-200 rounded-xl p-4"
          >
            <p className="text-xs text-blue-500 font-medium mb-1">You said:</p>
            <p className="text-gray-800 text-sm">{transcript}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Response */}
      <AnimatePresence mode="wait">
        {response && (
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="w-full bg-gradient-to-br from-red-50 to-amber-50 border border-red-200 rounded-xl p-4"
          >
            <p className="text-xs text-red-500 font-medium mb-1">🇳🇵 Nepal Guide:</p>
            <p className="text-gray-800 text-sm leading-relaxed">{response}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mic Button */}
      {!supported ? (
        <div className="text-center text-gray-500 p-4 bg-gray-100 rounded-xl">
          <p>Voice not supported in this browser.</p>
          <p className="text-sm">Please use Chrome or Edge.</p>
        </div>
      ) : (
        <motion.button
          whileTap={{ scale: 0.93 }}
          onClick={isListening ? stopListening : startListening}
          disabled={isThinking || isSpeaking}
          className={`w-24 h-24 rounded-full shadow-2xl flex items-center justify-center transition-all ${
            isListening
              ? "bg-red-500 hover:bg-red-600 ring-4 ring-red-300 ring-offset-2"
              : "bg-gradient-to-br from-red-800 to-amber-700 hover:from-red-900 hover:to-amber-800 disabled:opacity-50"
          }`}
        >
          {isListening
            ? <MicOff className="w-10 h-10 text-white" />
            : <Mic className="w-10 h-10 text-white" />}
        </motion.button>
      )}

      {/* Controls */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleLanguage}
          className="flex items-center gap-2"
        >
          <Globe className="w-4 h-4" />
          {lang === "en" ? "नेपाली" : "English"}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setIsMuted(!isMuted);
            if (!isMuted) synthRef.current?.cancel();
          }}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={resetConversation}
        >
          <RotateCcw className="w-4 h-4" />
        </Button>

        <Badge className={lang === "ne" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}>
          {lang === "en" ? "🇬🇧 English" : "🇳🇵 नेपाली"}
        </Badge>
      </div>

      <p className="text-xs text-gray-400 text-center">
        Tap the mic to ask about Nepal's mountains, trekking, culture & more
      </p>
    </div>
  );
}