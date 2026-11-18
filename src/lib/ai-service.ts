import getDatabase from "./db";
import { TICKET_CATEGORIES } from "./constants";

export { TICKET_CATEGORIES };

export interface AIClassificationResult {
  category: string;
  priority: "Critical" | "High" | "Medium" | "Low";
  sentiment: "Frustrated" | "Angry" | "Urgent" | "Confused" | "Neutral" | "Satisfied";
  summary: string;
  suggested_response: string;
}

export interface ChatbotResponse {
  answer: string;
  sources: Array<{ id: string; title: string; category: string }>;
  suggestEscalation: boolean;
  suggestedFollowUps: string[];
}

// Allowed categories exported from constants

/**
 * Main AI Ticket Classifier & Analyzer
 */
export async function analyzeTicketWithAI(
  subject: string,
  description: string,
  customerCategory?: string
): Promise<AIClassificationResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const geminiResult = await callGeminiClassifier(apiKey, subject, description, customerCategory);
      if (geminiResult) return geminiResult;
    } catch (err) {
      console.warn("Gemini API call failed, falling back to intelligent rule engine:", err);
    }
  }

  // Intelligent Semantic Fallback Engine
  return semanticAnalyzeTicket(subject, description, customerCategory);
}

/**
 * Intelligent Semantic / Heuristic Engine
 */
function semanticAnalyzeTicket(
  subject: string,
  description: string,
  customerCategory?: string
): AIClassificationResult {
  const text = `${subject} ${description}`.toLowerCase();

  // 1. Determine Category
  let category: string = customerCategory || "General Enquiries";

  const isTechnical = /api|webhook|500|429|bug|error|crash|timeout|latency|sdk|stack trace|code|database|server|endpoint/i.test(text);
  const isBilling = /bill|invoice|charge|refund|credit|payment|amex|visa|card|overcharged|subscription|pricing|receipt/i.test(text);
  const isAccount = /login|logout|password|reset|2fa|mfa|locked|account|access|permission|sso|saml|email change/i.test(text);
  const isOrders = /order|shipping|courier|delivery|fedex|ups|tracking|shipment|hardware|package|arrive/i.test(text);
  const isProduct = /feature|ui|dashboard|export|button|slow|display|mobile app|integration|settings/i.test(text);

  if (isBilling) category = "Billing & Payments";
  else if (isAccount) category = "Account Issues";
  else if (isTechnical) category = "Technical Support";
  else if (isOrders) category = "Orders & Delivery";
  else if (isProduct) category = "Product Issues";

  // 2. Determine Priority
  let priority: "Critical" | "High" | "Medium" | "Low" = "Medium";

  const criticalSignals = [
    "down", "outage", "security", "breach", "payroll", "halt", "all users", "emergency", "lost revenue",
    "cannot access", "locked out completely", "data loss", "urgent", "production", "blocked"
  ];
  const highSignals = [
    "broken", "double bill", "refund immediately", "timeout", "intermittent", "500 error",
    "cannot work", "deadline", "fail", "unable to", "blocking"
  ];
  const lowSignals = [
    "how to", "inquiry", "question", "curious", "documentation", "guide", "minor", "typo"
  ];

  const hasCritical = criticalSignals.some(w => text.includes(w));
  const hasHigh = highSignals.some(w => text.includes(w));
  const hasLow = lowSignals.some(w => text.includes(w));

  if (hasCritical && (category === "Account Issues" || category === "Technical Support" || category === "Billing & Payments")) {
    priority = "Critical";
  } else if (hasHigh || hasCritical) {
    priority = "High";
  } else if (hasLow) {
    priority = "Low";
  } else {
    priority = "Medium";
  }

  // 3. Determine Sentiment
  let sentiment: AIClassificationResult["sentiment"] = "Neutral";
  if (/furious|angry|ridiculous|unacceptable|lawyer|threaten|worst|scam|terrible/i.test(text)) {
    sentiment = "Angry";
  } else if (/frustrated|stuck|tried multiple times|since yesterday|still not working|disappointed|error again/i.test(text)) {
    sentiment = "Frustrated";
  } else if (/urgent|asap|emergency|immediately|critical|deadline|time sensitive/i.test(text)) {
    sentiment = "Urgent";
  } else if (/confused|unclear|why|where is|don't understand|haven't received/i.test(text)) {
    sentiment = "Confused";
  } else if (/thank|great|love|appreciate|helpful/i.test(text)) {
    sentiment = "Satisfied";
  }

  // 4. Generate AI Summary (Module 5)
  let summary = "";
  if (category === "Account Issues") {
    summary = `Customer is experiencing an authentication failure (${subject.slice(0, 60)}). Immediate access to account services is hindered.`;
  } else if (category === "Billing & Payments") {
    summary = `Customer reports a financial transaction dispute regarding ${subject.slice(0, 60)}. Requires invoice verification or refund processing.`;
  } else if (category === "Technical Support") {
    summary = `Technical disruption reported regarding ${subject.slice(0, 60)}. Telemetry inspection and endpoint diagnostics needed.`;
  } else if (category === "Orders & Delivery") {
    summary = `Inquiry regarding fulfillment logistics and shipment status for ${subject.slice(0, 60)}.`;
  } else {
    summary = `Customer inquiry regarding ${subject.slice(0, 60)}. Requires support review and contextual guidance.`;
  }

  // 5. Generate AI Suggested Response (Module 4)
  let suggested_response = "";
  if (category === "Account Issues") {
    suggested_response = `Dear Customer,\n\nThank you for reaching out to BizAssist Support. We understand how critical it is to regain secure access to your account.\n\nWe have initiated an internal session audit and cleared any conflicting authentication locks. Please try resetting your session via the password reset portal, and feel free to reply directly to this ticket if the issue persists so we can issue a direct one-time access token.\n\nBest regards,\nBizAssist AI Support Team`;
  } else if (category === "Billing & Payments") {
    suggested_response = `Hello,\n\nThank you for bringing this billing matter to our attention. We take billing accuracy very seriously.\n\nOur finance team has been notified to inspect the charge history against your account records. If a duplicate transaction or incorrect tier charge occurred, we will issue a direct refund to your original payment method within 1-3 business days.\n\nSincerely,\nBizAssist Billing Team`;
  } else if (category === "Technical Support") {
    suggested_response = `Hello,\n\nThank you for the detailed error report. We are actively reviewing our system health dashboards and endpoint logs for the timeframe specified.\n\nTo help us isolate the issue faster, could you confirm if this occurs across all team members or specific IP locations? We will follow up shortly with a technical update.\n\nBest regards,\nBizAssist Technical Operations`;
  } else {
    suggested_response = `Hi,\n\nThank you for contacting BizAssist Support. We have received your request regarding "${subject}".\n\nOur team is reviewing the details provided and will get back to you with a comprehensive solution shortly. In the meantime, please let us know if there is any additional information you would like to share.\n\nWarm regards,\nBizAssist Support Team`;
  }

  return {
    category,
    priority,
    sentiment,
    summary,
    suggested_response,
  };
}

