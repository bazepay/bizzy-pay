import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useMemo, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PhoneFrame } from "@/components/phone-frame";
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

  const progress = useMemo(
    () =>
      ({
        intro: 10,
        country: 25,
        idType: 45,
        idInput: 60,
        selfie: 80,
        processing: 95,
        done: 100,
      })[step],
    [step],
  );

  const goBack = () => {
    if (step === "intro") return nav({ to: "/profile" });
    if (step === "country") return setStep("intro");
    if (step === "idType") return setStep("country");
    if (step === "idInput") return setStep("idType");
    if (step === "selfie") return setStep("idInput");
  };

  return (
    <PhoneFrame>
      <div className="min-h-full bg-background text-foreground flex flex-col">
        <AnimatePresence mode="wait">
          {step === "intro" && (
            <motion.div
              key="intro"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col min-h-screen md:min-h-[860px]"
            >
              {/* Dark hero with illustration */}
              <div className="relative bg-background text-foreground px-6 pt-6 pb-14 overflow-hidden">
                {/* decorative orbs */}
                <div className="absolute -top-16 -right-10 w-56 h-56 rounded-full bg-primary/30 blur-3xl" />
                <div className="absolute top-20 -left-16 w-48 h-48 rounded-full bg-[oklch(0.82_0.16_85)]/25 blur-3xl" />

                <div className="relative flex items-center gap-3">
                  <button
                    onClick={goBack}
                    className="w-10 h-10 rounded-full bg-foreground/10 flex items-center justify-center text-foreground/80 active:scale-95 transition"
                    aria-label="Back"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div className="flex-1 h-1.5 bg-foreground/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Animated shield illustration */}
                <div className="relative mt-8 flex justify-center">
                  <motion.div
                    animate={{ scale: [1, 1.06, 1] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 m-auto w-40 h-40 rounded-full bg-primary/30 blur-2xl"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.04, 1] }}
                    transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                    className="relative w-32 h-36 rounded-[2rem] bg-gradient-to-br from-primary to-[oklch(0.45_0.22_290)] shadow-[0_30px_60px_-15px_oklch(0.55_0.24_280_/_0.7)] flex items-center justify-center ring-1 ring-white/10"
                  >
                    <ShieldCheck className="w-14 h-14 text-white" strokeWidth={2.2} />
                    <motion.span
                      animate={{ scale: [1, 1.4, 1], opacity: [0.9, 0, 0.9] }}
                      transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut" }}
                      className="absolute inset-0 rounded-[2rem] ring-2 ring-white/30"
                    />
                  </motion.div>
                </div>

                <h1 className="font-display text-2xl font-bold mt-8 leading-tight text-center">
                  Verify your identity
                </h1>
                <p className="text-sm text-foreground/55 mt-1.5 text-center">
                  Bank-grade verification in about 2 minutes.
                </p>
              </div>

              {/* White surface */}
              <div className="relative bg-card text-card-foreground rounded-t-[2rem] px-6 pt-7 pb-8 -mt-6 flex-1 flex flex-col">
                <p className="text-[11px] uppercase tracking-widest text-card-foreground/50 font-semibold mb-3 px-1">
                  How it works
                </p>
                <div className="space-y-2.5">
                  {[
                    { i: Globe, t: "Pick your country", s: "We tailor accepted IDs to where you live." },
                    { i: IdCard, t: "Provide an ID number", s: "NIN/BVN in Nigeria, passport elsewhere." },
                    { i: Camera, t: "Take a quick selfie", s: "Liveness check matched to your ID." },
                    { i: ShieldCheck, t: "Verified instantly", s: "Most checks complete in seconds." },
                  ].map((it, idx) => (
                    <div
                      key={idx}
                      className="flex gap-3 p-3.5 rounded-2xl bg-card-foreground/[0.04]"
                    >
                      <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold text-xs">
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <it.i className="w-3.5 h-3.5 text-card-foreground/70" />
                          <p className="font-semibold text-sm">{it.t}</p>
                        </div>
                        <p className="text-xs text-card-foreground/55 mt-0.5">{it.s}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 flex items-center gap-2 text-[11px] text-card-foreground/55">
                  <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                  Your data is encrypted and never shared without consent.
                </div>

                <div className="pt-6 mt-auto">
                  <PrimaryButton onClick={() => setStep("country")}>
                    Start verification
                  </PrimaryButton>
                </div>
              </div>
            </motion.div>
          )}

          {step === "country" && (
            <CountryStep
              key="country"
              progress={progress}
              onBack={goBack}
              selected={country}
              onSelect={(c) => {
                setCountry(c);
                setIdType(null);
                setStep("idType");
              }}
            />
          )}

          {step === "idType" && country && (
            <Shell
              key="idType"
              progress={progress}
              onBack={goBack}
              title="Choose ID document"
              subtitle={
                <span className="inline-flex items-center gap-1.5">
                  Accepted IDs in{" "}
                  <img
                    src={`https://flagcdn.com/w40/${country.code.toLowerCase()}.png`}
                    srcSet={`https://flagcdn.com/w80/${country.code.toLowerCase()}.png 2x`}
                    alt=""
                    className="w-4 h-3 rounded-[2px] object-cover ring-1 ring-foreground/10 inline-block align-middle"
                  />
                  <span className="font-semibold text-foreground">{country.name}</span>.
                </span>
              }
              footer={
                <PrimaryButton
                  disabled={!idType}
                  onClick={() => setStep("idInput")}
                >
                  Continue
                </PrimaryButton>
              }
            >
              <div className="space-y-2.5">
                {idTypesForCountry(country.code).map((t) => {
                  const Icon = ID_ICONS[t];
                  const selected = idType === t;
                  return (
                    <button
                      key={t}
                      onClick={() => setIdType(t)}
                      className={`w-full p-3.5 rounded-2xl text-left transition flex items-center gap-3 border ${
                        selected
                          ? "border-primary bg-primary/[0.06]"
                          : "border-transparent bg-card-foreground/[0.04] active:bg-card-foreground/[0.07]"
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          selected
                            ? "bg-primary text-primary-foreground"
                            : "bg-card text-card-foreground/70"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm">{ID_LABELS[t].title}</p>
                        <p className="text-xs text-card-foreground/55 mt-0.5">
                          {ID_LABELS[t].desc}
                        </p>
                      </div>
                      {selected && <Check className="w-5 h-5 text-primary" />}
                    </button>
                  );
                })}
              </div>
            </Shell>
          )}

          {step === "idInput" && idType && (
            <Shell
              key="idInput"
              progress={progress}
              onBack={goBack}
              title={ID_LABELS[idType].title}
              subtitle={
                idType === "PASSPORT"
                  ? "Enter your passport number exactly as shown."
                  : "Enter your 11-digit number."
              }
              footer={
                <PrimaryButton
                  disabled={
                    idType === "PASSPORT"
                      ? idValue.length < 6
                      : idValue.length !== 11
                  }
                  onClick={() => setStep("selfie")}
                >
                  Continue
                </PrimaryButton>
              }
            >
              <label className="block">
                <span className="text-[10px] uppercase tracking-widest text-card-foreground/55 font-semibold">
                  {idType === "PASSPORT" ? "Passport number" : `${idType} number`}
                </span>
                <input
                  autoFocus
                  inputMode={idType === "PASSPORT" ? "text" : "numeric"}
                  maxLength={idType === "PASSPORT" ? 12 : 11}
                  value={idValue}
                  onChange={(e) => {
                    const v =
                      idType === "PASSPORT"
                        ? e.target.value.toUpperCase()
                        : e.target.value.replace(/\D/g, "");
                    setIdValue(v);
                  }}
                  placeholder={idType === "PASSPORT" ? "A12345678" : "12345678901"}
                  className="mt-2 w-full h-12 px-4 rounded-2xl bg-card-foreground/[0.05] text-card-foreground text-base outline-none focus:ring-2 ring-primary/40 tracking-wider placeholder:text-card-foreground/35"
                />
              </label>
              <p className="text-[11px] text-card-foreground/55 mt-3 px-1">
                We use Smile ID to match this against the official record.
              </p>
            </Shell>
          )}

          {step === "selfie" && (
            <Shell
              key="selfie"
              progress={progress}
              onBack={goBack}
              title="Position your face"
              subtitle="Look into the camera and stay still."
              footer={
                <PrimaryButton onClick={() => setStep("processing")}>
                  Capture
                </PrimaryButton>
              }
            >
              <div className="flex justify-center pt-2">
                <div className="relative w-60 h-72 rounded-[7rem] bg-gradient-to-br from-[oklch(0.22_0.08_280)] to-[oklch(0.32_0.12_270)] overflow-hidden flex items-center justify-center shadow-xl">
                  <div className="absolute inset-3 rounded-[6rem] border-2 border-dashed border-white/25" />
                  <motion.div
                    className="absolute left-3 right-3 h-1 bg-[oklch(0.82_0.16_85)] rounded-full shadow-[0_0_20px_oklch(0.82_0.16_85)]"
                    animate={{ top: ["10%", "90%", "10%"] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <div className="text-6xl">👤</div>
                </div>
              </div>
            </Shell>
          )}

          {step === "processing" && (
            <motion.div
              key="proc"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 min-h-screen md:min-h-[860px] bg-background text-foreground flex flex-col items-center justify-center gap-6"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1.4, ease: "linear" }}
                className="w-20 h-20 rounded-full border-4 border-foreground/15 border-t-primary"
              />
              <div className="text-center">
                <p className="font-display font-bold text-lg">Verifying with Smile ID</p>
                <p className="text-sm text-foreground/55 mt-1">Matching biometrics…</p>
              </div>
            </motion.div>
          )}

          {step === "done" && (
            <motion.div
              key="done"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col min-h-screen md:min-h-[860px]"
            >
              {/* Dark hero */}
              <div className="relative bg-background text-foreground px-6 pt-6 pb-16 overflow-hidden">
                <div className="absolute -top-16 -right-10 w-56 h-56 rounded-full bg-lime/25 blur-3xl" />
                <div className="absolute top-20 -left-16 w-48 h-48 rounded-full bg-primary/30 blur-3xl" />

                <div className="relative flex items-center gap-3">
                  <div className="w-10 h-10" aria-hidden />
                  <div className="flex-1 h-1.5 bg-foreground/10 rounded-full overflow-hidden">
                    <div className="h-full bg-lime transition-all" style={{ width: `100%` }} />
                  </div>
                </div>

                {/* Success mark */}
                <div className="relative mt-8 flex justify-center">
                  <motion.div
                    animate={{ scale: [1, 1.08, 1] }}
                    transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 m-auto w-40 h-40 rounded-full bg-lime/30 blur-2xl"
                  />
                  <motion.div
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 180, damping: 14, delay: 0.05 }}
                    className="relative w-32 h-32 rounded-full bg-gradient-lime flex items-center justify-center shadow-[0_30px_60px_-15px_oklch(0.92_0.21_120_/_0.55)] ring-1 ring-white/10"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 220, damping: 16, delay: 0.35 }}
                    >
                      <Check className="w-14 h-14 text-lime-foreground" strokeWidth={3} />
                    </motion.div>
                    <motion.span
                      animate={{ scale: [1, 1.35, 1], opacity: [0.7, 0, 0.7] }}
                      transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut" }}
                      className="absolute inset-0 rounded-full ring-2 ring-lime/50"
                    />
                  </motion.div>
                </div>

                <motion.h1
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="font-display text-2xl font-bold mt-8 leading-tight text-center"
                >
                  You're verified
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="text-sm text-foreground/55 mt-1.5 text-center max-w-xs mx-auto"
                >
                  Welcome aboard. Your account is ready to roll.
                </motion.p>
              </div>

              {/* White surface */}
              <div className="relative bg-card text-card-foreground rounded-t-[2rem] px-6 pt-7 pb-8 -mt-6 flex-1 flex flex-col">
                <p className="text-[11px] uppercase tracking-widest text-card-foreground/50 font-semibold mb-3 px-1">
                  Account status
                </p>

                {/* Tier card */}
                <div className="relative rounded-2xl bg-gradient-card text-foreground p-5 overflow-hidden">
                  <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-lime/20 blur-2xl" />
                  <div className="relative flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-foreground/55 font-semibold">
                        Current tier
                      </p>
                      <p className="font-display text-xl font-bold mt-1">Basic</p>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-lime text-lime-foreground text-[11px] font-bold uppercase tracking-wide">
                      Active
                    </div>
                  </div>
                  <div className="relative mt-5 flex items-end justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-foreground/55 font-semibold">
                        Daily limit
                      </p>
                      <p className="font-display text-2xl font-bold mt-1">₦200,000</p>
                    </div>
                    <ShieldCheck className="w-8 h-8 text-lime" />
                  </div>
                </div>

                {/* Perks */}
                <div className="mt-5 space-y-2.5">
                  {[
                    { i: ShieldCheck, t: "Identity verified", s: "Smile ID match confirmed." },
                    { i: Sparkles, t: "Basic features unlocked", s: "Send, receive, and pay bills." },
                    { i: IdCard, t: "Upgrade anytime", s: "Add proof of address for higher limits." },
                  ].map((it, idx) => (
                    <div key={idx} className="flex gap-3 p-3.5 rounded-2xl bg-card-foreground/[0.04]">
                      <div className="w-9 h-9 rounded-full bg-lime/20 text-card-foreground flex items-center justify-center shrink-0">
                        <it.i className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm">{it.t}</p>
                        <p className="text-xs text-card-foreground/55 mt-0.5">{it.s}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-6 mt-auto">
                  <PrimaryButton onClick={() => nav({ to: "/profile" })}>
                    Back to profile
                  </PrimaryButton>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PhoneFrame>
  );
}

function Shell({
  progress,
  onBack,
  title,
  subtitle,
  children,
  footer,
}: {
  progress: number;
  onBack: () => void;
  title: ReactNode;
  subtitle: ReactNode;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 flex flex-col min-h-screen md:min-h-[860px]"
    >
      {/* Dark hero */}
      <div className="bg-background text-foreground px-6 pt-6 pb-10">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-foreground/10 flex items-center justify-center text-foreground/80 active:scale-95 transition"
            aria-label="Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex-1 h-1.5 bg-foreground/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <h1 className="font-display text-2xl font-bold mt-6 leading-tight">
          {title}
        </h1>
        <p className="text-sm text-foreground/55 mt-1.5">{subtitle}</p>
      </div>

      {/* White surface */}
      <div className="relative bg-card text-card-foreground rounded-t-[2rem] px-6 pt-7 pb-8 -mt-6 flex-1 flex flex-col">
        <div className="flex-1">{children}</div>
        <div className="pt-6">{footer}</div>
      </div>
    </motion.div>
  );
}

function PrimaryButton({
  children,
  onClick,
  disabled,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full h-12 rounded-full bg-primary text-primary-foreground font-semibold text-sm disabled:opacity-40 active:scale-[0.98] transition"
    >
      {children}
    </button>
  );
}

function CountryStep({
  progress,
  onBack,
  selected,
  onSelect,
}: {
  progress: number;
  onBack: () => void;
  selected: Country | null;
  onSelect: (c: Country) => void;
}) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return COUNTRIES;
    return COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        c.code.toLowerCase().includes(term),
    );
  }, [q]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 flex flex-col min-h-screen md:min-h-[860px]"
    >
      {/* Dark hero */}
      <div className="bg-background text-foreground px-6 pt-6 pb-10">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-foreground/10 flex items-center justify-center text-foreground/80 active:scale-95 transition"
            aria-label="Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex-1 h-1.5 bg-foreground/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <h1 className="font-display text-2xl font-bold mt-6 leading-tight">
          Select your country
        </h1>
        <p className="text-sm text-foreground/55 mt-1.5">
          We support 100+ countries through Smile ID.
        </p>
      </div>

      {/* White surface */}
      <div className="relative bg-card text-card-foreground rounded-t-[2rem] px-6 pt-6 pb-8 -mt-6 flex-1 flex flex-col min-h-0">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-card-foreground/45" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search country"
            className="w-full h-11 pl-10 pr-4 rounded-full bg-card-foreground/[0.05] text-card-foreground text-sm outline-none focus:ring-2 ring-primary/40 placeholder:text-card-foreground/40"
          />
        </div>

        <div className="mt-4 flex-1 overflow-y-auto -mx-6 px-6 no-scrollbar">
          {filtered.length === 0 ? (
            <p className="text-sm text-card-foreground/55 text-center py-8">
              No country matches "{q}".
            </p>
          ) : (
            <ul className="rounded-2xl bg-card-foreground/[0.04] divide-y divide-card-foreground/10 overflow-hidden">
              {filtered.map((c) => {
                const isSel = selected?.code === c.code;
                return (
                  <li key={c.code}>
                    <button
                      onClick={() => onSelect(c)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left active:bg-card-foreground/[0.06] transition"
                    >
                      <img
                        src={`https://flagcdn.com/w80/${c.code.toLowerCase()}.png`}
                        srcSet={`https://flagcdn.com/w160/${c.code.toLowerCase()}.png 2x`}
                        alt=""
                        loading="lazy"
                        className="w-8 h-6 rounded-sm object-cover shrink-0 ring-1 ring-card-foreground/10"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{c.name}</p>
                        <p className="text-[11px] text-card-foreground/55">
                          {idTypesForCountry(c.code).join(" · ")} + Selfie
                        </p>
                      </div>
                      {isSel ? (
                        <Check className="w-4 h-4 text-primary" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-card-foreground/40" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </motion.div>
  );
}
