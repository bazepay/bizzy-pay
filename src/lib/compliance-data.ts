// Mock compliance data for the admin Compliance module.
// All amounts are NGN. Lists are deterministic for stable SSR.

export type AlertType =
  | "structuring"
  | "velocity"
  | "high_risk_country"
  | "sanctions_hit"
  | "pep_match"
  | "unusual_pattern"
  | "rapid_movement"
  | "device_anomaly";

export type AlertStatus = "open" | "investigating" | "escalated" | "cleared" | "sar_filed";
export type AlertSeverity = "low" | "medium" | "high" | "critical";

export type AmlAlert = {
  id: string;
  ruleId: string;
  ruleName: string;
  type: AlertType;
  severity: AlertSeverity;
  status: AlertStatus;
  userId: string;
  userName: string;
  amountNgn: number;
  txnCount: number;
  windowHours: number;
  description: string;
  assignee: string | null;
  createdAt: string;
  updatedAt: string;
  notes: { author: string; at: string; text: string }[];
};

export type SanctionList = "OFAC SDN" | "UN Consolidated" | "EU Consolidated" | "UK HMT" | "Internal PEP";
export type ScreeningStatus = "match" | "possible" | "false_positive" | "cleared";

export type SanctionsHit = {
  id: string;
  userId: string;
  userName: string;
  matchedName: string;
  list: SanctionList;
  score: number; // 0-100
  status: ScreeningStatus;
  reviewer: string | null;
  screenedAt: string;
};

export type AuditAction =
  | "user.kyc_approved"
  | "user.kyc_rejected"
  | "user.frozen"
  | "user.unfrozen"
  | "wallet.adjustment"
  | "card.issued"
  | "card.frozen"
  | "alert.cleared"
  | "alert.escalated"
  | "policy.updated"
  | "auth.login"
  | "auth.role_changed";

export type AuditEntry = {
  id: string;
  actor: string;
  actorEmail: string;
  action: AuditAction;
  target: string;
  ip: string;
  at: string;
  meta?: string;
};

export type Policy = {
  id: string;
  name: string;
  category: "KYC" | "AML" | "Card" | "Wallet" | "Risk";
  version: string;
  status: "active" | "draft" | "archived";
  owner: string;
  updatedAt: string;
  description: string;
};

const NAMES = [
  "Adaeze Okafor","Tunde Bakare","Chiamaka Eze","Ibrahim Musa","Ngozi Obi","Femi Adeyemi",
  "Halima Sani","Kelechi Nwosu","Oluwaseun Ade","Yusuf Bello","Funmi Ogunleye","Chinedu Umeh",
  "Aisha Garba","Emeka Iwu","Bisi Lawal","Uche Anya","Sade Balogun","Hassan Tijani",
];
const STAFF = ["Aisha O.", "Tunde A.", "Priya M.", "Kemi B.", "David L.", "Joy E."];

const TYPES: { type: AlertType; rule: string; sev: AlertSeverity; desc: string }[] = [
  { type: "structuring", rule: "Structuring < ₦5M threshold", sev: "high", desc: "Multiple deposits just under reporting threshold within 24h" },
  { type: "velocity", rule: "High velocity outbound", sev: "medium", desc: "Outbound transfer count exceeded 3× user baseline" },
  { type: "high_risk_country", rule: "High-risk corridor", sev: "high", desc: "Inbound from FATF grey-listed jurisdiction" },
  { type: "sanctions_hit", rule: "OFAC name match", sev: "critical", desc: "Beneficiary name fuzzy-matched OFAC SDN list" },
  { type: "pep_match", rule: "PEP match — domestic", sev: "high", desc: "Customer screened against domestic PEP register" },
  { type: "unusual_pattern", rule: "Round-tripping detected", sev: "medium", desc: "Funds returned to origin within 30 minutes" },
  { type: "rapid_movement", rule: "Rapid cash-out", sev: "high", desc: "98% of inbound moved out within 1 hour" },
  { type: "device_anomaly", rule: "Device + geo anomaly", sev: "low", desc: "Login from new device in unusual geography" },
];

const STATUSES: AlertStatus[] = ["open", "open", "investigating", "investigating", "escalated", "cleared", "sar_filed"];

function pad(n: number, w = 6) { return String(n).padStart(w, "0"); }
function pick<T>(arr: T[], i: number) { return arr[i % arr.length]; }

