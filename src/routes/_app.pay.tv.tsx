import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Sparkles,
  Tv,
  X,
  ShieldCheck,
  Calendar,
} from "lucide-react";

export const Route = createFileRoute("/_app/pay/tv")({
  head: () => ({
    meta: [
      { title: "Pay TV subscription · BazePay" },
      { name: "description", content: "Renew DStv, GOtv, Startimes and Showmax in seconds." },
    ],
  }),
  component: TvPage,
});

type Provider = {
  id: string;
  name: string;
  short: string;
  tagline: string;
  color: string;
  digits: number;
};

const providers: Provider[] = [
  { id: "dstv", name: "DStv", short: "DStv", tagline: "MultiChoice · Premium TV", color: "#0A47A9", digits: 10 },
  { id: "gotv", name: "GOtv", short: "GOtv", tagline: "MultiChoice · Everyday TV", color: "#00A859", digits: 10 },
  { id: "startimes", name: "Startimes", short: "ST", tagline: "Pay-as-you-watch", color: "#E63946", digits: 11 },
  { id: "showmax", name: "Showmax", short: "SM", tagline: "Streaming · Mobile", color: "#1A1A1A", digits: 10 },
];

type Plan = {
  id: string;
  name: string;
  price: number;
  channels: string;
  duration: string;
  badge?: string;
};

const plans: Record<string, Plan[]> = {
  dstv: [
    { id: "padi", name: "Padi", price: 4400, channels: "50+ channels", duration: "1 month" },
    { id: "yanga", name: "Yanga", price: 6200, channels: "65+ channels", duration: "1 month" },
    { id: "confam", name: "Confam", price: 11000, channels: "85+ channels", duration: "1 month", badge: "Popular" },
    { id: "compact", name: "Compact", price: 19000, channels: "120+ channels", duration: "1 month" },
    { id: "compact-plus", name: "Compact Plus", price: 30000, channels: "155+ channels", duration: "1 month" },
    { id: "premium", name: "Premium", price: 44500, channels: "175+ channels · Sports", duration: "1 month", badge: "Top tier" },
  ],
  gotv: [
    { id: "smallie", name: "Smallie", price: 1900, channels: "30+ channels", duration: "1 month" },
    { id: "jinja", name: "Jinja", price: 4150, channels: "65+ channels", duration: "1 month" },
    { id: "jolli", name: "Jolli", price: 6200, channels: "75+ channels", duration: "1 month", badge: "Popular" },
    { id: "max", name: "Max", price: 9300, channels: "90+ channels · Sports", duration: "1 month" },
    { id: "supa", name: "Supa", price: 12500, channels: "100+ channels · Sports+", duration: "1 month" },
  ],
  startimes: [
    { id: "nova", name: "Nova", price: 1700, channels: "Basic bouquet", duration: "1 month" },
    { id: "basic", name: "Basic", price: 4500, channels: "Antenna basic", duration: "1 month" },
    { id: "smart", name: "Smart", price: 6200, channels: "Dish smart", duration: "1 month", badge: "Popular" },
    { id: "classic", name: "Classic", price: 7500, channels: "Antenna classic", duration: "1 month" },
    { id: "super", name: "Super", price: 9800, channels: "Dish super · Sports", duration: "1 month" },
  ],
  showmax: [
    { id: "mobile", name: "Mobile", price: 1600, channels: "Stream on phone", duration: "1 month" },
    { id: "entertainment", name: "Entertainment", price: 3500, channels: "Series, movies, kids", duration: "1 month", badge: "Popular" },
    { id: "premier-league", name: "Premier League", price: 6300, channels: "EPL · Mobile", duration: "1 month" },
    { id: "full", name: "Full Sports", price: 10500, channels: "All sports · 2 screens", duration: "1 month" },
  ],
};

