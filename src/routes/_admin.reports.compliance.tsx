import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Download, FileWarning } from "lucide-react";
import { toast } from "sonner";
import { kycFunnel } from "@/lib/reports-data";
import { fmtNum } from "@/lib/mock-data";

export const Route = createFileRoute("/_admin/reports/compliance")({
  component: CompliancePage,
});

function CompliancePage() {
  const total = kycFunnel[0].count;
  const approved = kycFunnel[kycFunnel.length - 1].count;
  const conversion = (approved / total) * 100;

  const aml = [
    { tier: "Tier-1 alerts", open: 18, closed: 124, sars: 4 },
    { tier: "Tier-2 alerts", open: 31, closed: 86, sars: 2 },
    { tier: "Tier-3 alerts", open: 9, closed: 24, sars: 7 },
  ];

  const sanctions = [
    { list: "OFAC SDN", screened: 184_320, hits: 12, confirmed: 0 },
    { list: "UN Consolidated", screened: 184_320, hits: 8, confirmed: 0 },
    { list: "EU Sanctions", screened: 184_320, hits: 5, confirmed: 0 },
    { list: "NFIU watchlist", screened: 184_320, hits: 23, confirmed: 2 },
    { list: "PEP", screened: 184_320, hits: 142, confirmed: 38 },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold">Compliance reporting</h2>
          <p className="text-sm text-muted-foreground">KYC conversion, AML alert dispositions and sanctions screening.</p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => toast.success("Exporting compliance pack (PDF)…")}>
          <Download className="h-3.5 w-3.5" /> Compliance pack
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="KYC started" value={fmtNum(total)} />
        <Stat label="KYC approved" value={fmtNum(approved)} sub={`${conversion.toFixed(1)}% conversion`} accent />
        <Stat label="Open AML alerts" value={fmtNum(aml.reduce((a, r) => a + r.open, 0))} />
        <Stat label="SARs filed (30d)" value={fmtNum(aml.reduce((a, r) => a + r.sars, 0))} />
      </div>

      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="font-semibold">KYC funnel</div>
            <Badge variant="outline" className="text-xs">last 30 days</Badge>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={kycFunnel} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(1)}k`} />
                <YAxis dataKey="stage" type="category" tick={{ fontSize: 12 }} width={130} />
                <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} formatter={(v: number) => fmtNum(v)} />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="font-semibold flex items-center gap-2">
                <FileWarning className="h-4 w-4 text-amber-600" /> AML alerts
              </div>
              <Button size="sm" variant="ghost" onClick={() => toast.success("Exported AML CSV")}>
                <Download className="h-3.5 w-3.5 mr-1.5" /> CSV
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Severity</TableHead>
                  <TableHead className="text-right">Open</TableHead>
                  <TableHead className="text-right">Closed</TableHead>
                  <TableHead className="text-right">SARs</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {aml.map((a) => (
                  <TableRow key={a.tier}>
                    <TableCell className="font-medium">{a.tier}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20">{a.open}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs">{a.closed}</TableCell>
                    <TableCell className="text-right font-mono text-xs">{a.sars}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="font-semibold">Sanctions & PEP screening</div>
              <Button size="sm" variant="ghost" onClick={() => toast.success("Exported screening report")}>
                <Download className="h-3.5 w-3.5 mr-1.5" /> CSV
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>List</TableHead>
                  <TableHead className="text-right">Screened</TableHead>
                  <TableHead className="text-right">Hits</TableHead>
                  <TableHead className="text-right">Confirmed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sanctions.map((s) => (
                  <TableRow key={s.list}>
                    <TableCell className="font-medium">{s.list}</TableCell>
                    <TableCell className="text-right font-mono text-xs">{fmtNum(s.screened)}</TableCell>
                    <TableCell className="text-right font-mono text-xs">{s.hits}</TableCell>
                    <TableCell className="text-right">
                      {s.confirmed === 0 ? (
                        <span className="text-emerald-600 text-xs">0</span>
                      ) : (
                        <Badge variant="outline" className="bg-rose-500/10 text-rose-600 border-rose-500/20">{s.confirmed}</Badge>
                      )}
                    </TableCell>
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