export const amlAlerts: AmlAlert[] = Array.from({ length: 28 }, (_, i) => {
  const t = TYPES[i % TYPES.length];
  const status = STATUSES[i % STATUSES.length];
  const created = new Date(Date.now() - (i * 3.7 + 1) * 3600_000).toISOString();
  const updated = new Date(Date.now() - (i * 1.2 + 0.3) * 3600_000).toISOString();
  const userIdx = (i * 3 + 5) % NAMES.length;
  return {
    id: `alt_${pad(910000 + i)}`,
    ruleId: `R-${100 + (i % TYPES.length)}`,
    ruleName: t.rule,
    type: t.type,
    severity: t.sev,
    status,
    userId: `usr_${pad(720000 + userIdx)}`,
    userName: NAMES[userIdx],
    amountNgn: Math.round(50_000 + (i * 173_000 + 250_000) % 9_500_000),
    txnCount: 1 + ((i * 7) % 18),
    windowHours: [1, 6, 12, 24, 48][i % 5],
    description: t.desc,
    assignee: status === "open" ? null : pick(STAFF, i + 2),
    createdAt: created,
    updatedAt: updated,
    notes:
      status === "open"
        ? []
        : [
            { author: pick(STAFF, i), at: updated, text: status === "cleared" ? "Reviewed transaction history; consistent with declared business activity." : "Initial review complete. Awaiting customer documentation." },
          ],
  };
});

export const sanctionsHits: SanctionsHit[] = Array.from({ length: 22 }, (_, i) => {
  const lists: SanctionList[] = ["OFAC SDN", "UN Consolidated", "EU Consolidated", "UK HMT", "Internal PEP"];
  const statuses: ScreeningStatus[] = ["match", "possible", "possible", "false_positive", "cleared", "cleared"];
  const score = [62, 71, 78, 84, 88, 91, 96][i % 7];
  const userIdx = (i * 2 + 3) % NAMES.length;
  const status = statuses[i % statuses.length];
  return {
    id: `scr_${pad(640000 + i)}`,
    userId: `usr_${pad(720000 + userIdx)}`,
    userName: NAMES[userIdx],
    matchedName: NAMES[(userIdx + 4) % NAMES.length],
    list: lists[i % lists.length],
    score,
    status,
    reviewer: status === "match" || status === "possible" ? null : pick(STAFF, i),
    screenedAt: new Date(Date.now() - (i * 5 + 2) * 3600_000).toISOString(),
  };
});

const ACTIONS: AuditAction[] = [
  "user.kyc_approved","user.kyc_rejected","user.frozen","user.unfrozen",
  "wallet.adjustment","card.issued","card.frozen",
  "alert.cleared","alert.escalated","policy.updated","auth.login","auth.role_changed",
];

export const auditLog: AuditEntry[] = Array.from({ length: 60 }, (_, i) => {
  const actor = pick(STAFF, i);
  const action = ACTIONS[i % ACTIONS.length];
  const target = action.startsWith("user.")
    ? `usr_${pad(720000 + (i * 3) % 60)}`
    : action.startsWith("wallet")
    ? `wal_${pad(530000 + i)}`
    : action.startsWith("card")
    ? `crd_${pad(810000 + i)}`
    : action.startsWith("alert")
    ? `alt_${pad(910000 + (i % 28))}`
    : action.startsWith("policy")
    ? `pol_${pad(100 + (i % 8), 4)}`
    : "—";
  return {
    id: `aud_${pad(1_200_000 + i, 7)}`,
    actor,
    actorEmail: `${actor.toLowerCase().replace(/[^a-z]/g, "")}@bazepay.ng`,
    action,
    target,
    ip: `10.${(i * 7) % 250}.${(i * 11) % 250}.${(i * 13) % 250}`,
    at: new Date(Date.now() - i * 27 * 60_000).toISOString(),
    meta:
      action === "wallet.adjustment"
        ? `+₦${(50_000 + (i * 1700) % 900_000).toLocaleString()} credit`
        : action === "auth.role_changed"
        ? "agent → senior_agent"
        : undefined,
  };
});

