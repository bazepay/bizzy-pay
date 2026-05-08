import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { PhoneFrame } from "@/components/phone-frame";
import { ArrowRight, Eye, EyeOff, Fingerprint, Mail, Phone } from "lucide-react";

export const Route = createFileRoute("/auth/login")({
  head: () => ({
    meta: [
      { title: "Sign in — BazePay" },
      { name: "description", content: "Sign in to your BazePay wallet." },
    ],
  }),
  component: Login,
});

function Login() {
  const [mode, setMode] = useState<"phone" | "email">("phone");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const nav = useNavigate();

  const canSubmit = identifier.trim().length > 4 && password.length >= 6;

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

        {/* Form */}
        <div className="relative z-10 flex-1 flex flex-col px-7 pt-10">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="text-[10px] uppercase tracking-[0.32em] font-bold text-lime/90">
              Welcome back
            </p>
            <h1 className="font-display text-[32px] leading-[1.05] font-bold tracking-tight mt-3">
              Sign in to
              <br />
              <span className="bg-gradient-to-r from-white to-[oklch(0.78_0.14_85)] bg-clip-text text-transparent">
                BazePay.
              </span>
            </h1>
          </motion.div>

          {/* Mode toggle */}
          <div className="mt-7 grid grid-cols-2 p-1 bg-white/[0.05] border border-white/[0.06] rounded-2xl">
            {(["phone", "email"] as const).map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMode(m);
                  setIdentifier("");
                }}
                className={`relative h-10 rounded-xl text-[13px] font-semibold capitalize transition ${
                  mode === m ? "text-[oklch(0.13_0.02_280)]" : "text-white/55"
                }`}
              >
                {mode === m && (
                  <motion.div
                    layoutId="login-mode-pill"
                    className="absolute inset-0 bg-lime rounded-xl"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                <span className="relative flex items-center justify-center gap-2">
                  {m === "phone" ? <Phone className="w-3.5 h-3.5" /> : <Mail className="w-3.5 h-3.5" />}
                  {m}
                </span>
              </button>
            ))}
          </div>

          {/* Identifier */}
          <div className="mt-4 relative">
            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[13px] font-semibold text-white/40">
              {mode === "phone" ? "+234" : "@"}
            </span>
            <input
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder={mode === "phone" ? "803 555 0142" : "you@example.com"}
              className="w-full h-14 pl-16 pr-4 rounded-2xl bg-white/[0.05] border border-white/[0.08] text-white placeholder:text-white/30 text-[15px] focus:outline-none focus:border-lime/60 focus:bg-white/[0.07] transition"
            />
          </div>

          {/* Password */}
          <div className="mt-3 relative">
            <input
              type={showPw ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full h-14 pl-5 pr-12 rounded-2xl bg-white/[0.05] border border-white/[0.08] text-white placeholder:text-white/30 text-[15px] focus:outline-none focus:border-lime/60 focus:bg-white/[0.07] transition"
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/[0.06] transition"
            >
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <div className="mt-3 flex justify-end">
            <button className="text-[12px] font-semibold text-white/55 hover:text-lime transition">
              Forgot password?
            </button>
          </div>

          {/* CTA + biometrics */}
          <div className="mt-auto pb-7">
            <div className="flex items-center gap-3">
              <button
                disabled={!canSubmit}
                onClick={() => nav({ to: "/home" })}
                className="group flex-1 flex items-center justify-center gap-2 h-14 rounded-full bg-lime text-lime-foreground font-bold text-sm active:scale-[0.98] transition shadow-[0_10px_30px_-8px_oklch(0.92_0.21_120/0.5)] disabled:opacity-40 disabled:shadow-none"
              >
                Sign in
                <ArrowRight className="w-4 h-4 group-active:translate-x-0.5 transition" />
              </button>
              <button
                onClick={() => nav({ to: "/home" })}
                aria-label="Sign in with biometrics"
                className="w-14 h-14 rounded-full bg-white/[0.05] border border-white/[0.08] flex items-center justify-center hover:bg-white/[0.08] active:scale-95 transition"
              >
                <Fingerprint className="w-6 h-6 text-lime" />
              </button>
            </div>

            <p className="text-center text-[12.5px] text-white/55 mt-5">
              New to BazePay?{" "}
              <Link to="/auth/signup" className="text-lime font-semibold">
                Create account
              </Link>
            </p>

            <button
              onClick={() => nav({ to: "/home" })}
              className="w-full text-center text-[11px] text-white/30 mt-3"
            >
              Demo: skip to app
            </button>
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}
