// Bill Pay (Pay hub) mock data. NGN-only.
// Mirrors mobile Pay hub: Airtime, Data, Electricity, TV, Betting, Internet, eSIM top-up.

export type BillerCategory =
  | "airtime"
  | "data"
  | "electricity"
  | "tv"
  | "betting"
  | "internet";

export type BillerStatus = "active" | "degraded" | "down" | "disabled";
export type ProviderRoute = "Flutterwave" | "Paystack" | "Interswitch" | "VTpass";

export type Biller = {
  id: string;
  name: string;
  category: BillerCategory;
  logo?: string; // emoji fallback
  color: string; // hex
  route: ProviderRoute;
  feeNgn: number;
  status: BillerStatus;
  successRate: number; // %
  lastSync: string;
  ordersToday: number;
  gmvToday: number;
};

export type BillPlan = {
  id: string;
  billerId: string;
  billerName: string;
  category: Exclude<BillerCategory, "airtime" | "electricity" | "betting">;
  name: string;
  validityDays: number;
  priceNgn: number;
  costNgn: number;
  visible: boolean;
  sortOrder: number;
};

export type OrderStatus =
  | "pending"
  | "processing"
  | "delivered"
  | "failed"
  | "refunded";

export type BillOrder = {
  id: string;
  createdAt: string;
  user: { id: string; name: string; email: string };
  category: BillerCategory;
  billerId: string;
  billerName: string;
  account: string; // phone, meter, smartcard, customer id
  amountNgn: number;
  feeNgn: number;
  route: ProviderRoute;
  providerRef?: string;
  responseMs: number;
  retries: number;
  status: OrderStatus;
  failureReason?: string;
};

export const fmtNgn = (n: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);

export const categoryLabel: Record<BillerCategory, string> = {
  airtime: "Airtime",
  data: "Data",
  electricity: "Electricity",
  tv: "TV",
  betting: "Betting",
  internet: "Internet",
};

export const billerStatusTone: Record<BillerStatus, string> = {
  active: "bg-success/15 text-success border-success/30",
  degraded: "bg-warning/15 text-warning border-warning/30",
  down: "bg-destructive/15 text-destructive border-destructive/30",
  disabled: "bg-muted text-muted-foreground border-border",
};

export const orderStatusTone: Record<OrderStatus, string> = {
  pending: "bg-muted text-muted-foreground border-border",
  processing: "bg-warning/15 text-warning border-warning/30",
  delivered: "bg-success/15 text-success border-success/30",
  failed: "bg-destructive/15 text-destructive border-destructive/30",
  refunded: "bg-primary/10 text-primary border-primary/30",
};

