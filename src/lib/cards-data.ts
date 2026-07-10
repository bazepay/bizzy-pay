// Mock data for the Cards module. NGN-only — BazePay only issues Naira cards.

export type CardBrand = "Visa" | "Mastercard" | "Verve";
export type CardStatus = "active" | "frozen" | "terminated" | "pending";
export type CardCurrency = "NGN";
export type ProgramStatus = "live" | "paused" | "draft";

export type CardProgram = {
  id: string;
  name: string;
  brand: CardBrand;
  bin: string;
  currency: CardCurrency;
  issuer: string; // local issuing partner (e.g. Sudo, Flutterwave, Providus)
  status: ProgramStatus;
  monthlyFeeNgn: number;
  // Domestic Naira cards have no FX markup on local spend.
  // Markup applies only when card is used on international rails (cross-border auths).
  fxMarkupBps: number;
  dailyLimitNgn: number;
  monthlyLimitNgn: number;
  issuedCount: number;
  activeCount: number;
  approvalRate: number; // 0-100
  declineRate: number;
  kytRules: string[];
};

export const cardPrograms: CardProgram[] = [
  {
    id: "prog_ngn_verve",
    name: "BazePay Naira Verve",
    brand: "Verve",
    bin: "506099",
    currency: "NGN",
    issuer: "Sudo",
    status: "live",
    monthlyFeeNgn: 0,
    fxMarkupBps: 0,
    dailyLimitNgn: 500_000,
    monthlyLimitNgn: 5_000_000,
    issuedCount: 6420,
    activeCount: 5188,
    approvalRate: 94.2,
    declineRate: 5.8,
    kytRules: ["block_gambling_high_risk", "velocity_10_per_min", "geo_restrict_NG_only"],
  },
  {
    id: "prog_ngn_mc",
    name: "BazePay Naira Mastercard",
    brand: "Mastercard",
    bin: "539923",
    currency: "NGN",
    issuer: "Flutterwave",
    status: "live",
    monthlyFeeNgn: 500,
    fxMarkupBps: 350,
    dailyLimitNgn: 1_000_000,
    monthlyLimitNgn: 10_000_000,
    issuedCount: 2980,
    activeCount: 2461,
    approvalRate: 95.6,
    declineRate: 4.4,
    kytRules: ["velocity_10_per_min", "cross_border_cap_daily"],
  },
  {
    id: "prog_ngn_visa",
    name: "BazePay Naira Visa (Pilot)",
    brand: "Visa",
    bin: "418742",
    currency: "NGN",
    issuer: "Providus",
    status: "paused",
    monthlyFeeNgn: 0,
    fxMarkupBps: 300,
    dailyLimitNgn: 250_000,
    monthlyLimitNgn: 2_500_000,
    issuedCount: 412,
    activeCount: 0,
    approvalRate: 88.1,
    declineRate: 11.9,
    kytRules: ["pilot_whitelist_only"],
  },
];

export type CardType = "virtual" | "physical";

export type IssuedCard = {
  id: string;
  programId: string;
  brand: CardBrand;
  last4: string;
  currency: CardCurrency;
  status: CardStatus;
  type: CardType;
  user: { id: string; name: string; email: string };
  balanceNgn: number;
  spend30dNgn: number;
  dailyLimitNgn: number;
  monthlyLimitNgn: number;
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
  const program = cardPrograms[i % cardPrograms.length];
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
    type: i % 5 === 0 ? "physical" : "virtual",
    user: {
      id: `u_${(8000 + (i % 64) + 1).toString().padStart(4, "0")}`,
      name: `${first} ${last}`,
      email: `${first}.${last}`.toLowerCase() + "@mail.com",
    },
    balanceNgn: Math.round((50 + r * 4500) * 1500),
    spend30dNgn: Math.round(r2 * 6500 * 1500),
    dailyLimitNgn: program.dailyLimitNgn,
    monthlyLimitNgn: program.monthlyLimitNgn,
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

// Format Naira with ₦ symbol and thousands separators.
export const fmtNgn = (n: number) =>
  `₦${Math.round(n).toLocaleString("en-NG")}`;

export type CardTxn = {
  id: string;
  at: string;
  merchant: string;
  mcc: string;
  category: string;
  amountNgn: number;
  status: "approved" | "declined" | "reversed";
  reason?: string;
};

const MERCHANTS = ["Jumia", "Netflix", "Spotify", "Apple", "Bolt", "Booking.com", "Steam", "Uber", "Shopify", "ChatGPT", "Figma", "Notion"];
const CATEGORIES = ["Retail", "Streaming", "Streaming", "Digital", "Transport", "Travel", "Gaming", "Transport", "Software", "Software", "Software", "Software"];

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
      amountNgn: Math.round((1 + r * 240) * 1500),
      status,
      reason: status === "declined" ? "INSUFFICIENT_FUNDS" : undefined,
    };
  });
}

// ============= Physical card lifecycle =============

export type PhysicalRequestStatus =
  | "requested"    // user submitted from mobile app
  | "approved"     // admin approved for production
  | "printing"     // sent to issuer for personalisation
  | "shipped"      // handed to courier
  | "delivered"    // courier confirmed delivery
  | "activated"    // user activated via app
  | "rejected"     // admin declined
  | "lost"         // reported lost in transit
  | "cancelled";   // user or admin cancelled

export type CardDesign = "classic-black" | "brand-blue" | "gold-tier";

export type ShippingAddress = {
  line1: string;
  line2?: string;
  city: string;
  state: string; // NG state
  postcode?: string;
  phone: string;
};

