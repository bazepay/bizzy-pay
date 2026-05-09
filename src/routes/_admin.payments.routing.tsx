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
import { ArrowRight, GitBranch, Trash2, Plus } from "lucide-react";
import { routingRules as initial, providers, productLabel, fmtNgn, type RoutingRule, type ProviderId } from "@/lib/payments-data";
import { toast } from "sonner";

export const Route = createFileRoute("/_admin/payments/routing")({
  component: RoutingPage,
});

function RoutingPage() {
  const [items, setItems] = useState<RoutingRule[]>(initial);
  const [productFilter, setProductFilter] = useState("all");

  const rows = useMemo(() => {
    return items.filter((r) => productFilter === "all" || r.product === productFilter)
      .sort((a, b) => a.product.localeCompare(b.product) || b.weight - a.weight);
  }, [items, productFilter]);

  const grouped = useMemo(() => {
    const map = new Map<string, RoutingRule[]>();
    rows.forEach((r) => {
      const list = map.get(r.product) ?? [];
      list.push(r);
      map.set(r.product, list);
    });
    return [...map.entries()];
  }, [rows]);

  const updateRule = (id: string, patch: Partial<RoutingRule>) => {
    setItems((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };
  const toggleEnabled = (id: string) => {
    setItems((prev) => {
      const next = prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r));
      const t = next.find((r) => r.id === id);
      if (t) toast.success(`Rule ${t.id} ${t.enabled ? "enabled" : "disabled"}`);
      return next;
    });
  };
  const remove = (id: string) => {
    setItems((prev) => prev.filter((r) => r.id !== id));
    toast.success("Rule removed");
  };
  const addRule = () => {
    const id = `rt_${String(Math.floor(Math.random() * 9000) + 1000)}`;
    setItems((prev) => [...prev, {
      id, product: "wallet_topup", primary: "paystack", fallback: null,
      minNgn: 0, maxNgn: 1_000_000, enabled: true, weight: 100,
    }]);
    toast.success("Rule added — configure below");
  };

  const providerName = (id: ProviderId | null) => providers.find((p) => p.id === id)?.name ?? "—";

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <Card className="shadow-card">
        <CardContent className="p-4 flex flex-wrap gap-3 items-end">
          <div>
            <Label className="text-xs">Product</Label>
            <Select value={productFilter} onValueChange={setProductFilter}>
              <SelectTrigger className="h-9 w-[200px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All products</SelectItem>
                {Object.entries(productLabel).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="text-xs text-muted-foreground">{rows.length} rules · {items.filter((r) => r.enabled).length} active</div>
          <Button size="sm" className="h-9 gap-1.5 ml-auto" onClick={addRule}>
            <Plus className="h-3.5 w-3.5" /> New rule
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {grouped.map(([product, rules]) => {
          const totalWeight = rules.filter((r) => r.enabled).reduce((s, r) => s + r.weight, 0);
          return (
            <Card key={product} className="shadow-card overflow-hidden">
              <CardContent className="p-0">
                <div className="px-5 py-3 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GitBranch className="h-4 w-4 text-primary" />
                    <div>
                      <div className="font-display text-sm font-bold">{productLabel[product as RoutingRule["product"]]}</div>
                      <div className="text-[11px] text-muted-foreground">{rules.length} rules · weight sum {totalWeight}{totalWeight !== 100 && totalWeight !== 0 ? " (should be 100)" : ""}</div>
                    </div>
                  </div>
                  {totalWeight !== 100 && totalWeight !== 0 && (
                    <Badge variant="outline" className="text-[10px] bg-warning/15 text-warning border-warning/30">Weights ≠ 100%</Badge>
                  )}
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Primary</TableHead>
                      <TableHead>Fallback</TableHead>
                      <TableHead className="text-right">Min</TableHead>
                      <TableHead className="text-right">Max</TableHead>
                      <TableHead className="text-right">Weight</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead>Enabled</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rules.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell>
                          <Select value={r.primary} onValueChange={(v) => updateRule(r.id, { primary: v as ProviderId })}>
                            <SelectTrigger className="h-8 w-[160px] text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {providers.map((p) => <SelectItem key={p.id} value={p.id} className="text-xs">{p.name}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          <div className="text-[10px] text-muted-foreground mt-1">{r.id}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <ArrowRight className="h-3 w-3 text-muted-foreground" />
                            <Select value={r.fallback ?? "none"} onValueChange={(v) => updateRule(r.id, { fallback: v === "none" ? null : (v as ProviderId) })}>
                              <SelectTrigger className="h-8 w-[150px] text-xs"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none" className="text-xs">— none —</SelectItem>
                                {providers.map((p) => <SelectItem key={p.id} value={p.id} className="text-xs">{p.name}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Input type="number" value={r.minNgn} onChange={(e) => updateRule(r.id, { minNgn: Math.max(0, Number(e.target.value)) })} className="h-8 w-[110px] text-xs text-right ml-auto font-mono" />
                          <div className="text-[10px] text-muted-foreground mt-0.5">{fmtNgn(r.minNgn)}</div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Input type="number" value={r.maxNgn} onChange={(e) => updateRule(r.id, { maxNgn: Math.max(r.minNgn, Number(e.target.value)) })} className="h-8 w-[120px] text-xs text-right ml-auto font-mono" />
                          <div className="text-[10px] text-muted-foreground mt-0.5">{fmtNgn(r.maxNgn)}</div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Input type="number" min={0} max={100} value={r.weight} onChange={(e) => updateRule(r.id, { weight: Math.max(0, Math.min(100, Number(e.target.value))) })} className="h-8 w-[80px] text-xs text-right ml-auto font-mono" />
                          <div className="text-[10px] text-muted-foreground mt-0.5">%</div>
                        </TableCell>
                        <TableCell className="max-w-[220px]">
                          <Input value={r.notes ?? ""} onChange={(e) => updateRule(r.id, { notes: e.target.value })} placeholder="Optional note" className="h-8 text-xs" />
                        </TableCell>
                        <TableCell><Switch checked={r.enabled} onCheckedChange={() => toggleEnabled(r.id)} /></TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="ghost" className="h-7 px-2 text-destructive" onClick={() => remove(r.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          );
        })}
        {grouped.length === 0 && (
          <Card><CardContent className="p-10 text-center text-sm text-muted-foreground">No routing rules.</CardContent></Card>
        )}
      </div>

      {/* Suppress unused warning */}
      {false && providerName("paystack")}
    </motion.div>
  );
}
