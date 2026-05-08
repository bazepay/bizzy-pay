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
  Wifi,
  RefreshCw,
  Phone,
  MessageSquare,
  ArrowDownUp,
  SlidersHorizontal,
  Plane,
  MapPin,
  Hash,
  Clock,
  Lock,
  Search,
} from "lucide-react";

export const Route = createFileRoute("/_app/pay/esim")({
  head: () => ({
    meta: [
      { title: "Travel eSIM · BazePay" },
      { name: "description", content: "Instant data in 192+ countries. No SIM swap. Keep your number." },
    ],
  }),
  component: EsimPage,
});

type Scope = "local" | "regional" | "global";

type Plan = {
  id: string;
  scope: Scope;
  region: string;
  countries?: string;
  data: string;
  dataGb: number; // -1 = unlimited
  duration: string;
  durationDays: number;
  price: number; // USD
  network: string;
  has5g: boolean;
  voice?: string;
  sms?: string;
  reloadable?: boolean;
  best?: boolean;
};

// NOK → USD at ~0.0921 (Touristesim catalog, May 2026)
const plans: Plan[] = [
  // — Local: Nigeria (6) —
  { id: "ng-2gb-15", scope: "local", region: "Nigeria", data: "2 GB", dataGb: 2, duration: "15 Days", durationDays: 15, price: 9.08, network: "2G/3G/4G", has5g: false, best: true },
  { id: "ng-unl-1", scope: "local", region: "Nigeria", data: "Unlimited", dataGb: -1, duration: "1 Day", durationDays: 1, price: 15.34, network: "2G/3G/4G", has5g: false, best: true },
  { id: "ng-5gb-30", scope: "local", region: "Nigeria", data: "5 GB", dataGb: 5, duration: "30 Days", durationDays: 30, price: 19.02, network: "2G/3G/4G", has5g: false },
  { id: "ng-10gb-30", scope: "local", region: "Nigeria", data: "10 GB", dataGb: 10, duration: "30 Days", durationDays: 30, price: 33.68, network: "2G/3G/4G", has5g: false },
  { id: "ng-unl-3", scope: "local", region: "Nigeria", data: "Unlimited", dataGb: -1, duration: "3 Days", durationDays: 3, price: 40.47, network: "2G/3G/4G", has5g: false, best: true },
  { id: "ng-20gb-30", scope: "local", region: "Nigeria", data: "20 GB", dataGb: 20, duration: "30 Days", durationDays: 30, price: 59.34, network: "2G/3G/4G", has5g: false, best: true },

  // — Regional: Africa (3, derived from kr95.48 entry pricing) —
  { id: "af-1gb-7", scope: "regional", region: "Africa", countries: "29 countries", data: "1 GB", dataGb: 1, duration: "7 Days", durationDays: 7, price: 8.79, network: "3G/4G", has5g: false, reloadable: true },
  { id: "af-3gb-15", scope: "regional", region: "Africa", countries: "29 countries", data: "3 GB", dataGb: 3, duration: "15 Days", durationDays: 15, price: 18.5, network: "3G/4G", has5g: false, reloadable: true, best: true },
  { id: "af-10gb-30", scope: "regional", region: "Africa", countries: "29 countries", data: "10 GB", dataGb: 10, duration: "30 Days", durationDays: 30, price: 38, network: "3G/4G", has5g: false, reloadable: true },

  // — Global (17) —
  { id: "g192-1gb-5", scope: "global", region: "Global", countries: "192+ countries", data: "1 GB", dataGb: 1, duration: "5 Days", durationDays: 5, price: 4.43, network: "3G/4G/5G", has5g: true, reloadable: true, best: true },
  { id: "g192-1gb-7", scope: "global", region: "Global", countries: "192+ countries", data: "1 GB", dataGb: 1, duration: "7 Days", durationDays: 7, price: 5.39, network: "3G/4G/5G", has5g: true, reloadable: true, best: true },
  { id: "g192-3gb-30", scope: "global", region: "Global", countries: "192+ countries", data: "3 GB", dataGb: 3, duration: "30 Days", durationDays: 30, price: 10.16, network: "3G/4G/5G", has5g: true, reloadable: true, best: true },
  { id: "g117-1gb-365", scope: "global", region: "Global", countries: "117+ countries", data: "1 GB", dataGb: 1, duration: "365 Days", durationDays: 365, price: 10.57, network: "3G/4G/5G", has5g: true, reloadable: true },
  { id: "g152-1gb-7", scope: "global", region: "Global", countries: "152+ countries", data: "1 GB", dataGb: 1, duration: "7 Days", durationDays: 7, price: 13.02, network: "3G/4G/5G", has5g: true, voice: "10 min", sms: "10 SMS", reloadable: true, best: true },
  { id: "g152-2gb-15", scope: "global", region: "Global", countries: "152+ countries", data: "2 GB", dataGb: 2, duration: "15 Days", durationDays: 15, price: 23.52, network: "3G/4G/5G", has5g: true, voice: "20 min", sms: "20 SMS", reloadable: true, best: true },
  { id: "g152-3gb-30", scope: "global", region: "Global", countries: "152+ countries", data: "3 GB", dataGb: 3, duration: "30 Days", durationDays: 30, price: 32.79, network: "3G/4G/5G", has5g: true, voice: "30 min", sms: "30 SMS", reloadable: true, best: true },
  { id: "g152-5gb-60", scope: "global", region: "Global", countries: "152+ countries", data: "5 GB", dataGb: 5, duration: "60 Days", durationDays: 60, price: 50.66, network: "3G/4G/5G", has5g: true, voice: "50 min", sms: "50 SMS", reloadable: true, best: true },
  { id: "g170-unl-5", scope: "global", region: "Global", countries: "170+ countries", data: "Unlimited", dataGb: -1, duration: "5 Days", durationDays: 5, price: 64.76, network: "2G/3G/4G/5G", has5g: true, best: true },
  { id: "g192-20gb-365", scope: "global", region: "Global", countries: "192+ countries", data: "20 GB", dataGb: 20, duration: "365 Days", durationDays: 365, price: 80.78, network: "3G/4G/5G", has5g: true, reloadable: true, best: true },
  { id: "g170-unl-7", scope: "global", region: "Global", countries: "170+ countries", data: "Unlimited", dataGb: -1, duration: "7 Days", durationDays: 7, price: 86.97, network: "2G/3G/4G/5G", has5g: true, best: true },
  { id: "g152-20gb-365", scope: "global", region: "Global", countries: "152+ countries", data: "20 GB", dataGb: 20, duration: "365 Days", durationDays: 365, price: 103.97, network: "3G/4G/5G", has5g: true, voice: "200 min", sms: "200 SMS", reloadable: true, best: true },
  { id: "g170-unl-10", scope: "global", region: "Global", countries: "170+ countries", data: "Unlimited", dataGb: -1, duration: "10 Days", durationDays: 10, price: 117.9, network: "2G/3G/4G/5G", has5g: true, best: true },
  { id: "g170-unl-15", scope: "global", region: "Global", countries: "170+ countries", data: "Unlimited", dataGb: -1, duration: "15 Days", durationDays: 15, price: 151.04, network: "2G/3G/4G/5G", has5g: true, best: true },
  { id: "g170-unl-20", scope: "global", region: "Global", countries: "170+ countries", data: "Unlimited", dataGb: -1, duration: "20 Days", durationDays: 20, price: 179.2, network: "2G/3G/4G/5G", has5g: true, best: true },
  { id: "g101-100gb-180", scope: "global", region: "Global", countries: "101+ countries", data: "100 GB", dataGb: 100, duration: "180 Days", durationDays: 180, price: 182.63, network: "2G/3G/4G", has5g: false, best: true },
  { id: "g170-unl-30", scope: "global", region: "Global", countries: "170+ countries", data: "Unlimited", dataGb: -1, duration: "30 Days", durationDays: 30, price: 263.63, network: "2G/3G/4G/5G", has5g: true, best: true },
];

