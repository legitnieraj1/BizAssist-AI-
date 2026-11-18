"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  PlusCircle,
  MessageSquare,
  Ticket,
  Clock,
  ArrowRight,
  LifeBuoy
} from "lucide-react";
import { StatusBadge, PriorityBadge } from "@/components/Badges";

interface TicketSummary {
  id: string;
  ticket_number: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  created_at: string;
  agent_name?: string;
}

export default function CustomerOverviewPage() {
  const [tickets, setTickets] = useState<TicketSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTickets() {
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
    loadTickets();
  }, []);

  const openCount = tickets.filter(t => t.status === "Open" || t.status === "Assigned" || t.status === "In Progress").length;
  const waitingCount = tickets.filter(t => t.status === "Waiting for Customer").length;
  const resolvedCount = tickets.filter(t => t.status === "Resolved" || t.status === "Closed").length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-mono text-xs text-brand-black">
      {/* Banner */}
      <div className="bg-brand-black text-brand-white border-4 border-brand-black p-6 sm:p-8 shadow-hard-green space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2 py-0.5 bg-brand-primary text-brand-accent text-[10px] font-bold uppercase border border-brand-accent">
            CLIENT PORTAL // BIZASSIST AI
          </span>
          <span className="text-brand-offwhite/50 text-[10px] uppercase">OPERATIONAL // TEAM 3</span>
        </div>
        <h1 className="font-heading text-4xl sm:text-6xl font-black uppercase tracking-tight text-brand-white">
          CUSTOMER SUPPORT OVERVIEW
        </h1>
        <p className="text-xs sm:text-sm text-brand-offwhite/80 max-w-2xl uppercase leading-relaxed">
          Submit new incident reports for AI triage, monitor ongoing ticket resolutions, or query the verified knowledge base via the 24/7 AI chatbot assistant.
        </p>
        <div className="pt-2 flex flex-wrap gap-3">
          <Link
            href="/customer/new-ticket"
            className="px-4 py-2.5 bg-brand-accent text-brand-black font-bold uppercase text-xs border border-brand-black hover:bg-brand-white transition"
          >
            [+] CREATE SUPPORT TICKET
          </Link>
          <Link
            href="/customer/chat"
            className="px-4 py-2.5 bg-brand-primary text-brand-white font-bold uppercase text-xs border border-brand-white hover:bg-brand-accent hover:text-brand-black transition"
          >
            [?] CONSULT AI KNOWLEDGE BOT
          </Link>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-brand-white p-5 border-2 border-brand-black shadow-hard flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-brand-black/60 uppercase block">ACTIVE IN-PROGRESS TICKETS</span>
            <span className="font-heading text-4xl font-black text-brand-black block mt-1">{openCount}</span>
          </div>
          <div className="w-10 h-10 bg-brand-accent text-brand-black border border-brand-black flex items-center justify-center font-bold">
            01
          </div>
        </div>

        <div className="bg-brand-white p-5 border-2 border-brand-black shadow-hard flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-brand-black/60 uppercase block">AWAITING YOUR CONFIRMATION</span>
            <span className="font-heading text-4xl font-black text-brand-pink block mt-1">{waitingCount}</span>
          </div>
          <div className="w-10 h-10 bg-brand-pink text-brand-white border border-brand-black flex items-center justify-center font-bold">
            02
          </div>
        </div>

        <div className="bg-brand-white p-5 border-2 border-brand-black shadow-hard flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-brand-black/60 uppercase block">RESOLVED TICKETS</span>
            <span className="font-heading text-4xl font-black text-brand-primary block mt-1">{resolvedCount}</span>
          </div>
          <div className="w-10 h-10 bg-brand-primary text-brand-white border border-brand-black flex items-center justify-center font-bold">
            03
          </div>
        </div>
      </div>

      {/* Recent Tickets Table */}
      <div className="bg-brand-white border-2 border-brand-black shadow-hard overflow-hidden">
        <div className="p-4 border-b-2 border-brand-black flex items-center justify-between">
          <div>
            <h2 className="font-heading text-2xl font-black uppercase text-brand-black">
              YOUR SUPPORT TICKETS
            </h2>
            <p className="text-[10px] text-brand-black/60 uppercase">CENTRALIZED STATUS MONITOR</p>
          </div>
          <Link
            href="/customer/tickets"
            className="text-xs font-bold text-brand-primary hover:text-brand-black uppercase underline flex items-center"
          >
            ALL TICKETS &rarr;
          </Link>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs font-bold uppercase text-brand-black/50">
            FETCHING TICKETS...
          </div>
        ) : tickets.length === 0 ? (
          <div className="p-8 text-center space-y-3">
            <LifeBuoy className="w-8 h-8 text-brand-black/40 mx-auto" />
            <p className="text-sm font-bold uppercase text-brand-black">NO ACTIVE TICKETS SUBMITTED</p>
            <Link
              href="/customer/new-ticket"
              className="inline-block px-4 py-2 bg-brand-primary text-brand-white font-bold uppercase text-xs border border-brand-black"
            >
              CREATE FIRST TICKET &gt;&gt;
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-brand-black text-brand-white uppercase text-[11px] border-b-2 border-brand-black">
                <tr>
                  <th className="py-2.5 px-4 font-bold">TICKET ID</th>
                  <th className="py-2.5 px-4 font-bold">SUBJECT</th>
                  <th className="py-2.5 px-4 font-bold">CATEGORY</th>
                  <th className="py-2.5 px-4 font-bold">PRIORITY</th>
                  <th className="py-2.5 px-4 font-bold">STATUS</th>
                  <th className="py-2.5 px-4 font-bold">SPECIALIST</th>
                  <th className="py-2.5 px-4 text-right font-bold">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-black/20">
                {tickets.slice(0, 5).map((t) => (
                  <tr key={t.id} className="hover:bg-brand-offwhite transition">
                    <td className="py-3 px-4 font-bold text-brand-primary">{t.ticket_number}</td>
                    <td className="py-3 px-4 font-bold text-brand-black max-w-xs truncate uppercase">{t.subject}</td>
                    <td className="py-3 px-4 uppercase">{t.category}</td>
                    <td className="py-3 px-4"><PriorityBadge priority={t.priority} /></td>
                    <td className="py-3 px-4"><StatusBadge status={t.status} /></td>
                    <td className="py-3 px-4 uppercase">{t.agent_name || "TRIAGE QUEUE"}</td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/customer/tickets/${t.id}`}
                        className="font-bold text-brand-primary hover:text-brand-black underline uppercase"
                      >
                        VIEW &rarr;
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
