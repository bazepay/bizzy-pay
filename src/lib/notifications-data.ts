// Mock notifications data. Deterministic for stable SSR. NGN-only context.

export type Channel = "push" | "email" | "sms" | "in_app";

export type EventKey =
  | "signup_welcome"
  | "kyc_pending"
  | "kyc_approved"
  | "kyc_rejected"
  | "pin_created"
  | "low_balance"
  | "txn_success"
  | "txn_failure"
  | "card_frozen"
  | "card_limit_reached"
  | "esim_activated"
  | "referral_reward"
  | "security_alert";

export type Locale = "en-NG" | "yo-NG" | "ig-NG" | "ha-NG";

export type Template = {
  id: string;
  event: EventKey;
  name: string;
  channels: Channel[];
  locales: Locale[];
  subject: string | null; // email only
  pushTitle: string | null;
  body: string;
  variables: string[];
  status: "active" | "draft" | "paused";
  abVariant: "A" | "B" | null;
  updatedAt: string;
  sent30d: number;
  openRate: number; // 0..1
  clickRate: number; // 0..1
};

export type Broadcast = {
  id: string;
  name: string;
  templateId: string;
  channel: Channel;
  audience: "all" | "tier1" | "tier2_plus" | "card_holders" | "dormant_30d" | "lagos";
  audienceSize: number;
  status: "draft" | "scheduled" | "sending" | "sent" | "failed";
  scheduledAt: string | null;
  sentAt: string | null;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  failed: number;
  createdBy: string;
};

export type DeliveryStatus = "queued" | "sent" | "delivered" | "opened" | "clicked" | "bounced" | "failed";

export type DeliveryRow = {
  id: string;
  ts: string;
  userId: string;
  userName: string;
  channel: Channel;
  event: EventKey;
  status: DeliveryStatus;
  provider: string;
  latencyMs: number;
  error: string | null;
};

export type ProviderConfig = {
  id: string;
  channel: Channel;
  name: string;
  status: "live" | "sandbox" | "disabled";
  primary: boolean;
  successRate: number; // 0..1
  sent30d: number;
  costNgn30d: number;
  region: string;
  apiKeyMasked: string;
  updatedAt: string;
};

const pad = (n: number, w = 6) => String(n).padStart(w, "0");

export const eventLabel: Record<EventKey, string> = {
  signup_welcome: "Sign-up welcome",
  kyc_pending: "KYC pending",
  kyc_approved: "KYC approved",
  kyc_rejected: "KYC rejected",
  pin_created: "PIN created",
  low_balance: "Low balance",
  txn_success: "Transaction success",
  txn_failure: "Transaction failed",
  card_frozen: "Card frozen",
  card_limit_reached: "Card limit reached",
  esim_activated: "eSIM activated",
  referral_reward: "Referral reward",
  security_alert: "Security alert",
};

export const channelLabel: Record<Channel, string> = {
  push: "Push",
  email: "Email",
  sms: "SMS",
  in_app: "In-app",
};

export const channelTone: Record<Channel, string> = {
  push: "border-primary/40 text-primary",
  email: "border-success/40 text-success",
  sms: "border-warning/40 text-warning",
  in_app: "border-muted-foreground/40 text-muted-foreground",
};

export const templateStatusTone: Record<Template["status"], string> = {
  active: "border-success/40 text-success",
  draft: "border-muted-foreground/30 text-muted-foreground",
  paused: "border-warning/40 text-warning",
};

export const broadcastStatusTone: Record<Broadcast["status"], string> = {
  draft: "border-muted-foreground/30 text-muted-foreground",
  scheduled: "border-warning/40 text-warning",
  sending: "border-primary/40 text-primary",
  sent: "border-success/40 text-success",
  failed: "border-destructive/40 text-destructive",
};

export const deliveryStatusTone: Record<DeliveryStatus, string> = {
  queued: "border-muted-foreground/30 text-muted-foreground",
  sent: "border-primary/40 text-primary",
  delivered: "border-success/40 text-success",
  opened: "border-success/40 text-success",
  clicked: "border-success/40 text-success",
  bounced: "border-warning/40 text-warning",
  failed: "border-destructive/40 text-destructive",
};

