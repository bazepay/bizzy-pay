import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search } from "lucide-react";
import { fmtNgn } from "@/lib/mock-data";
import { getTransactions, fmtRelative, type Txn } from "@/lib/users-data";

export const Route = createFileRoute("/_admin/users/$id/transactions")({
  component: TxnsTab,
});

const STATUS_TONE: Record<Txn["status"], string> = {
  success: "bg-success/15 text-success border-success/30",
  pending: "bg-primary/10 text-primary border-primary/30",
  failed: "bg-destructive/10 text-destructive border-destructive/30",
  reversed: "bg-muted text-muted-foreground border-border",
};

function TxnsTab() {
  const { id } = Route.useParams();
  const all = getTransactions(id, 32);
  const [q, setQ] = useState("");
  const [type, setType] = useState("any");
  const [status, setStatus] = useState("any");

  const rows = useMemo(() => {
    return all.filter((t) => {
      if (q && !`${t.id} ${t.type} ${t.provider} ${t.counterparty ?? ""}`.toLowerCase().includes(q.toLowerCase())) return false;
      if (type !== "any" && t.type !== type) return false;
      if (status !== "any" && t.status !== status) return false;
      return true;
    });
  }, [all, q, type, status]);

  return (
    <Card className="shadow-card overflow-hidden">
      <div className="p-3 flex flex-wrap items-center gap-2 border-b">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by id, provider, counterparty…" className="pl-9 h-9" />
        </div>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="w-[140px] h-9"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any type</SelectItem>
            {["topup","transfer","airtime","data","electricity","tv","betting","card_spend","esim","number","refund","fee"].map((t) => (
              <SelectItem key={t} value={t} className="capitalize">{t.replace("_", " ")}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[140px] h-9"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any status</SelectItem>
            <SelectItem value="success">Success</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="reversed">Reversed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead>ID</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Provider</TableHead>
            <TableHead className="text-right">Amount (NGN)</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>When</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((t) => (
            <TableRow key={t.id}>
              <TableCell className="font-mono text-xs">{t.id}</TableCell>
              <TableCell className="capitalize text-sm">{t.type.replace("_", " ")}</TableCell>
              <TableCell className="text-sm">{t.provider}</TableCell>
              <TableCell className="font-mono text-sm text-right">{fmtNgn(t.amountNgn)}</TableCell>
              <TableCell>
                <Badge variant="outline" className={`text-xs capitalize ${STATUS_TONE[t.status]}`}>{t.status}</Badge>
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">{fmtRelative(t.at)}</TableCell>
            </TableRow>
          ))}
          {rows.length === 0 && (
            <TableRow><TableCell colSpan={6} className="text-center py-10 text-sm text-muted-foreground">No transactions match.</TableCell></TableRow>
          )}
        </TableBody>
      </Table>
    </Card>
  );
}
