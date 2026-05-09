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
import { Search, RefreshCw, Webhook, CheckCircle2, AlertTriangle, Clock } from "lucide-react";
import { webhookEvents as initial, providers, webhookStatusTone, type WebhookEvent } from "@/lib/payments-data";
import { toast } from "sonner";

export const Route = createFileRoute("/_admin/payments/webhooks")({
  component: WebhooksPage,
});

function WebhooksPage() {
  const [items, setItems] = useState<WebhookEvent[]>(initial);
  const [q, setQ] = useState("");
  const [provider, setProvider] = useState("all");
  const [status, setStatus] = useState("all");
  const [visible, setVisible] = useState(40);

  const rows = useMemo(() => {
    return items.filter((w) => {
      if (provider !== "all" && w.provider !== provider) return false;
      if (status !== "all" && w.status !== status) return false;
      if (q) {
        const v = q.toLowerCase();
        if (!w.event.toLowerCase().includes(v) && !w.id.toLowerCase().includes(v) && !w.payloadRef.toLowerCase().includes(v)) return false;
      }
      return true;
    }).sort((a, b) => +new Date(b.receivedAt) - +new Date(a.receivedAt));
  }, [items, q, provider, status]);

  const stats = useMemo(() => {
    const total = rows.length;
    const ok = rows.filter((w) => w.status === "delivered").length;
    const retry = rows.filter((w) => w.status === "retrying").length;
    const fail = rows.filter((w) => w.status === "failed").length;
    const avgMs = total ? Math.round(rows.reduce((s, w) => s + w.responseMs, 0) / total) : 0;
    return { total, ok, retry, fail, avgMs };
  }, [rows]);

  const replay = (id: string) => {
    setItems((prev) => prev.map((w) => (w.id === id ? { ...w, status: "delivered", attempts: w.attempts + 1, responseMs: 90 + Math.floor(Math.random() * 400), receivedAt: new Date().toISOString() } : w)));
    toast.success(`Webhook ${id} replayed`);
  };
  const replayAllFailed = () => {
    const failedIds = rows.filter((w) => w.status === "failed").map((w) => w.id);
    if (!failedIds.length) { toast.info("No failed webhooks to replay"); return; }
    setItems((prev) => prev.map((w) => (failedIds.includes(w.id) ? { ...w, status: "delivered", attempts: w.attempts + 1, responseMs: 90 + Math.floor(Math.random() * 400), receivedAt: new Date().toISOString() } : w)));
    toast.success(`Replayed ${failedIds.length} failed webhooks`);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatCard label="Events" value={stats.total.toLocaleString()} sub="Filtered view" icon={Webhook} />
        <StatCard label="Delivered" value={stats.ok.toLocaleString()} sub={stats.total ? `${((stats.ok / stats.total) * 100).toFixed(1)}%` : "—"} icon={CheckCircle2} tone="success" />
        <StatCard label="Retrying" value={stats.retry.toLocaleString()} sub="In backoff" icon={Clock} tone={stats.retry > 0 ? "warning" : undefined} />
        <StatCard label="Failed" value={stats.fail.toLocaleString()} sub="Manual replay" icon={AlertTriangle} tone={stats.fail > 0 ? "danger" : undefined} />
        <StatCard label="Avg response" value={`${stats.avgMs}ms`} sub="Our endpoint" icon={Clock} />
      </div>

      <Card className="shadow-card">
        <CardContent className="p-4 flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[220px]">
            <Label className="text-xs">Search</Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Event, ID, payload ref..." className="pl-8 h-9" />
            </div>
          </div>
          <FilterSelect label="Provider" value={provider} onChange={setProvider} options={[["all", "All"], ...providers.map((p) => [p.id, p.name] as [string, string])]} />
          <FilterSelect label="Status" value={status} onChange={setStatus} options={[["all", "All"], ["delivered", "Delivered"], ["retrying", "Retrying"], ["failed", "Failed"]]} />
          <Button onClick={replayAllFailed} variant="outline" size="sm" className="gap-1.5 h-9 ml-auto">
            <RefreshCw className="h-3.5 w-3.5" /> Replay all failed
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Event</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>Received</TableHead>
              <TableHead className="text-right">Attempts</TableHead>
              <TableHead className="text-right">Response</TableHead>
              <TableHead>Status</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.slice(0, visible).map((w) => {
              const prov = providers.find((p) => p.id === w.provider);
              return (
                <TableRow key={w.id}>
                  <TableCell>
                    <div className="text-sm font-mono">{w.event}</div>
                    <div className="text-[11px] text-muted-foreground">{w.id} · {w.payloadRef}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="h-7 w-7 rounded-md flex items-center justify-center text-sm shrink-0" style={{ backgroundColor: `${prov?.color}22`, color: prov?.color }}>{prov?.logo}</div>
                      <span className="text-sm">{prov?.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs">{new Date(w.receivedAt).toLocaleString()}</TableCell>
                  <TableCell className="text-right text-sm font-mono">{w.attempts}</TableCell>
                  <TableCell className="text-right text-sm font-mono">{w.responseMs}ms</TableCell>
                  <TableCell><Badge variant="outline" className={`text-[10px] capitalize ${webhookStatusTone[w.status]}`}>{w.status}</Badge></TableCell>
                  <TableCell className="text-right">
                    {w.status !== "delivered" && (
                      <Button size="sm" variant="ghost" className="h-7 px-2 text-xs gap-1" onClick={() => replay(w.id)}>
                        <RefreshCw className="h-3 w-3" /> Replay
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
            {rows.length === 0 && (
              <TableRow><TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-10">No webhook events match.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
        {rows.length > visible && (
          <div className="p-3 flex justify-center border-t border-border">
            <Button variant="outline" size="sm" onClick={() => setVisible((v) => v + 40)}>Load more</Button>
          </div>
        )}
      </Card>
    </motion.div>
  );
}

function StatCard({ label, value, sub, icon: Icon, tone }: { label: string; value: string; sub: string; icon: typeof Webhook; tone?: "success" | "warning" | "danger" }) {
  const t = tone === "success" ? "text-success" : tone === "warning" ? "text-warning" : tone === "danger" ? "text-destructive" : "text-muted-foreground";
  return (
    <Card className="shadow-card">
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-1.5">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</div>
          <Icon className={`h-3.5 w-3.5 ${t}`} />
        </div>
        <div className="text-lg font-display font-bold leading-tight">{value}</div>
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
        <SelectTrigger className="h-9 w-[180px]"><SelectValue /></SelectTrigger>
        <SelectContent>
          {options.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}
