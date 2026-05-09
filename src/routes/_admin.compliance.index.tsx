import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  FileWarning,
  Activity,
  ScrollText,
  ArrowRight,
} from "lucide-react";
import {
  amlAlerts,
  sanctionsHits,
  auditLog,
  alertStatusTone,
  alertStatusLabel,
  alertTypeLabel,
  severityTone,
  fmtNgn,
  fmtRelative,
  auditActionLabel,
  auditActionTone,
} from "@/lib/compliance-data";

export const Route = createFileRoute("/_admin/compliance/")({
  component: ComplianceOverview,
});

function ComplianceOverview() {
  const stats = useMemo(() => {
    const open = amlAlerts.filter((a) => a.status === "open" || a.status === "investigating").length;
    const critical = amlAlerts.filter((a) => a.severity === "critical" && a.status !== "cleared").length;
    const sar = amlAlerts.filter((a) => a.status === "sar_filed").length;
    const cleared7d = amlAlerts.filter((a) => {
      if (a.status !== "cleared") return false;
      return Date.now() - new Date(a.updatedAt).getTime() < 7 * 86400_000;
    }).length;
    const pendingScreens = sanctionsHits.filter((s) => s.status === "match" || s.status === "possible").length;
    const auditToday = auditLog.filter((e) => Date.now() - new Date(e.at).getTime() < 86400_000).length;
    return { open, critical, sar, cleared7d, pendingScreens, auditToday };
  }, []);

  const bySeverity = useMemo(() => {
    const map = new Map<string, number>();
    amlAlerts.forEach((a) => {
      if (a.status === "cleared") return;
      map.set(a.severity, (map.get(a.severity) ?? 0) + 1);
    });
    return ["critical", "high", "medium", "low"].map((k) => [k, map.get(k) ?? 0] as const);
  }, []);

  const byType = useMemo(() => {
    const map = new Map<string, number>();
    amlAlerts.forEach((a) => {
      if (a.status === "cleared") return;
      map.set(a.type, (map.get(a.type) ?? 0) + 1);
    });
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, []);

  const recentAlerts = useMemo(
    () => [...amlAlerts].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)).slice(0, 6),
    []
  );

  const recentAudit = useMemo(() => auditLog.slice(0, 6), []);

  const maxSev = Math.max(1, ...bySeverity.map(([, n]) => n));
  const maxType = Math.max(1, ...byType.map(([, n]) => n));

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard label="Open alerts" value={stats.open.toLocaleString()} sub="Awaiting review" icon={AlertTriangle} />
        <StatCard label="Critical open" value={stats.critical.toLocaleString()} sub="Severity critical" icon={FileWarning} tone={stats.critical > 0 ? "danger" : undefined} />
        <StatCard label="SAR filed" value={stats.sar.toLocaleString()} sub="Reported to NFIU" icon={ShieldAlert} tone="warning" />
        <StatCard label="Cleared 7d" value={stats.cleared7d.toLocaleString()} sub="Last week" icon={CheckCircle2} tone="success" />
        <StatCard label="Screening hits" value={stats.pendingScreens.toLocaleString()} sub="Pending review" icon={ShieldAlert} />
        <StatCard label="Audit events 24h" value={stats.auditToday.toLocaleString()} sub="Admin actions" icon={Activity} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="shadow-card lg:col-span-2">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-base font-display font-bold">Recent AML alerts</h2>
                <p className="text-xs text-muted-foreground">Latest detections from automated monitoring rules</p>
              </div>
              <Button asChild variant="ghost" size="sm" className="gap-1">
                <Link to="/compliance/alerts">View all <ArrowRight className="h-3.5 w-3.5" /></Link>
              </Button>
            </div>
            <div className="divide-y divide-border">
              {recentAlerts.map((a) => (
                <Link key={a.id} to="/compliance/alerts/$id" params={{ id: a.id }} className="py-2.5 flex items-start gap-3 hover:bg-muted/40 -mx-2 px-2 rounded transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-[11px] text-muted-foreground">{a.id}</span>
                      <Badge variant="outline" className={`text-[10px] capitalize ${severityTone[a.severity]}`}>{a.severity}</Badge>
                      <Badge variant="outline" className={`text-[10px] ${alertStatusTone[a.status]}`}>{alertStatusLabel[a.status]}</Badge>
                    </div>
                    <div className="text-sm font-medium mt-0.5 truncate">{a.ruleName}</div>
                    <div className="text-xs text-muted-foreground mt-0.5 truncate">
                      {a.userName} · {fmtNgn(a.amountNgn)} · {fmtRelative(a.createdAt)}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-4">
            <h2 className="text-base font-display font-bold mb-3">Open by severity</h2>
            <div className="space-y-2.5">
              {bySeverity.map(([sev, count]) => {
                const pct = (count / maxSev) * 100;
                const color =
                  sev === "critical" ? "bg-destructive" : sev === "high" ? "bg-orange-500" : sev === "medium" ? "bg-warning" : "bg-muted-foreground";
                return (
                  <div key={sev}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="capitalize">{sev}</span>
                      <span className="font-mono text-muted-foreground">{count}</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>

            <h2 className="text-base font-display font-bold mt-5 mb-3">Top rules</h2>
            <div className="space-y-1.5">
              {byType.map(([type, count]) => (
                <div key={type} className="flex justify-between items-center text-xs gap-2">
                  <span className="truncate">{alertTypeLabel[type as keyof typeof alertTypeLabel] ?? type}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="w-16 h-1 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${(count / maxType) * 100}%` }} />
                    </div>
                    <span className="font-mono text-muted-foreground tabular-nums w-6 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-card">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-base font-display font-bold">Recent admin activity</h2>
              <p className="text-xs text-muted-foreground">Latest entries from the compliance audit log</p>
            </div>
            <Button asChild variant="ghost" size="sm" className="gap-1">
              <Link to="/compliance/audit">View audit log <ArrowRight className="h-3.5 w-3.5" /></Link>
            </Button>
          </div>
          <div className="divide-y divide-border">
            {recentAudit.map((e) => (
              <div key={e.id} className="py-2 flex items-center gap-3 text-xs">
                <ScrollText className={`h-3.5 w-3.5 shrink-0 ${auditActionTone[e.action]}`} />
                <span className={`font-medium ${auditActionTone[e.action]}`}>{auditActionLabel[e.action]}</span>
                <span className="text-muted-foreground truncate">by {e.actor}</span>
                <span className="font-mono text-[11px] text-muted-foreground truncate">→ {e.target}</span>
                <span className="text-muted-foreground ml-auto shrink-0">{fmtRelative(e.at)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function StatCard({ label, value, sub, icon: Icon, tone }: { label: string; value: string; sub: string; icon: typeof AlertTriangle; tone?: "success" | "warning" | "danger" }) {
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
