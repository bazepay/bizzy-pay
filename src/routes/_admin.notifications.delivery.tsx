import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Download } from "lucide-react";
import { toast } from "sonner";
import {
  deliveries,
  channelLabel,
  channelTone,
  deliveryStatusTone,
  eventLabel,
  fmtRelative,
  type Channel,
  type DeliveryStatus,
} from "@/lib/notifications-data";

export const Route = createFileRoute("/_admin/notifications/delivery")({
  component: DeliveryLogPage,
});

function DeliveryLogPage() {
  const [q, setQ] = useState("");
  const [channelFilter, setChannelFilter] = useState<"all" | Channel>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | DeliveryStatus>("all");

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    return deliveries.filter((d) => {
      if (channelFilter !== "all" && d.channel !== channelFilter) return false;
      if (statusFilter !== "all" && d.status !== statusFilter) return false;
      if (!term) return true;
      return (
        d.id.toLowerCase().includes(term) ||
        d.userName.toLowerCase().includes(term) ||
        d.userId.toLowerCase().includes(term) ||
        d.provider.toLowerCase().includes(term) ||
        eventLabel[d.event].toLowerCase().includes(term)
      );
    });
  }, [q, channelFilter, statusFilter]);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by user, event, provider…" className="pl-8" />
        </div>
        <Select value={channelFilter} onValueChange={(v) => setChannelFilter(v as typeof channelFilter)}>
          <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All channels</SelectItem>
            <SelectItem value="push">Push</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="sms">SMS</SelectItem>
            <SelectItem value="in_app">In-app</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
          <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="queued">Queued</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="opened">Opened</SelectItem>
            <SelectItem value="clicked">Clicked</SelectItem>
            <SelectItem value="bounced">Bounced</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
        <Button size="sm" variant="outline" className="gap-2" onClick={() => toast.success("Exported CSV")}>
          <Download className="h-4 w-4" /> Export
        </Button>
      </div>

      <Card className="shadow-card">
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/40 text-muted-foreground">
              <tr className="text-left">
                <th className="px-3 py-2 font-medium">When</th>
                <th className="px-3 py-2 font-medium">User</th>
                <th className="px-3 py-2 font-medium">Event</th>
                <th className="px-3 py-2 font-medium">Channel</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium">Provider</th>
                <th className="px-3 py-2 font-medium text-right">Latency</th>
                <th className="px-3 py-2 font-medium">Error</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((d) => (
                <tr key={d.id} className="hover:bg-muted/20">
                  <td className="px-3 py-2 whitespace-nowrap">{fmtRelative(d.ts)}</td>
                  <td className="px-3 py-2">
                    <div className="font-medium">{d.userName}</div>
                    <div className="font-mono text-[10px] text-muted-foreground">{d.userId}</div>
                  </td>
                  <td className="px-3 py-2">{eventLabel[d.event]}</td>
                  <td className="px-3 py-2">
                    <Badge variant="outline" className={`text-[10px] ${channelTone[d.channel]}`}>{channelLabel[d.channel]}</Badge>
                  </td>
                  <td className="px-3 py-2">
                    <Badge variant="outline" className={`text-[10px] capitalize ${deliveryStatusTone[d.status]}`}>{d.status}</Badge>
                  </td>
                  <td className="px-3 py-2">{d.provider}</td>
                  <td className="px-3 py-2 text-right font-mono">{d.latencyMs}ms</td>
                  <td className="px-3 py-2 text-destructive">{d.error ?? "—"}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={8} className="px-3 py-10 text-center text-muted-foreground">No deliveries match your filters.</td></tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </motion.div>
  );
}
