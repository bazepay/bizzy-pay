import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Contact,
  Smartphone,
  Sparkles,
  X,
  Repeat,
  ChevronDown,
} from "lucide-react";

export const Route = createFileRoute("/_app/pay/data")({
  head: () => ({
    meta: [
      { title: "Buy data · BazePay" },
      { name: "description", content: "Daily, weekly and monthly data plans for MTN, Glo, Airtel and 9mobile." },
    ],
  }),
  component: DataPage,
});

const networks = [
  { id: "mtn", name: "MTN", color: "#FFCC00", textColor: "#1B1B1B", prefixes: ["0803", "0806", "0813", "0816", "0903", "0906"] },
  { id: "glo", name: "Glo", color: "#00A859", textColor: "#FFFFFF", prefixes: ["0805", "0807", "0815", "0811", "0905"] },
  { id: "airtel", name: "Airtel", color: "#E40000", textColor: "#FFFFFF", prefixes: ["0802", "0808", "0812", "0701", "0902", "0907"] },
  { id: "9mobile", name: "9mobile", color: "#006F3C", textColor: "#FFFFFF", prefixes: ["0809", "0817", "0818", "0908", "0909"] },
];

type Plan = {
  id: string;
  size: string;
  validity: string;
  price: number;
  bucket: "daily" | "weekly" | "monthly" | "mega";
  hot?: boolean;
};

const planMap: Record<string, Plan[]> = {
  mtn: [
    { id: "mtn-d1", size: "100MB", validity: "24 hours", price: 100, bucket: "daily" },
    { id: "mtn-d2", size: "1GB", validity: "1 day", price: 350, bucket: "daily", hot: true },
    { id: "mtn-w1", size: "2.5GB", validity: "2 days", price: 800, bucket: "daily" },
    { id: "mtn-w2", size: "2GB", validity: "7 days", price: 1500, bucket: "weekly", hot: true },
    { id: "mtn-w3", size: "6GB", validity: "7 days", price: 2500, bucket: "weekly" },
    { id: "mtn-m1", size: "10GB", validity: "30 days", price: 4500, bucket: "monthly", hot: true },
    { id: "mtn-m2", size: "20GB", validity: "30 days", price: 7500, bucket: "monthly" },
    { id: "mtn-m3", size: "40GB", validity: "30 days", price: 11000, bucket: "monthly" },
    { id: "mtn-x1", size: "75GB", validity: "60 days", price: 18000, bucket: "mega" },
    { id: "mtn-x2", size: "150GB", validity: "90 days", price: 35000, bucket: "mega" },
  ],
  glo: [
    { id: "glo-d1", size: "200MB", validity: "1 day", price: 100, bucket: "daily" },
    { id: "glo-d2", size: "1.35GB", validity: "1 day", price: 300, bucket: "daily" },
    { id: "glo-w1", size: "2.9GB", validity: "7 days", price: 1500, bucket: "weekly", hot: true },
    { id: "glo-m1", size: "10GB", validity: "30 days", price: 4000, bucket: "monthly", hot: true },
    { id: "glo-m2", size: "24GB", validity: "30 days", price: 8000, bucket: "monthly" },
    { id: "glo-x1", size: "50GB", validity: "30 days", price: 15000, bucket: "mega" },
  ],
  airtel: [
    { id: "atl-d1", size: "300MB", validity: "1 day", price: 150, bucket: "daily" },
    { id: "atl-d2", size: "1GB", validity: "1 day", price: 350, bucket: "daily" },
    { id: "atl-w1", size: "3.5GB", validity: "7 days", price: 1500, bucket: "weekly", hot: true },
    { id: "atl-m1", size: "10GB", validity: "30 days", price: 4000, bucket: "monthly", hot: true },
    { id: "atl-m2", size: "25GB", validity: "30 days", price: 8000, bucket: "monthly" },
    { id: "atl-x1", size: "60GB", validity: "30 days", price: 15000, bucket: "mega" },
  ],
  "9mobile": [
    { id: "9m-d1", size: "150MB", validity: "1 day", price: 100, bucket: "daily" },
    { id: "9m-d2", size: "650MB", validity: "1 day", price: 300, bucket: "daily" },
    { id: "9m-w1", size: "2GB", validity: "7 days", price: 1500, bucket: "weekly", hot: true },
    { id: "9m-m1", size: "11GB", validity: "30 days", price: 4000, bucket: "monthly" },
    { id: "9m-m2", size: "27GB", validity: "30 days", price: 8000, bucket: "monthly", hot: true },
  ],
};

