import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft,
  Search,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  CreditCard,
  Building2,
  Banknote,
  Check,
  X,
  ChevronRight,
} from "lucide-react";
import { wallets, type CurrencyCode } from "@/lib/wallets";
import { BottomNav } from "@/components/bottom-nav";
import { CurrencySwitcher } from "@/components/currency-switcher";

// NGN is the single real wallet. Other currencies are display conversions only.
const NGN_BASE = 845320.5;
const rates: Record<CurrencyCode, number> = { NGN: 1, USD: 1 / 1542, EUR: 1 / 1540, GBP: 1 / 1952 };
const formatAmount = (n: number) => {
  const [whole, dec = "00"] = n.toFixed(2).split(".");
  return { whole: Number(whole).toLocaleString("en-US"), decimals: "." + dec };
};

export const Route = createFileRoute("/_app/wallet")({
  head: () => ({
    meta: [
      { title: "Wallet — BazePay" },
      { name: "description", content: "Manage your multi-currency BazePay wallet, top up with international cards, and send money in Nigeria." },
    ],
  }),
  component: WalletPage,
});

type Filter = "all" | "in" | "out";

const txns = [
  { id: "t1", title: "Top up · Visa •• 4421", amount: "+₦250,000.00", isCredit: true, time: "Today · 09:14", status: "Success", group: "Today" },
  { id: "t2", title: "MTN Airtime", amount: "-₦5,000.00", isCredit: false, time: "Today · 08:02", status: "Success", group: "Today" },
  { id: "t3", title: "Spotify", amount: "-₦1,900.00", isCredit: false, time: "Yesterday · 19:40", status: "Success", group: "Yesterday" },
  { id: "t4", title: "Ikeja Electric", amount: "-₦15,000.00", isCredit: false, time: "Yesterday · 11:20", status: "Success", group: "Yesterday" },
  { id: "t5", title: "eSIM · UK 5GB", amount: "-$18.00", isCredit: false, time: "May 5 · 16:00", status: "Success", group: "Earlier" },
  { id: "t6", title: "DStv Compact+", amount: "-₦19,800.00", isCredit: false, time: "May 4 · 10:00", status: "Success", group: "Earlier" },
  { id: "t7", title: "From Tunde A.", amount: "+₦50,000.00", isCredit: true, time: "May 3 · 14:32", status: "Success", group: "Earlier" },
  { id: "t8", title: "SportyBet Top-up", amount: "-₦10,000.00", isCredit: false, time: "May 2 · 20:11", status: "Pending", group: "Earlier" },
];

const groups: Array<"Today" | "Yesterday" | "Earlier"> = ["Today", "Yesterday", "Earlier"];

