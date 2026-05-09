import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Download, Inbox, AlertTriangle, CheckCircle2, UserCheck, ShieldCheck, RotateCcw, Eye } from "lucide-react";
import {
  tickets as initial,
  ticketStatusTone,
  priorityTone,
  channelLabel,
  categoryLabel,
  fmtMins,
  fmtRelative,
  fmtNgn,
  type Ticket,
  type TicketStatus,
} from "@/lib/support-data";
import { toast } from "sonner";

export const Route = createFileRoute("/_admin/support/tickets")({
  component: TicketsPage,
});

function TicketsPage() {
  const [items, setItems] = useState<Ticket[]>(initial);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");
  const [channel, setChannel] = useState("all");
  const [category, setCategory] = useState("all");
  const [assignee, setAssignee] = useState("all");
  const [visible, setVisible] = useState(40);

  const rows = useMemo(() => {
    return items
      .filter((t) => {
        if (status !== "all" && t.status !== status) return false;
        if (priority !== "all" && t.priority !== priority) return false;
        if (channel !== "all" && t.channel !== channel) return false;
        if (category !== "all" && t.category !== category) return false;
        if (assignee === "unassigned" && t.assigneeName) return false;
        if (assignee === "assigned" && !t.assigneeName) return false;
        if (q) {
          const v = q.toLowerCase();
          if (
            !t.id.toLowerCase().includes(v) &&
            !t.subject.toLowerCase().includes(v) &&
            !t.customerName.toLowerCase().includes(v) &&
            !t.customerEmail.toLowerCase().includes(v)
          ) return false;
        }
        return true;
      })
      .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt));
  }, [items, q, status, priority, channel, category, assignee]);

  const stats = useMemo(() => {
    const open = rows.filter((t) => t.status !== "resolved" && t.status !== "closed").length;
    const breaching = rows.filter((t) => {
      if (t.status === "resolved" || t.status === "closed") return false;
      const ageMins = Math.round((Date.now() - new Date(t.createdAt).getTime()) / 60_000);
      return ageMins > t.slaTargetMins;
    }).length;
    const unassigned = rows.filter((t) => !t.assigneeName && t.status !== "resolved" && t.status !== "closed").length;
    const urgent = rows.filter((t) => t.priority === "urgent" && t.status !== "resolved" && t.status !== "closed").length;
    return { open, breaching, unassigned, urgent };
  }, [rows]);

  const assignSelf = (id: string) => {
    setItems((prev) => prev.map((t) => t.id === id ? { ...t, assigneeName: "You", assigneeId: "agt_self", status: t.status === "new" ? "open" : t.status, updatedAt: new Date().toISOString() } : t));
    toast.success(`${id} assigned to you`);
  };
  const resolveTicket = (id: string) => {
    setItems((prev) => prev.map((t) => t.id === id ? { ...t, status: "resolved" as TicketStatus, updatedAt: new Date().toISOString(), resolutionMins: t.resolutionMins ?? 60 } : t));
    toast.success(`${id} resolved`);
  };
  const reopenTicket = (id: string) => {
    setItems((prev) => prev.map((t) => t.id === id ? { ...t, status: "open" as TicketStatus, updatedAt: new Date().toISOString() } : t));
    toast.success(`${id} reopened`);
  };

  const exportCsv = () => {
    const headers = ["id", "subject", "customer", "email", "channel", "category", "priority", "status", "assignee", "created_at", "first_response_mins", "resolution_mins", "amount_ngn"];
    const lines = [headers.join(",")];
    rows.forEach((t) => lines.push([
      t.id, `"${t.subject.replace(/"/g, "'")}"`, t.customerName, t.customerEmail, t.channel, t.category, t.priority, t.status, t.assigneeName ?? "", t.createdAt, t.firstResponseMins ?? "", t.resolutionMins ?? "", t.amountInvolvedNgn,
    ].join(",")));
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `tickets-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${rows.length} tickets`);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Open" value={stats.open.toLocaleString()} sub="In filtered view" icon={Inbox} />
        <StatCard label="SLA breaching" value={stats.breaching.toLocaleString()} sub="Past target" icon={AlertTriangle} tone={stats.breaching > 0 ? "danger" : undefined} />
        <StatCard label="Unassigned" value={stats.unassigned.toLocaleString()} sub="Need owner" icon={UserCheck} tone={stats.unassigned > 5 ? "warning" : undefined} />
        <StatCard label="Urgent" value={stats.urgent.toLocaleString()} sub="P1 priority" icon={ShieldCheck} tone={stats.urgent > 0 ? "danger" : undefined} />
      </div>

      <Card className="shadow-card">
        <CardContent className="p-4 flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[220px]">
            <Label className="text-xs">Search</Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ID, subject, customer..." className="pl-8 h-9" />
            </div>
          </div>
          <FilterSelect label="Status" value={status} onChange={setStatus} options={[["all", "All"], ["new", "New"], ["open", "Open"], ["pending", "Pending"], ["on_hold", "On hold"], ["resolved", "Resolved"], ["closed", "Closed"]]} />
          <FilterSelect label="Priority" value={priority} onChange={setPriority} options={[["all", "All"], ["urgent", "Urgent"], ["high", "High"], ["normal", "Normal"], ["low", "Low"]]} />
          <FilterSelect label="Channel" value={channel} onChange={setChannel} options={[["all", "All"], ["email", "Email"], ["chat", "Chat"], ["whatsapp", "WhatsApp"], ["twitter", "X"], ["in_app", "In-app"], ["phone", "Phone"]]} />
          <FilterSelect label="Category" value={category} onChange={setCategory} options={[["all", "All"], ...Object.entries(categoryLabel).map(([v, l]) => [v, l] as [string, string])]} />
          <FilterSelect label="Assignee" value={assignee} onChange={setAssignee} options={[["all", "All"], ["unassigned", "Unassigned"], ["assigned", "Assigned"]]} />
          <Button onClick={exportCsv} variant="outline" size="sm" className="gap-1.5 h-9 ml-auto">
            <Download className="h-3.5 w-3.5" /> Export CSV
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-card overflow-hidden">
        <div className="overflow-x-auto">
        <Table className="min-w-[1300px]">
          <TableHeader>
            <TableRow>
              <TableHead>Ticket</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Channel</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>SLA</TableHead>
              <TableHead>Assignee</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.slice(0, visible).map((t) => {
              const ageMins = Math.round((Date.now() - new Date(t.createdAt).getTime()) / 60_000);
              const breaching = t.status !== "resolved" && t.status !== "closed" && ageMins > t.slaTargetMins;
              const slaPct = Math.min(100, (ageMins / t.slaTargetMins) * 100);
              return (
                <TableRow key={t.id} className="cursor-pointer hover:bg-muted/40" onClick={(e) => {
                  // Avoid navigating when clicking interactive children (buttons, links)
                  const tgt = e.target as HTMLElement;
                  if (tgt.closest("button, a")) return;
                  window.location.assign(`/support/tickets/${t.id}`);
                }}>
                  <TableCell className="max-w-[280px]">
                    <Link to="/support/tickets/$id" params={{ id: t.id }} className="text-sm font-medium truncate block hover:text-primary hover:underline">{t.subject}</Link>
                    <div className="text-[11px] text-muted-foreground font-mono">{t.id}</div>
                  </TableCell>
                  <TableCell>
                    <Link to="/users/$id" params={{ id: t.customerId }} className="text-sm truncate max-w-[160px] block hover:text-primary hover:underline">{t.customerName}</Link>
                    <div className="text-[10px] text-muted-foreground font-mono truncate max-w-[160px]">{t.customerId}</div>
                  </TableCell>
                  <TableCell className="text-xs whitespace-nowrap">{channelLabel[t.channel]}</TableCell>
                  <TableCell className="text-xs whitespace-nowrap">{categoryLabel[t.category]}</TableCell>
                  <TableCell><Badge variant="outline" className={`text-[10px] capitalize ${priorityTone[t.priority]}`}>{t.priority}</Badge></TableCell>
                  <TableCell className="min-w-[110px]">
                    <div className="text-[11px] font-mono whitespace-nowrap">{fmtMins(ageMins)} / {fmtMins(t.slaTargetMins)}</div>
                    <div className="h-1 bg-muted rounded-full overflow-hidden mt-1 w-20">
                      <div className={`h-full rounded-full ${breaching ? "bg-destructive" : slaPct > 75 ? "bg-warning" : "bg-success"}`} style={{ width: `${slaPct}%` }} />
                    </div>
                  </TableCell>
                  <TableCell className="text-xs whitespace-nowrap">{t.assigneeName ?? <span className="text-muted-foreground italic">unassigned</span>}</TableCell>
                  <TableCell className="text-right font-mono text-xs whitespace-nowrap">{t.amountInvolvedNgn ? fmtNgn(t.amountInvolvedNgn) : "—"}</TableCell>
                  <TableCell className="text-xs whitespace-nowrap">{fmtRelative(t.updatedAt)}</TableCell>
                  <TableCell><Badge variant="outline" className={`text-[10px] capitalize ${ticketStatusTone[t.status]}`}>{t.status.replace("_", " ")}</Badge></TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center gap-1 justify-end">
                      <Button asChild size="sm" variant="ghost" className="h-7 px-2 text-xs gap-1">
                        <Link to="/support/tickets/$id" params={{ id: t.id }}><Eye className="h-3 w-3" /> View</Link>
                      </Button>
                      {!t.assigneeName && (
                        <Button size="sm" variant="ghost" className="h-7 px-2 text-xs gap-1" onClick={() => assignSelf(t.id)}>
                          <UserCheck className="h-3 w-3" /> Assign
                        </Button>
                      )}
                      {t.status !== "resolved" && t.status !== "closed" && (
                        <Button size="sm" variant="ghost" className="h-7 px-2 text-xs gap-1 text-success" onClick={() => resolveTicket(t.id)}>
                          <CheckCircle2 className="h-3 w-3" /> Resolve
                        </Button>
                      )}
                      {(t.status === "resolved" || t.status === "closed") && (
                        <Button size="sm" variant="ghost" className="h-7 px-2 text-xs gap-1" onClick={() => reopenTicket(t.id)}>
                          <RotateCcw className="h-3 w-3" /> Reopen
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {rows.length === 0 && (
              <TableRow><TableCell colSpan={11} className="text-center text-sm text-muted-foreground py-10">No tickets match.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
        </div>
        {rows.length > visible && (
          <div className="p-3 flex justify-center border-t border-border">
            <Button variant="outline" size="sm" onClick={() => setVisible((v) => v + 40)}>Load more</Button>
          </div>
        )}
      </Card>
    </motion.div>
  );
}

function StatCard({ label, value, sub, icon: Icon, tone }: { label: string; value: string; sub: string; icon: typeof Inbox; tone?: "success" | "warning" | "danger" }) {
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
        <SelectTrigger className="h-9 w-[160px]"><SelectValue /></SelectTrigger>
        <SelectContent>
          {options.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}
