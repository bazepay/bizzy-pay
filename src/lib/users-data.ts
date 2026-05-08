// Mock users dataset for the Users module. Will be replaced by Lovable Cloud.

export type KycStatus = "verified" | "unverified";
export type AccountStatus = "active" | "frozen" | "closed" | "pending";
export type Country = "NG" | "GH" | "KE" | "ZA" | "UK" | "US";

export type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: Country;
  kyc: KycStatus;
  status: AccountStatus;
  riskScore: number; // 0–100
  ltvNgn: number;
  signupAt: string; // ISO
  lastActiveAt: string;
  bvnLast4?: string;
  ninLast4?: string;
  avatarHue: number;
  twoFa: boolean;
  pinSet: boolean;
};

const FIRST = ["Ada", "Tunde", "Ngozi", "Chinedu", "Aisha", "Femi", "Zainab", "Kunle", "Ifeoma", "Bayo", "Halima", "Emeka", "Sade", "Yinka", "Maryam", "Obi", "Funke", "Ibrahim", "Chiamaka", "Segun"];
const LAST = ["Okafor", "Adeyemi", "Bello", "Okonkwo", "Mohammed", "Balogun", "Eze", "Akinwale", "Ojo", "Sani", "Onyeka", "Adebayo", "Hassan", "Igwe", "Lawal", "Nwosu", "Ogundipe", "Yusuf", "Chukwu", "Olatunji"];
const COUNTRIES: Country[] = ["NG", "NG", "NG", "NG", "GH", "KE", "ZA", "UK", "US"];

