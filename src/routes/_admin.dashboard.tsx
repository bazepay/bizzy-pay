import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Users,
  ShieldCheck,
  TrendingUp,
  Wallet,
  CreditCard,
  Smartphone,
  Phone,
  AlertTriangle,
  Headphones,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  fmtNgn,
  fmtNum,
  fmtPct,
  kpis,
  recentActivity,
  recentAlerts,
  serviceBreakdown,
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

const toneClasses: Record<Tone, string> = {
  primary: "bg-primary/10 text-primary",
  gold: "bg-gold/15 text-gold-foreground",
  success: "bg-success/15 text-success",
  warning: "bg-warning/20 text-warning-foreground",
  destructive: "bg-destructive/10 text-destructive",
};

function Kpi({
  label,
  value,
  delta,
  icon: Icon,
  tone = "primary",
  format = "num",
}: {
  label: string;
  value: number;
  delta: number;
  icon: typeof Users;
  tone?: Tone;
  format?: "num" | "ngn" | "pct";
}) {
  const positive = delta >= 0;
  const display =
    format === "ngn" ? fmtNgn(value) : format === "pct" ? `${value.toFixed(1)}%` : fmtNum(value);

  return (
    <Card className="shadow-card">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className={`h-9 w-9 rounded-md flex items-center justify-center ${toneClasses[tone]}`}>
            <Icon className="h-4 w-4" />
          </div>
          {delta !== 0 && (
            <div
              className={`flex items-center gap-0.5 text-xs font-medium ${
                positive ? "text-success" : "text-destructive"
              }`}
            >
              {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {fmtPct(delta)}
            </div>
          )}
        </div>
        <div className="mt-4">
          <div className="font-display text-2xl font-bold tracking-tight">{display}</div>
          <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function DashboardPage() {
  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-end justify-between flex-wrap gap-3"
      >
        <div>
          <h1 className="font-display text-2xl font-bold">Operations dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Live snapshot of platform activity. Last updated just now.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">Last 7 days</Button>
          <Button size="sm" className="bg-primary text-primary-foreground">Export</Button>
        </div>
      </motion.div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <Kpi label="Active users" value={kpis.activeUsers.value} delta={kpis.activeUsers.delta} icon={Users} />
        <Kpi label="New signups (7d)" value={kpis.newSignups.value} delta={kpis.newSignups.delta} icon={TrendingUp} tone="gold" />
        <Kpi label="KYC conversion" value={kpis.kycConversion.value} delta={kpis.kycConversion.delta} icon={ShieldCheck} tone="success" format="pct" />
        <Kpi label="Open compliance alerts" value={kpis.openCompliance.value} delta={kpis.openCompliance.delta} icon={AlertTriangle} tone="destructive" />

        <Kpi label="Volume processed (7d)" value={kpis.processedVolumeNgn.value} delta={kpis.processedVolumeNgn.delta} icon={Activity} format="ngn" />
        <Kpi label="Gross fees" value={kpis.grossFeesNgn.value} delta={kpis.grossFeesNgn.delta} icon={Wallet} tone="gold" format="ngn" />
        <Kpi label="Net revenue" value={kpis.netRevenueNgn.value} delta={kpis.netRevenueNgn.delta} icon={TrendingUp} tone="success" format="ngn" />
        <Kpi label="Live chat queue" value={kpis.liveChatQueue.value} delta={0} icon={Headphones} tone="warning" />

        <Kpi label="Cards issued" value={kpis.cardsIssued.value} delta={kpis.cardsIssued.delta} icon={CreditCard} />
        <Kpi label="eSIMs activated" value={kpis.esimsActivated.value} delta={kpis.esimsActivated.delta} icon={Smartphone} tone="gold" />
        <Kpi label="Numbers leased" value={kpis.numbersLeased.value} delta={kpis.numbersLeased.delta} icon={Phone} />
        <Kpi label="KYC backlog" value={kpis.kycBacklog.value} delta={kpis.kycBacklog.delta} icon={ShieldCheck} tone="warning" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 shadow-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base">Volume processed</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">NGN-equivalent across all channels</p>
            </div>
            <Badge variant="secondary" className="bg-success/15 text-success border-0">
              +18.3%
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={volumeSeries} margin={{ left: 8, right: 8, top: 8, bottom: 0 }}>
                  <defs>
                    <linearGradient id="volume" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="oklch(0.32 0.14 280)" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="oklch(0.32 0.14 280)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.91 0.01 280)" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="oklch(0.5 0.02 280)" />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    stroke="oklch(0.5 0.02 280)"
                    tickFormatter={(v) => `₦${(v / 1_000_000).toFixed(0)}M`}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      border: "1px solid oklch(0.91 0.01 280)",
                      fontSize: 12,
                    }}
                    formatter={(v: number) => fmtNgn(v)}
                  />
                  <Area
                    type="monotone"
                    dataKey="volume"
                    stroke="oklch(0.32 0.14 280)"
                    strokeWidth={2}
                    fill="url(#volume)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Volume by service</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">Share of last 7 days</p>
          </CardHeader>
          <CardContent>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={serviceBreakdown} layout="vertical" margin={{ left: 8, right: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.91 0.01 280)" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11 }} stroke="oklch(0.5 0.02 280)" tickFormatter={(v) => `${v}%`} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} stroke="oklch(0.5 0.02 280)" width={70} />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: "1px solid oklch(0.91 0.01 280)", fontSize: 12 }}
                    formatter={(v: number) => `${v}%`}
                  />
                  <Bar dataKey="value" fill="oklch(0.82 0.16 85)" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts + activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Alerts</CardTitle>
            <Button variant="ghost" size="sm" className="text-xs h-7">View all</Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentAlerts.map((a) => (
              <div key={a.id} className="flex items-start gap-3 p-3 rounded-md hover:bg-muted/50 transition">
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
                  <div className="text-xs text-muted-foreground mt-0.5">{a.body}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Recent activity</CardTitle>
            <Button variant="ghost" size="sm" className="text-xs h-7">Audit log</Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentActivity.map((a) => (
              <div key={a.id} className="flex items-center gap-3 p-3 rounded-md hover:bg-muted/50 transition">
                <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-[11px] font-semibold text-primary shrink-0">
                  {a.actor === "system" ? "S" : a.actor[0]}
                </div>
                <div className="flex-1 min-w-0 text-sm">
                  <span className="font-medium">{a.actor}</span>{" "}
                  <span className="text-muted-foreground">{a.action}</span>{" "}
                  <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">{a.target}</span>
                </div>
                <div className="text-xs text-muted-foreground shrink-0">{a.at}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
