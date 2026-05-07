import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PhoneFrame } from "@/components/phone-frame";
import { Button } from "@/components/ui/button";
import { Camera, FileCheck, ShieldCheck, ArrowLeft, Sparkles } from "lucide-react";

export const Route = createFileRoute("/kyc")({
  component: Kyc,
});

type Step = "intro" | "selfie" | "document" | "processing" | "done";

function Kyc() {
  const [step, setStep] = useState<Step>("intro");
  const [doc, setDoc] = useState<string | null>(null);
  const nav = useNavigate();

  useEffect(() => {
    if (step === "processing") {
      const t = setTimeout(() => setStep("done"), 2400);
      return () => clearTimeout(t);
    }
  }, [step]);

  return (
    <PhoneFrame>
      <div className="min-h-screen md:h-[860px] bg-background flex flex-col">
        {step !== "done" && step !== "processing" && (
          <header className="p-6 flex items-center gap-4">
            <button
              onClick={() => (step === "intro" ? nav({ to: "/auth/signup" }) : setStep("intro"))}
              className="w-10 h-10 rounded-full bg-muted flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: step === "intro" ? "20%" : step === "selfie" ? "50%" : "80%" }}
              />
            </div>
          </header>
        )}

        <AnimatePresence mode="wait">
          {step === "intro" && (
            <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 px-6 flex flex-col">
              <h1 className="text-3xl font-bold">Verify your identity</h1>
              <p className="text-muted-foreground mt-2">Powered by Smile ID. Takes about 2 minutes.</p>
              <div className="mt-8 space-y-3">
                {[
                  { i: Camera, t: "Take a quick selfie", s: "We match it with your ID for liveness." },
                  { i: FileCheck, t: "Upload an ID", s: "Passport, NIN slip, or BVN reference." },
                  { i: ShieldCheck, t: "Get verified instantly", s: "Unlock the full BazePay experience." },
                ].map((it, idx) => (
                  <div key={idx} className="flex gap-4 p-4 rounded-2xl bg-muted/60">
                    <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shrink-0">
                      <it.i className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold">{it.t}</p>
                      <p className="text-sm text-muted-foreground">{it.s}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button onClick={() => setStep("selfie")} className="mt-auto mb-6 h-12 bg-primary text-primary-foreground rounded-2xl font-semibold">
                Start verification
              </Button>
            </motion.div>
          )}

          {step === "selfie" && (
            <motion.div key="selfie" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 px-6 flex flex-col items-center">
              <h2 className="text-xl font-bold">Position your face</h2>
              <p className="text-sm text-muted-foreground mt-1">Look into the camera and stay still.</p>

              <div className="relative mt-10 w-64 h-80 rounded-[8rem] bg-gradient-hero overflow-hidden flex items-center justify-center shadow-card">
                <div className="absolute inset-3 rounded-[7rem] border-2 border-dashed border-white/30" />
                <motion.div
                  className="absolute left-3 right-3 h-1 bg-gold rounded-full shadow-[0_0_20px_rgba(255,200,80,0.8)]"
                  animate={{ top: ["10%", "90%", "10%"] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                />
                <div className="text-6xl">👤</div>
              </div>

              <Button onClick={() => setStep("document")} className="mt-auto mb-6 w-full h-12 bg-primary text-primary-foreground rounded-2xl font-semibold">
                Capture
              </Button>
            </motion.div>
          )}

          {step === "document" && (
            <motion.div key="doc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 px-6 flex flex-col">
              <h2 className="text-xl font-bold">Choose an ID document</h2>
              <p className="text-sm text-muted-foreground mt-1">We accept any of these.</p>
              <div className="mt-6 space-y-3">
                {["International Passport", "National ID (NIN)", "BVN Verification"].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDoc(d)}
                    className={`w-full p-4 rounded-2xl border-2 text-left transition ${
                      doc === d ? "border-primary bg-primary/5" : "border-border bg-card"
                    }`}
                  >
                    <p className="font-semibold">{d}</p>
                    <p className="text-xs text-muted-foreground mt-1">Tap to select</p>
                  </button>
                ))}
              </div>
              <Button
                disabled={!doc}
                onClick={() => setStep("processing")}
                className="mt-auto mb-6 h-12 bg-primary text-primary-foreground rounded-2xl font-semibold disabled:opacity-50"
              >
                Submit for review
              </Button>
            </motion.div>
          )}

          {step === "processing" && (
            <motion.div key="proc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col items-center justify-center gap-6">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1.4, ease: "linear" }}
                className="w-20 h-20 rounded-full border-4 border-muted border-t-primary"
              />
              <div className="text-center">
                <p className="font-semibold text-lg">Verifying with Smile ID</p>
                <p className="text-sm text-muted-foreground">Matching biometrics…</p>
              </div>
            </motion.div>
          )}

          {step === "done" && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 flex flex-col px-6">
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                  className="w-24 h-24 rounded-full bg-gradient-gold flex items-center justify-center shadow-glow"
                >
                  <Sparkles className="w-12 h-12 text-[oklch(0.2_0.05_80)]" />
                </motion.div>
                <h1 className="mt-6 text-2xl font-bold">You're verified!</h1>
                <p className="text-muted-foreground mt-2 max-w-xs">
                  Your <span className="text-foreground font-semibold">Basic Tier</span> is active. Complete profile details later to upgrade to Enhanced.
                </p>
                <div className="mt-8 px-4 py-3 rounded-2xl bg-primary/10 text-primary text-sm font-medium">
                  Daily limit: ₦200,000
                </div>
              </div>
              <Button onClick={() => nav({ to: "/_app/home" })} className="mb-6 h-12 bg-primary text-primary-foreground rounded-2xl font-semibold">
                Enter BazePay
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PhoneFrame>
  );
}
