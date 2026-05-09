import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Search, Plus, FileCheck2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { policies as initialPolicies, fmtRelative, type Policy } from "@/lib/compliance-data";

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
};

const emptyDraft: Draft = {
  name: "",
  category: "AML",
  status: "draft",
  owner: "",
  description: "",
  version: "v1.0",
};

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

  const openCreate = () => {
    setDraft(emptyDraft);
    setCreating(true);
  };

  const openEdit = (p: Policy) => {
    setEditing(p);
    setDraft({
      name: p.name,
      category: p.category,
      status: p.status,
      owner: p.owner,
      description: p.description,
      version: p.version,
    });
  };

  const close = () => {
    setCreating(false);
    setEditing(null);
  };

  const save = () => {
    if (!draft.name.trim() || !draft.owner.trim() || !draft.description.trim()) {
      toast.error("Name, owner and description are required");
      return;
    }
    if (editing) {
      setItems((prev) =>
        prev.map((p) =>
          p.id === editing.id
            ? { ...p, ...draft, updatedAt: new Date().toISOString() }
            : p,
        ),
      );
      toast.success("Policy updated");
    } else {
      const id = `pol_${String(600 + items.length).padStart(4, "0")}`;
      const next: Policy = {
        id,
        ...draft,
        updatedAt: new Date().toISOString(),
      };
      setItems((prev) => [next, ...prev]);
      toast.success("Policy created");
    }
    close();
  };

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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit policy" : "New policy"}</DialogTitle>
            <DialogDescription>
              {editing ? `Update ${editing.id}` : "Create a new compliance policy. Drafts can be activated later."}
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
              <Textarea id="pol-desc" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} className="min-h-[90px]" />
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
