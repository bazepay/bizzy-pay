import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Gift, Copy, Share2, Users, Coins, Check, Clock } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/profile_/referrals")({
  head: () => ({
    meta: [
      { title: "Refer & earn — BazePay" },
      { name: "description", content: "Invite friends to BazePay and earn ₦2,000 per signup." },
    ],
  }),
  component: ReferralsPage,
});

const REFERRAL = {
  code: "ADAEZE25",
  invited: 7,
  earned: "₦14,000",
  pending: "₦4,000",
};

const HISTORY = [
  { name: "Chidinma E.", date: "May 5", status: "Earned", amount: "+₦2,000" },
  { name: "Tunde A.", date: "May 3", status: "Earned", amount: "+₦2,000" },
  { name: "Ngozi K.", date: "May 1", status: "Pending", amount: "₦2,000" },
  { name: "Femi O.", date: "Apr 28", status: "Earned", amount: "+₦2,000" },
  { name: "Bolu R.", date: "Apr 24", status: "Pending", amount: "₦2,000" },
];

const STEPS = [
  { icon: Share2, h: "Share your code", p: "Send your unique code to friends via WhatsApp, SMS, or any app." },
  { icon: Users, h: "They sign up", p: "Your friend creates a BazePay account using your code." },
  { icon: Coins, h: "Both earn ₦2,000", p: "Once they fund their wallet, you both get ₦2,000 instantly." },
];

function ReferralsPage() {
  const navigate = useNavigate();

  const copy = async () => {
    try { await navigator.clipboard.writeText(REFERRAL.code); toast.success("Code copied"); }
    catch { toast.error("Could not copy"); }
  };

  const share = async () => {
    const text = `Join me on BazePay and we both earn ₦2,000. Use my code: ${REFERRAL.code}`;
    if (typeof navigator !== "undefined" && (navigator as Navigator).share) {
      try { await (navigator as Navigator).share!({ title: "BazePay", text }); } catch {/* ignore */}
    } else {
      await navigator.clipboard.writeText(text);
      toast.success("Invite copied");
    }
  };

  return (
    <div className="min-h-full bg-card text-card-foreground flex flex-col">
      {/* Dark hero */}
      <div className="relative bg-background text-foreground px-6 pt-12 pb-16">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate({ to: "/profile" })}
            className="w-10 h-10 rounded-full bg-foreground/10 flex items-center justify-center"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-display text-xl font-bold">Refer & earn</h1>
        </div>

        <div className="mt-5 flex items-center gap-3 animate-fade-in">
          <div className="w-12 h-12 rounded-2xl bg-[oklch(0.82_0.16_85)]/20 flex items-center justify-center shrink-0">
            <Gift className="w-6 h-6 text-[oklch(0.82_0.16_85)]" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-widest text-foreground/55 font-semibold">Earn together</p>
            <p className="font-display text-xl font-bold leading-tight">₦2,000 per friend</p>
          </div>
        </div>

        <p className="text-xs text-foreground/65 leading-relaxed mt-3">
          Invite friends. You both earn ₦2,000.
        </p>
      </div>

      {/* White surface */}
      <div className="bg-card text-card-foreground rounded-t-[2rem] px-6 pt-7 pb-10 -mt-6 relative">
        {/* Code card — dashed ticket */}
        <button
          onClick={copy}
          className="group w-full relative overflow-hidden rounded-3xl bg-gradient-to-br from-[oklch(0.97_0.02_280)] to-[oklch(0.94_0.04_85)] dark:from-card-foreground/[0.06] dark:to-card-foreground/[0.02] p-5 text-left active:scale-[0.99] transition"
        >
          <div className="absolute inset-1 rounded-[1.4rem] border-2 border-dashed border-card-foreground/15 pointer-events-none" />
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-[oklch(0.82_0.16_85)]/25 blur-2xl" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-primary/15 blur-2xl" />

          <div className="relative flex items-center justify-between">
            <p className="text-[10px] uppercase tracking-widest text-card-foreground/55 font-semibold">Your referral code</p>
            <span className="text-[10px] uppercase tracking-wider font-bold text-primary flex items-center gap-1 opacity-70 group-active:opacity-100">
              <Copy className="w-3 h-3" /> Tap to copy
            </span>
          </div>
          <p className="relative font-display text-4xl font-bold tracking-[0.2em] mt-3 bg-gradient-to-r from-[oklch(0.5_0.18_280)] to-[oklch(0.55_0.15_85)] bg-clip-text text-transparent">
            {REFERRAL.code}
          </p>
        </button>

        <button
          onClick={share}
          className="mt-3 w-full h-12 rounded-full bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition shadow-md shadow-primary/30"
        >
          <Share2 className="w-4 h-4" /> Share invite
        </button>

        {/* Stats */}
        <div className="mt-5 grid grid-cols-3 gap-2.5">
          <Stat label="Invited" value={String(REFERRAL.invited)} />
          <Stat label="Earned" value={REFERRAL.earned} accent />
          <Stat label="Pending" value={REFERRAL.pending} muted />
        </div>

        {/* How it works */}
        <p className="text-[11px] uppercase tracking-widest text-card-foreground/50 font-semibold mt-9 mb-3">
          How it works
        </p>
        <div className="space-y-2.5">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="flex items-start gap-3 p-4 rounded-2xl bg-card-foreground/[0.04]">
                <div className="relative w-9 h-9 shrink-0 rounded-full bg-primary/12 flex items-center justify-center text-primary">
                  <Icon className="w-4 h-4" />
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">{i + 1}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{s.h}</p>
                  <p className="text-[11px] text-card-foreground/60 leading-relaxed mt-0.5">{s.p}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* History */}
        <div className="flex items-center justify-between mt-9 mb-3">
          <p className="text-[11px] uppercase tracking-widest text-card-foreground/50 font-semibold">Activity</p>
          <span className="text-[11px] text-card-foreground/45">{HISTORY.length} entries</span>
        </div>
        <div className="space-y-2">
          {HISTORY.map((h, i) => {
            const earned = h.status === "Earned";
            return (
              <div key={i} className="flex items-center gap-3 p-3.5 rounded-2xl bg-card-foreground/[0.04]">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                  earned ? "bg-primary/15 text-primary" : "bg-card-foreground/10 text-card-foreground/55"
                }`}>
                  {earned ? <Check className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{h.name}</p>
                  <p className="text-[11px] text-card-foreground/55">{h.date} · {h.status}</p>
                </div>
                <p className={`text-sm font-display font-bold ${earned ? "text-primary" : "text-card-foreground/55"}`}>
                  {h.amount}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, accent, muted }: { label: string; value: string; accent?: boolean; muted?: boolean }) {
  return (
    <div className="rounded-2xl bg-card-foreground/[0.04] p-3 text-center">
      <p className="text-[10px] uppercase tracking-widest text-card-foreground/50">{label}</p>
      <p className={`font-display font-bold text-base mt-0.5 ${accent ? "text-primary" : muted ? "text-card-foreground/55" : ""}`}>{value}</p>
    </div>
  );
}
