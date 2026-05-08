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
      <div className="min-h-full bg-background text-foreground flex flex-col">
        <div className="h-10" />

        {/* Brand */}
        <div className="px-6 pt-4 flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-lime to-[oklch(0.85_0.2_130)] flex items-center justify-center font-display font-bold text-[14px] text-[oklch(0.2_0.05_80)]">
            B
          </div>
          <span className="font-display font-bold text-[15px] tracking-tight">BazePay</span>
        </div>

        {/* Heading */}
        <div className="px-6 pt-8">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className="font-display text-4xl font-bold tracking-tight">
              Welcome back
            </h1>
            <p className="text-sm text-foreground/55 mt-2">
              Sign in to your BazePay account.
            </p>
          </motion.div>
        </div>

        {/* Sheet */}
        <div className="flex-1 mt-7 bg-card text-card-foreground rounded-t-[2rem] px-6 pt-7 pb-8 flex flex-col">
          {/* Mode toggle */}
          <div className="grid grid-cols-2 p-1 bg-muted rounded-2xl">
            {(["phone", "email"] as const).map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMode(m);
                  setIdentifier("");
                }}
                className={`relative h-10 rounded-xl text-[13px] font-semibold capitalize transition ${
                  mode === m ? "text-card-foreground" : "text-card-foreground/50"
                }`}
              >
                {mode === m && (
                  <motion.div
                    layoutId="login-mode-pill"
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

          {/* Identifier */}
          <div className="mt-5 relative">
            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[13px] font-semibold text-card-foreground/40">
              {mode === "phone" ? "+234" : "@"}
            </span>
            <input
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder={mode === "phone" ? "803 555 0142" : "you@example.com"}
              className="w-full h-14 pl-16 pr-4 rounded-2xl bg-muted border border-transparent text-card-foreground placeholder:text-card-foreground/30 text-[15px] focus:outline-none focus:border-primary/40 transition"
            />
          </div>

          {/* Password */}
          <div className="mt-3 relative">
            <input
              type={showPw ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full h-14 pl-5 pr-12 rounded-2xl bg-muted border border-transparent text-card-foreground placeholder:text-card-foreground/30 text-[15px] focus:outline-none focus:border-primary/40 transition"
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center text-card-foreground/50 hover:text-card-foreground hover:bg-foreground/[0.06] transition"
            >
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <div className="mt-3 flex justify-end">
            <button className="text-[12px] font-semibold text-card-foreground/55 hover:text-primary transition">
              Forgot password?
            </button>
          </div>

          {/* CTA + biometrics */}
          <div className="mt-auto">
            <div className="flex items-center gap-3">
              <button
                disabled={!canSubmit}
                onClick={() => nav({ to: "/home" })}
                className="group flex-1 flex items-center justify-center gap-2 h-14 rounded-full bg-lime text-lime-foreground font-bold text-sm active:scale-[0.98] transition disabled:opacity-40"
              >
                Sign in
                <ArrowRight className="w-4 h-4 group-active:translate-x-0.5 transition" />
              </button>
              <button
                onClick={() => nav({ to: "/home" })}
                aria-label="Sign in with biometrics"
                className="w-14 h-14 rounded-full bg-primary/[0.08] border border-primary/15 flex items-center justify-center hover:bg-primary/[0.12] active:scale-95 transition"
              >
                <Fingerprint className="w-6 h-6 text-primary" />
              </button>
            </div>

            <p className="text-center text-[12.5px] text-card-foreground/55 mt-4">
              New to BazePay?{" "}
              <Link to="/auth/signup" className="text-primary font-semibold">
                Create account
              </Link>
            </p>

            <button
              onClick={() => nav({ to: "/home" })}
              className="w-full text-center text-[11px] text-card-foreground/30 mt-3"
            >
              Demo: skip to app
            </button>
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}
