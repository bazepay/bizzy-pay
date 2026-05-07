export type Currency = "NGN" | "USD" | "EUR";

export type Transaction = {
  id: string;
  type: "credit" | "debit";
  category: "fund" | "payout" | "bill" | "card" | "esim" | "transfer";
  title: string;
  subtitle: string;
  amount: number;
  currency: Currency;
  date: string; // ISO
  status: "success" | "pending" | "failed";
};

export type VirtualCard = {
  id: string;
  label: string;
  last4: string;
  brand: "Visa" | "Mastercard";
  balance: number;
  currency: Currency;
  frozen: boolean;
  spendLimit: number;
  expiry: string;
  pan: string;
  cvv: string;
};

export const mockUser = {
  firstName: "Adaeze",
  lastName: "Okafor",
  email: "adaeze@bazepay.app",
  phone: "+234 803 555 0142",
  tier: "Basic" as "Basic" | "Enhanced",
  referralCode: "BAZE-ADA42",
  rewards: 12500,
};

export const mockBalances: Record<Currency, number> = {
  NGN: 845320.5,
  USD: 1248.4,
  EUR: 412.0,
};

export const mockTransactions: Transaction[] = [
  { id: "t1", type: "credit", category: "fund", title: "Wallet Funded", subtitle: "Visa •• 4421", amount: 250000, currency: "NGN", date: "2026-05-07T09:14:00Z", status: "success" },
  { id: "t2", type: "debit", category: "bill", title: "MTN Airtime", subtitle: "+234 803 555 0142", amount: 5000, currency: "NGN", date: "2026-05-07T08:02:00Z", status: "success" },
  { id: "t3", type: "debit", category: "card", title: "Spotify", subtitle: "Naira Card •• 8821", amount: 1900, currency: "NGN", date: "2026-05-06T19:40:00Z", status: "success" },
  { id: "t4", type: "debit", category: "bill", title: "Ikeja Electric", subtitle: "Meter 0123456789", amount: 15000, currency: "NGN", date: "2026-05-06T11:20:00Z", status: "success" },
  { id: "t5", type: "debit", category: "esim", title: "eSIM • UK 5GB", subtitle: "30 days", amount: 18.0, currency: "USD", date: "2026-05-05T16:00:00Z", status: "success" },
  { id: "t6", type: "debit", category: "bill", title: "DStv Compact+", subtitle: "IUC 7012345678", amount: 19800, currency: "NGN", date: "2026-05-04T10:00:00Z", status: "success" },
  { id: "t7", type: "credit", category: "transfer", title: "From Tunde A.", subtitle: "GTBank transfer", amount: 50000, currency: "NGN", date: "2026-05-03T14:32:00Z", status: "success" },
  { id: "t8", type: "debit", category: "bill", title: "SportyBet Top-up", subtitle: "User: ada42", amount: 10000, currency: "NGN", date: "2026-05-02T20:11:00Z", status: "pending" },
];

export const mockCards: VirtualCard[] = [
  { id: "c1", label: "Everyday", last4: "8821", brand: "Visa", balance: 124500, currency: "NGN", frozen: false, spendLimit: 200000, expiry: "11/29", pan: "4242 4242 4242 8821", cvv: "318" },
  { id: "c2", label: "Subscriptions", last4: "1190", brand: "Mastercard", balance: 38200, currency: "NGN", frozen: false, spendLimit: 50000, expiry: "07/28", pan: "5500 0000 0000 1190", cvv: "742" },
];

export const networks = [
  { id: "mtn", name: "MTN", color: "#FFCC00" },
  { id: "glo", name: "Glo", color: "#00A859" },
  { id: "airtel", name: "Airtel", color: "#E40000" },
  { id: "9mobile", name: "9mobile", color: "#006F3C" },
];

export const dataPlans = [
  { id: "d1", name: "1GB Daily", validity: "1 day", price: 350 },
  { id: "d2", name: "2GB Weekly", validity: "7 days", price: 1500 },
  { id: "d3", name: "10GB Monthly", validity: "30 days", price: 4500 },
  { id: "d4", name: "40GB Monthly", validity: "30 days", price: 11000 },
];

export const discos = ["Ikeja Electric", "Eko Electric", "Abuja Electric", "PHED", "Kaduna Electric"];

export const tvPackages = [
  { id: "dstv-c", provider: "DStv", name: "Compact", price: 12500 },
  { id: "dstv-cp", provider: "DStv", name: "Compact Plus", price: 19800 },
  { id: "gotv-m", provider: "GOTV", name: "Max", price: 5500 },
  { id: "star-c", provider: "Startimes", name: "Classic", price: 3500 },
];

export const bettingPlatforms = ["Bet9ja", "SportyBet", "BetKing", "1xBet", "NairaBet"];

export const esimCountries = [
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "AE", name: "UAE", flag: "🇦🇪" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "ZA", name: "South Africa", flag: "🇿🇦" },
  { code: "GH", name: "Ghana", flag: "🇬🇭" },
];

export const esimPlans = [
  { id: "e1", data: "1GB", validity: "7 days", price: 4.5 },
  { id: "e2", data: "5GB", validity: "30 days", price: 18 },
  { id: "e3", data: "10GB", validity: "30 days", price: 32 },
  { id: "e4", data: "Unlimited", validity: "15 days", price: 45 },
];

export function formatMoney(amount: number, currency: Currency = "NGN") {
  const symbol = currency === "NGN" ? "₦" : currency === "USD" ? "$" : "€";
  return `${symbol}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
