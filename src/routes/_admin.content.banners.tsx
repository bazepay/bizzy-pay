import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Plus, Megaphone, Pencil, Eye, MousePointerClick } from "lucide-react";
import { toast } from "sonner";
import {
  banners as initial,
  fmtRelative,
  fmtNum,
  bannerStatusTone,
  bannerToneStyle,
  type Banner,
  type BannerPlacement,
  type BannerStatus,
  type BannerTone,
} from "@/lib/content-data";

export const Route = createFileRoute("/_admin/content/banners")({
  component: BannersPage,
});

type Draft = Omit<Banner, "id" | "impressions" | "clicks" | "updatedAt">;

const emptyDraft: Draft = {
  title: "", message: "", ctaLabel: "", ctaUrl: "",
  placement: "home", audience: "all", tone: "info", status: "draft",
  startsAt: new Date().toISOString().slice(0, 16),
  endsAt: null,
};

function BannersPage() {
  const [items, setItems] = useState<Banner[]>(initial);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | BannerStatus>("all");
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    return items.filter((b) => {
      if (status !== "all" && b.status !== status) return false;
      if (!term) return true;
      return b.title.toLowerCase().includes(term) || b.message.toLowerCase().includes(term) || b.id.toLowerCase().includes(term);
    });
  }, [items, q, status]);

  const openCreate = () => { setDraft(emptyDraft); setCreating(true); };
  const openEdit = (b: Banner) => {
    setEditing(b);
    setDraft({
      title: b.title, message: b.message, ctaLabel: b.ctaLabel ?? "", ctaUrl: b.ctaUrl ?? "",
      placement: b.placement, audience: b.audience, tone: b.tone, status: b.status,
      startsAt: b.startsAt.slice(0, 16), endsAt: b.endsAt ? b.endsAt.slice(0, 16) : null,
    });
  };
  const close = () => { setCreating(false); setEditing(null); };

  const save = () => {
    if (!draft.title.trim() || !draft.message.trim()) { toast.error("Title and message are required"); return; }
    const payload: Omit<Banner, "id" | "impressions" | "clicks"> = {
      ...draft,
      ctaLabel: draft.ctaLabel?.trim() || null,
      ctaUrl: draft.ctaUrl?.trim() || null,
      startsAt: new Date(draft.startsAt).toISOString(),
      endsAt: draft.endsAt ? new Date(draft.endsAt).toISOString() : null,
      updatedAt: new Date().toISOString(),
    };
    if (editing) {
      setItems((prev) => prev.map((b) => (b.id === editing.id ? { ...b, ...payload } : b)));
      toast.success("Banner updated");
    } else {
      const id = `ban_${String(440100 + items.length).padStart(6, "0")}`;
      setItems((prev) => [{ id, impressions: 0, clicks: 0, ...payload }, ...prev]);
      toast.success("Banner created");
    }
    close();
  };

  const open = creating || !!editing;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search banners…" className="pl-8" />
        </div>
        <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
          <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="live">Live</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="ended">Ended</SelectItem>
          </SelectContent>
        </Select>
        <Button size="sm" className="gap-2" onClick={openCreate}>
          <Plus className="h-4 w-4" /> New banner
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {rows.map((b) => {
          const ctr = b.impressions > 0 ? (b.clicks / b.impressions) * 100 : 0;
          return (
            <Card key={b.id} className="shadow-card">
              <CardContent className="p-4 space-y-3">
                <div className={`rounded-md border px-3 py-2.5 ${bannerToneStyle[b.tone]}`}>
                  <div className="flex items-start gap-2">
                    <Megaphone className="h-4 w-4 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold leading-tight">{b.title}</div>
                      <div className="text-xs mt-0.5 opacity-90">{b.message}</div>
                      {b.ctaLabel && (
                        <button className="mt-2 text-xs font-medium underline underline-offset-2">{b.ctaLabel} →</button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className={`text-[10px] capitalize ${bannerStatusTone[b.status]}`}>{b.status}</Badge>
                  <Badge variant="outline" className="text-[10px] capitalize">{b.placement}</Badge>
                  <Badge variant="outline" className="text-[10px] capitalize">{b.audience.replace("_", " ")}</Badge>
                  <Badge variant="outline" className="text-[10px] capitalize">{b.tone}</Badge>
                </div>

                <div className="grid grid-cols-3 gap-2 text-[11px] text-muted-foreground border-t border-border pt-2">
                  <div className="flex flex-col">
                    <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> impressions</span>
                    <span className="font-mono text-foreground">{fmtNum(b.impressions)}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="flex items-center gap-1"><MousePointerClick className="h-3 w-3" /> clicks</span>
                    <span className="font-mono text-foreground">{fmtNum(b.clicks)}</span>
                  </div>
                  <div className="flex flex-col">
                    <span>CTR</span>
                    <span className="font-mono text-foreground">{ctr.toFixed(2)}%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>
                    {fmtRelative(b.startsAt)} → {b.endsAt ? fmtRelative(b.endsAt) : "no end"}
                  </span>
                  <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => openEdit(b)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {rows.length === 0 && (
          <Card className="shadow-card md:col-span-2"><CardContent className="p-10 text-center text-sm text-muted-foreground">No banners match your filters.</CardContent></Card>
        )}
      </div>

      <Dialog open={open} onOpenChange={(o) => !o && close()}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit banner" : "New banner"}</DialogTitle>
            <DialogDescription>In-app banner shown to a targeted audience for a defined window.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="bn-title">Title</Label>
              <Input id="bn-title" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bn-msg">Message</Label>
              <Textarea id="bn-msg" value={draft.message} onChange={(e) => setDraft({ ...draft, message: e.target.value })} className="min-h-[70px]" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="cta-l">CTA label</Label>
                <Input id="cta-l" value={draft.ctaLabel ?? ""} onChange={(e) => setDraft({ ...draft, ctaLabel: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cta-u">CTA URL</Label>
                <Input id="cta-u" value={draft.ctaUrl ?? ""} onChange={(e) => setDraft({ ...draft, ctaUrl: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Placement</Label>
                <Select value={draft.placement} onValueChange={(v) => setDraft({ ...draft, placement: v as BannerPlacement })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="home">Home</SelectItem>
                    <SelectItem value="wallet">Wallet</SelectItem>
                    <SelectItem value="cards">Cards</SelectItem>
                    <SelectItem value="transactions">Transactions</SelectItem>
                    <SelectItem value="global">Global</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Audience</Label>
                <Select value={draft.audience} onValueChange={(v) => setDraft({ ...draft, audience: v as Banner["audience"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All users</SelectItem>
                    <SelectItem value="tier1">Tier 1</SelectItem>
                    <SelectItem value="tier2">Tier 2</SelectItem>
                    <SelectItem value="tier2_plus">Tier 2+</SelectItem>
                    <SelectItem value="card_holders">Card holders</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Tone</Label>
                <Select value={draft.tone} onValueChange={(v) => setDraft({ ...draft, tone: v as BannerTone })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="promo">Promo</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={draft.status} onValueChange={(v) => setDraft({ ...draft, status: v as BannerStatus })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="live">Live</SelectItem>
                    <SelectItem value="ended">Ended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="st">Starts at</Label>
                <Input id="st" type="datetime-local" value={draft.startsAt} onChange={(e) => setDraft({ ...draft, startsAt: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="en">Ends at (optional)</Label>
                <Input id="en" type="datetime-local" value={draft.endsAt ?? ""} onChange={(e) => setDraft({ ...draft, endsAt: e.target.value || null })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={close}>Cancel</Button>
            <Button onClick={save}>{editing ? "Save changes" : "Create banner"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
