import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Wallet, RefreshCcw, Plus, Minus, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { fmtNgn, fmtNum } from "@/lib/mock-data";
import { floatAccounts } from "@/lib/wallets-data";
import { toast } from "sonner";

export const Route = createFileRoute("/_admin/wallets/")({
  component: FloatPage,
});

const fmtCcy = (ccy: string, n: number) => {
  if (ccy === "NGN") return fmtNgn(n);
  if (ccy === "USD") return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (ccy === "EUR") return "€" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return n.toLocaleString();
};

function FloatPage() {
  const totalNgn = floatAccounts.reduce((s, a) => s + a.reservedNgn, 0);
  const totalPendingIn = floatAccounts.reduce((s, a) => s + a.pendingIn * (a.currency === "NGN" ? 1 : a.currency === "USD" ? 1547.2 : 1692.4), 0);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KpiTile label="Total float (NGN equiv.)" value={fmtNgn(totalNgn)} sub={`${floatAccounts.length} accounts`} />
        <KpiTile label="Pending inbound" value={fmtNgn(totalPendingIn)} sub="Settling within 24h" />
        <KpiTile label="Reconciliation" value="3 of 3 matched" sub="Last sweep 12 min ago" tone="success" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {floatAccounts.map((a) => (
          <motion.div key={a.currency} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="shadow-card overflow-hidden">
              <div className="bg-gradient-primary p-5 text-primary-foreground">
                <div className="flex items-center justify-between">
                  <div className="text-xs opacity-80 uppercase tracking-wider">{a.label}</div>
                  <Badge variant="outline" className={`text-[10px] border-white/30 bg-white/10 text-primary-foreground`}>
                    {a.currency}
                  </Badge>
                </div>
                <div className="font-display text-2xl font-bold mt-2">{fmtCcy(a.currency, a.balance)}</div>
                <div className="text-xs opacity-80 mt-0.5">≈ {fmtNgn(a.reservedNgn)}</div>
              </div>
              <CardContent className="p-4 space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Pending in">{fmtCcy(a.currency, a.pendingIn)}</Field>
                  <Field label="Pending out">{fmtCcy(a.currency, a.pendingOut)}</Field>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Provider">{a.provider}</Field>
                  <Field label="Health">
                    <Badge variant="outline" className={`text-xs ${
                      a.health === "ok" ? "bg-success/15 text-success border-success/30"
                        : a.health === "warn" ? "bg-warning/15 text-warning border-warning/30"
                          : "bg-destructive/15 text-destructive border-destructive/30"
                    }`}>
                      {a.health === "ok" ? <CheckCircle2 className="h-3 w-3 mr-1" /> : <AlertTriangle className="h-3 w-3 mr-1" />}
                      {a.health === "ok" ? "Reconciled" : a.health === "warn" ? "Drift detected" : "Break"}
                    </Badge>
                  </Field>
                </div>
                <div className="text-xs text-muted-foreground">
                  Last recon: {new Date(a.lastReconAt).toLocaleString()}
                </div>
                <div className="flex gap-2 pt-1">
                  <AdjustDialog currency={a.currency} type="credit" />
                  <AdjustDialog currency={a.currency} type="debit" />
                  <Button size="sm" variant="ghost" onClick={() => toast.success(`Re-running recon for ${a.currency}`)}>
                    <RefreshCcw className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function KpiTile({ label, value, sub, tone }: { label: string; value: string; sub: string; tone?: "success" }) {
  return (
    <Card className="shadow-card">
      <CardContent className="p-4">
        <div className="text-xs text-muted-foreground uppercase tracking-wider">{label}</div>
        <div className={`font-display text-2xl font-bold mt-1 ${tone === "success" ? "text-success" : ""}`}>{value}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>
      </CardContent>
    </Card>
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

function AdjustDialog({ currency, type }: { currency: string; type: "credit" | "debit" }) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [counter, setCounter] = useState("");
  const [reason, setReason] = useState("");

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) { setAmount(""); setCounter(""); setReason(""); } }}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="flex-1">
          {type === "credit" ? <Plus className="h-3.5 w-3.5 mr-1.5" /> : <Minus className="h-3.5 w-3.5 mr-1.5" />}
          {type === "credit" ? "Credit" : "Debit"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="capitalize">{type} {currency} float</DialogTitle>
          <DialogDescription>
            Manual ledger adjustment. Produces a balanced double-entry against the counter-account.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label htmlFor="amt">Amount ({currency})</Label>
            <Input id="amt" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
          </div>
          <div>
            <Label htmlFor="counter">Counter-account</Label>
            <Input id="counter" value={counter} onChange={(e) => setCounter(e.target.value)} placeholder="e.g. suspense.fees" />
          </div>
          <div>
            <Label htmlFor="reason">Reason</Label>
            <Textarea id="reason" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Why is this adjustment needed?" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            onClick={() => {
              if (!amount || Number(amount) <= 0) { toast.error("Enter a valid amount"); return; }
              if (!counter.trim()) { toast.error("Counter-account is required"); return; }
              if (!reason.trim()) { toast.error("Add an audit reason"); return; }
              toast.success(`${type === "credit" ? "Credited" : "Debited"} ${currency} float · audit logged`);
              setOpen(false);
              setAmount(""); setCounter(""); setReason("");
            }}
          >
            Post adjustment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
