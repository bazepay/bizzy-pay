import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, TrendingUp, AlertTriangle, Receipt, ArrowRight, CheckCircle2, XCircle } from "lucide-react";
import { billers, billOrders, categoryLabel, billerStatusTone, orderStatusTone, fmtNgn, billCategories } from "@/lib/pay-data";

export const Route = createFileRoute("/_admin/pay/")({
  component: PayOverview,
});

function PayOverview() {
  const todayOrders = billOrders.length;
  const todayGmv = billOrders.reduce((s, o) => s + o.amountNgn, 0);
  const successCount = billOrders.filter((o) => o.status === "delivered").length;
  const successRate = todayOrders ? (successCount / todayOrders) * 100 : 0;
  const failedCount = billOrders.filter((o) => o.status === "failed").length;
  const billersDown = billers.filter((b) => b.status === "down").length;
  const billersDegraded = billers.filter((b) => b.status === "degraded").length;

  // GMV by category
  const byCategory = billCategories.map((c) => {
    const cat = billOrders.filter((o) => o.category === c);
    return {
      category: c,
      count: cat.length,
      gmv: cat.reduce((s, o) => s + o.amountNgn, 0),
      success: cat.filter((o) => o.status === "delivered").length,
    };
  });

  const recent = [...billOrders].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)).slice(0, 4);
  const incidents = billers.filter((b) => b.status === "down" || b.status === "degraded").slice(0, 6);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Kpi label="GMV (24h)" value={fmtNgn(todayGmv)} sub={`${todayOrders.toLocaleString()} orders`} icon={TrendingUp} />
        <Kpi label="Success rate" value={`${successRate.toFixed(1)}%`} sub={`${successCount.toLocaleString()} delivered`} icon={CheckCircle2} tone={successRate < 95 ? "warning" : "success"} />
        <Kpi label="Failed" value={failedCount.toLocaleString()} sub="Auto-retry running" icon={XCircle} tone={failedCount > 0 ? "danger" : undefined} />
        <Kpi label="Biller incidents" value={(billersDown + billersDegraded).toString()} sub={`${billersDown} down · ${billersDegraded} degraded`} icon={AlertTriangle} tone={billersDown > 0 ? "danger" : billersDegraded > 0 ? "warning" : undefined} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {byCategory.map((c) => {
          const sr = c.count ? (c.success / c.count) * 100 : 0;
          return (
            <Card key={c.category} className="shadow-card">
              <CardContent className="p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-display text-base font-bold capitalize">{categoryLabel[c.category]}</div>
                  <Badge variant="outline" className="text-[10px]">{c.count.toLocaleString()} orders</Badge>
                </div>
                <div className="text-2xl font-display font-bold">{fmtNgn(c.gmv)}</div>
                <div className="text-xs text-muted-foreground">Success rate {sr.toFixed(1)}%</div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-primary" style={{ width: `${Math.min(sr, 100)}%` }} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="shadow-card">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="font-display text-lg font-bold">Biller incidents</div>
                <div className="text-xs text-muted-foreground">Degraded or down providers</div>
              </div>
              <Link to="/pay/incidents" className="text-xs text-primary inline-flex items-center gap-1">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            {incidents.length === 0 ? (
              <div className="text-sm text-muted-foreground py-6 text-center">All billers healthy.</div>
            ) : (
              <div className="space-y-2">
                {incidents.map((b) => (
                  <div key={b.id} className="flex items-center justify-between p-2.5 rounded-md border border-border">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="h-8 w-8 rounded-md flex items-center justify-center text-base shrink-0" style={{ backgroundColor: `${b.color}22`, color: b.color }}>
                        {b.logo ?? "•"}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">{b.name}</div>
                        <div className="text-[11px] text-muted-foreground capitalize">{categoryLabel[b.category]} · {b.route}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className={`text-[10px] capitalize ${billerStatusTone[b.status]}`}>{b.status}</Badge>
                      <div className="text-[11px] text-muted-foreground mt-0.5">{b.successRate.toFixed(1)}% success</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="font-display text-lg font-bold">Recent orders</div>
                <div className="text-xs text-muted-foreground">Live bill-pay attempts</div>
              </div>
              <Link to="/pay/orders" className="text-xs text-primary inline-flex items-center gap-1">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="space-y-1.5">
              {recent.map((o) => (
                <Link key={o.id} to="/pay/$id" params={{ id: o.id }} className="flex items-center justify-between p-2.5 rounded-md border border-border hover:bg-accent/40 transition-colors">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Receipt className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{o.billerName}</div>
                      <div className="text-[11px] text-muted-foreground truncate">{o.user.name} · {o.account}</div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-mono">{fmtNgn(o.amountNgn)}</div>
                    <Badge variant="outline" className={`text-[10px] capitalize mt-0.5 ${orderStatusTone[o.status]}`}>{o.status}</Badge>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}

function Kpi({ label, value, sub, icon: Icon, tone }: { label: string; value: string; sub: string; icon: typeof Activity; tone?: "warning" | "danger" | "success" }) {
  const toneClass =
    tone === "warning" ? "text-warning" : tone === "danger" ? "text-destructive" : tone === "success" ? "text-success" : "text-muted-foreground";
  return (
    <Card className="shadow-card">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs text-muted-foreground uppercase tracking-wider">{label}</div>
          <Icon className={`h-4 w-4 ${toneClass}`} />
        </div>
        <div className="text-2xl font-display font-bold">{value}</div>
        <div className="text-xs text-muted-foreground mt-1">{sub}</div>
      </CardContent>
    </Card>
  );
}
