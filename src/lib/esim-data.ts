// Mock data for the eSIM module. Pricing is NGN-only.

export type EsimPlanStatus = "live" | "draft" | "hidden";
export type EsimOrderStatus = "paid" | "provisioning" | "delivered" | "activated" | "failed" | "refunded";
export type SupplierHealth = "healthy" | "degraded" | "down";

export type EsimPlan = {
  id: string;
  countryCode: string; // ISO-2
  country: string;
  flag: string; // emoji
  dataGb: number;
  validityDays: number;
  priceNgn: number;
  costNgn: number;
  supplier: string;
  status: EsimPlanStatus;
  sortOrder: number;
};

export type EsimSupplier = {
  id: string;
  name: string;
  health: SupplierHealth;
  countriesCovered: number;
  latencyMs: number;
  lastSync: string;
};

export type EsimInventoryItem = {
  id: string;
  supplier: string;
  country: string;
  flag: string;
  iccidsTotal: number;
  iccidsAvailable: number;
  threshold: number;
};

export type EsimActivationStep = {
  step: "payment_captured" | "supplier_order" | "qr_generated" | "qr_delivered" | "device_activated";
  status: "ok" | "pending" | "failed";
  at?: string;
  note?: string;
};

export type EsimOrder = {
  id: string;
  user: { id: string; name: string; email: string };
  planId: string;
  planName: string;
  country: string;
  flag: string;
  dataGb: number;
  validityDays: number;
  priceNgn: number;
  status: EsimOrderStatus;
  createdAt: string;
  iccid?: string;
  qrUrl?: string;
  supplier: string;
  steps: EsimActivationStep[];
  failureReason?: string;
};

const COUNTRIES: Array<[string, string, string]> = [
  ["NG", "Nigeria", "🇳🇬"],
  ["GB", "United Kingdom", "🇬🇧"],
  ["US", "United States", "🇺🇸"],
  ["AE", "UAE", "🇦🇪"],
  ["GH", "Ghana", "🇬🇭"],
  ["FR", "France", "🇫🇷"],
  ["DE", "Germany", "🇩🇪"],
  ["ZA", "South Africa", "🇿🇦"],
  ["KE", "Kenya", "🇰🇪"],
  ["TR", "Türkiye", "🇹🇷"],
  ["CA", "Canada", "🇨🇦"],
  ["SA", "Saudi Arabia", "🇸🇦"],
];

const SUPPLIERS = ["Airalo", "eSIM Access", "Bytesim"];

