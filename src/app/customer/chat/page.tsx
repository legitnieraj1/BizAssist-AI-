"use client";

import React from "react";
import Link from "next/link";
import ChatWidget from "@/components/ChatWidget";
import { ArrowLeft } from "lucide-react";

export default function CustomerChatPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 font-mono text-xs text-brand-black">
      <div className="flex items-center justify-between border-b-2 border-brand-black pb-3">
        <Link
          href="/customer"
          className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-brand-black hover:text-brand-primary transition"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          &lt;&lt; BACK TO CUSTOMER OVERVIEW
        </Link>
        <span className="text-[10px] text-brand-black/60 uppercase font-bold">
          MODULE 06 // AI KNOWLEDGE-BASE ASSISTANT
        </span>
      </div>

      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="px-2 py-0.5 bg-brand-primary text-brand-accent text-[10px] font-bold uppercase border border-brand-accent">
          RAG-GROUNDED INTERACTIVE INFERENCE
        </span>
        <h1 className="font-heading text-4xl sm:text-5xl font-black uppercase text-brand-black">
          AI KNOWLEDGE ASSISTANT
        </h1>
        <p className="text-xs text-brand-black/70 uppercase">
          Query company documentation in natural language. If answers are not found in verified records, the assistant immediately offers to escalate your issue to human specialists.
        </p>
      </div>

      {/* Embedded Chatbot */}
      <ChatWidget embedded={true} />
    </div>
  );
}
