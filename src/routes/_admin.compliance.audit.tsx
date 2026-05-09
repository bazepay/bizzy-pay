import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Download, ScrollText } from "lucide-react";
import { toast } from "sonner";
import { auditLog, auditActionLabel, auditActionTone, fmtRelative, type AuditAction } from "@/lib/compliance-data";

export const Route = createFileRoute("/_admin/compliance/audit")({
  component: AuditPage,
});

function AuditPage() {
  const [q, setQ] = useState("");
  const [action, setAction] = useState<"all" | AuditAction>("all");

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    return auditLog.filter((e) => {
      if (action !== "all" && e.action !== action) return false;
      if (!term) return true;
      return (
        e.id.toLowerCase().includes(term) ||
        e.actor.toLowerCase().includes(term) ||
        e.target.toLowerCase().includes(term) ||
        e.actorEmail.toLowerCase().includes(term)
      );
    });
  }, [q, action]);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by actor, target or ID…" className="pl-8" />
        </div>
        <Select value={action} onValueChange={(v) => setAction(v as typeof action)}>
          <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All actions</SelectItem>
            {(Object.keys(auditActionLabel) as AuditAction[]).map((k) => (
              <SelectItem key={k} value={k}>{auditActionLabel[k]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" className="gap-2" onClick={() => toast.success(`Exported ${rows.length} audit entries`)}>
          <Download className="h-4 w-4" /> Export
        </Button>
      </div>

      <Card className="shadow-card">
        <CardContent className="p-0">
          <ul className="divide-y divide-border">
            {rows.map((e) => (
              <li key={e.id} className="flex items-start gap-3 px-4 py-3">
                <ScrollText className={`h-4 w-4 mt-0.5 shrink-0 ${auditActionTone[e.action]}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-sm font-medium ${auditActionTone[e.action]}`}>{auditActionLabel[e.action]}</span>
                    <span className="text-xs text-muted-foreground">by</span>
                    <span className="text-sm">{e.actor}</span>
                    <span className="text-[11px] font-mono text-muted-foreground">{e.actorEmail}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2 flex-wrap">
                    <span className="font-mono">target: {e.target}</span>
                    {e.meta && <span>· {e.meta}</span>}
                    <span>· IP {e.ip}</span>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground shrink-0 text-right">
                  <div>{fmtRelative(e.at)}</div>
                  <div className="font-mono text-[10px]">{e.id}</div>
                </div>
              </li>
            ))}
            {rows.length === 0 && (
              <li className="text-center text-sm text-muted-foreground py-10">No audit entries match your filters.</li>
            )}
          </ul>
        </CardContent>
      </Card>
    </motion.div>
  );
}
