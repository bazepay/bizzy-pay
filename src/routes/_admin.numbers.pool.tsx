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
import { Search, Plus, ShieldOff, Trash2, RefreshCw } from "lucide-react";
import { numberPool, numberStatusTone, fmtNgn, type PoolNumber, type NumberStatus } from "@/lib/numbers-data";
import { toast } from "sonner";

export const Route = createFileRoute("/_admin/numbers/pool")({
  component: PoolPage,
});

function PoolPage() {
  const [items, setItems] = useState<PoolNumber[]>(numberPool);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [supplier, setSupplier] = useState<string>("all");
  const [country, setCountry] = useState<string>("all");
  const [visible, setVisible] = useState(40);

  const suppliers = useMemo(() => Array.from(new Set(items.map((n) => n.supplier))).sort(), [items]);
  const countries = useMemo(() => Array.from(new Set(items.map((n) => n.country))).sort(), [items]);

  const rows = useMemo(() => {
    return items.filter((n) => {
      if (status !== "all" && n.status !== status) return false;
      if (supplier !== "all" && n.supplier !== supplier) return false;
      if (country !== "all" && n.country !== country) return false;
      if (q) {
        const s = q.toLowerCase();
        if (!n.number.toLowerCase().includes(s) && !n.country.toLowerCase().includes(s) && !n.areaCode.includes(s)) return false;
      }
      return true;
    });
  }, [items, q, status, supplier, country]);

  const setOne = (id: string, patch: Partial<PoolNumber>) =>
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, ...patch } : n)));

  const release = (n: PoolNumber) => {
    setOne(n.id, { status: "released" });
    toast.success(`${n.number} released back to supplier.`);
  };
  const quarantine = (n: PoolNumber) => {
    setOne(n.id, { status: "quarantined" });
    toast.success(`${n.number} quarantined.`);
  };
  const restore = (n: PoolNumber) => {
    setOne(n.id, { status: "available" });
    toast.success(`${n.number} restored to available.`);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <Card className="shadow-card">
        <CardContent className="p-4 flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[240px]">
            <Label className="text-xs">Search</Label>
            <div className="relative mt-1">
              <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Number, country, area code…" className="pl-8" />
            </div>
          </div>
          <div className="w-[150px]">
            <Label className="text-xs">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="leased">Leased</SelectItem>
                <SelectItem value="quarantined">Quarantined</SelectItem>
                <SelectItem value="released">Released</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-[150px]">
            <Label className="text-xs">Supplier</Label>
            <Select value={supplier} onValueChange={setSupplier}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {suppliers.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="w-[170px]">
            <Label className="text-xs">Country</Label>
            <Select value={country} onValueChange={setCountry}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {countries.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Button size="sm" onClick={() => toast.success("Provisioning new numbers from supplier…")}>
            <Plus className="h-3.5 w-3.5 mr-1.5" /> Provision
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Number</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead className="text-right">Cost</TableHead>
                  <TableHead className="text-right">Retail</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.slice(0, visible).map((n) => (
                  <TableRow key={n.id}>
                    <TableCell className="font-mono text-xs">{n.number}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <img src={`https://flagcdn.com/w40/${n.countryCode}.png`} alt={n.country} className="h-4 w-6 rounded-sm object-cover" loading="lazy" />
                        <div>
                          <div className="text-sm">{n.country}</div>
                          <div className="text-[10px] text-muted-foreground font-mono">area {n.areaCode}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{n.supplier}</TableCell>
                    <TableCell className="text-sm">{n.service}</TableCell>
                    <TableCell className="text-right font-mono text-xs text-muted-foreground">{fmtNgn(n.costNgn)}</TableCell>
                    <TableCell className="text-right font-mono">{fmtNgn(n.priceNgn)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[10px] capitalize ${numberStatusTone[n.status as NumberStatus]}`}>{n.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {n.status === "available" && (
                          <Button size="sm" variant="ghost" onClick={() => quarantine(n)} title="Quarantine">
                            <ShieldOff className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        {n.status === "quarantined" && (
                          <Button size="sm" variant="ghost" onClick={() => restore(n)} title="Restore">
                            <RefreshCw className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        {n.status !== "released" && n.status !== "leased" && (
                          <Button size="sm" variant="ghost" onClick={() => release(n)} title="Release">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {rows.length === 0 && (
                  <TableRow><TableCell colSpan={8} className="text-center text-sm text-muted-foreground py-8">No numbers match filters.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="px-4 py-2.5 text-xs text-muted-foreground border-t flex items-center justify-between">
            <span>Showing {Math.min(visible, rows.length)} of {rows.length}</span>
            {visible < rows.length && (
              <Button size="sm" variant="outline" onClick={() => setVisible((v) => v + 40)}>Load more</Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
