// Payment Providers / Gateway routing — NGN-only. Mirrors how Bill Pay, Wallet
// top-ups and Card programs connect to upstream payment processors.

export type ProviderId =
  | "flutterwave"
  | "paystack"
  | "interswitch"
  | "monnify"
  | "vtpass"
  | "providus"
  | "stripe_inbound";

export type ProviderKind = "card_acquirer" | "bank_transfer" | "ussd" | "biller_aggregator" | "fx_inbound";
export type ProviderStatus = "live" | "degraded" | "down" | "sandbox" | "disabled";
export type Environment = "production" | "sandbox";

export type Provider = {
  id: ProviderId;
  name: string;
  kind: ProviderKind;
  status: ProviderStatus;
  env: Environment;
  color: string;
  logo: string; // emoji fallback
  baseUrl: string;
  successRate: number; // %
  authRate: number; // %
  latencyMs: number;
  volumeNgn24h: number;
  txnCount24h: number;
  feeBps: number; // basis points charged by processor
  feeCapNgn: number; // 0 = uncapped
  flatFeeNgn: number;
  supports: string[]; // capability tags
  webhookUrl: string;
  webhookSecretHint: string; // last 4
  lastCallback: string; // ISO
  enabledFor: Array<"wallet_topup" | "card_funding" | "bills" | "payouts">;
};

export type RoutingRule = {
  id: string;
  product: "wallet_topup" | "card_funding" | "bills_airtime" | "bills_data" | "bills_electricity" | "bills_tv" | "bills_betting" | "payouts_bank";
  primary: ProviderId;
  fallback: ProviderId | null;
  minNgn: number;
  maxNgn: number;
  enabled: boolean;
  weight: number; // % of traffic when split
  notes?: string;
};

export type Settlement = {
  id: string;
  provider: ProviderId;
  date: string;
  grossNgn: number;
  feesNgn: number;
  refundsNgn: number;
  chargebacksNgn: number;
  netNgn: number;
  bankRef: string;
  status: "pending" | "settled" | "delayed";
};

export type WebhookEvent = {
  id: string;
  provider: ProviderId;
  event: string;
  receivedAt: string;
  status: "delivered" | "retrying" | "failed";
  attempts: number;
  responseMs: number;
  payloadRef: string;
};

export const fmtNgn = (n: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);

export const providerStatusTone: Record<ProviderStatus, string> = {
  live: "bg-success/15 text-success border-success/30",
  degraded: "bg-warning/15 text-warning border-warning/30",
  down: "bg-destructive/15 text-destructive border-destructive/30",
  sandbox: "bg-primary/10 text-primary border-primary/30",
  disabled: "bg-muted text-muted-foreground border-border",
};

export const providerKindLabel: Record<ProviderKind, string> = {
  card_acquirer: "Card acquirer",
  bank_transfer: "Bank transfer",
  ussd: "USSD",
  biller_aggregator: "Biller aggregator",
  fx_inbound: "FX inbound",
};

