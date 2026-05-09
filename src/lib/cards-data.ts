// Mock data for the Cards module.

export type CardBrand = "Visa" | "Mastercard";
export type CardStatus = "active" | "frozen" | "terminated" | "pending";
export type CardCurrency = "USD" | "NGN";
export type ProgramStatus = "live" | "paused" | "draft";

export type CardProgram = {
  id: string;
  name: string;
  brand: CardBrand;
  bin: string;
  currency: CardCurrency;
  issuer: string; // e.g. Marqeta, Sudo
  status: ProgramStatus;
  monthlyFeeUsd: number;
  fxMarkupBps: number;
  dailyLimitUsd: number;
  monthlyLimitUsd: number;
  issuedCount: number;
  activeCount: number;
  approvalRate: number; // 0-100
  declineRate: number;
  kytRules: string[];
};

export const cardPrograms: CardProgram[] = [
  {
    id: "prog_usd_visa",
    name: "BazePay USD Visa",
    brand: "Visa",
    bin: "475142",
    currency: "USD",
    issuer: "Marqeta",
    status: "live",
    monthlyFeeUsd: 1.0,
    fxMarkupBps: 250,
    dailyLimitUsd: 5000,
    monthlyLimitUsd: 50000,
    issuedCount: 6420,
    activeCount: 5188,
    approvalRate: 94.2,
    declineRate: 5.8,
    kytRules: ["block_gambling_high_risk", "velocity_10_per_min", "geo_block_OFAC"],
  },
  {
    id: "prog_usd_mc",
    name: "BazePay USD Mastercard",
    brand: "Mastercard",
    bin: "555214",
    currency: "USD",
    issuer: "Marqeta",
    status: "live",
    monthlyFeeUsd: 0.5,
    fxMarkupBps: 220,
    dailyLimitUsd: 7500,
    monthlyLimitUsd: 75000,
    issuedCount: 2980,
    activeCount: 2461,
    approvalRate: 95.6,
    declineRate: 4.4,
    kytRules: ["velocity_10_per_min", "geo_block_OFAC"],
  },
  {
    id: "prog_ngn_visa",
    name: "BazePay Naira Visa (Pilot)",
    brand: "Visa",
    bin: "539423",
    currency: "NGN",
    issuer: "Sudo",
    status: "paused",
    monthlyFeeUsd: 0,
    fxMarkupBps: 0,
    dailyLimitUsd: 1000,
    monthlyLimitUsd: 10000,
    issuedCount: 412,
    activeCount: 0,
    approvalRate: 88.1,
    declineRate: 11.9,
    kytRules: ["pilot_whitelist_only"],
  },
];

export type IssuedCard = {
  id: string;
  programId: string;
  brand: CardBrand;
  last4: string;
  currency: CardCurrency;
  status: CardStatus;
  user: { id: string; name: string; email: string };
  balanceUsd: number;
  spend30dUsd: number;
  dailyLimitUsd: number;
  monthlyLimitUsd: number;
  issuedAt: string;
  lastUsedAt: string;
  riskScore: number;
  pan: string; // masked, 16 digits with all but last 4 as X
  cvv: string; // masked
  expiry: string; // MM/YY
  threeDsEnrolled: boolean;
  panRevealed: boolean;
};

const FIRST = ["Ada", "Tunde", "Ngozi", "Aisha", "Femi", "Zainab", "Kunle", "Ifeoma", "Bayo", "Halima", "Emeka", "Sade", "Maryam", "Obi", "Funke"];
const LAST = ["Okafor", "Adeyemi", "Bello", "Okonkwo", "Mohammed", "Balogun", "Eze", "Akinwale", "Sani", "Onyeka", "Hassan", "Igwe", "Lawal", "Nwosu", "Yusuf"];

