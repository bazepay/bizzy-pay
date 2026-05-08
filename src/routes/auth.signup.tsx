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
      <div className="min-h-full bg-background text-foreground flex flex-col">
        <div className="h-10" />

        {/* Header */}
        <header className="px-6 pt-4 flex items-center justify-between">
          <button
            onClick={() =>
              step === "otp" ? setStep("identifier") : nav({ to: "/onboarding" })
            }
            className="w-10 h-10 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-center hover:bg-white/[0.1] transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-1.5">
            <div className={`h-[3px] w-8 rounded-full ${step === "identifier" ? "bg-primary" : "bg-primary/40"}`} />
            <div className={`h-[3px] w-8 rounded-full ${step === "otp" ? "bg-primary" : "bg-white/15"}`} />
          </div>
          <div className="w-10" />
        </header>

        {/* Heading */}
        <div className="px-6 pt-8">
          <AnimatePresence mode="wait">
            {step === "identifier" ? (
              <motion.div
                key="h-id"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3 }}
              >
                <h1 className="font-display text-4xl font-bold tracking-tight">
                  Create your account
                </h1>
                <p className="text-sm text-foreground/55 mt-2">
                  We'll send a one-time code to verify it's you.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="h-otp"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3 }}
              >
                <h1 className="font-display text-4xl font-bold tracking-tight">
                  Enter the 6-digit code
                </h1>
                <p className="text-sm text-foreground/55 mt-2">
                  Sent to{" "}
                  <span className="text-foreground font-semibold">
                    {value || (mode === "phone" ? "+234 803 555 0142" : "you@example.com")}
                  </span>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sheet */}
        <div className="flex-1 mt-7 bg-card text-card-foreground rounded-t-[2rem] px-6 pt-7 pb-8 flex flex-col">
          <AnimatePresence mode="wait">
            {step === "identifier" ? (
              <motion.div
                key="id"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35 }}
                className="flex-1 flex flex-col"
              >
                {/* Mode toggle */}
                <div className="grid grid-cols-2 p-1 bg-muted rounded-2xl">
                  {(["phone", "email"] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => {
                        setMode(m);
                        setValue("");
                      }}
                      className={`relative h-10 rounded-xl text-[13px] font-semibold capitalize transition ${
                        mode === m ? "text-card-foreground" : "text-card-foreground/50"
                      }`}
                    >
                      {mode === m && (
                        <motion.div
                          layoutId="signup-mode-pill"
                          className="absolute inset-0 bg-card rounded-xl shadow-soft"
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
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[13px] font-semibold text-card-foreground/40">
                    {mode === "phone" ? "+234" : "@"}
                  </span>
                  <input
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder={mode === "phone" ? "803 555 0142" : "you@example.com"}
                    className="w-full h-14 pl-16 pr-4 rounded-2xl bg-muted border border-transparent text-card-foreground placeholder:text-card-foreground/30 text-[15px] focus:outline-none focus:border-primary/40 focus:bg-background/0 transition"
                  />
                </div>

                <div className="mt-4 flex items-start gap-2 text-[11.5px] text-card-foreground/55 leading-relaxed">
                  <Shield className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                  <p>
                    By continuing, you agree to our{" "}
                    <span className="font-semibold underline underline-offset-2">Terms</span> and{" "}
                    <span className="font-semibold underline underline-offset-2">Privacy</span>.
                  </p>
                </div>

                <div className="mt-auto">
                  <button
                    disabled={!canContinue}
                    onClick={() => setStep("otp")}
                    className="group w-full flex items-center justify-center gap-2 h-14 rounded-full bg-primary text-primary-foreground font-bold text-sm active:scale-[0.98] transition disabled:opacity-40"
                  >
                    Send code
                    <ArrowRight className="w-4 h-4 group-active:translate-x-0.5 transition" />
                  </button>
                  <p className="text-center text-[12.5px] text-card-foreground/55 mt-4">
                    Already have an account?{" "}
                    <Link to="/auth/login" className="text-primary font-semibold">
                      Sign in
                    </Link>
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="otp"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35 }}
                className="flex-1 flex flex-col"
              >
                <div className="flex gap-2 justify-between">
                  {otp.map((d, i) => (
                    <input
                      key={i}
                      id={`otp-${i}`}
                      value={d}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      maxLength={1}
                      inputMode="numeric"
                      className={`w-12 h-14 rounded-2xl border text-center text-xl font-bold text-card-foreground outline-none transition ${
                        d ? "border-primary/50 bg-primary/[0.06]" : "border-border bg-muted"
                      }`}
                    />
                  ))}
                </div>

                <div className="mt-5 px-4 py-3 rounded-2xl bg-primary/[0.06] border border-primary/15 text-center">
                  <p className="text-[11.5px] text-card-foreground/65">
                    Demo code:{" "}
                    <span className="font-mono font-bold text-primary tracking-widest">123456</span>
                  </p>
                </div>

                <button className="mt-5 text-center text-[12.5px] text-card-foreground/55">
                  Didn't receive it? <span className="text-primary font-semibold">Resend in 0:30</span>
                </button>

                <div className="mt-auto">
                  <button
                    onClick={() => nav({ to: "/kyc" })}
                    className="group w-full flex items-center justify-center gap-2 h-14 rounded-full bg-primary text-primary-foreground font-bold text-sm active:scale-[0.98] transition"
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
