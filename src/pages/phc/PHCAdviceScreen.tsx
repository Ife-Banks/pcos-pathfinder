import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Send, Search, User, MessageCircle, Wifi, WifiOff, Loader2,
  FileText, X, CheckCircle, Clock, Calendar, Eye,
} from "lucide-react";
import { phcAPI } from "@/services/phcService";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Conversation {
  id: string;
  other_user: { id: string; full_name: string };
  last_message: string;
  last_message_at: string;
  unread_count: number;
  patient_status?: string;
  patient_condition?: string;
}

interface Message {
  id: string;
  sender_id: string;
  sender_name: string;
  body: string;
  is_read: boolean;
  created_at: string;
  pending?: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TEMPLATES: Record<string, { title: string; description: string }[]> = {
  PCOS: [
    { title: "Reduce refined carbohydrates", description: "Cut out white bread, pasta, sugary drinks. Choose whole grains and vegetables." },
    { title: "Regular aerobic exercise", description: "150 minutes per week of moderate intensity activity like brisk walking or cycling." },
    { title: "Consistent sleep schedule", description: "Sleep and wake at the same time every day, even on weekends." },
    { title: "Monthly cycle monitoring", description: "Track your period start date each month using the AI-MSHM app." },
  ],
  Hormonal: [
    { title: "Track night sweats", description: "Note when they occur and how long they last. Share with your care team." },
    { title: "Reduce caffeine after 2pm", description: "Caffeine can disrupt hormonal sleep patterns. Switch to herbal tea." },
    { title: "Magnesium-rich foods", description: "Include spinach, nuts, and seeds to help reduce muscle weakness." },
    { title: "Relaxation techniques", description: "Daily 10-minute breathing exercises can reduce hormonal stress spikes." },
  ],
  Metabolic: [
    { title: "Reduce sodium intake", description: "Target less than 2,300mg per day. Check food labels carefully." },
    { title: "Walk 30 minutes daily", description: "Consistent low-intensity activity helps metabolic regulation." },
    { title: "Log meals for 2 weeks", description: "Keep a food diary to identify blood sugar trigger foods." },
    { title: "Monitor waist circumference", description: "Log it monthly in your AI-MSHM app. Target < 80cm." },
  ],
};

const CONDITION_COLORS: Record<string, string> = {
  PCOS: "bg-purple-100 text-purple-700",
  Hormonal: "bg-blue-100 text-blue-700",
  Metabolic: "bg-green-100 text-green-700",
};

const CONDITION_BORDER_COLORS: Record<string, string> = {
  PCOS: "bg-purple-100 text-purple-700 border-purple-200",
  Hormonal: "bg-blue-100 text-blue-700 border-blue-200",
  Metabolic: "bg-green-100 text-green-700 border-green-200",
};

const CONDITION_BADGE_COLORS: Record<string, string> = {
  PCOS: "bg-purple-500",
  Hormonal: "bg-blue-500",
  Metabolic: "bg-green-500",
};

const WS_BASE = (import.meta as any).env?.VITE_WS_URL || "ws://127.0.0.1:8000";
const POLL_INTERVAL = 5000;

// ─── Main Component ───────────────────────────────────────────────────────────

// Refs for main component to control ChatTab cleanup
const wsRef = { current: null as WebSocket | null };
const pollRef = { current: null as ReturnType<typeof setInterval> | null };
const convListPollRef = { current: null as ReturnType<typeof setInterval> | null };

export default function PHCAdviceScreen() {
  const [activeTab, setActiveTab] = useState<"chat" | "advice">("chat");

  const handleTabChange = (key: "chat" | "advice") => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    if (convListPollRef.current) {
      clearInterval(convListPollRef.current);
      convListPollRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setActiveTab(key);
  };

  return (
    <>
      {/* Tab Bar */}
      <div className="bg-white border-b border-gray-200 px-6 flex gap-0">
        {([
          { key: "chat", label: "Messages", icon: MessageCircle },
          { key: "advice", label: "Send Advice", icon: Send },
        ] as const).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => handleTabChange(key)}
            className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === key
                ? "border-[#2E8B57] text-[#2E8B57]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {activeTab === "chat" ? <ChatTab wsRef={wsRef} pollRef={pollRef} convListPollRef={convListPollRef} /> : <AdviceTab />}
    </>
  );
}

// ─── Chat Tab ─────────────────────────────────────────────────────────────────

interface ChatTabProps {
  wsRef: React.MutableRefObject<WebSocket | null>;
  pollRef: React.MutableRefObject<ReturnType<typeof setInterval> | null>;
  convListPollRef: React.MutableRefObject<ReturnType<typeof setInterval> | null>;
}

function ChatTab({ wsRef, pollRef, convListPollRef }: ChatTabProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sending, setSending] = useState(false);
  const [wsStatus, setWsStatus] = useState<"connecting" | "live" | "offline">("offline");
  const [showTemplates, setShowTemplates] = useState(false);
  const [templateTab, setTemplateTab] = useState("PCOS");
  const [error, setError] = useState("");

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const currentConvIdRef = useRef<string | null>(null);

