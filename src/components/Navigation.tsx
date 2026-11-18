"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import {
  Bell,
  LayoutDashboard,
  Ticket,
  PlusCircle,
  MessageSquare,
  Users,
  BookOpen,
  Settings,
  LogOut,
  ChevronDown,
  CheckCheck
} from "lucide-react";

interface UserSession {
  id: string;
  full_name: string;
  email: string;
  role: "customer" | "agent" | "admin";
  avatar_url?: string;
}

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  link?: string;
  is_read: number;
  created_at: string;
}

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [switching, setSwitching] = useState(false);

  const refreshUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.user) {
        setCurrentUser(data.user);
      }
    } catch {
      // ignore
    }
  };

  const refreshNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      if (data.notifications) {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    refreshUser();
    refreshNotifications();
    const interval = setInterval(refreshNotifications, 10000);
    return () => clearInterval(interval);
  }, [pathname]);

  const handleRoleSwitch = async (role: "customer" | "agent" | "admin") => {
    setSwitching(true);
    try {
      const res = await fetch("/api/auth/me", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role })
      });
      const data = await res.json();
      if (data.success) {
        setCurrentUser(data.user);
        if (role === "customer") router.push("/customer");
        else if (role === "agent") router.push("/agent");
        else if (role === "admin") router.push("/admin");
        router.refresh();
      }
    } finally {
      setSwitching(false);
    }
  };

  const markAllNotifsRead = async () => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAll: true })
    });
    setUnreadCount(0);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setCurrentUser(null);
    router.push("/login");
  };

  const role = currentUser?.role || "customer";

  const customerLinks = [
    { label: "OVERVIEW", href: "/customer", icon: LayoutDashboard },
    { label: "SUBMIT TICKET", href: "/customer/new-ticket", icon: PlusCircle },
    { label: "MY TICKETS", href: "/customer/tickets", icon: Ticket },
    { label: "AI ASSISTANT", href: "/customer/chat", icon: MessageSquare },
  ];

  const agentLinks = [
    { label: "WORKSPACE", href: "/agent", icon: LayoutDashboard },
    { label: "ASSIGNED QUEUE", href: "/agent/tickets", icon: Ticket },
    { label: "CUSTOMER HISTORY", href: "/agent/customers", icon: Users },
  ];

  const adminLinks = [
    { label: "ANALYTICS", href: "/admin", icon: LayoutDashboard },
    { label: "ALL TICKETS", href: "/admin/tickets", icon: Ticket },
    { label: "AGENTS", href: "/admin/agents", icon: Users },
    { label: "CUSTOMERS", href: "/admin/customers", icon: Users },
    { label: "KNOWLEDGE BASE", href: "/admin/knowledge-base", icon: BookOpen },
    { label: "SETTINGS", href: "/admin/settings", icon: Settings },
  ];

  const activeLinks = role === "admin" ? adminLinks : role === "agent" ? agentLinks : customerLinks;

  return (
    <header className="sticky top-0 z-40 bg-brand-black text-brand-white border-b-2 border-brand-primary">
      {/* Top Demo Bar / Persona Switcher (Developer-Led Aesthetic) */}
      <div className="bg-brand-black text-brand-offwhite text-xs py-1.5 px-4 flex flex-wrap items-center justify-between gap-2 border-b border-brand-primary/40 font-mono">
        <div className="flex items-center space-x-2">
          <span className="px-2 py-0.5 bg-brand-primary text-brand-accent font-bold uppercase tracking-wider text-[11px] border border-brand-primary">
            SYS::ROLE // {role.toUpperCase()}
          </span>
          <span className="text-brand-offwhite/50 hidden sm:inline">|</span>
          <span className="text-brand-offwhite/70 text-[11px] hidden sm:inline">
            PROTOTYPE SWITCHER (TEAM 3):
          </span>
        </div>
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => handleRoleSwitch("customer")}
            disabled={switching}
            className={`px-2.5 py-0.5 text-[11px] font-mono uppercase font-bold transition border ${
              role === "customer"
                ? "bg-brand-accent text-brand-black border-brand-accent shadow-hard-yellow"
                : "bg-brand-black text-brand-offwhite border-brand-white/20 hover:border-brand-accent"
            }`}
          >
            [1] CUSTOMER (SARAH)
          </button>
          <button
            onClick={() => handleRoleSwitch("agent")}
            disabled={switching}
            className={`px-2.5 py-0.5 text-[11px] font-mono uppercase font-bold transition border ${
              role === "agent"
                ? "bg-brand-primary text-brand-white border-brand-primary shadow-hard-green"
                : "bg-brand-black text-brand-offwhite border-brand-white/20 hover:border-brand-primary"
            }`}
          >
            [2] AGENT (ALEX)
          </button>
          <button
            onClick={() => handleRoleSwitch("admin")}
            disabled={switching}
            className={`px-2.5 py-0.5 text-[11px] font-mono uppercase font-bold transition border ${
              role === "admin"
                ? "bg-brand-pink text-brand-white border-brand-pink shadow-hard-pink"
                : "bg-brand-black text-brand-offwhite border-brand-white/20 hover:border-brand-pink"
            }`}
          >
            [3] ADMIN (ELENA)
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Primary Wordmark */}
          <div className="flex items-center space-x-6">
            <Link href="/" className="flex items-center space-x-3 group">
              {/* Logo */}
              <div className="flex items-center group-hover:scale-105 transition">
                <Image src="/logo.png" alt="BizAssist AI" width={180} height={40} className="h-10 w-auto object-contain" priority />
              </div>
            </Link>

            {/* Navigation tabs */}
            <nav className="hidden lg:flex items-center space-x-1 pl-4 border-l border-brand-primary/40 font-mono text-xs">
              {activeLinks.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== `/${role}` && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`inline-flex items-center px-3 py-1.5 font-bold tracking-wider uppercase transition border ${
                      isActive
                        ? "bg-brand-primary text-brand-accent border-brand-primary"
                        : "text-brand-offwhite hover:text-brand-accent hover:border-brand-white/30 border-transparent"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 mr-1.5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right actions: Notifications & User profile */}
          <div className="flex items-center space-x-3 font-mono text-xs">
            {/* Notifications Menu */}
            <div className="relative">
              <button
                onClick={() => setShowNotifs(!showNotifs)}
                className="relative p-2 text-brand-offwhite hover:text-brand-accent hover:bg-brand-primary/20 border border-brand-primary/30 transition"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-pink text-brand-white text-[10px] font-bold flex items-center justify-center border border-brand-black">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifs && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-brand-black text-brand-offwhite border-2 border-brand-primary p-3 z-50 shadow-hard-green">
                  <div className="pb-2 border-b border-brand-primary/40 flex items-center justify-between text-xs font-bold uppercase tracking-wider">
                    <span>SYSTEM NOTIFICATIONS</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllNotifsRead}
                        className="text-[10px] text-brand-accent hover:underline flex items-center"
                      >
                        <CheckCheck className="w-3 h-3 mr-1" />
                        ACK ALL
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-brand-primary/20 mt-2">
                    {notifications.length === 0 ? (
                      <div className="py-4 text-center text-xs text-brand-offwhite/50">
                        NO ACTIVE ALERTS
                      </div>
                    ) : (
                      notifications.slice(0, 8).map((n) => (
                        <Link
                          key={n.id}
                          href={n.link || "#"}
                          onClick={() => setShowNotifs(false)}
                          className={`block py-2.5 px-2 hover:bg-brand-primary/20 transition ${
                            n.is_read ? "opacity-60" : "bg-brand-primary/10"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-brand-accent uppercase">{n.title}</span>
                            <span className="text-[10px] text-brand-offwhite/50">
                              {new Date(n.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                          <p className="text-[11px] text-brand-offwhite mt-1 leading-snug">{n.message}</p>
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 p-1.5 border border-brand-primary/40 hover:border-brand-accent transition bg-brand-black"
                >
                  <div className="w-7 h-7 bg-brand-primary text-brand-white border border-brand-white font-bold flex items-center justify-center text-xs">
                    {currentUser.full_name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="hidden sm:block text-left text-[11px]">
                    <p className="font-bold text-brand-white leading-tight uppercase truncate max-w-[120px]">
                      {currentUser.full_name}
                    </p>
                    <p className="text-[10px] text-brand-accent uppercase">{currentUser.role}</p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-brand-offwhite/50" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-brand-black border-2 border-brand-primary py-2 z-50 shadow-hard-green font-mono text-xs">
                    <div className="px-3 py-2 border-b border-brand-primary/40 text-[11px]">
                      <p className="font-bold text-brand-white uppercase">{currentUser.full_name}</p>
                      <p className="text-[10px] text-brand-offwhite/60 truncate">{currentUser.email}</p>
                    </div>
                    <Link
                      href={`/${currentUser.role}`}
                      onClick={() => setShowUserMenu(false)}
                      className="block px-3 py-2 text-brand-offwhite hover:bg-brand-primary hover:text-brand-white uppercase"
                    >
                      &gt; ROLE DASHBOARD
                    </Link>
                    <Link
                      href="/"
                      onClick={() => setShowUserMenu(false)}
                      className="block px-3 py-2 text-brand-offwhite hover:bg-brand-primary hover:text-brand-white uppercase"
                    >
                      &gt; PUBLIC HOME
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 text-brand-pink hover:bg-brand-pink hover:text-brand-white border-t border-brand-primary/30 uppercase font-bold"
                    >
                      [!] DISCONNECT / LOGOUT
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/login"
                  className="px-3 py-1.5 text-xs font-bold font-mono uppercase bg-brand-black text-brand-accent border border-brand-accent hover:bg-brand-accent hover:text-brand-black transition"
                >
                  LOGIN
                </Link>
                <Link
                  href="/register"
                  className="px-3 py-1.5 text-xs font-bold font-mono uppercase bg-brand-primary text-brand-white border border-brand-white hover:bg-brand-white hover:text-brand-black transition"
                >
                  REGISTER
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
