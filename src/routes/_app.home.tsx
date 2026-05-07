import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import { mockUser, mockBalances, mockTransactions, formatMoney } from "@/lib/mock";
import {
  Bell,
  Target,
  Box,
  Activity,
  CreditCard,
  ArrowLeftRight,
  Eye,
  EyeOff,
} from "lucide-react";

export const Route = createFileRoute("/_app/home")({
  component: HomePage,
});

const beneficiaries = [
  { name: "Charlie", color: "oklch(0.7 0.14 25)" },
  { name: "Lydia", color: "oklch(0.72 0.13 320)" },
  { name: "Ryan", color: "oklch(0.65 0.14 250)" },
  { name: "Cristofer", color: "oklch(0.7 0.13 60)" },
  { name: "Tatiana", color: "oklch(0.72 0.13 200)" },
  { name: "Gus", color: "oklch(0.7 0.14 140)" },
];

function HomePage() {
  const [hidden, setHidden] = useState(false);

  return (
    <div className="min-h-full bg-[#0F172A] text-white pb-6">
      {/* Status bar spacer */}
      <div className="h-12" />

      {/* Header */}
      <div className="px-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0066FF] to-[#0052CC] flex items-center justify-center font-display font-bold text-white ring-2 ring-white/10"
          >
            {mockUser.firstName[0]}
          </div>
          <div>
            <p className="text-base font-semibold leading-tight">
              Hi there, {mockUser.firstName}
            </p>
            <p className="text-xs text-white/50 flex items-center gap-1 mt-0.5">
              <span className="text-gold">●</span> Lagos, Nigeria
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
            <Target className="w-4 h-4 text-gold" />
          </button>
          <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 relative">
            <Bell className="w-4 h-4" />
            <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-gold" />
          </button>
        </div>
      </div>

      {/* Balance card */}
      <div className="px-5 mt-5">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-3xl p-5 overflow-hidden bg-gradient-to-br from-[#0052CC] via-[#0066FF] to-[#0A2540] border border-white/10"
        >
          {/* teal accent strip */}
          <div className="absolute -right-10 top-0 bottom-0 w-24 bg-gradient-to-b from-[#00C4B4] to-[#00A3FF] rounded-l-3xl opacity-90" />
          <div className="absolute right-2 top-4 w-10 h-10 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center">
            <div className="w-5 h-5 rounded bg-[#00C4B4] rotate-45" />
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-white/60">BazePay Balance</p>
            <button onClick={() => setHidden(!hidden)} className="text-white/50 mr-12">
              {hidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <h1 className="font-display text-3xl font-bold mt-1 tracking-tight">
            {hidden ? "₦ • • • • • • • •" : formatMoney(mockBalances.NGN, "NGN")}
          </h1>

          <div className="mt-6">
            <p className="text-[10px] tracking-widest text-white/40">CARD NUMBER</p>
            <p className="font-display text-base mt-1 tracking-wider">
              3829 4820 4629 5025
            </p>
            <p className="text-xs text-white/50 mt-1">11/29</p>
          </div>
        </motion.div>
      </div>

      {/* Quick actions */}
      <div className="px-5 mt-4">
        <div className="rounded-3xl bg-white/[0.04] border border-white/5 p-4 grid grid-cols-4 gap-2">
          <QuickAction to="/wallet" icon={Box} label="Wallet" />
          <QuickAction to="/wallet" icon={Activity} label="Activity" />
          <QuickAction to="/cards" icon={CreditCard} label="Cards" />
          <QuickAction to="/wallet" icon={ArrowLeftRight} label="Cash In/Out" />
        </div>
      </div>

      {/* Beneficiaries */}
      <div className="px-5 mt-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-semibold">Beneficiaries</h2>
          <button className="text-xs text-gold font-semibold">See All</button>
        </div>
        <div className="mt-3 flex gap-4 overflow-x-auto no-scrollbar -mx-1 px-1">
          {beneficiaries.map((b) => (
            <div key={b.name} className="flex flex-col items-center gap-1.5 shrink-0">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center font-display font-semibold text-white ring-2 ring-white/10"
                style={{ background: b.color }}
              >
                {b.name[0]}
              </div>
              <span className="text-[11px] text-white/70">{b.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent activity */}
      <div className="px-5 mt-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-semibold">Recent Activity</h2>
          <Link to="/wallet" className="text-xs text-gold font-semibold">
            View All
          </Link>
        </div>
        <div className="mt-3 space-y-2">
          {mockTransactions.slice(0, 3).map((t) => (
            <Link
              key={t.id}
              to="/transaction/$id"
              params={{ id: t.id }}
              className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.04] border border-white/5 active:scale-[0.99] transition"
            >
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#0066FF] to-[#00A3FF] flex items-center justify-center font-display text-sm font-bold">
                {t.title[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{t.title}</p>
                <p className="text-[11px] text-white/50">
                  {new Date(t.date).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "2-digit",
                  })}
                </p>
              </div>
              <p
                className={`text-sm font-bold ${
                  t.type === "credit" ? "text-gold" : "text-white/80"
                }`}
              >
                {t.type === "credit" ? "+ " : "- "}
                {formatMoney(t.amount, t.currency)}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function QuickAction({
  to,
  icon: Icon,
  label,
}: {
  to: string;
  icon: typeof Box;
  label: string;
}) {
  return (
    <Link to={to} className="flex flex-col items-center gap-2 py-1 active:scale-95 transition">
      <div className="w-12 h-12 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center text-white">
        <Icon className="w-5 h-5" />
      </div>
      <span className="text-[10px] text-white/70 text-center leading-tight">{label}</span>
    </Link>
  );
}
