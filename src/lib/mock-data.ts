// Centralised mock data for the admin app. Will be replaced by Lovable Cloud.

export type Currency = "NGN" | "USD" | "EUR";

export const fmtNgn = (n: number) => "₦" + Math.round(n).toLocaleString("en-NG");
export const fmtNum = (n: number) => Math.round(n).toLocaleString("en-NG");
export const fmtPct = (n: number) => `${n >= 0 ? "+" : ""}${n.toFixed(1)}%`;

// ---- KPI / dashboard ----
export const kpis = {
  activeUsers: { value: 48_213, delta: 12.4 },
  newSignups: { value: 1_284, delta: 8.1 },
  kycConversion: { value: 73.2, delta: 2.6 },
  processedVolumeNgn: { value: 1_842_530_000, delta: 18.3 },
  grossFeesNgn: { value: 22_104_000, delta: 14.7 },
  netRevenueNgn: { value: 14_980_000, delta: 11.9 },
  cardsIssued: { value: 9_812, delta: 6.2 },
  esimsActivated: { value: 2_137, delta: 21.7 },
  numbersLeased: { value: 1_044, delta: 4.0 },
  openCompliance: { value: 17, delta: -3.0 },
  kycBacklog: { value: 41, delta: -8.0 },
  liveChatQueue: { value: 6, delta: 0 },
};

export const volumeSeries = [
  { day: "Mon", volume: 198_000_000, fees: 2_400_000 },
  { day: "Tue", volume: 224_000_000, fees: 2_700_000 },
  { day: "Wed", volume: 261_000_000, fees: 3_120_000 },
  { day: "Thu", volume: 247_000_000, fees: 2_980_000 },
  { day: "Fri", volume: 312_000_000, fees: 3_740_000 },
  { day: "Sat", volume: 289_000_000, fees: 3_460_000 },
  { day: "Sun", volume: 311_530_000, fees: 3_704_000 },
];

export const serviceBreakdown = [
  { name: "Transfers", value: 42 },
  { name: "Bill pay", value: 23 },
  { name: "Card spend", value: 19 },
  { name: "eSIM", value: 9 },
  { name: "Numbers", value: 7 },
];

export const recentAlerts = [
  { id: "a1", level: "high" as const, title: "Flutterwave latency spike", body: "p95 1.8s last 15m", at: "2m ago" },
  { id: "a2", level: "med" as const, title: "KYC backlog above SLA", body: "12 cases > 24h", at: "9m ago" },
  { id: "a3", level: "low" as const, title: "Low eSIM stock — UK", body: "23 QRs remaining", at: "23m ago" },
  { id: "a4", level: "med" as const, title: "Velocity rule triggered", body: "5 users flagged", at: "41m ago" },
];

// Sparkline series for hero KPIs (14 points)
export const spark = {
  users: [38, 41, 39, 44, 46, 45, 49, 47, 50, 52, 51, 55, 57, 60],
  volume: [180, 195, 210, 198, 224, 261, 247, 270, 289, 312, 298, 320, 345, 360],
  revenue: [9.2, 10.1, 10.8, 11.4, 11.0, 12.1, 12.7, 13.0, 13.6, 13.9, 14.2, 14.6, 14.8, 15.0],
  kyc: [68, 69, 70, 70.5, 71, 71.6, 72, 72.4, 72.8, 73, 73.1, 73.2, 73.4, 73.5],
};

// Operational queues — drives the actionable "Action center"
export const opsQueues = [
  { key: "kyc", label: "KYC review", count: 41, sla: "24h", breaching: 12, tone: "warning" as const, href: "/compliance/kyc" },
  { key: "payouts", label: "Payouts to approve", count: 8, sla: "4h", breaching: 1, tone: "primary" as const, href: "/finance/payouts" },
  { key: "disputes", label: "Open disputes", count: 14, sla: "72h", breaching: 3, tone: "destructive" as const, href: "/finance/disputes" },
  { key: "chat", label: "Live chat queue", count: 6, sla: "5m", breaching: 0, tone: "success" as const, href: "/support/chat" },
  { key: "fraud", label: "Fraud signals", count: 5, sla: "1h", breaching: 2, tone: "destructive" as const, href: "/risk/signals" },
];

// Provider / system health
export const systemHealth = [
  { name: "Flutterwave", status: "degraded" as const, latency: "1.8s", uptime: "99.21%" },
  { name: "Paystack", status: "ok" as const, latency: "240ms", uptime: "99.98%" },
  { name: "Reloadly", status: "ok" as const, latency: "410ms", uptime: "99.94%" },
  { name: "Sumsub KYC", status: "ok" as const, latency: "620ms", uptime: "99.91%" },
  { name: "eSIM Provider", status: "down" as const, latency: "—", uptime: "97.10%" },
];

export const recentActivity = [
  { id: "ac1", actor: "Ada O.", action: "approved KYC", target: "user u_8341", at: "1m ago" },
  { id: "ac2", actor: "system", action: "auto-refunded", target: "txn tx_91220", at: "4m ago" },
  { id: "ac3", actor: "Tunde M.", action: "froze card", target: "vc_4421", at: "12m ago" },
  { id: "ac4", actor: "Ngozi A.", action: "approved payout", target: "₦1,450,000", at: "18m ago" },
  { id: "ac5", actor: "system", action: "triggered freeze", target: "user u_2018", at: "27m ago" },
];
