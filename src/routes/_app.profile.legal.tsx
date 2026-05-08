import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, FileText } from "lucide-react";

export const Route = createFileRoute("/_app/profile/legal")({
  head: () => ({
    meta: [
      { title: "Legal — BazePay" },
      { name: "description", content: "BazePay terms of service and privacy policy." },
    ],
  }),
  component: LegalPage,
});

const TERMS = [
  { h: "1. Acceptance of terms", p: "By creating a BazePay account, you agree to these terms and confirm you are at least 18 years old and legally able to enter into a binding contract." },
  { h: "2. Your account", p: "You are responsible for keeping your PIN, password, and biometric credentials confidential. Notify us immediately of any unauthorized access." },
  { h: "3. Permitted use", p: "BazePay may only be used for lawful purposes. You may not use the service to launder funds, evade taxes, or finance prohibited activities." },
  { h: "4. Fees", p: "Standard transactions are free. Specialized services (international transfers, card creation, eSIMs) carry transparent fees disclosed before you confirm." },
  { h: "5. Liability", p: "BazePay's liability for any claim is limited to the value of the disputed transaction. We are not liable for losses caused by user negligence." },
  { h: "6. Termination", p: "We may suspend or terminate accounts that violate these terms, with notice where reasonably possible. You may close your account at any time." },
];

const PRIVACY = [
  { h: "1. What we collect", p: "Identity (name, ID document), contact (email, phone), device data, and transaction history. We collect only what's needed to operate the service." },
  { h: "2. How we use it", p: "To provide the service, prevent fraud, comply with regulations, and improve the product. We never sell your personal data to third parties." },
  { h: "3. Sharing", p: "We share data with licensed partners (banks, card networks, KYC providers) strictly to deliver requested services, and with regulators when legally required." },
  { h: "4. Storage & security", p: "Data is encrypted in transit and at rest. We retain transaction records for at least 7 years as required by financial regulations." },
  { h: "5. Your rights", p: "You can access, correct, or export your data at any time from your profile. To delete your account, contact support — some records may be retained for legal reasons." },
  { h: "6. Cookies", p: "We use minimal cookies for authentication and product analytics. No advertising cookies are set." },
];

function LegalPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"terms" | "privacy">("terms");
  const sections = tab === "terms" ? TERMS : PRIVACY;

  return (
    <div className="min-h-full bg-background text-foreground flex flex-col">
      <header className="px-6 pt-12 pb-4 flex items-center gap-3">
        <button
          onClick={() => navigate({ to: "/profile" })}
          className="w-10 h-10 rounded-full bg-foreground/10 flex items-center justify-center"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-display text-xl font-bold">Legal</h1>
      </header>

      <div className="px-6">
        <div className="relative grid grid-cols-2 p-1 rounded-full bg-foreground/[0.06]">
          <motion.div
            className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full bg-card shadow-sm"
            animate={{ x: tab === "terms" ? 0 : "calc(100% + 8px)" }}
            transition={{ type: "spring", damping: 26, stiffness: 280 }}
          />
          {(["terms", "privacy"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`relative z-10 h-10 text-sm font-semibold transition-colors ${
                tab === t ? "text-foreground" : "text-foreground/55"
              }`}
            >
              {t === "terms" ? "Terms" : "Privacy"}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 mt-5 text-[11px] text-foreground/50">
          <FileText className="w-3.5 h-3.5" />
          <span>Last updated · 1 May 2026 · v1.0</span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="mt-5 space-y-4 pb-10"
          >
            <p className="text-sm text-foreground/70 leading-relaxed">
              {tab === "terms"
                ? "These terms govern your use of BazePay. Please read them carefully — they create binding obligations between you and BazePay Limited."
                : "Your privacy matters. This policy explains what we collect, how we use it, and the controls you have over your data."}
            </p>
            {sections.map((s, i) => (
              <div key={i} className="rounded-2xl bg-foreground/[0.04] p-4">
                <p className="font-display font-bold text-sm">{s.h}</p>
                <p className="text-sm text-foreground/70 leading-relaxed mt-1.5">{s.p}</p>
              </div>
            ))}
            <p className="text-xs text-foreground/45 text-center pt-2">
              BazePay Limited · RC 1234567 · Lagos, Nigeria
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
