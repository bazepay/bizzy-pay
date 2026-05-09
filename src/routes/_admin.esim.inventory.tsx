import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { RefreshCcw, AlertTriangle } from "lucide-react";
import { esimInventory, esimSuppliers, supplierHealthTone, type EsimInventoryItem } from "@/lib/esim-data";
import { fmtNum } from "@/lib/mock-data";
import { toast } from "sonner";

export const Route = createFileRoute("/_admin/esim/inventory")({
  component: InventoryPage,
});

function InventoryPage() {
  const [items, setItems] = useState<EsimInventoryItem[]>(esimInventory);
  const [syncing, setSyncing] = useState<string | null>(null);

  const sync = (supplier: string) => {
    setSyncing(supplier);
    setTimeout(() => {
      setItems((prev) => prev.map((i) => i.supplier === supplier ? { ...i, iccidsAvailable: Math.min(i.iccidsTotal, i.iccidsAvailable + Math.floor(Math.random() * 60)) } : i));
      setSyncing(null);
      toast.success(`${supplier} inventory synced`);
    }, 800);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {esimSuppliers.map((s) => (
          <Card key={s.id} className="shadow-card">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-display text-base font-bold">{s.name}</div>
                  <div className="text-[10px] text-muted-foreground">Latency {s.latencyMs}ms · {fmtNum(s.countriesCovered)} countries</div>
                </div>
                <Badge variant="outline" className={`text-[10px] capitalize ${supplierHealthTone[s.health]}`}>{s.health}</Badge>
              </div>
              <Button size="sm" variant="outline" className="w-full" disabled={syncing === s.name} onClick={() => sync(s.name)}>
                <RefreshCcw className={`h-3.5 w-3.5 mr-1.5 ${syncing === s.name ? "animate-spin" : ""}`} />
                {syncing === s.name ? "Syncing…" : "Sync now"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="shadow-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">ICCID inventory</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Country</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead className="text-right">Available</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="w-[220px]">Stock level</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((i) => {
                  const pct = (i.iccidsAvailable / i.iccidsTotal) * 100;
                  const low = i.iccidsAvailable <= i.threshold;
                  return (
                    <TableRow key={i.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{i.flag}</span>
                          <div className="text-sm font-medium">{i.country}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{i.supplier}</TableCell>
                      <TableCell className={`text-right font-mono ${low ? "text-warning font-semibold" : ""}`}>{fmtNum(i.iccidsAvailable)}</TableCell>
                      <TableCell className="text-right font-mono text-muted-foreground">{fmtNum(i.iccidsTotal)}</TableCell>
                      <TableCell>
                        <Progress value={pct} className={low ? "[&>div]:bg-warning" : ""} />
                        <div className="text-[10px] text-muted-foreground mt-1">Threshold {i.threshold}</div>
                      </TableCell>
                      <TableCell>
                        {low ? (
                          <Badge variant="outline" className="text-[10px] bg-warning/15 text-warning border-warning/30">
                            <AlertTriangle className="h-3 w-3 mr-1" /> Low stock
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] bg-success/15 text-success border-success/30">Healthy</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
