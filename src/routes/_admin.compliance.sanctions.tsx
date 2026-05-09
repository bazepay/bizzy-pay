import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import {
  sanctionsHits as initialHits,
  screeningLabel,
  screeningTone,
  fmtRelative,
  type ScreeningStatus,
  type SanctionsHit,
} from "@/lib/compliance-data";

export const Route = createFileRoute("/_admin/compliance/sanctions")({
  component: SanctionsPage,
});

function SanctionsPage() {
  const [hits, setHits] = useState<SanctionsHit[]>(initialHits);
  const [q, setQ] = useState("");
  const [list, setList] = useState<string>("all");
  const [status, setStatus] = useState<"all" | ScreeningStatus>("all");

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    return hits.filter((h) => {
      if (list !== "all" && h.list !== list) return false;
      if (status !== "all" && h.status !== status) return false;
      if (!term) return true;
      return (
        h.id.toLowerCase().includes(term) ||
        h.userName.toLowerCase().includes(term) ||
        h.matchedName.toLowerCase().includes(term)
      );
    });
  }, [hits, q, list, status]);

  const updateStatus = (id: string, next: ScreeningStatus, label: string) => {
    setHits((prev) => prev.map((h) => (h.id === id ? { ...h, status: next, reviewer: "You" } : h)));
    toast.success(`Marked ${label.toLowerCase()}`);
  };

  const stats = useMemo(() => {
    const match = hits.filter((h) => h.status === "match").length;
    const possible = hits.filter((h) => h.status === "possible").length;
    const cleared = hits.filter((h) => h.status === "cleared").length;
    return { match, possible, cleared };
  }, [hits]);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <Card className="shadow-card"><CardContent className="p-3">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Confirmed matches</div>
          <div className="text-base font-display font-bold leading-tight">{stats.match}</div>
        </CardContent></Card>
        <Card className="shadow-card"><CardContent className="p-3">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Possible matches</div>
          <div className="text-base font-display font-bold leading-tight">{stats.possible}</div>
        </CardContent></Card>
        <Card className="shadow-card"><CardContent className="p-3">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Cleared</div>
          <div className="text-base font-display font-bold leading-tight">{stats.cleared}</div>
        </CardContent></Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search hits, customer or matched name…" className="pl-8" />
        </div>
        <Select value={list} onValueChange={setList}>
          <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All lists</SelectItem>
            <SelectItem value="OFAC SDN">OFAC SDN</SelectItem>
            <SelectItem value="UN Consolidated">UN Consolidated</SelectItem>
            <SelectItem value="EU Consolidated">EU Consolidated</SelectItem>
            <SelectItem value="UK HMT">UK HMT</SelectItem>
            <SelectItem value="Internal PEP">Internal PEP</SelectItem>
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
          <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="match">Confirmed match</SelectItem>
            <SelectItem value="possible">Possible match</SelectItem>
            <SelectItem value="false_positive">False positive</SelectItem>
            <SelectItem value="cleared">Cleared</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="shadow-card overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[110px]">Hit</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Matched name</TableHead>
                <TableHead>List</TableHead>
                <TableHead className="text-right">Score</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reviewer</TableHead>
                <TableHead className="text-right">Screened</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((h) => (
                <TableRow key={h.id}>
                  <TableCell className="font-mono text-xs">{h.id}</TableCell>
                  <TableCell>
                    <div className="text-sm">{h.userName}</div>
                    <div className="font-mono text-[11px] text-muted-foreground">{h.userId}</div>
                  </TableCell>
                  <TableCell className="text-sm">{h.matchedName}</TableCell>
                  <TableCell><Badge variant="outline" className="text-[10px]"><ShieldAlert className="h-3 w-3 mr-1" />{h.list}</Badge></TableCell>
                  <TableCell className="text-right font-mono text-sm">{h.score}%</TableCell>
                  <TableCell><Badge variant="outline" className={`text-[10px] ${screeningTone[h.status]}`}>{screeningLabel[h.status]}</Badge></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{h.reviewer ?? "—"}</TableCell>
                  <TableCell className="text-right text-xs text-muted-foreground">{fmtRelative(h.screenedAt)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button asChild size="sm" variant="ghost" className="h-7 text-xs">
                        <Link to="/users/$id" params={{ id: h.userId }}>View</Link>
                      </Button>
                      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => updateStatus(h.id, "cleared", "cleared")}>Clear</Button>
                      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => updateStatus(h.id, "false_positive", "false positive")}>FP</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow><TableCell colSpan={9} className="text-center text-sm text-muted-foreground py-10">No hits match your filters.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </motion.div>
  );
}
