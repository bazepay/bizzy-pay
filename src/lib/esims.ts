// Mock eSIM store. Replace with API calls when backend is wired.
export type EsimStatus = "active" | "expiring" | "expired" | "pending";
export type EsimScope = "local" | "regional" | "global";

export type Esim = {
  id: string;
  iccid: string;
  label: string;
  scope: EsimScope;
  region: string;
  flag: string;
  planName: string;
  status: EsimStatus;
  dataTotalGb: number; // -1 = unlimited
  dataUsedGb: number;
  daysLeft: number;
  totalDays: number;
  expiresAt: string; // ISO
  autoRenew: boolean;
  network: string;
  has5g: boolean;
  qrPayload: string; // LPA: string for QR
  smdp: string;
  activationCode: string;
  installedOn?: string; // device label
  email: string;
};

export const esims: Esim[] = [
  {
    id: "esim-ng-01",
    iccid: "8923 4101 2345 6789 012",
    label: "Lagos · Nigeria",
    scope: "local",
    region: "Nigeria",
    flag: "🇳🇬",
    planName: "10 GB · 30 Days",
    status: "active",
    dataTotalGb: 10,
    dataUsedGb: 8.8,
    daysLeft: 12,
    totalDays: 30,
    expiresAt: "2026-05-20T00:00:00Z",
    autoRenew: true,
    network: "3G/4G/5G",
    has5g: true,
    qrPayload: "LPA:1$smdp.bazepay.com$NG-ACT-91X3-K7QH-2401",
    smdp: "smdp.bazepay.com",
    activationCode: "NG-ACT-91X3-K7QH-2401",
    installedOn: "iPhone 15 Pro",
    email: "you@bazepay.com",
  },
  {
    id: "esim-gl-01",
    iccid: "8923 4101 9988 7766 554",
    label: "World tour",
    scope: "global",
    region: "192+ countries",
    flag: "🌍",
    planName: "20 GB · 365 Days",
    status: "active",
    dataTotalGb: 20,
    dataUsedGb: 15.2,
    daysLeft: 21,
    totalDays: 365,
    expiresAt: "2026-05-29T00:00:00Z",
    autoRenew: false,
    network: "3G/4G/5G",
    has5g: true,
    qrPayload: "LPA:1$smdp.bazepay.com$GL-ACT-77FA-LP02-9921",
    smdp: "smdp.bazepay.com",
    activationCode: "GL-ACT-77FA-LP02-9921",
    installedOn: "iPhone 15 Pro",
    email: "you@bazepay.com",
  },
  {
    id: "esim-af-01",
    iccid: "8923 4101 5544 3322 110",
    label: "Africa tour",
    scope: "regional",
    region: "Africa · 29 countries",
    flag: "🌍",
    planName: "5 GB · 15 Days",
    status: "expired",
    dataTotalGb: 5,
    dataUsedGb: 5,
    daysLeft: 0,
    totalDays: 15,
    expiresAt: "2026-04-22T00:00:00Z",
    autoRenew: false,
    network: "3G/4G",
    has5g: false,
    qrPayload: "LPA:1$smdp.bazepay.com$AF-ACT-22BB-XX01-4410",
    smdp: "smdp.bazepay.com",
    activationCode: "AF-ACT-22BB-XX01-4410",
    email: "you@bazepay.com",
  },
];

export function esimStatusMeta(s: EsimStatus) {
  switch (s) {
    case "active":
      return { label: "Active", className: "bg-success/15 text-success" };
    case "expiring":
      return { label: "Expiring", className: "bg-amber-500/15 text-amber-600" };
    case "expired":
      return { label: "Expired", className: "bg-destructive/15 text-destructive" };
    case "pending":
      return { label: "Not installed", className: "bg-primary/15 text-primary" };
  }
}

export function dataPct(e: Esim): number {
  if (e.dataTotalGb < 0) return 0;
  if (!e.dataTotalGb) return 0;
  return Math.min(100, Math.max(2, Math.round((e.dataUsedGb / e.dataTotalGb) * 100)));
}
