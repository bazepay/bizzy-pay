import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { TrendingUp, Pencil, RefreshCcw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { fxRates as initialRates, type FxRate } from "@/lib/wallets-data";
import { toast } from "sonner";

export const Route = createFileRoute("/_admin/wallets/fx")({
  component: FxPage,
});

function FxPage() {
  const [rates, setRates] = useState<FxRate[]>(initialRates);

  const refreshAll = () => {
    setRates((rs) => rs.map((r) => ({
      ...r,
      rate: r.override ? r.rate : +(r.rate * (1 + (Math.random() - 0.5) * 0.002)).toFixed(4),
      effectiveAt: new Date().toISOString(),
    })));
    toast.success("FX feed refreshed");
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-semibold">FX rates & spreads</h2>
          <p className="text-sm text-muted-foreground">Mid-market rates with per-corridor spread. Overrides apply with effective window.</p>
        </div>
        <Button size="sm" variant="outline" onClick={refreshAll}>
          <RefreshCcw className="h-3.5 w-3.5 mr-1.5" /> Refresh feed
        </Button>
      </div>

      <Card className="shadow-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead>Pair</TableHead>
              <TableHead>Mid rate</TableHead>
              <TableHead>Spread</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Effective</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rates.map((r) => (
              <TableRow key={r.pair}>
                <TableCell className="font-mono font-semibold flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  {r.pair}
                </TableCell>
                <TableCell className="font-mono">{r.rate.toLocaleString("en-US", { maximumFractionDigits: 4 })}</TableCell>
                <TableCell className="font-mono text-sm">{r.spread} bps</TableCell>
                <TableCell className="text-sm">
                  {r.source}
                  {r.override && <Badge variant="outline" className="ml-2 text-[10px] bg-warning/15 text-warning border-warning/30">Override</Badge>}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {new Date(r.effectiveAt).toLocaleTimeString()}
                </TableCell>
                <TableCell className="text-right">
                  <OverrideDialog
                    rate={r}
                    onSave={(rate, spread) => {
                      setRates((rs) => rs.map((x) => x.pair === r.pair
                        ? { ...x, rate, spread, override: true, effectiveAt: new Date().toISOString() }
                        : x));
                      toast.success(`${r.pair} override applied`);
                    }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Card className="shadow-card">
        <CardContent className="p-4 text-sm text-muted-foreground">
          Rates flow into wallet conversions, card funding and the mobile app's currency switcher.
          Overrides remain active until manually cleared or the next scheduled feed sweep at 23:55 WAT.
        </CardContent>
      </Card>
    </div>
  );
}

function OverrideDialog({ rate, onSave }: { rate: FxRate; onSave: (rate: number, spread: number) => void }) {
  const [open, setOpen] = useState(false);
  const [r, setR] = useState(String(rate.rate));
  const [s, setS] = useState(String(rate.spread));
  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) { setR(String(rate.rate)); setS(String(rate.spread)); } }}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost"><Pencil className="h-3.5 w-3.5" /></Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Override {rate.pair}</DialogTitle>
          <DialogDescription>Set a manual mid-market rate and spread. This overrides the feed until cleared.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Mid rate</Label>
            <Input type="number" step="0.0001" value={r} onChange={(e) => setR(e.target.value)} />
          </div>
          <div>
            <Label>Spread (bps)</Label>
            <Input type="number" value={s} onChange={(e) => setS(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={() => {
            const nr = parseFloat(r), ns = parseInt(s);
            if (!nr || nr <= 0) { toast.error("Invalid rate"); return; }
            if (isNaN(ns) || ns < 0) { toast.error("Invalid spread"); return; }
            onSave(nr, ns);
            setOpen(false);
          }}>Apply override</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
