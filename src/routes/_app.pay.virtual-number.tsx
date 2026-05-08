import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Hash,
  ShieldCheck,
  Sparkles,
  X,
  MessageSquare,
  Clock,
  Lock,
  RefreshCw,
} from "lucide-react";

export const Route = createFileRoute("/_app/pay/virtual-number")({
  head: () => ({
    meta: [
      { title: "Virtual Number · BazePay" },
      { name: "description", content: "Real local phone numbers from 200+ countries. Receive SMS for WhatsApp, Google, banks & more." },
    ],
  }),
  component: VirtualNumberPage,
});

type Country = {
  id: string;
  name: string;
  code: string; // dial code label
  flag: string; // emoji
  iso: string;
};

const countries: Country[] = [
  { id: "us", name: "USA", code: "+1", flag: "🇺🇸", iso: "US" },
  { id: "gb", name: "United Kingdom", code: "+44", flag: "🇬🇧", iso: "GB" },
  { id: "ca", name: "Canada", code: "+1", flag: "🇨🇦", iso: "CA" },
  { id: "nl", name: "Netherlands", code: "+31", flag: "🇳🇱", iso: "NL" },
];

type PlanKey = "day" | "week" | "month" | "year";

type Plan = {
  key: PlanKey;
  label: string;
  // price per period (USD)
  price: number;
  // monthly equivalent for badges
  perMonth: number;
  badge?: string;
};

// Touristesim USA-aligned: Year $56 ($4.67/mo · 63% off), Month $12.50.
// Day & Week interpolated to feel natural.
const plans: Plan[] = [
  { key: "day", label: "1 Day", price: 1.5, perMonth: 1.5 * 30 },
  { key: "week", label: "1 Week", price: 5.0, perMonth: 5.0 * 4.3 },
  { key: "month", label: "1 Month", price: 12.5, perMonth: 12.5 },
  { key: "year", label: "1 Year", price: 56.0, perMonth: 4.67, badge: "63% off" },
];

const supportedApps = [
  "WhatsApp",
  "Telegram",
  "Google",
  "Facebook",
  "Instagram",
  "TikTok",
  "X",
  "OpenAI",
  "Uber",
  "PayPal",
  "Amazon",
  "Airbnb",
];

const FX = 1550;

