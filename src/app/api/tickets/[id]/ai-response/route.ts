import { NextResponse } from "next/server";
import getDatabase from "@/lib/db";
import { regenerateAIResponse } from "@/lib/ai-service";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { tone } = await request.json();

    const db = getDatabase();
    const ticket = db.prepare("SELECT * FROM tickets WHERE id = ?").get(id) as Record<string, unknown> | undefined;

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    const newResponse = await regenerateAIResponse(
      ticket.subject as string,
      ticket.description as string,
      tone || "Empathetic",
      ticket.ai_summary as string
    );

    // Update in database so it persists
    db.prepare("UPDATE tickets SET ai_suggested_response = ? WHERE id = ?").run(newResponse, id);

    return NextResponse.json({ success: true, suggested_response: newResponse });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
