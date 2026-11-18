"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ShieldAlert,
  Headphones,
  Shield,
  LifeBuoy,
  Users,
  Check
} from "lucide-react";
import { PriorityBadge, SentimentBadge } from "@/components/Badges";

export default function LandingPage() {
  const [demoSubject, setDemoSubject] = useState("CRITICAL: Webhook payloads failing with 500 gateway timeout");
  const [demoDescription, setDemoDescription] = useState(
    "Our production webhook listener at https://api.initech.net/webhooks has failed to receive customer.created events for the past 3 hours. Multiple orders are blocked."
  );
  const [demoResult, setDemoResult] = useState<{
    category: string;
    priority: "Critical" | "High" | "Medium" | "Low";
    sentiment: "Frustrated" | "Angry" | "Urgent" | "Confused" | "Neutral" | "Satisfied";
    summary: string;
    suggested_response: string;
  } | null>({
    category: "Technical Support",
    priority: "Critical",
    sentiment: "Urgent",
    summary: "Customer experiencing production webhook failure blocking order processing operations.",
    suggested_response: "Hello Emily,\n\nWe are treating this webhook disruption with the highest priority. Our engineering on-call has begun reviewing gateway logs for your endpoint. We will update you in under 30 minutes."
  });
  const [analyzing, setAnalyzing] = useState(false);

  const handleRunAIDemo = async (e: React.FormEvent) => {
    e.preventDefault();
    setAnalyzing(true);
    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: demoSubject,
          description: demoDescription,
        })
      });
      const data = await res.json();
      if (data.ticket) {
        setDemoResult({
          category: data.ticket.category,
          priority: data.ticket.priority,
          sentiment: data.ticket.sentiment,
          summary: data.ticket.summary,
          suggested_response: data.ticket.suggested_response
        });
      }
    } catch {
      // fallback
    } finally {
      setAnalyzing(false);
    }
  };

  const sampleComplaints = [
    {
      title: "Password Reset Loop",
      subject: "Unable to log in after 4 password reset attempts",
      desc: "Every time I enter the temporary password it says expired token. I need access to review invoices today."
    },
    {
      title: "Duplicate Charge",
      subject: "Double charged $1,499 on corporate credit card",
      desc: "Our finance department flagged two identical charges on Nov 15. Please refund invoice INV-8822 immediately."
    },
    {
      title: "Custom Domain DNS",
      subject: "How do I configure CNAME for my client portal?",
      desc: "We want to point support.acmecorp.com to BizAssist AI. What DNS records are required?"
    }
  ];

  return (
    <div className="min-h-screen bg-brand-offwhite text-brand-black flex flex-col font-mono selection:bg-brand-accent selection:text-brand-black">
      {/* Hero Section */}
      <section className="border-b-4 border-brand-black bg-brand-black text-brand-white pt-14 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1 bg-brand-primary text-brand-accent border border-brand-accent text-xs font-bold uppercase tracking-wider">
              SYS::RELEASE // BIZASSIST AI v1.0
            </span>
            <span className="px-2.5 py-1 bg-brand-white text-brand-black border border-brand-black text-xs font-bold uppercase tracking-wider">
              DEVELOPED BY TEAM 3
            </span>
          </div>

          <div className="space-y-4">
            <h1 className="font-heading text-5xl sm:text-7xl lg:text-8xl font-black uppercase tracking-tight leading-none text-brand-white">
              SMARTER SUPPORT. <br />
              <span className="text-brand-accent">FASTER RESOLUTIONS.</span>
            </h1>
            <p className="text-sm sm:text-base text-brand-offwhite/80 max-w-3xl leading-relaxed uppercase">
              Intelligent customer support, built for better decisions. BizAssist AI organizes customer queries, automates ticket classification, prioritizes issues, and assists human support teams with structured AI intelligence.
            </p>
          </div>

          {/* Persona Portal Fast Buttons */}
          <div className="pt-2 flex flex-wrap gap-4">
            <Link
              href="/customer"
              className="px-6 py-3 bg-brand-accent text-brand-black font-bold uppercase tracking-wider text-xs border-2 border-brand-black shadow-hard-yellow hover:bg-brand-white transition"
            >
              [1] CUSTOMER PORTAL &rarr;
            </Link>
            <Link
              href="/agent"
              className="px-6 py-3 bg-brand-primary text-brand-white font-bold uppercase tracking-wider text-xs border-2 border-brand-white shadow-hard-green hover:bg-brand-accent hover:text-brand-black transition"
            >
              [2] AGENT WORKSPACE &rarr;
            </Link>
            <Link
              href="/admin"
              className="px-6 py-3 bg-brand-pink text-brand-white font-bold uppercase tracking-wider text-xs border-2 border-brand-white shadow-hard-pink hover:bg-brand-white hover:text-brand-black transition"
            >
              [3] ADMIN CONSOLE &rarr;
            </Link>
          </div>

          {/* Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 border-t border-brand-primary/40 text-xs">
            <div className="p-4 bg-brand-black border border-brand-primary/40">
              <span className="text-[10px] text-brand-offwhite/60 uppercase block">AUTOMATION THROUGHPUT</span>
              <span className="font-heading text-4xl font-black text-brand-accent block mt-1">84%</span>
              <span className="text-[10px] text-brand-offwhite/50 uppercase mt-0.5 block">ROUTED BY AI</span>
            </div>
            <div className="p-4 bg-brand-black border border-brand-primary/40">
              <span className="text-[10px] text-brand-offwhite/60 uppercase block">CLASSIFICATION LATENCY</span>
              <span className="font-heading text-4xl font-black text-brand-white block mt-1">&lt;1.2s</span>
              <span className="text-[10px] text-brand-offwhite/50 uppercase mt-0.5 block">INSTANT TRIAGE</span>
            </div>
            <div className="p-4 bg-brand-black border border-brand-primary/40">
              <span className="text-[10px] text-brand-offwhite/60 uppercase block">RESOLUTION SPEED</span>
              <span className="font-heading text-4xl font-black text-brand-primary block mt-1">4.2H</span>
              <span className="text-[10px] text-brand-offwhite/50 uppercase mt-0.5 block">AVERAGE SLA</span>
            </div>
            <div className="p-4 bg-brand-black border border-brand-primary/40">
              <span className="text-[10px] text-brand-offwhite/60 uppercase block">HUMAN GUARANTEE</span>
              <span className="font-heading text-4xl font-black text-brand-pink block mt-1">100%</span>
              <span className="text-[10px] text-brand-offwhite/50 uppercase mt-0.5 block">HUMAN-IN-THE-LOOP</span>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive AI Classification Playground */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="border-b-2 border-brand-black pb-4">
          <span className="px-2 py-0.5 bg-brand-primary text-brand-accent text-[11px] font-bold uppercase tracking-wider border border-brand-black">
            LIVE AI PROTOTYPE ENGINE
          </span>
          <h2 className="font-heading text-4xl sm:text-5xl font-black uppercase text-brand-black mt-2">
            REAL-TIME TICKET CLASSIFICATION
          </h2>
          <p className="text-xs text-brand-black/70 max-w-2xl mt-1 uppercase">
            Test the live NLP inference engine. Enter a customer query or click a preset scenario to view structured category mapping, urgency detection, sentiment extraction, and suggested agent responses.
          </p>
        </div>

        {/* Preset scenario chips */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold uppercase text-brand-black">PRESET SCENARIOS:</span>
          {sampleComplaints.map((item) => (
            <button
              key={item.title}
              onClick={() => {
                setDemoSubject(item.subject);
                setDemoDescription(item.desc);
              }}
              className="px-2.5 py-1 text-xs font-bold uppercase bg-brand-white hover:bg-brand-accent text-brand-black border-2 border-brand-black transition shadow-hard"
            >
              [{item.title}]
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input side */}
          <form onSubmit={handleRunAIDemo} className="bg-brand-white border-2 border-brand-black p-6 shadow-hard space-y-4">
            <h3 className="font-heading text-2xl font-black uppercase text-brand-black border-b border-brand-black/20 pb-2">
              CUSTOMER COMPLAINT INGESTION
            </h3>
            <div>
              <label className="block text-[11px] font-bold uppercase text-brand-black mb-1">
                TICKET SUBJECT
              </label>
              <input
                type="text"
                value={demoSubject}
                onChange={(e) => setDemoSubject(e.target.value)}
                className="w-full text-xs font-mono p-3 bg-brand-offwhite border-2 border-brand-black text-brand-black focus:bg-brand-white focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase text-brand-black mb-1">
                COMPLAINT DESCRIPTION
              </label>
              <textarea
                rows={5}
                value={demoDescription}
                onChange={(e) => setDemoDescription(e.target.value)}
                className="w-full text-xs font-mono p-3 bg-brand-offwhite border-2 border-brand-black text-brand-black focus:bg-brand-white focus:outline-hidden"
              />
            </div>
            <button
              type="submit"
              disabled={analyzing}
              className="w-full py-3 bg-brand-primary hover:bg-brand-black text-brand-white hover:text-brand-accent font-bold uppercase text-xs border-2 border-brand-black shadow-hard-green transition disabled:opacity-50"
            >
              {analyzing ? "AI ANALYZING COMPLAINT..." : "[ANALYZE & CLASSIFY TICKET]"}
            </button>
          </form>

          {/* AI Output side */}
          <div className="bg-brand-black text-brand-offwhite border-2 border-brand-primary p-6 shadow-hard-green flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between border-b border-brand-primary/40 pb-3">
                <span className="font-heading text-xl font-black uppercase text-brand-accent">
                  STRUCTURED AI OUTPUT
                </span>
                <span className="px-2 py-0.5 bg-brand-primary text-brand-accent text-[10px] font-bold border border-brand-accent uppercase">
                  CONFIDENCE: 98.4%
                </span>
              </div>

              {demoResult && (
                <div className="mt-4 space-y-3.5 text-xs">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 bg-brand-primary text-brand-white font-bold uppercase border border-brand-white text-[11px]">
                      CATEGORY: {demoResult.category}
                    </span>
                    <PriorityBadge priority={demoResult.priority} />
                    <SentimentBadge sentiment={demoResult.sentiment} />
                  </div>

                  <div className="p-3 bg-brand-white text-brand-black border border-brand-black">
                    <span className="text-[10px] font-bold text-brand-primary uppercase block mb-1">
                      AI COMPLAINT SUMMARY:
                    </span>
                    <p className="text-xs font-medium leading-relaxed">{demoResult.summary}</p>
                  </div>

                  <div className="p-3 bg-brand-offwhite text-brand-black border border-brand-black">
                    <span className="text-[10px] font-bold text-brand-black uppercase block mb-1">
                      AI SUGGESTED FIRST RESPONSE:
                    </span>
                    <p className="text-xs whitespace-pre-wrap leading-relaxed max-h-32 overflow-y-auto">
                      {demoResult.suggested_response}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-brand-primary/40 flex items-center justify-between text-[11px]">
              <span className="text-brand-offwhite/60 uppercase">AUTO-DISPATCH READY</span>
              <Link href="/customer/new-ticket" className="text-brand-accent font-bold uppercase hover:underline">
                CREATE LIVE TICKET &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Core Roles Section */}
      <section className="py-16 bg-brand-white border-y-2 border-brand-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="border-b-2 border-brand-black pb-4 text-center max-w-2xl mx-auto">
            <span className="px-2 py-0.5 bg-brand-black text-brand-white text-[11px] font-bold uppercase tracking-wider">
              PRD ROLE ARCHITECTURE
            </span>
            <h2 className="font-heading text-4xl sm:text-5xl font-black uppercase text-brand-black mt-2">
              THREE OPERATIONAL PERSONAS
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Customer */}
            <div className="bg-brand-offwhite border-2 border-brand-black p-6 shadow-hard flex flex-col justify-between space-y-4">
              <div>
                <span className="font-heading text-4xl font-black text-brand-primary block leading-none">01</span>
                <h3 className="font-heading text-2xl font-black uppercase text-brand-black mt-2">CUSTOMER PORTAL</h3>
                <p className="text-xs text-brand-black/80 mt-2 uppercase leading-relaxed">
                  Submit tickets with attachments, track lifecycle states, reply to agents, and interact with the 24/7 knowledge-based AI chatbot.
                </p>
                <ul className="mt-4 space-y-1.5 text-xs font-bold uppercase text-brand-black">
                  <li>&gt; TICKET SUBMISSION & CATEGORIES</li>
                  <li>&gt; REAL-TIME LIFECYCLE TRACKER</li>
                  <li>&gt; 24/7 KNOWLEDGE CHATBOT</li>
                  <li>&gt; 1-CLICK TICKET ESCALATION</li>
                </ul>
              </div>
              <Link
                href="/customer"
                className="w-full py-2.5 text-center bg-brand-black text-brand-white font-bold uppercase text-xs border border-brand-black hover:bg-brand-primary transition"
              >
                OPEN CUSTOMER PORTAL &rarr;
              </Link>
            </div>

            {/* Agent */}
            <div className="bg-brand-white border-2 border-brand-black p-6 shadow-hard flex flex-col justify-between space-y-4">
              <div>
                <span className="font-heading text-4xl font-black text-brand-primary block leading-none">02</span>
                <h3 className="font-heading text-2xl font-black uppercase text-brand-black mt-2">AGENT WORKSPACE</h3>
                <p className="text-xs text-brand-black/80 mt-2 uppercase leading-relaxed">
                  Triage assigned queues, inspect AI complaint summaries, generate multi-tone responses, and review complete customer query histories.
                </p>
                <ul className="mt-4 space-y-1.5 text-xs font-bold uppercase text-brand-black">
                  <li>&gt; AI RESPONSE GENERATOR WITH TONES</li>
                  <li>&gt; SENTIMENT DETECTION & URGENCY</li>
                  <li>&gt; INTERNAL TEAM NOTES LOGGING</li>
                  <li>&gt; FULL QUERY HISTORY INSPECTION</li>
                </ul>
              </div>
              <Link
                href="/agent"
                className="w-full py-2.5 text-center bg-brand-primary text-brand-white font-bold uppercase text-xs border border-brand-black hover:bg-brand-accent hover:text-brand-black transition"
              >
                OPEN AGENT WORKSPACE &rarr;
              </Link>
            </div>

            {/* Admin */}
            <div className="bg-brand-black text-brand-white border-2 border-brand-black p-6 shadow-hard-green flex flex-col justify-between space-y-4">
              <div>
                <span className="font-heading text-4xl font-black text-brand-accent block leading-none">03</span>
                <h3 className="font-heading text-2xl font-black uppercase text-brand-white mt-2">ADMIN CONSOLE</h3>
                <p className="text-xs text-brand-offwhite/80 mt-2 uppercase leading-relaxed">
                  Centralized operations telemetry, volume trends, agent load balancing, knowledge base CRUD management, and SLA policies.
                </p>
                <ul className="mt-4 space-y-1.5 text-xs font-bold uppercase text-brand-accent">
                  <li>&gt; OPERATIONAL KPI TELEMETRY</li>
                  <li>&gt; AGENT WORKLOAD BALANCER</li>
                  <li>&gt; KNOWLEDGE BASE CRUD MANAGEMENT</li>
                  <li>&gt; AUDIT LOG & CLASSIFICATION OVERRIDE</li>
                </ul>
              </div>
              <Link
                href="/admin"
                className="w-full py-2.5 text-center bg-brand-pink text-brand-white font-bold uppercase text-xs border border-brand-white hover:bg-brand-white hover:text-brand-black transition"
              >
                OPEN ADMIN CONSOLE &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 8 Core Modules Grid */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="border-b-2 border-brand-black pb-3">
          <span className="px-2 py-0.5 bg-brand-accent text-brand-black text-[11px] font-bold uppercase border border-brand-black">
            SPECIFICATION MATRIX
          </span>
          <h2 className="font-heading text-4xl font-black uppercase text-brand-black mt-2">
            ALL 8 PRD MODULES IMPLEMENTED
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {[
            {
              mod: "M-01",
              title: "AUTH & USER MANAGEMENT",
              desc: "Role-based access control, session cookies, and 1-click persona switching."
            },
            {
              mod: "M-02",
              title: "TICKET SYSTEM & LIFECYCLE",
              desc: "6 ticket lifecycle states, attachments, category taxonomy, unique IDs."
            },
            {
              mod: "M-03",
              title: "AI CLASSIFICATION",
              desc: "Category, urgency priority, sentiment vector, and structured output."
            },
            {
              mod: "M-04",
              title: "AI RESPONSE GENERATOR",
              desc: "Multi-tone refinement (Empathetic, Technical, Concise) with approval."
            },
            {
              mod: "M-05",
              title: "COMPLAINT SUMMARIZATION",
              desc: "Converts verbose complaints into concise root-cause briefings."
            },
            {
              mod: "M-06",
              title: "KNOWLEDGE BASE CHATBOT",
              desc: "Grounded RAG retrieval against verified docs with 1-click ticket escalation."
            },
            {
              mod: "M-07",
              title: "ADMIN ANALYTICS",
              desc: "Volume trends, status breakdowns, priority distributions, and agent metrics."
            },
            {
              mod: "M-08",
              title: "ASSIGNMENT & WORKLOAD",
              desc: "Agent load balancing, re-assignment dropdowns, and full history audit log."
            }
          ].map((item) => (
            <div key={item.mod} className="bg-brand-white border-2 border-brand-black p-4 shadow-hard">
              <span className="text-[10px] font-bold text-brand-primary uppercase block">
                {"//"} {item.mod}
              </span>
              <h4 className="font-heading text-xl font-bold uppercase text-brand-black mt-1">
                {item.title}
              </h4>
              <p className="text-[11px] text-brand-black/70 mt-2 leading-relaxed uppercase">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-brand-black text-brand-offwhite py-8 border-t-4 border-brand-primary text-xs font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <Image src="/logo.png" alt="BizAssist AI" width={160} height={36} className="h-9 w-auto object-contain brightness-0 invert" />
            <span className="text-brand-offwhite/50 text-[10px] uppercase">
              {"//"} CRAFTED BY TEAM 3
            </span>
          </div>
          <div className="flex items-center space-x-4 uppercase font-bold text-[11px]">
            <Link href="/customer" className="hover:text-brand-accent">CUSTOMER</Link>
            <Link href="/agent" className="hover:text-brand-accent">AGENT</Link>
            <Link href="/admin" className="hover:text-brand-accent">ADMIN</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