export const billers: Biller[] = [
  // Airtime networks
  { id: "blr_mtn", name: "MTN Nigeria", category: "airtime", color: "#FFCC00", logo: "📶", route: "VTpass", feeNgn: 0, status: "active", successRate: 99.4, lastSync: new Date(Date.now() - 60_000).toISOString(), ordersToday: 1842, gmvToday: 2_950_000 },
  { id: "blr_glo", name: "Glo Mobile", category: "airtime", color: "#00A651", logo: "📶", route: "VTpass", feeNgn: 0, status: "active", successRate: 98.1, lastSync: new Date(Date.now() - 120_000).toISOString(), ordersToday: 612, gmvToday: 870_000 },
  { id: "blr_airtel", name: "Airtel Nigeria", category: "airtime", color: "#E60000", logo: "📶", route: "Flutterwave", feeNgn: 0, status: "active", successRate: 99.0, lastSync: new Date(Date.now() - 90_000).toISOString(), ordersToday: 1102, gmvToday: 1_640_000 },
  { id: "blr_9mob", name: "9mobile", category: "airtime", color: "#006F3C", logo: "📶", route: "VTpass", feeNgn: 0, status: "degraded", successRate: 92.3, lastSync: new Date(Date.now() - 240_000).toISOString(), ordersToday: 188, gmvToday: 240_000 },

  // Data
  { id: "blr_mtn_data", name: "MTN Data", category: "data", color: "#FFCC00", logo: "🌐", route: "VTpass", feeNgn: 0, status: "active", successRate: 99.1, lastSync: new Date(Date.now() - 75_000).toISOString(), ordersToday: 940, gmvToday: 3_120_000 },
  { id: "blr_glo_data", name: "Glo Data", category: "data", color: "#00A651", logo: "🌐", route: "VTpass", feeNgn: 0, status: "active", successRate: 98.4, lastSync: new Date(Date.now() - 110_000).toISOString(), ordersToday: 412, gmvToday: 980_000 },
  { id: "blr_airtel_data", name: "Airtel Data", category: "data", color: "#E60000", logo: "🌐", route: "Flutterwave", feeNgn: 0, status: "active", successRate: 98.9, lastSync: new Date(Date.now() - 50_000).toISOString(), ordersToday: 706, gmvToday: 1_810_000 },
  { id: "blr_9mob_data", name: "9mobile Data", category: "data", color: "#006F3C", logo: "🌐", route: "VTpass", feeNgn: 0, status: "active", successRate: 97.6, lastSync: new Date(Date.now() - 180_000).toISOString(), ordersToday: 132, gmvToday: 290_000 },

  // Electricity (DisCos)
  { id: "blr_eko", name: "Eko Electric (EKEDC)", category: "electricity", color: "#0F4C81", logo: "⚡", route: "VTpass", feeNgn: 100, status: "active", successRate: 97.8, lastSync: new Date(Date.now() - 200_000).toISOString(), ordersToday: 318, gmvToday: 4_650_000 },
  { id: "blr_ikeja", name: "Ikeja Electric (IKEDC)", category: "electricity", color: "#E11D2E", logo: "⚡", route: "VTpass", feeNgn: 100, status: "active", successRate: 98.2, lastSync: new Date(Date.now() - 90_000).toISOString(), ordersToday: 402, gmvToday: 5_980_000 },
  { id: "blr_aedc", name: "Abuja Electric (AEDC)", category: "electricity", color: "#1D4ED8", logo: "⚡", route: "Interswitch", feeNgn: 100, status: "degraded", successRate: 91.4, lastSync: new Date(Date.now() - 320_000).toISOString(), ordersToday: 188, gmvToday: 2_140_000 },
  { id: "blr_ibedc", name: "Ibadan Electric (IBEDC)", category: "electricity", color: "#047857", logo: "⚡", route: "VTpass", feeNgn: 100, status: "active", successRate: 96.7, lastSync: new Date(Date.now() - 140_000).toISOString(), ordersToday: 224, gmvToday: 1_890_000 },
  { id: "blr_phed", name: "Port Harcourt Electric (PHED)", category: "electricity", color: "#0E7490", logo: "⚡", route: "VTpass", feeNgn: 100, status: "down", successRate: 0, lastSync: new Date(Date.now() - 26 * 60 * 60_000).toISOString(), ordersToday: 0, gmvToday: 0 },

  // TV
  { id: "blr_dstv", name: "DStv", category: "tv", color: "#1A237E", logo: "📺", route: "VTpass", feeNgn: 50, status: "active", successRate: 99.2, lastSync: new Date(Date.now() - 60_000).toISOString(), ordersToday: 268, gmvToday: 3_420_000 },
  { id: "blr_gotv", name: "GOtv", category: "tv", color: "#FFB300", logo: "📺", route: "VTpass", feeNgn: 50, status: "active", successRate: 99.0, lastSync: new Date(Date.now() - 95_000).toISOString(), ordersToday: 412, gmvToday: 1_580_000 },
  { id: "blr_startimes", name: "Startimes", category: "tv", color: "#D32F2F", logo: "📺", route: "VTpass", feeNgn: 50, status: "active", successRate: 98.5, lastSync: new Date(Date.now() - 110_000).toISOString(), ordersToday: 142, gmvToday: 480_000 },
  { id: "blr_showmax", name: "Showmax", category: "tv", color: "#FF0050", logo: "📺", route: "Flutterwave", feeNgn: 50, status: "active", successRate: 99.6, lastSync: new Date(Date.now() - 70_000).toISOString(), ordersToday: 88, gmvToday: 320_000 },

  // Betting
  { id: "blr_bet9ja", name: "Bet9ja", category: "betting", color: "#1B5E20", logo: "🎲", route: "Paystack", feeNgn: 0, status: "active", successRate: 99.3, lastSync: new Date(Date.now() - 80_000).toISOString(), ordersToday: 624, gmvToday: 2_180_000 },
  { id: "blr_sporty", name: "SportyBet", category: "betting", color: "#D32F2F", logo: "🎲", route: "Paystack", feeNgn: 0, status: "active", successRate: 99.1, lastSync: new Date(Date.now() - 65_000).toISOString(), ordersToday: 812, gmvToday: 2_640_000 },
  { id: "blr_betking", name: "BetKing", category: "betting", color: "#0D47A1", logo: "🎲", route: "Flutterwave", feeNgn: 0, status: "active", successRate: 98.7, lastSync: new Date(Date.now() - 130_000).toISOString(), ordersToday: 318, gmvToday: 940_000 },
  { id: "blr_1xbet", name: "1xBet", category: "betting", color: "#1976D2", logo: "🎲", route: "Paystack", feeNgn: 0, status: "degraded", successRate: 88.2, lastSync: new Date(Date.now() - 380_000).toISOString(), ordersToday: 82, gmvToday: 210_000 },

  // Internet ISPs
  { id: "blr_spectranet", name: "Spectranet", category: "internet", color: "#FF6F00", logo: "📡", route: "VTpass", feeNgn: 0, status: "active", successRate: 98.1, lastSync: new Date(Date.now() - 150_000).toISOString(), ordersToday: 64, gmvToday: 1_280_000 },
  { id: "blr_smile", name: "Smile", category: "internet", color: "#FBC02D", logo: "📡", route: "VTpass", feeNgn: 0, status: "active", successRate: 97.4, lastSync: new Date(Date.now() - 240_000).toISOString(), ordersToday: 38, gmvToday: 760_000 },
  { id: "blr_ipnx", name: "ipNX", category: "internet", color: "#0277BD", logo: "📡", route: "Flutterwave", feeNgn: 0, status: "active", successRate: 99.0, lastSync: new Date(Date.now() - 95_000).toISOString(), ordersToday: 42, gmvToday: 920_000 },
  { id: "blr_swift", name: "Swift Networks", category: "internet", color: "#388E3C", logo: "📡", route: "VTpass", feeNgn: 0, status: "disabled", successRate: 0, lastSync: new Date(Date.now() - 5 * 24 * 3600_000).toISOString(), ordersToday: 0, gmvToday: 0 },
];

