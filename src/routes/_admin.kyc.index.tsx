import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Search, Filter, ShieldCheck, Clock, CheckCircle2, XCircle, AlertTriangle, Download,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { fmtNum } from "@/lib/mock-data";
import {
  kycSubmissions, decisionLabel, decisionTone, ageHours, slaTone, type KycDecision,
} from "@/lib/kyc-data";
import { riskTone, fmtRelative } from "@/lib/users-data";
import { toast } from "sonner";

export const Route = createFileRoute("/_admin/kyc/")({
  head: () => ({
    meta: [
      { title: "KYC — BazePay Admin" },
      { name: "description", content: "Review and decide pending KYC submissions." },
    ],
  }),
  component: KycQueue,
});

function KycQueue() {
  const [q, setQ] = useState("");
  const [decision, setDecision] = useState<string>("queue");
  const [risk, setRisk] = useState<string>("any");
  const [page, setPage] = useState(0);
  const pageSize = 14;

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return kycSubmissions
      .filter((s) => {
        if (needle) {
          const hay = `${s.id} ${s.user.name} ${s.user.email} ${s.user.id} ${s.idType} ${s.idNumberLast4}`.toLowerCase();
          if (!hay.includes(needle)) return false;
        }
        if (decision === "queue") {
          if (s.decision !== "pending" && s.decision !== "in_review") return false;
        } else if (decision !== "any" && s.decision !== decision) return false;

        if (risk === "high" && s.riskScore < 70) return false;
        if (risk === "med" && (s.riskScore < 40 || s.riskScore >= 70)) return false;
        if (risk === "low" && s.riskScore >= 40) return false;
        return true;
      })
      .sort((a, b) => +new Date(a.submittedAt) - +new Date(b.submittedAt));
  }, [q, decision, risk]);

  const paged = filtered.slice(page * pageSize, (page + 1) * pageSize);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  const totals = useMemo(() => {
    const today = Date.now() - 24 * 3_600_000;
    const submittedToday = kycSubmissions.filter((s) => +new Date(s.submittedAt) > today).length;
    const approvedToday = kycSubmissions.filter((s) => s.decision === "approved" && s.decidedAt && +new Date(s.decidedAt) > today).length;
    const rejectedToday = kycSubmissions.filter((s) => s.decision === "rejected" && s.decidedAt && +new Date(s.decidedAt) > today).length;
    const queue = kycSubmissions.filter((s) => s.decision === "pending" || s.decision === "in_review").length;
    const decided = kycSubmissions.filter((s) => s.decidedAt);
    const avgHrs =
      decided.length === 0
        ? 0
        : decided.reduce((sum, s) => sum + (new Date(s.decidedAt!).getTime() - new Date(s.submittedAt).getTime()) / 3_600_000, 0) / decided.length;
    return { submittedToday, approvedToday, rejectedToday, queue, avgHrs };
  }, []);

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-5">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-end justify-between flex-wrap gap-3"
      >
        <div>
          <h1 className="font-display text-2xl font-bold">KYC review</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {fmtNum(filtered.length)} submission{filtered.length === 1 ? "" : "s"} · oldest first
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => toast.success("KYC report exported.")}>
            <Download className="h-3.5 w-3.5 mr-1.5" />
            Export
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Kpi label="In queue" value={fmtNum(totals.queue)} icon={Clock} tone="warning" />
        <Kpi label="Submitted (24h)" value={fmtNum(totals.submittedToday)} icon={ShieldCheck} tone="primary" />
        <Kpi label="Approved (24h)" value={fmtNum(totals.approvedToday)} icon={CheckCircle2} tone="success" />
        <Kpi label="Rejected (24h)" value={fmtNum(totals.rejectedToday)} icon={XCircle} tone="destructive" />
        <Kpi label="Avg decision" value={`${totals.avgHrs.toFixed(1)}h`} icon={AlertTriangle} tone="gold" />
      </div>

      <Card className="shadow-card">
        <CardContent className="p-4 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => { setQ(e.target.value); setPage(0); }}
              placeholder="KYC id, user, email, ID type or last 4…"
              className="pl-9"
            />
          </div>

          <Select value={decision} onValueChange={(v) => { setDecision(v); setPage(0); }}>
            <SelectTrigger className="w-[170px] h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="queue">Open queue</SelectItem>
              <SelectItem value="any">All decisions</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_review">In review</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="more_info">More info</SelectItem>
            </SelectContent>
          </Select>

          <Select value={risk} onValueChange={(v) => { setRisk(v); setPage(0); }}>
            <SelectTrigger className="w-[150px] h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any risk</SelectItem>
              <SelectItem value="low">Low (&lt; 40)</SelectItem>
              <SelectItem value="med">Medium (40–69)</SelectItem>
              <SelectItem value="high">High (≥ 70)</SelectItem>
            </SelectContent>
          </Select>

          {(q || decision !== "queue" || risk !== "any") && (
            <Button variant="ghost" size="sm" onClick={() => { setQ(""); setDecision("queue"); setRisk("any"); setPage(0); }}>
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
              <TableHead>Submission</TableHead>
              <TableHead>User</TableHead>
              <TableHead>ID type</TableHead>
              <TableHead>Decision</TableHead>
              <TableHead className="text-right">Liveness</TableHead>
              <TableHead className="text-right">Risk</TableHead>
              <TableHead>Flags</TableHead>
              <TableHead>Age</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paged.map((s) => {
              const hrs = ageHours(s.submittedAt);
              return (
                <TableRow key={s.id}>
                  <TableCell>
                    <Link to="/kyc/$id" params={{ id: s.id }} className="font-mono text-xs text-primary hover:underline">
                      {s.id}
                    </Link>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{fmtRelative(s.submittedAt)}</div>
                  </TableCell>
                  <TableCell>
                    <Link to="/users/$id" params={{ id: s.user.id }} className="text-sm font-medium hover:text-primary truncate block">
                      {s.user.name}
                    </Link>
                    <div className="text-xs text-muted-foreground truncate">{s.user.email}</div>
                  </TableCell>
                  <TableCell className="text-sm">
                    <div>{s.idType}</div>
                    <div className="text-xs text-muted-foreground font-mono">•••• {s.idNumberLast4}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-xs ${decisionTone[s.decision as KycDecision]}`}>
                      {decisionLabel[s.decision]}
                    </Badge>
                    {s.reviewer && <div className="text-[10px] text-muted-foreground mt-1">{s.reviewer}</div>}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {(s.livenessScore * 100).toFixed(0)}%
                  </TableCell>
                  <TableCell className={`text-right font-mono text-sm ${riskTone(s.riskScore)}`}>
                    {s.riskScore}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 flex-wrap">
                      {s.sanctionsHit && <Badge variant="outline" className="text-[10px] bg-destructive/10 text-destructive border-destructive/30">Sanctions</Badge>}
                      {s.pepHit && <Badge variant="outline" className="text-[10px] bg-warning/20 text-warning-foreground border-warning/40">PEP</Badge>}
                      {s.duplicateFaceHit && <Badge variant="outline" className="text-[10px] bg-destructive/10 text-destructive border-destructive/30">Dup face</Badge>}
                      {!s.sanctionsHit && !s.pepHit && !s.duplicateFaceHit && (
                        <span className="text-[10px] text-muted-foreground">Clear</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className={`text-xs font-mono ${slaTone(hrs)}`}>
                    {hrs < 1 ? "<1h" : `${hrs.toFixed(0)}h`}
                  </TableCell>
                </TableRow>
              );
            })}
            {paged.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-muted-foreground text-sm">
                  No KYC submissions match your filters.
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

function Kpi({ label, value, icon: Icon, tone }: { label: string; value: string; icon: typeof Clock; tone: "warning" | "primary" | "success" | "destructive" | "gold" }) {
  const toneBg = {
    warning: "bg-warning/20 text-warning-foreground",
    primary: "bg-primary/10 text-primary",
    success: "bg-success/15 text-success",
    destructive: "bg-destructive/10 text-destructive",
    gold: "bg-gold/15 text-gold-foreground",
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
