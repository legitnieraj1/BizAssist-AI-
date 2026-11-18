"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Ticket } from "lucide-react";
import { StatusBadge, PriorityBadge, SentimentBadge } from "@/components/Badges";

interface AdminTicketItem {
  id: string;
  ticket_number: string;
  subject: string;
  category: string;
  priority: string;
  sentiment: string;
  status: string;
  customer_name?: string;
  agent_name?: string;
  assigned_agent_id?: string | null;
  created_at: string;
}

interface AgentOption {
  id: string;
  full_name: string;
  active_tickets: number;
}

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<AdminTicketItem[]>([]);
  const [agents, setAgents] = useState<AgentOption[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [agentFilter, setAgentFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  const fetchTickets = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter !== "All") params.set("status", statusFilter);
      if (priorityFilter !== "All") params.set("priority", priorityFilter);
      if (agentFilter !== "All") params.set("assigned_agent_id", agentFilter);

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

  const fetchAgents = async () => {
    try {
      const res = await fetch("/api/agents");
      const data = await res.json();
      if (data.agents) setAgents(data.agents);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [search, statusFilter, priorityFilter, agentFilter]);

  const handleAssign = async (ticketId: string, agentId: string) => {
    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assigned_agent_id: agentId || null })
      });
      const data = await res.json();
      if (data.success) {
        fetchTickets();
      }
    } catch {
      // ignore
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 font-mono text-xs text-brand-black">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-brand-black pb-4">
        <div>
          <h1 className="font-heading text-4xl sm:text-5xl font-black uppercase text-brand-black">
            MASTER TICKET REGISTRY
          </h1>
          <p className="text-[11px] text-brand-black/60 uppercase mt-1">
            GLOBAL QUEUE WITH INSTANT AGENT WORKLOAD ROUTING & STATUS CONTROL
          </p>
        </div>
        <div className="text-xs font-bold uppercase bg-brand-white px-3 py-1.5 border-2 border-brand-black">
          ACTIVE REGISTRY: {tickets.length}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-brand-white border-2 border-brand-black p-4 shadow-hard flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-brand-black/50 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="SEARCH TICKET ID, CLIENT NAME, COMPLAINT..."
            className="w-full text-xs font-mono bg-brand-offwhite border border-brand-black pl-9 pr-3 py-2 text-brand-black focus:bg-brand-white focus:outline-hidden uppercase"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Agent Filter */}
          <select
            value={agentFilter}
            onChange={(e) => setAgentFilter(e.target.value)}
            className="text-xs font-bold uppercase bg-brand-offwhite border border-brand-black px-3 py-2 text-brand-black focus:outline-hidden"
          >
            <option value="All">AGENTS: ALL</option>
            <option value="unassigned">UNASSIGNED ONLY</option>
            {agents.map((ag) => (
              <option key={ag.id} value={ag.id}>
                {ag.full_name.toUpperCase()}
              </option>
            ))}
          </select>

          {/* Status Filter */}
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

          {/* Priority Filter */}
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
            FETCHING REGISTRY...
          </div>
        ) : tickets.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Ticket className="w-8 h-8 text-brand-black/30 mx-auto" />
            <p className="text-sm font-bold uppercase text-brand-black">NO MATCHING TICKETS IN SYSTEM</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-brand-black text-brand-white uppercase text-[11px] border-b-2 border-brand-black">
                <tr>
                  <th className="py-2.5 px-4 font-bold">TICKET ID</th>
                  <th className="py-2.5 px-4 font-bold">CLIENT</th>
                  <th className="py-2.5 px-4 font-bold">SUBJECT</th>
                  <th className="py-2.5 px-4 font-bold">PRIORITY</th>
                  <th className="py-2.5 px-4 font-bold">SENTIMENT</th>
                  <th className="py-2.5 px-4 font-bold">STATUS</th>
                  <th className="py-2.5 px-4 font-bold">ROUTER / ASSIGNMENT</th>
                  <th className="py-2.5 px-4 text-right font-bold">AUDIT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-black/20">
                {tickets.map((t) => (
                  <tr key={t.id} className="hover:bg-brand-offwhite transition">
                    <td className="py-3 px-4 font-bold text-brand-primary">{t.ticket_number}</td>
                    <td className="py-3 px-4 font-bold uppercase">{t.customer_name || "CUSTOMER"}</td>
                    <td className="py-3 px-4 max-w-xs truncate uppercase font-medium">{t.subject}</td>
                    <td className="py-3 px-4"><PriorityBadge priority={t.priority} /></td>
                    <td className="py-3 px-4"><SentimentBadge sentiment={t.sentiment} /></td>
                    <td className="py-3 px-4"><StatusBadge status={t.status} /></td>
                    <td className="py-3 px-4">
                      {/* Fast Assignment Dropdown */}
                      <select
                        value={t.assigned_agent_id || ""}
                        onChange={(e) => handleAssign(t.id, e.target.value)}
                        className="text-[11px] font-bold uppercase bg-brand-offwhite border border-brand-black px-2 py-1 text-brand-black focus:outline-hidden"
                      >
                        <option value="">UNASSIGNED</option>
                        {agents.map((ag) => (
                          <option key={ag.id} value={ag.id}>
                            {ag.full_name.toUpperCase()} ({ag.active_tickets})
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/admin/tickets/${t.id}`}
                        className="px-2.5 py-1 bg-brand-black text-brand-white font-bold uppercase text-[11px] border border-brand-black hover:bg-brand-primary transition"
                      >
                        [INSPECT]
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
