import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Globe2,
  Sparkles,
  X,
  ShieldCheck,
  Calendar,
  Wifi,
  Search,
  Plane,
} from "lucide-react";

export const Route = createFileRoute("/_app/pay/esim")({
  head: () => ({
    meta: [
      { title: "Travel eSIM · BazePay" },
      { name: "description", content: "Instant data in 190+ countries. No roaming fees." },
    ],
  }),
  component: EsimPage,
});

type Region = {
  id: string;
  name: string;
  short: string;
  tagline: string;
  color: string;
  flag: string;
};

const regions: Region[] = [
  { id: "global", name: "Global", short: "GL", tagline: "190+ countries", color: "#3B82F6", flag: "🌍" },
  { id: "europe", name: "Europe", short: "EU", tagline: "39 countries", color: "#1E40AF", flag: "🇪🇺" },
  { id: "usa", name: "USA", short: "US", tagline: "Nationwide 5G", color: "#DC2626", flag: "🇺🇸" },
  { id: "uk", name: "UK", short: "UK", tagline: "EE · Vodafone", color: "#7C3AED", flag: "🇬🇧" },
  { id: "uae", name: "UAE", short: "AE", tagline: "Etisalat · du", color: "#0EA5A4", flag: "🇦🇪" },
  { id: "turkey", name: "Türkiye", short: "TR", tagline: "Turkcell · Vodafone", color: "#E11A2B", flag: "🇹🇷" },
  { id: "asia", name: "Asia", short: "AS", tagline: "13 countries", color: "#F59E0B", flag: "🌏" },
  { id: "africa", name: "Africa", short: "AF", tagline: "29 countries", color: "#0FA958", flag: "🌍" },
];

type Plan = {
  id: string;
  data: string;
  price: number;
  duration: string;
  speed: string;
  badge?: string;
};

const plans: Record<string, Plan[]> = {
  global: [
    { id: "1g7", data: "1 GB", price: 4.5, duration: "7 days", speed: "4G/5G" },
    { id: "3g15", data: "3 GB", price: 11, duration: "15 days", speed: "4G/5G", badge: "Popular" },
    { id: "5g30", data: "5 GB", price: 18, duration: "30 days", speed: "4G/5G" },
    { id: "10g30", data: "10 GB", price: 32, duration: "30 days", speed: "4G/5G", badge: "Top up" },
  ],
  europe: [
    { id: "1g7", data: "1 GB", price: 4.5, duration: "7 days", speed: "4G/5G" },
    { id: "3g15", data: "3 GB", price: 9, duration: "15 days", speed: "4G/5G", badge: "Popular" },
    { id: "10g30", data: "10 GB", price: 22, duration: "30 days", speed: "4G/5G" },
    { id: "20g30", data: "20 GB", price: 37, duration: "30 days", speed: "4G/5G" },
  ],
  usa: [
    { id: "1g7", data: "1 GB", price: 5, duration: "7 days", speed: "5G" },
    { id: "3g15", data: "3 GB", price: 11, duration: "15 days", speed: "5G", badge: "Popular" },
    { id: "10g30", data: "10 GB", price: 26, duration: "30 days", speed: "5G" },
    { id: "unl30", data: "Unlimited", price: 49, duration: "30 days", speed: "5G", badge: "Top tier" },
  ],
  uk: [
    { id: "1g7", data: "1 GB", price: 4.5, duration: "7 days", speed: "4G/5G" },
    { id: "5g30", data: "5 GB", price: 14, duration: "30 days", speed: "4G/5G", badge: "Popular" },
    { id: "20g30", data: "20 GB", price: 32, duration: "30 days", speed: "4G/5G" },
  ],
  uae: [
    { id: "1g7", data: "1 GB", price: 6.5, duration: "7 days", speed: "4G/5G" },
    { id: "3g15", data: "3 GB", price: 15, duration: "15 days", speed: "4G/5G", badge: "Popular" },
    { id: "10g30", data: "10 GB", price: 35, duration: "30 days", speed: "4G/5G" },
  ],
  turkey: [
    { id: "1g7", data: "1 GB", price: 5, duration: "7 days", speed: "4G/5G" },
    { id: "5g30", data: "5 GB", price: 15, duration: "30 days", speed: "4G/5G", badge: "Popular" },
    { id: "20g30", data: "20 GB", price: 38, duration: "30 days", speed: "4G/5G" },
  ],
  asia: [
    { id: "1g7", data: "1 GB", price: 5.5, duration: "7 days", speed: "4G" },
    { id: "5g15", data: "5 GB", price: 16, duration: "15 days", speed: "4G", badge: "Popular" },
    { id: "10g30", data: "10 GB", price: 28, duration: "30 days", speed: "4G/5G" },
  ],
  africa: [
    { id: "1g7", data: "1 GB", price: 6, duration: "7 days", speed: "4G" },
    { id: "3g15", data: "3 GB", price: 14, duration: "15 days", speed: "4G", badge: "Popular" },
    { id: "10g30", data: "10 GB", price: 32, duration: "30 days", speed: "4G" },
  ],
};

