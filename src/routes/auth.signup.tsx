import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PhoneFrame } from "@/components/phone-frame";
import { ArrowLeft, ArrowRight, Mail, Shield, Search, Check, ChevronDown, X } from "lucide-react";
import { COUNTRIES, DIAL_CODES } from "@/lib/countries";

function Flag({ code, className = "w-7 h-5" }: { code: string; className?: string }) {
  const lower = code.toLowerCase();
  return (
    <img
      src={`https://flagcdn.com/w80/${lower}.png`}
      srcSet={`https://flagcdn.com/w160/${lower}.png 2x`}
      width={32}
      height={24}
      alt=""
      className={`${className} rounded-[3px] object-cover shadow-sm shrink-0`}
      loading="lazy"
    />
  );
}

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
  const [countryCode, setCountryCode] = useState("NG");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [search, setSearch] = useState("");
  const nav = useNavigate();

  const country = COUNTRIES.find((c) => c.code === countryCode) ?? COUNTRIES[0];
  const dial = DIAL_CODES[countryCode] ?? "";

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter(
      (c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)
    );
  }, [search]);

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

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const phoneValid = phone.replace(/\D/g, "").length >= 7;
  const canContinue = emailValid && phoneValid;

  return (
    <PhoneFrame>
      <div className="h-full min-h-screen md:min-h-0 bg-background text-foreground flex flex-col relative overflow-hidden">
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
                    +{dial} {phone}
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
                {/* Country */}
                <label className="text-[11.5px] font-semibold text-card-foreground/55 uppercase tracking-wide">
                  Country
                </label>
                <button
                  type="button"
                  onClick={() => setPickerOpen(true)}
                  className="mt-2 w-full h-14 px-4 rounded-2xl bg-muted text-left flex items-center gap-3 border border-transparent hover:border-primary/30 transition"
                >
                  <Flag code={country.code} />
                  <span className="flex-1 text-[15px] font-medium">{country.name}</span>
                  <ChevronDown className="w-4 h-4 text-card-foreground/40" />
                </button>

                {/* Phone */}
                <label className="mt-5 text-[11.5px] font-semibold text-card-foreground/55 uppercase tracking-wide">
                  Phone number
                </label>
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPickerOpen(true)}
                    className="h-14 px-4 rounded-2xl bg-muted flex items-center gap-2 hover:border-primary/30 border border-transparent transition shrink-0"
                  >
                    <Flag code={country.code} className="w-6 h-[18px]" />
                    <span className="text-[14px] font-semibold text-card-foreground/80">+{dial}</span>
                  </button>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/[^\d\s]/g, ""))}
                    inputMode="tel"
                    placeholder="803 555 0142"
                    className="flex-1 min-w-0 h-14 px-4 rounded-2xl bg-muted border border-transparent text-card-foreground placeholder:text-card-foreground/30 text-[15px] focus:outline-none focus:border-primary/40 transition"
                  />
                </div>

                {/* Email */}
                <label className="mt-4 text-[11.5px] font-semibold text-card-foreground/55 uppercase tracking-wide">
                  Email address
                </label>
                <div className="mt-2 relative">
                  <Mail className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-card-foreground/40" />
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    inputMode="email"
                    placeholder="you@example.com"
                    className="w-full h-14 pl-11 pr-4 rounded-2xl bg-muted border border-transparent text-card-foreground placeholder:text-card-foreground/30 text-[15px] focus:outline-none focus:border-primary/40 transition"
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

                <div className="mt-auto pt-6">
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

        {/* Country picker — bottom sheet matching app design */}
        <AnimatePresence>
          {pickerOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setPickerOpen(false)}
                className="absolute inset-0 z-40 bg-black/70 backdrop-blur-sm"
              />
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", stiffness: 320, damping: 34 }}
                className="absolute inset-x-0 bottom-0 z-50 bg-card text-card-foreground rounded-t-[2rem] flex flex-col max-h-[85%]"
              >
                <div className="pt-3 flex justify-center">
                  <div className="h-1 w-10 rounded-full bg-card-foreground/15" />
                </div>
                <div className="px-6 pt-4 pb-3 flex items-center justify-between">
                  <h2 className="font-display text-xl font-bold">Select country</h2>
                  <button
                    onClick={() => setPickerOpen(false)}
                    className="w-9 h-9 rounded-full bg-muted flex items-center justify-center hover:bg-muted/70 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="px-6 pb-3">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-card-foreground/40" />
                    <input
                      autoFocus
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search country"
                      className="w-full h-12 pl-11 pr-4 rounded-2xl bg-muted text-[14px] text-card-foreground placeholder:text-card-foreground/40 focus:outline-none focus:border-primary/40 border border-transparent"
                    />
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto px-3 pb-6">
                  {filtered.map((c) => {
                    const selected = c.code === countryCode;
                    return (
                      <button
                        key={c.code}
                        onClick={() => {
                          setCountryCode(c.code);
                          setPickerOpen(false);
                          setSearch("");
                        }}
                        className={`w-full px-3 py-3 rounded-xl flex items-center gap-3 text-left transition ${
                          selected ? "bg-primary/10" : "hover:bg-muted"
                        }`}
                      >
                        <span className="text-2xl leading-none">{c.flag}</span>
                        <span className="flex-1 text-[14.5px] font-medium">{c.name}</span>
                        <span className="text-[12.5px] text-card-foreground/50">
                          +{DIAL_CODES[c.code] ?? ""}
                        </span>
                        {selected && <Check className="w-4 h-4 text-primary" />}
                      </button>
                    );
                  })}
                  {filtered.length === 0 && (
                    <p className="text-center text-[13px] text-card-foreground/50 py-8">
                      No country found
                    </p>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </PhoneFrame>
  );
}
