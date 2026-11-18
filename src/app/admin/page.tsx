"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Headphones
} from "lucide-react";

interface AnalyticsData {
  kpis: {
    totalTickets: number;
    openTickets: number;
    inProgressTickets: number;
    waitingTickets: number;
    resolvedTickets: number;
    criticalTickets: number;
    avgResolutionHours: number;
    aiAutomatedRate: number;
  };
  statusDistribution: Array<{ status: string; count: number }>;
  priorityDistribution: Array<{ priority: string; count: number }>;
  categoryDistribution: Array<{ category: string; count: number }>;
  agentPerformance: Array<{
    id: string;
    full_name: string;
    assigned_count: number;
    resolved_count: number;
    active_count: number;
    avg_resolution_hours: number;
  }>;
  trends: Array<{ date: string; created: number; resolved: number }>;
}

export default function AdminOverviewPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [dateRange, setDateRange] = useState("30d");

  const fetchAnalytics = async (range: string) => {
    try {
      const res = await fetch(`/api/analytics?range=${range}`);
      const result = await res.json();
      setData(result);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchAnalytics(dateRange);
  }, [dateRange]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-mono text-xs text-brand-black">
      {/* Top Header & Range Filter */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-brand-black pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 bg-brand-primary text-brand-accent text-[10px] font-bold uppercase border border-brand-accent">
              ADMIN CONTROL // BIZASSIST AI
            </span>
            <span className="text-brand-black/60 text-[10px] uppercase font-bold">TELEMETRY MATRIX // TEAM 3</span>
          </div>
          <h1 className="font-heading text-4xl sm:text-6xl font-black uppercase tracking-tight text-brand-black mt-1">
            OPERATIONS & ANALYTICS
          </h1>
          <p className="text-[11px] text-brand-black/70 uppercase">
            REAL-TIME SLA MONITORING, AI TRIAGE DISTRIBUTION, AND RESOLUTION VELOCITY
          </p>
        </div>

        {/* Date Filter */}
        <div className="flex items-center bg-brand-white border-2 border-brand-black p-1 shadow-hard">
          <button
            onClick={() => setDateRange("today")}
            className={`px-3 py-1 text-xs font-bold uppercase transition ${
              dateRange === "today" ? "bg-brand-primary text-brand-white" : "text-brand-black hover:bg-brand-offwhite"
            }`}
          >
            TODAY
          </button>
          <button
            onClick={() => setDateRange("7d")}
            className={`px-3 py-1 text-xs font-bold uppercase transition ${
              dateRange === "7d" ? "bg-brand-primary text-brand-white" : "text-brand-black hover:bg-brand-offwhite"
            }`}
          >
            7 DAYS
          </button>
          <button
            onClick={() => setDateRange("30d")}
            className={`px-3 py-1 text-xs font-bold uppercase transition ${
              dateRange === "30d" ? "bg-brand-primary text-brand-white" : "text-brand-black hover:bg-brand-offwhite"
            }`}
          >
            30 DAYS
          </button>
        </div>
      </div>

      {/* KPI Numerical Displays (Section 06 A: Large display with Imbue, metadata with Victor Mono) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-brand-white p-4 border-2 border-brand-black shadow-hard">
          <span className="text-[10px] font-bold text-brand-black/60 uppercase block">TOTAL TICKETS</span>
          <span className="font-heading text-5xl font-black text-brand-black block mt-1">
            {data?.kpis.totalTickets ?? "--"}
          </span>
          <span className="text-[9px] font-bold text-brand-primary uppercase mt-1 block">INGESTED // ACTIVE</span>
        </div>

        <div className="bg-brand-white p-4 border-2 border-brand-black shadow-hard">
          <span className="text-[10px] font-bold text-brand-accent bg-brand-black px-1 uppercase inline-block">
            OPEN TICKETS
          </span>
          <span className="font-heading text-5xl font-black text-brand-black block mt-1">
            {data?.kpis.openTickets ?? "--"}
          </span>
          <span className="text-[9px] font-bold text-brand-black/60 uppercase mt-1 block">AWAITING TRIAGE</span>
        </div>

        <div className="bg-brand-white p-4 border-2 border-brand-black shadow-hard">
          <span className="text-[10px] font-bold text-brand-black/60 uppercase block">IN PROGRESS</span>
          <span className="font-heading text-5xl font-black text-brand-black block mt-1">
            {data?.kpis.inProgressTickets ?? "--"}
          </span>
          <span className="text-[9px] font-bold text-brand-primary uppercase mt-1 block">WITH SPECIALISTS</span>
        </div>

        <div className="bg-brand-white p-4 border-2 border-brand-black shadow-hard">
          <span className="text-[10px] font-bold text-brand-primary uppercase block">RESOLVED TICKETS</span>
          <span className="font-heading text-5xl font-black text-brand-primary block mt-1">
            {data?.kpis.resolvedTickets ?? "--"}
          </span>
          <span className="text-[9px] font-bold text-brand-primary uppercase mt-1 block">SLA MET (96.8%)</span>
        </div>

        <div className="bg-brand-white p-4 border-2 border-brand-black shadow-hard">
          <span className="text-[10px] font-bold text-brand-pink bg-brand-black px-1 uppercase inline-block">
            CRITICAL TICKETS
          </span>
          <span className="font-heading text-5xl font-black text-brand-pink block mt-1">
            {data?.kpis.criticalTickets ?? "--"}
          </span>
          <span className="text-[9px] font-bold text-brand-pink uppercase mt-1 block">IMMEDIATE PAGING</span>
        </div>

        <div className="bg-brand-black text-brand-white p-4 border-2 border-brand-primary shadow-hard-green">
          <span className="text-[10px] font-bold text-brand-accent uppercase block">AVG RESOLUTION</span>
          <span className="font-heading text-5xl font-black text-brand-accent block mt-1">
            {data?.kpis.avgResolutionHours ?? "--"}H
          </span>
          <span className="text-[9px] font-bold text-brand-offwhite/60 uppercase mt-1 block">45% FASTER WITH AI</span>
        </div>
      </div>

      {/* Visualizations Section (Section 06 A: Visualizations 1 & 2) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visualization 1: Volume Overview */}
        <div className="lg:col-span-2 bg-brand-white border-2 border-brand-black p-6 shadow-hard space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-brand-black pb-3">
            <div>
              <h2 className="font-heading text-2xl font-black uppercase text-brand-black flex items-center">
                <TrendingUp className="w-5 h-5 mr-1.5 text-brand-primary" />
                TICKET VOLUME & RESOLUTION TRENDS
              </h2>
              <p className="text-[10px] text-brand-black/60 uppercase">DAILY INGESTION VS RESOLUTION VELOCITY</p>
            </div>
            <div className="flex items-center space-x-3 text-[11px] font-bold uppercase">
              <span className="flex items-center text-brand-black">
                <span className="w-2.5 h-2.5 bg-brand-black mr-1 border border-brand-black" />
                CREATED
              </span>
              <span className="flex items-center text-brand-primary">
                <span className="w-2.5 h-2.5 bg-brand-primary mr-1 border border-brand-black" />
                RESOLVED
              </span>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="h-64 flex items-end justify-between gap-3 pt-6 px-4 bg-brand-offwhite border border-brand-black">
            {data?.trends.map((item) => (
              <div key={item.date} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <div className="w-full flex items-end justify-center gap-1.5 h-48">
                  {/* Created Bar */}
                  <div
                    style={{ height: `${(item.created / 20) * 100}%` }}
                    className="w-1/2 bg-brand-black hover:bg-brand-accent transition border border-brand-black"
                    title={`Created: ${item.created}`}
                  />
                  {/* Resolved Bar */}
                  <div
                    style={{ height: `${(item.resolved / 20) * 100}%` }}
                    className="w-1/2 bg-brand-primary hover:bg-brand-accent transition border border-brand-black"
                    title={`Resolved: ${item.resolved}`}
                  />
                </div>
                <span className="text-[11px] font-bold text-brand-black uppercase">{item.date}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Visualization 2: Status Distribution */}
        <div className="bg-brand-white border-2 border-brand-black p-6 shadow-hard space-y-4 flex flex-col justify-between">
          <div>
            <div className="border-b-2 border-brand-black pb-3">
              <h2 className="font-heading text-2xl font-black uppercase text-brand-black">
                STATUS DISTRIBUTION
              </h2>
              <p className="text-[10px] text-brand-black/60 uppercase">LIFECYCLE PIPELINE BREAKDOWN</p>
            </div>

            <div className="mt-4 space-y-3">
              {data?.statusDistribution.map((s) => {
                const total = data.kpis.totalTickets || 1;
                const pct = Math.round((s.count / total) * 100);
                return (
                  <div key={s.status}>
                    <div className="flex items-center justify-between text-xs mb-1 font-bold uppercase">
                      <span>{s.status}</span>
                      <span>{s.count} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-brand-offwhite border border-brand-black h-3 overflow-hidden">
                      <div
                        style={{ width: `${pct}%` }}
                        className={`h-full ${
                          s.status === "Open"
                            ? "bg-brand-accent"
                            : s.status === "Assigned"
                            ? "bg-brand-primary"
                            : s.status === "In Progress"
                            ? "bg-brand-black"
                            : s.status === "Resolved"
                            ? "bg-brand-primary"
                            : "bg-brand-pink"
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <Link
            href="/admin/tickets"
            className="w-full py-2.5 bg-brand-black text-brand-white font-bold uppercase text-center text-xs border border-brand-black hover:bg-brand-primary transition shadow-hard"
          >
            MANAGE MASTER TICKETS &rarr;
          </Link>
        </div>
      </div>

      {/* Visualizations 3 & 4: Priority & Category Distributions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Visualization 3: Priority */}
        <div className="bg-brand-white border-2 border-brand-black p-6 shadow-hard space-y-4">
          <div className="border-b-2 border-brand-black pb-3">
            <h2 className="font-heading text-2xl font-black uppercase text-brand-black">
              AI PRIORITY CLASSIFICATION
            </h2>
            <p className="text-[10px] text-brand-black/60 uppercase">AUTOMATED URGENCY DISTRIBUTION</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {data?.priorityDistribution.map((p) => (
              <div
                key={p.priority}
                className={`p-4 border-2 border-brand-black ${
                  p.priority === "Critical"
                    ? "bg-brand-pink text-brand-white shadow-hard-pink"
                    : p.priority === "High"
                    ? "bg-brand-accent text-brand-black shadow-hard-yellow"
                    : p.priority === "Medium"
                    ? "bg-brand-white text-brand-black shadow-hard"
                    : "bg-brand-offwhite text-brand-black"
                }`}
              >
                <span className="text-[10px] font-bold uppercase tracking-wider block">{p.priority}</span>
                <span className="font-heading text-4xl font-black block mt-1">{p.count}</span>
                <span className="text-[9px] font-bold uppercase block mt-0.5 opacity-80">TICKETS</span>
              </div>
            ))}
          </div>
        </div>

        {/* Visualization 4: Category */}
        <div className="bg-brand-white border-2 border-brand-black p-6 shadow-hard space-y-4">
          <div className="border-b-2 border-brand-black pb-3">
            <h2 className="font-heading text-2xl font-black uppercase text-brand-black">
              CATEGORY TAXONOMY
            </h2>
            <p className="text-[10px] text-brand-black/60 uppercase">QUERY VOLUME BY BUSINESS VERTICAL</p>
          </div>

          <div className="space-y-2">
            {data?.categoryDistribution.map((c) => {
              const total = data.kpis.totalTickets || 1;
              const pct = Math.round((c.count / total) * 100);
              return (
                <div key={c.category} className="flex items-center justify-between p-2 bg-brand-offwhite border border-brand-black font-bold uppercase">
                  <span>{c.category}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-brand-primary">{c.count}</span>
                    <span className="text-brand-black/50 text-[10px]">({pct}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Visualization 5: Agent Performance */}
      <div className="bg-brand-white border-2 border-brand-black shadow-hard overflow-hidden">
        <div className="p-4 border-b-2 border-brand-black flex items-center justify-between">
          <div>
            <h2 className="font-heading text-2xl font-black uppercase text-brand-black flex items-center">
              <Headphones className="w-5 h-5 mr-1.5 text-brand-primary" />
              SUPPORT AGENT WORKLOAD & PERFORMANCE
            </h2>
            <p className="text-[10px] text-brand-black/60 uppercase">RESOLUTION VELOCITY & ACTIVE QUEUE ASSIGNMENTS</p>
          </div>
          <Link
            href="/admin/agents"
            className="text-xs font-bold text-brand-primary hover:text-brand-black uppercase underline"
          >
            ROSTER DIRECTORY &rarr;
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-brand-black text-brand-white uppercase text-[11px] border-b-2 border-brand-black">
              <tr>
                <th className="py-2.5 px-4 font-bold">SUPPORT AGENT</th>
                <th className="py-2.5 px-4 font-bold">TOTAL ASSIGNED</th>
                <th className="py-2.5 px-4 font-bold">ACTIVE QUEUE</th>
                <th className="py-2.5 px-4 font-bold">RESOLVED</th>
                <th className="py-2.5 px-4 font-bold">RESOLUTION RATE</th>
                <th className="py-2.5 px-4 font-bold">AVG RESOLUTION TIME</th>
                <th className="py-2.5 px-4 text-right font-bold">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-black/20">
              {data?.agentPerformance.map((agent) => {
                const total = agent.assigned_count || 1;
                const rate = Math.round((agent.resolved_count / total) * 100);
                return (
                  <tr key={agent.id} className="hover:bg-brand-offwhite transition">
                    <td className="py-3 px-4 font-bold uppercase text-brand-black">
                      {agent.full_name}
                    </td>
                    <td className="py-3 px-4 font-bold">{agent.assigned_count}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 bg-brand-accent text-brand-black border border-brand-black font-bold uppercase text-[10px]">
                        {agent.active_count} ACTIVE
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-brand-primary">{agent.resolved_count}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2 font-bold">
                        <div className="w-16 bg-brand-offwhite border border-brand-black h-2 overflow-hidden">
                          <div style={{ width: `${rate}%` }} className="bg-brand-primary h-full" />
                        </div>
                        <span>{rate}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 uppercase">{agent.avg_resolution_hours} HOURS</td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/admin/tickets?assigned_agent_id=${agent.id}`}
                        className="font-bold text-brand-primary hover:text-brand-black underline uppercase"
                      >
                        WORKLOAD &rarr;
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
