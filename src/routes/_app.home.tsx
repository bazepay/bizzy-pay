import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Plus,
  ArrowLeftRight,
  ArrowDownLeft,
  ArrowUpRight,
  Smartphone,
  Tv,
  Zap,
  Phone,
  Wifi,
} from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { wallets, type CurrencyCode } from "@/lib/wallets";
import { BottomNav } from "@/components/bottom-nav";
import { CurrencySwitcher } from "@/components/currency-switcher";

export const Route = createFileRoute("/_app/home")({
  component: HomePage,
});

const spendData = [
  { day: "Mon", spent: 18 },
  { day: "Tue", spent: 32 },
  { day: "Wed", spent: 12 },
  { day: "Thu", spent: 47 },
  { day: "Fri", spent: 28 },
  { day: "Sat", spent: 64 },
  { day: "Sun", spent: 41 },
];

const services = [
  { label: "eSIM", icon: Wifi, token: "service-esim", slug: "esim" },
  { label: "Airtime", icon: Phone, token: "service-airtime", slug: "airtime" },
  { label: "Data", icon: Smartphone, token: "service-data", slug: "data" },
  { label: "Electricity", icon: Zap, token: "service-electricity", slug: "electricity" },
  { label: "Cable", icon: Tv, token: "service-cable", slug: "tv" },
] as const;

const txns = [
  { id: 1, name: "Cody Lee", time: "10:45 PM", amount: "-$220.00", action: "Send", initials: "CL", avatarBg: "#FFE4D6", avatarColor: "#E07A4F", isDebit: true },
  { id: 2, name: "Sam Charm", time: "10:45 PM", amount: "+$220.00", action: "Deposit", initials: "SA", avatarBg: "#E0E7FF", avatarColor: "#5B4DFF", isDebit: false },
  { id: 3, name: "Spotify", time: "Yesterday", amount: "-$9.99", action: "Send", initials: "SP", avatarBg: "#D6F5E3", avatarColor: "#1DB954", isDebit: true },
];

function HomePage() {
  const [currency, setCurrency] = useState<CurrencyCode>("NGN");
  const w = wallets[currency];

  return (
    <div className="min-h-full bg-background text-foreground flex flex-col">
      <div className="h-10" />

      {/* Balance */}
      <div className="px-6 pt-4 flex items-start justify-between">
        <div>
          <h1 className="font-display text-4xl font-bold tracking-tight">
            {w.symbol}{w.whole}<span className="text-foreground/40">{w.decimals}</span>
          </h1>
          <p className="text-xs text-foreground/50 mt-1.5">{w.equiv}</p>
        </div>
        <CurrencySwitcher value={currency} onChange={setCurrency} />
      </div>

      {/* CTAs */}
      <div className="px-6 mt-7 grid grid-cols-2 gap-3">
        <button className="h-12 rounded-full bg-lime text-lime-foreground font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition">
          <Plus className="w-4 h-4" /> Top up
        </button>
        <button className="h-12 rounded-full bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition">
          <ArrowLeftRight className="w-4 h-4" /> Transfer
        </button>
      </div>

      {/* Stats */}
      <div className="px-6 mt-6 grid grid-cols-2 gap-3">
        <StatCard label="Topped up" amount="₦1.2M" delta="+18%" sub="vs last month" positive />
        <StatCard label="Spent" amount="₦654K" delta="-8%" sub="vs last month" positive={false} />
      </div>

      {/* Sheet */}
      <div className="flex-1 mt-7 bg-card text-card-foreground rounded-t-[2rem] px-6 pt-6 pb-28">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-lg">Quick pay</h2>
          <Link to="/pay" className="text-xs font-semibold text-primary">See All</Link>
        </div>

        <div className="mt-4 grid grid-cols-5 gap-2">
          {services.map((s) => {
            const Icon = s.icon;
            const linkProps =
              s.slug === "airtime"
                ? ({ to: "/pay/airtime" } as const)
                : s.slug === "data"
                ? ({ to: "/pay/data" } as const)
                : s.slug === "electricity"
                ? ({ to: "/pay/electricity" } as const)
                : s.slug === "tv"
                ? ({ to: "/pay/tv" } as const)
                : ({ to: "/pay/$service", params: { service: s.slug } } as const);
            return (
              <Link
                key={s.label}
                {...linkProps}
                className="flex flex-col items-center gap-2 active:scale-95 transition"
              >
                <div
                  className="w-full aspect-square rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: `color-mix(in oklab, var(--${s.token}) 14%, transparent)` }}
                >
                  <Icon className="w-5 h-5" style={{ color: `var(--${s.token})` }} strokeWidth={2.2} />
                </div>
                <span className="text-[10px] font-medium text-card-foreground/80 leading-tight text-center">
                  {s.label}
                </span>
              </Link>
            );
          })}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <h2 className="font-display font-bold text-lg">Transaction History</h2>
          <button className="text-xs font-semibold text-primary">View All</button>
        </div>

        <div className="mt-4 space-y-4">
          {txns.map((t) => (
            <div key={t.id} className="flex items-center gap-3">
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                style={{ background: t.avatarBg, color: t.avatarColor }}
              >
                {t.initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{t.name}</p>
                <p className="text-xs text-card-foreground/45 mt-0.5">{t.time}</p>
              </div>
              <div className="text-right">
                <p className={`text-sm font-bold ${t.isDebit ? "text-card-foreground" : "text-primary"}`}>
                  {t.amount}
                </p>
                <p className="text-xs text-card-foreground/45 mt-0.5">{t.action}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

function StatCard({
  label,
  amount,
  delta,
  sub,
  positive,
}: {
  label: string;
  amount: string;
  delta: string;
  sub: string;
  positive: boolean;
}) {
  const colorVar = positive ? "var(--lime)" : "var(--destructive)";
  return (
    <div className="rounded-2xl bg-white/[0.05] border border-white/10 p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-foreground/60">{label}</span>
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center"
          style={{ background: `color-mix(in oklab, ${colorVar} 18%, transparent)`, color: colorVar }}
        >
          {positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownLeft className="w-3 h-3" />}
        </div>
      </div>
      <p className="font-display text-xl font-bold mt-2">{amount}</p>
      <div className="mt-1 flex items-center gap-1.5">
        <span className="text-[11px] font-bold" style={{ color: colorVar }}>{delta}</span>
        <span className="text-[10px] text-foreground/40">{sub}</span>
      </div>
    </div>
  );
}
