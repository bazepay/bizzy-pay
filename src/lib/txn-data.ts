// Mock transactions for the global Transactions module. Will be replaced by Lovable Cloud.

import { users } from "./users-data";

export type TxnType =
  | "topup"
  | "transfer"
  | "airtime"
  | "data"
  | "electricity"
  | "tv"
  | "betting"
  | "card_spend"
  | "esim"
  | "number"
  | "refund"
  | "fee";

export type TxnStatus = "success" | "pending" | "failed" | "reversed" | "review";
export type TxnDirection = "in" | "out";
export type TxnChannel = "mobile" | "web" | "api" | "card";

export type GlobalTxn = {
  id: string;
  ref: string;
  type: TxnType;
  status: TxnStatus;
  direction: TxnDirection;
  amountNgn: number;
  feeNgn: number;
  currency: "NGN" | "USD" | "EUR" | "GBP" | "GHS";
  fxRate: number;
  amountForeign?: number;
  provider: string;
  channel: TxnChannel;
  user: { id: string; name: string; email: string };
  counterparty?: { name: string; account?: string; bank?: string };
  riskScore: number;
  flagged: boolean;
  device?: string;
  ip?: string;
  geo?: string;
  at: string;
  settledAt?: string;
  failureReason?: string;
};

const TYPES: TxnType[] = ["topup", "transfer", "airtime", "data", "electricity", "tv", "card_spend", "esim", "number", "refund", "fee", "betting"];
const PROVIDERS: Record<TxnType, string> = {
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
const COUNTERPARTY_BANKS = ["Wema Bank", "GTBank", "Access Bank", "UBA", "Zenith Bank", "Kuda", "OPay"];
const FAIL_REASONS = [
  "Insufficient funds at provider",
  "Provider timeout",
  "Beneficiary account not found",
  "Daily limit exceeded",
  "Velocity rule blocked",
];
const GEOS = ["Lagos, NG", "Abuja, NG", "Accra, GH", "Nairobi, KE", "London, UK", "New York, US"];

function seeded(i: number) {
  const x = Math.sin(i * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

function makeTxn(i: number): GlobalTxn {
  const r = seeded(i);
  const r2 = seeded(i + 7);
  const r3 = seeded(i + 19);
  const type = TYPES[i % TYPES.length];
  const status: TxnStatus =
    i % 47 === 0 ? "review" : i % 13 === 0 ? "failed" : i % 19 === 0 ? "pending" : i % 31 === 0 ? "reversed" : "success";
  const user = users[i % users.length];
  const direction: TxnDirection =
    type === "topup" || type === "refund" ? "in" : "out";
  const amount = Math.round((500 + r * 480_000) * (type === "card_spend" ? 1.6 : 1));
  const fee = Math.round(amount * (0.005 + r2 * 0.012));
  const flagged = status === "review" || (status === "failed" && r3 > 0.7);
  const at = new Date(Date.now() - i * 27 * 60_000 * (0.5 + r)).toISOString();
  return {
    id: `tx_${(910000 + i).toString()}`,
    ref: `BZP-${(100000 + i * 17).toString(36).toUpperCase()}`,
    type,
    status,
    direction,
    amountNgn: amount,
    feeNgn: fee,
    currency: "NGN",
    fxRate: 1,
    provider: PROVIDERS[type],
    channel: i % 4 === 0 ? "web" : i % 7 === 0 ? "api" : type === "card_spend" ? "card" : "mobile",
    user: { id: user.id, name: user.name, email: user.email },
    counterparty:
      type === "transfer"
        ? {
            name: ["John Adewale", "Mariam Bello", "Chuka Eze", "Zara Hassan", "Folake Bankole"][i % 5],
            account: "0" + String(Math.floor(100000000 + r * 899999999)).slice(0, 9),
            bank: COUNTERPARTY_BANKS[i % COUNTERPARTY_BANKS.length],
          }
        : type === "card_spend"
          ? { name: ["Spotify", "Netflix", "Amazon", "Apple", "Steam"][i % 5] }
          : undefined,
    riskScore: Math.round(r3 * 95) + 5,
    flagged,
    device: i % 4 === 0 ? "MacBook · Safari" : "iPhone 15 Pro · iOS 17",
    ip: `102.${Math.floor(r * 200)}.${Math.floor(r2 * 200)}.${Math.floor(r3 * 200)}`,
    geo: GEOS[i % GEOS.length],
    at,
    settledAt: status === "success" ? new Date(new Date(at).getTime() + 90_000).toISOString() : undefined,
    failureReason: status === "failed" ? FAIL_REASONS[i % FAIL_REASONS.length] : undefined,
  };
}

export const transactions: GlobalTxn[] = Array.from({ length: 220 }, (_, i) => makeTxn(i + 1));

export const getTxn = (id: string) => transactions.find((t) => t.id === id);

export const txnStatusTone: Record<TxnStatus, string> = {
  success: "bg-success/15 text-success border-success/30",
  pending: "bg-primary/10 text-primary border-primary/30",
  failed: "bg-destructive/10 text-destructive border-destructive/30",
  reversed: "bg-muted text-muted-foreground border-border",
  review: "bg-warning/20 text-warning-foreground border-warning/40",
};

export const txnStatusLabel: Record<TxnStatus, string> = {
  success: "Success",
  pending: "Pending",
  failed: "Failed",
  reversed: "Reversed",
  review: "In review",
};

export const txnTypeLabel = (t: TxnType) =>
  t.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
