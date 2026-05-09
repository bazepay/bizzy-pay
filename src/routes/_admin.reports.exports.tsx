import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Download, Trash2, RotateCw } from "lucide-react";
import { toast } from "sonner";
import {
  exportsHistory as seed,
  categoryLabel,
  categoryTone,
  statusTone,
  fmtRelative,
  fmtBytes,
  type ExportRow,
  type ReportCategory,
} from "@/lib/reports-data";
import { fmtNum } from "@/lib/mock-data";

export const Route = createFileRoute("/_admin/reports/exports")({
  component: ExportsPage,
});

function ExportsPage() {
  const [items, setItems] = useState<ExportRow[]>(seed);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | ExportRow["status"]>("all");
  const [cat, setCat] = useState<"all" | ReportCategory>("all");

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    return items.filter((r) => {
      if (status !== "all" && r.status !== status) return false;
      if (cat !== "all" && r.category !== cat) return false;
      if (!term) return true;
      return r.reportName.toLowerCase().includes(term) || r.requestedBy.toLowerCase().includes(term) || r.id.includes(term);
    });
  }, [items, q, status, cat]);

  const download = (r: ExportRow) => {
    if (r.status !== "ready") { toast.error("Export not ready"); return; }
    const header = "id,reportName,category,requestedBy,requestedAt,rangeFrom,rangeTo,format,rows,sizeKb,status\n";
    const line = [r.id, r.reportName, r.category, r.requestedBy, r.requestedAt, r.rangeFrom, r.rangeTo, r.format, r.rows, r.sizeKb, r.status].join(",");
    const blob = new Blob([header + line], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${r.id}.${r.format}`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Download started");
  };

  const remove = (id: string) => {
    setItems((p) => p.filter((i) => i.id !== id));
    toast.success("Export removed");
  };

  const retry = (id: string) => {
    setItems((p) => p.map((i) => i.id === id ? { ...i, status: "ready", requestedAt: new Date().toISOString() } : i));
    toast.success("Retried — ready to download");
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <div>
        <h2 className="font-display text-xl font-semibold">Exports history</h2>
        <p className="text-sm text-muted-foreground">All on-demand and scheduled exports. Files expire after 7 days.</p>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative">
          <Search className="h-4 w-4 absolute left-2.5 top-2.5 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search exports" className="pl-8 w-64" />
        </div>
        <Select value={status} onValueChange={(v) => setStatus(v as any)}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="ready">Ready</SelectItem>
            <SelectItem value="running">Running</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
          </SelectContent>
        </Select>
        <Select value={cat} onValueChange={(v) => setCat(v as any)}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            <SelectItem value="financial">Financial</SelectItem>
            <SelectItem value="operations">Operations</SelectItem>
            <SelectItem value="compliance">Compliance</SelectItem>
            <SelectItem value="growth">Growth</SelectItem>
            <SelectItem value="product">Product</SelectItem>
          </SelectContent>
        </Select>
        <div className="ml-auto text-xs text-muted-foreground">{rows.length} of {items.length}</div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Export</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Range</TableHead>
                <TableHead>Requested by</TableHead>
                <TableHead>Requested</TableHead>
                <TableHead className="text-right">Rows</TableHead>
                <TableHead className="text-right">Size</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right w-32"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    <div className="font-medium">{r.reportName}</div>
                    <div className="text-xs text-muted-foreground font-mono">{r.id} · {r.format.toUpperCase()}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={categoryTone[r.category]}>{categoryLabel[r.category]}</Badge>
                  </TableCell>
                  <TableCell className="text-xs">
                    {r.rangeFrom} → {r.rangeTo}
                  </TableCell>
                  <TableCell className="text-sm">{r.requestedBy}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{fmtRelative(r.requestedAt)}</TableCell>
                  <TableCell className="text-right font-mono text-xs">{fmtNum(r.rows)}</TableCell>
                  <TableCell className="text-right font-mono text-xs">{fmtBytes(r.sizeKb)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusTone[r.status]}>{r.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {r.status === "ready" && (
                      <Button size="icon" variant="ghost" onClick={() => download(r)} title="Download">
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    {(r.status === "failed" || r.status === "expired") && (
                      <Button size="icon" variant="ghost" onClick={() => retry(r.id)} title="Retry">
                        <RotateCw className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    <Button size="icon" variant="ghost" onClick={() => remove(r.id)} title="Remove">
                      <Trash2 className="h-3.5 w-3.5 text-rose-600" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow><TableCell colSpan={9} className="text-center py-10 text-sm text-muted-foreground">No exports match your filters.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </motion.div>
  );
}
