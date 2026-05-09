import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Search, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { flags as seed, fmtRelative, type FeatureFlag, type FlagEnv } from "@/lib/settings-data";

export const Route = createFileRoute("/_admin/settings/feature-flags")({
  component: FeatureFlagsPage,
});

const ENVS: FlagEnv[] = ["sandbox", "staging", "prod"];

const ENV_TONE: Record<FlagEnv, string> = {
  sandbox: "border-muted-foreground/30 text-muted-foreground",
  staging: "border-warning/40 text-warning",
  prod: "border-destructive/40 text-destructive",
};

function FeatureFlagsPage() {
  const [items, setItems] = useState<FeatureFlag[]>(seed);
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return items;
    return items.filter((f) => f.key.toLowerCase().includes(term) || f.name.toLowerCase().includes(term));
  }, [items, q]);

  const toggle = (key: string, env: FlagEnv) => {
    setItems((prev) => prev.map((f) => {
      if (f.key !== key) return f;
      const nextVal = !f.values[env];
      return {
        ...f,
        values: { ...f.values, [env]: nextVal },
        rolloutPct: { ...f.rolloutPct, [env]: nextVal ? Math.max(f.rolloutPct[env], 1) : 0 },
        updatedAt: new Date().toISOString(),
      };
    }));
    toast.success(`${env} updated`);
  };

  const setRollout = (key: string, env: FlagEnv, pct: number) => {
    setItems((prev) => prev.map((f) => (f.key === key
      ? { ...f, rolloutPct: { ...f.rolloutPct, [env]: pct }, values: { ...f.values, [env]: pct > 0 }, updatedAt: new Date().toISOString() }
      : f)));
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="rounded-md border border-warning/40 bg-warning/10 px-3 py-2 flex items-center gap-2 text-xs text-warning-foreground">
        <AlertTriangle className="h-3.5 w-3.5 text-warning shrink-0" />
        <span>Production toggles are logged to the audit trail. <span className="font-semibold">USD wallet</span> is permanently disabled — wallets are NGN-only.</span>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by key or name…" className="pl-8" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {rows.map((f) => {
          const locked = f.key === "wallet.usd.enable";
          return (
            <Card key={f.key} className="shadow-card">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-display font-bold flex items-center gap-2 flex-wrap">
                      {f.name}
                      {locked && <Badge variant="outline" className="text-[10px] border-destructive/40 text-destructive">locked</Badge>}
                    </div>
                    <div className="text-[11px] text-muted-foreground font-mono">{f.key}</div>
                    <div className="text-xs text-muted-foreground mt-1">{f.description}</div>
                  </div>
                  <div className="text-[11px] text-muted-foreground text-right shrink-0">
                    <div>Owner: {f.owner}</div>
                    <div>{fmtRelative(f.updatedAt)}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                  {ENVS.map((env) => (
                    <div key={env} className="rounded-md border border-border p-2.5">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className={`text-[10px] uppercase ${ENV_TONE[env]}`}>{env}</Badge>
                        <Switch
                          checked={f.values[env]}
                          onCheckedChange={() => !locked && toggle(f.key, env)}
                          disabled={locked}
                        />
                      </div>
                      <div className="text-[11px] text-muted-foreground mb-1">Rollout · <span className="font-mono text-foreground">{f.rolloutPct[env]}%</span></div>
                      <Slider
                        value={[f.rolloutPct[env]]}
                        onValueChange={(v) => !locked && setRollout(f.key, env, v[0])}
                        min={0} max={100} step={5}
                        disabled={locked}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
        {rows.length === 0 && (
          <div className="text-center text-sm text-muted-foreground py-10">No flags match your search.</div>
        )}
      </div>
    </motion.div>
  );
}