function VirtualNumberPage() {
  const navigate = useNavigate();
  const [countryId, setCountryId] = useState<string>("us");
  const [planKey, setPlanKey] = useState<PlanKey>("month");
  const [autoRenew, setAutoRenew] = useState(true);
  const [confirm, setConfirm] = useState(false);
  const [success, setSuccess] = useState(false);

  const country = countries.find((c) => c.id === countryId)!;
  const plan = plans.find((p) => p.key === planKey)!;
  const cashback = useMemo(() => +(plan.price * 0.005).toFixed(2), [plan]);

  // mock assigned number on success
  const assignedNumber = useMemo(() => {
    if (country.id === "us") return "+1 (415) 555-0142";
    if (country.id === "gb") return "+44 20 7946 0184";
    if (country.id === "ca") return "+1 (416) 555-0119";
    return "+31 20 491 2876";
  }, [country.id]);

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
          <h1 className="font-display text-xl font-bold tracking-tight">Virtual Number</h1>
          <p className="text-[11px] text-foreground/50">Real local SMS number · Activates instantly · 0.5% cashback</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-service-esim/15 text-service-esim flex items-center justify-center">
          <Hash className="w-4 h-4" />
        </div>
      </div>

      {/* Hero */}
      <div className="px-6 mt-5">
        <div
          className="relative overflow-hidden rounded-3xl p-5 text-white"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.32 0.14 280) 0%, oklch(0.22 0.12 240) 60%, oklch(0.18 0.08 220) 100%)",
          }}
        >
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-30 blur-2xl bg-white" />
          <div className="relative flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] opacity-85 inline-flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> {country.flag} {country.name} · {plan.label}
            </span>
            <span className="text-[11px] font-bold opacity-85">USD</span>
          </div>
          <p className="font-display text-4xl font-bold tracking-tight mt-3 relative">
            ${plan.price.toFixed(2)}
          </p>
          <p className="text-[12px] mt-1 opacity-85 relative">
            {planKey === "year" || planKey === "week" || planKey === "day"
              ? `≈ $${plan.perMonth.toFixed(2)}/mo · `
              : ""}
            ≈ ₦{Math.round(plan.price * FX).toLocaleString()} · SMS only
          </p>
        </div>
      </div>

      <div className="flex-1 mt-6 bg-card text-card-foreground rounded-t-[2rem] px-6 pt-6 pb-32 space-y-6">
        {/* Country picker */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-card-foreground/50 mb-2 px-1">
            Country
          </p>
          <div className="grid grid-cols-2 gap-2">
            {countries.map((c) => {
              const sel = c.id === countryId;
              return (
                <button
                  key={c.id}
                  onClick={() => setCountryId(c.id)}
                  className={`flex items-center gap-3 rounded-2xl p-3 text-left transition ${
                    sel
                      ? "bg-primary/10 ring-2 ring-primary"
                      : "bg-card-foreground/[0.04] ring-1 ring-transparent"
                  }`}
                >
                  <span className="text-2xl leading-none">{c.flag}</span>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">{c.name}</p>
                    <p className="text-[11px] text-card-foreground/55">{c.code} · {c.iso}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Plan picker */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-card-foreground/50 mb-2 px-1">
            Subscription
          </p>
          <div className="space-y-2">
            {plans.map((p) => {
              const sel = p.key === planKey;
              return (
                <button
                  key={p.key}
                  onClick={() => setPlanKey(p.key)}
                  className={`w-full flex items-center gap-3 rounded-2xl p-4 text-left transition ${
                    sel
                      ? "bg-primary/10 ring-2 ring-primary"
                      : "bg-card-foreground/[0.04] ring-1 ring-transparent"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      sel ? "border-primary bg-primary" : "border-card-foreground/25"
                    }`}
                  >
                    {sel && <Check className="w-3 h-3 text-primary-foreground" strokeWidth={3} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm">{p.label}</p>
                      {p.badge && (
                        <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600">
                          {p.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-card-foreground/55 mt-0.5">
                      {p.key === "year"
                        ? `Billed yearly · $${p.perMonth.toFixed(2)}/mo`
                        : p.key === "month"
                        ? "Billed monthly · cancel anytime"
                        : p.key === "week"
                        ? "Short-term verification"
                        : "One-off SMS verify"}
                    </p>
                  </div>
                  <p className="font-display font-bold text-base tabular-nums">${p.price.toFixed(2)}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Auto renew */}
        <button
          onClick={() => setAutoRenew((v) => !v)}
          className="w-full flex items-center gap-3 rounded-2xl bg-card-foreground/[0.04] p-4 text-left"
        >
          <div className="w-9 h-9 rounded-full bg-card-foreground/[0.06] flex items-center justify-center">
            <RefreshCw className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm">Auto-renew</p>
            <p className="text-[11px] text-card-foreground/55">Keep the same number long-term</p>
          </div>
          <span
            className={`relative w-10 h-6 rounded-full transition ${
              autoRenew ? "bg-primary" : "bg-card-foreground/20"
            }`}
          >
            <span
              className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition ${
                autoRenew ? "left-[1.125rem]" : "left-0.5"
              }`}
            />
          </span>
        </button>

        {/* Works with */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-card-foreground/50 mb-2 px-1">
            Works with 500+ apps
          </p>
          <div className="flex flex-wrap gap-1.5">
            {supportedApps.map((a) => (
              <span
                key={a}
                className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-card-foreground/[0.05]"
              >
                {a}
              </span>
            ))}
            <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-card-foreground/[0.05] text-card-foreground/60">
              +500 more
            </span>
          </div>
        </div>

        {/* Trust row */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: Clock, label: "Activates in seconds" },
            { icon: Lock, label: "Private · anonymous" },
            { icon: MessageSquare, label: "Real local PSTN" },
          ].map((t) => (
            <div key={t.label} className="rounded-2xl bg-card-foreground/[0.04] p-3 flex flex-col gap-1.5 items-start">
              <t.icon className="w-4 h-4 text-service-esim" />
              <p className="text-[11px] font-medium leading-tight">{t.label}</p>
            </div>
          ))}
        </div>

        <p className="text-[11px] text-card-foreground/55 leading-relaxed px-1">
          SMS reception only. Voice calls are not included. Number stays active for the
          subscription duration; enable auto-renew to keep it long-term.
        </p>
      </div>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 inset-x-0 px-6 pb-6 pt-3 bg-gradient-to-t from-card via-card/95 to-transparent">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-[11px] text-card-foreground/55">Cashback</span>
          <span className="text-[11px] font-bold text-emerald-600">+${cashback.toFixed(2)}</span>
        </div>
        <button
          onClick={() => setConfirm(true)}
          className="w-full h-14 rounded-full bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 shadow-lg active:scale-[0.99] transition"
        >
          Get {country.flag} {country.name} number · ${plan.price.toFixed(2)}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {confirm && !success && (
        <ConfirmSheet
          country={country}
          plan={plan}
          autoRenew={autoRenew}
          cashback={cashback}
          onClose={() => setConfirm(false)}
          onPay={() => setSuccess(true)}
        />
      )}

      {success && (
        <SuccessSheet
          country={country}
          plan={plan}
          number={assignedNumber}
          autoRenew={autoRenew}
          onDone={() => {
            setSuccess(false);
            setConfirm(false);
            navigate({ to: "/home" });
          }}
        />
      )}
    </div>
  );
}

function ConfirmSheet({
  country,
  plan,
  autoRenew,
  cashback,
  onClose,
  onPay,
}: {
  country: Country;
  plan: Plan;
  autoRenew: boolean;
  cashback: number;
  onClose: () => void;
  onPay: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-card text-card-foreground rounded-t-[2rem] p-6 pb-8 animate-in slide-in-from-bottom">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold text-lg">Confirm purchase</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-card-foreground/[0.06] flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="rounded-2xl bg-card-foreground/[0.04] p-4 space-y-3">
          <Row label="Country" value={`${country.flag} ${country.name} (${country.code})`} />
          <Row label="Plan" value={plan.label} />
          <Row label="Auto-renew" value={autoRenew ? "On" : "Off"} />
          <Row label="Cashback" value={`+$${cashback.toFixed(2)}`} valueClass="text-emerald-600" />
          <div className="border-t border-card-foreground/10 pt-3 flex justify-between">
            <span className="font-bold text-sm">Total</span>
            <span className="font-display font-bold text-lg">${plan.price.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex items-start gap-2 mt-4 px-1">
          <ShieldCheck className="w-4 h-4 text-service-esim shrink-0 mt-0.5" />
          <p className="text-[11px] text-card-foreground/65 leading-relaxed">
            Your number activates within seconds. View incoming SMS in your dashboard. Real PSTN — accepted by WhatsApp, Google, banks & 500+ services.
          </p>
        </div>

        <button
          onClick={onPay}
          className="w-full h-14 mt-5 rounded-full bg-primary text-primary-foreground font-bold text-sm shadow-lg active:scale-[0.99] transition"
        >
          Pay ${plan.price.toFixed(2)}
        </button>
      </div>
    </div>
  );
}

function SuccessSheet({
  country,
  plan,
  number,
  autoRenew,
  onDone,
}: {
  country: Country;
  plan: Plan;
  number: string;
  autoRenew: boolean;
  onDone: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(number).then(
        () => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        },
        () => {},
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-card text-card-foreground rounded-t-[2rem] p-6 pb-8 animate-in slide-in-from-bottom">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center mb-3">
            <Check className="w-8 h-8 text-emerald-600" strokeWidth={3} />
          </div>
          <h3 className="font-display font-bold text-xl">Number ready</h3>
          <p className="text-[12px] text-card-foreground/65 mt-1">
            {country.flag} {country.name} · {plan.label}
          </p>
        </div>

        <button
          onClick={copy}
          className="w-full mt-5 rounded-2xl bg-card-foreground/[0.04] p-4 flex items-center gap-3 text-left active:scale-[0.99] transition"
        >
          <div className="w-10 h-10 rounded-xl bg-service-esim/15 text-service-esim flex items-center justify-center">
            <Hash className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] text-card-foreground/55">Your number</p>
            <p className="font-display font-bold text-lg tracking-tight tabular-nums">{number}</p>
          </div>
          <span className="text-[11px] font-bold text-primary">{copied ? "Copied" : "Copy"}</span>
        </button>

        <div className="mt-3 rounded-2xl bg-card-foreground/[0.04] p-4 space-y-2.5">
          <Row label="Auto-renew" value={autoRenew ? "On" : "Off"} />
          <Row label="Inbox" value="View SMS in dashboard" />
        </div>

        <button
          onClick={onDone}
          className="w-full h-14 mt-5 rounded-full bg-primary text-primary-foreground font-bold text-sm shadow-lg active:scale-[0.99] transition"
        >
          Done
        </button>
      </div>
    </div>
  );
}

function Row({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-card-foreground/60">{label}</span>
      <span className={`font-semibold ${valueClass ?? ""}`}>{value}</span>
    </div>
  );
}
