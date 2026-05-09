import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, CreditCard, Snowflake, XCircle, Eye, EyeOff, Copy, ShieldAlert, History, Settings2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { getIssuedCard, getProgram, getCardTransactions, cardStatusTone, fmtNgn, type CardStatus, type IssuedCard } from "@/lib/cards-data";
import { toast } from "sonner";

export const Route = createFileRoute("/_admin/cards/$id")({
  loader: ({ params }) => {
    const card = getIssuedCard(params.id);
    if (!card) throw notFound();
    return card;
  },
  component: CardDetailPage,
  notFoundComponent: () => (
    <div className="p-10 text-center">
      <h2 className="font-display text-xl font-bold">Card not found</h2>
      <Link to="/cards/issued" className="text-sm text-primary hover:underline mt-3 inline-block">Back to issued cards</Link>
    </div>
  ),
});

function CardDetailPage() {
  const initial = Route.useLoaderData();
  const router = useRouter();
  const [card, setCard] = useState<IssuedCard>(initial as IssuedCard);
  const [revealed, setRevealed] = useState(false);
  const [daily, setDaily] = useState(card.dailyLimitNgn);
  const [monthly, setMonthly] = useState(card.monthlyLimitNgn);
  const program = getProgram(card.programId);
  const txns = getCardTransactions(card.id);

  const setStatus = (next: CardStatus, label: string) => {
    setCard({ ...card, status: next });
    toast.success(`${label} · audit logged`);
  };

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => toast.success(`${label} copied`));
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <Button variant="ghost" size="sm" onClick={() => router.history.back()}>
        <ArrowLeft className="h-4 w-4 mr-1.5" /> Back
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Card visual + actions */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="shadow-card overflow-hidden">
            <div className="bg-gradient-primary p-6 text-primary-foreground min-h-[200px] flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <CreditCard className="h-7 w-7" />
                <div className="text-right">
                  <div className="text-xs opacity-80">{card.brand}</div>
                  <div className="text-[10px] opacity-70 font-mono">{card.currency}</div>
                </div>
              </div>
              <div>
                <div className="font-mono text-base tracking-widest">
                  {revealed ? `${card.pan.replace(/X/g, "•").replace(/\s/g, " ")}` : `•••• •••• •••• ${card.last4}`}
                </div>
                <div className="flex items-end justify-between mt-3">
                  <div>
                    <div className="text-[10px] opacity-70 uppercase">Holder</div>
                    <div className="text-xs font-medium uppercase">{card.user.name}</div>
                  </div>
                  <div>
                    <div className="text-[10px] opacity-70 uppercase">Expires</div>
                    <div className="text-xs font-mono">{card.expiry}</div>
                  </div>
                  <div>
                    <div className="text-[10px] opacity-70 uppercase">CVV</div>
                    <div className="text-xs font-mono">{revealed ? "•••" : "•••"}</div>
                  </div>
                </div>
              </div>
            </div>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className={`text-xs capitalize ${cardStatusTone[card.status]}`}>{card.status}</Badge>
                <span className="text-xs font-mono text-muted-foreground">{card.id}</span>
              </div>

              <RevealDialog onConfirm={() => { setRevealed(true); setTimeout(() => setRevealed(false), 30_000); }}>
                <Button size="sm" variant="outline" className="w-full">
                  {revealed ? <EyeOff className="h-3.5 w-3.5 mr-1.5" /> : <Eye className="h-3.5 w-3.5 mr-1.5" />}
                  {revealed ? "Hide PAN (auto-hides 30s)" : "Reveal full PAN"}
                </Button>
              </RevealDialog>

              <div className="grid grid-cols-2 gap-2">
                <Button size="sm" variant="outline" disabled={card.status === "terminated"}
                  onClick={() => setStatus(card.status === "frozen" ? "active" : "frozen", `Card ${card.status === "frozen" ? "unfrozen" : "frozen"}`)}>
                  <Snowflake className="h-3.5 w-3.5 mr-1.5" />
                  {card.status === "frozen" ? "Unfreeze" : "Freeze"}
                </Button>
                <TerminateDialog onConfirm={() => setStatus("terminated", "Card terminated")} disabled={card.status === "terminated"} />
              </div>
            </CardContent>
          </Card>

          {/* Holder */}
          <Card className="shadow-card">
            <CardHeader className="pb-2"><CardTitle className="text-base">Cardholder</CardTitle></CardHeader>
            <CardContent className="space-y-1.5 text-sm">
              <div className="font-medium">{card.user.name}</div>
              <div className="text-xs text-muted-foreground">{card.user.email}</div>
              <Link to="/users/$id" params={{ id: card.user.id }} className="text-xs text-primary hover:underline inline-block mt-1">
                Open user 360 →
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Right: details, limits, txns */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Stat label="Balance" value={fmtNgn(card.balanceNgn)} />
            <Stat label="30-day spend" value={fmtNgn(card.spend30dNgn)} />
            <Stat label="Risk score" value={String(card.riskScore)} tone={card.riskScore >= 70 ? "danger" : card.riskScore >= 40 ? "warn" : "success"} />
            <Stat label="3DS enrolled" value={card.threeDsEnrolled ? "Yes" : "No"} />
          </div>

          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base flex items-center gap-2"><Settings2 className="h-4 w-4 text-primary" /> Limits</CardTitle>
              <LimitsDialog
                daily={daily} monthly={monthly}
                onSave={(d, m) => { setDaily(d); setMonthly(m); toast.success("Limits updated · audit logged"); }}
              />
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-sm">
              <Field label="Daily limit"><span className="font-mono font-semibold">{fmtNgn(daily)}</span></Field>
              <Field label="Monthly limit"><span className="font-mono font-semibold">{fmtNgn(monthly)}</span></Field>
              <Field label="Program">{program?.name ?? "—"}</Field>
              <Field label="BIN"><span className="font-mono">{program?.bin}</span></Field>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="pb-2"><CardTitle className="text-base">Card identifiers</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <CopyRow label="Card ID" value={card.id} onCopy={() => copy(card.id, "Card ID")} />
              <Separator />
              <CopyRow label="Masked PAN" value={card.pan} onCopy={() => copy(card.pan, "PAN")} />
              <Separator />
              <CopyRow label="Issued at" value={new Date(card.issuedAt).toLocaleString()} />
              <Separator />
              <CopyRow label="Last used" value={new Date(card.lastUsedAt).toLocaleString()} />
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><History className="h-4 w-4 text-primary" /> Recent authorisations</CardTitle></CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>When</TableHead>
                      <TableHead>Merchant</TableHead>
                      <TableHead>MCC</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {txns.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell className="text-xs text-muted-foreground">{new Date(t.at).toLocaleString()}</TableCell>
                        <TableCell className="text-sm">
                          <div className="font-medium">{t.merchant}</div>
                          <div className="text-xs text-muted-foreground">{t.category}</div>
                        </TableCell>
                        <TableCell className="font-mono text-xs">{t.mcc}</TableCell>
                        <TableCell className="text-right font-mono">{fmtNgn(t.amountNgn)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`text-xs capitalize ${
                            t.status === "approved" ? "bg-success/15 text-success border-success/30"
                              : t.status === "declined" ? "bg-destructive/15 text-destructive border-destructive/30"
                                : "bg-warning/15 text-warning border-warning/30"
                          }`}>
                            {t.status}{t.reason ? ` · ${t.reason}` : ""}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "danger" | "warn" | "success" }) {
  const color = tone === "danger" ? "text-destructive" : tone === "warn" ? "text-warning" : tone === "success" ? "text-success" : "";
  return (
    <Card className="shadow-card">
      <CardContent className="p-4">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className={`font-display text-xl font-bold mt-1 ${color}`}>{value}</div>
      </CardContent>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-0.5">{children}</div>
    </div>
  );
}

