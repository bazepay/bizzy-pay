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
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Play, Pause, Trash2, Mail, CalendarClock } from "lucide-react";
import { toast } from "sonner";
import {
  scheduledReports as seed,
  reports as catalog,
  statusTone,
  fmtRelative,
  fmtDate,
  type ScheduledReport,
} from "@/lib/reports-data";

export const Route = createFileRoute("/_admin/reports/scheduled")({
  component: ScheduledPage,
});

function ScheduledPage() {
  const [items, setItems] = useState<ScheduledReport[]>(seed);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({
    reportId: catalog[0].id,
    cadence: "daily" as ScheduledReport["cadence"],
    recipients: "",
    format: "pdf" as ScheduledReport["format"],
  });

  const stats = useMemo(() => ({
    total: items.length,
    active: items.filter((i) => i.status === "active").length,
    failed: items.filter((i) => i.lastStatus === "failed").length,
  }), [items]);

  const toggle = (id: string) => {
    setItems((p) => p.map((i) => i.id === id ? { ...i, status: i.status === "active" ? "paused" : "active" } : i));
    toast.success("Schedule updated");
  };

  const remove = (id: string) => {
    setItems((p) => p.filter((i) => i.id !== id));
    toast.success("Schedule removed");
  };

  const create = () => {
    const r = catalog.find((c) => c.id === draft.reportId)!;
    const recipients = draft.recipients.split(",").map((s) => s.trim()).filter(Boolean);
    if (recipients.length === 0) { toast.error("Add at least one recipient"); return; }
    const next = new Date(2026, 4, 10, 6, 0, 0).toISOString();
    setItems((p) => [{
      id: `sch_${Math.floor(Math.random() * 9000 + 1000)}`,
      reportId: r.id,
      reportName: r.name,
      cadence: draft.cadence,
      nextRun: next,
      recipients,
      format: draft.format,
      status: "active",
      lastStatus: "queued",
    }, ...p]);
    setOpen(false);
    setDraft({ reportId: catalog[0].id, cadence: "daily", recipients: "", format: "pdf" });
    toast.success("Schedule created");
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold">Scheduled reports</h2>
          <p className="text-sm text-muted-foreground">Recurring exports delivered to inboxes automatically.</p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => setOpen(true)}>
          <Plus className="h-3.5 w-3.5" /> New schedule
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Stat label="Total" value={String(stats.total)} icon={CalendarClock} />
        <Stat label="Active" value={String(stats.active)} accent="emerald" />
        <Stat label="Last run failed" value={String(stats.failed)} accent={stats.failed > 0 ? "rose" : "muted"} />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Report</TableHead>
                <TableHead>Cadence</TableHead>
                <TableHead>Next run</TableHead>
                <TableHead>Recipients</TableHead>
                <TableHead>Format</TableHead>
                <TableHead>Last</TableHead>
                <TableHead className="text-right">Status</TableHead>
                <TableHead className="text-right w-24"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((i) => (
                <TableRow key={i.id}>
                  <TableCell className="font-medium">{i.reportName}</TableCell>
                  <TableCell className="capitalize">{i.cadence}</TableCell>
                  <TableCell className="text-sm">
                    <div>{fmtDate(i.nextRun)}</div>
                    <div className="text-xs text-muted-foreground">{fmtRelative(i.nextRun)}</div>
                  </TableCell>
                  <TableCell className="text-xs">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      {i.recipients.length} recipient{i.recipients.length === 1 ? "" : "s"}
                    </div>
                  </TableCell>
                  <TableCell><Badge variant="outline" className="font-mono text-xs uppercase">{i.format}</Badge></TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusTone[i.lastStatus]}>{i.lastStatus}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{i.status === "active" ? "On" : "Off"}</span>
                      <Switch checked={i.status === "active"} onCheckedChange={() => toggle(i.id)} />
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="icon" variant="ghost" onClick={() => toast.success(`Running ${i.reportName} now`)} title="Run now">
                      <Play className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => remove(i.id)} title="Remove">
                      <Trash2 className="h-3.5 w-3.5 text-rose-600" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {items.length === 0 && (
                <TableRow><TableCell colSpan={8} className="text-center py-10 text-sm text-muted-foreground">No scheduled reports.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Schedule a report</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Report</Label>
              <Select value={draft.reportId} onValueChange={(v) => setDraft({ ...draft, reportId: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {catalog.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Cadence</Label>
                <Select value={draft.cadence} onValueChange={(v) => setDraft({ ...draft, cadence: v as any })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Format</Label>
                <Select value={draft.format} onValueChange={(v) => setDraft({ ...draft, format: v as any })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="xlsx">XLSX</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Recipients</Label>
              <Input placeholder="finance@bazepay.ng, ops@bazepay.ng" value={draft.recipients} onChange={(e) => setDraft({ ...draft, recipients: e.target.value })} />
              <p className="text-xs text-muted-foreground">Comma-separated email addresses.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={create}>Create schedule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

function Stat({ label, value, icon: Icon, accent }: { label: string; value: string; icon?: any; accent?: string }) {
  const tone = accent === "emerald" ? "text-emerald-600" : accent === "rose" ? "text-rose-600" : "";
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        {Icon && <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center"><Icon className="h-4.5 w-4.5" /></div>}
        <div>
          <div className="text-xs text-muted-foreground">{label}</div>
          <div className={`font-display text-xl font-bold ${tone}`}>{value}</div>
        </div>
      </CardContent>
    </Card>
  );
}
