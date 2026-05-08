import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Check, ShieldCheck, Sparkles } from "lucide-react";
import { VirtualCardArt } from "@/components/virtual-card";
import type { CardCurrency, CardBrand, VirtualCard } from "@/lib/cards";
import { formatUsd } from "@/lib/cards";

export const Route = createFileRoute("/_app/cards/new")({
  head: () => ({
    meta: [
      { title: "Issue Card · BazePay" },
      { name: "description", content: "Issue a new virtual Visa or Mastercard." },
    ],
  }),
  component: NewCardPage,
});

const presetAmounts = [10, 25, 50, 100, 250];

const themes: { id: string; from: string; to: string; label: string }[] = [
  { id: "indigo", from: "oklch(0.32 0.14 270)", to: "oklch(0.22 0.12 300)", label: "Midnight" },
  { id: "gold", from: "oklch(0.28 0.10 240)", to: "oklch(0.45 0.16 60)", label: "Aurum" },
  { id: "teal", from: "oklch(0.30 0.08 200)", to: "oklch(0.20 0.06 260)", label: "Glacier" },
  { id: "coral", from: "oklch(0.40 0.16 20)", to: "oklch(0.25 0.10 350)", label: "Ember" },
];

function NewCardPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [label, setLabel] = useState("");
  const [currency, setCurrency] = useState<CardCurrency>("USD");
  const [brand, setBrand] = useState<CardBrand>("Visa");
  const [themeId, setThemeId] = useState(themes[0].id);
  const [fund, setFund] = useState<number>(50);
  const [success, setSuccess] = useState(false);

  const theme = themes.find((t) => t.id === themeId)!;
  const previewCard: VirtualCard = {
    id: "preview",
    label: label || "New card",
    holder: "TUNDE OKE",
    brand,
    currency,
    pan: "4539 8211 6094 2207",
    cvv: "•••",
    expiry: "08/29",
    balanceUsd: fund,
    monthlyLimitUsd: 1000,
    monthlySpentUsd: 0,
    status: "active",
    blockedCategories: [],
    gradient: { from: theme.from, to: theme.to },
    createdAt: new Date().toISOString(),
  };

  const issueFee = 1.0;
  const total = fund + issueFee;
  const labelOk = label.trim().length >= 2;

  return (
    <div className="min-h-full bg-background text-foreground flex flex-col">
      <div className="h-10" />
      <div className="px-6 pt-4 flex items-center gap-3">
        <button
          onClick={() => (step === 1 ? navigate({ to: "/cards" }) : setStep((s) => (s - 1) as 1 | 2 | 3))}
          className="w-10 h-10 rounded-full bg-card text-card-foreground flex items-center justify-center"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1">
          <h1 className="font-display text-xl font-bold tracking-tight">Issue card</h1>
          <p className="text-[11px] text-foreground/55">Step {step} of 3</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-primary/15 text-primary flex items-center justify-center">
          <Sparkles className="w-4 h-4" />
        </div>
      </div>

      {/* Progress */}
      <div className="px-6 mt-3">
        <div className="h-1 rounded-full bg-card-foreground/[0.08] overflow-hidden">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </div>

      {/* Preview */}
      <div className="px-6 mt-5">
        <VirtualCardArt card={previewCard} />
      </div>

      <div className="flex-1 mt-6 bg-card text-card-foreground rounded-t-[2rem] px-6 pt-6 pb-32 space-y-6">
        {step === 1 && (
          <>
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
                Currency
              </p>
              <div className="grid grid-cols-3 gap-2">
                {(["NGN", "USD", "EUR"] as CardCurrency[]).map((c) => {
                  const sel = currency === c;
                  return (
                    <button
                      key={c}
                      onClick={() => setCurrency(c)}
                      className={`h-12 rounded-2xl text-sm font-bold transition ${
                        sel
                          ? "bg-primary text-primary-foreground shadow"
                          : "bg-card-foreground/[0.04] text-card-foreground/70"
                      }`}
                    >
                      {c}
                    </button>
                  );
                })}
              </div>
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
                        sel
                          ? "bg-primary text-primary-foreground shadow"
                          : "bg-card-foreground/[0.04] text-card-foreground/70"
                      }`}
                    >
                      {b}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              disabled={!labelOk}
              onClick={() => setStep(2)}
              className="w-full h-12 rounded-full bg-primary text-primary-foreground font-bold text-sm disabled:opacity-40 transition"
            >
              Continue
            </button>
          </>
        )}

        {step === 2 && (
          <>
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
              onClick={() => setStep(3)}
              className="w-full h-12 rounded-full bg-primary text-primary-foreground font-bold text-sm"
            >
              Continue
            </button>
          </>
        )}

        {step === 3 && (
          <>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-card-foreground/50 mb-2 px-1">
                Initial fund (USD)
              </p>
              <div className="grid grid-cols-5 gap-2">
                {presetAmounts.map((a) => {
                  const sel = fund === a;
                  return (
                    <button
                      key={a}
                      onClick={() => setFund(a)}
                      className={`h-11 rounded-2xl text-sm font-bold transition tabular-nums ${
                        sel
                          ? "bg-primary text-primary-foreground"
                          : "bg-card-foreground/[0.04] text-card-foreground/70"
                      }`}
                    >
                      ${a}
                    </button>
                  );
                })}
              </div>
              <input
                type="number"
                min={5}
                value={fund}
                onChange={(e) => setFund(Math.max(0, Number(e.target.value) || 0))}
                className="mt-3 w-full h-14 rounded-2xl bg-card-foreground/[0.04] px-4 text-base font-bold tabular-nums outline-none"
              />
            </div>

            <div className="rounded-2xl bg-card-foreground/[0.04] p-4 space-y-2 text-[12px]">
              <Row label="Initial fund" value={formatUsd(fund)} />
              <Row label="Issue fee" value={formatUsd(issueFee)} />
              <div className="h-px bg-card-foreground/[0.08] my-1" />
              <Row label="Total" value={formatUsd(total)} bold />
            </div>

            <div className="rounded-2xl bg-card-foreground/[0.04] p-4 flex gap-3">
              <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <p className="text-[11px] text-card-foreground/65 leading-relaxed">
                Your card is issued instantly with 3-D Secure protection. Freeze or cancel anytime.
              </p>
            </div>

            <button
              onClick={() => setSuccess(true)}
              disabled={fund < 5}
              className="w-full h-12 rounded-full bg-primary text-primary-foreground font-bold text-sm disabled:opacity-40"
            >
              Issue card · {formatUsd(total)}
            </button>
          </>
        )}
      </div>

      {success && <SuccessSheet card={previewCard} />}
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

function SuccessSheet({ card }: { card: VirtualCard }) {
  return (
    <div className="fixed inset-0 z-[80] flex items-end">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="relative w-full bg-card text-card-foreground rounded-t-[2rem] pt-3 pb-8 animate-in slide-in-from-bottom duration-300">
        <div className="w-10 h-1 rounded-full bg-card-foreground/15 mx-auto" />
        <div className="px-6 mt-6 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-full bg-primary/15 text-primary flex items-center justify-center">
            <Check className="w-7 h-7" strokeWidth={3} />
          </div>
          <h3 className="font-display font-bold text-xl mt-3">Card issued</h3>
          <p className="text-[12px] text-card-foreground/55 mt-1 max-w-[280px]">
            Your {card.label} card is ready to use. Funds are available now.
          </p>
        </div>
        <div className="px-6 mt-6 space-y-2">
          <Link
            to="/cards"
            className="w-full h-12 rounded-full bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center"
          >
            Done
          </Link>
        </div>
      </div>
    </div>
  );
}
