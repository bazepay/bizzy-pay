// Mock settings data. Deterministic for stable SSR.

export type AdminRole = "owner" | "admin" | "ops" | "compliance" | "support" | "finance" | "read_only";

export type Admin = {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  status: "active" | "invited" | "suspended";
  twoFA: boolean;
  lastLoginAt: string | null;
  createdAt: string;
};

export type AuditEntry = {
  id: string;
  ts: string;
  actorId: string;
  actorName: string;
  action: string;
  entity: string;
  entityId: string;
  ip: string;
  ua: string;
  result: "success" | "denied" | "error";
};

export type FlagEnv = "sandbox" | "staging" | "prod";

export type FeatureFlag = {
  key: string;
  name: string;
  description: string;
  values: Record<FlagEnv, boolean>;
  rolloutPct: Record<FlagEnv, number>;
  owner: string;
  updatedAt: string;
};

export type ApiKey = {
  id: string;
  name: string;
  service: string;
  scope: "read" | "write" | "admin";
  env: FlagEnv;
  masked: string;
  lastUsedAt: string | null;
  rotatedAt: string;
  createdBy: string;
};

export type BrandTokens = {
  primary: string;
  primaryGlow: string;
  background: string;
  foreground: string;
  accent: string;
  radius: number; // px
  logoUrl: string;
  appName: string;
};

const pad = (n: number, w = 6) => String(n).padStart(w, "0");

export const roleLabel: Record<AdminRole, string> = {
  owner: "Owner",
  admin: "Admin",
  ops: "Operations",
  compliance: "Compliance",
  support: "Support",
  finance: "Finance",
  read_only: "Read-only",
};

export const roleTone: Record<AdminRole, string> = {
  owner: "border-warning/40 text-warning",
  admin: "border-primary/40 text-primary",
  ops: "border-primary/40 text-primary",
  compliance: "border-destructive/40 text-destructive",
  support: "border-success/40 text-success",
  finance: "border-warning/40 text-warning",
  read_only: "border-muted-foreground/30 text-muted-foreground",
};

export const adminStatusTone: Record<Admin["status"], string> = {
  active: "border-success/40 text-success",
  invited: "border-warning/40 text-warning",
  suspended: "border-destructive/40 text-destructive",
};

export const admins: Admin[] = [
  { id: "adm_001", name: "Aisha Okeke", email: "aisha@bazepay.ng", role: "owner", status: "active", twoFA: true, lastLoginAt: new Date(Date.now() - 30 * 60_000).toISOString(), createdAt: new Date(Date.now() - 480 * 86400_000).toISOString() },
  { id: "adm_002", name: "Tunde Adeyemi", email: "tunde@bazepay.ng", role: "admin", status: "active", twoFA: true, lastLoginAt: new Date(Date.now() - 4 * 3600_000).toISOString(), createdAt: new Date(Date.now() - 380 * 86400_000).toISOString() },
  { id: "adm_003", name: "Kemi Balogun", email: "kemi@bazepay.ng", role: "compliance", status: "active", twoFA: true, lastLoginAt: new Date(Date.now() - 6 * 3600_000).toISOString(), createdAt: new Date(Date.now() - 220 * 86400_000).toISOString() },
  { id: "adm_004", name: "David Lawal", email: "david@bazepay.ng", role: "ops", status: "active", twoFA: true, lastLoginAt: new Date(Date.now() - 18 * 3600_000).toISOString(), createdAt: new Date(Date.now() - 200 * 86400_000).toISOString() },
  { id: "adm_005", name: "Joy Eze", email: "joy@bazepay.ng", role: "support", status: "active", twoFA: false, lastLoginAt: new Date(Date.now() - 1 * 3600_000).toISOString(), createdAt: new Date(Date.now() - 150 * 86400_000).toISOString() },
  { id: "adm_006", name: "Priya Mehta", email: "priya@bazepay.ng", role: "finance", status: "active", twoFA: true, lastLoginAt: new Date(Date.now() - 9 * 3600_000).toISOString(), createdAt: new Date(Date.now() - 110 * 86400_000).toISOString() },
  { id: "adm_007", name: "Chiamaka Nwosu", email: "chiamaka@bazepay.ng", role: "support", status: "invited", twoFA: false, lastLoginAt: null, createdAt: new Date(Date.now() - 2 * 86400_000).toISOString() },
  { id: "adm_008", name: "Ibrahim Musa", email: "ibrahim@bazepay.ng", role: "read_only", status: "suspended", twoFA: true, lastLoginAt: new Date(Date.now() - 30 * 86400_000).toISOString(), createdAt: new Date(Date.now() - 60 * 86400_000).toISOString() },
];

