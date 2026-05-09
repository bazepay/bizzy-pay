import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Play, Download, Banknote, Activity, Scale, TrendingUp, FileText } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { toast } from "sonner";
import {
  reports,
  revenueSeries,
  categoryLabel,
  categoryTone,
  fmtRelative,
  type ReportCategory,
} from "@/lib/reports-data";
import { fmtNgn, fmtNum } from "@/lib/mock-data";

export const Route = createFileRoute("/_admin/reports/")({
  component: ReportsOverview,
});

function ReportsOverview() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<"all" | ReportCategory>("all");

  const totals = useMemo(() => {
    const gross = revenueSeries.reduce((a, r) => a + r.gross, 0);
    const fees = revenueSeries.reduce((a, r) => a + r.fees, 0);
    const net = revenueSeries.reduce((a, r) => a + r.net, 0);
    return { gross, fees, net, count: reports.length };
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return reports.filter((r) => {
      if (cat !== "all" && r.category !== cat) return false;
      if (!term) return true;
      return r.name.toLowerCase().includes(term) || r.description.toLowerCase().includes(term);
    });
  }, [q, cat]);

  const runNow = (name: string) => toast.success(`Queued “${name}” — you'll get an email when ready`);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KpiCard label="Gross revenue (30d)" value={fmtNgn(totals.gross)} icon={Banknote} accent="emerald" />
        <KpiCard label="Fees collected" value={fmtNgn(totals.fees)} icon={TrendingUp} accent="blue" />
        <KpiCard label="Net contribution" value={fmtNgn(totals.net)} icon={Activity} accent="violet" />
        <KpiCard label="Reports in catalog" value={fmtNum(totals.count)} icon={FileText} accent="amber" />
      </div>

      {/* Trend */}
      <Card className="overflow-hidden">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-sm text-muted-foreground">Revenue trend</div>
              <div className="font-display text-lg font-semibold">Last 30 days · gross vs net</div>
            </div>
            <Badge variant="outline" className="font-mono text-xs">NGN</Badge>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueSeries} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="d" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}M`} width={40} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                  formatter={(v: number) => fmtNgn(v)}
                />
                <Area type="monotone" dataKey="gross" stroke="hsl(var(--primary))" fill="url(#g1)" strokeWidth={2} />
                <Area type="monotone" dataKey="net" stroke="hsl(var(--accent))" fill="url(#g2)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Catalog */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="font-display text-xl font-semibold">Report catalog</h2>
          <p className="text-sm text-muted-foreground">Run on demand or schedule recurring delivery.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-2.5 top-2.5 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search reports" className="pl-8 w-56" />
          </div>
          <Select value={cat} onValueChange={(v) => setCat(v as typeof cat)}>
            <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              <SelectItem value="financial">Financial</SelectItem>
              <SelectItem value="operations">Operations</SelectItem>
              <SelectItem value="compliance">Compliance</SelectItem>
              <SelectItem value="growth">Growth</SelectItem>
              <SelectItem value="product">Product</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((r) => (
          <Card key={r.id} className="hover:border-primary/40 transition-colors">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <Badge variant="outline" className={categoryTone[r.category]}>
                    {categoryLabel[r.category]}
                  </Badge>
                  <div className="font-semibold">{r.name}</div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2 min-h-10">{r.description}</p>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Last run {fmtRelative(r.lastRun)}</span>
                <span>{fmtNum(r.rowsLastRun)} rows</span>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <Button size="sm" onClick={() => runNow(r.name)} className="gap-1.5">
                  <Play className="h-3.5 w-3.5" /> Run now
                </Button>
                <Button size="sm" variant="outline" onClick={() => toast.success(`Downloaded ${r.formats[0].toUpperCase()}`)} className="gap-1.5">
                  <Download className="h-3.5 w-3.5" /> {r.formats[0].toUpperCase()}
                </Button>
                <div className="ml-auto text-xs text-muted-foreground">{r.owner}</div>
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <Card className="md:col-span-2 lg:col-span-3"><CardContent className="p-10 text-center text-sm text-muted-foreground">No reports match your filters.</CardContent></Card>
        )}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <QuickLink to="/reports/financial" icon={Banknote} title="Financial" desc="P&L, settlements, fees, FX markup." />
        <QuickLink to="/reports/operations" icon={Activity} title="Operations" desc="Volume, success rates, channel mix." />
        <QuickLink to="/reports/compliance" icon={Scale} title="Compliance" desc="KYC funnel, AML alerts, sanctions." />
      </div>
    </motion.div>
  );
}

function KpiCard({ label, value, icon: Icon, accent }: { label: string; value: string; icon: any; accent: string }) {
  const tones: Record<string, string> = {
    emerald: "bg-emerald-500/10 text-emerald-600",
    blue: "bg-blue-500/10 text-blue-600",
    violet: "bg-violet-500/10 text-violet-600",
    amber: "bg-amber-500/10 text-amber-600",
  };
  return (
    <Card>
      <CardContent className="p-5 flex items-center gap-4">
        <div className={`h-11 w-11 rounded-xl flex items-center justify-center ${tones[accent]}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <div className="text-xs text-muted-foreground">{label}</div>
          <div className="font-display text-xl font-bold tracking-tight">{value}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function QuickLink({ to, icon: Icon, title, desc }: { to: string; icon: any; title: string; desc: string }) {
  return (
    <Link to={to as any} className="block">
      <Card className="hover:border-primary/40 transition-colors h-full">
        <CardContent className="p-5 flex items-start gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <div className="font-semibold">{title}</div>
            <div className="text-sm text-muted-foreground">{desc}</div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
