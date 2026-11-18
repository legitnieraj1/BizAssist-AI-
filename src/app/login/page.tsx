"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowRight, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }

      if (data.user.role === "admin") router.push("/admin");
      else if (data.user.role === "agent") router.push("/agent");
      else router.push("/customer");
      router.refresh();
    } catch {
      setError("Network connection failure");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role: "customer" | "agent" | "admin") => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ demoRole: role })
      });
      const data = await res.json();
      if (data.success) {
        if (role === "admin") router.push("/admin");
        else if (role === "agent") router.push("/agent");
        else router.push("/customer");
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-offwhite flex items-center justify-center p-4 font-mono text-xs text-brand-black">
      <div className="w-full max-w-md bg-brand-white border-4 border-brand-black shadow-hard p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="border-b-2 border-brand-black pb-4 text-center">
          <Image src="/logo.png" alt="BizAssist AI" width={220} height={52} className="h-14 w-auto object-contain mx-auto mb-2" priority />
          <h1 className="font-heading text-4xl font-black uppercase text-brand-black">
            BIZASSIST AI
          </h1>
          <p className="text-[11px] text-brand-black/70 uppercase mt-1">
            ACCESS AUTHENTICATION // TEAM 3
          </p>
        </div>

        {/* 1-Click Fast Demo Personas */}
        <div className="bg-brand-black text-brand-offwhite p-3.5 border-2 border-brand-primary space-y-2">
          <span className="text-[10px] font-bold text-brand-accent uppercase block">
            1-CLICK DEMO AUTHENTICATION:
          </span>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              onClick={() => handleDemoLogin("customer")}
              disabled={loading}
              className="p-2 bg-brand-white text-brand-black hover:bg-brand-accent border border-brand-black text-[10px] font-bold uppercase transition"
            >
              [CUSTOMER]
              <span className="block text-[9px] opacity-70">SARAH</span>
            </button>
            <button
              onClick={() => handleDemoLogin("agent")}
              disabled={loading}
              className="p-2 bg-brand-primary text-brand-white hover:bg-brand-white hover:text-brand-black border border-brand-white text-[10px] font-bold uppercase transition"
            >
              [AGENT]
              <span className="block text-[9px] opacity-70">ALEX</span>
            </button>
            <button
              onClick={() => handleDemoLogin("admin")}
              disabled={loading}
              className="p-2 bg-brand-pink text-brand-white hover:bg-brand-accent hover:text-brand-black border border-brand-white text-[10px] font-bold uppercase transition"
            >
              [ADMIN]
              <span className="block text-[9px] opacity-70">ELENA</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-brand-pink text-brand-white font-bold uppercase border-2 border-brand-black text-[11px] flex items-center">
            <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold uppercase text-brand-black mb-1">
              EMAIL ADDRESS
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="E.G. SARAH@ACMECORP.COM"
              className="w-full text-xs font-mono p-2.5 bg-brand-offwhite border-2 border-brand-black text-brand-black focus:bg-brand-white focus:outline-hidden uppercase"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase text-brand-black mb-1">
              PASSWORD
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
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-brand-primary hover:bg-brand-black text-brand-white hover:text-brand-accent font-bold uppercase text-xs border-2 border-brand-black shadow-hard-green transition flex items-center justify-center space-x-1.5 disabled:opacity-50"
          >
            <span>{loading ? "AUTHENTICATING..." : "TRANSMIT CREDENTIALS"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-[11px] text-brand-black/70 uppercase">
          NEW ENTITY?{" "}
          <Link href="/register" className="font-bold text-brand-primary underline hover:text-brand-black">
            REGISTER CUSTOMER ACCOUNT
          </Link>
        </p>
      </div>
    </div>
  );
}
