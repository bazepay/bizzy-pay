import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Smartphone, TrendingUp, AlertTriangle, CheckCircle2, ArrowRight } from "lucide-react";
import { esimOrders, esimSuppliers, esimInventory, fmtNgn, orderStatusTone, supplierHealthTone } from "@/lib/esim-data";
import { fmtNum } from "@/lib/mock-data";

export const Route = createFileRoute("/_admin/esim/")({
  component: EsimOverview,
});

function EsimOverview() {
  const total = esimOrders.length;
  const activated = esimOrders.filter((o) => o.status === "activated").length;
  const failed = esimOrders.filter((o) => o.status === "failed").length;
  const inFlight = esimOrders.filter((o) => ["paid", "provisioning", "delivered"].includes(o.status)).length;
  const revenue30d = esimOrders
    .filter((o) => Date.now() - +new Date(o.createdAt) <= 30 * 86_400_000 && o.status !== "refunded")
    .reduce((s, o) => s + o.priceNgn, 0);
  const successRate = total === 0 ? 0 : (activated / total) * 100;
  const recent = [...esimOrders].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)).slice(0, 6);
  const lowStock = esimInventory.filter((i) => i.iccidsAvailable <= i.threshold);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Kpi label="30-day revenue" value={fmtNgn(revenue30d)} sub={`${fmtNum(total)} orders all-time`} icon={TrendingUp} />
        <Kpi label="Activated" value={fmtNum(activated)} sub={`${successRate.toFixed(1)}% success`} icon={CheckCircle2} />
        <Kpi label="In flight" value={fmtNum(inFlight)} sub="Paid · provisioning · delivered" icon={Smartphone} />
        <Kpi label="Failed" value={fmtNum(failed)} sub={failed > 0 ? "Review activations" : "All clear"} icon={AlertTriangle} tone={failed > 0 ? "danger" : undefined} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {esimSuppliers.map((s) => (
          <Card key={s.id} className="shadow-card">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-display text-lg font-bold">{s.name}</div>
                  <div className="text-xs text-muted-foreground">Last sync {new Date(s.lastSync).toLocaleTimeString()}</div>
                </div>
                <Badge variant="outline" className={`text-xs capitalize ${supplierHealthTone[s.health]}`}>
                  {s.health}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <Field label="Countries">{fmtNum(s.countriesCovered)}</Field>
                <Field label="Latency">{s.latencyMs} ms</Field>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Recent orders</CardTitle>
            <Link to="/esim/orders" className="text-xs text-primary hover:underline">View all →</Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {recent.map((o) => (
              <Link
                key={o.id}
                to="/esim/$id"
                params={{ id: o.id }}
                className="flex items-center justify-between py-2 border-b last:border-0 hover:bg-muted/40 -mx-2 px-2 rounded transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="text-xl shrink-0">{o.flag}</div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{o.user.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{o.planName}</div>
                  </div>
                </div>
                <div className="text-right shrink-0 flex items-center gap-3">
                  <Badge variant="outline" className={`text-[10px] capitalize ${orderStatusTone[o.status]}`}>{o.status}</Badge>
                  <div className="text-xs font-mono">{fmtNgn(o.priceNgn)}</div>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className={`h-4 w-4 ${lowStock.length ? "text-warning" : "text-muted-foreground"}`} />
              Low-stock alerts
            </CardTitle>
            <Link to="/esim/inventory" className="text-xs text-primary hover:underline">Manage →</Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {lowStock.length === 0 && (
              <div className="text-sm text-muted-foreground py-4 text-center">All inventory healthy.</div>
            )}
            {lowStock.map((i) => (
              <div key={i.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="text-xl shrink-0">{i.flag}</div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{i.country}</div>
                    <div className="text-xs text-muted-foreground">{i.supplier}</div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-mono text-warning font-semibold">{fmtNum(i.iccidsAvailable)}</div>
                  <div className="text-[10px] text-muted-foreground">of {fmtNum(i.iccidsTotal)} ICCIDs</div>
                </div>
              </div>
            ))}
            {lowStock.length > 0 && (
              <Link to="/esim/inventory" className="text-xs text-primary hover:underline inline-flex items-center mt-1">
                Open inventory <ArrowRight className="h-3 w-3 ml-1" />
              </Link>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}

function Kpi({ label, value, sub, icon: Icon, tone }: { label: string; value: string; sub: string; icon: React.ComponentType<{ className?: string }>; tone?: "danger" }) {
  return (
    <Card className="shadow-card">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground uppercase tracking-wider">{label}</div>
          <Icon className={`h-4 w-4 ${tone === "danger" ? "text-destructive" : "text-muted-foreground"}`} />
        </div>
        <div className={`font-display text-2xl font-bold mt-1 ${tone === "danger" ? "text-destructive" : ""}`}>{value}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>
      </CardContent>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="font-mono mt-0.5">{children}</div>
    </div>
  );
}
