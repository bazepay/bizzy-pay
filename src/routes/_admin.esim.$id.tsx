import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, Clock, XCircle, Send, RotateCcw, Undo2, Smartphone, Copy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { getEsimOrder, orderStatusTone, fmtNgn, type EsimOrder, type EsimOrderStatus } from "@/lib/esim-data";
import { toast } from "sonner";

export const Route = createFileRoute("/_admin/esim/$id")({
  loader: ({ params }) => {
    const order = getEsimOrder(params.id);
    if (!order) throw notFound();
    return order;
  },
  component: OrderDetailPage,
  notFoundComponent: () => (
    <div className="p-10 text-center">
      <h2 className="font-display text-xl font-bold">Order not found</h2>
      <Link to="/esim/orders" className="text-sm text-primary hover:underline mt-3 inline-block">Back to orders</Link>
    </div>
  ),
});

const STEP_LABELS: Record<EsimOrder["steps"][number]["step"], string> = {
  payment_captured: "Payment captured",
  supplier_order: "Supplier order placed",
  qr_generated: "QR generated",
  qr_delivered: "QR delivered to user",
  device_activated: "Device activated",
};

function OrderDetailPage() {
  const initial = Route.useLoaderData();
  const router = useRouter();
  const [order, setOrder] = useState<EsimOrder>(initial as EsimOrder);

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => toast.success(`${label} copied`));
  };

  const resendQr = () => {
    if (!order.qrUrl) { toast.error("No QR available yet"); return; }
    toast.success(`QR re-sent to ${order.user.email}`);
  };

  const retry = () => {
    setOrder({
      ...order,
      status: "provisioning",
      failureReason: undefined,
      steps: order.steps.map((s) => s.step === "supplier_order" ? { ...s, status: "pending", note: undefined } : s),
    });
    toast.success("Retry queued · provisioning resumed");
  };

  const refund = (reason: string) => {
    setOrder({ ...order, status: "refunded" });
    toast.success(`Refunded ₦${order.priceNgn.toLocaleString("en-NG")} · ${reason.slice(0, 40)}`);
  };

  const setStatus = (next: EsimOrderStatus) => setOrder({ ...order, status: next });

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="p-6 max-w-[1400px] mx-auto space-y-5">
      <Button variant="ghost" size="sm" onClick={() => router.history.back()}>
        <ArrowLeft className="h-4 w-4 mr-1.5" /> Back
      </Button>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-3xl">{order.flag}</span>
            <h1 className="font-display text-2xl font-bold">{order.country} eSIM</h1>
            <Badge variant="outline" className={`text-xs capitalize ${orderStatusTone[order.status]}`}>{order.status}</Badge>
          </div>
          <div className="text-xs text-muted-foreground font-mono mt-1">{order.id} · {new Date(order.createdAt).toLocaleString()}</div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button size="sm" variant="outline" onClick={resendQr} disabled={!order.qrUrl}>
            <Send className="h-3.5 w-3.5 mr-1.5" /> Re-send QR
          </Button>
          {order.status === "failed" && (
            <Button size="sm" variant="outline" onClick={retry}>
              <RotateCcw className="h-3.5 w-3.5 mr-1.5" /> Retry activation
            </Button>
          )}
          <RefundDialog onConfirm={refund} disabled={order.status === "refunded"} amount={order.priceNgn} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-4">
          <Card className="shadow-card">
            <CardHeader className="pb-2"><CardTitle className="text-base">Activation timeline</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {order.steps.map((s, i) => {
                const Icon = s.status === "ok" ? CheckCircle2 : s.status === "failed" ? XCircle : Clock;
                const tone =
                  s.status === "ok" ? "text-success bg-success/15"
                  : s.status === "failed" ? "text-destructive bg-destructive/15"
                  : "text-muted-foreground bg-muted";
                return (
                  <div key={s.step} className="flex gap-3">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${tone}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 pb-3 border-b last:border-0">
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div className="text-sm font-medium">{i + 1}. {STEP_LABELS[s.step]}</div>
                        <div className="text-[10px] text-muted-foreground font-mono">
                          {s.at ? new Date(s.at).toLocaleString() : "—"}
                        </div>
                      </div>
                      {s.note && <div className="text-xs text-destructive mt-1">{s.note}</div>}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {order.status === "failed" && order.failureReason && (
            <Card className="shadow-card border-destructive/40">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="text-sm font-semibold">Activation failed</div>
                    <div className="text-xs text-muted-foreground mt-1 font-mono">{order.failureReason}</div>
                  </div>
                  <Button size="sm" variant="outline" onClick={retry}>Retry</Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="shadow-card">
            <CardHeader className="pb-2"><CardTitle className="text-base">eSIM credentials</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <CopyRow label="ICCID" value={order.iccid ?? "Not yet provisioned"} onCopy={order.iccid ? () => copy(order.iccid!, "ICCID") : undefined} />
              <Separator />
              <CopyRow label="Activation URL (LPA)" value={order.qrUrl ?? "Not yet generated"} onCopy={order.qrUrl ? () => copy(order.qrUrl!, "LPA URL") : undefined} />
              <Separator />
              <CopyRow label="Supplier" value={order.supplier} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="shadow-card overflow-hidden">
            <div className="bg-gradient-primary p-5 text-primary-foreground">
              <div className="flex items-center justify-between">
                <Smartphone className="h-6 w-6" />
                <span className="text-2xl">{order.flag}</span>
              </div>
              <div className="font-display text-xl font-bold mt-4">{order.country}</div>
              <div className="text-sm opacity-90">{order.dataGb} GB · {order.validityDays} days</div>
              <div className="font-display text-2xl font-bold mt-3">{fmtNgn(order.priceNgn)}</div>
            </div>
            <CardContent className="p-4 space-y-2 text-sm">
              <Field label="Plan ID" mono>{order.planId}</Field>
              <Field label="Supplier">{order.supplier}</Field>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="pb-2"><CardTitle className="text-base">Customer</CardTitle></CardHeader>
            <CardContent className="space-y-1.5 text-sm">
              <div className="font-medium">{order.user.name}</div>
              <div className="text-xs text-muted-foreground">{order.user.email}</div>
              <Link to="/users/$id" params={{ id: order.user.id }} className="text-xs text-primary hover:underline inline-block mt-1">
                Open user 360 →
              </Link>
            </CardContent>
          </Card>

          {order.status !== "refunded" && order.status !== "activated" && (
            <Card className="shadow-card">
              <CardHeader className="pb-2"><CardTitle className="text-base">Force status</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-2 gap-2">
                <Button size="sm" variant="outline" onClick={() => { setStatus("delivered"); toast.success("Marked delivered"); }}>Delivered</Button>
                <Button size="sm" variant="outline" onClick={() => { setStatus("activated"); toast.success("Marked activated"); }}>Activated</Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function Field({ label, children, mono }: { label: string; children: React.ReactNode; mono?: boolean }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`mt-0.5 ${mono ? "font-mono text-xs break-all" : ""}`}>{children}</div>
    </div>
  );
}

function CopyRow({ label, value, onCopy }: { label: string; value: string; onCopy?: () => void }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="min-w-0">
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

function RefundDialog({ onConfirm, disabled, amount }: { onConfirm: (reason: string) => void; disabled?: boolean; amount: number }) {
  const [reason, setReason] = useState("");
  const [open, setOpen] = useState(false);
  return (
    <AlertDialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setReason(""); }}>
      <AlertDialogTrigger asChild>
        <Button size="sm" variant="outline" className="text-destructive" disabled={disabled}>
          <Undo2 className="h-3.5 w-3.5 mr-1.5" /> Refund
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Refund {fmtNgn(amount)}</AlertDialogTitle>
          <AlertDialogDescription>
            Funds will be returned to the user wallet. Action is logged. Provide a reason.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason (required)" />
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={(e) => {
            if (reason.trim().length < 4) { e.preventDefault(); toast.error("Reason required"); return; }
            onConfirm(reason); setOpen(false); setReason("");
          }}>Confirm refund</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
