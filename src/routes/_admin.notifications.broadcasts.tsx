import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Search, Plus, Send, Pause, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  broadcasts as seed,
  templates,
  channelLabel,
  channelTone,
  broadcastStatusTone,
  fmtNum,
  fmtRelative,
  type Broadcast,
  type Channel,
} from "@/lib/notifications-data";

export const Route = createFileRoute("/_admin/notifications/broadcasts")({
  component: BroadcastsPage,
});

const AUDIENCES: Broadcast["audience"][] = ["all", "tier1", "tier2_plus", "card_holders", "dormant_30d", "lagos"];

function BroadcastsPage() {
  const [items, setItems] = useState<Broadcast[]>(seed);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | Broadcast["status"]>("all");
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState<{ name: string; templateId: string; channel: Channel; audience: Broadcast["audience"]; scheduledAt: string }>({
    name: "",
    templateId: templates[0].id,
    channel: "push",
    audience: "all",
    scheduledAt: "",
  });

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    return items.filter((b) => {
      if (statusFilter !== "all" && b.status !== statusFilter) return false;
      if (!term) return true;
      return b.name.toLowerCase().includes(term) || b.id.toLowerCase().includes(term) || b.audience.includes(term);
    });
  }, [items, q, statusFilter]);

  const cancel = (id: string) => {
    setItems((prev) =>
      prev.map((b) => {
        if (b.id !== id) return b;
        if (b.status === "scheduled") return { ...b, status: "draft", scheduledAt: null };
        if (b.status === "sending") return { ...b, status: "sent", sentAt: new Date().toISOString() };
        return b;
      })
    );
    toast.success("Broadcast paused");
  };
  const remove = (id: string) => {
    setItems((prev) => prev.filter((b) => b.id !== id));
    toast.success("Broadcast deleted");
  };
  const sendNow = (id: string) => {
    setItems((prev) =>
      prev.map((b) =>
        b.id === id
          ? { ...b, status: "sending", scheduledAt: b.scheduledAt ?? new Date().toISOString(), sentAt: new Date().toISOString() }
          : b
      )
    );
    toast.success("Broadcast started");
  };
  const create = () => {
    if (!draft.name.trim()) { toast.error("Name required"); return; }
    const next: Broadcast = {
      id: `bc_${Math.floor(Math.random() * 900000) + 100000}`,
      name: draft.name.trim(),
      templateId: draft.templateId,
      channel: draft.channel,
      audience: draft.audience,
      audienceSize: 5000 + Math.floor(Math.random() * 200000),
      status: draft.scheduledAt ? "scheduled" : "draft",
      scheduledAt: draft.scheduledAt ? new Date(draft.scheduledAt).toISOString() : null,
      sentAt: null,
      sent: 0, delivered: 0, opened: 0, clicked: 0, failed: 0,
      createdBy: "You",
    };
    setItems((prev) => [next, ...prev]);
    setCreating(false);
    setDraft({ name: "", templateId: templates[0].id, channel: "push", audience: "all", scheduledAt: "" });
    toast.success(`${draft.scheduledAt ? "Scheduled" : "Saved as draft"}`);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search broadcasts…" className="pl-8" />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
          <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="sending">Sending</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
        <Button size="sm" className="gap-2" onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4" /> New broadcast
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {rows.map((b) => {
          const dr = b.audienceSize > 0 ? (b.delivered / b.audienceSize) * 100 : 0;
          const ctr = b.delivered > 0 ? (b.clicked / b.delivered) * 100 : 0;
          const tpl = templates.find((t) => t.id === b.templateId);
          return (
            <Card key={b.id} className="shadow-card">
              <CardContent className="p-3 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-sm font-display font-bold truncate">{b.name}</div>
                    <div className="text-[11px] text-muted-foreground font-mono">{b.id} · {tpl?.name ?? "—"}</div>
                  </div>
                  <Badge variant="outline" className={`text-[10px] capitalize shrink-0 ${broadcastStatusTone[b.status]}`}>{b.status}</Badge>
                </div>
                <div className="flex items-center gap-1 flex-wrap">
                  <Badge variant="outline" className={`text-[10px] ${channelTone[b.channel]}`}>{channelLabel[b.channel]}</Badge>
                  <Badge variant="outline" className="text-[10px] capitalize">{b.audience.replace("_", " ")}</Badge>
                  <span className="text-[11px] text-muted-foreground">· {fmtNum(b.audienceSize)} users</span>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center pt-1">
                  <Stat label="Delivered" value={fmtNum(b.delivered)} sub={`${dr.toFixed(0)}%`} />
                  <Stat label="Opened" value={fmtNum(b.opened)} />
                  <Stat label="Clicked" value={fmtNum(b.clicked)} sub={`${ctr.toFixed(1)}%`} />
                  <Stat label="Failed" value={fmtNum(b.failed)} />
                </div>
                <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1.5 border-t border-border">
                  <span>{b.createdBy} · {fmtRelative(b.scheduledAt ?? b.sentAt ?? new Date().toISOString())}</span>
                  <div className="flex gap-1">
                    {(b.status === "scheduled" || b.status === "sending") && (
                      <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" onClick={() => cancel(b.id)}>
                        <Pause className="h-3 w-3" /> Pause
                      </Button>
                    )}
                    {b.status === "draft" && (
                      <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" onClick={() => toast.success("Sent now")}>
                        <Send className="h-3 w-3" /> Send
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" className="h-7 text-xs gap-1 text-destructive" onClick={() => remove(b.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {rows.length === 0 && (
          <div className="lg:col-span-2 text-center text-sm text-muted-foreground py-10">No broadcasts match your filters.</div>
        )}
      </div>

      <Dialog open={creating} onOpenChange={setCreating}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>New broadcast</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="e.g. Q4 referral push" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Template</Label>
                <Select value={draft.templateId} onValueChange={(v) => setDraft({ ...draft, templateId: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {templates.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Channel</Label>
                <Select value={draft.channel} onValueChange={(v) => setDraft({ ...draft, channel: v as Channel })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="push">Push</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="in_app">In-app</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Audience</Label>
                <Select value={draft.audience} onValueChange={(v) => setDraft({ ...draft, audience: v as Broadcast["audience"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {AUDIENCES.map((a) => <SelectItem key={a} value={a} className="capitalize">{a.replace("_", " ")}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Schedule (optional)</Label>
                <Input type="datetime-local" value={draft.scheduledAt} onChange={(e) => setDraft({ ...draft, scheduledAt: e.target.value })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreating(false)}>Cancel</Button>
            <Button onClick={create}>{draft.scheduledAt ? "Schedule" : "Save draft"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div>
      <div className="text-sm font-display font-bold leading-none">{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">{label}</div>
      {sub && <div className="text-[10px] text-muted-foreground">{sub}</div>}
    </div>
  );
}
