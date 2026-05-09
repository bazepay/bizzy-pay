import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Play, Pause, Square, Gift, Users, Wallet, Calendar, Plus } from "lucide-react";
import {
  referralPrograms as initial,
  fmtNgn,
  programStatusTone,
  rewardTriggerLabel,
  rewardKindLabel,
  type ReferralProgram,
  type ProgramStatus,
  type RewardKind,
  type RewardTrigger,
} from "@/lib/growth-data";
import { toast } from "sonner";

export const Route = createFileRoute("/_admin/referrals/programs")({
  component: ProgramsPage,
});

type Draft = {
  name: string;
  trigger: RewardTrigger;
  referrerKind: RewardKind;
  referrerAmount: number;
  refereeKind: RewardKind;
  refereeAmount: number;
  minQualifyingNgn: number;
  budgetNgn: number;
  cooldownDays: number;
  maxReferralsPerUser: number;
  endAt: string;
};

const emptyDraft: Draft = {
  name: "",
  trigger: "first_topup",
  referrerKind: "cash_ngn",
  referrerAmount: 1000,
  refereeKind: "cash_ngn",
  refereeAmount: 500,
  minQualifyingNgn: 1000,
  budgetNgn: 5_000_000,
  cooldownDays: 30,
  maxReferralsPerUser: 25,
  endAt: "",
};

