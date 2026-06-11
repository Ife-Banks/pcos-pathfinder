import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Send, Search, MessageSquare, AlertTriangle, CheckCheck, Wifi, WifiOff
} from "lucide-react";
import { clinicianAPI } from "@/services/clinicianService";

const WS_BASE = import.meta.env.VITE_API_BASE_URL
  ? import.meta.env.VITE_API_BASE_URL
      .replace('https://', 'wss://')
      .replace('http://', 'ws://')
      .replace('/api/v1', '')
  : 'wss://ai-mshm-backend-d47t.onrender.com';

interface OtherUser {
  id: string;
  full_name: string;
}

interface Conversation {
  id: string;
  other_user: OtherUser;
  last_message: string;
  last_message_at: string;
  unread_count: number;
}

interface Message {
  id: string;
  sender_id: string;
  sender_name: string;
  body: string;
  is_read: boolean;
  created_at: string;
}

const initials = (name: string) =>
  name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

const formatTime = (ts: string) => {
  if (!ts) return '';
  const date = new Date(ts);
  const diffH = (Date.now() - date.getTime()) / 3_600_000;
  if (diffH < 1) return 'Just now';
  if (diffH < 24) return `${Math.floor(diffH)}h ago`;
  if (diffH < 48) return 'Yesterday';
  return date.toLocaleDateString();
};

