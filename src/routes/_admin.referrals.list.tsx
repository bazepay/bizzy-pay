import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Download, Users, CheckCircle2, Clock, AlertTriangle, Wallet, ShieldAlert } from "lucide-react";
import {
  referrals as initial,
  referralPrograms,
  fmtNgn,
  referralStatusTone,
  type Referral,
  type ReferralStatus,
} from "@/lib/growth-data";
import { toast } from "sonner";

export const Route = createFileRoute("/_admin/referrals/list")({
  component: ReferralsListPage,
});

function ReferralsListPage() {
  const [items, setItems] = useState<Referral[]>(initial);
  const [q, setQ] = useState("");
  const [program, setProgram] = useState("all");
  const [status, setStatus] = useState("all");
  const [channel, setChannel] = useState("all");
  const [visible, setVisible] = useState(40);

  const rows = useMemo(() => {
    return items
      .filter((r) => {
        if (program !== "all" && r.programId !== program) return false;
        if (status !== "all" && r.status !== status) return false;
        if (channel !== "all" && r.channel !== channel) return false;
        if (q) {
          const v = q.toLowerCase();
          if (
            !r.id.toLowerCase().includes(v) &&
            !r.code.toLowerCase().includes(v) &&
            !r.referrerName.toLowerCase().includes(v) &&
            !r.refereeName.toLowerCase().includes(v)
          )
            return false;
        }
        return true;
      })
      .sort((a, b) => +new Date(b.invitedAt) - +new Date(a.invitedAt));
  }, [items, q, program, status, channel]);

  const stats = useMemo(() => {
    const total = rows.length;
    const rewarded = rows.filter((r) => r.status === "rewarded").length;
    const qualified = rows.filter((r) => r.status === "qualified").length;
    const pending = rows.filter((r) => r.status === "pending").length;
    const fraud = rows.filter((r) => r.status === "fraud").length;
    const reward = rows.reduce((s, r) => s + r.rewardNgn, 0);
    return { total, rewarded, qualified, pending, fraud, reward };
  }, [rows]);

  const markRewarded = (id: string) => {
    setItems((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const program = referralPrograms.find((p) => p.id === r.programId);
        return {
          ...r,
          status: "rewarded",
          rewardedAt: new Date().toISOString(),
          rewardNgn: program?.referrerReward.amount ?? r.rewardNgn,
        };
      })
    );
    toast.success(`Reward paid for ${id}`);
  };
  const flagFraud = (id: string) => {
    setItems((prev) => prev.map((r) => (r.id === id ? { ...r, status: "fraud" as ReferralStatus, rewardNgn: 0 } : r)));
    toast.success(`${id} flagged as fraud`);
  };

  const exportCsv = () => {
    const headers = ["id", "program", "referrer", "referee", "code", "channel", "status", "invited_at", "qualified_at", "rewarded_at", "reward_ngn", "qualifying_tx_ngn"];
    const lines = [headers.join(",")];
    rows.forEach((r) =>
      lines.push([r.id, r.programId, r.referrerName, r.refereeName, r.code, r.channel, r.status, r.invitedAt, r.qualifiedAt ?? "", r.rewardedAt ?? "", r.rewardNgn, r.qualifyingTxNgn].join(","))
    );
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `referrals-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${rows.length} referrals`);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard label="Total" value={stats.total.toLocaleString()} sub="Filtered view" icon={Users} />
        <StatCard label="Rewarded" value={stats.rewarded.toLocaleString()} sub={stats.total ? `${((stats.rewarded / stats.total) * 100).toFixed(1)}%` : "—"} icon={CheckCircle2} tone="success" />
        <StatCard label="Qualified" value={stats.qualified.toLocaleString()} sub="Awaiting payout" icon={CheckCircle2} />
        <StatCard label="Pending" value={stats.pending.toLocaleString()} sub="Invite sent" icon={Clock} tone={stats.pending > 0 ? "warning" : undefined} />
        <StatCard label="Fraud" value={stats.fraud.toLocaleString()} sub="Blocked" icon={AlertTriangle} tone={stats.fraud > 0 ? "danger" : undefined} />
        <StatCard label="Rewards" value={fmtNgn(stats.reward)} sub="Paid out" icon={Wallet} />
      </div>

      <Card className="shadow-card">
        <CardContent className="p-4 flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[220px]">
            <Label className="text-xs">Search</Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Code, name, ID..." className="pl-8 h-9" />
            </div>
          </div>
          <FilterSelect label="Program" value={program} onChange={setProgram} options={[["all", "All"], ...referralPrograms.map((p) => [p.id, p.name] as [string, string])]} />
          <FilterSelect label="Status" value={status} onChange={setStatus} options={[["all", "All"], ["pending", "Pending"], ["qualified", "Qualified"], ["rewarded", "Rewarded"], ["expired", "Expired"], ["fraud", "Fraud"]]} />
          <FilterSelect label="Channel" value={channel} onChange={setChannel} options={[["all", "All"], ["link", "Link"], ["code", "Code"], ["social_x", "X"], ["social_wa", "WhatsApp"], ["social_ig", "Instagram"]]} />
          <Button onClick={exportCsv} variant="outline" size="sm" className="gap-1.5 h-9 ml-auto">
            <Download className="h-3.5 w-3.5" /> Export CSV
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Referrer → Referee</TableHead>
              <TableHead>Program</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Channel</TableHead>
              <TableHead>Invited</TableHead>
              <TableHead className="text-right">Qualifying tx</TableHead>
              <TableHead className="text-right">Reward</TableHead>
              <TableHead>Status</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.slice(0, visible).map((r) => {
              const prog = referralPrograms.find((p) => p.id === r.programId);
              return (
                <TableRow key={r.id}>
                  <TableCell className="font-mono text-xs">{r.id}</TableCell>
                  <TableCell>
                    <div className="text-sm font-medium truncate">{r.referrerName} → {r.refereeName}</div>
                    <div className="text-[11px] text-muted-foreground font-mono">{r.referrerId} · {r.refereeId}</div>
                  </TableCell>
                  <TableCell className="text-xs truncate max-w-[160px]">{prog?.name}</TableCell>
                  <TableCell className="font-mono text-xs">{r.code}</TableCell>
                  <TableCell className="text-xs capitalize">{r.channel.replace("social_", "")}</TableCell>
                  <TableCell className="text-xs">{new Date(r.invitedAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right font-mono text-xs">{r.qualifyingTxNgn ? fmtNgn(r.qualifyingTxNgn) : "—"}</TableCell>
                  <TableCell className="text-right font-mono text-xs">{r.rewardNgn ? fmtNgn(r.rewardNgn) : "—"}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-[10px] capitalize ${referralStatusTone[r.status]}`}>{r.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center gap-1 justify-end">
                      {r.status === "qualified" && (
                        <Button size="sm" variant="ghost" className="h-7 px-2 text-xs gap-1 text-success" onClick={() => markRewarded(r.id)}>
                          <CheckCircle2 className="h-3 w-3" /> Pay
                        </Button>
                      )}
                      {r.status !== "fraud" && r.status !== "rewarded" && (
                        <Button size="sm" variant="ghost" className="h-7 px-2 text-xs gap-1 text-destructive" onClick={() => flagFraud(r.id)}>
                          <ShieldAlert className="h-3 w-3" /> Flag
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={10} className="text-center text-sm text-muted-foreground py-10">
                  No referrals match.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {rows.length > visible && (
          <div className="p-3 flex justify-center border-t border-border">
            <Button variant="outline" size="sm" onClick={() => setVisible((v) => v + 40)}>
              Load more
            </Button>
          </div>
        )}
      </Card>
    </motion.div>
  );
}

function StatCard({ label, value, sub, icon: Icon, tone }: { label: string; value: string; sub: string; icon: typeof Users; tone?: "success" | "warning" | "danger" }) {
  const t = tone === "success" ? "text-success" : tone === "warning" ? "text-warning" : tone === "danger" ? "text-destructive" : "text-muted-foreground";
  return (
    <Card className="shadow-card">
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-1.5">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</div>
          <Icon className={`h-3.5 w-3.5 ${t}`} />
        </div>
        <div className="text-base font-display font-bold leading-tight">{value}</div>
        <div className="text-[11px] text-muted-foreground mt-0.5 truncate">{sub}</div>
      </CardContent>
    </Card>
  );
}

function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: Array<[string, string]> }) {
  return (
    <div>
      <Label className="text-xs">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-9 w-[180px]"><SelectValue /></SelectTrigger>
        <SelectContent>
          {options.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}
