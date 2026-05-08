import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
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
  SlidersHorizontal,
  Calendar as CalendarIcon,
  Copy,
  Share2,
  Download,
  HelpCircle,
} from "lucide-react";
import { wallets, type CurrencyCode } from "@/lib/wallets";
import { BottomNav } from "@/components/bottom-nav";
import { CurrencySwitcher } from "@/components/currency-switcher";
import { txns, dayLabel, type Txn } from "@/lib/transactions";

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

type Direction = "all" | "in" | "out";
type StatusFilter = "all" | "success" | "pending";
type DateRange = "all" | "today" | "7d" | "30d" | "custom";

type Filters = {
  direction: Direction;
  status: StatusFilter;
  date: DateRange;
  customFrom?: string;
  customTo?: string;
};
const defaultFilters: Filters = { direction: "all", status: "all", date: "all" };


function WalletPage() {
  const navigate = useNavigate();
  const [active, setActive] = useState<CurrencyCode>("NGN");
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [filterOpen, setFilterOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [sheet, setSheet] = useState<null | "fund" | "payout">(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const dayLimit =
    filters.date === "today" ? 0 : filters.date === "7d" ? 7 : filters.date === "30d" ? 30 : Infinity;
  const activeCount =
    (filters.direction !== "all" ? 1 : 0) +
    (filters.status !== "all" ? 1 : 0) +
    (filters.date !== "all" ? 1 : 0);

  const customRange = (() => {
    if (filters.date !== "custom" || !filters.customFrom || !filters.customTo) return null;
    const from = new Date(filters.customFrom);
    const to = new Date(filters.customTo);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const fromDays = Math.floor((today.getTime() - from.getTime()) / 86400000);
    const toDays = Math.floor((today.getTime() - to.getTime()) / 86400000);
    return { min: Math.min(fromDays, toDays), max: Math.max(fromDays, toDays) };
  })();

  const filtered = txns.filter((t) => {
    if (filters.direction === "in" && !t.isCredit) return false;
    if (filters.direction === "out" && t.isCredit) return false;
    if (filters.status === "success" && t.status !== "Success") return false;
    if (filters.status === "pending" && t.status !== "Pending") return false;
    if (filters.date === "today" && t.daysAgo > 0) return false;
    if ((filters.date === "7d" || filters.date === "30d") && t.daysAgo > dayLimit) return false;
    if (filters.date === "custom" && customRange) {
      if (t.daysAgo < customRange.min || t.daysAgo > customRange.max) return false;
    }
    if (query && !t.title.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-full bg-background text-foreground flex flex-col">
      <div className="h-10" />

      {/* Header */}
      <div className="px-6 pt-2 flex items-center justify-between">
        <button
          onClick={() => navigate({ to: "/home" })}
          className="w-9 h-9 rounded-full bg-white/8 border border-white/10 flex items-center justify-center"
          aria-label="Back"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="font-display font-bold text-base">Wallet</h1>
        <button
          onClick={() => searchRef.current?.focus()}
          className="w-9 h-9 rounded-full bg-white/8 border border-white/10 flex items-center justify-center"
          aria-label="Search transactions"
        >
          <Search className="w-4 h-4" />
        </button>
      </div>

      {/* Single NGN wallet — switcher only changes display currency */}
      <div className="mx-6 mt-5 rounded-3xl p-5 bg-gradient-primary shadow-glow">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className="w-5 h-5 rounded-full"
              style={{ background: wallets.NGN.gradient }}
            />
            <span className="text-xs font-semibold opacity-90">Main wallet · NGN</span>
          </div>
          <CurrencySwitcher value={active} onChange={setActive} />
        </div>
        {(() => {
          const display = formatAmount(NGN_BASE * rates[active]);
          return (
            <p className="font-display text-3xl font-bold mt-4">
              {wallets[active].symbol}
              {display.whole}
              <span className="opacity-50">{display.decimals}</span>
            </p>
          );
        })()}
        <p className="text-[11px] opacity-70 mt-1">
          {active === "NGN"
            ? "Available balance"
            : `≈ ${wallets.NGN.symbol}${formatAmount(NGN_BASE).whole}${formatAmount(NGN_BASE).decimals} · ${wallets[active].rate}`}
        </p>
      </div>

      {/* Actions */}
      <div className="px-6 mt-5 grid grid-cols-3 gap-3">
        <ActionBtn icon={Plus} label="Top up" onClick={() => setSheet("fund")} primary />
        <ActionBtn icon={ArrowUpRight} label="Send" />
        <ActionBtn icon={CreditCard} label="Cards" />
      </div>

      {/* Sheet */}
      <div className="flex-1 mt-7 bg-card text-card-foreground rounded-t-[2rem] px-6 pt-6 pb-28">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-lg">Transactions</h2>
          <FilterTrigger count={activeCount} onClick={() => setFilterOpen(true)} />
        </div>

        {/* Search */}
        <div className="mt-4 flex items-center gap-2 bg-accent rounded-full px-4 h-11">
          <Search className="w-4 h-4 text-card-foreground/40" />
          <input
            ref={searchRef}
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

        {/* Day-grouped list */}
        <div className="mt-5 space-y-6">
          {(() => {
            const groups = new Map<number, Txn[]>();
            for (const t of filtered) {
              const arr = groups.get(t.daysAgo) ?? [];
              arr.push(t);
              groups.set(t.daysAgo, arr);
            }
            const sortedKeys = [...groups.keys()].sort((a, b) => a - b);
            return sortedKeys.map((d) => (
              <div key={d}>
                <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-card-foreground/45 mb-2 px-1">
                  {dayLabel(d)}
                </p>
                <div className="space-y-1">
                  {groups.get(d)!.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => navigate({ to: "/transaction/$id", params: { id: t.id } })}
                      className="w-full flex items-center gap-3 text-left -mx-2 px-2 py-2 rounded-xl active:bg-card-foreground/[0.04] transition"
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          t.isCredit ? "bg-success/15 text-success" : "bg-accent text-card-foreground/70"
                        }`}
                      >
                        {t.isCredit ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{t.title}</p>
                        <p className="text-[11px] text-card-foreground/45 mt-0.5">{t.time.split(" · ")[1] ?? t.time}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-bold ${t.isCredit ? "text-primary" : "text-card-foreground"}`}>
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
                    </button>
                  ))}
                </div>
              </div>
            ));
          })()}
          {filtered.length === 0 && (
            <p className="text-center text-sm text-card-foreground/40 py-10">
              No transactions match your filters.
            </p>
          )}
        </div>
      </div>

      {sheet && <Sheet kind={sheet} currency={active} onClose={() => setSheet(null)} />}
      {filterOpen && (
        <FilterSheet
          value={filters}
          onChange={setFilters}
          onClose={() => setFilterOpen(false)}
        />
      )}
      

      <BottomNav />
    </div>
  );
}