function seed(i: number) {
  const x = Math.sin(i * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

export const esimSuppliers: EsimSupplier[] = [
  { id: "sup_airalo", name: "Airalo", health: "healthy", countriesCovered: 198, latencyMs: 312, lastSync: new Date(Date.now() - 4 * 60_000).toISOString() },
  { id: "sup_esimaccess", name: "eSIM Access", health: "degraded", countriesCovered: 142, latencyMs: 1280, lastSync: new Date(Date.now() - 18 * 60_000).toISOString() },
  { id: "sup_bytesim", name: "Bytesim", health: "healthy", countriesCovered: 86, latencyMs: 420, lastSync: new Date(Date.now() - 2 * 60_000).toISOString() },
];

const PLAN_BUCKETS: Array<{ gb: number; days: number; basePriceNgn: number }> = [
  { gb: 1, days: 7, basePriceNgn: 3_500 },
  { gb: 3, days: 15, basePriceNgn: 7_900 },
  { gb: 5, days: 30, basePriceNgn: 12_500 },
  { gb: 10, days: 30, basePriceNgn: 21_000 },
  { gb: 20, days: 30, basePriceNgn: 38_000 },
];

export const esimPlans: EsimPlan[] = (() => {
  const arr: EsimPlan[] = [];
  let i = 1;
  for (const [code, name, flag] of COUNTRIES) {
    for (const b of PLAN_BUCKETS) {
      const r = seed(i);
      const supplier = SUPPLIERS[i % SUPPLIERS.length];
      // small per-country variance
      const price = Math.round(b.basePriceNgn * (0.85 + r * 0.5) / 100) * 100;
      const cost = Math.round(price * (0.55 + r * 0.15));
      const status: EsimPlanStatus = i % 23 === 0 ? "draft" : i % 17 === 0 ? "hidden" : "live";
      arr.push({
        id: `pln_${code.toLowerCase()}_${b.gb}gb_${b.days}d`,
        countryCode: code,
        country: name,
        flag,
        dataGb: b.gb,
        validityDays: b.days,
        priceNgn: price,
        costNgn: cost,
        supplier,
        status,
        sortOrder: i,
      });
      i++;
    }
  }
  return arr;
})();

export const esimInventory: EsimInventoryItem[] = COUNTRIES.map(([code, name, flag], i) => {
  const total = 200 + Math.floor(seed(i + 5) * 800);
  const used = Math.floor(seed(i + 11) * total * 0.95);
  return {
    id: `inv_${code.toLowerCase()}`,
    supplier: SUPPLIERS[i % SUPPLIERS.length],
    country: name,
    flag,
    iccidsTotal: total,
    iccidsAvailable: total - used,
    threshold: 50,
  };
});

const FIRST = ["Ada", "Tunde", "Ngozi", "Aisha", "Femi", "Zainab", "Kunle", "Ifeoma", "Bayo", "Halima", "Emeka", "Sade", "Maryam", "Obi", "Funke"];
const LAST = ["Okafor", "Adeyemi", "Bello", "Okonkwo", "Mohammed", "Balogun", "Eze", "Akinwale", "Sani", "Onyeka", "Hassan", "Igwe", "Lawal", "Nwosu", "Yusuf"];

function makeOrder(i: number): EsimOrder {
  const r = seed(i);
  const r2 = seed(i + 31);
  const plan = esimPlans[i % esimPlans.length];
  const first = FIRST[i % FIRST.length];
  const last = LAST[(i * 3) % LAST.length];
  const status: EsimOrderStatus =
    i % 47 === 0 ? "failed"
    : i % 31 === 0 ? "refunded"
    : i % 13 === 0 ? "provisioning"
    : i % 11 === 0 ? "delivered"
    : i % 7 === 0 ? "paid"
    : "activated";
  const created = new Date(Date.now() - Math.floor(r * 60) * 86_400_000 - Math.floor(r2 * 86_400_000));
  const steps: EsimActivationStep[] = [
    { step: "payment_captured", status: "ok", at: new Date(created.getTime()).toISOString() },
    { step: "supplier_order", status: status === "failed" ? "failed" : status === "paid" ? "pending" : "ok", at: new Date(created.getTime() + 4_000).toISOString(), note: status === "failed" ? "Supplier returned ERR_OUT_OF_STOCK" : undefined },
    { step: "qr_generated", status: ["paid", "failed"].includes(status) ? "pending" : "ok", at: ["paid", "failed"].includes(status) ? undefined : new Date(created.getTime() + 14_000).toISOString() },
    { step: "qr_delivered", status: ["paid", "failed", "provisioning"].includes(status) ? "pending" : "ok", at: ["paid", "failed", "provisioning"].includes(status) ? undefined : new Date(created.getTime() + 22_000).toISOString() },
    { step: "device_activated", status: status === "activated" ? "ok" : "pending", at: status === "activated" ? new Date(created.getTime() + 15 * 60_000).toISOString() : undefined },
  ];
  const iccid = ["paid", "failed"].includes(status) ? undefined : `8923${String(8000000000 + Math.floor(r * 1_000_000_000)).slice(0, 11)}`;
  return {
    id: `eso_${(70000 + i).toString()}`,
    user: {
      id: `u_${(8000 + (i % 64) + 1).toString().padStart(4, "0")}`,
      name: `${first} ${last}`,
      email: `${first}.${last}`.toLowerCase() + "@mail.com",
    },
    planId: plan.id,
    planName: `${plan.country} · ${plan.dataGb}GB / ${plan.validityDays}d`,
    country: plan.country,
    flag: plan.flag,
    dataGb: plan.dataGb,
    validityDays: plan.validityDays,
    priceNgn: plan.priceNgn,
    status,
    createdAt: created.toISOString(),
    iccid,
    qrUrl: iccid ? `lpa:1$rsp.bazepay.com$${iccid}` : undefined,
    supplier: plan.supplier,
    steps,
    failureReason: status === "failed" ? "Supplier returned ERR_OUT_OF_STOCK" : undefined,
  };
}

export const esimOrders: EsimOrder[] = Array.from({ length: 84 }, (_, i) => makeOrder(i + 1));

export const getEsimOrder = (id: string) => esimOrders.find((o) => o.id === id);
export const getEsimPlan = (id: string) => esimPlans.find((p) => p.id === id);

export const orderStatusTone: Record<EsimOrderStatus, string> = {
  paid: "bg-primary/15 text-primary border-primary/30",
  provisioning: "bg-primary/15 text-primary border-primary/30",
  delivered: "bg-warning/15 text-warning border-warning/30",
  activated: "bg-success/15 text-success border-success/30",
  failed: "bg-destructive/15 text-destructive border-destructive/30",
  refunded: "bg-muted text-muted-foreground border-border",
};

export const planStatusTone: Record<EsimPlanStatus, string> = {
  live: "bg-success/15 text-success border-success/30",
  draft: "bg-muted text-muted-foreground border-border",
  hidden: "bg-warning/15 text-warning border-warning/30",
};

export const supplierHealthTone: Record<SupplierHealth, string> = {
  healthy: "bg-success/15 text-success border-success/30",
  degraded: "bg-warning/15 text-warning border-warning/30",
  down: "bg-destructive/15 text-destructive border-destructive/30",
};

export const fmtNgn = (n: number) => `₦${Math.round(n).toLocaleString("en-NG")}`;
