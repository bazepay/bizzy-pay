// Deterministic mock data for the Reports module.
// All amounts are NGN — wallets and cards are Naira-only per project rules.

export type ReportCategory = "financial" | "operations" | "compliance" | "growth" | "product";

export type ReportDef = {
  id: string;
  name: string;
  category: ReportCategory;
  description: string;
  owner: string;
  lastRun: string; // ISO
  rowsLastRun: number;
  formats: ("csv" | "xlsx" | "pdf" | "json")[];
};

export type ScheduledReport = {
  id: string;
  reportId: string;
  reportName: string;
  cadence: "daily" | "weekly" | "monthly" | "quarterly";
  nextRun: string; // ISO
  recipients: string[];
  format: "csv" | "xlsx" | "pdf";
  status: "active" | "paused";
  lastStatus: "success" | "failed" | "running" | "queued";
};

export type ExportRow = {
  id: string;
  reportName: string;
  category: ReportCategory;
  requestedBy: string;
  requestedAt: string;
  rangeFrom: string;
  rangeTo: string;
  format: "csv" | "xlsx" | "pdf" | "json";
  rows: number;
  sizeKb: number;
  status: "ready" | "running" | "failed" | "expired";
  expiresAt: string;
};

// ---------- Time-series ----------
const days = (n: number) => {
  const out: { d: string; date: Date }[] = [];
  const today = new Date(2026, 4, 9); // May 9, 2026 (deterministic anchor)
  for (let i = n - 1; i >= 0; i--) {
    const dt = new Date(today);
    dt.setDate(today.getDate() - i);
    out.push({ d: dt.toISOString().slice(0, 10), date: dt });
  }
  return out;
};

const seeded = (seed: number) => {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
};

export const revenueSeries = (() => {
  const rng = seeded(7);
  return days(90).map(({ d }, i) => {
    const base = 18_500_000 + i * 110_000;
    const noise = (rng() - 0.5) * 4_000_000;
    const gross = Math.max(8_000_000, base + noise);
    const fees = gross * (0.018 + rng() * 0.006);
    const refunds = gross * (0.004 + rng() * 0.003);
    return {
      d,
      gross: Math.round(gross),
      fees: Math.round(fees),
      refunds: Math.round(refunds),
      net: Math.round(gross - refunds),
    };
  });
})();

export const txVolumeSeries = (() => {
  const rng = seeded(19);
  return days(30).map(({ d }, i) => {
    const total = Math.round(42_000 + i * 600 + rng() * 9_000);
    const success = Math.round(total * (0.94 + rng() * 0.04));
    const failed = total - success;
    return { d, success, failed, total };
  });
})();

export const channelMix = [
  { name: "Card", value: 41, amount: 184_300_000 },
  { name: "Bank transfer", value: 28, amount: 125_900_000 },
  { name: "USSD", value: 14, amount: 62_900_000 },
  { name: "Wallet", value: 11, amount: 49_400_000 },
  { name: "QR", value: 6, amount: 26_800_000 },
];

export const kycFunnel = [
  { stage: "Started", count: 12_840 },
  { stage: "ID submitted", count: 11_205 },
  { stage: "Selfie captured", count: 10_487 },
  { stage: "Address verified", count: 9_312 },
  { stage: "Approved", count: 8_704 },
];

export const productMix = [
  { name: "Bill Pay", txns: 184_320, gmv: 412_000_000 },
  { name: "Airtime/Data", txns: 312_410, gmv: 198_400_000 },
  { name: "Cards", txns: 96_220, gmv: 287_500_000 },
  { name: "eSIM", txns: 21_840, gmv: 41_900_000 },
  { name: "Numbers", txns: 8_760, gmv: 12_700_000 },
];

