import { NextResponse } from "next/server";
import getDatabase from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { queryKnowledgeBaseChatbot } from "@/lib/ai-service";

export async function POST(request: Request) {
  try {
    const { session_id, message, action } = await request.json();
    const currentUser = await getCurrentUser();
    const db = getDatabase();
    const now = new Date().toISOString();

    let sessionId = session_id;

    // Create session if not provided
    if (!sessionId) {
      sessionId = "chat-" + Math.random().toString(36).substring(2, 9);
      db.prepare(`
        INSERT INTO chat_sessions (id, customer_id, customer_name, status, created_at)
        VALUES (?, ?, ?, 'active', ?)
      `).run(sessionId, currentUser?.id || null, currentUser?.full_name || "Guest Customer", now);
    }

    // Action: Escalate to ticket directly from chat
    if (action === "escalate") {
      const chatMessages = db.prepare(`
        SELECT sender_type, message, created_at
        FROM chat_messages
        WHERE session_id = ?
        ORDER BY created_at ASC
      `).all(sessionId) as Array<{ sender_type: string; message: string }>;

      const transcript = chatMessages.map(m => `[${m.sender_type.toUpperCase()}]: ${m.message}`).join("\n");
      const customerId = currentUser?.id || "usr-cust-1";

      const countRow = db.prepare("SELECT COUNT(*) as count FROM tickets").get() as { count: number };
      const ticketNumber = `BIZ-${1000 + countRow.count + 1}`;
      const ticketId = "tkt-" + Math.random().toString(36).substring(2, 9);

      const subject = `Escalated Chat Support Request (${ticketNumber})`;
      const description = `This ticket was escalated from an AI Support Chat session.\n\nConversation Transcript:\n${transcript}\n\nLast Customer Message: ${message || "Customer requested human support assistance."}`;

      // Insert escalated ticket
      db.prepare(`
        INSERT INTO tickets (
          id, ticket_number, customer_id, assigned_agent_id, subject, description,
          category, priority, sentiment, ai_summary, ai_suggested_response, status,
          contact_email, created_at, updated_at
        ) VALUES (?, ?, ?, NULL, ?, ?, 'General Enquiries', 'High', 'Urgent', ?, ?, 'Open', ?, ?, ?)
      `).run(
        ticketId,
        ticketNumber,
        customerId,
        subject,
        description,
        "Customer escalated chat session requesting human support.",
        "Hello,\n\nWe have received your escalated request from our AI chatbot assistant. A support agent is reviewing your chat transcript and will follow up shortly.",
        currentUser?.email || "customer@example.com",
        now,
        now
      );

      // Link session
      db.prepare("UPDATE chat_sessions SET status = 'escalated', escalated_ticket_id = ? WHERE id = ?").run(ticketId, sessionId);

      // System message
      db.prepare(`
        INSERT INTO chat_messages (id, session_id, sender_type, message, created_at)
        VALUES (?, ?, 'system', ?, ?)
      `).run(
        "cmsg-" + Math.random().toString(36).substring(2, 9),
        sessionId,
        `Ticket ${ticketNumber} has been successfully opened for human agent follow-up. You can track this in your Tickets portal.`,
        now
      );

      return NextResponse.json({
        success: true,
        escalated: true,
        ticket_id: ticketId,
        ticket_number: ticketNumber,
        message: `Your issue has been escalated to human support under Ticket #${ticketNumber}. Our team has received your chat transcript and will respond shortly.`
      });
    }

    if (!message || message.trim().length === 0) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Save customer message
    db.prepare(`
      INSERT INTO chat_messages (id, session_id, sender_type, message, created_at)
      VALUES (?, ?, 'customer', ?, ?)
    `).run(
      "cmsg-" + Math.random().toString(36).substring(2, 9),
      sessionId,
      message.trim(),
      now
    );

    // AI Knowledge-based retrieval & answer synthesis
    const botResult = await queryKnowledgeBaseChatbot(message);

    // Save bot reply
    const botMsgId = "cmsg-" + Math.random().toString(36).substring(2, 9);
    db.prepare(`
      INSERT INTO chat_messages (id, session_id, sender_type, message, sources_json, created_at)
      VALUES (?, ?, 'ai_bot', ?, ?, ?)
    `).run(
      botMsgId,
      sessionId,
      botResult.answer,
      JSON.stringify(botResult.sources),
      new Date().toISOString()
    );

    return NextResponse.json({
      session_id: sessionId,
      answer: botResult.answer,
      sources: botResult.sources,
      suggestEscalation: botResult.suggestEscalation,
      suggestedFollowUps: botResult.suggestedFollowUps
    });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
