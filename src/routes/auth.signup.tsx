import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PhoneFrame } from "@/components/phone-frame";
import { ArrowLeft, ArrowRight, Mail, Phone, Shield, Search, Check } from "lucide-react";
import { COUNTRIES, DIAL_CODES } from "@/lib/countries";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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
      <div className="h-full min-h-screen md:min-h-0 bg-background text-foreground flex flex-col">
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
                <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
                  <DialogTrigger asChild>
                    <button
                      type="button"
                      className="mt-2 w-full h-14 px-4 rounded-2xl bg-muted text-left flex items-center gap-3 border border-transparent hover:border-primary/30 transition"
                    >
                      <span className="text-2xl leading-none">{country.flag}</span>
                      <span className="flex-1 text-[15px] font-medium">{country.name}</span>
                      <span className="text-[13px] text-card-foreground/50">+{dial}</span>
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-sm p-0 overflow-hidden">
                    <DialogHeader className="px-5 pt-5 pb-3">
                      <DialogTitle>Select country</DialogTitle>
                    </DialogHeader>
                    <div className="px-5 pb-3">
                      <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                          autoFocus
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          placeholder="Search country"
                          className="w-full h-11 pl-9 pr-3 rounded-xl bg-muted text-sm focus:outline-none"
                        />
                      </div>
                    </div>
                    <div className="max-h-80 overflow-y-auto pb-3">
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
                            className={`w-full px-5 py-2.5 flex items-center gap-3 text-left hover:bg-muted transition ${selected ? "bg-muted" : ""}`}
                          >
                            <span className="text-xl leading-none">{c.flag}</span>
                            <span className="flex-1 text-[14px]">{c.name}</span>
                            <span className="text-[12px] text-muted-foreground">
                              +{DIAL_CODES[c.code] ?? ""}
                            </span>
                            {selected && <Check className="w-4 h-4 text-primary" />}
                          </button>
                        );
                      })}
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Phone */}
                <label className="mt-5 text-[11.5px] font-semibold text-card-foreground/55 uppercase tracking-wide">
                  Phone number
                </label>
                <div className="mt-2 relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[14px] font-semibold text-card-foreground/70 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-card-foreground/40" />
                    +{dial}
                  </span>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/[^\d\s]/g, ""))}
                    inputMode="tel"
                    placeholder="803 555 0142"
                    className={`w-full h-14 pr-4 rounded-2xl bg-muted border text-card-foreground placeholder:text-card-foreground/30 text-[15px] focus:outline-none focus:border-primary/40 transition ${
                      dial.length <= 1 ? "pl-14" : dial.length === 2 ? "pl-16" : dial.length === 3 ? "pl-[72px]" : "pl-20"
                    } border-transparent`}
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
      </div>
    </PhoneFrame>
  );
}
