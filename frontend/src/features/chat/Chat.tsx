import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/src/hooks/useAuth";
import { API_BASE_URL } from "@/src/lib/api";
import { Send, User, Bot, Loader2, Info, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from "react-markdown";
import { db, handleFirestoreError, OperationType } from "@/src/lib/firebase";
import { collection, addDoc, query, orderBy, limit, onSnapshot, serverTimestamp, where } from "firebase/firestore";
import { ChatMessage } from "@/src/types";

export function Chat() {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resetTime, setResetTime] = useState<number>(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load reset time from local storage on mount/user change
  useEffect(() => {
    if (user) {
      const saved = localStorage.getItem(`chat_reset_${user.uid}`);
      setResetTime(saved ? parseInt(saved) : 0);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    
    const q = query(
      collection(db, "users", user.uid, "chats"),
      where("timestamp", ">", new Date(resetTime)),
      orderBy("timestamp", "asc"),
      limit(50)
    );

    return onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ChatMessage[];
      setMessages(msgs);
    }, (error) => {
      console.error("Chat snapshot error:", error);
    });
  }, [user, resetTime]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleReset = () => {
    if (!user || isLoading) return;
    
    if (window.confirm("Clear chat history?")) {
      const now = Date.now();
      // Store locally to avoid any Firestore permission issues
      localStorage.setItem(`chat_reset_${user.uid}`, now.toString());
      setResetTime(now);
      setMessages([]);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !user) return;

    const userMessage = input.trim();
    setInput("");
    setIsLoading(true);

    try {
      // Save user message
      await addDoc(collection(db, "users", user.uid, "chats"), {
        role: "user",
        content: userMessage,
        timestamp: serverTimestamp(),
      });

      // Prepare history
      const chatHistory = messages.map(m => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }]
      }));

      // Call Backend API
      const response = await fetch(`${API_BASE_URL}/chat/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          history: chatHistory,
          user_context: {
            age: profile?.age,
            location: profile?.location,
            registrationStatus: profile?.registrationStatus,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response from server");
      }

      const result = await response.json();
      const botText = result.text || "";

      // Save bot message
      await addDoc(collection(db, "users", user.uid, "chats"), {
        role: "assistant",
        content: botText,
        timestamp: serverTimestamp(),
      });

    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Election Assistant</h1>
          <p className="text-slate-500">Ask anything about the voting process</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            disabled={isLoading || messages.length === 0}
            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium text-sm border border-red-100 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-4 h-4" />
            Reset Chat
          </button>
          <div className="bg-blue-50 text-brand px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium">
            <Info className="w-4 h-4" />
            Powered by Gemini AI
          </div>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-6 pb-4 scroll-smooth"
      >
        {messages.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bot className="text-brand w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold mb-2">How can I help you today?</h3>
            <p className="text-slate-500 max-w-xs mx-auto mb-8">Try asking "How do I register to vote?" or "What is an Epic card?"</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-md mx-auto">
              {[
                "How to register for Voter ID?",
                "Find my polling station",
                "What documents do I need?",
                "Explain NOTA to me"
              ].map((query) => (
                <button
                  key={query}
                  onClick={() => setInput(query)}
                  className="p-4 bg-white border border-slate-200 rounded-2xl text-sm font-medium hover:border-brand hover:text-brand transition-all text-left"
                >
                  {query}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "flex gap-4 max-w-[85%]",
              m.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
            )}
          >
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-1",
              m.role === "user" ? "bg-slate-200" : "bg-brand/10 text-brand"
            )}>
              {m.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>
            <div className={cn(
              "p-4 rounded-2xl",
              m.role === "user" ? "bg-brand text-white" : "bg-white border border-slate-100 shadow-sm"
            )}>
              <div className="prose prose-slate max-w-none">
                <ReactMarkdown>{m.content}</ReactMarkdown>
              </div>
            </div>
          </motion.div>
        ))}
        {isLoading && (
          <div className="flex gap-4 max-w-[85%] mr-auto items-center text-slate-400">
             <div className="w-8 h-8 rounded-lg bg-brand/10 text-brand flex items-center justify-center">
                <Loader2 className="w-4 h-4 animate-spin" />
             </div>
             <span className="text-sm italic">Thinking...</span>
          </div>
        )}
      </div>

      <form 
        onSubmit={handleSend}
        className="mt-4 p-2 bg-white rounded-2xl shadow-xl border border-slate-200 flex gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your question..."
          className="flex-1 bg-transparent px-4 py-3 outline-none"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="bg-brand text-white p-3 rounded-xl disabled:opacity-50 hover:bg-blue-700 transition-colors"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
