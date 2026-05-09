import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Download, ArrowRight, Receipt, Coins, TrendingUp, CheckCircle2, XCircle, Activity } from "lucide-react";
import { billOrders, billCategories, providerRoutes, categoryLabel, orderStatusTone, fmtNgn } from "@/lib/pay-data";
import { toast } from "sonner";

export const Route = createFileRoute("/_admin/pay/orders")({
  component: OrdersPage,
});

function OrdersPage() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");
  const [route, setRoute] = useState("all");
  const [visible, setVisible] = useState(40);

  const rows = useMemo(() => {
    return billOrders.filter((o) => {
      if (status !== "all" && o.status !== status) return false;
      if (category !== "all" && o.category !== category) return false;
      if (route !== "all" && o.route !== route) return false;
      if (q) {
        const s = q.toLowerCase();
        if (
          !o.id.toLowerCase().includes(s) &&
          !o.user.name.toLowerCase().includes(s) &&
          !o.user.email.toLowerCase().includes(s) &&
          !o.account.toLowerCase().includes(s) &&
          !o.billerName.toLowerCase().includes(s)
        ) return false;
      }
      return true;
    }).sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  }, [q, status, category, route]);

  const stats = useMemo(() => {
    const total = rows.length;
    const value = rows.reduce((s, o) => s + o.amountNgn, 0);
    const fees = rows.reduce((s, o) => s + o.feeNgn, 0);
    const delivered = rows.filter((o) => o.status === "delivered").length;
    const failed = rows.filter((o) => o.status === "failed").length;
    const successRate = total ? (delivered / total) * 100 : 0;
    const avgValue = total ? value / total : 0;
    return { total, value, fees, delivered, failed, successRate, avgValue };
  }, [rows]);

  const exportCsv = () => {
    const headers = ["order_id", "created_at", "user", "email", "category", "biller", "account", "amount_ngn", "fee_ngn", "route", "provider_ref", "response_ms", "retries", "status", "failure_reason"];
    const lines = [headers.join(",")];
    for (const o of rows) {
      lines.push([o.id, o.createdAt, `"${o.user.name}"`, o.user.email, o.category, `"${o.billerName}"`, o.account, o.amountNgn, o.feeNgn, o.route, o.providerRef ?? "", o.responseMs, o.retries, o.status, `"${o.failureReason ?? ""}"`].join(","));
    }
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `bill-orders-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${rows.length} orders`);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard label="Total transactions" value={stats.total.toLocaleString()} sub={`Avg ${fmtNgn(stats.avgValue)}`} icon={Receipt} />
        <StatCard label="Total value" value={fmtNgn(stats.value)} sub="Gross GMV" icon={TrendingUp} />
        <StatCard label="Total fees" value={fmtNgn(stats.fees)} sub="Service revenue" icon={Coins} tone="success" />
        <StatCard label="Delivered" value={stats.delivered.toLocaleString()} sub={`${stats.successRate.toFixed(1)}% success`} icon={CheckCircle2} tone="success" />
        <StatCard label="Failed" value={stats.failed.toLocaleString()} sub="Auto-retry running" icon={XCircle} tone={stats.failed > 0 ? "danger" : undefined} />
        <StatCard label="Filtered view" value={`${stats.total.toLocaleString()} / ${billOrders.length.toLocaleString()}`} sub="Of all orders" icon={Activity} />
      </div>

      <Card className="shadow-card">
        <CardContent className="p-4 flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[220px]">
            <Label className="text-xs">Search</Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Order ID, user, account, biller..." className="pl-8 h-9" />
            </div>
          </div>
          <FilterSelect label="Status" value={status} onChange={setStatus} options={[["all", "All"], ["delivered", "Delivered"], ["processing", "Processing"], ["pending", "Pending"], ["failed", "Failed"], ["refunded", "Refunded"]]} />
          <FilterSelect label="Category" value={category} onChange={setCategory} options={[["all", "All"], ...billCategories.map((c) => [c, categoryLabel[c]] as [string, string])]} />
          <FilterSelect label="Route" value={route} onChange={setRoute} options={[["all", "All"], ...providerRoutes.map((p) => [p, p] as [string, string])]} />
          <Button onClick={exportCsv} variant="outline" size="sm" className="gap-1.5 h-9 ml-auto">
            <Download className="h-3.5 w-3.5" />Export CSV
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Biller</TableHead>
              <TableHead>Account</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Route</TableHead>
              <TableHead className="text-right">Resp</TableHead>
              <TableHead>Status</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.slice(0, visible).map((o) => (
              <TableRow key={o.id}>
                <TableCell>
                  <div className="text-sm font-mono">{o.id}</div>
                  <div className="text-[11px] text-muted-foreground">{new Date(o.createdAt).toLocaleString()}</div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">{o.user.name}</div>
                  <div className="text-[11px] text-muted-foreground">{o.user.email}</div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">{o.billerName}</div>
                  <div className="text-[11px] text-muted-foreground capitalize">{categoryLabel[o.category]}</div>
                </TableCell>
                <TableCell className="text-sm font-mono">{o.account}</TableCell>
                <TableCell className="text-right">
                  <div className="text-sm font-mono">{fmtNgn(o.amountNgn)}</div>
                  {o.feeNgn > 0 && <div className="text-[10px] text-muted-foreground">+{fmtNgn(o.feeNgn)} fee</div>}
                </TableCell>
                <TableCell><Badge variant="outline" className="text-[10px]">{o.route}</Badge></TableCell>
                <TableCell className="text-right text-sm font-mono">{o.responseMs}ms</TableCell>
                <TableCell>
                  <Badge variant="outline" className={`text-[10px] capitalize ${orderStatusTone[o.status]}`}>{o.status}</Badge>
                  {o.retries > 0 && <div className="text-[10px] text-muted-foreground mt-0.5">{o.retries} retries</div>}
                </TableCell>
                <TableCell>
                  <Link to="/pay/$id" params={{ id: o.id }} className="inline-flex items-center text-primary text-xs">
                    Open <ArrowRight className="h-3 w-3 ml-0.5" />
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {rows.length > visible && (
          <div className="p-3 flex justify-center border-t border-border">
            <Button variant="outline" size="sm" onClick={() => setVisible((v) => v + 40)}>Load more</Button>
          </div>
        )}
      </Card>
    </motion.div>
  );
}

function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: Array<[string, string]> }) {
  return (
    <div>
      <Label className="text-xs">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-9 w-[150px]"><SelectValue /></SelectTrigger>
        <SelectContent>
          {options.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}

function StatCard({ label, value, sub, icon: Icon, tone }: { label: string; value: string; sub: string; icon: typeof Receipt; tone?: "success" | "danger" | "warning" }) {
  const toneClass = tone === "success" ? "text-success" : tone === "danger" ? "text-destructive" : tone === "warning" ? "text-warning" : "text-muted-foreground";
  return (
    <Card className="shadow-card">
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-1.5">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</div>
          <Icon className={`h-3.5 w-3.5 ${toneClass}`} />
        </div>
        <div className="text-lg font-display font-bold leading-tight">{value}</div>
        <div className="text-[11px] text-muted-foreground mt-0.5 truncate">{sub}</div>
      </CardContent>
    </Card>
  );
}
