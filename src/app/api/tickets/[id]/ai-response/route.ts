import { NextResponse } from "next/server";
import getSupabaseAdmin from "@/lib/supabase";
import { regenerateAIResponse } from "@/lib/ai-service";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { tone } = await request.json();
    const db = getSupabaseAdmin();

    const { data: ticket } = await db
      .from("tickets")
      .select("*")
      .eq("id", id)
      .single();

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    const newResponse = await regenerateAIResponse(
      ticket.subject,
      ticket.description,
      tone || "Empathetic",
      ticket.ai_summary
    );

    await db.from("tickets").update({ ai_suggested_response: newResponse }).eq("id", id);

    return NextResponse.json({ success: true, suggested_response: newResponse });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