function seed(i: number) {
  const x = Math.sin(i * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

function makeCard(i: number): IssuedCard {
  const r = seed(i);
  const r2 = seed(i + 71);
  const r3 = seed(i + 211);
  const program = cardPrograms[i % 2]; // mostly USD
  const first = FIRST[i % FIRST.length];
  const last = LAST[(i * 5) % LAST.length];
  const status: CardStatus =
    i % 53 === 0 ? "terminated" : i % 17 === 0 ? "frozen" : i % 41 === 0 ? "pending" : "active";
  const last4 = String(1000 + Math.floor(r * 8999));
  const issuedDays = Math.floor(2 + r2 * 540);
  return {
    id: `vc_${(80000 + i).toString()}`,
    programId: program.id,
    brand: program.brand,
    last4,
    currency: program.currency,
    status,
    user: {
      id: `u_${(8000 + (i % 64) + 1).toString().padStart(4, "0")}`,
      name: `${first} ${last}`,
      email: `${first}.${last}`.toLowerCase() + "@mail.com",
    },
    balanceUsd: Math.round(50 + r * 4500),
    spend30dUsd: Math.round(r2 * 6500),
    dailyLimitUsd: program.dailyLimitUsd,
    monthlyLimitUsd: program.monthlyLimitUsd,
    issuedAt: new Date(Date.now() - issuedDays * 86_400_000).toISOString(),
    lastUsedAt: new Date(Date.now() - Math.floor(r3 * 30) * 86_400_000).toISOString(),
    riskScore: Math.round(r3 * 95) + 5,
    pan: `${program.bin}XX XXXX ${last4}`,
    cvv: "•••",
    expiry: `${String(((i % 12) + 1)).padStart(2, "0")}/${27 + (i % 4)}`,
    threeDsEnrolled: i % 4 !== 0,
    panRevealed: false,
  };
}

export const issuedCards: IssuedCard[] = Array.from({ length: 96 }, (_, i) => makeCard(i + 1));

export const getIssuedCard = (id: string) => issuedCards.find((c) => c.id === id);
export const getProgram = (id: string) => cardPrograms.find((p) => p.id === id);

// ---- Helpers ----
export const cardStatusTone: Record<CardStatus, string> = {
  active: "bg-success/15 text-success border-success/30",
  frozen: "bg-warning/15 text-warning border-warning/30",
  terminated: "bg-destructive/15 text-destructive border-destructive/30",
  pending: "bg-primary/15 text-primary border-primary/30",
};
export const programStatusTone: Record<ProgramStatus, string> = {
  live: "bg-success/15 text-success border-success/30",
  paused: "bg-warning/15 text-warning border-warning/30",
  draft: "bg-muted text-muted-foreground border-border",
};

export type CardTxn = {
  id: string;
  at: string;
  merchant: string;
  mcc: string;
  category: string;
  amountUsd: number;
  status: "approved" | "declined" | "reversed";
  reason?: string;
};

const MERCHANTS = ["Amazon", "Netflix", "Spotify", "Apple", "Uber", "Airbnb", "Steam", "Booking.com", "Shopify", "ChatGPT", "Figma", "Notion"];
const CATEGORIES = ["Retail", "Streaming", "Streaming", "Digital", "Travel", "Travel", "Gaming", "Travel", "Software", "Software", "Software", "Software"];

export function getCardTransactions(cardId: string, count = 14): CardTxn[] {
  return Array.from({ length: count }, (_, i) => {
    const r = seed(cardId.charCodeAt(3) + i * 7);
    const idx = i % MERCHANTS.length;
    const status: CardTxn["status"] = i % 13 === 0 ? "declined" : i % 23 === 0 ? "reversed" : "approved";
    return {
      id: `ct_${(50000 + cardId.charCodeAt(4) + i).toString()}`,
      at: new Date(Date.now() - i * 6 * 3_600_000 * (1 + r)).toISOString(),
      merchant: MERCHANTS[idx],
      mcc: ["5942", "4899", "4899", "5732", "4121", "7011", "5816", "7011", "5734", "5734", "5734", "5734"][idx],
      category: CATEGORIES[idx],
      amountUsd: Math.round((1 + r * 240) * 100) / 100,
      status,
      reason: status === "declined" ? "INSUFFICIENT_FUNDS" : undefined,
    };
  });
}
