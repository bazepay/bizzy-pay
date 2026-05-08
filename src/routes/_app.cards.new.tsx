import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import {
  ArrowLeft,
  Check,
  ShieldCheck,
  Sparkles,
  CreditCard,
  Lock,
  Zap,
  Globe,
} from "lucide-react";
import { VirtualCardArt } from "@/components/virtual-card";
import type { CardBrand } from "@/lib/cards";
import { formatNgn, ISSUE_FEE_NGN } from "@/lib/cards";
import { issueCard } from "@/lib/cards-store";

export const Route = createFileRoute("/_app/cards/new")({
  head: () => ({
    meta: [
      { title: "Issue Card · BazePay" },
      { name: "description", content: "Issue a Naira virtual card." },
    ],
  }),
  component: NewCardPage,
});

const themes: { id: string; from: string; to: string; label: string }[] = [
  { id: "indigo", from: "oklch(0.32 0.14 270)", to: "oklch(0.22 0.12 300)", label: "Midnight" },
  { id: "gold", from: "oklch(0.28 0.10 240)", to: "oklch(0.45 0.16 60)", label: "Aurum" },
  { id: "teal", from: "oklch(0.30 0.08 200)", to: "oklch(0.20 0.06 260)", label: "Glacier" },
  { id: "coral", from: "oklch(0.40 0.16 20)", to: "oklch(0.25 0.10 350)", label: "Ember" },
];

type Step = "intro" | "details" | "pay" | "issuing" | "success";

function NewCardPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("intro");
  const [label, setLabel] = useState("");
  const [brand, setBrand] = useState<CardBrand>("Visa");
  const [themeId, setThemeId] = useState(themes[0].id);
  const theme = themes.find((t) => t.id === themeId)!;
  const newIdRef = useRef<string | null>(null);

  const labelOk = label.trim().length >= 2;

  const handlePay = () => {
    setStep("issuing");
    setTimeout(() => {
      const card = issueCard({
        label: label.trim(),
        brand,
        gradient: { from: theme.from, to: theme.to },
      });
      newIdRef.current = card.id;
      setStep("success");
    }, 1800);
  };

  const back = () => {
    if (step === "intro") navigate({ to: "/cards" });
    else if (step === "details") setStep("intro");
    else if (step === "pay") setStep("details");
  };

  return (
    <div className="min-h-full bg-background text-foreground flex flex-col">
      <div className="h-10" />
      <div className="px-6 pt-4 flex items-center gap-3">
        {step !== "issuing" && step !== "success" && (
          <button
            onClick={back}
            className="w-10 h-10 rounded-full bg-card text-card-foreground flex items-center justify-center"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}
        <div className="flex-1">
          <h1 className="font-display text-xl font-bold tracking-tight">
            {step === "intro"
              ? "New card"
              : step === "details"
              ? "Customize"
              : step === "pay"
              ? "Pay & issue"
              : step === "issuing"
              ? "Issuing card"
              : "Card issued"}
          </h1>
          <p className="text-[11px] text-foreground/55">
            {step === "intro"
              ? "Naira virtual card"
              : step === "details"
              ? "Step 1 of 2"
              : step === "pay"
              ? "Step 2 of 2"
              : "Hang on a moment"}
          </p>
        </div>
        <div className="w-10 h-10 rounded-full bg-primary/15 text-primary flex items-center justify-center">
          <Sparkles className="w-4 h-4" />
        </div>
      </div>

      {step === "intro" && <IntroScreen onContinue={() => setStep("details")} />}

      {step === "details" && (
        <DetailsScreen
          label={label}
          setLabel={setLabel}
          brand={brand}
          setBrand={setBrand}
          themeId={themeId}
          setThemeId={setThemeId}
          theme={theme}
          labelOk={labelOk}
          onContinue={() => setStep("pay")}
        />
      )}

      {step === "pay" && (
        <PayScreen
          label={label}
          theme={theme}
          brand={brand}
          onPay={handlePay}
        />
      )}

      {(step === "issuing" || step === "success") && (
        <IssuingScreen done={step === "success"} newId={newIdRef.current} />
      )}
    </div>
  );
}

