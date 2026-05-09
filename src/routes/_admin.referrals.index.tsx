import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Gift, Megaphone, Ticket, ArrowRight, TrendingUp, Wallet, CheckCircle2 } from "lucide-react";
import {
  referralPrograms,
  referrals,
  campaigns,
  promoCodes,
  fmtNgn,
  programStatusTone,
  referralStatusTone,
  campaignStatusTone,
  rewardTriggerLabel,
  campaignChannelLabel,
} from "@/lib/growth-data";

export const Route = createFileRoute("/_admin/referrals/")({
  component: GrowthOverview,
});

function GrowthOverview() {
  const activePrograms = referralPrograms.filter((p) => p.status === "active");
  const totalReferrals = referrals.length;
  const rewarded = referrals.filter((r) => r.status === "rewarded").length;
  const qualified = referrals.filter((r) => r.status === "qualified").length;
  const pending = referrals.filter((r) => r.status === "pending").length;
  const totalRewardNgn = referrals.reduce((s, r) => s + r.rewardNgn, 0);
  const conversionRate = totalReferrals ? (rewarded / totalReferrals) * 100 : 0;
  const totalSpent = referralPrograms.reduce((s, p) => s + p.spentNgn, 0);
  const totalBudget = referralPrograms.reduce((s, p) => s + p.budgetNgn, 0);
  const liveCampaigns = campaigns.filter((c) => c.status === "live");
  const activePromos = promoCodes.filter((p) => p.status === "active");
  const totalRedemptions = promoCodes.reduce((s, p) => s + p.redemptions, 0);
  const totalCredited = promoCodes.reduce((s, p) => s + p.totalCreditedNgn, 0);

  const recentReferrals = [...referrals]
    .sort((a, b) => +new Date(b.invitedAt) - +new Date(a.invitedAt))
    .slice(0, 6);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Kpi
          label="Total referrals"
          value={totalReferrals.toLocaleString()}
          sub={`${conversionRate.toFixed(1)}% conversion`}
          icon={Users}
        />
        <Kpi
          label="Rewards paid"
          value={fmtNgn(totalRewardNgn)}
          sub={`${rewarded.toLocaleString()} rewarded`}
          icon={Wallet}
          tone="success"
        />
        <Kpi
          label="Program budget"
          value={fmtNgn(totalSpent)}
          sub={`of ${fmtNgn(totalBudget)} (${totalBudget ? Math.round((totalSpent / totalBudget) * 100) : 0}%)`}
          icon={TrendingUp}
        />
        <Kpi
          label="Active promos"
          value={activePromos.length.toLocaleString()}
          sub={`${totalRedemptions.toLocaleString()} redemptions`}
          icon={Ticket}
          tone={activePromos.length > 0 ? "success" : undefined}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 shadow-card">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="font-display text-lg font-bold">Referral programs</div>
                <div className="text-xs text-muted-foreground">Budget utilisation and qualified referrals</div>
              </div>
              <Link to="/referrals/programs" className="text-xs text-primary inline-flex items-center gap-1">
                Manage <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="space-y-3">
              {referralPrograms.map((p) => {
                const pct = p.budgetNgn ? Math.min(100, (p.spentNgn / p.budgetNgn) * 100) : 0;
                const qualPct = p.totalReferrals ? (p.qualifiedReferrals / p.totalReferrals) * 100 : 0;
                return (
                  <div key={p.id} className="rounded-md border border-border p-3">
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">{p.name}</div>
                        <div className="text-[11px] text-muted-foreground">
                          {rewardTriggerLabel[p.trigger]} · ₦{p.referrerReward.amount.toLocaleString()} referrer / ₦{p.refereeReward.amount.toLocaleString()} referee
                        </div>
                      </div>
                      <Badge variant="outline" className={`text-[10px] capitalize ${programStatusTone[p.status]}`}>{p.status}</Badge>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
                      <span>{fmtNgn(p.spentNgn)} / {fmtNgn(p.budgetNgn)}</span>
                      <span>{p.qualifiedReferrals.toLocaleString()} qualified · {qualPct.toFixed(0)}%</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${pct > 90 ? "bg-destructive" : pct > 70 ? "bg-warning" : "bg-primary"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="font-display text-lg font-bold">Funnel</div>
                <div className="text-xs text-muted-foreground">Across all programs</div>
              </div>
            </div>
            <FunnelRow label="Invited" value={totalReferrals} max={totalReferrals} tone="primary" />
            <FunnelRow label="Qualified" value={qualified + rewarded} max={totalReferrals} tone="primary" />
            <FunnelRow label="Rewarded" value={rewarded} max={totalReferrals} tone="success" />
            <FunnelRow label="Pending" value={pending} max={totalReferrals} tone="warning" />
            <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                Conversion
              </div>
              <span className="font-display text-base font-bold">{conversionRate.toFixed(1)}%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="shadow-card">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="font-display text-lg font-bold">Live campaigns</div>
                <div className="text-xs text-muted-foreground">{liveCampaigns.length} running · {campaigns.reduce((s, c) => s + c.converted, 0).toLocaleString()} conversions</div>
              </div>
              <Link to="/referrals/campaigns" className="text-xs text-primary inline-flex items-center gap-1">
                All <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            {liveCampaigns.length === 0 ? (
              <div className="text-sm text-muted-foreground py-6 text-center">No live campaigns.</div>
            ) : (
              <div className="space-y-1.5">
                {liveCampaigns.map((c) => {
                  const ctr = c.delivered ? (c.clicked / c.delivered) * 100 : 0;
                  const cvr = c.clicked ? (c.converted / c.clicked) * 100 : 0;
                  return (
                    <div key={c.id} className="flex items-center justify-between p-2.5 rounded-md border border-border">
                      <div className="flex items-center gap-2 min-w-0">
                        <Megaphone className="h-4 w-4 text-primary shrink-0" />
                        <div className="min-w-0">
                          <div className="text-sm font-medium truncate">{c.name}</div>
                          <div className="text-[11px] text-muted-foreground">{campaignChannelLabel[c.channel]} · {c.audienceSize.toLocaleString()} reach</div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <Badge variant="outline" className={`text-[10px] capitalize ${campaignStatusTone[c.status]}`}>{c.status}</Badge>
                        <div className="text-[11px] text-muted-foreground mt-0.5">CTR {ctr.toFixed(1)}% · CVR {cvr.toFixed(1)}%</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="font-display text-lg font-bold">Recent referrals</div>
                <div className="text-xs text-muted-foreground">Latest invites and rewards</div>
              </div>
              <Link to="/referrals/list" className="text-xs text-primary inline-flex items-center gap-1">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="space-y-1.5">
              {recentReferrals.map((r) => {
                const ago = Math.max(1, Math.round((Date.now() - +new Date(r.invitedAt)) / 60_000));
                const agoLabel = ago < 60 ? `${ago}m ago` : ago < 1440 ? `${Math.round(ago / 60)}h ago` : `${Math.round(ago / 1440)}d ago`;
                return (
                  <div key={r.id} className="flex items-center justify-between p-2.5 rounded-md border border-border">
                    <div className="flex items-center gap-2 min-w-0">
                      <Gift className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">
                          {r.referrerName} → {r.refereeName}
                        </div>
                        <div className="text-[11px] text-muted-foreground font-mono">{r.code} · {agoLabel}</div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <Badge variant="outline" className={`text-[10px] capitalize ${referralStatusTone[r.status]}`}>{r.status}</Badge>
                      {r.rewardNgn > 0 && (
                        <div className="text-[11px] font-mono text-success mt-0.5">+{fmtNgn(r.rewardNgn)}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-card">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="font-display text-lg font-bold">Promo code performance</div>
              <div className="text-xs text-muted-foreground">{fmtNgn(totalCredited)} credited across all codes</div>
            </div>
            <Link to="/referrals/promos" className="text-xs text-primary inline-flex items-center gap-1">
              Manage codes <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {promoCodes.slice(0, 6).map((p) => (
              <div key={p.id} className="rounded-md border border-border p-3">
                <div className="flex items-center justify-between mb-1">
                  <div className="font-mono text-sm font-bold">{p.code}</div>
                  <Badge variant="outline" className={`text-[10px] capitalize ${p.status === "active" ? "bg-success/15 text-success border-success/30" : p.status === "scheduled" ? "bg-primary/15 text-primary border-primary/30" : p.status === "paused" ? "bg-warning/15 text-warning border-warning/30" : "bg-muted text-muted-foreground border-border"}`}>{p.status}</Badge>
                </div>
                <div className="text-[11px] text-muted-foreground line-clamp-2 mb-2">{p.description}</div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground">{p.redemptions.toLocaleString()} redeemed</span>
                  <span className="font-mono">{fmtNgn(p.totalCreditedNgn)}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Suppress unused */}
      {false && activePrograms.length}
    </motion.div>
  );
}

function Kpi({ label, value, sub, icon: Icon, tone }: { label: string; value: string; sub: string; icon: typeof Users; tone?: "warning" | "danger" | "success" }) {
  const t = tone === "warning" ? "text-warning" : tone === "danger" ? "text-destructive" : tone === "success" ? "text-success" : "text-muted-foreground";
  return (
    <Card className="shadow-card">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs text-muted-foreground uppercase tracking-wider">{label}</div>
          <Icon className={`h-4 w-4 ${t}`} />
        </div>
        <div className="text-2xl font-display font-bold">{value}</div>
        <div className="text-xs text-muted-foreground mt-1">{sub}</div>
      </CardContent>
    </Card>
  );
}

function FunnelRow({ label, value, max, tone }: { label: string; value: number; max: number; tone: "primary" | "success" | "warning" }) {
  const pct = max ? (value / max) * 100 : 0;
  const bg = tone === "success" ? "bg-success" : tone === "warning" ? "bg-warning" : "bg-primary";
  return (
    <div className="mb-2.5">
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono">{value.toLocaleString()} <span className="text-muted-foreground">({pct.toFixed(0)}%)</span></span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${bg}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
