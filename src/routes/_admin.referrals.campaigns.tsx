import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Play, Pause, Send, Megaphone, Bell, LayoutTemplate, Plus, Pencil, Gift, Ticket, Upload, Image as ImageIcon, Target, MapPin, Smartphone, X } from "lucide-react";
import {
  campaigns as initial,
  referralPrograms,
  promoCodes,
  campaignDestinations,
  campaignStatusTone,
  campaignChannelLabel,
  bannerSizes,
  bannerPlacementLabel,
  audienceSegmentLabel,
  NG_STATES,
  type Campaign,
  type CampaignStatus,
  type CampaignChannel,
  type AudienceSegment,
  type DevicePlatform,
  type BannerPlacement,
} from "@/lib/growth-data";
import { toast } from "sonner";

function buildCtaUrl(path: string, opts: { promoCode?: string | null; utmSource?: string }) {
  if (!path) return "";
  const dest = campaignDestinations.find((d) => d.path === path);
  const params = new URLSearchParams();
  if (opts.promoCode && dest?.acceptsPromo) params.set("promo", opts.promoCode);
  if (opts.utmSource?.trim()) params.set("utm_source", opts.utmSource.trim());
  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
}

export const Route = createFileRoute("/_admin/referrals/campaigns")({
  component: CampaignsPage,
});

const channelIcon: Record<CampaignChannel, typeof Bell> = {
  in_app_notification: Bell,
  login_banner: LayoutTemplate,
};

const ALL_SEGMENTS: AudienceSegment[] = [
  "all_users","just_signed_up","new_user_7d","kyc_pending","kyc_verified","returning_dormant","power_user","no_card","has_card","wallet_high","wallet_low","no_referrals","international_txn",
];
const ALL_DEVICES: DevicePlatform[] = ["ios", "android", "web"];

type Draft = {
  id?: string;
  name: string;
  channel: CampaignChannel;
  audience: string;
  audienceSize: number;
  startAt: string;
  endAt: string;
  title: string;
  body: string;
  ctaLabel: string;
  ctaPath: string;
  utmSource: string;
  linkedProgramId: string;
  linkedPromoCode: string;
  // Targeting
  segments: AudienceSegment[];
  locations: string[];
  devices: DevicePlatform[];
  language: "all" | "en" | "ha" | "ig" | "yo";
  minAppVersion: string;
  // Banner config (only used when channel === "login_banner")
  bannerImageUrl: string;
  bannerSizeId: string;
  bannerPlacement: BannerPlacement;
  displaySeconds: number;
  maxImpressionsPerUser: number;
  cooldownHours: number;
  dismissible: boolean;
};

const emptyDraft: Draft = {
  name: "",
  channel: "in_app_notification",
  audience: "",
  audienceSize: 10000,
  startAt: "",
  endAt: "",
  title: "",
  body: "",
  ctaLabel: "Learn more",
  ctaPath: "",
  utmSource: "",
  linkedProgramId: "none",
  linkedPromoCode: "none",
  segments: ["all_users"],
  locations: ["All Nigeria"],
  devices: [],
  language: "all",
  minAppVersion: "",
  bannerImageUrl: "",
  bannerSizeId: "hero",
  bannerPlacement: "login_splash",
  displaySeconds: 0,
  maxImpressionsPerUser: 3,
  cooldownHours: 24,
  dismissible: true,
};

function parseCta(url: string): { ctaPath: string; utmSource: string } {
  if (!url) return { ctaPath: "", utmSource: "" };
  const [path, qs] = url.split("?");
  const params = new URLSearchParams(qs ?? "");
  const match = campaignDestinations.find((d) => d.path === path);
  return { ctaPath: match ? match.path : path, utmSource: params.get("utm_source") ?? "" };
}

