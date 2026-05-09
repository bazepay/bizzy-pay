import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle, AlertCircle, CheckCircle2, Clock, Search, RefreshCw, Activity, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { billers, billerStatusTone, categoryLabel, type Biller, type BillerStatus } from "@/lib/pay-data";

export const Route = createFileRoute("/_admin/pay/incidents")({
  head: () => ({
    meta: [
      { title: "Incidents — Bill Pay — BazePay Admin" },
      { name: "description", content: "Live monitoring of biller incidents, degradations and downtime." },
    ],
  }),
  component: IncidentsPage,
});

type IncidentSeverity = "critical" | "major" | "minor";
type IncidentState = "open" | "monitoring" | "resolved";

type Incident = {
  id: string;
  biller: Biller;
  severity: IncidentSeverity;
  state: IncidentState;
  title: string;
  detectedAt: string;
  updatedAt: string;
  durationMin: number;
  affectedOrders: number;
  successDrop: number; // percentage points
  note: string;
};

const severityTone: Record<IncidentSeverity, string> = {
  critical: "bg-destructive/15 text-destructive border-destructive/30",
  major: "bg-warning/15 text-warning border-warning/30",
  minor: "bg-muted text-muted-foreground border-border",
};

const stateTone: Record<IncidentState, string> = {
  open: "bg-destructive/15 text-destructive border-destructive/30",
  monitoring: "bg-warning/15 text-warning border-warning/30",
  resolved: "bg-success/15 text-success border-success/30",
};

function buildIncidents(): Incident[] {
  const now = Date.now();
  const seeds: Array<Partial<Incident> & { biller: Biller }> = [];

  // Live incidents from current biller status
  billers.forEach((b, i) => {
    if (b.status === "down") {
      seeds.push({
        biller: b,
        severity: "critical",
        state: "open",
        title: `${b.name} provider gateway unreachable`,
        detectedAt: new Date(now - (90 + i * 13) * 60_000).toISOString(),
        updatedAt: new Date(now - (3 + i) * 60_000).toISOString(),
        durationMin: 90 + i * 13,
        affectedOrders: 124 + i * 9,
        successDrop: 99,
        note: "Provider returns 504 on /vend. Routed traffic paused; refunds queued.",
      });
    } else if (b.status === "degraded") {
      seeds.push({
        biller: b,
        severity: "major",
        state: "monitoring",
        title: `${b.name} elevated failure rate`,
        detectedAt: new Date(now - (40 + i * 7) * 60_000).toISOString(),
        updatedAt: new Date(now - (5 + i) * 60_000).toISOString(),
        durationMin: 40 + i * 7,
        affectedOrders: 32 + i * 4,
        successDrop: Math.max(5, 100 - b.successRate),
        note: "Latency >2s on provider callbacks. Auto-retry enabled.",
      });
    }
  });

  // Recent resolved incidents (history)
  const history: Array<Partial<Incident> & { biller: Biller; ago: number; dur: number; sev: IncidentSeverity; title: string; note: string; affected: number; drop: number }> = [
    { biller: billers.find((b) => b.id === "blr_dstv")!, ago: 6 * 60, dur: 47, sev: "major", title: "DStv smartcard validation timeouts", affected: 88, drop: 18, note: "VTpass acknowledged provider issue. Cleared after failover." },
    { biller: billers.find((b) => b.id === "blr_mtn_data")!, ago: 14 * 60, dur: 22, sev: "minor", title: "MTN Data slow plan listing", affected: 14, drop: 4, note: "Cache rebuilt, normal." },
    { biller: billers.find((b) => b.id === "blr_eko")!, ago: 26 * 60, dur: 65, sev: "major", title: "EKEDC token delivery delay", affected: 142, drop: 22, note: "Tokens manually re-pushed for affected meters." },
    { biller: billers.find((b) => b.id === "blr_bet9ja")!, ago: 38 * 60, dur: 18, sev: "minor", title: "Bet9ja wallet sync lag", affected: 26, drop: 6, note: "Provider self-resolved." },
    { biller: billers.find((b) => b.id === "blr_airtel")!, ago: 50 * 60, dur: 31, sev: "major", title: "Airtel airtime vending failures", affected: 71, drop: 15, note: "Routed to Flutterwave fallback." },
    { biller: billers.find((b) => b.id === "blr_gotv")!, ago: 72 * 60, dur: 12, sev: "minor", title: "GOtv plan price refresh failed", affected: 0, drop: 0, note: "Sync re-run." },
  ];
  history.forEach((h, i) => {
    seeds.push({
      biller: h.biller,
      severity: h.sev,
      state: "resolved",
      title: h.title,
      detectedAt: new Date(now - (h.ago + h.dur) * 60_000).toISOString(),
      updatedAt: new Date(now - h.ago * 60_000).toISOString(),
      durationMin: h.dur,
      affectedOrders: h.affected,
      successDrop: h.drop,
      note: h.note,
    });
    void i;
  });

  return seeds.map((s, i) => ({
    id: `inc_${String(2400 + i).padStart(5, "0")}`,
    biller: s.biller,
    severity: s.severity!,
    state: s.state!,
    title: s.title!,
    detectedAt: s.detectedAt!,
    updatedAt: s.updatedAt!,
    durationMin: s.durationMin!,
    affectedOrders: s.affectedOrders!,
    successDrop: s.successDrop!,
    note: s.note!,
  }));
}

