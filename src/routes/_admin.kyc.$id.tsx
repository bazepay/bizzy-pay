import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft, CheckCircle2, AlertTriangle, FileText, Camera, MessageSquareWarning,
  ShieldCheck, ShieldAlert, Fingerprint, Globe, Smartphone, Phone, Mail, MapPin,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  getKycSubmission, decisionLabel, decisionTone, ageHours, slaTone, type KycDecision,
} from "@/lib/kyc-data";
import { riskTone, fmtRelative } from "@/lib/users-data";

export const Route = createFileRoute("/_admin/kyc/$id")({
  head: ({ params }) => ({
    meta: [{ title: `KYC ${params.id} — BazePay Admin` }],
  }),
  component: KycReview,
  notFoundComponent: () => (
    <div className="p-12 text-center">
      <h1 className="text-2xl font-bold">Submission not found</h1>
      <Link to="/kyc" className="text-primary text-sm mt-2 inline-block">Back to queue</Link>
    </div>
  ),
});

function KycReview() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const sub = getKycSubmission(id);
  const [decision, setDecision] = useState<KycDecision | null>(sub?.decision === "pending" || sub?.decision === "in_review" ? null : sub?.decision ?? null);
  const [reviewer, setReviewer] = useState<string | undefined>(sub?.reviewer);
  const [confirm, setConfirm] = useState<null | { type: "approve" | "reject" | "more_info"; title: string; cta: string; danger?: boolean }>(null);
  const [reason, setReason] = useState("");

  if (!sub) {
    return (
      <div className="p-12 text-center">
        <h1 className="text-2xl font-bold">Submission {id} not found</h1>
        <Link to="/kyc" className="text-primary text-sm mt-2 inline-block">Back to queue</Link>
      </div>
    );
  }

  const { user } = sub;
  const hrs = ageHours(sub.submittedAt);
  const finalDecision = decision ?? sub.decision;

  const checks = [
    { label: "Liveness", pass: sub.livenessScore >= 0.8, detail: `${(sub.livenessScore * 100).toFixed(1)}% confidence`, icon: Camera },
    { label: "Document OCR match", pass: sub.ocrMatchScore >= 0.7, detail: `${(sub.ocrMatchScore * 100).toFixed(1)}% similarity`, icon: FileText },
    { label: "Sanctions screening", pass: !sub.sanctionsHit, detail: sub.sanctionsHit ? "1 sanctions hit" : "No hits", icon: ShieldAlert },
    { label: "PEP screening", pass: !sub.pepHit, detail: sub.pepHit ? "PEP-adjacent hit" : "No hits", icon: ShieldCheck },
    { label: "Duplicate face check", pass: !sub.duplicateFaceHit, detail: sub.duplicateFaceHit ? "Match against existing user" : "No duplicates", icon: Fingerprint },
    { label: "IP / Geo consistency", pass: true, detail: sub.ipGeo, icon: Globe },
    { label: "Device fingerprint", pass: true, detail: sub.deviceFingerprint, icon: Smartphone },
  ];

  const ask = (cfg: NonNullable<typeof confirm>) => { setReason(""); setConfirm(cfg); };

  const submit = () => {
    if (!confirm) return;
    const map = { approve: "approved", reject: "rejected", more_info: "more_info" } as const;
    setDecision(map[confirm.type]);
    toast.success(`KYC ${decisionLabel[map[confirm.type]].toLowerCase()} for ${user.name}.`);
    setConfirm(null);
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-5">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <Link to="/kyc" className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground mb-3">
          <ArrowLeft className="h-3 w-3 mr-1" />
          Back to KYC queue
        </Link>

        <Card className="shadow-card overflow-hidden">
          <div className="bg-gradient-hero p-5 flex items-start gap-4 flex-wrap text-primary-foreground">
            <div
              className="h-16 w-16 rounded-full flex items-center justify-center text-lg font-display font-bold text-white shrink-0 ring-2 ring-white/20"
              style={{ backgroundColor: `oklch(0.55 0.18 ${user.avatarHue})` }}
            >
              {user.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
            </div>
            <div className="flex-1 min-w-[260px]">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-display text-2xl font-bold text-primary-foreground">{user.name}</h1>
                <Badge variant="outline" className={`text-xs ${decisionTone[finalDecision]}`}>{decisionLabel[finalDecision]}</Badge>
                <Badge variant="outline" className="text-xs bg-white/10 text-primary-foreground border-white/20 font-mono">{sub.id}</Badge>
              </div>
              <div className="mt-2 flex items-center gap-4 text-sm text-primary-foreground/75 flex-wrap">
                <span className="inline-flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" />{user.phone}</span>
                <span className="inline-flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" />{user.email}</span>
                <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{sub.ipGeo}</span>
                <Link to="/users/$id" params={{ id: user.id }} className="font-mono text-xs underline-offset-2 hover:underline">
                  {user.id}
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 text-right">
              <div>
                <div className="text-[11px] uppercase tracking-wider text-primary-foreground/60">Risk</div>
                <div className={`font-display text-lg font-bold ${riskTone(sub.riskScore)}`}>{sub.riskScore}</div>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wider text-primary-foreground/60">Submitted</div>
                <div className="font-display text-lg font-bold text-primary-foreground">{fmtRelative(sub.submittedAt)}</div>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wider text-primary-foreground/60">In queue</div>
                <div className={`font-display text-lg font-bold ${slaTone(hrs)}`}>
                  {hrs < 1 ? "<1h" : `${hrs.toFixed(0)}h`}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <Card className="shadow-card">
            <CardHeader className="pb-2"><CardTitle className="text-base">Documents</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <DocPlaceholder icon={Camera} label="Selfie / liveness" hint={`${(sub.livenessScore * 100).toFixed(0)}% confidence`} />
              <DocPlaceholder icon={FileText} label={sub.idType} hint={`•••• ${sub.idNumberLast4}`} />
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="pb-2"><CardTitle className="text-base">Automated checks</CardTitle></CardHeader>
            <CardContent className="space-y-1.5">
              {checks.map((c) => {
                const Icon = c.icon;
                return (
                  <div key={c.label} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/40">
                    <div className="flex items-center gap-2.5">
                      <div className={`h-7 w-7 rounded-md flex items-center justify-center ${c.pass ? "bg-success/15 text-success" : "bg-destructive/10 text-destructive"}`}>
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">{c.label}</div>
                        <div className="text-xs text-muted-foreground">{c.detail}</div>
                      </div>
                    </div>
                    {c.pass ? (
                      <CheckCircle2 className="h-4 w-4 text-success" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="shadow-card">
            <CardHeader className="pb-2"><CardTitle className="text-base">Decision</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-xs text-muted-foreground">Current</div>
                <Badge variant="outline" className={`mt-1 ${decisionTone[finalDecision]}`}>{decisionLabel[finalDecision]}</Badge>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Risk score</div>
                <Progress value={sub.riskScore} />
                <div className="text-xs mt-1 text-right font-mono">{sub.riskScore}/100</div>
              </div>
              <div className="grid grid-cols-1 gap-1.5 pt-2">
                {(finalDecision === "pending" || finalDecision === "in_review") && (
                  <Button
                    size="sm"
                    variant={reviewer ? "outline" : "secondary"}
                    onClick={() => {
                      if (reviewer) {
                        setReviewer(undefined);
                        toast.success("Review released back to the queue.");
                      } else {
                        setReviewer("You");
                        toast.success("You're now reviewing this submission.");
                      }
                    }}
                  >
                    {reviewer ? `Release (${reviewer})` : "Claim review"}
                  </Button>
                )}
                <Button
                  size="sm"
                  onClick={() => ask({ type: "approve", title: "Approve KYC?", cta: "Approve" })}
                >
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" /> Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => ask({ type: "more_info", title: "Request more information?", cta: "Request" })}
                >
                  <MessageSquareWarning className="h-3.5 w-3.5 mr-1.5" /> Request more info
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-destructive"
                  onClick={() => ask({ type: "reject", title: "Reject KYC?", cta: "Reject", danger: true })}
                >
                  <AlertTriangle className="h-3.5 w-3.5 mr-1.5" /> Reject
                </Button>
              </div>
              {sub.decidedAt && sub.decidedBy && (
                <div className="text-xs text-muted-foreground border-t pt-2 mt-2">
                  Last decided by <span className="font-medium">{sub.decidedBy}</span> · {fmtRelative(sub.decidedAt)}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="pb-2"><CardTitle className="text-base">Quick links</CardTitle></CardHeader>
            <CardContent className="space-y-1.5">
              <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => navigate({ to: "/users/$id", params: { id: user.id } })}>
                Open user profile
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => navigate({ to: "/users/$id/devices", params: { id: user.id } })}>
                Devices &amp; sessions
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => navigate({ to: "/users/$id/transactions", params: { id: user.id } })}>
                Transaction history
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => navigate({ to: "/users/$id/notes", params: { id: user.id } })}>
                Compliance notes
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog open={confirm !== null} onOpenChange={(o) => !o && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirm?.title}</AlertDialogTitle>
            <AlertDialogDescription>
              This decision will be persisted to the audit log and notified to the user via email and push.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2">
            <Label htmlFor="reason">Reason (audit log)</Label>
            <Textarea id="reason" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Why are you taking this action?" />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={reason.trim().length < 4}
              className={confirm?.danger ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
              onClick={submit}
            >
              {confirm?.cta}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function DocPlaceholder({ icon: Icon, label, hint }: { icon: typeof Camera; label: string; hint: string }) {
  return (
    <div className="aspect-square rounded-md bg-gradient-to-br from-muted to-muted/50 flex flex-col items-center justify-center text-muted-foreground border border-dashed border-border">
      <Icon className="h-8 w-8 mb-2" />
      <div className="text-xs font-medium">{label}</div>
      <div className="text-[10px] mt-1">{hint}</div>
    </div>
  );
}
