import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type ReactElement } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PhoneFrame } from "@/components/phone-frame";
import { ArrowRight, Wifi, Eye, Shield, Sparkles } from "lucide-react";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Welcome — BazePay" },
      { name: "description", content: "Banking, bills and virtual cards built for the Nigerian diaspora." },
    ],
  }),
  component: Onboarding,
});

type Slide = {
  eyebrow: string;
  title: string;
  highlight: string;
  body: string;
  visual: () => ReactElement;
};

const slides: Slide[] = [
  {
    eyebrow: "Wallet",
    title: "One wallet,",
    highlight: "every currency.",
    body: "Hold Naira, Dollars, Euros and Pounds. Convert at fair rates with no branch visits.",
    visual: WalletVisual,
  },
  {
    eyebrow: "Cards",
    title: "Virtual cards,",
    highlight: "issued instantly.",
    body: "Spin up a Naira or USD card in seconds. Subscribe, shop and travel — fully in control.",
    visual: CardVisual,
  },
  {
    eyebrow: "Anywhere",
    title: "Land ready.",
    highlight: "Stay connected.",
    body: "Pay bills home, top up airtime and grab an eSIM before you board. No SIM swaps.",
    visual: ESimVisual,
  },
];

function Onboarding() {
  const [i, setI] = useState(0);
  const nav = useNavigate();
  const slide = slides[i];
  const isLast = i === slides.length - 1;

  return (
    <PhoneFrame>
      <div className="relative h-screen md:h-[860px] flex flex-col bg-[oklch(0.11_0.025_280)] text-white overflow-hidden">
        {/* Ambient glows */}
        <div className="pointer-events-none absolute -top-32 -right-24 w-[420px] h-[420px] rounded-full bg-primary/40 blur-[120px]" />
        <div className="pointer-events-none absolute top-1/3 -left-32 w-[360px] h-[360px] rounded-full bg-lime/20 blur-[120px]" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.04] [background-image:radial-gradient(white_1px,transparent_1px)] [background-size:18px_18px]" />

        {/* Top bar */}
        <div className="relative z-10 flex items-center justify-between px-6 pt-12">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-lime to-[oklch(0.85_0.2_130)] flex items-center justify-center font-display font-bold text-[13px] text-[oklch(0.2_0.05_80)]">
              B
            </div>
            <span className="font-display font-bold text-[15px] tracking-tight">BazePay</span>
          </div>
          <button
            onClick={() => nav({ to: "/auth/signup" })}
            className="text-[12px] font-semibold text-white/55 hover:text-white transition px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06]"
          >
            Skip
          </button>
        </div>

        {/* Visual stage */}
        <div className="relative z-10 flex-1 flex items-center justify-center px-6 pt-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={`v-${i}`}
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: -10 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="w-full"
            >
              <slide.visual />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Copy */}
        <div className="relative z-10 px-7">
          <AnimatePresence mode="wait">
            <motion.div
              key={`c-${i}`}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, delay: 0.05 }}
            >
              <p className="text-[10px] uppercase tracking-[0.32em] font-bold text-lime/90">
                {slide.eyebrow}
              </p>
              <h1 className="font-display text-[34px] leading-[1.05] font-bold tracking-tight mt-3">
                {slide.title}
                <br />
                <span className="bg-gradient-to-r from-white via-white to-[oklch(0.78_0.14_85)] bg-clip-text text-transparent">
                  {slide.highlight}
                </span>
              </h1>
              <p className="text-[13.5px] text-white/55 leading-relaxed mt-4 max-w-[300px]">
                {slide.body}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer: progress + CTA */}
        <div className="relative z-10 px-6 pt-7 pb-8">
          <div className="flex items-center gap-1.5 mb-6">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setI(idx)}
                className={`h-[3px] rounded-full transition-all duration-500 ${
                  idx === i ? "flex-[3] bg-lime" : "flex-1 bg-white/15"
                }`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => nav({ to: "/auth/login" })}
              className="text-[12.5px] font-semibold text-white/60 hover:text-white transition whitespace-nowrap"
            >
              Sign in
            </button>
            <button
              onClick={() =>
                isLast ? nav({ to: "/auth/signup" }) : setI(i + 1)
              }
              className="ml-auto group flex items-center gap-2 h-13 pl-6 pr-2 rounded-full bg-lime text-lime-foreground font-bold text-sm active:scale-[0.98] transition shadow-[0_10px_30px_-8px_oklch(0.92_0.21_120/0.5)]"
            >
              {isLast ? "Get started" : "Continue"}
              <span className="w-9 h-9 rounded-full bg-[oklch(0.13_0.02_280)] text-white flex items-center justify-center group-active:translate-x-0.5 transition">
                <ArrowRight className="w-4 h-4" />
              </span>
            </button>
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}

