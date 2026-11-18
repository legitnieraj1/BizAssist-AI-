import { cookies } from "next/headers";
import getDatabase from "./db";

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

  if (!sessionVal) {
    // Default to admin for seamless evaluation if no cookie set, or return null
    return null;
  }

  try {
    const parsed = JSON.parse(decodeURIComponent(sessionVal));
    const db = getDatabase();
    const user = db.prepare("SELECT id, full_name, email, phone, role, avatar_url, created_at FROM users WHERE id = ?").get(parsed.id) as UserSession | undefined;
    return user || null;
  } catch {
    return null;
  }
}

export async function setSessionCookie(user: UserSession) {
  const cookieStore = await cookies();
  const val = encodeURIComponent(JSON.stringify({ id: user.id, role: user.role }));
  cookieStore.set(COOKIE_NAME, val, {
    path: "/",
    httpOnly: false, // accessible for client navbar quick-switch
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7 // 7 days
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export function findUserByEmail(email: string): UserSession | null {
  const db = getDatabase();
  const user = db.prepare("SELECT id, full_name, email, phone, role, avatar_url, created_at FROM users WHERE email = ?").get(email) as UserSession | undefined;
  return user || null;
}

export function findUserById(id: string): UserSession | null {
  const db = getDatabase();
  const user = db.prepare("SELECT id, full_name, email, phone, role, avatar_url, created_at FROM users WHERE id = ?").get(id) as UserSession | undefined;
  return user || null;
}

export function getAllAgents(): UserSession[] {
  const db = getDatabase();
  return db.prepare("SELECT id, full_name, email, phone, role, avatar_url, created_at FROM users WHERE role = 'agent' ORDER BY full_name ASC").all() as UserSession[];
}

export function getAllCustomers(): UserSession[] {
  const db = getDatabase();
  return db.prepare("SELECT id, full_name, email, phone, role, avatar_url, created_at FROM users WHERE role = 'customer' ORDER BY created_at DESC").all() as UserSession[];
}
