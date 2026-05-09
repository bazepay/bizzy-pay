import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MessageSquare, Clock, Users, AlertTriangle, PlayCircle, CheckCircle2 } from "lucide-react";
import {
  chatSessions as initial,
  categoryLabel,
  fmtRelative,
  type ChatSession,
} from "@/lib/support-data";
import { toast } from "sonner";

export const Route = createFileRoute("/_admin/support/chat")({
  component: ChatQueuePage,
});

const statusTone: Record<ChatSession["status"], string> = {
  waiting: "bg-warning/10 text-warning border-warning/30",
  active: "bg-success/10 text-success border-success/30",
  resolved: "bg-muted text-muted-foreground border-border",
  abandoned: "bg-destructive/10 text-destructive border-destructive/30",
};

const fmtSecs = (s: number) => (s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${s % 60}s`);

function ChatQueuePage() {
  const [items, setItems] = useState<ChatSession[]>(initial);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [tick, setTick] = useState(0);

  // Live-tick wait timers every second
  useEffect(() => {
    const i = setInterval(() => setTick((t: number) => t + 1), 1000);
    return () => clearInterval(i);
  }, []);

  const rows = useMemo(() => {
    return items
      .filter((c) => {
        if (status !== "all" && c.status !== status) return false;
        if (q) {
          const v = q.toLowerCase();
          if (!c.id.toLowerCase().includes(v) && !c.customerName.toLowerCase().includes(v) && !c.preview.toLowerCase().includes(v)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        const order = { waiting: 0, active: 1, resolved: 2, abandoned: 3 };
        if (order[a.status] !== order[b.status]) return order[a.status] - order[b.status];
        return b.waitSeconds - a.waitSeconds;
      });
  }, [items, q, status]);

  const stats = useMemo(() => {
    const waiting = items.filter((c) => c.status === "waiting").length;
    const active = items.filter((c) => c.status === "active").length;
    const longestWait = Math.max(0, ...items.filter((c) => c.status === "waiting").map((c) => c.waitSeconds));
    const breaching = items.filter((c) => c.status === "waiting" && c.waitSeconds > 300).length;
    return { waiting, active, longestWait, breaching };
  }, [items]);

  const accept = (id: string) => {
    setItems((prev) => prev.map((c) => c.id === id ? { ...c, status: "active", agentName: "You", lastMessageAt: new Date().toISOString() } : c));
    toast.success(`Joined chat ${id}`);
  };
  const resolve = (id: string) => {
    setItems((prev) => prev.map((c) => c.id === id ? { ...c, status: "resolved", lastMessageAt: new Date().toISOString() } : c));
    toast.success(`Chat ${id} resolved`);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Waiting" value={stats.waiting.toLocaleString()} sub="In queue" icon={Clock} tone={stats.waiting > 5 ? "warning" : undefined} />
        <StatCard label="Active" value={stats.active.toLocaleString()} sub="With agents" icon={MessageSquare} tone="success" />
        <StatCard label="Longest wait" value={fmtSecs(stats.longestWait)} sub="Oldest waiting" icon={Users} tone={stats.longestWait > 300 ? "danger" : undefined} />
        <StatCard label="SLA breach" value={stats.breaching.toLocaleString()} sub="Waited > 5m" icon={AlertTriangle} tone={stats.breaching > 0 ? "danger" : undefined} />
      </div>

      <Card className="shadow-card">
        <CardContent className="p-4 flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[220px]">
            <Label className="text-xs">Search</Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ID, customer, message..." className="pl-8 h-9" />
            </div>
          </div>
          <div>
            <Label className="text-xs">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="h-9 w-[170px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="waiting">Waiting</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="abandoned">Abandoned</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {rows.map((c) => (
          <Card key={c.id} className="shadow-card">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-sm font-semibold truncate">{c.customerName}</div>
                  <div className="text-[11px] text-muted-foreground font-mono truncate">{c.id} · {c.customerId}</div>
                </div>
                <Badge variant="outline" className={`text-[10px] capitalize ${statusTone[c.status]}`}>{c.status}</Badge>
              </div>

              <div className="text-xs text-muted-foreground line-clamp-2 italic">"{c.preview}"</div>

              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span>{categoryLabel[c.topic]}</span>
                <span>{c.messages} msg</span>
              </div>

              <div className="flex items-center justify-between text-[11px] pt-2 border-t border-border">
                <div>
                  <div className="text-muted-foreground">{c.status === "waiting" ? "Waiting" : "Started"}</div>
                  <div className={`font-mono ${c.status === "waiting" && c.waitSeconds > 300 ? "text-destructive font-semibold" : ""}`}>
                    {c.status === "waiting" ? fmtSecs(c.waitSeconds) : fmtRelative(c.startedAt)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-muted-foreground">Agent</div>
                  <div className="truncate max-w-[120px]">{c.agentName ?? <span className="italic">—</span>}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                {c.status === "waiting" && (
                  <Button size="sm" className="h-8 flex-1 gap-1.5" onClick={() => accept(c.id)}>
                    <PlayCircle className="h-3.5 w-3.5" /> Accept chat
                  </Button>
                )}
                {c.status === "active" && (
                  <Button size="sm" variant="outline" className="h-8 flex-1 gap-1.5 text-success" onClick={() => resolve(c.id)}>
                    <CheckCircle2 className="h-3.5 w-3.5" /> Resolve
                  </Button>
                )}
                {(c.status === "resolved" || c.status === "abandoned") && (
                  <Button size="sm" variant="outline" className="h-8 flex-1" disabled>
                    Closed
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {rows.length === 0 && (
          <Card className="md:col-span-2 lg:col-span-3 shadow-card">
            <CardContent className="p-10 text-center text-sm text-muted-foreground">No chat sessions match.</CardContent>
          </Card>
        )}
      </div>
    </motion.div>
  );
}

function StatCard({ label, value, sub, icon: Icon, tone }: { label: string; value: string; sub: string; icon: typeof MessageSquare; tone?: "success" | "warning" | "danger" }) {
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
