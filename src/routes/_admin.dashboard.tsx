import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Users,
  ShieldCheck,
  TrendingUp,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
  Wallet,
  AlertTriangle,
  CheckCircle2,
  CircleDot,
  XCircle,
  Download,
  BarChart3,
  Banknote,
  UserCheck,
  ShieldQuestion,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  fmtNgn,
  fmtNum,
  fmtPct,
  kpis,
  opsQueues,
  recentActivity,
  recentAlerts,
  serviceBreakdown,
  spark,
  systemHealth,
  volumeSeries,
} from "@/lib/mock-data";

export const Route = createFileRoute("/_admin/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — BazePay Admin" },
      { name: "description", content: "Operational overview, KPIs, and alerts." },
    ],
  }),
  component: DashboardPage,
});

type Tone = "primary" | "gold" | "success" | "warning" | "destructive";

const toneText: Record<Tone, string> = {
  primary: "text-primary",
  gold: "text-gold-foreground",
  success: "text-success",
  warning: "text-warning-foreground",
  destructive: "text-destructive",
};
const toneBg: Record<Tone, string> = {
  primary: "bg-primary/10",
  gold: "bg-gold/15",
  success: "bg-success/15",
  warning: "bg-warning/20",
  destructive: "bg-destructive/10",
};
const toneStroke: Record<Tone, string> = {
  primary: "oklch(0.32 0.14 280)",
  gold: "oklch(0.78 0.15 85)",
  success: "oklch(0.62 0.17 150)",
  warning: "oklch(0.78 0.15 70)",
  destructive: "oklch(0.58 0.20 25)",
};

