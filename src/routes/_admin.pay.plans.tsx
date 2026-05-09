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
import { Switch } from "@/components/ui/switch";
import { Search, Plus, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { billPlans as initial, billers, fmtNgn, type BillPlan } from "@/lib/pay-data";
import { toast } from "sonner";

export const Route = createFileRoute("/_admin/pay/plans")({
  component: PlansPage,
});

const planCategories = ["data", "tv", "internet"] as const;

function PlansPage() {
  const [items, setItems] = useState<BillPlan[]>(initial);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [billerId, setBillerId] = useState<string>("all");
  const [open, setOpen] = useState(false);

  const planBillers = useMemo(() => billers.filter((b) => (planCategories as readonly string[]).includes(b.category)), []);

  const rows = useMemo(() => {
    return items.filter((p) => {
      if (category !== "all" && p.category !== category) return false;
      if (billerId !== "all" && p.billerId !== billerId) return false;
      if (q) {
        const s = q.toLowerCase();
        if (!p.name.toLowerCase().includes(s) && !p.billerName.toLowerCase().includes(s)) return false;
      }
      return true;
    }).sort((a, b) => a.billerName.localeCompare(b.billerName) || a.sortOrder - b.sortOrder);
  }, [items, q, category, billerId]);

  const toggleVisible = (id: string) => {
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, visible: !p.visible } : p)));
  };

  const updatePrice = (id: string, price: number) => {
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, priceNgn: Math.max(0, price) } : p)));
  };

  const remove = (id: string) => {
    setItems((prev) => prev.filter((p) => p.id !== id));
    toast.success("Plan removed");
  };

  const addPlan = (data: Omit<BillPlan, "id" | "billerName">) => {
    const biller = billers.find((b) => b.id === data.billerId);
    if (!biller) return;
    const id = `bpl_${Date.now().toString().slice(-6)}`;
    setItems((prev) => [{ ...data, id, billerName: biller.name }, ...prev]);
    toast.success("Plan created");
    setOpen(false);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <Card className="shadow-card">
        <CardContent className="p-4 flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[220px]">
            <Label className="text-xs">Search</Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Plan or biller..." className="pl-8 h-9" />
            </div>
          </div>
          <div>
            <Label className="text-xs">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="h-9 w-[140px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {planCategories.map((c) => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Biller</Label>
            <Select value={billerId} onValueChange={setBillerId}>
              <SelectTrigger className="h-9 w-[200px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {planBillers.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <span className="text-xs text-muted-foreground">{rows.length} plans</span>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1.5 h-9"><Plus className="h-3.5 w-3.5" />New plan</Button>
              </DialogTrigger>
              <NewPlanDialog billers={planBillers} onSubmit={addPlan} />
            </Dialog>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Plan</TableHead>
              <TableHead>Biller</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Validity</TableHead>
              <TableHead className="text-right">Cost</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Margin</TableHead>
              <TableHead>Visible</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((p) => {
              const margin = p.priceNgn - p.costNgn;
              const marginPct = p.priceNgn ? (margin / p.priceNgn) * 100 : 0;
              return (
                <TableRow key={p.id}>
                  <TableCell><div className="text-sm font-medium">{p.name}</div></TableCell>
                  <TableCell className="text-sm">{p.billerName}</TableCell>
                  <TableCell><Badge variant="outline" className="text-[10px] capitalize">{p.category}</Badge></TableCell>
                  <TableCell className="text-right text-sm font-mono">{p.validityDays}d</TableCell>
                  <TableCell className="text-right text-sm font-mono text-muted-foreground">{fmtNgn(p.costNgn)}</TableCell>
                  <TableCell className="text-right">
                    <Input type="number" value={p.priceNgn} onChange={(e) => updatePrice(p.id, Number(e.target.value))} className="h-8 w-[110px] text-xs text-right ml-auto font-mono" />
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={`text-sm font-mono ${margin >= 0 ? "text-success" : "text-destructive"}`}>{fmtNgn(margin)}</span>
                    <div className="text-[10px] text-muted-foreground">{marginPct.toFixed(1)}%</div>
                  </TableCell>
                  <TableCell><Switch checked={p.visible} onCheckedChange={() => toggleVisible(p.id)} /></TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="ghost" className="h-7 px-2 text-destructive" onClick={() => remove(p.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </motion.div>
  );
}

function NewPlanDialog({ billers, onSubmit }: { billers: typeof import("@/lib/pay-data").billers; onSubmit: (p: Omit<BillPlan, "id" | "billerName">) => void }) {
  const [billerId, setBillerId] = useState(billers[0]?.id ?? "");
  const [name, setName] = useState("");
  const [validity, setValidity] = useState(30);
  const [price, setPrice] = useState(1000);
  const [cost, setCost] = useState(950);

  const submit = () => {
    const biller = billers.find((b) => b.id === billerId);
    if (!biller || !name.trim()) {
      toast.error("Biller and name are required");
      return;
    }
    onSubmit({
      billerId,
      category: biller.category as BillPlan["category"],
      name: name.trim(),
      validityDays: validity,
      priceNgn: price,
      costNgn: cost,
      visible: true,
      sortOrder: 99,
    });
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>New plan</DialogTitle>
      </DialogHeader>
      <div className="space-y-3">
        <div>
          <Label className="text-xs">Biller</Label>
          <Select value={billerId} onValueChange={setBillerId}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {billers.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">Plan name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. 10GB Monthly" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label className="text-xs">Validity (days)</Label>
            <Input type="number" value={validity} onChange={(e) => setValidity(Number(e.target.value))} />
          </div>
          <div>
            <Label className="text-xs">Cost (NGN)</Label>
            <Input type="number" value={cost} onChange={(e) => setCost(Number(e.target.value))} />
          </div>
          <div>
            <Label className="text-xs">Price (NGN)</Label>
            <Input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} />
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button onClick={submit}>Create plan</Button>
      </DialogFooter>
    </DialogContent>
  );
}
