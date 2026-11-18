import { NextResponse } from "next/server";
import getDatabase from "@/lib/db";

export async function GET() {
  try {
    const db = getDatabase();

    const customers = db.prepare(`
      SELECT 
        u.id,
        u.full_name,
        u.email,
        u.phone,
        u.role,
        u.avatar_url,
        u.created_at,
        COUNT(t.id) as total_tickets,
        SUM(CASE WHEN t.status IN ('Open', 'Assigned', 'In Progress', 'Waiting for Customer') THEN 1 ELSE 0 END) as active_tickets,
        SUM(CASE WHEN t.status IN ('Resolved', 'Closed') THEN 1 ELSE 0 END) as resolved_tickets,
        MAX(t.created_at) as last_ticket_date
      FROM users u
      LEFT JOIN tickets t ON u.id = t.customer_id
      WHERE u.role = 'customer'
      GROUP BY u.id
      ORDER BY last_ticket_date DESC NULLS LAST
    `).all();

    return NextResponse.json({ customers });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