function HeroKpi({
  label,
  value,
  delta,
  series,
  tone,
  format = "num",
  icon: Icon,
}: {
  label: string;
  value: number;
  delta: number;
  series: number[];
  tone: Tone;
  format?: "num" | "ngn" | "pct";
  icon: React.ComponentType<{ className?: string }>;
}) {
  const positive = delta >= 0;
  const display =
    format === "ngn" ? fmtNgn(value) : format === "pct" ? `${value.toFixed(1)}%` : fmtNum(value);
  const data = series.map((v, i) => ({ i, v }));
  const gradId = `kpi-grad-${tone}-${label.replace(/\s+/g, "")}`;

  return (
    <Card className="shadow-card overflow-hidden relative group hover:shadow-md transition-shadow">
      {/* Top accent bar */}
      <div className={`h-1 w-full ${toneBg[tone]}`}>
        <div className={`h-full w-1/3 ${toneText[tone].replace("text-", "bg-")}`} />
      </div>
      <CardContent className="p-5 pb-0">
        <div className="flex items-start justify-between gap-3">
          <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${toneBg[tone]} ${toneText[tone]}`}>
            <Icon className="h-4.5 w-4.5" />
          </div>
          <div
            className={`inline-flex items-center gap-0.5 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
              positive ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
            }`}
          >
            {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {fmtPct(delta)}
          </div>
        </div>
        <div className="mt-3 text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
          {label}
        </div>
        <div className="mt-0.5 font-display text-[28px] leading-tight font-bold tracking-tight tabular-nums">
          {display}
        </div>
      </CardContent>
      {/* Sparkline bleeds to bottom edge */}
      <div className="h-10 -mt-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 0, bottom: 0, left: 0, right: 0 }}>
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={toneStroke[tone]} stopOpacity={0.28} />
                <stop offset="100%" stopColor={toneStroke[tone]} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="v"
              stroke={toneStroke[tone]}
              strokeWidth={1.75}
              fill={`url(#${gradId})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

function StatusDot({ status }: { status: "ok" | "degraded" | "down" }) {
  if (status === "ok")
    return <CheckCircle2 className="h-3.5 w-3.5 text-success" />;
  if (status === "degraded")
    return <CircleDot className="h-3.5 w-3.5 text-warning-foreground" />;
  return <XCircle className="h-3.5 w-3.5 text-destructive" />;
}

function DashboardPage() {
  const totalQueue = opsQueues.reduce((s, q) => s + q.count, 0);

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-end justify-between flex-wrap gap-3"
      >
        <div>
          <h1 className="font-display text-2xl font-bold">Operations dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {totalQueue} items awaiting action across {opsQueues.length} queues · live snapshot
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">Last 7 days</Button>
          <Button size="sm" variant="outline">
            <Download className="h-3.5 w-3.5 mr-1.5" />
            Export
          </Button>
        </div>
      </motion.div>

      {/* Hero KPIs — 4 only */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <HeroKpi
          label="Volume processed (7d)"
          value={kpis.processedVolumeNgn.value}
          delta={kpis.processedVolumeNgn.delta}
          series={spark.volume}
          tone="primary"
          format="ngn"
          icon={BarChart3}
        />
        <HeroKpi
          label="Net revenue (7d)"
          value={kpis.netRevenueNgn.value}
          delta={kpis.netRevenueNgn.delta}
          series={spark.revenue}
          tone="gold"
          format="ngn"
          icon={Banknote}
        />
        <HeroKpi
          label="Active users"
          value={kpis.activeUsers.value}
          delta={kpis.activeUsers.delta}
          series={spark.users}
          tone="success"
          icon={UserCheck}
        />
        <HeroKpi
          label="KYC conversion"
          value={kpis.kycConversion.value}
          delta={kpis.kycConversion.delta}
          series={spark.kyc}
          tone="primary"
          format="pct"
          icon={ShieldQuestion}
        />
      </div>

      {/* Main grid: chart 2/3 + Action center 1/3 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 shadow-card">
          <Tabs defaultValue="volume">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                  <CardTitle className="text-base">Performance</CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Trend across volume, fees, and service mix
                  </p>
                </div>
                <TabsList className="h-8">
                  <TabsTrigger value="volume" className="text-xs h-6 px-3">Volume</TabsTrigger>
                  <TabsTrigger value="fees" className="text-xs h-6 px-3">Fees</TabsTrigger>
                  <TabsTrigger value="mix" className="text-xs h-6 px-3">Service mix</TabsTrigger>
                </TabsList>
              </div>
            </CardHeader>
            <CardContent>
              <TabsContent value="volume" className="mt-0">
                <ChartArea dataKey="volume" stroke="oklch(0.32 0.14 280)" formatter={(v) => fmtNgn(v)} yFmt={(v) => `₦${(v / 1_000_000).toFixed(0)}M`} />
              </TabsContent>
              <TabsContent value="fees" className="mt-0">
                <ChartArea dataKey="fees" stroke="oklch(0.78 0.15 85)" formatter={(v) => fmtNgn(v)} yFmt={(v) => `₦${(v / 1_000).toFixed(0)}k`} />
              </TabsContent>
              <TabsContent value="mix" className="mt-0">
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={serviceBreakdown} layout="vertical" margin={{ left: 8, right: 16 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.91 0.01 280)" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 11 }} stroke="oklch(0.5 0.02 280)" tickFormatter={(v) => `${v}%`} />
                      <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} stroke="oklch(0.5 0.02 280)" width={80} />
                      <Tooltip
                        contentStyle={{ borderRadius: 8, border: "1px solid oklch(0.91 0.01 280)", fontSize: 12 }}
                        formatter={(v: number) => `${v}%`}
                      />
                      <Bar dataKey="value" fill="oklch(0.82 0.16 85)" radius={[0, 6, 6, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>

        {/* Action center */}
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base">Action center</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Queues that need a human</p>
            </div>
            <Badge variant="secondary" className="bg-primary/10 text-primary border-0">
              {totalQueue}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {opsQueues.map((q) => (
              <Link
                key={q.key}
                to={"/dashboard"}
                className="group flex items-center gap-3 p-2.5 rounded-md hover:bg-muted/60 transition"
              >
                <div className={`h-9 w-9 rounded-md flex items-center justify-center ${toneBg[q.tone]} ${toneText[q.tone]}`}>
                  <span className="font-display text-sm font-bold">{q.count}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{q.label}</div>
                  <div className="text-xs text-muted-foreground">
                    SLA {q.sla}
                    {q.breaching > 0 && (
                      <span className="text-destructive font-medium"> · {q.breaching} breaching</span>
                    )}
                  </div>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition" />
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Bottom row: System health · Alerts · Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">System health</CardTitle>
            <Badge variant="secondary" className="bg-warning/20 text-warning-foreground border-0">
              1 degraded
            </Badge>
          </CardHeader>
          <CardContent className="space-y-1">
            {systemHealth.map((s) => (
              <div key={s.name} className="flex items-center justify-between py-2 border-b last:border-0">
                <div className="flex items-center gap-2.5">
                  <StatusDot status={s.status} />
                  <span className="text-sm font-medium">{s.name}</span>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground tabular-nums">{s.latency}</div>
                  <div className="text-[10px] text-muted-foreground tabular-nums">{s.uptime}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning-foreground" />
              Alerts
            </CardTitle>
            <Button variant="ghost" size="sm" className="text-xs h-7">View all</Button>
          </CardHeader>
          <CardContent className="space-y-1">
            {recentAlerts.map((a) => (
              <div key={a.id} className="flex items-start gap-3 p-2.5 rounded-md hover:bg-muted/50 transition">
                <div
                  className={`h-2 w-2 rounded-full mt-1.5 shrink-0 ${
                    a.level === "high" ? "bg-destructive" : a.level === "med" ? "bg-warning" : "bg-success"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-medium text-sm truncate">{a.title}</div>
                    <div className="text-xs text-muted-foreground shrink-0">{a.at}</div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5 truncate">{a.body}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Recent activity
            </CardTitle>
            <Button variant="ghost" size="sm" className="text-xs h-7">Audit log</Button>
          </CardHeader>
          <CardContent className="space-y-1">
            {recentActivity.slice(0, 5).map((a) => (
              <div key={a.id} className="flex items-center gap-3 p-2.5 rounded-md hover:bg-muted/50 transition">
                <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-[11px] font-semibold text-primary shrink-0">
                  {a.actor === "system" ? "S" : a.actor[0]}
                </div>
                <div className="flex-1 min-w-0 text-sm">
                  <span className="font-medium">{a.actor}</span>{" "}
                  <span className="text-muted-foreground">{a.action}</span>{" "}
                  <span className="font-mono text-[11px] bg-muted px-1.5 py-0.5 rounded">{a.target}</span>
                </div>
                <div className="text-xs text-muted-foreground shrink-0">{a.at}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Compact secondary KPIs */}
      <Card className="shadow-card">
        <CardContent className="p-0">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 divide-x divide-y md:divide-y-0">
            {[
              { label: "New signups (7d)", value: fmtNum(kpis.newSignups.value), delta: kpis.newSignups.delta, icon: TrendingUp },
              { label: "Gross fees", value: fmtNgn(kpis.grossFeesNgn.value), delta: kpis.grossFeesNgn.delta, icon: Wallet },
              { label: "Cards issued", value: fmtNum(kpis.cardsIssued.value), delta: kpis.cardsIssued.delta, icon: Users },
              { label: "eSIMs activated", value: fmtNum(kpis.esimsActivated.value), delta: kpis.esimsActivated.delta, icon: Users },
              { label: "Numbers leased", value: fmtNum(kpis.numbersLeased.value), delta: kpis.numbersLeased.delta, icon: Users },
              { label: "Open compliance", value: fmtNum(kpis.openCompliance.value), delta: kpis.openCompliance.delta, icon: ShieldCheck },
            ].map((s) => {
              const positive = s.delta >= 0;
              return (
                <div key={s.label} className="p-4">
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{s.label}</div>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="font-display font-bold text-lg">{s.value}</span>
                    <span className={`text-xs font-medium ${positive ? "text-success" : "text-destructive"}`}>
                      {fmtPct(s.delta)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ChartArea({
  dataKey,
  stroke,
  formatter,
  yFmt,
}: {
  dataKey: "volume" | "fees";
  stroke: string;
  formatter: (v: number) => string;
  yFmt: (v: number) => string;
}) {
  const id = `grad-${dataKey}`;
  return (
    <div className="h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={volumeSeries} margin={{ left: 8, right: 8, top: 8, bottom: 0 }}>
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={stroke} stopOpacity={0.35} />
              <stop offset="100%" stopColor={stroke} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.91 0.01 280)" vertical={false} />
          <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="oklch(0.5 0.02 280)" />
          <YAxis tick={{ fontSize: 11 }} stroke="oklch(0.5 0.02 280)" tickFormatter={yFmt} width={56} />
          <Tooltip
            contentStyle={{ borderRadius: 8, border: "1px solid oklch(0.91 0.01 280)", fontSize: 12 }}
            formatter={(v: number) => formatter(v)}
          />
          <Area type="monotone" dataKey={dataKey} stroke={stroke} strokeWidth={2} fill={`url(#${id})`} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
