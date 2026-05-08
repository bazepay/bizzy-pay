import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, X } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import { hasPin, verifyPin } from "@/lib/pin-store";

export function PinPromptSheet({
  open,
  onClose,
  onSuccess,
  title = "Enter PIN",
  subtitle = "Authorise this transaction",
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title?: string;
  subtitle?: string;
}) {
  const [pin, setPin] = useState("");
  const [shake, setShake] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) setPin("");
  }, [open]);

  // If user has not set a PIN yet, redirect to setup.
  useEffect(() => {
    if (open && !hasPin()) {
      toast.info("Set up your transaction PIN first");
      onClose();
      navigate({ to: "/auth/pin-setup" });
    }
  }, [open, onClose, navigate]);

  useEffect(() => {
    if (!open || pin.length < 4) return;
    if (verifyPin(pin)) {
      const t = setTimeout(() => {
        onSuccess();
        setPin("");
      }, 150);
      return () => clearTimeout(t);
    } else {
      setShake(true);
      toast.error("Incorrect PIN");
      const t = setTimeout(() => {
        setPin("");
        setShake(false);
      }, 450);
      return () => clearTimeout(t);
    }
  }, [pin, open, onSuccess]);

  const press = (d: string) => setPin((p) => (p.length < 4 ? p + d : p));
  const back = () => setPin((p) => p.slice(0, -1));

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[80] flex items-end">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/65 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            className="relative w-full bg-card text-card-foreground rounded-t-[2rem] pt-3 pb-8"
          >
            <div className="w-10 h-1 rounded-full bg-card-foreground/15 mx-auto" />
            <div className="px-6 mt-3 flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="w-12 h-12 rounded-full bg-primary/15 text-primary flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="font-display font-bold text-lg mt-3">{title}</h3>
                <p className="text-[12px] text-card-foreground/60 mt-0.5">{subtitle}</p>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-card-foreground/[0.06] flex items-center justify-center"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <motion.div
              animate={shake ? { x: [-8, 8, -6, 6, -3, 3, 0] } : { x: 0 }}
              transition={{ duration: 0.4 }}
              className="flex items-center gap-3 justify-center mt-7"
            >
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-3.5 h-3.5 rounded-full transition-all ${
                    i < pin.length ? "bg-primary scale-110" : "bg-card-foreground/15"
                  }`}
                />
              ))}
            </motion.div>

            <div className="px-8 mt-7">
              <div className="grid grid-cols-3 gap-2">
                {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
                  <button
                    key={d}
                    onClick={() => press(d)}
                    className="h-12 rounded-2xl bg-card-foreground/[0.05] font-display text-xl font-semibold active:scale-95 active:bg-card-foreground/10 transition"
                  >
                    {d}
                  </button>
                ))}
                <div />
                <button
                  onClick={() => press("0")}
                  className="h-12 rounded-2xl bg-card-foreground/[0.05] font-display text-xl font-semibold active:scale-95 active:bg-card-foreground/10 transition"
                >
                  0
                </button>
                <button
                  onClick={back}
                  className="h-12 rounded-2xl text-[13px] font-semibold text-card-foreground/70 active:bg-card-foreground/[0.06] transition"
                >
                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/**
 * Hook returning a `requirePin(action)` function and a `<PinGate />` element to render.
 *
 *   const { requirePin, pinGate } = usePinGate();
 *   ...
 *   <button onClick={() => requirePin(() => doPay())}>Pay</button>
 *   {pinGate}
 */
export function usePinGate(opts?: { title?: string; subtitle?: string }) {
  const [pending, setPending] = useState<null | (() => void)>(null);

  const requirePin = (action: () => void) => setPending(() => action);

  const pinGate = (
    <PinPromptSheet
      open={!!pending}
      onClose={() => setPending(null)}
      onSuccess={() => {
        pending?.();
        setPending(null);
      }}
      title={opts?.title}
      subtitle={opts?.subtitle}
    />
  );

  return { requirePin, pinGate };
}
