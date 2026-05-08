import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, ShieldCheck, CreditCard, Sparkles, ArrowUpRight, Snowflake, Eye, Layers } from "lucide-react";
import { BottomNav } from "@/components/bottom-nav";
import { VirtualCardArt } from "@/components/virtual-card";
import { formatNgn, ISSUE_FEE_NGN, relativeDay } from "@/lib/cards";
import { useCardsStore } from "@/lib/cards-store";

export const Route = createFileRoute("/_app/cards/")({
  head: () => ({
    meta: [
      { title: "Virtual Cards · BazePay" },
      { name: "description", content: "Issue Naira virtual Visa & Mastercard cards." },
    ],
  }),
  component: CardsPage,
});

function CardsPage() {
  const navigate = useNavigate();
  const { cards, txns: allTxns } = useCardsStore();
  const [activeIdx, setActiveIdx] = useState(0);
  const safeIdx = Math.min(activeIdx, Math.max(0, cards.length - 1));
  const totalNgn = cards.reduce((s, c) => s + c.balanceNgn, 0);

  if (cards.length === 0) {
    return (
      <div className="min-h-full bg-background text-foreground flex flex-col">
        <div className="h-10" />
        <Header count={0} total={0} />
        <div className="flex-1 mt-6 bg-card text-card-foreground rounded-t-[2rem] px-6 pt-6 pb-32">
          <EmptyState />
        </div>
        <BottomNav />
      </div>
    );
  }

  const active = cards[safeIdx];
  const txns = allTxns
    .filter((t) => t.cardId === active.id)
    .sort((a, b) => +new Date(b.at) - +new Date(a.at))
    .slice(0, 4);
  const spendPct = Math.min(100, Math.round((active.monthlySpentNgn / active.monthlyLimitNgn) * 100));

  // Build stack ordering: active on top, others fanned behind
  const stackOrder = [
    active,
    ...cards.filter((_, i) => i !== safeIdx),
  ];

  return (
    <div className="min-h-full bg-background text-foreground flex flex-col">
      <div className="h-10" />
      <Header count={cards.length} total={totalNgn} />

      {/* Stacked wallet */}
      <div className="px-6 mt-3">
        <div
          className="relative mx-auto"
          style={{
            height: `calc(min(230px, 50vw) + ${(cards.length - 1) * 24}px)`,
            maxWidth: "380px",
          }}
        >
          {stackOrder.map((c, i) => {
            const isTop = i === 0;
            // bottom-anchored stack — top card sits at the bottom of the container
            const offsetFromBottom = i * 24;
            const realIdx = cards.findIndex((x) => x.id === c.id);
            return (
              <button
                key={c.id}
                onClick={() => {
                  if (isTop) {
                    navigate({ to: "/cards/$id", params: { id: c.id } });
                  } else {
                    setActiveIdx(realIdx);
                  }
                }}
                className="absolute left-0 right-0 text-left transition-all duration-500 ease-out"
                style={{
                  bottom: `${offsetFromBottom}px`,
                  zIndex: cards.length - i,
                  transform: isTop ? "scale(1)" : `scale(${1 - i * 0.04})`,
                  filter: isTop ? "none" : `brightness(${1 - i * 0.12})`,
                }}
                aria-label={isTop ? `Open ${c.label} card` : `Bring ${c.label} card to front`}
              >
                <VirtualCardArt card={c} />
                {isTop && (
                  <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-black/30 backdrop-blur-md text-white rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider">
                    <Layers className="w-3 h-3" /> Tap to open
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Detail sheet for active card */}
      <div className="flex-1 mt-7 bg-card text-card-foreground rounded-t-[2rem] px-6 pt-6 pb-32">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-card-foreground/50 font-bold">
              {active.label} · {active.brand}
            </p>
            <p className="font-display text-3xl font-bold tracking-tight tabular-nums mt-1">
              {formatNgn(active.balanceNgn)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/cards/$id"
              params={{ id: active.id }}
              className="h-10 px-4 rounded-full bg-primary text-primary-foreground text-[12px] font-bold flex items-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5" /> Details
            </Link>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between text-[11px] text-card-foreground/55 mb-1.5 tabular-nums">
            <span className="font-bold uppercase tracking-wider text-[10px]">This month</span>
            <span>
              {formatNgn(active.monthlySpentNgn)} / {formatNgn(active.monthlyLimitNgn)}
            </span>
          </div>
          <div className="h-2 rounded-full bg-card-foreground/[0.08] overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${spendPct}%`,
                background: `linear-gradient(90deg, ${active.gradient.from}, ${active.gradient.to})`,
              }}
            />
          </div>
        </div>

        {/* Quick chips */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          <Link
            to="/cards/$id"
            params={{ id: active.id }}
            className="rounded-2xl bg-card-foreground/[0.04] hover:bg-card-foreground/[0.07] transition p-3.5 flex items-center gap-3"
          >
            <div className="w-9 h-9 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0">
              <ArrowUpRight className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[12px] font-bold">Top up</p>
              <p className="text-[10px] text-card-foreground/55">From wallet</p>
            </div>
          </Link>
          <Link
            to="/cards/$id"
            params={{ id: active.id }}
            className="rounded-2xl bg-card-foreground/[0.04] hover:bg-card-foreground/[0.07] transition p-3.5 flex items-center gap-3"
          >
            <div className="w-9 h-9 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0">
              <Snowflake className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[12px] font-bold">
                {active.status === "frozen" ? "Unfreeze" : "Freeze"}
              </p>
              <p className="text-[10px] text-card-foreground/55">Pause spending</p>
            </div>
          </Link>
        </div>

        {/* Recent txns */}
        <div className="mt-7">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-bold text-base">Recent activity</h3>
            <Link
              to="/cards/$id"
              params={{ id: active.id }}
              className="text-[11px] font-bold text-primary"
            >
              See all
            </Link>
          </div>
          {txns.length === 0 ? (
            <p className="text-[12px] text-card-foreground/55 py-6 text-center">No activity yet.</p>
          ) : (
            <ul className="divide-y divide-card-foreground/[0.06]">
              {txns.map((t) => {
                const isCredit = t.amountNgn > 0;
                return (
                  <li key={t.id}>
                    <Link
                      to="/cards/$id/txn/$txnId"
                      params={{ id: active.id, txnId: t.id }}
                      className="flex items-center gap-3 py-3 active:opacity-70 transition"
                    >
                      <div className="w-9 h-9 rounded-xl bg-card-foreground/[0.06] flex items-center justify-center text-[11px] font-bold uppercase shrink-0">
                        {t.merchant.slice(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-bold truncate">{t.merchant}</p>
                        <p className="text-[10px] text-card-foreground/50 capitalize">
                          {relativeDay(t.at)} · {t.status}
                        </p>
                      </div>
                      <p
                        className={`text-[13px] font-bold tabular-nums ${
                          isCredit ? "text-emerald-500" : ""
                        }`}
                      >
                        {isCredit ? "+" : ""}
                        {formatNgn(t.amountNgn)}
                      </p>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="mt-6 rounded-2xl bg-card-foreground/[0.04] p-4 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="text-[12px] text-card-foreground/70 leading-relaxed">
            All BazePay cards are Naira virtual cards protected by 3-D Secure. Freeze instantly from card details if anything looks off.
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

function Header({ count, total }: { count: number; total: number }) {
  return (
    <div className="px-6 pt-4 flex items-center justify-between">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Wallet</h1>
        <p className="text-xs text-foreground/55 mt-1.5 tabular-nums">
          {count} {count === 1 ? "card" : "cards"} · {formatNgn(total)} total
        </p>
      </div>
      <Link
        to="/cards/new"
        className="h-10 px-4 rounded-full bg-primary text-primary-foreground text-[12px] font-bold flex items-center gap-1.5"
      >
        <Plus className="w-4 h-4" /> Issue
      </Link>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center text-center py-10">
      <div className="w-16 h-16 rounded-2xl bg-primary/15 text-primary flex items-center justify-center">
        <CreditCard className="w-7 h-7" />
      </div>
      <h3 className="font-display font-bold text-lg mt-4">No cards yet</h3>
      <p className="text-[12px] text-card-foreground/55 mt-1 max-w-[270px]">
        Issue a Naira virtual card to pay online anywhere Visa or Mastercard is accepted. One-time fee {formatNgn(ISSUE_FEE_NGN)}.
      </p>
      <Link
        to="/cards/new"
        className="mt-5 h-11 px-5 rounded-full bg-primary text-primary-foreground font-bold text-sm inline-flex items-center gap-1.5"
      >
        <Sparkles className="w-4 h-4" /> Issue your first card
      </Link>
    </div>
  );
}
