import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronDown, Plus, ArrowLeftRight, ArrowDownLeft, ArrowUpRight, SlidersHorizontal, Home, CreditCard, BarChart3, Users, User, Smartphone, Tv, Zap, Phone, Wifi, Check } from "lucide-react";

export const Route = createFileRoute("/_app/home")({
  component: HomePage,
});

const services = [
  { label: "eSIM", icon: Wifi, color: "#5B4DFF" },
  { label: "Airtime", icon: Phone, color: "#D4A24C" },
  { label: "Data", icon: Smartphone, color: "#3DAEA3" },
  { label: "Electricity", icon: Zap, color: "#D4A24C" },
  { label: "Cable", icon: Tv, color: "#E07A6B" },
];

type CurrencyCode = "NGN" | "USD" | "EUR" | "GBP";
const wallets: Record<CurrencyCode, { symbol: string; whole: string; decimals: string; equiv: string; gradient: string }> = {
  NGN: { symbol: "₦", whole: "845,320", decimals: ".50", equiv: "≈ $548.20", gradient: "linear-gradient(135deg, #008751, #ffffff, #008751)" },
  USD: { symbol: "$", whole: "548", decimals: ".20", equiv: "≈ ₦845,320", gradient: "linear-gradient(135deg, #B22234, #ffffff, #3C3B6E)" },
  EUR: { symbol: "€", whole: "502", decimals: ".15", equiv: "≈ ₦774,316", gradient: "linear-gradient(135deg, #003399, #FFCC00)" },
  GBP: { symbol: "£", whole: "432", decimals: ".80", equiv: "≈ ₦845,320", gradient: "linear-gradient(135deg, #012169, #ffffff, #C8102E)" },
};

const txns = [
  { id: 1, name: "Cody Lee", time: "10:45 PM", amount: "-$220.00", action: "Send", initials: "CL", avatarBg: "#FFE4D6", avatarColor: "#E07A4F", isDebit: true },
  { id: 2, name: "Sam Charm", time: "10:45 PM", amount: "+$220.00", action: "Deposit", initials: "SA", avatarBg: "#E0E7FF", avatarColor: "#5B4DFF", isDebit: false },
  { id: 3, name: "Spotify", time: "Yesterday", amount: "-$9.99", action: "Send", initials: "SP", avatarBg: "#D6F5E3", avatarColor: "#1DB954", isDebit: true },
];

