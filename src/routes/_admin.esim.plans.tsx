import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Pencil, Plus, Search } from "lucide-react";
import { esimPlans, planStatusTone, fmtNgn, type EsimPlan, type EsimPlanStatus } from "@/lib/esim-data";
import { toast } from "sonner";

export const Route = createFileRoute("/_admin/esim/plans")({
  component: PlansPage,
});

function PlansPage() {
  const [items, setItems] = useState<EsimPlan[]>(esimPlans);
  const [q, setQ] = useState("");
  const [country, setCountry] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");

  const countries = useMemo(() => Array.from(new Set(items.map((p) => p.country))).sort(), [items]);

  const filtered = useMemo(() => {
    return items.filter((p) => {
      if (country !== "all" && p.country !== country) return false;
      if (status !== "all" && p.status !== status) return false;
      if (q) {
        const s = q.toLowerCase();
        if (!p.country.toLowerCase().includes(s) && !p.supplier.toLowerCase().includes(s) && !p.id.toLowerCase().includes(s)) return false;
      }
      return true;
    });
  }, [items, q, country, status]);

  const update = (id: string, patch: Partial<EsimPlan>) => {
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <Card className="shadow-card">
        <CardContent className="p-4 flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[220px]">
            <Label className="text-xs">Search</Label>
            <div className="relative mt-1">
              <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Country, supplier, plan id…" className="pl-8" />
            </div>
          </div>
          <div className="w-[160px]">
            <Label className="text-xs">Country</Label>
            <Select value={country} onValueChange={setCountry}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All countries</SelectItem>
                {countries.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="w-[140px]">
            <Label className="text-xs">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="live">Live</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="hidden">Hidden</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <NewPlanDialog onCreate={(plan) => { setItems((prev) => [plan, ...prev]); toast.success("Plan created"); }} />
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Country</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Validity</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Cost</TableHead>
                  <TableHead className="text-right">Margin</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((p) => {
                  const margin = p.priceNgn > 0 ? ((p.priceNgn - p.costNgn) / p.priceNgn) * 100 : 0;
                  return (
                    <TableRow key={p.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{p.flag}</span>
                          <div>
                            <div className="text-sm font-medium">{p.country}</div>
                            <div className="text-[10px] text-muted-foreground font-mono">{p.id}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{p.dataGb} GB</TableCell>
                      <TableCell className="font-mono text-sm">{p.validityDays} d</TableCell>
                      <TableCell className="text-right font-mono">{fmtNgn(p.priceNgn)}</TableCell>
                      <TableCell className="text-right font-mono text-muted-foreground">{fmtNgn(p.costNgn)}</TableCell>
                      <TableCell className={`text-right font-mono ${margin < 20 ? "text-warning" : "text-success"}`}>{margin.toFixed(0)}%</TableCell>
                      <TableCell className="text-sm">{p.supplier}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-xs capitalize ${planStatusTone[p.status]}`}>{p.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <EditPlanDialog plan={p} onSave={(patch) => { update(p.id, patch); toast.success("Plan updated"); }} />
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filtered.length === 0 && (
                  <TableRow><TableCell colSpan={9} className="text-center text-sm text-muted-foreground py-8">No plans match filters.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="px-4 py-2.5 text-xs text-muted-foreground border-t">
            Showing {filtered.length} of {items.length} plans
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function EditPlanDialog({ plan, onSave }: { plan: EsimPlan; onSave: (patch: Partial<EsimPlan>) => void }) {
  const [open, setOpen] = useState(false);
  const [price, setPrice] = useState(String(plan.priceNgn));
  const [cost, setCost] = useState(String(plan.costNgn));
  const [status, setStatus] = useState<EsimPlanStatus>(plan.status);

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (o) { setPrice(String(plan.priceNgn)); setCost(String(plan.costNgn)); setStatus(plan.status); } }}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost"><Pencil className="h-3.5 w-3.5" /></Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{plan.flag} {plan.country} · {plan.dataGb}GB / {plan.validityDays}d</DialogTitle>
          <DialogDescription>Adjust pricing and visibility. Changes log to audit trail.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Retail price (NGN)</Label>
            <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
          </div>
          <div>
            <Label>Supplier cost (NGN)</Label>
            <Input type="number" value={cost} onChange={(e) => setCost(e.target.value)} />
          </div>
          <div>
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as EsimPlanStatus)}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="live">Live</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="hidden">Hidden</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={() => {
            const pn = Number(price), cn = Number(cost);
            if (Number.isNaN(pn) || Number.isNaN(cn) || pn <= 0 || cn < 0) { toast.error("Enter valid amounts"); return; }
            if (cn > pn) { toast.error("Cost cannot exceed price"); return; }
            onSave({ priceNgn: pn, costNgn: cn, status });
            setOpen(false);
          }}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function NewPlanDialog({ onCreate }: { onCreate: (p: EsimPlan) => void }) {
  const [open, setOpen] = useState(false);
  const [country, setCountry] = useState("Nigeria");
  const [flag, setFlag] = useState("🇳🇬");
  const [code, setCode] = useState("NG");
  const [gb, setGb] = useState("1");
  const [days, setDays] = useState("7");
  const [price, setPrice] = useState("");
  const [cost, setCost] = useState("");
  const [supplier, setSupplier] = useState("Airalo");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="ml-auto"><Plus className="h-3.5 w-3.5 mr-1.5" /> New plan</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New eSIM plan</DialogTitle>
          <DialogDescription>Pricing in Naira (NGN).</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <Label>Country</Label>
            <Input value={country} onChange={(e) => setCountry(e.target.value)} />
          </div>
          <div>
            <Label>ISO code</Label>
            <Input value={code} onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 2))} />
          </div>
          <div>
            <Label>Flag emoji</Label>
            <Input value={flag} onChange={(e) => setFlag(e.target.value)} />
          </div>
          <div>
            <Label>Data (GB)</Label>
            <Input type="number" value={gb} onChange={(e) => setGb(e.target.value)} />
          </div>
          <div>
            <Label>Validity (days)</Label>
            <Input type="number" value={days} onChange={(e) => setDays(e.target.value)} />
          </div>
          <div>
            <Label>Price (NGN)</Label>
            <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
          </div>
          <div>
            <Label>Cost (NGN)</Label>
            <Input type="number" value={cost} onChange={(e) => setCost(e.target.value)} />
          </div>
          <div className="col-span-2">
            <Label>Supplier</Label>
            <Select value={supplier} onValueChange={setSupplier}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Airalo">Airalo</SelectItem>
                <SelectItem value="eSIM Access">eSIM Access</SelectItem>
                <SelectItem value="Bytesim">Bytesim</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={() => {
            const pn = Number(price), cn = Number(cost), gn = Number(gb), dn = Number(days);
            if (!country.trim() || code.length !== 2) { toast.error("Country and 2-letter ISO code required"); return; }
            if ([pn, cn, gn, dn].some((x) => Number.isNaN(x) || x <= 0)) { toast.error("Enter valid numeric values"); return; }
            if (cn > pn) { toast.error("Cost cannot exceed price"); return; }
            onCreate({
              id: `pln_${code.toLowerCase()}_${gn}gb_${dn}d_${Date.now().toString(36)}`,
              countryCode: code,
              country,
              flag: flag || "🌐",
              dataGb: gn,
              validityDays: dn,
              priceNgn: pn,
              costNgn: cn,
              supplier,
              status: "draft",
              sortOrder: 9999,
            });
            setOpen(false);
            setPrice(""); setCost("");
          }}>Create plan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
