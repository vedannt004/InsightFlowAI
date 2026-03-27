"use client";
import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import DashboardLayout from "@/components/DashboardLayout";
import { Send, Sparkles, RotateCcw, Bot } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  { label: "Analyse my sales", prompt: "Analyse my current sales performance and highlight the strongest and weakest areas." },
  { label: "Improve retention", prompt: "How can I improve my customer retention rate and bring back lapsed customers?" },
  { label: "Top product strategy", prompt: "What strategy should I use to maximise revenue from my top performing products?" },
  { label: "Growth opportunities", prompt: "What are the biggest growth opportunities for my business right now?" },
  { label: "Reduce slow sellers", prompt: "How should I deal with my slow-moving products to reduce dead inventory?" },
  { label: "Market trends", prompt: "What market trends should I be aware of in my industry?" },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"} mb-4`}>
      {/* Avatar */}
      {!isUser && (
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center flex-shrink-0 shadow-[0_0_12px_rgba(139,92,246,0.4)] mt-0.5">
          <Sparkles size={14} className="text-white" />
        </div>
      )}
      <div
        className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? "bg-violet-600 text-white rounded-tr-sm shadow-[0_0_20px_rgba(139,92,246,0.3)]"
            : "bg-white/5 border border-white/10 text-slate-200 rounded-tl-sm backdrop-blur-sm"
        }`}
      >
        {msg.content}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-3 mb-4">
      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center flex-shrink-0 shadow-[0_0_12px_rgba(139,92,246,0.4)]">
        <Sparkles size={14} className="text-white" />
      </div>
      <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-violet-400 animate-bounce [animation-delay:0ms]" />
        <span className="w-2 h-2 rounded-full bg-violet-400 animate-bounce [animation-delay:150ms]" />
        <span className="w-2 h-2 rounded-full bg-violet-400 animate-bounce [animation-delay:300ms]" />
      </div>
    </div>
  );
}

export default function ChatPage() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const userName = session?.user?.name?.split(" ")[0] || "there";
  const greeting = getGreeting();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: Message = { role: "user", content: trimmed };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    setShowSuggestions(false);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          history: messages.slice(-6),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setMessages([...newMessages, { role: "assistant", content: data.reply }]);
    } catch (err: any) {
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: "Sorry, I ran into an issue. Please try again in a moment.",
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const resetChat = () => {
    setMessages([]);
    setShowSuggestions(true);
    setInput("");
    inputRef.current?.focus();
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-3rem)] max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.4)]">
              <Bot size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-foreground">AI Business Advisor</h1>
              <p className="text-xs text-muted-foreground">Powered by Gemini · Knows your business data</p>
            </div>
          </div>
          {messages.length > 0 && (
            <button
              onClick={resetChat}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-white/5 border border-border hover:border-violet-500/30 transition-all"
            >
              <RotateCcw size={12} />
              New Chat
            </button>
          )}
        </div>

        {/* Chat area */}
        <div className="flex-1 overflow-y-auto pr-1 scroll-smooth">
          {/* Empty state */}
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center pb-8">
              {/* Star icon */}
              <div className="mb-4 relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 border border-violet-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(139,92,246,0.3)]">
                  <Sparkles size={26} className="text-violet-400" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 animate-pulse" />
              </div>

              <p className="text-sm text-muted-foreground mb-1">{greeting},</p>
              <h2 className="text-3xl font-bold text-foreground mb-1">
                {userName}{" "}
                <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">👋</span>
              </h2>
              <p className="text-2xl font-bold text-foreground mb-2">How can I help you?</p>
              <p className="text-sm text-muted-foreground max-w-md">
                Ask me anything about your business — sales, customers, products, growth strategies, or market trends.
              </p>

              {/* Suggestion chips */}
              {showSuggestions && (
                <div className="mt-8 flex flex-wrap gap-2 justify-center max-w-lg">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s.label}
                      onClick={() => sendMessage(s.prompt)}
                      className="px-4 py-2 rounded-full text-sm bg-white/5 border border-white/10 text-muted-foreground hover:text-foreground hover:bg-violet-500/10 hover:border-violet-500/30 transition-all duration-200 hover:shadow-[0_0_12px_rgba(139,92,246,0.2)]"
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Messages */}
          {messages.map((msg, i) => (
            <MessageBubble key={i} msg={msg} />
          ))}

          {loading && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>

        {/* Input area */}
        <div className="flex-shrink-0 mt-4">
          <div className="relative flex items-end gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 focus-within:border-violet-500/50 focus-within:shadow-[0_0_20px_rgba(139,92,246,0.15)] transition-all">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about your business..."
              rows={1}
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground resize-none outline-none max-h-32 overflow-y-auto leading-relaxed py-0.5"
              style={{ scrollbarWidth: "none" }}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || loading}
              className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-violet-500 flex items-center justify-center text-white shadow-[0_0_15px_rgba(139,92,246,0.4)] hover:shadow-[0_0_20px_rgba(139,92,246,0.6)] disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none transition-all hover:scale-105 active:scale-95 flex-shrink-0"
            >
              <Send size={16} />
            </button>
          </div>
          <p className="text-center text-[11px] text-muted-foreground mt-2">
            Press <kbd className="px-1 py-0.5 rounded bg-white/10 text-[10px]">Enter</kbd> to send · <kbd className="px-1 py-0.5 rounded bg-white/10 text-[10px]">Shift+Enter</kbd> for new line
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
