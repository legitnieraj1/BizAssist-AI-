import React from "react";
import TicketDetailView from "@/components/TicketDetailView";

export default async function AgentTicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TicketDetailView id={id} role="agent" />;
}
