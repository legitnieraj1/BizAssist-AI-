"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Mail, ArrowRight } from "lucide-react";

interface AgentMetric {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  total_assigned: number;
  active_tickets: number;
  resolved_tickets: number;
  critical_tickets: number;
}

export default function AdminAgentsPage() {
  const [agents, setAgents] = useState<AgentMetric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAgentsData() {
      try {
        const res = await fetch("/api/agents");
        const data = await res.json();
        if (data.agents) setAgents(data.agents);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    fetchAgentsData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 font-mono text-xs text-brand-black">
      <div className="border-b-2 border-brand-black pb-4">
        <h1 className="font-heading text-4xl sm:text-5xl font-black uppercase text-brand-black">
          SUPPORT AGENT WORKLOAD ROSTER
        </h1>
        <p className="text-[11px] text-brand-black/60 uppercase mt-1">
          MONITOR ACTIVE QUEUES, CAPACITY THRESHOLDS & INDIVIDUAL RESOLUTION VELOCITY
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full p-12 text-center text-xs font-bold uppercase text-brand-black/50">
            LOADING AGENT ROSTER...
          </div>
        ) : (
          agents.map((agent) => {
            const isHeavyLoad = agent.active_tickets >= 3;
            return (
              <div
                key={agent.id}
                className="bg-brand-white border-2 border-brand-black p-6 shadow-hard flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between border-b border-brand-black/20 pb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-brand-primary text-brand-white font-bold flex items-center justify-center border border-brand-black text-sm uppercase">
                        {agent.full_name.slice(0, 2)}
                      </div>
                      <div>
                        <h3 className="font-heading text-xl font-bold uppercase text-brand-black leading-tight">
                          {agent.full_name}
                        </h3>
                        <p className="text-[11px] text-brand-black/70 flex items-center mt-0.5">
                          <Mail className="w-3 h-3 mr-1 text-brand-primary" />
                          {agent.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div className="mt-3 flex items-center justify-between text-[11px] font-bold uppercase">
                    <span className="text-brand-black/60">WORKLOAD STATUS:</span>
                    <span
                      className={`px-2 py-0.5 border text-[10px] ${
                        isHeavyLoad
                          ? "bg-brand-pink text-brand-white border-brand-black"
                          : "bg-brand-primary text-brand-white border-brand-black"
                      }`}
                    >
                      {isHeavyLoad ? "HEAVY LOAD" : "AVAILABLE"}
                    </span>
                  </div>

                  {/* Metrics Grid */}
                  <div className="mt-3 grid grid-cols-2 gap-2 text-[10px]">
                    <div className="bg-brand-offwhite p-2.5 border border-brand-black">
                      <span className="font-bold text-brand-black/60 uppercase block">ACTIVE QUEUE</span>
                      <span className="font-heading text-2xl font-black text-brand-black block mt-0.5">{agent.active_tickets}</span>
                    </div>

                    <div className="bg-brand-primary p-2.5 border border-brand-black text-brand-white">
                      <span className="font-bold text-brand-white/70 uppercase block">RESOLVED</span>
                      <span className="font-heading text-2xl font-black text-brand-white block mt-0.5">{agent.resolved_tickets}</span>
                    </div>

                    <div className="bg-brand-offwhite p-2.5 border border-brand-black">
                      <span className="font-bold text-brand-black/60 uppercase block">LIFETIME ASSIGNED</span>
                      <span className="font-heading text-2xl font-black text-brand-black block mt-0.5">{agent.total_assigned}</span>
                    </div>

                    <div className="bg-brand-pink p-2.5 border border-brand-black text-brand-white">
                      <span className="font-bold text-brand-white/80 uppercase block">CRITICAL PENDING</span>
                      <span className="font-heading text-2xl font-black text-brand-white block mt-0.5">{agent.critical_tickets}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-brand-black/20">
                  <Link
                    href={`/admin/tickets?assigned_agent_id=${agent.id}`}
                    className="w-full py-2 bg-brand-black text-brand-white font-bold uppercase text-center text-xs border border-brand-black hover:bg-brand-primary transition block"
                  >
                    INSPECT WORKLOAD &gt;&gt;
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
