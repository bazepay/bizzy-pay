import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Search,
  Plus,
  Check,
  Delete,
  Building2,
  Users,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/transfer")({
  head: () => ({
    meta: [
      { title: "Send money — BazePay" },
      { name: "description", content: "Send money to anyone, instantly." },
    ],
  }),
  component: TransferFlow,
});

type Recipient = {
  id: string;
  name: string;
  bank: string;
  account: string;
  initials: string;
  color: string;
};

const RECENTS: Recipient[] = [
  { id: "r1", name: "Tunde Adebayo", bank: "GTBank", account: "0123456789", initials: "TA", color: "#FFE4D6" },
  { id: "r2", name: "Chioma Eze", bank: "Access Bank", account: "0234567890", initials: "CE", color: "#E0E7FF" },
  { id: "r3", name: "Mom", bank: "First Bank", account: "0345678901", initials: "MO", color: "#FCE7F3" },
  { id: "r4", name: "Femi Akande", bank: "Zenith Bank", account: "0456789012", initials: "FA", color: "#D1FAE5" },
];

const BANKS = [
  "GTBank",
  "Access Bank",
  "Zenith Bank",
  "First Bank",
  "UBA",
  "Wema Bank",
  "Stanbic IBTC",
  "Kuda",
  "Opay",
  "Palmpay",
];

type Step = "recipient" | "new-recipient" | "amount" | "review" | "success";

