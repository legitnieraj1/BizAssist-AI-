import { NextResponse } from "next/server";
import getSupabaseAdmin from "@/lib/supabase";

export async function GET() {
  try {
    const db = getSupabaseAdmin();

    const { data: agentUsers } = await db
      .from("users")
      .select("id, full_name, email, phone, role, avatar_url")
      .eq("role", "agent")
      .order("full_name");

    type AgentUser = {
      id: string;
      full_name: string;
      email: string;
      phone: string;
      role: string;
      avatar_url: string;
    };

    const agents = await Promise.all(
      ((agentUsers || []) as AgentUser[]).map(async (agent) => {
        const { data: agentTickets } = await db
          .from("tickets")
          .select("status, priority")
          .eq("assigned_agent_id", agent.id);

        const tList = (agentTickets || []) as { status: string; priority: string }[];
        const total_assigned = tList.length;
        const active_tickets = tList.filter(t => ["Open", "Assigned", "In Progress"].includes(t.status)).length;
        const resolved_tickets = tList.filter(t => ["Resolved", "Closed"].includes(t.status)).length;
        const critical_tickets = tList.filter(t => t.priority === "Critical" && !["Resolved", "Closed"].includes(t.status)).length;

        return { ...agent, total_assigned, active_tickets, resolved_tickets, critical_tickets };
      })
    );

    return NextResponse.json({ agents });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
