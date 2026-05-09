// Mock data for the Virtual Numbers module. Pricing is NGN-only.

export type NumberStatus = "available" | "leased" | "quarantined" | "released";
export type LeaseStatus = "active" | "expiring" | "expired" | "cancelled";
export type NumberSupplier = "TouristeSim";
export type NumberService = "WhatsApp" | "Telegram" | "SMS" | "Generic";
export type BillingPeriod = "daily" | "weekly" | "monthly" | "annual";

export type NumberCountry = {
  code: string; // ISO-2
  name: string;
  dial: string;
};

// TouristeSim live coverage: Canada, Netherlands, UK, USA (4 countries, 30 plans).
export const numberCountries: NumberCountry[] = [
  { code: "us", name: "United States", dial: "+1" },
  { code: "ca", name: "Canada", dial: "+1" },
  { code: "gb", name: "United Kingdom", dial: "+44" },
  { code: "nl", name: "Netherlands", dial: "+31" },
];

export type PoolNumber = {
  id: string;
  number: string;
  countryCode: string;
  country: string;
  areaCode: string;
  supplier: NumberSupplier;
  service: NumberService;
  billingPeriod: BillingPeriod;
  costNgn: number; // supplier cost for the billing period
  priceNgn: number; // retail price for the billing period
  status: NumberStatus;
  addedAt: string;
};

export type Lease = {
  id: string;
  number: string;
  countryCode: string;
  country: string;
  service: NumberService;
  supplier: NumberSupplier;
  billingPeriod: BillingPeriod;
  user: { id: string; name: string; email: string };
  startedAt: string;
  renewsOn: string;
  autoRenew: boolean;
  smsCount30d: number;
  priceNgn: number;
  status: LeaseStatus;
};

export type SmsEvent = {
  id: string;
  at: string;
  from: string;
  text: string;
};

export const numberSuppliers: { id: string; name: NumberSupplier; health: "healthy" | "degraded" | "down"; latencyMs: number; countries: number; plans: number; lastSync: string }[] = [
  { id: "sup_touristesim", name: "TouristeSim", health: "healthy", latencyMs: 168, countries: 4, plans: 30, lastSync: new Date(Date.now() - 3 * 60_000).toISOString() },
];

const services: NumberService[] = ["WhatsApp", "Telegram", "SMS", "Generic"];
const billingPeriods: BillingPeriod[] = ["daily", "weekly", "monthly", "annual"];
const statuses: NumberStatus[] = ["available", "available", "available", "leased", "leased", "quarantined"];

function pad(n: number, w = 4) { return String(n).padStart(w, "0"); }

function formatNumber(dial: string, area: string, sub: string) {
  if (dial === "+1") return `${dial} (${area}) 555-${sub}`;
  if (dial === "+44") return `${dial} ${area} 9${sub.padStart(5, "0")}`;
  return `${dial} ${area} ${sub}`;
}

export const numberPool: PoolNumber[] = Array.from({ length: 64 }, (_, i) => {
  const c = numberCountries[i % numberCountries.length];
  const supplier = suppliers[i % suppliers.length];
  const service = services[i % services.length];
  const area = ["415", "212", "646", "718", "207", "330", "808"][i % 7];
  const sub = pad(1000 + i * 7);
  const cost = 1500 + (i % 8) * 250;
  const price = Math.round(cost * 1.6);
  return {
    id: `vn_${1000 + i}`,
    number: formatNumber(c.dial, area, sub),
    countryCode: c.code,
    country: c.name,
    areaCode: area,
    supplier,
    service,
    costNgn: cost,
    priceNgn: price,
    status: statuses[i % statuses.length],
    addedAt: new Date(Date.now() - i * 86_400_000).toISOString(),
  };
});

const userPool = [
  { id: "u_001", name: "Adaeze Okafor", email: "adaeze@bazepay.ng" },
  { id: "u_002", name: "Tunde Bakare", email: "tunde.b@bazepay.ng" },
  { id: "u_003", name: "Chioma Eze", email: "chioma@bazepay.ng" },
  { id: "u_004", name: "Femi Adeyemi", email: "femi.a@bazepay.ng" },
  { id: "u_005", name: "Ngozi Umeh", email: "ngozi@bazepay.ng" },
  { id: "u_006", name: "Yusuf Lawal", email: "yusuf.l@bazepay.ng" },
];

export const leases: Lease[] = numberPool
  .filter((n) => n.status === "leased")
  .map((n, i) => {
    const u = userPool[i % userPool.length];
    const startedAt = new Date(Date.now() - (10 + i * 6) * 86_400_000).toISOString();
    const daysToRenew = ((i * 7) % 35) - 5; // some negative => expired/expiring
    const renewsOn = new Date(Date.now() + daysToRenew * 86_400_000).toISOString();
    const status: LeaseStatus = daysToRenew < 0 ? "expired" : daysToRenew <= 5 ? "expiring" : "active";
    return {
      id: `ls_${2000 + i}`,
      number: n.number,
      countryCode: n.countryCode,
      country: n.country,
      service: n.service,
      supplier: n.supplier,
      user: u,
      startedAt,
      renewsOn,
      autoRenew: i % 3 !== 0,
      smsCount30d: 4 + (i * 11) % 80,
      voiceMin30d: (i * 5) % 24,
      priceNgn: n.priceNgn,
      status,
    };
  });

export function getLease(id: string): Lease | undefined {
  return leases.find((l) => l.id === id);
}

export function getSms(leaseId: string): SmsEvent[] {
  void leaseId;
  return [
    { id: "sm_1", at: new Date(Date.now() - 1 * 3600_000).toISOString(), from: "WhatsApp", text: "Your WhatsApp code: 731-204" },
    { id: "sm_2", at: new Date(Date.now() - 4 * 3600_000).toISOString(), from: "Telegram", text: "Login code: 28491. Do not share." },
    { id: "sm_3", at: new Date(Date.now() - 26 * 3600_000).toISOString(), from: "+1 415 555 0144", text: "Hey, can you confirm the address?" },
    { id: "sm_4", at: new Date(Date.now() - 50 * 3600_000).toISOString(), from: "Uber", text: "Your Uber code is 4821" },
  ];
}

export const numberStatusTone: Record<NumberStatus, string> = {
  available: "bg-success/15 text-success border-success/30",
  leased: "bg-primary/15 text-primary border-primary/30",
  quarantined: "bg-warning/15 text-warning border-warning/30",
  released: "bg-muted text-muted-foreground",
};

export const leaseStatusTone: Record<LeaseStatus, string> = {
  active: "bg-success/15 text-success border-success/30",
  expiring: "bg-warning/15 text-warning border-warning/30",
  expired: "bg-destructive/15 text-destructive border-destructive/30",
  cancelled: "bg-muted text-muted-foreground",
};

export const supplierHealthTone: Record<"healthy" | "degraded" | "down", string> = {
  healthy: "bg-success/15 text-success border-success/30",
  degraded: "bg-warning/15 text-warning border-warning/30",
  down: "bg-destructive/15 text-destructive border-destructive/30",
};

export const fmtNgn = (n: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);
