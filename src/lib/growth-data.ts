// Growth / Referrals data — NGN-only rewards, mock dataset.

export type ProgramStatus = "active" | "paused" | "ended";
export type RewardKind = "cash_ngn" | "data_mb" | "airtime_ngn" | "fee_waiver";
export type RewardTrigger = "signup_kyc" | "first_topup" | "first_bill" | "first_card" | "tx_volume";

export type ReferralProgram = {
  id: string;
  name: string;
  status: ProgramStatus;
  trigger: RewardTrigger;
  referrerReward: { kind: RewardKind; amount: number };
  refereeReward: { kind: RewardKind; amount: number };
  minQualifyingNgn: number;
  cooldownDays: number;
  maxReferralsPerUser: number;
  startAt: string;
  endAt: string | null;
  budgetNgn: number;
  spentNgn: number;
  totalReferrals: number;
  qualifiedReferrals: number;
};

export type ReferralStatus = "pending" | "qualified" | "rewarded" | "expired" | "fraud";

export type Referral = {
  id: string;
  programId: string;
  referrerId: string;
  referrerName: string;
  refereeId: string;
  refereeName: string;
  channel: "link" | "code" | "social_x" | "social_wa" | "social_ig";
  code: string;
  status: ReferralStatus;
  invitedAt: string;
  qualifiedAt: string | null;
  rewardedAt: string | null;
  rewardNgn: number;
  qualifyingTxNgn: number;
};

export type CampaignStatus = "draft" | "scheduled" | "live" | "ended";
export type CampaignChannel = "push" | "email" | "sms" | "in_app";

export type Campaign = {
  id: string;
  name: string;
  channel: CampaignChannel;
  status: CampaignStatus;
  audience: string;
  audienceSize: number;
  startAt: string;
  endAt: string | null;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  converted: number;
  budgetNgn: number;
  spentNgn: number;
  ctaUrl: string;
};

export type PromoStatus = "active" | "paused" | "expired" | "scheduled";
export type PromoKind = "percent_off_fee" | "flat_credit_ngn" | "free_data_mb" | "first_bill_free";

export type PromoCode = {
  id: string;
  code: string;
  description: string;
  kind: PromoKind;
  value: number;
  status: PromoStatus;
  startAt: string;
  endAt: string | null;
  maxRedemptions: number; // 0 = unlimited
  redemptions: number;
  perUserLimit: number;
  minSpendNgn: number;
  appliesTo: Array<"wallet" | "bills" | "cards" | "esim" | "numbers">;
  totalCreditedNgn: number;
};

export const fmtNgn = (n: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);

export const programStatusTone: Record<ProgramStatus, string> = {
  active: "bg-success/15 text-success border-success/30",
  paused: "bg-warning/15 text-warning border-warning/30",
  ended: "bg-muted text-muted-foreground border-border",
};

export const referralStatusTone: Record<ReferralStatus, string> = {
  pending: "bg-warning/15 text-warning border-warning/30",
  qualified: "bg-primary/15 text-primary border-primary/30",
  rewarded: "bg-success/15 text-success border-success/30",
  expired: "bg-muted text-muted-foreground border-border",
  fraud: "bg-destructive/15 text-destructive border-destructive/30",
};

export const campaignStatusTone: Record<CampaignStatus, string> = {
  draft: "bg-muted text-muted-foreground border-border",
  scheduled: "bg-primary/15 text-primary border-primary/30",
  live: "bg-success/15 text-success border-success/30",
  ended: "bg-muted text-muted-foreground border-border",
};

export const promoStatusTone: Record<PromoStatus, string> = {
  active: "bg-success/15 text-success border-success/30",
  scheduled: "bg-primary/15 text-primary border-primary/30",
  paused: "bg-warning/15 text-warning border-warning/30",
  expired: "bg-muted text-muted-foreground border-border",
};

export const rewardKindLabel: Record<RewardKind, string> = {
  cash_ngn: "Cash (₦)",
  data_mb: "Mobile data",
  airtime_ngn: "Airtime (₦)",
  fee_waiver: "Fee waiver",
};

export const rewardTriggerLabel: Record<RewardTrigger, string> = {
  signup_kyc: "Sign up + KYC",
  first_topup: "First wallet top-up",
  first_bill: "First bill payment",
  first_card: "First card issued",
  tx_volume: "Cumulative volume",
};

