import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, ShieldAlert, CheckCircle2, AlertTriangle, FileText, User, Clock } from "lucide-react";
import { toast } from "sonner";
import {
  amlAlerts,
  alertStatusLabel,
  alertStatusTone,
  alertTypeLabel,
  severityTone,
  fmtNgn,
  fmtRelative,
  type AlertStatus,
  type AmlAlert,
} from "@/lib/compliance-data";

type Note = AmlAlert["notes"][number];

export const Route = createFileRoute("/_admin/compliance/alerts/$id")({
  loader: ({ params }) => {
    const alert = amlAlerts.find((a) => a.id === params.id);
    if (!alert) throw notFound();
    return { alert };
  },
  notFoundComponent: () => (
    <div className="p-10 text-center">
      <h1 className="text-xl font-bold">Alert not found</h1>
      <p className="text-sm text-muted-foreground mt-1">The alert you’re looking for doesn’t exist.</p>
      <Button asChild className="mt-4"><Link to="/compliance/alerts">Back to alerts</Link></Button>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="p-10 text-center text-sm text-destructive">{error.message}</div>
  ),
  component: AlertDetailPage,
});

function AlertDetailPage() {
  const { alert: initial } = Route.useLoaderData() as { alert: AmlAlert };
  const navigate = useNavigate();
  const [status, setStatus] = useState<AlertStatus>(initial.status);
  const [note, setNote] = useState("");
  const [notes, setNotes] = useState<Note[]>(initial.notes);

  const ageMins = useMemo(() => Math.round((Date.now() - new Date(initial.createdAt).getTime()) / 60_000), []);

  const setAlertStatus = (next: AlertStatus, label: string) => {
    setStatus(next);
    setNotes((prev) => [
      ...prev,
      { author: "You", at: new Date().toISOString(), text: `Status changed → ${alertStatusLabel[next]} (${label}).` },
    ]);
    toast.success(`Alert ${label.toLowerCase()}`);
  };

  const addNote = () => {
    const text = note.trim();
    if (!text) return;
    setNotes((prev) => [...prev, { author: "You", at: new Date().toISOString(), text }]);
    setNote("");
    toast.success("Note added");
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/compliance/alerts" })} className="gap-1">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="font-display text-xl font-bold truncate">{initial.ruleName}</h2>
            <Badge variant="outline" className={`text-[10px] capitalize ${severityTone[initial.severity]}`}>{initial.severity}</Badge>
            <Badge variant="outline" className={`text-[10px] ${alertStatusTone[status]}`}>{alertStatusLabel[status]}</Badge>
          </div>
          <div className="text-xs text-muted-foreground mt-0.5 font-mono">{initial.id} · rule {initial.ruleId}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <Card className="shadow-card">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-medium">{alertTypeLabel[initial.type]}</div>
                  <p className="text-sm text-muted-foreground mt-0.5">{initial.description}</p>
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                <Field label="Amount" value={fmtNgn(initial.amountNgn)} mono />
                <Field label="Transactions" value={initial.txnCount.toString()} mono />
                <Field label="Window" value={`${initial.windowHours}h`} />
                <Field label="Age" value={fmtRelative(initial.createdAt)} />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-4">
              <h3 className="text-sm font-display font-bold mb-3 flex items-center gap-2"><FileText className="h-4 w-4" /> Investigation notes</h3>
              <div className="space-y-3 mb-3">
                {notes.length === 0 && <p className="text-xs text-muted-foreground">No notes yet. Add the first one below.</p>}
                {notes.map((n, i) => (
                  <div key={i} className="rounded-md border border-border bg-muted/30 p-2.5">
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
                      <span className="font-medium text-foreground">{n.author}</span>
                      <span>{fmtRelative(n.at)}</span>
                    </div>
                    <p className="text-sm">{n.text}</p>
                  </div>
                ))}
              </div>
              <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add an investigation note…" className="min-h-[80px]" />
              <div className="flex justify-end mt-2">
                <Button size="sm" onClick={addNote} disabled={!note.trim()}>Add note</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="shadow-card">
            <CardContent className="p-4 space-y-2.5">
              <h3 className="text-sm font-display font-bold mb-1 flex items-center gap-2"><User className="h-4 w-4" /> Customer</h3>
              <div>
                <div className="text-sm font-medium">{initial.userName}</div>
                <div className="font-mono text-[11px] text-muted-foreground">{initial.userId}</div>
              </div>
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link to="/users/$id" params={{ id: initial.userId }}>Open user profile</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-4 space-y-2.5">
              <h3 className="text-sm font-display font-bold mb-1 flex items-center gap-2"><Clock className="h-4 w-4" /> Timeline</h3>
              <Field label="Created" value={fmtRelative(initial.createdAt)} />
              <Field label="Updated" value={fmtRelative(initial.updatedAt)} />
              <Field label="Age (minutes)" value={ageMins.toLocaleString()} mono />
              <Field label="Assignee" value={initial.assignee ?? "Unassigned"} />
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-4 space-y-2">
              <h3 className="text-sm font-display font-bold mb-1">Actions</h3>
              <Button size="sm" variant="outline" className="w-full justify-start gap-2" onClick={() => setAlertStatus("investigating", "marked under investigation")}>
                <AlertTriangle className="h-4 w-4 text-warning" /> Mark investigating
              </Button>
              <Button size="sm" variant="outline" className="w-full justify-start gap-2" onClick={() => setAlertStatus("escalated", "escalated to senior reviewer")}>
                <ShieldAlert className="h-4 w-4 text-orange-500" /> Escalate
              </Button>
              <Button size="sm" variant="outline" className="w-full justify-start gap-2" onClick={() => setAlertStatus("cleared", "cleared as benign")}>
                <CheckCircle2 className="h-4 w-4 text-success" /> Clear alert
              </Button>
              <Button size="sm" variant="destructive" className="w-full justify-start gap-2" onClick={() => setAlertStatus("sar_filed", "SAR filed with NFIU")}>
                <FileText className="h-4 w-4" /> File SAR
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className={mono ? "font-mono" : "font-medium"}>{value}</span>
    </div>
  );
}
