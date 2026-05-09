import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Download, Banknote, TrendingUp, Receipt, AlertTriangle } from "lucide-react";
import { settlements as initial, providers, settlementStatusTone, fmtNgn, type Settlement } from "@/lib/payments-data";
import { toast } from "sonner";

export const Route = createFileRoute("/_admin/payments/settlements")({
  component: SettlementsPage,
});

function SettlementsPage() {
  const [items] = useState<Settlement[]>(initial);
  const [q, setQ] = useState("");
  const [provider, setProvider] = useState("all");
  const [status, setStatus] = useState("all");

  const rows = useMemo(() => {
    return items.filter((s) => {
      if (provider !== "all" && s.provider !== provider) return false;
      if (status !== "all" && s.status !== status) return false;
      if (q) {
        const v = q.toLowerCase();
        if (!s.bankRef.toLowerCase().includes(v) && !s.id.toLowerCase().includes(v)) return false;
      }
      return true;
    }).sort((a, b) => b.date.localeCompare(a.date) || a.provider.localeCompare(b.provider));
  }, [items, q, provider, status]);

  const stats = useMemo(() => {
    const gross = rows.reduce((s, x) => s + x.grossNgn, 0);
    const fees = rows.reduce((s, x) => s + x.feesNgn, 0);
    const refunds = rows.reduce((s, x) => s + x.refundsNgn, 0);
    const cb = rows.reduce((s, x) => s + x.chargebacksNgn, 0);
    const net = rows.reduce((s, x) => s + x.netNgn, 0);
    const pending = rows.filter((x) => x.status !== "settled").reduce((s, x) => s + x.netNgn, 0);
    return { gross, fees, refunds, cb, net, pending };
  }, [rows]);

  const exportCsv = () => {
    const headers = ["id", "date", "provider", "gross_ngn", "fees_ngn", "refunds_ngn", "chargebacks_ngn", "net_ngn", "bank_ref", "status"];
    const lines = [headers.join(",")];
    rows.forEach((r) => lines.push([r.id, r.date, r.provider, r.grossNgn, r.feesNgn, r.refundsNgn, r.chargebacksNgn, r.netNgn, r.bankRef, r.status].join(",")));
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `settlements-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${rows.length} settlements`);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard label="Gross" value={fmtNgn(stats.gross)} sub={`${rows.length.toLocaleString()} payouts`} icon={TrendingUp} />
        <StatCard label="Net to bank" value={fmtNgn(stats.net)} sub="After fees & refunds" icon={Banknote} tone="success" />
        <StatCard label="Processor fees" value={fmtNgn(stats.fees)} sub="Total deducted" icon={Receipt} />
        <StatCard label="Refunds" value={fmtNgn(stats.refunds)} sub="Customer credits" icon={Receipt} />
        <StatCard label="Chargebacks" value={fmtNgn(stats.cb)} sub="Disputed volume" icon={AlertTriangle} tone={stats.cb > 0 ? "warning" : undefined} />
        <StatCard label="Pending" value={fmtNgn(stats.pending)} sub="Awaiting settlement" icon={Banknote} tone={stats.pending > 0 ? "warning" : undefined} />
      </div>

      <Card className="shadow-card">
        <CardContent className="p-4 flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[220px]">
            <Label className="text-xs">Search</Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Bank ref, settlement ID..." className="pl-8 h-9" />
            </div>
          </div>
          <FilterSelect label="Provider" value={provider} onChange={setProvider} options={[["all", "All"], ...providers.map((p) => [p.id, p.name] as [string, string])]} />
          <FilterSelect label="Status" value={status} onChange={setStatus} options={[["all", "All"], ["settled", "Settled"], ["pending", "Pending"], ["delayed", "Delayed"]]} />
          <Button onClick={exportCsv} variant="outline" size="sm" className="gap-1.5 h-9 ml-auto">
            <Download className="h-3.5 w-3.5" /> Export CSV
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>Bank ref</TableHead>
              <TableHead className="text-right">Gross</TableHead>
              <TableHead className="text-right">Fees</TableHead>
              <TableHead className="text-right">Refunds</TableHead>
              <TableHead className="text-right">Chargebacks</TableHead>
              <TableHead className="text-right">Net</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((s) => {
              const prov = providers.find((p) => p.id === s.provider);
              return (
                <TableRow key={s.id}>
                  <TableCell className="text-sm font-mono">{s.date}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="h-7 w-7 rounded-md flex items-center justify-center text-sm shrink-0" style={{ backgroundColor: `${prov?.color}22`, color: prov?.color }}>{prov?.logo}</div>
                      <span className="text-sm">{prov?.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs font-mono">{s.bankRef}</TableCell>
                  <TableCell className="text-right text-sm font-mono">{fmtNgn(s.grossNgn)}</TableCell>
                  <TableCell className="text-right text-sm font-mono text-muted-foreground">−{fmtNgn(s.feesNgn)}</TableCell>
                  <TableCell className="text-right text-sm font-mono text-muted-foreground">−{fmtNgn(s.refundsNgn)}</TableCell>
                  <TableCell className="text-right text-sm font-mono text-muted-foreground">−{fmtNgn(s.chargebacksNgn)}</TableCell>
                  <TableCell className="text-right text-sm font-mono font-semibold">{fmtNgn(s.netNgn)}</TableCell>
                  <TableCell><Badge variant="outline" className={`text-[10px] capitalize ${settlementStatusTone[s.status]}`}>{s.status}</Badge></TableCell>
                </TableRow>
              );
            })}
            {rows.length === 0 && (
              <TableRow><TableCell colSpan={9} className="text-center text-sm text-muted-foreground py-10">No settlements match.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </motion.div>
  );
}

function StatCard({ label, value, sub, icon: Icon, tone }: { label: string; value: string; sub: string; icon: typeof Receipt; tone?: "success" | "warning" | "danger" }) {
  const t = tone === "success" ? "text-success" : tone === "warning" ? "text-warning" : tone === "danger" ? "text-destructive" : "text-muted-foreground";
  return (
    <Card className="shadow-card">
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-1.5">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</div>
          <Icon className={`h-3.5 w-3.5 ${t}`} />
        </div>
        <div className="text-base font-display font-bold leading-tight">{value}</div>
        <div className="text-[11px] text-muted-foreground mt-0.5 truncate">{sub}</div>
      </CardContent>
    </Card>
  );
}

function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: Array<[string, string]> }) {
  return (
    <div>
      <Label className="text-xs">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-9 w-[180px]"><SelectValue /></SelectTrigger>
        <SelectContent>
          {options.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}