// Plans for Data, TV, Internet
const planSeed: Array<Omit<BillPlan, "id" | "billerName"> & { billerName?: string }> = [
  // MTN Data
  { billerId: "blr_mtn_data", category: "data", name: "1GB Daily", validityDays: 1, priceNgn: 350, costNgn: 320, visible: true, sortOrder: 1 },
  { billerId: "blr_mtn_data", category: "data", name: "2.5GB Weekly", validityDays: 7, priceNgn: 1500, costNgn: 1380, visible: true, sortOrder: 2 },
  { billerId: "blr_mtn_data", category: "data", name: "6GB Monthly", validityDays: 30, priceNgn: 2500, costNgn: 2300, visible: true, sortOrder: 3 },
  { billerId: "blr_mtn_data", category: "data", name: "20GB Monthly", validityDays: 30, priceNgn: 5500, costNgn: 5100, visible: true, sortOrder: 4 },
  { billerId: "blr_mtn_data", category: "data", name: "75GB Monthly", validityDays: 30, priceNgn: 17500, costNgn: 16500, visible: true, sortOrder: 5 },
  // Glo Data
  { billerId: "blr_glo_data", category: "data", name: "1.35GB Daily", validityDays: 1, priceNgn: 300, costNgn: 280, visible: true, sortOrder: 1 },
  { billerId: "blr_glo_data", category: "data", name: "5.8GB Weekly", validityDays: 7, priceNgn: 1500, costNgn: 1400, visible: true, sortOrder: 2 },
  { billerId: "blr_glo_data", category: "data", name: "13.25GB Monthly", validityDays: 30, priceNgn: 3000, costNgn: 2800, visible: true, sortOrder: 3 },
  { billerId: "blr_glo_data", category: "data", name: "29.5GB Monthly", validityDays: 30, priceNgn: 5000, costNgn: 4700, visible: true, sortOrder: 4 },
  // Airtel Data
  { billerId: "blr_airtel_data", category: "data", name: "1.5GB Daily", validityDays: 1, priceNgn: 600, costNgn: 560, visible: true, sortOrder: 1 },
  { billerId: "blr_airtel_data", category: "data", name: "6GB Weekly", validityDays: 7, priceNgn: 2500, costNgn: 2350, visible: true, sortOrder: 2 },
  { billerId: "blr_airtel_data", category: "data", name: "10GB Monthly", validityDays: 30, priceNgn: 3000, costNgn: 2800, visible: true, sortOrder: 3 },
  { billerId: "blr_airtel_data", category: "data", name: "40GB Monthly", validityDays: 30, priceNgn: 10000, costNgn: 9400, visible: true, sortOrder: 4 },
  // 9mobile Data
  { billerId: "blr_9mob_data", category: "data", name: "650MB Daily", validityDays: 1, priceNgn: 200, costNgn: 190, visible: true, sortOrder: 1 },
  { billerId: "blr_9mob_data", category: "data", name: "2GB Weekly", validityDays: 7, priceNgn: 1000, costNgn: 950, visible: true, sortOrder: 2 },
  { billerId: "blr_9mob_data", category: "data", name: "11GB Monthly", validityDays: 30, priceNgn: 4000, costNgn: 3800, visible: false, sortOrder: 3 },

  // DStv
  { billerId: "blr_dstv", category: "tv", name: "Padi", validityDays: 30, priceNgn: 4400, costNgn: 4250, visible: true, sortOrder: 1 },
  { billerId: "blr_dstv", category: "tv", name: "Yanga", validityDays: 30, priceNgn: 6200, costNgn: 6000, visible: true, sortOrder: 2 },
  { billerId: "blr_dstv", category: "tv", name: "Confam", validityDays: 30, priceNgn: 11000, costNgn: 10700, visible: true, sortOrder: 3 },
  { billerId: "blr_dstv", category: "tv", name: "Compact", validityDays: 30, priceNgn: 19000, costNgn: 18500, visible: true, sortOrder: 4 },
  { billerId: "blr_dstv", category: "tv", name: "Compact Plus", validityDays: 30, priceNgn: 30000, costNgn: 29200, visible: true, sortOrder: 5 },
  { billerId: "blr_dstv", category: "tv", name: "Premium", validityDays: 30, priceNgn: 44500, costNgn: 43500, visible: true, sortOrder: 6 },
  // GOtv
  { billerId: "blr_gotv", category: "tv", name: "Smallie", validityDays: 30, priceNgn: 1575, costNgn: 1500, visible: true, sortOrder: 1 },
  { billerId: "blr_gotv", category: "tv", name: "Jinja", validityDays: 30, priceNgn: 3300, costNgn: 3200, visible: true, sortOrder: 2 },
  { billerId: "blr_gotv", category: "tv", name: "Jolli", validityDays: 30, priceNgn: 4850, costNgn: 4700, visible: true, sortOrder: 3 },
  { billerId: "blr_gotv", category: "tv", name: "Max", validityDays: 30, priceNgn: 7200, costNgn: 7000, visible: true, sortOrder: 4 },
  { billerId: "blr_gotv", category: "tv", name: "Supa", validityDays: 30, priceNgn: 9600, costNgn: 9300, visible: true, sortOrder: 5 },
  // Startimes
  { billerId: "blr_startimes", category: "tv", name: "Nova", validityDays: 30, priceNgn: 1500, costNgn: 1450, visible: true, sortOrder: 1 },
  { billerId: "blr_startimes", category: "tv", name: "Basic", validityDays: 30, priceNgn: 2800, costNgn: 2700, visible: true, sortOrder: 2 },
  { billerId: "blr_startimes", category: "tv", name: "Smart", validityDays: 30, priceNgn: 3800, costNgn: 3700, visible: true, sortOrder: 3 },
  { billerId: "blr_startimes", category: "tv", name: "Classic", validityDays: 30, priceNgn: 5500, costNgn: 5350, visible: true, sortOrder: 4 },
  // Showmax
  { billerId: "blr_showmax", category: "tv", name: "Mobile", validityDays: 30, priceNgn: 1600, costNgn: 1550, visible: true, sortOrder: 1 },
  { billerId: "blr_showmax", category: "tv", name: "Standard", validityDays: 30, priceNgn: 3500, costNgn: 3400, visible: true, sortOrder: 2 },
  { billerId: "blr_showmax", category: "tv", name: "Pro", validityDays: 30, priceNgn: 6300, costNgn: 6100, visible: true, sortOrder: 3 },

  // Internet
  { billerId: "blr_spectranet", category: "internet", name: "10GB Voucher", validityDays: 30, priceNgn: 6000, costNgn: 5750, visible: true, sortOrder: 1 },
  { billerId: "blr_spectranet", category: "internet", name: "20GB Voucher", validityDays: 30, priceNgn: 10500, costNgn: 10100, visible: true, sortOrder: 2 },
  { billerId: "blr_spectranet", category: "internet", name: "50GB Voucher", validityDays: 60, priceNgn: 22500, costNgn: 21800, visible: true, sortOrder: 3 },
  { billerId: "blr_smile", category: "internet", name: "FlexiDaily 1GB", validityDays: 1, priceNgn: 600, costNgn: 580, visible: true, sortOrder: 1 },
  { billerId: "blr_smile", category: "internet", name: "Bigga 12GB", validityDays: 30, priceNgn: 9000, costNgn: 8700, visible: true, sortOrder: 2 },
  { billerId: "blr_smile", category: "internet", name: "Mega 25GB", validityDays: 30, priceNgn: 16000, costNgn: 15500, visible: true, sortOrder: 3 },
  { billerId: "blr_ipnx", category: "internet", name: "FibrePlus 30Mbps", validityDays: 30, priceNgn: 19500, costNgn: 19000, visible: true, sortOrder: 1 },
  { billerId: "blr_ipnx", category: "internet", name: "FibrePlus 50Mbps", validityDays: 30, priceNgn: 28500, costNgn: 27800, visible: true, sortOrder: 2 },
];