const TEMPLATE_SEEDS: Array<{
  event: EventKey;
  name: string;
  channels: Channel[];
  subject: string | null;
  pushTitle: string | null;
  body: string;
  vars: string[];
  status: Template["status"];
  ab?: "A" | "B" | null;
}> = [
  { event: "signup_welcome", name: "Welcome to BazePay", channels: ["push", "email", "in_app"], subject: "Welcome to BazePay, {{first_name}} 🎉", pushTitle: "Welcome to BazePay", body: "Hi {{first_name}}, your wallet is ready. Verify your identity to unlock ₦5M daily limits and order your Naira card.", vars: ["first_name"], status: "active" },
  { event: "kyc_pending", name: "KYC under review", channels: ["push", "email"], subject: "We're reviewing your verification", pushTitle: "KYC under review", body: "Hi {{first_name}}, we received your documents. Most reviews complete within 5 minutes.", vars: ["first_name"], status: "active" },
  { event: "kyc_approved", name: "KYC approved", channels: ["push", "email", "in_app"], subject: "You're verified ✓", pushTitle: "You're Tier-{{tier}} verified", body: "Welcome to Tier-{{tier}}, {{first_name}}. Your daily limit is now {{daily_limit}}.", vars: ["first_name", "tier", "daily_limit"], status: "active", ab: "A" },
  { event: "kyc_rejected", name: "KYC needs attention", channels: ["push", "email"], subject: "Action required on your verification", pushTitle: "Verification needs attention", body: "Hi {{first_name}}, we couldn't verify {{reason}}. Tap to retake your selfie or upload a clearer ID.", vars: ["first_name", "reason"], status: "active" },
  { event: "pin_created", name: "PIN created", channels: ["push", "email", "in_app"], subject: "Your transaction PIN is set", pushTitle: "PIN set successfully", body: "You created your transaction PIN at {{time}}. If this wasn't you, freeze your account immediately.", vars: ["time"], status: "active" },
  { event: "low_balance", name: "Low wallet balance", channels: ["push", "in_app"], subject: null, pushTitle: "Wallet running low", body: "Your wallet balance is {{balance}}. Top up to keep your scheduled bills running.", vars: ["balance"], status: "active" },
  { event: "txn_success", name: "Transaction success", channels: ["push", "in_app"], subject: null, pushTitle: "{{amount}} sent", body: "{{amount}} to {{recipient}} • Ref {{ref}}", vars: ["amount", "recipient", "ref"], status: "active" },
  { event: "txn_failure", name: "Transaction failed", channels: ["push", "email", "in_app"], subject: "Transaction reversed", pushTitle: "Transfer failed", body: "Your {{amount}} transfer to {{recipient}} failed: {{reason}}. Funds are back in your wallet.", vars: ["amount", "recipient", "reason"], status: "active" },
  { event: "card_frozen", name: "Card frozen", channels: ["push", "email", "sms"], subject: "Your BazePay card is frozen", pushTitle: "Card frozen", body: "Card •• {{last4}} was frozen at {{time}}. Tap to unfreeze.", vars: ["last4", "time"], status: "active" },
  { event: "card_limit_reached", name: "Card limit reached", channels: ["push", "in_app"], subject: null, pushTitle: "Daily card limit reached", body: "You've spent ₦{{spent}} today on card •• {{last4}}. Limits reset at midnight WAT.", vars: ["spent", "last4"], status: "active" },
  { event: "esim_activated", name: "eSIM activated", channels: ["push", "email"], subject: "Your eSIM is live", pushTitle: "eSIM active", body: "Your {{plan}} eSIM is active. Data: {{data_gb}}GB · Valid until {{expiry}}.", vars: ["plan", "data_gb", "expiry"], status: "draft" },
  { event: "referral_reward", name: "Referral reward earned", channels: ["push", "email", "in_app"], subject: "₦{{amount}} referral bonus 🎁", pushTitle: "₦{{amount}} reward earned", body: "Your friend {{friend_name}} just funded their wallet. ₦{{amount}} is on its way.", vars: ["amount", "friend_name"], status: "active", ab: "B" },
  { event: "security_alert", name: "Security alert · new device", channels: ["push", "email", "sms"], subject: "New sign-in detected", pushTitle: "New device sign-in", body: "Sign-in from {{device}} in {{city}} at {{time}}. If this wasn't you, lock your account now.", vars: ["device", "city", "time"], status: "active" },
];

