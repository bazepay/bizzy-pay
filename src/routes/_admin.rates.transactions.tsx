import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Save, ArrowDownToLine, ArrowUpFromLine, ArrowLeftRight, CreditCard, Send, Banknote } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_admin/rates/transactions")({
  component: TransactionFeesPage,
});

type FeeType = "percent" | "flat" | "tiered";

type TxnFee = {
  id: string;
  name: string;
  icon: typeof ArrowDownToLine;
  description: string;
  feeType: FeeType;
  value: number;
  capNgn: number | null;
  minNgn: number;
  enabled: boolean;
};

const SEED: TxnFee[] = [
  { id: "deposit", name: "Wallet deposit", icon: ArrowDownToLine, description: "Card / bank transfer top-up", feeType: "percent", value: 1.4, capNgn: 2000, minNgn: 0, enabled: true },
  { id: "withdrawal", name: "Wallet withdrawal", icon: ArrowUpFromLine, description: "Payout to bank account", feeType: "flat", value: 50, capNgn: null, minNgn: 100, enabled: true },
  { id: "p2p", name: "Peer-to-peer transfer", icon: Send, description: "Bazepay → Bazepay", feeType: "flat", value: 0, capNgn: null, minNgn: 0, enabled: true },
  { id: "bank-transfer", name: "Bank transfer (NIP)", icon: ArrowLeftRight, description: "To Nigerian banks", feeType: "tiered", value: 25, capNgn: 50, minNgn: 50, enabled: true },
  { id: "card-funding", name: "Card funding", icon: CreditCard, description: "NGN → card load", feeType: "percent", value: 1.0, capNgn: 1500, minNgn: 0, enabled: true },
  { id: "cashout", name: "ATM cashout", icon: Banknote, description: "Card ATM withdrawal", feeType: "flat", value: 100, capNgn: null, minNgn: 0, enabled: true },
];

function TransactionFeesPage() {
  const [items, setItems] = useState<TxnFee[]>(SEED);
  const [strategy, setStrategy] = useState<"absorb" | "pass">("pass");

  const update = (id: string, patch: Partial<TxnFee>) => {
    setItems((xs) => xs.map((x) => x.id === id ? { ...x, ...patch } : x));
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <Card className="shadow-card">
        <CardContent className="p-5 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h3 className="font-semibold">Fee strategy</h3>
            <p className="text-xs text-muted-foreground">Choose how processor fees flow to the user.</p>
          </div>
          <Select value={strategy} onValueChange={(v) => setStrategy(v as "absorb" | "pass")}>
            <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="pass">Pass to user (markup added)</SelectItem>
              <SelectItem value="absorb">Absorb (Bazepay covers)</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card className="shadow-card overflow-hidden">
        <CardContent className="p-5 pb-3">
          <h3 className="font-semibold">Transaction fees</h3>
          <p className="text-xs text-muted-foreground">All values are in Naira (NGN). Caps apply only to percent-based fees.</p>
        </CardContent>
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead>Transaction</TableHead>
              <TableHead>Fee type</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Cap (₦)</TableHead>
              <TableHead>Min (₦)</TableHead>
              <TableHead>Enabled</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((t) => {
              const Icon = t.icon;
              return (
                <TableRow key={t.id}>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">{t.name}</div>
                        <div className="text-[11px] text-muted-foreground">{t.description}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select value={t.feeType} onValueChange={(v) => update(t.id, { feeType: v as FeeType })}>
                      <SelectTrigger className="h-8 w-32"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percent">Percent (%)</SelectItem>
                        <SelectItem value="flat">Flat (₦)</SelectItem>
                        <SelectItem value="tiered">Tiered (NIP)</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Input type="number" step="0.01" value={t.value}
                        onChange={(e) => update(t.id, { value: parseFloat(e.target.value) || 0 })}
                        className="h-8 w-24 font-mono text-xs" />
                      <span className="text-[11px] text-muted-foreground">{t.feeType === "percent" ? "%" : "₦"}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Input type="number" value={t.capNgn ?? ""} placeholder="—"
                      disabled={t.feeType === "flat"}
                      onChange={(e) => update(t.id, { capNgn: e.target.value ? parseInt(e.target.value) : null })}
                      className="h-8 w-24 font-mono text-xs" />
                  </TableCell>
                  <TableCell>
                    <Input type="number" value={t.minNgn}
                      onChange={(e) => update(t.id, { minNgn: parseInt(e.target.value) || 0 })}
                      className="h-8 w-24 font-mono text-xs" />
                  </TableCell>
                  <TableCell>
                    <Switch checked={t.enabled} onCheckedChange={(v) => update(t.id, { enabled: v })} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        <div className="p-4 border-t flex justify-end">
          <Button size="sm" onClick={() => toast.success("Transaction fees saved")}>
            <Save className="h-3.5 w-3.5 mr-1.5" /> Save all
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}
