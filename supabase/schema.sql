-- ============================================================
-- BizAssist AI — Supabase PostgreSQL Schema + Seed Data
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================

-- ==================== SCHEMA ====================

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('customer', 'agent', 'admin')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tickets (
  id TEXT PRIMARY KEY,
  ticket_number TEXT UNIQUE NOT NULL,
  customer_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assigned_agent_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('Critical', 'High', 'Medium', 'Low')),
  sentiment TEXT NOT NULL CHECK (sentiment IN ('Frustrated', 'Angry', 'Urgent', 'Confused', 'Neutral', 'Satisfied')),
  ai_summary TEXT,
  ai_suggested_response TEXT,
  status TEXT NOT NULL CHECK (status IN ('Open', 'Assigned', 'In Progress', 'Waiting for Customer', 'Resolved', 'Closed')),
  contact_email TEXT,
  contact_phone TEXT,
  attachment_name TEXT,
  attachment_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS ticket_messages (
  id TEXT PRIMARY KEY,
  ticket_id TEXT NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  sender_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  attachment_url TEXT,
  is_internal BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ticket_history (
  id TEXT PRIMARY KEY,
  ticket_id TEXT NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  previous_status TEXT,
  new_status TEXT NOT NULL,
  action_type TEXT NOT NULL,
  note TEXT,
  changed_by TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS knowledge_base (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT,
  view_count INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chat_sessions (
  id TEXT PRIMARY KEY,
  customer_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  customer_name TEXT,
  status TEXT DEFAULT 'active',
  escalated_ticket_id TEXT REFERENCES tickets(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('customer', 'ai_bot', 'system')),
  message TEXT NOT NULL,
  sources_json TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  link TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS platform_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==================== INDEXES ====================

CREATE INDEX IF NOT EXISTS idx_tickets_customer_id ON tickets(customer_id);
CREATE INDEX IF NOT EXISTS idx_tickets_assigned_agent_id ON tickets(assigned_agent_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_priority ON tickets(priority);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON tickets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket_id ON ticket_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_history_ticket_id ON ticket_history(ticket_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);

-- ==================== SEED DATA ====================

-- Users
INSERT INTO users (id, full_name, email, password_hash, phone, role, avatar_url, created_at) VALUES
  ('usr-admin-1', 'Elena Vance', 'admin@bizassist.ai', 'admin123', '+1-555-0199', 'admin', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150', NOW() - INTERVAL '3 days'),
  ('usr-agent-1', 'Alex Rivera', 'alex@bizassist.ai', 'agent123', '+1-555-0144', 'agent', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', NOW() - INTERVAL '3 days'),
  ('usr-agent-2', 'Samantha Chen', 'samantha@bizassist.ai', 'agent123', '+1-555-0155', 'agent', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150', NOW() - INTERVAL '3 days'),
  ('usr-agent-3', 'Marcus Brody', 'marcus@bizassist.ai', 'agent123', '+1-555-0166', 'agent', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', NOW() - INTERVAL '3 days'),
  ('usr-cust-1', 'Sarah Jenkins', 'sarah@acmecorp.com', 'customer123', '+1-555-0111', 'customer', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', NOW() - INTERVAL '3 days'),
  ('usr-cust-2', 'Michael Chang', 'michael@globex.io', 'customer123', '+1-555-0122', 'customer', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', NOW() - INTERVAL '2 days'),
  ('usr-cust-3', 'Emily Watson', 'emily@initech.net', 'customer123', '+1-555-0133', 'customer', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150', NOW() - INTERVAL '1 day')
ON CONFLICT (id) DO NOTHING;

-- Knowledge Base
INSERT INTO knowledge_base (id, title, content, category, tags, view_count, is_published, created_at, updated_at) VALUES
  ('kb-1', 'How to Reset Your Account Password and Enable 2FA', 'To reset your password, visit the login page and click ''Forgot Password''. You will receive a secure token via email valid for 30 minutes. Once logged in, go to Settings > Security to enable Multi-Factor Authentication (MFA/2FA) using Google Authenticator, Authy, or SMS codes.', 'Account Issues', 'password,login,2fa,security,auth', 142, TRUE, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
  ('kb-2', 'Understanding Invoices, Billing Cycles, and Payment Methods', 'BizAssist AI invoices are generated on the 1st of every calendar month. We accept Visa, Mastercard, American Express, and corporate ACH transfers. You can download PDF VAT invoices anytime under Admin > Billing & Invoices. If a charge fails, we retry automatically over 3 consecutive business days before pausing premium features.', 'Billing & Payments', 'billing,invoices,refund,payment,credit card', 98, TRUE, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
  ('kb-3', 'API Rate Limits, Webhook Endpoints, and 429 Errors', 'Standard tier API keys allow 60 requests per minute with burst capacity of 100 req/min. Enterprise keys support 600 req/min. If you receive HTTP 429 Too Many Requests, implement exponential backoff using the ''Retry-After'' header. Webhooks must return HTTP 200 within 5000ms to avoid re-delivery retries.', 'Technical Support', 'api,developer,rate limit,429,webhooks,rest', 64, TRUE, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
  ('kb-4', 'Order Tracking, Shipment Delays, and Courier Updates', 'Track physical hardware keys and enterprise token shipments via the Logistics portal using your BIZ-ORD tracking number. Delivery typically takes 2-4 business days for domestic shipments and 5-8 business days for international orders. In case of unexpected courier delays, contact support immediately for priority expedited dispatch.', 'Orders & Delivery', 'tracking,shipping,order,delivery,courier', 45, TRUE, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
  ('kb-5', 'Refund Eligibility, Money-Back Guarantees, and Credit Memos', 'BizAssist AI provides a 14-day full refund guarantee for new monthly subscriptions if you are unsatisfied. Annual plans are eligible for pro-rated credit memos within 30 days of renewal. To initiate a refund, submit a ticket under ''Billing & Payments'' with your invoice number.', 'Billing & Payments', 'refund,money-back,cancel,downgrade,credit', 73, TRUE, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
  ('kb-6', 'Single Sign-On (SSO) SAML and Okta Integration Setup', 'Administrators can configure SAML 2.0 or OIDC single sign-on through Okta, Azure AD, or Google Workspace. Navigate to Settings > Identity Provider, download the metadata XML, and assign user group roles to automatically map Customer, Agent, or Admin privileges upon directory synchronization.', 'Technical Support', 'sso,saml,okta,azure,directory,enterprise', 87, TRUE, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day')
ON CONFLICT (id) DO NOTHING;

-- Tickets
INSERT INTO tickets (id, ticket_number, customer_id, assigned_agent_id, subject, description, category, priority, sentiment, ai_summary, ai_suggested_response, status, contact_email, contact_phone, attachment_name, created_at, updated_at, resolved_at) VALUES
  ('tkt-1001', 'BIZ-1001', 'usr-cust-1', 'usr-agent-1', 'Urgent: Unable to log into dashboard after password reset loop', 'I have been trying to log into my account since yesterday. Every time I enter my password, the website shows an internal error. I tried resetting my password multiple times, but the issue continues. I have an important payroll export to execute and cannot access my account.', 'Account Issues', 'Critical', 'Frustrated', 'Customer locked out by persistent password reset loop. Issue blocks urgent payroll export operations.', 'Dear Sarah, We deeply apologize for the disruption to your payroll workflow. We have investigated the session cache issue affecting your user profile and forced a secure session invalidation. Please click the refreshed one-time secure link we just dispatched to your email to regain immediate dashboard access.', 'In Progress', 'sarah@acmecorp.com', '+1-555-0111', 'error-screenshot.png', NOW() - INTERVAL '2 days', NOW(), NULL),
  ('tkt-1002', 'BIZ-1002', 'usr-cust-2', 'usr-agent-2', 'Double billed for Enterprise Annual Subscription', 'Our accounting department noticed two identical charges of $1,499 on our corporate Amex on Nov 15th for Invoice #INV-8821 and #INV-8822. Please review and refund the duplicate charge immediately.', 'Billing & Payments', 'High', 'Frustrated', 'Customer billed twice ($1,499 duplicate charges) for corporate Enterprise annual renewal.', 'Hello Michael, Thank you for bringing this to our attention. We have reviewed our payment processor records and confirmed that an idempotent retry error created duplicate invoice #INV-8822. We have voided the charge and initiated an immediate refund of $1,499 back to your Amex.', 'Waiting for Customer', 'michael@globex.io', '+1-555-0122', 'amex-statement.pdf', NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day', NULL),
  ('tkt-1003', 'BIZ-1003', 'usr-cust-3', 'usr-agent-1', 'Webhook delivery failures returning 500 error on customer.created', 'Our webhook listener at https://api.initech.net/webhooks/bizassist has been failing to receive customer.created payload events for the past 4 hours. We are noticing intermittent timeouts.', 'Technical Support', 'High', 'Urgent', 'Customer experiencing webhook delivery failures and timeouts on customer.created event listener.', 'Hi Emily, Our telemetry indicates that your receiving endpoint returned 504 gateway timeouts on 3 consecutive deliveries, causing our exponential backoff system to queue payloads. We have tested a dry-run ping which responded in 120ms and have re-triggered all pending webhook events.', 'Resolved', 'emily@initech.net', '+1-555-0133', 'webhook-logs.txt', NOW() - INTERVAL '3 days', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
  ('tkt-1004', 'BIZ-1004', 'usr-cust-1', NULL, 'Question regarding custom SSL domain mapping on client portal', 'We want to point our company domain support.acmecorp.com to our BizAssist portal. Could you explain the CNAME and DNS TXT verification records we should configure?', 'General Enquiries', 'Low', 'Neutral', 'Customer requesting DNS CNAME and TXT record verification instructions for custom portal domain mapping.', 'Hi Sarah, To configure your custom subdomain support.acmecorp.com, create a CNAME record pointing to proxy.bizassist.ai and a TXT record with key _bizassist-challenge for SSL verification. Full step-by-step instructions can also be found in our Knowledge Base article KB-6.', 'Open', 'sarah@acmecorp.com', '+1-555-0111', NULL, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day', NULL),
  ('tkt-1005', 'BIZ-1005', 'usr-cust-2', 'usr-agent-3', 'Hardware security dongle order shipment tracking update', 'We ordered 5 FIDO2 hardware authentication keys on Nov 10th (Order #BIZ-ORD-492) and have not received tracking information yet. Can you check courier status?', 'Orders & Delivery', 'Medium', 'Confused', 'Customer inquiring about delayed tracking information for 5 ordered FIDO2 hardware security tokens.', 'Hi Michael, Thanks for reaching out. Your order BIZ-ORD-492 was dispatched via FedEx Express Priority with tracking number 7894-2201-9941. It is currently at the local distribution hub scheduled for delivery by tomorrow morning.', 'Assigned', 'michael@globex.io', '+1-555-0122', NULL, NOW() - INTERVAL '1 day', NOW(), NULL)
ON CONFLICT (id) DO NOTHING;

-- Ticket Messages
INSERT INTO ticket_messages (id, ticket_id, sender_id, message, attachment_url, is_internal, created_at) VALUES
  ('msg-1', 'tkt-1001', 'usr-cust-1', 'I have been trying to log into my account since yesterday. Every time I enter my password, the website shows an error. I tried resetting my password multiple times, but the issue continues. I have an important payroll export to execute and cannot access my account.', 'error-screenshot.png', FALSE, NOW() - INTERVAL '2 days'),
  ('msg-2', 'tkt-1001', 'usr-agent-1', 'Hi Sarah, thank you for contacting BizAssist Support. I understand this is critical due to your payroll deadline. I am currently reviewing the authentication logs for your tenant domain right now.', NULL, FALSE, NOW() - INTERVAL '1 day'),
  ('msg-3', 'tkt-1001', 'usr-agent-1', 'Internal Note: Verified Redis token blacklist cache was stuck holding obsolete credential hashes. Flushing cached session tokens.', NULL, TRUE, NOW() - INTERVAL '1 day'),
  ('msg-4', 'tkt-1002', 'usr-cust-2', 'Our accounting department noticed two identical charges of $1,499 on our corporate Amex on Nov 15th for Invoice #INV-8821 and #INV-8822. Please review and refund the duplicate charge immediately.', 'amex-statement.pdf', FALSE, NOW() - INTERVAL '2 days'),
  ('msg-5', 'tkt-1002', 'usr-agent-2', 'Hello Michael, we have identified the duplicate charge from our gateway retry queue. We have issued a direct credit of $1,499.00 to your card ending in 4022. Please confirm once you see the pending credit on your card portal.', NULL, FALSE, NOW() - INTERVAL '1 day')
ON CONFLICT (id) DO NOTHING;

-- Ticket History
INSERT INTO ticket_history (id, ticket_id, previous_status, new_status, action_type, note, changed_by, created_at) VALUES
  ('hist-1', 'tkt-1001', NULL, 'Open', 'ai_classified', 'AI classified as Critical priority / Frustrated sentiment', 'usr-admin-1', NOW() - INTERVAL '2 days'),
  ('hist-2', 'tkt-1001', 'Open', 'Assigned', 'agent_assigned', 'Assigned to Alex Rivera', 'usr-admin-1', NOW() - INTERVAL '2 days'),
  ('hist-3', 'tkt-1001', 'Assigned', 'In Progress', 'status_change', 'Agent commenced active investigation', 'usr-agent-1', NOW() - INTERVAL '1 day'),
  ('hist-4', 'tkt-1002', NULL, 'Open', 'ai_classified', 'AI classified as High priority / Frustrated sentiment', 'usr-admin-1', NOW() - INTERVAL '2 days'),
  ('hist-5', 'tkt-1002', 'Open', 'Waiting for Customer', 'status_change', 'Refund issued, awaiting customer bank confirmation', 'usr-agent-2', NOW() - INTERVAL '1 day'),
  ('hist-6', 'tkt-1003', 'In Progress', 'Resolved', 'status_change', 'Webhook backoff cleared and events replayed', 'usr-agent-1', NOW() - INTERVAL '1 day')
ON CONFLICT (id) DO NOTHING;

-- Notifications
INSERT INTO notifications (id, user_id, title, message, type, link, is_read, created_at) VALUES
  ('notif-1', 'usr-admin-1', 'Critical Ticket Alert', 'Ticket BIZ-1001 submitted by Sarah Jenkins requires immediate attention.', 'alert', '/admin/tickets/tkt-1001', FALSE, NOW() - INTERVAL '2 days'),
  ('notif-2', 'usr-agent-1', 'New Ticket Assigned', 'You were assigned to Ticket BIZ-1001 (Account lockout).', 'info', '/agent/tickets/tkt-1001', FALSE, NOW() - INTERVAL '2 days'),
  ('notif-3', 'usr-cust-1', 'Support Agent Replied', 'Alex Rivera replied to your ticket BIZ-1001.', 'success', '/customer/tickets/tkt-1001', FALSE, NOW() - INTERVAL '1 day'),
  ('notif-4', 'usr-cust-2', 'Refund Initiated', 'Samantha Chen initiated refund of $1,499 for Invoice #INV-8822.', 'success', '/customer/tickets/tkt-1002', FALSE, NOW() - INTERVAL '1 day')
ON CONFLICT (id) DO NOTHING;

-- Platform Settings
INSERT INTO platform_settings (key, value, updated_at) VALUES
  ('ai_model', 'Gemini 2.5 Flash (Hybrid Fallback)', NOW()),
  ('auto_assign_enabled', 'true', NOW()),
  ('sla_critical_hours', '2', NOW()),
  ('sla_high_hours', '8', NOW())
ON CONFLICT (key) DO NOTHING;