export const providers: Provider[] = [
  {
    id: "flutterwave",
    name: "Flutterwave",
    kind: "card_acquirer",
    status: "live",
    env: "production",
    color: "#F5A623",
    logo: "🪶",
    baseUrl: "https://api.flutterwave.com/v3",
    successRate: 98.7,
    authRate: 96.4,
    latencyMs: 612,
    volumeNgn24h: 184_500_000,
    txnCount24h: 12_842,
    feeBps: 140,
    feeCapNgn: 2000,
    flatFeeNgn: 0,
    supports: ["Visa", "Mastercard", "Verve", "USSD", "Bank Transfer"],
    webhookUrl: "https://api.bazepay.ng/webhooks/flutterwave",
    webhookSecretHint: "••• a82c",
    lastCallback: new Date(Date.now() - 22_000).toISOString(),
    enabledFor: ["wallet_topup", "card_funding", "bills"],
  },
  {
    id: "paystack",
    name: "Paystack",
    kind: "card_acquirer",
    status: "live",
    env: "production",
    color: "#00C3F7",
    logo: "💳",
    baseUrl: "https://api.paystack.co",
    successRate: 99.1,
    authRate: 97.2,
    latencyMs: 488,
    volumeNgn24h: 142_300_000,
    txnCount24h: 9_640,
    feeBps: 150,
    feeCapNgn: 2000,
    flatFeeNgn: 0,
    supports: ["Visa", "Mastercard", "Verve", "Bank Transfer", "Apple Pay"],
    webhookUrl: "https://api.bazepay.ng/webhooks/paystack",
    webhookSecretHint: "••• 1f20",
    lastCallback: new Date(Date.now() - 14_000).toISOString(),
    enabledFor: ["wallet_topup", "card_funding"],
  },
  {
    id: "monnify",
    name: "Monnify",
    kind: "bank_transfer",
    status: "live",
    env: "production",
    color: "#0D47A1",
    logo: "🏦",
    baseUrl: "https://api.monnify.com/api/v2",
    successRate: 99.4,
    authRate: 99.4,
    latencyMs: 280,
    volumeNgn24h: 96_700_000,
    txnCount24h: 6_212,
    feeBps: 50,
    feeCapNgn: 200,
    flatFeeNgn: 0,
    supports: ["Reserved Accounts", "Bank Transfer"],
    webhookUrl: "https://api.bazepay.ng/webhooks/monnify",
    webhookSecretHint: "••• 7e91",
    lastCallback: new Date(Date.now() - 8_000).toISOString(),
    enabledFor: ["wallet_topup"],
  },
  {
    id: "providus",
    name: "Providus Bank",
    kind: "bank_transfer",
    status: "degraded",
    env: "production",
    color: "#1B5E20",
    logo: "🏛️",
    baseUrl: "https://api.providusbank.com/v1",
    successRate: 92.1,
    authRate: 92.1,
    latencyMs: 1_180,
    volumeNgn24h: 28_400_000,
    txnCount24h: 1_842,
    feeBps: 25,
    feeCapNgn: 100,
    flatFeeNgn: 0,
    supports: ["Reserved Accounts", "NIBSS"],
    webhookUrl: "https://api.bazepay.ng/webhooks/providus",
    webhookSecretHint: "••• 4d3b",
    lastCallback: new Date(Date.now() - 6 * 60_000).toISOString(),
    enabledFor: ["wallet_topup", "payouts"],
  },
  {
    id: "interswitch",
    name: "Interswitch",
    kind: "card_acquirer",
    status: "live",
    env: "production",
    color: "#1976D2",
    logo: "🔁",
    baseUrl: "https://qa.interswitchng.com/api",
    successRate: 97.8,
    authRate: 95.1,
    latencyMs: 740,
    volumeNgn24h: 48_900_000,
    txnCount24h: 3_104,
    feeBps: 125,
    feeCapNgn: 2000,
    flatFeeNgn: 0,
    supports: ["Verve", "Quickteller", "Bills"],
    webhookUrl: "https://api.bazepay.ng/webhooks/interswitch",
    webhookSecretHint: "••• 9a01",
    lastCallback: new Date(Date.now() - 90_000).toISOString(),
    enabledFor: ["card_funding", "bills"],
  },
  {
    id: "vtpass",
    name: "VTpass",
    kind: "biller_aggregator",
    status: "live",
    env: "production",
    color: "#E53935",
    logo: "📡",
    baseUrl: "https://vtpass.com/api",
    successRate: 98.3,
    authRate: 99.0,
    latencyMs: 920,
    volumeNgn24h: 64_200_000,
    txnCount24h: 7_318,
    feeBps: 0,
    feeCapNgn: 0,
    flatFeeNgn: 50,
    supports: ["Airtime", "Data", "TV", "Electricity", "Education"],
    webhookUrl: "https://api.bazepay.ng/webhooks/vtpass",
    webhookSecretHint: "••• c714",
    lastCallback: new Date(Date.now() - 32_000).toISOString(),
    enabledFor: ["bills"],
  },
  {
    id: "stripe_inbound",
    name: "Stripe (FX Inbound)",
    kind: "fx_inbound",
    status: "sandbox",
    env: "sandbox",
    color: "#635BFF",
    logo: "💠",
    baseUrl: "https://api.stripe.com/v1",
    successRate: 99.6,
    authRate: 98.9,
    latencyMs: 410,
    volumeNgn24h: 0,
    txnCount24h: 0,
    feeBps: 290,
    feeCapNgn: 0,
    flatFeeNgn: 50,
    supports: ["USD inbound", "Cards", "Apple Pay"],
    webhookUrl: "https://api.bazepay.ng/webhooks/stripe",
    webhookSecretHint: "••• 0ab2",
    lastCallback: new Date(Date.now() - 4 * 3600_000).toISOString(),
    enabledFor: [],
  },
];

export const routingRules: RoutingRule[] = [
  { id: "rt_001", product: "wallet_topup", primary: "monnify", fallback: "providus", minNgn: 0, maxNgn: 5_000_000, enabled: true, weight: 70, notes: "Reserved-account first; Providus on degraded fallback." },
  { id: "rt_002", product: "wallet_topup", primary: "paystack", fallback: "flutterwave", minNgn: 0, maxNgn: 1_000_000, enabled: true, weight: 30, notes: "Card top-ups." },
  { id: "rt_003", product: "card_funding", primary: "paystack", fallback: "flutterwave", minNgn: 100, maxNgn: 2_000_000, enabled: true, weight: 60 },
  { id: "rt_004", product: "card_funding", primary: "flutterwave", fallback: "interswitch", minNgn: 100, maxNgn: 2_000_000, enabled: true, weight: 40 },
  { id: "rt_005", product: "bills_airtime", primary: "vtpass", fallback: "flutterwave", minNgn: 50, maxNgn: 50_000, enabled: true, weight: 100 },
  { id: "rt_006", product: "bills_data", primary: "vtpass", fallback: "flutterwave", minNgn: 100, maxNgn: 50_000, enabled: true, weight: 100 },
  { id: "rt_007", product: "bills_electricity", primary: "vtpass", fallback: "interswitch", minNgn: 500, maxNgn: 500_000, enabled: true, weight: 100 },
  { id: "rt_008", product: "bills_tv", primary: "vtpass", fallback: null, minNgn: 500, maxNgn: 100_000, enabled: true, weight: 100 },
  { id: "rt_009", product: "bills_betting", primary: "paystack", fallback: "flutterwave", minNgn: 100, maxNgn: 1_000_000, enabled: true, weight: 100 },
  { id: "rt_010", product: "payouts_bank", primary: "providus", fallback: null, minNgn: 100, maxNgn: 10_000_000, enabled: false, weight: 100, notes: "Disabled while Providus latency elevated." },
];

