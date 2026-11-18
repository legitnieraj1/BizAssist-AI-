import { NextResponse } from "next/server";
import getDatabase from "@/lib/db";

export async function GET() {
  try {
    const db = getDatabase();

    const agents = db.prepare(`
      SELECT 
        u.id,
        u.full_name,
        u.email,
        u.phone,
        u.role,
        u.avatar_url,
        COUNT(t.id) as total_assigned,
        SUM(CASE WHEN t.status IN ('Open', 'Assigned', 'In Progress') THEN 1 ELSE 0 END) as active_tickets,
        SUM(CASE WHEN t.status IN ('Resolved', 'Closed') THEN 1 ELSE 0 END) as resolved_tickets,
        SUM(CASE WHEN t.priority = 'Critical' AND t.status NOT IN ('Resolved', 'Closed') THEN 1 ELSE 0 END) as critical_tickets
      FROM users u
      LEFT JOIN tickets t ON u.id = t.assigned_agent_id
      WHERE u.role = 'agent'
      GROUP BY u.id
      ORDER BY u.full_name ASC
    `).all();

    return NextResponse.json({ agents });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