/* ---------- Slide visuals ---------- */

function WalletVisual() {
  return (
    <div className="relative h-[300px] flex items-center justify-center">
      {/* Back card */}
      <motion.div
        initial={{ rotate: -10, x: -30, y: 10, opacity: 0 }}
        animate={{ rotate: -8, x: -28, y: 8, opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.6 }}
        className="absolute w-[230px] h-[140px] rounded-3xl bg-gradient-to-br from-[oklch(0.4_0.18_280)] to-[oklch(0.28_0.12_280)] border border-white/10"
      />
      {/* Front balance card */}
      <motion.div
        initial={{ rotate: 6, opacity: 0, scale: 0.92 }}
        animate={{ rotate: 4, opacity: 1, scale: 1 }}
        transition={{ delay: 0.25, duration: 0.6 }}
        className="relative w-[270px] rounded-3xl p-5 bg-gradient-to-br from-white to-[oklch(0.95_0.02_85)] text-[oklch(0.13_0.02_280)] shadow-[0_30px_60px_-20px_oklch(0.55_0.24_280/0.6)]"
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-widest font-bold text-foreground/50">
            Total balance
          </span>
          <Eye className="w-3.5 h-3.5 text-foreground/40" />
        </div>
        <p className="font-display text-[32px] font-bold tracking-tight mt-2 tabular-nums">
          ₦845,320<span className="text-foreground/40 text-2xl">.50</span>
        </p>
        <div className="flex gap-1.5 mt-4">
          {[
            { c: "₦", bg: "oklch(0.96 0.04 145)" },
            { c: "$", bg: "oklch(0.94 0.04 30)" },
            { c: "€", bg: "oklch(0.94 0.04 250)" },
            { c: "£", bg: "oklch(0.94 0.04 305)" },
          ].map((t, i) => (
            <div
              key={i}
              className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold border border-foreground/5"
              style={{ background: t.bg }}
            >
              {t.c}
            </div>
          ))}
        </div>
      </motion.div>
      {/* Floating chip */}
      <motion.div
        initial={{ opacity: 0, y: 20, x: 80 }}
        animate={{ opacity: 1, y: 0, x: 80 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="absolute -bottom-2 right-2 flex items-center gap-2 px-3 py-2 rounded-full bg-white/[0.06] backdrop-blur-md border border-white/10 text-[11px] font-semibold"
      >
        <Sparkles className="w-3.5 h-3.5 text-lime" />
        +₦12,500 today
      </motion.div>
    </div>
  );
}

function CardVisual() {
  return (
    <div className="relative h-[300px] flex items-center justify-center">
      <motion.div
        initial={{ rotate: -14, opacity: 0, y: 20 }}
        animate={{ rotate: -10, opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.6 }}
        className="absolute w-[240px] h-[150px] rounded-3xl bg-gradient-to-br from-[oklch(0.25_0.08_280)] to-[oklch(0.16_0.04_280)] border border-white/10 -translate-x-12"
      >
        <div className="absolute inset-0 rounded-3xl bg-[radial-gradient(circle_at_top_right,oklch(0.55_0.24_280/0.6),transparent_60%)]" />
      </motion.div>
      <motion.div
        initial={{ rotate: 12, opacity: 0, scale: 0.9 }}
        animate={{ rotate: 8, opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="relative w-[260px] h-[160px] rounded-3xl p-5 translate-x-8 overflow-hidden bg-gradient-to-br from-[oklch(0.55_0.24_280)] via-[oklch(0.45_0.22_290)] to-[oklch(0.3_0.15_300)] shadow-[0_30px_60px_-20px_oklch(0.55_0.24_280/0.7)]"
      >
        <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-lime/30 blur-3xl" />
        <div className="flex justify-between items-start relative">
          <span className="font-display font-bold text-sm">BazePay</span>
          <Wifi className="w-4 h-4 rotate-90 opacity-70" />
        </div>
        <div className="absolute bottom-12 left-5 right-5 font-mono text-[13px] tracking-[0.18em] text-white/85">
          5282 •••• •••• 4019
        </div>
        <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between">
          <div>
            <p className="text-[8px] uppercase tracking-widest text-white/50">Cardholder</p>
            <p className="text-[11px] font-bold mt-0.5">A. OKAFOR</p>
          </div>
          <div className="font-display font-bold text-[13px] italic tracking-tight">VISA</div>
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55, duration: 0.5 }}
        className="absolute -bottom-1 left-2 flex items-center gap-2 px-3 py-2 rounded-full bg-white/[0.06] backdrop-blur-md border border-white/10 text-[11px] font-semibold"
      >
        <Shield className="w-3.5 h-3.5 text-lime" />
        Freeze in 1 tap
      </motion.div>
    </div>
  );
}

function ESimVisual() {
  return (
    <div className="relative h-[300px] flex items-center justify-center">
      {/* Globe halo */}
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.7 }}
        className="absolute w-[220px] h-[220px] rounded-full border border-white/10"
      />
      <motion.div
        initial={{ scale: 0.4, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.7 }}
        className="absolute w-[150px] h-[150px] rounded-full border border-lime/30"
      />

      {/* QR / eSIM card */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.92 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="relative w-[200px] rounded-3xl p-5 bg-white text-[oklch(0.13_0.02_280)] shadow-[0_30px_60px_-20px_oklch(0.55_0.24_280/0.5)]"
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-widest font-bold text-foreground/50">
            eSIM ready
          </span>
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-lime text-lime-foreground">
            5G
          </span>
        </div>
        <div className="mt-3 grid grid-cols-8 gap-[2px] aspect-square">
          {Array.from({ length: 64 }).map((_, idx) => {
            const filled =
              [0,1,2,3,4,5,6,7,8,15,16,23,24,31,32,39,40,47,48,55,56,57,58,59,60,61,62,63,
               10,11,13,18,20,21,26,28,34,36,37,42,44,45,50,52]
                .includes(idx);
            return (
              <div
                key={idx}
                className={`rounded-[2px] ${filled ? "bg-[oklch(0.13_0.02_280)]" : "bg-transparent"}`}
              />
            );
          })}
        </div>
        <p className="mt-3 text-[10px] font-bold text-center">🇳🇬 Nigeria · 10GB · 30 days</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: -20, y: 0 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ delay: 0.55, duration: 0.5 }}
        className="absolute top-6 left-2 flex items-center gap-2 px-3 py-2 rounded-full bg-white/[0.06] backdrop-blur-md border border-white/10 text-[11px] font-semibold"
      >
        <span className="text-base leading-none">🇬🇧</span> London
      </motion.div>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        className="absolute bottom-4 right-2 flex items-center gap-2 px-3 py-2 rounded-full bg-white/[0.06] backdrop-blur-md border border-white/10 text-[11px] font-semibold"
      >
        <span className="text-base leading-none">🇳🇬</span> Lagos
      </motion.div>
    </div>
  );
}
