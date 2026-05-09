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
import { Search, RefreshCw, Power, PowerOff } from "lucide-react";
import { billers as initial, billCategories, providerRoutes, categoryLabel, billerStatusTone, fmtNgn, type Biller, type BillerStatus } from "@/lib/pay-data";
import { toast } from "sonner";

export const Route = createFileRoute("/_admin/pay/billers")({
  component: BillersPage,
});

function BillersPage() {
  const [items, setItems] = useState<Biller[]>(initial);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [route, setRoute] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");

  const rows = useMemo(() => {
    return items.filter((b) => {
      if (category !== "all" && b.category !== category) return false;
      if (route !== "all" && b.route !== route) return false;
      if (status !== "all" && b.status !== status) return false;
      if (q && !b.name.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [items, q, category, route, status]);

  const setStatusFor = (id: string, s: BillerStatus, msg: string) => {
    setItems((prev) => prev.map((b) => (b.id === id ? { ...b, status: s, lastSync: new Date().toISOString() } : b)));
    toast.success(msg);
  };

  const updateRoute = (id: string, r: string) => {
    setItems((prev) => prev.map((b) => (b.id === id ? { ...b, route: r as Biller["route"] } : b)));
    toast.success(`Route updated to ${r}`);
  };

  const updateFee = (id: string, fee: number) => {
    setItems((prev) => prev.map((b) => (b.id === id ? { ...b, feeNgn: Math.max(0, fee) } : b)));
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <Card className="shadow-card">
        <CardContent className="p-4 flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[220px]">
            <Label className="text-xs">Search</Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Biller name..." className="pl-8 h-9" />
            </div>
          </div>
          <FilterSelect label="Category" value={category} onChange={setCategory} options={[["all", "All"], ...billCategories.map((c) => [c, categoryLabel[c]] as [string, string])]} />
          <FilterSelect label="Provider route" value={route} onChange={setRoute} options={[["all", "All"], ...providerRoutes.map((p) => [p, p] as [string, string])]} />
          <FilterSelect label="Status" value={status} onChange={setStatus} options={[["all", "All"], ["active", "Active"], ["degraded", "Degraded"], ["down", "Down"], ["disabled", "Disabled"]]} />
          <div className="text-xs text-muted-foreground ml-auto">{rows.length} billers</div>
        </CardContent>
      </Card>

      <Card className="shadow-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Biller</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Route</TableHead>
              <TableHead className="text-right">Fee</TableHead>
              <TableHead className="text-right">Success</TableHead>
              <TableHead className="text-right">Orders (24h)</TableHead>
              <TableHead className="text-right">GMV (24h)</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((b) => (
              <TableRow key={b.id}>
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-md flex items-center justify-center text-base shrink-0" style={{ backgroundColor: `${b.color}22`, color: b.color }}>
                      {b.logo ?? "•"}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{b.name}</div>
                      <div className="text-[11px] text-muted-foreground">Synced {new Date(b.lastSync).toLocaleTimeString()}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell><span className="capitalize text-sm">{categoryLabel[b.category]}</span></TableCell>
                <TableCell>
                  <Select value={b.route} onValueChange={(v) => updateRoute(b.id, v)}>
                    <SelectTrigger className="h-8 w-[130px] text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {providerRoutes.map((p) => <SelectItem key={p} value={p} className="text-xs">{p}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-right">
                  <Input type="number" value={b.feeNgn} onChange={(e) => updateFee(b.id, Number(e.target.value))} className="h-8 w-[90px] text-xs text-right ml-auto" />
                </TableCell>
                <TableCell className="text-right text-sm font-mono">{b.successRate.toFixed(1)}%</TableCell>
                <TableCell className="text-right text-sm font-mono">{b.ordersToday.toLocaleString()}</TableCell>
                <TableCell className="text-right text-sm font-mono">{fmtNgn(b.gmvToday)}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={`text-[10px] capitalize ${billerStatusTone[b.status]}`}>{b.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => setStatusFor(b.id, "active", `${b.name} resync triggered`)} title="Resync">
                      <RefreshCw className="h-3.5 w-3.5" />
                    </Button>
                    {b.status === "disabled" ? (
                      <Button size="sm" variant="ghost" className="h-7 px-2 text-success" onClick={() => setStatusFor(b.id, "active", `${b.name} enabled`)} title="Enable">
                        <Power className="h-3.5 w-3.5" />
                      </Button>
                    ) : (
                      <Button size="sm" variant="ghost" className="h-7 px-2 text-destructive" onClick={() => setStatusFor(b.id, "disabled", `${b.name} disabled`)} title="Disable">
                        <PowerOff className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </motion.div>
  );
}

function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: Array<[string, string]> }) {
  return (
    <div>
      <Label className="text-xs">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-9 w-[160px]"><SelectValue /></SelectTrigger>
        <SelectContent>
          {options.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}
