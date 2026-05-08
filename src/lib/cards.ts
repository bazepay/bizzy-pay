export type CardCurrency = "NGN" | "USD" | "EUR";
export type CardBrand = "Visa" | "Mastercard";
export type CardStatus = "active" | "frozen" | "expired";

export type VirtualCard = {
  id: string;
  label: string;
  holder: string;
  brand: CardBrand;
  currency: CardCurrency;
  pan: string; // full 16-digit, masked in UI by default
  cvv: string;
  expiry: string; // MM/YY
  balanceUsd: number;
  monthlyLimitUsd: number;
  monthlySpentUsd: number;
  status: CardStatus;
  blockedCategories: string[]; // e.g., ["gambling", "crypto"]
  gradient: { from: string; to: string };
  createdAt: string;
};

export type CardTxn = {
  id: string;
  cardId: string;
  merchant: string;
  category: "subscriptions" | "shopping" | "food" | "travel" | "topup" | "refund";
  amountUsd: number; // negative = spend, positive = topup/refund
  at: string;
  status: "settled" | "pending" | "declined";
};

export const cards: VirtualCard[] = [
  {
    id: "vc-01",
    label: "Subscriptions",
    holder: "TUNDE OKE",
    brand: "Visa",
    currency: "USD",
    pan: "4539 8211 6094 2207",
    cvv: "318",
    expiry: "08/29",
    balanceUsd: 142.5,
    monthlyLimitUsd: 500,
    monthlySpentUsd: 187.4,
    status: "active",
    blockedCategories: ["gambling"],
    gradient: { from: "oklch(0.32 0.14 270)", to: "oklch(0.22 0.12 300)" },
    createdAt: "2026-01-12T10:14:00Z",
  },
  {
    id: "vc-02",
    label: "Travel",
    holder: "TUNDE OKE",
    brand: "Mastercard",
    currency: "USD",
    pan: "5412 7508 4493 1185",
    cvv: "742",
    expiry: "11/28",
    balanceUsd: 820.0,
    monthlyLimitUsd: 2000,
    monthlySpentUsd: 612.85,
    status: "active",
    blockedCategories: [],
    gradient: { from: "oklch(0.28 0.10 240)", to: "oklch(0.45 0.16 60)" },
    createdAt: "2026-02-04T09:02:00Z",
  },
  {
    id: "vc-03",
    label: "Shopping",
    holder: "TUNDE OKE",
    brand: "Visa",
    currency: "EUR",
    pan: "4716 0091 5523 8870",
    cvv: "204",
    expiry: "03/27",
    balanceUsd: 36.2,
    monthlyLimitUsd: 300,
    monthlySpentUsd: 264.0,
    status: "frozen",
    blockedCategories: ["gambling", "crypto"],
    gradient: { from: "oklch(0.30 0.08 200)", to: "oklch(0.20 0.06 260)" },
    createdAt: "2026-03-18T16:40:00Z",
  },
];

export const cardTxns: CardTxn[] = [
  { id: "ct1", cardId: "vc-01", merchant: "Netflix", category: "subscriptions", amountUsd: -15.49, at: "2026-05-07T08:42:00Z", status: "settled" },
  { id: "ct2", cardId: "vc-01", merchant: "Spotify", category: "subscriptions", amountUsd: -10.99, at: "2026-05-04T11:00:00Z", status: "settled" },
  { id: "ct3", cardId: "vc-01", merchant: "OpenAI", category: "subscriptions", amountUsd: -20.0, at: "2026-05-02T19:11:00Z", status: "settled" },
  { id: "ct4", cardId: "vc-01", merchant: "Wallet top-up", category: "topup", amountUsd: 100.0, at: "2026-05-01T08:00:00Z", status: "settled" },
  { id: "ct5", cardId: "vc-01", merchant: "iCloud+", category: "subscriptions", amountUsd: -2.99, at: "2026-04-29T07:00:00Z", status: "settled" },
  { id: "ct6", cardId: "vc-02", merchant: "Booking.com", category: "travel", amountUsd: -312.4, at: "2026-05-06T14:18:00Z", status: "pending" },
  { id: "ct7", cardId: "vc-02", merchant: "Uber", category: "travel", amountUsd: -24.5, at: "2026-05-05T22:04:00Z", status: "settled" },
  { id: "ct8", cardId: "vc-02", merchant: "Lufthansa", category: "travel", amountUsd: -488.0, at: "2026-04-30T10:33:00Z", status: "settled" },
  { id: "ct9", cardId: "vc-03", merchant: "Zara", category: "shopping", amountUsd: -84.0, at: "2026-04-22T13:50:00Z", status: "settled" },
  { id: "ct10", cardId: "vc-03", merchant: "ASOS", category: "shopping", amountUsd: -120.0, at: "2026-04-19T09:11:00Z", status: "settled" },
];

export const merchantCategories = [
  { id: "gambling", label: "Gambling" },
  { id: "crypto", label: "Crypto" },
  { id: "adult", label: "Adult" },
  { id: "atm", label: "ATM withdrawals" },
];

export function maskPan(pan: string): string {
  const digits = pan.replace(/\s/g, "");
  const last4 = digits.slice(-4);
  return `•••• •••• •••• ${last4}`;
}

export function formatUsd(n: number): string {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

export function relativeDay(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((+now - +d) / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
