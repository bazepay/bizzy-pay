// Mock content data for the admin Content module.
// Deterministic for stable SSR. NGN-only context.

export type ArticleStatus = "draft" | "scheduled" | "published" | "archived";
export type ArticleCategory = "Product" | "Announcements" | "Education" | "Compliance" | "Engineering";

export type Article = {
  id: string;
  title: string;
  slug: string;
  category: ArticleCategory;
  status: ArticleStatus;
  author: string;
  excerpt: string;
  body: string;
  coverColor: string; // tailwind gradient classes
  tags: string[];
  views: number;
  publishedAt: string | null;
  updatedAt: string;
};

export type BannerPlacement = "home" | "wallet" | "cards" | "transactions" | "global";
export type BannerStatus = "draft" | "scheduled" | "live" | "ended";
export type BannerTone = "info" | "success" | "warning" | "promo" | "critical";

export type Banner = {
  id: string;
  title: string;
  message: string;
  ctaLabel: string | null;
  ctaUrl: string | null;
  placement: BannerPlacement;
  audience: "all" | "tier1" | "tier2" | "tier2_plus" | "card_holders";
  tone: BannerTone;
  status: BannerStatus;
  startsAt: string;
  endsAt: string | null;
  impressions: number;
  clicks: number;
  updatedAt: string;
};

export type Faq = {
  id: string;
  question: string;
  answer: string;
  category: "Account" | "Wallet" | "Cards" | "Bill Pay" | "Security" | "Compliance";
  status: "published" | "draft";
  helpful: number;
  notHelpful: number;
  updatedAt: string;
};

export type LegalDoc = {
  id: string;
  name: string;
  type: "terms" | "privacy" | "card_terms" | "aup" | "fees";
  version: string;
  status: "active" | "draft" | "superseded";
  effectiveAt: string;
  updatedAt: string;
  changelog: string;
  body: string;
};

const AUTHORS = ["Aisha O.", "Tunde A.", "Kemi B.", "David L.", "Joy E.", "Priya M."];
const COVERS = [
  "from-primary/40 via-primary/20 to-transparent",
  "from-warning/40 via-warning/20 to-transparent",
  "from-success/40 via-success/20 to-transparent",
  "from-orange-500/40 via-orange-500/20 to-transparent",
  "from-destructive/30 via-destructive/15 to-transparent",
  "from-purple-500/40 via-purple-500/20 to-transparent",
];

function pad(n: number, w = 6) { return String(n).padStart(w, "0"); }

const ARTICLE_SEEDS: { title: string; cat: ArticleCategory; status: ArticleStatus; tags: string[]; excerpt: string; body: string }[] = [
  {
    title: "Introducing instant ₦ payouts to all Nigerian banks",
    cat: "Announcements", status: "published",
    tags: ["payouts", "wallet"],
    excerpt: "Send money to any of 24 supported banks in under 30 seconds, 24/7.",
    body: "We've upgraded the payout rails to deliver near-instant settlement across NIBSS-connected banks. All ₦ transfers from your BazePay wallet now clear in under 30 seconds, including weekends and public holidays.\n\nNo extra fees. No setup. It just works.",
  },
  {
    title: "How to spot a scam before it costs you",
    cat: "Education", status: "published",
    tags: ["safety", "fraud"],
    excerpt: "Five red flags every BazePay user should know — and what to do when you see them.",
    body: "Fraudsters are getting smarter. Here are five patterns we see repeatedly:\n\n1. Urgency: 'send now or your account closes'.\n2. Unusual channels: WhatsApp DMs claiming to be support.\n3. Requests for OTPs or PINs.\n4. Too-good-to-be-true investment offers.\n5. Pressure to install screen-sharing apps.\n\nWhen in doubt, hang up and contact us through the app.",
  },
  {
    title: "BazePay Card: now with FX-free spending up to ₦200,000/month",
    cat: "Product", status: "published",
    tags: ["cards", "fx"],
    excerpt: "Verified Tier-2 customers get a free FX allowance every month on cross-border auths.",
    body: "Starting this month, every Tier-2 verified customer gets ₦200,000 of FX-free spending per calendar month on their BazePay Naira card. Beyond the allowance the standard 1.5% markup applies.",
  },
  {
    title: "What changed in our AML monitoring this quarter",
    cat: "Compliance", status: "published",
    tags: ["aml", "compliance"],
    excerpt: "Tighter structuring detection, faster sanctions screening, and clearer dispute timelines.",
    body: "We rolled out v4.1 of our structuring detection rule, reducing false positives by ~38% while increasing true-positive recall. Sanctions screening now runs inline at txn submit instead of post-settlement.",
  },
  {
    title: "Behind the scenes: how we keep p99 latency under 250ms",
    cat: "Engineering", status: "published",
    tags: ["engineering", "performance"],
    excerpt: "A look at our edge architecture and the trade-offs we made.",
    body: "Most of our reads are served from the edge with a 60-second SWR window. Writes go through a single regional primary in Lagos with async replication. The result: a p99 of 230ms for reads and 410ms for writes.",
  },
  {
    title: "Bill Pay now supports 9mobile data bundles",
    cat: "Product", status: "scheduled",
    tags: ["bill-pay"],
    excerpt: "All four major networks now covered, with cashback on first purchase.",
    body: "Top up data bundles for MTN, Airtel, Glo and now 9mobile, directly from your wallet. First-time bundle buyers get 2% cashback up to ₦500.",
  },
  {
    title: "Tier-3 verification rolls out next week",
    cat: "Announcements", status: "draft",
    tags: ["kyc"],
    excerpt: "Higher limits, custodial vault access, and priority support for verified power users.",
    body: "Coming soon: Tier-3 verification with ₦100M monthly throughput, vault access, and 1-on-1 priority support.",
  },
  {
    title: "Why we removed the multi-currency wallet (and what's better)",
    cat: "Announcements", status: "archived",
    tags: ["wallet"],
    excerpt: "Naira-only wallets with FX-on-demand are simpler, cheaper, and safer.",
    body: "We've consolidated all balances back to NGN. FX is now settled at point of use with transparent markup, removing surprise currency conversions.",
  },
];

