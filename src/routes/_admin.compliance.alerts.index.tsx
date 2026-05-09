import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Download } from "lucide-react";
import { toast } from "sonner";
import {
  amlAlerts,
  alertStatusLabel,
  alertStatusTone,
  alertTypeLabel,
  severityTone,
  fmtNgn,
  fmtRelative,
  type AlertSeverity,
  type AlertStatus,
} from "@/lib/compliance-data";

export const Route = createFileRoute("/_admin/compliance/alerts/")({
  component: AlertsPage,
});

function AlertsPage() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [sev, setSev] = useState<"all" | AlertSeverity>("all");
  const [status, setStatus] = useState<"all" | AlertStatus>("all");

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    return amlAlerts.filter((a) => {
      if (sev !== "all" && a.severity !== sev) return false;
      if (status !== "all" && a.status !== status) return false;
      if (!term) return true;
      return (
        a.id.toLowerCase().includes(term) ||
        a.userName.toLowerCase().includes(term) ||
        a.userId.toLowerCase().includes(term) ||
        a.ruleName.toLowerCase().includes(term)
      );
    });
  }, [q, sev, status]);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by ID, user or rule…" className="pl-8" />
        </div>
        <Select value={sev} onValueChange={(v) => setSev(v as typeof sev)}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All severities</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
          <SelectTrigger className="w-[170px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="investigating">Investigating</SelectItem>
            <SelectItem value="escalated">Escalated</SelectItem>
            <SelectItem value="cleared">Cleared</SelectItem>
            <SelectItem value="sar_filed">SAR filed</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" className="gap-2" onClick={() => toast.success(`Exported ${rows.length} alerts to CSV`)}>
          <Download className="h-4 w-4" /> Export
        </Button>
      </div>

      <Card className="shadow-card overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[110px]">Alert</TableHead>
                <TableHead>Rule</TableHead>
                <TableHead>User</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assignee</TableHead>
                <TableHead className="text-right">Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((a) => (
                <TableRow
                  key={a.id}
                  className="cursor-pointer"
                  onClick={(e) => {
                    const tgt = e.target as HTMLElement;
                    if (tgt.closest("button, a")) return;
                    navigate({ to: "/compliance/alerts/$id", params: { id: a.id } });
                  }}
                >
                  <TableCell className="font-mono text-xs">{a.id}</TableCell>
                  <TableCell>
                    <div className="text-sm font-medium">{a.ruleName}</div>
                    <div className="text-[11px] text-muted-foreground">{alertTypeLabel[a.type]} · {a.txnCount} txn / {a.windowHours}h</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{a.userName}</div>
                    <div className="font-mono text-[11px] text-muted-foreground">{a.userId}</div>
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">{fmtNgn(a.amountNgn)}</TableCell>
                  <TableCell><Badge variant="outline" className={`text-[10px] capitalize ${severityTone[a.severity]}`}>{a.severity}</Badge></TableCell>
                  <TableCell><Badge variant="outline" className={`text-[10px] ${alertStatusTone[a.status]}`}>{alertStatusLabel[a.status]}</Badge></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{a.assignee ?? "Unassigned"}</TableCell>
                  <TableCell className="text-right text-xs text-muted-foreground">{fmtRelative(a.createdAt)}</TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow><TableCell colSpan={8} className="text-center text-sm text-muted-foreground py-10">No alerts match your filters.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </motion.div>
  );
}