export const productLabel: Record<RoutingRule["product"], string> = {
  wallet_topup: "Wallet top-up",
  card_funding: "Card funding",
  bills_airtime: "Bills · Airtime",
  bills_data: "Bills · Data",
  bills_electricity: "Bills · Electricity",
  bills_tv: "Bills · TV",
  bills_betting: "Bills · Betting",
  payouts_bank: "Payouts · Bank",
};

export const settlements: Settlement[] = (() => {
  const out: Settlement[] = [];
  const provs: ProviderId[] = ["flutterwave", "paystack", "monnify", "providus", "interswitch", "vtpass"];
  const today = new Date();
  for (let d = 0; d < 14; d++) {
    const dt = new Date(today);
    dt.setDate(today.getDate() - d);
    provs.forEach((p, i) => {
      const seed = (d * 31 + i * 17) % 233280;
      const gross = 8_000_000 + (seed % 80) * 950_000;
      const fees = Math.round(gross * (p === "monnify" || p === "providus" ? 0.005 : 0.014));
      const refunds = Math.round(gross * 0.004);
      const cb = Math.round(gross * 0.0006);
      const status: Settlement["status"] = d === 0 ? "pending" : p === "providus" && d === 1 ? "delayed" : "settled";
      out.push({
        id: `stl_${dt.toISOString().slice(0, 10)}_${p}`,
        provider: p,
        date: dt.toISOString().slice(0, 10),
        grossNgn: gross,
        feesNgn: fees,
        refundsNgn: refunds,
        chargebacksNgn: cb,
        netNgn: gross - fees - refunds - cb,
        bankRef: `BNK-${dt.toISOString().slice(0, 10).replaceAll("-", "")}-${p.slice(0, 3).toUpperCase()}`,
        status,
      });
    });
  }
  return out;
})();

export const webhookEvents: WebhookEvent[] = (() => {
  const out: WebhookEvent[] = [];
  const evMap: Record<ProviderId, string[]> = {
    flutterwave: ["charge.completed", "transfer.completed", "subscription.cancelled"],
    paystack: ["charge.success", "transfer.success", "refund.processed", "invoice.payment_failed"],
    monnify: ["SUCCESSFUL_TRANSACTION", "FAILED_TRANSACTION"],
    providus: ["account.credited", "transfer.failed"],
    interswitch: ["payment.success", "payment.failed"],
    vtpass: ["transaction.success", "transaction.failed", "transaction.queued"],
    stripe_inbound: ["payment_intent.succeeded", "charge.refunded"],
  };
  const ids: ProviderId[] = ["flutterwave", "paystack", "monnify", "providus", "interswitch", "vtpass"];
  for (let i = 0; i < 80; i++) {
    const p = ids[i % ids.length];
    const events = evMap[p];
    const ev = events[i % events.length];
    const seed = (i * 9301 + 49297) % 233280;
    const roll = seed / 233280;
    const status: WebhookEvent["status"] = roll < 0.85 ? "delivered" : roll < 0.95 ? "retrying" : "failed";
    out.push({
      id: `wh_${String(540000 + i).slice(-6)}`,
      provider: p,
      event: ev,
      receivedAt: new Date(Date.now() - i * 7 * 60_000 - (i % 5) * 1100).toISOString(),
      status,
      attempts: status === "delivered" ? 1 : status === "retrying" ? 2 + (i % 3) : 5,
      responseMs: 80 + (seed % 900),
      payloadRef: `pl_${String(81000 + i).slice(-5)}`,
    });
  }
  return out;
})();

export const webhookStatusTone: Record<WebhookEvent["status"], string> = {
  delivered: "bg-success/15 text-success border-success/30",
  retrying: "bg-warning/15 text-warning border-warning/30",
  failed: "bg-destructive/15 text-destructive border-destructive/30",
};

export const settlementStatusTone: Record<Settlement["status"], string> = {
  settled: "bg-success/15 text-success border-success/30",
  pending: "bg-warning/15 text-warning border-warning/30",
  delayed: "bg-destructive/15 text-destructive border-destructive/30",
};
