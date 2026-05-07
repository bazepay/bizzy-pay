import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ChevronRight, Shield, Gift, MessageCircle, LogOut, Fingerprint, KeyRound } from "lucide-react";
import { mockUser } from "@/lib/mock";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";

export const Route = createFileRoute("/_app/profile")({
  component: Profile,
});

function Profile() {
  const [bio, setBio] = useState(true);
  const [twoFa, setTwoFa] = useState(false);
  const nav = useNavigate();

  return (
    <div>
      <header className="px-6 pt-12 pb-4 flex items-center gap-4">
        <Link to="/_app/home" className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="font-display font-bold text-lg">Profile</h1>
      </header>

      <div className="px-6 space-y-5">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-gold flex items-center justify-center font-display font-bold text-2xl text-[oklch(0.2_0.05_80)]">
            {mockUser.firstName[0]}
          </div>
          <div>
            <p className="font-display font-bold text-lg">{mockUser.firstName} {mockUser.lastName}</p>
            <p className="text-xs text-muted-foreground">{mockUser.email}</p>
          </div>
        </div>

        <div className="rounded-3xl bg-gradient-primary text-primary-foreground p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest opacity-70">KYC tier</p>
              <p className="text-xl font-display font-bold mt-1">{mockUser.tier}</p>
            </div>
            <Shield className="w-8 h-8 opacity-60" />
          </div>
          <p className="text-xs opacity-80 mt-3">Daily limit: ₦200,000. Upgrade to Enhanced for ₦5M / day.</p>
          <button className="mt-3 px-4 py-2 rounded-full bg-gold text-[oklch(0.2_0.05_80)] text-xs font-bold">Upgrade</button>
        </div>

        <Section title="Security">
          <Row icon={Fingerprint} label="Biometric login" right={<Switch checked={bio} onCheckedChange={setBio} />} />
          <Row icon={KeyRound} label="Change PIN" />
          <Row icon={Shield} label="Two-factor auth" right={<Switch checked={twoFa} onCheckedChange={setTwoFa} />} />
        </Section>

        <Section title="Rewards & support">
          <Row icon={Gift} label="Refer & earn" sub={`Code: ${mockUser.referralCode} · ₦${mockUser.rewards.toLocaleString()} earned`} />
          <Row icon={MessageCircle} label="Customer support" sub="Chat with us 24/7" />
        </Section>

        <button onClick={() => nav({ to: "/auth/login" })} className="w-full mt-2 p-4 rounded-2xl bg-destructive/10 text-destructive font-semibold flex items-center justify-center gap-2">
          <LogOut className="w-4 h-4" /> Log out
        </button>

        <p className="text-center text-[10px] text-muted-foreground pt-4">BazePay v1.0 • Mock prototype</p>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2 px-1">{title}</p>
      <div className="bg-card rounded-2xl divide-y divide-border">{children}</div>
    </div>
  );
}

function Row({ icon: Icon, label, sub, right }: { icon: typeof Shield; label: string; sub?: string; right?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 p-4">
      <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm">{label}</p>
        {sub && <p className="text-xs text-muted-foreground truncate">{sub}</p>}
      </div>
      {right ?? <ChevronRight className="w-4 h-4 text-muted-foreground" />}
    </div>
  );
}
