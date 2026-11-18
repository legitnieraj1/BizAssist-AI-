"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ShieldAlert
} from "lucide-react";
import { StatusBadge, PriorityBadge, SentimentBadge } from "@/components/Badges";

interface AgentTicket {
  id: string;
  ticket_number: string;
  subject: string;
  category: string;
  priority: string;
  sentiment: string;
  status: string;
  customer_name?: string;
  created_at: string;
  ai_summary?: string;
}

export default function AgentOverviewPage() {
  const [tickets, setTickets] = useState<AgentTicket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAgentTickets() {
      try {
        const res = await fetch("/api/tickets");
        const data = await res.json();
        if (data.tickets) {
          setTickets(data.tickets);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    loadAgentTickets();
  }, []);

  const inProgress = tickets.filter(t => t.status === "In Progress" || t.status === "Assigned").length;
  const criticalCount = tickets.filter(t => t.priority === "Critical" && t.status !== "Resolved" && t.status !== "Closed").length;
  const resolvedCount = tickets.filter(t => t.status === "Resolved" || t.status === "Closed").length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-mono text-xs text-brand-black">
      {/* Banner */}
      <div className="bg-brand-black text-brand-white border-4 border-brand-black p-6 sm:p-8 shadow-hard-green flex flex-wrap items-center justify-between gap-6">
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 bg-brand-primary text-brand-accent text-[10px] font-bold uppercase border border-brand-accent">
              AGENT CONSOLE // BIZASSIST AI
            </span>
            <span className="text-brand-offwhite/50 text-[10px] uppercase">OPERATIONAL QUEUE // TEAM 3</span>
          </div>
          <h1 className="font-heading text-4xl sm:text-6xl font-black uppercase tracking-tight text-brand-white">
            SUPPORT AGENT WORKSPACE
          </h1>
          <p className="text-xs text-brand-offwhite/80 max-w-xl uppercase leading-relaxed">
            Review incoming prioritized customer complaints, inspect AI summary briefings, leverage multi-tone response generators, and update ticket lifecycle states.
          </p>
        </div>
        <Link
          href="/agent/tickets"
          className="px-5 py-3 bg-brand-primary text-brand-white font-bold uppercase text-xs border-2 border-brand-white shadow-hard-green hover:bg-brand-accent hover:text-brand-black transition"
        >
          [VIEW ASSIGNED QUEUE &rarr;]
        </Link>
      </div>

      {/* KPI Cards (Section 06 B) */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-brand-white p-5 border-2 border-brand-black shadow-hard">
          <span className="text-[10px] font-bold text-brand-black/60 uppercase block">ACTIVE ASSIGNED QUEUE</span>
          <span className="font-heading text-4xl font-black text-brand-black block mt-1">{inProgress}</span>
        </div>

        <div className="bg-brand-white p-5 border-2 border-brand-black shadow-hard">
          <span className="text-[10px] font-bold text-brand-pink uppercase block">CRITICAL URGENCY OUTAGES</span>
          <span className="font-heading text-4xl font-black text-brand-pink block mt-1">{criticalCount}</span>
        </div>

        <div className="bg-brand-white p-5 border-2 border-brand-black shadow-hard">
          <span className="text-[10px] font-bold text-brand-primary uppercase block">RESOLVED TICKETS</span>
          <span className="font-heading text-4xl font-black text-brand-primary block mt-1">{resolvedCount}</span>
        </div>

        <div className="bg-brand-black text-brand-white p-5 border-2 border-brand-primary shadow-hard-green">
          <span className="text-[10px] font-bold text-brand-accent uppercase block">AI RESPONSE READINESS</span>
          <span className="font-heading text-4xl font-black text-brand-accent block mt-1">100%</span>
        </div>
      </div>

      {/* High Urgency Queue */}
      <div className="bg-brand-white border-2 border-brand-black shadow-hard overflow-hidden">
        <div className="p-4 border-b-2 border-brand-black flex items-center justify-between">
          <div>
            <h2 className="font-heading text-2xl font-black uppercase text-brand-black flex items-center">
              <ShieldAlert className="w-5 h-5 mr-2 text-brand-pink" />
              PRIORITIZED TICKETS QUEUE
            </h2>
            <p className="text-[10px] text-brand-black/60 uppercase">SORTED BY AI URGENCY & SENTIMENT SEVERITY</p>
          </div>
          <Link
            href="/agent/tickets"
            className="text-xs font-bold text-brand-primary hover:text-brand-black uppercase underline flex items-center"
          >
            OPEN FULL QUEUE &rarr;
          </Link>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs font-bold uppercase text-brand-black/50">
            FETCHING QUEUE TELEMETRY...
          </div>
        ) : tickets.length === 0 ? (
          <div className="p-8 text-center text-xs font-bold uppercase text-brand-black/50">
            NO PENDING TICKETS IN QUEUE.
          </div>
        ) : (
          <div className="divide-y divide-brand-black/20">
            {tickets.slice(0, 5).map((t) => (
              <div
                key={t.id}
                className="p-4 hover:bg-brand-offwhite transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-xs text-brand-primary">{t.ticket_number}</span>
                    <PriorityBadge priority={t.priority} />
                    <SentimentBadge sentiment={t.sentiment} />
                    <StatusBadge status={t.status} />
                    <span className="text-[11px] text-brand-black/60 uppercase">
                      CLIENT: {t.customer_name || "CUSTOMER"}
                    </span>
                  </div>
                  <h3 className="font-heading text-xl font-bold uppercase text-brand-black">{t.subject}</h3>
                  {t.ai_summary && (
                    <p className="text-xs text-brand-black/80 font-mono italic">
                      AI SUMMARY: &quot;{t.ai_summary}&quot;
                    </p>
                  )}
                </div>

                <div className="shrink-0">
                  <Link
                    href={`/agent/tickets/${t.id}`}
                    className="px-4 py-2 bg-brand-primary text-brand-white font-bold uppercase text-xs border border-brand-black hover:bg-brand-accent hover:text-brand-black transition shadow-hard-green inline-block"
                  >
                    [OPEN WORKSPACE &gt;&gt;]
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
