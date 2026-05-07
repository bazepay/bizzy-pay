import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { mockBalances, mockTransactions, formatMoney, type Currency } from "@/lib/mock";
import { ArrowLeft, Plus, ArrowUpRight, ArrowDownLeft, Search, X, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/_app/wallet")({
  component: WalletPage,
});

type Sheet = null | "fund" | "payout";

function WalletPage() {
  const [currency, setCurrency] = useState<Currency>("NGN");
  const [sheet, setSheet] = useState<Sheet>(null);
  const [filter, setFilter] = useState<"all" | "credit" | "debit">("all");
  const [search, setSearch] = useState("");

  const txns = mockTransactions.filter((t) => {
    if (filter !== "all" && t.type !== filter) return false;
    if (search && !`${t.title} ${t.subtitle}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const grouped = txns.reduce<Record<string, typeof txns>>((acc, t) => {
    const day = new Date(t.date).toDateString();
    (acc[day] ||= []).push(t);
    return acc;
  }, {});

  return (
    <div>
      <div className="bg-gradient-hero text-white pt-12 pb-8 px-6 rounded-b-[2rem]">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/_app/home" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-display font-bold text-lg">Wallet</h1>
        </div>

        <div className="flex gap-2 mb-4">
          {(["NGN", "USD", "EUR"] as Currency[]).map((c) => (
            <button
              key={c}
              onClick={() => setCurrency(c)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold ${currency === c ? "bg-gold text-[oklch(0.2_0.05_80)]" : "bg-white/10 text-white/70"}`}
            >
              {c}
            </button>
          ))}
        </div>
        <p className="text-xs text-white/60 uppercase tracking-widest">Balance</p>
        <h2 className="text-3xl font-display font-bold mt-1">{formatMoney(mockBalances[currency], currency)}</h2>

        <div className="flex gap-3 mt-6">
          <Button onClick={() => setSheet("fund")} className="flex-1 h-11 bg-gold text-[oklch(0.2_0.05_80)] hover:bg-gold/90 rounded-2xl font-semibold">
            <Plus className="w-4 h-4 mr-1" /> Add money
          </Button>
          <Button onClick={() => setSheet("payout")} variant="outline" className="flex-1 h-11 rounded-2xl bg-white/10 border-white/20 text-white hover:bg-white/15 font-semibold">
            <ArrowUpRight className="w-4 h-4 mr-1" /> Send
          </Button>
        </div>
      </div>

      <div className="px-6 pt-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search transactions" className="h-11 pl-11 rounded-2xl" />
        </div>
        <div className="flex gap-2 mt-4 overflow-x-auto no-scrollbar">
          {(["all", "credit", "debit"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize whitespace-nowrap ${
                filter === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              {f === "all" ? "All" : f === "credit" ? "Money in" : "Money out"}
            </button>
          ))}
        </div>

        <div className="mt-6 space-y-5">
          {Object.entries(grouped).map(([day, items]) => (
            <div key={day}>
              <p className="text-xs text-muted-foreground font-medium mb-2">{day}</p>
              <div className="space-y-2">
                {items.map((t) => (
                  <Link key={t.id} to="/transaction/$id" params={{ id: t.id }} className="flex items-center gap-3 p-3 rounded-2xl bg-card">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${t.type === "credit" ? "bg-success/15 text-success" : "bg-muted"}`}>
                      {t.type === "credit" ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{t.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{t.subtitle}</p>
                    </div>
                    <p className={`text-sm font-bold ${t.type === "credit" ? "text-success" : ""}`}>
                      {t.type === "credit" ? "+" : "-"}{formatMoney(t.amount, t.currency)}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <BottomSheet open={sheet === "fund"} onClose={() => setSheet(null)} title="Add money">
        <FundSheet onDone={() => setSheet(null)} />
      </BottomSheet>
      <BottomSheet open={sheet === "payout"} onClose={() => setSheet(null)} title="Send money">
        <PayoutSheet onDone={() => setSheet(null)} />
      </BottomSheet>
    </div>
  );
}

export function BottomSheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/50 z-40" />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="absolute bottom-0 left-0 right-0 bg-card rounded-t-3xl z-50 max-h-[80%] overflow-y-auto"
          >
            <div className="sticky top-0 bg-card pt-3 pb-4 px-6 border-b border-border flex items-center justify-between">
              <h3 className="font-display font-bold text-lg">{title}</h3>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function FundSheet({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState<"method" | "amount" | "done">("method");
  const [method, setMethod] = useState("Card");
  const [amount, setAmount] = useState("50000");

  if (step === "done") return <SuccessView title="Funds added" subtitle={`₦${Number(amount).toLocaleString()} credited to your wallet`} onDone={onDone} />;

  if (step === "amount")
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">via {method}</p>
        <Input value={amount} onChange={(e) => setAmount(e.target.value)} className="h-16 text-2xl font-display font-bold rounded-2xl" />
        <Button onClick={() => setStep("done")} className="w-full h-12 bg-primary text-primary-foreground rounded-2xl font-semibold">Confirm</Button>
      </div>
    );

  return (
    <div className="space-y-2">
      {["Card", "Bank transfer", "Flutterwave", "Paystack", "Interswitch"].map((m) => (
        <button key={m} onClick={() => { setMethod(m); setStep("amount"); }} className="w-full p-4 rounded-2xl bg-muted/60 text-left font-semibold flex items-center justify-between">
          {m} <span className="text-xs text-muted-foreground">›</span>
        </button>
      ))}
    </div>
  );
}

function PayoutSheet({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState<"form" | "done">("form");
  const [bank, setBank] = useState("GTBank");
  const [acct, setAcct] = useState("0123456789");
  const [amount, setAmount] = useState("25000");

  if (step === "done") return <SuccessView title="Sent!" subtitle={`₦${Number(amount).toLocaleString()} on its way to ${bank} ${acct}`} onDone={onDone} />;

  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs text-muted-foreground">Bank</label>
        <select value={bank} onChange={(e) => setBank(e.target.value)} className="w-full mt-1 h-12 px-3 rounded-2xl bg-muted border border-border">
          {["GTBank", "Access Bank", "Zenith", "UBA", "Kuda"].map((b) => <option key={b}>{b}</option>)}
        </select>
      </div>
      <div>
        <label className="text-xs text-muted-foreground">Account number</label>
        <Input value={acct} onChange={(e) => setAcct(e.target.value)} className="h-12 rounded-2xl mt-1" />
      </div>
      <div>
        <label className="text-xs text-muted-foreground">Amount (₦)</label>
        <Input value={amount} onChange={(e) => setAmount(e.target.value)} className="h-12 rounded-2xl mt-1" />
      </div>
      <Button onClick={() => setStep("done")} className="w-full h-12 bg-primary text-primary-foreground rounded-2xl font-semibold mt-4">Send now</Button>
    </div>
  );
}

export function SuccessView({ title, subtitle, onDone }: { title: string; subtitle: string; onDone: () => void }) {
  return (
    <div className="flex flex-col items-center text-center py-6">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }} className="w-20 h-20 rounded-full bg-success/15 flex items-center justify-center">
        <CheckCircle2 className="w-12 h-12 text-success" />
      </motion.div>
      <h3 className="mt-4 text-xl font-bold">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
      <Button onClick={onDone} className="mt-6 w-full h-12 bg-primary text-primary-foreground rounded-2xl font-semibold">Done</Button>
    </div>
  );
}
