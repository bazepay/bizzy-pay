import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Copy, Pause, Play, Square, Plus, Ticket, Wallet, TrendingUp, Pencil } from "lucide-react";
import {
  promoCodes as initial,
  fmtNgn,
  promoStatusTone,
  promoKindLabel,
  type PromoCode,
  type PromoKind,
  type PromoStatus,
} from "@/lib/growth-data";
import { toast } from "sonner";

export const Route = createFileRoute("/_admin/referrals/promos")({
  component: PromosPage,
});

type AppliesTo = PromoCode["appliesTo"][number];
const ALL_APPLIES: AppliesTo[] = ["wallet", "bills", "cards", "esim", "numbers"];

const VALUE_HINT: Record<PromoKind, string> = {
  percent_off_fee: "% off the transaction fee (1-100)",
  flat_credit_ngn: "Flat ₦ credit added to wallet",
  free_data_mb: "Megabytes of free data",
  first_bill_free: "Ignored — first qualifying bill is free",
};

function PromosPage() {
  const [items, setItems] = useState<PromoCode[]>(initial);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [kind, setKind] = useState("all");
  const [editing, setEditing] = useState<PromoCode | null>(null);
  const [isNew, setIsNew] = useState(false);

  const rows = useMemo(() => {
    return items
      .filter((p) => {
        if (status !== "all" && p.status !== status) return false;
        if (kind !== "all" && p.kind !== kind) return false;
        if (q) {
          const v = q.toLowerCase();
          if (!p.code.toLowerCase().includes(v) && !p.description.toLowerCase().includes(v)) return false;
        }
        return true;
      })
      .sort((a, b) => b.redemptions - a.redemptions);
  }, [items, q, status, kind]);

  const stats = useMemo(() => {
    const total = items.length;
    const active = items.filter((p) => p.status === "active").length;
    const redemptions = items.reduce((s, p) => s + p.redemptions, 0);
    const credited = items.reduce((s, p) => s + p.totalCreditedNgn, 0);
    return { total, active, redemptions, credited };
  }, [items]);

  const setStatusFor = (id: string, s: PromoStatus, msg: string) => {
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, status: s } : p)));
    toast.success(msg);
  };
  const copyCode = async (code: string) => {
    try { await navigator.clipboard.writeText(code); toast.success(`${code} copied`); } catch { toast.error("Copy failed"); }
  };

  const openNew = () => {
    const code = `PROMO${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const id = `pc_${String(Math.floor(Math.random() * 9000) + 1000)}`;
    setEditing({
      id, code,
      description: "",
      kind: "flat_credit_ngn",
      value: 500,
      status: "scheduled",
      startAt: new Date().toISOString(),
      endAt: null,
      maxRedemptions: 1000,
      redemptions: 0,
      perUserLimit: 1,
      minSpendNgn: 0,
      appliesTo: ["wallet"],
      totalCreditedNgn: 0,
    });
    setIsNew(true);
  };
  const openEdit = (p: PromoCode) => { setEditing({ ...p }); setIsNew(false); };
  const closeDialog = () => { setEditing(null); setIsNew(false); };

  const savePromo = () => {
    if (!editing) return;
    if (!editing.code.trim()) return toast.error("Code is required");
    if (!editing.description.trim()) return toast.error("Description is required");
    if (editing.appliesTo.length === 0) return toast.error("Select at least one product");
    if (editing.kind === "percent_off_fee" && (editing.value <= 0 || editing.value > 100)) return toast.error("Percent must be 1-100");
    const codeUpper = editing.code.toUpperCase().replace(/\s+/g, "");
    const dup = items.find((p) => p.code === codeUpper && p.id !== editing.id);
    if (dup) return toast.error(`Code ${codeUpper} already exists`);
    const saved = { ...editing, code: codeUpper };
    setItems((prev) => isNew ? [saved, ...prev] : prev.map((p) => p.id === saved.id ? saved : p));
    toast.success(isNew ? `${codeUpper} created` : `${codeUpper} saved`);
    closeDialog();
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Total codes" value={stats.total.toLocaleString()} sub={`${stats.active} active`} icon={Ticket} />
        <StatCard label="Redemptions" value={stats.redemptions.toLocaleString()} sub="All time" icon={TrendingUp} />
        <StatCard label="Credited" value={fmtNgn(stats.credited)} sub="Total value granted" icon={Wallet} tone="success" />
        <StatCard label="Avg per code" value={stats.total ? fmtNgn(Math.round(stats.credited / stats.total)) : "—"} sub="Lifetime credit" icon={Wallet} />
      </div>

      <Card className="shadow-card">
        <CardContent className="p-4 flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[220px]">
            <Label className="text-xs">Search</Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Code or description..." className="pl-8 h-9" />
            </div>
          </div>
          <FilterSelect label="Status" value={status} onChange={setStatus} options={[["all", "All"], ["active", "Active"], ["scheduled", "Scheduled"], ["paused", "Paused"], ["expired", "Expired"]]} />
          <FilterSelect label="Type" value={kind} onChange={setKind} options={[["all", "All"], ["percent_off_fee", "% off fee"], ["flat_credit_ngn", "Flat ₦ credit"], ["free_data_mb", "Free data"], ["first_bill_free", "First bill free"]]} />
          <Button size="sm" className="h-9 gap-1.5 ml-auto" onClick={openNew}>
            <Plus className="h-3.5 w-3.5" /> New code
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-card overflow-hidden">
        <div className="overflow-x-auto">
        <Table className="min-w-[1200px]">
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Applies to</TableHead>
              <TableHead>Window</TableHead>
              <TableHead className="text-right">Redemptions</TableHead>
              <TableHead className="text-right">Credited</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((p) => {
              const usagePct = p.maxRedemptions ? Math.min(100, (p.redemptions / p.maxRedemptions) * 100) : 0;
              const valueLabel =
                p.kind === "percent_off_fee" ? `${p.value}%` :
                p.kind === "free_data_mb" ? `${p.value}MB` :
                p.kind === "first_bill_free" ? "Free" :
                fmtNgn(p.value);
              return (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-sm">{p.code}</span>
                      <button onClick={() => copyCode(p.code)} className="text-muted-foreground hover:text-foreground">
                        <Copy className="h-3 w-3" />
                      </button>
                    </div>
                    <div className="text-[10px] text-muted-foreground font-mono">{p.id}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs">{promoKindLabel[p.kind]}</div>
                    <div className="text-sm font-display font-bold text-primary">{valueLabel}</div>
                  </TableCell>
                  <TableCell className="max-w-[240px]">
                    <div className="text-xs truncate">{p.description}</div>
                    <div className="text-[10px] text-muted-foreground">Min spend {p.minSpendNgn ? fmtNgn(p.minSpendNgn) : "—"} · {p.perUserLimit}/user</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {p.appliesTo.map((a) => <Badge key={a} variant="outline" className="text-[10px] capitalize">{a}</Badge>)}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs whitespace-nowrap">
                    <div>{new Date(p.startAt).toLocaleDateString()}</div>
                    <div className="text-muted-foreground">{p.endAt ? new Date(p.endAt).toLocaleDateString() : "—"}</div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="text-sm font-mono">{p.redemptions.toLocaleString()}</div>
                    <div className="text-[10px] text-muted-foreground">{p.maxRedemptions ? `of ${p.maxRedemptions.toLocaleString()}` : "unlimited"}</div>
                    {p.maxRedemptions > 0 && (
                      <div className="h-1 bg-muted rounded-full overflow-hidden mt-1 w-20 ml-auto">
                        <div className={`h-full rounded-full ${usagePct > 90 ? "bg-destructive" : usagePct > 70 ? "bg-warning" : "bg-primary"}`} style={{ width: `${usagePct}%` }} />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right text-sm font-mono whitespace-nowrap">{fmtNgn(p.totalCreditedNgn)}</TableCell>
                  <TableCell><Badge variant="outline" className={`text-[10px] capitalize ${promoStatusTone[p.status]}`}>{p.status}</Badge></TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center gap-1 justify-end">
                      <Button size="sm" variant="ghost" className="h-7 px-2 text-xs gap-1" onClick={() => openEdit(p)}>
                        <Pencil className="h-3 w-3" /> Edit
                      </Button>
                      {p.status === "active" && (
                        <Button size="sm" variant="ghost" className="h-7 px-2 text-xs gap-1 text-warning" onClick={() => setStatusFor(p.id, "paused", `${p.code} paused`)}>
                          <Pause className="h-3 w-3" /> Pause
                        </Button>
                      )}
                      {(p.status === "paused" || p.status === "scheduled") && (
                        <Button size="sm" variant="ghost" className="h-7 px-2 text-xs gap-1 text-success" onClick={() => setStatusFor(p.id, "active", `${p.code} activated`)}>
                          <Play className="h-3 w-3" /> Activate
                        </Button>
                      )}
                      {p.status !== "expired" && (
                        <Button size="sm" variant="ghost" className="h-7 px-2 text-xs gap-1 text-destructive" onClick={() => setStatusFor(p.id, "expired", `${p.code} expired`)}>
                          <Square className="h-3 w-3" /> Expire
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {rows.length === 0 && (
              <TableRow><TableCell colSpan={9} className="text-center text-sm text-muted-foreground py-10">No promo codes match.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
        </div>
      </Card>

      <Dialog open={!!editing} onOpenChange={(o) => !o && closeDialog()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isNew ? "Create promo code" : `Edit ${editing?.code}`}</DialogTitle>
            <DialogDescription>
              Configure the discount, eligibility window, and where the code can be redeemed.
            </DialogDescription>
          </DialogHeader>

          {editing && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Code</Label>
                  <Input
                    value={editing.code}
                    onChange={(e) => setEditing({ ...editing, code: e.target.value.toUpperCase() })}
                    className="h-9 font-mono"
                    placeholder="WELCOME1K"
                  />
                </div>
                <div>
                  <Label className="text-xs">Status</Label>
                  <Select value={editing.status} onValueChange={(v) => setEditing({ ...editing, status: v as PromoStatus })}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="text-xs">Description</Label>
                <Textarea
                  value={editing.description}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  placeholder="What this code gives the user — shown in the user app"
                  className="min-h-[60px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Reward type</Label>
                  <Select value={editing.kind} onValueChange={(v) => setEditing({ ...editing, kind: v as PromoKind })}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {(Object.keys(promoKindLabel) as PromoKind[]).map((k) => (
                        <SelectItem key={k} value={k}>{promoKindLabel[k]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Value</Label>
                  <Input
                    type="number"
                    min={0}
                    value={editing.value}
                    onChange={(e) => setEditing({ ...editing, value: Number(e.target.value) || 0 })}
                    disabled={editing.kind === "first_bill_free"}
                    className="h-9"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">{VALUE_HINT[editing.kind]}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Starts</Label>
                  <Input
                    type="date"
                    value={editing.startAt.slice(0, 10)}
                    onChange={(e) => setEditing({ ...editing, startAt: new Date(e.target.value).toISOString() })}
                    className="h-9"
                  />
                </div>
                <div>
                  <Label className="text-xs">Ends (optional)</Label>
                  <Input
                    type="date"
                    value={editing.endAt ? editing.endAt.slice(0, 10) : ""}
                    onChange={(e) => setEditing({ ...editing, endAt: e.target.value ? new Date(e.target.value).toISOString() : null })}
                    className="h-9"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs">Max redemptions</Label>
                  <Input type="number" min={0} value={editing.maxRedemptions} onChange={(e) => setEditing({ ...editing, maxRedemptions: Number(e.target.value) || 0 })} className="h-9" />
                  <p className="text-[10px] text-muted-foreground mt-1">0 = unlimited</p>
                </div>
                <div>
                  <Label className="text-xs">Per-user limit</Label>
                  <Input type="number" min={1} value={editing.perUserLimit} onChange={(e) => setEditing({ ...editing, perUserLimit: Number(e.target.value) || 1 })} className="h-9" />
                </div>
                <div>
                  <Label className="text-xs">Min spend (₦)</Label>
                  <Input type="number" min={0} value={editing.minSpendNgn} onChange={(e) => setEditing({ ...editing, minSpendNgn: Number(e.target.value) || 0 })} className="h-9" />
                </div>
              </div>

              <div>
                <Label className="text-xs mb-2 block">Applies to products</Label>
                <div className="grid grid-cols-3 gap-2">
                  {ALL_APPLIES.map((a) => {
                    const checked = editing.appliesTo.includes(a);
                    return (
                      <label key={a} className="flex items-center gap-2 text-sm capitalize border border-border rounded-md px-2.5 py-1.5 cursor-pointer hover:bg-muted/50">
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(v) => {
                            const next = v
                              ? [...editing.appliesTo, a]
                              : editing.appliesTo.filter((x) => x !== a);
                            setEditing({ ...editing, appliesTo: next });
                          }}
                        />
                        {a}
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>Cancel</Button>
            <Button onClick={savePromo}>{isNew ? "Create code" : "Save changes"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

function StatCard({ label, value, sub, icon: Icon, tone }: { label: string; value: string; sub: string; icon: typeof Ticket; tone?: "success" | "warning" | "danger" }) {
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
        <SelectTrigger className="h-9 w-[170px]"><SelectValue /></SelectTrigger>
        <SelectContent>
          {options.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}
