// Support / customer ops mock data — NGN-only.
import { fmtNgn } from "./mock-data";

export { fmtNgn };

export type ThreadMessage = {
  id: string;
  author: string;
  authorRole: "customer" | "agent" | "system";
  body: string;
  at: string;
  internal?: boolean;
};

export type TicketChannel = "email" | "chat" | "whatsapp" | "twitter" | "in_app" | "phone";
export type TicketStatus = "new" | "open" | "pending" | "on_hold" | "resolved" | "closed";
export type TicketPriority = "low" | "normal" | "high" | "urgent";
export type TicketCategory =
  | "wallet_topup"
  | "wallet_payout"
  | "card_decline"
  | "card_dispute"
  | "kyc"
  | "bill_payment"
  | "esim"
  | "phone_number"
  | "fraud"
  | "account_access"
  | "general";

export type Ticket = {
  id: string;
  subject: string;
  customerName: string;
  customerId: string;
  customerEmail: string;
  channel: TicketChannel;
  status: TicketStatus;
  priority: TicketPriority;
  category: TicketCategory;
  assigneeName: string | null;
  assigneeId: string | null;
  createdAt: string;
  updatedAt: string;
  firstResponseMins: number | null; // minutes from open to first agent reply, null if not replied
  resolutionMins: number | null;
  slaTargetMins: number;             // priority SLA target
  messages: number;
  amountInvolvedNgn: number;         // disputed/affected amount, 0 if N/A
  lastMessagePreview: string;
  tags: string[];
};

export type ChatSession = {
  id: string;
  customerName: string;
  customerId: string;
  agentName: string | null;
  startedAt: string;
  lastMessageAt: string;
  status: "waiting" | "active" | "resolved" | "abandoned";
  waitSeconds: number;
  messages: number;
  topic: TicketCategory;
  preview: string;
};

export const ticketStatusTone: Record<TicketStatus, string> = {
  new: "bg-primary/10 text-primary border-primary/30",
  open: "bg-info/10 text-info border-info/30",
  pending: "bg-warning/10 text-warning border-warning/30",
  on_hold: "bg-muted text-muted-foreground border-border",
  resolved: "bg-success/10 text-success border-success/30",
  closed: "bg-muted text-muted-foreground border-border",
};

export const priorityTone: Record<TicketPriority, string> = {
  low: "bg-muted text-muted-foreground border-border",
  normal: "bg-info/10 text-info border-info/30",
  high: "bg-warning/10 text-warning border-warning/30",
  urgent: "bg-destructive/10 text-destructive border-destructive/30",
};

export const channelLabel: Record<TicketChannel, string> = {
  email: "Email",
  chat: "Live chat",
  whatsapp: "WhatsApp",
  twitter: "X / Twitter",
  in_app: "In-app",
  phone: "Phone",
};

export const categoryLabel: Record<TicketCategory, string> = {
  wallet_topup: "Wallet — top-up",
  wallet_payout: "Wallet — payout",
  card_decline: "Card decline",
  card_dispute: "Card dispute",
  kyc: "KYC / verification",
  bill_payment: "Bill payment",
  esim: "eSIM",
  phone_number: "Phone number",
  fraud: "Fraud / safety",
  account_access: "Account access",
  general: "General",
};

const SLA_BY_PRIORITY: Record<TicketPriority, number> = {
  urgent: 30,
  high: 120,
  normal: 480,
  low: 1440,
};

const FIRST_NAMES = ["Ada", "Tunde", "Ngozi", "Bayo", "Aisha", "Emeka", "Ifeoma", "Segun", "Halima", "Yinka", "Obi", "Zainab", "Kunle", "Maryam", "Ibrahim", "Folake", "Chika", "Musa", "Tope", "Amaka"];
const LAST_NAMES = ["Okafor", "Adeyemi", "Bello", "Nwosu", "Mohammed", "Sani", "Hassan", "Ojo", "Onyeka", "Adebayo", "Igwe", "Eze", "Lawal", "Ogbonna", "Balogun", "Akinwale", "Akande", "Okonkwo"];
const AGENTS = ["Chinedu O.", "Sade A.", "Bola I.", "Femi K.", "Ruth M.", "Daniel A.", null, null];

