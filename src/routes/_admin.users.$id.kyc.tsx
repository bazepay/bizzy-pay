import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, AlertTriangle, FileText, Camera } from "lucide-react";
import { getUser, tierLabel } from "@/lib/users-data";

export const Route = createFileRoute("/_admin/users/$id/kyc")({
  component: KycDossier,
});

function KycDossier() {
  const { id } = Route.useParams();
  const user = getUser(id)!;
  const liveness = 0.94;

  const checks = [
    { label: "Liveness check", pass: true, detail: `${(liveness * 100).toFixed(1)}% confidence` },
    { label: "Document OCR match", pass: true, detail: "Names match" },
    { label: "Sanctions / PEP", pass: user.riskScore < 70, detail: user.riskScore < 70 ? "No hits" : "1 PEP-adjacent hit" },
    { label: "Address verification", pass: user.kycTier >= 2, detail: user.kycTier >= 2 ? "Utility bill on file" : "Not provided" },
    { label: "Device fingerprint", pass: true, detail: "Trusted device" },
    { label: "IP / geo consistency", pass: true, detail: "Lagos, NG" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 space-y-4">
        <Card className="shadow-card">
          <CardHeader className="pb-2"><CardTitle className="text-base">KYC dossier</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="aspect-square rounded-md bg-gradient-to-br from-muted to-muted/50 flex flex-col items-center justify-center text-muted-foreground">
                <Camera className="h-8 w-8 mb-2" />
                <div className="text-xs">Selfie</div>
                <div className="text-[10px] mt-1">Liveness {Math.round(liveness * 100)}%</div>
              </div>
              <div className="aspect-square rounded-md bg-gradient-to-br from-muted to-muted/50 flex flex-col items-center justify-center text-muted-foreground">
                <FileText className="h-8 w-8 mb-2" />
                <div className="text-xs">National ID</div>
                <div className="text-[10px] mt-1">{user.ninLast4 ? "•••• " + user.ninLast4 : "—"}</div>
              </div>
            </div>

            <div className="space-y-1.5">
              {checks.map((c) => (
                <div key={c.label} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/40">
                  <div className="flex items-center gap-2">
                    {c.pass ? (
                      <CheckCircle2 className="h-4 w-4 text-success" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-warning-foreground" />
                    )}
                    <span className="text-sm">{c.label}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{c.detail}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <Card className="shadow-card">
          <CardHeader className="pb-2"><CardTitle className="text-base">Decision</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="text-xs text-muted-foreground">Current tier</div>
              <Badge variant="outline" className="mt-1">{tierLabel(user.kycTier)}</Badge>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Risk score</div>
              <Progress value={user.riskScore} />
              <div className="text-xs mt-1 text-right font-mono">{user.riskScore}/100</div>
            </div>
            <div className="grid grid-cols-1 gap-1.5 pt-2">
              <Button size="sm">Approve · Tier 1</Button>
              <Button size="sm" variant="outline">Approve · Tier 2</Button>
              <Button size="sm" variant="outline">Approve · Tier 3 (4-eyes)</Button>
              <Button size="sm" variant="outline">Request more info</Button>
              <Button size="sm" variant="outline" className="text-destructive">Reject</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="pb-2"><CardTitle className="text-base">Tier limits</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Daily cap</span><span className="font-mono">₦5,000,000</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Monthly cap</span><span className="font-mono">₦50,000,000</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Single txn</span><span className="font-mono">₦2,000,000</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Card issuance</span><span>Allowed</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">International</span><span>{user.kycTier >= 2 ? "Allowed" : "Blocked"}</span></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