const recents = [
  { iuc: "7012345678", provider: "dstv", label: "Living room · DStv" },
  { iuc: "2034567890", provider: "gotv", label: "Bedroom · GOtv" },
  { iuc: "08123456789", provider: "startimes", label: "Shop · Startimes" },
];

function TvPage() {
  const navigate = useNavigate();
  const [providerId, setProviderId] = useState<string>("dstv");
  const [iuc, setIuc] = useState("");
  const [planId, setPlanId] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);
  const [success, setSuccess] = useState(false);

  const provider = providers.find((p) => p.id === providerId)!;
  const providerPlans = plans[providerId] ?? [];
  const plan = providerPlans.find((p) => p.id === planId) ?? null;
  const iucDigits = iuc.replace(/\D/g, "");
  const verified = iucDigits.length >= provider.digits;
  const valid = verified && plan !== null;
  const cashback = plan ? Math.floor(plan.price * 0.005) : 0;

  const customer = useMemo(() => {
    if (!verified) return null;
    const names = ["Ade Okafor", "Chidi Eze", "Funke Adeyemi", "Bola Ojo", "Tunde Bello"];
    return names[iucDigits.charCodeAt(0) % names.length];
  }, [verified, iucDigits]);

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
          <h1 className="font-display text-xl font-bold tracking-tight">TV subscription</h1>
          <p className="text-[11px] text-foreground/50">Instant renewal · 0.5% cashback</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-service-cable/15 text-service-cable flex items-center justify-center">
          <Tv className="w-4 h-4" />
        </div>
      </div>

      {/* Hero */}
      <div className="px-6 mt-5">
        <div
          className="rounded-3xl p-5 transition-colors"
          style={{ backgroundColor: provider.color, color: "#FFFFFF" }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] opacity-85">
              {provider.name} · {plan ? plan.name : "Pick a plan"}
            </span>
            <span className="text-[11px] font-bold opacity-85">NGN</span>
          </div>
          <p className="font-display text-4xl font-bold tracking-tight mt-3">
            ₦{plan ? plan.price.toLocaleString() : "0"}
          </p>
          <p className="text-[12px] mt-1 opacity-85">
            {verified
              ? `${customer} · ${plan ? plan.channels : "Choose a bouquet"}`
              : "Enter smartcard / IUC number"}
          </p>
        </div>
      </div>

      <div className="flex-1 mt-6 bg-card text-card-foreground rounded-t-[2rem] px-6 pt-6 pb-32 space-y-6">
        {/* Provider picker */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-card-foreground/50 mb-2 px-1">
            Provider
          </p>
          <div className="grid grid-cols-4 gap-2">
            {providers.map((p) => {
              const sel = p.id === providerId;
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    setProviderId(p.id);
                    setPlanId(null);
                  }}
                  className="relative aspect-square rounded-2xl flex flex-col items-center justify-center gap-1.5 transition active:scale-95"
                  style={{
                    background: sel
                      ? p.color
                      : "color-mix(in oklab, var(--card-foreground) 4%, transparent)",
                    color: sel ? "#fff" : "var(--card-foreground)",
                    boxShadow: sel ? `0 8px 20px -8px ${p.color}` : "none",
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
                      background: sel ? "rgba(255,255,255,0.2)" : `color-mix(in oklab, ${p.color} 16%, transparent)`,
                      color: sel ? "#fff" : p.color,
                    }}
                  >
                    {p.short.length > 2 ? p.short.slice(0, 2) : p.short}
                  </span>
                  <span className="text-[10px] font-bold leading-none">{p.name}</span>
                </button>
              );
            })}
          </div>
          <p className="mt-2 px-1 text-[10px] text-card-foreground/55">
            <span className="font-semibold text-card-foreground/75">{provider.name}</span> · {provider.tagline}
          </p>
        </div>

        {/* IUC / smartcard */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-card-foreground/50 mb-2 px-1">
            Smartcard / IUC number
          </p>
          <div className="relative">
            <input
              value={iuc}
              onChange={(e) => setIuc(e.target.value.replace(/\D/g, "").slice(0, 13))}
              placeholder={`e.g. ${"1".repeat(provider.digits)}`}
              inputMode="numeric"
              className="w-full h-14 rounded-2xl bg-card-foreground/[0.04] pl-4 pr-12 text-base font-semibold tracking-wide outline-none focus:bg-card-foreground/[0.06]"
            />
            {iuc && (
              <button
                onClick={() => setIuc("")}
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
              <span className="text-card-foreground/55">verified · {provider.name}</span>
            </div>
          )}
        </div>

        {/* Plans */}
        <div>
          <div className="flex items-center justify-between mb-2 px-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-card-foreground/50">
              Bouquets
            </p>
            <span className="text-[10px] font-semibold text-card-foreground/45">
              {providerPlans.length} plans
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {providerPlans.map((p) => {
              const sel = planId === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setPlanId(p.id)}
                  className="relative rounded-2xl p-3 text-left transition active:scale-[0.98]"
                  style={{
                    background: sel
                      ? provider.color
                      : "color-mix(in oklab, var(--card-foreground) 4%, transparent)",
                    color: sel ? "#fff" : "var(--card-foreground)",
                    boxShadow: sel ? `0 8px 20px -10px ${provider.color}` : "none",
                  }}
                >
                  {p.badge && (
                    <span
                      className="absolute top-2 right-2 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full"
                      style={{
                        background: sel ? "rgba(255,255,255,0.2)" : `color-mix(in oklab, ${provider.color} 14%, transparent)`,
                        color: sel ? "#fff" : provider.color,
                      }}
                    >
                      {p.badge}
                    </span>
                  )}
                  <p className="text-[13px] font-bold">{p.name}</p>
                  <p className="font-display text-lg font-bold mt-1">
                    ₦{p.price.toLocaleString()}
                  </p>
                  <p className="text-[10px] mt-0.5 leading-tight" style={{ opacity: sel ? 0.85 : 0.6 }}>
                    {p.channels}
                  </p>
                  <p
                    className="text-[10px] mt-1 inline-flex items-center gap-1 font-semibold"
                    style={{ opacity: sel ? 0.85 : 0.55 }}
                  >
                    <Calendar className="w-2.5 h-2.5" />
                    {p.duration}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Recents */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-card-foreground/50 mb-2 px-1">
            Saved smartcards
          </p>
          <div className="rounded-2xl bg-card-foreground/[0.04] divide-y divide-card-foreground/[0.06] overflow-hidden">
            {recents.map((r) => {
              const p = providers.find((x) => x.id === r.provider)!;
              return (
                <button
                  key={r.iuc}
                  onClick={() => {
                    setIuc(r.iuc);
                    setProviderId(r.provider);
                    setPlanId(null);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left active:bg-card-foreground/[0.06]"
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-[10px] font-bold"
                    style={{
                      background: `color-mix(in oklab, ${p.color} 18%, transparent)`,
                      color: p.color,
                    }}
                  >
                    {p.short.length > 2 ? p.short.slice(0, 2) : p.short}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{r.label}</p>
                    <p className="text-[11px] text-card-foreground/55">
                      {p.name} · {r.iuc}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-card-foreground/40" />
                </button>
              );
            })}
          </div>
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
          {plan ? `Renew · ₦${plan.price.toLocaleString()}` : "Pick a bouquet"}
        </button>
      </div>

      {confirm && !success && plan && (
        <ConfirmSheet
          iuc={iuc}
          customer={customer ?? ""}
          provider={provider}
          plan={plan}
          cashback={cashback}
          onClose={() => setConfirm(false)}
          onConfirm={() => setSuccess(true)}
        />
      )}

      {success && plan && (
        <SuccessSheet
          iuc={iuc}
          customer={customer ?? ""}
          provider={provider}
          plan={plan}
          cashback={cashback}
          onDone={() => navigate({ to: "/wallet" })}
        />
      )}
    </div>
  );
}

function ConfirmSheet({
  iuc,
  customer,
  provider,
  plan,
  cashback,
  onClose,
  onConfirm,
}: {
  iuc: string;
  customer: string;
  provider: Provider;
  plan: Plan;
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
          <h3 className="font-display font-bold text-base">Confirm renewal</h3>
          <p className="text-[11px] text-card-foreground/55 mt-0.5">Review before paying</p>
        </div>

        <div className="px-6 mt-5 flex flex-col items-center">
          <p className="text-[11px] text-card-foreground/55">You'll pay</p>
          <p className="font-display text-3xl font-bold mt-1">₦{plan.price.toLocaleString()}</p>
          {cashback > 0 && (
            <span className="mt-2 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-success/15 text-success text-[10px] font-bold uppercase tracking-wider">
              <Sparkles className="w-3 h-3" /> +₦{cashback} cashback
            </span>
          )}
        </div>

        <div className="mx-6 mt-5 rounded-2xl bg-card-foreground/[0.04] divide-y divide-card-foreground/[0.06] overflow-hidden">
          <Row label="Customer" value={customer} />
          <Row label="Smartcard" value={iuc} />
          <Row
            label="Provider"
            value={
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: provider.color }} />
                {provider.name}
              </span>
            }
          />
          <Row label="Bouquet" value={plan.name} />
          <Row label="Duration" value={plan.duration} />
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
            Renew now <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function SuccessSheet({
  iuc,
  customer,
  provider,
  plan,
  cashback,
  onDone,
}: {
  iuc: string;
  customer: string;
  provider: Provider;
  plan: Plan;
  cashback: number;
  onDone: () => void;
}) {
  const ref = `BZP-TV-${Math.floor(Math.random() * 90000 + 10000)}`;
  const expiry = new Date();
  expiry.setMonth(expiry.getMonth() + 1);
  const expiryStr = expiry.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="fixed inset-0 z-[80] flex items-end">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200" />
      <div className="relative w-full bg-card text-card-foreground rounded-t-[2rem] pt-3 pb-8 animate-in slide-in-from-bottom duration-300">
        <div className="w-10 h-1 rounded-full bg-card-foreground/15 mx-auto" />
        <div className="px-6 mt-6 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-success/15 text-success flex items-center justify-center">
            <Check className="w-7 h-7" strokeWidth={3} />
          </div>
          <h3 className="font-display font-bold text-xl mt-4">Subscription renewed</h3>
          <p className="text-[12px] text-card-foreground/55 mt-1">
            {provider.name} {plan.name} · {customer}
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
            background: `color-mix(in oklab, ${provider.color} 10%, transparent)`,
            border: `1px solid color-mix(in oklab, ${provider.color} 22%, transparent)`,
          }}
        >
          <p className="text-[10px] font-bold uppercase tracking-wider text-card-foreground/55">
            Active until
          </p>
          <div className="mt-1 flex items-center justify-between">
            <p className="font-display text-lg font-bold">{expiryStr}</p>
            <span className="text-[11px] font-bold" style={{ color: provider.color }}>
              {plan.duration}
            </span>
          </div>
          <p className="text-[10px] text-card-foreground/55 mt-1">Smartcard {iuc}</p>
        </div>

        <div className="mx-6 mt-3 rounded-2xl bg-card-foreground/[0.04] px-4 py-3 flex items-center justify-between">
          <p className="text-[12px] text-card-foreground/55">Reference</p>
          <p className="text-[13px] font-semibold">{ref}</p>
        </div>

        <div className="px-6 mt-5 grid grid-cols-2 gap-2">
          <Link
            to="/pay/tv"
            onClick={(e) => {
              e.preventDefault();
              window.location.reload();
            }}
            className="h-12 rounded-full bg-card-foreground/[0.06] flex items-center justify-center font-bold text-sm"
          >
            Renew another
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
