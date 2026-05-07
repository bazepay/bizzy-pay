import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PhoneFrame } from "@/components/phone-frame";
import { Button } from "@/components/ui/button";
import { Globe2, CreditCard, Plane } from "lucide-react";

export const Route = createFileRoute("/onboarding")({
  component: Onboarding,
});

const slides = [
  {
    icon: Globe2,
    title: "Banking for the Nigerian diaspora",
    body: "Send, spend and pay bills back home — without BVN headaches or branch visits.",
  },
  {
    icon: CreditCard,
    title: "Instant Naira virtual cards",
    body: "Issue a card in seconds. Subscribe, shop and travel with full control.",
  },
  {
    icon: Plane,
    title: "Land in Nigeria, ready to go",
    body: "Verify with a selfie, fund your wallet and grab an eSIM before you board.",
  },
];

function Onboarding() {
  const [i, setI] = useState(0);
  const nav = useNavigate();
  const Icon = slides[i].icon;

  return (
    <PhoneFrame>
      <div className="h-screen md:h-[860px] flex flex-col bg-background">
        <div className="flex-1 bg-gradient-hero text-white p-8 flex flex-col">
          <div className="flex justify-end pt-6">
            <button
              className="text-sm text-white/70"
              onClick={() => nav({ to: "/auth/signup" })}
            >
              Skip
            </button>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.35 }}
                className="flex flex-col items-center gap-8"
              >
                <div className="w-32 h-32 rounded-3xl bg-gradient-gold flex items-center justify-center shadow-glow">
                  <Icon className="w-14 h-14 text-[oklch(0.2_0.05_80)]" />
                </div>
                <div className="space-y-3 max-w-xs">
                  <h1 className="text-2xl font-bold">{slides[i].title}</h1>
                  <p className="text-white/70 text-sm leading-relaxed">{slides[i].body}</p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="flex justify-center gap-2 pb-8">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setI(idx)}
                className={`h-1.5 rounded-full transition-all ${
                  idx === i ? "w-8 bg-gold" : "w-1.5 bg-white/30"
                }`}
              />
            ))}
          </div>
        </div>
        <div className="p-6 space-y-3 bg-background">
          <Button
            className="w-full h-12 bg-primary text-primary-foreground font-semibold rounded-2xl"
            onClick={() => (i < slides.length - 1 ? setI(i + 1) : nav({ to: "/auth/signup" }))}
          >
            {i < slides.length - 1 ? "Continue" : "Get started"}
          </Button>
          <button
            className="w-full text-sm text-muted-foreground"
            onClick={() => nav({ to: "/auth/login" })}
          >
            I already have an account
          </button>
        </div>
      </div>
    </PhoneFrame>
  );
}
