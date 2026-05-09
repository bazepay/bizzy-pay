import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Send, StickyNote, UserCheck, CheckCircle2, RotateCcw, Clock, AlertTriangle, Mail, Phone, MessageSquare } from "lucide-react";
import {
  tickets,
  buildTicketThread,
  ticketStatusTone,
  priorityTone,
  channelLabel,
  categoryLabel,
  fmtMins,
  fmtRelative,
  fmtTime,
  fmtNgn,
  type Ticket,
  type TicketStatus,
  type TicketPriority,
  type ThreadMessage,
} from "@/lib/support-data";
import { toast } from "sonner";

export const Route = createFileRoute("/_admin/support/tickets/$id")({
  loader: ({ params }) => {
    const t = tickets.find((x) => x.id === params.id);
    if (!t) throw notFound();
    return { ticket: t, thread: buildTicketThread(t) };
  },
  errorComponent: ({ error }) => (
    <div className="p-10 text-center text-sm text-muted-foreground">Failed to load ticket: {error.message}</div>
  ),
  notFoundComponent: () => (
    <div className="p-10 text-center text-sm text-muted-foreground">
      Ticket not found.{" "}
      <Link to="/support/tickets" className="text-primary underline">Back to queue</Link>
    </div>
  ),
  component: TicketDetailPage,
});

const AGENTS = ["You", "Chinedu O.", "Sade A.", "Bola I.", "Femi K.", "Ruth M.", "Daniel A."];

