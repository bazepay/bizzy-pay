import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, Download, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { issuedCards, cardPrograms, cardStatusTone, fmtNgn, type CardStatus } from "@/lib/cards-data";
import { toast } from "sonner";

export const Route = createFileRoute("/_admin/cards/issued")({
  component: IssuedCardsPage,
});

function IssuedCardsPage() {
  const [q, setQ] = useState("");
  const [statusF, setStatusF] = useState<"all" | CardStatus>("all");
  const [programF, setProgramF] = useState<string>("all");
  const [riskF, setRiskF] = useState<"all" | "low" | "med" | "high">("all");

  const rows = useMemo(() => {
    return issuedCards.filter((c) => {
      if (statusF !== "all" && c.status !== statusF) return false;
      if (programF !== "all" && c.programId !== programF) return false;
      if (riskF === "low" && c.riskScore >= 40) return false;
      if (riskF === "med" && (c.riskScore < 40 || c.riskScore >= 70)) return false;
      if (riskF === "high" && c.riskScore < 70) return false;
      if (q) {
        const s = q.toLowerCase();
        if (!c.user.name.toLowerCase().includes(s) && !c.user.email.toLowerCase().includes(s) && !c.last4.includes(s) && !c.id.includes(s)) {
          return false;
        }
      }
      return true;
    });
  }, [q, statusF, programF, riskF]);

  const exportCsv = () => {
    const header = ["card_id", "program", "brand", "last4", "user_id", "user_name", "status", "balance_ngn", "spend_30d_ngn", "risk_score", "issued_at"];
    const lines = rows.map((c) => [
      c.id, c.programId, c.brand, c.last4, c.user.id, `"${c.user.name}"`, c.status,
      c.balanceNgn, c.spend30dNgn, c.riskScore, c.issuedAt,
    ].join(","));
    const blob = new Blob([header.join(",") + "\n" + lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `issued-cards-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${rows.length} card${rows.length === 1 ? "" : "s"}`);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="shadow-card">
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search holder, last4 or card ID…" className="pl-9" />
            </div>
            <Select value={statusF} onValueChange={(v: typeof statusF) => setStatusF(v)}>
              <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="frozen">Frozen</SelectItem>
                <SelectItem value="terminated">Terminated</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
            <Select value={programF} onValueChange={setProgramF}>
              <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All programs</SelectItem>
                {cardPrograms.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={riskF} onValueChange={(v: typeof riskF) => setRiskF(v)}>
              <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All risk</SelectItem>
                <SelectItem value="low">Low (&lt;40)</SelectItem>
                <SelectItem value="med">Medium</SelectItem>
                <SelectItem value="high">High (≥70)</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={exportCsv}>
              <Download className="h-4 w-4 mr-1.5" /> Export CSV
            </Button>
          </div>

          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Card</TableHead>
                  <TableHead>Holder</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead className="text-right">30d spend</TableHead>
                  <TableHead className="text-right">Risk</TableHead>
                  <TableHead>Issued</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow><TableCell colSpan={8} className="text-center py-10 text-muted-foreground text-sm">No cards match your filters.</TableCell></TableRow>
                ) : rows.slice(0, 50).map((c) => (
                  <TableRow key={c.id} className="hover:bg-muted/40">
                    <TableCell>
                      <Link to="/cards/$id" params={{ id: c.id }} className="block">
                        <div className="text-sm font-medium hover:text-primary transition-colors">{c.brand} •••• {c.last4}</div>
                        <div className="text-xs text-muted-foreground font-mono">{c.id}</div>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{c.user.name}</div>
                      <div className="text-xs text-muted-foreground font-mono">{c.user.id}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-xs capitalize ${cardStatusTone[c.status]}`}>{c.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono">{fmtNgn(c.balanceNgn)}</TableCell>
                    <TableCell className="text-right font-mono text-sm">{fmtNgn(c.spend30dNgn)}</TableCell>
                    <TableCell className={`text-right font-mono text-sm font-semibold ${c.riskScore >= 70 ? "text-destructive" : c.riskScore >= 40 ? "text-warning" : "text-success"}`}>{c.riskScore}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{new Date(c.issuedAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Link to="/cards/$id" params={{ id: c.id }} className="text-muted-foreground hover:text-primary">
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {rows.length > 50 && (
            <div className="text-xs text-muted-foreground text-center">Showing 50 of {rows.length} · refine filters to narrow further.</div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