export const templates: Template[] = TEMPLATE_SEEDS.map((s, i) => ({
  id: `tpl_${pad(710000 + i)}`,
  event: s.event,
  name: s.name,
  channels: s.channels,
  locales: ["en-NG", "yo-NG", "ig-NG", "ha-NG"].slice(0, (i % 3) + 1) as Locale[],
  subject: s.subject,
  pushTitle: s.pushTitle,
  body: s.body,
  variables: s.vars,
  status: s.status,
  abVariant: s.ab ?? null,
  updatedAt: new Date(Date.now() - (i + 1) * 18 * 3600_000).toISOString(),
  sent30d: s.status === "active" ? 8000 + ((i * 1733) % 92000) : 0,
  openRate: 0.42 + ((i * 7) % 35) / 100,
  clickRate: 0.08 + ((i * 3) % 22) / 100,
}));

const ADMINS = ["Aisha O.", "Tunde A.", "Kemi B.", "David L."];

export const broadcasts: Broadcast[] = [
  { id: "bc_810001", name: "Free FX weekend (cardholders)", templateId: templates[2].id, channel: "push", audience: "card_holders", audienceSize: 18204, status: "sent", scheduledAt: new Date(Date.now() - 2 * 86400_000).toISOString(), sentAt: new Date(Date.now() - 2 * 86400_000 + 600_000).toISOString(), sent: 18204, delivered: 17891, opened: 9612, clicked: 1843, failed: 313, createdBy: ADMINS[0] },
  { id: "bc_810002", name: "Tier-1 nudge to verify", templateId: templates[1].id, channel: "email", audience: "tier1", audienceSize: 42118, status: "sending", scheduledAt: new Date(Date.now() - 30 * 60_000).toISOString(), sentAt: null, sent: 12044, delivered: 11588, opened: 3221, clicked: 612, failed: 456, createdBy: ADMINS[1] },
  { id: "bc_810003", name: "Reactivate dormant 30d", templateId: templates[5].id, channel: "push", audience: "dormant_30d", audienceSize: 8902, status: "scheduled", scheduledAt: new Date(Date.now() + 18 * 3600_000).toISOString(), sentAt: null, sent: 0, delivered: 0, opened: 0, clicked: 0, failed: 0, createdBy: ADMINS[2] },
  { id: "bc_810004", name: "Lagos data bundle promo", templateId: templates[10].id, channel: "sms", audience: "lagos", audienceSize: 24411, status: "draft", scheduledAt: null, sentAt: null, sent: 0, delivered: 0, opened: 0, clicked: 0, failed: 0, createdBy: ADMINS[3] },
  { id: "bc_810005", name: "Maintenance heads-up", templateId: templates[7].id, channel: "in_app", audience: "all", audienceSize: 312044, status: "sent", scheduledAt: new Date(Date.now() - 7 * 86400_000).toISOString(), sentAt: new Date(Date.now() - 7 * 86400_000 + 300_000).toISOString(), sent: 312044, delivered: 308912, opened: 188233, clicked: 12044, failed: 3132, createdBy: ADMINS[0] },
  { id: "bc_810006", name: "Referral bonus relaunch", templateId: templates[11].id, channel: "email", audience: "tier2_plus", audienceSize: 96221, status: "failed", scheduledAt: new Date(Date.now() - 26 * 3600_000).toISOString(), sentAt: new Date(Date.now() - 26 * 3600_000).toISOString(), sent: 4112, delivered: 0, opened: 0, clicked: 0, failed: 4112, createdBy: ADMINS[1] },
];

const USERS = [
  { id: "usr_220011", name: "Funke Adebayo" },
  { id: "usr_220045", name: "Emeka Okafor" },
  { id: "usr_220088", name: "Aisha Bello" },
  { id: "usr_220112", name: "Tunde Adesina" },
  { id: "usr_220150", name: "Chiamaka N." },
  { id: "usr_220171", name: "Bola Akin" },
  { id: "usr_220199", name: "Ibrahim Musa" },
  { id: "usr_220222", name: "Joy Eze" },
];

