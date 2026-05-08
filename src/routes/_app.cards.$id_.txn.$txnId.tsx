import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Snowflake,
  Flag,
  Share2,
  ShieldCheck,
  Receipt,
  Check,
  Copy,
  Hash,
  MapPin,
  CreditCard,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { cards, cardTxns, formatNgn } from "@/lib/cards";

export const Route = createFileRoute("/_app/cards/$id_/txn/$txnId")({
  head: ({ params }) => ({
    meta: [
      { title: `Transaction · ${params.txnId} · BazePay` },
      { name: "description", content: "Card transaction details and receipt." },
    ],
  }),
  loader: ({ params }) => {
    const card = cards.find((c) => c.id === params.id);
    const txn = cardTxns.find((t) => t.id === params.txnId && t.cardId === params.id);
    if (!card || !txn) throw notFound();
    return { card, txn };
  },
  notFoundComponent: () => (
    <div className="min-h-full flex flex-col items-center justify-center p-6 text-center">
      <p className="text-sm text-foreground/60">Transaction not found.</p>
      <Link to="/cards" className="mt-4 text-sm font-bold text-primary">
        Back to Cards
      </Link>
    </div>
  ),
  component: TxnDetail,
});

function categoryLocation(category: string): string {
  const map: Record<string, string> = {
    subscriptions: "Online",
    travel: "Lagos, NG → International",
    shopping: "Online",
    food: "Lagos, NG",
    topup: "BazePay Wallet",
    refund: "Merchant refund",
  };
  return map[category] ?? "Online";
}

function TxnDetail() {
  const { card, txn } = Route.useLoaderData();
  const navigate = useNavigate();
  const [copied, setCopied] = useState<string | null>(null);

  const isCredit = txn.amountNgn > 0;
  const date = new Date(txn.at);
  const dateStr = date.toLocaleDateString("en-NG", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const timeStr = date.toLocaleTimeString("en-NG", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const refId = `BZ-${txn.id.toUpperCase()}-${date.getFullYear()}`;
  const fee = isCredit ? 0 : Math.round(Math.abs(txn.amountNgn) * 0.005);
  const last4 = card.pan.replace(/\s/g, "").slice(-4);

  const copy = (text: string, key: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(key);
        setTimeout(() => setCopied(null), 1400);
      });
    }
  };

  return (
    <div className="min-h-full bg-background text-foreground flex flex-col">
      <div className="h-10" />
      <div className="px-6 pt-4 flex items-center justify-between">
        <button
          onClick={() => navigate({ to: "/cards/$id", params: { id: card.id } })}
          className="w-10 h-10 rounded-full bg-card text-card-foreground flex items-center justify-center"
          aria-label="Back"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <button
          onClick={async () => {
            const text = `${txn.merchant} · ${formatNgn(Math.abs(txn.amountNgn))} · ${refId}`;
            if (typeof navigator !== "undefined" && (navigator as Navigator & { share?: (data: ShareData) => Promise<void> }).share) {
              try {
                await (navigator as Navigator & { share: (data: ShareData) => Promise<void> }).share({ title: "BazePay receipt", text });
              } catch {}
            } else {
              copy(text, "share");
              toast.success("Receipt copied");
            }
          }}
          className="w-10 h-10 rounded-full bg-card text-card-foreground flex items-center justify-center"
          aria-label="Share receipt"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      {/* Hero */}
      <div className="px-6 mt-6 text-center">
        <div
          className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center text-xl font-display font-bold text-white shadow-[0_12px_30px_-12px_rgba(0,0,0,0.4)]"
          style={{
            background: `linear-gradient(135deg, ${card.gradient.from}, ${card.gradient.to})`,
          }}
        >
          {txn.merchant.slice(0, 1).toUpperCase()}
        </div>
        <p className="text-[11px] uppercase tracking-[0.18em] font-bold text-foreground/55 mt-4">
          {isCredit ? "Received" : "Paid to"}
        </p>
        <h1 className="font-display text-2xl font-bold tracking-tight mt-1">{txn.merchant}</h1>
        <p
          className={`font-display text-4xl font-bold tabular-nums mt-3 ${
            isCredit ? "text-emerald-500" : ""
          }`}
        >
          {isCredit ? "+" : "−"}
          {formatNgn(Math.abs(txn.amountNgn))}
        </p>
        <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-card-foreground/[0.06] text-[10px] font-bold uppercase tracking-wider">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              txn.status === "settled"
                ? "bg-emerald-500"
                : txn.status === "pending"
                  ? "bg-amber-500"
                  : "bg-red-500"
            }`}
          />
          {txn.status}
        </div>
      </div>

      <div className="flex-1 mt-7 bg-card text-card-foreground rounded-t-[2rem] px-6 pt-6 pb-32 space-y-5">
        {/* Breakdown */}
        <div className="rounded-2xl bg-card-foreground/[0.04] p-4 space-y-3">
          <Row label="Amount" value={formatNgn(Math.abs(txn.amountNgn))} />
          <Row label="Fee" value={fee === 0 ? "Free" : formatNgn(fee)} />
          <div className="h-px bg-card-foreground/[0.08]" />
          <Row
            label="Total"
            value={formatNgn(Math.abs(txn.amountNgn) + fee)}
            bold
          />
        </div>

        {/* Meta */}
        <div className="rounded-2xl bg-card-foreground/[0.04] p-4 divide-y divide-card-foreground/[0.06]">
          <MetaRow icon={<Receipt className="w-4 h-4" />} label="Date" value={`${dateStr} · ${timeStr}`} />
          <MetaRow
            icon={<CreditCard className="w-4 h-4" />}
            label="Card"
            value={`${card.label} · ${card.brand} •••• ${last4}`}
          />
          <MetaRow
            icon={<MapPin className="w-4 h-4" />}
            label="Channel"
            value={categoryLocation(txn.category)}
          />
          <MetaRow
            icon={<Hash className="w-4 h-4" />}
            label="Reference"
            value={refId}
            action={
              <button
                onClick={() => copy(refId, "ref")}
                className="text-[11px] font-bold text-primary flex items-center gap-1"
              >
                {copied === "ref" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied === "ref" ? "Copied" : "Copy"}
              </button>
            }
          />
        </div>

        {/* Category badge */}
        <div className="rounded-2xl bg-card-foreground/[0.04] p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] uppercase tracking-wider font-bold text-card-foreground/55">
              Category
            </p>
            <p className="text-sm font-bold capitalize">{txn.category}</p>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-card-foreground/[0.06]">
            3-D Secure
          </span>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button className="h-12 rounded-2xl bg-card-foreground/[0.06] text-sm font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition">
            <Flag className="w-4 h-4" /> Report problem
          </button>
          <Link
            to="/cards/$id"
            params={{ id: card.id }}
            className="h-12 rounded-2xl bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition"
          >
            <Snowflake className="w-4 h-4" /> Manage card
          </Link>
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
    <div className="flex items-center justify-between">
      <span className={`text-[12px] ${bold ? "font-bold" : "text-card-foreground/65"}`}>{label}</span>
      <span
        className={`tabular-nums ${
          bold ? "font-display font-bold text-base" : "text-sm font-semibold"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function MetaRow({
  icon,
  label,
  value,
  action,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
      <div className="w-8 h-8 rounded-lg bg-card-foreground/[0.06] flex items-center justify-center text-card-foreground/70 shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] uppercase tracking-wider font-bold text-card-foreground/55">{label}</p>
        <p className="text-[13px] font-semibold truncate">{value}</p>
      </div>
      {action}
    </div>
  );
}