// ---------- Catalog ----------
export const reports: ReportDef[] = [
  {
    id: "rpt_fin_pnl",
    name: "P&L summary",
    category: "financial",
    description: "Gross revenue, fees, refunds and net contribution by day.",
    owner: "Finance",
    lastRun: "2026-05-09T05:30:00Z",
    rowsLastRun: 30,
    formats: ["csv", "xlsx", "pdf"],
  },
  {
    id: "rpt_fin_settlement",
    name: "Settlement reconciliation",
    category: "financial",
    description: "Provider payouts vs. expected ledger balance with variance.",
    owner: "Finance",
    lastRun: "2026-05-08T18:05:00Z",
    rowsLastRun: 1_204,
    formats: ["csv", "xlsx"],
  },
  {
    id: "rpt_fin_fees",
    name: "Fees & FX markup",
    category: "financial",
    description: "Interchange, scheme and FX markup on cross-border auths.",
    owner: "Finance",
    lastRun: "2026-05-09T01:12:00Z",
    rowsLastRun: 8_932,
    formats: ["csv", "xlsx"],
  },
  {
    id: "rpt_ops_tx",
    name: "Transactions volume",
    category: "operations",
    description: "Successful, failed and reversed transactions by channel.",
    owner: "Ops",
    lastRun: "2026-05-09T06:00:00Z",
    rowsLastRun: 248_103,
    formats: ["csv", "xlsx", "json"],
  },
  {
    id: "rpt_ops_uptime",
    name: "Provider uptime & latency",
    category: "operations",
    description: "p50/p95 latency and incident windows per provider.",
    owner: "Ops",
    lastRun: "2026-05-09T04:00:00Z",
    rowsLastRun: 96,
    formats: ["csv", "pdf"],
  },
  {
    id: "rpt_cmp_kyc",
    name: "KYC funnel",
    category: "compliance",
    description: "Conversion across submission, review and approval stages.",
    owner: "Compliance",
    lastRun: "2026-05-08T22:40:00Z",
    rowsLastRun: 12_840,
    formats: ["csv", "xlsx"],
  },
  {
    id: "rpt_cmp_aml",
    name: "AML alerts & SARs",
    category: "compliance",
    description: "Open alerts, dispositions and SARs filed in period.",
    owner: "Compliance",
    lastRun: "2026-05-09T02:18:00Z",
    rowsLastRun: 412,
    formats: ["csv", "pdf"],
  },
  {
    id: "rpt_cmp_sanctions",
    name: "Sanctions screening hits",
    category: "compliance",
    description: "Hits from screening across users, beneficiaries and counterparties.",
    owner: "Compliance",
    lastRun: "2026-05-09T03:00:00Z",
    rowsLastRun: 71,
    formats: ["csv", "pdf"],
  },
  {
    id: "rpt_grw_referrals",
    name: "Referral attribution",
    category: "growth",
    description: "Referred signups, activation rate and payout liability.",
    owner: "Growth",
    lastRun: "2026-05-08T19:00:00Z",
    rowsLastRun: 5_420,
    formats: ["csv", "xlsx"],
  },
  {
    id: "rpt_grw_cohort",
    name: "Cohort retention",
    category: "growth",
    description: "Weekly cohort retention by acquisition source.",
    owner: "Growth",
    lastRun: "2026-05-08T20:30:00Z",
    rowsLastRun: 312,
    formats: ["csv", "xlsx"],
  },
  {
    id: "rpt_prd_cards",
    name: "Cards portfolio",
    category: "product",
    description: "Issued, active and blocked Naira cards with spend bands.",
    owner: "Cards",
    lastRun: "2026-05-09T00:45:00Z",
    rowsLastRun: 38_410,
    formats: ["csv", "xlsx"],
  },
  {
    id: "rpt_prd_esim",
    name: "eSIM activations",
    category: "product",
    description: "Activations by destination and plan with refund rate.",
    owner: "eSIM",
    lastRun: "2026-05-08T23:20:00Z",
    rowsLastRun: 9_104,
    formats: ["csv", "xlsx"],
  },
];

