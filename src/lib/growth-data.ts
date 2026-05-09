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
// Campaigns are in-app only: a system notification in the bell tray, or a
// banner that pops up on login. Email lives in the Newsletter module.
export type CampaignChannel = "in_app_notification" | "login_banner";

export type Campaign = {
  id: string;
  name: string;
  channel: CampaignChannel;
  status: CampaignStatus;
  audience: string;
  audienceSize: number;
  startAt: string;
  endAt: string | null;
  // Banner-only copy
  title: string;          // headline (banner title or notification title)
  body: string;           // supporting line / notification body
  ctaLabel: string;       // button label, e.g. "Top up now"
  // Funnel
  sent: number;
  delivered: number;
  opened: number;        // banner shown / notification opened
  clicked: number;
  converted: number;
  ctaUrl: string;
  linkedProgramId?: string | null;
  linkedPromoCode?: string | null;
  // Targeting (optional on existing records)
  targeting?: CampaignTargeting;
  // Banner-only configuration
  banner?: BannerConfig;
};

// ---------- Targeting ----------
export type AudienceSegment =
  | "all_users"
  | "just_signed_up"
  | "new_user_7d"
  | "kyc_pending"
  | "kyc_verified"
  | "returning_dormant"
  | "power_user"
  | "no_card"
  | "has_card"
  | "wallet_high"
  | "wallet_low"
  | "no_referrals"
  | "international_txn";

export const audienceSegmentLabel: Record<AudienceSegment, string> = {
  all_users: "All users",
  just_signed_up: "Just signed up (today)",
  new_user_7d: "New users (last 7 days)",
  kyc_pending: "KYC pending",
  kyc_verified: "KYC verified",
  returning_dormant: "Returning after 14+ days inactive",
  power_user: "Power users (high tx volume)",
  no_card: "No card issued",
  has_card: "Has at least one card",
  wallet_high: "Wallet balance > ₦50,000",
  wallet_low: "Wallet balance < ₦5,000",
  no_referrals: "Zero referrals sent",
  international_txn: "Made international txn (last 90d)",
};

export const NG_STATES = [
  "All Nigeria","Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno","Cross River","Delta","Ebonyi","Edo","Ekiti","Enugu","FCT - Abuja","Gombe","Imo","Jigawa","Kaduna","Kano","Katsina","Kebbi","Kogi","Kwara","Lagos","Nasarawa","Niger","Ogun","Ondo","Osun","Oyo","Plateau","Rivers","Sokoto","Taraba","Yobe","Zamfara",
];

export type DevicePlatform = "ios" | "android" | "web";

export type CampaignTargeting = {
  segments: AudienceSegment[]; // OR-combined
  locations: string[];         // NG states; ["All Nigeria"] = no filter
  devices: DevicePlatform[];   // empty = all
  minAppVersion?: string;
  language?: "all" | "en" | "ha" | "ig" | "yo";
};

// ---------- Banner ----------
export type BannerSize = { id: string; label: string; w: number; h: number; ratio: string; use: string };
export const bannerSizes: BannerSize[] = [
  { id: "hero",   label: "Hero",          w: 1200, h: 600,  ratio: "2:1",   use: "Login splash, home top" },
  { id: "wide",   label: "Wide strip",    w: 1600, h: 500,  ratio: "16:5",  use: "Home / wallet header" },
  { id: "square", label: "Square card",   w: 1080, h: 1080, ratio: "1:1",   use: "Carousel card" },
  { id: "half",   label: "Half panel",    w: 1080, h: 720,  ratio: "3:2",   use: "Sectional banner" },
  { id: "sticky", label: "Sticky strip",  w: 1080, h: 320,  ratio: "27:8",  use: "Bottom sticky" },
];

export type BannerPlacement =
  | "login_splash"
  | "home_top"
  | "home_carousel"
  | "wallet_header"
  | "bills_header"
  | "cards_header"
  | "esim_header"
  | "profile_banner"
  | "bottom_sticky";

export const bannerPlacementLabel: Record<BannerPlacement, string> = {
  login_splash: "Login splash (modal on app open)",
  home_top: "Home — top of dashboard",
  home_carousel: "Home — promo carousel",
  wallet_header: "Wallet page — header",
  bills_header: "Bills page — header",
  cards_header: "Cards page — header",
  esim_header: "eSIM page — header",
  profile_banner: "Profile / account banner",
  bottom_sticky: "Bottom sticky strip (any page)",
};

export type BannerConfig = {
  imageUrl: string;              // uploaded asset (data URL preview)
  sizeId: string;                // references bannerSizes[].id
  placement: BannerPlacement;
  displaySeconds: number;        // auto-dismiss after N sec; 0 = until closed
  maxImpressionsPerUser: number; // 0 = no cap
  cooldownHours: number;         // min hours between impressions to same user
  dismissible: boolean;
};

// ---------- Newsletter (email) ----------
export type NewsletterStatus = "draft" | "scheduled" | "sending" | "sent" | "paused";

export type EmailBodyFormat = "plain" | "html";