function CopyRow({ label, value, onCopy }: { label: string; value: string; onCopy?: () => void }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div>
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="font-mono text-sm mt-0.5 break-all">{value}</div>
      </div>
      {onCopy && (
        <Button size="sm" variant="ghost" onClick={onCopy}>
          <Copy className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
}

function RevealDialog({ children, onConfirm }: { children: React.ReactNode; onConfirm: () => void }) {
  const [reason, setReason] = useState("");
  const [open, setOpen] = useState(false);
  return (
    <AlertDialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setReason(""); }}>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2"><ShieldAlert className="h-4 w-4 text-warning" /> Reveal full PAN</AlertDialogTitle>
          <AlertDialogDescription>
            This action is logged. The cardholder may be notified per program policy. Provide a reason.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Verifying card with cardholder over support call (ticket #1234)…" />
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={(e) => {
            if (reason.trim().length < 8) { e.preventDefault(); toast.error("Reason must be at least 8 characters"); return; }
            onConfirm(); setOpen(false); setReason("");
          }}>Reveal for 30s</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function TerminateDialog({ onConfirm, disabled }: { onConfirm: () => void; disabled?: boolean }) {
  const [reason, setReason] = useState("");
  const [open, setOpen] = useState(false);
  return (
    <AlertDialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setReason(""); }}>
      <AlertDialogTrigger asChild>
        <Button size="sm" variant="outline" className="text-destructive" disabled={disabled}>
          <XCircle className="h-3.5 w-3.5 mr-1.5" /> Terminate
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Terminate card</AlertDialogTitle>
          <AlertDialogDescription>
            Permanent. The card cannot be used again. Any remaining balance is returned to the user wallet.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason (required)" />
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={(e) => {
            if (reason.trim().length < 4) { e.preventDefault(); toast.error("Reason required"); return; }
            onConfirm(); setOpen(false); setReason("");
          }}>Terminate</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function LimitsDialog({ daily, monthly, onSave }: { daily: number; monthly: number; onSave: (d: number, m: number) => void }) {
  const [open, setOpen] = useState(false);
  const [d, setD] = useState(String(daily));
  const [m, setM] = useState(String(monthly));
  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (o) { setD(String(daily)); setM(String(monthly)); } }}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">Edit limits</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Per-card limits</DialogTitle>
          <DialogDescription>Limits cannot exceed the program ceiling.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Daily limit (NGN)</Label>
            <Input type="number" value={d} onChange={(e) => setD(e.target.value)} />
          </div>
          <div>
            <Label>Monthly limit (NGN)</Label>
            <Input type="number" value={m} onChange={(e) => setM(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={() => {
            const dn = Number(d), mn = Number(m);
            if (Number.isNaN(dn) || Number.isNaN(mn) || dn <= 0 || mn <= 0) { toast.error("Enter valid amounts"); return; }
            if (mn < dn) { toast.error("Monthly limit must be ≥ daily limit"); return; }
            onSave(dn, mn);
            setOpen(false);
          }}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
