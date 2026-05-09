import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Download, Link2, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { fmtNgn } from "@/lib/mock-data";
import { topups as initial, topupStatusLabel, topupStatusTone, type Topup } from "@/lib/wallets-data";
import { fmtRelative } from "@/lib/users-data";
import { toast } from "sonner";

export const Route = createFileRoute("/_admin/wallets/topups")({
  component: TopupsPage,
});

function TopupsPage() {
  const [list, setList] = useState<Topup[]>(initial);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("any");
  const [provider, setProvider] = useState<string>("any");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return list.filter((t) => {
      if (status !== "any" && t.status !== status) return false;
      if (provider !== "any" && t.provider !== provider) return false;
      if (needle) {
        const hay = `${t.id} ${t.reference} ${t.user?.name ?? ""} ${t.provider} ${t.settlementBatch}`.toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
  }, [list, q, status, provider]);

  const totals = useMemo(() => ({
    matched: list.filter((t) => t.status === "matched").length,
    unmatched: list.filter((t) => t.status === "unmatched").length,
    matchedNgn: list.filter((t) => t.status === "matched").reduce((s, t) => s + t.amountNgn, 0),
    unmatchedNgn: list.filter((t) => t.status === "unmatched").reduce((s, t) => s + t.amountNgn, 0),
  }), [list]);

  const exportCsv = () => {
    const headers = ["id", "provider", "reference", "user", "amount_ngn", "fee_ngn", "received_at", "status", "batch"];
    const rows = filtered.map((t) => [
      t.id, t.provider, t.reference, t.user?.name ?? "", t.amountNgn, t.feeNgn, t.receivedAt, t.status, t.settlementBatch,
    ]);
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `topups-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    toast.success(`Exported ${filtered.length} rows`);
  };

  const matchUnmatched = (id: string) => {
    setList((xs) => xs.map((x) => x.id === id ? {
      ...x, status: "matched", user: { id: "u_100042", name: "Manually matched user" },
    } : x));
    toast.success("Top-up matched · audit logged");
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Kpi label="Matched" value={String(totals.matched)} sub={fmtNgn(totals.matchedNgn)} />
        <Kpi label="Unmatched" value={String(totals.unmatched)} sub={fmtNgn(totals.unmatchedNgn)} tone="warning" />
        <Kpi label="Investigating" value={String(list.filter((t) => t.status === "investigating").length)} sub="Aging > 4h" />
        <Kpi label="Duplicates" value={String(list.filter((t) => t.status === "duplicate").length)} sub="Need refund" tone="destructive" />
      </div>

      <Card className="shadow-card">
        <CardContent className="p-4 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[260px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by reference, user, batch…" className="pl-9" />
          </div>
          <Select value={provider} onValueChange={setProvider}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Provider" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="any">All providers</SelectItem>
              <SelectItem value="Flutterwave">Flutterwave</SelectItem>
              <SelectItem value="Paystack">Paystack</SelectItem>
              <SelectItem value="Interswitch">Interswitch</SelectItem>
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any status</SelectItem>
              <SelectItem value="matched">Matched</SelectItem>
              <SelectItem value="unmatched">Unmatched</SelectItem>
              <SelectItem value="investigating">Investigating</SelectItem>
              <SelectItem value="duplicate">Duplicate</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" onClick={exportCsv}>
            <Download className="h-3.5 w-3.5 mr-1.5" /> Export CSV
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead>Reference</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Received</TableHead>
              <TableHead>Batch</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="font-mono text-xs">{t.reference}</TableCell>
                <TableCell className="text-sm">{t.provider}</TableCell>
                <TableCell className="text-sm">
                  {t.user ? (
                    <Link to="/users/$id" params={{ id: t.user.id }} className="text-primary hover:underline inline-flex items-center gap-1">
                      {t.user.name} <ExternalLink className="h-3 w-3" />
                    </Link>
                  ) : (
                    <span className="text-muted-foreground italic">Unmatched</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="font-semibold">{fmtNgn(t.amountNgn)}</div>
                  <div className="text-xs text-muted-foreground">fee {fmtNgn(t.feeNgn)}</div>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">{fmtRelative(t.receivedAt)}</TableCell>
                <TableCell className="font-mono text-xs">{t.settlementBatch}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={`text-xs ${topupStatusTone[t.status]}`}>
                    {topupStatusLabel[t.status]}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {t.status === "unmatched" && (
                    <Button size="sm" variant="ghost" onClick={() => matchUnmatched(t.id)}>
                      <Link2 className="h-3.5 w-3.5 mr-1" /> Match
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={8} className="text-center py-10 text-muted-foreground text-sm">No top-ups match.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

function Kpi({ label, value, sub, tone }: { label: string; value: string; sub: string; tone?: "warning" | "destructive" }) {
  return (
    <Card className="shadow-card">
      <CardContent className="p-4">
        <div className="text-xs text-muted-foreground uppercase tracking-wider">{label}</div>
        <div className={`font-display text-2xl font-bold mt-1 ${tone === "warning" ? "text-warning" : tone === "destructive" ? "text-destructive" : ""}`}>{value}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>
      </CardContent>
    </Card>
  );
}