export type Newsletter = {
  id: string;
  subject: string;
  preheader: string;
  audience: string;
  audienceSize: number;
  fromName: string;       // e.g. "BazePay"
  fromEmail: string;      // e.g. "hello@bazepay.com"
  replyTo?: string;
  // Email content
  headerImageUrl?: string;       // optional banner at top of email
  bodyFormat?: EmailBodyFormat;  // plain or html
  bodyText?: string;             // raw plain text or HTML markup
  status: NewsletterStatus;
  scheduledAt: string | null;
  sentAt: string | null;
  // Funnel
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  unsubscribed: number;
  bounced: number;
  // Optional cross-link
  linkedPromoCode?: string | null;
  ctaUrl?: string;
  // Targeting (optional on existing records)
  targeting?: CampaignTargeting;
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

// Curated catalog of in-app destinations a campaign CTA can deep-link to.
// These are user-app routes (not admin), grouped for the picker.
export type CampaignDestination = {
  path: string;          // base path (no query)
  label: string;         // human label shown in picker
  group: "Wallet" | "Bills" | "Cards" | "eSIM" | "Numbers" | "Growth" | "Account";
  acceptsPromo?: boolean; // if true, ?promo=CODE is appended when a promo is linked
};

export const campaignDestinations: CampaignDestination[] = [
  // Wallet
  { path: "/", label: "Home / Dashboard", group: "Wallet" },
  { path: "/wallet", label: "Wallet overview", group: "Wallet" },
  { path: "/wallet/topup", label: "Top up wallet", group: "Wallet", acceptsPromo: true },
  { path: "/wallet/send", label: "Send money", group: "Wallet" },
  { path: "/wallet/history", label: "Transaction history", group: "Wallet" },
  // Bills
  { path: "/pay", label: "Pay bills (hub)", group: "Bills", acceptsPromo: true },
  { path: "/pay/airtime", label: "Buy airtime", group: "Bills", acceptsPromo: true },
  { path: "/pay/data", label: "Buy data", group: "Bills", acceptsPromo: true },
  { path: "/pay/electricity", label: "Pay electricity", group: "Bills", acceptsPromo: true },
  { path: "/pay/cable", label: "Pay cable / TV", group: "Bills", acceptsPromo: true },
  { path: "/pay/betting", label: "Fund betting wallet", group: "Bills", acceptsPromo: true },
  // Cards
  { path: "/cards", label: "My cards", group: "Cards" },
  { path: "/cards/order", label: "Order a new card", group: "Cards", acceptsPromo: true },
  { path: "/cards/fund", label: "Fund a card", group: "Cards" },
  // eSIM
  { path: "/esim", label: "eSIM marketplace", group: "eSIM" },
  { path: "/esim/uk-roaming", label: "eSIM — UK roaming bundle", group: "eSIM", acceptsPromo: true },
  { path: "/esim/us-roaming", label: "eSIM — US roaming bundle", group: "eSIM", acceptsPromo: true },
  { path: "/esim/eu-roaming", label: "eSIM — EU roaming bundle", group: "eSIM", acceptsPromo: true },
  // Numbers
  { path: "/numbers", label: "Virtual numbers", group: "Numbers" },
  { path: "/numbers/new", label: "Lease a new number", group: "Numbers", acceptsPromo: true },
  // Growth
  { path: "/referrals", label: "Refer & earn", group: "Growth" },
  { path: "/promos", label: "Promos & offers", group: "Growth" },
  // Account
  { path: "/kyc", label: "Complete KYC", group: "Account" },
  { path: "/profile", label: "Profile & settings", group: "Account" },
];

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
  in_app_notification: "In-app notification",
  login_banner: "Login banner",
};

