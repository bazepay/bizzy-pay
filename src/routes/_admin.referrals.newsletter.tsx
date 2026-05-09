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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Search, Send, Mail, Plus, Pencil, Pause, Play, Ticket, Upload, Image as ImageIcon, X, Target, MapPin, Smartphone, Code, Type } from "lucide-react";
import {
  newsletters as initial,
  promoCodes,
  campaignDestinations,
  newsletterStatusTone,
  audienceSegmentLabel,
  NG_STATES,
  type Newsletter,
  type NewsletterStatus,
  type EmailBodyFormat,
  type AudienceSegment,
  type DevicePlatform,
} from "@/lib/growth-data";
import { toast } from "sonner";

export const Route = createFileRoute("/_admin/referrals/newsletter")({
  component: NewsletterPage,
});

const ALL_SEGMENTS: AudienceSegment[] = [
  "all_users","just_signed_up","new_user_7d","kyc_pending","kyc_verified","returning_dormant","power_user","no_card","has_card","wallet_high","wallet_low","no_referrals","international_txn",
];
const ALL_DEVICES: DevicePlatform[] = ["ios", "android", "web"];

type Draft = {
  id?: string;
  subject: string;
  preheader: string;
  audience: string;
  audienceSize: number;
  fromName: string;
  fromEmail: string;
  replyTo: string;
  headerImageUrl: string;
  bodyFormat: EmailBodyFormat;
  bodyText: string;
  scheduledAt: string;
  ctaPath: string;
  linkedPromoCode: string;
  segments: AudienceSegment[];
  locations: string[];
  devices: DevicePlatform[];
  language: "all" | "en" | "ha" | "ig" | "yo";
};

const emptyDraft: Draft = {
  subject: "",
  preheader: "",
  audience: "",
  audienceSize: 10000,
  fromName: "BazePay",
  fromEmail: "hello@bazepay.com",
  replyTo: "",
  headerImageUrl: "",
  bodyFormat: "plain",
  bodyText: "",
  scheduledAt: "",
  ctaPath: "",
  linkedPromoCode: "none",
  segments: ["all_users"],
  locations: ["All Nigeria"],
  devices: [],
  language: "all",
};

