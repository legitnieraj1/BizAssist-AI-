import { NextResponse } from "next/server";
import getSupabaseAdmin from "@/lib/supabase";
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
    const db = getSupabaseAdmin();

    const { data: ticket } = await db
      .from("tickets")
      .select("*")
      .eq("id", id)
      .single();

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    const senderId = currentUser?.id || (body.sender_id || ticket.customer_id);
    const now = new Date().toISOString();
    const msgId = "msg-" + Math.random().toString(36).substring(2, 9);

    await db.from("ticket_messages").insert({
      id: msgId,
      ticket_id: id,
      sender_id: senderId,
      message: message.trim(),
      attachment_url: attachment_url || null,
      is_internal: is_internal ? true : false,
      created_at: now
    });

    // Update ticket updated_at
    await db.from("tickets").update({ updated_at: now }).eq("id", id);

    // Auto-update status based on sender role
    const { data: sender } = await db
      .from("users")
      .select("role, full_name")
      .eq("id", senderId)
      .single();

    if (sender?.role === "agent" && !is_internal) {
      if (ticket.status !== "Resolved" && ticket.status !== "Closed") {
        await db.from("tickets").update({ status: "Waiting for Customer" }).eq("id", id);

        await db.from("ticket_history").insert({
          id: "hist-" + Math.random().toString(36).substring(2, 9),
          ticket_id: id,
          previous_status: ticket.status,
          new_status: "Waiting for Customer",
          action_type: "status_change",
          note: `Agent ${sender.full_name} sent response to customer`,
          changed_by: senderId,
          created_at: now
        });
      }

      // Notify customer
      await db.from("notifications").insert({
        id: "notif-" + Math.random().toString(36).substring(2, 9),
        user_id: ticket.customer_id,
        title: `New Message on ${ticket.ticket_number}`,
        message: `${sender.full_name} replied: "${message.trim().slice(0, 50)}..."`,
        type: "info",
        link: `/customer/tickets/${id}`,
        created_at: now
      });
    } else if (sender?.role === "customer") {
      if (ticket.status === "Waiting for Customer") {
        await db.from("tickets").update({ status: "In Progress" }).eq("id", id);

        await db.from("ticket_history").insert({
          id: "hist-" + Math.random().toString(36).substring(2, 9),
          ticket_id: id,
          previous_status: "Waiting for Customer",
          new_status: "In Progress",
          action_type: "status_change",
          note: "Customer replied with further details",
          changed_by: senderId,
          created_at: now
        });
      }

      if (ticket.assigned_agent_id) {
        await db.from("notifications").insert({
          id: "notif-" + Math.random().toString(36).substring(2, 9),
          user_id: ticket.assigned_agent_id,
          title: `Customer Replied on ${ticket.ticket_number}`,
          message: `${sender.full_name} sent an update.`,
          type: "info",
          link: `/agent/tickets/${id}`,
          created_at: now
        });
      }
    }

    // Return the inserted message with sender info
    const { data: insertedMsg } = await db
      .from("ticket_messages")
      .select(`*, sender:users!ticket_messages_sender_id_fkey(full_name, role, avatar_url)`)
      .eq("id", msgId)
      .single();

    const flatMsg = insertedMsg
      ? {
          ...insertedMsg,
          sender_name: insertedMsg.sender?.full_name,
          sender_role: insertedMsg.sender?.role,
          sender_avatar: insertedMsg.sender?.avatar_url,
          sender: undefined
        }
      : null;

    return NextResponse.json({ success: true, message: flatMsg });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
