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
import { fmtNgn } from "@/lib/mock-data";
import { users, getBalance, FX_RATES, fxConvert, statusTone, type FxCurrency } from "@/lib/users-data";
import { toast } from "sonner";

export const Route = createFileRoute("/_admin/wallets/users")({
  component: UserWalletsPage,
});

const CURRENCIES: FxCurrency[] = ["USD", "EUR", "GBP", "GHS"];

function UserWalletsPage() {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"balance_desc" | "balance_asc" | "name">("balance_desc");
  const [statusF, setStatusF] = useState<"all" | "active" | "frozen" | "closed" | "pending">("all");

  const rows = useMemo(() => {
    const base = users
      .filter((u) => statusF === "all" || u.status === statusF)
      .filter((u) => {
        if (!q) return true;
        const s = q.toLowerCase();
        return u.name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s) || u.id.includes(s);
      })
      .map((u) => ({ user: u, balance: getBalance(u.id) }));
    return base.sort((a, b) => {
      if (sort === "name") return a.user.name.localeCompare(b.user.name);
      if (sort === "balance_asc") return a.balance.ngn - b.balance.ngn;
      return b.balance.ngn - a.balance.ngn;
    });
  }, [q, sort, statusF]);

  const totals = useMemo(() => {
    const ngn = rows.reduce((s, r) => s + r.balance.ngn, 0);
    const ledger = rows.reduce((s, r) => s + r.balance.ledger, 0);
    const pending = rows.reduce((s, r) => s + r.balance.pending, 0);
    return { ngn, ledger, pending };
  }, [rows]);

  const exportCsv = () => {
    const header = ["user_id", "name", "email", "status", "balance_ngn", "ledger_ngn", "pending_ngn", ...CURRENCIES.map((c) => `equiv_${c}`)];
    const lines = rows.map((r) => [
      r.user.id, `"${r.user.name}"`, r.user.email, r.user.status,
      r.balance.ngn, r.balance.ledger, r.balance.pending,
      ...CURRENCIES.map((c) => fxConvert(r.balance.ngn, c).toFixed(2)),
    ].join(","));
    const blob = new Blob([header.join(",") + "\n" + lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `user-wallets-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${rows.length} wallet${rows.length === 1 ? "" : "s"}`);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Kpi label="Wallets shown" value={rows.length.toLocaleString()} sub={`of ${users.length} total`} />
        <Kpi label="Total available (NGN)" value={fmtNgn(totals.ngn)} sub="Sum of available balances" />
        <Kpi label="Total ledger (NGN)" value={fmtNgn(totals.ledger)} sub="Including unsettled" />
        <Kpi label="Total pending (NGN)" value={fmtNgn(totals.pending)} sub="Holds & in-flight" />
      </div>

      <Card className="shadow-card">
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, email or user ID…" className="pl-9" />
            </div>
            <Select value={statusF} onValueChange={(v: typeof statusF) => setStatusF(v)}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="frozen">Frozen</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sort} onValueChange={(v: typeof sort) => setSort(v)}>
              <SelectTrigger className="w-[170px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="balance_desc">Balance: high → low</SelectItem>
                <SelectItem value="balance_asc">Balance: low → high</SelectItem>
                <SelectItem value="name">Name (A→Z)</SelectItem>
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
                  <TableHead>User</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Available (NGN)</TableHead>
                  <TableHead className="text-right">Ledger</TableHead>
                  <TableHead className="text-right">Pending</TableHead>
                  <TableHead className="text-right">≈ USD</TableHead>
                  <TableHead className="text-right">≈ EUR</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow><TableCell colSpan={8} className="text-center py-10 text-muted-foreground text-sm">No wallets match your filters.</TableCell></TableRow>
                ) : rows.map(({ user, balance }) => (
                  <TableRow key={user.id} className="hover:bg-muted/40">
                    <TableCell>
                      <Link to="/users/$id" params={{ id: user.id }} className="block">
                        <div className="font-medium text-sm hover:text-primary transition-colors">{user.name}</div>
                        <div className="text-xs text-muted-foreground font-mono">{user.id} · {user.email}</div>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-xs capitalize ${statusTone[user.status]}`}>{user.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono font-semibold">{fmtNgn(balance.ngn)}</TableCell>
                    <TableCell className="text-right font-mono text-sm text-muted-foreground">{fmtNgn(balance.ledger)}</TableCell>
                    <TableCell className="text-right font-mono text-sm text-muted-foreground">{fmtNgn(balance.pending)}</TableCell>
                    <TableCell className="text-right font-mono text-sm">${fxConvert(balance.ngn, "USD").toLocaleString(undefined, { maximumFractionDigits: 0 })}</TableCell>
                    <TableCell className="text-right font-mono text-sm">€{fxConvert(balance.ngn, "EUR").toLocaleString(undefined, { maximumFractionDigits: 0 })}</TableCell>
                    <TableCell>
                      <Link to="/users/$id/wallets" params={{ id: user.id }} className="text-muted-foreground hover:text-primary">
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="text-xs text-muted-foreground">
            Rates: {CURRENCIES.map((c) => `1 ${c} = ₦${FX_RATES[c].toLocaleString()}`).join(" · ")}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function Kpi({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <Card className="shadow-card">
      <CardContent className="p-4">
        <div className="text-xs text-muted-foreground uppercase tracking-wider">{label}</div>
        <div className="font-display text-2xl font-bold mt-1">{value}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>
      </CardContent>
    </Card>
  );
}
