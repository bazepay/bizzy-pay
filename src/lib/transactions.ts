export type Txn = {
  id: string;
  title: string;
  amount: string;
  isCredit: boolean;
  time: string;
  status: "Success" | "Pending" | "Failed";
  daysAgo: number;
  category: string;
  reference: string;
  method: string;
  fee: string;
  note?: string;
  token?: string;
  units?: string;
};

export const txns: Txn[] = [
  { id: "t1", title: "Top up · Visa •• 4421", amount: "+₦250,000.00", isCredit: true, time: "Today · 09:14", status: "Success", daysAgo: 0, category: "Wallet top up", reference: "BZP-9X4K2P-2401", method: "Visa card •• 4421", fee: "₦0.00", note: "Card top up via Stripe" },
  { id: "t2", title: "MTN Airtime", amount: "-₦5,000.00", isCredit: false, time: "Today · 08:02", status: "Success", daysAgo: 0, category: "Airtime", reference: "BZP-AIR-77241", method: "Wallet · NGN", fee: "₦0.00", note: "+234 803 555 0142" },
  { id: "t3", title: "Spotify", amount: "-₦1,900.00", isCredit: false, time: "Yesterday · 19:40", status: "Success", daysAgo: 1, category: "Card payment", reference: "BZP-CRD-55102", method: "Naira card •• 8821", fee: "₦0.00" },
  { id: "t4", title: "Ikeja Electric", amount: "-₦15,000.00", isCredit: false, time: "Yesterday · 11:20", status: "Success", daysAgo: 1, category: "Electricity", reference: "BZP-ELC-38842", method: "Wallet · NGN", fee: "₦100.00", note: "Meter 0123456789", token: "1234 5678 9012 3456", units: "78.4 kWh" },
  { id: "t5", title: "eSIM · UK 5GB", amount: "-$18.00", isCredit: false, time: "May 5 · 16:00", status: "Success", daysAgo: 2, category: "eSIM", reference: "BZP-ESM-21099", method: "Wallet · USD", fee: "$0.00", note: "30 days · United Kingdom" },
  { id: "t6", title: "DStv Compact+", amount: "-₦19,800.00", isCredit: false, time: "May 4 · 10:00", status: "Success", daysAgo: 3, category: "TV subscription", reference: "BZP-TV-44820", method: "Wallet · NGN", fee: "₦0.00", note: "IUC 7012345678" },
  { id: "t7", title: "From Tunde A.", amount: "+₦50,000.00", isCredit: true, time: "May 3 · 14:32", status: "Success", daysAgo: 4, category: "Bank transfer", reference: "BZP-TRF-19023", method: "GTBank · 0123456789", fee: "₦0.00", note: "Lunch money" },
  { id: "t8", title: "SportyBet Top-up", amount: "-₦10,000.00", isCredit: false, time: "May 2 · 20:11", status: "Pending", daysAgo: 5, category: "Betting", reference: "BZP-BET-77231", method: "Wallet · NGN", fee: "₦0.00", note: "User: ada42" },
];

export const txnById = (id: string) => txns.find((t) => t.id === id);

export function dayLabel(daysAgo: number): string {
  if (daysAgo === 0) return "Today";
  if (daysAgo === 1) return "Yesterday";
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}
