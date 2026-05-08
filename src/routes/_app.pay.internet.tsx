import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Router,
  Sparkles,
  X,
  ShieldCheck,
  Calendar,
  Gauge,
} from "lucide-react";
import { usePinGate } from "@/components/pin-prompt";

export const Route = createFileRoute("/_app/pay/internet")({
  head: () => ({
    meta: [
      { title: "Pay internet · BazePay" },
      { name: "description", content: "Renew ipNX, Smile, Spectranet and more in seconds." },
    ],
  }),
  component: InternetPage,
});

type Provider = {
  id: string;
  name: string;
  short: string;
  tagline: string;
  color: string;
};

const providers: Provider[] = [
  { id: "ipnx", name: "ipNX", short: "iP", tagline: "Fibre · FTTH", color: "#E11A2B" },
  { id: "smile", name: "Smile", short: "SM", tagline: "4G LTE · Voice", color: "#2BB673" },
  { id: "spectranet", name: "Spectranet", short: "SP", tagline: "4G LTE · Mi-Fi", color: "#0066B3" },
  { id: "swift", name: "Swift", short: "SW", tagline: "Fibre · 4G", color: "#F26522" },
];

type Plan = {
  id: string;
  name: string;
  price: number;
  speed: string;
  data: string;
  duration: string;
  badge?: string;
};

const plans: Record<string, Plan[]> = {
  ipnx: [
    { id: "lite-15", name: "Home Lite", price: 15500, speed: "15 Mbps", data: "Unlimited", duration: "1 month" },
    { id: "fast-25", name: "Home Fast", price: 21500, speed: "25 Mbps", data: "Unlimited", duration: "1 month", badge: "Popular" },
    { id: "ultra-50", name: "Ultra", price: 33500, speed: "50 Mbps", data: "Unlimited", duration: "1 month" },
    { id: "max-100", name: "Max", price: 55000, speed: "100 Mbps", data: "Unlimited", duration: "1 month", badge: "Top tier" },
  ],
  smile: [
    { id: "5gb", name: "5 GB", price: 3500, speed: "Up to 12 Mbps", data: "5 GB", duration: "30 days" },
    { id: "12gb", name: "12 GB", price: 6500, speed: "Up to 12 Mbps", data: "12 GB", duration: "30 days", badge: "Popular" },
    { id: "30gb", name: "30 GB", price: 12000, speed: "Up to 12 Mbps", data: "30 GB", duration: "30 days" },
    { id: "unl", name: "Unlimited", price: 22000, speed: "Up to 12 Mbps", data: "Unlimited", duration: "30 days" },
  ],
  spectranet: [
    { id: "10gb", name: "10 GB", price: 4000, speed: "4G LTE", data: "10 GB", duration: "30 days" },
    { id: "25gb", name: "25 GB", price: 9500, speed: "4G LTE", data: "25 GB", duration: "30 days", badge: "Popular" },
    { id: "60gb", name: "60 GB", price: 18000, speed: "4G LTE", data: "60 GB", duration: "30 days" },
    { id: "unl", name: "Unlimited", price: 30000, speed: "4G LTE", data: "Unlimited", duration: "30 days" },
  ],
  swift: [
    { id: "20", name: "Home 20", price: 16000, speed: "20 Mbps", data: "Unlimited", duration: "1 month" },
    { id: "40", name: "Home 40", price: 25000, speed: "40 Mbps", data: "Unlimited", duration: "1 month", badge: "Popular" },
    { id: "100", name: "Pro 100", price: 48000, speed: "100 Mbps", data: "Unlimited", duration: "1 month" },
  ],
  fiberone: [
    { id: "basic", name: "Basic", price: 18000, speed: "20 Mbps", data: "Unlimited", duration: "1 month" },
    { id: "plus", name: "Plus", price: 28000, speed: "40 Mbps", data: "Unlimited", duration: "1 month", badge: "Popular" },
    { id: "ultra", name: "Ultra", price: 50000, speed: "100 Mbps", data: "Unlimited", duration: "1 month" },
  ],
  tizeti: [
    { id: "lite", name: "Lite", price: 14000, speed: "Shared", data: "Unlimited", duration: "1 month" },
    { id: "premium", name: "Premium", price: 22000, speed: "Shared", data: "Unlimited", duration: "1 month", badge: "Popular" },
  ],
  starlink: [
    { id: "residential", name: "Residential", price: 38000, speed: "25–100 Mbps", data: "Unlimited", duration: "1 month", badge: "Popular" },
    { id: "roam", name: "Roam", price: 49000, speed: "5–50 Mbps", data: "Unlimited", duration: "1 month" },
    { id: "priority", name: "Priority", price: 95000, speed: "40–220 Mbps", data: "Unlimited", duration: "1 month" },
  ],
  coollink: [
    { id: "home", name: "Home", price: 15500, speed: "10 Mbps", data: "Unlimited", duration: "1 month" },
    { id: "office", name: "Office", price: 35000, speed: "30 Mbps", data: "Unlimited", duration: "1 month", badge: "Popular" },
  ],
};

const recents = [
  { account: "IPNX-78821", provider: "ipnx", label: "Home · Lekki" },
  { account: "0809123456", provider: "smile", label: "Mi-Fi · Personal" },
  { account: "SPN-44219", provider: "spectranet", label: "Office · VI" },
];

