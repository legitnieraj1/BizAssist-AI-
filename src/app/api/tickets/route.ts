import { NextResponse } from "next/server";
import getSupabaseAdmin from "@/lib/supabase";
import { getCurrentUser } from "@/lib/auth";
import { analyzeTicketWithAI } from "@/lib/ai-service";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const currentUser = await getCurrentUser();
    const db = getSupabaseAdmin();

    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const assignedAgentId = searchParams.get("assigned_agent_id");
    const customerId = searchParams.get("customer_id");

    // Build a Postgres query via RPC or use the Supabase query builder with joins
    // We use a raw SQL approach via rpc for the complex join + ordering
    let query = db
      .from("tickets")
      .select(`
        *,
        customer:users!tickets_customer_id_fkey(full_name, email, avatar_url),
        agent:users!tickets_assigned_agent_id_fkey(full_name, avatar_url)
      `);

    // Role-based isolation
    if (currentUser?.role === "customer") {
      query = query.eq("customer_id", currentUser.id);
    } else if (currentUser?.role === "agent" && searchParams.get("my_assigned") === "true") {
      query = query.eq("assigned_agent_id", currentUser.id);
    }

    if (customerId) query = query.eq("customer_id", customerId);

    if (assignedAgentId) {
      if (assignedAgentId === "unassigned") {
        query = query.is("assigned_agent_id", null);
      } else {
        query = query.eq("assigned_agent_id", assignedAgentId);
      }
    }

    if (status && status !== "All") query = query.eq("status", status);
    if (priority && priority !== "All") query = query.eq("priority", priority);
    if (category && category !== "All") query = query.eq("category", category);

    if (search && search.trim().length > 0) {
      const term = search.trim();
      query = query.or(`ticket_number.ilike.%${term}%,subject.ilike.%${term}%,description.ilike.%${term}%`);
    }

    // Priority ordering: Critical=1, High=2, Medium=3, Low=4
    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Flatten nested join data and sort by priority
    const priorityOrder: Record<string, number> = { Critical: 1, High: 2, Medium: 3, Low: 4 };
    const tickets = ((data || []) as any[])
      .map((t) => ({
        ...t,
        customer_name: t.customer?.full_name,
        customer_email: t.customer?.email,
        customer_avatar: t.customer?.avatar_url,
        agent_name: t.agent?.full_name,
        agent_avatar: t.agent?.avatar_url,
        customer: undefined,
        agent: undefined
      }))
      .sort((a, b) => (priorityOrder[a.priority] ?? 5) - (priorityOrder[b.priority] ?? 5));

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

    const db = getSupabaseAdmin();

    // Determine customer ID
    let customerId = currentUser?.role === "customer" ? currentUser.id : null;
    if (!customerId) {
      const { data: defaultCustomer } = await db
        .from("users")
        .select("id, email, phone")
        .eq("role", "customer")
        .limit(1)
        .single();
      customerId = defaultCustomer?.id || "usr-cust-1";
    }

    // 1. Run AI Classification
    const aiAnalysis = await analyzeTicketWithAI(subject, description, userCategory);

    // 2. Generate unique Ticket Number
    const { count } = await db.from("tickets").select("*", { count: "exact", head: true });
    const ticketNumber = `BIZ-${1000 + (count || 0) + 1}`;
    const ticketId = "tkt-" + Math.random().toString(36).substring(2, 9);
    const now = new Date().toISOString();

    // 3. Smart Auto-Assignment for Critical/High tickets
    let assignedAgentId: string | null = null;
    let agentName: string | null = null;

    if (aiAnalysis.priority === "Critical" || aiAnalysis.priority === "High") {
      // Get agent with fewest active tickets
      const { data: agents } = await db
        .from("users")
        .select("id, full_name")
        .eq("role", "agent");

      if (agents && agents.length > 0) {
        // Count active tickets per agent
        const agentLoads = await Promise.all(
          ((agents || []) as any[]).map(async (agent: any) => {
            const { count: activeCount } = await db
              .from("tickets")
              .select("*", { count: "exact", head: true })
              .eq("assigned_agent_id", agent.id)
              .in("status", ["Open", "Assigned", "In Progress"]);
            return { ...agent, activeCount: activeCount || 0 };
          })
        );
        agentLoads.sort((a, b) => a.activeCount - b.activeCount);
        assignedAgentId = agentLoads[0].id;
        agentName = agentLoads[0].full_name;
      }
    }

    const initialStatus = assignedAgentId ? "Assigned" : "Open";

    // 4. Insert Ticket
    const { error: ticketError } = await db.from("tickets").insert({
      id: ticketId,
      ticket_number: ticketNumber,
      customer_id: customerId,
      assigned_agent_id: assignedAgentId,
      subject: subject.trim(),
      description: description.trim(),
      category: aiAnalysis.category,
      priority: aiAnalysis.priority,
      sentiment: aiAnalysis.sentiment,
      ai_summary: aiAnalysis.summary,
      ai_suggested_response: aiAnalysis.suggested_response,
      status: initialStatus,
      contact_email: contact_email || currentUser?.email || "customer@example.com",
      contact_phone: contact_phone || currentUser?.phone || null,
      attachment_name: attachment_name || null,
      attachment_url: attachment_url || null,
      created_at: now,
      updated_at: now
    });

    if (ticketError) return NextResponse.json({ error: ticketError.message }, { status: 500 });

    // 5. Insert initial message
    await db.from("ticket_messages").insert({
      id: "msg-" + Math.random().toString(36).substring(2, 9),
      ticket_id: ticketId,
      sender_id: customerId,
      message: description.trim(),
      attachment_url: attachment_url || null,
      is_internal: false,
      created_at: now
    });

    // 6. Record AI Classification history
    await db.from("ticket_history").insert({
      id: "hist-" + Math.random().toString(36).substring(2, 9),
      ticket_id: ticketId,
      previous_status: null,
      new_status: initialStatus,
      action_type: "ai_classified",
      note: `AI Auto-Classified: [Category: ${aiAnalysis.category}, Priority: ${aiAnalysis.priority}, Sentiment: ${aiAnalysis.sentiment}]`,
      changed_by: customerId,
      created_at: now
    });

    if (assignedAgentId) {
      await db.from("ticket_history").insert({
        id: "hist-" + Math.random().toString(36).substring(2, 9),
        ticket_id: ticketId,
        previous_status: "Open",
        new_status: "Assigned",
        action_type: "agent_assigned",
        note: `Auto-assigned to agent ${agentName} based on workload & ${aiAnalysis.priority} priority`,
        changed_by: customerId,
        created_at: now
      });

      // Notify agent
      await db.from("notifications").insert({
        id: "notif-" + Math.random().toString(36).substring(2, 9),
        user_id: assignedAgentId,
        title: `New Ticket Assigned: ${ticketNumber}`,
        message: `Ticket "${subject.slice(0, 40)}" (${aiAnalysis.priority} Priority) was assigned to you.`,
        type: "info",
        link: `/agent/tickets/${ticketId}`,
        created_at: now
      });
    }

    // 7. Notify Admins if Critical
    if (aiAnalysis.priority === "Critical") {
      const { data: admins } = await db.from("users").select("id").eq("role", "admin");
      if (admins) {
        await Promise.all(
          ((admins || []) as any[]).map((admin: any) =>
            db.from("notifications").insert({
              id: "notif-" + Math.random().toString(36).substring(2, 9),
              user_id: admin.id,
              title: `Critical Ticket Alert: ${ticketNumber}`,
              message: `Critical issue reported: "${subject.slice(0, 45)}" with sentiment "${aiAnalysis.sentiment}".`,
              type: "alert",
              link: `/admin/tickets/${ticketId}`,
              created_at: now
            })
          )
        );
      }
    }

    // 8. Notify Customer
    await db.from("notifications").insert({
      id: "notif-" + Math.random().toString(36).substring(2, 9),
      user_id: customerId,
      title: `Ticket Created: ${ticketNumber}`,
      message: `Your support ticket has been received and prioritized as ${aiAnalysis.priority}.`,
      type: "success",
      link: `/customer/tickets/${ticketId}`,
      created_at: now
    });

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