type Installed = {
  id: string;
  region: string;
  label: string;
  remaining: string;
  expiresIn: string;
};

const installed: Installed[] = [
  { id: "esim-eu-01", region: "europe", label: "Lisbon trip", remaining: "1.2 GB left", expiresIn: "12 days left" },
  { id: "esim-ae-01", region: "uae", label: "Dubai stopover", remaining: "Expired", expiresIn: "Renew to reuse" },
  { id: "esim-gl-01", region: "global", label: "World tour", remaining: "4.8 GB left", expiresIn: "21 days left" },
];

const FX = 1550;

function EsimPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"new" | "topup">("new");
  const [topupId, setTopupId] = useState<string | null>(null);
  const [regionId, setRegionId] = useState<string>("global");
  const [email, setEmail] = useState("");
  const [planId, setPlanId] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);
  const [success, setSuccess] = useState(false);
  const [search, setSearch] = useState("");

  const activeEsim = installed.find((i) => i.id === topupId) ?? null;
  const effectiveRegionId = mode === "topup" && activeEsim ? activeEsim.region : regionId;
  const region = regions.find((p) => p.id === effectiveRegionId)!;
  const regionPlans = plans[effectiveRegionId] ?? [];
  const plan = regionPlans.find((p) => p.id === planId) ?? null;
  const verified = mode === "topup" ? activeEsim !== null : /\S+@\S+\.\S+/.test(email);
  const valid = verified && plan !== null;
  const cashback = plan ? +(plan.price * 0.005).toFixed(2) : 0;

  const visibleRegions = useMemo(
    () =>
      regions.filter(
        (r) =>
          r.name.toLowerCase().includes(search.toLowerCase()) ||
          r.tagline.toLowerCase().includes(search.toLowerCase()),
      ),
    [search],
  );

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
          <h1 className="font-display text-xl font-bold tracking-tight">Travel eSIM</h1>
          <p className="text-[11px] text-foreground/50">Instant install · 0.5% cashback</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-service-esim/15 text-service-esim flex items-center justify-center">
          <Globe2 className="w-4 h-4" />
        </div>
      </div>

      {/* Hero */}
      <div className="px-6 mt-5">
        <div
          className="relative overflow-hidden rounded-3xl p-5 transition-colors"
          style={{
            background: `linear-gradient(135deg, ${region.color} 0%, color-mix(in oklab, ${region.color} 70%, #000) 100%)`,
            color: "#FFFFFF",
          }}
        >
          <div
            className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-30 blur-2xl"
            style={{ background: "#fff" }}
          />
          <div className="relative flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] opacity-85 inline-flex items-center gap-1">
              <Plane className="w-3 h-3" /> {region.name} · {plan ? plan.data : "Pick a plan"}
            </span>
            <span className="text-[11px] font-bold opacity-85">USD</span>
          </div>
          <p className="font-display text-4xl font-bold tracking-tight mt-3 relative">
            ${plan ? plan.price.toFixed(2) : "0.00"}
          </p>
          <p className="text-[12px] mt-1 opacity-85 relative">
            {plan ? `${plan.duration} · ${plan.speed} · ≈ ₦${Math.round(plan.price * FX).toLocaleString()}` : region.tagline}
          </p>
        </div>
      </div>

      <div className="flex-1 mt-6 bg-card text-card-foreground rounded-t-[2rem] px-6 pt-6 pb-32 space-y-6">
        {/* Mode toggle */}
        <div className="rounded-full bg-card-foreground/[0.06] p-1 grid grid-cols-2 gap-1">
          {(["new", "topup"] as const).map((m) => {
            const sel = mode === m;
            return (
              <button
                key={m}
                onClick={() => {
                  setMode(m);
                  setPlanId(null);
                  if (m === "new") setTopupId(null);
                  else if (installed.length) {
                    const first = installed[0];
                    setTopupId(first.id);
                    setRegionId(first.region);
                  }
                }}
                className={`h-9 rounded-full text-[12px] font-bold transition ${
                  sel ? "bg-primary text-primary-foreground shadow" : "text-card-foreground/60"
                }`}
              >
                {m === "new" ? "Buy new eSIM" : "Top up existing"}
              </button>
            );
          })}
        </div>

        {/* Mode-specific picker */}
        {mode === "new" ? (
          <div>
            <div className="flex items-center justify-between mb-2 px-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-card-foreground/50">
                Destination
              </p>
              <span className="text-[10px] font-semibold text-card-foreground/45">
                {regions.length} regions
              </span>
            </div>
            <div className="relative mb-3">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-card-foreground/40" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search country or region"
                className="w-full h-10 rounded-xl bg-card-foreground/[0.04] pl-9 pr-3 text-sm outline-none focus:bg-card-foreground/[0.06]"
              />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {visibleRegions.map((p) => {
                const sel = p.id === regionId;
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      setRegionId(p.id);
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
                      {p.short}
                    </span>
                    <span className="text-[10px] font-bold leading-none">{p.name}</span>
                  </button>
                );
              })}
            </div>
            <p className="mt-2 px-1 text-[10px] text-card-foreground/55">
              <span className="font-semibold text-card-foreground/75">{region.name}</span> · {region.tagline}
            </p>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-2 px-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-card-foreground/50">
                Your installed eSIMs
              </p>
              <span className="text-[10px] font-semibold text-card-foreground/45">
                {installed.length} active
              </span>
            </div>
            <div className="space-y-2">
              {installed.map((i) => {
                const p = regions.find((x) => x.id === i.region)!;
                const sel = topupId === i.id;
                return (
                  <button
                    key={i.id}
                    onClick={() => {
                      setTopupId(i.id);
                      setRegionId(i.region);
                      setPlanId(null);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition active:scale-[0.99]"
                    style={{
                      background: sel
                        ? `color-mix(in oklab, ${p.color} 14%, transparent)`
                        : "color-mix(in oklab, var(--card-foreground) 4%, transparent)",
                      border: sel
                        ? `1px solid color-mix(in oklab, ${p.color} 40%, transparent)`
                        : "1px solid transparent",
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-[10px] font-black"
                      style={{
                        background: `color-mix(in oklab, ${p.color} 18%, transparent)`,
                        color: p.color,
                      }}
                    >
                      {p.short}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold">{i.label}</p>
                      <p className="text-[11px] text-card-foreground/55 truncate">
                        {p.name} · {i.remaining} · {i.expiresIn}
                      </p>
                    </div>
                    {sel && (
                      <span
                        className="w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ background: p.color, color: "#fff" }}
                      >
                        <Check className="w-3 h-3" strokeWidth={3} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <p className="mt-2 px-1 text-[10px] text-card-foreground/55">
              No reinstall needed — top ups apply to the existing eSIM profile automatically.
            </p>
          </div>
        )}

        {/* Email for delivery — only for new eSIMs */}
        {mode === "new" && (
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-card-foreground/50 mb-2 px-1">
              Email for QR delivery
            </p>
            <div className="relative">
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value.slice(0, 60))}
                type="email"
                placeholder="you@email.com"
                className="w-full h-14 rounded-2xl bg-card-foreground/[0.04] pl-4 pr-12 text-base font-semibold tracking-wide outline-none focus:bg-card-foreground/[0.06]"
              />
              {email && (
                <button
                  onClick={() => setEmail("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-card-foreground/10 flex items-center justify-center"
                  aria-label="Clear"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            {verified && (
              <div className="mt-2 px-1 flex items-center gap-1.5 text-[11px] text-success">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="font-semibold">QR will be emailed instantly</span>
              </div>
            )}
          </div>
        )}

        {/* Plans */}
        <div>
          <div className="flex items-center justify-between mb-2 px-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-card-foreground/50">
              Plans
            </p>
            <span className="text-[10px] font-semibold text-card-foreground/45">
              {regionPlans.length} options
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {regionPlans.map((p) => {
              const sel = planId === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setPlanId(p.id)}
                  className="relative rounded-2xl p-3 text-left transition active:scale-[0.98]"
                  style={{
                    background: sel
                      ? region.color
                      : "color-mix(in oklab, var(--card-foreground) 4%, transparent)",
                    color: sel ? "#fff" : "var(--card-foreground)",
                    boxShadow: sel ? `0 8px 20px -10px ${region.color}` : "none",
                  }}
                >
                  {p.badge && (
                    <span
                      className="absolute top-2 right-2 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full"
                      style={{
                        background: sel ? "rgba(255,255,255,0.2)" : `color-mix(in oklab, ${region.color} 14%, transparent)`,
                        color: sel ? "#fff" : region.color,
                      }}
                    >
                      {p.badge}
                    </span>
                  )}
                  <p className="text-[13px] font-bold">{p.data}</p>
                  <p className="font-display text-lg font-bold mt-1">
                    ${p.price.toFixed(2)}
                  </p>
                  <p className="text-[10px] mt-0.5 inline-flex items-center gap-1 font-semibold leading-tight" style={{ opacity: sel ? 0.85 : 0.65 }}>
                    <Wifi className="w-2.5 h-2.5" />
                    {p.speed}
                  </p>
                  <p className="text-[10px] mt-1 inline-flex items-center gap-1 font-semibold" style={{ opacity: sel ? 0.85 : 0.55 }}>
                    <Calendar className="w-2.5 h-2.5" />
                    {p.duration}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Compatibility note */}
        <div className="rounded-2xl bg-card-foreground/[0.04] p-4 flex gap-3">
          <div className="w-8 h-8 rounded-full bg-service-esim/15 text-service-esim flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="text-[11px] text-card-foreground/65 leading-relaxed">
            {mode === "new" ? (
              <>
                <span className="font-semibold text-card-foreground/85">Install once.</span> Future top ups apply automatically — no new QR. Works on iPhone XS+, Pixel 3+, Galaxy S20+.
              </>
            ) : (
              <>
                <span className="font-semibold text-card-foreground/85">Top up — no reinstall.</span> Data refills the existing eSIM profile within 30 seconds. Keep the same number, no QR needed.
              </>
            )}
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="absolute bottom-0 left-0 right-0 px-4 pb-5 pt-3 bg-gradient-to-t from-card via-card to-transparent">
        {valid && cashback > 0 && (
          <p className="text-center text-[11px] font-semibold text-success mb-2">
            +${cashback.toFixed(2)} cashback
          </p>
        )}
        <button
          disabled={!valid}
          onClick={() => setConfirm(true)}
          className="w-full h-12 rounded-full bg-primary text-primary-foreground font-bold text-sm disabled:opacity-40 active:scale-[0.99] transition flex items-center justify-center gap-2"
        >
          {plan
            ? `${mode === "topup" ? "Top up" : "Buy eSIM"} · $${plan.price.toFixed(2)}`
            : mode === "topup"
            ? "Pick a top-up plan"
            : "Pick a plan"}
        </button>
      </div>

      {confirm && !success && plan && (
        <ConfirmSheet
          mode={mode}
          esimLabel={activeEsim?.label ?? ""}
          email={email}
          region={region}
          plan={plan}
          cashback={cashback}
          onClose={() => setConfirm(false)}
          onConfirm={() => setSuccess(true)}
        />
      )}

      {success && plan && (
        <SuccessSheet
          mode={mode}
          esimLabel={activeEsim?.label ?? ""}
          email={email}
          region={region}
          plan={plan}
          cashback={cashback}
          onDone={() => navigate({ to: "/wallet" })}
        />
      )}
    </div>
  );
}

function ConfirmSheet({
  mode,
  esimLabel,
  email,
  region,
  plan,
  cashback,
  onClose,
  onConfirm,
}: {
  mode: "new" | "topup";
  esimLabel: string;
  email: string;
  region: Region;
  plan: Plan;
  cashback: number;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const isTopup = mode === "topup";
  return (
    <div className="fixed inset-0 z-[70] flex items-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full bg-card text-card-foreground rounded-t-[2rem] pt-3 pb-8 animate-in slide-in-from-bottom duration-300"
      >
        <div className="w-10 h-1 rounded-full bg-card-foreground/15 mx-auto" />
        <div className="px-6 mt-4">
          <h3 className="font-display font-bold text-base">
            {isTopup ? "Confirm top up" : "Confirm purchase"}
          </h3>
          <p className="text-[11px] text-card-foreground/55 mt-0.5">
            {isTopup
              ? "Data refills the existing eSIM — no new install"
              : "QR delivered instantly to email"}
          </p>
        </div>

        <div className="px-6 mt-5 flex flex-col items-center">
          <p className="text-[11px] text-card-foreground/55">You'll pay</p>
          <p className="font-display text-3xl font-bold mt-1">${plan.price.toFixed(2)}</p>
          <p className="text-[10px] text-card-foreground/50 mt-1">≈ ₦{Math.round(plan.price * FX).toLocaleString()}</p>
          {cashback > 0 && (
            <span className="mt-2 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-success/15 text-success text-[10px] font-bold uppercase tracking-wider">
              <Sparkles className="w-3 h-3" /> +${cashback.toFixed(2)} cashback
            </span>
          )}
        </div>

        <div className="mx-6 mt-5 rounded-2xl bg-card-foreground/[0.04] divide-y divide-card-foreground/[0.06] overflow-hidden">
          {isTopup ? (
            <Row label="eSIM" value={esimLabel} />
          ) : (
            <Row label="Email" value={email} />
          )}
          <Row
            label="Destination"
            value={
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: region.color }} />
                {region.name}
              </span>
            }
          />
          <Row label="Data" value={plan.data} />
          <Row label="Speed" value={plan.speed} />
          <Row label="Validity" value={plan.duration} />
          <Row label="Pay from" value="Wallet · USD" />
          <Row label="Fee" value="$0.00" />
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
            {isTopup ? "Top up now" : "Buy now"} <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function SuccessSheet({
  mode,
  esimLabel,
  email,
  region,
  plan,
  cashback,
  onDone,
}: {
  mode: "new" | "topup";
  esimLabel: string;
  email: string;
  region: Region;
  plan: Plan;
  cashback: number;
  onDone: () => void;
}) {
  const ref = `BZP-ESIM-${Math.floor(Math.random() * 90000 + 10000)}`;
  const isTopup = mode === "topup";

  return (
    <div className="fixed inset-0 z-[80] flex items-end">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200" />
      <div className="relative w-full bg-card text-card-foreground rounded-t-[2rem] pt-3 pb-8 animate-in slide-in-from-bottom duration-300">
        <div className="w-10 h-1 rounded-full bg-card-foreground/15 mx-auto" />
        <div className="px-6 mt-6 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-success/15 text-success flex items-center justify-center">
            <Check className="w-7 h-7" strokeWidth={3} />
          </div>
          <h3 className="font-display font-bold text-xl mt-4">
            {isTopup ? "Top up successful" : "eSIM ready"}
          </h3>
          <p className="text-[12px] text-card-foreground/55 mt-1">
            {isTopup ? `${esimLabel} · ` : ""}
            {region.name} · {plan.data} · {plan.duration}
          </p>
          {cashback > 0 && (
            <p className="text-[11px] text-success font-semibold mt-2">
              +${cashback.toFixed(2)} cashback added
            </p>
          )}
        </div>

        {isTopup ? (
          <div
            className="mx-6 mt-5 rounded-2xl px-4 py-4 flex items-center gap-3"
            style={{
              background: `color-mix(in oklab, ${region.color} 10%, transparent)`,
              border: `1px solid color-mix(in oklab, ${region.color} 22%, transparent)`,
            }}
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
              style={{ background: region.color, color: "#fff" }}
            >
              <Wifi className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-card-foreground/55">
                Active on your phone
              </p>
              <p className="font-display text-base font-bold mt-0.5">No reinstall needed</p>
              <p className="text-[10px] text-card-foreground/55 mt-1">
                Data refilled in under 30 seconds
              </p>
            </div>
          </div>
        ) : (
          <div
            className="mx-6 mt-5 rounded-2xl px-4 py-5 flex items-center gap-4"
            style={{
              background: `color-mix(in oklab, ${region.color} 10%, transparent)`,
              border: `1px solid color-mix(in oklab, ${region.color} 22%, transparent)`,
            }}
          >
            <div
              className="w-20 h-20 rounded-xl bg-white p-1.5 grid grid-cols-6 grid-rows-6 gap-px shrink-0"
              aria-label="eSIM QR"
            >
              {Array.from({ length: 36 }).map((_, i) => (
                <span
                  key={i}
                  className="rounded-[1px]"
                  style={{
                    background:
                      [0, 1, 5, 6, 10, 11, 25, 26, 30, 31, 35].includes(i % 36) ||
                      (i * 7) % 11 < 5
                        ? "#000"
                        : "#fff",
                  }}
                />
              ))}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-card-foreground/55">
                Install QR
              </p>
              <p className="font-display text-base font-bold mt-0.5 truncate">{email}</p>
              <p className="text-[10px] text-card-foreground/55 mt-1">
                Install once — future top ups apply automatically
              </p>
            </div>
          </div>
        )}

        <div className="mx-6 mt-3 rounded-2xl bg-card-foreground/[0.04] px-4 py-3 flex items-center justify-between">
          <p className="text-[12px] text-card-foreground/55">Reference</p>
          <p className="text-[13px] font-semibold">{ref}</p>
        </div>

        <div className="px-6 mt-5 grid grid-cols-2 gap-2">
          <Link
            to="/pay/esim"
            onClick={(e) => {
              e.preventDefault();
              window.location.reload();
            }}
            className="h-12 rounded-full bg-card-foreground/[0.06] flex items-center justify-center font-bold text-sm"
          >
            {isTopup ? "Top up another" : "Buy another"}
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
