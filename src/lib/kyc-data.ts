// Mock KYC submissions dataset. Will be replaced by Lovable Cloud.

import { users, type User, type Country } from "./users-data";

export type KycDecision = "pending" | "in_review" | "approved" | "rejected" | "more_info";
export type IdDocType = "NIN" | "BVN" | "Passport" | "Drivers License" | "Voters Card";

export type KycSubmission = {
  id: string;
  userId: string;
  user: User;
  submittedAt: string;
  decision: KycDecision;
  decidedAt?: string;
  decidedBy?: string;
  reviewer?: string;
  idType: IdDocType;
  idNumberLast4: string;
  livenessScore: number; // 0-1
  ocrMatchScore: number; // 0-1
  sanctionsHit: boolean;
  pepHit: boolean;
  duplicateFaceHit: boolean;
  riskScore: number; // mirrors user
  ipGeo: string;
  deviceFingerprint: string;
  notes?: string;
};

const REVIEWERS = ["Ada Reviewer", "Tunde Compliance", "Ngozi K.", "—"];
const ID_TYPES: IdDocType[] = ["NIN", "BVN", "Passport", "Drivers License", "Voters Card"];
const GEO_BY_COUNTRY: Record<Country, string> = {
  NG: "Lagos, NG",
  GH: "Accra, GH",
  KE: "Nairobi, KE",
  ZA: "Cape Town, ZA",
  UK: "London, UK",
  US: "New York, US",
};

function seeded(i: number) {
  const x = Math.sin(i * 7919 + 3137) * 233280;
  return x - Math.floor(x);
}

function makeSub(u: User, i: number): KycSubmission {
  const r = seeded(i + u.id.charCodeAt(2));
  const r2 = seeded(i * 3 + 11);
  // Distribute decisions: ~45% pending, 15% in_review, 25% approved, 10% rejected, 5% more_info
  let decision: KycDecision;
  const slot = i % 20;
  if (slot < 9) decision = "pending";
  else if (slot < 12) decision = "in_review";
  else if (slot < 17) decision = "approved";
  else if (slot < 19) decision = "rejected";
  else decision = "more_info";
  if (u.kyc === "verified" && (decision === "pending" || decision === "in_review")) decision = "approved";
  if (u.kyc === "unverified" && (decision === "approved")) decision = "pending";

  const submittedDays = Math.floor(r * 14);
  const submittedAt = new Date(Date.now() - submittedDays * 86_400_000 - Math.floor(r2 * 12) * 3_600_000).toISOString();
  const decided = decision === "approved" || decision === "rejected" || decision === "more_info";
  const decidedAt = decided
    ? new Date(new Date(submittedAt).getTime() + Math.floor(r * 36 + 1) * 3_600_000).toISOString()
    : undefined;

  const sanctions = r > 0.93;
  const pep = r > 0.88;

  return {
    id: `kyc_${(20000 + i).toString().padStart(5, "0")}`,
    userId: u.id,
    user: u,
    submittedAt,
    decision,
    decidedAt,
    decidedBy: decided ? REVIEWERS[i % (REVIEWERS.length - 1)] : undefined,
    reviewer: decision === "in_review" ? REVIEWERS[i % (REVIEWERS.length - 1)] : undefined,
    idType: ID_TYPES[i % ID_TYPES.length],
    idNumberLast4: String(1000 + Math.floor(r2 * 8999)).slice(-4),
    livenessScore: 0.6 + r * 0.4,
    ocrMatchScore: 0.5 + r2 * 0.5,
    sanctionsHit: sanctions,
    pepHit: pep,
    duplicateFaceHit: r > 0.96,
    riskScore: u.riskScore,
    ipGeo: GEO_BY_COUNTRY[u.country],
    deviceFingerprint: `fp_${u.id.slice(-4)}${i.toString(16)}`,
  };
}

export const kycSubmissions: KycSubmission[] = users.map((u, i) => makeSub(u, i + 1));

export const getKycSubmission = (id: string) => kycSubmissions.find((s) => s.id === id);
export const getKycByUser = (userId: string) => kycSubmissions.find((s) => s.userId === userId);

export const decisionLabel: Record<KycDecision, string> = {
  pending: "Pending",
  in_review: "In review",
  approved: "Approved",
  rejected: "Rejected",
  more_info: "More info",
};

export const decisionTone: Record<KycDecision, string> = {
  pending: "bg-warning/20 text-warning-foreground border-warning/40",
  in_review: "bg-primary/10 text-primary border-primary/30",
  approved: "bg-success/15 text-success border-success/30",
  rejected: "bg-destructive/10 text-destructive border-destructive/30",
  more_info: "bg-muted text-muted-foreground border-border",
};

// SLA helpers
export const ageHours = (iso: string) => Math.max(0, (Date.now() - new Date(iso).getTime()) / 3_600_000);
export const slaTone = (hrs: number) =>
  hrs > 48 ? "text-destructive" : hrs > 24 ? "text-warning-foreground" : "text-muted-foreground";
