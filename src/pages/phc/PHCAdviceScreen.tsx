import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import PHCLayout from "@/components/phc/PHCLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Send,
  Search,
  User,
  Calendar,
  CheckCircle,
  Clock,
  ChevronDown,
  MessageCircle,
  Filter,
  Eye,
} from "lucide-react";
import { phcAPI } from "@/services/phcService";

const TEMPLATES = {
  PCOS: [
    {
      title: "Reduce refined carbohydrates",
      description: "Cut out white bread, pasta, sugary drinks. Choose whole grains and vegetables.",
    },
    {
      title: "Regular aerobic exercise",
      description: "150 minutes per week of moderate intensity activity like brisk walking or cycling.",
    },
    {
      title: "Consistent sleep schedule",
      description: "Sleep and wake at the same time every day, even on weekends.",
    },
    {
      title: "Monthly cycle monitoring",
      description: "Track your period start date each month using the AI-MSHM app.",
    },
  ],
  Hormonal: [
    {
      title: "Track night sweats",
      description: "Note when they occur and how long they last. Share with your care team.",
    },
    {
      title: "Reduce caffeine after 2pm",
      description: "Caffeine can disrupt hormonal sleep patterns. Switch to herbal tea.",
    },
    {
      title: "Magnesium-rich foods",
      description: "Include spinach, nuts, and seeds to help reduce muscle weakness.",
    },
    {
      title: "Relaxation techniques",
      description: "Daily 10-minute breathing exercises can reduce hormonal stress spikes.",
    },
  ],
  Metabolic: [
    {
      title: "Reduce sodium intake",
      description: "Target less than 2,300mg per day. Check food labels carefully.",
    },
    {
      title: "Walk 30 minutes daily",
      description: "Consistent low-intensity activity helps metabolic regulation.",
    },
    {
      title: "Log meals for 2 weeks",
      description: "Keep a food diary to identify blood sugar trigger foods.",
    },
    {
      title: "Monitor waist circumference",
      description: "Log it monthly in your AI-MSHM app. Target < 80cm.",
    },
  ],
};

const CONDITION_COLORS = {
  PCOS: "bg-purple-100 text-purple-700 border-purple-200",
  Hormonal: "bg-blue-100 text-blue-700 border-blue-200",
  Metabolic: "bg-green-100 text-green-700 border-green-200",
};

const CONDITION_BADGE_COLORS = {
  PCOS: "bg-purple-500",
  Hormonal: "bg-blue-500",
  Metabolic: "bg-green-500",
};

