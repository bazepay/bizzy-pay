import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Search, ChevronDown, MessageCircle, HelpCircle, CreditCard, Wallet, Shield, Receipt } from "lucide-react";

export const Route = createFileRoute("/_app/profile_/help")({
  head: () => ({
    meta: [
      { title: "Help center — BazePay" },
      { name: "description", content: "Find answers to common BazePay questions." },
    ],
  }),
  component: HelpCenterPage,
});

const CATEGORIES = [
  { id: "wallet", label: "Wallet & funding", icon: Wallet },
  { id: "cards", label: "Cards", icon: CreditCard },
  { id: "bills", label: "Bills & airtime", icon: Receipt },
  { id: "security", label: "Security", icon: Shield },
];

const FAQS = [
  { cat: "wallet", q: "How do I fund my wallet?", a: "Go to Wallet → Add money. You can fund via bank transfer, card, or USSD. Transfers are credited within 30 seconds." },
  { cat: "wallet", q: "Why is my balance not updating?", a: "Pull down to refresh on the Home screen. If it still doesn't update after 5 minutes, contact support — we'll trace it instantly." },
  { cat: "wallet", q: "Is there a daily limit?", a: "Tier 2 accounts can transact up to ₦5,000,000 per month. Upgrade to Tier 3 from your Profile to remove the cap." },
  { cat: "cards", q: "Can I use my virtual card on any site?", a: "Yes — BazePay cards work on any merchant that accepts Visa or Mastercard, including Netflix, Spotify, and AWS." },
  { cat: "cards", q: "Why was my card declined?", a: "Most declines happen due to insufficient balance or merchant restrictions. Check the card's transaction history for the exact reason." },
  { cat: "bills", q: "How long does airtime take to deliver?", a: "Airtime is instant. If you don't receive it within 2 minutes, the transaction is automatically reversed." },
  { cat: "bills", q: "Can I pay TV subscriptions?", a: "Yes — DSTV, GOTV, and Startimes are supported under Pay → TV." },
  { cat: "security", q: "What if I forget my PIN?", a: "Tap 'Forgot PIN' on the login screen. We'll verify your identity via your registered phone number." },
  { cat: "security", q: "Is my money safe?", a: "All deposits are held with our licensed banking partner and protected by industry-standard encryption and 2FA." },
];

function HelpCenterPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return FAQS.filter((f) => {
      if (activeCat && f.cat !== activeCat) return false;
      if (!q) return true;
      return f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q);
    });
  }, [query, activeCat]);

  return (
    <div className="min-h-full bg-card text-card-foreground flex flex-col">
      <header className="px-6 pt-12 pb-4 flex items-center gap-3">
        <button
          onClick={() => navigate({ to: "/profile" })}
          className="w-10 h-10 rounded-full bg-card-foreground/10 flex items-center justify-center"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-display text-xl font-bold">Help center</h1>
      </header>

      <div className="px-6 pb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-card-foreground/45" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search articles…"
            className="w-full h-12 pl-11 pr-4 rounded-full bg-card-foreground/[0.06] text-sm outline-none focus:ring-2 ring-primary/40"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 mt-5">
          {CATEGORIES.map((c) => {
            const Icon = c.icon;
            const active = activeCat === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setActiveCat(active ? null : c.id)}
                className={`flex items-center gap-2.5 p-3.5 rounded-2xl text-left transition ${
                  active ? "bg-primary text-primary-foreground" : "bg-card-foreground/[0.05]"
                }`}
              >
                <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                  active ? "bg-primary-foreground/15" : "bg-card"
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold leading-tight">{c.label}</span>
              </button>
            );
          })}
        </div>

        <p className="text-[11px] uppercase tracking-widest text-card-foreground/45 font-semibold mt-7 mb-3 px-1">
          {activeCat ? `${filtered.length} articles` : "Popular questions"}
        </p>

        <div className="space-y-2.5">
          {filtered.length === 0 && (
            <div className="text-center py-10 text-sm text-card-foreground/55">
              <HelpCircle className="w-8 h-8 mx-auto mb-2 opacity-40" />
              No results. Try different keywords.
            </div>
          )}
          {filtered.map((f, i) => {
            const open = openIdx === i;
            return (
              <div key={i} className="rounded-2xl bg-card-foreground/[0.04] overflow-hidden">
                <button
                  onClick={() => setOpenIdx(open ? null : i)}
                  className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left"
                >
                  <span className="text-sm font-semibold">{f.q}</span>
                  <motion.span animate={{ rotate: open ? 180 : 0 }} className="text-card-foreground/50">
                    <ChevronDown className="w-4 h-4" />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <p className="px-4 pb-4 text-sm text-card-foreground/70 leading-relaxed">{f.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        <button
          onClick={() => navigate({ to: "/profile/help/chat" })}
          className="mt-7 w-full h-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center gap-2 text-sm font-semibold active:scale-[0.99] transition"
        >
          <MessageCircle className="w-4 h-4" />
          Still need help? Chat with us
        </button>
      </div>
    </div>
  );
}
