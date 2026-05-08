import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { PhoneFrame } from "@/components/phone-frame";
import { Fingerprint, Delete } from "lucide-react";

export const Route = createFileRoute("/auth/login")({
  head: () => ({
    meta: [
      { title: "Sign in — BazePay" },
      { name: "description", content: "Unlock your BazePay wallet." },
    ],
  }),
  component: Login,
});

function Login() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const nav = useNavigate();

  const press = (k: string) => {
    setError(false);
    if (k === "back") return setPin((p) => p.slice(0, -1));
    if (pin.length >= 4) return;
    const next = pin + k;
    setPin(next);
    if (next.length === 4) {
      if (next === "0000") {
        setError(true);
        setTimeout(() => setPin(""), 600);
      } else {
        setTimeout(() => nav({ to: "/home" }), 250);
      }
    }
  };

  return (
    <PhoneFrame>
      <div className="relative h-screen md:h-[860px] flex flex-col bg-[oklch(0.11_0.025_280)] text-white overflow-hidden">
        {/* Ambient glows */}
        <div className="pointer-events-none absolute -top-32 -right-24 w-[420px] h-[420px] rounded-full bg-primary/40 blur-[120px]" />
        <div className="pointer-events-none absolute bottom-0 -left-32 w-[360px] h-[360px] rounded-full bg-lime/15 blur-[120px]" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.04] [background-image:radial-gradient(white_1px,transparent_1px)] [background-size:18px_18px]" />

        {/* Top brand */}
        <div className="relative z-10 flex items-center justify-center pt-12">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-lime to-[oklch(0.85_0.2_130)] flex items-center justify-center font-display font-bold text-[13px] text-[oklch(0.2_0.05_80)]">
              B
            </div>
            <span className="font-display font-bold text-[15px] tracking-tight">BazePay</span>
          </div>
        </div>

        {/* Avatar + greeting */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center gap-8 px-6 -mt-2">
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="text-center space-y-4"
          >
            <div className="relative w-20 h-20 mx-auto">
              <div className="absolute inset-0 rounded-3xl bg-lime/30 blur-2xl" />
              <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-lime to-[oklch(0.78_0.18_130)] flex items-center justify-center text-3xl font-display font-bold text-[oklch(0.13_0.02_280)] shadow-[0_20px_40px_-10px_oklch(0.92_0.21_120/0.5)]">
                A
              </div>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.32em] font-bold text-lime/90">
                Welcome back
              </p>
              <h1 className="font-display text-[26px] font-bold tracking-tight mt-2">
                Hello, Adaeze
              </h1>
              <p className="text-[13px] text-white/55 mt-1.5">Enter your PIN to unlock</p>
            </div>
          </motion.div>

          {/* PIN dots */}
          <motion.div
            animate={error ? { x: [0, -8, 8, -6, 6, 0] } : { x: 0 }}
            transition={{ duration: 0.4 }}
            className="flex gap-4"
          >
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full border transition-all duration-200 ${
                  error
                    ? "bg-destructive border-destructive"
                    : pin.length > i
                      ? "bg-lime border-lime scale-110 shadow-[0_0_12px_oklch(0.92_0.21_120/0.6)]"
                      : "bg-transparent border-white/30"
                }`}
              />
            ))}
          </motion.div>
        </div>

        {/* Keypad */}
        <div className="relative z-10 px-7 pb-6">
          <div className="grid grid-cols-3 gap-2.5">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((n) => (
              <button
                key={n}
                onClick={() => press(n)}
                className="h-15 py-4 rounded-2xl bg-white/[0.05] border border-white/[0.06] backdrop-blur text-2xl font-display font-semibold hover:bg-white/[0.08] active:scale-95 transition"
              >
                {n}
              </button>
            ))}
            <button
              onClick={() => nav({ to: "/home" })}
              className="py-4 rounded-2xl flex items-center justify-center hover:bg-white/[0.05] transition"
            >
              <Fingerprint className="w-7 h-7 text-lime" />
            </button>
            <button
              onClick={() => press("0")}
              className="py-4 rounded-2xl bg-white/[0.05] border border-white/[0.06] backdrop-blur text-2xl font-display font-semibold hover:bg-white/[0.08] active:scale-95 transition"
            >
              0
            </button>
            <button
              onClick={() => press("back")}
              className="py-4 rounded-2xl flex items-center justify-center hover:bg-white/[0.05] transition"
            >
              <Delete className="w-6 h-6 text-white/70" />
            </button>
          </div>

          <div className="flex items-center justify-between mt-6 px-1">
            <button className="text-[12.5px] font-semibold text-white/55 hover:text-white transition">
              Forgot PIN?
            </button>
            <Link to="/auth/signup" className="text-[12.5px] text-white/55">
              New here? <span className="text-lime font-semibold">Sign up</span>
            </Link>
          </div>

          <button
            onClick={() => nav({ to: "/home" })}
            className="w-full text-center text-[11px] text-white/30 mt-4"
          >
            Demo: skip to app
          </button>
        </div>
      </div>
    </PhoneFrame>
  );
}
