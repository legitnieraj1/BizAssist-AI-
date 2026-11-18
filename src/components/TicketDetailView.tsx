"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Send,
  RotateCw,
  Copy,
  Check,
  Shield,
  Clock,
  History,
  FileText,
  Lock,
  ArrowLeft,
  Paperclip
} from "lucide-react";
import { StatusBadge, PriorityBadge, SentimentBadge } from "@/components/Badges";

interface TicketProps {
  id: string;
  role: "customer" | "agent" | "admin";
}

interface TicketRecord {
  id: string;
  ticket_number: string;
  customer_id: string;
  assigned_agent_id: string | null;
  subject: string;
  description: string;
  category: string;
  priority: "Critical" | "High" | "Medium" | "Low";
  sentiment: string;
  ai_summary: string;
  ai_suggested_response: string;
  status: string;
  contact_email: string;
  contact_phone: string;
  attachment_name?: string;
  attachment_url?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  customer_name?: string;
  customer_email?: string;
  agent_name?: string;
}

interface TicketMessage {
  id: string;
  sender_id: string;
  sender_name: string;
  sender_role: string;
  message: string;
  attachment_url?: string;
  is_internal: number;
  created_at: string;
}

interface TicketHistoryItem {
  id: string;
  previous_status: string | null;
  new_status: string;
  action_type: string;
  note: string;
  changed_by_name: string;
  changed_by_role: string;
  created_at: string;
}

interface AgentOption {
  id: string;
  full_name: string;
  active_tickets: number;
}

