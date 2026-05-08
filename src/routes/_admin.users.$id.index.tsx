import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Smartphone, Activity, Wallet as WalletIcon } from "lucide-react";
import { fmtNgn, fmtNum } from "@/lib/mock-data";
import { getUser, getWallets, getTransactions, getDevices, fmtRelative, kycLabel } from "@/lib/users-data";

export const Route = createFileRoute("/_admin/users/$id/")({
  component: Overview,
});

function Overview() {
  const { id } = Route.useParams();
  const user = getUser(id)!;
  const wallets = getWallets(id);
  const txns = getTransactions(id, 5);
  const devices = getDevices(id);
  const totalNgn = wallets.find((w) => w.currency === "NGN")?.balance ?? 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="space-y-4 lg:col-span-2">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Stat label="NGN balance" value={fmtNgn(totalNgn)} icon={WalletIcon} />
          <Stat label="Lifetime txns" value={fmtNum(txns.length * 14)} icon={Activity} />
          <Stat label="KYC" value={kycLabel(user.kyc)} icon={ShieldCheck} />
          <Stat label="Active devices" value={String(devices.filter((d) => d.current).length)} icon={Smartphone} />
        </div>

        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Recent activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {txns.map((t) => (
              <div key={t.id} className="flex items-center justify-between p-2.5 rounded-md hover:bg-muted/50">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-8 w-8 rounded-md bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold capitalize">
                    {t.type[0]}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium capitalize">{t.type.replace("_", " ")}</div>
                    <div className="text-xs text-muted-foreground">{t.provider} · {fmtRelative(t.at)}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-sm">{fmtNgn(t.amountNgn)}</div>
                  <Badge variant="outline" className="text-[10px] capitalize mt-0.5">{t.status}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <Card className="shadow-card">
          <CardHeader className="pb-2"><CardTitle className="text-base">Identifiers</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="User ID" value={user.id} mono />
            <Row label="BVN (last 4)" value={user.bvnLast4 ? "•••• " + user.bvnLast4 : "—"} />
            <Row label="NIN (last 4)" value={user.ninLast4 ? "•••• " + user.ninLast4 : "—"} />
            <Row label="2FA" value={user.twoFa ? "Enabled" : "Disabled"} />
            <Row label="Transaction PIN" value={user.pinSet ? "Set" : "Not set"} />
            <Row label="Joined" value={new Date(user.signupAt).toLocaleString()} />
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="pb-2"><CardTitle className="text-base">Wallet snapshot</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {wallets.map((w) => (
              <div key={w.currency} className="flex items-center justify-between text-sm">
                <span className="font-medium">{w.currency}</span>
                <span className="font-mono">
                  {w.currency === "NGN" ? fmtNgn(w.balance) : `${w.balance.toLocaleString()} ${w.currency}`}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Stat({ label, value, icon: Icon }: { label: string; value: string; icon: typeof Activity }) {
  return (
    <Card className="shadow-card">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-muted-foreground text-xs">
          <Icon className="h-3.5 w-3.5" />
          {label}
        </div>
        <div className="font-display text-lg font-bold mt-1 truncate">{value}</div>
      </CardContent>
    </Card>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between border-b border-border/50 last:border-0 pb-2 last:pb-0">
      <span className="text-muted-foreground text-xs uppercase tracking-wider">{label}</span>
      <span className={mono ? "font-mono text-xs" : "text-sm"}>{value}</span>
    </div>
  );
}
