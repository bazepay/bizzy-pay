import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreditCard, Snowflake, AlertTriangle, TrendingUp, ArrowRight } from "lucide-react";
import { cardPrograms, issuedCards, programStatusTone, fmtNgn } from "@/lib/cards-data";
import { fmtNum } from "@/lib/mock-data";

export const Route = createFileRoute("/_admin/cards/")({
  component: CardsOverview,
});

function CardsOverview() {
  const totalIssued = issuedCards.length;
  const totalActive = issuedCards.filter((c) => c.status === "active").length;
  const totalFrozen = issuedCards.filter((c) => c.status === "frozen").length;
  const totalSpend = issuedCards.reduce((s, c) => s + c.spend30dNgn, 0);
  const totalBalance = issuedCards.reduce((s, c) => s + c.balanceNgn, 0);
  const avgRisk = Math.round(issuedCards.reduce((s, c) => s + c.riskScore, 0) / issuedCards.length);
  const recent = [...issuedCards].sort((a, b) => +new Date(b.issuedAt) - +new Date(a.issuedAt)).slice(0, 6);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Kpi label="Total issued" value={fmtNum(totalIssued)} sub={`${fmtNum(totalActive)} active`} icon={CreditCard} />
        <Kpi label="Frozen" value={fmtNum(totalFrozen)} sub="Manual / risk holds" icon={Snowflake} />
        <Kpi label="30-day spend" value={fmtNgn(totalSpend)} sub="Across all programs" icon={TrendingUp} />
        <Kpi label="Avg risk score" value={String(avgRisk)} sub={avgRisk >= 70 ? "Elevated" : avgRisk >= 40 ? "Moderate" : "Low"} icon={AlertTriangle} tone={avgRisk >= 70 ? "danger" : undefined} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {cardPrograms.map((p) => (
          <Card key={p.id} className="shadow-card overflow-hidden">
            <div className="bg-gradient-primary p-5 text-primary-foreground">
              <div className="flex items-center justify-between">
                <div className="text-xs opacity-80 uppercase tracking-wider">{p.brand} · {p.currency}</div>
                <Badge variant="outline" className={`text-[10px] capitalize ${programStatusTone[p.status]} bg-white/10 border-white/30`}>
                  {p.status}
                </Badge>
              </div>
              <div className="font-display text-xl font-bold mt-2">{p.name}</div>
              <div className="font-mono text-xs opacity-80 mt-0.5">BIN {p.bin} · {p.issuer}</div>
            </div>
            <CardContent className="p-4 space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Issued">{fmtNum(p.issuedCount)}</Field>
                <Field label="Active">{fmtNum(p.activeCount)}</Field>
                <Field label="Approval rate">{p.approvalRate.toFixed(1)}%</Field>
                <Field label="FX markup">{(p.fxMarkupBps / 100).toFixed(2)}%</Field>
              </div>
              <Link to="/cards/programs" className="block">
                <Button variant="outline" size="sm" className="w-full">
                  Manage program <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="shadow-card">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base">Recently issued</CardTitle>
          <Link to="/cards/issued" className="text-xs text-primary hover:underline">
            View all →
          </Link>
        </CardHeader>
        <CardContent className="space-y-2">
          {recent.map((c) => (
            <Link
              key={c.id}
              to="/cards/$id"
              params={{ id: c.id }}
              className="flex items-center justify-between py-2 border-b last:border-0 hover:bg-muted/40 -mx-2 px-2 rounded transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-8 w-12 rounded bg-gradient-primary flex items-center justify-center shrink-0">
                  <CreditCard className="h-3.5 w-3.5 text-primary-foreground" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{c.user.name}</div>
                  <div className="text-xs text-muted-foreground font-mono">•••• {c.last4} · {c.brand}</div>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-xs text-muted-foreground">{new Date(c.issuedAt).toLocaleDateString()}</div>
                <div className="text-xs font-mono">{fmtNgn(c.balanceNgn)}</div>
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>

      <div className="text-xs text-muted-foreground text-right">
        Total card balances: <span className="font-mono font-semibold">{fmtNgn(totalBalance)}</span> across {totalIssued} cards
      </div>
    </motion.div>
  );
}

function Kpi({ label, value, sub, icon: Icon, tone }: { label: string; value: string; sub: string; icon: React.ComponentType<{ className?: string }>; tone?: "danger" }) {
  return (
    <Card className="shadow-card">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground uppercase tracking-wider">{label}</div>
          <Icon className={`h-4 w-4 ${tone === "danger" ? "text-destructive" : "text-muted-foreground"}`} />
        </div>
        <div className={`font-display text-2xl font-bold mt-1 ${tone === "danger" ? "text-destructive" : ""}`}>{value}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>
      </CardContent>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="font-mono mt-0.5">{children}</div>
    </div>
  );
}
