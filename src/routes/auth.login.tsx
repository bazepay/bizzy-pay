import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { PhoneFrame } from "@/components/phone-frame";
import { Button } from "@/components/ui/button";
import { Fingerprint, Delete } from "lucide-react";

export const Route = createFileRoute("/auth/login")({
  component: Login,
});

function Login() {
  const [pin, setPin] = useState("");
  const nav = useNavigate();

  const press = (k: string) => {
    if (k === "back") return setPin((p) => p.slice(0, -1));
    if (pin.length >= 4) return;
    const next = pin + k;
    setPin(next);
    if (next.length === 4) setTimeout(() => nav({ to: "/_app/home" }), 250);
  };

  return (
    <PhoneFrame>
      <div className="min-h-screen md:h-[860px] bg-gradient-hero text-white flex flex-col p-6">
        <div className="flex-1 flex flex-col items-center justify-center gap-10">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center space-y-3">
            <div className="w-20 h-20 rounded-3xl bg-gradient-gold mx-auto flex items-center justify-center text-3xl font-display font-bold text-[oklch(0.2_0.05_80)]">
              A
            </div>
            <h1 className="text-2xl font-bold">Welcome back, Adaeze</h1>
            <p className="text-white/60 text-sm">Enter your PIN to unlock</p>
          </motion.div>

          <div className="flex gap-4">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-4 h-4 rounded-full border-2 border-white/40 ${pin.length > i ? "bg-gold border-gold" : ""}`}
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto w-full">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((n) => (
            <button
              key={n}
              onClick={() => press(n)}
              className="h-16 rounded-2xl bg-white/10 backdrop-blur text-2xl font-display font-semibold hover:bg-white/15 active:scale-95 transition"
            >
              {n}
            </button>
          ))}
          <button onClick={() => nav({ to: "/_app/home" })} className="h-16 rounded-2xl flex items-center justify-center hover:bg-white/10">
            <Fingerprint className="w-7 h-7 text-gold" />
          </button>
          <button onClick={() => press("0")} className="h-16 rounded-2xl bg-white/10 text-2xl font-display font-semibold hover:bg-white/15 active:scale-95">
            0
          </button>
          <button onClick={() => press("back")} className="h-16 rounded-2xl flex items-center justify-center hover:bg-white/10">
            <Delete className="w-6 h-6" />
          </button>
        </div>

        <Link to="/auth/signup" className="text-center text-sm text-white/60 mt-6 mb-2">
          Don't have an account? <span className="text-gold font-medium">Sign up</span>
        </Link>
        <Button
          variant="ghost"
          onClick={() => nav({ to: "/_app/home" })}
          className="text-white/50 text-xs"
        >
          Demo: skip to app
        </Button>
      </div>
    </PhoneFrame>
  );
}
