import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  ChevronDown,
  Copy,
  Sparkles,
  X,
  Zap,
  ShieldCheck,
  AlertCircle,
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

// per-DisCo prepaid tariff (₦ per kWh, Band A approx. 2024)
const tariffs: Record<string, number> = {
  ikedc: 209, ekedc: 206, aedc: 225, phed: 213,
  ibedc: 209, kedco: 218, eedc: 211, bedc: 216,
};

const presets = [1000, 2000, 5000, 10000, 20000, 50000];

const recents = [
  { meter: "0123456789", disco: "ikedc", label: "Home · Ikeja", type: "Prepaid" },
  { meter: "5544332211", disco: "ekedc", label: "Shop · Lekki", type: "Prepaid" },
  { meter: "9988776655", disco: "aedc", label: "Office · Wuse", type: "Postpaid" },
];

function ElectricityPage() {
  const navigate = useNavigate();
  const [discoId, setDiscoId] = useState<string>("ikedc");
  const [discoTouched, setDiscoTouched] = useState(false);
  const [discoOpen, setDiscoOpen] = useState(false);
  const [meter, setMeter] = useState("");
  const [type, setType] = useState<"Prepaid" | "Postpaid">("Prepaid");
  const [amount, setAmount] = useState<number | null>(null);
  const [custom, setCustom] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [success, setSuccess] = useState(false);

  const disco = discos.find((d) => d.id === discoId)!;
  const finalAmount = amount ?? (custom ? Number(custom) : 0);
  const meterDigits = meter.replace(/\D/g, "");
  const meterLooksValid = meterDigits.length >= 10;
  const meterFailed = meterDigits.length >= 10 && meterDigits.endsWith("0000");
  const verified = meterLooksValid && !meterFailed;
  const valid = verified && finalAmount >= 500;
  const cashback = Math.floor(finalAmount * 0.005);

  useEffect(() => {
    if (discoTouched || meterDigits.length < 4) return;
    const prefix = meterDigits.slice(0, 2);
    const map: Record<string, string> = {
      "01": "ikedc", "02": "ekedc", "03": "aedc", "04": "phed",
      "05": "ibedc", "06": "kedco", "07": "eedc", "08": "bedc",
      "55": "ekedc", "99": "aedc",
    };
    if (map[prefix] && map[prefix] !== discoId) setDiscoId(map[prefix]);
  }, [meterDigits, discoTouched, discoId]);

  const customer = useMemo(() => {
    if (!verified) return null;
    const names = ["Ade Okafor", "Chidi Eze", "Funke Ade", "Bola Ojo"];
    return names[meterDigits.charCodeAt(0) % names.length];
  }, [verified, meterDigits]);

  const rate = tariffs[discoId] ?? 210;
  const tokenUnits = (finalAmount / rate).toFixed(1);

  const pickDisco = (id: string) => {
    setDiscoId(id);
    setDiscoTouched(true);
    setDiscoOpen(false);
  };

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
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{
            background: "color-mix(in oklab, var(--service-electricity) 22%, transparent)",
            color: "var(--service-electricity)",
          }}
        >
          <Zap className="w-4 h-4" />
        </div>
      </div>

      {!verified && (
        <div className="px-6 mt-5">
          <div className="rounded-2xl border border-foreground/10 bg-foreground/[0.04] px-4 py-3 flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{
                background: "color-mix(in oklab, var(--service-electricity) 18%, transparent)",
                color: "var(--service-electricity)",
              }}
            >
              <Zap className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold leading-tight">
                {meterFailed ? "Meter not found" : "Enter your meter to begin"}
              </p>
              <p className="text-[10px] text-foreground/55 leading-tight mt-0.5">
                {meterFailed
                  ? "Double-check the number or pick a saved meter"
                  : "We'll auto-detect your distributor"}
              </p>
            </div>
          </div>
        </div>
      )}

      {verified && (
        <div className="px-6 mt-5">
          <div
            className="rounded-3xl p-5 transition-all"
            style={{
              background: `linear-gradient(135deg, ${disco.color}, color-mix(in oklab, ${disco.color} 65%, #000))`,
              color: "#FFFFFF",
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] opacity-85">
                {disco.short} · {type}
              </span>
              <span className="text-[11px] font-bold opacity-85">VERIFIED</span>
            </div>
            <p className="font-display text-3xl font-bold tracking-tight mt-2">
              {customer}
            </p>
            <p className="text-[12px] opacity-85 mt-0.5">
              Meter {meterDigits}
            </p>
          </div>
        </div>
      )}

      <div className="flex-1 mt-6 bg-card text-card-foreground rounded-t-[2rem] px-6 pt-6 pb-32 space-y-6">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-card-foreground/50 mb-2 px-1">
            Saved meters
          </p>
          <div className="flex gap-2 overflow-x-auto -mx-6 px-6 pb-1 scrollbar-none">
            {recents.map((r) => {
              const d = discos.find((x) => x.id === r.disco)!;
              const sel = meter === r.meter;
              return (
                <button
                  key={r.meter}
                  onClick={() => {
                    setMeter(r.meter);
                    setDiscoId(r.disco);
                    setDiscoTouched(true);
                    setType(r.type as "Prepaid" | "Postpaid");
                  }}
                  className={`shrink-0 w-40 rounded-2xl p-3 text-left transition ${
                    sel
                      ? "bg-card-foreground/[0.08] ring-1 ring-card-foreground/20"
                      : "bg-card-foreground/[0.04]"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold"
                      style={{
                        background: `color-mix(in oklab, ${d.color} 22%, transparent)`,
                        color: d.color,
                      }}
                    >
                      {d.short.slice(0, 2)}
                    </span>
                    <span className="text-[10px] text-card-foreground/55 font-semibold">
                      {r.type}
                    </span>
                  </div>
                  <p className="text-[13px] font-bold mt-2 truncate">{r.label}</p>
                  <p className="text-[10px] text-card-foreground/55 truncate">{r.meter}</p>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-card-foreground/50 mb-1.5 px-1">
            Meter number
          </label>
          <div className="rounded-2xl bg-card-foreground/[0.04] px-4 py-3">
            <div className="relative">
              <input
                value={meter}
                onChange={(e) => setMeter(e.target.value.replace(/\D/g, "").slice(0, 13))}
                placeholder="0123456789"
                inputMode="numeric"
                aria-invalid={meterFailed}
                className="w-full h-9 bg-transparent pr-9 text-lg font-semibold tracking-wide outline-none placeholder:text-card-foreground/30"
              />
              {meter && (
                <button
                  onClick={() => setMeter("")}
                  className="absolute right-0 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-card-foreground/10 flex items-center justify-center"
                  aria-label="Clear"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="mt-2 pt-2 border-t border-card-foreground/[0.06] flex items-center justify-between gap-2">
              <button
                onClick={() => setDiscoOpen(true)}
                className="flex items-center gap-2 min-w-0"
              >
                <span
                  className="w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-bold shrink-0"
                  style={{
                    background: `color-mix(in oklab, ${disco.color} 22%, transparent)`,
                    color: disco.color,
                  }}
                >
                  {disco.short.slice(0, 2)}
                </span>
                <span className="text-[12px] font-semibold truncate">{disco.short}</span>
                <ChevronDown className="w-3.5 h-3.5 text-card-foreground/50 shrink-0" />
              </button>

              {verified && customer ? (
                <span className="inline-flex items-center gap-1 text-[11px] text-success font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {customer}
                </span>
              ) : meterFailed ? (
                <span className="inline-flex items-center gap-1 text-[11px] text-destructive font-semibold">
                  <AlertCircle className="w-3.5 h-3.5" /> Not found
                </span>
              ) : (
                <span className="text-[11px] text-card-foreground/45">
                  {meterDigits.length}/10
                </span>
              )}
            </div>
          </div>
        </div>

        {verified && (
          <div className="flex p-1 rounded-full bg-card-foreground/[0.06]">
            {(["Prepaid", "Postpaid"] as const).map((t) => {
              const sel = type === t;
              return (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`flex-1 h-9 rounded-full text-[12px] font-bold transition ${
                    sel ? "bg-primary text-primary-foreground shadow-sm" : "text-card-foreground/60"
                  }`}
                >
                  {t}
                </button>
              );
            })}
          </div>
        )}

        {verified && (
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-card-foreground/50 mb-2 px-1">
              {type === "Postpaid" ? "Outstanding bill" : "Amount"}
            </label>

            {type === "Postpaid" ? (
              <div className="rounded-2xl bg-card-foreground/[0.04] p-4 space-y-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-[12px] text-card-foreground/55">Balance due</span>
                  <span className="font-display text-2xl font-bold">₦12,430</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setAmount(12430);
                      setCustom("");
                    }}
                    className={`h-10 rounded-full text-[12px] font-bold transition ${
                      amount === 12430
                        ? "bg-primary text-primary-foreground"
                        : "bg-card-foreground/[0.06] text-card-foreground/85"
                    }`}
                  >
                    Pay full
                  </button>
                  <input
                    value={custom}
                    onChange={(e) => {
                      setCustom(e.target.value.replace(/\D/g, ""));
                      setAmount(null);
                    }}
                    placeholder="Other amount"
                    inputMode="numeric"
                    className="h-10 rounded-full bg-card-foreground/[0.06] px-4 text-[12px] font-semibold outline-none placeholder:text-card-foreground/40"
                  />
                </div>
              </div>
            ) : (
              <>
                <div className="rounded-2xl bg-card-foreground/[0.04] px-5 py-5">
                  <div className="flex items-end gap-2">
                    <span className="font-display text-3xl font-bold text-card-foreground/55">
                      ₦
                    </span>
                    <input
                      value={custom || (amount ? String(amount) : "")}
                      onChange={(e) => {
                        setCustom(e.target.value.replace(/\D/g, ""));
                        setAmount(null);
                      }}
                      placeholder="0"
                      inputMode="numeric"
                      className="flex-1 min-w-0 bg-transparent font-display text-3xl font-bold tracking-tight outline-none placeholder:text-card-foreground/25"
                    />
                  </div>
                  {finalAmount > 0 && (
                    <p className="text-[11px] text-card-foreground/55 mt-1">
                      ≈ {tokenUnits} kWh · est. at ₦{rate}/kWh
                    </p>
                  )}
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {presets.map((a) => {
                    const sel = amount === a;
                    return (
                      <button
                        key={a}
                        onClick={() => {
                          setAmount(a);
                          setCustom("");
                        }}
                        className={`h-8 px-3 rounded-full text-[12px] font-semibold transition ${
                          sel
                            ? "bg-primary text-primary-foreground"
                            : "bg-card-foreground/[0.06] text-card-foreground/75"
                        }`}
                      >
                        ₦{a >= 1000 ? `${a / 1000}k` : a}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 px-4 pb-5 pt-3 bg-gradient-to-t from-card via-card to-transparent">
        <button
          disabled={!valid}
          onClick={() => setConfirm(true)}
          className="w-full py-2.5 rounded-full bg-primary text-primary-foreground font-bold text-sm disabled:opacity-40 active:scale-[0.99] transition flex flex-col items-center justify-center gap-0.5 min-h-[3rem]"
        >
          <span>
            {finalAmount > 0
              ? `Pay ₦${finalAmount.toLocaleString()}`
              : "Pay electricity"}
          </span>
          {valid && cashback > 0 && (
            <span className="text-[10px] font-semibold opacity-80">
              +₦{cashback} cashback
            </span>
          )}
        </button>
      </div>

      {discoOpen && (
        <div className="fixed inset-0 z-[60] flex items-end" onClick={() => setDiscoOpen(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" />
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full bg-card text-card-foreground rounded-t-[2rem] pt-3 pb-6 animate-in slide-in-from-bottom duration-300"
          >
            <div className="w-10 h-1 rounded-full bg-card-foreground/15 mx-auto" />
            <div className="px-6 mt-4 mb-3">
              <h3 className="font-display font-bold text-base">Choose distributor</h3>
              <p className="text-[11px] text-card-foreground/55 mt-0.5">Pick the DisCo on your bill</p>
            </div>
            <div className="px-6 grid grid-cols-2 gap-2 max-h-[60vh] overflow-y-auto">
              {discos.map((d) => {
                const sel = d.id === discoId;
                return (
                  <button
                    key={d.id}
                    onClick={() => pickDisco(d.id)}
                    className={`relative h-16 rounded-2xl px-3 flex items-center gap-3 transition ${
                      sel ? "bg-card-foreground/[0.08]" : "bg-card-foreground/[0.04]"
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
        </div>
      )}

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
