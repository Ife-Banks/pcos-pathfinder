import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Send, MessageCircle, ArrowLeft, CheckCircle, Clock } from "lucide-react";
import { apiClient } from "@/services/apiClient";

const POLL_INTERVAL = 5000;

interface Message {
  id: string;
  sender_id: string;
  sender_name: string;
  body: string;
  is_read: boolean;
  created_at: string;
  pending?: boolean;
}

interface Conversation {
  id: string;
  other_user: { id: string | null; full_name: string };
  last_message: string;
  last_message_at: string;
  unread_count: number;
}



const formatTime = (iso: string) => {
  const d = new Date(iso);
  const now = new Date();
  return d.toDateString() === now.toDateString()
    ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
};

export default function PatientMessagesScreen() {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const convIdRef = useRef<string | null>(null);

  const currentUserId = (() => {
  try {
    return JSON.parse(atob(localStorage.getItem("access_token")?.split(".")[1] || ""))?.user_id;
  } catch { return null; }
})();

  const loadConversations = useCallback(async () => {
    try {
      const res = await apiClient.get("/chat/conversations/");
      const data: Conversation[] = Array.isArray(res.data)
        ? res.data
        : res.data?.data || [];
      setConversations(data);
      // Auto-select first conversation
      if (data.length > 0 && !selectedConv) {
        setSelectedConv(data[0]);
      }
    } catch {
      setError("Failed to load messages.");
    } finally {
      setLoading(false);
    }
  }, [selectedConv]);

  const loadMessages = useCallback(async (convId: string) => {
    try {
      const res = await apiClient.get(`/chat/conversations/${convId}/messages/`);
      const data: Message[] = Array.isArray(res.data)
        ? res.data
        : res.data?.data || [];
      setMessages(data);
    } catch {
      // silently fail on poll
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadConversations();
  }, []);

  // Poll messages when conversation selected
  useEffect(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (!selectedConv) return;
    convIdRef.current = selectedConv.id;
    loadMessages(selectedConv.id);
    pollRef.current = setInterval(() => {
      if (convIdRef.current) loadMessages(convIdRef.current);
    }, POLL_INTERVAL);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [selectedConv?.id]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || !selectedConv || sending) return;
    const body = input.trim();
    setInput("");
    setSending(true);

    const tempId = `temp-${Date.now()}`;
    const tempMsg: Message = {
      id: tempId,
      sender_id: currentUserId || "",
      sender_name: "You",
      body,
      is_read: false,
      created_at: new Date().toISOString(),
      pending: true,
    };
    setMessages(prev => [...prev, tempMsg]);

    try {
      const res = await apiClient.post(
        `/chat/patient-conversations/${selectedConv.id}/send/`,
        { body }
      );
      const saved: Message = res.data?.data || res.data;
      setMessages(prev => prev.map(m => m.id === tempId ? { ...saved, pending: false } : m));
    } catch {
      setMessages(prev => prev.filter(m => m.id !== tempId));
      setError("Failed to send message.");
    } finally {
      setSending(false);
    }
  };

  const isOwn = (msg: Message) => String(msg.sender_id) === String(currentUserId);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <MessageCircle className="w-10 h-10 text-teal-500 mx-auto mb-3 animate-pulse" />
          <p className="text-sm text-gray-500">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate("/dashboard")} className="p-1 rounded-full hover:bg-gray-100">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-teal-600" />
          <div>
            <h1 className="text-sm font-semibold text-gray-900">
              {selectedConv ? selectedConv.other_user.full_name || "Care Team" : "Messages"}
            </h1>
            {selectedConv && (
              <p className="text-xs text-teal-600">Your PHC Care Team</p>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="mx-4 mt-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
          {error}
        </div>
      )}

      {conversations.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center px-6">
            <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-500">No messages yet</p>
            <p className="text-xs text-gray-400 mt-1">
              Your care team will reach out once you're registered at a health centre.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Conversation selector (if multiple) */}
          {conversations.length > 1 && (
            <div className="flex gap-2 px-4 py-2 overflow-x-auto border-b border-gray-100 bg-white">
              {conversations.map(conv => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConv(conv)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    selectedConv?.id === conv.id
                      ? "bg-teal-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {conv.other_user.full_name || "Care Team"}
                  {conv.unread_count > 0 && (
                    <span className="ml-1 bg-white text-teal-600 rounded-full px-1 text-[10px] font-bold">
                      {conv.unread_count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            <AnimatePresence initial={false}>
              {messages.map(msg => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.15 }}
                  className={`flex ${isOwn(msg) ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[75%] flex flex-col ${isOwn(msg) ? "items-end" : "items-start"}`}>
                    {!isOwn(msg) && (
                      <span className="text-xs text-gray-400 mb-1 px-1">{msg.sender_name}</span>
                    )}
                    <div className={`px-4 py-2.5 rounded-2xl text-sm ${
                      isOwn(msg)
                        ? "bg-teal-600 text-white rounded-br-sm"
                        : "bg-white text-gray-800 border border-gray-100 rounded-bl-sm shadow-sm"
                    } ${msg.pending ? "opacity-60" : ""}`}>
                      {msg.body}
                    </div>
                    <div className={`flex items-center gap-1 mt-1 px-1 ${isOwn(msg) ? "flex-row-reverse" : ""}`}>
                      <span className="text-xs text-gray-400">{formatTime(msg.created_at)}</span>
                      {isOwn(msg) && (
                        msg.pending
                          ? <Clock className="w-3 h-3 text-gray-300" />
                          : <CheckCircle className="w-3 h-3 text-teal-500" />
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 py-3">
            <div className="flex items-center gap-2 max-w-lg mx-auto">
              <input
                className="flex-1 rounded-full border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-100 bg-gray-50"
                placeholder="Type a message..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                disabled={sending}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || sending}
                className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center disabled:opacity-40 hover:bg-teal-700 transition-colors"
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
