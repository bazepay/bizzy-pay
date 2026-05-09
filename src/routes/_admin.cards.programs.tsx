import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Pause, Play, Settings2, Shield } from "lucide-react";
import { cardPrograms, programStatusTone, fmtNgn, type CardProgram, type ProgramStatus } from "@/lib/cards-data";
import { fmtNum } from "@/lib/mock-data";
import { toast } from "sonner";

export const Route = createFileRoute("/_admin/cards/programs")({
  component: ProgramsPage,
});

function ProgramsPage() {
  const [items, setItems] = useState<CardProgram[]>(cardPrograms);

  const toggleStatus = (id: string) => {
    setItems((prev) => prev.map((p) => {
      if (p.id !== id) return p;
      const next: ProgramStatus = p.status === "live" ? "paused" : "live";
      toast.success(`${p.name} ${next === "live" ? "resumed" : "paused"}`);
      return { ...p, status: next };
    }));
  };

  const updateProgram = (id: string, patch: Partial<CardProgram>) => {
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      {items.map((p) => (
        <Card key={p.id} className="shadow-card">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-display text-lg font-bold">{p.name}</h2>
                  <Badge variant="outline" className={`text-xs capitalize ${programStatusTone[p.status]}`}>
                    {p.status}
                  </Badge>
                  <Badge variant="outline" className="text-xs">{p.currency}</Badge>
                </div>
                <div className="text-xs text-muted-foreground mt-1 font-mono">
                  BIN {p.bin} · {p.brand} · Issuer: {p.issuer}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => toggleStatus(p.id)}>
                  {p.status === "live" ? <><Pause className="h-3.5 w-3.5 mr-1.5" /> Pause</> : <><Play className="h-3.5 w-3.5 mr-1.5" /> Resume</>}
                </Button>
                <EditProgramDialog program={p} onSave={(patch) => { updateProgram(p.id, patch); toast.success("Program updated · audit logged"); }} />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <Stat label="Issued" value={fmtNum(p.issuedCount)} />
              <Stat label="Active" value={fmtNum(p.activeCount)} />
              <Stat label="Approval rate" value={`${p.approvalRate.toFixed(1)}%`} />
              <Stat label="Decline rate" value={`${p.declineRate.toFixed(1)}%`} tone={p.declineRate > 8 ? "warn" : undefined} />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <Stat label="Daily limit" value={fmtNgn(p.dailyLimitNgn)} />
              <Stat label="Monthly limit" value={fmtNgn(p.monthlyLimitNgn)} />
              <Stat label="Cross-border markup" value={p.fxMarkupBps === 0 ? "—" : `${(p.fxMarkupBps / 100).toFixed(2)}%`} />
              <Stat label="Monthly fee" value={p.monthlyFeeNgn === 0 ? "Free" : fmtNgn(p.monthlyFeeNgn)} />
            </div>

            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1.5">
                <Shield className="h-3 w-3" /> KYT rules
              </div>
              <div className="flex flex-wrap gap-1.5">
                {p.kytRules.map((r) => (
                  <Badge key={r} variant="outline" className="text-[10px] font-mono">{r}</Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </motion.div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "warn" }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`font-mono font-semibold mt-0.5 ${tone === "warn" ? "text-warning" : ""}`}>{value}</div>
    </div>
  );
}

function EditProgramDialog({ program, onSave }: { program: CardProgram; onSave: (patch: Partial<CardProgram>) => void }) {
  const [open, setOpen] = useState(false);
  const [daily, setDaily] = useState(String(program.dailyLimitNgn));
  const [monthly, setMonthly] = useState(String(program.monthlyLimitNgn));
  const [markup, setMarkup] = useState(String(program.fxMarkupBps));
  const [fee, setFee] = useState(String(program.monthlyFeeNgn));
  const [enrollDual, setEnrollDual] = useState(true);

  return (
    <Dialog open={open} onOpenChange={(o) => {
      setOpen(o);
      if (o) {
        setDaily(String(program.dailyLimitNgn));
        setMonthly(String(program.monthlyLimitNgn));
        setMarkup(String(program.fxMarkupBps));
        setFee(String(program.monthlyFeeNgn));
      }
    }}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Settings2 className="h-3.5 w-3.5 mr-1.5" /> Configure
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configure {program.name}</DialogTitle>
          <DialogDescription>Limits and fees apply to all cards in this program.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Daily limit (NGN)</Label>
              <Input type="number" value={daily} onChange={(e) => setDaily(e.target.value)} />
            </div>
            <div>
              <Label>Monthly limit (NGN)</Label>
              <Input type="number" value={monthly} onChange={(e) => setMonthly(e.target.value)} />
            </div>
            <div>
              <Label>Cross-border markup (bps)</Label>
              <Input type="number" value={markup} onChange={(e) => setMarkup(e.target.value)} />
            </div>
            <div>
              <Label>Monthly fee (NGN)</Label>
              <Input type="number" step="1" value={fee} onChange={(e) => setFee(e.target.value)} />
            </div>
          </div>
          <div className="flex items-center justify-between rounded-md border p-3">
            <div>
              <div className="text-sm font-medium">Require dual approval</div>
              <div className="text-xs text-muted-foreground">For limit changes &gt; 50%</div>
            </div>
            <Switch checked={enrollDual} onCheckedChange={setEnrollDual} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={() => {
            const d = Number(daily), m = Number(monthly), bps = Number(markup), f = Number(fee);
            if ([d, m, bps, f].some((n) => Number.isNaN(n) || n < 0)) {
              toast.error("All values must be valid non-negative numbers");
              return;
            }
            if (m < d) {
              toast.error("Monthly limit must be ≥ daily limit");
              return;
            }
            onSave({ dailyLimitNgn: d, monthlyLimitNgn: m, fxMarkupBps: bps, monthlyFeeNgn: f });
            setOpen(false);
          }}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