export const policies: Policy[] = [
  { id: "pol_0101", name: "Tier 1 KYC Requirements", category: "KYC", version: "v3.2", status: "active", owner: "Aisha O.", updatedAt: new Date(Date.now() - 6 * 86400_000).toISOString(), description: "BVN + phone verification. ₦300,000 daily limit, ₦2,000,000 cumulative." },
  { id: "pol_0102", name: "Tier 2 KYC Requirements", category: "KYC", version: "v2.8", status: "active", owner: "Aisha O.", updatedAt: new Date(Date.now() - 14 * 86400_000).toISOString(), description: "Government ID + utility bill + selfie liveness. ₦5M daily / ₦25M monthly." },
  { id: "pol_0103", name: "Enhanced Due Diligence", category: "KYC", version: "v1.4", status: "active", owner: "Tunde A.", updatedAt: new Date(Date.now() - 22 * 86400_000).toISOString(), description: "Source of funds, PEP screening, beneficial ownership for accounts >₦25M throughput." },
  { id: "pol_0201", name: "Structuring Detection", category: "AML", version: "v4.1", status: "active", owner: "Priya M.", updatedAt: new Date(Date.now() - 3 * 86400_000).toISOString(), description: "Detects splitting of deposits below ₦5M reporting threshold within rolling 24h window." },
  { id: "pol_0202", name: "Velocity Monitoring", category: "AML", version: "v2.0", status: "active", owner: "Priya M.", updatedAt: new Date(Date.now() - 11 * 86400_000).toISOString(), description: "Flags accounts exceeding 3× rolling 30-day baseline on outbound transactions." },
  { id: "pol_0203", name: "Sanctions Screening", category: "AML", version: "v5.0", status: "active", owner: "Tunde A.", updatedAt: new Date(Date.now() - 1 * 86400_000).toISOString(), description: "Real-time screening against OFAC, UN, EU, UK HMT and internal PEP lists." },
  { id: "pol_0301", name: "Card Issuance Eligibility", category: "Card", version: "v1.2", status: "active", owner: "Kemi B.", updatedAt: new Date(Date.now() - 30 * 86400_000).toISOString(), description: "Tier 2+ KYC, no open AML alerts, no chargeback history within 90 days." },
  { id: "pol_0401", name: "Wallet Freeze Authorization", category: "Wallet", version: "v2.3", status: "active", owner: "David L.", updatedAt: new Date(Date.now() - 9 * 86400_000).toISOString(), description: "Requires senior_agent or above. Auto-freeze on critical AML alerts pending review." },
  { id: "pol_0501", name: "Transaction Risk Scoring", category: "Risk", version: "v3.0", status: "draft", owner: "Joy E.", updatedAt: new Date(Date.now() - 2 * 86400_000).toISOString(), description: "ML-based real-time risk score blending device, geo, behaviour and counterparty signals." },
];

// ---- formatters / labels ----

export const fmtNgn = (n: number) => `₦${n.toLocaleString()}`;
export const fmtRelative = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.round(diff / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  return `${d}d ago`;
};

export const severityTone: Record<AlertSeverity, string> = {
  low: "border-muted-foreground/30 text-muted-foreground",
  medium: "border-warning/40 text-warning",
  high: "border-orange-500/40 text-orange-500",
  critical: "border-destructive/50 text-destructive bg-destructive/10",
};

export const alertStatusTone: Record<AlertStatus, string> = {
  open: "border-primary/40 text-primary",
  investigating: "border-warning/40 text-warning",
  escalated: "border-orange-500/40 text-orange-500",
  cleared: "border-success/40 text-success",
  sar_filed: "border-destructive/50 text-destructive",
};

export const alertStatusLabel: Record<AlertStatus, string> = {
  open: "Open",
  investigating: "Investigating",
  escalated: "Escalated",
  cleared: "Cleared",
  sar_filed: "SAR filed",
};

export const alertTypeLabel: Record<AlertType, string> = {
  structuring: "Structuring",
  velocity: "Velocity",
  high_risk_country: "High-risk country",
  sanctions_hit: "Sanctions hit",
  pep_match: "PEP match",
  unusual_pattern: "Unusual pattern",
  rapid_movement: "Rapid movement",
  device_anomaly: "Device anomaly",
};

export const screeningTone: Record<ScreeningStatus, string> = {
  match: "border-destructive/50 text-destructive bg-destructive/10",
  possible: "border-warning/40 text-warning",
  false_positive: "border-muted-foreground/30 text-muted-foreground",
  cleared: "border-success/40 text-success",
};

export const screeningLabel: Record<ScreeningStatus, string> = {
  match: "Confirmed match",
  possible: "Possible match",
  false_positive: "False positive",
  cleared: "Cleared",
};

export const auditActionLabel: Record<AuditAction, string> = {
  "user.kyc_approved": "KYC approved",
  "user.kyc_rejected": "KYC rejected",
  "user.frozen": "User frozen",
  "user.unfrozen": "User unfrozen",
  "wallet.adjustment": "Wallet adjustment",
  "card.issued": "Card issued",
  "card.frozen": "Card frozen",
  "alert.cleared": "Alert cleared",
  "alert.escalated": "Alert escalated",
  "policy.updated": "Policy updated",
  "auth.login": "Admin login",
  "auth.role_changed": "Role changed",
};

export const auditActionTone: Record<AuditAction, string> = {
  "user.kyc_approved": "text-success",
  "user.kyc_rejected": "text-destructive",
  "user.frozen": "text-destructive",
  "user.unfrozen": "text-success",
  "wallet.adjustment": "text-warning",
  "card.issued": "text-primary",
  "card.frozen": "text-destructive",
  "alert.cleared": "text-success",
  "alert.escalated": "text-orange-500",
  "policy.updated": "text-primary",
  "auth.login": "text-muted-foreground",
  "auth.role_changed": "text-warning",
};