export const billPlans: BillPlan[] = planSeed.map((p, i) => {
  const biller = billers.find((b) => b.id === p.billerId);
  return {
    ...p,
    id: `bpl_${String(i + 1).padStart(4, "0")}`,
    billerName: biller?.name ?? p.billerId,
  };
});

// Orders feed (last 7 days)
const userPool = [
  { id: "u_001", name: "Adaeze Okafor", email: "adaeze.okafor@bazepay.ng" },
  { id: "u_002", name: "Tunde Bakare", email: "tunde.b@gmail.com" },
  { id: "u_003", name: "Chioma Eze", email: "chioma.eze@yahoo.com" },
  { id: "u_004", name: "Ibrahim Musa", email: "ibrahim.musa@outlook.com" },
  { id: "u_005", name: "Funke Adebayo", email: "funke.a@bazepay.ng" },
  { id: "u_006", name: "Emeka Nwosu", email: "emeka.n@gmail.com" },
  { id: "u_007", name: "Aisha Bello", email: "aisha.bello@hotmail.com" },
  { id: "u_008", name: "Segun Oladele", email: "segun.o@gmail.com" },
];

function maskAccount(category: BillerCategory, i: number): string {
  if (category === "airtime" || category === "data") {
    const prefixes = ["0803", "0806", "0813", "0816", "0703", "0903", "0905", "0809"];
    const p = prefixes[i % prefixes.length];
    return `${p}${String(1000000 + (i * 73)).slice(-7)}`;
  }
  if (category === "electricity") return `${1000_000_000_000 + i * 31}`;
  if (category === "tv") return `${2000_0000 + i * 17}`;
  if (category === "betting") return `BET${100000 + i * 13}`;
  return `CUST-${10000 + i * 9}`;
}