function HomePage() {
  const [currency, setCurrency] = useState<CurrencyCode>("NGN");
  const [open, setOpen] = useState(false);
  const w = wallets[currency];

  return (
    <div className="min-h-full bg-[#0B0B12] text-white flex flex-col">
      {/* status spacer */}
      <div className="h-10" />

      {/* Top: balance */}
      <div className="px-6 pt-4 flex items-start justify-between">
        <div>
          <h1 className="font-display text-4xl font-bold tracking-tight">
            {w.symbol}{w.whole}<span className="text-white/40">{w.decimals}</span>
          </h1>
          <p className="text-xs text-white/50 mt-1.5">{w.equiv}</p>
        </div>
        <div className="relative">
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-1.5 bg-white/8 border border-white/10 rounded-full px-3 py-1.5 text-xs font-semibold"
          >
            <span className="w-4 h-4 rounded-full" style={{ background: w.gradient }} />
            {currency}
            <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
          </button>
          {open && (
            <div className="absolute right-0 mt-2 w-36 bg-[#16161F] border border-white/10 rounded-2xl p-1.5 shadow-xl z-20">
              {(Object.keys(wallets) as CurrencyCode[]).map((code) => (
                <button
                  key={code}
                  onClick={() => { setCurrency(code); setOpen(false); }}
                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl hover:bg-white/5 text-xs font-semibold"
                >
                  <span className="w-4 h-4 rounded-full shrink-0" style={{ background: wallets[code].gradient }} />
                  <span className="flex-1 text-left">{code}</span>
                  {currency === code && <Check className="w-3.5 h-3.5 text-[#C6FF4D]" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CTAs */}
      <div className="px-6 mt-7 grid grid-cols-2 gap-3">
        <button className="h-12 rounded-full bg-[#C6FF4D] text-black font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition">
          <Plus className="w-4 h-4" /> Top up
        </button>
        <button className="h-12 rounded-full bg-[#5B4DFF] text-white font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition">
          <ArrowLeftRight className="w-4 h-4" /> Transfer
        </button>
      </div>

      {/* Stats */}
      <div className="px-6 mt-6 grid grid-cols-2 gap-3">
        <StatCard label="Topped up" amount="₦1.2M" delta="+18%" sub="vs last month" positive />
        <StatCard label="Spent" amount="₦654K" delta="-8%" sub="vs last month" positive={false} />
      </div>

      {/* Sheet */}
      <div className="flex-1 mt-7 bg-white text-[#0A0A14] rounded-t-[2rem] px-6 pt-6 pb-28">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-lg">Quick pay</h2>
          <button className="text-xs font-semibold text-[#5B4DFF]">See All</button>
        </div>

        <div className="mt-4 grid grid-cols-5 gap-2">
          {services.map((s) => {
            const Icon = s.icon;
            return (
              <button
                key={s.label}
                className="flex flex-col items-center gap-2 active:scale-95 transition"
              >
                <div className="w-full aspect-square rounded-2xl flex items-center justify-center bg-[#5B4DFF]/10">
                  <Icon className="w-5 h-5" style={{ color: "#5B4DFF" }} strokeWidth={2.2} />
                </div>
                <span className="text-[10px] font-medium text-[#0A0A14]/80 leading-tight text-center">
                  {s.label}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <h2 className="font-display font-bold text-lg">Transaction History</h2>
          <button className="text-xs font-semibold text-[#5B4DFF]">View All</button>
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
                <p className="text-xs text-black/45 mt-0.5">{t.time}</p>
              </div>
              <div className="text-right">
                <p className={`text-sm font-bold ${t.isDebit ? "text-[#0A0A14]" : "text-[#5B4DFF]"}`}>
                  {t.amount}
                </p>
                <p className="text-xs text-black/45 mt-0.5">{t.action}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating bottom nav */}
      <div className="absolute bottom-0 left-0 right-0 z-50 px-4 pb-5">
        <div className="bg-white rounded-full shadow-[0_10px_30px_-10px_rgba(0,0,0,0.25)] flex items-center justify-between px-2 py-2">
          <NavBtn icon={Home} label="Home" active />
          <NavBtn icon={CreditCard} />
          <NavBtn icon={BarChart3} />
          <NavBtn icon={Users} />
          <NavBtn icon={User} />
        </div>
      </div>
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
  const color = positive ? "#C6FF4D" : "#FF6B6B";
  return (
    <div className="rounded-2xl bg-white/[0.05] border border-white/10 p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-white/60">{label}</span>
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center"
          style={{ background: `${color}26`, color }}
        >
          {positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownLeft className="w-3 h-3" />}
        </div>
      </div>
      <p className="font-display text-xl font-bold mt-2">{amount}</p>
      <div className="mt-1 flex items-center gap-1.5">
        <span className="text-[11px] font-bold" style={{ color }}>{delta}</span>
        <span className="text-[10px] text-white/40">{sub}</span>
      </div>
    </div>
  );
}

function NavBtn({
  icon: Icon,
  label,
  active = false,
}: {
  icon: typeof Home;
  label?: string;
  active?: boolean;
}) {
  if (active) {
    return (
      <button className="bg-[#5B4DFF] text-white rounded-full px-4 py-2.5 flex items-center gap-2 font-semibold text-sm">
        <Icon className="w-4 h-4" />
        {label}
      </button>
    );
  }
  return (
    <button className="w-11 h-11 rounded-full flex items-center justify-center text-black/60">
      <Icon className="w-5 h-5" />
    </button>
  );
}
