import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Phone, TrendingUp, AlertTriangle, CalendarClock, ArrowRight } from "lucide-react";
import { leases, numberPool, numberSuppliers, supplierHealthTone, leaseStatusTone, fmtNgn } from "@/lib/numbers-data";
import { fmtNum } from "@/lib/mock-data";

export const Route = createFileRoute("/_admin/numbers/")({
  component: NumbersOverview,
});

function NumbersOverview() {
  const total = numberPool.length;
  const available = numberPool.filter((n) => n.status === "available").length;
  const leased = numberPool.filter((n) => n.status === "leased").length;
  const quarantined = numberPool.filter((n) => n.status === "quarantined").length;
  const expiring = leases.filter((l) => l.status === "expiring" || l.status === "expired").length;
  const mrr = leases.filter((l) => l.status !== "cancelled" && l.status !== "expired").reduce((s, l) => s + l.priceNgn, 0);
  const upcoming = [...leases]
    .filter((l) => l.status === "expiring" || l.status === "expired")
    .sort((a, b) => +new Date(a.renewsOn) - +new Date(b.renewsOn))
    .slice(0, 6);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Kpi label="Monthly recurring" value={fmtNgn(mrr)} sub={`${fmtNum(leased)} active leases`} icon={TrendingUp} />
        <Kpi label="Available" value={fmtNum(available)} sub={`${fmtNum(total)} total in pool`} icon={Phone} />
        <Kpi label="Renewing soon" value={fmtNum(expiring)} sub="≤ 5 days or overdue" icon={CalendarClock} tone={expiring > 0 ? "warning" : undefined} />
        <Kpi label="Quarantined" value={fmtNum(quarantined)} sub={quarantined > 0 ? "Investigate" : "All clear"} icon={AlertTriangle} tone={quarantined > 0 ? "danger" : undefined} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {numberSuppliers.map((s) => (
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
                <Field label="Countries">{fmtNum(s.countries)}</Field>
                <Field label="Latency">{s.latencyMs} ms</Field>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="shadow-card">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarClock className={`h-4 w-4 ${upcoming.length ? "text-warning" : "text-muted-foreground"}`} />
            Renewals & expiries
          </CardTitle>
          <Link to="/numbers/leases" className="text-xs text-primary hover:underline">All leases →</Link>
        </CardHeader>
        <CardContent className="space-y-2">
          {upcoming.length === 0 && (
            <div className="text-sm text-muted-foreground py-4 text-center">No upcoming renewals.</div>
          )}
          {upcoming.map((l) => (
            <Link
              key={l.id}
              to="/numbers/$id"
              params={{ id: l.id }}
              className="flex items-center justify-between py-2 border-b last:border-0 hover:bg-muted/40 -mx-2 px-2 rounded transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <img src={`https://flagcdn.com/w40/${l.countryCode}.png`} alt={l.country} className="h-5 w-7 rounded-sm object-cover shrink-0" loading="lazy" />
                <div className="min-w-0">
                  <div className="text-sm font-mono truncate">{l.number}</div>
                  <div className="text-xs text-muted-foreground truncate">{l.user.name} · {l.service}</div>
                </div>
              </div>
              <div className="text-right shrink-0 flex items-center gap-3">
                <Badge variant="outline" className={`text-[10px] capitalize ${leaseStatusTone[l.status]}`}>{l.status}</Badge>
                <div className="text-xs">{new Date(l.renewsOn).toLocaleDateString()}</div>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function Kpi({ label, value, sub, icon: Icon, tone }: { label: string; value: string; sub: string; icon: React.ComponentType<{ className?: string }>; tone?: "danger" | "warning" }) {
  const toneCls = tone === "danger" ? "text-destructive" : tone === "warning" ? "text-warning" : "text-muted-foreground";
  return (
    <Card className="shadow-card">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground uppercase tracking-wider">{label}</div>
          <Icon className={`h-4 w-4 ${toneCls}`} />
        </div>
        <div className={`font-display text-2xl font-bold mt-1 ${tone === "danger" ? "text-destructive" : tone === "warning" ? "text-warning" : ""}`}>{value}</div>
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
