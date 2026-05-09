import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Download, ArrowRight } from "lucide-react";
import { leases, leaseStatusTone, fmtNgn } from "@/lib/numbers-data";
import { toast } from "sonner";

export const Route = createFileRoute("/_admin/numbers/leases")({
  component: LeasesPage,
});

function LeasesPage() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [autoRenew, setAutoRenew] = useState<string>("all");
  const [visible, setVisible] = useState(40);

  const rows = useMemo(() => {
    return leases
      .filter((l) => {
        if (status !== "all" && l.status !== status) return false;
        if (autoRenew !== "all" && String(l.autoRenew) !== autoRenew) return false;
        if (q) {
          const s = q.toLowerCase();
          if (!l.number.toLowerCase().includes(s) && !l.user.name.toLowerCase().includes(s) && !l.user.email.toLowerCase().includes(s) && !l.country.toLowerCase().includes(s)) return false;
        }
        return true;
      })
      .sort((a, b) => +new Date(a.renewsOn) - +new Date(b.renewsOn));
  }, [q, status, autoRenew]);

  const exportCsv = () => {
    const headers = ["lease_id", "number", "country", "service", "supplier", "billing", "user", "email", "started_at", "renews_on", "auto_renew", "sms_30d", "price_ngn", "status"];
    const lines = [headers.join(",")];
    for (const l of rows) {
      lines.push([l.id, l.number, l.country, l.service, l.supplier, l.billingPeriod, `"${l.user.name}"`, l.user.email, l.startedAt, l.renewsOn, l.autoRenew, l.smsCount30d, l.priceNgn, l.status].join(","));
    }
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `number-leases-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${rows.length} leases`);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <Card className="shadow-card">
        <CardContent className="p-4 flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[240px]">
            <Label className="text-xs">Search</Label>
            <div className="relative mt-1">
              <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Number, user, country…" className="pl-8" />
            </div>
          </div>
          <div className="w-[150px]">
            <Label className="text-xs">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="expiring">Expiring</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-[150px]">
            <Label className="text-xs">Auto-renew</Label>
            <Select value={autoRenew} onValueChange={setAutoRenew}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="true">On</SelectItem>
                <SelectItem value="false">Off</SelectItem>
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
                  <TableHead>Number</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead className="text-right">SMS 30d</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead>Renews</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.slice(0, visible).map((l) => (
                  <TableRow key={l.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <img src={`https://flagcdn.com/w40/${l.countryCode}.png`} alt={l.country} className="h-4 w-6 rounded-sm object-cover" loading="lazy" />
                        <span className="font-mono text-xs">{l.number}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">{l.user.name}</div>
                      <div className="text-[10px] text-muted-foreground">{l.user.email}</div>
                    </TableCell>
                    <TableCell className="text-sm">{l.service}</TableCell>
                    <TableCell className="text-sm">{l.supplier}</TableCell>
                    <TableCell className="text-right font-mono text-sm">{l.smsCount30d}</TableCell>
                    <TableCell className="text-right font-mono">{fmtNgn(l.priceNgn)}</TableCell>
                    <TableCell className="text-xs">
                      {new Date(l.renewsOn).toLocaleDateString()}
                      <div className="text-[10px] text-muted-foreground">{l.autoRenew ? "auto-renew" : "manual"}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[10px] capitalize ${leaseStatusTone[l.status]}`}>{l.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link to="/numbers/$id" params={{ id: l.id }}>
                        <Button size="sm" variant="ghost"><ArrowRight className="h-3.5 w-3.5" /></Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
                {rows.length === 0 && (
                  <TableRow><TableCell colSpan={9} className="text-center text-sm text-muted-foreground py-8">No leases match filters.</TableCell></TableRow>
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