export default function PHCAdviceScreen() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"PCOS" | "Hormonal" | "Metabolic">("PCOS");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Array<{ id: string; patient: { id: string; full_name: string } }>>([]);
  const [selectedPatient, setSelectedPatient] = useState<{ id: string; patient: { id: string; full_name: string }; name?: string; conditions?: string[]; condition_label?: string } | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [message, setMessage] = useState("");
  const [followupDate, setFollowupDate] = useState("");
  const [sentMessages, setSentMessages] = useState<Array<{ id: string; patient_name: string; condition: string; message: string; sent_at: string; followup_date?: string }>>([]);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchSentMessages();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchQuery.length >= 2) {
      const timer = setTimeout(() => searchPatients(searchQuery), 300);
      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
      setShowDropdown(false);
    }
  }, [searchQuery]);

  const searchPatients = async (query: string) => {
    try {
      const data = await phcAPI.getQueue({});
      const allRecords = Array.isArray(data) ? data : (data?.data?.results || data?.data || []);
      const q = query.toLowerCase();
      const filtered = allRecords.filter((r: any) =>
        r.patient?.full_name?.toLowerCase().includes(q) ||
        r.patient?.id?.toLowerCase().includes(q) ||
        r.patient_id?.toLowerCase().includes(q)
      );
      setSearchResults(filtered);
      setShowDropdown(true);
    } catch (err) {
      console.error("Search failed", err);
    }
  };

  const fetchSentMessages = async () => {
    try {
      const data = await phcAPI.getRecentAdvice(10);
      const messages = Array.isArray(data) ? data : (data?.data || []);
      setSentMessages(messages);
    } catch (err) {
      console.error("Fetch messages failed", err);
    }
  };

  const selectTemplate = (template: { title: string; description: string }) => {
    setMessage(`${template.title}. ${template.description}`);
    if (selectedPatient?.conditions?.length > 0) {
      setActiveTab(
        selectedPatient.conditions[0].toLowerCase() === "pcos"
          ? "PCOS"
          : selectedPatient.conditions[0].toLowerCase() === "hormonal"
          ? "Hormonal"
          : "Metabolic"
      );
    }
  };

  const selectPatient = (patient: { id: string; patient: { id: string; full_name: string }; name?: string; conditions?: string[]; condition_label?: string }) => {
    setSelectedPatient(patient);
    setSearchQuery("");
    setShowDropdown(false);
    if (patient.conditions?.length > 0) {
      const cond = patient.conditions[0].toLowerCase();
      if (cond === "pcos") setActiveTab("PCOS");
      else if (cond === "hormonal") setActiveTab("Hormonal");
      else setActiveTab("Metabolic");
    }
  };

  const setFollowupWeeks = (weeks: number) => {
    const date = new Date();
    date.setDate(date.getDate() + weeks * 7);
    setFollowupDate(date.toISOString().split("T")[0]);
  };

  const sendAdvice = async () => {
    if (!selectedPatient) {
      setError("Please select a patient first.");
      return;
    }
    if (!message.trim()) {
      setError("Please enter a message.");
      return;
    }
    setError("");
    setIsSending(true);
    try {
      const body = await phcAPI.sendAdvice({
        queue_record_id: selectedPatient.id,
        condition: activeTab,
        message: message.trim(),
        followup_date: followupDate || null,
      });
      if (body?.status === "success" || body?.id) {
        const msg = body;
        setSentMessages((prev) => [
          { ...msg, patient_name: selectedPatient.name },
          ...prev,
        ]);
        setMessage("");
        setFollowupDate("");
        setSelectedPatient(null);
        setToast("Advice sent ✓");
        setTimeout(() => setToast(""), 3000);
      } else {
        setError(body?.message || "Failed to send advice.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <PHCLayout>
      <div className="p-6 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-gray-900">Send Health Advice</h1>
          <p className="text-gray-500 mt-1">Send personalised health guidance to patients</p>
        </motion.div>

        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed top-4 right-4 z-50"
          >
            <Alert className="bg-green-50 border-green-200">
              <AlertDescription className="text-green-700 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" /> {toast}
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5">
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-[#2E8B57]" />
                Advice Templates
              </h2>
              <div className="flex gap-2 mb-4">
                {(["PCOS", "Hormonal", "Metabolic"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      activeTab === tab
                        ? "bg-[#2E8B57] text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <div className="space-y-2">
                {TEMPLATES[activeTab].map((template, idx) => (
                  <div
                    key={idx}
                    onClick={() => selectTemplate(template)}
                    className="bg-white rounded-xl border border-gray-100 p-3 mb-2 cursor-pointer hover:shadow-sm hover:border-[#2E8B57]/30 transition-all"
                  >
                    <p className="font-medium text-gray-900 text-sm">{template.title}</p>
                    <p className="text-gray-500 text-sm mt-1">{template.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Send className="w-5 h-5 text-[#2E8B57]" />
                Message Composer
              </h2>

              <div className="mb-4" ref={searchRef}>
                <Label className="text-sm font-medium text-gray-700">Select Patient</Label>
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search patient by name or ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                  {showDropdown && searchResults.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white rounded-lg border border-gray-200 shadow-lg max-h-48 overflow-y-auto">
                      {searchResults.map((patient) => (
                        <div
                          key={patient.id}
                          onClick={() => selectPatient(patient)}
                          className="p-3 hover:bg-gray-50 cursor-pointer flex items-center gap-3 border-b border-gray-100 last:border-0"
                        >
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium">{patient.name}</span>
                          {patient.conditions?.map((c: string) => (
                            <Badge
                              key={c}
                              className={`${
                                CONDITION_BADGE_COLORS[c] || "bg-gray-500"
                              } text-white text-xs`}
                            >
                              {c}
                            </Badge>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {selectedPatient && (
                <Card className="mb-4 border-[#2E8B57]/20 bg-[#2E8B57]/5">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#2E8B57]/10 flex items-center justify-center">
                        <User className="w-5 h-5 text-[#2E8B57]" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{selectedPatient.name}</p>
                        <div className="flex gap-1 mt-1">
                          {(selectedPatient.conditions || []).map((c: string) => (
                            <Badge
                              key={c}
                              className={`${
                                CONDITION_BADGE_COLORS[c] || "bg-gray-500"
                              } text-white text-xs`}
                            >
                              {c}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="mb-4">
                <Label className="text-sm font-medium text-gray-700">Condition Track</Label>
                <div className="flex gap-2 mt-1">
                  {(["PCOS", "Hormonal", "Metabolic"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        activeTab === tab
                          ? CONDITION_COLORS[tab]
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <Label className="text-sm font-medium text-gray-700">Message</Label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value.slice(0, 500))}
                  placeholder="Type your health advice message..."
                  className="mt-1 w-full rounded-lg border border-gray-200 p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#2E8B57]/20 focus:border-[#2E8B57]"
                  rows={4}
                  style={{ minHeight: "100px", maxHeight: "200px" }}
                />
                <p className="text-xs text-gray-400 mt-1 text-right">
                  {message.length} / 500
                </p>
              </div>

              <div className="mb-4">
                <Label className="text-sm font-medium text-gray-700">
                  Schedule a follow-up check-in?
                </Label>
                <div className="mt-2 flex flex-wrap gap-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <Input
                      type="date"
                      value={followupDate}
                      onChange={(e) => setFollowupDate(e.target.value)}
                      className="w-40 text-sm"
                    />
                  </div>
                  <div className="flex gap-2">
                    {[1, 2, 4].map((weeks) => (
                      <Button
                        key={weeks}
                        variant="outline"
                        size="sm"
                        onClick={() => setFollowupWeeks(weeks)}
                        className={`text-xs ${
                          followupDate ? "border-[#2E8B57] text-[#2E8B57]" : ""
                        }`}
                      >
                        {weeks} week{weeks > 1 ? "s" : ""}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              {error && (
                <Alert className="mb-4 bg-red-50 border-red-200">
                  <AlertDescription className="text-red-700 text-sm">
                    {error}
                  </AlertDescription>
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
                      <th className="text-left py-3 px-2 font-medium text-gray-500">Patient</th>
                      <th className="text-left py-3 px-2 font-medium text-gray-500">Condition</th>
                      <th className="text-left py-3 px-2 font-medium text-gray-500">Date</th>
                      <th className="text-left py-3 px-2 font-medium text-gray-500">Message</th>
                      <th className="text-left py-3 px-2 font-medium text-gray-500">Status</th>
                      <th className="text-left py-3 px-2 font-medium text-gray-500">Follow-up</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sentMessages.map((msg, idx) => (
                      <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-3 px-2 font-medium text-gray-900">
                          {msg.patient_name || msg.patient?.name || "—"}
                        </td>
                        <td className="py-3 px-2">
                          <Badge
                            className={`${
                              CONDITION_COLORS[msg.condition as keyof typeof CONDITION_COLORS] ||
                              "bg-gray-100"
                            } text-xs`}
                          >
                            {msg.condition}
                          </Badge>
                        </td>
                        <td className="py-3 px-2 text-gray-500">
                          {msg.created_at ? formatDate(msg.created_at) : "—"}
                        </td>
                        <td className="py-3 px-2 text-gray-600 max-w-xs truncate">
                          {msg.message?.slice(0, 60)}
                          {msg.message?.length > 60 ? "..." : ""}
                        </td>
                        <td className="py-3 px-2">
                          <Badge className="bg-green-100 text-green-700 border border-green-200 text-xs">
                            <CheckCircle className="w-3 h-3 mr-1" /> Delivered
                          </Badge>
                        </td>
                        <td className="py-3 px-2 text-gray-500">
                          {msg.followup_date ? formatDate(msg.followup_date) : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </PHCLayout>
  );
}
