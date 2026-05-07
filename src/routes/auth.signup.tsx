import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { PhoneFrame } from "@/components/phone-frame";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Mail, Phone } from "lucide-react";

export const Route = createFileRoute("/auth/signup")({
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
    if (v && i < 5) {
      const el = document.getElementById(`otp-${i + 1}`);
      el?.focus();
    }
    if (next.every((d) => d) && next.join("") === "123456") {
      setTimeout(() => nav({ to: "/kyc" }), 300);
    }
  };

  return (
    <PhoneFrame>
      <div className="min-h-screen md:h-[860px] bg-background flex flex-col">
        <header className="p-6 flex items-center gap-4">
          <Link to="/onboarding" className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="text-sm text-muted-foreground">Step {step === "identifier" ? 1 : 2} of 2</span>
        </header>

        {step === "identifier" ? (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 px-6 flex flex-col">
            <h1 className="text-3xl font-bold">Create your account</h1>
            <p className="text-muted-foreground mt-2">We'll send you a one-time code to verify.</p>

            <div className="flex gap-2 mt-8 p-1 bg-muted rounded-xl">
              <button
                onClick={() => setMode("phone")}
                className={`flex-1 py-2 rounded-lg text-sm font-medium ${mode === "phone" ? "bg-background shadow-sm" : "text-muted-foreground"}`}
              >
                Phone
              </button>
              <button
                onClick={() => setMode("email")}
                className={`flex-1 py-2 rounded-lg text-sm font-medium ${mode === "email" ? "bg-background shadow-sm" : "text-muted-foreground"}`}
              >
                Email
              </button>
            </div>

            <div className="mt-6 relative">
              {mode === "phone" ? <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" /> : <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />}
              <Input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={mode === "phone" ? "+234 803 555 0142" : "you@example.com"}
                className="h-14 pl-12 rounded-2xl text-base"
              />
            </div>

            <Button
              onClick={() => setStep("otp")}
              className="mt-auto mb-6 h-12 bg-primary text-primary-foreground rounded-2xl font-semibold"
            >
              Send code
            </Button>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 px-6 flex flex-col">
            <h1 className="text-3xl font-bold">Enter the 6-digit code</h1>
            <p className="text-muted-foreground mt-2">
              Sent to <span className="text-foreground font-medium">{value || "+234 803 555 0142"}</span>
            </p>

            <div className="flex gap-2 mt-10 justify-center">
              {otp.map((d, i) => (
                <input
                  key={i}
                  id={`otp-${i}`}
                  value={d}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  maxLength={1}
                  className="w-12 h-14 rounded-xl border-2 border-input bg-background text-center text-xl font-bold focus:border-primary outline-none"
                />
              ))}
            </div>

            <p className="text-center text-xs text-muted-foreground mt-6">
              Use code <span className="font-mono font-bold text-primary">123456</span> to continue
            </p>

            <Button
              onClick={() => nav({ to: "/kyc" })}
              className="mt-auto mb-6 h-12 bg-primary text-primary-foreground rounded-2xl font-semibold"
            >
              Verify
            </Button>
          </motion.div>
        )}
      </div>
    </PhoneFrame>
  );
}