function TransferFlow() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("recipient");
  const [query, setQuery] = useState("");
  const [recipient, setRecipient] = useState<Recipient | null>(null);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  // new recipient form
  const [newAccount, setNewAccount] = useState("");
  const [newBank, setNewBank] = useState<string | null>(null);

  const numeric = Number(amount.replace(/,/g, "")) || 0;
  const formatted = numeric ? numeric.toLocaleString("en-US") : "0";
  const fee = numeric > 5000 ? 25 : 10;

  const filtered = RECENTS.filter(
    (r) =>
      !query ||
      r.name.toLowerCase().includes(query.toLowerCase()) ||
      r.bank.toLowerCase().includes(query.toLowerCase()) ||
      r.account.includes(query),
  );

  const press = (key: string) => {
    if (key === "back") {
      setAmount((a) => a.slice(0, -1));
      return;
    }
    if (key === "." && amount.includes(".")) return;
    if (amount.length >= 12) return;
    setAmount((a) => a + key);
  };

  const back = () => {
    if (step === "recipient") navigate({ to: "/home" });
    else if (step === "new-recipient") setStep("recipient");
    else if (step === "amount") setStep("recipient");
    else if (step === "review") setStep("amount");
    else setStep("recipient");
  };

  const onContinueAmount = () => {
    if (!numeric || numeric < 100) {
      toast.error("Enter at least ₦100");
      return;
    }
    setStep("review");
  };

  const confirmNewRecipient = () => {
    if (newAccount.length < 10 || !newBank) {
      toast.error("Enter a valid 10-digit account and bank");
      return;
    }
    const initials = newBank.slice(0, 2).toUpperCase();
    setRecipient({
      id: `new-${Date.now()}`,
      name: "Account holder",
      bank: newBank,
      account: newAccount,
      initials,
      color: "#E0E7FF",
    });
    setStep("amount");
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <div className="h-10" />
      <div className="px-6 pt-4 flex items-center justify-between">
        <button
          onClick={back}
          className="w-10 h-10 rounded-full bg-foreground/10 flex items-center justify-center"
          aria-label="Back"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <p className="text-[11px] uppercase tracking-[0.18em] font-bold text-foreground/55">
          Send money
        </p>
        <div className="w-10" />
      </div>

      <AnimatePresence mode="wait">
        {step === "recipient" && (
          <motion.div
            key="recipient"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.25 }}
            className="flex-1 flex flex-col"
          >
            <div className="px-6 mt-6">
              <h1 className="font-display text-2xl font-bold tracking-tight">Who are you paying?</h1>
              <p className="text-sm text-foreground/55 mt-1">Pick a recent contact or add new.</p>
            </div>

            <div className="px-6 mt-5">
              <div className="flex items-center gap-2 bg-foreground/10 rounded-full px-4 h-11">
                <Search className="w-4 h-4 text-foreground/45" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search name, bank or account"
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-foreground/45"
                />
              </div>
            </div>

            <div className="flex-1 mt-6 bg-card text-card-foreground rounded-t-[2rem] px-6 pt-6 pb-8">
              <button
                onClick={() => setStep("new-recipient")}
                className="w-full flex items-center gap-3 p-4 rounded-2xl border-2 border-dashed border-card-foreground/15 active:bg-card-foreground/[0.04] transition"
              >
                <div className="w-11 h-11 rounded-full bg-primary/15 text-primary flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-bold text-sm">Add new recipient</p>
                  <p className="text-[11px] text-card-foreground/55 mt-0.5">Bank account · Nigeria</p>
                </div>
                <ChevronRight className="w-4 h-4 text-card-foreground/40" />
              </button>

              <p className="text-[11px] uppercase tracking-widest text-card-foreground/50 font-semibold mt-7 mb-3 px-1">
                Recent
              </p>
              <div className="space-y-1">
                {filtered.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => {
                      setRecipient(r);
                      setStep("amount");
                    }}
                    className="w-full flex items-center gap-3 -mx-2 px-2 py-2.5 rounded-xl active:bg-card-foreground/[0.04] transition text-left"
                  >
                    <div
                      className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                      style={{ background: r.color, color: "#1a1335" }}
                    >
                      {r.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{r.name}</p>
                      <p className="text-[11px] text-card-foreground/55 truncate">
                        {r.bank} · {r.account}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-card-foreground/30" />
                  </button>
                ))}
                {filtered.length === 0 && (
                  <p className="text-center text-sm text-card-foreground/40 py-8">
                    No matches.
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {step === "new-recipient" && (
          <motion.div
            key="new-recipient"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.25 }}
            className="flex-1 flex flex-col"
          >
            <div className="px-6 mt-6">
              <h1 className="font-display text-2xl font-bold tracking-tight">New recipient</h1>
              <p className="text-sm text-foreground/55 mt-1">We'll verify the account name automatically.</p>
            </div>

            <div className="flex-1 mt-7 bg-card text-card-foreground rounded-t-[2rem] px-6 pt-6 pb-8">
              <label className="block">
                <span className="text-[11px] uppercase tracking-widest text-card-foreground/50 font-semibold">
                  Account number
                </span>
                <input
                  inputMode="numeric"
                  maxLength={10}
                  value={newAccount}
                  onChange={(e) => setNewAccount(e.target.value.replace(/\D/g, ""))}
                  placeholder="0000000000"
                  className="mt-1.5 w-full h-13 py-3 px-4 rounded-2xl bg-card-foreground/[0.04] text-base font-semibold tabular-nums tracking-wider outline-none focus:bg-card-foreground/[0.08]"
                />
              </label>

              <p className="text-[11px] uppercase tracking-widest text-card-foreground/50 font-semibold mt-6 mb-2">
                Bank
              </p>
              <div className="rounded-2xl bg-card-foreground/[0.04] max-h-[260px] overflow-y-auto no-scrollbar divide-y divide-card-foreground/[0.06]">
                {BANKS.map((b) => {
                  const selected = newBank === b;
                  return (
                    <button
                      key={b}
                      onClick={() => setNewBank(b)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left active:bg-card-foreground/[0.04]"
                    >
                      <div className="w-9 h-9 rounded-lg bg-primary/15 text-primary flex items-center justify-center shrink-0">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <span className="flex-1 text-sm font-semibold">{b}</span>
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

              <button
                onClick={confirmNewRecipient}
                disabled={newAccount.length < 10 || !newBank}
                className="mt-6 w-full h-13 py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold text-sm disabled:opacity-40 active:scale-[0.99] transition"
              >
                Continue
              </button>
            </div>
          </motion.div>
        )}

        {step === "amount" && recipient && (
          <motion.div
            key="amount"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.25 }}
            className="flex-1 flex flex-col"
          >
            <div className="flex-1 flex flex-col items-center justify-center px-6">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-base font-bold"
                style={{ background: recipient.color, color: "#1a1335" }}
              >
                {recipient.initials}
              </div>
              <p className="text-xs text-foreground/55 font-semibold mt-3">
                Sending to <span className="text-foreground font-bold">{recipient.name}</span>
              </p>
              <p className="text-[10px] text-foreground/40 mt-0.5">{recipient.bank} · {recipient.account}</p>

              <p className="font-display text-6xl font-bold tracking-tight mt-7 tabular-nums">
                <span className="text-foreground/40">₦</span>
                {formatted}
              </p>

              <input
                value={note}
                onChange={(e) => setNote(e.target.value.slice(0, 64))}
                placeholder="Add a note (optional)"
                className="mt-5 bg-foreground/10 rounded-full px-4 h-10 text-xs outline-none placeholder:text-foreground/45 text-center w-64"
              />
            </div>

            <div className="bg-card text-card-foreground rounded-t-[2rem] px-6 pt-6 pb-8">
              <Keypad onPress={press} />
              <button
                onClick={onContinueAmount}
                disabled={!numeric}
                className="mt-5 w-full h-13 py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold text-sm disabled:opacity-40 active:scale-[0.99] transition"
              >
                Review transfer
              </button>
            </div>
          </motion.div>
        )}

        {step === "review" && recipient && (
          <motion.div
            key="review"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.25 }}
            className="flex-1 flex flex-col"
          >
            <div className="px-6 mt-6 text-center">
              <p className="text-xs text-foreground/55 font-semibold">You are sending</p>
              <p className="font-display text-4xl font-bold tracking-tight mt-2 tabular-nums">
                ₦{formatted}
              </p>
            </div>

            <div className="flex-1 mt-7 bg-card text-card-foreground rounded-t-[2rem] px-6 pt-6 pb-8">
              <div className="rounded-2xl bg-card-foreground/[0.04] p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                    style={{ background: recipient.color, color: "#1a1335" }}
                  >
                    {recipient.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] uppercase tracking-wider font-bold text-card-foreground/55">
                      Recipient
                    </p>
                    <p className="text-sm font-bold truncate">{recipient.name}</p>
                    <p className="text-[11px] text-card-foreground/55 truncate">
                      {recipient.bank} · {recipient.account}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-2xl bg-card-foreground/[0.04] p-4 space-y-2.5">
                <Row label="Amount" value={`₦${formatted}`} />
                <Row label="Fee" value={`₦${fee}`} />
                {note && <Row label="Note" value={note} />}
                <div className="h-px bg-card-foreground/[0.08]" />
                <Row label="Total" value={`₦${(numeric + fee).toLocaleString()}`} bold />
              </div>

              <div className="mt-5 rounded-2xl bg-primary/5 border border-primary/15 p-4 flex gap-3">
                <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold">Safe transfer</p>
                  <p className="text-[11px] text-card-foreground/65 mt-0.5 leading-relaxed">
                    BazePay reverses failed transfers automatically. You're covered.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setStep("success")}
                className="mt-6 w-full h-13 py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold text-sm active:scale-[0.99] transition"
              >
                Confirm & send
              </button>
            </div>
          </motion.div>
        )}

        {step === "success" && recipient && (
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
              Transfer sent
            </h1>
            <p className="text-sm text-foreground/55 mt-2 max-w-xs">
              <span className="font-bold text-foreground">₦{formatted}</span> is on the way to{" "}
              <span className="font-bold text-foreground">{recipient.name}</span>.
            </p>
            <div className="mt-10 w-full max-w-sm space-y-3">
              <button
                onClick={() => navigate({ to: "/home" })}
                className="w-full h-13 py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold text-sm active:scale-[0.99] transition"
              >
                Back to home
              </button>
              <button
                onClick={() => {
                  setStep("recipient");
                  setRecipient(null);
                  setAmount("");
                  setNote("");
                }}
                className="w-full h-13 py-3.5 rounded-2xl bg-foreground/10 text-foreground font-bold text-sm active:scale-[0.99] transition flex items-center justify-center gap-2"
              >
                <Users className="w-4 h-4" />
                Send to another person
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className={`text-[12px] ${bold ? "font-bold" : "text-card-foreground/65"}`}>{label}</span>
      <span className={`tabular-nums text-right ${bold ? "font-display font-bold text-base" : "text-sm font-semibold"}`}>
        {value}
      </span>
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