const PROVIDERS_BY_CHANNEL: Record<Channel, string[]> = {
  push: ["FCM", "APNs"],
  email: ["Postmark", "AWS SES"],
  sms: ["Termii", "Twilio"],
  in_app: ["Internal"],
};

const STATUS_POOL: DeliveryStatus[] = ["delivered", "opened", "clicked", "delivered", "delivered", "sent", "bounced", "failed", "queued"];

export const deliveries: DeliveryRow[] = Array.from({ length: 60 }, (_, i) => {
  const event = TEMPLATE_SEEDS[i % TEMPLATE_SEEDS.length].event;
  const channelOptions = TEMPLATE_SEEDS[i % TEMPLATE_SEEDS.length].channels;
  const channel = channelOptions[i % channelOptions.length];
  const provider = PROVIDERS_BY_CHANNEL[channel][i % PROVIDERS_BY_CHANNEL[channel].length];
  const status = STATUS_POOL[i % STATUS_POOL.length];
  const user = USERS[i % USERS.length];
  return {
    id: `dlv_${pad(910000 + i)}`,
    ts: new Date(Date.now() - i * 7 * 60_000).toISOString(),
    userId: user.id,
    userName: user.name,
    channel,
    event,
    status,
    provider,
    latencyMs: 80 + ((i * 41) % 1800),
    error: status === "failed" ? "Provider 502 Bad Gateway" : status === "bounced" ? "Mailbox full" : null,
  };
});

export const providers: ProviderConfig[] = [
  { id: "prv_001", channel: "push", name: "Firebase Cloud Messaging", status: "live", primary: true, successRate: 0.987, sent30d: 1820411, costNgn30d: 0, region: "Global", apiKeyMasked: "AAAA••••••E91k", updatedAt: new Date(Date.now() - 8 * 86400_000).toISOString() },
  { id: "prv_002", channel: "push", name: "Apple Push (APNs)", status: "live", primary: false, successRate: 0.992, sent30d: 612044, costNgn30d: 0, region: "Global", apiKeyMasked: "p8••••••9F2A", updatedAt: new Date(Date.now() - 12 * 86400_000).toISOString() },
  { id: "prv_003", channel: "email", name: "Postmark", status: "live", primary: true, successRate: 0.971, sent30d: 244112, costNgn30d: 1_180_000, region: "EU", apiKeyMasked: "pm-••••-8821", updatedAt: new Date(Date.now() - 4 * 86400_000).toISOString() },
  { id: "prv_004", channel: "email", name: "AWS SES", status: "sandbox", primary: false, successRate: 0.965, sent30d: 0, costNgn30d: 0, region: "eu-west-1", apiKeyMasked: "AKIA••••••QXZP", updatedAt: new Date(Date.now() - 21 * 86400_000).toISOString() },
  { id: "prv_005", channel: "sms", name: "Termii", status: "live", primary: true, successRate: 0.943, sent30d: 88412, costNgn30d: 4_240_000, region: "Nigeria", apiKeyMasked: "tm-••••-1102", updatedAt: new Date(Date.now() - 2 * 86400_000).toISOString() },
  { id: "prv_006", channel: "sms", name: "Twilio", status: "disabled", primary: false, successRate: 0.951, sent30d: 0, costNgn30d: 0, region: "US", apiKeyMasked: "AC••••••a91c", updatedAt: new Date(Date.now() - 90 * 86400_000).toISOString() },
];

// Formatters
export const fmtRelative = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const future = diff < 0;
  const a = Math.abs(diff);
  const m = Math.round(a / 60_000);
  const fmt = (s: string) => (future ? `in ${s}` : `${s} ago`);
  if (m < 1) return "just now";
  if (m < 60) return fmt(`${m}m`);
  const h = Math.round(m / 60);
  if (h < 24) return fmt(`${h}h`);
  const d = Math.round(h / 24);
  return fmt(`${d}d`);
};

export const fmtNum = (n: number) => n.toLocaleString();
export const fmtNgn = (n: number) => `₦${n.toLocaleString()}`;
export const fmtPct = (n: number) => `${(n * 100).toFixed(1)}%`;
