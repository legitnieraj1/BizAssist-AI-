import { NextResponse } from "next/server";
import getDatabase from "@/lib/db";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { title, content, category, tags, is_published } = await request.json();

    const db = getDatabase();
    const existing = db.prepare("SELECT * FROM knowledge_base WHERE id = ?").get(id);
    if (!existing) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    const now = new Date().toISOString();
    db.prepare(`
      UPDATE knowledge_base
      SET title = COALESCE(?, title),
          content = COALESCE(?, content),
          category = COALESCE(?, category),
          tags = COALESCE(?, tags),
          is_published = COALESCE(?, is_published),
          updated_at = ?
      WHERE id = ?
    `).run(title, content, category, tags, is_published !== undefined ? (is_published ? 1 : 0) : null, now, id);

    const updated = db.prepare("SELECT * FROM knowledge_base WHERE id = ?").get(id);
    return NextResponse.json({ success: true, article: updated });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDatabase();
    db.prepare("DELETE FROM knowledge_base WHERE id = ?").run(id);
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