const scopeMeta: Record<Scope, { label: string; color: string; tagline: string; icon: typeof Globe2 }> = {
  local: { label: "Local", color: "#008753", tagline: "Nigeria · 36 carriers", icon: MapPin },
  regional: { label: "Regional", color: "#F26522", tagline: "Africa · 29 countries", icon: Plane },
  global: { label: "Global", color: "#1E40AF", tagline: "Up to 192+ countries", icon: Globe2 },
};

type Installed = {
  id: string;
  scope: Scope;
  label: string;
  remaining: string;
  expiresIn: string;
};

const installed: Installed[] = [
  { id: "esim-ng-01", scope: "local", label: "Lagos · Nigeria", remaining: "1.2 GB left", expiresIn: "12 days left" },
  { id: "esim-af-01", scope: "regional", label: "Africa tour", remaining: "Expired", expiresIn: "Renew to reuse" },
  { id: "esim-gl-01", scope: "global", label: "World tour", remaining: "4.8 GB left", expiresIn: "21 days left" },
];

type DataFilter = "all" | "1-2" | "2-5" | "5-10" | "10-20" | "20+" | "unl";
type ValidityFilter = "all" | "1-7" | "8-15" | "16-30" | "30+";
type Sort = "cheap" | "expensive" | "data" | "longest";

const FX = 1550;

type VnCountry = { id: string; name: string; flag: string; code: string; iso: string; cities: number; sample: string };
const vnCountries: VnCountry[] = [
  { id: "us", name: "USA", flag: "🇺🇸", code: "+1", iso: "US", cities: 48, sample: "(415) 555-0142" },
  { id: "gb", name: "United Kingdom", flag: "🇬🇧", code: "+44", iso: "GB", cities: 12, sample: "20 7946 0184" },
  { id: "ca", name: "Canada", flag: "🇨🇦", code: "+1", iso: "CA", cities: 9, sample: "(416) 555-0119" },
  { id: "nl", name: "Netherlands", flag: "🇳🇱", code: "+31", iso: "NL", cities: 6, sample: "20 491 2876" },
];
type VnPlanKey = "day" | "week" | "month" | "year";
type VnPlan = { key: VnPlanKey; label: string; price: number; perMonth: number; badge?: string; sub: string };
const vnPlans: VnPlan[] = [
  { key: "day", label: "1 Day", price: 1.5, perMonth: 45, sub: "One-off SMS verify" },
  { key: "week", label: "1 Week", price: 5.0, perMonth: 21.5, sub: "Short-term verification" },
  { key: "month", label: "1 Month", price: 12.5, perMonth: 12.5, sub: "Cancel anytime" },
  { key: "year", label: "1 Year", price: 56.0, perMonth: 4.67, sub: "Billed yearly · best value", badge: "63% off" },
];
const vnApps = ["WhatsApp", "Telegram", "Google", "Facebook", "Instagram", "TikTok", "X", "OpenAI", "Uber", "PayPal", "Amazon", "Airbnb"];
const vnNumbers: Record<string, string> = {
  us: "+1 (415) 555-0142",
  gb: "+44 20 7946 0184",
  ca: "+1 (416) 555-0119",
  nl: "+31 20 491 2876",
};

