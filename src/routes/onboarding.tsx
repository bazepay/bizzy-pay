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
  body: string;
  visual: () => ReactElement;
};

const slides: Slide[] = [
  {
    eyebrow: "Skip the bank queue",
    title: "Naira spending, without a Nigerian bank account.",
    body: "No BVN, no NIN, no proof of address. Built for visitors and diaspora who just need to pay and move.",
    visual: WalletVisual,
  },
  {
    eyebrow: "Top up your way",
    title: "Fund with your foreign card. Spend in Naira.",
    body: "Use your Visa, Mastercard or Amex. We convert at fair rates — pay vendors, transfer to any bank, settle bills instantly.",
    visual: CardVisual,
  },
  {
    eyebrow: "Land ready",
    title: "An eSIM and a Nigerian number, before you board.",
    body: "Online the moment you land in Lagos. Receive OTPs on a local number — no SIM swap, no airport queue.",
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
      <div className="h-full min-h-screen md:min-h-0 bg-background text-foreground flex flex-col">
        <div className="h-10" />

        {/* Top bar */}
        <header className="px-6 pt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center font-display font-bold text-[14px] text-primary-foreground">
              B
            </div>
            <span className="font-display font-bold text-[15px] tracking-tight">BazePay</span>
          </div>
          <button
            onClick={() => nav({ to: "/auth/signup" })}
            className="text-[12px] font-semibold text-foreground/55 hover:text-foreground transition px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.08]"
          >
            Skip
          </button>
        </header>

        {/* Visual stage — swipeable */}
        <motion.div
          className="flex-1 flex items-center justify-center px-6 pt-4 pb-2 min-h-[260px] overflow-hidden touch-pan-y"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.18}
          onDragEnd={(_, info) => {
            if (info.offset.x < -60 && i < slides.length - 1) setI(i + 1);
            else if (info.offset.x > 60 && i > 0) setI(i - 1);
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={`v-${i}`}
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: -6 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="w-full"
            >
              <slide.visual />
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Sheet */}
        <div className="bg-card text-card-foreground rounded-t-[2rem] px-7 pt-7 pb-8 flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={`c-${i}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
            >
              <p className="text-[10px] uppercase tracking-[0.28em] font-bold text-primary">
                {slide.eyebrow}
              </p>
              <h1 className="font-display text-[30px] leading-[1.1] font-bold tracking-tight mt-2.5">
                {slide.title}
              </h1>
              <p className="text-[13.5px] text-card-foreground/60 leading-relaxed mt-3 max-w-[320px]">
                {slide.body}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Progress */}
          <div className="flex items-center gap-1.5 mt-6">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setI(idx)}
                className={`h-[3px] rounded-full transition-all duration-500 ${
                  idx === i ? "flex-[3] bg-primary" : "flex-1 bg-card-foreground/15"
                }`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>

          {/* Footer */}
          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={() => nav({ to: "/auth/login" })}
              className="text-[12.5px] font-semibold text-card-foreground/60 hover:text-card-foreground transition whitespace-nowrap"
            >
              Sign in
            </button>
            <button
              onClick={() => (isLast ? nav({ to: "/auth/signup" }) : setI(i + 1))}
              className="ml-auto group flex items-center justify-center gap-2 h-14 px-7 rounded-full bg-primary text-primary-foreground font-bold text-sm active:scale-[0.98] transition"
            >
              {isLast ? "Get started" : "Continue"}
              <ArrowRight className="w-4 h-4 group-active:translate-x-0.5 transition" />
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
    <div className="relative h-[260px] flex items-center justify-center">
      <motion.div
        initial={{ rotate: -10, x: -30, y: 10, opacity: 0 }}
        animate={{ rotate: -8, x: -28, y: 8, opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.6 }}
        className="absolute w-[230px] h-[140px] rounded-3xl bg-gradient-to-br from-[oklch(0.4_0.18_280)] to-[oklch(0.28_0.12_280)] border border-white/10"
      />
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
          ].map((t, idx) => (
            <div
              key={idx}
              className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold border border-foreground/5"
              style={{ background: t.bg }}
            >
              {t.c}
            </div>
          ))}
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="absolute -bottom-2 right-4 flex items-center gap-2 px-3 py-2 rounded-full bg-white/[0.06] backdrop-blur-md border border-white/10 text-[11px] font-semibold"
      >
        <Sparkles className="w-3.5 h-3.5 text-primary" />
        +₦12,500 today
      </motion.div>
    </div>
  );
}

function CardVisual() {
  return (
    <div className="relative h-[260px] flex items-center justify-center">
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
        <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-primary/40 blur-3xl" />
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
        <Shield className="w-3.5 h-3.5 text-primary" />
        Freeze in 1 tap
      </motion.div>
    </div>
  );
}

function ESimVisual() {
  return (
    <div className="relative h-[260px] flex items-center justify-center">
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
        className="absolute w-[150px] h-[150px] rounded-full border border-primary/30"
      />

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
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground">
            5G
          </span>
        </div>
        <div className="mt-3 grid grid-cols-8 gap-[2px] aspect-square">
          {Array.from({ length: 64 }).map((_, idx) => {
            const filled = [0,1,2,3,4,5,6,7,8,15,16,23,24,31,32,39,40,47,48,55,56,57,58,59,60,61,62,63,10,11,13,18,20,21,26,28,34,36,37,42,44,45,50,52].includes(idx);
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
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
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