function IntroScreen({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="flex-1 flex flex-col">
      <div className="px-6 mt-5">
        <div
          className="relative aspect-[1.586/1] w-full rounded-3xl overflow-hidden p-6 text-white shadow-[0_20px_60px_-20px_rgba(0,0,0,0.5)] flex flex-col justify-between"
          style={{
            background: "linear-gradient(135deg, oklch(0.32 0.14 270) 0%, oklch(0.22 0.12 300) 100%)",
          }}
        >
          <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full opacity-30 blur-3xl bg-amber-300" />
          <div className="relative flex items-center justify-between">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-80">
              BazePay · Naira
            </div>
            <CreditCard className="w-5 h-5 opacity-80" />
          </div>
          <div className="relative">
            <p className="font-display text-2xl font-bold tracking-tight">
              Spend online, anywhere
            </p>
            <p className="text-[11px] opacity-75 mt-1.5 leading-relaxed max-w-[260px]">
              A virtual Visa or Mastercard funded in Naira. Use it for subscriptions, shopping, ads — instantly.
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 mt-6 bg-card text-card-foreground rounded-t-[2rem] px-6 pt-6 pb-32">
        <h2 className="font-display font-bold text-base">What you get</h2>
        <div className="mt-3 space-y-2">
          <Bullet icon={<Zap className="w-4 h-4" />} title="Instant issuance" desc="Card is ready and funded in seconds after payment." />
          <Bullet icon={<Globe className="w-4 h-4" />} title="Works globally" desc="Accepted everywhere Visa or Mastercard is — online and in-app." />
          <Bullet icon={<Lock className="w-4 h-4" />} title="3-D Secure" desc="Freeze, set spend limits, and block merchant categories anytime." />
        </div>

        <div className="mt-6 rounded-2xl bg-card-foreground/[0.04] p-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-card-foreground/55">
              One-time issue fee
            </p>
            <p className="font-display font-bold text-2xl tabular-nums mt-1">
              {formatNgn(ISSUE_FEE_NGN)}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>

        <p className="text-[11px] text-card-foreground/55 mt-3 leading-relaxed">
          You can fund the card with Naira from your wallet after issuing. Cancel anytime.
        </p>

        <button
          onClick={onContinue}
          className="mt-6 w-full h-12 rounded-full bg-primary text-primary-foreground font-bold text-sm"
        >
          Get started
        </button>
      </div>
    </div>
  );
}

