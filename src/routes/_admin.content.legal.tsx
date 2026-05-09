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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Scale, Plus, FileText, History, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import {
  legalDocs as initial,
  fmtRelative,
  legalStatusTone,
  legalTypeLabel,
  type LegalDoc,
} from "@/lib/content-data";

export const Route = createFileRoute("/_admin/content/legal")({
  component: LegalPage,
});

type Draft = {
  name: string;
  type: LegalDoc["type"];
  version: string;
  effectiveAt: string;
  changelog: string;
};

const empty: Draft = {
  name: "",
  type: "terms",
  version: "v1.0",
  effectiveAt: new Date().toISOString().slice(0, 16),
  changelog: "",
};

function LegalPage() {
  const [items, setItems] = useState<LegalDoc[]>(initial);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState<Draft>(empty);

  // Group by document type
  const grouped = useMemo(() => {
    const types = Array.from(new Set(items.map((d) => d.type)));
    return types.map((type) => {
      const docs = items
        .filter((d) => d.type === type)
        .sort((a, b) => +new Date(b.effectiveAt) - +new Date(a.effectiveAt));
      return { type, docs };
    });
  }, [items]);

  const openCreate = () => { setDraft(empty); setCreating(true); };

  const create = () => {
    if (!draft.name.trim() || !draft.changelog.trim()) {
      toast.error("Name and changelog are required");
      return;
    }
    const id = `leg_${String(100 + items.length).padStart(3, "0")}`;
    const now = new Date().toISOString();
    const next: LegalDoc = {
      id,
      name: draft.name,
      type: draft.type,
      version: draft.version,
      status: "draft",
      effectiveAt: new Date(draft.effectiveAt).toISOString(),
      updatedAt: now,
      changelog: draft.changelog,
    };
    setItems((prev) => [next, ...prev]);
    toast.success("Draft document created");
    setCreating(false);
  };

  const activate = (id: string) => {
    setItems((prev) => {
      const target = prev.find((d) => d.id === id);
      if (!target) return prev;
      return prev.map((d) => {
        if (d.id === id) return { ...d, status: "active", updatedAt: new Date().toISOString() };
        if (d.type === target.type && d.status === "active") return { ...d, status: "superseded", updatedAt: new Date().toISOString() };
        return d;
      });
    });
    toast.success("Document activated · prior version superseded");
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">Versioned legal documents. Activating a draft automatically supersedes the previous active version.</p>
        <Button size="sm" className="gap-2" onClick={openCreate}>
          <Plus className="h-4 w-4" /> New document
        </Button>
      </div>

      <div className="space-y-4">
        {grouped.map(({ type, docs }) => (
          <Card key={type} className="shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Scale className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-display font-bold">{legalTypeLabel[type]}</h2>
                <Badge variant="outline" className="text-[10px]">{docs.length} version{docs.length === 1 ? "" : "s"}</Badge>
              </div>
              <ul className="divide-y divide-border">
                {docs.map((d) => (
                  <li key={d.id} className="py-3 flex items-start gap-3">
                    <FileText className={`h-4 w-4 mt-0.5 shrink-0 ${d.status === "active" ? "text-success" : "text-muted-foreground"}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium">{d.name}</span>
                        <Badge variant="outline" className="text-[10px] font-mono">{d.version}</Badge>
                        <Badge variant="outline" className={`text-[10px] capitalize ${legalStatusTone[d.status]}`}>{d.status}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{d.changelog}</p>
                      <div className="text-[11px] text-muted-foreground mt-1 flex items-center gap-2 flex-wrap">
                        <span className="font-mono">{d.id}</span>
                        <span>· effective {fmtRelative(d.effectiveAt)}</span>
                        <span>· updated {fmtRelative(d.updatedAt)}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 shrink-0">
                      {d.status === "draft" && (
                        <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5" onClick={() => activate(d.id)}>
                          <CheckCircle2 className="h-3.5 w-3.5" /> Activate
                        </Button>
                      )}
                      {d.status === "superseded" && (
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1"><History className="h-3 w-3" /> archived</span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={creating} onOpenChange={(o) => !o && setCreating(false)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>New legal document</DialogTitle>
            <DialogDescription>Creates a draft. Activate it later to make it the active version (current active will be superseded).</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="ld-name">Name</Label>
              <Input id="ld-name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="e.g. Terms of Service" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Type</Label>
                <Select value={draft.type} onValueChange={(v) => setDraft({ ...draft, type: v as LegalDoc["type"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(Object.keys(legalTypeLabel) as LegalDoc["type"][]).map((t) => (
                      <SelectItem key={t} value={t}>{legalTypeLabel[t]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ld-ver">Version</Label>
                <Input id="ld-ver" value={draft.version} onChange={(e) => setDraft({ ...draft, version: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ld-eff">Effective at</Label>
              <Input id="ld-eff" type="datetime-local" value={draft.effectiveAt} onChange={(e) => setDraft({ ...draft, effectiveAt: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ld-cl">Changelog</Label>
              <Textarea id="ld-cl" value={draft.changelog} onChange={(e) => setDraft({ ...draft, changelog: e.target.value })} className="min-h-[80px]" placeholder="What changed in this version?" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreating(false)}>Cancel</Button>
            <Button onClick={create}>Create draft</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
