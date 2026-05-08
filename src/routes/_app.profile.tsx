import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  ChevronRight,
  Fingerprint,
  KeyRound,
  Lock,
  Gift,
  Copy,
  Share2,
  MessageCircle,
  HelpCircle,
  FileText,
  LogOut,
  Send,
  X,
  Check,
  Pencil,
} from "lucide-react";
import { BottomNav } from "@/components/bottom-nav";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/profile")({
  head: () => ({
    meta: [
      { title: "Profile — BazePay" },
      { name: "description", content: "Manage your KYC tier, security, referrals and support." },
    ],
  }),
  component: ProfilePage,
});

const initialUser = {
  name: "Adaeze Okafor",
  email: "adaeze@bazepay.com",
  phone: "+234 801 234 5678",
  initials: "AO",
  tier: "Tier 2 — Enhanced",
  limit: "₦5,000,000 / month",
  referralCode: "ADAEZE25",
  referralCount: 7,
  referralEarned: "₦14,000",
};

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "U";
}

function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(initialUser);
  const [biometric, setBiometric] = useState(true);
  const [twoFA, setTwoFA] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(user.referralCode);
      toast.success("Referral code copied");
    } catch {
      toast.error("Could not copy");
    }
  };

  const shareCode = async () => {
    const text = `Join me on BazePay and we both earn ₦2,000. Use my code: ${user.referralCode}`;
    if (navigator.share) {
      try { await navigator.share({ title: "BazePay", text }); } catch {/* dismissed */}
    } else {
      await navigator.clipboard.writeText(text);
      toast.success("Invite copied to clipboard");
    }
  };

  return (
    <div className="min-h-full bg-background text-foreground flex flex-col pb-32">
      {/* Dark hero */}
      <div className="relative px-6 pt-12 pb-20">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold tracking-tight">Profile</h1>
          <button
            onClick={() => navigate({ to: "/auth/login" })}
            className="w-10 h-10 rounded-full bg-foreground/10 flex items-center justify-center text-foreground/80 active:scale-95 transition"
            aria-label="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-6 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[oklch(0.55_0.18_280)] to-[oklch(0.82_0.16_85)] text-white flex items-center justify-center font-display text-xl font-bold shadow-lg ring-2 ring-white/10">
            {user.initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-display text-lg font-bold truncate">{user.name}</p>
            <p className="text-xs text-foreground/55 truncate">{user.email}</p>
            <p className="text-xs text-foreground/55">{user.phone}</p>
          </div>
        </div>
      </div>

      {/* White surface */}
      <div className="flex-1 -mt-8 bg-card text-card-foreground rounded-t-[2rem] px-6 pt-6 pb-28">
        {/* KYC verified card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[oklch(0.22_0.08_280)] to-[oklch(0.32_0.12_270)] text-white p-5 shadow-xl">
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-[oklch(0.82_0.16_85)]/25 blur-2xl" />
          <div className="relative flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-[oklch(0.82_0.16_85)]/20 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-[oklch(0.82_0.16_85)]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-display text-base font-bold">Identity verified</p>
                <span className="px-2 py-0.5 rounded-full bg-[oklch(0.82_0.16_85)] text-[oklch(0.2_0.05_280)] text-[9px] font-bold uppercase tracking-wider">
                  Active
                </span>
              </div>
              <p className="text-xs text-white/70 mt-0.5">Limit · {user.limit}</p>
            </div>
          </div>
        </div>

        {/* Security */}
        <SectionTitle>Security</SectionTitle>
        <div className="rounded-3xl bg-card-foreground/[0.03] divide-y divide-card-foreground/10 overflow-hidden">
          <ToggleRow
            icon={<Fingerprint className="w-4 h-4" />}
            label="Biometric login"
            desc="Face ID / fingerprint"
            on={biometric}
            onChange={setBiometric}
          />
          <RowButton
            icon={<KeyRound className="w-4 h-4" />}
            label="Change PIN"
            desc="Last changed 2 weeks ago"
            onClick={() => toast.info("PIN change flow — coming soon")}
          />
          <ToggleRow
            icon={<Lock className="w-4 h-4" />}
            label="Two-factor authentication"
            desc="Extra layer on sign-in"
            on={twoFA}
            onChange={setTwoFA}
          />
        </div>

        {/* Referrals */}
        <SectionTitle>Refer & earn</SectionTitle>
        <div className="rounded-3xl bg-card-foreground/[0.03] p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[oklch(0.82_0.16_85)]/20 flex items-center justify-center text-[oklch(0.55_0.15_85)]">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <p className="font-display font-bold text-sm">Earn ₦2,000 per friend</p>
              <p className="text-xs text-card-foreground/55">They get ₦2,000 when they fund their wallet.</p>
            </div>
          </div>

          <button
            onClick={copyCode}
            className="mt-4 w-full flex items-center justify-between px-4 h-12 rounded-2xl bg-card border border-card-foreground/10 active:scale-[0.99] transition"
          >
            <div className="text-left">
              <p className="text-[10px] uppercase tracking-widest text-card-foreground/50">Your code</p>
              <p className="font-display font-bold tracking-wider">{user.referralCode}</p>
            </div>
            <Copy className="w-4 h-4 text-card-foreground/50" />
          </button>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <Stat label="Friends invited" value={String(user.referralCount)} />
            <Stat label="Total earned" value={user.referralEarned} />
          </div>

          <button
            onClick={shareCode}
            className="mt-4 w-full h-11 rounded-full bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition"
          >
            <Share2 className="w-4 h-4" /> Share invite
          </button>
        </div>

        {/* Support */}
        <SectionTitle>Help & support</SectionTitle>
        <div className="rounded-3xl bg-card-foreground/[0.03] divide-y divide-card-foreground/10 overflow-hidden">
          <RowButton
            icon={<MessageCircle className="w-4 h-4" />}
            label="Live chat"
            desc="Avg. reply in 3 min"
            onClick={() => setSupportOpen(true)}
          />
          <RowButton
            icon={<HelpCircle className="w-4 h-4" />}
            label="Help center"
            desc="FAQs and guides"
            onClick={() => toast.info("Help center — coming soon")}
          />
          <RowButton
            icon={<FileText className="w-4 h-4" />}
            label="Legal"
            desc="Terms · Privacy"
            onClick={() => toast.info("Legal — coming soon")}
          />
        </div>

        <p className="text-center text-[11px] text-card-foreground/40 mt-8">
          BazePay · v1.0.0 (prototype)
        </p>
      </div>

      <BottomNav />

      <SupportSheet open={supportOpen} onClose={() => setSupportOpen(false)} />
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] uppercase tracking-widest text-card-foreground/50 font-semibold mt-7 mb-3 px-1">
      {children}
    </p>
  );
}

