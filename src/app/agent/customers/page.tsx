"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Mail, Phone, ArrowRight, Search } from "lucide-react";

interface CustomerRecord {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  total_tickets: number;
  active_tickets: number;
  resolved_tickets: number;
  last_ticket_date: string | null;
}

export default function AgentCustomersPage() {
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCustomers() {
      try {
        const res = await fetch("/api/customers");
        const data = await res.json();
        if (data.customers) setCustomers(data.customers);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    fetchCustomers();
  }, []);

  const filtered = customers.filter(c =>
    c.full_name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 font-mono text-xs text-brand-black">
      <div className="border-b-2 border-brand-black pb-4">
        <h1 className="font-heading text-4xl sm:text-5xl font-black uppercase text-brand-black">
          CUSTOMER QUERY HISTORY
        </h1>
        <p className="text-[11px] text-brand-black/60 uppercase mt-1">
          CENTRALIZED REPOSITORY OF INCOMING COMMUNICATIONS & LIFETIME COMPLAINTS
        </p>
      </div>

      {/* Search */}
      <div className="bg-brand-white border-2 border-brand-black p-4 shadow-hard max-w-md">
        <div className="relative">
          <Search className="w-4 h-4 text-brand-black/50 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="FILTER CLIENT NAME OR EMAIL..."
            className="w-full text-xs font-mono bg-brand-offwhite border border-brand-black pl-9 pr-3 py-2 text-brand-black focus:bg-brand-white focus:outline-hidden uppercase"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full p-12 text-center text-xs font-bold uppercase text-brand-black/50">
            LOADING CLIENT DIRECTORY...
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full p-12 text-center text-xs font-bold uppercase text-brand-black/50">
            NO CLIENTS MATCH CRITERIA.
          </div>
        ) : (
          filtered.map((c) => (
            <div
              key={c.id}
              className="bg-brand-white border-2 border-brand-black p-5 shadow-hard flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center space-x-3 border-b border-brand-black/20 pb-3">
                  <div className="w-9 h-9 bg-brand-primary text-brand-white font-bold flex items-center justify-center border border-brand-black uppercase">
                    {c.full_name.slice(0, 2)}
                  </div>
                  <div>
                    <h3 className="font-heading text-xl font-bold uppercase text-brand-black leading-tight">
                      {c.full_name}
                    </h3>
                    <p className="text-[11px] text-brand-black/70 flex items-center mt-0.5">
                      <Mail className="w-3 h-3 mr-1 text-brand-primary" />
                      {c.email}
                    </p>
                    {c.phone && (
                      <p className="text-[11px] text-brand-black/60 flex items-center mt-0.5">
                        <Phone className="w-3 h-3 mr-1 text-brand-primary" />
                        {c.phone}
                      </p>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[10px]">
                  <div className="bg-brand-offwhite p-2 border border-brand-black">
                    <span className="font-bold text-brand-black/60 uppercase block">TOTAL</span>
                    <span className="font-heading text-xl font-black text-brand-black block mt-0.5">{c.total_tickets}</span>
                  </div>
                  <div className="bg-brand-accent p-2 border border-brand-black">
                    <span className="font-bold text-brand-black uppercase block">ACTIVE</span>
                    <span className="font-heading text-xl font-black text-brand-black block mt-0.5">{c.active_tickets}</span>
                  </div>
                  <div className="bg-brand-primary p-2 border border-brand-black text-brand-white">
                    <span className="font-bold text-brand-white/70 uppercase block">RESOLVED</span>
                    <span className="font-heading text-xl font-black text-brand-white block mt-0.5">{c.resolved_tickets}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-brand-black/20 flex items-center justify-between text-[11px] font-bold">
                <span className="text-brand-black/60 uppercase">
                  LAST INCIDENT: {c.last_ticket_date ? new Date(c.last_ticket_date).toLocaleDateString() : "NONE"}
                </span>
                <Link
                  href={`/agent/tickets?search=${encodeURIComponent(c.full_name)}`}
                  className="text-brand-primary hover:text-brand-black underline uppercase flex items-center"
                >
                  QUERIES <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
