import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, ChevronRight, ShieldCheck, CreditCard, Sparkles } from "lucide-react";
import { BottomNav } from "@/components/bottom-nav";
import { VirtualCardArt } from "@/components/virtual-card";
import { cards, formatNgn, ISSUE_FEE_NGN } from "@/lib/cards";

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
  const totalNgn = cards.reduce((s, c) => s + c.balanceNgn, 0);

  return (
    <div className="min-h-full bg-background text-foreground flex flex-col">
      <div className="h-10" />
      <div className="px-6 pt-4 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Cards</h1>
          <p className="text-xs text-foreground/55 mt-1.5 tabular-nums">
            {cards.length} {cards.length === 1 ? "card" : "cards"} · {formatNgn(totalNgn)} total
          </p>
        </div>
        <Link
          to="/cards/new"
          className="h-10 px-4 rounded-full bg-primary text-primary-foreground text-[12px] font-bold flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Issue
        </Link>
      </div>

      <div className="flex-1 mt-6 bg-card text-card-foreground rounded-t-[2rem] px-6 pt-6 pb-32">
        {cards.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-5">
            {cards.map((c) => {
              const pct = Math.min(
                100,
                Math.round((c.monthlySpentNgn / c.monthlyLimitNgn) * 100),
              );
              return (
                <Link
                  key={c.id}
                  to="/cards/$id"
                  params={{ id: c.id }}
                  className="block active:scale-[0.99] transition"
                >
                  <VirtualCardArt card={c} />
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] text-card-foreground/55">Balance</p>
                      <p className="font-display font-bold text-lg tabular-nums">
                        {formatNgn(c.balanceNgn)}
                      </p>
                    </div>
                    <div className="flex-1 max-w-[170px]">
                      <div className="flex items-center justify-between text-[10px] text-card-foreground/55 mb-1 tabular-nums">
                        <span>Spent</span>
                        <span>
                          {formatNgn(c.monthlySpentNgn)} / {formatNgn(c.monthlyLimitNgn)}
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-card-foreground/[0.08] overflow-hidden">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-card-foreground/40" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        <div className="mt-7 rounded-2xl bg-card-foreground/[0.04] p-4 flex items-start gap-3">
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