function ToggleRow({
  icon, label, desc, on, onChange,
}: {
  icon: React.ReactNode; label: string; desc: string;
  on: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <div className="w-9 h-9 rounded-full bg-card flex items-center justify-center text-card-foreground/70">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold">{label}</p>
        <p className="text-[11px] text-card-foreground/55">{desc}</p>
      </div>
      <button
        onClick={() => {
          onChange(!on);
          toast.success(`${label} ${!on ? "enabled" : "disabled"}`);
        }}
        className={`relative w-11 h-6 rounded-full transition-colors ${on ? "bg-primary" : "bg-card-foreground/20"}`}
        aria-pressed={on}
        aria-label={label}
      >
        <span
          className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${on ? "left-[22px]" : "left-0.5"}`}
        />
      </button>
    </div>
  );
}

function RowButton({
  icon, label, desc, onClick,
}: {
  icon: React.ReactNode; label: string; desc: string; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3.5 active:bg-card-foreground/[0.04] transition text-left"
    >
      <div className="w-9 h-9 rounded-full bg-card flex items-center justify-center text-card-foreground/70">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold">{label}</p>
        <p className="text-[11px] text-card-foreground/55">{desc}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-card-foreground/40" />
    </button>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-card px-3 py-2.5">
      <p className="text-[10px] uppercase tracking-widest text-card-foreground/50">{label}</p>
      <p className="font-display font-bold text-base mt-0.5">{value}</p>
    </div>
  );
}

type ChatMsg = { id: number; from: "me" | "agent"; text: string };

function SupportSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [messages, setMessages] = useState<ChatMsg[]>([
    { id: 1, from: "agent", text: "Hi 👋 I'm Zara from BazePay support. How can I help today?" },
  ]);
  const [draft, setDraft] = useState("");

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    const id = Date.now();
    setMessages((m) => [...m, { id, from: "me", text }]);
    setDraft("");
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        { id: id + 1, from: "agent", text: "Thanks! A specialist will reach out within a few minutes. Anything else in the meantime?" },
      ]);
    }, 900);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 z-[60]"
          />
          <motion.div
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="absolute inset-x-0 bottom-0 z-[61] bg-card text-card-foreground rounded-t-3xl flex flex-col h-[78%]"
          >
            <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-card-foreground/10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">Z</div>
                <div>
                  <p className="font-display font-bold text-sm">Zara · Support</p>
                  <p className="text-[10px] text-card-foreground/55 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[oklch(0.65_0.12_230)]" /> Online now
                  </p>
                </div>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-card-foreground/[0.06] flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 no-scrollbar">
              {messages.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] px-3.5 py-2.5 text-sm rounded-2xl ${
                      m.from === "me"
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-card-foreground/[0.06] text-card-foreground rounded-bl-md"
                    }`}
                  >
                    {m.text}
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="px-4 pb-5 pt-3 border-t border-card-foreground/10">
              <div className="flex items-center gap-2">
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                  placeholder="Type a message…"
                  className="flex-1 h-11 px-4 rounded-full bg-card-foreground/[0.06] text-sm outline-none focus:ring-2 ring-primary/40"
                />
                <button
                  onClick={send}
                  disabled={!draft.trim()}
                  className="w-11 h-11 rounded-full bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-40 active:scale-95 transition"
                  aria-label="Send"
                >
                  {draft.trim() ? <Send className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