export const articles: Article[] = ARTICLE_SEEDS.map((s, i) => ({
  id: `art_${pad(310000 + i)}`,
  title: s.title,
  slug: s.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60),
  category: s.cat,
  status: s.status,
  author: AUTHORS[i % AUTHORS.length],
  excerpt: s.excerpt,
  body: s.body,
  coverColor: COVERS[i % COVERS.length],
  tags: s.tags,
  views: s.status === "published" ? 1200 + ((i * 877) % 18000) : 0,
  publishedAt: s.status === "published" ? new Date(Date.now() - (i * 3 + 2) * 86400_000).toISOString() : null,
  updatedAt: new Date(Date.now() - (i + 1) * 36 * 3600_000).toISOString(),
}));

export const banners: Banner[] = [
  {
    id: "ban_440001",
    title: "Free FX weekend",
    message: "0% FX markup on all card spend this weekend. Up to ₦100,000.",
    ctaLabel: "Spend now", ctaUrl: "/cards",
    placement: "home", audience: "card_holders", tone: "promo", status: "live",
    startsAt: new Date(Date.now() - 1 * 86400_000).toISOString(),
    endsAt: new Date(Date.now() + 2 * 86400_000).toISOString(),
    impressions: 48210, clicks: 6189,
    updatedAt: new Date(Date.now() - 6 * 3600_000).toISOString(),
  },
  {
    id: "ban_440002",
    title: "Scheduled maintenance",
    message: "Card top-ups will be unavailable Sunday 2:00–3:00 AM WAT.",
    ctaLabel: null, ctaUrl: null,
    placement: "wallet", audience: "all", tone: "warning", status: "scheduled",
    startsAt: new Date(Date.now() + 2 * 86400_000).toISOString(),
    endsAt: new Date(Date.now() + 2.05 * 86400_000).toISOString(),
    impressions: 0, clicks: 0,
    updatedAt: new Date(Date.now() - 12 * 3600_000).toISOString(),
  },
  {
    id: "ban_440003",
    title: "Verify your identity",
    message: "Tier-2 verification unlocks ₦5M daily limits and the BazePay card.",
    ctaLabel: "Start verification", ctaUrl: "/kyc",
    placement: "global", audience: "tier1", tone: "info", status: "live",
    startsAt: new Date(Date.now() - 14 * 86400_000).toISOString(),
    endsAt: null,
    impressions: 312044, clicks: 18927,
    updatedAt: new Date(Date.now() - 36 * 3600_000).toISOString(),
  },
  {
    id: "ban_440004",
    title: "New: 9mobile data bundles",
    message: "Top up 9mobile data right from your wallet. Live now.",
    ctaLabel: "Try it", ctaUrl: "/pay",
    placement: "home", audience: "all", tone: "success", status: "live",
    startsAt: new Date(Date.now() - 3 * 86400_000).toISOString(),
    endsAt: new Date(Date.now() + 14 * 86400_000).toISOString(),
    impressions: 88412, clicks: 11023,
    updatedAt: new Date(Date.now() - 18 * 3600_000).toISOString(),
  },
  {
    id: "ban_440005",
    title: "Suspicious login alert",
    message: "We detected a login from a new device. Review and confirm.",
    ctaLabel: "Review", ctaUrl: "/settings",
    placement: "global", audience: "all", tone: "critical", status: "draft",
    startsAt: new Date(Date.now() + 5 * 86400_000).toISOString(),
    endsAt: null,
    impressions: 0, clicks: 0,
    updatedAt: new Date(Date.now() - 4 * 3600_000).toISOString(),
  },
  {
    id: "ban_440006",
    title: "Refer-a-friend bonus",
    message: "Get ₦1,000 for every friend that funds their wallet.",
    ctaLabel: "Invite", ctaUrl: "/referrals",
    placement: "home", audience: "tier2_plus", tone: "promo", status: "ended",
    startsAt: new Date(Date.now() - 60 * 86400_000).toISOString(),
    endsAt: new Date(Date.now() - 30 * 86400_000).toISOString(),
    impressions: 612330, clicks: 92187,
    updatedAt: new Date(Date.now() - 30 * 86400_000).toISOString(),
  },
];

