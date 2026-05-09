import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, TrendingUp, Webhook, Banknote, AlertTriangle, CheckCircle2, ArrowRight, Plug } from "lucide-react";
import { providers, settlements, webhookEvents, providerStatusTone, providerKindLabel, fmtNgn } from "@/lib/payments-data";

export const Route = createFileRoute("/_admin/payments/")({
  component: PaymentsOverview,
});

function PaymentsOverview() {
  const live = providers.filter((p) => p.status === "live");
  const incidents = providers.filter((p) => p.status === "down" || p.status === "degraded");
  const totalVolume = providers.reduce((s, p) => s + p.volumeNgn24h, 0);
  const totalTxn = providers.reduce((s, p) => s + p.txnCount24h, 0);
  const weightedSuccess = totalTxn
    ? providers.reduce((s, p) => s + p.successRate * p.txnCount24h, 0) / totalTxn
    : 0;

  const today = settlements[0]?.date;
  const todayPending = settlements.filter((s) => s.date === today && s.status !== "settled").reduce((s, x) => s + x.netNgn, 0);
  const failedHooks = webhookEvents.filter((w) => w.status === "failed").length;
  const retryingHooks = webhookEvents.filter((w) => w.status === "retrying").length;

  const sortedByVolume = [...providers].sort((a, b) => b.volumeNgn24h - a.volumeNgn24h);
  const recentHooks = [...webhookEvents].slice(0, 6);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Kpi label="Volume (24h)" value={fmtNgn(totalVolume)} sub={`${totalTxn.toLocaleString()} txn`} icon={TrendingUp} />
        <Kpi label="Weighted success" value={`${weightedSuccess.toFixed(2)}%`} sub={`${live.length}/${providers.length} live`} icon={CheckCircle2} tone={weightedSuccess < 95 ? "warning" : "success"} />
        <Kpi label="Pending settlement" value={fmtNgn(todayPending)} sub={`Date ${today ?? "—"}`} icon={Banknote} tone={todayPending > 0 ? "warning" : undefined} />
        <Kpi label="Webhook issues" value={(failedHooks + retryingHooks).toLocaleString()} sub={`${failedHooks} failed · ${retryingHooks} retrying`} icon={Webhook} tone={failedHooks > 0 ? "danger" : retryingHooks > 0 ? "warning" : undefined} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 shadow-card">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="font-display text-lg font-bold">Provider mix (24h)</div>
                <div className="text-xs text-muted-foreground">Volume share by processor</div>
              </div>
              <Link to="/payments/providers" className="text-xs text-primary inline-flex items-center gap-1">
                Manage <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="space-y-2.5">
              {sortedByVolume.map((p) => {
                const pct = totalVolume ? (p.volumeNgn24h / totalVolume) * 100 : 0;
                return (
                  <div key={p.id}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="h-6 w-6 rounded-md flex items-center justify-center text-xs shrink-0" style={{ backgroundColor: `${p.color}22`, color: p.color }}>
                          {p.logo}
                        </div>
                        <span className="text-sm font-medium truncate">{p.name}</span>
                        <Badge variant="outline" className={`text-[10px] capitalize ${providerStatusTone[p.status]}`}>{p.status}</Badge>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-sm font-mono">{fmtNgn(p.volumeNgn24h)}</span>
                        <span className="text-[10px] text-muted-foreground ml-2">{pct.toFixed(1)}%</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: p.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="font-display text-lg font-bold">Provider incidents</div>
                <div className="text-xs text-muted-foreground">Degraded or down</div>
              </div>
              <Link to="/payments/providers" className="text-xs text-primary inline-flex items-center gap-1">
                All <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            {incidents.length === 0 ? (
              <div className="text-sm text-muted-foreground py-6 text-center">All providers healthy.</div>
            ) : (
              <div className="space-y-2">
                {incidents.map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-2.5 rounded-md border border-border">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="h-8 w-8 rounded-md flex items-center justify-center text-base shrink-0" style={{ backgroundColor: `${p.color}22`, color: p.color }}>
                        {p.logo}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">{p.name}</div>
                        <div className="text-[11px] text-muted-foreground">{providerKindLabel[p.kind]}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className={`text-[10px] capitalize ${providerStatusTone[p.status]}`}>{p.status}</Badge>
                      <div className="text-[11px] text-muted-foreground mt-0.5">{p.successRate.toFixed(1)}% · {p.latencyMs}ms</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="shadow-card">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="font-display text-lg font-bold">Recent webhooks</div>
                <div className="text-xs text-muted-foreground">Inbound provider callbacks</div>
              </div>
              <Link to="/payments/webhooks" className="text-xs text-primary inline-flex items-center gap-1">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="space-y-1.5">
              {recentHooks.map((w) => {
                const prov = providers.find((p) => p.id === w.provider);
                const ago = Math.max(1, Math.round((Date.now() - +new Date(w.receivedAt)) / 60_000));
                return (
                  <div key={w.id} className="flex items-center justify-between p-2.5 rounded-md border border-border">
                    <div className="flex items-center gap-2 min-w-0">
                      <Plug className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">{prov?.name ?? w.provider} · <span className="font-mono text-[11px]">{w.event}</span></div>
                        <div className="text-[11px] text-muted-foreground">{w.id} · {ago}m ago · {w.responseMs}ms</div>
                      </div>
                    </div>
                    <Badge variant="outline" className={`text-[10px] capitalize ${w.status === "delivered" ? "bg-success/15 text-success border-success/30" : w.status === "retrying" ? "bg-warning/15 text-warning border-warning/30" : "bg-destructive/15 text-destructive border-destructive/30"}`}>{w.status}</Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="font-display text-lg font-bold">Latest settlements</div>
                <div className="text-xs text-muted-foreground">Net to bank, last 2 days</div>
              </div>
              <Link to="/payments/settlements" className="text-xs text-primary inline-flex items-center gap-1">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="space-y-1.5">
              {settlements.slice(0, 6).map((s) => {
                const prov = providers.find((p) => p.id === s.provider);
                return (
                  <div key={s.id} className="flex items-center justify-between p-2.5 rounded-md border border-border">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="h-7 w-7 rounded-md flex items-center justify-center text-sm shrink-0" style={{ backgroundColor: `${prov?.color}22`, color: prov?.color }}>{prov?.logo}</div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">{prov?.name}</div>
                        <div className="text-[11px] text-muted-foreground">{s.date} · {s.bankRef}</div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-mono">{fmtNgn(s.netNgn)}</div>
                      <Badge variant="outline" className={`text-[10px] capitalize mt-0.5 ${s.status === "settled" ? "bg-success/15 text-success border-success/30" : s.status === "pending" ? "bg-warning/15 text-warning border-warning/30" : "bg-destructive/15 text-destructive border-destructive/30"}`}>{s.status}</Badge>
                    </div>
                  </div>
                );
              })}
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

// Suppress unused import warning in some configs
void AlertTriangle;
