"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Paperclip,
  ArrowRight,
  AlertCircle,
  FileCheck,
  ArrowLeft
} from "lucide-react";
import { TICKET_CATEGORIES } from "@/lib/constants";

export default function NewTicketPage() {
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Technical Support");
  const [contactEmail, setContactEmail] = useState("");
  const [attachmentName, setAttachmentName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAttachmentName(e.target.files[0].name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!subject.trim() || !description.trim()) {
      setError("Ticket subject and technical description are required.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: subject.trim(),
          description: description.trim(),
          category,
          contact_email: contactEmail,
          attachment_name: attachmentName || null
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to submit ticket.");
        return;
      }

      router.push(`/customer/tickets/${data.ticket.id}`);
      router.refresh();
    } catch {
      setError("Network error occurred during ticket transmission.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 font-mono text-xs text-brand-black">
      <Link
        href="/customer"
        className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-brand-black hover:text-brand-primary transition"
      >
        <ArrowLeft className="w-4 h-4 mr-1.5" />
        &lt;&lt; BACK TO CUSTOMER OVERVIEW
      </Link>

      <div className="bg-brand-white border-4 border-brand-black p-6 sm:p-10 shadow-hard space-y-6">
        <div className="border-b-2 border-brand-black pb-4">
          <span className="px-2 py-0.5 bg-brand-primary text-brand-accent text-[10px] font-bold uppercase border border-brand-accent">
            AI CLASSIFICATION PIPELINE ACTIVE
          </span>
          <h1 className="font-heading text-4xl sm:text-5xl font-black uppercase text-brand-black mt-2">
            SUBMIT SUPPORT TICKET
          </h1>
          <p className="text-xs text-brand-black/70 mt-1 uppercase">
            Provide technical issue parameters. The AI pipeline will evaluate urgency, detect sentiment, and route to specialized engineers.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-brand-pink text-brand-white font-bold uppercase border-2 border-brand-black text-[11px] flex items-center">
            <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold uppercase text-brand-black mb-1">
              ISSUE SUBJECT *
            </label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="E.G. WEBHOOK TIMEOUT HALTING ORDER PROCESSING"
              className="w-full text-xs font-mono p-3 bg-brand-offwhite border-2 border-brand-black text-brand-black focus:bg-brand-white focus:outline-hidden uppercase"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase text-brand-black mb-1">
                PRELIMINARY CATEGORY *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs font-mono p-3 bg-brand-offwhite border-2 border-brand-black text-brand-black focus:bg-brand-white focus:outline-hidden uppercase font-bold"
              >
                {TICKET_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-brand-black mb-1">
                NOTIFICATION EMAIL
              </label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="SARAH@ACMECORP.COM"
                className="w-full text-xs font-mono p-3 bg-brand-offwhite border-2 border-brand-black text-brand-black focus:bg-brand-white focus:outline-hidden uppercase"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-brand-black mb-1">
              DETAILED COMPLAINT / INCIDENT LOGS *
            </label>
            <textarea
              required
              rows={6}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="PROVIDE SYSTEM SYMPTOMS, REPRODUCTION STEPS, TIMESTAMPS, AND ESTIMATED BUSINESS IMPACT..."
              className="w-full text-xs font-mono p-3 bg-brand-offwhite border-2 border-brand-black text-brand-black focus:bg-brand-white focus:outline-hidden leading-relaxed uppercase"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-brand-black mb-1">
              SUPPORTING ATTACHMENTS (OPTIONAL)
            </label>
            <div className="flex items-center space-x-3">
              <label className="cursor-pointer inline-flex items-center px-4 py-2 bg-brand-offwhite hover:bg-brand-accent text-brand-black border-2 border-brand-black font-bold uppercase text-xs transition">
                <Paperclip className="w-3.5 h-3.5 mr-1.5" />
                <span>CHOOSE LOG/SCREENSHOT</span>
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileUpload}
                  accept=".png,.jpg,.jpeg,.pdf,.txt,.log"
                />
              </label>
              {attachmentName && (
                <span className="text-xs text-brand-primary font-bold uppercase border border-brand-primary px-2 py-1 bg-brand-white flex items-center">
                  <FileCheck className="w-3.5 h-3.5 mr-1" />
                  {attachmentName}
                </span>
              )}
            </div>
          </div>

          <div className="p-4 bg-brand-black text-brand-offwhite border-2 border-brand-primary text-xs uppercase space-y-1">
            <span className="text-brand-accent font-bold block">{"//"} AUTOMATED CLASSIFICATION PROTOCOL:</span>
            <p className="text-[11px] text-brand-offwhite/80 leading-relaxed">
              BizAssist AI will immediately evaluate ticket urgency, detect customer sentiment, verify priority SLAs, and assign this ticket to an available specialist.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-end space-x-3">
            <Link
              href="/customer"
              className="px-5 py-2.5 border-2 border-brand-black text-brand-black font-bold uppercase text-xs hover:bg-brand-offwhite transition"
            >
              CANCEL
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-brand-primary hover:bg-brand-black text-brand-white hover:text-brand-accent font-bold uppercase text-xs border-2 border-brand-black shadow-hard-green transition flex items-center space-x-2 disabled:opacity-50"
            >
              <span>{submitting ? "INGESTING & CLASSIFYING..." : "[TRANSMIT TICKET]"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
