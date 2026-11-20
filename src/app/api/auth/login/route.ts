import { NextResponse } from "next/server";
import getSupabaseAdmin from "@/lib/supabase";
import { setSessionCookie, UserSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { email, password, demoRole } = await request.json();
    const db = getSupabaseAdmin();

    // Fast demo login support
    if (demoRole) {
      const { data: demoUser } = await db
        .from("users")
        .select("id, full_name, email, phone, role, avatar_url, created_at")
        .eq("role", demoRole)
        .limit(1)
        .single();

      if (demoUser) {
        await setSessionCookie(demoUser as UserSession);
        return NextResponse.json({ success: true, user: demoUser });
      }
    }

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const { data: user } = await db
      .from("users")
      .select("*")
      .eq("email", email.trim().toLowerCase())
      .single();

    if (!user || user.password_hash !== password) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const { password_hash, ...safeUser } = user;
    await setSessionCookie(safeUser as UserSession);

    return NextResponse.json({ success: true, user: safeUser });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