export const promoKindLabel: Record<PromoKind, string> = {
  percent_off_fee: "% off transaction fee",
  flat_credit_ngn: "Flat ₦ wallet credit",
  free_data_mb: "Free data bundle",
  first_bill_free: "First bill free",
};

export const campaignChannelLabel: Record<CampaignChannel, string> = {
  push: "Push notification",
  email: "Email",
  sms: "SMS",
  in_app: "In-app banner",
};

export const referralPrograms: ReferralProgram[] = [
  {
    id: "rp_001",
    name: "Refer & Earn ₦1,500",
    status: "active",
    trigger: "first_topup",
    referrerReward: { kind: "cash_ngn", amount: 1500 },
    refereeReward: { kind: "cash_ngn", amount: 1000 },
    minQualifyingNgn: 2000,
    cooldownDays: 30,
    maxReferralsPerUser: 25,
    startAt: "2025-09-01T00:00:00Z",
    endAt: null,
    budgetNgn: 25_000_000,
    spentNgn: 14_820_500,
    totalReferrals: 8_412,
    qualifiedReferrals: 6_201,
  },
  {
    id: "rp_002",
    name: "KYC Boost — ₦500 instant",
    status: "active",
    trigger: "signup_kyc",
    referrerReward: { kind: "cash_ngn", amount: 500 },
    refereeReward: { kind: "cash_ngn", amount: 500 },
    minQualifyingNgn: 0,
    cooldownDays: 0,
    maxReferralsPerUser: 50,
    startAt: "2026-01-15T00:00:00Z",
    endAt: "2026-06-30T00:00:00Z",
    budgetNgn: 8_000_000,
    spentNgn: 3_120_000,
    totalReferrals: 4_104,
    qualifiedReferrals: 3_120,
  },
  {
    id: "rp_003",
    name: "First Card Bonus",
    status: "paused",
    trigger: "first_card",
    referrerReward: { kind: "cash_ngn", amount: 2000 },
    refereeReward: { kind: "fee_waiver", amount: 1 },
    minQualifyingNgn: 0,
    cooldownDays: 14,
    maxReferralsPerUser: 10,
    startAt: "2025-11-01T00:00:00Z",
    endAt: null,
    budgetNgn: 6_000_000,
    spentNgn: 4_980_000,
    totalReferrals: 2_891,
    qualifiedReferrals: 2_490,
  },
  {
    id: "rp_004",
    name: "Q1 Volume Hero",
    status: "ended",
    trigger: "tx_volume",
    referrerReward: { kind: "cash_ngn", amount: 5000 },
    refereeReward: { kind: "airtime_ngn", amount: 1000 },
    minQualifyingNgn: 100_000,
    cooldownDays: 0,
    maxReferralsPerUser: 5,
    startAt: "2026-01-01T00:00:00Z",
    endAt: "2026-03-31T00:00:00Z",
    budgetNgn: 4_000_000,
    spentNgn: 4_000_000,
    totalReferrals: 1_212,
    qualifiedReferrals: 800,
  },
];

const FNAMES = ["Ada", "Tunde", "Ngozi", "Chinedu", "Aisha", "Femi", "Zainab", "Kunle", "Ifeoma", "Bayo", "Halima", "Emeka", "Sade", "Yinka", "Maryam", "Obi", "Funke", "Ibrahim", "Chiamaka", "Segun"];
const LNAMES = ["Okafor", "Adeyemi", "Bello", "Okonkwo", "Mohammed", "Balogun", "Eze", "Akinwale", "Ojo", "Sani", "Onyeka", "Adebayo", "Hassan", "Igwe", "Lawal", "Nwosu"];

function pseudoName(seed: number) {
  return `${FNAMES[seed % FNAMES.length]} ${LNAMES[(seed * 7) % LNAMES.length]}`;
}
function pseudoCode(seed: number) {
  const base = "BAZE";
  const n = (seed * 9301 + 49297) % 233280;
  return `${base}${n.toString(36).toUpperCase().padStart(5, "0").slice(-5)}`;
}

