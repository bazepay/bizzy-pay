import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Contact,
  Phone,
  Sparkles,
  X,
} from "lucide-react";
import { usePinGate } from "@/components/pin-prompt";

export const Route = createFileRoute("/_app/pay/airtime")({
  head: () => ({
    meta: [
      { title: "Buy airtime · BazePay" },
      { name: "description", content: "Top up MTN, Glo, Airtel and 9mobile in seconds." },
    ],
  }),
  component: AirtimePage,
});

const networks = [
  { id: "mtn", name: "MTN", color: "#FFCC00", textColor: "#1B1B1B", prefixes: ["0803", "0806", "0813", "0816", "0903", "0906"] },
  { id: "glo", name: "Glo", color: "#00A859", textColor: "#FFFFFF", prefixes: ["0805", "0807", "0815", "0811", "0905"] },
  { id: "airtel", name: "Airtel", color: "#E40000", textColor: "#FFFFFF", prefixes: ["0802", "0808", "0812", "0701", "0902", "0907"] },
  { id: "9mobile", name: "9mobile", color: "#006F3C", textColor: "#FFFFFF", prefixes: ["0809", "0817", "0818", "0908", "0909"] },
];

const presets = [100, 200, 500, 1000, 2000, 5000];

const recents = [
  { name: "Mum", phone: "0803 555 0142", network: "mtn", initials: "M", bg: "#FFE4D6", color: "#E07A4F" },
  { name: "Tunde", phone: "0809 221 9087", network: "9mobile", initials: "T", bg: "#D6F5E3", color: "#0F8C5A" },
  { name: "Self", phone: "0805 117 3344", network: "glo", initials: "Y", bg: "#E0E7FF", color: "#5B4DFF" },
];

function detectNetwork(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 4) return null;
  const prefix = digits.startsWith("234") ? "0" + digits.slice(3, 6) : digits.slice(0, 4);
  const hit = networks.find((n) => n.prefixes.includes(prefix));
  return hit?.id ?? null;
}

function formatPhone(raw: string) {
  const d = raw.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 4) return d;
  if (d.length <= 7) return `${d.slice(0, 4)} ${d.slice(4)}`;
  return `${d.slice(0, 4)} ${d.slice(4, 7)} ${d.slice(7)}`;
}