const ClinicianCommunicationScreen = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [input, setInput] = useState('');
  const [wsStatus, setWsStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');

  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUserId = useRef<string | null>(null);

  // Get current user id from token
  useEffect(() => {
    try {
      const token = localStorage.getItem('access_token');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        currentUserId.current = String(payload.user_id);
      }
    } catch {}
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => { scrollToBottom(); }, [messages]);

  // Fetch conversation list
  const fetchConversations = async () => {
    try {
      setLoadingConvs(true);
      setError(null);
      const res = await clinicianAPI.getChatConversations();
      setConversations(res.data || []);
    } catch {
      setError('Failed to load conversations.');
    } finally {
      setLoadingConvs(false);
    }
  };

  useEffect(() => { fetchConversations(); }, []);

  // Fetch message history
  const fetchMessages = async (convId: string) => {
    try {
      setLoadingMsgs(true);
      const res = await clinicianAPI.getChatMessages(convId);
      setMessages(res.data || []);
    } catch {
      setError('Failed to load messages.');
    } finally {
      setLoadingMsgs(false);
    }
  };

  // Connect WebSocket
  const connectWS = useCallback((convId: string) => {
    // Close existing
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    const token = localStorage.getItem('access_token');
    if (!token) return;

    setWsStatus('connecting');
    const url = `${WS_BASE}/ws/chat/${convId}/?token=${token}`;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      setWsStatus('connected');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'chat_message') {
          const msg: Message = data.message;
          setMessages(prev => {
            // Avoid duplicates
            if (prev.some(m => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
          // Update conversation last message preview
          setConversations(prev =>
            prev.map(c =>
              c.id === convId
                ? { ...c, last_message: msg.body, last_message_at: msg.created_at, unread_count: 0 }
                : c
            )
          );
        }
      } catch {}
    };

    ws.onclose = () => {
      setWsStatus('disconnected');
    };

    ws.onerror = () => {
      setWsStatus('disconnected');
      setError('WebSocket connection failed. Messages may be delayed.');
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      wsRef.current?.close();
    };
  }, []);

  const handleSelectConversation = (conv: Conversation) => {
    setSelectedConv(conv);
    setMessages([]);
    setError(null);
    fetchMessages(conv.id);
    connectWS(conv.id);
    // Mark as read locally
    setConversations(prev =>
      prev.map(c => c.id === conv.id ? { ...c, unread_count: 0 } : c)
    );
  };

  const handleSend = () => {
    const body = input.trim();
    if (!body || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      if (wsRef.current?.readyState !== WebSocket.OPEN) {
        setError('Not connected. Please wait or reselect the conversation.');
      }
      return;
    }
    wsRef.current.send(JSON.stringify({ action: 'send_message', body }));
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const filtered = conversations.filter(c =>
    c.other_user.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalUnread = conversations.reduce((n, c) => n + c.unread_count, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
              <p className="text-sm text-gray-500">Chat with your patients</p>
            </div>
            {totalUnread > 0 && (
              <Badge className="bg-red-500 text-white">{totalUnread} unread</Badge>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-180px)]">
          {/* Left — conversation list */}
          <div className="lg:col-span-1 flex flex-col gap-3 overflow-hidden">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search patients..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2">
              {loadingConvs ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
                </div>
              ) : filtered.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <MessageSquare className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">No conversations yet</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Conversations are created automatically when patients are assigned to you
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filtered.map(conv => (
                  <Card
                    key={conv.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedConv?.id === conv.id ? 'ring-2 ring-blue-500 bg-blue-50' : 'bg-white'
                    }`}
                    onClick={() => handleSelectConversation(conv)}
                  >
                    <CardContent className="p-3 flex items-center gap-3">
                      <Avatar className="h-10 w-10 shrink-0">
                        <AvatarFallback className="bg-blue-100 text-blue-700 text-xs font-bold">
                          {initials(conv.other_user.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-gray-900 text-sm truncate">
                            {conv.other_user.full_name}
                          </p>
                          {conv.unread_count > 0 && (
                            <Badge className="bg-red-500 text-white text-xs px-1.5 shrink-0">
                              {conv.unread_count}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 truncate mt-0.5">
                          {conv.last_message || 'No messages yet'}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {formatTime(conv.last_message_at)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Right — chat panel */}
          <div className="lg:col-span-2 flex flex-col bg-white rounded-xl border border-gray-200 overflow-hidden">
            {selectedConv ? (
              <>
                {/* Chat header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-blue-100 text-blue-700 text-xs font-bold">
                        {initials(selectedConv.other_user.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">
                        {selectedConv.other_user.full_name}
                      </p>
                      <p className="text-xs text-gray-400">Patient</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {wsStatus === 'connected' && (
                      <span className="flex items-center gap-1 text-xs text-green-600">
                        <Wifi className="h-3 w-3" /> Live
                      </span>
                    )}
                    {wsStatus === 'connecting' && (
                      <span className="flex items-center gap-1 text-xs text-amber-500">
                        <div className="animate-spin rounded-full h-3 w-3 border-b border-amber-500" />
                        Connecting
                      </span>
                    )}
                    {wsStatus === 'disconnected' && (
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <WifiOff className="h-3 w-3" /> Offline
                      </span>
                    )}
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                  {loadingMsgs ? (
                    <div className="flex items-center justify-center h-32">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center text-gray-400">
                        <MessageSquare className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">No messages yet — say hello!</p>
                      </div>
                    </div>
                  ) : (
                    messages.map(msg => {
                      const isMe = String(msg.sender_id) === String(currentUserId.current);
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
                              isMe
                                ? 'bg-blue-600 text-white rounded-br-sm'
                                : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                            }`}
                          >
                            <p className="text-sm leading-relaxed">{msg.body}</p>
                            <div className={`flex items-center gap-1 mt-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                              <span className={`text-xs ${isMe ? 'text-blue-200' : 'text-gray-400'}`}>
                                {formatTime(msg.created_at)}
                              </span>
                              {isMe && (
                                <CheckCheck className={`h-3 w-3 ${msg.is_read ? 'text-blue-200' : 'text-blue-300'}`} />
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="border-t border-gray-100 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Type a message..."
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="flex-1"
                      disabled={wsStatus !== 'connected'}
                    />
                    <Button
                      className="bg-blue-600 hover:bg-blue-700 shrink-0"
                      onClick={handleSend}
                      disabled={!input.trim() || wsStatus !== 'connected'}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                  {wsStatus !== 'connected' && (
                    <p className="text-xs text-gray-400 mt-1.5 text-center">
                      {wsStatus === 'connecting' ? 'Connecting to chat...' : 'Disconnected — select a conversation to reconnect'}
                    </p>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-200" />
                  <p className="font-medium text-gray-600">Select a conversation</p>
                  <p className="text-sm mt-1">Choose a patient from the list to start chatting</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClinicianCommunicationScreen;