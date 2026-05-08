import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, ChevronRight, ShieldCheck, CreditCard } from "lucide-react";
import { BottomNav } from "@/components/bottom-nav";
import { VirtualCardArt } from "@/components/virtual-card";
import { cards, formatUsd } from "@/lib/cards";

export const Route = createFileRoute("/_app/cards/")({
  head: () => ({
    meta: [
      { title: "Virtual Cards · BazePay" },
      { name: "description", content: "Issue virtual Visa & Mastercard cards in NGN, USD or EUR." },
    ],
  }),
  component: CardsPage,
});

function CardsPage() {
  const totalUsd = cards.reduce((s, c) => s + c.balanceUsd, 0);

  return (
    <div className="min-h-full bg-background text-foreground flex flex-col">
      <div className="h-10" />
      <div className="px-6 pt-4 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Cards</h1>
          <p className="text-xs text-foreground/55 mt-1.5 tabular-nums">
            {cards.length} cards · {formatUsd(totalUsd)} total balance
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
                Math.round((c.monthlySpentUsd / c.monthlyLimitUsd) * 100),
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
                        {formatUsd(c.balanceUsd)}
                      </p>
                    </div>
                    <div className="flex-1 max-w-[160px]">
                      <div className="flex items-center justify-between text-[10px] text-card-foreground/55 mb-1 tabular-nums">
                        <span>Spent</span>
                        <span>
                          {formatUsd(c.monthlySpentUsd)} / {formatUsd(c.monthlyLimitUsd)}
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-card-foreground/[0.08] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${pct}%` }}
                        />
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
            Virtual cards are protected by 3-D Secure. Freeze instantly from the card detail screen if anything looks off.
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
      <p className="text-[12px] text-card-foreground/55 mt-1 max-w-[260px]">
        Issue a virtual Visa or Mastercard in seconds. Use it anywhere online.
      </p>
      <Link
        to="/cards/new"
        className="mt-5 h-11 px-5 rounded-full bg-primary text-primary-foreground font-bold text-sm inline-flex items-center gap-1.5"
      >
        <Plus className="w-4 h-4" /> Issue your first card
      </Link>
    </div>
  );
}