function CampaignsPage() {
  const [items, setItems] = useState<Campaign[]>(initial);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [channel, setChannel] = useState("all");
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>(emptyDraft);

  const rows = useMemo(() => {
    return items.filter((c) => {
      if (status !== "all" && c.status !== status) return false;
      if (channel !== "all" && c.channel !== channel) return false;
      if (q && !c.name.toLowerCase().includes(q.toLowerCase()) && !c.audience.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [items, q, status, channel]);

  const setStatusFor = (id: string, s: CampaignStatus, msg: string) => {
    setItems((prev) => prev.map((c) => (c.id === id ? { ...c, status: s } : c)));
    toast.success(msg);
  };
  const launchDraft = (id: string) => {
    setItems((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const sent = c.audienceSize;
        const delivered = Math.round(sent * 0.98); // in-app delivery is near-perfect
        return {
          ...c,
          status: "live",
          sent,
          delivered,
          opened: Math.round(delivered * (c.channel === "login_banner" ? 0.85 : 0.45)),
          clicked: Math.round(delivered * (c.channel === "login_banner" ? 0.18 : 0.09)),
          converted: Math.round(delivered * 0.025),
          startAt: new Date().toISOString(),
        };
      })
    );
    toast.success("Campaign launched");
  };

  const openNew = () => { setDraft(emptyDraft); setOpen(true); };
  const openEdit = (c: Campaign) => {
    const parsed = parseCta(c.ctaUrl);
    setDraft({
      id: c.id,
      name: c.name,
      channel: c.channel,
      audience: c.audience,
      audienceSize: c.audienceSize,
      startAt: c.startAt ? c.startAt.slice(0, 10) : "",
      endAt: c.endAt ? c.endAt.slice(0, 10) : "",
      title: c.title,
      body: c.body,
      ctaLabel: c.ctaLabel,
      ctaPath: parsed.ctaPath,
      utmSource: parsed.utmSource,
      linkedProgramId: c.linkedProgramId ?? "none",
      linkedPromoCode: c.linkedPromoCode ?? "none",
    });
    setOpen(true);
  };
  const saveDraft = () => {
    if (!draft.name.trim()) { toast.error("Internal name is required"); return; }
    if (!draft.title.trim()) { toast.error("Title shown to users is required"); return; }
    if (!draft.body.trim()) { toast.error("Body copy is required"); return; }
    if (!draft.audience.trim()) { toast.error("Audience is required"); return; }
    if (!draft.ctaPath.trim()) { toast.error("Pick a destination for the CTA"); return; }
    const linkedProgramId = draft.linkedProgramId === "none" ? null : draft.linkedProgramId;
    const linkedPromoCode = draft.linkedPromoCode === "none" ? null : draft.linkedPromoCode;
    const ctaUrl = buildCtaUrl(draft.ctaPath, { promoCode: linkedPromoCode, utmSource: draft.utmSource });
    if (draft.id) {
      setItems((prev) => prev.map((c) => c.id === draft.id ? {
        ...c,
        name: draft.name.trim(),
        channel: draft.channel,
        audience: draft.audience.trim(),
        audienceSize: Math.max(0, draft.audienceSize),
        startAt: draft.startAt ? new Date(draft.startAt).toISOString() : c.startAt,
        endAt: draft.endAt ? new Date(draft.endAt).toISOString() : null,
        title: draft.title.trim(),
        body: draft.body.trim(),
        ctaLabel: draft.ctaLabel.trim() || "Open",
        ctaUrl,
        linkedProgramId,
        linkedPromoCode,
      } : c));
      toast.success(`${draft.name} updated`);
    } else {
      const id = `cmp_${String(Math.floor(Math.random() * 9000) + 1000)}`;
      const c: Campaign = {
        id,
        name: draft.name.trim(),
        channel: draft.channel,
        status: "draft",
        audience: draft.audience.trim(),
        audienceSize: Math.max(0, draft.audienceSize),
        startAt: draft.startAt ? new Date(draft.startAt).toISOString() : new Date().toISOString(),
        endAt: draft.endAt ? new Date(draft.endAt).toISOString() : null,
        title: draft.title.trim(),
        body: draft.body.trim(),
        ctaLabel: draft.ctaLabel.trim() || "Open",
        sent: 0, delivered: 0, opened: 0, clicked: 0, converted: 0,
        ctaUrl,
        linkedProgramId,
        linkedPromoCode,
      };
      setItems((prev) => [c, ...prev]);
      toast.success(`${c.name} created as draft`);
    }
    setOpen(false);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <Card className="shadow-card">
        <CardContent className="p-4 flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[220px]">
            <Label className="text-xs">Search</Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name or audience..." className="pl-8 h-9" />
            </div>
          </div>
          <FilterSelect label="Status" value={status} onChange={setStatus} options={[["all", "All"], ["draft", "Draft"], ["scheduled", "Scheduled"], ["live", "Live"], ["ended", "Ended"]]} />
          <FilterSelect label="Channel" value={channel} onChange={setChannel} options={[["all", "All"], ["in_app_notification", "In-app notification"], ["login_banner", "Login banner"]]} />
          <div className="text-xs text-muted-foreground">{rows.length} campaigns</div>
          <Button size="sm" className="h-9 gap-1.5 ml-auto" onClick={openNew}>
            <Plus className="h-3.5 w-3.5" /> New campaign
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {rows.map((c) => {
          const Icon = channelIcon[c.channel];
          const ctr = c.delivered ? (c.clicked / c.delivered) * 100 : 0;
          const cvr = c.clicked ? (c.converted / c.clicked) * 100 : 0;
          const deliveryRate = c.sent ? (c.delivered / c.sent) * 100 : 0;
          const openRate = c.delivered ? (c.opened / c.delivered) * 100 : 0;
          const linkedProgram = c.linkedProgramId ? referralPrograms.find((p) => p.id === c.linkedProgramId) : null;
          return (
            <Card key={c.id} className="shadow-card">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-display text-base font-bold truncate">{c.name}</div>
                      <div className="text-[11px] text-muted-foreground">{campaignChannelLabel[c.channel]} · {c.id}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Badge variant="outline" className={`text-[10px] capitalize ${campaignStatusTone[c.status]}`}>{c.status}</Badge>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => openEdit(c)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Mini preview of what the user actually sees */}
                {c.channel === "login_banner" ? (
                  <div className="rounded-lg border border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5 p-3 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-foreground truncate">{c.title}</div>
                      <div className="text-[11px] text-muted-foreground line-clamp-2">{c.body}</div>
                    </div>
                    <Button size="sm" className="h-7 text-[11px] shrink-0">{c.ctaLabel}</Button>
                  </div>
                ) : (
                  <div className="rounded-lg border border-border bg-muted/30 p-3 flex items-start gap-2.5">
                    <div className="h-8 w-8 rounded-md bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                      <Bell className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-xs font-bold truncate">{c.title}</div>
                        <span className="text-[10px] text-muted-foreground shrink-0">now</span>
                      </div>
                      <div className="text-[11px] text-muted-foreground line-clamp-2">{c.body}</div>
                    </div>
                  </div>
                )}

                <div className="text-xs space-y-1.5">
                  <Row k="Audience" v={<span>{c.audience}</span>} />
                  <Row k="Reach" v={<span className="font-mono">{c.audienceSize.toLocaleString()}</span>} />
                  <Row k="CTA" v={<span className="font-mono truncate inline-block max-w-[220px]">{c.ctaLabel} → {c.ctaUrl}</span>} />
                  <Row k="Window" v={<span>{new Date(c.startAt).toLocaleDateString()}{c.endAt ? ` → ${new Date(c.endAt).toLocaleDateString()}` : " → ongoing"}</span>} />
                  {(linkedProgram || c.linkedPromoCode) && (
                    <Row k="Linked" v={
                      <div className="flex flex-wrap gap-1 justify-end">
                        {linkedProgram && (
                          <Badge variant="outline" className="text-[10px] gap-1 bg-primary/10 text-primary border-primary/30">
                            <Gift className="h-2.5 w-2.5" />{linkedProgram.name}
                          </Badge>
                        )}
                        {c.linkedPromoCode && (
                          <Badge variant="outline" className="text-[10px] gap-1 bg-success/10 text-success border-success/30 font-mono">
                            <Ticket className="h-2.5 w-2.5" />{c.linkedPromoCode}
                          </Badge>
                        )}
                      </div>
                    } />
                  )}
                </div>

                <div className="grid grid-cols-4 gap-2 text-center">
                  <Metric label="Delivery" value={`${deliveryRate.toFixed(0)}%`} sub={`${c.delivered.toLocaleString()}`} />
                  <Metric label={c.channel === "login_banner" ? "Shown" : "Open"} value={`${openRate.toFixed(0)}%`} sub={`${c.opened.toLocaleString()}`} />
                  <Metric label="CTR" value={`${ctr.toFixed(1)}%`} sub={`${c.clicked.toLocaleString()}`} tone="primary" />
                  <Metric label="CVR" value={`${cvr.toFixed(1)}%`} sub={`${c.converted.toLocaleString()}`} tone="success" />
                </div>

                <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-border">
                  {c.status === "draft" && (
                    <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5 text-success" onClick={() => launchDraft(c.id)}>
                      <Send className="h-3.5 w-3.5" /> Launch now
                    </Button>
                  )}
                  {c.status === "scheduled" && (
                    <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5 text-success" onClick={() => setStatusFor(c.id, "live", `${c.name} started`)}>
                      <Play className="h-3.5 w-3.5" /> Start
                    </Button>
                  )}
                  {c.status === "live" && (
                    <>
                      <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5 text-warning" onClick={() => setStatusFor(c.id, "scheduled", `${c.name} paused`)}>
                        <Pause className="h-3.5 w-3.5" /> Pause
                      </Button>
                      <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5 text-destructive" onClick={() => setStatusFor(c.id, "ended", `${c.name} ended`)}>
                        End
                      </Button>
                    </>
                  )}
                  {c.status === "ended" && (
                    <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => toast.success(`${c.name} duplicated as draft`)}>
                      Duplicate
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {rows.length === 0 && (
        <Card><CardContent className="p-10 text-center text-sm text-muted-foreground"><Megaphone className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />No campaigns match.</CardContent></Card>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{draft.id ? "Edit campaign" : "New campaign"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label className="text-xs">Internal name</Label>
              <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="e.g. June refer-a-friend banner" className="h-9 mt-1" />
              <p className="text-[10px] text-muted-foreground mt-1">Only staff see this. Users see the title & body below.</p>
            </div>
            <div className="col-span-2">
              <Label className="text-xs">Channel</Label>
              <Select value={draft.channel} onValueChange={(v) => setDraft({ ...draft, channel: v as CampaignChannel })}>
                <SelectTrigger className="h-9 mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="in_app_notification">
                    <span className="flex items-center gap-2"><Bell className="h-3.5 w-3.5" /> In-app notification — appears in the bell tray</span>
                  </SelectItem>
                  <SelectItem value="login_banner">
                    <span className="flex items-center gap-2"><LayoutTemplate className="h-3.5 w-3.5" /> Login banner — pops up on next login</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2 pt-2 border-t border-border">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Message users see</Label>
            </div>
            <div className="col-span-2">
              <Label className="text-xs">Title</Label>
              <Input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="e.g. Payday week is here 🎉" className="h-9 mt-1" maxLength={60} />
              <p className="text-[10px] text-muted-foreground mt-1">{draft.title.length}/60 characters</p>
            </div>
            <div className="col-span-2">
              <Label className="text-xs">Body</Label>
              <Textarea value={draft.body} onChange={(e) => setDraft({ ...draft, body: e.target.value })} placeholder="Short supporting line shown under the title." className="mt-1 min-h-[68px]" maxLength={160} />
              <p className="text-[10px] text-muted-foreground mt-1">{draft.body.length}/160 characters</p>
            </div>
            <div>
              <Label className="text-xs">CTA button label</Label>
              <Input value={draft.ctaLabel} onChange={(e) => setDraft({ ...draft, ctaLabel: e.target.value })} placeholder="Pay a bill" className="h-9 mt-1" maxLength={24} />
            </div>
            <div>
              <Label className="text-xs">Reach (audience size)</Label>
              <Input type="number" value={draft.audienceSize} onChange={(e) => setDraft({ ...draft, audienceSize: Number(e.target.value) })} className="h-9 mt-1 font-mono" />
            </div>
            <div className="col-span-2">
              <Label className="text-xs">Audience description</Label>
              <Input value={draft.audience} onChange={(e) => setDraft({ ...draft, audience: e.target.value })} placeholder="e.g. Wallet >₦50k · no card" className="h-9 mt-1" />
            </div>
            <div>
              <Label className="text-xs">Start date</Label>
              <Input type="date" value={draft.startAt} onChange={(e) => setDraft({ ...draft, startAt: e.target.value })} className="h-9 mt-1" />
            </div>
            <div>
              <Label className="text-xs">End date (optional)</Label>
              <Input type="date" value={draft.endAt} onChange={(e) => setDraft({ ...draft, endAt: e.target.value })} className="h-9 mt-1" />
            </div>

            <div className="col-span-2 pt-2 border-t border-border">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Where the CTA leads</Label>
            </div>
            <div className="col-span-2">
              <Label className="text-xs">Destination</Label>
              <Select value={draft.ctaPath} onValueChange={(v) => setDraft({ ...draft, ctaPath: v })}>
                <SelectTrigger className="h-9 mt-1"><SelectValue placeholder="Pick a page in the app..." /></SelectTrigger>
                <SelectContent className="max-h-72">
                  {(["Wallet", "Bills", "Cards", "eSIM", "Numbers", "Growth", "Account"] as const).map((g) => {
                    const dests = campaignDestinations.filter((d) => d.group === g);
                    if (!dests.length) return null;
                    return (
                      <div key={g}>
                        <div className="px-2 py-1 text-[10px] uppercase tracking-wide text-muted-foreground">{g}</div>
                        {dests.map((d) => (
                          <SelectItem key={d.path} value={d.path}>
                            <span className="flex items-center gap-2">
                              <span>{d.label}</span>
                              <span className="font-mono text-[10px] text-muted-foreground">{d.path}</span>
                              {d.acceptsPromo && <span className="text-[9px] text-success">promo</span>}
                            </span>
                          </SelectItem>
                        ))}
                      </div>
                    );
                  })}
                </SelectContent>
              </Select>
              <p className="text-[10px] text-muted-foreground mt-1">Pages marked <span className="text-success">promo</span> auto-append the linked promo code as <span className="font-mono">?promo=...</span></p>
            </div>
            <div className="col-span-2">
              <Label className="text-xs">UTM source (optional)</Label>
              <Input value={draft.utmSource} onChange={(e) => setDraft({ ...draft, utmSource: e.target.value })} placeholder="e.g. notif-may, banner-paydays" className="h-9 mt-1 font-mono" />
            </div>
            {draft.ctaPath && (
              <div className="col-span-2 rounded-md border border-dashed border-border bg-muted/30 px-3 py-2">
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Final CTA URL</div>
                <div className="font-mono text-xs break-all">
                  {buildCtaUrl(draft.ctaPath, {
                    promoCode: draft.linkedPromoCode === "none" ? null : draft.linkedPromoCode,
                    utmSource: draft.utmSource,
                  })}
                </div>
              </div>
            )}
            <div className="col-span-2 grid grid-cols-2 gap-3 pt-2 border-t border-border">
              <div>
                <Label className="text-xs flex items-center gap-1"><Gift className="h-3 w-3" /> Linked referral program</Label>
                <Select value={draft.linkedProgramId} onValueChange={(v) => setDraft({ ...draft, linkedProgramId: v })}>
                  <SelectTrigger className="h-9 mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">— none —</SelectItem>
                    {referralPrograms.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs flex items-center gap-1"><Ticket className="h-3 w-3" /> Linked promo code</Label>
                <Select value={draft.linkedPromoCode} onValueChange={(v) => setDraft({ ...draft, linkedPromoCode: v })}>
                  <SelectTrigger className="h-9 mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">— none —</SelectItem>
                    {promoCodes.map((p) => <SelectItem key={p.id} value={p.code} className="font-mono">{p.code}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={saveDraft}>{draft.id ? "Save changes" : "Create draft"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-muted-foreground shrink-0">{k}</span>
      <div className="min-w-0 text-right">{v}</div>
    </div>
  );
}

function Metric({ label, value, sub, tone }: { label: string; value: string; sub: string; tone?: "primary" | "success" | "warning" }) {
  const t = tone === "primary" ? "text-primary" : tone === "success" ? "text-success" : tone === "warning" ? "text-warning" : "text-foreground";
  return (
    <div className="rounded-md border border-border p-2">
      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</div>
      <div className={`text-sm font-display font-bold ${t}`}>{value}</div>
      <div className="text-[10px] text-muted-foreground">{sub}</div>
    </div>
  );
}

function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: Array<[string, string]> }) {
  return (
    <div>
      <Label className="text-xs">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-9 w-[180px]"><SelectValue /></SelectTrigger>
        <SelectContent>
          {options.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}