function TicketDetailPage() {
  const { ticket: initial, thread: initialThread } = Route.useLoaderData();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<Ticket>(initial);
  const [thread, setThread] = useState<ThreadMessage[]>(initialThread);
  const [reply, setReply] = useState("");
  const [note, setNote] = useState("");

  const ageMins = useMemo(() => Math.round((Date.now() - new Date(ticket.createdAt).getTime()) / 60_000), [ticket.createdAt]);
  const breaching = ticket.status !== "resolved" && ticket.status !== "closed" && ageMins > ticket.slaTargetMins;
  const slaPct = Math.min(100, (ageMins / ticket.slaTargetMins) * 100);

  const sendReply = () => {
    const body = reply.trim();
    if (!body) return toast.error("Reply cannot be empty");
    setThread((prev) => [...prev, {
      id: `m_new_${Date.now()}`,
      author: ticket.assigneeName ?? "You",
      authorRole: "agent",
      body,
      at: new Date().toISOString(),
    }]);
    setTicket((t) => ({
      ...t,
      status: t.status === "new" ? "open" : t.status,
      updatedAt: new Date().toISOString(),
      messages: t.messages + 1,
      firstResponseMins: t.firstResponseMins ?? Math.max(1, ageMins),
    }));
    setReply("");
    toast.success("Reply sent");
  };

  const addNote = () => {
    const body = note.trim();
    if (!body) return toast.error("Note cannot be empty");
    setThread((prev) => [...prev, {
      id: `m_note_${Date.now()}`,
      author: ticket.assigneeName ?? "You",
      authorRole: "agent",
      body,
      at: new Date().toISOString(),
      internal: true,
    }]);
    setNote("");
    toast.success("Internal note added");
  };

  const updateStatus = (s: TicketStatus) => {
    setTicket((t) => ({ ...t, status: s, updatedAt: new Date().toISOString(), resolutionMins: (s === "resolved" || s === "closed") ? (t.resolutionMins ?? ageMins) : t.resolutionMins }));
    setThread((prev) => [...prev, {
      id: `m_sys_${Date.now()}`,
      author: "System",
      authorRole: "system",
      body: `Status changed to ${s.replace("_", " ")} by ${ticket.assigneeName ?? "you"}.`,
      at: new Date().toISOString(),
    }]);
    toast.success(`Status set to ${s}`);
  };

  const updatePriority = (p: TicketPriority) => {
    setTicket((t) => ({ ...t, priority: p, updatedAt: new Date().toISOString() }));
    toast.success(`Priority set to ${p}`);
  };

  const updateAssignee = (a: string) => {
    setTicket((t) => ({ ...t, assigneeName: a, assigneeId: `agt_${a.replace(/\W/g, "").toLowerCase()}`, updatedAt: new Date().toISOString() }));
    toast.success(`Assigned to ${a}`);
  };

  const channelIcon = ticket.channel === "email" ? Mail : ticket.channel === "phone" ? Phone : MessageSquare;
  const ChannelIcon = channelIcon;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/support/tickets" })} className="gap-1.5">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to queue
        </Button>
        <span className="text-xs text-muted-foreground font-mono">{ticket.id}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <Card className="shadow-card">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h1 className="font-display text-xl font-bold">{ticket.subject}</h1>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <Badge variant="outline" className={`text-[10px] capitalize ${ticketStatusTone[ticket.status]}`}>{ticket.status.replace("_", " ")}</Badge>
                    <Badge variant="outline" className={`text-[10px] capitalize ${priorityTone[ticket.priority]}`}>{ticket.priority}</Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <ChannelIcon className="h-3 w-3" /> {channelLabel[ticket.channel]}
                    </span>
                    <span className="text-xs text-muted-foreground">· {categoryLabel[ticket.category]}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {(ticket.status === "resolved" || ticket.status === "closed") ? (
                    <Button size="sm" variant="outline" className="gap-1.5" onClick={() => updateStatus("open")}>
                      <RotateCcw className="h-3.5 w-3.5" /> Reopen
                    </Button>
                  ) : (
                    <Button size="sm" className="gap-1.5" onClick={() => updateStatus("resolved")}>
                      <CheckCircle2 className="h-3.5 w-3.5" /> Resolve
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-4 space-y-3 max-h-[500px] overflow-y-auto">
              {thread.map((m) => {
                if (m.authorRole === "system") {
                  return (
                    <div key={m.id} className="text-center text-[11px] text-muted-foreground italic py-1">
                      {m.body} · {fmtTime(m.at)}
                    </div>
                  );
                }
                const isAgent = m.authorRole === "agent";
                return (
                  <div key={m.id} className={`flex ${isAgent ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] rounded-lg px-3 py-2 ${
                      m.internal
                        ? "bg-warning/10 border border-warning/30"
                        : isAgent
                          ? "bg-primary/10 border border-primary/20"
                          : "bg-muted border border-border"
                    }`}>
                      <div className="flex items-center gap-2 text-[11px] mb-1">
                        <span className="font-semibold">{m.author}</span>
                        {m.internal && <Badge variant="outline" className="text-[9px] px-1 py-0 bg-warning/10 text-warning border-warning/30">Internal note</Badge>}
                        <span className="text-muted-foreground">{fmtTime(m.at)}</span>
                      </div>
                      <div className="text-sm whitespace-pre-wrap break-words">{m.body}</div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-4 space-y-3">
              <div>
                <Label className="text-xs flex items-center gap-1.5"><Send className="h-3 w-3" /> Reply to customer</Label>
                <Textarea value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Type your reply — sent over the original channel" className="min-h-[80px] mt-1.5" />
                <div className="flex justify-end mt-2">
                  <Button size="sm" onClick={sendReply} className="gap-1.5">
                    <Send className="h-3.5 w-3.5" /> Send reply
                  </Button>
                </div>
              </div>
              <div className="border-t border-border pt-3">
                <Label className="text-xs flex items-center gap-1.5"><StickyNote className="h-3 w-3" /> Internal note</Label>
                <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Notes are visible to agents only" className="min-h-[60px] mt-1.5 bg-warning/5" />
                <div className="flex justify-end mt-2">
                  <Button size="sm" variant="outline" onClick={addNote} className="gap-1.5">
                    <StickyNote className="h-3.5 w-3.5" /> Add note
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="shadow-card">
            <CardContent className="p-4 space-y-3">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Customer</div>
                <Link to="/users/$id" params={{ id: ticket.customerId }} className="text-sm font-semibold text-primary hover:underline">
                  {ticket.customerName}
                </Link>
                <div className="text-[11px] text-muted-foreground font-mono">{ticket.customerId}</div>
                <div className="text-[11px] text-muted-foreground truncate">{ticket.customerEmail}</div>
              </div>
              {ticket.amountInvolvedNgn > 0 && (
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Amount involved</div>
                  <div className="font-mono text-base font-semibold">{fmtNgn(ticket.amountInvolvedNgn)}</div>
                </div>
              )}
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link to="/users/$id" params={{ id: ticket.customerId }}>View customer profile</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-4 space-y-3">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Assignee</div>
                <Select value={ticket.assigneeName ?? undefined} onValueChange={updateAssignee}>
                  <SelectTrigger className="h-9"><SelectValue placeholder="Unassigned" /></SelectTrigger>
                  <SelectContent>
                    {AGENTS.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                  </SelectContent>
                </Select>
                {!ticket.assigneeName && (
                  <Button variant="ghost" size="sm" className="w-full mt-1.5 gap-1.5" onClick={() => updateAssignee("You")}>
                    <UserCheck className="h-3.5 w-3.5" /> Assign to me
                  </Button>
                )}
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Priority</div>
                <Select value={ticket.priority} onValueChange={(v) => updatePriority(v as TicketPriority)}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Status</div>
                <Select value={ticket.status} onValueChange={(v) => updateStatus(v as TicketStatus)}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="on_hold">On hold</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-4 space-y-2">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">SLA</div>
              <div className="flex items-center gap-2 text-sm">
                {breaching ? <AlertTriangle className="h-4 w-4 text-destructive" /> : <Clock className="h-4 w-4 text-muted-foreground" />}
                <span className={`font-mono ${breaching ? "text-destructive font-semibold" : ""}`}>{fmtMins(ageMins)} / {fmtMins(ticket.slaTargetMins)}</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${breaching ? "bg-destructive" : slaPct > 75 ? "bg-warning" : "bg-success"}`} style={{ width: `${slaPct}%` }} />
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-border mt-2">
                <div>
                  <div className="text-muted-foreground">Created</div>
                  <div className="font-mono">{fmtRelative(ticket.createdAt)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Updated</div>
                  <div className="font-mono">{fmtRelative(ticket.updatedAt)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">First reply</div>
                  <div className="font-mono">{fmtMins(ticket.firstResponseMins)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Resolution</div>
                  <div className="font-mono">{fmtMins(ticket.resolutionMins)}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
