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
      <div className="relative h-screen md:h-[860px] w-full bg-gradient-hero flex flex-col items-center justify-center text-white overflow-hidden">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="flex flex-col items-center gap-4"
        >
          <Logo />
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-sm tracking-[0.3em] text-white/60 uppercase"
          >
            Bank without borders
          </motion.p>
        </motion.div>
        <div className="absolute -bottom-32 -right-20 w-80 h-80 rounded-full bg-gradient-gold opacity-30 blur-3xl" />
        <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-primary opacity-40 blur-3xl" />
      </div>
    </PhoneFrame>
  );
}

export function Logo({ size = 48 }: { size?: number }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="rounded-2xl bg-gradient-gold flex items-center justify-center font-display font-bold text-[oklch(0.2_0.05_80)]"
        style={{ width: size, height: size, fontSize: size * 0.5 }}
      >
        B
      </div>
      <span className="font-display font-bold text-3xl tracking-tight">BazePay</span>
    </div>
  );
}