export const faqs: Faq[] = [
  { id: "faq_001", question: "How long do bank transfers take?", answer: "Transfers to Nigerian banks settle in under 30 seconds, 24/7, including weekends and public holidays.", category: "Wallet", status: "published", helpful: 412, notHelpful: 9, updatedAt: new Date(Date.now() - 4 * 86400_000).toISOString() },
  { id: "faq_002", question: "What are the BazePay card limits?", answer: "Tier-2 verified users have a ₦5,000,000 daily spend limit and ₦25,000,000 monthly. Tier-1 users have ₦300,000 daily.", category: "Cards", status: "published", helpful: 388, notHelpful: 14, updatedAt: new Date(Date.now() - 7 * 86400_000).toISOString() },
  { id: "faq_003", question: "How do I verify my identity?", answer: "Open the app, go to Settings → Verification, and submit your BVN, ID document, and a selfie. Most verifications complete within 5 minutes.", category: "Account", status: "published", helpful: 521, notHelpful: 22, updatedAt: new Date(Date.now() - 12 * 86400_000).toISOString() },
  { id: "faq_004", question: "Why was my card transaction declined?", answer: "Common causes: insufficient balance, exceeded daily limit, merchant in a restricted category, or an active AML alert on your account. Check Notifications for the exact reason.", category: "Cards", status: "published", helpful: 287, notHelpful: 31, updatedAt: new Date(Date.now() - 9 * 86400_000).toISOString() },
  { id: "faq_005", question: "How do I freeze my card?", answer: "In the app, tap your card → Freeze. You can unfreeze it the same way. Freezing is instant and blocks all auths.", category: "Security", status: "published", helpful: 198, notHelpful: 4, updatedAt: new Date(Date.now() - 15 * 86400_000).toISOString() },
  { id: "faq_006", question: "What is the FX markup on cross-border spend?", answer: "1.5% above the Visa wholesale rate. Tier-2 users get the first ₦200,000 per month FX-free.", category: "Cards", status: "published", helpful: 164, notHelpful: 12, updatedAt: new Date(Date.now() - 5 * 86400_000).toISOString() },
  { id: "faq_007", question: "Can I pay bills outside Nigeria?", answer: "Bill Pay currently supports Nigerian electricity, cable TV, mobile airtime and data, and select government services.", category: "Bill Pay", status: "published", helpful: 92, notHelpful: 18, updatedAt: new Date(Date.now() - 20 * 86400_000).toISOString() },
  { id: "faq_008", question: "How do I report suspicious activity?", answer: "Use the in-app 'Report fraud' option or email security@bazepay.ng. We respond within 30 minutes during business hours.", category: "Security", status: "published", helpful: 211, notHelpful: 6, updatedAt: new Date(Date.now() - 11 * 86400_000).toISOString() },
  { id: "faq_009", question: "Why is my transaction under review?", answer: "Some transactions trigger automated AML checks. Most clear within 15 minutes. If we need additional documents we'll notify you in-app.", category: "Compliance", status: "published", helpful: 145, notHelpful: 27, updatedAt: new Date(Date.now() - 8 * 86400_000).toISOString() },
  { id: "faq_010", question: "How do I close my BazePay account?", answer: "Settings → Account → Close account. Withdraw your balance first. Account closure is permanent and takes 24 hours.", category: "Account", status: "draft", helpful: 0, notHelpful: 0, updatedAt: new Date(Date.now() - 1 * 86400_000).toISOString() },
];

