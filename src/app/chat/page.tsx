"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import DashboardLayout from "@/components/DashboardLayout";
import { Send, Sparkles, Plus, Trash2, MessageSquare, Bot } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatSessionMeta {
  _id: string;
  title: string;
  updatedAt: string;
}

const SUGGESTIONS = [
  { label: "Analyse my sales", prompt: "Analyse my current sales performance and highlight the strongest and weakest areas." },
  { label: "Improve retention", prompt: "How can I improve my customer retention rate and bring back lapsed customers?" },
  { label: "Top product strategy", prompt: "What strategy should I use to maximise revenue from my top performing products?" },
  { label: "Growth opportunities", prompt: "What are the biggest growth opportunities for my business right now?" },
  { label: "Reduce slow sellers", prompt: "How should I deal with my slow-moving products to reduce dead inventory?" },
  { label: "Market trends", prompt: "What market trends should I be aware of in my industry?" },
];

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"} mb-4`}>
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
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<ChatSessionMeta[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load session list on mount
  const fetchSessions = useCallback(async () => {
    try {
      const res = await fetch("/api/chat/sessions");
      if (res.ok) {
        const data = await res.json();
        setSessions(data.sessions || []);
      }
    } finally {
      setLoadingSessions(false);
    }
  }, []);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Load a past session
  const loadSession = async (id: string) => {
    try {
      const res = await fetch(`/api/chat/sessions/${id}`);
      if (!res.ok) return;
      const data = await res.json();
      setMessages(
        (data.session.messages || []).map((m: any) => ({
          role: m.role,
          content: m.content,
        }))
      );
      setCurrentSessionId(id);
    } catch {}
  };

  // Start a new chat
  const newChat = () => {
    setMessages([]);
    setCurrentSessionId(null);
    setInput("");
    inputRef.current?.focus();
  };

  // Delete a session
  const deleteSession = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingId(id);
    try {
      await fetch(`/api/chat/sessions/${id}`, { method: "DELETE" });
      setSessions((prev) => prev.filter((s) => s._id !== id));
      if (currentSessionId === id) newChat();
    } finally {
      setDeletingId(null);
    }
  };

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: Message = { role: "user", content: trimmed };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, sessionId: currentSessionId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");

      setMessages([...newMessages, { role: "assistant", content: data.reply }]);

      // Update session tracking
      if (data.sessionId) {
        if (!currentSessionId) {
          // New session created — add to list
          setCurrentSessionId(data.sessionId);
          setSessions((prev) => [
            { _id: data.sessionId, title: data.sessionTitle || trimmed.slice(0, 50), updatedAt: new Date().toISOString() },
            ...prev,
          ]);
        } else {
          // Update updatedAt for existing session
          setSessions((prev) =>
            prev.map((s) =>
              s._id === data.sessionId ? { ...s, updatedAt: new Date().toISOString() } : s
            )
          );
        }
      }
    } catch {
      setMessages([
        ...newMessages,
        { role: "assistant", content: "Sorry, I ran into an issue. Please try again in a moment." },
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

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    const today = new Date();
    const diff = today.getTime() - d.getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  };

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-3rem)] gap-0 -mx-6 -mt-6">

        {/* ── Sessions Sidebar ── */}
        <aside className="w-60 flex-shrink-0 bg-black/20 border-r border-white/5 flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-white/5 flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
              <Bot size={14} className="text-white" />
            </div>
            <span className="text-sm font-bold text-foreground">AI Assistant</span>
          </div>

          {/* New Chat button */}
          <div className="p-3">
            <button
              onClick={newChat}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium bg-violet-600/20 border border-violet-500/30 text-violet-300 hover:bg-violet-600/30 hover:text-white transition-all"
            >
              <Plus size={15} />
              New Chat
            </button>
          </div>

          {/* Sessions list */}
          <div className="flex-1 overflow-y-auto px-2 pb-4">
            {loadingSessions ? (
              <div className="space-y-2 px-1 mt-1">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-9 rounded-lg bg-white/5 animate-pulse" />
                ))}
              </div>
            ) : sessions.length === 0 ? (
              <div className="text-center mt-8 px-3">
                <MessageSquare size={20} className="mx-auto text-muted-foreground mb-2" />
                <p className="text-xs text-muted-foreground">No past chats yet</p>
              </div>
            ) : (
              <>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-2 mb-2 mt-1">
                  Your chats
                </p>
                {sessions.map((s) => (
                  <div
                    key={s._id}
                    onClick={() => loadSession(s._id)}
                    className={`group flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all mb-0.5 ${
                      currentSessionId === s._id
                        ? "bg-violet-600/20 border border-violet-500/30 text-white"
                        : "hover:bg-white/5 border border-transparent text-slate-400 hover:text-white"
                    }`}
                  >
                    <span className="flex-1 text-xs truncate leading-snug">{s.title}</span>
                    <button
                      onClick={(e) => deleteSession(s._id, e)}
                      disabled={deletingId === s._id}
                      className="opacity-0 group-hover:opacity-100 hover:text-red-400 flex-shrink-0 transition-all"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </>
            )}
          </div>
        </aside>

        {/* ── Main Chat Area ── */}
        <div className="flex-1 flex flex-col h-full px-6 py-6">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto pr-1 scroll-smooth">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center pb-8">
                <h2 className="text-3xl font-bold text-foreground mb-4">
                  How can I help you?
                </h2>
                <p className="text-sm text-muted-foreground max-w-md">
                  Ask me anything about your business — sales, customers, products, growth strategies, or market trends.
                </p>
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
              </div>
            ) : (
              <>
                {messages.map((msg, i) => (
                  <MessageBubble key={i} msg={msg} />
                ))}
                {loading && <TypingIndicator />}
                <div ref={bottomRef} />
              </>
            )}
          </div>

          {/* Input */}
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
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
