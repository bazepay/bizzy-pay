import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PhoneFrame } from "@/components/phone-frame";
import { ArrowLeft, ArrowRight, Mail, Phone, Shield } from "lucide-react";

export const Route = createFileRoute("/auth/signup")({
  head: () => ({
    meta: [
      { title: "Create account — BazePay" },
      { name: "description", content: "Open your BazePay account in under a minute." },
    ],
  }),
  component: Signup,
});

function Signup() {
  const [step, setStep] = useState<"identifier" | "otp">("identifier");
  const [mode, setMode] = useState<"phone" | "email">("phone");
  const [value, setValue] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const nav = useNavigate();

  const handleOtpChange = (i: number, v: string) => {
    if (v && !/^\d$/.test(v)) return;
    const next = [...otp];
    next[i] = v;
    setOtp(next);
    if (v && i < 5) document.getElementById(`otp-${i + 1}`)?.focus();
    if (next.every((d) => d) && next.join("") === "123456") {
      setTimeout(() => nav({ to: "/kyc" }), 300);
    }
  };

  const canContinue = value.trim().length > 4;

  return (
    <PhoneFrame>
      <div className="relative h-screen md:h-[860px] flex flex-col bg-[oklch(0.11_0.025_280)] text-white overflow-hidden">
        {/* Ambient glows */}
        <div className="pointer-events-none absolute -top-32 -right-24 w-[420px] h-[420px] rounded-full bg-primary/40 blur-[120px]" />
        <div className="pointer-events-none absolute bottom-0 -left-24 w-[320px] h-[320px] rounded-full bg-lime/15 blur-[120px]" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.04] [background-image:radial-gradient(white_1px,transparent_1px)] [background-size:18px_18px]" />

        {/* Header */}
        <header className="relative z-10 flex items-center justify-between px-6 pt-12">
          <Link
            to={step === "otp" ? "/auth/signup" : "/onboarding"}
            onClick={(e) => {
              if (step === "otp") {
                e.preventDefault();
                setStep("identifier");
              }
            }}
            className="w-10 h-10 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-center hover:bg-white/[0.1] transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-1.5">
            <div className={`h-[3px] w-8 rounded-full ${step === "identifier" ? "bg-lime" : "bg-lime/40"}`} />
            <div className={`h-[3px] w-8 rounded-full ${step === "otp" ? "bg-lime" : "bg-white/15"}`} />
          </div>
          <div className="w-10" />
        </header>

        <div className="relative z-10 flex-1 flex flex-col px-7 pt-10">
          <AnimatePresence mode="wait">
            {step === "identifier" ? (
              <motion.div
                key="id"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className="flex-1 flex flex-col"
              >
                <p className="text-[10px] uppercase tracking-[0.32em] font-bold text-lime/90">
                  Get started
                </p>
                <h1 className="font-display text-[34px] leading-[1.05] font-bold tracking-tight mt-3">
                  Create your
                  <br />
                  <span className="bg-gradient-to-r from-white to-[oklch(0.78_0.14_85)] bg-clip-text text-transparent">
                    BazePay account.
                  </span>
                </h1>
                <p className="text-[13.5px] text-white/55 leading-relaxed mt-4 max-w-[300px]">
                  We'll send a one-time code to verify it's really you.
                </p>

                {/* Mode toggle */}
                <div className="mt-8 grid grid-cols-2 p-1 bg-white/[0.05] border border-white/[0.06] rounded-2xl">
                  {(["phone", "email"] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => {
                        setMode(m);
                        setValue("");
                      }}
                      className={`relative h-10 rounded-xl text-[13px] font-semibold capitalize transition ${
                        mode === m ? "text-[oklch(0.13_0.02_280)]" : "text-white/55"
                      }`}
                    >
                      {mode === m && (
                        <motion.div
                          layoutId="mode-pill"
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

                {/* Input */}
                <div className="mt-5 relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[13px] font-semibold text-white/40">
                    {mode === "phone" ? "+234" : "@"}
                  </span>
                  <input
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder={mode === "phone" ? "803 555 0142" : "you@example.com"}
                    className="w-full h-14 pl-16 pr-4 rounded-2xl bg-white/[0.05] border border-white/[0.08] text-white placeholder:text-white/30 text-[15px] focus:outline-none focus:border-lime/60 focus:bg-white/[0.07] transition"
                  />
                </div>

                <div className="mt-4 flex items-start gap-2 text-[11px] text-white/45 leading-relaxed">
                  <Shield className="w-3.5 h-3.5 text-lime/70 mt-0.5 shrink-0" />
                  <p>
                    By continuing, you agree to our{" "}
                    <span className="text-white/70 underline underline-offset-2">Terms</span> and{" "}
                    <span className="text-white/70 underline underline-offset-2">Privacy Policy</span>.
                  </p>
                </div>

                <div className="mt-auto pb-8">
                  <button
                    disabled={!canContinue}
                    onClick={() => setStep("otp")}
                    className="group w-full flex items-center justify-center gap-2 h-14 rounded-full bg-lime text-lime-foreground font-bold text-sm active:scale-[0.98] transition shadow-[0_10px_30px_-8px_oklch(0.92_0.21_120/0.5)] disabled:opacity-40 disabled:shadow-none"
                  >
                    Send code
                    <ArrowRight className="w-4 h-4 group-active:translate-x-0.5 transition" />
                  </button>
                  <p className="text-center text-[12.5px] text-white/55 mt-5">
                    Already have an account?{" "}
                    <Link to="/auth/login" className="text-lime font-semibold">
                      Sign in
                    </Link>
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="otp"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className="flex-1 flex flex-col"
              >
                <p className="text-[10px] uppercase tracking-[0.32em] font-bold text-lime/90">
                  Verify
                </p>
                <h1 className="font-display text-[34px] leading-[1.05] font-bold tracking-tight mt-3">
                  Enter the
                  <br />
                  <span className="bg-gradient-to-r from-white to-[oklch(0.78_0.14_85)] bg-clip-text text-transparent">
                    6-digit code.
                  </span>
                </h1>
                <p className="text-[13.5px] text-white/55 leading-relaxed mt-4">
                  Sent to{" "}
                  <span className="text-white font-semibold">
                    {value || (mode === "phone" ? "+234 803 555 0142" : "you@example.com")}
                  </span>
                </p>

                <div className="flex gap-2 mt-10 justify-between">
                  {otp.map((d, i) => (
                    <input
                      key={i}
                      id={`otp-${i}`}
                      value={d}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      maxLength={1}
                      inputMode="numeric"
                      className={`w-12 h-14 rounded-2xl bg-white/[0.05] border text-center text-xl font-bold text-white outline-none transition ${
                        d ? "border-lime/60 bg-white/[0.08]" : "border-white/[0.08]"
                      }`}
                    />
                  ))}
                </div>

                <div className="mt-6 px-4 py-3 rounded-2xl bg-lime/[0.08] border border-lime/20 text-center">
                  <p className="text-[11px] text-white/60">
                    Demo code:{" "}
                    <span className="font-mono font-bold text-lime tracking-widest">123456</span>
                  </p>
                </div>

                <button className="mt-5 text-center text-[12.5px] text-white/55">
                  Didn't receive it? <span className="text-lime font-semibold">Resend in 0:30</span>
                </button>

                <div className="mt-auto pb-8">
                  <button
                    onClick={() => nav({ to: "/kyc" })}
                    className="group w-full flex items-center justify-center gap-2 h-14 rounded-full bg-lime text-lime-foreground font-bold text-sm active:scale-[0.98] transition shadow-[0_10px_30px_-8px_oklch(0.92_0.21_120/0.5)]"
                  >
                    Verify & continue
                    <ArrowRight className="w-4 h-4 group-active:translate-x-0.5 transition" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PhoneFrame>
  );
}
