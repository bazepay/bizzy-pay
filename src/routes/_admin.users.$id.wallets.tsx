import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus, Minus, Wallet as WalletIcon } from "lucide-react";
import { toast } from "sonner";
import { fmtNgn } from "@/lib/mock-data";
import { getBalance, FX_RATES, fxConvert, type FxCurrency } from "@/lib/users-data";

export const Route = createFileRoute("/_admin/users/$id/wallets")({
  component: WalletsTab,
});

const CURRENCIES: FxCurrency[] = ["USD", "EUR", "GBP", "GHS"];

function WalletsTab() {
  const { id } = Route.useParams();
  const bal = getBalance(id);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <BalanceCard ngn={bal.ngn} ledger={bal.ledger} pending={bal.pending} />

      <Card className="shadow-card lg:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Currency equivalents</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {CURRENCIES.map((c) => {
            const v = fxConvert(bal.ngn, c);
            return (
              <div key={c} className="rounded-md border p-3">
                <div className="text-xs text-muted-foreground">{c}</div>
                <div className="font-display text-lg font-bold mt-0.5">
                  {v.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </div>
                <div className="text-[10px] text-muted-foreground mt-1 font-mono">
                  1 {c} = ₦{FX_RATES[c].toLocaleString()}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

function BalanceCard({ ngn, ledger, pending }: { ngn: number; ledger: number; pending: number }) {
  const [open, setOpen] = useState(false);
  const [direction, setDirection] = useState<"credit" | "debit">("credit");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");

  return (
    <Card className="shadow-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <WalletIcon className="h-4 w-4 text-primary" /> Wallet (NGN)
        </CardTitle>
        <Badge variant="outline" className="text-xs">Live</Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <div className="text-xs text-muted-foreground">Available balance</div>
          <div className="font-display text-2xl font-bold">{fmtNgn(ngn)}</div>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <div className="text-xs text-muted-foreground">Ledger</div>
            <div className="font-mono">{fmtNgn(ledger)}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Pending</div>
            <div className="font-mono">{fmtNgn(pending)}</div>
          </div>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="w-full">Manual adjustment</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adjust wallet</DialogTitle>
              <DialogDescription>Posts a double-entry ledger entry. Requires reason for audit.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Direction</Label>
                <Select value={direction} onValueChange={(v: "credit" | "debit") => setDirection(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="credit"><Plus className="h-3.5 w-3.5 inline mr-1.5 text-success" /> Credit</SelectItem>
                    <SelectItem value="debit"><Minus className="h-3.5 w-3.5 inline mr-1.5 text-destructive" /> Debit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Amount (NGN)</Label>
                <Input type="number" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
              </div>
              <div className="space-y-2">
                <Label>Reason</Label>
                <Textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Audit-log reason…" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button
                disabled={!amount || reason.trim().length < 4}
                onClick={() => {
                  toast.success(`Posted ${direction} of ₦${Number(amount).toLocaleString()}.`);
                  setOpen(false); setAmount(""); setReason("");
                }}
              >
                Post entry
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