export const referrals: Referral[] = (() => {
  const out: Referral[] = [];
  const programs = referralPrograms.map((p) => p.id);
  const channels: Referral["channel"][] = ["link", "code", "social_x", "social_wa", "social_ig"];
  const statuses: ReferralStatus[] = ["pending", "qualified", "rewarded", "expired", "fraud"];
  for (let i = 0; i < 120; i++) {
    const seed = (i * 9301 + 49297) % 233280;
    const programId = programs[i % programs.length];
    const program = referralPrograms.find((p) => p.id === programId)!;
    const roll = seed / 233280;
    const status: ReferralStatus =
      roll < 0.55 ? "rewarded" : roll < 0.78 ? "qualified" : roll < 0.92 ? "pending" : roll < 0.97 ? "expired" : "fraud";
    const refIdx = (i * 31) % 999;
    const refeIdx = (i * 73 + 11) % 999;
    const invited = new Date(Date.now() - i * 3 * 3600_000 - (i % 7) * 1800_000).toISOString();
    const qualified = status === "rewarded" || status === "qualified" ? new Date(Date.now() - i * 3 * 3600_000 + 6 * 3600_000).toISOString() : null;
    const rewarded = status === "rewarded" ? new Date(Date.now() - i * 3 * 3600_000 + 12 * 3600_000).toISOString() : null;
    out.push({
      id: `ref_${String(840000 + i).slice(-6)}`,
      programId,
      referrerId: `usr_${String(100000 + refIdx).slice(-6)}`,
      referrerName: pseudoName(refIdx),
      refereeId: `usr_${String(200000 + refeIdx).slice(-6)}`,
      refereeName: pseudoName(refeIdx + 5),
      channel: channels[i % channels.length],
      code: pseudoCode(refIdx),
      status: statuses.includes(status) ? status : "pending",
      invitedAt: invited,
      qualifiedAt: qualified,
      rewardedAt: rewarded,
      rewardNgn: status === "rewarded" ? program.referrerReward.amount : 0,
      qualifyingTxNgn: status === "rewarded" || status === "qualified" ? Math.max(program.minQualifyingNgn, 1500 + (seed % 50) * 200) : 0,
    });
  }
  return out;
})();

export const campaigns: Campaign[] = [
  {
    id: "cmp_001",
    name: "May payday push — Bills 5% off",
    channel: "push",
    status: "live",
    audience: "Active wallet users · last 30d",
    audienceSize: 184_200,
    startAt: "2026-05-07T08:00:00Z",
    endAt: "2026-05-12T23:59:59Z",
    sent: 184_200,
    delivered: 178_410,
    opened: 92_104,
    clicked: 24_812,
    converted: 6_402,
    budgetNgn: 1_500_000,
    spentNgn: 612_400,
    ctaUrl: "/pay/airtime?promo=PAYDAY5",
  },
  {
    id: "cmp_002",
    name: "Refer-3-friends email blast",
    channel: "email",
    status: "live",
    audience: "Verified users · 0 referrals",
    audienceSize: 96_400,
    startAt: "2026-05-05T09:00:00Z",
    endAt: null,
    sent: 96_400,
    delivered: 94_120,
    opened: 38_412,
    clicked: 9_024,
    converted: 2_104,
    budgetNgn: 800_000,
    spentNgn: 240_100,
    ctaUrl: "/referrals?utm_src=email-may",
  },
  {
    id: "cmp_003",
    name: "Card upgrade SMS",
    channel: "sms",
    status: "scheduled",
    audience: "Wallet >₦50k · no card",
    audienceSize: 42_180,
    startAt: "2026-05-12T10:00:00Z",
    endAt: "2026-05-14T23:59:59Z",
    sent: 0,
    delivered: 0,
    opened: 0,
    clicked: 0,
    converted: 0,
    budgetNgn: 600_000,
    spentNgn: 0,
    ctaUrl: "/cards/order",
  },
  {
    id: "cmp_004",
    name: "eSIM travel banner — Lagos→London",
    channel: "in_app",
    status: "live",
    audience: "International txn last 90d",
    audienceSize: 28_900,
    startAt: "2026-04-20T00:00:00Z",
    endAt: "2026-06-30T23:59:59Z",
    sent: 28_900,
    delivered: 28_900,
    opened: 14_201,
    clicked: 5_812,
    converted: 1_412,
    budgetNgn: 400_000,
    spentNgn: 184_000,
    ctaUrl: "/esim/uk-roaming",
  },
  {
    id: "cmp_005",
    name: "Easter weekend free airtime",
    channel: "push",
    status: "ended",
    audience: "All active users",
    audienceSize: 312_400,
    startAt: "2026-04-04T08:00:00Z",
    endAt: "2026-04-07T23:59:59Z",
    sent: 312_400,
    delivered: 304_812,
    opened: 142_104,
    clicked: 41_204,
    converted: 12_802,
    budgetNgn: 2_000_000,
    spentNgn: 1_980_000,
    ctaUrl: "/pay/airtime?promo=EASTER",
  },
  {
    id: "cmp_006",
    name: "Reactivation — 60d dormant",
    channel: "email",
    status: "draft",
    audience: "No login 60+ days",
    audienceSize: 58_120,
    startAt: "2026-05-15T09:00:00Z",
    endAt: null,
    sent: 0,
    delivered: 0,
    opened: 0,
    clicked: 0,
    converted: 0,
    budgetNgn: 500_000,
    spentNgn: 0,
    ctaUrl: "/?utm_src=reactivation",
  },
];

