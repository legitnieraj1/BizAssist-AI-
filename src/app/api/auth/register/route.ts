import { NextResponse } from "next/server";
import getSupabaseAdmin from "@/lib/supabase";
import { setSessionCookie, UserSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { full_name, email, password, phone } = await request.json();

    if (!full_name || !email || !password) {
      return NextResponse.json({ error: "Full name, email, and password are required" }, { status: 400 });
    }

    const db = getSupabaseAdmin();

    // Check for existing email
    const { data: existing } = await db
      .from("users")
      .select("id")
      .eq("email", email.trim().toLowerCase())
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
    }

    const id = "usr-" + Math.random().toString(36).substring(2, 9);
    const avatarUrl = `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 1000)}?w=150`;
    const createdAt = new Date().toISOString();

    const { error } = await db.from("users").insert({
      id,
      full_name: full_name.trim(),
      email: email.trim().toLowerCase(),
      password_hash: password,
      phone: phone || null,
      role: "customer",
      avatar_url: avatarUrl,
      created_at: createdAt
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

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
