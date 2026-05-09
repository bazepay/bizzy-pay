// Mock wallets / treasury dataset for the Wallets module.

import type { Currency } from "./mock-data";

export type FloatAccount = {
  currency: Currency;
  label: string;
  balance: number;
  pendingIn: number;
  pendingOut: number;
  reservedNgn: number;
  lastReconAt: string;
  provider: string;
  health: "ok" | "warn" | "break";
};

export const floatAccounts: FloatAccount[] = [
  {
    currency: "NGN", label: "NGN Operating Float", balance: 1_842_530_000, pendingIn: 38_400_000, pendingOut: 21_800_000,
    reservedNgn: 1_842_530_000, lastReconAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    provider: "Flutterwave / Paystack", health: "ok",
  },
  {
    currency: "USD", label: "USD Card Funding", balance: 412_840, pendingIn: 18_200, pendingOut: 9_400,
    reservedNgn: 638_902_000, lastReconAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    provider: "Marqeta", health: "ok",
  },
  {
    currency: "EUR", label: "EUR Travel Float", balance: 84_120, pendingIn: 2_100, pendingOut: 1_400,
    reservedNgn: 142_330_000, lastReconAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    provider: "Wise", health: "warn",
  },
];

// ---- FX ----
export type FxRate = {
  pair: string;            // e.g. NGN/USD
  rate: number;            // mid
  spread: number;          // bps
  source: string;
  effectiveAt: string;
  override: boolean;
};

export const fxRates: FxRate[] = [
  { pair: "USD/NGN", rate: 1547.20, spread: 75, source: "FMDQ feed", effectiveAt: new Date(Date.now() - 1000 * 60 * 8).toISOString(), override: false },
  { pair: "EUR/NGN", rate: 1692.40, spread: 90, source: "FMDQ feed", effectiveAt: new Date(Date.now() - 1000 * 60 * 8).toISOString(), override: false },
  { pair: "GBP/NGN", rate: 1981.55, spread: 100, source: "FMDQ feed", effectiveAt: new Date(Date.now() - 1000 * 60 * 8).toISOString(), override: false },
  { pair: "EUR/USD", rate: 1.0940, spread: 30, source: "OANDA", effectiveAt: new Date(Date.now() - 1000 * 60 * 22).toISOString(), override: true },
  { pair: "GBP/USD", rate: 1.2812, spread: 35, source: "OANDA", effectiveAt: new Date(Date.now() - 1000 * 60 * 22).toISOString(), override: false },
];

// ---- Payouts queue ----
export type PayoutStatus = "pending" | "approved" | "processing" | "paid" | "rejected" | "failed";

export type Payout = {
  id: string;
  user: { id: string; name: string; email: string };
  bank: string;
  account: string;
  accountName: string;
  nameMatch: number; // 0-100
  amountNgn: number;
  feeNgn: number;
  requestedAt: string;
  status: PayoutStatus;
  riskScore: number;
  needsDual: boolean;
};

const BANKS = ["GTBank", "Access Bank", "Zenith Bank", "UBA", "First Bank", "Kuda", "Opay", "Wema Bank"];

function seed(i: number) {
  let x = (i * 9301 + 49297) % 233280;
  return () => {
    x = (x * 9301 + 49297) % 233280;
    return x / 233280;
  };
}

export const payouts: Payout[] = Array.from({ length: 36 }).map((_, i) => {
  const r = seed(i + 5);
  const amount = Math.round((10_000 + r() * 4_990_000) / 100) * 100;
  const dual = amount >= 1_000_000;
  const statuses: PayoutStatus[] = ["pending", "pending", "pending", "approved", "processing", "paid", "paid", "rejected", "failed"];
  return {
    id: `po_${(700000 + i).toString()}`,
    user: {
      id: `u_${(100000 + (i * 7) % 220).toString()}`,
      name: ["Ada Okafor", "Tunde Bello", "Ngozi Eze", "Aisha Mohammed", "Femi Adeyemi", "Zainab Hassan"][i % 6],
      email: `payout${i}@bazepay.test`,
    },
    bank: BANKS[Math.floor(r() * BANKS.length)],
    account: String(1000000000 + Math.floor(r() * 8999999999)).slice(0, 10),
    accountName: ["ADA OKAFOR", "TUNDE BELLO", "NGOZI EZE", "AISHA MOHAMMED", "FEMI ADEYEMI", "ZAINAB HASSAN"][i % 6],
    nameMatch: 60 + Math.floor(r() * 40),
    amountNgn: amount,
    feeNgn: Math.max(50, Math.round(amount * 0.0015)),
    requestedAt: new Date(Date.now() - i * 1000 * 60 * 17).toISOString(),
    status: statuses[i % statuses.length],
    riskScore: Math.floor(r() * 100),
    needsDual: dual,
  };
});

export const payoutStatusLabel: Record<PayoutStatus, string> = {
  pending: "Pending", approved: "Approved", processing: "Processing",
  paid: "Paid", rejected: "Rejected", failed: "Failed",
};

export const payoutStatusTone: Record<PayoutStatus, string> = {
  pending: "bg-warning/15 text-warning border-warning/30",
  approved: "bg-primary/15 text-primary border-primary/30",
  processing: "bg-primary/15 text-primary border-primary/30",
  paid: "bg-success/15 text-success border-success/30",
  rejected: "bg-muted text-muted-foreground border-border",
  failed: "bg-destructive/15 text-destructive border-destructive/30",
};

// ---- Top-up reconciliation ----
export type TopupStatus = "matched" | "unmatched" | "investigating" | "duplicate";

export type Topup = {
  id: string;
  provider: "Flutterwave" | "Paystack" | "Interswitch";
  reference: string;
  user?: { id: string; name: string };
  amountNgn: number;
  feeNgn: number;
  receivedAt: string;
  status: TopupStatus;
  settlementBatch: string;
};

export const topups: Topup[] = Array.from({ length: 42 }).map((_, i) => {
  const r = seed(i + 11);
  const providers: Topup["provider"][] = ["Flutterwave", "Paystack", "Interswitch"];
  const amount = Math.round((1_000 + r() * 999_000) / 100) * 100;
  const statuses: TopupStatus[] = ["matched", "matched", "matched", "matched", "unmatched", "investigating", "duplicate"];
  const status = statuses[i % statuses.length];
  return {
    id: `tp_${(800000 + i).toString()}`,
    provider: providers[i % providers.length],
    reference: `RFR-${(900000 + i * 13).toString()}`,
    user: status === "unmatched" ? undefined : {
      id: `u_${(100000 + (i * 11) % 220).toString()}`,
      name: ["Ada Okafor", "Tunde Bello", "Ngozi Eze", "Aisha Mohammed", "Femi Adeyemi"][i % 5],
    },
    amountNgn: amount,
    feeNgn: Math.round(amount * 0.014),
    receivedAt: new Date(Date.now() - i * 1000 * 60 * 23).toISOString(),
    status,
    settlementBatch: `BTH-${new Date(Date.now() - i * 1000 * 60 * 23).toISOString().slice(0, 10)}`,
  };
});

export const topupStatusTone: Record<TopupStatus, string> = {
  matched: "bg-success/15 text-success border-success/30",
  unmatched: "bg-warning/15 text-warning border-warning/30",
  investigating: "bg-primary/15 text-primary border-primary/30",
  duplicate: "bg-destructive/15 text-destructive border-destructive/30",
};

export const topupStatusLabel: Record<TopupStatus, string> = {
  matched: "Matched", unmatched: "Unmatched", investigating: "Investigating", duplicate: "Duplicate",
};
