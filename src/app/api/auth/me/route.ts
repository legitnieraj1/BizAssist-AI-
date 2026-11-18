import { NextResponse } from "next/server";
import { getCurrentUser, setSessionCookie, clearSessionCookie } from "@/lib/auth";
import getDatabase from "@/lib/db";
import { UserSession } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  return NextResponse.json({ user });
}

export async function POST(request: Request) {
  try {
    const { role, userId } = await request.json();
    const db = getDatabase();

    let targetUser: UserSession | undefined;
    if (userId) {
      targetUser = db.prepare("SELECT id, full_name, email, phone, role, avatar_url, created_at FROM users WHERE id = ?").get(userId) as UserSession | undefined;
    } else if (role) {
      targetUser = db.prepare("SELECT id, full_name, email, phone, role, avatar_url, created_at FROM users WHERE role = ? ORDER BY id ASC LIMIT 1").get(role) as UserSession | undefined;
    }

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await setSessionCookie(targetUser);
    return NextResponse.json({ success: true, user: targetUser });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
