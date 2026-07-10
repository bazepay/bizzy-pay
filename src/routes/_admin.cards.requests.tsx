import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, Download, Package, Check, X, Truck, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  physicalRequests as seed,
  requestStatusTone,
  nextStatus,
  fmtNgn,
  type PhysicalCardRequest,
  type PhysicalRequestStatus,
} from "@/lib/cards-data";
import { toast } from "sonner";

export const Route = createFileRoute("/_admin/cards/requests")({
  component: RequestsPage,
});

function RequestsPage() {
  const [rows, setRows] = useState<PhysicalCardRequest[]>(seed);
  const [q, setQ] = useState("");
  const [statusF, setStatusF] = useState<"all" | PhysicalRequestStatus>("all");

  const filtered = useMemo(() => rows.filter((r) => {
    if (statusF !== "all" && r.status !== statusF) return false;
    if (q) {
      const s = q.toLowerCase();
      if (!r.user.name.toLowerCase().includes(s) &&
          !r.user.email.toLowerCase().includes(s) &&
          !r.id.includes(s) &&
          !(r.tracking ?? "").toLowerCase().includes(s)) return false;
    }
    return true;
  }), [rows, q, statusF]);

  const update = (id: string, patch: Partial<PhysicalCardRequest>) => {
    setRows((prev) => prev.map((r) => r.id === id
      ? { ...r, ...patch, updatedAt: new Date().toISOString() }
      : r));
  };

  const advance = (r: PhysicalCardRequest) => {
    const nxt = nextStatus[r.status];
    if (!nxt) return;
    update(r.id, { status: nxt });
    toast.success(`${r.id} → ${nxt}`);
  };

  const exportCsv = () => {
    const header = ["id", "user_id", "user_name", "status", "design", "courier", "tracking", "state", "city", "fee_ngn", "requested_at"];
    const lines = filtered.map((r) => [
      r.id, r.user.id, `"${r.user.name}"`, r.status, r.design, r.courier,
      r.tracking ?? "", r.address.state, r.address.city, r.feeNgn, r.requestedAt,
    ].join(","));
    const blob = new Blob([header.join(",") + "\n" + lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `physical-requests-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${filtered.length}`);
  };

  const kpi = (s: PhysicalRequestStatus) => rows.filter((r) => r.status === s).length;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Mini label="New requests" v={kpi("requested")} tone="primary" />
        <Mini label="In production" v={kpi("printing")} tone="warn" />
        <Mini label="In transit" v={kpi("shipped")} tone="warn" />
        <Mini label="Delivered" v={kpi("delivered")} tone="success" />
        <Mini label="Activated" v={kpi("activated")} tone="success" />
      </div>

      <Card className="shadow-card">
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search user, request ID or tracking…" className="pl-9" />
            </div>
            <Select value={statusF} onValueChange={(v: typeof statusF) => setStatusF(v)}>
              <SelectTrigger className="w-[170px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {(["requested","approved","printing","shipped","delivered","activated","rejected","lost","cancelled"] as PhysicalRequestStatus[]).map((s) => (
                  <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={exportCsv}>
              <Download className="h-4 w-4 mr-1.5" /> Export CSV
            </Button>
          </div>

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Request</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Design</TableHead>
                  <TableHead>Ship to</TableHead>
                  <TableHead>Courier / tracking</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Fee</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={8} className="text-center py-10 text-muted-foreground text-sm">No requests match your filters.</TableCell></TableRow>
                ) : filtered.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>
                      <div className="text-sm font-mono">{r.id}</div>
                      <div className="text-xs text-muted-foreground">{new Date(r.requestedAt).toLocaleDateString()}</div>
                    </TableCell>
                    <TableCell>
                      <Link to="/users/$id" params={{ id: r.user.id }} className="text-sm hover:text-primary">{r.user.name}</Link>
                      <div className="text-xs text-muted-foreground">{r.user.email}</div>
                    </TableCell>
                    <TableCell className="text-xs capitalize">{r.design.replace("-", " ")}</TableCell>
                    <TableCell>
                      <div className="text-xs flex items-center gap-1"><MapPin className="h-3 w-3" />{r.address.city}, {r.address.state}</div>
                      <div className="text-[10px] text-muted-foreground truncate max-w-[180px]">{r.address.line1}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs">{r.courier}</div>
                      <div className="text-[10px] font-mono text-muted-foreground">{r.tracking ?? "—"}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-xs capitalize ${requestStatusTone[r.status]}`}>{r.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">{fmtNgn(r.feeNgn)}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <RequestDetailDialog r={r} onUpdate={(patch) => update(r.id, patch)} />
                        {nextStatus[r.status] && (
                          <Button size="sm" variant="outline" onClick={() => advance(r)}>
                            {r.status === "requested" && <><Check className="h-3 w-3 mr-1" /> Approve</>}
                            {r.status === "approved" && <><Package className="h-3 w-3 mr-1" /> Print</>}
                            {r.status === "printing" && <><Truck className="h-3 w-3 mr-1" /> Ship</>}
                            {r.status === "shipped" && <>Mark delivered</>}
                            {r.status === "delivered" && <>Mark activated</>}
                          </Button>
                        )}
                        {r.status === "requested" && (
                          <Button size="sm" variant="ghost" className="text-destructive" onClick={() => { update(r.id, { status: "rejected" }); toast.success("Request rejected"); }}>
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function Mini({ label, v, tone }: { label: string; v: number; tone: "primary" | "warn" | "success" }) {
  const color = tone === "primary" ? "text-primary" : tone === "warn" ? "text-warning" : "text-success";
  return (
    <Card className="shadow-card">
      <CardContent className="p-3">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className={`font-display text-xl font-bold mt-0.5 ${color}`}>{v}</div>
      </CardContent>
    </Card>
  );
}

function RequestDetailDialog({ r, onUpdate }: { r: PhysicalCardRequest; onUpdate: (p: Partial<PhysicalCardRequest>) => void }) {
  const [open, setOpen] = useState(false);
  const [tracking, setTracking] = useState(r.tracking ?? "");
  const [courier, setCourier] = useState(r.courier);
  const [notes, setNotes] = useState(r.notes ?? "");
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost">View</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Physical card request · {r.id}</DialogTitle>
          <DialogDescription>Requested {new Date(r.requestedAt).toLocaleString()} · last update {new Date(r.updatedAt).toLocaleString()}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-[10px] uppercase text-muted-foreground">User</div>
              <div>{r.user.name}</div>
              <div className="text-xs text-muted-foreground">{r.user.email}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase text-muted-foreground">Status</div>
              <Badge variant="outline" className={`text-xs capitalize ${requestStatusTone[r.status]}`}>{r.status}</Badge>
            </div>
            <div>
              <div className="text-[10px] uppercase text-muted-foreground">Design</div>
              <div className="capitalize">{r.design.replace("-", " ")}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase text-muted-foreground">Fee</div>
              <div className="font-mono">{fmtNgn(r.feeNgn)}</div>
            </div>
          </div>

          <div>
            <div className="text-[10px] uppercase text-muted-foreground mb-1">Shipping address</div>
            <div className="rounded-md border p-2 text-xs space-y-0.5">
              <div>{r.address.line1}</div>
              {r.address.line2 && <div>{r.address.line2}</div>}
              <div>{r.address.city}, {r.address.state}</div>
              <div className="font-mono">{r.address.phone}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Courier</Label>
              <Select value={courier} onValueChange={(v: typeof courier) => setCourier(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(["GIG","DHL","Redstar","Kwik"] as const).map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tracking #</Label>
              <Input value={tracking} onChange={(e) => setTracking(e.target.value)} placeholder="Optional" />
            </div>
          </div>

          <div>
            <Label>Internal notes</Label>
            <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Visible to admins only" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Close</Button>
          <Button onClick={() => { onUpdate({ courier, tracking: tracking || undefined, notes }); toast.success("Request updated"); setOpen(false); }}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
