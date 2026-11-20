import { cookies } from "next/headers";
import getSupabaseAdmin from "./supabase";

export interface UserSession {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  role: "customer" | "agent" | "admin";
  avatar_url?: string;
  created_at: string;
}

const COOKIE_NAME = "bizassist_session";

export async function getCurrentUser(): Promise<UserSession | null> {
  const cookieStore = await cookies();
  const sessionVal = cookieStore.get(COOKIE_NAME)?.value;
  if (!sessionVal) return null;

  try {
    const parsed = JSON.parse(decodeURIComponent(sessionVal));
    const db = getSupabaseAdmin();
    const { data, error } = await db
      .from("users")
      .select("id, full_name, email, phone, role, avatar_url, created_at")
      .eq("id", parsed.id)
      .single();
    if (error || !data) return null;
    return data as UserSession;
  } catch {
    return null;
  }
}

export async function setSessionCookie(user: UserSession) {
  const cookieStore = await cookies();
  const val = encodeURIComponent(JSON.stringify({ id: user.id, role: user.role }));
  cookieStore.set(COOKIE_NAME, val, {
    path: "/",
    httpOnly: false,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function findUserByEmail(email: string): Promise<(UserSession & { password_hash: string }) | null> {
  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from("users")
    .select("id, full_name, email, password_hash, phone, role, avatar_url, created_at")
    .eq("email", email.trim().toLowerCase())
    .single();
  if (error || !data) return null;
  return data as UserSession & { password_hash: string };
}

export async function findUserById(id: string): Promise<UserSession | null> {
  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from("users")
    .select("id, full_name, email, phone, role, avatar_url, created_at")
    .eq("id", id)
    .single();
  if (error || !data) return null;
  return data as UserSession;
}

export async function getAllAgents(): Promise<UserSession[]> {
  const db = getSupabaseAdmin();
  const { data } = await db
    .from("users")
    .select("id, full_name, email, phone, role, avatar_url, created_at")
    .eq("role", "agent")
    .order("full_name");
  return (data as UserSession[]) || [];
}

export async function getAllCustomers(): Promise<UserSession[]> {
  const db = getSupabaseAdmin();
  const { data } = await db
    .from("users")
    .select("id, full_name, email, phone, role, avatar_url, created_at")
    .eq("role", "customer")
    .order("created_at", { ascending: false });
  return (data as UserSession[]) || [];
}
