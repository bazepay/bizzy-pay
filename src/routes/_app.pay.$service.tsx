import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Phone,
  Smartphone,
  Zap,
  Tv,
  Dices,
  Wifi,
  Check,
  ChevronRight,
  Sparkles,
} from "lucide-react";

export const Route = createFileRoute("/_app/pay/$service")({
  component: ServiceFlow,
  notFoundComponent: () => (
    <div className="p-8 text-center text-sm">
      Service not found.{" "}
      <Link to="/pay" className="text-primary font-semibold">Back to bills</Link>
    </div>
  ),
});

type ServiceConfig = {
  label: string;
  icon: typeof Phone;
  token: string;
  identifierLabel: string;
  identifierPlaceholder: string;
  identifierType?: "tel" | "text" | "number";
  providers?: { id: string; name: string; color: string }[];
  plans?: { id: string; name: string; sub: string; price: number }[];
  amounts?: number[];
  cta: string;
};

const cfg: Record<string, ServiceConfig> = {
  airtime: {
    label: "Airtime",
    icon: Phone,
    token: "service-airtime",
    identifierLabel: "Phone number",
    identifierPlaceholder: "0803 555 0142",
    identifierType: "tel",
    providers: [
      { id: "mtn", name: "MTN", color: "#FFCC00" },
      { id: "glo", name: "Glo", color: "#00A859" },
      { id: "airtel", name: "Airtel", color: "#E40000" },
      { id: "9mobile", name: "9mobile", color: "#006F3C" },
    ],
    amounts: [200, 500, 1000, 2000, 5000, 10000],
    cta: "Buy airtime",
  },
  data: {
    label: "Data bundles",
    icon: Smartphone,
    token: "service-data",
    identifierLabel: "Phone number",
    identifierPlaceholder: "0803 555 0142",
    identifierType: "tel",
    providers: [
      { id: "mtn", name: "MTN", color: "#FFCC00" },
      { id: "glo", name: "Glo", color: "#00A859" },
      { id: "airtel", name: "Airtel", color: "#E40000" },
      { id: "9mobile", name: "9mobile", color: "#006F3C" },
    ],
    plans: [
      { id: "d1", name: "1GB", sub: "1 day", price: 350 },
      { id: "d2", name: "2GB", sub: "7 days", price: 1500 },
      { id: "d3", name: "10GB", sub: "30 days", price: 4500 },
      { id: "d4", name: "40GB", sub: "30 days", price: 11000 },
    ],
    cta: "Buy data",
  },
  electricity: {
    label: "Electricity",
    icon: Zap,
    token: "service-electricity",
    identifierLabel: "Meter number",
    identifierPlaceholder: "0123456789",
    identifierType: "number",
    providers: [
      { id: "ikeja", name: "Ikeja", color: "#1F4FB6" },
      { id: "eko", name: "Eko", color: "#0F8C5A" },
      { id: "abuja", name: "Abuja", color: "#7A1FA2" },
      { id: "phed", name: "PHED", color: "#D7263D" },
    ],
    amounts: [1000, 2000, 5000, 10000, 15000, 25000],
    cta: "Buy token",
  },
  tv: {
    label: "TV subscription",
    icon: Tv,
    token: "service-cable",
    identifierLabel: "Smartcard / IUC",
    identifierPlaceholder: "7012345678",
    identifierType: "number",
    providers: [
      { id: "dstv", name: "DStv", color: "#0033A0" },
      { id: "gotv", name: "GOTV", color: "#E2231A" },
      { id: "startimes", name: "Startimes", color: "#F7941D" },
    ],
    plans: [
      { id: "p1", name: "Compact", sub: "DStv · 30 days", price: 12500 },
      { id: "p2", name: "Compact Plus", sub: "DStv · 30 days", price: 19800 },
      { id: "p3", name: "Max", sub: "GOTV · 30 days", price: 5500 },
      { id: "p4", name: "Classic", sub: "Startimes · 30 days", price: 3500 },
    ],
    cta: "Renew subscription",
  },
  betting: {
    label: "Betting top up",
    icon: Dices,
    token: "service-esim",
    identifierLabel: "User ID",
    identifierPlaceholder: "ada42",
    identifierType: "text",
    providers: [
      { id: "bet9ja", name: "Bet9ja", color: "#0E8E3E" },
      { id: "sporty", name: "SportyBet", color: "#E2231A" },
      { id: "betking", name: "BetKing", color: "#1B1B1B" },
      { id: "1xbet", name: "1xBet", color: "#1F8AC0" },
    ],
    amounts: [500, 1000, 2000, 5000, 10000, 20000],
    cta: "Top up account",
  },
  esim: {
    label: "eSIM",
    icon: Wifi,
    token: "service-esim",
    identifierLabel: "Email for delivery",
    identifierPlaceholder: "you@bazepay.app",
    identifierType: "text",
    providers: [
      { id: "gb", name: "🇬🇧 UK", color: "#1F4FB6" },
      { id: "us", name: "🇺🇸 US", color: "#D7263D" },
      { id: "ae", name: "🇦🇪 UAE", color: "#0F8C5A" },
      { id: "fr", name: "🇫🇷 France", color: "#7A1FA2" },
    ],
    plans: [
      { id: "e1", name: "1GB", sub: "7 days", price: 1800 },
      { id: "e2", name: "5GB", sub: "30 days", price: 7200 },
      { id: "e3", name: "10GB", sub: "30 days", price: 12800 },
      { id: "e4", name: "Unlimited", sub: "15 days", price: 18000 },
    ],
    cta: "Buy eSIM",
  },
};

