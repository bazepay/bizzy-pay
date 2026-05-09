import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, RefreshCw, Power, PowerOff, Beaker, Globe, Copy, Webhook } from "lucide-react";
import { providers as initial, providerStatusTone, providerKindLabel, fmtNgn, type Provider, type ProviderStatus } from "@/lib/payments-data";
import { toast } from "sonner";

export const Route = createFileRoute("/_admin/payments/providers")({
  component: ProvidersPage,
});

function ProvidersPage() {
  const [items, setItems] = useState<Provider[]>(initial);
  const [q, setQ] = useState("");
  const [kind, setKind] = useState("all");
  const [status, setStatus] = useState("all");
  const [env, setEnv] = useState("all");

  const rows = useMemo(() => {
    return items.filter((p) => {
      if (kind !== "all" && p.kind !== kind) return false;
      if (status !== "all" && p.status !== status) return false;
      if (env !== "all" && p.env !== env) return false;
      if (q) {
        const s = q.toLowerCase();
        if (!p.name.toLowerCase().includes(s) && !p.id.toLowerCase().includes(s) && !p.supports.join(" ").toLowerCase().includes(s)) return false;
      }
      return true;
    });
  }, [items, q, kind, status, env]);

  const updateStatus = (id: string, s: ProviderStatus, msg: string) => {
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, status: s } : p)));
    toast.success(msg);
  };
  const updateEnv = (id: string, e: Provider["env"]) => {
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, env: e, status: e === "sandbox" ? "sandbox" : p.status === "sandbox" ? "live" : p.status } : p)));
    toast.success(`Switched to ${e}`);
  };
  const ping = (id: string) => {
    const name = items.find((p) => p.id === id)?.name ?? "Provider";
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, lastCallback: new Date().toISOString() } : p)));
    toast.success(`${name} ping OK`);
  };
  const copy = async (text: string, label: string) => {
    try { await navigator.clipboard.writeText(text); toast.success(`${label} copied`); } catch { toast.error("Copy failed"); }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <Card className="shadow-card">
        <CardContent className="p-4 flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[220px]">
            <Label className="text-xs">Search</Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name, capability..." className="pl-8 h-9" />
            </div>
          </div>
          <FilterSelect label="Kind" value={kind} onChange={setKind} options={[["all", "All"], ["card_acquirer", "Card acquirer"], ["bank_transfer", "Bank transfer"], ["ussd", "USSD"], ["biller_aggregator", "Biller aggregator"], ["fx_inbound", "FX inbound"]]} />
          <FilterSelect label="Status" value={status} onChange={setStatus} options={[["all", "All"], ["live", "Live"], ["degraded", "Degraded"], ["down", "Down"], ["sandbox", "Sandbox"], ["disabled", "Disabled"]]} />
          <FilterSelect label="Environment" value={env} onChange={setEnv} options={[["all", "All"], ["production", "Production"], ["sandbox", "Sandbox"]]} />
          <div className="text-xs text-muted-foreground ml-auto">{rows.length} providers</div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {rows.map((p) => (
          <Card key={p.id} className="shadow-card">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-12 w-12 rounded-lg flex items-center justify-center text-2xl shrink-0" style={{ backgroundColor: `${p.color}22`, color: p.color }}>{p.logo}</div>
                  <div className="min-w-0">
                    <div className="font-display text-lg font-bold truncate">{p.name}</div>
                    <div className="text-xs text-muted-foreground">{providerKindLabel[p.kind]} · {p.id}</div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <Badge variant="outline" className={`text-[10px] capitalize ${providerStatusTone[p.status]}`}>{p.status}</Badge>
                  <Badge variant="outline" className="text-[10px] capitalize">{p.env}</Badge>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3 text-center">
                <Stat label="Success" value={`${p.successRate.toFixed(1)}%`} tone={p.successRate < 95 ? "warning" : "success"} />
                <Stat label="Auth" value={`${p.authRate.toFixed(1)}%`} />
                <Stat label="Latency" value={`${p.latencyMs}ms`} tone={p.latencyMs > 1000 ? "warning" : undefined} />
                <Stat label="Volume 24h" value={fmtNgn(p.volumeNgn24h)} />
              </div>

              <div className="text-xs space-y-2">
                <Row k="Endpoint" v={<span className="font-mono inline-flex items-center gap-1.5"><Globe className="h-3 w-3" />{p.baseUrl}</span>} />
                <Row k="Fees" v={<span className="font-mono">{(p.feeBps / 100).toFixed(2)}%{p.feeCapNgn ? ` · cap ${fmtNgn(p.feeCapNgn)}` : ""}{p.flatFeeNgn ? ` · +${fmtNgn(p.flatFeeNgn)}` : ""}</span>} />
                <Row k="Supports" v={
                  <div className="flex flex-wrap gap-1 justify-end">
                    {p.supports.map((s) => <Badge key={s} variant="outline" className="text-[10px]">{s}</Badge>)}
                  </div>
                } />
                <Row k="Webhook" v={
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Webhook className="h-3 w-3 text-muted-foreground" />
                    <span className="font-mono truncate">{p.webhookUrl}</span>
                    <button onClick={() => copy(p.webhookUrl, "Webhook URL")} className="text-muted-foreground hover:text-foreground"><Copy className="h-3 w-3" /></button>
                  </div>
                } />
                <Row k="Secret" v={<span className="font-mono">{p.webhookSecretHint}</span>} />
                <Row k="Last callback" v={<span>{new Date(p.lastCallback).toLocaleString()}</span>} />
              </div>

              <div className="flex items-center justify-between gap-2 pt-2 border-t border-border">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-muted-foreground">Sandbox</span>
                  <Switch checked={p.env === "sandbox"} onCheckedChange={(v) => updateEnv(p.id, v ? "sandbox" : "production")} />
                </div>
                <div className="flex items-center gap-1.5">
                  <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5" onClick={() => ping(p.id)}>
                    <RefreshCw className="h-3.5 w-3.5" /> Ping
                  </Button>
                  <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5" onClick={() => updateStatus(p.id, "sandbox", `${p.name} switched to sandbox`)}>
                    <Beaker className="h-3.5 w-3.5" /> Test
                  </Button>
                  {p.status === "disabled" ? (
                    <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5 text-success" onClick={() => updateStatus(p.id, "live", `${p.name} enabled`)}>
                      <Power className="h-3.5 w-3.5" /> Enable
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5 text-destructive" onClick={() => updateStatus(p.id, "disabled", `${p.name} disabled`)}>
                      <PowerOff className="h-3.5 w-3.5" /> Disable
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {rows.length === 0 && (
        <Card><CardContent className="p-10 text-center text-sm text-muted-foreground">No providers match.</CardContent></Card>
      )}
    </motion.div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "success" | "warning" | "danger" }) {
  const t = tone === "success" ? "text-success" : tone === "warning" ? "text-warning" : tone === "danger" ? "text-destructive" : "text-foreground";
  return (
    <div className="rounded-md border border-border p-2">
      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</div>
      <div className={`text-sm font-display font-bold ${t}`}>{value}</div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-muted-foreground shrink-0">{k}</span>
      <div className="min-w-0 text-right max-w-[65%]">{v}</div>
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