const failureReasons = [
  "Provider timeout",
  "Invalid customer ID",
  "Insufficient float at provider",
  "Network gateway error",
  "Account barred by biller",
];

export const billOrders: BillOrder[] = (() => {
  const out: BillOrder[] = [];
  const now = Date.now();
  for (let i = 0; i < 220; i++) {
    const biller = billers[i % billers.length];
    if (biller.status === "disabled") continue;
    const planForBiller = billPlans.filter((p) => p.billerId === biller.id);
    let amount: number;
    if (planForBiller.length) amount = planForBiller[i % planForBiller.length].priceNgn;
    else if (biller.category === "airtime") amount = [100, 200, 500, 1000, 2000, 5000][i % 6];
    else if (biller.category === "electricity") amount = [2000, 5000, 10000, 20000, 35000][i % 5];
    else amount = [500, 1000, 2500, 5000, 10000][i % 5];

    const r = (i * 9301 + 49297) % 233280; // deterministic pseudo-random
    const roll = r / 233280;
    let status: OrderStatus;
    if (biller.status === "down") status = "failed";
    else if (roll < 0.78) status = "delivered";
    else if (roll < 0.86) status = "processing";
    else if (roll < 0.92) status = "pending";
    else if (roll < 0.98) status = "failed";
    else status = "refunded";

    out.push({
      id: `bpo_${String(900000 + i).slice(-6)}`,
      createdAt: new Date(now - i * 9 * 60_000 - (i % 7) * 1800_000).toISOString(),
      user: userPool[i % userPool.length],
      category: biller.category,
      billerId: biller.id,
      billerName: biller.name,
      account: maskAccount(biller.category, i),
      amountNgn: amount,
      feeNgn: biller.feeNgn,
      route: biller.route,
      providerRef: status !== "pending" ? `${biller.route.slice(0, 3).toUpperCase()}-${1_000_000 + i * 7}` : undefined,
      responseMs: 200 + ((i * 113) % 2800),
      retries: status === "failed" ? (i % 3) : 0,
      status,
      failureReason: status === "failed" ? failureReasons[i % failureReasons.length] : undefined,
    });
  }
  return out;
})();

export const billCategories: BillerCategory[] = ["airtime", "data", "electricity", "tv", "betting", "internet"];
export const providerRoutes: ProviderRoute[] = ["Flutterwave", "Paystack", "Interswitch", "VTpass"];
