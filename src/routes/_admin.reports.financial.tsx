import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Download, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { revenueSeries, channelMix } from "@/lib/reports-data";
import { fmtNgn, fmtNum } from "@/lib/mock-data";

export const Route = createFileRoute("/_admin/reports/financial")({
  component: FinancialPage,
});

const RANGES = ["7d", "30d", "90d"] as const;
type Range = (typeof RANGES)[number];

function FinancialPage() {
  const [range, setRange] = useState<Range>("30d");

  const data = useMemo(() => {
    const n = range === "7d" ? 7 : range === "30d" ? 30 : 30; // 90d uses same seed truncated
    return revenueSeries.slice(-n);
  }, [range]);

  const totals = useMemo(() => {
    const gross = data.reduce((a, r) => a + r.gross, 0);
    const fees = data.reduce((a, r) => a + r.fees, 0);
    const refunds = data.reduce((a, r) => a + r.refunds, 0);
    const net = data.reduce((a, r) => a + r.net, 0);
    return { gross, fees, refunds, net };
  }, [data]);

  const settlement = [
    { provider: "Paystack", expected: 184_300_000, settled: 183_980_000, variance: -320_000 },
    { provider: "Flutterwave", expected: 125_900_000, settled: 125_900_000, variance: 0 },
    { provider: "Monnify", expected: 62_900_000, settled: 62_811_000, variance: -89_000 },
    { provider: "Interswitch", expected: 49_400_000, settled: 49_400_000, variance: 0 },
    { provider: "NIBSS", expected: 26_800_000, settled: 26_412_000, variance: -388_000 },
  ];

  const COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(220 70% 55%)", "hsl(280 70% 60%)", "hsl(40 90% 55%)"];

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      {/* Filters */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold">Financial reporting</h2>
          <p className="text-sm text-muted-foreground">Revenue, fees, refunds and settlement reconciliation.</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={range} onValueChange={(v) => setRange(v as Range)}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              {RANGES.map((r) => <SelectItem key={r} value={r}>Last {r}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => toast.success("Refreshed")}>
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
          <Button size="sm" className="gap-1.5" onClick={() => toast.success("Exporting P&L XLSX…")}>
            <Download className="h-3.5 w-3.5" /> Export
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="Gross" value={fmtNgn(totals.gross)} />
        <Stat label="Fees" value={fmtNgn(totals.fees)} sub="Interchange + scheme" />
        <Stat label="Refunds" value={fmtNgn(totals.refunds)} sub={`${((totals.refunds / totals.gross) * 100).toFixed(2)}% of gross`} />
        <Stat label="Net" value={fmtNgn(totals.net)} sub="After refunds" accent />
      </div>

      {/* Trend */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="font-semibold">Revenue & fees</div>
            <Badge variant="outline" className="font-mono text-xs">NGN</Badge>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="d" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}M`} width={40} />
                <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} formatter={(v: number) => fmtNgn(v)} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="gross" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="net" stroke="hsl(var(--accent))" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="fees" stroke="hsl(220 70% 55%)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Settlement table */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="font-semibold">Settlement reconciliation</div>
              <Button size="sm" variant="ghost" onClick={() => toast.success("Exported reconciliation CSV")}>
                <Download className="h-3.5 w-3.5 mr-1.5" /> CSV
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Provider</TableHead>
                  <TableHead className="text-right">Expected</TableHead>
                  <TableHead className="text-right">Settled</TableHead>
                  <TableHead className="text-right">Variance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {settlement.map((s) => (
                  <TableRow key={s.provider}>
                    <TableCell className="font-medium">{s.provider}</TableCell>
                    <TableCell className="text-right font-mono text-xs">{fmtNgn(s.expected)}</TableCell>
                    <TableCell className="text-right font-mono text-xs">{fmtNgn(s.settled)}</TableCell>
                    <TableCell className="text-right font-mono text-xs">
                      <span className={s.variance < 0 ? "text-rose-600" : "text-emerald-600"}>
                        {s.variance === 0 ? "—" : fmtNgn(s.variance)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Channel mix */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="font-semibold">Revenue by channel</div>
              <span className="text-xs text-muted-foreground">% of gross</span>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={channelMix} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                    {channelMix.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} formatter={(v: number, _n, p: any) => [`${v}% · ${fmtNgn(p.payload.amount)}`, p.payload.name]} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fee breakdown */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="font-semibold">Fee composition (last 30d)</div>
            <span className="text-xs text-muted-foreground">FX markup applies only to cross-border auths on Naira cards</span>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { name: "Interchange", v: 18_400_000 },
                { name: "Scheme", v: 6_120_000 },
                { name: "Processor", v: 4_800_000 },
                { name: "FX markup (cross-border)", v: 2_900_000 },
                { name: "Other", v: 940_000 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}M`} width={40} />
                <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} formatter={(v: number) => fmtNgn(v)} />
                <Bar dataKey="v" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function Stat({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className={`font-display text-xl font-bold tracking-tight ${accent ? "text-primary" : ""}`}>{value}</div>
        {sub && <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>}
      </CardContent>
    </Card>
  );
}