export type PhysicalCardRequest = {
  id: string;
  user: { id: string; name: string; email: string };
  programId: string;
  design: CardDesign;
  status: PhysicalRequestStatus;
  address: ShippingAddress;
  courier: "GIG" | "DHL" | "Redstar" | "Kwik";
  tracking?: string;
  feeNgn: number;
  requestedAt: string;
  updatedAt: string;
  eta?: string; // ISO
  notes?: string;
  linkedCardId?: string; // set after activation
};

const NG_STATES = ["Lagos", "Abuja", "Rivers", "Kano", "Oyo", "Kaduna", "Enugu", "Delta"];
const COURIERS: PhysicalCardRequest["courier"][] = ["GIG", "DHL", "Redstar", "Kwik"];
const DESIGNS: CardDesign[] = ["classic-black", "brand-blue", "gold-tier"];
const STATUS_FLOW: PhysicalRequestStatus[] = [
  "requested", "approved", "printing", "shipped", "delivered", "activated",
];

function makeRequest(i: number): PhysicalCardRequest {
  const r = seed(i + 1000);
  const first = FIRST[i % FIRST.length];
  const last = LAST[(i * 3) % LAST.length];
  const stageIdx = i % 8;
  const status: PhysicalRequestStatus =
    stageIdx === 6 ? "rejected" : stageIdx === 7 ? "cancelled" : STATUS_FLOW[stageIdx];
  const requested = new Date(Date.now() - (5 + Math.floor(r * 40)) * 86_400_000);
  return {
    id: `pcr_${(60000 + i).toString()}`,
    user: {
      id: `u_${(8000 + (i % 64) + 1).toString().padStart(4, "0")}`,
      name: `${first} ${last}`,
      email: `${first}.${last}`.toLowerCase() + "@mail.com",
    },
    programId: cardPrograms[i % cardPrograms.length].id,
    design: DESIGNS[i % DESIGNS.length],
    status,
    address: {
      line1: `${10 + i} ${["Allen", "Awolowo", "Herbert Macaulay", "Ademola", "Bode Thomas"][i % 5]} Ave`,
      city: ["Ikeja", "Victoria Island", "Wuse", "GRA", "Lekki"][i % 5],
      state: NG_STATES[i % NG_STATES.length],
      phone: `+2348${String(10000000 + Math.floor(r * 89999999))}`,
    },
    courier: COURIERS[i % COURIERS.length],
    tracking: status === "shipped" || status === "delivered" || status === "activated"
      ? `TRK${(100000 + i * 37).toString()}` : undefined,
    feeNgn: 2500,
    requestedAt: requested.toISOString(),
    updatedAt: new Date(requested.getTime() + stageIdx * 86_400_000).toISOString(),
    eta: status === "shipped" ? new Date(Date.now() + 3 * 86_400_000).toISOString() : undefined,
    linkedCardId: status === "activated" ? `vc_${(80000 + i).toString()}` : undefined,
  };
}

export const physicalRequests: PhysicalCardRequest[] = Array.from({ length: 32 }, (_, i) => makeRequest(i + 1));

export const requestStatusTone: Record<PhysicalRequestStatus, string> = {
  requested: "bg-primary/15 text-primary border-primary/30",
  approved: "bg-primary/15 text-primary border-primary/30",
  printing: "bg-warning/15 text-warning border-warning/30",
  shipped: "bg-warning/15 text-warning border-warning/30",
  delivered: "bg-success/15 text-success border-success/30",
  activated: "bg-success/15 text-success border-success/30",
  rejected: "bg-destructive/15 text-destructive border-destructive/30",
  lost: "bg-destructive/15 text-destructive border-destructive/30",
  cancelled: "bg-muted text-muted-foreground border-border",
};

export const nextStatus: Partial<Record<PhysicalRequestStatus, PhysicalRequestStatus>> = {
  requested: "approved",
  approved: "printing",
  printing: "shipped",
  shipped: "delivered",
  delivered: "activated",
};

// ---- Physical card program settings (lifecycle config) ----
export type PhysicalSettings = {
  issuanceFeeNgn: number;
  replacementFeeNgn: number;
  expressShippingFeeNgn: number;
  autoApproveKycTier: "tier1" | "tier2" | "tier3"; // min tier to skip manual approval
  maxRequestsPerUser: number;
  productionSlaDays: number;
  shippingSlaDays: number;
  activationWindowDays: number;
  couriers: { name: PhysicalCardRequest["courier"]; enabled: boolean; zones: string[] }[];
  designs: { id: CardDesign; name: string; enabled: boolean; tierRequired: "any" | "gold" }[];
  requireAddressVerification: boolean;
  requireIdOnDelivery: boolean;
  allowPoBox: boolean;
};

export const physicalSettings: PhysicalSettings = {
  issuanceFeeNgn: 2500,
  replacementFeeNgn: 1500,
  expressShippingFeeNgn: 3500,
  autoApproveKycTier: "tier2",
  maxRequestsPerUser: 2,
  productionSlaDays: 3,
  shippingSlaDays: 5,
  activationWindowDays: 14,
  couriers: [
    { name: "GIG", enabled: true, zones: ["Lagos", "Abuja", "Rivers", "Oyo"] },
    { name: "Redstar", enabled: true, zones: ["Kano", "Kaduna", "Enugu", "Delta"] },
    { name: "Kwik", enabled: true, zones: ["Lagos"] },
    { name: "DHL", enabled: false, zones: ["All"] },
  ],
  designs: [
    { id: "classic-black", name: "Classic Black", enabled: true, tierRequired: "any" },
    { id: "brand-blue", name: "BazePay Blue", enabled: true, tierRequired: "any" },
    { id: "gold-tier", name: "Gold Tier", enabled: true, tierRequired: "gold" },
  ],
  requireAddressVerification: true,
  requireIdOnDelivery: true,
  allowPoBox: false,
};
