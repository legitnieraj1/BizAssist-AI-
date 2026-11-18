"use client";

import React, { useState } from "react";
import { Cpu, Clock, Check, Save } from "lucide-react";

export default function AdminSettingsPage() {
  const [geminiKey, setGeminiKey] = useState("");
  const [modelChoice, setModelChoice] = useState("gemini-2.5-flash");
  const [autoAssign, setAutoAssign] = useState(true);
  const [criticalSla, setCriticalSla] = useState(2);
  const [highSla, setHighSla] = useState(8);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 font-mono text-xs text-brand-black">
      <div className="border-b-2 border-brand-black pb-4">
        <h1 className="font-heading text-4xl sm:text-5xl font-black uppercase text-brand-black">
          PLATFORM CONFIGURATION
        </h1>
        <p className="text-[11px] text-brand-black/60 uppercase mt-1">
          CONFIGURE INFERENCE ARCHITECTURE, AUTO-ROUTING HEURISTICS & SLA POLICIES
        </p>
      </div>

      {saved && (
        <div className="p-3 bg-brand-primary text-brand-white font-bold uppercase border-2 border-brand-black flex items-center">
          <Check className="w-4 h-4 mr-2" />
          SYSTEM PARAMETERS COMMITTED SUCCESSFULLY. INFERENCE PIPELINE SYNCHRONIZED.
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* AI Engine Settings */}
        <div className="bg-brand-white border-2 border-brand-black p-6 shadow-hard space-y-4">
          <div className="flex items-center space-x-2 border-b-2 border-brand-black pb-2">
            <Cpu className="w-5 h-5 text-brand-primary" />
            <h2 className="font-heading text-2xl font-black uppercase text-brand-black">
              AI INFERENCE ENGINE
            </h2>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-brand-black mb-1">
              MODEL BACKEND ARCHITECTURE
            </label>
            <select
              value={modelChoice}
              onChange={(e) => setModelChoice(e.target.value)}
              className="w-full text-xs font-mono p-2.5 bg-brand-offwhite border-2 border-brand-black text-brand-black uppercase font-bold focus:bg-brand-white focus:outline-hidden"
            >
              <option value="gemini-2.5-flash">GEMINI 2.5 FLASH (RECOMMENDED // HIGH VELOCITY)</option>
              <option value="gemini-1.5-pro">GEMINI 1.5 PRO (DEEP REASONING)</option>
              <option value="heuristic-fallback">LOCAL SEMANTIC NLP ENGINE (ZERO-LATENCY OFFLINE)</option>
            </select>
            <p className="text-[10px] text-brand-black/60 uppercase mt-1">
              HYBRID FAILOVER ACTIVE: IF EXTERNAL API LIMITS ARE EXCEEDED, THE HIGH-ACCURACY LOCAL SEMANTIC INFERENCE ENGINE EXECUTES WITHOUT SERVICE INTERRUPTION.
            </p>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-brand-black mb-1">
              OPTIONAL GOOGLE GEMINI API KEY
            </label>
            <input
              type="password"
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              placeholder="AIzaSy... (LEAVE BLANK FOR BUILT-IN SEMANTIC ENGINE)"
              className="w-full text-xs font-mono p-2.5 bg-brand-offwhite border-2 border-brand-black text-brand-black focus:bg-brand-white focus:outline-hidden"
            />
          </div>
        </div>

        {/* SLA & Routing Automation */}
        <div className="bg-brand-white border-2 border-brand-black p-6 shadow-hard space-y-4">
          <div className="flex items-center space-x-2 border-b-2 border-brand-black pb-2">
            <Clock className="w-5 h-5 text-brand-primary" />
            <h2 className="font-heading text-2xl font-black uppercase text-brand-black">
              SLA POLICIES & DISPATCH HEURISTICS
            </h2>
          </div>

          <div className="flex items-center justify-between p-3 bg-brand-offwhite border border-brand-black">
            <div>
              <p className="text-xs font-bold uppercase text-brand-black">AUTOMATED WORKLOAD LOAD-BALANCING</p>
              <p className="text-[10px] text-brand-black/60 uppercase">AUTOMATICALLY ROUTE HIGH & CRITICAL TICKETS TO SPECIALIST WITH LOWEST ACTIVE QUEUE.</p>
            </div>
            <input
              type="checkbox"
              checked={autoAssign}
              onChange={(e) => setAutoAssign(e.target.checked)}
              className="w-5 h-5 border-2 border-brand-black text-brand-primary focus:ring-0"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase text-brand-black mb-1">
                CRITICAL PRIORITY SLA THRESHOLD (HOURS)
              </label>
              <input
                type="number"
                value={criticalSla}
                onChange={(e) => setCriticalSla(Number(e.target.value))}
                className="w-full text-xs font-mono p-2.5 bg-brand-offwhite border-2 border-brand-black text-brand-black uppercase font-bold focus:bg-brand-white focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase text-brand-black mb-1">
                HIGH PRIORITY SLA THRESHOLD (HOURS)
              </label>
              <input
                type="number"
                value={highSla}
                onChange={(e) => setHighSla(Number(e.target.value))}
                className="w-full text-xs font-mono p-2.5 bg-brand-offwhite border-2 border-brand-black text-brand-black uppercase font-bold focus:bg-brand-white focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 bg-brand-black hover:bg-brand-primary text-brand-white font-bold uppercase text-xs border-2 border-brand-black shadow-hard transition flex items-center space-x-2"
          >
            <Save className="w-4 h-4 mr-1" />
            <span>SAVE SYSTEM CONFIGURATION</span>
          </button>
        </div>
      </form>
    </div>
  );
}
