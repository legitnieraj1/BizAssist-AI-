import { NextResponse } from "next/server";
import getSupabaseAdmin from "@/lib/supabase";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ notifications: [], unreadCount: 0 });
    }

    const db = getSupabaseAdmin();

    const { data: notifications } = await db
      .from("notifications")
      .select("*")
      .eq("user_id", currentUser.id)
      .order("created_at", { ascending: false })
      .limit(20);

    const { count: unreadCount } = await db
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", currentUser.id)
      .eq("is_read", false);

    return NextResponse.json({ notifications: notifications || [], unreadCount: unreadCount || 0 });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, markAll } = await request.json();
    const db = getSupabaseAdmin();

    if (markAll) {
      await db
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", currentUser.id);
    } else if (id) {
      await db
        .from("notifications")
        .update({ is_read: true })
        .eq("id", id)
        .eq("user_id", currentUser.id);
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