function AirtimePage() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [network, setNetwork] = useState<string>("mtn");
  const [autoNet, setAutoNet] = useState(true);
  const [amount, setAmount] = useState<number | null>(null);
  const [custom, setCustom] = useState("");
  const [savePin, setSavePin] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [success, setSuccess] = useState(false);
  const { requirePin, pinGate } = usePinGate({ subtitle: "Authorise airtime purchase" });

  const detected = useMemo(() => detectNetwork(phone), [phone]);
  const activeNet = autoNet && detected ? detected : network;
  const net = networks.find((n) => n.id === activeNet)!;
  const finalAmount = amount ?? (custom ? Number(custom) : 0);
  const valid = phone.replace(/\D/g, "").length >= 10 && finalAmount >= 50;
  const cashback = Math.floor(finalAmount * 0.02);

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
          <h1 className="font-display text-xl font-bold tracking-tight">Buy airtime</h1>
          <p className="text-[11px] text-foreground/50">Instant top-up · 2% cashback</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-service-airtime/15 text-service-airtime flex items-center justify-center">
          <Phone className="w-4 h-4" />
        </div>
      </div>

      {/* Hero preview */}
      <div className="px-6 mt-5">
        <div
          className="rounded-3xl p-5 transition-colors"
          style={{ backgroundColor: net.color, color: net.textColor }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] opacity-80">
              {net.name} airtime
            </span>
            <span className="text-[11px] font-bold opacity-80">NGN</span>
          </div>
          <p className="font-display text-4xl font-bold tracking-tight mt-3">
            ₦{finalAmount ? finalAmount.toLocaleString() : "0"}
          </p>
          <p className="text-[12px] opacity-80 mt-1">
            {phone ? formatPhone(phone) : "Enter a phone number"}
          </p>
        </div>
      </div>

      <div className="flex-1 mt-6 bg-card text-card-foreground rounded-t-[2rem] px-6 pt-6 pb-32 space-y-6">
        {/* Phone input */}
        <div>
          <div className="flex items-center justify-between mb-2 px-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-card-foreground/50">
              Phone number
            </p>
            <button
              type="button"
              onClick={() => toast.info("Contacts access not available in demo")}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary"
            >
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
              <button
                onClick={() => setAutoNet(false)}
                className="font-semibold text-primary"
              >
                change
              </button>
            </p>
          )}
        </div>

        {/* Network picker */}
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
                    }}
                    className={`h-16 rounded-2xl flex flex-col items-center justify-center gap-1.5 text-[11px] font-semibold transition ${
                      sel
                        ? "bg-card-foreground text-card"
                        : "bg-card-foreground/[0.04] text-card-foreground/85"
                    }`}
                  >
                    <span
                      className="w-6 h-6 rounded-full"
                      style={{ background: n.color }}
                    />
                    {n.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Amount presets */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-card-foreground/50 mb-2 px-1">
            Quick amount
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
            value={custom}
            onChange={(e) => {
              setCustom(e.target.value.replace(/\D/g, ""));
              setAmount(null);
            }}
            placeholder="Custom (₦50 – ₦50,000)"
            inputMode="numeric"
            className="mt-2 w-full h-12 rounded-2xl bg-card-foreground/[0.04] px-4 text-sm font-semibold outline-none focus:bg-card-foreground/[0.06]"
          />
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

        {/* Save toggle */}
        <button
          onClick={() => setSavePin(!savePin)}
          className="w-full flex items-center gap-3 rounded-2xl bg-card-foreground/[0.04] px-4 py-3"
        >
          <div
            className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${
              savePin ? "bg-primary border-primary" : "border-card-foreground/30"
            }`}
          >
            {savePin && <Check className="w-3 h-3 text-primary-foreground" strokeWidth={3} />}
          </div>
          <p className="text-[12px] font-medium text-card-foreground/80 text-left flex-1">
            Save as a quick recharge for one-tap top-ups
          </p>
        </button>
      </div>

      {/* Footer CTA */}
      <div className="absolute bottom-0 left-0 right-0 px-4 pb-5 pt-3 bg-gradient-to-t from-card via-card to-transparent">
        <button
          disabled={!valid}
          onClick={() => setConfirm(true)}
          className="w-full h-12 rounded-full bg-primary text-primary-foreground font-bold text-sm disabled:opacity-40 active:scale-[0.99] transition flex items-center justify-center gap-2"
        >
          {finalAmount > 0
            ? `Buy ₦${finalAmount.toLocaleString()} airtime`
            : "Buy airtime"}
        </button>
      </div>

      {confirm && !success && (
        <ConfirmSheet
          phone={formatPhone(phone)}
          network={net.name}
          networkColor={net.color}
          amount={finalAmount}
          cashback={cashback}
          onClose={() => setConfirm(false)}
          onConfirm={() => {
            setConfirm(false);
            requirePin(() => setSuccess(true));
          }}
        />
      )}
      {pinGate}

      {success && (
        <SuccessSheet
          amount={finalAmount}
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
  amount,
  cashback,
  onClose,
  onConfirm,
}: {
  phone: string;
  network: string;
  networkColor: string;
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
  amount,
  phone,
  networkName,
  cashback,
  onDone,
}: {
  amount: number;
  phone: string;
  networkName: string;
  cashback: number;
  onDone: () => void;
}) {
  const ref = `BZP-AIR-${Math.floor(Math.random() * 90000 + 10000)}`;
  return (
    <div className="fixed inset-0 z-[80] flex items-end">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200" />
      <div className="relative w-full bg-card text-card-foreground rounded-t-[2rem] pt-3 pb-8 animate-in slide-in-from-bottom duration-300">
        <div className="w-10 h-1 rounded-full bg-card-foreground/15 mx-auto" />
        <div className="px-6 mt-6 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-success/15 text-success flex items-center justify-center">
            <Check className="w-7 h-7" strokeWidth={3} />
          </div>
          <h3 className="font-display font-bold text-xl mt-4">Airtime sent</h3>
          <p className="text-[12px] text-card-foreground/55 mt-1">
            ₦{amount.toLocaleString()} · {networkName} · {phone}
          </p>
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
            to="/pay/airtime"
            onClick={(e) => {
              e.preventDefault();
              window.location.reload();
            }}
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
