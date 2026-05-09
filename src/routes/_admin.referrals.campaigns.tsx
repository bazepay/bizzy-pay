import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Play, Pause, Send, Megaphone, Mail, MessageSquare, Bell, Smartphone } from "lucide-react";
import {
  campaigns as initial,
  fmtNgn,
  campaignStatusTone,
  campaignChannelLabel,
  type Campaign,
  type CampaignStatus,
} from "@/lib/growth-data";
import { toast } from "sonner";

export const Route = createFileRoute("/_admin/referrals/campaigns")({
  component: CampaignsPage,
});

const channelIcon = {
  push: Bell,
  email: Mail,
  sms: MessageSquare,
  in_app: Smartphone,
};

function CampaignsPage() {
  const [items, setItems] = useState<Campaign[]>(initial);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [channel, setChannel] = useState("all");

  const rows = useMemo(() => {
    return items.filter((c) => {
      if (status !== "all" && c.status !== status) return false;
      if (channel !== "all" && c.channel !== channel) return false;
      if (q && !c.name.toLowerCase().includes(q.toLowerCase()) && !c.audience.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [items, q, status, channel]);

  const setStatusFor = (id: string, s: CampaignStatus, msg: string) => {
    setItems((prev) => prev.map((c) => (c.id === id ? { ...c, status: s } : c)));
    toast.success(msg);
  };
  const launchDraft = (id: string) => {
    setItems((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const sent = c.audienceSize;
        const delivered = Math.round(sent * 0.96);
        return { ...c, status: "live", sent, delivered, opened: Math.round(delivered * 0.42), clicked: Math.round(delivered * 0.08), converted: Math.round(delivered * 0.02), startAt: new Date().toISOString() };
      })
    );
    toast.success("Campaign launched");
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <Card className="shadow-card">
        <CardContent className="p-4 flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[220px]">
            <Label className="text-xs">Search</Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name or audience..." className="pl-8 h-9" />
            </div>
          </div>
          <FilterSelect label="Status" value={status} onChange={setStatus} options={[["all", "All"], ["draft", "Draft"], ["scheduled", "Scheduled"], ["live", "Live"], ["ended", "Ended"]]} />
          <FilterSelect label="Channel" value={channel} onChange={setChannel} options={[["all", "All"], ["push", "Push"], ["email", "Email"], ["sms", "SMS"], ["in_app", "In-app"]]} />
          <div className="text-xs text-muted-foreground ml-auto">{rows.length} campaigns</div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {rows.map((c) => {
          const Icon = channelIcon[c.channel];
          const ctr = c.delivered ? (c.clicked / c.delivered) * 100 : 0;
          const cvr = c.clicked ? (c.converted / c.clicked) * 100 : 0;
          const deliveryRate = c.sent ? (c.delivered / c.sent) * 100 : 0;
          const openRate = c.delivered ? (c.opened / c.delivered) * 100 : 0;
          const cpa = c.converted ? c.spentNgn / c.converted : 0;
          return (
            <Card key={c.id} className="shadow-card">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-display text-base font-bold truncate">{c.name}</div>
                      <div className="text-[11px] text-muted-foreground">{campaignChannelLabel[c.channel]} · {c.id}</div>
                    </div>
                  </div>
                  <Badge variant="outline" className={`text-[10px] capitalize shrink-0 ${campaignStatusTone[c.status]}`}>{c.status}</Badge>
                </div>

                <div className="text-xs space-y-1.5">
                  <Row k="Audience" v={<span>{c.audience}</span>} />
                  <Row k="Reach" v={<span className="font-mono">{c.audienceSize.toLocaleString()}</span>} />
                  <Row k="CTA" v={<span className="font-mono truncate inline-block max-w-[220px]">{c.ctaUrl}</span>} />
                  <Row k="Window" v={<span>{new Date(c.startAt).toLocaleDateString()}{c.endAt ? ` → ${new Date(c.endAt).toLocaleDateString()}` : " → ongoing"}</span>} />
                </div>

                <div className="grid grid-cols-4 gap-2 text-center">
                  <Metric label="Delivery" value={`${deliveryRate.toFixed(0)}%`} sub={`${c.delivered.toLocaleString()}`} />
                  <Metric label="Open" value={`${openRate.toFixed(0)}%`} sub={`${c.opened.toLocaleString()}`} />
                  <Metric label="CTR" value={`${ctr.toFixed(1)}%`} sub={`${c.clicked.toLocaleString()}`} tone="primary" />
                  <Metric label="CVR" value={`${cvr.toFixed(1)}%`} sub={`${c.converted.toLocaleString()}`} tone="success" />
                </div>

                <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-border">
                  <Metric label="Budget" value={fmtNgn(c.budgetNgn)} sub="cap" />
                  <Metric label="Spent" value={fmtNgn(c.spentNgn)} sub={c.budgetNgn ? `${Math.round((c.spentNgn / c.budgetNgn) * 100)}%` : "—"} />
                  <Metric label="CPA" value={cpa ? fmtNgn(Math.round(cpa)) : "—"} sub="cost / conv" tone="warning" />
                </div>

                <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-border">
                  {c.status === "draft" && (
                    <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5 text-success" onClick={() => launchDraft(c.id)}>
                      <Send className="h-3.5 w-3.5" /> Launch now
                    </Button>
                  )}
                  {c.status === "scheduled" && (
                    <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5 text-success" onClick={() => setStatusFor(c.id, "live", `${c.name} started`)}>
                      <Play className="h-3.5 w-3.5" /> Start
                    </Button>
                  )}
                  {c.status === "live" && (
                    <>
                      <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5 text-warning" onClick={() => setStatusFor(c.id, "scheduled", `${c.name} paused`)}>
                        <Pause className="h-3.5 w-3.5" /> Pause
                      </Button>
                      <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5 text-destructive" onClick={() => setStatusFor(c.id, "ended", `${c.name} ended`)}>
                        End
                      </Button>
                    </>
                  )}
                  {c.status === "ended" && (
                    <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => toast.success(`${c.name} duplicated as draft`)}>
                      Duplicate
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {rows.length === 0 && (
        <Card><CardContent className="p-10 text-center text-sm text-muted-foreground"><Megaphone className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />No campaigns match.</CardContent></Card>
      )}
    </motion.div>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-muted-foreground shrink-0">{k}</span>
      <div className="min-w-0 text-right">{v}</div>
    </div>
  );
}

function Metric({ label, value, sub, tone }: { label: string; value: string; sub: string; tone?: "primary" | "success" | "warning" }) {
  const t = tone === "primary" ? "text-primary" : tone === "success" ? "text-success" : tone === "warning" ? "text-warning" : "text-foreground";
  return (
    <div className="rounded-md border border-border p-2">
      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</div>
      <div className={`text-sm font-display font-bold ${t}`}>{value}</div>
      <div className="text-[10px] text-muted-foreground">{sub}</div>
    </div>
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
