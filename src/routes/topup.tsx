import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/phone-frame";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  CreditCard,
  Building2,
  Banknote,
  Check,
  ChevronRight,
  Delete,
  ShieldCheck,
  Copy,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/topup")({
  head: () => ({
    meta: [
      { title: "Top up — BazePay" },
      { name: "description", content: "Add money to your BazePay wallet." },
    ],
  }),
  component: TopupFlow,
});

type Method = {
  id: string;
  label: string;
  sub: string;
  icon: typeof CreditCard;
  fee: string;
  arrival: string;
};

const METHODS: Method[] = [
  { id: "card", label: "Debit / Credit card", sub: "Visa · Mastercard · Verve", icon: CreditCard, fee: "1.5% fee", arrival: "Instant" },
  { id: "transfer", label: "Bank transfer", sub: "Send to your unique account", icon: Building2, fee: "Free", arrival: "Under 30s" },
  { id: "ussd", label: "USSD", sub: "Pay with bank shortcode", icon: Banknote, fee: "Free", arrival: "Instant" },
];

const QUICK = [10000, 25000, 50000, 100000];

type Step = "amount" | "method" | "success" | "transfer-details";

function TopupFlow() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("amount");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<Method | null>(null);

  const numeric = Number(amount.replace(/,/g, "")) || 0;
  const formatted = numeric ? numeric.toLocaleString("en-US") : "0";
  const fee = method?.id === "card" ? Math.round(numeric * 0.015) : 0;
  const total = numeric + fee;

  const press = (key: string) => {
    if (key === "back") {
      setAmount((a) => a.slice(0, -1));
      return;
    }
    if (key === "." && amount.includes(".")) return;
    if (amount.length >= 12) return;
    setAmount((a) => a + key);
  };

  const onContinue = () => {
    if (!numeric || numeric < 100) {
      toast.error("Enter at least ₦100");
      return;
    }
    setStep("method");
  };

  const onPay = () => {
    if (!method) return;
    if (method.id === "transfer") {
      setStep("transfer-details");
    } else {
      setStep("success");
    }
  };

  return (
    <PhoneFrame>
    <div className="min-h-screen md:min-h-0 md:h-[860px] bg-background text-foreground flex flex-col">
      <div className="h-10" />
      <div className="px-6 pt-4 flex items-center justify-between">
        <button
          onClick={() => {
            if (step === "amount") navigate({ to: "/home" });
            else if (step === "method") setStep("amount");
            else if (step === "transfer-details") setStep("method");
            else setStep("amount");
          }}
          className="w-10 h-10 rounded-full bg-foreground/10 flex items-center justify-center"
          aria-label="Back"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <p className="text-[11px] uppercase tracking-[0.18em] font-bold text-foreground/55">
          Top up wallet
        </p>
        <div className="w-10" />
      </div>

      <AnimatePresence mode="wait">
        {step === "amount" && (
          <motion.div
            key="amount"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.25 }}
            className="flex-1 flex flex-col"
          >
            <div className="flex-1 flex flex-col items-center justify-center px-6">
              <p className="text-xs text-foreground/55 font-semibold">You are adding</p>
              <p className="font-display text-6xl font-bold tracking-tight mt-3 tabular-nums">
                <span className="text-foreground/40">₦</span>
                {formatted}
              </p>
              <div className="mt-6 flex gap-1.5 justify-center w-full px-1">
                {QUICK.map((q) => (
                  <button
                    key={q}
                    onClick={() => setAmount(String(q))}
                    className="flex-1 min-w-0 px-2 h-9 rounded-full bg-foreground/10 text-[11px] font-bold active:scale-95 transition whitespace-nowrap"
                  >
                    ₦{q.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-card text-card-foreground rounded-t-[2rem] px-6 pt-6 pb-8">
              <Keypad onPress={press} />
              <button
                onClick={onContinue}
                disabled={!numeric}
                className="mt-5 w-full h-13 py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold text-sm disabled:opacity-40 active:scale-[0.99] transition"
              >
                Continue
              </button>
            </div>
          </motion.div>
        )}

        {step === "method" && (
          <motion.div
            key="method"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.25 }}
            className="flex-1 flex flex-col"
          >
            <div className="px-6 mt-6">
              <h1 className="font-display text-2xl font-bold tracking-tight">How would you like to pay?</h1>
              <p className="text-sm text-foreground/55 mt-1">
                Adding <span className="font-bold text-foreground">₦{formatted}</span> to your wallet.
              </p>
            </div>

            <div className="flex-1 mt-7 bg-card text-card-foreground rounded-t-[2rem] px-6 pt-6 pb-8">
              <p className="text-[11px] uppercase tracking-widest text-card-foreground/50 font-semibold mb-3">
                Payment method
              </p>
              <div className="space-y-2.5">
                {METHODS.map((m) => {
                  const selected = method?.id === m.id;
                  const Icon = m.icon;
                  return (
                    <button
                      key={m.id}
                      onClick={() => setMethod(m)}
                      className={`w-full flex items-center gap-3 p-4 rounded-2xl border transition text-left ${
                        selected
                          ? "border-primary bg-primary/5"
                          : "border-card-foreground/10 active:bg-card-foreground/[0.04]"
                      }`}
                    >
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                          selected ? "bg-primary text-primary-foreground" : "bg-accent text-card-foreground/70"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm">{m.label}</p>
                        <p className="text-[11px] text-card-foreground/55 mt-0.5">{m.sub}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-card-foreground/[0.05]">
                            {m.fee}
                          </span>
                          <span className="text-[10px] font-semibold text-card-foreground/55">
                            {m.arrival}
                          </span>
                        </div>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${
                          selected ? "border-primary bg-primary" : "border-card-foreground/20"
                        }`}
                      >
                        {selected && <Check className="w-3 h-3 text-primary-foreground" strokeWidth={3} />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {method && (
                <div className="mt-6 rounded-2xl bg-card-foreground/[0.04] p-4 space-y-2.5">
                  <Row label="Amount" value={`₦${formatted}`} />
                  <Row label="Fee" value={fee ? `₦${fee.toLocaleString()}` : "Free"} />
                  <div className="h-px bg-card-foreground/[0.08]" />
                  <Row label="Total" value={`₦${total.toLocaleString()}`} bold />
                </div>
              )}

              <button
                onClick={onPay}
                disabled={!method}
                className="mt-6 w-full h-13 py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold text-sm disabled:opacity-40 flex items-center justify-center gap-2 active:scale-[0.99] transition"
              >
                <ShieldCheck className="w-4 h-4" />
                {method?.id === "transfer" ? "Show account details" : `Pay ₦${total.toLocaleString()}`}
              </button>
              <p className="text-[10px] text-card-foreground/45 text-center mt-3">
                Secured by 256-bit encryption · BazePay never stores your card details.
              </p>
            </div>
          </motion.div>
        )}

        {step === "transfer-details" && (
          <motion.div
            key="transfer-details"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.25 }}
            className="flex-1 flex flex-col"
          >
            <div className="px-6 mt-6 text-center">
              <p className="text-xs text-foreground/55 font-semibold">Send exactly</p>
              <p className="font-display text-4xl font-bold tracking-tight mt-2 tabular-nums">
                ₦{formatted}
              </p>
              <p className="text-xs text-foreground/55 mt-1">to the account below</p>
            </div>

            <div className="flex-1 mt-7 bg-card text-card-foreground rounded-t-[2rem] px-6 pt-6 pb-8">
              <div className="rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 p-5 space-y-4">
                <DetailRow label="Bank" value="Wema Bank" />
                <div className="h-px bg-card-foreground/[0.08]" />
                <DetailRow label="Account number" value="9012 3456 78" copy />
                <div className="h-px bg-card-foreground/[0.08]" />
                <DetailRow label="Account name" value="BazePay / Adaeze O." />
              </div>

              <div className="mt-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 p-4 flex gap-3">
                <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold">This is your unique BazePay number</p>
                  <p className="text-[11px] text-card-foreground/65 mt-0.5 leading-relaxed">
                    Transfers reflect in under 30 seconds. Save it for next time.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setStep("success")}
                className="mt-6 w-full h-13 py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold text-sm active:scale-[0.99] transition"
              >
                I've sent the transfer
              </button>
            </div>
          </motion.div>
        )}

        {step === "success" && (
          <motion.div
            key="success"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center px-6 text-center"
          >
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", damping: 18, stiffness: 200 }}
              className="w-24 h-24 rounded-full bg-lime/20 flex items-center justify-center"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-lime flex items-center justify-center">
                <Check className="w-8 h-8 text-lime-foreground" strokeWidth={3} />
              </div>
            </motion.div>
            <h1 className="font-display text-2xl font-bold tracking-tight mt-7">
              Top up successful
            </h1>
            <p className="text-sm text-foreground/55 mt-2 max-w-xs">
              <span className="font-bold text-foreground">₦{formatted}</span> has been added to your wallet.
            </p>
            <div className="mt-10 w-full max-w-sm space-y-3">
              <button
                onClick={() => navigate({ to: "/home" })}
                className="w-full h-13 py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold text-sm active:scale-[0.99] transition"
              >
                Back to home
              </button>
              <button
                onClick={() => navigate({ to: "/wallet" })}
                className="w-full h-13 py-3.5 rounded-2xl bg-foreground/10 text-foreground font-bold text-sm active:scale-[0.99] transition"
              >
                View transactions
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </PhoneFrame>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={`text-[12px] ${bold ? "font-bold" : "text-card-foreground/65"}`}>{label}</span>
      <span className={`tabular-nums ${bold ? "font-display font-bold text-base" : "text-sm font-semibold"}`}>
        {value}
      </span>
    </div>
  );
}

function DetailRow({ label, value, copy }: { label: string; value: string; copy?: boolean }) {
  const [copied, setCopied] = useState(false);
  const onCopy = () => {
    navigator.clipboard?.writeText(value.replace(/\s/g, "")).catch(() => {});
    setCopied(true);
    toast.success("Copied");
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex-1 min-w-0">
        <p className="text-[10px] uppercase tracking-wider font-bold text-card-foreground/55">{label}</p>
        <p className="text-sm font-bold mt-0.5 tabular-nums">{value}</p>
      </div>
      {copy && (
        <button
          onClick={onCopy}
          className="text-[11px] font-bold text-primary flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-primary/10"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      )}
    </div>
  );
}

function Keypad({ onPress }: { onPress: (key: string) => void }) {
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "back"];
  return (
    <div className="grid grid-cols-3 gap-1">
      {keys.map((k) => (
        <button
          key={k}
          onClick={() => onPress(k)}
          className="h-13 py-3 rounded-2xl text-xl font-display font-bold flex items-center justify-center active:bg-card-foreground/[0.06] transition"
        >
          {k === "back" ? <Delete className="w-5 h-5" /> : k}
        </button>
      ))}
    </div>
  );
}