const LEGAL_BODIES: Record<LegalDoc["type"], string> = {
  terms: "1. Acceptance of Terms\nBy creating a BazePay account you agree to these Terms of Service.\n\n2. Eligibility\nYou must be 18+ and a Nigerian resident with a valid BVN.\n\n3. Wallet & Transactions\nAll wallets are denominated in Nigerian Naira (NGN). Transfers settle via NIBSS.\n\n4. Disputes\nDisputes must be raised within 21 days of the transaction. We respond within 5 business days.\n\n5. Termination\nWe may suspend accounts that breach these terms or our Acceptable Use Policy.",
  privacy: "1. Data we collect\nIdentity (name, BVN, ID), device info, transaction metadata, and support communications.\n\n2. How we use it\nTo provide the service, comply with CBN/NFIU rules, prevent fraud, and improve the product.\n\n3. Retention\nKYC records: 7 years post-closure (regulatory). Device IDs: 24 months rolling.\n\n4. Your rights\nAccess, correction, export, and deletion (subject to regulatory holds).",
  card_terms: "1. Card Issuance\nThe BazePay Card is a Naira-denominated debit card issued by our partner bank.\n\n2. Limits\nTier-2: ₦5M daily / ₦25M monthly. Tier-1: ₦300K daily.\n\n3. FX\nCross-border auths convert at Visa wholesale + 1.5% markup. Tier-2 gets ₦200K/month FX-free.\n\n4. Liability\nReport lost/stolen cards immediately. Liability is capped at ₦10,000 if reported within 24 hours.",
  aup: "Prohibited uses include:\n- Money laundering, terrorism financing, sanctions evasion\n- Gambling outside licensed Nigerian operators\n- Adult content, weapons, controlled substances\n- Pyramid schemes, unlicensed investment products\n- Crypto on/off-ramping outside approved partners\n\nViolations result in immediate account suspension and SAR filing where applicable.",
  fees: "Wallet\n- Bank transfer (out): ₦25 flat\n- Wallet-to-wallet: free\n\nCard\n- Issuance: ₦1,500 (one-time)\n- Local POS/online: free\n- Cross-border FX markup: 1.5% (Tier-2: first ₦200K/month free)\n- ATM withdrawal abroad: ₦1,200 + 1.5%\n\nBill Pay\n- Convenience fee: ₦25 per bill",
};

export const legalDocs: LegalDoc[] = [
  { id: "leg_001", name: "Terms of Service", type: "terms", version: "v5.2", status: "active", effectiveAt: new Date(Date.now() - 30 * 86400_000).toISOString(), updatedAt: new Date(Date.now() - 30 * 86400_000).toISOString(), changelog: "Clarified dispute resolution timeline (30 → 21 days).", body: LEGAL_BODIES.terms },
  { id: "leg_002", name: "Terms of Service", type: "terms", version: "v5.1", status: "superseded", effectiveAt: new Date(Date.now() - 120 * 86400_000).toISOString(), updatedAt: new Date(Date.now() - 120 * 86400_000).toISOString(), changelog: "Updated arbitration clause.", body: LEGAL_BODIES.terms },
  { id: "leg_003", name: "Privacy Policy", type: "privacy", version: "v3.4", status: "active", effectiveAt: new Date(Date.now() - 45 * 86400_000).toISOString(), updatedAt: new Date(Date.now() - 45 * 86400_000).toISOString(), changelog: "Added device-ID retention disclosure.", body: LEGAL_BODIES.privacy },
  { id: "leg_004", name: "Card Cardholder Agreement", type: "card_terms", version: "v2.0", status: "active", effectiveAt: new Date(Date.now() - 60 * 86400_000).toISOString(), updatedAt: new Date(Date.now() - 60 * 86400_000).toISOString(), changelog: "FX-free monthly allowance for Tier-2.", body: LEGAL_BODIES.card_terms },
  { id: "leg_005", name: "Acceptable Use Policy", type: "aup", version: "v1.3", status: "active", effectiveAt: new Date(Date.now() - 90 * 86400_000).toISOString(), updatedAt: new Date(Date.now() - 90 * 86400_000).toISOString(), changelog: "Expanded list of prohibited merchant categories.", body: LEGAL_BODIES.aup },
  { id: "leg_006", name: "Fees Schedule", type: "fees", version: "v4.0", status: "draft", effectiveAt: new Date(Date.now() + 14 * 86400_000).toISOString(), updatedAt: new Date(Date.now() - 2 * 86400_000).toISOString(), changelog: "Reduced bill-pay convenience fee from ₦50 to ₦25.", body: LEGAL_BODIES.fees },
];

