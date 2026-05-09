import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Copy, RefreshCw, X, MessageSquare, Phone } from "lucide-react";
import { getLease, getSms, leaseStatusTone, fmtNgn, type Lease } from "@/lib/numbers-data";
import { toast } from "sonner";

export const Route = createFileRoute("/_admin/numbers/$id")({
  component: LeaseDetail,
});

function LeaseDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const initial = getLease(id);
  const [lease, setLease] = useState<Lease | undefined>(initial);
  const [sms, setSms] = useState(() => getSms(id));

  if (!lease) {
    return (
      <div className="p-6 max-w-[900px] mx-auto">
        <Card className="shadow-card"><CardContent className="p-8 text-center text-sm text-muted-foreground">Lease not found.</CardContent></Card>
        <div className="mt-4"><Link to="/numbers/leases" className="text-sm text-primary hover:underline">← Back to leases</Link></div>
      </div>
    );
  }

  const copy = (s: string, label: string) => {
    navigator.clipboard.writeText(s);
    toast.success(`${label} copied`);
  };

  const forceRenew = () => {
    const next = new Date(Date.now() + 30 * 86_400_000).toISOString();
    setLease({ ...lease, renewsOn: next, status: "active" });
    toast.success("Lease renewed for another 30 days.");
  };

  const cancel = () => {
    setLease({ ...lease, status: "cancelled", autoRenew: false });
    toast.success("Lease cancelled.");
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/numbers/leases" })}>
          <ArrowLeft className="h-4 w-4 mr-1.5" /> Back
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <img src={`https://flagcdn.com/w40/${lease.countryCode}.png`} alt={lease.country} className="h-5 w-7 rounded-sm object-cover" loading="lazy" />
            <h1 className="font-display text-2xl font-bold font-mono">{lease.number}</h1>
            <Badge variant="outline" className={`text-xs capitalize ${leaseStatusTone[lease.status]}`}>{lease.status}</Badge>
          </div>
          <div className="text-xs text-muted-foreground mt-0.5 font-mono">{lease.id}</div>
        </div>
        <Button size="sm" variant="outline" onClick={() => copy(lease.number, "Number")}>
          <Copy className="h-3.5 w-3.5 mr-1.5" /> Copy number
        </Button>
        <Button size="sm" variant="outline" onClick={forceRenew}>
          <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Force renew
        </Button>
        {lease.status !== "cancelled" && (
          <Button size="sm" variant="destructive" onClick={cancel}>
            <X className="h-3.5 w-3.5 mr-1.5" /> Cancel lease
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="shadow-card lg:col-span-2">
          <CardHeader className="pb-2"><CardTitle className="text-base">Lease details</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <Field label="Country">{lease.country}</Field>
            <Field label="Service">{lease.service}</Field>
            <Field label="Supplier">{lease.supplier}</Field>
            <Field label="Started">{new Date(lease.startedAt).toLocaleDateString()}</Field>
            <Field label="Renews on">{new Date(lease.renewsOn).toLocaleDateString()}</Field>
            <Field label="Billing">{lease.billingPeriod}</Field>
            <Field label="Price / period">{fmtNgn(lease.priceNgn)}</Field>
            <Field label="SMS (30d)">{lease.smsCount30d}</Field>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Auto-renew</div>
              <div className="mt-1 flex items-center gap-2">
                <Switch
                  checked={lease.autoRenew}
                  onCheckedChange={(v) => {
                    setLease({ ...lease, autoRenew: v });
                    toast.success(`Auto-renew ${v ? "enabled" : "disabled"}.`);
                  }}
                />
                <span className="text-xs text-muted-foreground">{lease.autoRenew ? "On" : "Off"}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="pb-2"><CardTitle className="text-base">User</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="font-medium">{lease.user.name}</div>
            <div className="text-muted-foreground text-xs">{lease.user.email}</div>
            <Link to="/users/$id" params={{ id: lease.user.id }} className="text-xs text-primary hover:underline inline-block mt-2">
              Open user profile →
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-card">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2"><MessageSquare className="h-4 w-4 text-primary" /> Recent SMS</CardTitle>
          <Button size="sm" variant="ghost" onClick={() => toast.success("SMS log refreshed.")}>
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Refresh
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {sms.map((m) => (
            <div key={m.id} className="flex items-start gap-3 py-2 border-b last:border-0">
              <Phone className="h-3.5 w-3.5 text-muted-foreground mt-1 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-xs font-medium truncate">{m.from}</div>
                  <div className="text-[10px] text-muted-foreground shrink-0">{new Date(m.at).toLocaleString()}</div>
                </div>
                <div className="text-sm mt-0.5 break-words">{m.text}</div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-0.5">{children}</div>
    </div>
  );
}