function ProgramsPage() {
  const [items, setItems] = useState<ReferralProgram[]>(initial);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>(emptyDraft);

  const setStatus = (id: string, status: ProgramStatus, msg: string) => {
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
    toast.success(msg);
  };
  const updateBudget = (id: string, value: number) => {
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, budgetNgn: Math.max(p.spentNgn, value) } : p)));
  };
  const updateReward = (id: string, role: "referrer" | "referee", value: number) => {
    setItems((prev) =>
      prev.map((p) =>
        p.id === id
          ? role === "referrer"
            ? { ...p, referrerReward: { ...p.referrerReward, amount: Math.max(0, value) } }
            : { ...p, refereeReward: { ...p.refereeReward, amount: Math.max(0, value) } }
          : p
      )
    );
  };
  const saveProgram = (id: string) => {
    const p = items.find((x) => x.id === id);
    toast.success(`${p?.name ?? "Program"} updated`);
  };
  const createProgram = () => {
    if (!draft.name.trim()) { toast.error("Name is required"); return; }
    const id = `rp_${String(Math.floor(Math.random() * 9000) + 1000)}`;
    const program: ReferralProgram = {
      id,
      name: draft.name.trim(),
      status: "active",
      trigger: draft.trigger,
      referrerReward: { kind: draft.referrerKind, amount: Math.max(0, draft.referrerAmount) },
      refereeReward: { kind: draft.refereeKind, amount: Math.max(0, draft.refereeAmount) },
      minQualifyingNgn: Math.max(0, draft.minQualifyingNgn),
      cooldownDays: Math.max(0, draft.cooldownDays),
      maxReferralsPerUser: Math.max(1, draft.maxReferralsPerUser),
      startAt: new Date().toISOString(),
      endAt: draft.endAt ? new Date(draft.endAt).toISOString() : null,
      budgetNgn: Math.max(0, draft.budgetNgn),
      spentNgn: 0,
      totalReferrals: 0,
      qualifiedReferrals: 0,
    };
    setItems((prev) => [program, ...prev]);
    setDraft(emptyDraft);
    setOpen(false);
    toast.success(`${program.name} created`);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <Card className="shadow-card">
        <CardContent className="p-4 flex items-center justify-between gap-3">
          <div className="text-xs text-muted-foreground">
            {items.length} programs · {items.filter((p) => p.status === "active").length} active
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-9 gap-1.5">
                <Plus className="h-3.5 w-3.5" /> New program
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>New referral program</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <Label className="text-xs">Program name</Label>
                  <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="e.g. Summer Refer & Earn" className="h-9 mt-1" />
                </div>
                <div className="col-span-2">
                  <Label className="text-xs">Qualifying trigger</Label>
                  <Select value={draft.trigger} onValueChange={(v) => setDraft({ ...draft, trigger: v as RewardTrigger })}>
                    <SelectTrigger className="h-9 mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {(Object.keys(rewardTriggerLabel) as RewardTrigger[]).map((k) => (
                        <SelectItem key={k} value={k}>{rewardTriggerLabel[k]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Referrer reward type</Label>
                  <Select value={draft.referrerKind} onValueChange={(v) => setDraft({ ...draft, referrerKind: v as RewardKind })}>
                    <SelectTrigger className="h-9 mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {(Object.keys(rewardKindLabel) as RewardKind[]).map((k) => (
                        <SelectItem key={k} value={k}>{rewardKindLabel[k]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Referrer amount</Label>
                  <Input type="number" value={draft.referrerAmount} onChange={(e) => setDraft({ ...draft, referrerAmount: Number(e.target.value) })} className="h-9 mt-1 font-mono" />
                </div>
                <div>
                  <Label className="text-xs">Referee reward type</Label>
                  <Select value={draft.refereeKind} onValueChange={(v) => setDraft({ ...draft, refereeKind: v as RewardKind })}>
                    <SelectTrigger className="h-9 mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {(Object.keys(rewardKindLabel) as RewardKind[]).map((k) => (
                        <SelectItem key={k} value={k}>{rewardKindLabel[k]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Referee amount</Label>
                  <Input type="number" value={draft.refereeAmount} onChange={(e) => setDraft({ ...draft, refereeAmount: Number(e.target.value) })} className="h-9 mt-1 font-mono" />
                </div>
                <div>
                  <Label className="text-xs">Min qualifying spend (₦)</Label>
                  <Input type="number" value={draft.minQualifyingNgn} onChange={(e) => setDraft({ ...draft, minQualifyingNgn: Number(e.target.value) })} className="h-9 mt-1 font-mono" />
                </div>
                <div>
                  <Label className="text-xs">Budget cap (₦)</Label>
                  <Input type="number" value={draft.budgetNgn} onChange={(e) => setDraft({ ...draft, budgetNgn: Number(e.target.value) })} className="h-9 mt-1 font-mono" />
                </div>
                <div>
                  <Label className="text-xs">Cooldown (days)</Label>
                  <Input type="number" value={draft.cooldownDays} onChange={(e) => setDraft({ ...draft, cooldownDays: Number(e.target.value) })} className="h-9 mt-1 font-mono" />
                </div>
                <div>
                  <Label className="text-xs">Max referrals / user</Label>
                  <Input type="number" value={draft.maxReferralsPerUser} onChange={(e) => setDraft({ ...draft, maxReferralsPerUser: Number(e.target.value) })} className="h-9 mt-1 font-mono" />
                </div>
                <div className="col-span-2">
                  <Label className="text-xs">End date (optional)</Label>
                  <Input type="date" value={draft.endAt} onChange={(e) => setDraft({ ...draft, endAt: e.target.value })} className="h-9 mt-1" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={createProgram}>Create program</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {items.map((p) => {
          const pct = p.budgetNgn ? Math.min(100, (p.spentNgn / p.budgetNgn) * 100) : 0;
          const qualPct = p.totalReferrals ? (p.qualifiedReferrals / p.totalReferrals) * 100 : 0;
          return (
            <Card key={p.id} className="shadow-card">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <Gift className="h-6 w-6" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-display text-lg font-bold truncate">{p.name}</div>
                      <div className="text-xs text-muted-foreground">{rewardTriggerLabel[p.trigger]} · {p.id}</div>
                    </div>
                  </div>
                  <Badge variant="outline" className={`text-[10px] capitalize shrink-0 ${programStatusTone[p.status]}`}>{p.status}</Badge>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <Stat label="Invited" value={p.totalReferrals.toLocaleString()} icon={Users} />
                  <Stat label="Qualified" value={`${p.qualifiedReferrals.toLocaleString()}`} sub={`${qualPct.toFixed(0)}%`} icon={Users} tone="success" />
                  <Stat label="Spent" value={fmtNgn(p.spentNgn)} sub={`${pct.toFixed(0)}% of budget`} icon={Wallet} tone={pct > 90 ? "warning" : undefined} />
                </div>

                <div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
                    <span>Budget {fmtNgn(p.budgetNgn)}</span>
                    <span>{fmtNgn(p.budgetNgn - p.spentNgn)} remaining</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${pct > 90 ? "bg-destructive" : pct > 70 ? "bg-warning" : "bg-primary"}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
                  <div>
                    <Label className="text-[11px] text-muted-foreground">Referrer reward ({rewardKindLabel[p.referrerReward.kind]})</Label>
                    <Input
                      type="number"
                      value={p.referrerReward.amount}
                      onChange={(e) => updateReward(p.id, "referrer", Number(e.target.value))}
                      className="h-8 text-xs font-mono mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-[11px] text-muted-foreground">Referee reward ({rewardKindLabel[p.refereeReward.kind]})</Label>
                    <Input
                      type="number"
                      value={p.refereeReward.amount}
                      onChange={(e) => updateReward(p.id, "referee", Number(e.target.value))}
                      className="h-8 text-xs font-mono mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-[11px] text-muted-foreground">Min qualifying spend (₦)</Label>
                    <Input
                      type="number"
                      value={p.minQualifyingNgn}
                      onChange={(e) => setItems((prev) => prev.map((x) => (x.id === p.id ? { ...x, minQualifyingNgn: Math.max(0, Number(e.target.value)) } : x)))}
                      className="h-8 text-xs font-mono mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-[11px] text-muted-foreground">Budget cap (₦)</Label>
                    <Input
                      type="number"
                      value={p.budgetNgn}
                      onChange={(e) => updateBudget(p.id, Number(e.target.value))}
                      className="h-8 text-xs font-mono mt-1"
                    />
                  </div>
                </div>

                <div className="text-[11px] text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-3 w-3" />
                  <span>Started {new Date(p.startAt).toLocaleDateString()}</span>
                  {p.endAt && <span>· Ends {new Date(p.endAt).toLocaleDateString()}</span>}
                  <span className="ml-auto">Cooldown {p.cooldownDays}d · Max {p.maxReferralsPerUser}/user</span>
                </div>

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-border">
                  <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => saveProgram(p.id)}>
                    Save changes
                  </Button>
                  <div className="flex items-center gap-1.5">
                    {p.status !== "active" && p.status !== "ended" && (
                      <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5 text-success" onClick={() => setStatus(p.id, "active", `${p.name} resumed`)}>
                        <Play className="h-3.5 w-3.5" /> Resume
                      </Button>
                    )}
                    {p.status === "active" && (
                      <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5 text-warning" onClick={() => setStatus(p.id, "paused", `${p.name} paused`)}>
                        <Pause className="h-3.5 w-3.5" /> Pause
                      </Button>
                    )}
                    {p.status !== "ended" && (
                      <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5 text-destructive" onClick={() => setStatus(p.id, "ended", `${p.name} ended`)}>
                        <Square className="h-3.5 w-3.5" /> End
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </motion.div>
  );
}

function Stat({ label, value, sub, icon: Icon, tone }: { label: string; value: string; sub?: string; icon: typeof Users; tone?: "success" | "warning" }) {
  const t = tone === "success" ? "text-success" : tone === "warning" ? "text-warning" : "text-foreground";
  return (
    <div className="rounded-md border border-border p-2">
      <div className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground uppercase tracking-wider">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <div className={`text-sm font-display font-bold ${t}`}>{value}</div>
      {sub && <div className="text-[10px] text-muted-foreground">{sub}</div>}
    </div>
  );
}
