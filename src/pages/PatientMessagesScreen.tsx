import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Send, MessageCircle, ArrowLeft, CheckCircle, Clock, Archive, MoreVertical } from "lucide-react";
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
  status?: "active" | "archived";
  patient_status?: string;
  patient_condition?: string;
}

const formatTime = (iso: string) => {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
};

const formatMessageTime = (iso: string) => {
  const d = new Date(iso);
  const now = new Date();
  return d.toDateString() === now.toDateString()
    ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
};

const PHC_COLORS = [
  "#7B68EE",
  "#FF6B6B",
  "#4ECDC4",
  "#FFBE0B",
  "#8338EC",
  "#FB5607",
  "#06D6A0",
  "#118AB2",
];

const getPhcColor = (name: string) => {
  return PHC_COLORS[name.charCodeAt(0) % PHC_COLORS.length];
};

const getPhcInitials = (name: string) => {
  if (!name || name === "Care Team") return "PHC";
  const parts = name.split(" ");
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.substring(0, Math.min(2, name.length)).toUpperCase();
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
      if (data.length > 0 && !selectedConv) {
        setSelectedConv(data[0]);
      }
    } catch {
      setError("Failed to load conversations.");
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

  useEffect(() => {
    loadConversations();
  }, []);

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
      loadConversations();
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
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar - PHC Conversation List (Instagram DMs style) */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Sidebar Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/dashboard")}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-600"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <MessageCircle className="w-5 h-5 text-teal-600" />
            <h1 className="text-base font-semibold text-gray-900">Messages</h1>
          </div>
          <p className="text-xs text-gray-500 mt-2 pl-9">
            {conversations.length} {conversations.length === 1 ? "conversation" : "conversations"}
          </p>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full px-4 text-center">
              <MessageCircle className="w-10 h-10 text-gray-300 mb-2" />
              <p className="text-sm font-medium text-gray-500">No conversations</p>
              <p className="text-xs text-gray-400 mt-1">
                You'll see your health centres here once registered.
              </p>
            </div>
          ) : (
            <div className="py-2">
              {conversations.map((conv) => {
                const isSelected = selectedConv?.id === conv.id;
                const isArchived = conv.status === "archived";
                const phcColor = getPhcColor(conv.other_user.full_name);

                return (
                  <div
                    key={conv.id}
                    onClick={() => setSelectedConv(conv)}
                    className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-teal-50 border-l-2 border-teal-600"
                        : "hover:bg-gray-50 border-l-2 border-transparent"
                    }`}
                  >
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: phcColor }}
                      >
                        <span className="text-white font-bold text-sm">
                          {getPhcInitials(conv.other_user.full_name)}
                        </span>
                      </div>
                      {/* Unread badge */}
                      {conv.unread_count > 0 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-[10px] font-bold">
                            {conv.unread_count > 9 ? "9+" : conv.unread_count}
                          </span>
                        </div>
                      )}
                      {/* Archived indicator */}
                      {isArchived && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center ring-2 ring-white">
                          <Archive className="w-2.5 h-2.5 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Conversation Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-sm font-medium truncate ${
                            isSelected ? "text-gray-900" : "text-gray-800"
                          }`}
                        >
                          {conv.other_user.full_name}
                        </span>
                        <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                          {formatTime(conv.last_message_at)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-0.5">
                        <p className="text-xs text-gray-500 truncate flex-1">
                          {conv.last_message || "No messages yet"}
                        </p>
                        {isArchived && (
                          <span className="ml-2 text-[10px] text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded flex-shrink-0">
                            Archived
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right Side - Active Chat */}
      <div className="flex-1 flex flex-col">
        {selectedConv ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: getPhcColor(selectedConv.other_user.full_name) }}
              >
                <span className="text-white font-bold text-xs">
                  {getPhcInitials(selectedConv.other_user.full_name)}
                </span>
              </div>
              <div className="flex-1">
                <h2 className="text-sm font-semibold text-gray-900">
                  {selectedConv.other_user.full_name}
                </h2>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      selectedConv.status === "archived" ? "bg-orange-500" : "bg-green-500"
                    }`}
                  />
                  <span
                    className={`text-xs ${
                      selectedConv.status === "archived" ? "text-orange-500" : "text-green-500"
                    }`}
                  >
                    {selectedConv.status === "archived" ? "Archived" : "Active"}
                  </span>
                  {selectedConv.patient_condition && (
                    <>
                      <span className="text-gray-300">•</span>
                      <span className="text-xs text-gray-500 capitalize">
                        {selectedConv.patient_condition}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {error && (
              <div className="mx-6 mt-3 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                {error}
              </div>
            )}

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-1 bg-gray-50">
              {selectedConv.status === "archived" && (
                <div className="mx-auto max-w-md bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 mb-4 text-center">
                  <Archive className="w-4 h-4 text-orange-500 mx-auto mb-1" />
                  <p className="text-xs text-orange-700">
                    This conversation is archived. Sending a message will reactivate it.
                  </p>
                </div>
              )}

              <AnimatePresence initial={false}>
                {messages.map((msg, index) => {
                  const showDateSeparator =
                    index === 0 ||
                    new Date(messages[index - 1].created_at).toDateString() !==
                      new Date(msg.created_at).toDateString();

                  return (
                    <div key={msg.id}>
                      {showDateSeparator && (
                        <div className="flex items-center gap-3 my-4">
                          <div className="flex-1 h-px bg-gray-200" />
                          <span className="text-xs text-gray-400 font-medium">
                            {new Date(msg.created_at).toDateString() === new Date().toDateString()
                              ? "Today"
                              : new Date(msg.created_at).toDateString() === new Date(Date.now() - 86400000).toDateString()
                              ? "Yesterday"
                              : new Date(msg.created_at).toLocaleDateString("en-GB", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                          </span>
                          <div className="flex-1 h-px bg-gray-200" />
                        </div>
                      )}
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.15 }}
                        className={`flex ${isOwn(msg) ? "justify-end" : "justify-start"}`}
                      >
                        <div className={`max-w-[65%] flex flex-col ${isOwn(msg) ? "items-end" : "items-start"}`}>
                          {!isOwn(msg) && (
                            <span className="text-xs text-gray-400 mb-1 px-1">
                              {msg.sender_name}
                            </span>
                          )}
                          <div
                            className={`px-4 py-2.5 rounded-2xl text-sm ${
                              isOwn(msg)
                                ? "bg-teal-600 text-white rounded-br-sm"
                                : "bg-white text-gray-800 border border-gray-100 rounded-bl-sm shadow-sm"
                            } ${msg.pending ? "opacity-60" : ""}`}
                          >
                            {msg.body}
                          </div>
                          <div
                            className={`flex items-center gap-1 mt-1 px-1 ${
                              isOwn(msg) ? "flex-row-reverse" : ""
                            }`}
                          >
                            <span className="text-xs text-gray-400">
                              {formatMessageTime(msg.created_at)}
                            </span>
                            {isOwn(msg) && (
                              msg.pending ? (
                                <Clock className="w-3 h-3 text-gray-300" />
                              ) : (
                                <CheckCircle className="w-3 h-3 text-teal-500" />
                              )
                            )}
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  );
                })}
              </AnimatePresence>
              <div ref={bottomRef} />
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 px-6 py-4">
              <div className="flex items-center gap-3">
                <input
                  className="flex-1 rounded-full border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-100 bg-gray-50"
                  placeholder="Type a message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  disabled={sending}
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || sending}
                  className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center disabled:opacity-40 hover:bg-teal-700 transition-colors"
                >
                  {sending ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 text-white" />
                  )}
                </button>
              </div>
            </div>
          </>
        ) : (
          /* No conversation selected */
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-base font-medium text-gray-500">Select a conversation</p>
              <p className="text-sm text-gray-400 mt-1">
                Choose a health centre from the list to start chatting
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}