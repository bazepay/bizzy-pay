import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Search, Filter, Receipt, CheckCircle2, XCircle, Clock, AlertTriangle, Download, ArrowDownLeft, ArrowUpRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { fmtNgn, fmtNum } from "@/lib/mock-data";
import {
  transactions, txnStatusTone, txnStatusLabel, txnTypeLabel, type TxnStatus, type TxnType,
} from "@/lib/txn-data";
import { riskTone, fmtRelative } from "@/lib/users-data";
import { toast } from "sonner";

export const Route = createFileRoute("/_admin/transactions/")({
  head: () => ({
    meta: [
      { title: "Transactions — BazePay Admin" },
      { name: "description", content: "Search, filter and inspect every transaction across the platform." },
    ],
  }),
  component: TxnQueue,
});

function TxnQueue() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("any");
  const [type, setType] = useState<string>("any");
  const [risk, setRisk] = useState<string>("any");
  const [flagged, setFlagged] = useState<string>("any");
  const [page, setPage] = useState(0);
  const pageSize = 16;

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return transactions.filter((t) => {
      if (needle) {
        const hay = `${t.id} ${t.ref} ${t.user.name} ${t.user.email} ${t.provider} ${t.counterparty?.name ?? ""}`.toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      if (status !== "any" && t.status !== status) return false;
      if (type !== "any" && t.type !== type) return false;
      if (flagged === "yes" && !t.flagged) return false;
      if (flagged === "no" && t.flagged) return false;
      if (risk === "high" && t.riskScore < 70) return false;
      if (risk === "med" && (t.riskScore < 40 || t.riskScore >= 70)) return false;
      if (risk === "low" && t.riskScore >= 40) return false;
      return true;
    });
  }, [q, status, type, risk, flagged]);

  const paged = filtered.slice(page * pageSize, (page + 1) * pageSize);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  const totals = useMemo(() => {
    const today = Date.now() - 24 * 3_600_000;
    const last24 = transactions.filter((t) => +new Date(t.at) > today);
    const success = last24.filter((t) => t.status === "success");
    const failed = last24.filter((t) => t.status === "failed");
    const pending = transactions.filter((t) => t.status === "pending" || t.status === "review");
    const volume = success.reduce((s, t) => s + t.amountNgn, 0);
    const fees = success.reduce((s, t) => s + t.feeNgn, 0);
    return {
      count: last24.length,
      volume,
      fees,
      successRate: last24.length === 0 ? 0 : (success.length / last24.length) * 100,
      failed: failed.length,
      pending: pending.length,
    };
  }, []);

  const exportCsv = () => {
    const headers = ["id", "ref", "type", "status", "direction", "amount_ngn", "fee_ngn", "provider", "channel", "user_id", "user_name", "email", "counterparty", "risk", "flagged", "at"];
    const rows = filtered.map((t) => [
      t.id, t.ref, t.type, t.status, t.direction, t.amountNgn, t.feeNgn, t.provider, t.channel,
      t.user.id, t.user.name, t.user.email, t.counterparty?.name ?? "", t.riskScore, t.flagged, t.at,
    ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","));
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `transactions-${new Date().toISOString().slice(0,10)}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${filtered.length} transactions.`);
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-5">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Transactions</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {fmtNum(filtered.length)} of {fmtNum(transactions.length)} · most recent first
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={exportCsv}>
            <Download className="h-3.5 w-3.5 mr-1.5" />
            Export
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Kpi label="Volume (24h)" value={fmtNgn(totals.volume)} icon={Receipt} tone="primary" />
        <Kpi label="Fees (24h)" value={fmtNgn(totals.fees)} icon={CheckCircle2} tone="success" />
        <Kpi label="Success rate" value={`${totals.successRate.toFixed(1)}%`} icon={CheckCircle2} tone="success" />
        <Kpi label="Failed (24h)" value={fmtNum(totals.failed)} icon={XCircle} tone="destructive" />
        <Kpi label="Pending / review" value={fmtNum(totals.pending)} icon={Clock} tone="warning" />
      </div>

      <Card className="shadow-card">
        <CardContent className="p-4 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => { setQ(e.target.value); setPage(0); }}
              placeholder="Txn id, ref, user, email, provider, counterparty…"
              className="pl-9"
            />
          </div>

          <Select value={status} onValueChange={(v) => { setStatus(v); setPage(0); }}>
            <SelectTrigger className="w-[150px] h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any status</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="review">In review</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="reversed">Reversed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={type} onValueChange={(v) => { setType(v); setPage(0); }}>
            <SelectTrigger className="w-[150px] h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any type</SelectItem>
              {(["topup","transfer","airtime","data","electricity","tv","betting","card_spend","esim","number","refund","fee"] as TxnType[]).map((t) => (
                <SelectItem key={t} value={t}>{txnTypeLabel(t)}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={risk} onValueChange={(v) => { setRisk(v); setPage(0); }}>
            <SelectTrigger className="w-[140px] h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any risk</SelectItem>
              <SelectItem value="low">Low (&lt; 40)</SelectItem>
              <SelectItem value="med">Medium (40–69)</SelectItem>
              <SelectItem value="high">High (≥ 70)</SelectItem>
            </SelectContent>
          </Select>

          <Select value={flagged} onValueChange={(v) => { setFlagged(v); setPage(0); }}>
            <SelectTrigger className="w-[140px] h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="any">All</SelectItem>
              <SelectItem value="yes">Flagged</SelectItem>
              <SelectItem value="no">Clean</SelectItem>
            </SelectContent>
          </Select>

          {(q || status !== "any" || type !== "any" || risk !== "any" || flagged !== "any") && (
            <Button variant="ghost" size="sm" onClick={() => { setQ(""); setStatus("any"); setType("any"); setRisk("any"); setFlagged("any"); setPage(0); }}>
              <Filter className="h-3.5 w-3.5 mr-1.5" />
              Clear
            </Button>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead>Txn</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Risk</TableHead>
              <TableHead>When</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paged.map((t) => (
              <TableRow key={t.id}>
                <TableCell>
                  <Link to="/transactions/$id" params={{ id: t.id }} className="font-mono text-xs text-primary hover:underline">
                    {t.id}
                  </Link>
                  <div className="text-[10px] text-muted-foreground mt-0.5 font-mono">{t.ref}</div>
                </TableCell>
                <TableCell>
                  <Link to="/users/$id" params={{ id: t.user.id }} className="text-sm font-medium hover:text-primary truncate block">
                    {t.user.name}
                  </Link>
                  <div className="text-xs text-muted-foreground truncate">{t.user.email}</div>
                </TableCell>
                <TableCell className="text-sm">
                  <div className="flex items-center gap-1.5">
                    {t.direction === "in" ? (
                      <ArrowDownLeft className="h-3.5 w-3.5 text-success" />
                    ) : (
                      <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                    {txnTypeLabel(t.type)}
                  </div>
                  <div className="text-[10px] text-muted-foreground capitalize">{t.channel}</div>
                </TableCell>
                <TableCell className="text-sm">{t.provider}</TableCell>
                <TableCell className="text-right">
                  <div className={`font-mono text-sm ${t.direction === "in" ? "text-success" : ""}`}>
                    {t.direction === "in" ? "+" : "−"}{fmtNgn(t.amountNgn)}
                  </div>
                  <div className="text-[10px] text-muted-foreground font-mono">fee {fmtNgn(t.feeNgn)}</div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={`text-xs ${txnStatusTone[t.status as TxnStatus]}`}>
                    {txnStatusLabel[t.status]}
                  </Badge>
                  {t.flagged && <div className="text-[10px] text-warning-foreground mt-1 flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Flagged</div>}
                </TableCell>
                <TableCell className={`text-right font-mono text-sm ${riskTone(t.riskScore)}`}>
                  {t.riskScore}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">{fmtRelative(t.at)}</TableCell>
              </TableRow>
            ))}
            {paged.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-muted-foreground text-sm">
                  No transactions match your filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <div className="flex items-center justify-between p-3 border-t bg-muted/20">
          <div className="text-xs text-muted-foreground">Page {page + 1} of {totalPages}</div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>Previous</Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}>Next</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

function Kpi({ label, value, icon: Icon, tone }: { label: string; value: string; icon: typeof Clock; tone: "warning" | "primary" | "success" | "destructive" }) {
  const toneBg = {
    warning: "bg-warning/20 text-warning-foreground",
    primary: "bg-primary/10 text-primary",
    success: "bg-success/15 text-success",
    destructive: "bg-destructive/10 text-destructive",
  }[tone];
  return (
    <Card className="shadow-card">
      <CardContent className="p-4 flex items-center gap-3">
        <div className={`h-10 w-10 rounded-md flex items-center justify-center ${toneBg}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <div className="text-xs text-muted-foreground">{label}</div>
          <div className="font-display text-lg font-bold tracking-tight truncate">{value}</div>
        </div>
      </CardContent>
    </Card>
  );
}
