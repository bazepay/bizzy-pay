import { createFileRoute } from "@tanstack/react-router";
import { ChevronDown, Plus, ArrowLeftRight, ArrowDownLeft, ArrowUpRight, SlidersHorizontal, Home, CreditCard, BarChart3, Users, User, Receipt, Smartphone, Tv, Zap, Trophy, Phone } from "lucide-react";

export const Route = createFileRoute("/_app/home")({
  component: HomePage,
});

const services = [
  { label: "Airtime", icon: Phone, to: "/pay/$service", params: { service: "airtime" }, color: "#5B4DFF" },
  { label: "Data", icon: Smartphone, to: "/pay/$service", params: { service: "data" }, color: "#00C4B4" },
  { label: "Electricity", icon: Zap, to: "/pay/$service", params: { service: "electricity" }, color: "#FFB020" },
  { label: "TV", icon: Tv, to: "/pay/$service", params: { service: "tv" }, color: "#FF6B6B" },
  { label: "Betting", icon: Trophy, to: "/pay/$service", params: { service: "betting" }, color: "#C6FF4D" },
  { label: "Cards", icon: CreditCard, to: "/cards", params: undefined, color: "#9B6BFF" },
  { label: "eSIM", icon: Receipt, to: "/esim", params: undefined, color: "#4D9FFF" },
];

const txns = [
  { id: 1, title: "Paypal Payment", subtitle: "Paid · Today", amount: "120 USD", up: true },
  { id: 2, title: "Salary Payment", subtitle: "Received · Today", amount: "7350 USD", up: false },
  { id: 3, title: "Spotify", subtitle: "Paid · Yesterday", amount: "9.99 USD", up: true },
];

function HomePage() {
  return (
    <div className="min-h-full bg-[#0B0B12] text-white flex flex-col">
      {/* status spacer */}
      <div className="h-10" />

      {/* Top: balance */}
      <div className="px-6 pt-4 flex items-start justify-between">
        <div>
          <h1 className="font-display text-4xl font-bold tracking-tight">
            $5,560<span className="text-white/40">.32</span>
          </h1>
          <p className="text-sm text-white/50 mt-1">Total balance</p>
        </div>
        <button className="flex items-center gap-1.5 bg-white/8 border border-white/10 rounded-full px-3 py-1.5 text-xs font-semibold">
          <span className="w-4 h-4 rounded-full bg-gradient-to-br from-red-500 via-white to-blue-600" />
          USD
          <ChevronDown className="w-3 h-3" />
        </button>
      </div>

      {/* CTAs */}
      <div className="px-6 mt-5 grid grid-cols-2 gap-3">
        <button className="h-12 rounded-full bg-[#C6FF4D] text-black font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition">
          <Plus className="w-4 h-4" /> Top up
        </button>
        <button className="h-12 rounded-full bg-[#5B4DFF] text-white font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition">
          <ArrowLeftRight className="w-4 h-4" /> Transfer
        </button>
      </div>

      {/* Stats */}
      <div className="px-6 mt-3 grid grid-cols-2 gap-3">
        <StatCard label="Income" amount="$20,450" change="+12.06%" up positive />
        <StatCard label="Expense" amount="$22,450" change="+12.06%" up={false} positive={false} />
      </div>

      {/* Sheet */}
      <div className="flex-1 mt-5 bg-white text-[#0A0A14] rounded-t-[2rem] px-6 pt-6 pb-28">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-lg">Services</h2>
          <button className="text-xs font-semibold text-[#5B4DFF]">See All</button>
        </div>

        <div className="mt-4 flex gap-4 overflow-x-auto no-scrollbar -mx-6 px-6">
          {services.map((s) => {
            const Icon = s.icon;
            return (
              <button
                key={s.label}
                className="flex flex-col items-center gap-2 shrink-0 active:scale-95 transition"
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-md"
                  style={{ background: s.color }}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-medium text-[#0A0A14]/80">{s.label}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <h2 className="font-display font-bold text-lg">Transactions</h2>
          <button className="w-8 h-8 rounded-full border border-black/10 flex items-center justify-center">
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-3 space-y-3">
          {txns.map((t) => (
            <div key={t.id} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border border-black/10 flex items-center justify-center">
                {t.up ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{t.title}</p>
                <p className="text-xs text-black/50">{t.subtitle}</p>
              </div>
              <p className="text-sm font-bold">{t.amount}</p>
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
  change,
  up,
  positive,
}: {
  label: string;
  amount: string;
  change: string;
  up: boolean;
  positive: boolean;
}) {
  return (
    <div className="rounded-2xl bg-white/[0.05] border border-white/10 p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-white/60">{label}</span>
        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${positive ? "bg-[#C6FF4D]/15 text-[#C6FF4D]" : "bg-red-500/15 text-red-400"}`}>
          {up ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
        </div>
      </div>
      <p className="font-display text-xl font-bold mt-2">{amount}</p>
      <p className={`text-[11px] font-semibold mt-1 ${positive ? "text-[#C6FF4D]" : "text-red-400"}`}>
        {change}
      </p>
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