const ACTIONS = [
  { action: "login.success", entity: "session", result: "success" as const },
  { action: "user.kyc.approve", entity: "user", result: "success" as const },
  { action: "user.kyc.reject", entity: "user", result: "success" as const },
  { action: "wallet.payout.manual", entity: "wallet", result: "success" as const },
  { action: "card.reveal_pan", entity: "card", result: "success" as const },
  { action: "card.freeze", entity: "card", result: "success" as const },
  { action: "policy.update", entity: "policy", result: "success" as const },
  { action: "broadcast.send", entity: "broadcast", result: "success" as const },
  { action: "secret.rotate", entity: "api_key", result: "success" as const },
  { action: "admin.role.change", entity: "admin", result: "success" as const },
  { action: "settlement.export", entity: "settlement", result: "success" as const },
  { action: "card.reveal_pan", entity: "card", result: "denied" as const },
  { action: "wallet.payout.manual", entity: "wallet", result: "denied" as const },
  { action: "ledger.adjust", entity: "ledger", result: "error" as const },
];

export const auditLog: AuditEntry[] = Array.from({ length: 80 }, (_, i) => {
  const a = ACTIONS[i % ACTIONS.length];
  const actor = admins[i % admins.length];
  return {
    id: `aud_${pad(990000 + i)}`,
    ts: new Date(Date.now() - i * 19 * 60_000).toISOString(),
    actorId: actor.id,
    actorName: actor.name,
    action: a.action,
    entity: a.entity,
    entityId: `${a.entity.slice(0, 3)}_${pad(220000 + (i * 13) % 4000, 6)}`,
    ip: `102.89.${(i * 7) % 250}.${(i * 31) % 250}`,
    ua: i % 3 === 0 ? "Chrome 131 / macOS" : i % 3 === 1 ? "Safari 17 / iOS" : "Firefox 130 / Windows",
    result: a.result,
  };
});

export const flags: FeatureFlag[] = [
  { key: "wallet.usd.enable", name: "USD wallet", description: "DEPRECATED — kept off; we are NGN-only.", values: { sandbox: false, staging: false, prod: false }, rolloutPct: { sandbox: 0, staging: 0, prod: 0 }, owner: "Aisha O.", updatedAt: new Date(Date.now() - 60 * 86400_000).toISOString() },
  { key: "numbers.virtual.enable", name: "Virtual numbers", description: "Lease and assign Nigerian virtual numbers.", values: { sandbox: true, staging: true, prod: true }, rolloutPct: { sandbox: 100, staging: 100, prod: 100 }, owner: "Tunde A.", updatedAt: new Date(Date.now() - 14 * 86400_000).toISOString() },
  { key: "pin.required.topup", name: "Force PIN on top-up", description: "Require transaction PIN for wallet top-up flows.", values: { sandbox: true, staging: true, prod: true }, rolloutPct: { sandbox: 100, staging: 100, prod: 100 }, owner: "Kemi B.", updatedAt: new Date(Date.now() - 30 * 86400_000).toISOString() },
  { key: "cards.contactless.beta", name: "Contactless cards beta", description: "Enable tap-to-pay provisioning for the Naira card.", values: { sandbox: true, staging: true, prod: false }, rolloutPct: { sandbox: 100, staging: 100, prod: 5 }, owner: "David L.", updatedAt: new Date(Date.now() - 4 * 86400_000).toISOString() },
  { key: "esim.global.plans", name: "Global eSIM plans", description: "Show 100+ country eSIM bundles in marketplace.", values: { sandbox: true, staging: true, prod: true }, rolloutPct: { sandbox: 100, staging: 100, prod: 100 }, owner: "Joy E.", updatedAt: new Date(Date.now() - 22 * 86400_000).toISOString() },
  { key: "support.ai.summary", name: "AI ticket summaries", description: "Auto-summarise long support threads with on-prem LLM.", values: { sandbox: true, staging: true, prod: false }, rolloutPct: { sandbox: 100, staging: 100, prod: 25 }, owner: "Joy E.", updatedAt: new Date(Date.now() - 2 * 86400_000).toISOString() },
  { key: "fraud.ml.v4", name: "Fraud model v4", description: "Tighter structuring + device anomaly detection.", values: { sandbox: true, staging: true, prod: true }, rolloutPct: { sandbox: 100, staging: 100, prod: 60 }, owner: "Kemi B.", updatedAt: new Date(Date.now() - 7 * 86400_000).toISOString() },
  { key: "growth.referral.v2", name: "Referral v2 rewards", description: "₦1,000 + cashback ladder for referrers.", values: { sandbox: true, staging: false, prod: false }, rolloutPct: { sandbox: 100, staging: 0, prod: 0 }, owner: "Tunde A.", updatedAt: new Date(Date.now() - 1 * 86400_000).toISOString() },
];

