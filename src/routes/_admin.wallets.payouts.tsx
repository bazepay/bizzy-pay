import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, CheckCircle2, XCircle, RefreshCcw, AlertTriangle, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { fmtNgn } from "@/lib/mock-data";
import {
  payouts as initial, payoutStatusLabel, payoutStatusTone, type Payout, type PayoutStatus,
} from "@/lib/wallets-data";
import { riskTone, fmtRelative } from "@/lib/users-data";
import { toast } from "sonner";

export const Route = createFileRoute("/_admin/wallets/payouts")({
  component: PayoutsPage,
});

function PayoutsPage() {
  const [list, setList] = useState<Payout[]>(initial);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("any");
  const [selected, setSelected] = useState<string[]>([]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return list.filter((p) => {
      if (status !== "any" && p.status !== status) return false;
      if (needle) {
        const hay = `${p.id} ${p.user.name} ${p.user.email} ${p.bank} ${p.account} ${p.accountName}`.toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
  }, [list, q, status]);

  const totals = useMemo(() => ({
    pending: list.filter((p) => p.status === "pending").length,
    pendingNgn: list.filter((p) => p.status === "pending").reduce((s, p) => s + p.amountNgn, 0),
    paidToday: list.filter((p) => p.status === "paid").length,
    failed: list.filter((p) => p.status === "failed").length,
  }), [list]);

  const setStatusFor = (ids: string[], next: PayoutStatus, label: string) => {
    setList((ps) => ps.map((p) => ids.includes(p.id) ? { ...p, status: next } : p));
    toast.success(`${ids.length} payout${ids.length > 1 ? "s" : ""} ${label}`);
    setSelected([]);
  };

  const toggleAll = () => {
    const pendingIds = filtered.filter((p) => p.status === "pending").map((p) => p.id);
    setSelected(selected.length === pendingIds.length ? [] : pendingIds);
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Kpi label="Pending" value={String(totals.pending)} sub={fmtNgn(totals.pendingNgn)} />
        <Kpi label="Paid today" value={String(totals.paidToday)} sub="Settled" />
        <Kpi label="Failed" value={String(totals.failed)} sub="Need retry" tone="destructive" />
        <Kpi label="Avg approval" value="3.4 min" sub="Last 24h" />
      </div>

      <Card className="shadow-card">
        <CardContent className="p-4 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[260px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by user, bank, account…" className="pl-9" />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
          {selected.length > 0 && (
            <BulkRejectDialog count={selected.length} onConfirm={() => setStatusFor(selected, "rejected", "rejected")}>
              <Button size="sm" variant="outline">Reject {selected.length}</Button>
            </BulkRejectDialog>
          )}
          {selected.length > 0 && (
            <Button size="sm" onClick={() => setStatusFor(selected, "approved", "approved")}>
              Approve {selected.length}
            </Button>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="w-10">
                <input type="checkbox" checked={selected.length > 0 && selected.length === filtered.filter(p => p.status === "pending").length}
                  onChange={toggleAll} className="accent-primary" />
              </TableHead>
              <TableHead>User</TableHead>
              <TableHead>Destination</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Risk</TableHead>
              <TableHead>Requested</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  {p.status === "pending" && (
                    <input
                      type="checkbox"
                      checked={selected.includes(p.id)}
                      onChange={() => setSelected((s) => s.includes(p.id) ? s.filter((x) => x !== p.id) : [...s, p.id])}
                      className="accent-primary"
                    />
                  )}
                </TableCell>
                <TableCell>
                  <Link to="/users/$id" params={{ id: p.user.id }} className="font-medium text-primary hover:underline inline-flex items-center gap-1">
                    {p.user.name} <ExternalLink className="h-3 w-3" />
                  </Link>
                  <div className="text-xs text-muted-foreground">{p.user.email}</div>
                </TableCell>
                <TableCell className="text-sm">
                  <div className="font-medium">{p.bank}</div>
                  <div className="text-xs text-muted-foreground font-mono">{p.account} · {p.accountName}</div>
                  <div className="text-[10px] mt-0.5">
                    Name match:{" "}
                    <span className={p.nameMatch >= 90 ? "text-success" : p.nameMatch >= 75 ? "text-warning" : "text-destructive"}>
                      {p.nameMatch}%
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-semibold">{fmtNgn(p.amountNgn)}</div>
                  <div className="text-xs text-muted-foreground">fee {fmtNgn(p.feeNgn)}</div>
                  {p.needsDual && (
                    <Badge variant="outline" className="mt-1 text-[10px] bg-warning/15 text-warning border-warning/30">
                      <AlertTriangle className="h-2.5 w-2.5 mr-1" /> Dual approval
                    </Badge>
                  )}
                </TableCell>
                <TableCell><span className={`font-mono text-sm ${riskTone(p.riskScore)}`}>{p.riskScore}</span></TableCell>
                <TableCell className="text-xs text-muted-foreground">{fmtRelative(p.requestedAt)}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={`text-xs ${payoutStatusTone[p.status]}`}>
                    {payoutStatusLabel[p.status]}
                  </Badge>
                </TableCell>
                <TableCell className="text-right space-x-1">
                  {p.status === "pending" && (
                    <>
                      <Button size="sm" variant="ghost" onClick={() => setStatusFor([p.id], "approved", "approved")}>
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </Button>
                      <RejectDialog onConfirm={() => setStatusFor([p.id], "rejected", "rejected")}>
                        <Button size="sm" variant="ghost"><XCircle className="h-3.5 w-3.5" /></Button>
                      </RejectDialog>
                    </>
                  )}
                  {p.status === "failed" && (
                    <Button size="sm" variant="ghost" onClick={() => setStatusFor([p.id], "processing", "queued for retry")}>
                      <RefreshCcw className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={8} className="text-center py-10 text-muted-foreground text-sm">No payouts match your filters.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

function Kpi({ label, value, sub, tone }: { label: string; value: string; sub: string; tone?: "destructive" }) {
  return (
    <Card className="shadow-card">
      <CardContent className="p-4">
        <div className="text-xs text-muted-foreground uppercase tracking-wider">{label}</div>
        <div className={`font-display text-2xl font-bold mt-1 ${tone === "destructive" ? "text-destructive" : ""}`}>{value}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>
      </CardContent>
    </Card>
  );
}

function RejectDialog({ children, onConfirm }: { children: React.ReactNode; onConfirm: () => void }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  return (
    <AlertDialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setReason(""); }}>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Reject this payout?</AlertDialogTitle>
          <AlertDialogDescription>The user will be notified and funds remain in their wallet.</AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-2">
          <Label>Reason</Label>
          <Textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Explain the rejection." />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={(e) => {
            if (!reason.trim()) { e.preventDefault(); toast.error("Reason required"); return; }
            onConfirm(); setOpen(false); setReason("");
          }}>Reject</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function BulkRejectDialog({ count, children, onConfirm }: { count: number; children: React.ReactNode; onConfirm: () => void }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  return (
    <AlertDialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setReason(""); }}>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Reject {count} payouts?</AlertDialogTitle>
          <AlertDialogDescription>Each user will be notified individually with the reason below.</AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-2">
          <Label>Reason</Label>
          <Textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Why are these being rejected?" />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={(e) => {
            if (!reason.trim()) { e.preventDefault(); toast.error("Reason required"); return; }
            onConfirm(); setOpen(false); setReason("");
          }}>Reject all</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