export default function TicketDetailView({ id, role }: TicketProps) {
  const [ticket, setTicket] = useState<TicketRecord | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [history, setHistory] = useState<TicketHistoryItem[]>([]);
  const [agents, setAgents] = useState<AgentOption[]>([]);
  const [replyText, setReplyText] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [selectedTone, setSelectedTone] = useState<"Empathetic" | "Direct & Technical" | "Concise" | "Step-by-Step">("Empathetic");
  const [regenerating, setRegenerating] = useState(false);
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchTicketDetails = async () => {
    try {
      const res = await fetch(`/api/tickets/${id}`);
      const data = await res.json();
      if (data.ticket) {
        setTicket(data.ticket);
        setMessages(data.messages || []);
        setHistory(data.history || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const fetchAgents = async () => {
    if (role === "admin" || role === "agent") {
      try {
        const res = await fetch("/api/agents");
        const data = await res.json();
        if (data.agents) setAgents(data.agents);
      } catch {
        // ignore
      }
    }
  };

  useEffect(() => {
    fetchTicketDetails();
    fetchAgents();
  }, [id]);

  const handleStatusChange = async (newStatus: string) => {
    if (!ticket) return;
    try {
      const res = await fetch(`/api/tickets/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        fetchTicketDetails();
      }
    } catch {
      // ignore
    }
  };

  const handlePriorityChange = async (newPriority: string) => {
    if (!ticket) return;
    try {
      const res = await fetch(`/api/tickets/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priority: newPriority })
      });
      const data = await res.json();
      if (data.success) {
        fetchTicketDetails();
      }
    } catch {
      // ignore
    }
  };

  const handleAssignAgent = async (agentId: string) => {
    if (!ticket) return;
    try {
      const res = await fetch(`/api/tickets/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assigned_agent_id: agentId || null })
      });
      const data = await res.json();
      if (data.success) {
        fetchTicketDetails();
      }
    } catch {
      // ignore
    }
  };

  const handleRegenerateResponse = async () => {
    setRegenerating(true);
    try {
      const res = await fetch(`/api/tickets/${id}/ai-response`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tone: selectedTone })
      });
      const data = await res.json();
      if (data.suggested_response && ticket) {
        setTicket({ ...ticket, ai_suggested_response: data.suggested_response });
      }
    } finally {
      setRegenerating(false);
    }
  };

  const handleUseAISuggestion = () => {
    if (ticket?.ai_suggested_response) {
      setReplyText(ticket.ai_suggested_response);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || sending) return;

    setSending(true);
    try {
      const res = await fetch(`/api/tickets/${id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: replyText.trim(),
          is_internal: isInternal
        })
      });
      const data = await res.json();
      if (data.success) {
        setReplyText("");
        setIsInternal(false);
        fetchTicketDetails();
      }
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-16 px-4 text-center font-mono text-xs">
        <span className="p-3 bg-brand-black text-brand-accent border-2 border-brand-black inline-block font-bold">
          LOADING TICKET // FETCHING CONVERSATION & AUDIT STREAM...
        </span>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center font-mono text-xs">
        <p className="text-brand-black uppercase font-bold">Ticket not found or unauthorized access.</p>
        <Link href={`/${role}/tickets`} className="mt-4 inline-block text-brand-primary underline font-bold">
          &lt;&lt; RETURN TO TICKETS
        </Link>
      </div>
    );
  }

  const backLink = role === "admin" ? "/admin/tickets" : role === "agent" ? "/agent/tickets" : "/customer/tickets";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 font-mono text-xs text-brand-black">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-brand-black pb-3">
        <Link
          href={backLink}
          className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-brand-black hover:text-brand-primary"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          &lt;&lt; BACK TO TICKET QUEUE
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={ticket.status} />
          <PriorityBadge priority={ticket.priority} />
          <SentimentBadge sentiment={ticket.sentiment} />
        </div>
      </div>

      {/* Main Grid: Ticket Details + AI Assistant & Chat Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Ticket Header, Original Complaint, AI Summary, Messages Thread */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ticket Header Card */}
          <div className="bg-brand-white border-2 border-brand-black p-6 shadow-hard space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-brand-black/20 pb-3">
              <div>
                <span className="text-[11px] font-bold text-brand-primary uppercase tracking-widest block">
                  TICKET_ID: {ticket.ticket_number}
                </span>
                <h1 className="font-heading text-3xl font-black text-brand-black uppercase mt-1">
                  {ticket.subject}
                </h1>
              </div>
              <span className="text-[10px] text-brand-black/60 uppercase flex items-center">
                <Clock className="w-3.5 h-3.5 mr-1" />
                {new Date(ticket.created_at).toLocaleString()}
              </span>
            </div>

            {/* Original Complaint Description */}
            <div className="bg-brand-offwhite border-2 border-brand-black p-4 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold uppercase border-b border-brand-black/20 pb-1.5">
                <span className="flex items-center text-brand-black">
                  <FileText className="w-3.5 h-3.5 mr-1 text-brand-primary" />
                  ORIGINAL CUSTOMER COMPLAINT
                </span>
                <span className="text-brand-primary">CATEGORY: {ticket.category}</span>
              </div>
              <p className="text-xs text-brand-black whitespace-pre-wrap leading-relaxed">
                {ticket.description}
              </p>
              {ticket.attachment_name && (
                <div className="mt-2 inline-flex items-center px-2 py-1 bg-brand-white border border-brand-black text-[10px] font-bold text-brand-black uppercase">
                  <Paperclip className="w-3 h-3 mr-1 text-brand-primary" />
                  ATTACHMENT: {ticket.attachment_name}
                </div>
              )}
            </div>

            {/* Module 5: AI-Generated Complaint Summary */}
            {ticket.ai_summary && (
              <div className="bg-brand-black text-brand-offwhite border-2 border-brand-primary p-4 shadow-hard-green">
                <div className="flex items-center space-x-2 text-brand-accent text-xs font-bold uppercase tracking-wider mb-1.5">
                  <span className="w-2 h-2 bg-brand-accent border border-brand-black" />
                  <span>AI COMPLAINT SUMMARY // ROOT CAUSE EXTRACTION</span>
                </div>
                <p className="text-xs text-brand-offwhite leading-relaxed">
                  {ticket.ai_summary}
                </p>
              </div>
            )}
          </div>

          {/* Module 4: Support Agent AI Response Generator (Human-in-the-Loop Safe) */}
          {(role === "agent" || role === "admin") && (
            <div className="bg-brand-white border-2 border-brand-black p-5 shadow-hard space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-brand-black pb-3">
                <div>
                  <h2 className="font-heading text-2xl font-black text-brand-black uppercase leading-none">
                    AI RESPONSE ASSISTANT
                  </h2>
                  <p className="text-[10px] text-brand-black/60 uppercase mt-1">
                    CONTEXTUAL SUGGESTED RESPONSE // APPROVAL REQUIRED
                  </p>
                </div>

                {/* Tone Selector & Actions */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <select
                    value={selectedTone}
                    onChange={(e) => setSelectedTone(e.target.value as any)}
                    className="text-[11px] bg-brand-offwhite border border-brand-black px-2 py-1 font-bold text-brand-black uppercase focus:outline-hidden"
                  >
                    <option value="Empathetic">TONE: EMPATHETIC</option>
                    <option value="Direct & Technical">TONE: TECHNICAL</option>
                    <option value="Concise">TONE: CONCISE</option>
                    <option value="Step-by-Step">TONE: STEP-BY-STEP</option>
                  </select>

                  <button
                    onClick={handleRegenerateResponse}
                    disabled={regenerating}
                    className="inline-flex items-center px-2 py-1 bg-brand-offwhite hover:bg-brand-black hover:text-brand-white border border-brand-black text-[11px] font-bold uppercase transition"
                  >
                    <RotateCw className={`w-3 h-3 mr-1 ${regenerating ? "animate-spin text-brand-primary" : ""}`} />
                    REGEN
                  </button>

                  <button
                    onClick={handleUseAISuggestion}
                    className="inline-flex items-center px-3 py-1 bg-brand-primary text-brand-white border border-brand-black text-[11px] font-bold uppercase hover:bg-brand-accent hover:text-brand-black transition shadow-hard-green"
                  >
                    {copied ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                    {copied ? "COPIED" : "INSERT IN REPLY"}
                  </button>
                </div>
              </div>

              {/* Display Suggested Response */}
              <div className="bg-brand-offwhite border border-brand-black p-3.5 text-xs text-brand-black whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                {ticket.ai_suggested_response || "NO SUGGESTED RESPONSE GENERATED."}
              </div>
              <p className="text-[10px] text-brand-primary uppercase font-bold flex items-center">
                <Shield className="w-3 h-3 mr-1 text-brand-primary" />
                HUMAN-IN-THE-LOOP SAFEGUARD: AI RESPONSES ARE NEVER DISPATCHED WITHOUT MANUAL AGENT APPROVAL.
              </p>
            </div>
          )}

          {/* Conversation Thread */}
          <div className="bg-brand-white border-2 border-brand-black p-6 shadow-hard space-y-4">
            <h2 className="font-heading text-2xl font-black text-brand-black uppercase border-b-2 border-brand-black pb-2 flex items-center justify-between">
              <span>CONVERSATION HISTORY & TICKET LOG</span>
              <span className="font-mono text-xs text-brand-black/60 font-bold">{messages.length} MESSAGES</span>
            </h2>

            <div className="space-y-3">
              {messages.map((msg) => {
                const isCustomer = msg.sender_role === "customer";
                const isInternalNote = msg.is_internal === 1;
                if (isInternalNote && role === "customer") return null;

                return (
                  <div
                    key={msg.id}
                    className={`p-3.5 border-2 border-brand-black ${
                      isInternalNote
                        ? "bg-brand-accent text-brand-black shadow-hard-yellow"
                        : isCustomer
                        ? "bg-brand-offwhite text-brand-black"
                        : "bg-brand-primary text-brand-white shadow-hard-green"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5 text-[11px] font-bold uppercase border-b border-current pb-1 opacity-80">
                      <div className="flex items-center space-x-2">
                        <span>{"//"} {msg.sender_name}</span>
                        <span className="text-[9px] px-1 py-0.2 border border-current">
                          {msg.sender_role}
                        </span>
                        {isInternalNote && (
                          <span className="text-[9px] bg-brand-black text-brand-accent px-1 border border-brand-black flex items-center">
                            <Lock className="w-2.5 h-2.5 mr-0.5" />
                            INTERNAL AGENT NOTE
                          </span>
                        )}
                      </div>
                      <span className="text-[10px]">
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <div className="whitespace-pre-wrap leading-relaxed text-xs">{msg.message}</div>
                  </div>
                );
              })}
            </div>

            {/* Message Reply Composer */}
            <form onSubmit={handleSendMessage} className="pt-4 border-t-2 border-brand-black space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold uppercase text-brand-black">COMPOSE RESPONSE:</span>
                {(role === "agent" || role === "admin") && (
                  <label className="flex items-center space-x-1.5 text-[11px] font-bold text-brand-black cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isInternal}
                      onChange={(e) => setIsInternal(e.target.checked)}
                      className="border-2 border-brand-black text-brand-black focus:ring-0"
                    />
                    <span className="uppercase">INTERNAL TEAM NOTE (HIDDEN FROM CUSTOMER)</span>
                  </label>
                )}
              </div>

              <textarea
                rows={4}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={
                  isInternal
                    ? "WRITE PRIVATE OPERATIONAL NOTE FOR SUPPORT ROSTER..."
                    : "ENTER RESPONSE TO CUSTOMER..."
                }
                className="w-full bg-brand-offwhite text-brand-black text-xs p-3 border-2 border-brand-black focus:bg-brand-white focus:outline-hidden"
              />

              <div className="flex items-center justify-between">
                <p className="text-[10px] text-brand-black/60 uppercase">
                  {role === "customer"
                    ? "Submitting will notify assigned specialist."
                    : isInternal
                    ? "Internal note logged to audit trail."
                    : "Sending will notify customer via dashboard & email."}
                </p>
                <button
                  type="submit"
                  disabled={sending || !replyText.trim()}
                  className={`px-5 py-2.5 text-xs font-bold uppercase transition border-2 border-brand-black ${
                    isInternal
                      ? "bg-brand-accent text-brand-black hover:bg-brand-black hover:text-brand-accent shadow-hard-yellow"
                      : "bg-brand-primary text-brand-white hover:bg-brand-black hover:text-brand-accent shadow-hard-green"
                  } disabled:opacity-50`}
                >
                  <Send className="w-3.5 h-3.5 inline mr-1.5" />
                  {sending ? "SENDING..." : isInternal ? "SAVE INTERNAL NOTE" : "TRANSMIT RESPONSE"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column (1 col): AI Intelligence Panel & Controls & History */}
        <div className="space-y-6">
          {/* Section 07: AI Intelligence Panel */}
          <div className="bg-brand-black text-brand-white border-2 border-brand-primary p-5 shadow-hard-green space-y-3">
            <div className="border-b border-brand-primary/40 pb-2 flex items-center justify-between">
              <span className="font-heading text-xl font-bold uppercase tracking-wider text-brand-accent">
                AI INTELLIGENCE
              </span>
              <span className="px-1.5 py-0.2 bg-brand-primary text-brand-accent text-[9px] font-bold border border-brand-accent">
                CLASSIFIED
              </span>
            </div>

            <div className="space-y-2 text-[11px]">
              <div>
                <span className="text-brand-offwhite/60 uppercase block">CATEGORY:</span>
                <span className="font-bold text-brand-white uppercase">{ticket.category}</span>
              </div>

              <div>
                <span className="text-brand-offwhite/60 uppercase block">PRIORITY:</span>
                <PriorityBadge priority={ticket.priority} />
              </div>

              <div>
                <span className="text-brand-offwhite/60 uppercase block">SENTIMENT:</span>
                <SentimentBadge sentiment={ticket.sentiment} />
              </div>

              <div>
                <span className="text-brand-offwhite/60 uppercase block">SUGGESTED ACTION:</span>
                <span className="text-brand-accent font-bold uppercase">
                  {ticket.priority === "Critical"
                    ? "PAGE SENIOR ON-CALL ENGINEER IMMEDIATELY"
                    : "REVIEW TELEMETRY AND RESPOND TO INQUIRY"}
                </span>
              </div>
            </div>
          </div>

          {/* Ticket Management Controls (Agent & Admin) */}
          {(role === "agent" || role === "admin") && (
            <div className="bg-brand-white border-2 border-brand-black p-5 shadow-hard space-y-4">
              <h2 className="font-heading text-xl font-black text-brand-black uppercase border-b-2 border-brand-black pb-2 flex items-center">
                <Shield className="w-4 h-4 mr-1.5 text-brand-primary" />
                CONTROL & ROUTING
              </h2>

              {/* Status Selector */}
              <div>
                <label className="block text-[11px] font-bold uppercase text-brand-black mb-1">
                  UPDATE STATUS
                </label>
                <select
                  value={ticket.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="w-full bg-brand-offwhite border-2 border-brand-black p-2 text-xs font-bold text-brand-black uppercase focus:outline-hidden"
                >
                  <option value="Open">OPEN</option>
                  <option value="Assigned">ASSIGNED</option>
                  <option value="In Progress">IN PROGRESS</option>
                  <option value="Waiting for Customer">WAITING FOR CUSTOMER</option>
                  <option value="Resolved">RESOLVED</option>
                  <option value="Closed">CLOSED</option>
                </select>
              </div>

              {/* Priority Selector */}
              <div>
                <label className="block text-[11px] font-bold uppercase text-brand-black mb-1">
                  OVERRIDE PRIORITY
                </label>
                <select
                  value={ticket.priority}
                  onChange={(e) => handlePriorityChange(e.target.value)}
                  className="w-full bg-brand-offwhite border-2 border-brand-black p-2 text-xs font-bold text-brand-black uppercase focus:outline-hidden"
                >
                  <option value="Critical">CRITICAL (OUTAGE / SECURITY)</option>
                  <option value="High">HIGH (MAJOR INTERRUPTION)</option>
                  <option value="Medium">MEDIUM (STANDARD)</option>
                  <option value="Low">LOW (MINOR ENQUIRY)</option>
                </select>
              </div>

              {/* Agent Assignment Dropdown */}
              <div>
                <label className="block text-[11px] font-bold uppercase text-brand-black mb-1">
                  ASSIGN SUPPORT AGENT
                </label>
                <select
                  value={ticket.assigned_agent_id || ""}
                  onChange={(e) => handleAssignAgent(e.target.value)}
                  className="w-full bg-brand-offwhite border-2 border-brand-black p-2 text-xs font-bold text-brand-black uppercase focus:outline-hidden"
                >
                  <option value="">UNASSIGNED</option>
                  {agents.map((ag) => (
                    <option key={ag.id} value={ag.id}>
                      {ag.full_name.toUpperCase()} ({ag.active_tickets} ACTIVE)
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Customer Metadata Card */}
          <div className="bg-brand-white border-2 border-brand-black p-5 shadow-hard space-y-3">
            <h2 className="font-heading text-lg font-bold uppercase tracking-wider text-brand-primary border-b border-brand-black/20 pb-1">
              CUSTOMER IDENTITY
            </h2>
            <div className="space-y-1">
              <p className="font-bold text-sm text-brand-black uppercase">{ticket.customer_name || "CUSTOMER"}</p>
              <p className="text-xs text-brand-black/70">{ticket.contact_email}</p>
              {ticket.contact_phone && (
                <p className="text-xs text-brand-black/60">{ticket.contact_phone}</p>
              )}
            </div>
            <div className="pt-2 border-t border-brand-black/20 flex items-center justify-between text-xs font-bold">
              <span className="text-brand-black/60 uppercase">ASSIGNED TO:</span>
              <span className="text-brand-primary uppercase">{ticket.agent_name || "UNASSIGNED"}</span>
            </div>
          </div>

          {/* Module 8: Audit History Log */}
          <div className="bg-brand-white border-2 border-brand-black p-5 shadow-hard space-y-3">
            <h2 className="font-heading text-lg font-bold uppercase tracking-wider text-brand-black flex items-center border-b border-brand-black/20 pb-1">
              <History className="w-3.5 h-3.5 mr-1 text-brand-primary" />
              ASSIGNMENT & AUDIT LOG
            </h2>

            <div className="space-y-2.5 max-h-64 overflow-y-auto divide-y divide-brand-black/10">
              {history.map((h) => (
                <div key={h.id} className="pt-2 first:pt-0">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase">
                    <span className="text-brand-primary">{h.changed_by_name}</span>
                    <span className="text-brand-black/50">
                      {new Date(h.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <p className="text-[11px] text-brand-black mt-0.5 leading-snug">{h.note}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
