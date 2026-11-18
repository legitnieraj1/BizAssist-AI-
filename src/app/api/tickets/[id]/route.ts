import { NextResponse } from "next/server";
import getDatabase from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDatabase();
    const currentUser = await getCurrentUser();

    const ticket = db.prepare(`
      SELECT 
        t.*,
        c.full_name as customer_name,
        c.email as customer_email,
        c.phone as customer_phone,
        c.avatar_url as customer_avatar,
        a.full_name as agent_name,
        a.email as agent_email,
        a.avatar_url as agent_avatar
      FROM tickets t
      LEFT JOIN users c ON t.customer_id = c.id
      LEFT JOIN users a ON t.assigned_agent_id = a.id
      WHERE t.id = ?
    `).get(id) as Record<string, unknown> | undefined;

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    // Role check: customer can only view their own ticket
    if (currentUser?.role === "customer" && ticket.customer_id !== currentUser.id) {
      return NextResponse.json({ error: "Unauthorized access to ticket" }, { status: 403 });
    }

    // Fetch messages
    const messages = db.prepare(`
      SELECT 
        m.*,
        u.full_name as sender_name,
        u.role as sender_role,
        u.avatar_url as sender_avatar
      FROM ticket_messages m
      LEFT JOIN users u ON m.sender_id = u.id
      WHERE m.ticket_id = ?
      ORDER BY m.created_at ASC
    `).all(id);

    // Fetch history
    const history = db.prepare(`
      SELECT 
        h.*,
        u.full_name as changed_by_name,
        u.role as changed_by_role
      FROM ticket_history h
      LEFT JOIN users u ON h.changed_by = u.id
      WHERE h.ticket_id = ?
      ORDER BY h.created_at DESC
    `).all(id);

    return NextResponse.json({ ticket, messages, history });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const currentUser = await getCurrentUser();
    const db = getDatabase();

    const currentTicket = db.prepare("SELECT * FROM tickets WHERE id = ?").get(id) as Record<string, unknown> | undefined;
    if (!currentTicket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    const changerId = currentUser?.id || "usr-admin-1";
    const now = new Date().toISOString();

    const updates: string[] = ["updated_at = ?"];
    const values: (string | number | null)[] = [now];

    // Status change
    if (body.status && body.status !== currentTicket.status) {
      updates.push("status = ?");
      values.push(body.status);

      if (body.status === "Resolved" || body.status === "Closed") {
        updates.push("resolved_at = ?");
        values.push(now);
      }

      // Record in history
      db.prepare(`
        INSERT INTO ticket_history (id, ticket_id, previous_status, new_status, action_type, note, changed_by, created_at)
        VALUES (?, ?, ?, ?, 'status_change', ?, ?, ?)
      `).run(
        "hist-" + Math.random().toString(36).substring(2, 9),
        id,
        currentTicket.status,
        body.status,
        body.note || `Status transitioned from ${currentTicket.status} to ${body.status}`,
        changerId,
        now
      );

      // Notify customer of status change
      db.prepare(`
        INSERT INTO notifications (id, user_id, title, message, type, link, created_at)
        VALUES (?, ?, ?, ?, 'info', ?, ?)
      `).run(
        "notif-" + Math.random().toString(36).substring(2, 9),
        currentTicket.customer_id,
        `Ticket Status: ${body.status}`,
        `Your ticket ${currentTicket.ticket_number} status is now "${body.status}".`,
        `/customer/tickets/${id}`,
        now
      );
    }

    // Priority change
    if (body.priority && body.priority !== currentTicket.priority) {
      updates.push("priority = ?");
      values.push(body.priority);

      db.prepare(`
        INSERT INTO ticket_history (id, ticket_id, previous_status, new_status, action_type, note, changed_by, created_at)
        VALUES (?, ?, ?, ?, 'priority_change', ?, ?, ?)
      `).run(
        "hist-" + Math.random().toString(36).substring(2, 9),
        id,
        currentTicket.status,
        currentTicket.status,
        `Priority modified from ${currentTicket.priority} to ${body.priority} by support`,
        changerId,
        now
      );
    }

    // Assignment change
    if (body.assigned_agent_id !== undefined && body.assigned_agent_id !== currentTicket.assigned_agent_id) {
      updates.push("assigned_agent_id = ?");
      values.push(body.assigned_agent_id || null);

      let agentName = "Unassigned";
      if (body.assigned_agent_id) {
        const ag = db.prepare("SELECT full_name FROM users WHERE id = ?").get(body.assigned_agent_id) as { full_name: string } | undefined;
        if (ag) agentName = ag.full_name;
      }

      // If assigning from Open, update status to Assigned
      if (body.assigned_agent_id && currentTicket.status === "Open") {
        updates.push("status = ?");
        values.push("Assigned");
      }

      db.prepare(`
        INSERT INTO ticket_history (id, ticket_id, previous_status, new_status, action_type, note, changed_by, created_at)
        VALUES (?, ?, ?, ?, 'agent_assigned', ?, ?, ?)
      `).run(
        "hist-" + Math.random().toString(36).substring(2, 9),
        id,
        currentTicket.status,
        body.assigned_agent_id && currentTicket.status === "Open" ? "Assigned" : currentTicket.status,
        `Assigned to agent ${agentName}`,
        changerId,
        now
      );

      if (body.assigned_agent_id) {
        db.prepare(`
          INSERT INTO notifications (id, user_id, title, message, type, link, created_at)
          VALUES (?, ?, ?, ?, 'info', ?, ?)
        `).run(
          "notif-" + Math.random().toString(36).substring(2, 9),
          body.assigned_agent_id,
          `Ticket Reassigned: ${currentTicket.ticket_number}`,
          `You have been assigned ticket "${String(currentTicket.subject).slice(0, 40)}"`,
          `/agent/tickets/${id}`,
          now
        );
      }
    }

    // Category override
    if (body.category && body.category !== currentTicket.category) {
      updates.push("category = ?");
      values.push(body.category);
    }

    // AI Summary override
    if (body.ai_summary) {
      updates.push("ai_summary = ?");
      values.push(body.ai_summary);
    }

    // AI Suggested response update
    if (body.ai_suggested_response) {
      updates.push("ai_suggested_response = ?");
      values.push(body.ai_suggested_response);
    }

    values.push(id);
    db.prepare(`UPDATE tickets SET ${updates.join(", ")} WHERE id = ?`).run(...values);

    const updated = db.prepare("SELECT * FROM tickets WHERE id = ?").get(id);
    return NextResponse.json({ success: true, ticket: updated });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
