import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Search, Plus, Pencil, Eye } from "lucide-react";
import { toast } from "sonner";
import {
  templates as seed,
  eventLabel,
  channelLabel,
  channelTone,
  templateStatusTone,
  fmtNum,
  fmtPct,
  fmtRelative,
  type Template,
  type Channel,
  type EventKey,
} from "@/lib/notifications-data";

export const Route = createFileRoute("/_admin/notifications/templates")({
  component: TemplatesPage,
});

const ALL_CHANNELS: Channel[] = ["push", "email", "sms", "in_app"];

function TemplatesPage() {
  const [items, setItems] = useState<Template[]>(seed);
  const [q, setQ] = useState("");
  const [channelFilter, setChannelFilter] = useState<"all" | Channel>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | Template["status"]>("all");
  const [editing, setEditing] = useState<Template | null>(null);
  const [previewing, setPreviewing] = useState<Template | null>(null);

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    return items.filter((t) => {
      if (channelFilter !== "all" && !t.channels.includes(channelFilter)) return false;
      if (statusFilter !== "all" && t.status !== statusFilter) return false;
      if (!term) return true;
      return t.name.toLowerCase().includes(term) || eventLabel[t.event].toLowerCase().includes(term) || t.id.toLowerCase().includes(term);
    });
  }, [items, q, channelFilter, statusFilter]);

  const save = () => {
    if (!editing) return;
    setItems((prev) => prev.map((t) => (t.id === editing.id ? { ...editing, updatedAt: new Date().toISOString() } : t)));
    toast.success(`Saved ${editing.name}`);
    setEditing(null);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search templates or events…" className="pl-8" />
        </div>
        <Select value={channelFilter} onValueChange={(v) => setChannelFilter(v as typeof channelFilter)}>
          <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All channels</SelectItem>
            {ALL_CHANNELS.map((c) => <SelectItem key={c} value={c}>{channelLabel[c]}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
          <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
          </SelectContent>
        </Select>
        <Button size="sm" className="gap-2" onClick={() => toast.info("New template — pick an event to start")}>
          <Plus className="h-4 w-4" /> New template
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {rows.map((t) => (
          <Card key={t.id} className="shadow-card">
            <CardContent className="p-3 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-sm font-display font-bold truncate">{t.name}</div>
                  <div className="text-[11px] text-muted-foreground font-mono">{t.id} · {eventLabel[t.event]}</div>
                </div>
                <Badge variant="outline" className={`text-[10px] capitalize shrink-0 ${templateStatusTone[t.status]}`}>{t.status}</Badge>
              </div>
              <div className="flex items-center gap-1 flex-wrap">
                {t.channels.map((c) => <Badge key={c} variant="outline" className={`text-[10px] ${channelTone[c]}`}>{channelLabel[c]}</Badge>)}
                {t.abVariant && <Badge variant="outline" className="text-[10px] border-primary/40 text-primary">A/B · {t.abVariant}</Badge>}
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">{t.body}</p>
              <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1.5 border-t border-border">
                <span>{fmtNum(t.sent30d)} sent · {fmtPct(t.openRate)} open · {fmtPct(t.clickRate)} click</span>
                <span>{fmtRelative(t.updatedAt)}</span>
              </div>
              <div className="flex gap-1.5 pt-1">
                <Button size="sm" variant="outline" className="flex-1 h-7 text-xs gap-1" onClick={() => setPreviewing(t)}>
                  <Eye className="h-3 w-3" /> Preview
                </Button>
                <Button size="sm" variant="outline" className="flex-1 h-7 text-xs gap-1" onClick={() => setEditing({ ...t })}>
                  <Pencil className="h-3 w-3" /> Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {rows.length === 0 && (
          <div className="md:col-span-2 xl:col-span-3 text-center text-sm text-muted-foreground py-10">No templates match your filters.</div>
        )}
      </div>

      {/* Edit dialog */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit template</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Name</Label>
                  <Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Status</Label>
                  <Select value={editing.status} onValueChange={(v) => setEditing({ ...editing, status: v as Template["status"] })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Channels</Label>
                <div className="flex gap-3 flex-wrap">
                  {ALL_CHANNELS.map((c) => (
                    <label key={c} className="flex items-center gap-2 text-xs">
                      <Switch
                        checked={editing.channels.includes(c)}
                        onCheckedChange={(v) =>
                          setEditing({
                            ...editing,
                            channels: v ? [...editing.channels, c] : editing.channels.filter((x) => x !== c),
                          })
                        }
                      />
                      {channelLabel[c]}
                    </label>
                  ))}
                </div>
              </div>
              {editing.channels.includes("email") && (
                <div className="space-y-1.5">
                  <Label>Email subject</Label>
                  <Input value={editing.subject ?? ""} onChange={(e) => setEditing({ ...editing, subject: e.target.value })} />
                </div>
              )}
              {editing.channels.includes("push") && (
                <div className="space-y-1.5">
                  <Label>Push title</Label>
                  <Input value={editing.pushTitle ?? ""} onChange={(e) => setEditing({ ...editing, pushTitle: e.target.value })} />
                </div>
              )}
              <div className="space-y-1.5">
                <Label>Body</Label>
                <Textarea value={editing.body} onChange={(e) => setEditing({ ...editing, body: e.target.value })} className="min-h-[120px]" />
              </div>
              {editing.variables.length > 0 && (
                <div className="text-[11px] text-muted-foreground">
                  Available variables: {editing.variables.map((v) => <code key={v} className="px-1 bg-muted rounded mx-0.5">{`{{${v}}}`}</code>)}
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={save}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview dialog */}
      <Dialog open={!!previewing} onOpenChange={(o) => !o && setPreviewing(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{previewing?.name}</DialogTitle>
          </DialogHeader>
          {previewing && (
            <div className="space-y-3">
              {previewing.channels.includes("push") && (
                <div className="rounded-lg border border-border bg-muted/30 p-3">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Push notification</div>
                  <div className="text-sm font-semibold">{previewing.pushTitle}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{previewing.body}</div>
                </div>
              )}
              {previewing.channels.includes("email") && (
                <div className="rounded-lg border border-border bg-muted/30 p-3">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Email</div>
                  <div className="text-sm font-semibold">{previewing.subject}</div>
                  <div className="text-xs text-muted-foreground mt-1 whitespace-pre-wrap">{previewing.body}</div>
                </div>
              )}
              {previewing.channels.includes("sms") && (
                <div className="rounded-lg border border-border bg-muted/30 p-3">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">SMS</div>
                  <div className="text-xs">{previewing.body}</div>
                </div>
              )}
              {previewing.channels.includes("in_app") && (
                <div className="rounded-lg border border-border bg-muted/30 p-3">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">In-app</div>
                  <div className="text-xs">{previewing.body}</div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
