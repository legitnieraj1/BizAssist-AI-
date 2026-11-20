import { NextResponse } from "next/server";
import getSupabaseAdmin from "@/lib/supabase";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getSupabaseAdmin();
    const currentUser = await getCurrentUser();

    const { data: ticket, error } = await db
      .from("tickets")
      .select(`
        *,
        customer:users!tickets_customer_id_fkey(full_name, email, phone, avatar_url),
        agent:users!tickets_assigned_agent_id_fkey(full_name, email, avatar_url)
      `)
      .eq("id", id)
      .single();

    if (error || !ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    // Role check: customer can only view their own ticket
    if (currentUser?.role === "customer" && ticket.customer_id !== currentUser.id) {
      return NextResponse.json({ error: "Unauthorized access to ticket" }, { status: 403 });
    }

    // Flatten nested joins
    const flatTicket = {
      ...ticket,
      customer_name: ticket.customer?.full_name,
      customer_email: ticket.customer?.email,
      customer_phone: ticket.customer?.phone,
      customer_avatar: ticket.customer?.avatar_url,
      agent_name: ticket.agent?.full_name,
      agent_email: ticket.agent?.email,
      agent_avatar: ticket.agent?.avatar_url,
      customer: undefined,
      agent: undefined
    };

    // Fetch messages
    const { data: messagesRaw } = await db
      .from("ticket_messages")
      .select(`*, sender:users!ticket_messages_sender_id_fkey(full_name, role, avatar_url)`)
      .eq("ticket_id", id)
      .order("created_at");

    const messages = ((messagesRaw || []) as any[]).map(m => ({
      ...m,
      sender_name: m.sender?.full_name,
      sender_role: m.sender?.role,
      sender_avatar: m.sender?.avatar_url,
      sender: undefined
    }));

    // Fetch history
    const { data: historyRaw } = await db
      .from("ticket_history")
      .select(`*, changer:users!ticket_history_changed_by_fkey(full_name, role)`)
      .eq("ticket_id", id)
      .order("created_at", { ascending: false });

    const history = ((historyRaw || []) as any[]).map(h => ({
      ...h,
      changed_by_name: h.changer?.full_name,
      changed_by_role: h.changer?.role,
      changer: undefined
    }));

    return NextResponse.json({ ticket: flatTicket, messages, history });
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
    const db = getSupabaseAdmin();

    const { data: currentTicket } = await db
      .from("tickets")
      .select("*")
      .eq("id", id)
      .single();

    if (!currentTicket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    const changerId = currentUser?.id || "usr-admin-1";
    const now = new Date().toISOString();
    const updates: Record<string, unknown> = { updated_at: now };

    // Status change
    if (body.status && body.status !== currentTicket.status) {
      updates.status = body.status;
      if (body.status === "Resolved" || body.status === "Closed") {
        updates.resolved_at = now;
      }

      await db.from("ticket_history").insert({
        id: "hist-" + Math.random().toString(36).substring(2, 9),
        ticket_id: id,
        previous_status: currentTicket.status,
        new_status: body.status,
        action_type: "status_change",
        note: body.note || `Status transitioned from ${currentTicket.status} to ${body.status}`,
        changed_by: changerId,
        created_at: now
      });

      await db.from("notifications").insert({
        id: "notif-" + Math.random().toString(36).substring(2, 9),
        user_id: currentTicket.customer_id,
        title: `Ticket Status: ${body.status}`,
        message: `Your ticket ${currentTicket.ticket_number} status is now "${body.status}".`,
        type: "info",
        link: `/customer/tickets/${id}`,
        created_at: now
      });
    }

    // Priority change
    if (body.priority && body.priority !== currentTicket.priority) {
      updates.priority = body.priority;

      await db.from("ticket_history").insert({
        id: "hist-" + Math.random().toString(36).substring(2, 9),
        ticket_id: id,
        previous_status: currentTicket.status,
        new_status: currentTicket.status,
        action_type: "priority_change",
        note: `Priority modified from ${currentTicket.priority} to ${body.priority} by support`,
        changed_by: changerId,
        created_at: now
      });
    }

    // Assignment change
    if (body.assigned_agent_id !== undefined && body.assigned_agent_id !== currentTicket.assigned_agent_id) {
      updates.assigned_agent_id = body.assigned_agent_id || null;

      let agentName = "Unassigned";
      if (body.assigned_agent_id) {
        const { data: ag } = await db
          .from("users")
          .select("full_name")
          .eq("id", body.assigned_agent_id)
          .single();
        if (ag) agentName = ag.full_name;
      }

      // If assigning from Open, upgrade to Assigned
      if (body.assigned_agent_id && currentTicket.status === "Open") {
        updates.status = "Assigned";
      }

      await db.from("ticket_history").insert({
        id: "hist-" + Math.random().toString(36).substring(2, 9),
        ticket_id: id,
        previous_status: currentTicket.status,
        new_status: body.assigned_agent_id && currentTicket.status === "Open" ? "Assigned" : currentTicket.status,
        action_type: "agent_assigned",
        note: `Assigned to agent ${agentName}`,
        changed_by: changerId,
        created_at: now
      });

      if (body.assigned_agent_id) {
        await db.from("notifications").insert({
          id: "notif-" + Math.random().toString(36).substring(2, 9),
          user_id: body.assigned_agent_id,
          title: `Ticket Reassigned: ${currentTicket.ticket_number}`,
          message: `You have been assigned ticket "${String(currentTicket.subject).slice(0, 40)}"`,
          type: "info",
          link: `/agent/tickets/${id}`,
          created_at: now
        });
      }
    }

    // Category override
    if (body.category && body.category !== currentTicket.category) {
      updates.category = body.category;
    }

    // AI field updates
    if (body.ai_summary) updates.ai_summary = body.ai_summary;
    if (body.ai_suggested_response) updates.ai_suggested_response = body.ai_suggested_response;

    const { data: updated, error } = await db
      .from("tickets")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true, ticket: updated });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