function formatAgo(iso: string): string {
  const diff = Date.now() - +new Date(iso);
  const m = Math.round(diff / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  return `${d}d ago`;
}

function formatDuration(min: number): string {
  if (min < 60) return `${min}m`;
  const h = Math.floor(min / 60);
  const r = min % 60;
  return r ? `${h}h ${r}m` : `${h}h`;
}

function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>(() => buildIncidents());
  const [q, setQ] = useState("");
  const [stateFilter, setStateFilter] = useState<"all" | IncidentState>("all");
  const [sevFilter, setSevFilter] = useState<"all" | IncidentSeverity>("all");

  const open = incidents.filter((i) => i.state === "open");
  const monitoring = incidents.filter((i) => i.state === "monitoring");
  const resolved24 = incidents.filter((i) => i.state === "resolved" && +new Date(i.updatedAt) > Date.now() - 24 * 3600_000);
  const totalAffected = incidents.filter((i) => i.state !== "resolved").reduce((s, i) => s + i.affectedOrders, 0);

  const filtered = useMemo(() => {
    return incidents
      .filter((i) => (stateFilter === "all" ? true : i.state === stateFilter))
      .filter((i) => (sevFilter === "all" ? true : i.severity === sevFilter))
      .filter((i) => {
        if (!q.trim()) return true;
        const s = q.toLowerCase();
        return i.title.toLowerCase().includes(s) || i.biller.name.toLowerCase().includes(s) || i.id.toLowerCase().includes(s);
      })
      .sort((a, b) => {
        const order = { open: 0, monitoring: 1, resolved: 2 } as const;
        if (order[a.state] !== order[b.state]) return order[a.state] - order[b.state];
        return +new Date(b.updatedAt) - +new Date(a.updatedAt);
      });
  }, [incidents, q, stateFilter, sevFilter]);

  const acknowledge = (id: string) => {
    setIncidents((arr) => arr.map((i) => (i.id === id ? { ...i, state: "monitoring", updatedAt: new Date().toISOString() } : i)));
    toast.success("Incident acknowledged.");
  };
  const resolve = (id: string) => {
    setIncidents((arr) => arr.map((i) => (i.id === id ? { ...i, state: "resolved", updatedAt: new Date().toISOString() } : i)));
    toast.success("Incident resolved.");
  };
  const refresh = () => {
    setIncidents(buildIncidents());
    toast.success("Incidents refreshed.");
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Kpi label="Open incidents" value={open.length.toString()} sub="Require action" icon={ShieldAlert} tone={open.length > 0 ? "danger" : "success"} />
        <Kpi label="Monitoring" value={monitoring.length.toString()} sub="Acknowledged" icon={Activity} tone={monitoring.length > 0 ? "warning" : undefined} />
        <Kpi label="Resolved (24h)" value={resolved24.length.toString()} sub="Closed today" icon={CheckCircle2} tone="success" />
        <Kpi label="Affected orders" value={totalAffected.toLocaleString()} sub="Active impact" icon={AlertCircle} tone={totalAffected > 0 ? "warning" : undefined} />
      </div>

      <Card className="shadow-card">
        <CardContent className="p-5 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search incidents, billers, IDs…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
            </div>
            <Select value={stateFilter} onValueChange={(v) => setStateFilter(v as typeof stateFilter)}>
              <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All states</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="monitoring">Monitoring</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sevFilter} onValueChange={(v) => setSevFilter(v as typeof sevFilter)}>
              <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All severities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="major">Major</SelectItem>
                <SelectItem value="minor">Minor</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={refresh} className="gap-2">
              <RefreshCw className="h-3.5 w-3.5" /> Refresh
            </Button>
          </div>

          <div className="rounded-md border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Incident</TableHead>
                  <TableHead>Biller</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>State</TableHead>
                  <TableHead>Detected</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead className="text-right">Affected</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-sm text-muted-foreground py-10">No incidents match.</TableCell>
                  </TableRow>
                ) : filtered.map((i) => (
                  <TableRow key={i.id} className="align-top">
                    <TableCell className="max-w-[320px]">
                      <div className="text-sm font-medium leading-tight">{i.title}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5 truncate">{i.id} · {i.note}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="h-7 w-7 rounded-md flex items-center justify-center text-sm shrink-0" style={{ backgroundColor: `${i.biller.color}22`, color: i.biller.color }}>
                          {i.biller.logo ?? "•"}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm truncate">{i.biller.name}</div>
                          <div className="text-[11px] text-muted-foreground capitalize">{categoryLabel[i.biller.category]} · {i.biller.route}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[10px] capitalize ${severityTone[i.severity]}`}>{i.severity}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[10px] capitalize ${stateTone[i.state]}`}>{i.state}</Badge>
                      <div className="text-[10px] text-muted-foreground mt-0.5">
                        Biller: <span className={`capitalize ${billerStatusTone[i.biller.status as BillerStatus].split(" ")[1]}`}>{i.biller.status}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs">{formatAgo(i.detectedAt)}</div>
                      <div className="text-[10px] text-muted-foreground inline-flex items-center gap-1 mt-0.5">
                        <Clock className="h-3 w-3" /> upd {formatAgo(i.updatedAt)}
                      </div>
                    </TableCell>
                    <TableCell><span className="text-xs font-mono">{formatDuration(i.durationMin)}</span></TableCell>
                    <TableCell className="text-right">
                      <div className="text-sm font-mono">{i.affectedOrders.toLocaleString()}</div>
                      <div className="text-[10px] text-muted-foreground">−{i.successDrop}% success</div>
                    </TableCell>
                    <TableCell className="text-right">
                      {i.state === "open" && (
                        <Button size="sm" variant="outline" onClick={() => acknowledge(i.id)} className="h-7 text-xs">Acknowledge</Button>
                      )}
                      {i.state === "monitoring" && (
                        <Button size="sm" variant="outline" onClick={() => resolve(i.id)} className="h-7 text-xs">Resolve</Button>
                      )}
                      {i.state === "resolved" && (
                        <span className="text-[11px] text-muted-foreground">Closed</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
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