function seeded(i: number) {
  const x = Math.sin(i * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

function makeUser(i: number): User {
  const first = FIRST[i % FIRST.length];
  const last = LAST[(i * 3) % LAST.length];
  const r = seeded(i);
  const r2 = seeded(i + 100);
  const kyc: KycStatus = i % 6 === 0 ? "unverified" : "verified";
  const status: AccountStatus =
    i % 31 === 0 ? "frozen" : i % 47 === 0 ? "closed" : kyc === "unverified" ? "pending" : "active";
  const id = `u_${(8000 + i).toString().padStart(4, "0")}`;
  const ltv = Math.round((50_000 + r * 4_500_000) * (kyc === "verified" ? 3 : 1));
  const signupDays = Math.floor(2 + r2 * 700);
  const signupDate = new Date(Date.now() - signupDays * 86_400_000);
  const lastActive = new Date(Date.now() - Math.floor(r * 14) * 3_600_000);
  return {
    id,
    name: `${first} ${last}`,
    email: `${first}.${last}`.toLowerCase() + "@mail.com",
    phone: `+234 80${Math.floor(10000000 + r * 89999999)}`,
    country: COUNTRIES[i % COUNTRIES.length],
    kyc,
    status,
    riskScore: Math.round(r * 95) + 5,
    ltvNgn: ltv,
    signupAt: signupDate.toISOString(),
    lastActiveAt: lastActive.toISOString(),
    bvnLast4: kyc === "verified" ? String(1000 + Math.floor(r * 8999)).slice(-4) : undefined,
    ninLast4: kyc === "verified" ? String(1000 + Math.floor(r2 * 8999)).slice(-4) : undefined,
    avatarHue: Math.floor(r * 360),
    twoFa: i % 3 !== 0,
    pinSet: kyc === "verified",
  };
}

export const users: User[] = Array.from({ length: 64 }, (_, i) => makeUser(i + 1));

export const getUser = (id: string) => users.find((u) => u.id === id);

// ---------- Per-user details (deterministic by id) ----------

export type Wallet = { currency: "NGN" | "USD" | "EUR" | "GHS"; balance: number; ledger: number; pending: number };
export type Txn = {
  id: string;
  type: "topup" | "transfer" | "airtime" | "data" | "electricity" | "tv" | "betting" | "card_spend" | "esim" | "number" | "refund" | "fee";
  amountNgn: number;
  status: "success" | "pending" | "failed" | "reversed";
  provider: string;
  at: string;
  counterparty?: string;
};
export type Card = { id: string; brand: "Visa" | "Mastercard"; last4: string; status: "active" | "frozen" | "closed"; balanceUsd: number; spendUsd: number; issuedAt: string };
export type Esim = { id: string; country: string; plan: string; dataGb: number; usedGb: number; status: "active" | "expired" | "pending"; activatedAt: string };
export type VNumber = { id: string; number: string; country: string; service: string; status: "active" | "expired"; leasedAt: string };
export type Device = { id: string; name: string; os: string; ip: string; geo: string; lastActive: string; current: boolean };
export type Note = { id: string; author: string; body: string; at: string; tag?: "fraud" | "support" | "vip" | "compliance" };

const TYPES: Txn["type"][] = ["topup", "transfer", "airtime", "data", "electricity", "tv", "card_spend", "esim", "number", "refund", "fee", "betting"];
const PROVIDERS: Record<Txn["type"], string> = {
  topup: "Flutterwave",
  transfer: "NIBSS",
  airtime: "Reloadly",
  data: "Reloadly",
  electricity: "BuyPower",
  tv: "DStv",
  betting: "SportyBet",
  card_spend: "Marqeta",
  esim: "Airalo",
  number: "Twilio",
  refund: "System",
  fee: "System",
};

export function getWallets(userId: string): Wallet[] {
  const r = seeded(userId.length + userId.charCodeAt(2));
  return [
    { currency: "NGN", balance: Math.round(50_000 + r * 5_000_000), ledger: Math.round(50_000 + r * 5_200_000), pending: Math.round(r * 80_000) },
    { currency: "USD", balance: Math.round(50 + r * 4_000), ledger: Math.round(50 + r * 4_200), pending: Math.round(r * 80) },
    { currency: "EUR", balance: Math.round(r * 1_500), ledger: Math.round(r * 1_500), pending: 0 },
    { currency: "GHS", balance: Math.round(r * 8_000), ledger: Math.round(r * 8_000), pending: 0 },
  ];
}

export function getTransactions(userId: string, count = 18): Txn[] {
  return Array.from({ length: count }, (_, i) => {
    const r = seeded(userId.charCodeAt(2) + i * 13);
    const type = TYPES[i % TYPES.length];
    const status: Txn["status"] = i % 11 === 0 ? "failed" : i % 17 === 0 ? "pending" : i % 23 === 0 ? "reversed" : "success";
    return {
      id: `tx_${(91000 + userId.charCodeAt(3) * 7 + i).toString()}`,
      type,
      amountNgn: Math.round((500 + r * 480_000) * (type === "card_spend" ? 1.6 : 1)),
      status,
      provider: PROVIDERS[type],
      at: new Date(Date.now() - i * 3_600_000 * (1 + r)).toISOString(),
      counterparty: type === "transfer" ? "Wema Bank · 0123" + String(Math.floor(r * 999)).padStart(3, "0") : undefined,
    };
  });
}

export function getCards(userId: string): Card[] {
  const r = seeded(userId.charCodeAt(2) + 5);
  return [
    { id: "vc_4421", brand: "Visa", last4: "4421", status: "active", balanceUsd: Math.round(200 + r * 2000), spendUsd: Math.round(r * 3500), issuedAt: "2024-08-12" },
    { id: "vc_8809", brand: "Mastercard", last4: "8809", status: r > 0.7 ? "frozen" : "active", balanceUsd: Math.round(50 + r * 800), spendUsd: Math.round(r * 1200), issuedAt: "2025-01-05" },
  ];
}

export function getEsims(userId: string): Esim[] {
  const r = seeded(userId.charCodeAt(2) + 9);
  return [
    { id: "esim_001", country: "United Kingdom", plan: "10GB / 30 days", dataGb: 10, usedGb: Math.round(r * 8 * 10) / 10, status: "active", activatedAt: "2025-04-12" },
    { id: "esim_002", country: "Ghana", plan: "5GB / 15 days", dataGb: 5, usedGb: 5, status: "expired", activatedAt: "2024-11-02" },
  ];
}

export function getNumbers(userId: string): VNumber[] {
  void userId;
  return [
    { id: "vn_71", number: "+1 (415) 555-0192", country: "US", service: "WhatsApp", status: "active", leasedAt: "2025-03-01" },
    { id: "vn_72", number: "+44 7700 900123", country: "UK", service: "Telegram", status: "expired", leasedAt: "2024-12-09" },
  ];
}

export function getDevices(userId: string): Device[] {
  void userId;
  return [
    { id: "d1", name: "iPhone 15 Pro", os: "iOS 17.4", ip: "102.89.34.12", geo: "Lagos, NG", lastActive: "2m ago", current: true },
    { id: "d2", name: "Pixel 8", os: "Android 14", ip: "197.211.50.8", geo: "Abuja, NG", lastActive: "3d ago", current: false },
    { id: "d3", name: "MacBook Air", os: "macOS 14.3", ip: "102.89.34.12", geo: "Lagos, NG", lastActive: "1w ago", current: false },
  ];
}

export function getNotes(userId: string): Note[] {
  void userId;
  return [
    { id: "n1", author: "Ada O.", body: "Customer called about a failed top-up. Refunded ₦15,000 manually.", at: "2 days ago", tag: "support" },
    { id: "n2", author: "Tunde M.", body: "Flagged for unusual velocity — 14 transfers in 5 minutes. Reviewed, false positive.", at: "1 week ago", tag: "fraud" },
    { id: "n3", author: "Ngozi A.", body: "VIP — high-volume merchant. Whitelisted for higher daily limit.", at: "3 weeks ago", tag: "vip" },
  ];
}

// ---------- Helpers ----------

export const kycLabel = (k: KycStatus) => (k === "verified" ? "Verified" : "Unverified");
export const kycTone = (k: KycStatus) =>
  k === "verified" ? "bg-success/15 text-success border-success/30" : "bg-muted text-muted-foreground border-border";
export const statusTone: Record<AccountStatus, string> = {
  active: "bg-success/15 text-success border-success/30",
  frozen: "bg-warning/20 text-warning-foreground border-warning/40",
  closed: "bg-muted text-muted-foreground border-border",
  pending: "bg-primary/10 text-primary border-primary/30",
};
export const riskTone = (n: number) =>
  n >= 70 ? "text-destructive" : n >= 40 ? "text-warning-foreground" : "text-success";
export const fmtRelative = (iso: string) => {
  const d = Date.now() - new Date(iso).getTime();
  const m = Math.floor(d / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
};
