import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Dices,
  Sparkles,
  X,
  ShieldCheck,
} from "lucide-react";

export const Route = createFileRoute("/_app/pay/betting")({
  head: () => ({
    meta: [
      { title: "Fund betting wallet · BazePay" },
      { name: "description", content: "Top up Bet9ja, SportyBet, 1xBet and more instantly." },
    ],
  }),
  component: BettingPage,
});

type Bookmaker = {
  id: string;
  name: string;
  short: string;
  tagline: string;
  color: string;
};

const bookmakers: Bookmaker[] = [
  { id: "bet9ja", name: "Bet9ja", short: "B9", tagline: "Sports · Casino", color: "#1B7F3A" },
  { id: "sportybet", name: "SportyBet", short: "SB", tagline: "Sports · Virtuals", color: "#E11A2B" },
  { id: "1xbet", name: "1xBet", short: "1X", tagline: "Sports · Live", color: "#1B62C9" },
  { id: "betking", name: "BetKing", short: "BK", tagline: "Sports · Lotto", color: "#F6B100" },
  { id: "nairabet", name: "Nairabet", short: "NB", tagline: "Sports · Casino", color: "#0FA958" },
  { id: "betano", name: "Betano", short: "BT", tagline: "Sports · Live", color: "#FF7A00" },
  { id: "msport", name: "MSport", short: "MS", tagline: "Sports · Mobile", color: "#0066B3" },
  { id: "betwinner", name: "BetWinner", short: "BW", tagline: "Sports · eSports", color: "#0E1E2C" },
];

const presets = [500, 1000, 2000, 5000, 10000, 20000];

const recents = [
  { userId: "AGT9981234", bookmaker: "bet9ja", label: "Main account" },
  { userId: "9912334567", bookmaker: "sportybet", label: "Weekend" },
  { userId: "kingsley_45", bookmaker: "1xbet", label: "Live bets" },
];

