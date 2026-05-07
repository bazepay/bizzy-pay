import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Copy,
  Sparkles,
  X,
  Zap,
  ShieldCheck,
} from "lucide-react";

export const Route = createFileRoute("/_app/pay/electricity")({
  head: () => ({
    meta: [
      { title: "Pay electricity · BazePay" },
      { name: "description", content: "Buy prepaid tokens or pay postpaid bills for any DisCo in seconds." },
    ],
  }),
  component: ElectricityPage,
});

type Disco = {
  id: string;
  name: string;
  short: string;
  region: string;
  color: string;
};

const discos: Disco[] = [
  { id: "ikedc", name: "Ikeja Electric", short: "IKEDC", region: "Lagos · Ikeja", color: "#F4B400" },
  { id: "ekedc", name: "Eko Electric", short: "EKEDC", region: "Lagos · Eko", color: "#1E88E5" },
  { id: "aedc", name: "Abuja Electric", short: "AEDC", region: "FCT · Abuja", color: "#7E57C2" },
  { id: "phed", name: "Port Harcourt Electric", short: "PHED", region: "Rivers · PH", color: "#26A69A" },
  { id: "ibedc", name: "Ibadan Electric", short: "IBEDC", region: "Oyo · Ibadan", color: "#EF5350" },
  { id: "kedco", name: "Kano Electric", short: "KEDCO", region: "Kano", color: "#66BB6A" },
  { id: "eedc", name: "Enugu Electric", short: "EEDC", region: "Enugu", color: "#FF7043" },
  { id: "bedc", name: "Benin Electric", short: "BEDC", region: "Edo · Benin", color: "#42A5F5" },
];

const presets = [1000, 2000, 5000, 10000, 20000, 50000];

const recents = [
  { meter: "0123456789", disco: "ikedc", label: "Home · Ikeja", type: "Prepaid" },
  { meter: "5544332211", disco: "ekedc", label: "Shop · Lekki", type: "Prepaid" },
  { meter: "9988776655", disco: "aedc", label: "Office · Wuse", type: "Postpaid" },
];

