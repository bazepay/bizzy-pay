import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ShieldCheck, Smartphone, Mail, Copy, Check } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/profile_/security/twofa")({
  head: () => ({
    meta: [
      { title: "Two-factor authentication — BazePay" },
      { name: "description", content: "Enable an extra layer of protection on your BazePay account." },
    ],
  }),
  component: TwoFAPage,
});

type Method = "app" | "sms" | "email";
type Step = "choose" | "verify" | "done";

const SECRET = "BAZE PAY7 K9MX QR2T";

function TwoFAPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("choose");
  const [method, setMethod] = useState<Method>("app");
  const [code, setCode] = useState("");
  const [shake, setShake] = useState(false);

  const methods: { id: Method; icon: typeof Smartphone; label: string; desc: string }[] = [
    { id: "app", icon: ShieldCheck, label: "Authenticator app", desc: "Google Authenticator, 1Password, Authy" },
    { id: "sms", icon: Smartphone, label: "SMS code", desc: "Sent to •••• 5678" },
    { id: "email", icon: Mail, label: "Email code", desc: "adaeze@bazepay.com" },
  ];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(SECRET.replace(/\s/g, ""));
      toast.success("Secret copied");
    } catch { toast.error("Could not copy"); }
  };

  const verify = (val: string) => {
    setCode(val);
    if (val.length === 6) {
      if (val === "123456") {
        setTimeout(() => setStep("done"), 150);
      } else {
        setShake(true);
        toast.error("Invalid code. Try 123456");
        setTimeout(() => { setCode(""); setShake(false); }, 450);
      }
    }
  };

  if (step === "done") {
    return (
      <div className="min-h-full bg-background text-foreground flex flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 14, stiffness: 220 }}
          className="w-20 h-20 rounded-full bg-primary/15 flex items-center justify-center text-primary"
        >
          <Check className="w-10 h-10" />
        </motion.div>
        <h1 className="font-display text-2xl font-bold mt-6">2FA enabled</h1>
        <p className="text-sm text-foreground/60 mt-2">Your account now requires a code at sign-in.</p>
        <button
          onClick={() => navigate({ to: "/profile" })}
          className="mt-10 w-full max-w-[280px] h-12 rounded-full bg-primary text-primary-foreground font-semibold text-sm active:scale-[0.98] transition"
        >
          Back to profile
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-background text-foreground flex flex-col">
      <header className="px-6 pt-12 pb-4 flex items-center gap-3">
        <button
          onClick={() => (step === "verify" ? setStep("choose") : navigate({ to: "/profile" }))}
          className="w-10 h-10 rounded-full bg-foreground/10 flex items-center justify-center"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-display text-xl font-bold">Two-factor auth</h1>
      </header>

      <AnimatePresence mode="wait">
        {step === "choose" && (
          <motion.div
            key="choose"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="px-6 pb-10"
          >
            <p className="text-sm text-foreground/65 leading-relaxed">
              Add a second step at sign-in. Even if your password leaks, your account stays safe.
            </p>

            <div className="space-y-2.5 mt-6">
              {methods.map((m) => {
                const Icon = m.icon;
                const active = method === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setMethod(m.id)}
                    className={`w-full flex items-center gap-3 p-4 rounded-2xl text-left transition ${
                      active ? "bg-primary/10 ring-2 ring-primary" : "bg-foreground/[0.05]"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      active ? "bg-primary text-primary-foreground" : "bg-background text-foreground/70"
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold">{m.label}</p>
                      <p className="text-[11px] text-foreground/55 truncate">{m.desc}</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      active ? "border-primary bg-primary" : "border-foreground/25"
                    }`}>
                      {active && <Check className="w-3 h-3 text-primary-foreground" />}
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setStep("verify")}
              className="mt-7 w-full h-12 rounded-full bg-primary text-primary-foreground font-semibold text-sm active:scale-[0.98] transition"
            >
              Continue
            </button>
          </motion.div>
        )}

        {step === "verify" && (
          <motion.div
            key="verify"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="px-6 pb-10"
          >
            {method === "app" && (
              <>
                <p className="text-sm text-foreground/65 leading-relaxed">
                  Scan this code in your authenticator app, or copy the secret manually.
                </p>
                <div className="mt-5 rounded-3xl bg-foreground/[0.04] p-6 flex flex-col items-center">
                  <div className="w-40 h-40 rounded-2xl bg-foreground p-3">
                    <div className="w-full h-full rounded-lg bg-background grid grid-cols-8 grid-rows-8 gap-0.5 p-2">
                      {Array.from({ length: 64 }).map((_, i) => (
                        <div key={i} className={(i * 7 + 3) % 3 === 0 ? "bg-foreground" : ""} />
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={copy}
                    className="mt-4 flex items-center gap-2 px-4 h-9 rounded-full bg-background text-xs font-mono tracking-wider"
                  >
                    {SECRET} <Copy className="w-3 h-3" />
                  </button>
                </div>
              </>
            )}

            {method !== "app" && (
              <p className="text-sm text-foreground/65 leading-relaxed">
                We sent a 6-digit code to {method === "sms" ? "•••• 5678" : "adaeze@bazepay.com"}. Enter it below.
              </p>
            )}

            <p className="text-[11px] uppercase tracking-widest text-foreground/45 font-semibold mt-6 mb-3">
              Enter 6-digit code
            </p>
            <motion.div
              animate={shake ? { x: [-8, 8, -6, 6, -3, 3, 0] } : { x: 0 }}
              transition={{ duration: 0.4 }}
            >
              <input
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={code}
                onChange={(e) => verify(e.target.value.replace(/\D/g, ""))}
                placeholder="••••••"
                className="w-full h-14 rounded-2xl bg-foreground/[0.06] text-center font-display text-2xl tracking-[0.5em] outline-none focus:ring-2 ring-primary/40"
                autoFocus
              />
            </motion.div>

            <p className="text-[11px] text-foreground/45 mt-3 text-center">
              Hint for prototype: enter <span className="font-mono">123456</span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
