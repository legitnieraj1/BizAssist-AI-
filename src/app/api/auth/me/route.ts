import { NextResponse } from "next/server";
import { getCurrentUser, setSessionCookie, clearSessionCookie } from "@/lib/auth";
import getSupabaseAdmin from "@/lib/supabase";
import { UserSession } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  return NextResponse.json({ user });
}

export async function POST(request: Request) {
  try {
    const { role, userId } = await request.json();
    const db = getSupabaseAdmin();

    let targetUser: UserSession | null = null;

    if (userId) {
      const { data } = await db
        .from("users")
        .select("id, full_name, email, phone, role, avatar_url, created_at")
        .eq("id", userId)
        .single();
      targetUser = data as UserSession | null;
    } else if (role) {
      const { data } = await db
        .from("users")
        .select("id, full_name, email, phone, role, avatar_url, created_at")
        .eq("role", role)
        .order("id")
        .limit(1)
        .single();
      targetUser = data as UserSession | null;
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

export async function DELETE() {
  await clearSessionCookie();
  return NextResponse.json({ success: true });
}
