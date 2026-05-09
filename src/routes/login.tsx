import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login, useSession } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — BazePay Admin" },
      { name: "description", content: "Secure sign-in for BazePay back-office staff." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const session = useSession();
  const navigate = useNavigate();
  const [email, setEmail] = useState("Admin@bazepay.com");
  const [password, setPassword] = useState("admin123");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"creds" | "totp">("creds");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (session) navigate({ to: "/", replace: true });
  }, [session, navigate]);

  const submitCreds = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return toast.error("Enter email and password");
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      setStep("totp");
    }, 600);
  };

  const submitTotp = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) return toast.error("Enter 6-digit code");
    setBusy(true);
    setTimeout(() => {
      login(email);
      toast.success("Welcome back");
      navigate({ to: "/", replace: true });
    }, 500);
  };

  return (
    <div className="min-h-screen w-full grid lg:grid-cols-2 bg-background">
      {/* Brand panel */}
      <div className="hidden lg:flex relative bg-gradient-hero text-primary-foreground p-12 flex-col justify-between overflow-hidden">
        <div className="relative z-10 flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-gold flex items-center justify-center font-display text-lg font-bold text-gold-foreground">
            B
          </div>
          <div className="leading-tight">
            <div className="font-display text-base font-bold">BazePay</div>
            <div className="text-xs text-primary-foreground/60 uppercase tracking-wider">Admin Console</div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 max-w-md"
        >
          <h1 className="font-display text-4xl font-bold leading-tight">
            Run the rails behind every BazePay transaction.
          </h1>
          <p className="mt-4 text-primary-foreground/70 text-sm leading-relaxed">
            Manage users, KYC, money movement, cards, eSIM and support — all in one secure console.
          </p>
        </motion.div>

        <div className="relative z-10 text-xs text-primary-foreground/50">
          © {new Date().getFullYear()} BazePay. Internal use only.
        </div>

        {/* deco */}
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-gradient-gold opacity-10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-primary opacity-30 blur-3xl" />
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="h-9 w-9 rounded-lg bg-gradient-gold flex items-center justify-center font-display text-base font-bold text-gold-foreground">
              B
            </div>
            <div className="font-display text-base font-bold">BazePay Admin</div>
          </div>

          {step === "creds" ? (
            <>
              <h2 className="font-display text-2xl font-bold">Sign in</h2>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Use your work email. 2FA required on every login.
              </p>

              <form onSubmit={submitCreds} className="mt-8 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email">Work email</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@bazepay.com"
                  />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <button type="button" className="text-xs text-primary hover:underline">
                      Forgot?
                    </button>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={busy}>
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Continue"}
                </Button>
              </form>
            </>
          ) : (
            <>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-5">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h2 className="font-display text-2xl font-bold">Two-factor</h2>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Enter the 6-digit code from your authenticator app.
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                (Mock: enter any 6 digits)
              </p>

              <form onSubmit={submitTotp} className="mt-8 space-y-4">
                <Input
                  inputMode="numeric"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                  className="text-center font-display text-2xl tracking-[0.5em] h-14"
                  autoFocus
                />
                <Button type="submit" className="w-full" disabled={busy || code.length !== 6}>
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify & sign in"}
                </Button>
                <button
                  type="button"
                  onClick={() => setStep("creds")}
                  className="text-xs text-muted-foreground hover:text-foreground w-full text-center"
                >
                  ← Use a different account
                </button>
              </form>
            </>
          )}

          <div className="mt-10 pt-6 border-t border-border text-xs text-muted-foreground text-center">
            Restricted access. All sessions are logged & monitored.
          </div>
        </motion.div>
      </div>
    </div>
  );
}
