import { NextResponse } from "next/server";
import getSupabaseAdmin from "@/lib/supabase";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { title, content, category, tags, is_published } = await request.json();
    const db = getSupabaseAdmin();

    const { data: existing } = await db
      .from("knowledge_base")
      .select("id")
      .eq("id", id)
      .single();

    if (!existing) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (title !== undefined) updates.title = title;
    if (content !== undefined) updates.content = content;
    if (category !== undefined) updates.category = category;
    if (tags !== undefined) updates.tags = tags;
    if (is_published !== undefined) updates.is_published = is_published;

    const { data: updated, error } = await db
      .from("knowledge_base")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true, article: updated });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getSupabaseAdmin();
    const { error } = await db.from("knowledge_base").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
