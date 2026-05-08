// Mock virtual number store. Replace with API calls when backend is wired.
export type VnStatus = "active" | "expiring" | "expired";

export type VirtualNumber = {
  id: string;
  msisdn: string;
  countryName: string;
  countryFlag: string;
  iso: string;
  plan: "Day" | "Week" | "Month" | "Year";
  status: VnStatus;
  daysLeft: number;
  totalDays: number;
  autoRenew: boolean;
  nextChargeUsd: number;
  purchasedAt: string;
};

export type VnMessage = {
  id: string;
  numberId: string;
  sender: string;
  body: string;
  otp?: string;
  receivedAt: string; // ISO
  unread?: boolean;
};

export const virtualNumbers: VirtualNumber[] = [
  {
    id: "vn-us-01",
    msisdn: "+1 (415) 555-0142",
    countryName: "USA",
    countryFlag: "🇺🇸",
    iso: "US",
    plan: "Year",
    status: "active",
    daysLeft: 318,
    totalDays: 365,
    autoRenew: true,
    nextChargeUsd: 56.0,
    purchasedAt: "2026-01-22T10:14:00Z",
  },
  {
    id: "vn-gb-01",
    msisdn: "+44 20 7946 0184",
    countryName: "United Kingdom",
    countryFlag: "🇬🇧",
    iso: "GB",
    plan: "Month",
    status: "expiring",
    daysLeft: 3,
    totalDays: 30,
    autoRenew: false,
    nextChargeUsd: 12.5,
    purchasedAt: "2026-04-08T09:02:00Z",
  },
  {
    id: "vn-nl-01",
    msisdn: "+31 20 491 2876",
    countryName: "Netherlands",
    countryFlag: "🇳🇱",
    iso: "NL",
    plan: "Week",
    status: "expired",
    daysLeft: 0,
    totalDays: 7,
    autoRenew: false,
    nextChargeUsd: 5.0,
    purchasedAt: "2026-04-15T16:40:00Z",
  },
];

export const vnMessages: VnMessage[] = [
  {
    id: "m1",
    numberId: "vn-us-01",
    sender: "WhatsApp",
    body: "Your WhatsApp code: 384-921. Don't share it. rJbA/XP1K+V",
    otp: "384921",
    receivedAt: "2026-05-08T08:42:00Z",
    unread: true,
  },
  {
    id: "m2",
    numberId: "vn-us-01",
    sender: "Google",
    body: "G-557103 is your Google verification code.",
    otp: "557103",
    receivedAt: "2026-05-08T08:31:00Z",
    unread: true,
  },
  {
    id: "m3",
    numberId: "vn-us-01",
    sender: "OpenAI",
    body: "Your OpenAI verification code is 419822",
    otp: "419822",
    receivedAt: "2026-05-07T22:18:00Z",
  },
  {
    id: "m4",
    numberId: "vn-us-01",
    sender: "Telegram",
    body: "Login code: 71428. Do not give this code to anyone, even if they say they are from Telegram!",
    otp: "71428",
    receivedAt: "2026-05-06T14:02:00Z",
  },
  {
    id: "m5",
    numberId: "vn-us-01",
    sender: "Uber",
    body: "Your Uber code is 4827. Never share this code.",
    otp: "4827",
    receivedAt: "2026-05-04T19:30:00Z",
  },
  {
    id: "m6",
    numberId: "vn-gb-01",
    sender: "Booking.com",
    body: "Your Booking.com verification code is 920184.",
    otp: "920184",
    receivedAt: "2026-05-08T07:11:00Z",
    unread: true,
  },
  {
    id: "m7",
    numberId: "vn-gb-01",
    sender: "Revolut",
    body: "Revolut: 884 712 is your code. Don't share it with anyone.",
    otp: "884712",
    receivedAt: "2026-05-07T11:24:00Z",
  },
  {
    id: "m8",
    numberId: "vn-nl-01",
    sender: "Bol.com",
    body: "Je verificatiecode is 558190.",
    otp: "558190",
    receivedAt: "2026-04-19T13:00:00Z",
  },
];

export function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
}