  const currentUserId = (() => {
    try { return JSON.parse(atob(localStorage.getItem("access_token")?.split(".")[1] || ""))?.user_id; }
    catch { return null; }
  })();

  const updateAndSortConversations = (convId: string, updates: Partial<Conversation>) => {
    setConversations(prev => {
      const next = prev.map(c => c.id === convId ? { ...c, ...updates } : c);
      return [...next].sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime());
    });
  };

  const loadConversations = useCallback(async () => {
    try {
      const res = await phcAPI.getPHCConversations();
      const data: Conversation[] = Array.isArray(res) ? res : (res?.data || []);
      const sorted = [...data].sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime());
      setConversations(sorted);
      setFilteredConversations(sorted);
    } catch {
      setError("Failed to load conversations.");
    } finally {
      setLoadingConvs(false);
    }
  }, []);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  useEffect(() => {
    convListPollRef.current = setInterval(() => {
      loadConversations();
    }, 10000);
    return () => { if (convListPollRef.current) clearInterval(convListPollRef.current); };
  }, [loadConversations]);

  useEffect(() => {
    const q = search.toLowerCase();
    setFilteredConversations(
      q ? conversations.filter(c => c.other_user.full_name.toLowerCase().includes(q)) : conversations
    );
  }, [search, conversations]);

  const loadMessages = useCallback(async (convId: string) => {
    setLoadingMsgs(true);
    try {
      const res = await phcAPI.getPHCMessages(convId);
      const data: Message[] = Array.isArray(res) ? res : (res?.data || []);
      setMessages([...data].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    } catch {
      setMessages([]);
    } finally {
      setLoadingMsgs(false);
    }
  }, []);

  const startPolling = (convId: string) => {
    setWsStatus("offline");
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      if (currentConvIdRef.current !== convId) return;
      try {
        const res = await phcAPI.getPHCMessages(convId);
        const data: Message[] = Array.isArray(res) ? res : (res?.data || []);
        setMessages([...data].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
      } catch {}
    }, POLL_INTERVAL);
  };

  const connectWS = useCallback((convId: string) => {
    if (wsRef.current) { wsRef.current.close(); wsRef.current = null; }
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    const token = localStorage.getItem("access_token");
    setWsStatus("connecting");
    try {
      const ws = new WebSocket(`${WS_BASE}/ws/chat/${convId}/?token=${token}`);
      wsRef.current = ws;
      ws.onopen = () => { setWsStatus("live"); if (pollRef.current) clearInterval(pollRef.current); pollRef.current = setInterval(async () => { if (currentConvIdRef.current !== convId) return; try { const res = await phcAPI.getPHCMessages(convId); const data: Message[] = Array.isArray(res) ? res : (res?.data || []); setMessages(data); } catch {} }, POLL_INTERVAL); };
      ws.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data.type === "chat_message" && data.conversation_id === convId) {
            const msg: Message = {
              id: data.message_id || `ws-${Date.now()}`,
              sender_id: data.sender_id,
              sender_name: data.sender_name || "Unknown",
              body: data.message,
              is_read: false,
              created_at: data.timestamp || new Date().toISOString(),
            };
            setMessages(prev => prev.some(m => m.id === msg.id) ? prev : [...prev.filter(m => !m.pending), msg]);
            updateAndSortConversations(convId, { last_message: data.message, last_message_at: msg.created_at, unread_count: 0 });
          }
        } catch {}
      };
      ws.onerror = () => startPolling(convId);
      ws.onclose = () => { setWsStatus("offline"); startPolling(convId); };
    } catch { startPolling(convId); }
  }, []);

  const selectConversation = (conv: Conversation) => {
    setSelectedConv(conv);
    currentConvIdRef.current = conv.id;
    setMessages([]);
    setError("");
    setShowTemplates(false);
    loadMessages(conv.id);
    connectWS(conv.id);
    setConversations(prev => prev.map(c => c.id === conv.id ? { ...c, unread_count: 0 } : c));
  };

  const sendMessage = async () => {
    if (!input.trim() || !selectedConv || sending) return;
    const body = input.trim();
    setInput("");
    setSending(true);
    const tempId = `pending-${Date.now()}`;
    const optimistic: Message = {
      id: tempId, sender_id: currentUserId, sender_name: "You",
      body, is_read: false, created_at: new Date().toISOString(), pending: true,
    };
    setMessages(prev => [...prev, optimistic]);

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ action: "send_message", body: body }));
      setMessages(prev => prev.map(m => m.id === tempId ? { ...m, pending: false } : m));
      updateAndSortConversations(selectedConv.id, { last_message: body, last_message_at: new Date().toISOString() });
      setSending(false);
      return;
    }
    try {
      const res = await phcAPI.sendPHCMessage(selectedConv.id, body);
      const saved: Message = res?.data || { ...optimistic, id: `http-${Date.now()}`, pending: false };
      setMessages(prev => prev.map(m => m.id === tempId ? { ...saved, pending: false } : m));
      updateAndSortConversations(selectedConv.id, { last_message: body, last_message_at: saved.created_at });
    } catch {
      setMessages(prev => prev.filter(m => m.id !== tempId));
      setError("Failed to send. Try again.");
    } finally { setSending(false); }
  };

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  useEffect(() => () => { wsRef.current?.close(); if (pollRef.current) clearInterval(pollRef.current); if (convListPollRef.current) clearInterval(convListPollRef.current); }, []);

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    return d.toDateString() === now.toDateString()
      ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  };
  const isOwn = (msg: Message) => String(msg.sender_id) === String(currentUserId);

  return (
    <div className="flex h-[calc(100vh-7.5rem)] overflow-hidden bg-gray-50">
      {/* Left: conversation list */}
      <div className="w-80 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-3 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search patients..."
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-gray-50 border border-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E8B57]/20 focus:border-[#2E8B57]"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loadingConvs ? (
            <div className="flex items-center justify-center h-32"><Loader2 className="w-5 h-5 animate-spin text-gray-300" /></div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-6 text-center text-gray-400 text-sm">No patients found</div>
          ) : filteredConversations.map(conv => (
            <button
              key={conv.id}
              onClick={() => selectConversation(conv)}
              className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors flex items-start gap-3 ${
                selectedConv?.id === conv.id ? "bg-[#2E8B57]/5 border-l-2 border-l-[#2E8B57]" : ""
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-[#2E8B57]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <User className="w-5 h-5 text-[#2E8B57]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-900 truncate">{conv.other_user.full_name}</p>
                  <span className="text-xs text-gray-400 flex-shrink-0 ml-1">
                    {conv.last_message_at ? formatTime(conv.last_message_at) : ""}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-0.5">
                  <p className="text-xs text-gray-400 truncate max-w-[160px]">{conv.last_message || "No messages yet"}</p>
                  {conv.unread_count > 0 && (
                    <span className="bg-[#2E8B57] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                      {conv.unread_count}
                    </span>
                  )}
                </div>
                {conv.patient_condition && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full mt-1 inline-block ${CONDITION_COLORS[conv.patient_condition] || "bg-gray-100 text-gray-500"}`}>
                    {conv.patient_condition}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right: chat */}
      {selectedConv ? (
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 px-5 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#2E8B57]/10 flex items-center justify-center">
                <User className="w-4 h-4 text-[#2E8B57]" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{selectedConv.other_user.full_name}</p>
                {selectedConv.patient_condition && (
                  <span className={`text-xs px-2 py-0.5 rounded-full ${CONDITION_COLORS[selectedConv.patient_condition] || "bg-gray-100 text-gray-500"}`}>
                    {selectedConv.patient_condition}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full ${
                wsStatus === "live" ? "bg-green-50 text-green-600" :
                wsStatus === "connecting" ? "bg-yellow-50 text-yellow-600" :
                "bg-gray-100 text-gray-500"
              }`}>
                {wsStatus === "live" ? <Wifi className="w-3 h-3" /> :
                 wsStatus === "connecting" ? <Loader2 className="w-3 h-3 animate-spin" /> :
                 <WifiOff className="w-3 h-3" />}
                {wsStatus === "live" ? "Live" : wsStatus === "connecting" ? "Connecting" : "Polling"}
              </span>
              <Button variant="outline" size="sm" onClick={() => setShowTemplates(v => !v)} className="text-xs gap-1">
                <FileText className="w-3.5 h-3.5" />
                Templates
              </Button>
            </div>
          </div>

          {error && (
            <Alert className="mx-4 mt-2 bg-red-50 border-red-200 flex-shrink-0">
              <AlertDescription className="text-red-700 text-sm flex items-center justify-between">
                {error}
                <button onClick={() => setError("")}><X className="w-4 h-4" /></button>
              </AlertDescription>
            </Alert>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
            {loadingMsgs ? (
              <div className="flex justify-center items-center h-full"><Loader2 className="w-5 h-5 animate-spin text-gray-300" /></div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <MessageCircle className="w-10 h-10 mb-2 opacity-30" />
                <p className="text-sm">No messages yet. Say hello!</p>
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {messages.map(msg => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.15 }}
                    className={`flex ${isOwn(msg) ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`max-w-[70%] flex flex-col ${isOwn(msg) ? "items-end" : "items-start"}`}>
                      {!isOwn(msg) && <span className="text-xs text-gray-400 mb-1 px-1">{msg.sender_name}</span>}
                      <div className={`px-4 py-2.5 rounded-2xl text-sm ${
                        isOwn(msg)
                          ? "bg-[#2E8B57] text-white rounded-br-sm"
                          : "bg-white text-gray-800 border border-gray-100 rounded-bl-sm shadow-sm"
                      } ${msg.pending ? "opacity-60" : ""}`}>
                        {msg.body}
                      </div>
                      <div className={`flex items-center gap-1 mt-1 px-1 ${isOwn(msg) ? "flex-row-reverse" : ""}`}>
                        <span className="text-xs text-gray-400">{formatTime(msg.created_at)}</span>
                        {isOwn(msg) && (msg.pending
                          ? <Clock className="w-3 h-3 text-gray-300" />
                          : <CheckCircle className="w-3 h-3 text-[#2E8B57]" />
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Templates panel */}
          <AnimatePresence>
            {showTemplates && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="bg-white border-t border-gray-100 overflow-hidden flex-shrink-0"
              >
                <div className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex gap-2">
                      {Object.keys(TEMPLATES).map(tab => (
                        <button
                          key={tab}
                          onClick={() => setTemplateTab(tab)}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                            templateTab === tab ? "bg-[#2E8B57] text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                          }`}
                        >{tab}</button>
                      ))}
                    </div>
                    <button onClick={() => setShowTemplates(false)}><X className="w-4 h-4 text-gray-400" /></button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto">
                    {TEMPLATES[templateTab].map((t, i) => (
                      <button
                        key={i}
                        onClick={() => { setInput(`${t.title}. ${t.description}`); setShowTemplates(false); }}
                        className="text-left p-2.5 rounded-lg border border-gray-100 hover:border-[#2E8B57]/30 hover:bg-[#2E8B57]/5 transition-all"
                      >
                        <p className="text-xs font-semibold text-gray-800">{t.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{t.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input */}
          <div className="bg-white border-t border-gray-200 px-4 py-3 flex items-end gap-3 flex-shrink-0">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value.slice(0, 500))}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              placeholder="Type a message... (Enter to send)"
              rows={1}
              className="flex-1 resize-none rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E8B57]/20 focus:border-[#2E8B57] min-h-[42px] max-h-[120px]"
              onInput={e => {
                const el = e.target as HTMLTextAreaElement;
                el.style.height = "auto";
                el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
              }}
            />
            <Button
              onClick={sendMessage}
              disabled={!input.trim() || sending}
              className="bg-[#2E8B57] hover:bg-[#236F47] text-white rounded-xl h-10 w-10 p-0 flex-shrink-0"
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center text-gray-400">
            <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-25" />
            <p className="font-medium text-gray-500">Select a patient to start messaging</p>
            <p className="text-sm mt-1">All registered patients appear here, even after transfer</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Advice (Quick Message) Tab ───────────────────────────────────────────────

function AdviceTab() {
  const [activeCondition, setActiveCondition] = useState<"PCOS" | "Hormonal" | "Metabolic">("PCOS");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [message, setMessage] = useState("");
  const [followupDate, setFollowupDate] = useState("");
  const [sentMessages, setSentMessages] = useState<any[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => { fetchSentMessages(); }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowDropdown(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchQuery.length >= 2) {
      const timer = setTimeout(() => searchPatients(searchQuery), 300);
      return () => clearTimeout(timer);
    } else { setSearchResults([]); setShowDropdown(false); }
  }, [searchQuery]);

  const searchPatients = async (query: string) => {
    try {
      const data = await phcAPI.getQueue({});
      const all = Array.isArray(data) ? data : (data?.data?.results || data?.data || []);
      const q = query.toLowerCase();
      const filtered = all.filter((r: any) =>
        r.patient?.full_name?.toLowerCase().includes(q) || r.patient?.id?.toLowerCase().includes(q)
      );
      setSearchResults(filtered);
      setShowDropdown(true);
    } catch {}
  };

  const fetchSentMessages = async () => {
    try {
      const data = await phcAPI.getRecentAdvice(10);
      const msgs = Array.isArray(data) ? data : (data?.data?.results || data?.data || []);
      setSentMessages([...msgs].sort((a, b) => new Date(b.created_at || b.sent_at).getTime() - new Date(a.created_at || a.sent_at).getTime()));
    } catch {}
  };

  const selectTemplate = (template: { title: string; description: string }) => {
    setMessage(`${template.title}. ${template.description}`);
  };

  const selectPatient = (patient: any) => {
    setSelectedPatient(patient);
    setSearchQuery("");
    setShowDropdown(false);
    if (patient.conditions?.length > 0) {
      const c = patient.conditions[0].toLowerCase();
      setActiveCondition(c === "pcos" ? "PCOS" : c === "hormonal" ? "Hormonal" : "Metabolic");
    }
  };

  const setFollowupWeeks = (weeks: number) => {
    const d = new Date();
    d.setDate(d.getDate() + weeks * 7);
    setFollowupDate(d.toISOString().split("T")[0]);
  };

  const sendAdvice = async () => {
    if (!selectedPatient) { setError("Please select a patient first."); return; }
    if (!message.trim()) { setError("Please enter a message."); return; }
    setError(""); setIsSending(true);
    try {
      const body = await phcAPI.sendAdvice({
        queue_record_id: selectedPatient.id,
        condition: activeCondition.toLowerCase(),
        message: message.trim(),
        followup_date: followupDate || null,
      });
      if (body?.status === "success" || body?.id) {
        setSentMessages(prev => [
          { ...body, patient_name: selectedPatient.patient?.full_name || selectedPatient.name },
          ...prev,
        ]);
        setMessage(""); setFollowupDate(""); setSelectedPatient(null);
        setToast("Advice sent ✓");
        setTimeout(() => setToast(""), 3000);
      } else { setError(body?.message || "Failed to send advice."); }
    } catch { setError("Network error. Please try again."); }
    finally { setIsSending(false); }
  };

  const formatDate = (s: string) =>
    new Date(s).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="p-6 max-w-7xl mx-auto overflow-y-auto h-[calc(100vh-7.5rem)]">
      {toast && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="fixed top-4 right-4 z-50">
          <Alert className="bg-green-50 border-green-200">
            <AlertDescription className="text-green-700 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" /> {toast}
            </AlertDescription>
          </Alert>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Templates column */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#2E8B57]" />
              Advice Templates
            </h2>
            <div className="flex gap-2 mb-4">
              {(["PCOS", "Hormonal", "Metabolic"] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveCondition(tab)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    activeCondition === tab ? "bg-[#2E8B57] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >{tab}</button>
              ))}
            </div>
            <div className="space-y-2">
              {TEMPLATES[activeCondition].map((t, i) => (
                <div
                  key={i}
                  onClick={() => selectTemplate(t)}
                  className="bg-white rounded-xl border border-gray-100 p-3 cursor-pointer hover:shadow-sm hover:border-[#2E8B57]/30 transition-all"
                >
                  <p className="font-medium text-gray-900 text-sm">{t.title}</p>
                  <p className="text-gray-500 text-sm mt-1">{t.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Composer column */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Send className="w-5 h-5 text-[#2E8B57]" />
              Message Composer
            </h2>

            {/* Patient search */}
            <div className="mb-4" ref={searchRef}>
              <Label className="text-sm font-medium text-gray-700">Select Patient</Label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search patient by name or ID..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
                {showDropdown && searchResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white rounded-lg border border-gray-200 shadow-lg max-h-48 overflow-y-auto">
                    {searchResults.map(p => (
                      <div
                        key={p.id}
                        onClick={() => selectPatient(p)}
                        className="p-3 hover:bg-gray-50 cursor-pointer flex items-center gap-3 border-b border-gray-100 last:border-0"
                      >
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium">{p.patient?.full_name || p.name}</span>
                        {(p.conditions || []).map((c: string) => (
                          <Badge key={c} className={`${CONDITION_BADGE_COLORS[c] || "bg-gray-500"} text-white text-xs`}>{c}</Badge>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Selected patient card */}
            {selectedPatient && (
              <Card className="mb-4 border-[#2E8B57]/20 bg-[#2E8B57]/5">
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#2E8B57]/10 flex items-center justify-center">
                      <User className="w-5 h-5 text-[#2E8B57]" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{selectedPatient.patient?.full_name || selectedPatient.name}</p>
                      <div className="flex gap-1 mt-1">
                        {(selectedPatient.conditions || []).map((c: string) => (
                          <Badge key={c} className={`${CONDITION_BADGE_COLORS[c] || "bg-gray-500"} text-white text-xs`}>{c}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Condition selector */}
            <div className="mb-4">
              <Label className="text-sm font-medium text-gray-700">Condition Track</Label>
              <div className="flex gap-2 mt-1">
                {(["PCOS", "Hormonal", "Metabolic"] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveCondition(tab)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      activeCondition === tab ? CONDITION_BORDER_COLORS[tab] : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >{tab}</button>
                ))}
              </div>
            </div>

            {/* Message textarea */}
            <div className="mb-4">
              <Label className="text-sm font-medium text-gray-700">Message</Label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value.slice(0, 500))}
                placeholder="Type your health advice message..."
                className="mt-1 w-full rounded-lg border border-gray-200 p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#2E8B57]/20 focus:border-[#2E8B57]"
                rows={4}
              />
              <p className="text-xs text-gray-400 mt-1 text-right">{message.length} / 500</p>
            </div>

            {/* Follow-up */}
            <div className="mb-4">
              <Label className="text-sm font-medium text-gray-700">Schedule a follow-up check-in?</Label>
              <div className="mt-2 flex flex-wrap gap-3 items-center">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <Input type="date" value={followupDate} onChange={e => setFollowupDate(e.target.value)} className="w-40 text-sm" />
                </div>
                <div className="flex gap-2">
                  {[1, 2, 4].map(w => (
                    <Button key={w} variant="outline" size="sm" onClick={() => setFollowupWeeks(w)} className="text-xs">
                      {w} week{w > 1 ? "s" : ""}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {error && (
              <Alert className="mb-4 bg-red-50 border-red-200">
                <AlertDescription className="text-red-700 text-sm">{error}</AlertDescription>
              </Alert>
            )}

            <Button
              onClick={sendAdvice}
              disabled={isSending || !selectedPatient || !message.trim()}
              className="w-full bg-[#2E8B57] hover:bg-[#236F47] text-white"
            >
              <Send className="w-4 h-4 mr-2" />
              {isSending ? "Sending..." : "Send to Patient App"}
            </Button>
          </div>
        </div>
      </div>

      {/* Sent messages table */}
      <div className="mt-6">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Eye className="w-5 h-5 text-[#2E8B57]" />
            Recent Messages
            <Badge className="bg-[#2E8B57] text-white">{sentMessages.length}</Badge>
          </h2>
          {sentMessages.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">No messages sent yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    {["Patient", "Condition", "Date", "Message", "Status", "Follow-up"].map(h => (
                      <th key={h} className="text-left py-3 px-2 font-medium text-gray-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sentMessages.map((msg, i) => (
                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 px-2 font-medium text-gray-900">{msg.patient_name || msg.patient?.name || "—"}</td>
                      <td className="py-3 px-2">
                        <Badge className={`${CONDITION_BORDER_COLORS[msg.condition] || "bg-gray-100"} text-xs`}>{msg.condition}</Badge>
                      </td>
                      <td className="py-3 px-2 text-gray-500">
                        {msg.sent_at || msg.created_at ? formatDate(msg.sent_at || msg.created_at) : "—"}
                      </td>
                      <td className="py-3 px-2 text-gray-600 max-w-xs truncate">
                        {msg.message?.slice(0, 60)}{msg.message?.length > 60 ? "..." : ""}
                      </td>
                      <td className="py-3 px-2">
                        <Badge className="bg-green-100 text-green-700 border border-green-200 text-xs">
                          <CheckCircle className="w-3 h-3 mr-1" /> Delivered
                        </Badge>
                      </td>
                      <td className="py-3 px-2 text-gray-500">{msg.followup_date ? formatDate(msg.followup_date) : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}



