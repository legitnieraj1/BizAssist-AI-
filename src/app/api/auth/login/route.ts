import { NextResponse } from "next/server";
import getDatabase from "@/lib/db";
import { setSessionCookie, UserSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { email, password, demoRole } = await request.json();
    const db = getDatabase();

    // Fast demo login support
    if (demoRole) {
      const demoUser = db.prepare("SELECT id, full_name, email, phone, role, avatar_url, created_at FROM users WHERE role = ? LIMIT 1").get(demoRole) as UserSession | undefined;
      if (demoUser) {
        await setSessionCookie(demoUser);
        return NextResponse.json({ success: true, user: demoUser });
      }
    }

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const user = db.prepare("SELECT id, full_name, email, password_hash, phone, role, avatar_url, created_at FROM users WHERE email = ?").get(email.trim().toLowerCase()) as (UserSession & { password_hash: string }) | undefined;

    if (!user || user.password_hash !== password) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const { password_hash, ...safeUser } = user;
    await setSessionCookie(safeUser);

    return NextResponse.json({ success: true, user: safeUser });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
