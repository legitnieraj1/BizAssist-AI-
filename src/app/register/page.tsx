"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowRight, AlertCircle } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName,
          email,
          password,
          phone
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Registration failed");
        return;
      }

      router.push("/customer");
      router.refresh();
    } catch {
      setError("Network connection failure");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-offwhite flex items-center justify-center p-4 font-mono text-xs text-brand-black">
      <div className="w-full max-w-md bg-brand-white border-4 border-brand-black shadow-hard p-6 sm:p-8 space-y-6">
        <div className="border-b-2 border-brand-black pb-4 text-center">
          <Image src="/logo.png" alt="BizAssist AI" width={220} height={52} className="h-14 w-auto object-contain mx-auto mb-2" priority />
          <h1 className="font-heading text-4xl font-black uppercase text-brand-black">
            CUSTOMER ENROLLMENT
          </h1>
          <p className="text-[11px] text-brand-black/70 uppercase mt-1">
            INITIALIZE CLIENT PROFILE // BIZASSIST AI
          </p>
        </div>

        {error && (
          <div className="p-3 bg-brand-pink text-brand-white font-bold uppercase border-2 border-brand-black text-[11px] flex items-center">
            <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold uppercase text-brand-black mb-1">
              FULL NAME
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="E.G. SARAH JENKINS"
              className="w-full text-xs font-mono p-2.5 bg-brand-offwhite border-2 border-brand-black text-brand-black focus:bg-brand-white focus:outline-hidden uppercase"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-brand-black mb-1">
              ORGANIZATION EMAIL
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="SARAH@ACMECORP.COM"
              className="w-full text-xs font-mono p-2.5 bg-brand-offwhite border-2 border-brand-black text-brand-black focus:bg-brand-white focus:outline-hidden uppercase"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-brand-black mb-1">
              ACCOUNT PASSWORD
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full text-xs font-mono p-2.5 bg-brand-offwhite border-2 border-brand-black text-brand-black focus:bg-brand-white focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-brand-black mb-1">
              TELEPHONE (OPTIONAL)
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1-555-0111"
              className="w-full text-xs font-mono p-2.5 bg-brand-offwhite border-2 border-brand-black text-brand-black focus:bg-brand-white focus:outline-hidden uppercase"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-brand-primary hover:bg-brand-black text-brand-white hover:text-brand-accent font-bold uppercase text-xs border-2 border-brand-black shadow-hard-green transition flex items-center justify-center space-x-1.5 disabled:opacity-50"
          >
            <span>{loading ? "INITIALIZING..." : "REGISTER CLIENT ENTITY"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-[11px] text-brand-black/70 uppercase">
          ALREADY ENROLLED?{" "}
          <Link href="/login" className="font-bold text-brand-primary underline hover:text-brand-black">
            AUTHENTICATE &gt;&gt;
          </Link>
        </p>
      </div>
    </div>
  );
}