function InternetPage() {
  const navigate = useNavigate();
  const [providerId, setProviderId] = useState<string>("ipnx");
  const [account, setAccount] = useState("");
  const [planId, setPlanId] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);
  const [success, setSuccess] = useState(false);
  const { requirePin, pinGate } = usePinGate({ subtitle: "Authorise internet payment" });

  const provider = providers.find((p) => p.id === providerId)!;
  const providerPlans = plans[providerId] ?? [];
  const plan = providerPlans.find((p) => p.id === planId) ?? null;
  const verified = account.trim().length >= 5;
  const valid = verified && plan !== null;
  const cashback = plan ? Math.floor(plan.price * 0.005) : 0;

  const customer = useMemo(() => {
    if (!verified) return null;
    const names = ["Ade Okafor", "Chidi Eze", "Funke Adeyemi", "Bola Ojo", "Tunde Bello"];
    const seed = account.charCodeAt(0) || 0;
    return names[seed % names.length];
  }, [verified, account]);

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
          <h1 className="font-display text-xl font-bold tracking-tight">Pay internet</h1>
          <p className="text-[11px] text-foreground/50">Instant renewal · 0.5% cashback</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-service-internet/15 text-service-internet flex items-center justify-center">
          <Router className="w-4 h-4" />
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
              ? `${customer} · ${plan ? `${plan.speed} · ${plan.data}` : provider.tagline}`
              : "Enter account / customer ID"}
          </p>
        </div>
      </div>

      <div className="flex-1 mt-6 bg-card text-card-foreground rounded-t-[2rem] px-6 pt-6 pb-32 space-y-6">
        {/* Provider picker */}
        <div>
          <div className="flex items-center justify-between mb-2 px-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-card-foreground/50">
              Provider
            </p>
            <span className="text-[10px] font-semibold text-card-foreground/45">
              {providers.length} ISPs
            </span>
          </div>
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
                    {p.short}
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

        {/* Account */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-card-foreground/50 mb-2 px-1">
            Account / Customer ID
          </p>
          <div className="relative">
            <input
              value={account}
              onChange={(e) => setAccount(e.target.value.slice(0, 20))}
              placeholder={`e.g. ${provider.id === "ipnx" ? "IPNX-78821" : "0809123456"}`}
              className="w-full h-14 rounded-2xl bg-card-foreground/[0.04] pl-4 pr-12 text-base font-semibold tracking-wide outline-none focus:bg-card-foreground/[0.06]"
            />
            {account && (
              <button
                onClick={() => setAccount("")}
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
              Plans
            </p>
            <span className="text-[10px] font-semibold text-card-foreground/45">
              {providerPlans.length} options
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
                  <p className="text-[10px] mt-0.5 inline-flex items-center gap-1 font-semibold leading-tight" style={{ opacity: sel ? 0.85 : 0.65 }}>
                    <Gauge className="w-2.5 h-2.5" />
                    {p.speed}
                  </p>
                  <p className="text-[10px] leading-tight" style={{ opacity: sel ? 0.8 : 0.55 }}>
                    {p.data}
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

        {/* Recents */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-card-foreground/50 mb-2 px-1">
            Saved accounts
          </p>
          <div className="rounded-2xl bg-card-foreground/[0.04] divide-y divide-card-foreground/[0.06] overflow-hidden">
            {recents.map((r) => {
              const p = providers.find((x) => x.id === r.provider)!;
              return (
                <button
                  key={r.account}
                  onClick={() => {
                    setAccount(r.account);
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
                    {p.short}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{r.label}</p>
                    <p className="text-[11px] text-card-foreground/55 truncate">
                      {p.name} · {r.account}
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
          {plan ? `Renew · ₦${plan.price.toLocaleString()}` : "Pick a plan"}
        </button>
      </div>

      {confirm && !success && plan && (
        <ConfirmSheet
          account={account}
          customer={customer ?? ""}
          provider={provider}
          plan={plan}
          cashback={cashback}
          onClose={() => setConfirm(false)}
          onConfirm={() => requirePin(() => setSuccess(true))}
        />
      )}

      {success && plan && (
        <SuccessSheet
          account={account}
          customer={customer ?? ""}
          provider={provider}
          plan={plan}
          cashback={cashback}
          onDone={() => navigate({ to: "/wallet" })}
        />
      )}
      {pinGate}
    </div>
  );
}

function ConfirmSheet({
  account,
  customer,
  provider,
  plan,
  cashback,
  onClose,
  onConfirm,
}: {
  account: string;
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
          <Row label="Account" value={account} />
          <Row
            label="Provider"
            value={
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: provider.color }} />
                {provider.name}
              </span>
            }
          />
          <Row label="Plan" value={`${plan.name} · ${plan.speed}`} />
          <Row label="Data" value={plan.data} />
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
  account,
  customer,
  provider,
  plan,
  cashback,
  onDone,
}: {
  account: string;
  customer: string;
  provider: Provider;
  plan: Plan;
  cashback: number;
  onDone: () => void;
}) {
  const ref = `BZP-NET-${Math.floor(Math.random() * 90000 + 10000)}`;
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
          <h3 className="font-display font-bold text-xl mt-4">Internet renewed</h3>
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
              {plan.speed}
            </span>
          </div>
          <p className="text-[10px] text-card-foreground/55 mt-1">Account {account}</p>
        </div>

        <div className="mx-6 mt-3 rounded-2xl bg-card-foreground/[0.04] px-4 py-3 flex items-center justify-between">
          <p className="text-[12px] text-card-foreground/55">Reference</p>
          <p className="text-[13px] font-semibold">{ref}</p>
        </div>

        <div className="px-6 mt-5 grid grid-cols-2 gap-2">
          <Link
            to="/pay/internet"
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
