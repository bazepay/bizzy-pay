import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { PhoneFrame } from "@/components/phone-frame";

export const Route = createFileRoute("/")({
  component: Splash,
});

function Splash() {
  const navigate = useNavigate();
  useEffect(() => {
    const t = setTimeout(() => navigate({ to: "/onboarding" }), 1800);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <PhoneFrame>
      <div className="relative h-screen md:h-[860px] w-full bg-background text-foreground flex flex-col items-center justify-center overflow-hidden">
        {/* Ambient glows — primary only, matching app palette */}
        <div className="absolute -top-24 -left-20 w-72 h-72 rounded-full bg-primary/30 blur-3xl" />
        <div className="absolute -bottom-28 -right-20 w-80 h-80 rounded-full bg-primary/25 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] rounded-full bg-primary/10 blur-3xl" />

        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="relative flex flex-col items-center gap-5"
        >
          <Logo />
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-[11px] font-semibold tracking-[0.32em] text-foreground/45 uppercase"
          >
            Bank without borders
          </motion.p>
        </motion.div>

        {/* Loading dots */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="absolute bottom-16 flex gap-1.5"
        >
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.18 }}
              className="w-1.5 h-1.5 rounded-full bg-primary"
            />
          ))}
        </motion.div>
      </div>
    </PhoneFrame>
  );
}

export function Logo({ size = 56 }: { size?: number }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="rounded-2xl bg-gradient-to-br from-lime to-[oklch(0.85_0.2_130)] flex items-center justify-center font-display font-bold text-[oklch(0.2_0.05_80)] shadow-[0_20px_40px_-15px_oklch(0.92_0.21_120_/_0.6)]"
        style={{ width: size, height: size, fontSize: size * 0.5 }}
      >
        B
      </div>
      <span className="font-display font-bold text-3xl tracking-tight">BazePay</span>
    </div>
  );
}
