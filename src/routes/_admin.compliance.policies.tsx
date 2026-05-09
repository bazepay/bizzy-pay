import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, Plus, FileCheck2, Pencil, Settings2 } from "lucide-react";
import { toast } from "sonner";
import {
  policies as initialPolicies,
  fmtRelative,
  fmtNgn,
  ruleTypeLabel,
  ruleActionLabel,
  type Policy,
  type RuleType,
  type RuleAction,
  type RuleParams,
  type AlertSeverity,
} from "@/lib/compliance-data";

export const Route = createFileRoute("/_admin/compliance/policies")({
  component: PoliciesPage,
});

const statusTone: Record<Policy["status"], string> = {
  active: "border-success/40 text-success",
  draft: "border-warning/40 text-warning",
  archived: "border-muted-foreground/30 text-muted-foreground",
};

type Draft = {
  name: string;
  category: Policy["category"];
  status: Policy["status"];
  owner: string;
  description: string;
  version: string;
  ruleType: RuleType;
  severity: AlertSeverity;
  action: RuleAction;
  params: RuleParams;
};

const emptyDraft: Draft = {
  name: "",
  category: "AML",
  status: "draft",
  owner: "",
  description: "",
  version: "v1.0",
  ruleType: "none",
  severity: "medium",
  action: "flag",
  params: {},
};

const SANCTION_LISTS = ["OFAC SDN", "UN Consolidated", "EU Consolidated", "UK HMT", "Internal PEP"] as const;

