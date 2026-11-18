import { NextResponse } from "next/server";
import getDatabase from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { message, attachment_url, is_internal } = body;

    if (!message || message.trim().length === 0) {
      return NextResponse.json({ error: "Message cannot be empty" }, { status: 400 });
    }

    const currentUser = await getCurrentUser();
    const db = getDatabase();

    const ticket = db.prepare("SELECT * FROM tickets WHERE id = ?").get(id) as Record<string, unknown> | undefined;
    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    const senderId = currentUser?.id || (body.sender_id || (ticket.customer_id as string));
    const now = new Date().toISOString();
    const msgId = "msg-" + Math.random().toString(36).substring(2, 9);

    db.prepare(`
      INSERT INTO ticket_messages (id, ticket_id, sender_id, message, attachment_url, is_internal, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(msgId, id, senderId, message.trim(), attachment_url || null, is_internal ? 1 : 0, now);

    // Update ticket updated_at
    db.prepare("UPDATE tickets SET updated_at = ? WHERE id = ?").run(now, id);

    // Auto-update status based on who sent message
    const sender = db.prepare("SELECT role, full_name FROM users WHERE id = ?").get(senderId) as { role: string; full_name: string } | undefined;

    if (sender?.role === "agent" && !is_internal) {
      // If agent responds, update status to Waiting for Customer if not resolved
      if (ticket.status !== "Resolved" && ticket.status !== "Closed") {
        db.prepare("UPDATE tickets SET status = 'Waiting for Customer' WHERE id = ?").run(id);

        db.prepare(`
          INSERT INTO ticket_history (id, ticket_id, previous_status, new_status, action_type, note, changed_by, created_at)
          VALUES (?, ?, ?, 'Waiting for Customer', 'status_change', ?, ?, ?)
        `).run(
          "hist-" + Math.random().toString(36).substring(2, 9),
          id,
          ticket.status,
          `Agent ${sender.full_name} sent response to customer`,
          senderId,
          now
        );
      }

      // Notify customer
      db.prepare(`
        INSERT INTO notifications (id, user_id, title, message, type, link, created_at)
        VALUES (?, ?, ?, ?, 'info', ?, ?)
      `).run(
        "notif-" + Math.random().toString(36).substring(2, 9),
        ticket.customer_id,
        `New Message on ${ticket.ticket_number}`,
        `${sender.full_name} replied: "${message.trim().slice(0, 50)}..."`,
        `/customer/tickets/${id}`,
        now
      );
    } else if (sender?.role === "customer") {
      // If customer replies and ticket was waiting, change to In Progress
      if (ticket.status === "Waiting for Customer") {
        db.prepare("UPDATE tickets SET status = 'In Progress' WHERE id = ?").run(id);

        db.prepare(`
          INSERT INTO ticket_history (id, ticket_id, previous_status, new_status, action_type, note, changed_by, created_at)
          VALUES (?, ?, 'Waiting for Customer', 'In Progress', 'status_change', 'Customer replied with further details', ?, ?)
        `).run(
          "hist-" + Math.random().toString(36).substring(2, 9),
          id,
          senderId,
          now
        );
      }

      // Notify assigned agent or admin
      const notifyTarget = ticket.assigned_agent_id as string | null;
      if (notifyTarget) {
        db.prepare(`
          INSERT INTO notifications (id, user_id, title, message, type, link, created_at)
          VALUES (?, ?, ?, ?, 'info', ?, ?)
        `).run(
          "notif-" + Math.random().toString(36).substring(2, 9),
          notifyTarget,
          `Customer Replied on ${ticket.ticket_number}`,
          `${sender.full_name} sent an update.`,
          `/agent/tickets/${id}`,
          now
        );
      }
    }

    const insertedMsg = db.prepare(`
      SELECT 
        m.*,
        u.full_name as sender_name,
        u.role as sender_role,
        u.avatar_url as sender_avatar
      FROM ticket_messages m
      LEFT JOIN users u ON m.sender_id = u.id
      WHERE m.id = ?
    `).get(msgId);

    return NextResponse.json({ success: true, message: insertedMsg });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
