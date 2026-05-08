import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PhoneFrame } from "@/components/phone-frame";
import { Button } from "@/components/ui/button";
import {
  Camera,
  ShieldCheck,
  ArrowLeft,
  Sparkles,
  Search,
  ChevronRight,
  Check,
  Globe,
  IdCard,
  Landmark,
  BookUser,
} from "lucide-react";
import {
  COUNTRIES,
  idTypesForCountry,
  ID_LABELS,
  type Country,
  type IdType,
} from "@/lib/countries";

export const Route = createFileRoute("/kyc")({
  component: Kyc,
});

type Step = "intro" | "country" | "idType" | "idInput" | "selfie" | "processing" | "done";

const ID_ICONS: Record<IdType, typeof IdCard> = {
  NIN: IdCard,
  BVN: Landmark,
  PASSPORT: BookUser,
};

function Kyc() {
  const [step, setStep] = useState<Step>("intro");
  const [country, setCountry] = useState<Country | null>(null);
  const [idType, setIdType] = useState<IdType | null>(null);
  const [idValue, setIdValue] = useState("");
  const nav = useNavigate();

  useEffect(() => {
    if (step === "processing") {
      const t = setTimeout(() => setStep("done"), 2400);
      return () => clearTimeout(t);
    }
  }, [step]);

  const progress = useMemo(() => {
    return {
      intro: 10,
      country: 25,
      idType: 45,
      idInput: 60,
      selfie: 80,
      processing: 95,
      done: 100,
    }[step];
  }, [step]);

  const goBack = () => {
    if (step === "intro") return nav({ to: "/profile" });
    if (step === "country") return setStep("intro");
    if (step === "idType") return setStep("country");
    if (step === "idInput") return setStep("idType");
    if (step === "selfie") return setStep("idInput");
  };

  return (
    <PhoneFrame>
      <div className="min-h-screen md:h-[860px] bg-background text-foreground flex flex-col">
        {step !== "done" && step !== "processing" && (
          <header className="p-6 flex items-center gap-4">
            <button
              onClick={goBack}
              className="w-10 h-10 rounded-full bg-muted flex items-center justify-center"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${progress}%` }}
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
                  { i: Globe, t: "Pick your country", s: "We tailor accepted IDs to where you live." },
                  { i: IdCard, t: "Provide an ID number", s: "NIN/BVN in Nigeria, passport elsewhere." },
                  { i: Camera, t: "Take a quick selfie", s: "Liveness check matched to your ID." },
                  { i: ShieldCheck, t: "Verified instantly", s: "Most checks complete in seconds." },
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
              <Button onClick={() => setStep("country")} className="mt-auto mb-6 h-12 bg-primary text-primary-foreground rounded-2xl font-semibold">
                Start verification
              </Button>
            </motion.div>
          )}

          {step === "country" && (
            <CountryStep
              key="country"
              selected={country}
              onSelect={(c) => {
                setCountry(c);
                setIdType(null);
                setStep("idType");
              }}
            />
          )}

          {step === "idType" && country && (
            <motion.div key="idType" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 px-6 flex flex-col">
              <h2 className="text-xl font-bold">Choose ID document</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Accepted IDs in <span className="font-medium text-foreground">{country.flag} {country.name}</span>.
              </p>
              <div className="mt-6 space-y-3">
                {idTypesForCountry(country.code).map((t) => {
                  const Icon = ID_ICONS[t];
                  const selected = idType === t;
                  return (
                    <button
                      key={t}
                      onClick={() => setIdType(t)}
                      className={`w-full p-4 rounded-2xl border-2 text-left transition flex items-center gap-3 ${
                        selected ? "border-primary bg-primary/5" : "border-border bg-card"
                      }`}
                    >
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${selected ? "bg-primary text-primary-foreground" : "bg-muted text-foreground/70"}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold">{ID_LABELS[t].title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{ID_LABELS[t].desc}</p>
                      </div>
                      {selected && <Check className="w-5 h-5 text-primary" />}
                    </button>
                  );
                })}
              </div>
              <Button
                disabled={!idType}
                onClick={() => setStep("idInput")}
                className="mt-auto mb-6 h-12 bg-primary text-primary-foreground rounded-2xl font-semibold disabled:opacity-50"
              >
                Continue
              </Button>
            </motion.div>
          )}

          {step === "idInput" && idType && (
            <motion.div key="idInput" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 px-6 flex flex-col">
              <h2 className="text-xl font-bold">{ID_LABELS[idType].title}</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {idType === "PASSPORT"
                  ? "Enter your passport number exactly as shown."
                  : "Enter your 11-digit number."}
              </p>
              <label className="block mt-6">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                  {idType === "PASSPORT" ? "Passport number" : `${idType} number`}
                </span>
                <input
                  autoFocus
                  inputMode={idType === "PASSPORT" ? "text" : "numeric"}
                  maxLength={idType === "PASSPORT" ? 12 : 11}
                  value={idValue}
                  onChange={(e) => {
                    const v = idType === "PASSPORT"
                      ? e.target.value.toUpperCase()
                      : e.target.value.replace(/\D/g, "");
                    setIdValue(v);
                  }}
                  placeholder={idType === "PASSPORT" ? "A12345678" : "12345678901"}
                  className="mt-2 w-full h-12 px-4 rounded-2xl bg-muted text-base outline-none focus:ring-2 ring-primary/40 tracking-wider"
                />
              </label>
              <p className="text-[11px] text-muted-foreground mt-2 px-1">
                We use Smile ID to match this against the official record.
              </p>
              <Button
                disabled={idType === "PASSPORT" ? idValue.length < 6 : idValue.length !== 11}
                onClick={() => setStep("selfie")}
                className="mt-auto mb-6 h-12 bg-primary text-primary-foreground rounded-2xl font-semibold disabled:opacity-50"
              >
                Continue
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

              <Button onClick={() => setStep("processing")} className="mt-auto mb-6 w-full h-12 bg-primary text-primary-foreground rounded-2xl font-semibold">
                Capture
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
              <Button onClick={() => nav({ to: "/profile" })} className="mb-6 h-12 bg-primary text-primary-foreground rounded-2xl font-semibold">
                Back to profile
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PhoneFrame>
  );
}

function CountryStep({
  selected,
  onSelect,
}: {
  selected: Country | null;
  onSelect: (c: Country) => void;
}) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return COUNTRIES;
    return COUNTRIES.filter(
      (c) => c.name.toLowerCase().includes(term) || c.code.toLowerCase().includes(term),
    );
  }, [q]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 px-6 flex flex-col min-h-0"
    >
      <h2 className="text-xl font-bold">Select your country</h2>
      <p className="text-sm text-muted-foreground mt-1">
        We support 100+ countries through Smile ID.
      </p>

      <div className="mt-4 relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search country"
          className="w-full h-11 pl-10 pr-4 rounded-2xl bg-muted text-sm outline-none focus:ring-2 ring-primary/40"
        />
      </div>

      <div className="mt-4 flex-1 overflow-y-auto pb-6 -mx-6 px-6 no-scrollbar">
        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No country matches "{q}".
          </p>
        ) : (
          <ul className="divide-y divide-border rounded-2xl bg-card text-card-foreground border border-border overflow-hidden">
            {filtered.map((c) => {
              const isSel = selected?.code === c.code;
              return (
                <li key={c.code}>
                  <button
                    onClick={() => onSelect(c)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left active:bg-muted transition"
                  >
                    <span className="text-2xl leading-none">{c.flag}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{c.name}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {idTypesForCountry(c.code).join(" · ")} + Selfie
                      </p>
                    </div>
                    {isSel ? (
                      <Check className="w-4 h-4 text-primary" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </motion.div>
  );
}
