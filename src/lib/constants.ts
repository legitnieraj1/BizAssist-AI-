export const TICKET_CATEGORIES = [
  "Technical Support",
  "Billing & Payments",
  "Account Issues",
  "Orders & Delivery",
  "Product Issues",
  "General Enquiries",
  "Other",
] as const;

export type TicketCategory = typeof TICKET_CATEGORIES[number];