function BettingPage() {
  const navigate = useNavigate();
  const [bookmakerId, setBookmakerId] = useState<string>("bet9ja");
  const [userId, setUserId] = useState("");
  const [amount, setAmount] = useState<number | null>(null);
  const [custom, setCustom] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [success, setSuccess] = useState(false);

  const bookmaker = bookmakers.find((b) => b.id === bookmakerId)!;
  const finalAmount = amount ?? (custom ? Number(custom) : 0);
  const verified = userId.trim().length >= 5;
  const valid = verified && finalAmount >= 100;
  const cashback = Math.floor(finalAmount * 0.005);

  const customer = useMemo(() => {
    if (!verified) return null;
    const names = ["Ade Okafor", "Chidi Eze", "Funke Adeyemi", "Bola Ojo", "Tunde Bello"];
    const seed = userId.charCodeAt(0) || 0;
    return names[seed % names.length];
  }, [verified, userId]);

  return (
    <div className="min-h-full bg-background text-foreground flex flex-col">
      <div className="h-10" />
      <div className="px-6 pt-4 flex items-center gap-3">
        <button
          onClick={() => navigate({ to: "/pay" })}
          className="w-10 h-10 rounded-full bg-card text-card-foreground flex items-center justify-center"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1">
          <h1 className="font-display text-xl font-bold tracking-tight">Fund betting wallet</h1>
          <p className="text-[11px] text-foreground/50">Instant top-up · 0.5% cashback</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-service-betting/15 text-service-betting flex items-center justify-center">
          <Dices className="w-4 h-4" />
        </div>
      </div>

      {/* Hero */}
      <div className="px-6 mt-5">
        <div
          className="rounded-3xl p-5 transition-colors"
          style={{ backgroundColor: bookmaker.color, color: "#FFFFFF" }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] opacity-85">
              {bookmaker.name} · Top-up
            </span>
            <span className="text-[11px] font-bold opacity-85">NGN</span>
          </div>
          <p className="font-display text-4xl font-bold tracking-tight mt-3">
            ₦{finalAmount ? finalAmount.toLocaleString() : "0"}
          </p>
          <p className="text-[12px] mt-1 opacity-85">
            {verified
              ? `${customer} · ${bookmaker.tagline}`
              : "Enter your account / user ID"}
          </p>
        </div>
      </div>

      <div className="flex-1 mt-6 bg-card text-card-foreground rounded-t-[2rem] px-6 pt-6 pb-32 space-y-6">
        {/* Bookmaker picker */}
        <div>
          <div className="flex items-center justify-between mb-2 px-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-card-foreground/50">
              Bookmaker
            </p>
            <span className="text-[10px] font-semibold text-card-foreground/45">
              {bookmakers.length} available
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {bookmakers.map((b) => {
              const sel = b.id === bookmakerId;
              return (
                <button
                  key={b.id}
                  onClick={() => setBookmakerId(b.id)}
                  className="relative aspect-square rounded-2xl flex flex-col items-center justify-center gap-1.5 transition active:scale-95"
                  style={{
                    background: sel
                      ? b.color
                      : "color-mix(in oklab, var(--card-foreground) 4%, transparent)",
                    color: sel ? "#fff" : "var(--card-foreground)",
                    boxShadow: sel ? `0 8px 20px -8px ${b.color}` : "none",
                  }}
                >
                  {sel && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-white/25 flex items-center justify-center">
                      <Check className="w-2.5 h-2.5" strokeWidth={3} />
                    </span>
                  )}
                  <span
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black tracking-tight"
                    style={{
                      background: sel ? "rgba(255,255,255,0.2)" : `color-mix(in oklab, ${b.color} 16%, transparent)`,
                      color: sel ? "#fff" : b.color,
                    }}
                  >
                    {b.short}
                  </span>
                  <span className="text-[10px] font-bold leading-none">{b.name}</span>
                </button>
              );
            })}
          </div>
          <p className="mt-2 px-1 text-[10px] text-card-foreground/55">
            <span className="font-semibold text-card-foreground/75">{bookmaker.name}</span> · {bookmaker.tagline}
          </p>
        </div>

        {/* User ID */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-card-foreground/50 mb-2 px-1">
            User ID / Account number
          </p>
          <div className="relative">
            <input
              value={userId}
              onChange={(e) => setUserId(e.target.value.slice(0, 20))}
              placeholder={`e.g. ${bookmaker.id === "bet9ja" ? "AGT9981234" : "9912334567"}`}
              className="w-full h-14 rounded-2xl bg-card-foreground/[0.04] pl-4 pr-12 text-base font-semibold tracking-wide outline-none focus:bg-card-foreground/[0.06]"
            />
            {userId && (
              <button
                onClick={() => setUserId("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-card-foreground/10 flex items-center justify-center"
                aria-label="Clear"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          {verified && customer && (
            <div className="mt-2 px-1 flex items-center gap-1.5 text-[11px] text-success">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="font-semibold">{customer}</span>
              <span className="text-card-foreground/55">verified · {bookmaker.name}</span>
            </div>
          )}
        </div>

        {/* Amount presets */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-card-foreground/50 mb-2 px-1">
            Amount
          </p>
          <div className="grid grid-cols-3 gap-2">
            {presets.map((a) => {
              const sel = amount === a;
              return (
                <button
                  key={a}
                  onClick={() => {
                    setAmount(a);
                    setCustom("");
                  }}
                  className={`h-12 rounded-2xl text-sm font-bold transition ${
                    sel ? "bg-card-foreground text-card" : "bg-card-foreground/[0.04] text-card-foreground/85"
                  }`}
                >
                  ₦{a.toLocaleString()}
                </button>
              );
            })}
          </div>
          <input
            value={custom}
            onChange={(e) => {
              setCustom(e.target.value.replace(/\D/g, ""));
              setAmount(null);
            }}
            placeholder="Custom (₦100 – ₦500,000)"
            inputMode="numeric"
            className="mt-2 w-full h-12 rounded-2xl bg-card-foreground/[0.04] px-4 text-sm font-semibold outline-none focus:bg-card-foreground/[0.06]"
          />
        </div>

        {/* Recents */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-card-foreground/50 mb-2 px-1">
            Saved accounts
          </p>
          <div className="rounded-2xl bg-card-foreground/[0.04] divide-y divide-card-foreground/[0.06] overflow-hidden">
            {recents.map((r) => {
              const b = bookmakers.find((x) => x.id === r.bookmaker)!;
              return (
                <button
                  key={r.userId}
                  onClick={() => {
                    setUserId(r.userId);
                    setBookmakerId(r.bookmaker);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left active:bg-card-foreground/[0.06]"
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-[10px] font-bold"
                    style={{
                      background: `color-mix(in oklab, ${b.color} 18%, transparent)`,
                      color: b.color,
                    }}
                  >
                    {b.short}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{r.label}</p>
                    <p className="text-[11px] text-card-foreground/55 truncate">
                      {b.name} · {r.userId}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-card-foreground/40" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Responsible gaming */}
        <div className="rounded-2xl bg-card-foreground/[0.03] border border-card-foreground/[0.06] px-4 py-3">
          <p className="text-[11px] font-bold text-card-foreground/75">Bet responsibly</p>
          <p className="text-[10px] text-card-foreground/55 mt-0.5 leading-relaxed">
            Only fund what you can afford to lose. 18+ only. Need help? Visit responsible gaming resources.
          </p>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="absolute bottom-0 left-0 right-0 px-4 pb-5 pt-3 bg-gradient-to-t from-card via-card to-transparent">
        {valid && cashback > 0 && (
          <p className="text-center text-[11px] font-semibold text-success mb-2">
            +₦{cashback} cashback
          </p>
        )}
        <button
          disabled={!valid}
          onClick={() => setConfirm(true)}
          className="w-full h-12 rounded-full bg-primary text-primary-foreground font-bold text-sm disabled:opacity-40 active:scale-[0.99] transition flex items-center justify-center gap-2"
        >
          {finalAmount > 0 ? `Fund ₦${finalAmount.toLocaleString()}` : "Fund wallet"}
        </button>
      </div>

      {confirm && !success && (
        <ConfirmSheet
          userId={userId}
          customer={customer ?? ""}
          bookmaker={bookmaker}
          amount={finalAmount}
          cashback={cashback}
          onClose={() => setConfirm(false)}
          onConfirm={() => setSuccess(true)}
        />
      )}

      {success && (
        <SuccessSheet
          userId={userId}
          customer={customer ?? ""}
          bookmaker={bookmaker}
          amount={finalAmount}
          cashback={cashback}
          onDone={() => navigate({ to: "/wallet" })}
        />
      )}
    </div>
  );
}

function ConfirmSheet({
  userId,
  customer,
  bookmaker,
  amount,
  cashback,
  onClose,
  onConfirm,
}: {
  userId: string;
  customer: string;
  bookmaker: Bookmaker;
  amount: number;
  cashback: number;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[70] flex items-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full bg-card text-card-foreground rounded-t-[2rem] pt-3 pb-8 animate-in slide-in-from-bottom duration-300"
      >
        <div className="w-10 h-1 rounded-full bg-card-foreground/15 mx-auto" />
        <div className="px-6 mt-4">
          <h3 className="font-display font-bold text-base">Confirm top-up</h3>
          <p className="text-[11px] text-card-foreground/55 mt-0.5">Review before funding</p>
        </div>

        <div className="px-6 mt-5 flex flex-col items-center">
          <p className="text-[11px] text-card-foreground/55">You'll fund</p>
          <p className="font-display text-3xl font-bold mt-1">₦{amount.toLocaleString()}</p>
          {cashback > 0 && (
            <span className="mt-2 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-success/15 text-success text-[10px] font-bold uppercase tracking-wider">
              <Sparkles className="w-3 h-3" /> +₦{cashback} cashback
            </span>
          )}
        </div>

        <div className="mx-6 mt-5 rounded-2xl bg-card-foreground/[0.04] divide-y divide-card-foreground/[0.06] overflow-hidden">
          <Row label="Customer" value={customer} />
          <Row label="User ID" value={userId} />
          <Row
            label="Bookmaker"
            value={
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: bookmaker.color }} />
                {bookmaker.name}
              </span>
            }
          />
          <Row label="Pay from" value="Wallet · NGN" />
          <Row label="Fee" value="₦0.00" />
        </div>

        <div className="px-6 mt-5 grid grid-cols-2 gap-2">
          <button
            onClick={onClose}
            className="h-12 rounded-full bg-card-foreground/[0.06] font-bold text-sm"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="h-12 rounded-full bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-2"
          >
            Fund now <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function SuccessSheet({
  userId,
  customer,
  bookmaker,
  amount,
  cashback,
  onDone,
}: {
  userId: string;
  customer: string;
  bookmaker: Bookmaker;
  amount: number;
  cashback: number;
  onDone: () => void;
}) {
  const ref = `BZP-BET-${Math.floor(Math.random() * 90000 + 10000)}`;

  return (
    <div className="fixed inset-0 z-[80] flex items-end">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200" />
      <div className="relative w-full bg-card text-card-foreground rounded-t-[2rem] pt-3 pb-8 animate-in slide-in-from-bottom duration-300">
        <div className="w-10 h-1 rounded-full bg-card-foreground/15 mx-auto" />
        <div className="px-6 mt-6 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-success/15 text-success flex items-center justify-center">
            <Check className="w-7 h-7" strokeWidth={3} />
          </div>
          <h3 className="font-display font-bold text-xl mt-4">Wallet funded</h3>
          <p className="text-[12px] text-card-foreground/55 mt-1">
            ₦{amount.toLocaleString()} · {bookmaker.name} · {customer}
          </p>
          {cashback > 0 && (
            <p className="text-[11px] text-success font-semibold mt-2">
              +₦{cashback} cashback added to wallet
            </p>
          )}
        </div>

        <div
          className="mx-6 mt-5 rounded-2xl px-4 py-4"
          style={{
            background: `color-mix(in oklab, ${bookmaker.color} 10%, transparent)`,
            border: `1px solid color-mix(in oklab, ${bookmaker.color} 22%, transparent)`,
          }}
        >
          <p className="text-[10px] font-bold uppercase tracking-wider text-card-foreground/55">
            Funded account
          </p>
          <p className="font-display text-lg font-bold mt-1">{userId}</p>
          <p className="text-[10px] text-card-foreground/55 mt-1">{bookmaker.name} · {bookmaker.tagline}</p>
        </div>

        <div className="mx-6 mt-3 rounded-2xl bg-card-foreground/[0.04] px-4 py-3 flex items-center justify-between">
          <p className="text-[12px] text-card-foreground/55">Reference</p>
          <p className="text-[13px] font-semibold">{ref}</p>
        </div>

        <div className="px-6 mt-5 grid grid-cols-2 gap-2">
          <Link
            to="/pay/betting"
            onClick={(e) => {
              e.preventDefault();
              window.location.reload();
            }}
            className="h-12 rounded-full bg-card-foreground/[0.06] flex items-center justify-center font-bold text-sm"
          >
            Fund again
          </Link>
          <button
            onClick={onDone}
            className="h-12 rounded-full bg-primary text-primary-foreground font-bold text-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <span className="text-[12px] text-card-foreground/55">{label}</span>
      <span className="text-[13px] font-semibold">{value}</span>
    </div>
  );
}