function WalletPage() {
  const [active, setActive] = useState<CurrencyCode>("NGN");
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [sheet, setSheet] = useState<null | "fund" | "payout">(null);

  const filtered = txns.filter((t) => {
    if (filter === "in" && !t.isCredit) return false;
    if (filter === "out" && t.isCredit) return false;
    if (query && !t.title.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-full bg-background text-foreground flex flex-col">
      <div className="h-10" />

      {/* Header */}
      <div className="px-6 pt-2 flex items-center justify-between">
        <button className="w-9 h-9 rounded-full bg-white/8 border border-white/10 flex items-center justify-center">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="font-display font-bold text-base">Wallet</h1>
        <button className="w-9 h-9 rounded-full bg-white/8 border border-white/10 flex items-center justify-center">
          <Search className="w-4 h-4" />
        </button>
      </div>

      {/* Currency cards horizontal scroll */}
      <div className="mt-5 flex gap-3 px-6 overflow-x-auto no-scrollbar pb-1">
        {currencyOrder.map((code) => {
          const w = wallets[code];
          const isActive = active === code;
          return (
            <button
              key={code}
              onClick={() => setActive(code)}
              className={`shrink-0 w-44 text-left rounded-2xl p-4 border transition ${
                isActive
                  ? "bg-gradient-primary border-transparent shadow-glow"
                  : "bg-white/[0.05] border-white/10"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full" style={{ background: w.gradient }} />
                <span className="text-xs font-semibold opacity-80">{code}</span>
              </div>
              <p className="font-display text-2xl font-bold mt-3">
                {w.symbol}
                {w.whole}
                <span className="opacity-50">{w.decimals}</span>
              </p>
              <p className="text-[10px] opacity-60 mt-1">{w.rate}</p>
            </button>
          );
        })}
      </div>

      {/* Actions */}
      <div className="px-6 mt-5 grid grid-cols-3 gap-3">
        <ActionBtn icon={Plus} label="Top up" onClick={() => setSheet("fund")} primary />
        <ActionBtn icon={ArrowUpRight} label="Send" />
        <ActionBtn icon={ArrowDownLeft} label="Payout" onClick={() => setSheet("payout")} />
      </div>

      {/* Sheet */}
      <div className="flex-1 mt-7 bg-card text-card-foreground rounded-t-[2rem] px-6 pt-6 pb-28">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-lg">Transactions</h2>
          <span className="text-[11px] text-card-foreground/50">{filtered.length} entries</span>
        </div>

        {/* Search */}
        <div className="mt-4 flex items-center gap-2 bg-accent rounded-full px-4 h-11">
          <Search className="w-4 h-4 text-card-foreground/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search transactions"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-card-foreground/40"
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-card-foreground/40">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter chips */}
        <div className="mt-3 flex gap-2">
          {(["all", "in", "out"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs font-semibold px-3.5 py-1.5 rounded-full border transition ${
                filter === f
                  ? "bg-primary text-primary-foreground border-transparent"
                  : "bg-transparent text-card-foreground/70 border-card-foreground/15"
              }`}
            >
              {f === "all" ? "All" : f === "in" ? "Money in" : "Money out"}
            </button>
          ))}
        </div>

        {/* Grouped list */}
        <div className="mt-5 space-y-5">
          {groups.map((g) => {
            const items = filtered.filter((t) => t.group === g);
            if (items.length === 0) return null;
            return (
              <div key={g}>
                <p className="text-[11px] font-bold uppercase tracking-wider text-card-foreground/40 mb-2">
                  {g}
                </p>
                <div className="space-y-3">
                  {items.map((t) => (
                    <div key={t.id} className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          t.isCredit ? "bg-success/15 text-success" : "bg-accent text-card-foreground/70"
                        }`}
                      >
                        {t.isCredit ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{t.title}</p>
                        <p className="text-[11px] text-card-foreground/45 mt-0.5">{t.time}</p>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-sm font-bold ${
                            t.isCredit ? "text-primary" : "text-card-foreground"
                          }`}
                        >
                          {t.amount}
                        </p>
                        <p
                          className={`text-[10px] mt-0.5 font-semibold ${
                            t.status === "Pending" ? "text-orange-500" : "text-card-foreground/40"
                          }`}
                        >
                          {t.status}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <p className="text-center text-sm text-card-foreground/40 py-10">
              No transactions match your filters.
            </p>
          )}
        </div>
      </div>

      {sheet && <Sheet kind={sheet} currency={active} onClose={() => setSheet(null)} />}

      <BottomNav />
    </div>
  );
}

function ActionBtn({
  icon: Icon,
  label,
  primary,
  onClick,
}: {
  icon: typeof Plus;
  label: string;
  primary?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`h-12 rounded-2xl font-semibold text-xs flex items-center justify-center gap-1.5 active:scale-[0.98] transition ${
        primary
          ? "bg-lime text-lime-foreground"
          : "bg-white/[0.05] text-foreground border border-white/10"
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}

function Sheet({
  kind,
  currency,
  onClose,
}: {
  kind: "fund" | "payout";
  currency: CurrencyCode;
  onClose: () => void;
}) {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const w = wallets[currency];

  const fundMethods = [
    { id: "card", label: "International card", sub: "Visa, Mastercard · Instant", icon: CreditCard },
    { id: "bank", label: "Bank transfer", sub: "Wire · 1–3 days", icon: Building2 },
    { id: "gateway", label: "Local gateway", sub: "Flutterwave, Paystack", icon: Banknote },
  ];

  const payoutMethods = [
    { id: "ng-bank", label: "Nigerian bank account", sub: "GTBank, Access, Zenith…", icon: Building2 },
    { id: "intl", label: "International bank", sub: "SWIFT · 2–5 days", icon: Banknote },
  ];

  const methods = kind === "fund" ? fundMethods : payoutMethods;
  const title = kind === "fund" ? "Top up wallet" : "Withdraw funds";

  return (
    <div className="fixed inset-0 z-[60] flex items-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full bg-card text-card-foreground rounded-t-[2rem] p-6 pb-8 max-h-[88%] overflow-y-auto no-scrollbar animate-in slide-in-from-bottom duration-300"
      >
        <div className="w-10 h-1 rounded-full bg-card-foreground/15 mx-auto" />

        {done ? (
          <div className="text-center py-10">
            <div className="w-16 h-16 mx-auto rounded-full bg-success/15 text-success flex items-center justify-center">
              <Check className="w-8 h-8" />
            </div>
            <h3 className="font-display font-bold text-xl mt-5">Request submitted</h3>
            <p className="text-sm text-card-foreground/60 mt-1.5">
              {kind === "fund"
                ? `${w.symbol}${amount || "0"} will be credited shortly.`
                : `${w.symbol}${amount || "0"} payout initiated.`}
            </p>
            <button
              onClick={onClose}
              className="mt-7 w-full h-12 rounded-full bg-primary text-primary-foreground font-semibold"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mt-3">
              <h3 className="font-display font-bold text-lg">{title}</h3>
              <button onClick={onClose} className="text-card-foreground/40">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Amount */}
            <div className="mt-5 rounded-2xl bg-accent p-5">
              <p className="text-[11px] font-semibold text-card-foreground/50 uppercase tracking-wider">
                Amount ({currency})
              </p>
              <div className="flex items-baseline gap-2 mt-1.5">
                <span className="font-display text-3xl font-bold">{w.symbol}</span>
                <input
                  autoFocus
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="bg-transparent outline-none flex-1 font-display text-3xl font-bold placeholder:text-card-foreground/25"
                />
              </div>
              <div className="mt-3 flex gap-2">
                {["10,000", "50,000", "100,000"].map((q) => (
                  <button
                    key={q}
                    onClick={() => setAmount(q.replace(/,/g, ""))}
                    className="text-[11px] font-semibold px-3 py-1.5 rounded-full bg-card-foreground/5"
                  >
                    {w.symbol}{q}
                  </button>
                ))}
              </div>
            </div>

            {/* Methods */}
            <p className="text-[11px] font-semibold text-card-foreground/50 uppercase tracking-wider mt-6">
              {kind === "fund" ? "Pay with" : "Send to"}
            </p>
            <div className="mt-2 space-y-2">
              {methods.map((m) => {
                const Icon = m.icon;
                const selected = method === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setMethod(m.id)}
                    className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border transition ${
                      selected
                        ? "border-primary bg-primary/5"
                        : "border-card-foreground/10 bg-transparent"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                      <Icon className="w-4 h-4 text-card-foreground/70" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-sm">{m.label}</p>
                      <p className="text-[11px] text-card-foreground/50 mt-0.5">{m.sub}</p>
                    </div>
                    {selected ? (
                      <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                        <Check className="w-3 h-3" />
                      </div>
                    ) : (
                      <ChevronRight className="w-4 h-4 text-card-foreground/30" />
                    )}
                  </button>
                );
              })}
            </div>

            <button
              disabled={!amount || !method}
              onClick={() => setDone(true)}
              className="mt-6 w-full h-12 rounded-full bg-primary text-primary-foreground font-semibold disabled:opacity-40"
            >
              {kind === "fund" ? "Continue to pay" : "Confirm payout"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
