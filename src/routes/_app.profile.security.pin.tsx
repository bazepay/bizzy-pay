import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, KeyRound, Check } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/profile/security/pin")({
  head: () => ({
    meta: [
      { title: "Change PIN — BazePay" },
      { name: "description", content: "Update your BazePay transaction PIN." },
    ],
  }),
  component: ChangePinPage,
});

type Step = "current" | "new" | "confirm" | "done";

const MOCK_CURRENT = "1234";

function ChangePinPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("current");
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [shake, setShake] = useState(false);

  const value = step === "current" ? current : step === "new" ? next : confirm;
  const setValue = step === "current" ? setCurrent : step === "new" ? setNext : setConfirm;

  useEffect(() => {
    if (value.length < 4) return;
    if (step === "current") {
      if (current === MOCK_CURRENT) {
        setTimeout(() => setStep("new"), 150);
      } else {
        setShake(true);
        toast.error("Incorrect PIN");
        setTimeout(() => { setCurrent(""); setShake(false); }, 450);
      }
    } else if (step === "new") {
      if (next === current) {
        setShake(true);
        toast.error("New PIN must be different");
        setTimeout(() => { setNext(""); setShake(false); }, 450);
      } else {
        setTimeout(() => setStep("confirm"), 150);
      }
    } else if (step === "confirm") {
      if (confirm === next) {
        setTimeout(() => {
          setStep("done");
          toast.success("PIN updated");
        }, 200);
      } else {
        setShake(true);
        toast.error("PINs don't match");
        setTimeout(() => { setConfirm(""); setShake(false); }, 450);
      }
    }
  }, [value, step, current, next, confirm]);

  const press = (d: string) => {
    if (value.length >= 4) return;
    setValue(value + d);
  };
  const back = () => setValue(value.slice(0, -1));

  const titles: Record<Step, { t: string; s: string }> = {
    current: { t: "Enter current PIN", s: "Use your existing 4-digit PIN" },
    new: { t: "Create new PIN", s: "Pick something only you know" },
    confirm: { t: "Confirm new PIN", s: "Type it once more" },
    done: { t: "PIN updated", s: "Your new PIN is active" },
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
        <h1 className="font-display text-2xl font-bold mt-6">{titles.done.t}</h1>
        <p className="text-sm text-foreground/60 mt-2">{titles.done.s}</p>
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
      <header className="px-6 pt-12 pb-2 flex items-center gap-4">
        <button
          onClick={() => navigate({ to: "/profile" })}
          className="w-10 h-10 rounded-full bg-foreground/10 flex items-center justify-center"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 h-1.5 bg-foreground/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary"
            animate={{ width: step === "current" ? "33%" : step === "new" ? "66%" : "100%" }}
            transition={{ type: "spring", damping: 22, stiffness: 200 }}
          />
        </div>
      </header>

      <div className="px-6 pt-6 flex flex-col items-center text-center">
        <div className="w-14 h-14 rounded-full bg-primary/12 flex items-center justify-center text-primary">
          <KeyRound className="w-6 h-6" />
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            <h1 className="font-display text-2xl font-bold mt-5">{titles[step].t}</h1>
            <p className="text-sm text-foreground/55 mt-1.5">{titles[step].s}</p>
          </motion.div>
        </AnimatePresence>

        <motion.div
          animate={shake ? { x: [-8, 8, -6, 6, -3, 3, 0] } : { x: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-3 mt-8"
        >
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className={`w-3.5 h-3.5 rounded-full transition-all ${
                i < value.length ? "bg-primary scale-110" : "bg-foreground/15"
              }`}
            />
          ))}
        </motion.div>
      </div>

      <div className="mt-auto px-8 pb-10 pt-8">
        <div className="grid grid-cols-3 gap-3">
          {["1","2","3","4","5","6","7","8","9"].map((d) => (
            <button
              key={d}
              onClick={() => press(d)}
              className="h-14 rounded-2xl bg-foreground/[0.06] font-display text-2xl font-semibold active:scale-95 active:bg-foreground/10 transition"
            >
              {d}
            </button>
          ))}
          <div />
          <button
            onClick={() => press("0")}
            className="h-14 rounded-2xl bg-foreground/[0.06] font-display text-2xl font-semibold active:scale-95 active:bg-foreground/10 transition"
          >
            0
          </button>
          <button
            onClick={back}
            className="h-14 rounded-2xl text-sm font-semibold text-foreground/70 active:bg-foreground/[0.06] transition"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