const buckets = [
  { id: "all", label: "All" },
  { id: "daily", label: "Daily" },
  { id: "weekly", label: "Weekly" },
  { id: "monthly", label: "Monthly" },
  { id: "mega", label: "Mega" },
] as const;

const recents = [
  { name: "Mum", phone: "0803 555 0142", network: "mtn", initials: "M", bg: "#FFE4D6", color: "#E07A4F", lastPlanId: "mtn-m1" },
  { name: "Self", phone: "0805 117 3344", network: "glo", initials: "Y", bg: "#E0E7FF", color: "#5B4DFF", lastPlanId: "glo-w1" },
  { name: "Tunde", phone: "0809 221 9087", network: "9mobile", initials: "T", bg: "#D6F5E3", color: "#0F8C5A", lastPlanId: "9m-w1" },
];

function parseGB(size: string): number {
  const m = size.match(/([\d.]+)\s*(GB|MB)/i);
  if (!m) return 0;
  const v = parseFloat(m[1]);
  return m[2].toUpperCase() === "MB" ? v / 1024 : v;
}

function pricePerGB(price: number, size: string): string {
  const gb = parseGB(size);
  if (gb < 0.05) return "—";
  return `₦${Math.round(price / gb).toLocaleString()}/GB`;
}

function detectNetwork(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 4) return null;
  const prefix = digits.startsWith("234") ? "0" + digits.slice(3, 6) : digits.slice(0, 4);
  return networks.find((n) => n.prefixes.includes(prefix))?.id ?? null;
}

function formatPhone(raw: string) {
  const d = raw.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 4) return d;
  if (d.length <= 7) return `${d.slice(0, 4)} ${d.slice(4)}`;
  return `${d.slice(0, 4)} ${d.slice(4, 7)} ${d.slice(7)}`;
}

