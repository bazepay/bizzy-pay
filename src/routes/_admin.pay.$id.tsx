import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw, Undo2, Receipt, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { billOrders, billers, categoryLabel, orderStatusTone, fmtNgn, type BillOrder } from "@/lib/pay-data";
import { toast } from "sonner";

export const Route = createFileRoute("/_admin/pay/$id")({
  component: OrderDetail,
});

function OrderDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const initial = useMemo(() => billOrders.find((o) => o.id === id), [id]);
  const [order, setOrder] = useState<BillOrder | undefined>(initial);

  if (!order) {
    return (
      <div className="p-6 max-w-[900px] mx-auto">
        <div className="text-sm text-muted-foreground mb-4">
          <Link to="/pay/orders" className="inline-flex items-center gap-1 hover:text-foreground">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to orders
          </Link>
        </div>
        <Card><CardContent className="p-10 text-center text-muted-foreground">Order not found.</CardContent></Card>
      </div>
    );
  }

  const biller = billers.find((b) => b.id === order.billerId);

  const retry = () => {
    setOrder({ ...order, status: "processing", retries: order.retries + 1, responseMs: 200 + Math.floor(Math.random() * 1500) });
    toast.success("Manual retry queued");
    setTimeout(() => {
      setOrder((prev) => prev ? { ...prev, status: "delivered", providerRef: prev.providerRef ?? `${prev.route.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-7)}` } : prev);
      toast.success("Retry succeeded");
    }, 1200);
  };

  const refund = () => {
    setOrder({ ...order, status: "refunded" });
    toast.success(`${fmtNgn(order.amountNgn)} refunded to ${order.user.name}`);
  };

  const timeline: Array<{ at: string; label: string; tone?: "success" | "warning" | "danger" }> = [
    { at: order.createdAt, label: "Order created" },
    { at: new Date(+new Date(order.createdAt) + 800).toISOString(), label: `Routed to ${order.route}` },
    ...(order.providerRef ? [{ at: new Date(+new Date(order.createdAt) + 1500).toISOString(), label: `Provider ack ${order.providerRef}` }] : []),
    ...(order.retries > 0 ? Array.from({ length: order.retries }, (_, i) => ({ at: new Date(+new Date(order.createdAt) + 3000 * (i + 1)).toISOString(), label: `Retry #${i + 1}`, tone: "warning" as const })) : []),
    {
      at: new Date(+new Date(order.createdAt) + 4000).toISOString(),
      label: order.status === "delivered" ? "Delivered to biller" :
             order.status === "failed" ? `Failed — ${order.failureReason ?? "unknown error"}` :
             order.status === "refunded" ? "Refund issued" :
             order.status === "processing" ? "Processing at provider" : "Pending",
      tone: order.status === "delivered" ? "success" : order.status === "failed" ? "danger" : order.status === "refunded" ? "warning" : undefined,
    },
  ];

  return (
    <div className="p-6 max-w-[1100px] mx-auto space-y-5">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <button onClick={() => navigate({ to: "/pay/orders" })} className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mb-3">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to orders
        </button>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            {biller && (
              <div className="h-12 w-12 rounded-lg flex items-center justify-center text-2xl shrink-0" style={{ backgroundColor: `${biller.color}22`, color: biller.color }}>
                {biller.logo ?? "•"}
              </div>
            )}
            <div>
              <div className="font-display text-2xl font-bold">{order.billerName}</div>
              <div className="text-sm text-muted-foreground font-mono">{order.id}</div>
            </div>
            <Badge variant="outline" className={`capitalize ${orderStatusTone[order.status]}`}>{order.status}</Badge>
          </div>
          <div className="flex items-center gap-2">
            {(order.status === "failed" || order.status === "pending") && (
              <Button onClick={retry} size="sm" variant="outline" className="gap-1.5">
                <RefreshCw className="h-3.5 w-3.5" />Retry
              </Button>
            )}
            {order.status !== "refunded" && order.status !== "pending" && (
              <Button onClick={refund} size="sm" variant="outline" className="gap-1.5 text-warning hover:text-warning">
                <Undo2 className="h-3.5 w-3.5" />Refund
              </Button>
            )}
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 shadow-card">
          <CardContent className="p-5 space-y-4">
            <div className="font-display text-base font-bold">Order details</div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <Field label="Category"><span className="capitalize">{categoryLabel[order.category]}</span></Field>
              <Field label="Account"><span className="font-mono">{order.account}</span></Field>
              <Field label="Amount"><span className="font-mono">{fmtNgn(order.amountNgn)}</span></Field>
              <Field label="Fee"><span className="font-mono">{fmtNgn(order.feeNgn)}</span></Field>
              <Field label="Route">{order.route}</Field>
              <Field label="Provider ref"><span className="font-mono text-xs">{order.providerRef ?? "—"}</span></Field>
              <Field label="Response"><span className="font-mono">{order.responseMs}ms</span></Field>
              <Field label="Retries">{order.retries}</Field>
              <Field label="Created">{new Date(order.createdAt).toLocaleString()}</Field>
            </div>
            {order.failureReason && (
              <div className="p-3 rounded-md border border-destructive/30 bg-destructive/10 flex items-start gap-2 text-sm">
                <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-destructive">Failure reason</div>
                  <div className="text-muted-foreground">{order.failureReason}</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-5 space-y-3">
            <div className="font-display text-base font-bold">Customer</div>
            <div>
              <div className="text-sm font-medium">{order.user.name}</div>
              <div className="text-xs text-muted-foreground">{order.user.email}</div>
            </div>
            <Link to="/users/$id" params={{ id: order.user.id }} className="text-xs text-primary inline-flex items-center gap-1">
              Open user profile →
            </Link>
            <div className="pt-3 border-t border-border space-y-1.5">
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Receipt</div>
              <div className="flex justify-between text-sm"><span>Subtotal</span><span className="font-mono">{fmtNgn(order.amountNgn)}</span></div>
              <div className="flex justify-between text-sm"><span>Service fee</span><span className="font-mono">{fmtNgn(order.feeNgn)}</span></div>
              <div className="flex justify-between text-sm font-bold pt-1.5 border-t border-border"><span>Total</span><span className="font-mono">{fmtNgn(order.amountNgn + order.feeNgn)}</span></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-card">
        <CardContent className="p-5">
          <div className="font-display text-base font-bold mb-3 flex items-center gap-2">
            <Receipt className="h-4 w-4" /> Timeline
          </div>
          <div className="space-y-3">
            {timeline.map((e, i) => {
              const Icon = e.tone === "success" ? CheckCircle2 : e.tone === "danger" ? AlertTriangle : e.tone === "warning" ? RefreshCw : Clock;
              const tc = e.tone === "success" ? "text-success" : e.tone === "danger" ? "text-destructive" : e.tone === "warning" ? "text-warning" : "text-muted-foreground";
              return (
                <div key={i} className="flex items-start gap-3">
                  <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${tc}`} />
                  <div className="flex-1 flex justify-between items-baseline gap-3 border-b border-border pb-2">
                    <div className="text-sm">{e.label}</div>
                    <div className="text-[11px] text-muted-foreground font-mono">{new Date(e.at).toLocaleTimeString()}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-0.5">{children}</div>
    </div>
  );
}
