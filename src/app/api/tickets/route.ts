import { NextResponse } from "next/server";
import getDatabase from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { analyzeTicketWithAI } from "@/lib/ai-service";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const currentUser = await getCurrentUser();

    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const assignedAgentId = searchParams.get("assigned_agent_id");
    const customerId = searchParams.get("customer_id");

    const db = getDatabase();

    let query = `
      SELECT 
        t.*,
        c.full_name as customer_name,
        c.email as customer_email,
        c.avatar_url as customer_avatar,
        a.full_name as agent_name,
        a.avatar_url as agent_avatar
      FROM tickets t
      LEFT JOIN users c ON t.customer_id = c.id
      LEFT JOIN users a ON t.assigned_agent_id = a.id
      WHERE 1=1
    `;
    const params: (string | number)[] = [];

    // Role-based visibility isolation (PRD Section 9)
    if (currentUser?.role === "customer") {
      query += ` AND t.customer_id = ?`;
      params.push(currentUser.id);
    } else if (currentUser?.role === "agent" && searchParams.get("my_assigned") === "true") {
      query += ` AND t.assigned_agent_id = ?`;
      params.push(currentUser.id);
    }

    if (customerId) {
      query += ` AND t.customer_id = ?`;
      params.push(customerId);
    }

    if (assignedAgentId) {
      if (assignedAgentId === "unassigned") {
        query += ` AND t.assigned_agent_id IS NULL`;
      } else {
        query += ` AND t.assigned_agent_id = ?`;
        params.push(assignedAgentId);
      }
    }

    if (status && status !== "All") {
      query += ` AND t.status = ?`;
      params.push(status);
    }

    if (priority && priority !== "All") {
      query += ` AND t.priority = ?`;
      params.push(priority);
    }

    if (category && category !== "All") {
      query += ` AND t.category = ?`;
      params.push(category);
    }

    if (search && search.trim().length > 0) {
      query += ` AND (t.ticket_number LIKE ? OR t.subject LIKE ? OR t.description LIKE ? OR c.full_name LIKE ?)`;
      const term = `%${search.trim()}%`;
      params.push(term, term, term, term);
    }

    query += ` ORDER BY CASE WHEN t.priority = 'Critical' THEN 1 WHEN t.priority = 'High' THEN 2 WHEN t.priority = 'Medium' THEN 3 ELSE 4 END, t.created_at DESC`;

    const tickets = db.prepare(query).all(...params);

    return NextResponse.json({ tickets });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    const body = await request.json();
    const { subject, description, category: userCategory, contact_email, contact_phone, attachment_name, attachment_url } = body;

    if (!subject || !description) {
      return NextResponse.json({ error: "Subject and description are required" }, { status: 400 });
    }

    const db = getDatabase();

    // Determine customer ID
    let customerId = currentUser?.id;
    if (!customerId || currentUser?.role !== "customer") {
      // Find or fallback to Sarah Jenkins or first customer
      const defaultCustomer = db.prepare("SELECT id, email, phone FROM users WHERE role = 'customer' LIMIT 1").get() as { id: string; email: string; phone: string };
      customerId = defaultCustomer.id;
    }

    // 1. Run AI Ticket Classification (Module 3 & 5 & 4)
    const aiAnalysis = await analyzeTicketWithAI(subject, description, userCategory);

    // 2. Generate unique Ticket Number (e.g. BIZ-1006)
    const countRow = db.prepare("SELECT COUNT(*) as count FROM tickets").get() as { count: number };
    const ticketNumber = `BIZ-${1000 + countRow.count + 1}`;
    const ticketId = "tkt-" + Math.random().toString(36).substring(2, 9);
    const now = new Date().toISOString();

    // 3. Optional Smart Auto-Assignment (find agent with fewest open tickets)
    let assignedAgentId: string | null = null;
    let agentName: string | null = null;

    if (aiAnalysis.priority === "Critical" || aiAnalysis.priority === "High") {
      const agentWithLeastLoad = db.prepare(`
        SELECT u.id, u.full_name, COUNT(t.id) as open_tickets
        FROM users u
        LEFT JOIN tickets t ON u.id = t.assigned_agent_id AND t.status IN ('Open', 'Assigned', 'In Progress')
        WHERE u.role = 'agent'
        GROUP BY u.id
        ORDER BY open_tickets ASC, u.id ASC
        LIMIT 1
      `).get() as { id: string; full_name: string } | undefined;

      if (agentWithLeastLoad) {
        assignedAgentId = agentWithLeastLoad.id;
        agentName = agentWithLeastLoad.full_name;
      }
    }

    const initialStatus = assignedAgentId ? "Assigned" : "Open";

    // 4. Insert Ticket
    db.prepare(`
      INSERT INTO tickets (
        id, ticket_number, customer_id, assigned_agent_id, subject, description,
        category, priority, sentiment, ai_summary, ai_suggested_response, status,
        contact_email, contact_phone, attachment_name, attachment_url, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      ticketId,
      ticketNumber,
      customerId,
      assignedAgentId,
      subject.trim(),
      description.trim(),
      aiAnalysis.category,
      aiAnalysis.priority,
      aiAnalysis.sentiment,
      aiAnalysis.summary,
      aiAnalysis.suggested_response,
      initialStatus,
      contact_email || currentUser?.email || "customer@example.com",
      contact_phone || currentUser?.phone || null,
      attachment_name || null,
      attachment_url || null,
      now,
      now
    );

    // 5. Insert initial complaint message
    const msgId = "msg-" + Math.random().toString(36).substring(2, 9);
    db.prepare(`
      INSERT INTO ticket_messages (id, ticket_id, sender_id, message, attachment_url, is_internal, created_at)
      VALUES (?, ?, ?, ?, ?, 0, ?)
    `).run(msgId, ticketId, customerId, description.trim(), attachment_url || null, now);

    // 6. Record Ticket History
    const histId1 = "hist-" + Math.random().toString(36).substring(2, 9);
    db.prepare(`
      INSERT INTO ticket_history (id, ticket_id, previous_status, new_status, action_type, note, changed_by, created_at)
      VALUES (?, ?, NULL, ?, 'ai_classified', ?, ?, ?)
    `).run(
      histId1,
      ticketId,
      initialStatus,
      `AI Auto-Classified: [Category: ${aiAnalysis.category}, Priority: ${aiAnalysis.priority}, Sentiment: ${aiAnalysis.sentiment}]`,
      customerId,
      now
    );

    if (assignedAgentId) {
      const histId2 = "hist-" + Math.random().toString(36).substring(2, 9);
      db.prepare(`
        INSERT INTO ticket_history (id, ticket_id, previous_status, new_status, action_type, note, changed_by, created_at)
        VALUES (?, ?, 'Open', 'Assigned', 'agent_assigned', ?, ?, ?)
      `).run(
        histId2,
        ticketId,
        `Auto-assigned to agent ${agentName} based on workload & ${aiAnalysis.priority} priority`,
        customerId,
        now
      );

      // Notify agent
      db.prepare(`
        INSERT INTO notifications (id, user_id, title, message, type, link, created_at)
        VALUES (?, ?, ?, ?, 'info', ?, ?)
      `).run(
        "notif-" + Math.random().toString(36).substring(2, 9),
        assignedAgentId,
        `New Ticket Assigned: ${ticketNumber}`,
        `Ticket "${subject.slice(0, 40)}" (${aiAnalysis.priority} Priority) was assigned to you.`,
        `/agent/tickets/${ticketId}`,
        now
      );
    }

    // 7. Notify Admins if Critical
    if (aiAnalysis.priority === "Critical") {
      const admins = db.prepare("SELECT id FROM users WHERE role = 'admin'").all() as { id: string }[];
      for (const admin of admins) {
        db.prepare(`
          INSERT INTO notifications (id, user_id, title, message, type, link, created_at)
          VALUES (?, ?, ?, ?, 'alert', ?, ?)
        `).run(
          "notif-" + Math.random().toString(36).substring(2, 9),
          admin.id,
          `Critical Ticket Alert: ${ticketNumber}`,
          `Critical issue reported: "${subject.slice(0, 45)}" with sentiment "${aiAnalysis.sentiment}".`,
          `/admin/tickets/${ticketId}`,
          now
        );
      }
    }

    // 8. Notify Customer of Ticket Creation
    db.prepare(`
      INSERT INTO notifications (id, user_id, title, message, type, link, created_at)
      VALUES (?, ?, ?, ?, 'success', ?, ?)
    `).run(
      "notif-" + Math.random().toString(36).substring(2, 9),
      customerId,
      `Ticket Created: ${ticketNumber}`,
      `Your support ticket has been received and prioritized as ${aiAnalysis.priority}.`,
      `/customer/tickets/${ticketId}`,
      now
    );

    return NextResponse.json({
      success: true,
      ticket: {
        id: ticketId,
        ticket_number: ticketNumber,
        category: aiAnalysis.category,
        priority: aiAnalysis.priority,
        sentiment: aiAnalysis.sentiment,
        summary: aiAnalysis.summary,
        suggested_response: aiAnalysis.suggested_response,
        status: initialStatus
      }
    });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