function DataPage() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [network, setNetwork] = useState<string>("mtn");
  const [autoNet, setAutoNet] = useState(true);
  const [planId, setPlanId] = useState<string | null>(null);
  const [collapsedBucket, setCollapsedBucket] = useState<Record<string, boolean>>({
    daily: false,
    weekly: false,
    monthly: false,
    mega: true,
  });
  const [confirm, setConfirm] = useState(false);
  const [success, setSuccess] = useState(false);

  const detected = useMemo(() => detectNetwork(phone), [phone]);
  const activeNet = autoNet && detected ? detected : network;
  const net = networks.find((n) => n.id === activeNet)!;
  const allPlans = planMap[activeNet] ?? [];
  const grouped = useMemo(() => {
    const out: Record<string, Plan[]> = { daily: [], weekly: [], monthly: [], mega: [] };
    allPlans.forEach((p) => out[p.bucket].push(p));
    return out;
  }, [allPlans]);
  const matchedRecent = recents.find(
    (r) => r.phone.replace(/\s/g, "") === phone.replace(/\D/g, ""),
  );
  const lastPlan = matchedRecent
    ? planMap[matchedRecent.network]?.find((p) => p.id === matchedRecent.lastPlanId)
    : null;

  const selectedPlan = allPlans.find((p) => p.id === planId) ?? null;
  const total = selectedPlan?.price ?? 0;
  const cashback = Math.floor(total * 0.015);
  const valid = phone.replace(/\D/g, "").length >= 10 && !!selectedPlan;

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
          <h1 className="font-display text-xl font-bold tracking-tight">Buy data</h1>
          <p className="text-[11px] text-foreground/50">Stay online · 1.5% cashback</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-service-data/15 text-service-data flex items-center justify-center">
          <Smartphone className="w-4 h-4" />
        </div>
      </div>

      {/* Compact summary */}
      <div className="px-6 mt-5">
        <div className="rounded-3xl bg-card text-card-foreground p-4 flex items-center gap-3">
          <span
            className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: net.color, color: net.textColor }}
          >
            <span className="text-[10px] font-extrabold leading-none tracking-tight">
              {net.name === "9mobile" ? "9m" : net.name.slice(0, 3).toUpperCase()}
            </span>
          </span>
          <div className="flex-1 min-w-0">
            {selectedPlan ? (
              <>
                <p className="font-display text-base font-bold leading-tight truncate">
                  {selectedPlan.size} · {selectedPlan.validity}
                </p>
                <p className="text-[11px] text-card-foreground/55 mt-0.5 truncate">
                  {phone ? formatPhone(phone) : "Add a phone number"} · {pricePerGB(selectedPlan.price, selectedPlan.size)}
                </p>
              </>
            ) : (
              <>
                <p className="font-display text-base font-bold leading-tight">
                  {net.name} · pick a plan
                </p>
                <p className="text-[11px] text-card-foreground/55 mt-0.5 truncate">
                  {phone ? formatPhone(phone) : "Enter a phone number to start"}
                </p>
              </>
            )}
          </div>
          {selectedPlan && (
            <p className="font-display text-lg font-bold shrink-0">
              ₦{selectedPlan.price.toLocaleString()}
            </p>
          )}
        </div>
      </div>

      <div className="flex-1 mt-6 bg-card text-card-foreground rounded-t-[2rem] px-6 pt-6 pb-32 space-y-6">
        {/* Phone */}
        <div>
          <div className="flex items-center justify-between mb-2 px-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-card-foreground/50">
              Phone number
            </p>
            <button className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary">
              <Contact className="w-3 h-3" /> Contacts
            </button>
          </div>
          <div className="relative">
            <input
              value={formatPhone(phone)}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0803 555 0142"
              inputMode="tel"
              maxLength={13}
              className="w-full h-14 rounded-2xl bg-card-foreground/[0.04] pl-4 pr-12 text-base font-semibold tracking-wide outline-none focus:bg-card-foreground/[0.06]"
            />
            {phone && (
              <button
                onClick={() => setPhone("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-card-foreground/10 flex items-center justify-center"
                aria-label="Clear"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          {detected && autoNet && (
            <p className="text-[11px] text-card-foreground/55 mt-2 px-1">
              Detected{" "}
              <span className="font-semibold text-card-foreground">
                {networks.find((n) => n.id === detected)?.name}
              </span>{" "}
              ·{" "}
              <button onClick={() => setAutoNet(false)} className="font-semibold text-primary">
                change
              </button>
            </p>
          )}
        </div>

        {/* Network override */}
        {(!detected || !autoNet) && (
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-card-foreground/50 mb-2 px-1">
              Network
            </p>
            <div className="grid grid-cols-4 gap-2">
              {networks.map((n) => {
                const sel = n.id === activeNet;
                return (
                  <button
                    key={n.id}
                    onClick={() => {
                      setNetwork(n.id);
                      setAutoNet(false);
                      setPlanId(null);
                    }}
                    className={`h-16 rounded-2xl flex flex-col items-center justify-center gap-1.5 text-[11px] font-semibold transition ${
                      sel
                        ? "bg-card-foreground text-card"
                        : "bg-card-foreground/[0.04] text-card-foreground/85"
                    }`}
                  >
                    <span className="w-6 h-6 rounded-full" style={{ background: n.color }} />
                    {n.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Buy again */}
        {lastPlan && lastPlan.id !== planId && (
          <button
            onClick={() => {
              setPlanId(lastPlan.id);
              setCollapsedBucket((c) => ({ ...c, [lastPlan.bucket]: false }));
            }}
            className="w-full rounded-2xl bg-primary/10 border border-primary/25 px-4 py-3 flex items-center gap-3 text-left active:bg-primary/15 transition"
          >
            <span className="w-9 h-9 rounded-full bg-primary/20 text-primary flex items-center justify-center">
              <Repeat className="w-4 h-4" />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-wider text-primary">
                Buy again
              </p>
              <p className="text-sm font-semibold truncate">
                {lastPlan.size} · {lastPlan.validity} · ₦{lastPlan.price.toLocaleString()}
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-primary" />
          </button>
        )}

        {/* Plans grouped by bucket */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-card-foreground/50">
              Plans · {net.name}
            </p>
            <span className="text-[11px] text-card-foreground/45">{allPlans.length} available</span>
          </div>

          <div className="space-y-4">
            {(["daily", "weekly", "monthly", "mega"] as const).map((b) => {
              const items = grouped[b];
              if (!items?.length) return null;
              const collapsed = collapsedBucket[b];
              const labelMap = {
                daily: "Daily",
                weekly: "Weekly",
                monthly: "Monthly",
                mega: "Mega · 60+ days",
              } as const;
              return (
                <div key={b}>
                  <button
                    onClick={() => setCollapsedBucket((c) => ({ ...c, [b]: !c[b] }))}
                    className="w-full flex items-center justify-between px-1 py-1 mb-2"
                  >
                    <p className="text-[12px] font-bold text-card-foreground/85">
                      {labelMap[b]}{" "}
                      <span className="text-card-foreground/40 font-medium">· {items.length}</span>
                    </p>
                    <ChevronDown
                      className={`w-4 h-4 text-card-foreground/45 transition-transform ${
                        collapsed ? "-rotate-90" : ""
                      }`}
                    />
                  </button>
                  {!collapsed && (
                    <div className="grid grid-cols-2 gap-2">
                      {items.map((p) => {
                        const sel = p.id === planId;
                        return (
                          <button
                            key={p.id}
                            onClick={() => setPlanId(p.id)}
                            className={`relative rounded-2xl p-3.5 text-left transition border ${
                              sel
                                ? "bg-card-foreground text-card border-card-foreground"
                                : "bg-card-foreground/[0.04] border-transparent text-card-foreground"
                            }`}
                          >
                            {p.hot && !sel && (
                              <span className="absolute top-2 right-2 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-service-airtime/20 text-service-airtime">
                                Hot
                              </span>
                            )}
                            <p className="font-display font-bold text-lg leading-tight">{p.size}</p>
                            <p className={`text-[11px] mt-0.5 ${sel ? "text-card/65" : "text-card-foreground/55"}`}>
                              {p.validity}
                            </p>
                            <div className="mt-2 flex items-baseline justify-between gap-1">
                              <p className="text-[13px] font-bold">₦{p.price.toLocaleString()}</p>
                              <p className={`text-[10px] font-semibold ${sel ? "text-card/60" : "text-card-foreground/45"}`}>
                                {pricePerGB(p.price, p.size)}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Recents */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-card-foreground/50 mb-2 px-1">
            Recent
          </p>
          <div className="rounded-2xl bg-card-foreground/[0.04] divide-y divide-card-foreground/[0.06] overflow-hidden">
            {recents.map((r) => {
              const rNet = networks.find((n) => n.id === r.network)!;
              return (
                <button
                  key={r.phone}
                  onClick={() => {
                    setPhone(r.phone.replace(/\s/g, ""));
                    setNetwork(r.network);
                    setAutoNet(true);
                    setPlanId(null);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left active:bg-card-foreground/[0.06]"
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: r.bg, color: r.color }}
                  >
                    {r.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{r.name}</p>
                    <p className="text-[11px] text-card-foreground/55">{r.phone}</p>
                  </div>
                  <span
                    className="text-[10px] font-bold px-2 py-1 rounded-full"
                    style={{
                      background: `color-mix(in oklab, ${rNet.color} 18%, transparent)`,
                      color: rNet.color,
                    }}
                  >
                    {rNet.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="absolute bottom-0 left-0 right-0 px-4 pb-5 pt-3 bg-gradient-to-t from-card via-card to-transparent">
        <button
          disabled={!valid}
          onClick={() => setConfirm(true)}
          className="w-full h-12 rounded-full bg-primary text-primary-foreground font-bold text-sm disabled:opacity-40 active:scale-[0.99] transition flex items-center justify-center gap-2"
        >
          {selectedPlan
            ? `Buy ${selectedPlan.size} · ₦${total.toLocaleString()}`
            : "Pick a plan"}
        </button>
      </div>

      {confirm && !success && selectedPlan && (
        <ConfirmSheet
          phone={formatPhone(phone)}
          network={net.name}
          networkColor={net.color}
          plan={selectedPlan}
          cashback={cashback}
          onClose={() => setConfirm(false)}
          onConfirm={() => setSuccess(true)}
        />
      )}

      {success && selectedPlan && (
        <SuccessSheet
          plan={selectedPlan}
          phone={formatPhone(phone)}
          networkName={net.name}
          cashback={cashback}
          onDone={() => navigate({ to: "/wallet" })}
        />
      )}
    </div>
  );
}

function ConfirmSheet({
  phone,
  network,
  networkColor,
  plan,
  cashback,
  onClose,
  onConfirm,
}: {
  phone: string;
  network: string;
  networkColor: string;
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
          <h3 className="font-display font-bold text-base">Confirm data plan</h3>
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
          <Row label="Plan" value={`${plan.size} · ${plan.validity}`} />
          <Row label="Phone" value={phone} />
          <Row
            label="Network"
            value={
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: networkColor }} />
                {network}
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
            Pay now <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function SuccessSheet({
  plan,
  phone,
  networkName,
  cashback,
  onDone,
}: {
  plan: Plan;
  phone: string;
  networkName: string;
  cashback: number;
  onDone: () => void;
}) {
  const ref = `BZP-DAT-${Math.floor(Math.random() * 90000 + 10000)}`;
  return (
    <div className="fixed inset-0 z-[80] flex items-end">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200" />
      <div className="relative w-full bg-card text-card-foreground rounded-t-[2rem] pt-3 pb-8 animate-in slide-in-from-bottom duration-300">
        <div className="w-10 h-1 rounded-full bg-card-foreground/15 mx-auto" />
        <div className="px-6 mt-6 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-success/15 text-success flex items-center justify-center">
            <Check className="w-7 h-7" strokeWidth={3} />
          </div>
          <h3 className="font-display font-bold text-xl mt-4">Data activated</h3>
          <p className="text-[12px] text-card-foreground/55 mt-1">
            {plan.size} · {plan.validity} · {networkName}
          </p>
          <p className="text-[12px] text-card-foreground/55">{phone}</p>
          {cashback > 0 && (
            <p className="text-[11px] text-success font-semibold mt-2">
              +₦{cashback} cashback added to wallet
            </p>
          )}
        </div>

        <div className="mx-6 mt-5 rounded-2xl bg-card-foreground/[0.04] px-4 py-3 flex items-center justify-between">
          <p className="text-[12px] text-card-foreground/55">Reference</p>
          <p className="text-[13px] font-semibold">{ref}</p>
        </div>

        <div className="px-6 mt-5 grid grid-cols-2 gap-2">
          <Link
            to="/pay/data"
            className="h-12 rounded-full bg-card-foreground/[0.06] flex items-center justify-center font-bold text-sm"
          >
            Buy again
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
    <div className="flex items-center gap-3 px-4 py-3.5">
      <p className="text-[12px] text-card-foreground/55 flex-1">{label}</p>
      <p className="text-[13px] font-semibold text-right">{value}</p>
    </div>
  );
}