export const scheduledReports: ScheduledReport[] = [
  {
    id: "sch_001",
    reportId: "rpt_fin_pnl",
    reportName: "P&L summary",
    cadence: "daily",
    nextRun: "2026-05-10T06:00:00Z",
    recipients: ["finance@bazepay.ng", "cfo@bazepay.ng"],
    format: "pdf",
    status: "active",
    lastStatus: "success",
  },
  {
    id: "sch_002",
    reportId: "rpt_fin_settlement",
    reportName: "Settlement reconciliation",
    cadence: "daily",
    nextRun: "2026-05-10T07:30:00Z",
    recipients: ["recon@bazepay.ng"],
    format: "xlsx",
    status: "active",
    lastStatus: "success",
  },
  {
    id: "sch_003",
    reportId: "rpt_cmp_aml",
    reportName: "AML alerts & SARs",
    cadence: "weekly",
    nextRun: "2026-05-13T08:00:00Z",
    recipients: ["compliance@bazepay.ng", "mlro@bazepay.ng"],
    format: "pdf",
    status: "active",
    lastStatus: "success",
  },
  {
    id: "sch_004",
    reportId: "rpt_ops_uptime",
    reportName: "Provider uptime & latency",
    cadence: "weekly",
    nextRun: "2026-05-12T06:00:00Z",
    recipients: ["ops@bazepay.ng"],
    format: "pdf",
    status: "active",
    lastStatus: "failed",
  },
  {
    id: "sch_005",
    reportId: "rpt_grw_cohort",
    reportName: "Cohort retention",
    cadence: "monthly",
    nextRun: "2026-06-01T09:00:00Z",
    recipients: ["growth@bazepay.ng"],
    format: "xlsx",
    status: "paused",
    lastStatus: "success",
  },
  {
    id: "sch_006",
    reportId: "rpt_prd_cards",
    reportName: "Cards portfolio",
    cadence: "weekly",
    nextRun: "2026-05-13T10:00:00Z",
    recipients: ["cards@bazepay.ng"],
    format: "csv",
    status: "active",
    lastStatus: "success",
  },
];

export const exportsHistory: ExportRow[] = [
  {
    id: "exp_5421",
    reportName: "Transactions volume",
    category: "operations",
    requestedBy: "Adaeze O.",
    requestedAt: "2026-05-09T07:42:00Z",
    rangeFrom: "2026-05-01",
    rangeTo: "2026-05-08",
    format: "csv",
    rows: 248_103,
    sizeKb: 18_420,
    status: "ready",
    expiresAt: "2026-05-16T07:42:00Z",
  },
  {
    id: "exp_5420",
    reportName: "Settlement reconciliation",
    category: "financial",
    requestedBy: "system",
    requestedAt: "2026-05-09T07:30:00Z",
    rangeFrom: "2026-05-08",
    rangeTo: "2026-05-08",
    format: "xlsx",
    rows: 1_204,
    sizeKb: 312,
    status: "ready",
    expiresAt: "2026-05-16T07:30:00Z",
  },
  {
    id: "exp_5419",
    reportName: "AML alerts & SARs",
    category: "compliance",
    requestedBy: "Tobi A.",
    requestedAt: "2026-05-09T06:55:00Z",
    rangeFrom: "2026-04-09",
    rangeTo: "2026-05-09",
    format: "pdf",
    rows: 412,
    sizeKb: 1_804,
    status: "ready",
    expiresAt: "2026-05-16T06:55:00Z",
  },
  {
    id: "exp_5418",
    reportName: "Provider uptime & latency",
    category: "operations",
    requestedBy: "system",
    requestedAt: "2026-05-09T06:00:00Z",
    rangeFrom: "2026-05-02",
    rangeTo: "2026-05-08",
    format: "pdf",
    rows: 96,
    sizeKb: 904,
    status: "failed",
    expiresAt: "2026-05-16T06:00:00Z",
  },
  {
    id: "exp_5417",
    reportName: "Cards portfolio",
    category: "product",
    requestedBy: "Funke B.",
    requestedAt: "2026-05-09T05:18:00Z",
    rangeFrom: "2026-05-01",
    rangeTo: "2026-05-08",
    format: "xlsx",
    rows: 38_410,
    sizeKb: 4_120,
    status: "ready",
    expiresAt: "2026-05-16T05:18:00Z",
  },
  {
    id: "exp_5416",
    reportName: "Referral attribution",
    category: "growth",
    requestedBy: "Chinedu E.",
    requestedAt: "2026-05-09T04:32:00Z",
    rangeFrom: "2026-04-09",
    rangeTo: "2026-05-09",
    format: "csv",
    rows: 5_420,
    sizeKb: 612,
    status: "ready",
    expiresAt: "2026-05-16T04:32:00Z",
  },
  {
    id: "exp_5415",
    reportName: "KYC funnel",
    category: "compliance",
    requestedBy: "Tobi A.",
    requestedAt: "2026-05-09T03:10:00Z",
    rangeFrom: "2026-04-09",
    rangeTo: "2026-05-09",
    format: "csv",
    rows: 12_840,
    sizeKb: 1_280,
    status: "ready",
    expiresAt: "2026-05-16T03:10:00Z",
  },
  {
    id: "exp_5414",
    reportName: "P&L summary",
    category: "financial",
    requestedBy: "system",
    requestedAt: "2026-05-09T05:30:00Z",
    rangeFrom: "2026-04-10",
    rangeTo: "2026-05-09",
    format: "pdf",
    rows: 30,
    sizeKb: 412,
    status: "ready",
    expiresAt: "2026-05-16T05:30:00Z",
  },
  {
    id: "exp_5413",
    reportName: "eSIM activations",
    category: "product",
    requestedBy: "Ifeoma N.",
    requestedAt: "2026-05-08T23:48:00Z",
    rangeFrom: "2026-05-01",
    rangeTo: "2026-05-08",
    format: "xlsx",
    rows: 9_104,
    sizeKb: 1_104,
    status: "expired",
    expiresAt: "2026-05-09T00:00:00Z",
  },
  {
    id: "exp_5412",
    reportName: "Cohort retention",
    category: "growth",
    requestedBy: "Funke B.",
    requestedAt: "2026-05-08T22:14:00Z",
    rangeFrom: "2026-02-08",
    rangeTo: "2026-05-08",
    format: "xlsx",
    rows: 312,
    sizeKb: 88,
    status: "ready",
    expiresAt: "2026-05-15T22:14:00Z",
  },
];

