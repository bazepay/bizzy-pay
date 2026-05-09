import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Download, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { auditLog, fmtRelative, type AuditEntry } from "@/lib/settings-data";

export const Route = createFileRoute("/_admin/settings/audit-log")({
  component: AuditLogPage,
});

const RESULT_TONE: Record<AuditEntry["result"], string> = {
  success: "border-success/40 text-success",
  denied: "border-warning/40 text-warning",
  error: "border-destructive/40 text-destructive",
};

function AuditLogPage() {
  const [q, setQ] = useState("");
  const [result, setResult] = useState<"all" | AuditEntry["result"]>("all");

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    return auditLog.filter((e) => {
      if (result !== "all" && e.result !== result) return false;
      if (!term) return true;
      return (
        e.actorName.toLowerCase().includes(term) ||
        e.action.toLowerCase().includes(term) ||
        e.entity.toLowerCase().includes(term) ||
        e.entityId.toLowerCase().includes(term) ||
        e.ip.includes(term)
      );
    });
  }, [q, result]);

  const exportCsv = () => {
    const header = ["id", "ts", "actorId", "actorName", "action", "entity", "entityId", "ip", "ua", "result"];
    const csv = [
      header.join(","),
      ...rows.map((e) => [e.id, e.ts, e.actorId, `"${e.actorName}"`, e.action, e.entity, e.entityId, e.ip, `"${e.ua}"`, e.result].join(",")),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `audit-log-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${rows.length} rows · watermark: ${new Date().toISOString()}`);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="rounded-md border border-border bg-muted/30 px-3 py-2 flex items-center gap-2 text-xs">
        <ShieldCheck className="h-3.5 w-3.5 text-success shrink-0" />
        <span><span className="font-semibold">Append-only.</span> Entries cannot be edited or deleted. Exports include a watermark with the requesting admin and timestamp.</span>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search actor, action, entity or IP…" className="pl-8" />
        </div>
        <Select value={result} onValueChange={(v) => setResult(v as typeof result)}>
          <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All results</SelectItem>
            <SelectItem value="success">Success</SelectItem>
            <SelectItem value="denied">Denied</SelectItem>
            <SelectItem value="error">Error</SelectItem>
          </SelectContent>
        </Select>
        <Button size="sm" variant="outline" className="gap-2" onClick={exportCsv}>
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </div>

      <Card className="shadow-card">
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/40 text-muted-foreground">
              <tr className="text-left">
                <th className="px-3 py-2 font-medium">When</th>
                <th className="px-3 py-2 font-medium">Actor</th>
                <th className="px-3 py-2 font-medium">Action</th>
                <th className="px-3 py-2 font-medium">Entity</th>
                <th className="px-3 py-2 font-medium">IP</th>
                <th className="px-3 py-2 font-medium">User-agent</th>
                <th className="px-3 py-2 font-medium">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((e) => (
                <tr key={e.id} className="hover:bg-muted/20">
                  <td className="px-3 py-2 whitespace-nowrap">{fmtRelative(e.ts)}</td>
                  <td className="px-3 py-2">
                    <div className="font-medium">{e.actorName}</div>
                    <div className="font-mono text-[10px] text-muted-foreground">{e.actorId}</div>
                  </td>
                  <td className="px-3 py-2 font-mono">{e.action}</td>
                  <td className="px-3 py-2">
                    <div>{e.entity}</div>
                    <div className="font-mono text-[10px] text-muted-foreground">{e.entityId}</div>
                  </td>
                  <td className="px-3 py-2 font-mono">{e.ip}</td>
                  <td className="px-3 py-2 text-muted-foreground truncate max-w-[180px]">{e.ua}</td>
                  <td className="px-3 py-2">
                    <Badge variant="outline" className={`text-[10px] capitalize ${RESULT_TONE[e.result]}`}>{e.result}</Badge>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={7} className="px-3 py-10 text-center text-muted-foreground">No entries match your filters.</td></tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </motion.div>
  );
}