export const promoCodes: PromoCode[] = [
  {
    id: "pc_001",
    code: "PAYDAY5",
    description: "5% off bill payment fees on payday week",
    kind: "percent_off_fee",
    value: 5,
    status: "active",
    startAt: "2026-05-07T00:00:00Z",
    endAt: "2026-05-12T23:59:59Z",
    maxRedemptions: 50_000,
    redemptions: 12_842,
    perUserLimit: 3,
    minSpendNgn: 500,
    appliesTo: ["bills"],
    totalCreditedNgn: 412_300,
  },
  {
    id: "pc_002",
    code: "WELCOME1K",
    description: "₦1,000 wallet credit for new verified users",
    kind: "flat_credit_ngn",
    value: 1000,
    status: "active",
    startAt: "2026-01-01T00:00:00Z",
    endAt: null,
    maxRedemptions: 0,
    redemptions: 24_812,
    perUserLimit: 1,
    minSpendNgn: 0,
    appliesTo: ["wallet"],
    totalCreditedNgn: 24_812_000,
  },
  {
    id: "pc_003",
    code: "FREEDATA500",
    description: "Free 500MB on first MTN data purchase",
    kind: "free_data_mb",
    value: 500,
    status: "active",
    startAt: "2026-04-01T00:00:00Z",
    endAt: "2026-06-30T23:59:59Z",
    maxRedemptions: 20_000,
    redemptions: 8_104,
    perUserLimit: 1,
    minSpendNgn: 0,
    appliesTo: ["bills"],
    totalCreditedNgn: 1_620_800,
  },
  {
    id: "pc_004",
    code: "FIRSTBILL",
    description: "First bill payment fee waived",
    kind: "first_bill_free",
    value: 1,
    status: "active",
    startAt: "2026-02-01T00:00:00Z",
    endAt: null,
    maxRedemptions: 0,
    redemptions: 41_204,
    perUserLimit: 1,
    minSpendNgn: 100,
    appliesTo: ["bills"],
    totalCreditedNgn: 1_236_120,
  },
  {
    id: "pc_005",
    code: "ESIMTRAVEL",
    description: "10% off any international eSIM plan",
    kind: "percent_off_fee",
    value: 10,
    status: "scheduled",
    startAt: "2026-06-01T00:00:00Z",
    endAt: "2026-08-31T23:59:59Z",
    maxRedemptions: 10_000,
    redemptions: 0,
    perUserLimit: 2,
    minSpendNgn: 1500,
    appliesTo: ["esim"],
    totalCreditedNgn: 0,
  },
  {
    id: "pc_006",
    code: "RAMADAN24",
    description: "Ramadan 2026 — 8% off across all bills",
    kind: "percent_off_fee",
    value: 8,
    status: "expired",
    startAt: "2026-03-10T00:00:00Z",
    endAt: "2026-04-09T23:59:59Z",
    maxRedemptions: 100_000,
    redemptions: 88_412,
    perUserLimit: 5,
    minSpendNgn: 200,
    appliesTo: ["bills", "wallet"],
    totalCreditedNgn: 3_840_220,
  },
  {
    id: "pc_007",
    code: "VIP500OFF",
    description: "Paused while reviewing fraud signals",
    kind: "flat_credit_ngn",
    value: 500,
    status: "paused",
    startAt: "2026-04-15T00:00:00Z",
    endAt: null,
    maxRedemptions: 5_000,
    redemptions: 1_204,
    perUserLimit: 1,
    minSpendNgn: 1000,
    appliesTo: ["wallet", "cards"],
    totalCreditedNgn: 602_000,
  },
];