const PREVIEWS: Record<TicketCategory, string[]> = {
  wallet_topup: ["My ₦20,000 top-up has not reflected after 2 hours.", "Bank app shows debited but wallet still empty.", "USSD top-up failed but money was deducted."],
  wallet_payout: ["Payout to GTBank pending since yesterday.", "Withdrawal stuck on processing for 4 hours.", "Wrong account number entered, please reverse."],
  card_decline: ["My card was declined at Shoprite checkout.", "International auth on Netflix keeps failing.", "Card declined despite sufficient balance."],
  card_dispute: ["I did not authorize a ₦15,000 charge from XYZ.", "Duplicate charge appeared twice on Uber.", "Refund from merchant not received after 10 days."],
  kyc: ["BVN verification keeps saying not matched.", "Selfie liveness check failing 3 times.", "NIN upload rejected, please review."],
  bill_payment: ["Paid DStv subscription, not activated.", "MTN airtime not delivered after 1 hour.", "EKEDC token never received."],
  esim: ["My eSIM QR code is not scanning.", "Data plan activated but no internet on roaming.", "Cannot install eSIM on iPhone 13."],
  phone_number: ["Virtual number not receiving SMS OTPs.", "Inbound calls not ringing on my number.", "Lease auto-renewal charged twice."],
  fraud: ["Someone accessed my account from another device.", "I received a suspicious link claiming to be BazePay.", "Unauthorized device added to my account."],
  account_access: ["Cannot log in, OTP never arrives.", "Forgot password reset email not coming.", "App keeps logging me out every 5 minutes."],
  general: ["How do I change my registered phone number?", "Where can I download my account statement?", "Question about transaction limits."],
};

const SUBJECTS: Record<TicketCategory, string[]> = {
  wallet_topup: ["Top-up not reflected", "Bank debited, wallet empty", "USSD top-up failure"],
  wallet_payout: ["Payout pending", "Withdrawal stuck", "Wrong account — reverse"],
  card_decline: ["Card declined at POS", "International auth failing", "Card declined w/ balance"],
  card_dispute: ["Unauthorized charge", "Duplicate charge", "Merchant refund missing"],
  kyc: ["BVN mismatch", "Liveness check failing", "NIN upload rejected"],
  bill_payment: ["DStv not activated", "Airtime not delivered", "EKEDC token missing"],
  esim: ["eSIM QR not scanning", "No data on roaming", "iPhone install failing"],
  phone_number: ["No SMS OTPs", "Calls not ringing", "Double-charged renewal"],
  fraud: ["Unauthorized access", "Phishing link received", "Unknown device added"],
  account_access: ["Login OTP missing", "Password reset stuck", "App logging me out"],
  general: ["Change phone number", "Download statement", "Transaction limits"],
};

function pick<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length];
}

