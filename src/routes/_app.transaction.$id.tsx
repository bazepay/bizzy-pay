import { createFileRoute, useNavigate, notFound, Link } from "@tanstack/react-router";

import { useState } from "react";
import {
  ArrowLeft,
  Share2,
  Download,
  Copy,
  Check,
  ArrowDownLeft,
  ArrowUpRight,
  HelpCircle,
  Hash,
  Receipt,
  Wallet,
  Tag,
} from "lucide-react";
import { toast } from "sonner";
import { txnById, type Txn } from "@/lib/transactions";

export const Route = createFileRoute("/_app/transaction/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Receipt · ${params.id} · BazePay` },
      { name: "description", content: "Transaction receipt." },
    ],
  }),
  loader: ({ params }) => {
    const t = txnById(params.id);
    if (!t) throw notFound();
    return { txn: t };
  },
  notFoundComponent: () => (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-background text-foreground">
      <p className="text-sm opacity-60">Transaction not found.</p>
      <Link to="/wallet" className="mt-4 text-sm font-bold text-primary">Back to wallet</Link>
    </div>
  ),
  errorComponent: ({ reset }) => (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-background text-foreground">
      <p className="text-sm opacity-60">Couldn't load receipt.</p>
      <button onClick={reset} className="mt-4 text-sm font-bold text-primary">Retry</button>
    </div>
  ),
  component: TxnReceipt,
});