export const newsletterStatusTone: Record<NewsletterStatus, string> = {
  draft: "bg-muted text-muted-foreground border-border",
  scheduled: "bg-primary/15 text-primary border-primary/30",
  sending: "bg-primary/15 text-primary border-primary/30",
  sent: "bg-success/15 text-success border-success/30",
  paused: "bg-warning/15 text-warning border-warning/30",
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
    name: "May payday — Bills 5% off",
    channel: "in_app_notification",
    status: "live",
    audience: "Active wallet users · last 30d",
    audienceSize: 184_200,
    startAt: "2026-05-07T08:00:00Z",
    endAt: "2026-05-12T23:59:59Z",
    title: "Payday week is here 🎉",
    body: "Get 5% off all bill payment fees with code PAYDAY5. Limited to ₦12k cashback.",
    ctaLabel: "Pay a bill",
    sent: 184_200,
    delivered: 178_410,
    opened: 92_104,
    clicked: 24_812,
    converted: 6_402,
    ctaUrl: "/pay/airtime?promo=PAYDAY5",
    linkedPromoCode: "PAYDAY5",
  },
  {
    id: "cmp_002",
    name: "Card upgrade nudge",
    channel: "login_banner",
    status: "scheduled",
    audience: "Wallet >₦50k · no card",
    audienceSize: 42_180,
    startAt: "2026-05-12T10:00:00Z",
    endAt: "2026-05-14T23:59:59Z",
    title: "Your wallet deserves a card",
    body: "Order a Naira virtual card in 60 seconds and start spending anywhere online.",
    ctaLabel: "Order a card",
    sent: 0,
    delivered: 0,
    opened: 0,
    clicked: 0,
    converted: 0,
    ctaUrl: "/cards/order",
    linkedProgramId: "rp_003",
  },
  {
    id: "cmp_003",
    name: "eSIM travel banner — Lagos→London",
    channel: "login_banner",
    status: "live",
    audience: "International txn last 90d",
    audienceSize: 28_900,
    startAt: "2026-04-20T00:00:00Z",
    endAt: "2026-06-30T23:59:59Z",
    title: "Heading to the UK?",
    body: "Skip roaming bills — grab a UK eSIM bundle from ₦4,200.",
    ctaLabel: "See bundles",
    sent: 28_900,
    delivered: 28_900,
    opened: 14_201,
    clicked: 5_812,
    converted: 1_412,
    ctaUrl: "/esim/uk-roaming",
  },
  {
    id: "cmp_004",
    name: "Easter weekend free airtime",
    channel: "in_app_notification",
    status: "ended",
    audience: "All active users",
    audienceSize: 312_400,
    startAt: "2026-04-04T08:00:00Z",
    endAt: "2026-04-07T23:59:59Z",
    title: "Free ₦200 airtime this weekend",
    body: "Use code EASTER on any airtime purchase ₦500+.",
    ctaLabel: "Buy airtime",
    sent: 312_400,
    delivered: 304_812,
    opened: 142_104,
    clicked: 41_204,
    converted: 12_802,
    ctaUrl: "/pay/airtime?promo=EASTER",
  },
  {
    id: "cmp_005",
    name: "Refer 3 friends — login banner",
    channel: "login_banner",
    status: "draft",
    audience: "Verified users · 0 referrals",
    audienceSize: 96_400,
    startAt: "2026-05-15T09:00:00Z",
    endAt: null,
    title: "Earn ₦1,500 per friend",
    body: "Share your code, get rewarded each time a friend tops up.",
    ctaLabel: "Invite friends",
    sent: 0,
    delivered: 0,
    opened: 0,
    clicked: 0,
    converted: 0,
    ctaUrl: "/referrals",
    linkedProgramId: "rp_001",
  },
];

export const newsletters: Newsletter[] = [
  {
    id: "nl_001",
    subject: "Payday week — 5% off every bill 💸",
    preheader: "Use code PAYDAY5 on airtime, data, electricity and more.",
    audience: "All verified users",
    audienceSize: 184_200,
    fromName: "BazePay",
    fromEmail: "hello@bazepay.com",
    status: "sent",
    scheduledAt: "2026-05-07T08:00:00Z",
    sentAt: "2026-05-07T08:02:14Z",
    sent: 184_200,
    delivered: 181_310,
    opened: 78_412,
    clicked: 14_802,
    unsubscribed: 412,
    bounced: 2_890,
    linkedPromoCode: "PAYDAY5",
    ctaUrl: "/pay?promo=PAYDAY5",
  },
  {
    id: "nl_002",
    subject: "Refer 3 friends, earn ₦4,500",
    preheader: "Your invite link is one tap away.",
    audience: "Verified users · 0 referrals",
    audienceSize: 96_400,
    fromName: "BazePay",
    fromEmail: "rewards@bazepay.com",
    status: "sending",
    scheduledAt: "2026-05-09T09:00:00Z",
    sentAt: null,
    sent: 38_120,
    delivered: 37_402,
    opened: 9_840,
    clicked: 2_104,
    unsubscribed: 84,
    bounced: 612,
    ctaUrl: "/referrals",
  },
  {
    id: "nl_003",
    subject: "We miss you — here's ₦1,000 to come back",
    preheader: "Reactivation credit, expires in 7 days.",
    audience: "No login 60+ days",
    audienceSize: 58_120,
    fromName: "BazePay",
    fromEmail: "hello@bazepay.com",
    status: "scheduled",
    scheduledAt: "2026-05-15T09:00:00Z",
    sentAt: null,
    sent: 0,
    delivered: 0,
    opened: 0,
    clicked: 0,
    unsubscribed: 0,
    bounced: 0,
    linkedPromoCode: "WELCOME1K",
    ctaUrl: "/wallet/topup?promo=WELCOME1K",
  },
  {
    id: "nl_004",
    subject: "May product update — new eSIM bundles",
    preheader: "UK, US and EU bundles starting from ₦4,200.",
    audience: "All users",
    audienceSize: 312_400,
    fromName: "BazePay Product",
    fromEmail: "product@bazepay.com",
    status: "draft",
    scheduledAt: null,
    sentAt: null,
    sent: 0,
    delivered: 0,
    opened: 0,
    clicked: 0,
    unsubscribed: 0,
    bounced: 0,
    ctaUrl: "/esim",
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
