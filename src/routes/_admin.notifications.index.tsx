import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Send, FileText, Activity, AlertTriangle, ArrowRight } from "lucide-react";
import {
  templates,
  broadcasts,
  deliveries,
  providers,
  fmtNum,
  fmtPct,
  fmtRelative,
  channelLabel,
  channelTone,
  broadcastStatusTone,
} from "@/lib/notifications-data";

export const Route = createFileRoute("/_admin/notifications/")({
  component: NotificationsOverview,
});

function NotificationsOverview() {
  const stats = useMemo(() => {
    const sent30d = templates.reduce((s, t) => s + t.sent30d, 0);
    const live = templates.filter((t) => t.status === "active").length;
    const inFlight = broadcasts.filter((b) => b.status === "sending" || b.status === "scheduled").length;
    const failed = deliveries.filter((d) => d.status === "failed" || d.status === "bounced").length;
    const failureRate = failed / deliveries.length;
    const liveProviders = providers.filter((p) => p.status === "live").length;
    return { sent30d, live, inFlight, failureRate, liveProviders };
  }, []);

  const recentBroadcasts = useMemo(
    () => [...broadcasts].sort((a, b) => +new Date(b.scheduledAt ?? b.sentAt ?? 0) - +new Date(a.scheduledAt ?? a.sentAt ?? 0)).slice(0, 5),
    []
  );

  const recentFailures = useMemo(
    () => deliveries.filter((d) => d.status === "failed" || d.status === "bounced").slice(0, 6),
    []
  );

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatCard label="Sent · 30d" value={fmtNum(stats.sent30d)} sub="across all channels" icon={Send} />
        <StatCard label="Active templates" value={stats.live.toString()} sub={`${templates.length} total`} icon={FileText} />
        <StatCard label="In flight" value={stats.inFlight.toString()} sub="sending or scheduled" icon={Activity} />
        <StatCard label="Failure rate" value={fmtPct(stats.failureRate)} sub="last 60 events" icon={AlertTriangle} />
        <StatCard label="Live providers" value={stats.liveProviders.toString()} sub={`${providers.length} configured`} icon={Send} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="shadow-card lg:col-span-2">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-base font-display font-bold">Recent broadcasts</h2>
                <p className="text-xs text-muted-foreground">Latest scheduled and sent campaigns</p>
              </div>
              <Button asChild variant="ghost" size="sm" className="gap-1">
                <Link to="/notifications/broadcasts">View all <ArrowRight className="h-3.5 w-3.5" /></Link>
              </Button>
            </div>
            <div className="divide-y divide-border">
              {recentBroadcasts.map((b) => {
                const ctr = b.delivered > 0 ? (b.clicked / b.delivered) * 100 : 0;
                return (
                  <div key={b.id} className="py-2.5 flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{b.name}</div>
                      <div className="text-[11px] text-muted-foreground flex items-center gap-2 flex-wrap mt-0.5">
                        <Badge variant="outline" className={`text-[10px] capitalize ${broadcastStatusTone[b.status]}`}>{b.status}</Badge>
                        <Badge variant="outline" className={`text-[10px] ${channelTone[b.channel]}`}>{channelLabel[b.channel]}</Badge>
                        <span>{b.audience.replace("_", " ")} · {fmtNum(b.audienceSize)}</span>
                        <span>· {fmtRelative(b.scheduledAt ?? b.sentAt ?? new Date().toISOString())}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs font-mono">{ctr.toFixed(1)}%</div>
                      <div className="text-[10px] text-muted-foreground">CTR</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-base font-display font-bold flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-warning" /> Failures</h2>
                <p className="text-xs text-muted-foreground">Bounced and failed deliveries</p>
              </div>
              <Button asChild variant="ghost" size="sm" className="gap-1 -mr-2">
                <Link to="/notifications/delivery">Open <ArrowRight className="h-3.5 w-3.5" /></Link>
              </Button>
            </div>
            <ul className="space-y-2">
              {recentFailures.map((d) => (
                <li key={d.id} className="rounded-md border border-border p-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium truncate">{d.userName}</span>
                    <Badge variant="outline" className={`text-[10px] capitalize ${channelTone[d.channel]}`}>{channelLabel[d.channel]}</Badge>
                  </div>
                  <div className="text-[11px] text-muted-foreground truncate">{d.error ?? d.status} · {d.provider}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{fmtRelative(d.ts)}</div>
                </li>
              ))}
              {recentFailures.length === 0 && <p className="text-xs text-muted-foreground py-4 text-center">All clear.</p>}
            </ul>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}

function StatCard({ label, value, sub, icon: Icon }: { label: string; value: string; sub: string; icon: typeof Send }) {
  return (
    <Card className="shadow-card">
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-1.5">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</div>
          <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
        <div className="text-base font-display font-bold leading-tight">{value}</div>
        <div className="text-[11px] text-muted-foreground mt-0.5 truncate">{sub}</div>
      </CardContent>
    </Card>
  );
}