function ServiceFlow() {
  const { service } = Route.useParams();
  const navigate = useNavigate();
  const c = cfg[service];

  if (!c) {
    return (
      <div className="p-8 text-center">
        <p className="text-sm">We don't support that service yet.</p>
        <Link to="/pay" className="text-primary text-sm font-semibold mt-2 inline-block">
          Back
        </Link>
      </div>
    );
  }

  const Icon = c.icon;
  const [provider, setProvider] = useState(c.providers?.[0]?.id ?? "");
  const [identifier, setIdentifier] = useState("");
  const [plan, setPlan] = useState<string | null>(null);
  const [amount, setAmount] = useState<number | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const selectedPlan = useMemo(
    () => c.plans?.find((p) => p.id === plan) ?? null,
    [c.plans, plan],
  );
  const finalAmount = selectedPlan?.price ?? amount ?? 0;
  const canContinue = !!provider && identifier.length >= 3 && finalAmount > 0;

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
          <h1 className="font-display text-xl font-bold tracking-tight">{c.label}</h1>
          <p className="text-[11px] text-foreground/50">Quick, safe, instant</p>
        </div>
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `color-mix(in oklab, var(--${c.token}) 18%, transparent)` }}
        >
          <Icon className="w-4 h-4" style={{ color: `var(--${c.token})` }} />
        </div>
      </div>

      <div className="flex-1 mt-6 bg-card text-card-foreground rounded-t-[2rem] px-6 pt-6 pb-32 space-y-6">
        {/* Provider */}
        {c.providers && (
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-card-foreground/50 mb-2">
              {service === "esim" ? "Country" : "Provider"}
            </p>
            <div className="grid grid-cols-4 gap-2">
              {c.providers.map((p) => {
                const sel = p.id === provider;
                return (
                  <button
                    key={p.id}
                    onClick={() => setProvider(p.id)}
                    className={`h-16 rounded-2xl flex flex-col items-center justify-center gap-1 text-[11px] font-semibold transition ${
                      sel
                        ? "bg-card-foreground text-card"
                        : "bg-card-foreground/[0.04] text-card-foreground/80"
                    }`}
                  >
                    <span
                      className="w-6 h-6 rounded-full"
                      style={{ background: p.color, opacity: sel ? 1 : 0.85 }}
                    />
                    {p.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Identifier */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-card-foreground/50 mb-2">
            {c.identifierLabel}
          </p>
          <input
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder={c.identifierPlaceholder}
            inputMode={c.identifierType === "number" ? "numeric" : c.identifierType === "tel" ? "tel" : "text"}
            className="w-full h-12 rounded-2xl bg-card-foreground/[0.04] px-4 text-sm font-medium outline-none focus:bg-card-foreground/[0.06]"
          />
        </div>

        {/* Plans */}
        {c.plans && (
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-card-foreground/50 mb-2">
              Choose a plan
            </p>
            <div className="rounded-2xl bg-card-foreground/[0.04] divide-y divide-card-foreground/[0.06] overflow-hidden">
              {c.plans.map((p) => {
                const sel = p.id === plan;
                return (
                  <button
                    key={p.id}
                    onClick={() => setPlan(p.id)}
                    className="w-full flex items-center gap-3 px-4 py-3.5 text-left active:bg-card-foreground/[0.06]"
                  >
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        sel ? "border-primary bg-primary" : "border-card-foreground/25"
                      }`}
                    >
                      {sel && <Check className="w-3 h-3 text-primary-foreground" strokeWidth={3} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold">{p.name}</p>
                      <p className="text-[11px] text-card-foreground/55">{p.sub}</p>
                    </div>
                    <p className="text-sm font-bold">₦{p.price.toLocaleString()}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Amounts */}
        {c.amounts && (
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-card-foreground/50 mb-2">
              Amount (₦)
            </p>
            <div className="grid grid-cols-3 gap-2">
              {c.amounts.map((a) => {
                const sel = a === amount;
                return (
                  <button
                    key={a}
                    onClick={() => setAmount(a)}
                    className={`h-12 rounded-2xl text-sm font-bold transition ${
                      sel
                        ? "bg-card-foreground text-card"
                        : "bg-card-foreground/[0.04] text-card-foreground/85"
                    }`}
                  >
                    ₦{a.toLocaleString()}
                  </button>
                );
              })}
            </div>
            <input
              value={amount ?? ""}
              onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : null)}
              placeholder="Custom amount"
              inputMode="numeric"
              className="mt-2 w-full h-12 rounded-2xl bg-card-foreground/[0.04] px-4 text-sm font-medium outline-none focus:bg-card-foreground/[0.06]"
            />
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <div className="absolute bottom-0 left-0 right-0 px-4 pb-5 pt-3 bg-gradient-to-t from-card via-card to-transparent">
        <button
          disabled={!canContinue}
          onClick={() => setShowConfirm(true)}
          className="w-full h-12 rounded-full bg-primary text-primary-foreground font-bold text-sm disabled:opacity-40 active:scale-[0.99] transition flex items-center justify-center gap-2"
        >
          {finalAmount > 0
            ? `${c.cta} · ₦${finalAmount.toLocaleString()}`
            : c.cta}
        </button>
      </div>

      {showConfirm && !showSuccess && (
        <ConfirmSheet
          c={c}
          provider={c.providers?.find((p) => p.id === provider)?.name ?? ""}
          identifier={identifier}
          planLabel={selectedPlan ? `${selectedPlan.name} · ${selectedPlan.sub}` : null}
          amount={finalAmount}
          onClose={() => setShowConfirm(false)}
          onConfirm={() => setShowSuccess(true)}
        />
      )}

      {showSuccess && (
        <SuccessSheet
          c={c}
          amount={finalAmount}
          onDone={() => navigate({ to: "/wallet" })}
        />
      )}
    </div>
  );
}

function ConfirmSheet({
  c,
  provider,
  identifier,
  planLabel,
  amount,
  onClose,
  onConfirm,
}: {
  c: ServiceConfig;
  provider: string;
  identifier: string;
  planLabel: string | null;
  amount: number;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const fee = 0;
  const total = amount + fee;
  return (
    <div className="fixed inset-0 z-[70] flex items-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full bg-card text-card-foreground rounded-t-[2rem] pt-3 pb-8 animate-in slide-in-from-bottom duration-300"
      >
        <div className="w-10 h-1 rounded-full bg-card-foreground/15 mx-auto" />
        <div className="px-6 mt-4">
          <h3 className="font-display font-bold text-base">Confirm payment</h3>
          <p className="text-[11px] text-card-foreground/55 mt-0.5">Review details before paying</p>
        </div>

        <div className="px-6 mt-5 flex flex-col items-center">
          <p className="text-[11px] text-card-foreground/55">You'll pay</p>
          <p className="font-display text-3xl font-bold mt-1">₦{total.toLocaleString()}</p>
        </div>

        <div className="mx-6 mt-5 rounded-2xl bg-card-foreground/[0.04] divide-y divide-card-foreground/[0.06] overflow-hidden">
          {[
            { label: "Service", value: c.label },
            { label: c.providers ? (c.label === "eSIM" ? "Country" : "Provider") : "—", value: provider },
            { label: c.identifierLabel, value: identifier },
            ...(planLabel ? [{ label: "Plan", value: planLabel }] : []),
            { label: "Fee", value: "₦0.00" },
          ].map((r) => (
            <div key={r.label} className="flex items-center gap-3 px-4 py-3.5">
              <p className="text-[12px] text-card-foreground/55 flex-1">{r.label}</p>
              <p className="text-[13px] font-semibold text-right max-w-[60%] truncate">{r.value}</p>
            </div>
          ))}
        </div>

        <div className="px-6 mt-5 grid grid-cols-2 gap-2">
          <button
            onClick={onClose}
            className="h-12 rounded-full bg-card-foreground/[0.06] text-card-foreground font-bold text-sm"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="h-12 rounded-full bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-2"
          >
            Pay now <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function SuccessSheet({
  c,
  amount,
  onDone,
}: {
  c: ServiceConfig;
  amount: number;
  onDone: () => void;
}) {
  const ref = `BZP-${c.label.slice(0, 3).toUpperCase()}-${Math.floor(Math.random() * 90000 + 10000)}`;
  const token = c.label === "Electricity" ? "1234 5678 9012 3456" : null;

  return (
    <div className="fixed inset-0 z-[80] flex items-end">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200" />
      <div className="relative w-full bg-card text-card-foreground rounded-t-[2rem] pt-3 pb-8 animate-in slide-in-from-bottom duration-300">
        <div className="w-10 h-1 rounded-full bg-card-foreground/15 mx-auto" />

        <div className="px-6 mt-6 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-success/15 text-success flex items-center justify-center">
            <Check className="w-7 h-7" strokeWidth={3} />
          </div>
          <h3 className="font-display font-bold text-xl mt-4">Payment successful</h3>
          <p className="text-[12px] text-card-foreground/55 mt-1">
            ₦{amount.toLocaleString()} · {c.label}
          </p>
        </div>

        {token && (
          <div className="mx-6 mt-5">
            <div className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-card-foreground/50 mb-2 px-1">
              <Sparkles className="w-3 h-3" /> Prepaid token
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/20 px-4 py-4">
              <p className="font-mono text-lg font-bold tracking-[0.18em] text-center select-all">
                {token}
              </p>
            </div>
          </div>
        )}

        <div className="mx-6 mt-5 rounded-2xl bg-card-foreground/[0.04] px-4 py-3 flex items-center justify-between">
          <p className="text-[12px] text-card-foreground/55">Reference</p>
          <p className="text-[13px] font-semibold">{ref}</p>
        </div>

        <div className="px-6 mt-5 grid grid-cols-2 gap-2">
          <Link
            to="/pay"
            className="h-12 rounded-full bg-card-foreground/[0.06] flex items-center justify-center font-bold text-sm"
          >
            New payment
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