function ElectricityPage() {
  const navigate = useNavigate();
  const [discoId, setDiscoId] = useState<string>("ikedc");
  const [meter, setMeter] = useState("");
  const [type, setType] = useState<"Prepaid" | "Postpaid">("Prepaid");
  const [amount, setAmount] = useState<number | null>(null);
  const [custom, setCustom] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [success, setSuccess] = useState(false);

  const disco = discos.find((d) => d.id === discoId)!;
  const finalAmount = amount ?? (custom ? Number(custom) : 0);
  const meterDigits = meter.replace(/\D/g, "");
  const verified = meterDigits.length >= 10;
  const valid = verified && finalAmount >= 500;
  const cashback = Math.floor(finalAmount * 0.005);

  const customer = useMemo(() => {
    if (!verified) return null;
    const names = ["Ade Okafor", "Chidi Eze", "Funke Ade", "Bola Ojo"];
    return names[meterDigits.charCodeAt(0) % names.length];
  }, [verified, meterDigits]);

  const tokenUnits = (finalAmount / 56).toFixed(1);

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
          <h1 className="font-display text-xl font-bold tracking-tight">Pay electricity</h1>
          <p className="text-[11px] text-foreground/50">Instant tokens · 0.5% cashback</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-service-electricity/15 text-service-electricity flex items-center justify-center">
          <Zap className="w-4 h-4" />
        </div>
      </div>

      {/* Hero summary */}
      <div className="px-6 mt-5">
        <div
          className="rounded-3xl p-5 transition-colors border"
          style={{
            background: verified
              ? `linear-gradient(135deg, ${disco.color}, color-mix(in oklab, ${disco.color} 70%, #000))`
              : "color-mix(in oklab, var(--foreground) 6%, transparent)",
            borderColor: verified
              ? "transparent"
              : "color-mix(in oklab, var(--foreground) 10%, transparent)",
            color: verified ? "#FFFFFF" : "var(--foreground)",
          }}
        >
          <div className="flex items-center justify-between">
            <span
              className="text-[11px] font-bold uppercase tracking-[0.18em]"
              style={{ opacity: verified ? 0.85 : 0.5 }}
            >
              {disco.short} · {type}
            </span>
            <span className="text-[11px] font-bold" style={{ opacity: verified ? 0.85 : 0.5 }}>
              NGN
            </span>
          </div>
          <p className="font-display text-4xl font-bold tracking-tight mt-3">
            ₦{finalAmount ? finalAmount.toLocaleString() : "0"}
          </p>
          <p className="text-[12px] mt-1" style={{ opacity: verified ? 0.85 : 0.55 }}>
            {verified
              ? `${customer} · ${type === "Prepaid" ? `≈ ${tokenUnits} units` : "Pay outstanding bill"}`
              : "Enter meter number to continue"}
          </p>
        </div>
      </div>

      <div className="flex-1 mt-6 bg-card text-card-foreground rounded-t-[2rem] px-6 pt-6 pb-32 space-y-6">
        {/* DisCo picker */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-card-foreground/50 mb-2 px-1">
            Distributor
          </p>
          <div className="grid grid-cols-2 gap-2">
            {discos.map((d) => {
              const sel = d.id === discoId;
              return (
                <button
                  key={d.id}
                  onClick={() => setDiscoId(d.id)}
                  className={`relative h-16 rounded-2xl px-3 flex items-center gap-3 transition overflow-hidden ${
                    sel
                      ? "bg-card-foreground/[0.06] ring-1 ring-inset"
                      : "bg-card-foreground/[0.03] hover:bg-card-foreground/[0.05]"
                  }`}
                  style={sel ? { boxShadow: `inset 0 0 0 1.5px ${d.color}` } : undefined}
                >
                  <span
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-[11px] font-bold shrink-0"
                    style={{
                      background: `color-mix(in oklab, ${d.color} 22%, transparent)`,
                      color: d.color,
                    }}
                  >
                    {d.short.slice(0, 2)}
                  </span>
                  <div className="text-left min-w-0">
                    <p className="text-[12px] font-bold leading-tight truncate">{d.short}</p>
                    <p className="text-[10px] text-card-foreground/55 leading-tight truncate">
                      {d.region}
                    </p>
                  </div>
                  {sel && (
                    <span
                      className="absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center"
                      style={{ background: d.color }}
                    >
                      <Check className="w-2.5 h-2.5 text-white" strokeWidth={3.5} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Meter type */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-card-foreground/50 mb-2 px-1">
            Meter type
          </p>
          <div className="grid grid-cols-2 gap-2">
            {(["Prepaid", "Postpaid"] as const).map((t) => {
              const sel = type === t;
              return (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`h-12 rounded-2xl text-sm font-bold transition ${
                    sel ? "bg-primary text-primary-foreground" : "bg-card-foreground/[0.04] text-card-foreground/85"
                  }`}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>

        {/* Meter number */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-card-foreground/50 mb-2 px-1">
            Meter number
          </p>
          <div className="relative">
            <input
              value={meter}
              onChange={(e) => setMeter(e.target.value.replace(/\D/g, "").slice(0, 13))}
              placeholder="e.g. 0123456789"
              inputMode="numeric"
              className="w-full h-14 rounded-2xl bg-card-foreground/[0.04] pl-4 pr-12 text-base font-semibold tracking-wide outline-none focus:bg-card-foreground/[0.06]"
            />
            {meter && (
              <button
                onClick={() => setMeter("")}
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
              <span className="text-card-foreground/55">verified · {disco.short}</span>
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
                    sel ? "bg-primary text-primary-foreground" : "bg-card-foreground/[0.04] text-card-foreground/85"
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
            placeholder="Custom (₦500 – ₦200,000)"
            inputMode="numeric"
            className="mt-2 w-full h-12 rounded-2xl bg-card-foreground/[0.04] px-4 text-sm font-semibold outline-none focus:bg-card-foreground/[0.06]"
          />
        </div>

        {/* Recents */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-card-foreground/50 mb-2 px-1">
            Saved meters
          </p>
          <div className="rounded-2xl bg-card-foreground/[0.04] divide-y divide-card-foreground/[0.06] overflow-hidden">
            {recents.map((r) => {
              const d = discos.find((x) => x.id === r.disco)!;
              return (
                <button
                  key={r.meter}
                  onClick={() => {
                    setMeter(r.meter);
                    setDiscoId(r.disco);
                    setType(r.type as "Prepaid" | "Postpaid");
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left active:bg-card-foreground/[0.06]"
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-[10px] font-bold"
                    style={{
                      background: `color-mix(in oklab, ${d.color} 18%, transparent)`,
                      color: d.color,
                    }}
                  >
                    {d.short.slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{r.label}</p>
                    <p className="text-[11px] text-card-foreground/55">
                      {d.short} · {r.meter}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-card-foreground/[0.06] text-card-foreground/70">
                    {r.type}
                  </span>
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
          {finalAmount > 0
            ? `Pay ₦${finalAmount.toLocaleString()}`
            : "Pay electricity"}
        </button>
      </div>

      {confirm && !success && (
        <ConfirmSheet
          meter={meter}
          customer={customer ?? ""}
          discoName={disco.name}
          discoColor={disco.color}
          type={type}
          amount={finalAmount}
          cashback={cashback}
          tokenUnits={tokenUnits}
          onClose={() => setConfirm(false)}
          onConfirm={() => setSuccess(true)}
        />
      )}

      {success && (
        <SuccessSheet
          amount={finalAmount}
          meter={meter}
          customer={customer ?? ""}
          discoName={disco.name}
          type={type}
          cashback={cashback}
          onDone={() => navigate({ to: "/wallet" })}
        />
      )}
    </div>
  );
}

function ConfirmSheet({
  meter,
  customer,
  discoName,
  discoColor,
  type,
  amount,
  cashback,
  tokenUnits,
  onClose,
  onConfirm,
}: {
  meter: string;
  customer: string;
  discoName: string;
  discoColor: string;
  type: string;
  amount: number;
  cashback: number;
  tokenUnits: string;
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
          <h3 className="font-display font-bold text-base">Confirm payment</h3>
          <p className="text-[11px] text-card-foreground/55 mt-0.5">Review before paying</p>
        </div>

        <div className="px-6 mt-5 flex flex-col items-center">
          <p className="text-[11px] text-card-foreground/55">You'll pay</p>
          <p className="font-display text-3xl font-bold mt-1">₦{amount.toLocaleString()}</p>
          {cashback > 0 && (
            <span className="mt-2 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-success/15 text-success text-[10px] font-bold uppercase tracking-wider">
              <Sparkles className="w-3 h-3" /> +₦{cashback} cashback
            </span>
          )}
        </div>

        <div className="mx-6 mt-5 rounded-2xl bg-card-foreground/[0.04] divide-y divide-card-foreground/[0.06] overflow-hidden">
          <Row label="Customer" value={customer} />
          <Row label="Meter" value={meter} />
          <Row
            label="Distributor"
            value={
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: discoColor }} />
                {discoName}
              </span>
            }
          />
          <Row label="Type" value={type} />
          {type === "Prepaid" && <Row label="Est. units" value={`${tokenUnits} kWh`} />}
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
  amount,
  meter,
  customer,
  discoName,
  type,
  cashback,
  onDone,
}: {
  amount: number;
  meter: string;
  customer: string;
  discoName: string;
  type: string;
  cashback: number;
  onDone: () => void;
}) {
  const ref = `BZP-PWR-${Math.floor(Math.random() * 90000 + 10000)}`;
  const token =
    type === "Prepaid"
      ? `${Math.floor(Math.random() * 9000 + 1000)}-${Math.floor(Math.random() * 9000 + 1000)}-${Math.floor(
          Math.random() * 9000 + 1000,
        )}-${Math.floor(Math.random() * 9000 + 1000)}-${Math.floor(Math.random() * 9000 + 1000)}`
      : null;

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
            ₦{amount.toLocaleString()} · {discoName} · {customer}
          </p>
          {cashback > 0 && (
            <p className="text-[11px] text-success font-semibold mt-2">
              +₦{cashback} cashback added to wallet
            </p>
          )}
        </div>

        {token && (
          <div className="mx-6 mt-5 rounded-2xl bg-service-electricity/10 border border-service-electricity/20 px-4 py-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-card-foreground/55">
              Prepaid token
            </p>
            <div className="mt-1.5 flex items-center justify-between gap-2">
              <p className="font-display text-lg font-bold tracking-wider">{token}</p>
              <button
                onClick={() => navigator.clipboard?.writeText(token.replace(/-/g, ""))}
                className="w-9 h-9 rounded-full bg-card-foreground/[0.06] flex items-center justify-center"
                aria-label="Copy token"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-[10px] text-card-foreground/55 mt-1">Meter {meter}</p>
          </div>
        )}

        <div className="mx-6 mt-3 rounded-2xl bg-card-foreground/[0.04] px-4 py-3 flex items-center justify-between">
          <p className="text-[12px] text-card-foreground/55">Reference</p>
          <p className="text-[13px] font-semibold">{ref}</p>
        </div>

        <div className="px-6 mt-5 grid grid-cols-2 gap-2">
          <Link
            to="/pay/electricity"
            onClick={(e) => {
              e.preventDefault();
              window.location.reload();
            }}
            className="h-12 rounded-full bg-card-foreground/[0.06] flex items-center justify-center font-bold text-sm"
          >
            Pay again
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
