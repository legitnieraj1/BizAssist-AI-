import { NextResponse } from "next/server";
import getSupabaseAdmin from "@/lib/supabase";

export async function GET() {
  try {
    const db = getSupabaseAdmin();

    const { data: customerUsers } = await db
      .from("users")
      .select("id, full_name, email, phone, role, avatar_url, created_at")
      .eq("role", "customer")
      .order("created_at", { ascending: false });

    type CustomerUser = {
      id: string;
      full_name: string;
      email: string;
      phone?: string;
      role: string;
      avatar_url?: string;
      created_at: string;
    };

    const customers = await Promise.all(
      ((customerUsers || []) as CustomerUser[]).map(async (customer) => {
        const { data: customerTickets } = await db
          .from("tickets")
          .select("status, created_at")
          .eq("customer_id", customer.id);

        const tList = (customerTickets || []) as { status: string; created_at: string }[];
        const total_tickets = tList.length;
        const active_tickets = tList.filter(t =>
          ["Open", "Assigned", "In Progress", "Waiting for Customer"].includes(t.status)
        ).length;
        const resolved_tickets = tList.filter(t => ["Resolved", "Closed"].includes(t.status)).length;
        const last_ticket_date = tList.length > 0
          ? tList.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].created_at
          : null;

        return { ...customer, total_tickets, active_tickets, resolved_tickets, last_ticket_date };
      })
    );

    // Sort by most recent ticket date
    customers.sort((a, b) => {
      if (!a.last_ticket_date) return 1;
      if (!b.last_ticket_date) return -1;
      return new Date(b.last_ticket_date).getTime() - new Date(a.last_ticket_date).getTime();
    });

    return NextResponse.json({ customers });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