function FilterTrigger({ count, onClick }: { count: number; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 bg-card-foreground/5 border border-card-foreground/10 rounded-full px-3 py-1.5 text-[11px] font-semibold text-card-foreground/80"
    >
      <SlidersHorizontal className="w-3 h-3" />
      Filter
      {count > 0 && (
        <span className="bg-primary text-primary-foreground rounded-full w-4 h-4 flex items-center justify-center text-[9px] font-bold">
          {count}
        </span>
      )}
    </button>
  );
}

function FilterSheet({
  value,
  onChange,
  onClose,
}: {
  value: Filters;
  onChange: (f: Filters) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<Filters>(value);

  const directionOpts: { id: Direction; label: string; icon: typeof ArrowDownLeft }[] = [
    { id: "all", label: "All", icon: SlidersHorizontal },
    { id: "in", label: "Money in", icon: ArrowDownLeft },
    { id: "out", label: "Money out", icon: ArrowUpRight },
  ];
  const statusOpts: { id: StatusFilter; label: string }[] = [
    { id: "all", label: "Any" },
    { id: "success", label: "Success" },
    { id: "pending", label: "Pending" },
  ];
  const dateOpts: { id: DateRange; label: string; sub: string }[] = [
    { id: "all", label: "All time", sub: "Everything" },
    { id: "today", label: "Today", sub: "Last 24h" },
    { id: "7d", label: "Last 7 days", sub: "This week" },
    { id: "30d", label: "Last 30 days", sub: "This month" },
    { id: "custom", label: "Custom range", sub: "Pick start & end dates" },
  ];

  const todayISO = new Date().toISOString().slice(0, 10);

  const activeCount =
    (draft.direction !== "all" ? 1 : 0) +
    (draft.status !== "all" ? 1 : 0) +
    (draft.date !== "all" ? 1 : 0);

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[420px] bg-card text-card-foreground rounded-t-[2rem] pt-3 pb-8 max-h-[90%] overflow-y-auto no-scrollbar animate-in slide-in-from-bottom duration-300"
      >
        <div className="w-10 h-1 rounded-full bg-card-foreground/15 mx-auto" />

        <div className="px-6 mt-4 flex items-start justify-between">
          <div>
            <h3 className="font-display font-bold text-xl tracking-tight">Filters</h3>
            <p className="text-[12px] text-card-foreground/50 mt-0.5">
              {activeCount === 0 ? "Showing all transactions" : `${activeCount} filter${activeCount > 1 ? "s" : ""} applied`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-card-foreground/5 flex items-center justify-center text-card-foreground/60"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Type — segmented icon control */}
        <div className="px-6 mt-6">
          <p className="text-[11px] font-semibold text-card-foreground/45 uppercase tracking-[0.14em] mb-3">
            Type
          </p>
          <div className="grid grid-cols-3 gap-2 p-1 bg-card-foreground/[0.04] rounded-2xl">
            {directionOpts.map((o) => {
              const Icon = o.icon;
              const selected = draft.direction === o.id;
              return (
                <button
                  key={o.id}
                  onClick={() => setDraft({ ...draft, direction: o.id })}
                  className={`relative h-16 rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${
                    selected
                      ? "bg-card shadow-sm text-card-foreground"
                      : "text-card-foreground/55"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${selected && o.id === "in" ? "text-success" : selected && o.id === "out" ? "text-primary" : ""}`} />
                  <span className="text-[11px] font-semibold">{o.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Status — minimal pills */}
        <div className="px-6 mt-6">
          <p className="text-[11px] font-semibold text-card-foreground/45 uppercase tracking-[0.14em] mb-3">
            Status
          </p>
          <div className="flex gap-2">
            {statusOpts.map((o) => {
              const selected = draft.status === o.id;
              return (
                <button
                  key={o.id}
                  onClick={() => setDraft({ ...draft, status: o.id })}
                  className={`flex-1 h-11 rounded-full text-xs font-semibold transition ${
                    selected
                      ? "bg-foreground text-background"
                      : "bg-card-foreground/[0.04] text-card-foreground/70"
                  }`}
                >
                  {o.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Date — list rows with radio */}
        <div className="px-6 mt-6">
          <p className="text-[11px] font-semibold text-card-foreground/45 uppercase tracking-[0.14em] mb-3">
            Date range
          </p>
          <div className="rounded-2xl bg-card-foreground/[0.04] divide-y divide-card-foreground/[0.06] overflow-hidden">
            {dateOpts.map((o) => {
              const selected = draft.date === o.id;
              const isCustom = o.id === "custom";
              return (
                <div key={o.id}>
                  <button
                    onClick={() => setDraft({ ...draft, date: o.id })}
                    className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
                  >
                    {isCustom && (
                      <CalendarIcon className="w-4 h-4 text-card-foreground/50" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{o.label}</p>
                      <p className="text-[11px] text-card-foreground/45 mt-0.5">{o.sub}</p>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${
                        selected ? "border-primary bg-primary" : "border-card-foreground/20"
                      }`}
                    >
                      {selected && <Check className="w-3 h-3 text-primary-foreground" strokeWidth={3} />}
                    </div>
                  </button>
                  {isCustom && selected && (
                    <div className="px-4 pb-4 pt-1 grid grid-cols-2 gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                      <label className="block">
                        <span className="text-[10px] font-semibold text-card-foreground/45 uppercase tracking-wider">From</span>
                        <input
                          type="date"
                          max={draft.customTo || todayISO}
                          value={draft.customFrom || ""}
                          onChange={(e) => setDraft({ ...draft, customFrom: e.target.value })}
                          className="mt-1 w-full bg-card border border-card-foreground/10 rounded-xl px-3 h-11 text-sm font-semibold outline-none focus:border-primary"
                        />
                      </label>
                      <label className="block">
                        <span className="text-[10px] font-semibold text-card-foreground/45 uppercase tracking-wider">To</span>
                        <input
                          type="date"
                          min={draft.customFrom}
                          max={todayISO}
                          value={draft.customTo || ""}
                          onChange={(e) => setDraft({ ...draft, customTo: e.target.value })}
                          className="mt-1 w-full bg-card border border-card-foreground/10 rounded-xl px-3 h-11 text-sm font-semibold outline-none focus:border-primary"
                        />
                      </label>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 mt-7 flex gap-3">
          <button
            onClick={() => setDraft(defaultFilters)}
            className="px-5 h-12 rounded-full bg-card-foreground/[0.06] text-sm font-semibold text-card-foreground/70"
          >
            Reset
          </button>
          <button
            onClick={() => {
              onChange(draft);
              onClose();
            }}
            className="flex-1 h-12 rounded-full bg-primary text-primary-foreground text-sm font-bold"
          >
            Show results
          </button>
        </div>
      </div>
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
    <div className="fixed inset-0 z-[60] flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[420px] bg-card text-card-foreground rounded-t-[2rem] p-6 pb-8 max-h-[88%] overflow-y-auto no-scrollbar animate-in slide-in-from-bottom duration-300"
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
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="bg-transparent outline-none flex-1 min-w-0 font-display text-3xl font-bold placeholder:text-card-foreground/25"
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

function TxnDetailSheet({ txn, onClose }: { txn: Txn; onClose: () => void }) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [tokenCopied, setTokenCopied] = useState(false);
  const statusTone =
    txn.status === "Success"
      ? "bg-success/15 text-success"
      : txn.status === "Pending"
      ? "bg-orange-500/15 text-orange-500"
      : "bg-destructive/15 text-destructive";

  const copyRef = () => {
    navigator.clipboard?.writeText(txn.reference).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const copyToken = () => {
    if (!txn.token) return;
    navigator.clipboard?.writeText(txn.token.replace(/\s/g, "")).catch(() => {});
    setTokenCopied(true);
    setTimeout(() => setTokenCopied(false), 1500);
  };

  const isElectricity = txn.category === "Electricity";

  const rows: { label: string; value: React.ReactNode; copy?: boolean }[] = [
    { label: "Reference", value: txn.reference, copy: true },
    { label: "Category", value: txn.category },
    { label: "Method", value: txn.method },
    ...(txn.units ? [{ label: "Units", value: txn.units }] : []),
    { label: "Date", value: txn.time },
    { label: "Fee", value: txn.fee },
    ...(txn.note ? [{ label: "Note", value: txn.note }] : []),
  ];

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[420px] bg-card text-card-foreground rounded-t-[2rem] pt-3 pb-8 max-h-[92%] overflow-y-auto no-scrollbar animate-in slide-in-from-bottom duration-300"
      >
        <div className="w-10 h-1 rounded-full bg-card-foreground/15 mx-auto" />

        <div className="px-6 mt-4 flex items-start justify-between">
          <div>
            <h3 className="font-display font-bold text-base tracking-tight">Transaction details</h3>
            <p className="text-[11px] text-card-foreground/50 mt-0.5">{txn.reference}</p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-card-foreground/5 flex items-center justify-center text-card-foreground/60"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Hero */}
        <div className="px-6 mt-5 flex flex-col items-center text-center">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center ${
              txn.isCredit ? "bg-success/15 text-success" : "bg-accent text-card-foreground/70"
            }`}
          >
            {txn.isCredit ? (
              <ArrowDownLeft className="w-7 h-7" />
            ) : (
              <ArrowUpRight className="w-7 h-7" />
            )}
          </div>
          <p className="mt-3 text-[12px] font-semibold text-card-foreground/55">{txn.title}</p>
          <p
            className={`mt-1 font-display text-3xl font-bold ${
              txn.isCredit ? "text-primary" : "text-card-foreground"
            }`}
          >
            {txn.amount}
          </p>
          <span
            className={`mt-2 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusTone}`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            {txn.status}
          </span>
        </div>

        {/* Token (electricity) */}
        {isElectricity && (
          <div className="mx-6 mt-6">
            <div className="flex items-center justify-between mb-2 px-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-card-foreground/50">
                Prepaid token
              </p>
              {txn.token && (
                <button
                  onClick={copyToken}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary"
                >
                  {tokenCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {tokenCopied ? "Copied" : "Copy"}
                </button>
              )}
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/20 px-4 py-4">
              {txn.token ? (
                <p className="font-mono text-lg font-bold tracking-[0.18em] text-card-foreground text-center select-all">
                  {txn.token}
                </p>
              ) : (
                <p className="font-mono text-sm text-card-foreground/50 text-center">
                  Token will appear here once available
                </p>
              )}
            </div>
          </div>
        )}

        {/* Details card */}
        <div className="mx-6 mt-6 rounded-2xl bg-card-foreground/[0.04] divide-y divide-card-foreground/[0.06] overflow-hidden">
          {rows.map((r) => (
            <div key={r.label} className="flex items-center gap-3 px-4 py-3.5">
              <p className="text-[12px] text-card-foreground/55 flex-1">{r.label}</p>
              <p className="text-[13px] font-semibold text-right max-w-[60%] truncate">{r.value}</p>
              {r.copy && (
                <button
                  onClick={copyRef}
                  className="ml-1 w-7 h-7 rounded-full bg-card-foreground/5 flex items-center justify-center text-card-foreground/60"
                  aria-label="Copy reference"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="px-6 mt-5 grid grid-cols-3 gap-2">
          <DetailAction icon={Download} label="Receipt" />
          <DetailAction icon={Share2} label="Share" />
          <DetailAction icon={HelpCircle} label="Get help" onClick={() => navigate({ to: "/profile/help/chat" })} />
        </div>

        {/* Footer */}
        <div className="px-6 mt-6">
          <button
            onClick={onClose}
            className="w-full h-12 rounded-full bg-primary text-primary-foreground text-sm font-bold"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailAction({ icon: Icon, label, onClick }: { icon: typeof Download; label: string; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="h-16 rounded-2xl bg-card-foreground/[0.04] flex flex-col items-center justify-center gap-1 text-card-foreground/80 active:scale-[0.98] transition"
    >
      <Icon className="w-4 h-4" />
      <span className="text-[11px] font-semibold">{label}</span>
    </button>
  );
}