function TxnReceipt() {
  const { txn } = Route.useLoaderData();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const statusTone =
    txn.status === "Success"
      ? "bg-success/15 text-success"
      : txn.status === "Pending"
        ? "bg-orange-500/15 text-orange-500"
        : "bg-destructive/15 text-destructive";

  const copyRef = () => {
    navigator.clipboard?.writeText(txn.reference).catch(() => {});
    setCopied(true);
    toast.success("Reference copied");
    setTimeout(() => setCopied(false), 1500);
  };

  const handleShare = async () => {
    const text = `${txn.title} · ${txn.amount} · ${txn.reference}`;
    const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> };
    if (nav.share) {
      try {
        await nav.share({ title: "BazePay receipt", text });
      } catch {}
    } else {
      navigator.clipboard?.writeText(text).catch(() => {});
      toast.success("Receipt copied");
    }
  };

  const handleDownload = () => {
    const html = receiptHtml(txn);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `BazePay-${txn.reference}.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Receipt downloaded");
  };

  const rows: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }[] = [
    { icon: Receipt, label: "Date", value: txn.time },
    { icon: Wallet, label: "Method", value: txn.method },
    { icon: Tag, label: "Category", value: txn.category },
    ...(txn.units ? [{ icon: Tag, label: "Units", value: txn.units }] : []),
    { icon: Hash, label: "Reference", value: txn.reference },
  ];

  const subtotal = txn.amount;
  const isElectricity = txn.category === "Electricity";

  return (
    <div className="min-h-full bg-background text-foreground flex flex-col">
      <div className="h-10" />
      <div className="px-6 pt-4 flex items-center justify-between">
        <button
          onClick={() => navigate({ to: "/wallet" })}
          className="w-10 h-10 rounded-full bg-foreground/10 flex items-center justify-center"
          aria-label="Back"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <button
          onClick={handleShare}
          className="w-10 h-10 rounded-full bg-foreground/10 flex items-center justify-center"
          aria-label="Share"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      {/* Hero */}
      <div className="px-6 mt-6 text-center">
        <div
          className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center ${
            txn.isCredit ? "bg-success/20 text-success" : "bg-foreground/10 text-foreground/80"
          }`}
        >
          {txn.isCredit ? <ArrowDownLeft className="w-7 h-7" /> : <ArrowUpRight className="w-7 h-7" />}
        </div>
        <p className="text-[11px] uppercase tracking-[0.18em] font-bold text-foreground/55 mt-4">
          {txn.isCredit ? "Received" : "Paid"}
        </p>
        <h1 className="font-display text-2xl font-bold tracking-tight mt-1">{txn.title}</h1>
        <p
          className={`font-display text-4xl font-bold tabular-nums mt-3 ${
            txn.isCredit ? "text-lime" : ""
          }`}
        >
          {txn.amount}
        </p>
        <span className={`mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusTone}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
          {txn.status}
        </span>
      </div>

      {/* White surface */}
      <div className="flex-1 mt-7 bg-card text-card-foreground rounded-t-[2rem] px-6 pt-7 pb-12 space-y-5">
        {/* Token (electricity) */}
        {isElectricity && txn.token && (
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-card-foreground/50 mb-2 px-1">
              Prepaid token
            </p>
            <div className="rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/20 px-4 py-4">
              <p className="font-mono text-lg font-bold tracking-[0.18em] text-card-foreground text-center select-all">
                {txn.token}
              </p>
            </div>
          </div>
        )}

        {/* Breakdown */}
        <div className="rounded-2xl bg-card-foreground/[0.04] p-4 space-y-3">
          <Row label="Amount" value={subtotal} />
          <Row label="Fee" value={txn.fee === "₦0.00" || txn.fee === "$0.00" ? "Free" : txn.fee} />
          {txn.note && <Row label="Note" value={txn.note} />}
          <div className="h-px bg-card-foreground/[0.08]" />
          <Row label="Total" value={subtotal} bold />
        </div>

        {/* Meta rows */}
        <div className="rounded-2xl bg-card-foreground/[0.04] p-2 divide-y divide-card-foreground/[0.06]">
          {rows.map((r) => (
            <div key={r.label} className="flex items-center gap-3 px-3 py-3">
              <div className="w-8 h-8 rounded-lg bg-card-foreground/[0.06] flex items-center justify-center text-card-foreground/70 shrink-0">
                <r.icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase tracking-wider font-bold text-card-foreground/55">{r.label}</p>
                <p className="text-[13px] font-semibold truncate">{r.value}</p>
              </div>
              {r.label === "Reference" && (
                <button
                  onClick={copyRef}
                  className="text-[11px] font-bold text-primary flex items-center gap-1"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleDownload}
            className="h-12 rounded-2xl bg-card-foreground/[0.06] text-sm font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition"
          >
            <Download className="w-4 h-4" /> Download
          </button>
          <button
            onClick={() => navigate({ to: "/profile/help/chat" })}
            className="h-12 rounded-2xl bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition"
          >
            <HelpCircle className="w-4 h-4" /> Get help
          </button>
        </div>

        <p className="text-[11px] text-card-foreground/50 text-center pt-2 leading-relaxed">
          Receipts are stored for 7 years. For disputes, open a report within 60 days of the transaction date.
        </p>
      </div>
    </div>
    
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className={`text-[12px] ${bold ? "font-bold" : "text-card-foreground/65"}`}>{label}</span>
      <span className={`tabular-nums text-right ${bold ? "font-display font-bold text-base" : "text-sm font-semibold"}`}>
        {value}
      </span>
    </div>
  );
}

function receiptHtml(t: Txn): string {
  return `<!doctype html><html><head><meta charset="utf-8"><title>BazePay receipt ${t.reference}</title>
<style>body{font-family:Inter,system-ui,sans-serif;max-width:520px;margin:40px auto;padding:32px;color:#1a1335;background:#fff;border:1px solid #eee;border-radius:24px}h1{font-size:20px;margin:0 0 4px}p{margin:4px 0;font-size:13px}.amt{font-size:36px;font-weight:800;margin:16px 0;color:${t.isCredit ? "#00b85a" : "#1a1335"}}.row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:13px}.row:last-child{border:0}.label{color:#666}.muted{color:#999;font-size:11px;margin-top:24px;text-align:center}</style>
</head><body>
<h1>BazePay receipt</h1>
<p style="color:#666">${t.reference}</p>
<div class="amt">${t.amount}</div>
<p><strong>${t.title}</strong></p>
<p style="color:#666">${t.time} · ${t.status}</p>
<div style="margin-top:24px">
  <div class="row"><span class="label">Method</span><span>${t.method}</span></div>
  <div class="row"><span class="label">Category</span><span>${t.category}</span></div>
  <div class="row"><span class="label">Fee</span><span>${t.fee}</span></div>
  ${t.note ? `<div class="row"><span class="label">Note</span><span>${t.note}</span></div>` : ""}
  ${t.token ? `<div class="row"><span class="label">Token</span><span style="font-family:monospace">${t.token}</span></div>` : ""}
</div>
<p class="muted">Generated by BazePay · prototype receipt</p>
</body></html>`;
}
