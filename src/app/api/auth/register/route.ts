import { NextResponse } from "next/server";
import getDatabase from "@/lib/db";
import { setSessionCookie, UserSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { full_name, email, password, phone } = await request.json();

    if (!full_name || !email || !password) {
      return NextResponse.json({ error: "Full name, email, and password are required" }, { status: 400 });
    }

    const db = getDatabase();
    const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email.trim().toLowerCase());
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
    }

    const id = "usr-" + Math.random().toString(36).substring(2, 9);
    const createdAt = new Date().toISOString();
    const avatarUrl = `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 1000)}?w=150`;

    db.prepare(`
      INSERT INTO users (id, full_name, email, password_hash, phone, role, avatar_url, created_at)
      VALUES (?, ?, ?, ?, ?, 'customer', ?, ?)
    `).run(id, full_name.trim(), email.trim().toLowerCase(), password, phone || null, avatarUrl, createdAt);

    const newUser: UserSession = {
      id,
      full_name: full_name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone || undefined,
      role: "customer",
      avatar_url: avatarUrl,
      created_at: createdAt
    };

    await setSessionCookie(newUser);

    return NextResponse.json({ success: true, user: newUser });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
