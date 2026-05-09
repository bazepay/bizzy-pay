import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Search, Download, ArrowRight } from "lucide-react";
import { esimOrders, orderStatusTone, fmtNgn } from "@/lib/esim-data";
import { toast } from "sonner";

export const Route = createFileRoute("/_admin/esim/orders")({
  component: OrdersPage,
});

function OrdersPage() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [supplier, setSupplier] = useState<string>("all");
  const [visible, setVisible] = useState(40);

  const suppliers = useMemo(() => Array.from(new Set(esimOrders.map((o) => o.supplier))).sort(), []);

  const rows = useMemo(() => {
    return esimOrders
      .filter((o) => {
        if (status !== "all" && o.status !== status) return false;
        if (supplier !== "all" && o.supplier !== supplier) return false;
        if (q) {
          const s = q.toLowerCase();
          if (
            !o.id.toLowerCase().includes(s) &&
            !o.user.name.toLowerCase().includes(s) &&
            !o.user.email.toLowerCase().includes(s) &&
            !o.country.toLowerCase().includes(s) &&
            !(o.iccid?.toLowerCase().includes(s) ?? false)
          ) return false;
        }
        return true;
      })
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  }, [q, status, supplier]);

  const exportCsv = () => {
    const headers = ["order_id", "created_at", "user", "email", "country", "data_gb", "validity_days", "price_ngn", "supplier", "status", "iccid"];
    const lines = [headers.join(",")];
    for (const o of rows) {
      lines.push([o.id, o.createdAt, `"${o.user.name}"`, o.user.email, o.country, o.dataGb, o.validityDays, o.priceNgn, o.supplier, o.status, o.iccid ?? ""].join(","));
    }
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `esim-orders-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${rows.length} orders`);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <Card className="shadow-card">
        <CardContent className="p-4 flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[240px]">
            <Label className="text-xs">Search</Label>
            <div className="relative mt-1">
              <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Order id, user, email, ICCID, country…" className="pl-8" />
            </div>
          </div>
          <div className="w-[160px]">
            <Label className="text-xs">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="provisioning">Provisioning</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="activated">Activated</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-[160px]">
            <Label className="text-xs">Supplier</Label>
            <Select value={supplier} onValueChange={setSupplier}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All suppliers</SelectItem>
                {suppliers.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" size="sm" onClick={exportCsv}>
            <Download className="h-3.5 w-3.5 mr-1.5" /> Export CSV
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.slice(0, visible).map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-mono text-xs">{o.id}</TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">{o.user.name}</div>
                      <div className="text-[10px] text-muted-foreground">{o.user.email}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{o.flag}</span>
                        <div>
                          <div className="text-sm">{o.country}</div>
                          <div className="text-[10px] text-muted-foreground font-mono">{o.dataGb}GB · {o.validityDays}d</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{o.supplier}</TableCell>
                    <TableCell className="text-right font-mono">{fmtNgn(o.priceNgn)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[10px] capitalize ${orderStatusTone[o.status]}`}>{o.status}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{new Date(o.createdAt).toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <Link to="/esim/$id" params={{ id: o.id }}>
                        <Button size="sm" variant="ghost"><ArrowRight className="h-3.5 w-3.5" /></Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
                {rows.length === 0 && (
                  <TableRow><TableCell colSpan={8} className="text-center text-sm text-muted-foreground py-8">No orders match filters.</TableCell></TableRow>
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