/**
 * Regenerate Response with Specific Tone (Module 4)
 */
export async function regenerateAIResponse(
  subject: string,
  description: string,
  tone: "Empathetic" | "Direct & Technical" | "Concise" | "Step-by-Step",
  summary?: string
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const prompt = `You are an expert customer support agent for BizAssist AI SaaS platform.
Customer Ticket Subject: "${subject}"
Customer Complaint: "${description}"
Summary: "${summary || ""}"

Generate a polished response adhering strictly to the requested tone: ${tone}.
Keep it professional, helpful, and ready to send. Do not include markdown code fences.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.3, maxOutputTokens: 500 }
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text.trim();
      }
    } catch (e) {
      console.warn("Gemini tone generation fallback:", e);
    }
  }

  // Built-in Tone Variations
  switch (tone) {
    case "Empathetic":
      return `Dear Customer,\n\nI am truly sorry to hear about the frustration and inconvenience this issue has caused you. We completely understand the impact this has on your daily workflow, and we are treating this as an utmost priority.\n\nOur specialist team is actively investigating the root cause right now, and I will personally track this ticket until it is fully resolved. We truly appreciate your patience while we make things right.\n\nWarm regards,\nBizAssist Senior Care Team`;

    case "Direct & Technical":
      return `Hello,\n\nWe have identified the operational issue referenced in your ticket. The symptoms align with an upstream gateway / state synchronization latency.\n\nAction Plan:\n1. We have reset the active cache state for your tenant.\n2. Inbound webhook and session endpoints have been verified responsive.\n3. Please retry the operation and reply with the HTTP status code if the error persists.\n\nBest,\nBizAssist Engineering Support`;

    case "Concise":
      return `Hi,\n\nWe have received your ticket regarding "${subject}". We've applied an update to resolve this on our end. Please refresh and check if the issue is cleared. If you still encounter problems, simply reply here.\n\nThanks,\nBizAssist Support`;

    case "Step-by-Step":
      return `Hi there,\n\nTo resolve this as quickly as possible, please follow these steps:\n\nStep 1: Sign out completely and clear browser cache or incognito window.\nStep 2: Access the portal and request a fresh authorization token.\nStep 3: Verify that your corporate firewall allows outbound traffic to *.bizassist.ai.\n\nIf you get stuck on any step, let us know exactly where it halts so we can assist immediately.\n\nBest regards,\nBizAssist Support Team`;

    default:
      return `Hi,\n\nThank you for reaching out. We are working on your request and will provide an update shortly.\n\nBizAssist Support Team`;
  }
}

