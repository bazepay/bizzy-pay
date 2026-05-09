import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Play, Pause, Send, Megaphone, Mail, MessageSquare, Bell, Smartphone, Plus, Pencil, Gift, Ticket } from "lucide-react";
import {
  campaigns as initial,
  referralPrograms,
  promoCodes,
  campaignDestinations,
  fmtNgn,
  campaignStatusTone,
  campaignChannelLabel,
  type Campaign,
  type CampaignStatus,
  type CampaignChannel,
} from "@/lib/growth-data";
import { toast } from "sonner";

// Build a CTA URL from a chosen destination + optional promo code + optional UTM source.
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

const channelIcon = {
  push: Bell,
  email: Mail,
  sms: MessageSquare,
  in_app: Smartphone,
};

type Draft = {
  id?: string;
  name: string;
  channel: CampaignChannel;
  audience: string;
  audienceSize: number;
  startAt: string;
  endAt: string;
  budgetNgn: number;
  ctaPath: string;     // chosen destination path
  utmSource: string;   // optional, appended as ?utm_source=
  linkedProgramId: string;
  linkedPromoCode: string;
};

const emptyDraft: Draft = {
  name: "",
  channel: "push",
  audience: "",
  audienceSize: 10000,
  startAt: "",
  endAt: "",
  budgetNgn: 500_000,
  ctaPath: "",
  utmSource: "",
  linkedProgramId: "none",
  linkedPromoCode: "none",
};

// Split a stored ctaUrl ("/path?promo=X&utm_source=Y") back into picker fields.
function parseCta(url: string): { ctaPath: string; utmSource: string } {
  if (!url) return { ctaPath: "", utmSource: "" };
  const [path, qs] = url.split("?");
  const params = new URLSearchParams(qs ?? "");
  // Match against catalog if possible; otherwise fall back to raw path.
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
        const delivered = Math.round(sent * 0.96);
        return { ...c, status: "live", sent, delivered, opened: Math.round(delivered * 0.42), clicked: Math.round(delivered * 0.08), converted: Math.round(delivered * 0.02), startAt: new Date().toISOString() };
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
      budgetNgn: c.budgetNgn,
      ctaPath: parsed.ctaPath,
      utmSource: parsed.utmSource,
      linkedProgramId: c.linkedProgramId ?? "none",
      linkedPromoCode: c.linkedPromoCode ?? "none",
    });
    setOpen(true);
  };
  const saveDraft = () => {
    if (!draft.name.trim()) { toast.error("Name is required"); return; }
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
        budgetNgn: Math.max(0, draft.budgetNgn),
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
        sent: 0, delivered: 0, opened: 0, clicked: 0, converted: 0,
        budgetNgn: Math.max(0, draft.budgetNgn),
        spentNgn: 0,
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
          <FilterSelect label="Channel" value={channel} onChange={setChannel} options={[["all", "All"], ["push", "Push"], ["email", "Email"], ["sms", "SMS"], ["in_app", "In-app"]]} />
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
          const cpa = c.converted ? c.spentNgn / c.converted : 0;
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

                <div className="text-xs space-y-1.5">
                  <Row k="Audience" v={<span>{c.audience}</span>} />
                  <Row k="Reach" v={<span className="font-mono">{c.audienceSize.toLocaleString()}</span>} />
                  <Row k="CTA" v={<span className="font-mono truncate inline-block max-w-[220px]">{c.ctaUrl}</span>} />
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
                  <Metric label="Open" value={`${openRate.toFixed(0)}%`} sub={`${c.opened.toLocaleString()}`} />
                  <Metric label="CTR" value={`${ctr.toFixed(1)}%`} sub={`${c.clicked.toLocaleString()}`} tone="primary" />
                  <Metric label="CVR" value={`${cvr.toFixed(1)}%`} sub={`${c.converted.toLocaleString()}`} tone="success" />
                </div>

                <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-border">
                  <Metric label="Budget" value={fmtNgn(c.budgetNgn)} sub="cap" />
                  <Metric label="Spent" value={fmtNgn(c.spentNgn)} sub={c.budgetNgn ? `${Math.round((c.spentNgn / c.budgetNgn) * 100)}%` : "—"} />
                  <Metric label="CPA" value={cpa ? fmtNgn(Math.round(cpa)) : "—"} sub="cost / conv" tone="warning" />
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
              <Label className="text-xs">Campaign name</Label>
              <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="e.g. June refer-a-friend push" className="h-9 mt-1" />
            </div>
            <div>
              <Label className="text-xs">Channel</Label>
              <Select value={draft.channel} onValueChange={(v) => setDraft({ ...draft, channel: v as CampaignChannel })}>
                <SelectTrigger className="h-9 mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(campaignChannelLabel) as CampaignChannel[]).map((k) => (
                    <SelectItem key={k} value={k}>{campaignChannelLabel[k]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
            <div className="col-span-2">
              <Label className="text-xs">CTA destination</Label>
              <Select value={draft.ctaPath} onValueChange={(v) => setDraft({ ...draft, ctaPath: v })}>
                <SelectTrigger className="h-9 mt-1"><SelectValue placeholder="Pick a page in the app..." /></SelectTrigger>
                <SelectContent className="max-h-72">
                  {(["Wallet", "Bills", "Cards", "eSIM", "Numbers", "Growth", "Account"] as const).map((g) => {
                    const items = campaignDestinations.filter((d) => d.group === g);
                    if (!items.length) return null;
                    return (
                      <div key={g}>
                        <div className="px-2 py-1 text-[10px] uppercase tracking-wide text-muted-foreground">{g}</div>
                        {items.map((d) => (
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
              <Input value={draft.utmSource} onChange={(e) => setDraft({ ...draft, utmSource: e.target.value })} placeholder="e.g. push-may, email-paydays" className="h-9 mt-1 font-mono" />
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
            <div>
              <Label className="text-xs">Budget cap (₦)</Label>
              <Input type="number" value={draft.budgetNgn} onChange={(e) => setDraft({ ...draft, budgetNgn: Number(e.target.value) })} className="h-9 mt-1 font-mono" />
            </div>
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
        <SelectTrigger className="h-9 w-[160px]"><SelectValue /></SelectTrigger>
        <SelectContent>
          {options.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}