function Bullet({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="rounded-2xl bg-card-foreground/[0.04] p-4 flex items-start gap-3">
      <div className="w-9 h-9 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <p className="font-semibold text-sm">{title}</p>
        <p className="text-[11px] text-card-foreground/55 mt-0.5 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function DetailsScreen({
  label,
  setLabel,
  brand,
  setBrand,
  themeId,
  setThemeId,
  theme,
  labelOk,
  onContinue,
}: {
  label: string;
  setLabel: (s: string) => void;
  brand: CardBrand;
  setBrand: (b: CardBrand) => void;
  themeId: string;
  setThemeId: (id: string) => void;
  theme: { from: string; to: string };
  labelOk: boolean;
  onContinue: () => void;
}) {
  return (
    <>
      <div className="px-6 mt-5">
        <VirtualCardArt
          card={{
            label: label || "New card",
            brand,
            gradient: theme,
          }}
          blank
        />
      </div>

      <div className="flex-1 mt-6 bg-card text-card-foreground rounded-t-[2rem] px-6 pt-6 pb-32 space-y-6">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-card-foreground/50 mb-2 px-1">
            Card name
          </p>
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value.slice(0, 24))}
            placeholder="e.g. Subscriptions"
            className="w-full h-14 rounded-2xl bg-card-foreground/[0.04] px-4 text-base font-semibold tracking-wide outline-none focus:bg-card-foreground/[0.06]"
          />
          <p className="text-[10px] text-card-foreground/45 mt-1.5 px-1">
            Visible only to you. Helps separate spend.
          </p>
        </div>

        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-card-foreground/50 mb-2 px-1">
            Network
          </p>
          <div className="grid grid-cols-2 gap-2">
            {(["Visa", "Mastercard"] as CardBrand[]).map((b) => {
              const sel = brand === b;
              return (
                <button
                  key={b}
                  onClick={() => setBrand(b)}
                  className={`h-12 rounded-2xl text-sm font-bold transition ${
                    sel ? "bg-primary text-primary-foreground shadow" : "bg-card-foreground/[0.04] text-card-foreground/70"
                  }`}
                >
                  {b}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-card-foreground/50 mb-2 px-1">
            Card design
          </p>
          <div className="grid grid-cols-4 gap-2">
            {themes.map((t) => {
              const sel = themeId === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setThemeId(t.id)}
                  className={`relative aspect-[1.4/1] rounded-2xl overflow-hidden transition ${
                    sel ? "ring-2 ring-primary ring-offset-2 ring-offset-card" : ""
                  }`}
                  style={{
                    background: `linear-gradient(135deg, ${t.from} 0%, ${t.to} 100%)`,
                  }}
                >
                  {sel && (
                    <span className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-white text-primary flex items-center justify-center">
                      <Check className="w-3 h-3" strokeWidth={3} />
                    </span>
                  )}
                  <span className="absolute bottom-1.5 left-1.5 text-[9px] font-bold text-white/85 uppercase tracking-wider">
                    {t.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <button
          disabled={!labelOk}
          onClick={onContinue}
          className="w-full h-12 rounded-full bg-primary text-primary-foreground font-bold text-sm disabled:opacity-40 transition"
        >
          Continue
        </button>
      </div>
    </>
  );
}

function PayScreen({
  label,
  theme,
  brand,
  onPay,
}: {
  label: string;
  theme: { from: string; to: string };
  brand: CardBrand;
  onPay: () => void;
}) {
  return (
    <>
      <div className="px-6 mt-5">
        <VirtualCardArt
          card={{ label, brand, gradient: theme }}
          blank
        />
      </div>

      <div className="flex-1 mt-6 bg-card text-card-foreground rounded-t-[2rem] px-6 pt-6 pb-32 space-y-5">
        <div>
          <h2 className="font-display font-bold text-base">Order summary</h2>
          <p className="text-[11px] text-card-foreground/55 mt-1">
            Pay the issue fee to receive your card details.
          </p>
        </div>

        <div className="rounded-2xl bg-card-foreground/[0.04] p-4 space-y-2.5 text-[13px]">
          <Row label="Card name" value={label} />
          <Row label="Network" value={brand} />
          <Row label="Currency" value="NGN" />
          <div className="h-px bg-card-foreground/[0.08] my-1" />
          <Row label="Issue fee" value={formatNgn(ISSUE_FEE_NGN)} />
          <Row label="Total" value={formatNgn(ISSUE_FEE_NGN)} bold />
        </div>

        <div className="rounded-2xl bg-card-foreground/[0.04] p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-card-foreground/55">
            Pay from
          </p>
          <div className="mt-2 flex items-center justify-between">
            <div>
              <p className="font-semibold text-sm">NGN Wallet</p>
              <p className="text-[11px] text-card-foreground/55 tabular-nums">Balance · ₦142,300</p>
            </div>
            <span className="px-2 py-1 rounded-full bg-primary/15 text-primary text-[10px] font-bold uppercase tracking-wider">
              Selected
            </span>
          </div>
        </div>

        <div className="rounded-2xl bg-card-foreground/[0.04] p-4 flex gap-3">
          <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <p className="text-[11px] text-card-foreground/65 leading-relaxed">
            Card details (PAN, CVV, expiry) are generated and shown only after payment is confirmed.
          </p>
        </div>

        <button
          onClick={onPay}
          className="w-full h-12 rounded-full bg-primary text-primary-foreground font-bold text-sm"
        >
          Pay {formatNgn(ISSUE_FEE_NGN)} & issue
        </button>
      </div>
    </>
  );
}

function IssuingScreen({ done }: { done: boolean }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
      <div
        className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
          done ? "bg-primary text-primary-foreground" : "bg-primary/15 text-primary"
        }`}
      >
        {done ? (
          <Check className="w-10 h-10" strokeWidth={3} />
        ) : (
          <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        )}
      </div>
      <h2 className="font-display font-bold text-2xl tracking-tight mt-6">
        {done ? "Card issued" : "Issuing your card"}
      </h2>
      <p className="text-[13px] text-foreground/60 mt-2 max-w-[280px] leading-relaxed">
        {done
          ? "Your card details are ready. Tap below to view PAN, CVV and expiry."
          : "Confirming payment and assigning a fresh PAN — usually under 30 seconds."}
      </p>

      {done && (
        <div className="w-full mt-8 space-y-2">
          <Link
            to="/cards/$id"
            params={{ id: "vc-01" }}
            className="w-full h-12 rounded-full bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center"
          >
            View card details
          </Link>
          <Link
            to="/cards"
            className="w-full h-12 rounded-full bg-card-foreground/[0.06] font-bold text-sm flex items-center justify-center"
          >
            Back to cards
          </Link>
        </div>
      )}
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-card-foreground/60">{label}</span>
      <span className={`tabular-nums ${bold ? "font-bold text-card-foreground" : "text-card-foreground/85"}`}>
        {value}
      </span>
    </div>
  );
}