// Where each legal doc type is surfaced in the BazePay apps/site.
export const legalSurfaces: Record<LegalDoc["type"], { label: string; where: string }[]> = {
  terms: [
    { label: "Sign-up screen", where: "Mobile app · 'I agree to the Terms' checkbox links here" },
    { label: "Settings → Legal", where: "Mobile + web app, always shows the active version" },
    { label: "Marketing site footer", where: "bazepay.ng/legal/terms" },
    { label: "Re-consent modal", where: "Forced acknowledgment when a new version activates" },
  ],
  privacy: [
    { label: "Sign-up screen", where: "Linked next to the Terms checkbox" },
    { label: "Settings → Privacy", where: "Mobile + web app" },
    { label: "Marketing site footer", where: "bazepay.ng/legal/privacy" },
    { label: "Cookie banner", where: "Web app — link to full policy" },
  ],
  card_terms: [
    { label: "Card activation flow", where: "Shown before user confirms first card issuance" },
    { label: "Card details screen", where: "Mobile app · 'Cardholder Agreement' link" },
    { label: "Marketing site", where: "bazepay.ng/cards (footnote link)" },
  ],
  aup: [
    { label: "Settings → Legal", where: "Mobile + web app" },
    { label: "Suspension notice email", where: "Linked when an account action references a violation" },
    { label: "Marketing site footer", where: "bazepay.ng/legal/acceptable-use" },
  ],
  fees: [
    { label: "Wallet · Send money screen", where: "Inline fee preview links to full schedule" },
    { label: "Card details screen", where: "FX markup section links here" },
    { label: "Settings → Fees", where: "Mobile + web app" },
    { label: "Marketing site", where: "bazepay.ng/pricing" },
  ],
};

// ---- formatters / labels ----

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

export const articleStatusTone: Record<ArticleStatus, string> = {
  draft: "border-muted-foreground/30 text-muted-foreground",
  scheduled: "border-warning/40 text-warning",
  published: "border-success/40 text-success",
  archived: "border-destructive/40 text-destructive",
};

export const bannerStatusTone: Record<BannerStatus, string> = {
  draft: "border-muted-foreground/30 text-muted-foreground",
  scheduled: "border-warning/40 text-warning",
  live: "border-success/40 text-success",
  ended: "border-muted-foreground/30 text-muted-foreground/70",
};

export const bannerToneStyle: Record<BannerTone, string> = {
  info: "bg-primary/10 border-primary/30 text-primary",
  success: "bg-success/10 border-success/30 text-success",
  warning: "bg-warning/10 border-warning/30 text-warning",
  promo: "bg-gradient-to-r from-primary/15 to-warning/15 border-primary/30 text-foreground",
  critical: "bg-destructive/10 border-destructive/30 text-destructive",
};

export const legalStatusTone: Record<LegalDoc["status"], string> = {
  active: "border-success/40 text-success",
  draft: "border-warning/40 text-warning",
  superseded: "border-muted-foreground/30 text-muted-foreground",
};

export const legalTypeLabel: Record<LegalDoc["type"], string> = {
  terms: "Terms of Service",
  privacy: "Privacy",
  card_terms: "Card terms",
  aup: "Acceptable Use",
  fees: "Fees schedule",
};