type Mode = "new" | "topup" | "vnumber";

function EsimPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("new");
  const [topupId, setTopupId] = useState<string | null>(null);
  const [scope, setScope] = useState<Scope>("local");
  const [email, setEmail] = useState("");
  const [planId, setPlanId] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);
  const [success, setSuccess] = useState(false);
  const [dataF, setDataF] = useState<DataFilter>("all");
  const [valF, setValF] = useState<ValidityFilter>("all");
  const [sort, setSort] = useState<Sort>("cheap");
  const [showFilters, setShowFilters] = useState(false);
  // virtual number
  const [vnCountryId, setVnCountryId] = useState<string>("us");
  const [vnPlanKey, setVnPlanKey] = useState<VnPlanKey>("month");
  const [vnAutoRenew, setVnAutoRenew] = useState(true);
  const [vnSuccess, setVnSuccess] = useState(false);
  const [vnConfirm, setVnConfirm] = useState(false);

  const activeEsim = installed.find((i) => i.id === topupId) ?? null;
  const effectiveScope: Scope = mode === "topup" && activeEsim ? activeEsim.scope : scope;
  const meta = scopeMeta[effectiveScope];

  const filteredPlans = useMemo(() => {
    let list = plans.filter((p) => p.scope === effectiveScope);
    list = list.filter((p) => {
      if (dataF === "all") return true;
      if (dataF === "unl") return p.dataGb === -1;
      if (dataF === "1-2") return p.dataGb >= 1 && p.dataGb < 2;
      if (dataF === "2-5") return p.dataGb >= 2 && p.dataGb < 5;
      if (dataF === "5-10") return p.dataGb >= 5 && p.dataGb < 10;
      if (dataF === "10-20") return p.dataGb >= 10 && p.dataGb < 20;
      if (dataF === "20+") return p.dataGb >= 20;
      return true;
    });
    list = list.filter((p) => {
      if (valF === "all") return true;
      if (valF === "1-7") return p.durationDays <= 7;
      if (valF === "8-15") return p.durationDays >= 8 && p.durationDays <= 15;
      if (valF === "16-30") return p.durationDays >= 16 && p.durationDays <= 30;
      if (valF === "30+") return p.durationDays > 30;
      return true;
    });
    const sorted = [...list];
    sorted.sort((a, b) => {
      if (sort === "cheap") return a.price - b.price;
      if (sort === "expensive") return b.price - a.price;
      if (sort === "data") {
        const aa = a.dataGb === -1 ? Infinity : a.dataGb;
        const bb = b.dataGb === -1 ? Infinity : b.dataGb;
        return bb - aa;
      }
      if (sort === "longest") return b.durationDays - a.durationDays;
      return 0;
    });
    return sorted;
  }, [effectiveScope, dataF, valF, sort]);

  const plan = filteredPlans.find((p) => p.id === planId) ?? null;
  const verified = mode === "topup" ? activeEsim !== null : /\S+@\S+\.\S+/.test(email);
  const valid = verified && plan !== null;
  const cashback = plan ? +(plan.price * 0.005).toFixed(2) : 0;

  const filtersActive = dataF !== "all" || valF !== "all" || sort !== "cheap";

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
          <p className="text-[11px] text-foreground/50">Instant install · No SIM swap · 0.5% cashback</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-service-esim/15 text-service-esim flex items-center justify-center">
          <Globe2 className="w-4 h-4" />
        </div>
      </div>

      {/* Hero */}
      {mode !== "topup" && (
      <div className="px-6 mt-5">
        <div
          className="relative overflow-hidden rounded-3xl p-5 transition-colors"
          style={{
            background: `linear-gradient(135deg, ${meta.color} 0%, color-mix(in oklab, ${meta.color} 70%, #000) 100%)`,
            color: "#FFFFFF",
          }}
        >
          <div
            className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-30 blur-2xl"
            style={{ background: "#fff" }}
          />
          <div className="relative flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] opacity-85 inline-flex items-center gap-1">
              <meta.icon className="w-3 h-3" /> {meta.label} · {plan ? plan.data : "Pick a plan"}
            </span>
            <span className="text-[11px] font-bold opacity-85">USD</span>
          </div>
          <p className="font-display text-4xl font-bold tracking-tight mt-3 relative">
            ${plan ? plan.price.toFixed(2) : "0.00"}
          </p>
          <p className="text-[12px] mt-1 opacity-85 relative">
            {plan
              ? `${plan.duration} · ${plan.network}${plan.countries ? ` · ${plan.countries}` : ""} · ≈ ₦${Math.round(plan.price * FX).toLocaleString()}`
              : meta.tagline}
          </p>
        </div>
      </div>
      )}

      <div className="flex-1 mt-6 bg-card text-card-foreground rounded-t-[2rem] px-6 pt-6 pb-32 space-y-6">
        {/* Mode toggle */}
        <div className="rounded-full bg-card-foreground/[0.06] p-1 grid grid-cols-3 gap-1">
          {(["new", "topup", "vnumber"] as const).map((m) => {
            const sel = mode === m;
            return (
              <button
                key={m}
                onClick={() => {
                  setMode(m);
                  setPlanId(null);
                  if (m === "new") setTopupId(null);
                  else if (m === "topup" && installed.length) {
                    const first = installed[0];
                    setTopupId(first.id);
                    setScope(first.scope);
                  }
                }}
                className={`h-9 rounded-full text-[11px] font-bold transition px-2 ${
                  sel ? "bg-primary text-primary-foreground shadow" : "text-card-foreground/60"
                }`}
              >
                {m === "new" ? "Buy eSIM" : m === "topup" ? "My eSIMs" : "Number"}
              </button>
            );
          })}
        </div>

        {mode === "vnumber" ? (
          <VirtualNumberPanel
            countryId={vnCountryId}
            setCountryId={setVnCountryId}
            planKey={vnPlanKey}
            setPlanKey={setVnPlanKey}
            autoRenew={vnAutoRenew}
            setAutoRenew={setVnAutoRenew}
          />
        ) : mode === "topup" ? (
          <MyEsimsPanel />
        ) : (
          <>
            {/* Mode-specific picker */}
            {mode === "new" ? (
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-card-foreground/50 mb-2 px-1">
                  Coverage
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(scopeMeta) as Scope[]).map((s) => {
                    const m = scopeMeta[s];
                    const sel = scope === s;
                    const count = plans.filter((p) => p.scope === s).length;
                    const Icon = m.icon;
                    return (
                      <button
                        key={s}
                        onClick={() => {
                          setScope(s);
                          setPlanId(null);
                        }}
                        className="relative rounded-2xl py-3 flex flex-col items-center gap-1.5 transition active:scale-95"
                        style={{
                          background: sel
                            ? m.color
                            : "color-mix(in oklab, var(--card-foreground) 4%, transparent)",
                          color: sel ? "#fff" : "var(--card-foreground)",
                          boxShadow: sel ? `0 8px 20px -8px ${m.color}` : "none",
                        }}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-[12px] font-bold leading-none">{m.label}</span>
                        <span className="text-[9px] font-semibold opacity-70 leading-none">
                          {count} plans
                        </span>
                      </button>
                    );
                  })}
                </div>
                <p className="mt-2 px-1 text-[10px] text-card-foreground/55">{meta.tagline}</p>
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
                    const m = scopeMeta[i.scope];
                    const sel = topupId === i.id;
                    const Icon = m.icon;
                    return (
                      <button
                        key={i.id}
                        onClick={() => {
                          setTopupId(i.id);
                          setScope(i.scope);
                          setPlanId(null);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition active:scale-[0.99]"
                        style={{
                          background: sel
                            ? `color-mix(in oklab, ${m.color} 14%, transparent)`
                            : "color-mix(in oklab, var(--card-foreground) 4%, transparent)",
                          border: sel
                            ? `1px solid color-mix(in oklab, ${m.color} 40%, transparent)`
                            : "1px solid transparent",
                        }}
                      >
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center"
                          style={{ background: `color-mix(in oklab, ${m.color} 18%, transparent)`, color: m.color }}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold">{i.label}</p>
                          <p className="text-[11px] text-card-foreground/55 truncate">
                            {m.label} · {i.remaining} · {i.expiresIn}
                          </p>
                        </div>
                        {sel && (
                          <span
                            className="w-5 h-5 rounded-full flex items-center justify-center"
                            style={{ background: m.color, color: "#fff" }}
                          >
                            <Check className="w-3 h-3" strokeWidth={3} />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-2 px-1 text-[10px] text-card-foreground/55">
                  Top ups apply to the existing eSIM profile automatically — no reinstall.
                </p>
              </div>
            )}

            {/* Email — new mode only */}
            {mode === "new" && (
              <div className="mt-6">
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

            {/* Plans header + filters */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2 px-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-card-foreground/50">
                  Plans
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowFilters((v) => !v)}
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition ${
                      filtersActive || showFilters
                        ? "bg-primary text-primary-foreground"
                        : "bg-card-foreground/[0.06] text-card-foreground/60"
                    }`}
                  >
                    <SlidersHorizontal className="w-3 h-3" />
                    {filtersActive ? "On" : "Filter"}
                  </button>
                  <span className="text-[10px] font-semibold text-card-foreground/45">
                    {filteredPlans.length} of {plans.filter((p) => p.scope === effectiveScope).length}
                  </span>
                </div>
              </div>

              {showFilters && (
                <div className="mb-3 rounded-2xl bg-card-foreground/[0.04] p-3 space-y-3">
                  <FilterRow
                    label="Data"
                    options={[
                      { v: "all", l: "All" },
                      { v: "1-2", l: "1–2 GB" },
                      { v: "2-5", l: "2–5 GB" },
                      { v: "5-10", l: "5–10 GB" },
                      { v: "10-20", l: "10–20 GB" },
                      { v: "20+", l: "20+ GB" },
                      { v: "unl", l: "Unlimited" },
                    ]}
                    value={dataF}
                    onChange={(v) => setDataF(v as DataFilter)}
                  />
                  <FilterRow
                    label="Validity"
                    options={[
                      { v: "all", l: "All" },
                      { v: "1-7", l: "1–7 d" },
                      { v: "8-15", l: "8–15 d" },
                      { v: "16-30", l: "16–30 d" },
                      { v: "30+", l: "30+ d" },
                    ]}
                    value={valF}
                    onChange={(v) => setValF(v as ValidityFilter)}
                  />
                  <FilterRow
                    label="Sort"
                    icon={<ArrowDownUp className="w-3 h-3" />}
                    options={[
                      { v: "cheap", l: "Cheapest" },
                      { v: "expensive", l: "Expensive" },
                      { v: "data", l: "Most data" },
                      { v: "longest", l: "Longest" },
                    ]}
                    value={sort}
                    onChange={(v) => setSort(v as Sort)}
                  />
                  {filtersActive && (
                    <button
                      onClick={() => {
                        setDataF("all");
                        setValF("all");
                        setSort("cheap");
                      }}
                      className="text-[11px] font-bold text-primary"
                    >
                      Reset filters
                    </button>
                  )}
                </div>
              )}

              {filteredPlans.length === 0 ? (
                <div className="rounded-2xl bg-card-foreground/[0.04] p-6 text-center">
                  <p className="text-[12px] text-card-foreground/60">No plans match these filters.</p>
                  <button
                    onClick={() => {
                      setDataF("all");
                      setValF("all");
                    }}
                    className="mt-2 text-[11px] font-bold text-primary"
                  >
                    Reset
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredPlans.map((p) => {
                    const sel = planId === p.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() => setPlanId(p.id)}
                        className="relative w-full rounded-2xl p-3.5 text-left transition active:scale-[0.99]"
                        style={{
                          background: sel
                            ? meta.color
                            : "color-mix(in oklab, var(--card-foreground) 4%, transparent)",
                          color: sel ? "#fff" : "var(--card-foreground)",
                          boxShadow: sel ? `0 8px 20px -10px ${meta.color}` : "none",
                        }}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-display text-base font-bold leading-none">
                                {p.data}
                              </span>
                              <span className="text-[11px] font-semibold opacity-70 leading-none">
                                · {p.duration}
                              </span>
                              {p.best && (
                                <span
                                  className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full leading-none"
                                  style={{
                                    background: sel ? "rgba(255,255,255,0.22)" : `color-mix(in oklab, ${meta.color} 14%, transparent)`,
                                    color: sel ? "#fff" : meta.color,
                                  }}
                                >
                                  Best
                                </span>
                              )}
                            </div>
                            {p.countries && (
                              <p className="text-[10px] mt-1 opacity-70 leading-tight truncate">
                                {p.countries}
                              </p>
                            )}
                            <div className="mt-2 flex items-center gap-2.5 flex-wrap">
                              <Chip selected={sel} color={meta.color}>
                                <Wifi className="w-2.5 h-2.5" /> {p.network}
                              </Chip>
                              {p.has5g && (
                                <Chip selected={sel} color={meta.color} accent>
                                  5G
                                </Chip>
                              )}
                              {p.voice && (
                                <Chip selected={sel} color={meta.color}>
                                  <Phone className="w-2.5 h-2.5" /> {p.voice}
                                </Chip>
                              )}
                              {p.sms && (
                                <Chip selected={sel} color={meta.color}>
                                  <MessageSquare className="w-2.5 h-2.5" /> {p.sms}
                                </Chip>
                              )}
                              {p.reloadable && (
                                <Chip selected={sel} color={meta.color}>
                                  <RefreshCw className="w-2.5 h-2.5" /> Reloadable
                                </Chip>
                              )}
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="font-display text-lg font-bold leading-none">
                              ${p.price.toFixed(2)}
                            </p>
                            <p className="text-[9px] mt-1 opacity-70 leading-none">
                              ≈ ₦{Math.round(p.price * FX).toLocaleString()}
                            </p>
                            {sel && (
                              <span className="mt-2 inline-flex items-center gap-0.5 text-[9px] font-bold uppercase tracking-wider">
                                <Check className="w-2.5 h-2.5" strokeWidth={3} /> Selected
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Compatibility note */}
            <div className="rounded-2xl bg-card-foreground/[0.04] p-4 flex gap-3 mt-6">
              <div className="w-8 h-8 rounded-full bg-service-esim/15 text-service-esim flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="text-[11px] text-card-foreground/65 leading-relaxed">
                {mode === "new" ? (
                  <>
                    <span className="font-semibold text-card-foreground/85">Activate in 2 minutes.</span>{" "}
                    No SIM swap, keep your number. Auto-roams to the strongest of 36 carriers. Works on iPhone XR/XS+, Pixel 3+, Galaxy S20+.
                  </>
                ) : (
                  <>
                    <span className="font-semibold text-card-foreground/85">Top up — no reinstall.</span>{" "}
                    Data refills the existing eSIM profile in under 30 seconds.
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Footer CTA */}
      <div className="absolute bottom-0 left-0 right-0 px-4 pb-5 pt-3 bg-gradient-to-t from-card via-card to-transparent">
        {mode === "vnumber" ? (
          <>
            <p className="text-center text-[11px] font-semibold text-success mb-2">
              +${(vnPlans.find((p) => p.key === vnPlanKey)!.price * 0.005).toFixed(2)} cashback
            </p>
            <button
              onClick={() => setVnConfirm(true)}
              className="w-full h-12 rounded-full bg-primary text-primary-foreground font-bold text-sm active:scale-[0.99] transition flex items-center justify-center gap-2"
            >
              Get {vnCountries.find((c) => c.id === vnCountryId)!.flag} number · ${vnPlans.find((p) => p.key === vnPlanKey)!.price.toFixed(2)}
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        ) : (
          <>
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
          </>
        )}
      </div>

      {confirm && !success && plan && mode !== "vnumber" && (
        <ConfirmSheet
          mode={mode}
          esimLabel={activeEsim?.label ?? ""}
          email={email}
          meta={meta}
          plan={plan}
          cashback={cashback}
          onClose={() => setConfirm(false)}
          onConfirm={() => setSuccess(true)}
        />
      )}

      {success && plan && mode !== "vnumber" && (
        <SuccessSheet
          mode={mode}
          esimLabel={activeEsim?.label ?? ""}
          email={email}
          meta={meta}
          plan={plan}
          cashback={cashback}
          onDone={() => navigate({ to: "/wallet" })}
        />
      )}

      {vnConfirm && !vnSuccess && (
        <VnConfirmSheet
          country={vnCountries.find((c) => c.id === vnCountryId)!}
          plan={vnPlans.find((p) => p.key === vnPlanKey)!}
          autoRenew={vnAutoRenew}
          onClose={() => setVnConfirm(false)}
          onPay={() => setVnSuccess(true)}
        />
      )}

      {vnSuccess && (
        <VnSuccessSheet
          country={vnCountries.find((c) => c.id === vnCountryId)!}
          plan={vnPlans.find((p) => p.key === vnPlanKey)!}
          number={vnNumbers[vnCountryId]}
          autoRenew={vnAutoRenew}
          onDone={() => {
            setVnSuccess(false);
            setVnConfirm(false);
            navigate({ to: "/wallet" });
          }}
          onOpenInbox={() => {
            setVnSuccess(false);
            setVnConfirm(false);
            navigate({ to: "/numbers" });
          }}
        />
      )}
    </div>
  );
}

function Chip({
  children,
  selected,
  color,
  accent,
}: {
  children: React.ReactNode;
  selected: boolean;
  color: string;
  accent?: boolean;
}) {
  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] font-bold leading-none px-1.5 py-1 rounded-full"
      style={{
        background: selected
          ? accent
            ? "rgba(255,255,255,0.28)"
            : "rgba(255,255,255,0.18)"
          : accent
          ? `color-mix(in oklab, ${color} 18%, transparent)`
          : "color-mix(in oklab, var(--card-foreground) 6%, transparent)",
        color: selected ? "#fff" : accent ? color : "var(--card-foreground)",
      }}
    >
      {children}
    </span>
  );
}

function FilterRow({
  label,
  icon,
  options,
  value,
  onChange,
}: {
  label: string;
  icon?: React.ReactNode;
  options: { v: string; l: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wider text-card-foreground/50 mb-1.5 inline-flex items-center gap-1">
        {icon} {label}
      </p>
      <div className="flex gap-1.5 flex-wrap">
        {options.map((o) => {
          const sel = o.v === value;
          return (
            <button
              key={o.v}
              onClick={() => onChange(o.v)}
              className={`text-[11px] font-bold px-2.5 py-1.5 rounded-full transition ${
                sel
                  ? "bg-primary text-primary-foreground"
                  : "bg-card-foreground/[0.06] text-card-foreground/65"
              }`}
            >
              {o.l}
            </button>
          );
        })}
      </div>
    </div>
  );
}

type Meta = (typeof scopeMeta)[Scope];

function ConfirmSheet({
  mode,
  esimLabel,
  email,
  meta,
  plan,
  cashback,
  onClose,
  onConfirm,
}: {
  mode: "new" | "topup";
  esimLabel: string;
  email: string;
  meta: Meta;
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
            label="Coverage"
            value={
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: meta.color }} />
                {meta.label}
                {plan.countries ? ` · ${plan.countries}` : plan.region === "Nigeria" ? " · Nigeria" : ""}
              </span>
            }
          />
          <Row label="Data" value={plan.data} />
          <Row label="Network" value={plan.network} />
          {plan.voice && <Row label="Voice" value={plan.voice} />}
          {plan.sms && <Row label="SMS" value={plan.sms} />}
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
  meta,
  plan,
  cashback,
  onDone,
}: {
  mode: "new" | "topup";
  esimLabel: string;
  email: string;
  meta: Meta;
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
            {meta.label} · {plan.data} · {plan.duration}
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
              background: `color-mix(in oklab, ${meta.color} 10%, transparent)`,
              border: `1px solid color-mix(in oklab, ${meta.color} 22%, transparent)`,
            }}
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
              style={{ background: meta.color, color: "#fff" }}
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
              background: `color-mix(in oklab, ${meta.color} 10%, transparent)`,
              border: `1px solid color-mix(in oklab, ${meta.color} 22%, transparent)`,
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

function VirtualNumberPanel({
  countryId,
  setCountryId,
  planKey,
  setPlanKey,
  autoRenew,
  setAutoRenew,
}: {
  countryId: string;
  setCountryId: (v: string) => void;
  planKey: VnPlanKey;
  setPlanKey: (v: VnPlanKey) => void;
  autoRenew: boolean;
  setAutoRenew: (v: boolean) => void;
}) {
  return (
    <div className="space-y-6">
      <CountrySelector countryId={countryId} setCountryId={setCountryId} />

      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-card-foreground/50 mb-2 px-1">
          Subscription
        </p>
        <div className="space-y-2">
          {vnPlans.map((p) => {
            const sel = p.key === planKey;
            return (
              <button
                key={p.key}
                onClick={() => setPlanKey(p.key)}
                className={`w-full flex items-center gap-3 rounded-2xl p-4 text-left transition ${
                  sel ? "bg-primary/10 ring-2 ring-primary" : "bg-card-foreground/[0.04] ring-1 ring-transparent"
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
                      <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-success/15 text-success">
                        {p.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-card-foreground/55 mt-0.5">{p.sub}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-display font-bold text-base tabular-nums">${p.price.toFixed(2)}</p>
                  {p.key === "year" && (
                    <p className="text-[10px] text-card-foreground/55">${p.perMonth.toFixed(2)}/mo</p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <button
        onClick={() => setAutoRenew(!autoRenew)}
        className="w-full flex items-center gap-3 rounded-2xl bg-card-foreground/[0.04] p-4 text-left"
      >
        <div className="w-9 h-9 rounded-full bg-card-foreground/[0.06] flex items-center justify-center">
          <RefreshCw className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">Auto-renew</p>
          <p className="text-[11px] text-card-foreground/55">Keep the same number long-term</p>
        </div>
        <span className={`relative w-10 h-6 rounded-full transition ${autoRenew ? "bg-primary" : "bg-card-foreground/20"}`}>
          <span
            className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition ${
              autoRenew ? "left-[1.125rem]" : "left-0.5"
            }`}
          />
        </span>
      </button>

      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-card-foreground/50 mb-2 px-1">
          Works with 500+ apps
        </p>
        <div className="flex flex-wrap gap-1.5">
          {vnApps.map((a) => (
            <span key={a} className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-card-foreground/[0.05]">
              {a}
            </span>
          ))}
          <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-card-foreground/[0.05] text-card-foreground/60">
            +500 more
          </span>
        </div>
      </div>

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
        SMS reception only. Voice calls are not included. Number stays active for the subscription duration.
      </p>
    </div>
  );
}

function VnConfirmSheet({
  country,
  plan,
  autoRenew,
  onClose,
  onPay,
}: {
  country: VnCountry;
  plan: VnPlan;
  autoRenew: boolean;
  onClose: () => void;
  onPay: () => void;
}) {
  const cashback = +(plan.price * 0.005).toFixed(2);
  return (
    <div className="fixed inset-0 z-[70] flex items-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full bg-card text-card-foreground rounded-t-[2rem] pt-3 pb-8 animate-in slide-in-from-bottom duration-300"
      >
        <div className="w-10 h-1 rounded-full bg-card-foreground/15 mx-auto" />
        <div className="px-6 mt-4">
          <h3 className="font-display font-bold text-base">Confirm purchase</h3>
          <p className="text-[11px] text-card-foreground/55 mt-0.5">Number activates instantly after payment</p>
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
          <Row label="Country" value={`${country.flag} ${country.name} (${country.code})`} />
          <Row label="Plan" value={plan.label} />
          <Row label="Auto-renew" value={autoRenew ? "On" : "Off"} />
          <Row label="Capability" value="SMS reception" />
          <Row label="Pay from" value="Wallet · USD" />
        </div>
        <div className="px-6 mt-5 grid grid-cols-2 gap-2">
          <button onClick={onClose} className="h-12 rounded-full bg-card-foreground/[0.06] font-bold text-sm">
            Cancel
          </button>
          <button
            onClick={onPay}
            className="h-12 rounded-full bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-2"
          >
            Buy now <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function VnSuccessSheet({
  country,
  plan,
  number,
  autoRenew,
  onDone,
  onOpenInbox,
}: {
  country: VnCountry;
  plan: VnPlan;
  number: string;
  autoRenew: boolean;
  onDone: () => void;
  onOpenInbox: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const ref = `BZP-VN-${Math.floor(Math.random() * 90000 + 10000)}`;
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
    <div className="fixed inset-0 z-[80] flex items-end">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="relative w-full bg-card text-card-foreground rounded-t-[2rem] pt-3 pb-8 animate-in slide-in-from-bottom duration-300">
        <div className="w-10 h-1 rounded-full bg-card-foreground/15 mx-auto" />
        <div className="px-6 mt-6 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-success/15 text-success flex items-center justify-center">
            <Check className="w-7 h-7" strokeWidth={3} />
          </div>
          <h3 className="font-display font-bold text-xl mt-4">Number ready</h3>
          <p className="text-[12px] text-card-foreground/55 mt-1">
            {country.flag} {country.name} · {plan.label}
          </p>
        </div>

        <button
          onClick={copy}
          className="mx-6 mt-5 rounded-2xl bg-card-foreground/[0.04] p-4 flex items-center gap-3 text-left active:scale-[0.99] transition w-[calc(100%-3rem)]"
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

        <div className="mx-6 mt-3 rounded-2xl bg-card-foreground/[0.04] divide-y divide-card-foreground/[0.06] overflow-hidden">
          <Row label="Auto-renew" value={autoRenew ? "On" : "Off"} />
          <Row label="Inbox" value="Live SMS · view now" />
          <Row label="Reference" value={ref} />
        </div>

        <div className="px-6 mt-5 space-y-2">
          <button
            onClick={onOpenInbox}
            className="w-full h-12 rounded-full bg-primary text-primary-foreground font-bold text-sm"
          >
            Open Inbox
          </button>
          <button
            onClick={onDone}
            className="w-full h-12 rounded-full bg-card-foreground/[0.06] font-bold text-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

function CountrySelector({
  countryId,
  setCountryId,
}: {
  countryId: string;
  setCountryId: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const selected = vnCountries.find((c) => c.id === countryId)!;
  const filtered = vnCountries.filter(
    (c) =>
      c.name.toLowerCase().includes(q.toLowerCase()) ||
      c.code.includes(q) ||
      c.iso.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-2 px-1">
        <p className="text-[11px] font-bold uppercase tracking-wider text-card-foreground/50">
          Number from
        </p>
        <button
          onClick={() => setOpen(true)}
          className="text-[11px] font-bold text-primary inline-flex items-center gap-1"
        >
          200+ countries <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      {/* Hero card for selected country */}
      <button
        onClick={() => setOpen(true)}
        className="relative w-full overflow-hidden rounded-2xl p-4 text-left active:scale-[0.99] transition"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.32 0.14 220) 0%, oklch(0.22 0.12 260) 100%)",
          color: "#fff",
        }}
      >
        <div
          className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-30 blur-2xl"
          style={{ background: "oklch(0.72 0.16 220)" }}
        />
        <div className="relative flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/15 flex items-center justify-center text-3xl leading-none">
            {selected.flag}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="font-display font-bold text-base tracking-tight">{selected.name}</p>
              <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-white/15">
                {selected.iso}
              </span>
            </div>
            <p className="text-[12px] opacity-85 mt-0.5 tabular-nums">
              {selected.code} {selected.sample}
            </p>
            <p className="text-[10px] opacity-65 mt-1">
              {selected.cities} city codes · instant SMS
            </p>
          </div>
          <ChevronRight className="w-4 h-4 opacity-70" />
        </div>
      </button>

      {/* Quick swap chips */}
      <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1">
        {vnCountries.map((c) => {
          const sel = c.id === countryId;
          return (
            <button
              key={c.id}
              onClick={() => setCountryId(c.id)}
              className={`shrink-0 h-9 pl-2 pr-3 rounded-full flex items-center gap-1.5 text-[12px] font-semibold transition ${
                sel
                  ? "bg-primary text-primary-foreground"
                  : "bg-card-foreground/[0.05] text-card-foreground/80"
              }`}
            >
              <span className="text-base leading-none">{c.flag}</span>
              {c.iso}
              <span className={`text-[10px] tabular-nums ${sel ? "opacity-80" : "opacity-55"}`}>
                {c.code}
              </span>
            </button>
          );
        })}
        <button
          onClick={() => setOpen(true)}
          className="shrink-0 h-9 px-3 rounded-full bg-card-foreground/[0.05] flex items-center gap-1 text-[12px] font-semibold text-card-foreground/70"
        >
          <Search className="w-3 h-3" /> More
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-[80] flex items-end">
          <button
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            aria-label="Close"
          />
          <div className="relative w-full max-h-[80vh] flex flex-col bg-card text-card-foreground rounded-t-[2rem] pt-3 pb-6 animate-in slide-in-from-bottom duration-300">
            <div className="w-10 h-1 rounded-full bg-card-foreground/15 mx-auto" />
            <div className="px-6 mt-4 flex items-center justify-between">
              <h3 className="font-display font-bold text-lg">Choose country</h3>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-full bg-card-foreground/[0.06] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-6 mt-3">
              <div className="h-11 rounded-full bg-card-foreground/[0.05] flex items-center gap-2 px-4">
                <Search className="w-4 h-4 text-card-foreground/50" />
                <input
                  autoFocus
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search country, code or ISO"
                  className="flex-1 bg-transparent outline-none text-sm placeholder:text-card-foreground/40"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-6 mt-3 pb-3">
              {filtered.length === 0 ? (
                <p className="text-center text-[12px] text-card-foreground/55 py-8">
                  No matches. More countries coming soon.
                </p>
              ) : (
                <div className="space-y-1">
                  {filtered.map((c) => {
                    const sel = c.id === countryId;
                    return (
                      <button
                        key={c.id}
                        onClick={() => {
                          setCountryId(c.id);
                          setOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 rounded-2xl p-3 text-left transition ${
                          sel ? "bg-primary/10" : "active:bg-card-foreground/[0.04]"
                        }`}
                      >
                        <span className="text-2xl leading-none w-9 text-center">{c.flag}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm">{c.name}</p>
                          <p className="text-[11px] text-card-foreground/55 tabular-nums">
                            {c.code} · {c.cities} cities
                          </p>
                        </div>
                        {sel ? (
                          <Check className="w-4 h-4 text-primary" strokeWidth={3} />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-card-foreground/30" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
              <p className="text-[11px] text-card-foreground/45 text-center mt-4 leading-relaxed">
                More countries coming soon. Join the waitlist from your dashboard.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