function PoliciesPage() {
  const [items, setItems] = useState<Policy[]>(initialPolicies);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("all");
  const [editing, setEditing] = useState<Policy | null>(null);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState<Draft>(emptyDraft);

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    return items.filter((p) => {
      if (cat !== "all" && p.category !== cat) return false;
      if (!term) return true;
      return (
        p.id.toLowerCase().includes(term) ||
        p.name.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term) ||
        p.owner.toLowerCase().includes(term)
      );
    });
  }, [items, q, cat]);

  const openCreate = () => { setDraft(emptyDraft); setCreating(true); };
  const openEdit = (p: Policy) => {
    setEditing(p);
    setDraft({
      name: p.name, category: p.category, status: p.status, owner: p.owner,
      description: p.description, version: p.version,
      ruleType: p.ruleType, severity: p.severity, action: p.action, params: { ...p.params },
    });
  };
  const close = () => { setCreating(false); setEditing(null); };

  const save = () => {
    if (!draft.name.trim() || !draft.owner.trim() || !draft.description.trim()) {
      toast.error("Name, owner and description are required");
      return;
    }
    if (editing) {
      setItems((prev) => prev.map((p) => (p.id === editing.id ? { ...p, ...draft, updatedAt: new Date().toISOString() } : p)));
      toast.success(`Policy updated · new version ${draft.version}`);
    } else {
      const id = `pol_${String(600 + items.length).padStart(4, "0")}`;
      setItems((prev) => [{ id, ...draft, updatedAt: new Date().toISOString() }, ...prev]);
      toast.success("Policy created");
    }
    close();
  };

  const setParam = <K extends keyof RuleParams>(key: K, value: RuleParams[K]) =>
    setDraft((d) => ({ ...d, params: { ...d.params, [key]: value } }));

  const open = creating || !!editing;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search policies…" className="pl-8" />
        </div>
        <Select value={cat} onValueChange={setCat}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            <SelectItem value="KYC">KYC</SelectItem>
            <SelectItem value="AML">AML</SelectItem>
            <SelectItem value="Card">Card</SelectItem>
            <SelectItem value="Wallet">Wallet</SelectItem>
            <SelectItem value="Risk">Risk</SelectItem>
          </SelectContent>
        </Select>
        <Button size="sm" className="gap-2" onClick={openCreate}>
          <Plus className="h-4 w-4" /> New policy
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {rows.map((p) => (
          <Card key={p.id} className="shadow-card">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-start gap-3">
                <FileCheck2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-display font-bold">{p.name}</h3>
                    <Badge variant="outline" className="text-[10px]">{p.category}</Badge>
                    <Badge variant="outline" className={`text-[10px] capitalize ${statusTone[p.status]}`}>{p.status}</Badge>
                  </div>
                  <div className="text-[11px] font-mono text-muted-foreground mt-0.5">{p.id} · {p.version}</div>
                </div>
                <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => openEdit(p)}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">{p.description}</p>
              {p.ruleType !== "none" && (
                <div className="rounded-md border border-border bg-muted/30 p-2 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="flex items-center gap-1.5 font-medium"><Settings2 className="h-3 w-3" /> {ruleTypeLabel[p.ruleType]}</span>
                    <span className="text-muted-foreground">{ruleActionLabel[p.action]} · <span className="capitalize">{p.severity}</span></span>
                  </div>
                  <div className="text-[11px] font-mono text-muted-foreground">{summarizeParams(p.ruleType, p.params)}</div>
                </div>
              )}
              <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border">
                <span>Owner: <span className="text-foreground">{p.owner}</span></span>
                <span>Updated {fmtRelative(p.updatedAt)}</span>
              </div>
            </CardContent>
          </Card>
        ))}
        {rows.length === 0 && (
          <Card className="shadow-card md:col-span-2"><CardContent className="p-10 text-center text-sm text-muted-foreground">No policies match your filters.</CardContent></Card>
        )}
      </div>

      <Dialog open={open} onOpenChange={(o) => !o && close()}>
        <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit policy" : "New policy"}</DialogTitle>
            <DialogDescription>
              {editing ? `Update ${editing.id}. Saving creates a new version for the audit trail.` : "Create a new compliance policy. Drafts can be activated later."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="pol-name">Name</Label>
              <Input id="pol-name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="e.g. Tier 3 KYC Requirements" />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select value={draft.category} onValueChange={(v) => setDraft({ ...draft, category: v as Policy["category"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="KYC">KYC</SelectItem>
                    <SelectItem value="AML">AML</SelectItem>
                    <SelectItem value="Card">Card</SelectItem>
                    <SelectItem value="Wallet">Wallet</SelectItem>
                    <SelectItem value="Risk">Risk</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={draft.status} onValueChange={(v) => setDraft({ ...draft, status: v as Policy["status"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pol-version">Version</Label>
                <Input id="pol-version" value={draft.version} onChange={(e) => setDraft({ ...draft, version: e.target.value })} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="pol-owner">Owner</Label>
              <Input id="pol-owner" value={draft.owner} onChange={(e) => setDraft({ ...draft, owner: e.target.value })} placeholder="e.g. Aisha O." />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pol-desc">Description</Label>
              <Textarea id="pol-desc" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} className="min-h-[70px]" />
            </div>

            <div className="rounded-md border border-border p-3 space-y-3">
              <div className="flex items-center gap-2">
                <Settings2 className="h-4 w-4 text-primary" />
                <span className="text-sm font-display font-bold">Detection engine</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label>Rule type</Label>
                  <Select value={draft.ruleType} onValueChange={(v) => setDraft({ ...draft, ruleType: v as RuleType, params: {} })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {(Object.keys(ruleTypeLabel) as RuleType[]).map((k) => (
                        <SelectItem key={k} value={k}>{ruleTypeLabel[k]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Severity</Label>
                  <Select value={draft.severity} onValueChange={(v) => setDraft({ ...draft, severity: v as AlertSeverity })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Action</Label>
                  <Select value={draft.action} onValueChange={(v) => setDraft({ ...draft, action: v as RuleAction })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {(Object.keys(ruleActionLabel) as RuleAction[]).map((k) => (
                        <SelectItem key={k} value={k}>{ruleActionLabel[k]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <RuleParamsEditor type={draft.ruleType} params={draft.params} setParam={setParam} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={close}>Cancel</Button>
            <Button onClick={save}>{editing ? "Save changes" : "Create policy"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

function RuleParamsEditor({
  type, params, setParam,
}: {
  type: RuleType;
  params: RuleParams;
  setParam: <K extends keyof RuleParams>(key: K, value: RuleParams[K]) => void;
}) {
  if (type === "none") {
    return <p className="text-[11px] text-muted-foreground">This policy is informational and not evaluated by the detection engine.</p>;
  }

  if (type === "structuring") {
    return (
      <div className="grid grid-cols-3 gap-3">
        <NumField label="Threshold (₦)" value={params.thresholdNgn ?? 5_000_000} onChange={(v) => setParam("thresholdNgn", v)} />
        <NumField label="Window (hours)" value={params.windowHours ?? 24} onChange={(v) => setParam("windowHours", v)} />
        <NumField label="Min txn count" value={params.minTxnCount ?? 3} onChange={(v) => setParam("minTxnCount", v)} />
      </div>
    );
  }
  if (type === "velocity") {
    return (
      <div className="grid grid-cols-2 gap-3">
        <NumField label="Baseline multiplier (×)" value={params.baselineMultiplier ?? 3} onChange={(v) => setParam("baselineMultiplier", v)} step="0.1" />
        <NumField label="Baseline window (days)" value={params.baselineDays ?? 30} onChange={(v) => setParam("baselineDays", v)} />
      </div>
    );
  }
  if (type === "sanctions") {
    const lists = params.lists ?? [];
    const toggle = (l: typeof SANCTION_LISTS[number]) =>
      setParam("lists", lists.includes(l) ? lists.filter((x) => x !== l) : [...lists, l]);
    return (
      <div className="space-y-2">
        <NumField label="Min fuzzy match score (%)" value={params.fuzzyScore ?? 85} onChange={(v) => setParam("fuzzyScore", v)} />
        <div>
          <Label className="text-[11px] text-muted-foreground">Lists screened</Label>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {SANCTION_LISTS.map((l) => {
              const on = lists.includes(l);
              return (
                <button
                  key={l}
                  type="button"
                  onClick={() => toggle(l)}
                  className={`text-[11px] px-2 py-1 rounded-md border transition-colors ${
                    on ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {l}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
  if (type === "high_risk_country") {
    return (
      <div className="space-y-1.5">
        <Label htmlFor="hrc">Country codes (ISO-3, comma separated)</Label>
        <Input
          id="hrc"
          value={(params.countries ?? []).join(", ")}
          onChange={(e) => setParam("countries", e.target.value.split(",").map((s) => s.trim().toUpperCase()).filter(Boolean))}
          placeholder="IRN, PRK, MMR, SYR"
        />
      </div>
    );
  }
  if (type === "rapid_movement") {
    return (
      <div className="grid grid-cols-2 gap-3">
        <NumField label="Out / In ratio (0–1)" value={params.outInRatio ?? 0.95} onChange={(v) => setParam("outInRatio", v)} step="0.01" />
        <NumField label="Window (hours)" value={params.windowHours ?? 1} onChange={(v) => setParam("windowHours", v)} />
      </div>
    );
  }
  if (type === "device_anomaly") {
    return (
      <div className="space-y-2">
        <NumField label="Min txn amount (₦)" value={params.minAmountNgn ?? 500_000} onChange={(v) => setParam("minAmountNgn", v)} />
        <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
          <Label htmlFor="newdev" className="text-xs">Require new device</Label>
          <Switch id="newdev" checked={params.newDevice ?? true} onCheckedChange={(v) => setParam("newDevice", v)} />
        </div>
        <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
          <Label htmlFor="newgeo" className="text-xs">Require new geography</Label>
          <Switch id="newgeo" checked={params.newGeo ?? true} onCheckedChange={(v) => setParam("newGeo", v)} />
        </div>
      </div>
    );
  }
  if (type === "risk_score") {
    return (
      <NumField label="Score threshold (0–100)" value={params.scoreThreshold ?? 75} onChange={(v) => setParam("scoreThreshold", v)} />
    );
  }
  return null;
}

function NumField({ label, value, onChange, step }: { label: string; value: number; onChange: (n: number) => void; step?: string }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[11px] text-muted-foreground">{label}</Label>
      <Input type="number" step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </div>
  );
}

function summarizeParams(type: RuleType, p: RuleParams): string {
  switch (type) {
    case "structuring":
      return `≥${p.minTxnCount ?? "?"} txns under ${p.thresholdNgn ? fmtNgn(p.thresholdNgn) : "?"} in ${p.windowHours ?? "?"}h`;
    case "velocity":
      return `>${p.baselineMultiplier ?? "?"}× rolling ${p.baselineDays ?? "?"}d baseline`;
    case "sanctions":
      return `${(p.lists ?? []).length} list(s), fuzzy ≥${p.fuzzyScore ?? "?"}%`;
    case "high_risk_country":
      return (p.countries ?? []).join(", ") || "no countries set";
    case "rapid_movement":
      return `out/in ≥${p.outInRatio ?? "?"} within ${p.windowHours ?? "?"}h`;
    case "device_anomaly":
      return `${p.newDevice ? "new device" : "any device"} + ${p.newGeo ? "new geo" : "any geo"} ≥ ${p.minAmountNgn ? fmtNgn(p.minAmountNgn) : "?"}`;
    case "risk_score":
      return `risk score ≥ ${p.scoreThreshold ?? "?"}`;
    default:
      return "";
  }
}
