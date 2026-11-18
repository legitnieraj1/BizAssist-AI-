"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search } from "lucide-react";

interface CustomerRecord {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  created_at: string;
  total_tickets: number;
  active_tickets: number;
  resolved_tickets: number;
  last_ticket_date: string | null;
}

export default function AdminCustomersPage() {
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
      <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-brand-black pb-4">
        <div>
          <h1 className="font-heading text-4xl sm:text-5xl font-black uppercase text-brand-black">
            CLIENT DIRECTORY
          </h1>
          <p className="text-[11px] text-brand-black/60 uppercase mt-1">
            REGISTERED ORGANIZATIONS, CONTACT RECORDS & LIFETIME TICKETS
          </p>
        </div>
        <div className="text-xs font-bold uppercase bg-brand-white px-3 py-1.5 border-2 border-brand-black">
          CLIENTS: {customers.length}
        </div>
      </div>

      {/* Search */}
      <div className="bg-brand-white border-2 border-brand-black p-4 shadow-hard max-w-md">
        <div className="relative">
          <Search className="w-4 h-4 text-brand-black/50 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="FILTER CLIENTS..."
            className="w-full text-xs font-mono bg-brand-offwhite border border-brand-black pl-9 pr-3 py-2 text-brand-black focus:bg-brand-white focus:outline-hidden uppercase"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-brand-white border-2 border-brand-black shadow-hard overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs font-bold uppercase text-brand-black/50">
            FETCHING DIRECTORY...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs font-bold uppercase text-brand-black/50">
            NO CLIENTS MATCH CRITERIA.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-brand-black text-brand-white uppercase text-[11px] border-b-2 border-brand-black">
                <tr>
                  <th className="py-2.5 px-4 font-bold">CLIENT ENTITY</th>
                  <th className="py-2.5 px-4 font-bold">CONTACT EMAIL</th>
                  <th className="py-2.5 px-4 font-bold">ENROLLED</th>
                  <th className="py-2.5 px-4 font-bold">TOTAL</th>
                  <th className="py-2.5 px-4 font-bold">ACTIVE</th>
                  <th className="py-2.5 px-4 font-bold">RESOLVED</th>
                  <th className="py-2.5 px-4 text-right font-bold">FILTER</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-black/20">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-brand-offwhite transition">
                    <td className="py-3 px-4 font-bold uppercase text-brand-black">{c.full_name}</td>
                    <td className="py-3 px-4 uppercase">{c.email}</td>
                    <td className="py-3 px-4 uppercase text-brand-black/60">
                      {new Date(c.created_at).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td className="py-3 px-4 font-bold">{c.total_tickets}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 bg-brand-accent text-brand-black border border-brand-black font-bold uppercase text-[10px]">
                        {c.active_tickets} ACTIVE
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-brand-primary">{c.resolved_tickets}</td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/admin/tickets?customer_id=${c.id}`}
                        className="font-bold text-brand-primary hover:text-brand-black underline uppercase"
                      >
                        TICKETS &rarr;
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
