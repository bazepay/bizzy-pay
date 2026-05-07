import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import { mockUser, mockBalances, mockTransactions, formatMoney, type Currency } from "@/lib/mock";
import { Eye, EyeOff, Plus, Send, Receipt, CreditCard, Smartphone, Bell, ArrowUpRight, ArrowDownLeft } from "lucide-react";

export const Route = createFileRoute("/home")({
  component: HomePage,
});

function HomePage() {
  const [hidden, setHidden] = useState(false);
  const [currency, setCurrency] = useState<Currency>("NGN");

  return (
    <div>
      {/* Hero */}
      <div className="bg-gradient-hero text-white pt-12 pb-24 px-6 rounded-b-[2.5rem]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-gold flex items-center justify-center font-display font-bold text-[oklch(0.2_0.05_80)]">
              {mockUser.firstName[0]}
            </div>
            <div>
              <p className="text-xs text-white/60">Welcome back</p>
              <p className="text-sm font-semibold">{mockUser.firstName} {mockUser.lastName}</p>
            </div>
          </div>
          <button className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-gold" />
          </button>
        </div>

        <div className="mt-8">
          <div className="flex items-center gap-2">
            <p className="text-xs uppercase tracking-widest text-white/60">Total balance</p>
            <button onClick={() => setHidden(!hidden)} className="text-white/60">
              {hidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
          <motion.h1
            key={currency + String(hidden)}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-display font-bold mt-2"
          >
            {hidden ? "₦ • • • • • •" : formatMoney(mockBalances[currency], currency)}
          </motion.h1>

          <div className="flex gap-2 mt-4">
            {(["NGN", "USD", "EUR"] as Currency[]).map((c) => (
              <button
                key={c}
                onClick={() => setCurrency(c)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                  currency === c ? "bg-gold text-[oklch(0.2_0.05_80)]" : "bg-white/10 text-white/70"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="px-6 -mt-16 relative z-10">
        <div className="bg-card rounded-3xl shadow-card p-4 grid grid-cols-4 gap-2">
          <QuickAction to="/wallet" icon={Plus} label="Add" />
          <QuickAction to="/wallet" icon={Send} label="Send" />
          <QuickAction to="/pay" icon={Receipt} label="Pay" />
          <QuickAction to="/esim" icon={Smartphone} label="eSIM" />
        </div>
      </div>

      {/* Promo card */}
      <div className="px-6 mt-6">
        <div className="rounded-3xl p-5 bg-gradient-gold text-[oklch(0.2_0.05_80)] flex items-center gap-4">
          <CreditCard className="w-10 h-10" />
          <div className="flex-1">
            <p className="font-bold text-sm">Get a virtual Naira card</p>
            <p className="text-xs opacity-80">Issue in seconds. Use anywhere online.</p>
          </div>
          <Link to="/cards" className="text-xs font-bold underline">Issue</Link>
        </div>
      </div>

      {/* Recent transactions */}
      <div className="px-6 mt-8">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-lg">Recent activity</h2>
          <Link to="/wallet" className="text-xs text-primary font-semibold">See all</Link>
        </div>
        <div className="mt-3 space-y-2">
          {mockTransactions.slice(0, 5).map((t) => (
            <div key={t.id} className="flex items-center gap-3 p-3 rounded-2xl bg-card">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${t.type === "credit" ? "bg-success/15 text-success" : "bg-muted text-foreground"}`}>
                {t.type === "credit" ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{t.title}</p>
                <p className="text-xs text-muted-foreground truncate">{t.subtitle}</p>
              </div>
              <div className="text-right">
                <p className={`text-sm font-bold ${t.type === "credit" ? "text-success" : ""}`}>
                  {t.type === "credit" ? "+" : "-"}{formatMoney(t.amount, t.currency)}
                </p>
                <p className="text-[10px] text-muted-foreground capitalize">{t.status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function QuickAction({ to, icon: Icon, label }: { to: string; icon: typeof Plus; label: string }) {
  return (
    <Link to={to} className="flex flex-col items-center gap-2 py-2 active:scale-95 transition">
      <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
        <Icon className="w-5 h-5" />
      </div>
      <span className="text-[11px] font-medium">{label}</span>
    </Link>
  );
}