export const categoryLabel: Record<ReportCategory, string> = {
  financial: "Financial",
  operations: "Operations",
  compliance: "Compliance",
  growth: "Growth",
  product: "Product",
};

export const categoryTone: Record<ReportCategory, string> = {
  financial: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  operations: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  compliance: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  growth: "bg-violet-500/10 text-violet-600 border-violet-500/20",
  product: "bg-pink-500/10 text-pink-600 border-pink-500/20",
};

export const statusTone: Record<string, string> = {
  ready: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  running: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  queued: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  failed: "bg-rose-500/10 text-rose-600 border-rose-500/20",
  expired: "bg-muted text-muted-foreground border-border",
  success: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  active: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  paused: "bg-muted text-muted-foreground border-border",
};

export const fmtRelative = (iso: string) => {
  const now = new Date(2026, 4, 9, 9, 0, 0).getTime();
  const t = new Date(iso).getTime();
  const diff = Math.round((now - t) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.round(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.round(diff / 3600)}h ago`;
  const d = Math.round(diff / 86400);
  if (d < 0) return `in ${Math.abs(d)}d`;
  return `${d}d ago`;
};

export const fmtBytes = (kb: number) => {
  if (kb < 1024) return `${kb.toFixed(0)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
};

export const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-NG", { year: "numeric", month: "short", day: "numeric" });

// Generate a downloadable CSV from rows of objects.
export const downloadCsv = (filename: string, rows: Record<string, string | number>[]) => {
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const escape = (v: string | number) => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [headers.join(","), ...rows.map((r) => headers.map((h) => escape(r[h])).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

// Compute next run from cadence relative to a base date.
export const nextRunFromCadence = (cadence: ScheduledReport["cadence"], from = new Date(2026, 4, 9, 6, 0, 0)) => {
  const d = new Date(from);
  if (cadence === "daily") d.setDate(d.getDate() + 1);
  else if (cadence === "weekly") d.setDate(d.getDate() + 7);
  else if (cadence === "monthly") d.setMonth(d.getMonth() + 1);
  else d.setMonth(d.getMonth() + 3);
  return d.toISOString();
};

