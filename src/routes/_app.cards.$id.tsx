import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  Copy,
  Snowflake,
  Sun,
  Plus,
  Settings2,
  X,
  Trash2,
  ShieldCheck,
  Receipt,
  ChevronRight,
} from "lucide-react";
import { VirtualCardArt, RevealToggle } from "@/components/virtual-card";
import {
  cards,
  cardTxns,
  formatUsd,
  relativeDay,
  merchantCategories,
  type VirtualCard,
} from "@/lib/cards";

export const Route = createFileRoute("/_app/cards/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Card · ${params.id} · BazePay` },
      { name: "description", content: "Manage card limits, freeze, and review transactions." },
    ],
  }),
  loader: ({ params }) => {
    const card = cards.find((c) => c.id === params.id);
    if (!card) throw notFound();
    return { card };
  },
  notFoundComponent: () => (
    <div className="min-h-full flex flex-col items-center justify-center p-6 text-center">
      <p className="text-sm text-foreground/60">Card not found.</p>
      <Link to="/cards" className="mt-4 text-sm font-bold text-primary">
        Back to Cards
      </Link>
    </div>
  ),
  component: CardDetail,
});

function CardDetail() {
  const { card } = Route.useLoaderData();
  const navigate = useNavigate();
  const [revealed, setRevealed] = useState(false);
  const [frozen, setFrozen] = useState(card.status === "frozen");
  const [showLimits, setShowLimits] = useState(false);
  const [showFund, setShowFund] = useState(false);
  const [limit, setLimit] = useState(card.monthlyLimitUsd);
  const [blocked, setBlocked] = useState<string[]>(card.blockedCategories);
  const [copied, setCopied] = useState<string | null>(null);

  const txns = useMemo(
    () =>
      cardTxns
        .filter((t) => t.cardId === card.id)
        .sort((a, b) => +new Date(b.at) - +new Date(a.at)),
    [card.id],
  );

  const copy = (text: string, key: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(key);
        setTimeout(() => setCopied(null), 1400);
      });
    }
  };

  const display: VirtualCard = { ...card, status: frozen ? "frozen" : "active" };
  const pct = Math.min(100, Math.round((card.monthlySpentUsd / limit) * 100));

  return (
    <div className="min-h-full bg-background text-foreground flex flex-col">
      <div className="h-10" />
      <div className="px-6 pt-4 flex items-center justify-between">
        <button
          onClick={() => navigate({ to: "/cards" })}
          className="w-10 h-10 rounded-full bg-card text-card-foreground flex items-center justify-center"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => setShowLimits(true)}
          className="w-10 h-10 rounded-full bg-card text-card-foreground flex items-center justify-center"
          aria-label="Manage"
        >
          <Settings2 className="w-5 h-5" />
        </button>
      </div>

      <div className="px-6 mt-5">
        <VirtualCardArt card={display} revealed={revealed} size="lg" />
      </div>

      {/* Reveal + copy */}
      <div className="px-6 mt-4 flex items-center gap-2">
        <RevealToggle on={revealed} onClick={() => setRevealed((v) => !v)} />
        <button
          onClick={() => copy(card.pan.replace(/\s/g, ""), "pan")}
          className="h-10 px-4 rounded-full bg-card-foreground/[0.06] text-sm font-bold flex items-center gap-1.5 active:scale-[0.98] transition"
        >
          {copied === "pan" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied === "pan" ? "Copied" : "Copy PAN"}
        </button>
        <button
          onClick={() => copy(card.cvv, "cvv")}
          className="h-10 px-4 rounded-full bg-card-foreground/[0.06] text-sm font-bold flex items-center gap-1.5 active:scale-[0.98] transition"
        >
          {copied === "cvv" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          CVV
        </button>
      </div>

      {/* Quick actions */}
      <div className="px-6 mt-4 grid grid-cols-3 gap-2">
        <ActionTile
          icon={frozen ? <Sun className="w-4 h-4" /> : <Snowflake className="w-4 h-4" />}
          label={frozen ? "Unfreeze" : "Freeze"}
          onClick={() => setFrozen((v) => !v)}
          active={frozen}
        />
        <ActionTile
          icon={<Plus className="w-4 h-4" />}
          label="Top up"
          onClick={() => setShowFund(true)}
        />
        <ActionTile
          icon={<Settings2 className="w-4 h-4" />}
          label="Limits"
          onClick={() => setShowLimits(true)}
        />
      </div>

      <div className="flex-1 mt-6 bg-card text-card-foreground rounded-t-[2rem] px-6 pt-6 pb-28 space-y-6">
        {/* Spend */}
        <div className="rounded-2xl bg-card-foreground/[0.04] p-4">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-wider text-card-foreground/55">
              Monthly spend
            </p>
            <p className="text-[11px] tabular-nums text-card-foreground/65">
              {formatUsd(card.monthlySpentUsd)} / {formatUsd(limit)}
            </p>
          </div>
          <div className="mt-3 h-2 rounded-full bg-card-foreground/[0.08] overflow-hidden">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-card-foreground/50">Balance</p>
              <p className="font-display font-bold text-xl tabular-nums mt-1">{formatUsd(card.balanceUsd)}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-card-foreground/50">Status</p>
              <p className="font-display font-bold text-xl mt-1 capitalize">
                {frozen ? "Frozen" : "Active"}
              </p>
            </div>
          </div>
        </div>

        {/* Transactions */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="font-display font-bold text-base">Recent activity</h2>
            <span className="text-[11px] text-card-foreground/55">{txns.length} txns</span>
          </div>
          {txns.length === 0 ? (
            <div className="rounded-2xl bg-card-foreground/[0.04] p-6 text-center">
              <Receipt className="w-6 h-6 text-card-foreground/40 mx-auto" />
              <p className="text-[12px] text-card-foreground/55 mt-2">No transactions yet.</p>
            </div>
          ) : (
            <div className="rounded-2xl bg-card-foreground/[0.04] divide-y divide-card-foreground/[0.06] overflow-hidden">
              {txns.map((t) => {
                const isCredit = t.amountUsd > 0;
                return (
                  <div
                    key={t.id}
                    className="flex items-center gap-3 px-4 py-3.5"
                  >
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold ${
                        isCredit ? "bg-success/15 text-success" : "bg-card-foreground/[0.06] text-card-foreground/70"
                      }`}
                    >
                      {t.merchant.slice(0, 1)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{t.merchant}</p>
                      <p className="text-[11px] text-card-foreground/55 capitalize">
                        {t.category} · {relativeDay(t.at)}
                        {t.status !== "settled" && (
                          <span className="ml-1.5 text-amber-600 font-bold uppercase tracking-wider text-[9px]">
                            · {t.status}
                          </span>
                        )}
                      </p>
                    </div>
                    <p
                      className={`font-display font-bold text-sm tabular-nums shrink-0 ${
                        isCredit ? "text-success" : "text-card-foreground"
                      }`}
                    >
                      {isCredit ? "+" : "−"}
                      {formatUsd(Math.abs(t.amountUsd))}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-card-foreground/[0.04] p-4 flex items-start gap-3">
          <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <p className="text-[12px] text-card-foreground/65 leading-relaxed">
            See something you don't recognise? Freeze the card and contact support.
          </p>
        </div>
      </div>

      {showLimits && (
        <LimitsSheet
          limit={limit}
          setLimit={setLimit}
          blocked={blocked}
          setBlocked={setBlocked}
          onClose={() => setShowLimits(false)}
        />
      )}
      {showFund && <FundSheet onClose={() => setShowFund(false)} />}
    </div>
  );
}

function ActionTile({
  icon,
  label,
  onClick,
  active,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`h-12 rounded-2xl flex items-center justify-center gap-1.5 text-[12px] font-bold transition active:scale-[0.98] ${
        active
          ? "bg-primary text-primary-foreground"
          : "bg-card text-card-foreground"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function LimitsSheet({
  limit,
  setLimit,
  blocked,
  setBlocked,
  onClose,
}: {
  limit: number;
  setLimit: (n: number) => void;
  blocked: string[];
  setBlocked: (b: string[]) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[80] flex items-end">
      <button onClick={onClose} className="absolute inset-0 bg-black/70 backdrop-blur-sm" aria-label="Close" />
      <div className="relative w-full bg-card text-card-foreground rounded-t-[2rem] pt-3 pb-8 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
        <div className="w-10 h-1 rounded-full bg-card-foreground/15 mx-auto" />
        <div className="px-6 mt-4 flex items-center justify-between">
          <h3 className="font-display font-bold text-lg">Limits & controls</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-card-foreground/[0.06] flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 mt-5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-card-foreground/55 mb-2">
            Monthly limit
          </p>
          <p className="font-display font-bold text-3xl tabular-nums">{formatUsd(limit)}</p>
          <input
            type="range"
            min={50}
            max={5000}
            step={50}
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="w-full mt-3 accent-primary"
          />
          <div className="flex justify-between text-[10px] text-card-foreground/55 tabular-nums">
            <span>$50</span>
            <span>$5,000</span>
          </div>
        </div>

        <div className="px-6 mt-6">
          <p className="text-[11px] font-bold uppercase tracking-wider text-card-foreground/55 mb-2">
            Blocked merchant categories
          </p>
          <div className="space-y-2">
            {merchantCategories.map((c) => {
              const on = blocked.includes(c.id);
              return (
                <button
                  key={c.id}
                  onClick={() =>
                    setBlocked(on ? blocked.filter((b) => b !== c.id) : [...blocked, c.id])
                  }
                  className="w-full rounded-2xl bg-card-foreground/[0.04] px-4 py-3 flex items-center justify-between"
                >
                  <span className="text-sm font-semibold">{c.label}</span>
                  <div
                    className={`w-11 h-6 rounded-full transition relative ${
                      on ? "bg-destructive" : "bg-card-foreground/[0.12]"
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${
                        on ? "left-[22px]" : "left-0.5"
                      }`}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="px-6 mt-6 space-y-2">
          <button
            onClick={onClose}
            className="w-full h-12 rounded-full bg-primary text-primary-foreground font-bold text-sm"
          >
            Save changes
          </button>
          <button className="w-full h-12 rounded-full bg-destructive/10 text-destructive font-bold text-sm flex items-center justify-center gap-2">
            <Trash2 className="w-4 h-4" /> Cancel card
          </button>
        </div>
      </div>
    </div>
  );
}

function FundSheet({ onClose }: { onClose: () => void }) {
  const [amount, setAmount] = useState(50);
  return (
    <div className="fixed inset-0 z-[80] flex items-end">
      <button onClick={onClose} className="absolute inset-0 bg-black/70 backdrop-blur-sm" aria-label="Close" />
      <div className="relative w-full bg-card text-card-foreground rounded-t-[2rem] pt-3 pb-8 animate-in slide-in-from-bottom duration-300">
        <div className="w-10 h-1 rounded-full bg-card-foreground/15 mx-auto" />
        <div className="px-6 mt-4 flex items-center justify-between">
          <h3 className="font-display font-bold text-lg">Top up card</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-card-foreground/[0.06] flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 mt-5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-card-foreground/55 mb-2">
            Amount (USD)
          </p>
          <input
            type="number"
            value={amount}
            min={5}
            onChange={(e) => setAmount(Math.max(0, Number(e.target.value) || 0))}
            className="w-full h-14 rounded-2xl bg-card-foreground/[0.04] px-4 text-2xl font-bold tabular-nums outline-none"
          />
          <div className="grid grid-cols-4 gap-2 mt-3">
            {[25, 50, 100, 250].map((a) => (
              <button
                key={a}
                onClick={() => setAmount(a)}
                className="h-10 rounded-full bg-card-foreground/[0.04] text-sm font-bold tabular-nums"
              >
                ${a}
              </button>
            ))}
          </div>
        </div>

        <div className="px-6 mt-5 rounded-2xl mx-6 bg-card-foreground/[0.04] p-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-card-foreground/55">From</p>
            <p className="text-sm font-semibold">USD Wallet</p>
          </div>
          <ChevronRight className="w-4 h-4 text-card-foreground/40" />
        </div>

        <div className="px-6 mt-5">
          <button
            disabled={amount < 5}
            onClick={onClose}
            className="w-full h-12 rounded-full bg-primary text-primary-foreground font-bold text-sm disabled:opacity-40"
          >
            Top up · {formatUsd(amount)}
          </button>
        </div>
      </div>
    </div>
  );
}