function genTickets(count: number): Ticket[] {
  const now = Date.now();
  const channels: TicketChannel[] = ["email", "chat", "whatsapp", "twitter", "in_app", "phone"];
  const statuses: TicketStatus[] = ["new", "open", "pending", "on_hold", "resolved", "closed"];
  const priorities: TicketPriority[] = ["low", "normal", "high", "urgent"];
  const categories = Object.keys(SUBJECTS) as TicketCategory[];

  return Array.from({ length: count }, (_, i) => {
    const fn = pick(FIRST_NAMES, i * 7 + 3);
    const ln = pick(LAST_NAMES, i * 11 + 5);
    const customerName = `${fn} ${ln}`;
    const cat = pick(categories, i * 3 + 1);
    const channel = pick(channels, i * 2 + 1);
    const status = pick(statuses, i % 11 < 4 ? i : i * 5 + 2);
    const priority = pick(priorities, i % 13 < 3 ? 3 : i % 4);
    const assignee = pick(AGENTS, i * 5 + 2);
    const createdMinsAgo = (i * 47 + 13) % 6000 + 5;
    const createdAt = new Date(now - createdMinsAgo * 60_000).toISOString();
    const updatedAt = new Date(now - (createdMinsAgo - (i % 30)) * 60_000).toISOString();
    const replied = status !== "new" && Math.abs(i * 7) % 10 > 1;
    const firstResponseMins = replied ? ((i * 13) % 90) + 3 : null;
    const resolved = status === "resolved" || status === "closed";
    const resolutionMins = resolved ? ((i * 29) % 1200) + 60 : null;
    const amount = ["wallet_topup", "wallet_payout", "card_dispute", "bill_payment"].includes(cat)
      ? ((i * 1373) % 150) * 100 + 500
      : 0;
    return {
      id: `tkt_${String(940000 + i).padStart(6, "0")}`,
      subject: pick(SUBJECTS[cat], i),
      customerName,
      customerId: `usr_${String(100000 + (i * 37) % 9000)}`,
      customerEmail: `${fn.toLowerCase()}.${ln.toLowerCase()}@example.com`,
      channel,
      status,
      priority,
      category: cat,
      assigneeName: assignee,
      assigneeId: assignee ? `agt_${String(200 + (i * 3) % 12)}` : null,
      createdAt,
      updatedAt,
      firstResponseMins,
      resolutionMins,
      slaTargetMins: SLA_BY_PRIORITY[priority],
      messages: ((i * 3) % 8) + 1,
      amountInvolvedNgn: amount,
      lastMessagePreview: pick(PREVIEWS[cat], i),
      tags: [cat.replace(/_/g, "-"), channel].slice(0, (i % 2) + 1),
    };
  });
}

export const tickets: Ticket[] = genTickets(120);

function genChatSessions(count: number): ChatSession[] {
  const now = Date.now();
  const statuses: ChatSession["status"][] = ["waiting", "waiting", "active", "active", "active", "resolved", "abandoned"];
  const categories = Object.keys(SUBJECTS) as TicketCategory[];
  return Array.from({ length: count }, (_, i) => {
    const fn = pick(FIRST_NAMES, i * 11 + 4);
    const ln = pick(LAST_NAMES, i * 7 + 9);
    const status = pick(statuses, i);
    const startMinsAgo = (i * 9 + 2) % 240 + 1;
    const lastMsgMinsAgo = Math.max(0, startMinsAgo - (i % 12));
    const waitSeconds = status === "waiting" ? (i * 17) % 600 + 5 : (i * 5) % 60;
    const cat = pick(categories, i * 2);
    const agent = status === "waiting" ? null : pick(AGENTS.filter((a): a is string => !!a), i);
    return {
      id: `chat_${String(50000 + i).padStart(5, "0")}`,
      customerName: `${fn} ${ln}`,
      customerId: `usr_${String(100000 + (i * 41) % 9000)}`,
      agentName: agent,
      startedAt: new Date(now - startMinsAgo * 60_000).toISOString(),
      lastMessageAt: new Date(now - lastMsgMinsAgo * 60_000).toISOString(),
      status,
      waitSeconds,
      messages: (i % 9) + 1,
      topic: cat,
      preview: pick(PREVIEWS[cat], i),
    };
  });
}

export const chatSessions: ChatSession[] = genChatSessions(28);

export const fmtMins = (m: number | null): string => {
  if (m == null) return "—";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  if (h < 24) return rem ? `${h}h ${rem}m` : `${h}h`;
  return `${Math.floor(h / 24)}d ${h % 24}h`;
};

export const fmtRelative = (iso: string): string => {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};
