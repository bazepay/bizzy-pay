import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Plus, Eye, EyeOff, Snowflake, Settings2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { mockCards, mockTransactions, formatMoney, type VirtualCard } from "@/lib/mock";
import { BottomSheet, SuccessView } from "./_app.wallet";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/_app/cards")({
  component: CardsPage,
});

function CardsPage() {
  const [cards, setCards] = useState<VirtualCard[]>(mockCards);
  const [active, setActive] = useState(0);
  const [reveal, setReveal] = useState(false);
  const [issueOpen, setIssueOpen] = useState(false);
  const [issueDone, setIssueDone] = useState(false);
  const card = cards[active];

  const updateCard = (patch: Partial<VirtualCard>) => {
    setCards((cs) => cs.map((c, i) => (i === active ? { ...c, ...patch } : c)));
  };

  const handleIssue = (label: string, fund: number) => {
    const newCard: VirtualCard = {
      id: `c${cards.length + 1}`,
      label,
      last4: String(Math.floor(1000 + Math.random() * 9000)),
      brand: "Visa",
      balance: fund,
      currency: "NGN",
      frozen: false,
      spendLimit: 100000,
      expiry: "06/30",
      pan: "4242 4242 4242 " + String(Math.floor(1000 + Math.random() * 9000)),
      cvv: String(Math.floor(100 + Math.random() * 900)),
    };
    setCards([...cards, newCard]);
    setActive(cards.length);
    setIssueDone(true);
  };

  const cardTxns = mockTransactions.filter((t) => t.category === "card").slice(0, 4);

  return (
    <div>
      <header className="px-6 pt-12 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/home" className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-display font-bold text-lg">Cards</h1>
        </div>
        <button onClick={() => setIssueOpen(true)} className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
          <Plus className="w-5 h-5" />
        </button>
      </header>

      <div className="overflow-x-auto no-scrollbar snap-x snap-mandatory flex gap-4 px-6 pb-2 pt-4">
        {cards.map((c, i) => (
          <button key={c.id} onClick={() => { setActive(i); setReveal(false); }} className="snap-center shrink-0 w-72">
            <CardArt card={c} reveal={i === active && reveal} />
          </button>
        ))}
      </div>

      <div className="px-6 mt-4 flex justify-center gap-2">
        {cards.map((_, i) => (
          <div key={i} className={`h-1.5 rounded-full transition-all ${i === active ? "w-6 bg-primary" : "w-1.5 bg-muted"}`} />
        ))}
      </div>

      <div className="px-6 mt-6 space-y-4">
        <div className="bg-card rounded-2xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Snowflake className="w-5 h-5 text-primary" />
              <div>
                <p className="font-semibold text-sm">Freeze card</p>
                <p className="text-xs text-muted-foreground">Pause all transactions</p>
              </div>
            </div>
            <Switch checked={card.frozen} onCheckedChange={(v) => updateCard({ frozen: v })} />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <Settings2 className="w-5 h-5 text-primary" />
                <p className="font-semibold text-sm">Monthly limit</p>
              </div>
              <p className="text-sm font-bold">₦{card.spendLimit.toLocaleString()}</p>
            </div>
            <Slider value={[card.spendLimit]} max={500000} step={5000} onValueChange={([v]) => updateCard({ spendLimit: v })} />
          </div>

          <button onClick={() => setReveal(!reveal)} className="w-full flex items-center justify-between text-sm font-medium text-primary pt-2 border-t border-border">
            <span className="flex items-center gap-2">
              {reveal ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {reveal ? "Hide" : "Reveal"} card details
            </span>
          </button>
        </div>

        <div>
          <h3 className="font-display font-bold text-base mb-2">Recent on this card</h3>
          <div className="space-y-2">
            {cardTxns.map((t) => (
              <div key={t.id} className="flex items-center justify-between p-3 rounded-2xl bg-card">
                <div>
                  <p className="font-semibold text-sm">{t.title}</p>
                  <p className="text-xs text-muted-foreground">{new Date(t.date).toLocaleDateString()}</p>
                </div>
                <p className="font-bold text-sm">-{formatMoney(t.amount, t.currency)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <BottomSheet open={issueOpen} onClose={() => { setIssueOpen(false); setIssueDone(false); }} title={issueDone ? "Card issued" : "Issue new card"}>
        {issueDone ? (
          <SuccessView title="Card ready" subtitle="Your new virtual card is active" onDone={() => { setIssueOpen(false); setIssueDone(false); }} />
        ) : (
          <IssueForm onIssue={handleIssue} />
        )}
      </BottomSheet>
    </div>
  );
}

function IssueForm({ onIssue }: { onIssue: (label: string, fund: number) => void }) {
  const [label, setLabel] = useState("Travel");
  const [fund, setFund] = useState("50000");
  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs text-muted-foreground">Card label</label>
        <Input value={label} onChange={(e) => setLabel(e.target.value)} className="h-12 rounded-2xl mt-1" />
      </div>
      <div>
        <label className="text-xs text-muted-foreground">Initial fund (₦)</label>
        <Input value={fund} onChange={(e) => setFund(e.target.value)} className="h-12 rounded-2xl mt-1" />
      </div>
      <Button onClick={() => onIssue(label, Number(fund))} className="w-full h-12 bg-primary text-primary-foreground rounded-2xl font-semibold mt-3">
        Issue card
      </Button>
    </div>
  );
}

function CardArt({ card, reveal }: { card: VirtualCard; reveal: boolean }) {
  return (
    <div className={`relative rounded-3xl p-5 h-44 bg-gradient-card text-white shadow-card overflow-hidden ${card.frozen ? "opacity-60" : ""}`}>
      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-gold/30 blur-2xl" />
      <div className="relative flex flex-col h-full justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-widest text-white/60">{card.label}</span>
          <span className="font-display font-bold italic text-sm">{card.brand}</span>
        </div>
        <AnimatePresence mode="wait">
          {reveal ? (
            <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <p className="font-mono text-base tracking-widest">{card.pan}</p>
              <div className="flex gap-4 mt-1 text-[10px] text-white/70">
                <span>EXP {card.expiry}</span>
                <span>CVV {card.cvv}</span>
                <Copy className="w-3 h-3" />
              </div>
            </motion.div>
          ) : (
            <motion.div key="m" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <p className="font-mono text-lg tracking-widest">•••• •••• •••• {card.last4}</p>
              <p className="text-xs text-white/70 mt-1">Balance · {formatMoney(card.balance, card.currency)}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
