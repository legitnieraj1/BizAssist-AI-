import { NextResponse } from "next/server";
import getDatabase from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    const db = getDatabase();
    let query = "SELECT * FROM knowledge_base WHERE 1=1";
    const params: string[] = [];

    if (category && category !== "All") {
      query += " AND category = ?";
      params.push(category);
    }

    if (search && search.trim().length > 0) {
      query += " AND (title LIKE ? OR content LIKE ? OR tags LIKE ?)";
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }

    query += " ORDER BY view_count DESC, created_at DESC";

    const articles = db.prepare(query).all(...params);
    return NextResponse.json({ articles });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { title, content, category, tags } = await request.json();

    if (!title || !content || !category) {
      return NextResponse.json({ error: "Title, content, and category are required" }, { status: 400 });
    }

    const db = getDatabase();
    const id = "kb-" + Math.random().toString(36).substring(2, 9);
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO knowledge_base (id, title, content, category, tags, view_count, is_published, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, 0, 1, ?, ?)
    `).run(id, title.trim(), content.trim(), category, tags || "", now, now);

    const article = db.prepare("SELECT * FROM knowledge_base WHERE id = ?").get(id);
    return NextResponse.json({ success: true, article });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
