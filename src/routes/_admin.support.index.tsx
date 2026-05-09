import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Inbox, MessageSquare, Clock, CheckCircle2, AlertTriangle, TrendingUp, ArrowRight } from "lucide-react";
import {
  tickets,
  chatSessions,
  ticketStatusTone,
  priorityTone,
  channelLabel,
  categoryLabel,
  fmtMins,
  fmtRelative,
} from "@/lib/support-data";

export const Route = createFileRoute("/_admin/support/")({
  component: SupportOverview,
});

function SupportOverview() {
  const stats = useMemo(() => {
    const open = tickets.filter((t) => t.status === "new" || t.status === "open" || t.status === "pending").length;
    const breaching = tickets.filter((t) => {
      if (t.status === "resolved" || t.status === "closed") return false;
      const ageMins = Math.round((Date.now() - new Date(t.createdAt).getTime()) / 60_000);
      return ageMins > t.slaTargetMins;
    }).length;
    const resolvedToday = tickets.filter((t) => {
      if (t.status !== "resolved" && t.status !== "closed") return false;
      const ageMins = Math.round((Date.now() - new Date(t.updatedAt).getTime()) / 60_000);
      return ageMins < 1440;
    }).length;
    const replied = tickets.filter((t) => t.firstResponseMins != null);
    const avgFr = replied.length
      ? Math.round(replied.reduce((s, t) => s + (t.firstResponseMins ?? 0), 0) / replied.length)
      : 0;
    const resolved = tickets.filter((t) => t.resolutionMins != null);
    const avgRes = resolved.length
      ? Math.round(resolved.reduce((s, t) => s + (t.resolutionMins ?? 0), 0) / resolved.length)
      : 0;
    const waiting = chatSessions.filter((c) => c.status === "waiting").length;
    const active = chatSessions.filter((c) => c.status === "active").length;
    return { open, breaching, resolvedToday, avgFr, avgRes, waiting, active };
  }, []);

  const byChannel = useMemo(() => {
    const map = new Map<string, number>();
    tickets.forEach((t) => {
      if (t.status === "resolved" || t.status === "closed") return;
      map.set(t.channel, (map.get(t.channel) ?? 0) + 1);
    });
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, []);

  const byCategory = useMemo(() => {
    const map = new Map<string, number>();
    tickets.forEach((t) => {
      if (t.status === "resolved" || t.status === "closed") return;
      map.set(t.category, (map.get(t.category) ?? 0) + 1);
    });
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, []);

  const recent = useMemo(
    () =>
      [...tickets]
        .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
        .slice(0, 6),
    []
  );

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard label="Open tickets" value={stats.open.toLocaleString()} sub="Awaiting agent" icon={Inbox} />
        <StatCard label="SLA breaching" value={stats.breaching.toLocaleString()} sub="Past target" icon={AlertTriangle} tone={stats.breaching > 0 ? "danger" : undefined} />
        <StatCard label="Resolved 24h" value={stats.resolvedToday.toLocaleString()} sub="Last day" icon={CheckCircle2} tone="success" />
        <StatCard label="Avg first reply" value={fmtMins(stats.avgFr)} sub="Across all" icon={Clock} />
        <StatCard label="Avg resolution" value={fmtMins(stats.avgRes)} sub="End-to-end" icon={TrendingUp} />
        <StatCard label="Live chat" value={`${stats.waiting} / ${stats.active}`} sub="Waiting / active" icon={MessageSquare} tone={stats.waiting > 5 ? "warning" : undefined} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="shadow-card lg:col-span-2">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-base font-display font-bold">Recent tickets</h2>
                <p className="text-xs text-muted-foreground">Latest customer issues across all channels</p>
              </div>
              <Button asChild variant="ghost" size="sm" className="gap-1">
                <Link to="/support/tickets">View all <ArrowRight className="h-3.5 w-3.5" /></Link>
              </Button>
            </div>
            <div className="divide-y divide-border">
              {recent.map((t) => (
                <Link key={t.id} to="/support/tickets/$id" params={{ id: t.id }} className="py-2.5 flex items-start gap-3 hover:bg-muted/40 -mx-2 px-2 rounded transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-[11px] text-muted-foreground">{t.id}</span>
                      <Badge variant="outline" className={`text-[10px] capitalize ${priorityTone[t.priority]}`}>{t.priority}</Badge>
                      <Badge variant="outline" className={`text-[10px] capitalize ${ticketStatusTone[t.status]}`}>{t.status}</Badge>
                    </div>
                    <div className="text-sm font-medium mt-0.5 truncate">{t.subject}</div>
                    <div className="text-xs text-muted-foreground mt-0.5 truncate">
                      {t.customerName} · {channelLabel[t.channel]} · {fmtRelative(t.createdAt)}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-4">
            <h2 className="text-base font-display font-bold mb-3">Open by channel</h2>
            <div className="space-y-2.5">
              {byChannel.map(([ch, count]) => {
                const max = byChannel[0][1];
                const pct = (count / max) * 100;
                return (
                  <div key={ch}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="capitalize">{channelLabel[ch as keyof typeof channelLabel] ?? ch}</span>
                      <span className="font-mono text-muted-foreground">{count}</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>

            <h2 className="text-base font-display font-bold mt-5 mb-3">Top categories</h2>
            <div className="space-y-1.5">
              {byCategory.map(([cat, count]) => (
                <div key={cat} className="flex justify-between items-center text-xs">
                  <span className="truncate">{categoryLabel[cat as keyof typeof categoryLabel] ?? cat}</span>
                  <span className="font-mono text-muted-foreground ml-2">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}

function StatCard({ label, value, sub, icon: Icon, tone }: { label: string; value: string; sub: string; icon: typeof Inbox; tone?: "success" | "warning" | "danger" }) {
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
