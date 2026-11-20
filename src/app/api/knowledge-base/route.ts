import { NextResponse } from "next/server";
import getSupabaseAdmin from "@/lib/supabase";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const db = getSupabaseAdmin();

    let query = db.from("knowledge_base").select("*").order("view_count", { ascending: false }).order("created_at", { ascending: false });

    if (category && category !== "All") {
      query = query.eq("category", category);
    }

    if (search && search.trim().length > 0) {
      const term = search.trim();
      query = query.or(`title.ilike.%${term}%,content.ilike.%${term}%,tags.ilike.%${term}%`);
    }

    const { data: articles, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

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

    const db = getSupabaseAdmin();
    const id = "kb-" + Math.random().toString(36).substring(2, 9);
    const now = new Date().toISOString();

    const { data: article, error } = await db
      .from("knowledge_base")
      .insert({
        id,
        title: title.trim(),
        content: content.trim(),
        category,
        tags: tags || "",
        view_count: 0,
        is_published: true,
        created_at: now,
        updated_at: now
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true, article });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