export const apiKeys: ApiKey[] = [
  { id: "ak_001", name: "NIBSS payouts (prod)", service: "NIBSS", scope: "write", env: "prod", masked: "nbs-live••••2A91", lastUsedAt: new Date(Date.now() - 4 * 60_000).toISOString(), rotatedAt: new Date(Date.now() - 22 * 86400_000).toISOString(), createdBy: "Priya M." },
  { id: "ak_002", name: "Visa card switch (prod)", service: "Visa", scope: "write", env: "prod", masked: "vsa-live••••91KF", lastUsedAt: new Date(Date.now() - 12 * 60_000).toISOString(), rotatedAt: new Date(Date.now() - 11 * 86400_000).toISOString(), createdBy: "David L." },
  { id: "ak_003", name: "Termii SMS", service: "Termii", scope: "write", env: "prod", masked: "tm-••••1102", lastUsedAt: new Date(Date.now() - 30 * 60_000).toISOString(), rotatedAt: new Date(Date.now() - 2 * 86400_000).toISOString(), createdBy: "Aisha O." },
  { id: "ak_004", name: "Postmark email", service: "Postmark", scope: "write", env: "prod", masked: "pm-••••8821", lastUsedAt: new Date(Date.now() - 9 * 60_000).toISOString(), rotatedAt: new Date(Date.now() - 4 * 86400_000).toISOString(), createdBy: "Aisha O." },
  { id: "ak_005", name: "BVN verification", service: "Smile ID", scope: "read", env: "prod", masked: "sm-live••••QQ12", lastUsedAt: new Date(Date.now() - 2 * 60_000).toISOString(), rotatedAt: new Date(Date.now() - 45 * 86400_000).toISOString(), createdBy: "Kemi B." },
  { id: "ak_006", name: "Sandbox webhooks", service: "Internal", scope: "admin", env: "sandbox", masked: "bz-sbx••••00AB", lastUsedAt: new Date(Date.now() - 6 * 3600_000).toISOString(), rotatedAt: new Date(Date.now() - 90 * 86400_000).toISOString(), createdBy: "Tunde A." },
  { id: "ak_007", name: "Staging cron runner", service: "Internal", scope: "admin", env: "staging", masked: "bz-stg••••71ZZ", lastUsedAt: new Date(Date.now() - 18 * 3600_000).toISOString(), rotatedAt: new Date(Date.now() - 30 * 86400_000).toISOString(), createdBy: "Tunde A." },
];

export const initialBrand: BrandTokens = {
  primary: "oklch(0.78 0.16 80)",
  primaryGlow: "oklch(0.86 0.14 85)",
  background: "oklch(0.98 0.01 90)",
  foreground: "oklch(0.18 0.02 80)",
  accent: "oklch(0.92 0.05 85)",
  radius: 12,
  logoUrl: "B",
  appName: "BazePay",
};

export const fmtRelative = (iso: string | null) => {
  if (!iso) return "never";
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
