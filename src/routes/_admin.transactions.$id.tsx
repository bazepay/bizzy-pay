import { createFileRoute, Link, useNavigate, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft, ArrowDownLeft, ArrowUpRight, AlertTriangle, RotateCcw, ShieldAlert, Flag, Copy, ExternalLink, CheckCircle2, XCircle, Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { fmtNgn } from "@/lib/mock-data";
import {
  getTxn, txnStatusTone, txnStatusLabel, txnTypeLabel, type TxnStatus,
} from "@/lib/txn-data";
import { riskTone } from "@/lib/users-data";
import { toast } from "sonner";

export const Route = createFileRoute("/_admin/transactions/$id")({
  loader: ({ params }) => {
    const txn = getTxn(params.id);
    if (!txn) throw notFound();
    return { txn };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.txn.id ?? "Transaction"} — BazePay Admin` },
      { name: "description", content: "Inspect a single transaction with audit trail and risk signals." },
    ],
  }),
  notFoundComponent: () => (
    <div className="p-10 text-center">
      <h1 className="font-display text-xl">Transaction not found</h1>
      <Link to="/transactions" className="text-primary text-sm mt-2 inline-block">Back to transactions</Link>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="p-10 text-center text-sm text-destructive">{error.message}</div>
  ),
  component: TxnDetail,
});

function TxnDetail() {
  const { txn: initial } = Route.useLoaderData();
  const navigate = useNavigate();
  const [status, setStatus] = useState<TxnStatus>(initial.status);
  const [flagged, setFlagged] = useState(initial.flagged);

  const txn = { ...initial, status, flagged };

  const StatusIcon = status === "success" ? CheckCircle2 : status === "failed" || status === "reversed" ? XCircle : Clock;

  const apply = (next: TxnStatus, label: string) => {
    setStatus(next);
    toast.success(`${label} · audit logged`);
  };

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-5">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/transactions" })}>
          <ArrowLeft className="h-4 w-4 mr-1.5" /> Back
        </Button>
        <div className="text-xs text-muted-foreground font-mono">{txn.ref}</div>
      </motion.div>

      <Card className="shadow-card overflow-hidden">
        <div className="bg-gradient-primary p-6 text-primary-foreground">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs opacity-80">
                <span className="font-mono">{txn.id}</span>
                <button onClick={() => { navigator.clipboard.writeText(txn.id); toast.success("Copied"); }} className="hover:opacity-100 opacity-70">
                  <Copy className="h-3 w-3" />
                </button>
              </div>
              <h1 className="font-display text-3xl font-bold mt-1 flex items-center gap-2">
                {txn.direction === "in" ? <ArrowDownLeft className="h-7 w-7" /> : <ArrowUpRight className="h-7 w-7" />}
                {txn.direction === "in" ? "+" : "−"}{fmtNgn(txn.amountNgn)}
              </h1>
              <div className="text-sm opacity-90 mt-1">
                {txnTypeLabel(txn.type)} · {txn.provider} · fee {fmtNgn(txn.feeNgn)}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={`text-xs border-white/30 bg-white/10 text-primary-foreground`}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {txnStatusLabel[status]}
              </Badge>
              {flagged && (
                <Badge variant="outline" className="text-xs bg-warning/30 border-warning/50 text-primary-foreground">
                  <AlertTriangle className="h-3 w-3 mr-1" /> Flagged
                </Badge>
              )}
            </div>
          </div>
        </div>
        <CardContent className="p-5 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <Field label="Status">
            <Badge variant="outline" className={`text-xs ${txnStatusTone[status]}`}>{txnStatusLabel[status]}</Badge>
          </Field>
          <Field label="Channel"><span className="capitalize">{txn.channel}</span></Field>
          <Field label="Risk"><span className={`font-mono ${riskTone(txn.riskScore)}`}>{txn.riskScore}</span></Field>
          <Field label="When">{new Date(txn.at).toLocaleString()}</Field>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <Card className="shadow-card">
            <CardHeader><CardTitle className="text-base">Counterparty & money</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <Field label="From">
                  <Link to="/users/$id" params={{ id: txn.user.id }} className="text-primary hover:underline inline-flex items-center gap-1">
                    {txn.user.name} <ExternalLink className="h-3 w-3" />
                  </Link>
                  <div className="text-xs text-muted-foreground">{txn.user.email}</div>
                </Field>
                <Field label="To">
                  {txn.counterparty ? (
                    <>
                      <div>{txn.counterparty.name}</div>
                      <div className="text-xs text-muted-foreground font-mono">
                        {txn.counterparty.bank ? `${txn.counterparty.bank} · ` : ""}{txn.counterparty.account ?? ""}
                      </div>
                    </>
                  ) : (
                    <span className="text-muted-foreground">{txn.provider}</span>
                  )}
                </Field>
              </div>
              <Separator />
              <div className="grid grid-cols-3 gap-4 text-sm">
                <Field label="Gross">{fmtNgn(txn.amountNgn)}</Field>
                <Field label="Fee">{fmtNgn(txn.feeNgn)}</Field>
                <Field label="Net">{fmtNgn(txn.amountNgn - txn.feeNgn)}</Field>
              </div>
              {txn.failureReason && (
                <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm border border-destructive/30">
                  <div className="font-medium">Failure reason</div>
                  <div className="text-xs mt-0.5">{txn.failureReason}</div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader><CardTitle className="text-base">Risk & device</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <Field label="Risk score"><span className={`font-mono ${riskTone(txn.riskScore)}`}>{txn.riskScore}</span></Field>
              <Field label="Device">{txn.device}</Field>
              <Field label="Geo">{txn.geo}</Field>
              <Field label="IP"><span className="font-mono text-xs">{txn.ip}</span></Field>
              <Field label="Channel"><span className="capitalize">{txn.channel}</span></Field>
              <Field label="Provider">{txn.provider}</Field>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader><CardTitle className="text-base">Timeline</CardTitle></CardHeader>
            <CardContent>
              <ol className="space-y-3 text-sm">
                <TimelineItem at={txn.at} title="Initiated" body={`${txnTypeLabel(txn.type)} via ${txn.channel}`} />
                <TimelineItem at={txn.at} title="Sent to provider" body={txn.provider} />
                {txn.settledAt && <TimelineItem at={txn.settledAt} title="Settled" body="Provider confirmed" tone="success" />}
                {status === "failed" && <TimelineItem at={txn.at} title="Failed" body={txn.failureReason ?? "Unknown error"} tone="destructive" />}
                {status === "reversed" && <TimelineItem at={txn.at} title="Reversed" body="Funds returned to user" tone="warning" />}
                {status === "review" && <TimelineItem at={txn.at} title="Held for review" body="Risk thresholds exceeded" tone="warning" />}
              </ol>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-5">
          <Card className="shadow-card">
            <CardHeader><CardTitle className="text-base">Actions</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <ActionDialog
                trigger={<Button size="sm" variant="outline" className="w-full justify-start"><RotateCcw className="h-3.5 w-3.5 mr-2" /> Reverse transaction</Button>}
                title="Reverse this transaction?"
                description="The user will be credited back the gross amount. This action is logged and cannot be undone."
                confirmLabel="Reverse"
                onConfirm={() => apply("reversed", "Reversal queued")}
              />
              <ActionDialog
                trigger={<Button size="sm" variant="outline" className="w-full justify-start"><ShieldAlert className="h-3.5 w-3.5 mr-2" /> Mark for review</Button>}
                title="Hold for compliance review?"
                description="Funds remain held until a compliance officer clears or reverses the transaction."
                confirmLabel="Hold"
                onConfirm={() => apply("review", "Held for review")}
              />
              <ActionDialog
                trigger={<Button size="sm" variant="outline" className="w-full justify-start"><CheckCircle2 className="h-3.5 w-3.5 mr-2" /> Force success</Button>}
                title="Force-mark as success?"
                description="Use only when the provider confirmed settlement out-of-band."
                confirmLabel="Mark success"
                onConfirm={() => apply("success", "Marked success")}
              />
              <Button
                size="sm"
                variant={flagged ? "secondary" : "outline"}
                className="w-full justify-start"
                onClick={() => { setFlagged((f: boolean) => !f); toast.success(flagged ? "Unflagged" : "Flagged for fraud team"); }}
              >
                <Flag className="h-3.5 w-3.5 mr-2" />
                {flagged ? "Remove flag" : "Flag for fraud"}
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader><CardTitle className="text-base">References</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <Field label="Internal id"><span className="font-mono text-xs">{txn.id}</span></Field>
              <Field label="Reference"><span className="font-mono text-xs">{txn.ref}</span></Field>
              <Link to="/users/$id" params={{ id: txn.user.id }} className="text-primary text-sm hover:underline inline-flex items-center gap-1">
                Open user profile <ExternalLink className="h-3 w-3" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-0.5">{children}</div>
    </div>
  );
}

function TimelineItem({ at, title, body, tone = "primary" }: { at: string; title: string; body: string; tone?: "primary" | "success" | "warning" | "destructive" }) {
  const dot = {
    primary: "bg-primary",
    success: "bg-success",
    warning: "bg-warning",
    destructive: "bg-destructive",
  }[tone];
  return (
    <li className="flex gap-3">
      <div className="pt-1.5"><div className={`h-2 w-2 rounded-full ${dot}`} /></div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div className="font-medium">{title}</div>
          <div className="text-xs text-muted-foreground">{new Date(at).toLocaleTimeString()}</div>
        </div>
        <div className="text-xs text-muted-foreground">{body}</div>
      </div>
    </li>
  );
}

function ActionDialog({
  trigger, title, description, confirmLabel, onConfirm,
}: {
  trigger: React.ReactNode; title: string; description: string;
  confirmLabel: string; onConfirm: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  return (
    <AlertDialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setReason(""); }}>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-2">
          <Label htmlFor="reason">Audit reason</Label>
          <Textarea id="reason" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Why are you taking this action?" />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              if (!reason.trim()) {
                e.preventDefault();
                toast.error("Add an audit reason first.");
                return;
              }
              onConfirm();
              setOpen(false);
              setReason("");
            }}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
