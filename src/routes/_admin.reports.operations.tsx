import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { txVolumeSeries, productMix, downloadCsv } from "@/lib/reports-data";
import { fmtNgn, fmtNum, fmtPct } from "@/lib/mock-data";

export const Route = createFileRoute("/_admin/reports/operations")({
  component: OperationsPage,
});

function OperationsPage() {
  const [range, setRange] = useState<"7d" | "30d">("30d");
  const data = useMemo(() => txVolumeSeries.slice(range === "7d" ? -7 : -30), [range]);

  const totals = useMemo(() => {
    const total = data.reduce((a, r) => a + r.total, 0);
    const success = data.reduce((a, r) => a + r.success, 0);
    const failed = data.reduce((a, r) => a + r.failed, 0);
    return { total, success, failed, rate: (success / total) * 100 };
  }, [data]);

  const providers = [
    { name: "Paystack", uptime: 99.97, p50: 142, p95: 612, incidents: 0 },
    { name: "Flutterwave", uptime: 99.92, p50: 168, p95: 740, incidents: 1 },
    { name: "Monnify", uptime: 99.81, p50: 198, p95: 902, incidents: 2 },
    { name: "Interswitch", uptime: 99.95, p50: 124, p95: 540, incidents: 0 },
    { name: "NIBSS", uptime: 99.74, p50: 220, p95: 1_140, incidents: 3 },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold">Operations</h2>
          <p className="text-sm text-muted-foreground">Transaction volume, success rates and provider health.</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={range} onValueChange={(v) => setRange(v as any)}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7d</SelectItem>
              <SelectItem value="30d">Last 30d</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" className="gap-1.5" onClick={() => { downloadCsv(`operations-${range}`, data); toast.success("Operations exported"); }}>
            <Download className="h-3.5 w-3.5" /> Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="Transactions" value={fmtNum(totals.total)} />
        <Stat label="Successful" value={fmtNum(totals.success)} sub={fmtPct(totals.rate)} accent />
        <Stat label="Failed" value={fmtNum(totals.failed)} sub={`${((totals.failed / totals.total) * 100).toFixed(2)}% failure`} />
        <Stat label="Avg daily" value={fmtNum(Math.round(totals.total / data.length))} />
      </div>

      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="font-semibold">Volume — success vs failed</div>
            <Badge variant="outline" className="text-xs">stacked</Badge>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="d" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} width={40} />
                <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} formatter={(v: number) => fmtNum(v)} />
                <Bar dataKey="success" stackId="a" fill="hsl(var(--primary))" radius={[0, 0, 0, 0]} />
                <Bar dataKey="failed" stackId="a" fill="hsl(0 70% 55%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <CardContent className="p-5">
            <div className="font-semibold mb-3">Provider uptime & latency</div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Provider</TableHead>
                  <TableHead className="text-right">Uptime</TableHead>
                  <TableHead className="text-right">p50</TableHead>
                  <TableHead className="text-right">p95</TableHead>
                  <TableHead className="text-right">Incidents</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {providers.map((p) => (
                  <TableRow key={p.name}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell className="text-right font-mono text-xs">
                      <span className={p.uptime >= 99.9 ? "text-emerald-600" : "text-amber-600"}>{p.uptime.toFixed(2)}%</span>
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs">{p.p50}ms</TableCell>
                    <TableCell className="text-right font-mono text-xs">{p.p95}ms</TableCell>
                    <TableCell className="text-right">
                      {p.incidents === 0 ? (
                        <span className="text-emerald-600 text-xs">none</span>
                      ) : (
                        <Badge variant="outline" className="bg-rose-500/10 text-rose-600 border-rose-500/20">{p.incidents}</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="font-semibold mb-3">Product mix</div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Transactions</TableHead>
                  <TableHead className="text-right">GMV</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productMix.map((p) => (
                  <TableRow key={p.name}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell className="text-right font-mono text-xs">{fmtNum(p.txns)}</TableCell>
                    <TableCell className="text-right font-mono text-xs">{fmtNgn(p.gmv)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}

function Stat({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className={`font-display text-xl font-bold tracking-tight ${accent ? "text-emerald-600" : ""}`}>{value}</div>
        {sub && <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>}
      </CardContent>
    </Card>
  );
}