function NewsletterPage() {
  const [items, setItems] = useState<Newsletter[]>(initial);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>(emptyDraft);

  const rows = useMemo(() => {
    return items.filter((n) => {
      if (status !== "all" && n.status !== status) return false;
      if (q && !n.subject.toLowerCase().includes(q.toLowerCase()) && !n.audience.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [items, q, status]);

  // Aggregate KPIs
  const totalSent = items.reduce((s, n) => s + n.sent, 0);
  const totalDelivered = items.reduce((s, n) => s + n.delivered, 0);
  const totalOpened = items.reduce((s, n) => s + n.opened, 0);
  const totalClicked = items.reduce((s, n) => s + n.clicked, 0);
  const totalUnsub = items.reduce((s, n) => s + n.unsubscribed, 0);
  const avgOpen = totalDelivered ? (totalOpened / totalDelivered) * 100 : 0;
  const avgClick = totalDelivered ? (totalClicked / totalDelivered) * 100 : 0;

  const setStatusFor = (id: string, s: NewsletterStatus, msg: string) => {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, status: s } : n)));
    toast.success(msg);
  };
  const sendNow = (id: string) => {
    setItems((prev) =>
      prev.map((n) => {
        if (n.id !== id) return n;
        const sent = n.audienceSize;
        const delivered = Math.round(sent * 0.97);
        return {
          ...n,
          status: "sent",
          sent,
          delivered,
          opened: Math.round(delivered * 0.42),
          clicked: Math.round(delivered * 0.08),
          unsubscribed: Math.round(delivered * 0.002),
          bounced: sent - delivered,
          sentAt: new Date().toISOString(),
        };
      })
    );
    toast.success("Newsletter sent");
  };

  const openNew = () => { setDraft(emptyDraft); setOpen(true); };
  const openEdit = (n: Newsletter) => {
    const path = n.ctaUrl ? n.ctaUrl.split("?")[0] : "";
    setDraft({
      ...emptyDraft,
      id: n.id,
      subject: n.subject,
      preheader: n.preheader,
      audience: n.audience,
      audienceSize: n.audienceSize,
      fromName: n.fromName,
      fromEmail: n.fromEmail,
      replyTo: n.replyTo ?? "",
      headerImageUrl: n.headerImageUrl ?? "",
      bodyFormat: n.bodyFormat ?? "plain",
      bodyText: n.bodyText ?? "",
      scheduledAt: n.scheduledAt ? n.scheduledAt.slice(0, 16) : "",
      ctaPath: path,
      linkedPromoCode: n.linkedPromoCode ?? "none",
      segments: n.targeting?.segments ?? ["all_users"],
      locations: n.targeting?.locations ?? ["All Nigeria"],
      devices: n.targeting?.devices ?? [],
      language: n.targeting?.language ?? "all",
    });
    setOpen(true);
  };

  const buildUrl = (path: string, promo: string | null) => {
    if (!path) return "";
    const dest = campaignDestinations.find((d) => d.path === path);
    if (promo && dest?.acceptsPromo) return `${path}?promo=${promo}`;
    return path;
  };

  const saveDraft = () => {
    if (!draft.subject.trim()) { toast.error("Subject is required"); return; }
    if (!draft.fromEmail.trim()) { toast.error("From email is required"); return; }
    if (!draft.bodyText.trim()) { toast.error("Email body is required"); return; }
    if (draft.segments.length === 0) { toast.error("Select at least one audience segment"); return; }
    const linkedPromoCode = draft.linkedPromoCode === "none" ? null : draft.linkedPromoCode;
    const ctaUrl = buildUrl(draft.ctaPath, linkedPromoCode);
    const audience = draft.audience.trim() || draft.segments.map((s) => audienceSegmentLabel[s]).join(", ");
    const targeting = {
      segments: draft.segments,
      locations: draft.locations,
      devices: draft.devices,
      language: draft.language,
    };
    if (draft.id) {
      setItems((prev) => prev.map((n) => n.id === draft.id ? {
        ...n,
        subject: draft.subject.trim(),
        preheader: draft.preheader.trim(),
        audience,
        audienceSize: Math.max(0, draft.audienceSize),
        fromName: draft.fromName.trim(),
        fromEmail: draft.fromEmail.trim(),
        replyTo: draft.replyTo.trim() || undefined,
        headerImageUrl: draft.headerImageUrl || undefined,
        bodyFormat: draft.bodyFormat,
        bodyText: draft.bodyText,
        scheduledAt: draft.scheduledAt ? new Date(draft.scheduledAt).toISOString() : n.scheduledAt,
        linkedPromoCode,
        ctaUrl,
        targeting,
      } : n));
      toast.success(`${draft.subject} updated`);
    } else {
      const id = `nl_${String(Math.floor(Math.random() * 9000) + 1000)}`;
      const n: Newsletter = {
        id,
        subject: draft.subject.trim(),
        preheader: draft.preheader.trim(),
        audience,
        audienceSize: Math.max(0, draft.audienceSize),
        fromName: draft.fromName.trim(),
        fromEmail: draft.fromEmail.trim(),
        replyTo: draft.replyTo.trim() || undefined,
        headerImageUrl: draft.headerImageUrl || undefined,
        bodyFormat: draft.bodyFormat,
        bodyText: draft.bodyText,
        status: draft.scheduledAt ? "scheduled" : "draft",
        scheduledAt: draft.scheduledAt ? new Date(draft.scheduledAt).toISOString() : null,
        sentAt: null,
        sent: 0, delivered: 0, opened: 0, clicked: 0, unsubscribed: 0, bounced: 0,
        linkedPromoCode,
        ctaUrl,
        targeting,
      };
      setItems((prev) => [n, ...prev]);
      toast.success(`${n.subject} created`);
    }
    setOpen(false);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Kpi label="Total sent" value={totalSent.toLocaleString()} sub={`${items.length} newsletters`} />
        <Kpi label="Avg open rate" value={`${avgOpen.toFixed(1)}%`} sub={`${totalOpened.toLocaleString()} opens`} tone="primary" />
        <Kpi label="Avg click rate" value={`${avgClick.toFixed(1)}%`} sub={`${totalClicked.toLocaleString()} clicks`} tone="success" />
        <Kpi label="Unsubscribes" value={totalUnsub.toLocaleString()} sub={`${totalSent ? ((totalUnsub / totalSent) * 100).toFixed(2) : "0.00"}% of sent`} tone="warning" />
      </div>

      {/* Filters */}
      <Card className="shadow-card">
        <CardContent className="p-4 flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[220px]">
            <Label className="text-xs">Search</Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Subject or audience..." className="pl-8 h-9" />
            </div>
          </div>
          <div>
            <Label className="text-xs">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="h-9 w-[160px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {[["all", "All"], ["draft", "Draft"], ["scheduled", "Scheduled"], ["sending", "Sending"], ["sent", "Sent"], ["paused", "Paused"]].map(([v, l]) => (
                  <SelectItem key={v} value={v}>{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="text-xs text-muted-foreground">{rows.length} newsletters</div>
          <Button size="sm" className="h-9 gap-1.5 ml-auto" onClick={openNew}>
            <Plus className="h-3.5 w-3.5" /> New newsletter
          </Button>
        </CardContent>
      </Card>

      {/* List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {rows.map((n) => {
          const openRate = n.delivered ? (n.opened / n.delivered) * 100 : 0;
          const clickRate = n.delivered ? (n.clicked / n.delivered) * 100 : 0;
          const deliveryRate = n.sent ? (n.delivered / n.sent) * 100 : 0;
          const unsubRate = n.delivered ? (n.unsubscribed / n.delivered) * 100 : 0;
          return (
            <Card key={n.id} className="shadow-card">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <Mail className="h-6 w-6" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-display text-base font-bold truncate">{n.subject}</div>
                      <div className="text-[11px] text-muted-foreground truncate">{n.fromName} &lt;{n.fromEmail}&gt; · {n.id}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Badge variant="outline" className={`text-[10px] capitalize ${newsletterStatusTone[n.status]}`}>{n.status}</Badge>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => openEdit(n)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Inbox preview */}
                <div className="rounded-lg border border-border bg-muted/30 p-3">
                  <div className="text-xs font-bold truncate">{n.subject}</div>
                  <div className="text-[11px] text-muted-foreground line-clamp-1">{n.preheader}</div>
                </div>

                <div className="text-xs space-y-1.5">
                  <Row k="Audience" v={<span>{n.audience}</span>} />
                  <Row k="Reach" v={<span className="font-mono">{n.audienceSize.toLocaleString()}</span>} />
                  {n.scheduledAt && <Row k="Scheduled" v={<span>{new Date(n.scheduledAt).toLocaleString()}</span>} />}
                  {n.sentAt && <Row k="Sent at" v={<span>{new Date(n.sentAt).toLocaleString()}</span>} />}
                  {n.ctaUrl && <Row k="CTA" v={<span className="font-mono truncate inline-block max-w-[220px]">{n.ctaUrl}</span>} />}
                  {n.linkedPromoCode && (
                    <Row k="Promo" v={
                      <Badge variant="outline" className="text-[10px] gap-1 bg-success/10 text-success border-success/30 font-mono">
                        <Ticket className="h-2.5 w-2.5" />{n.linkedPromoCode}
                      </Badge>
                    } />
                  )}
                </div>

                <div className="grid grid-cols-4 gap-2 text-center">
                  <Metric label="Delivery" value={`${deliveryRate.toFixed(0)}%`} sub={`${n.delivered.toLocaleString()}`} />
                  <Metric label="Open" value={`${openRate.toFixed(1)}%`} sub={`${n.opened.toLocaleString()}`} tone="primary" />
                  <Metric label="Click" value={`${clickRate.toFixed(1)}%`} sub={`${n.clicked.toLocaleString()}`} tone="success" />
                  <Metric label="Unsub" value={`${unsubRate.toFixed(2)}%`} sub={`${n.unsubscribed.toLocaleString()}`} tone="warning" />
                </div>

                <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-border">
                  {n.status === "draft" && (
                    <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5 text-success" onClick={() => sendNow(n.id)}>
                      <Send className="h-3.5 w-3.5" /> Send now
                    </Button>
                  )}
                  {n.status === "scheduled" && (
                    <>
                      <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5 text-warning" onClick={() => setStatusFor(n.id, "paused", `${n.subject} paused`)}>
                        <Pause className="h-3.5 w-3.5" /> Pause
                      </Button>
                      <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5 text-success" onClick={() => sendNow(n.id)}>
                        <Send className="h-3.5 w-3.5" /> Send now
                      </Button>
                    </>
                  )}
                  {n.status === "paused" && (
                    <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5 text-success" onClick={() => setStatusFor(n.id, "scheduled", `${n.subject} resumed`)}>
                      <Play className="h-3.5 w-3.5" /> Resume
                    </Button>
                  )}
                  {n.status === "sending" && (
                    <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5 text-warning" onClick={() => setStatusFor(n.id, "paused", `${n.subject} paused`)}>
                      <Pause className="h-3.5 w-3.5" /> Pause
                    </Button>
                  )}
                  {n.status === "sent" && (
                    <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => toast.success(`${n.subject} duplicated as draft`)}>
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
        <Card><CardContent className="p-10 text-center text-sm text-muted-foreground"><Mail className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />No newsletters match.</CardContent></Card>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{draft.id ? "Edit newsletter" : "New newsletter"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label className="text-xs">Subject line</Label>
              <Input value={draft.subject} onChange={(e) => setDraft({ ...draft, subject: e.target.value })} placeholder="e.g. Payday week — 5% off every bill 💸" className="h-9 mt-1" maxLength={90} />
              <p className="text-[10px] text-muted-foreground mt-1">{draft.subject.length}/90 characters</p>
            </div>
            <div className="col-span-2">
              <Label className="text-xs">Preheader (preview text)</Label>
              <Textarea value={draft.preheader} onChange={(e) => setDraft({ ...draft, preheader: e.target.value })} placeholder="Short preview shown after the subject in inbox lists." className="mt-1 min-h-[60px]" maxLength={140} />
              <p className="text-[10px] text-muted-foreground mt-1">{draft.preheader.length}/140 characters</p>
            </div>
            <div>
              <Label className="text-xs">From name</Label>
              <Input value={draft.fromName} onChange={(e) => setDraft({ ...draft, fromName: e.target.value })} className="h-9 mt-1" />
            </div>
            <div>
              <Label className="text-xs">From email</Label>
              <Input value={draft.fromEmail} onChange={(e) => setDraft({ ...draft, fromEmail: e.target.value })} className="h-9 mt-1 font-mono" />
            </div>
            <div>
              <Label className="text-xs">Reply-to (optional)</Label>
              <Input value={draft.replyTo} onChange={(e) => setDraft({ ...draft, replyTo: e.target.value })} placeholder="support@bazepay.com" className="h-9 mt-1 font-mono" />
            </div>
            <div>
              <Label className="text-xs">Schedule send (optional)</Label>
              <Input type="datetime-local" value={draft.scheduledAt} onChange={(e) => setDraft({ ...draft, scheduledAt: e.target.value })} className="h-9 mt-1" />
            </div>

            <EmailHeaderImageSection draft={draft} setDraft={setDraft} />
            <EmailBodySection draft={draft} setDraft={setDraft} />

            <div className="col-span-2 pt-2 border-t border-border">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Audience</Label>
            </div>
            <div className="col-span-2">
              <Label className="text-xs">Audience description (optional override)</Label>
              <Input value={draft.audience} onChange={(e) => setDraft({ ...draft, audience: e.target.value })} placeholder="Auto-generated from segments below if blank" className="h-9 mt-1" />
            </div>
            <div>
              <Label className="text-xs">Reach (audience size)</Label>
              <Input type="number" value={draft.audienceSize} onChange={(e) => setDraft({ ...draft, audienceSize: Number(e.target.value) })} className="h-9 mt-1 font-mono" />
            </div>
            <div className="hidden md:block" />
            <NewsletterTargetingSection draft={draft} setDraft={setDraft} />

            <div className="col-span-2 pt-2 border-t border-border">
              <Label className="text-xs">CTA destination (optional)</Label>
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
                            </span>
                          </SelectItem>
                        ))}
                      </div>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label className="text-xs flex items-center gap-1"><Ticket className="h-3 w-3" /> Linked promo code (optional)</Label>
              <Select value={draft.linkedPromoCode} onValueChange={(v) => setDraft({ ...draft, linkedPromoCode: v })}>
                <SelectTrigger className="h-9 mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— none —</SelectItem>
                  {promoCodes.map((p) => <SelectItem key={p.id} value={p.code} className="font-mono">{p.code}</SelectItem>)}
                </SelectContent>
              </Select>
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

function Kpi({ label, value, sub, tone }: { label: string; value: string; sub: string; tone?: "primary" | "success" | "warning" }) {
  const t = tone === "primary" ? "text-primary" : tone === "success" ? "text-success" : tone === "warning" ? "text-warning" : "text-foreground";
  return (
    <Card className="shadow-card">
      <CardContent className="p-4">
        <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{label}</div>
        <div className={`text-2xl font-display font-bold ${t}`}>{value}</div>
        <div className="text-xs text-muted-foreground mt-1">{sub}</div>
      </CardContent>
    </Card>
  );
}

function EmailHeaderImageSection({ draft, setDraft }: { draft: Draft; setDraft: (d: Draft) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const onPick = (file: File) => {
    if (file.size > 4 * 1024 * 1024) { toast.error("Image must be under 4MB"); return; }
    if (!file.type.startsWith("image/")) { toast.error("Please upload an image file"); return; }
    const reader = new FileReader();
    reader.onload = () => setDraft({ ...draft, headerImageUrl: String(reader.result) });
    reader.readAsDataURL(file);
  };
  return (
    <>
      <div className="col-span-2 pt-2 border-t border-border">
        <Label className="text-xs uppercase tracking-wide text-muted-foreground flex items-center gap-1.5"><ImageIcon className="h-3 w-3" /> Email header image (optional)</Label>
      </div>
      <div className="col-span-2">
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onPick(f); }} />
        {draft.headerImageUrl ? (
          <div className="relative rounded-lg border border-border overflow-hidden bg-muted/30">
            <img src={draft.headerImageUrl} alt="Header" className="w-full h-32 object-cover" />
            <div className="absolute top-2 right-2 flex gap-1.5">
              <Button type="button" size="sm" variant="secondary" className="h-7 text-[11px] gap-1" onClick={() => fileRef.current?.click()}>
                <Upload className="h-3 w-3" /> Replace
              </Button>
              <Button type="button" size="sm" variant="destructive" className="h-7 w-7 p-0" onClick={() => setDraft({ ...draft, headerImageUrl: "" })}>
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ) : (
          <button type="button" onClick={() => fileRef.current?.click()} className="w-full rounded-lg border-2 border-dashed border-border hover:border-primary/50 hover:bg-muted/30 transition-colors flex flex-col items-center justify-center gap-2 py-6 text-muted-foreground">
            <Upload className="h-5 w-5" />
            <span className="text-xs">Click to upload (recommended 1200×400)</span>
          </button>
        )}
      </div>
    </>
  );
}

function EmailBodySection({ draft, setDraft }: { draft: Draft; setDraft: (d: Draft) => void }) {
  return (
    <>
      <div className="col-span-2 pt-2 border-t border-border">
        <Label className="text-xs uppercase tracking-wide text-muted-foreground">Email body</Label>
      </div>
      <div className="col-span-2">
        <Tabs value={draft.bodyFormat} onValueChange={(v) => setDraft({ ...draft, bodyFormat: v as EmailBodyFormat })}>
          <TabsList className="h-9">
            <TabsTrigger value="plain" className="text-xs gap-1.5"><Type className="h-3 w-3" /> Plain text</TabsTrigger>
            <TabsTrigger value="html" className="text-xs gap-1.5"><Code className="h-3 w-3" /> HTML</TabsTrigger>
          </TabsList>
          <TabsContent value="plain" className="mt-2">
            <Textarea
              value={draft.bodyText}
              onChange={(e) => setDraft({ ...draft, bodyText: e.target.value })}
              placeholder={"Hi {{name}},\n\nWe just dropped 5% off all bill payments this week...\n\nCheers,\nThe BazePay team"}
              className="min-h-[200px] font-mono text-xs"
            />
            <p className="text-[10px] text-muted-foreground mt-1">Use plain prose. Line breaks preserved. Supports merge tags like {"{{name}}"}.</p>
          </TabsContent>
          <TabsContent value="html" className="mt-2 space-y-2">
            <Textarea
              value={draft.bodyText}
              onChange={(e) => setDraft({ ...draft, bodyText: e.target.value })}
              placeholder={"<h1>Payday week 🎉</h1>\n<p>Use code <strong>PAYDAY5</strong> for 5% off bills.</p>\n<a href=\"{{ctaUrl}}\">Pay a bill</a>"}
              className="min-h-[200px] font-mono text-xs"
            />
            <details className="rounded-md border border-border bg-muted/20">
              <summary className="cursor-pointer text-xs px-3 py-2 select-none">Live HTML preview</summary>
              <div className="p-3 bg-white text-black border-t border-border max-h-64 overflow-auto" dangerouslySetInnerHTML={{ __html: draft.bodyText }} />
            </details>
            <p className="text-[10px] text-muted-foreground">Sanitize on send. Inline CSS recommended for client compatibility.</p>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}

function NewsletterTargetingSection({ draft, setDraft }: { draft: Draft; setDraft: (d: Draft) => void }) {
  const toggle = <T,>(arr: T[], v: T): T[] => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
  return (
    <>
      <div className="col-span-2 pt-2 border-t border-border">
        <Label className="text-xs uppercase tracking-wide text-muted-foreground flex items-center gap-1.5"><Target className="h-3 w-3" /> Targeting</Label>
      </div>
      <div className="col-span-2">
        <Label className="text-xs">User segments (any of)</Label>
        <div className="mt-1 grid grid-cols-2 gap-1.5 rounded-md border border-border p-2 max-h-44 overflow-y-auto">
          {ALL_SEGMENTS.map((s) => (
            <label key={s} className="flex items-center gap-2 text-xs cursor-pointer hover:bg-muted/50 rounded px-1.5 py-1">
              <Checkbox checked={draft.segments.includes(s)} onCheckedChange={() => {
                let next = toggle(draft.segments, s);
                if (s === "all_users" && next.includes("all_users")) next = ["all_users"];
                else if (s !== "all_users") next = next.filter((x) => x !== "all_users");
                if (next.length === 0) next = ["all_users"];
                setDraft({ ...draft, segments: next });
              }} />
              <span>{audienceSegmentLabel[s]}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="col-span-2">
        <Label className="text-xs flex items-center gap-1"><MapPin className="h-3 w-3" /> Locations (Nigeria states)</Label>
        <div className="mt-1 grid grid-cols-3 gap-1 rounded-md border border-border p-2 max-h-40 overflow-y-auto">
          {NG_STATES.map((st) => (
            <label key={st} className="flex items-center gap-1.5 text-[11px] cursor-pointer hover:bg-muted/50 rounded px-1 py-0.5">
              <Checkbox checked={draft.locations.includes(st)} onCheckedChange={() => {
                let next = toggle(draft.locations, st);
                if (st === "All Nigeria" && next.includes("All Nigeria")) next = ["All Nigeria"];
                else if (st !== "All Nigeria") next = next.filter((x) => x !== "All Nigeria");
                if (next.length === 0) next = ["All Nigeria"];
                setDraft({ ...draft, locations: next });
              }} />
              <span className="truncate">{st}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="col-span-2">
        <Label className="text-xs flex items-center gap-1"><Smartphone className="h-3 w-3" /> Device platforms</Label>
        <div className="mt-1 flex gap-2 flex-wrap">
          {ALL_DEVICES.map((d) => {
            const active = draft.devices.includes(d);
            return (
              <button key={d} type="button" onClick={() => setDraft({ ...draft, devices: toggle(draft.devices, d) })} className={`text-xs px-3 h-8 rounded-md border capitalize ${active ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-muted/50"}`}>
                {d}
              </button>
            );
          })}
          <span className="text-[10px] text-muted-foreground self-center">{draft.devices.length === 0 ? "All platforms" : `${draft.devices.length} selected`}</span>
        </div>
      </div>
      <div className="col-span-2">
        <Label className="text-xs">Language</Label>
        <Select value={draft.language} onValueChange={(v) => setDraft({ ...draft, language: v as Draft["language"] })}>
          <SelectTrigger className="h-9 mt-1 w-[200px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All languages</SelectItem>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="ha">Hausa</SelectItem>
            <SelectItem value="ig">Igbo</SelectItem>
            <SelectItem value="yo">Yoruba</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  );
}