/**
 * Gemini Live API Ticket Classifier
 */
async function callGeminiClassifier(
  apiKey: string,
  subject: string,
  description: string,
  customerCategory?: string
): Promise<AIClassificationResult | null> {
  const prompt = `Analyze this customer support ticket for BizAssist AI SaaS platform and produce a strictly valid JSON response.
Subject: "${subject}"
Description: "${description}"
Customer Selected Category: "${customerCategory || "None"}"

Respond ONLY with a JSON object matching this schema:
{
  "category": "Technical Support" | "Billing & Payments" | "Account Issues" | "Orders & Delivery" | "Product Issues" | "General Enquiries" | "Other",
  "priority": "Critical" | "High" | "Medium" | "Low",
  "sentiment": "Frustrated" | "Angry" | "Urgent" | "Confused" | "Neutral" | "Satisfied",
  "summary": "Short 1-2 sentence summary of core complaint and impact",
  "suggested_response": "Empathetic, professional suggested first response for an agent"
}`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.1
        }
      })
    }
  );

  if (!response.ok) return null;
  const data = await response.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) return null;

  return JSON.parse(rawText) as AIClassificationResult;
}

/**
 * Module 6: Knowledge-Based AI Chatbot Query Engine
 */
export async function queryKnowledgeBaseChatbot(
  userQuery: string,
  conversationHistory: Array<{ role: "user" | "bot"; text: string }> = []
): Promise<ChatbotResponse> {
  const db = getDatabase();

  // Retrieve published knowledge base articles
  const articles = db.prepare(`
    SELECT id, title, content, category, tags
    FROM knowledge_base
    WHERE is_published = 1
  `).all() as Array<{ id: string; title: string; content: string; category: string; tags: string }>;

  const queryTokens = userQuery.toLowerCase().split(/\s+/).filter(w => w.length > 2);

  // Score articles by token matching in title, content, and tags
  const scored = articles.map(art => {
    let score = 0;
    const fullArtText = `${art.title} ${art.content} ${art.tags}`.toLowerCase();
    for (const token of queryTokens) {
      if (art.title.toLowerCase().includes(token)) score += 5;
      if (art.tags.toLowerCase().includes(token)) score += 3;
      if (art.content.toLowerCase().includes(token)) score += 1;
    }
    return { ...art, score };
  }).filter(a => a.score > 0).sort((a, b) => b.score - a.score);

  const topArticles = scored.slice(0, 2);

  // Check if we found relevant articles
  if (topArticles.length > 0 && topArticles[0].score >= 3) {
    const primary = topArticles[0];

    // Increment view count
    db.prepare("UPDATE knowledge_base SET view_count = view_count + 1 WHERE id = ?").run(primary.id);

    return {
      answer: `Based on our verified Knowledge Base article **"${primary.title}"**:\n\n${primary.content}\n\n*Does this answer your question, or would you like me to open a ticket for human support?*`,
      sources: topArticles.map(a => ({ id: a.id, title: a.title, category: a.category })),
      suggestEscalation: false,
      suggestedFollowUps: [
        "How do I contact customer support directly?",
        "What are your business support hours?",
        "Create a ticket for this issue"
      ]
    };
  }

  // Out-of-KB response: acknowledge limitation and offer escalation
  return {
    answer: `I searched our official knowledge base for **"${userQuery}"**, but I could not find a confirmed article that addresses your specific request.\n\nTo ensure you receive accurate and authorized assistance, I recommend creating a support ticket so our specialized support agents can investigate directly.`,
    sources: [],
    suggestEscalation: true,
    suggestedFollowUps: [
      "Open a support ticket now",
      "How can I reset my password?",
      "How do I track my order?",
      "What is your refund policy?"
    ]
  };
}
