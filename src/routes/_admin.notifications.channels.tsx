import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { RotateCw, Star, Power } from "lucide-react";
import { toast } from "sonner";
import {
  providers as seed,
  channelLabel,
  channelTone,
  fmtNum,
  fmtNgn,
  fmtPct,
  fmtRelative,
  type ProviderConfig,
  type Channel,
} from "@/lib/notifications-data";

export const Route = createFileRoute("/_admin/notifications/channels")({
  component: ChannelsPage,
});

const STATUS_TONE: Record<ProviderConfig["status"], string> = {
  live: "border-success/40 text-success",
  sandbox: "border-warning/40 text-warning",
  disabled: "border-muted-foreground/30 text-muted-foreground",
};

function ChannelsPage() {
  const [items, setItems] = useState<ProviderConfig[]>(seed);

  const groups: Channel[] = ["push", "email", "sms", "in_app"];

  const setPrimary = (id: string, channel: Channel) => {
    setItems((prev) => prev.map((p) => (p.channel === channel ? { ...p, primary: p.id === id } : p)));
    toast.success("Primary provider updated");
  };
  const toggle = (id: string) => {
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, status: p.status === "disabled" ? "live" : "disabled" } : p)));
  };
  const rotate = (id: string) => {
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, apiKeyMasked: `${p.apiKeyMasked.slice(0, 4)}••••••${Math.random().toString(36).slice(2, 6).toUpperCase()}`, updatedAt: new Date().toISOString() } : p)));
    toast.success("API key rotated");
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      {groups.map((ch) => {
        const list = items.filter((p) => p.channel === ch);
        if (list.length === 0) return null;
        return (
          <div key={ch} className="space-y-2">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-display font-bold uppercase tracking-wider text-muted-foreground">{channelLabel[ch]}</h2>
              <Badge variant="outline" className={`text-[10px] ${channelTone[ch]}`}>{list.length} configured</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {list.map((p) => (
                <Card key={p.id} className="shadow-card">
                  <CardContent className="p-3 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-sm font-display font-bold flex items-center gap-1.5 truncate">
                          {p.name}
                          {p.primary && <Star className="h-3.5 w-3.5 fill-warning text-warning shrink-0" />}
                        </div>
                        <div className="text-[11px] text-muted-foreground font-mono">{p.id} · {p.region}</div>
                      </div>
                      <Badge variant="outline" className={`text-[10px] capitalize shrink-0 ${STATUS_TONE[p.status]}`}>{p.status}</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center pt-1">
                      <Stat label="Sent · 30d" value={fmtNum(p.sent30d)} />
                      <Stat label="Success" value={fmtPct(p.successRate)} />
                      <Stat label="Cost · 30d" value={p.costNgn30d > 0 ? fmtNgn(p.costNgn30d) : "—"} />
                    </div>
                    <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-border">
                      <span className="font-mono text-muted-foreground truncate">{p.apiKeyMasked}</span>
                      <span className="text-muted-foreground shrink-0 ml-2">{fmtRelative(p.updatedAt)}</span>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <label className="flex items-center gap-2 text-xs">
                        <Switch checked={p.status !== "disabled"} onCheckedChange={() => toggle(p.id)} />
                        <span className="text-muted-foreground">Enabled</span>
                      </label>
                      <div className="flex gap-1">
                        {!p.primary && p.status !== "disabled" && (
                          <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => setPrimary(p.id, p.channel)}>
                            <Star className="h-3 w-3" /> Make primary
                          </Button>
                        )}
                        <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => rotate(p.id)}>
                          <RotateCw className="h-3 w-3" /> Rotate key
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" onClick={() => toast.info("Test event sent")}>
                          <Power className="h-3 w-3" /> Test
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      })}
    </motion.div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-sm font-display font-bold leading-none">{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">{label}</div>
    </div>
  );
}
