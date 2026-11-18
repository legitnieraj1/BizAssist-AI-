"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, PlusCircle, Ticket } from "lucide-react";
import { StatusBadge, PriorityBadge } from "@/components/Badges";

interface TicketItem {
  id: string;
  ticket_number: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  created_at: string;
  agent_name?: string;
}

export default function CustomerTicketsPage() {
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  const fetchTickets = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter !== "All") params.set("status", statusFilter);
      if (priorityFilter !== "All") params.set("priority", priorityFilter);

      const res = await fetch(`/api/tickets?${params.toString()}`);
      const data = await res.json();
      if (data.tickets) {
        setTickets(data.tickets);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [search, statusFilter, priorityFilter]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 font-mono text-xs text-brand-black">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-brand-black pb-4">
        <div>
          <h1 className="font-heading text-4xl sm:text-5xl font-black uppercase text-brand-black">
            MY SUPPORT TICKETS
          </h1>
          <p className="text-[11px] text-brand-black/60 uppercase mt-1">
            MONITOR ACTIVE INCIDENT RESOLUTION LIFECYCLES
          </p>
        </div>
        <Link
          href="/customer/new-ticket"
          className="px-4 py-2.5 bg-brand-primary text-brand-white font-bold uppercase text-xs border-2 border-brand-black shadow-hard-green hover:bg-brand-accent hover:text-brand-black transition"
        >
          [+] NEW TICKET
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-brand-white border-2 border-brand-black p-4 shadow-hard flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-brand-black/50 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="SEARCH TICKET ID, KEYWORD..."
            className="w-full text-xs font-mono bg-brand-offwhite border border-brand-black pl-9 pr-3 py-2 text-brand-black focus:bg-brand-white focus:outline-hidden uppercase"
          />
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-bold uppercase bg-brand-offwhite border border-brand-black px-3 py-2 text-brand-black focus:outline-hidden"
          >
            <option value="All">STATUS: ALL</option>
            <option value="Open">STATUS: OPEN</option>
            <option value="Assigned">STATUS: ASSIGNED</option>
            <option value="In Progress">STATUS: IN PROGRESS</option>
            <option value="Waiting for Customer">STATUS: WAITING</option>
            <option value="Resolved">STATUS: RESOLVED</option>
            <option value="Closed">STATUS: CLOSED</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="text-xs font-bold uppercase bg-brand-offwhite border border-brand-black px-3 py-2 text-brand-black focus:outline-hidden"
          >
            <option value="All">PRIORITY: ALL</option>
            <option value="Critical">PRIORITY: CRITICAL</option>
            <option value="High">PRIORITY: HIGH</option>
            <option value="Medium">PRIORITY: MEDIUM</option>
            <option value="Low">PRIORITY: LOW</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-brand-white border-2 border-brand-black shadow-hard overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs font-bold uppercase text-brand-black/50">
            FETCHING TICKETS...
          </div>
        ) : tickets.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Ticket className="w-8 h-8 text-brand-black/30 mx-auto" />
            <p className="text-sm font-bold uppercase text-brand-black">NO MATCHING TICKETS LOCATED</p>
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
                  <th className="py-2.5 px-4 font-bold">ASSIGNED SPECIALIST</th>
                  <th className="py-2.5 px-4 text-right font-bold">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-black/20">
                {tickets.map((t) => (
                  <tr key={t.id} className="hover:bg-brand-offwhite transition">
                    <td className="py-3 px-4 font-bold text-brand-primary">{t.ticket_number}</td>
                    <td className="py-3 px-4 font-bold text-brand-black max-w-sm truncate uppercase">{t.subject}</td>
                    <td className="py-3 px-4 uppercase">{t.category}</td>
                    <td className="py-3 px-4"><PriorityBadge priority={t.priority} /></td>
                    <td className="py-3 px-4"><StatusBadge status={t.status} /></td>
                    <td className="py-3 px-4 uppercase">{t.agent_name || "TRIAGE QUEUE"}</td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/customer/tickets/${t.id}`}
                        className="font-bold text-brand-primary hover:text-brand-black underline uppercase"
                      >
                        INSPECT &gt;&gt;
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
