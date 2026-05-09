import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, CheckCircle2, PlayCircle, User } from "lucide-react";
import {
  chatSessions,
  buildChatThread,
  categoryLabel,
  fmtRelative,
  fmtTime,
  type ChatSession,
  type ThreadMessage,
} from "@/lib/support-data";
import { toast } from "sonner";

export const Route = createFileRoute("/_admin/support/chat/$id")({
  loader: ({ params }) => {
    const c = chatSessions.find((x) => x.id === params.id);
    if (!c) throw notFound();
    return { chat: c, thread: buildChatThread(c) };
  },
  errorComponent: ({ error }) => (
    <div className="p-10 text-center text-sm text-muted-foreground">Failed to load chat: {error.message}</div>
  ),
  notFoundComponent: () => (
    <div className="p-10 text-center text-sm text-muted-foreground">
      Chat session not found.{" "}
      <Link to="/support/chat" className="text-primary underline">Back to queue</Link>
    </div>
  ),
  component: ChatDetailPage,
});

const statusTone: Record<ChatSession["status"], string> = {
  waiting: "bg-warning/10 text-warning border-warning/30",
  active: "bg-success/10 text-success border-success/30",
  resolved: "bg-muted text-muted-foreground border-border",
  abandoned: "bg-destructive/10 text-destructive border-destructive/30",
};

const fmtSecs = (s: number) => (s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${s % 60}s`);

function ChatDetailPage() {
  const { chat: initial, thread: initialThread } = Route.useLoaderData();
  const navigate = useNavigate();
  const [chat, setChat] = useState<ChatSession>(initial);
  const [thread, setThread] = useState<ThreadMessage[]>(initialThread);
  const [reply, setReply] = useState("");
  const [waitNow, setWaitNow] = useState(initial.waitSeconds);

  useEffect(() => {
    if (chat.status !== "waiting") return;
    const i = setInterval(() => setWaitNow((w) => w + 1), 1000);
    return () => clearInterval(i);
  }, [chat.status]);

  const accept = () => {
    setChat((c) => ({ ...c, status: "active", agentName: "You", lastMessageAt: new Date().toISOString() }));
    setThread((prev) => [...prev, {
      id: `cm_sys_${Date.now()}`,
      author: "System",
      authorRole: "system",
      body: "You joined the chat.",
      at: new Date().toISOString(),
    }]);
    toast.success(`Joined chat ${chat.id}`);
  };

  const resolve = () => {
    setChat((c) => ({ ...c, status: "resolved", lastMessageAt: new Date().toISOString() }));
    setThread((prev) => [...prev, {
      id: `cm_sys_${Date.now()}`,
      author: "System",
      authorRole: "system",
      body: `Chat resolved by ${chat.agentName ?? "you"}.`,
      at: new Date().toISOString(),
    }]);
    toast.success(`Chat ${chat.id} resolved`);
  };

  const sendReply = () => {
    const body = reply.trim();
    if (!body) return;
    if (chat.status !== "active") return toast.error("Accept the chat first");
    setThread((prev) => [...prev, {
      id: `cm_new_${Date.now()}`,
      author: chat.agentName ?? "You",
      authorRole: "agent",
      body,
      at: new Date().toISOString(),
    }]);
    setChat((c) => ({ ...c, messages: c.messages + 1, lastMessageAt: new Date().toISOString() }));
    setReply("");
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/support/chat" })} className="gap-1.5">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to queue
        </Button>
        <span className="text-xs text-muted-foreground font-mono">{chat.id}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <Card className="shadow-card">
            <CardContent className="p-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="font-display text-lg font-bold truncate">{chat.customerName}</h1>
                  <Badge variant="outline" className={`text-[10px] capitalize ${statusTone[chat.status]}`}>{chat.status}</Badge>
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {categoryLabel[chat.topic]} · started {fmtRelative(chat.startedAt)}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {chat.status === "waiting" && (
                  <Button size="sm" className="gap-1.5" onClick={accept}>
                    <PlayCircle className="h-3.5 w-3.5" /> Accept chat
                  </Button>
                )}
                {chat.status === "active" && (
                  <Button size="sm" variant="outline" className="gap-1.5 text-success" onClick={resolve}>
                    <CheckCircle2 className="h-3.5 w-3.5" /> Resolve
                  </Button>
                )}
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
                    <div className={`max-w-[80%] rounded-lg px-3 py-2 ${isAgent ? "bg-primary/10 border border-primary/20" : "bg-muted border border-border"}`}>
                      <div className="flex items-center gap-2 text-[11px] mb-1">
                        <span className="font-semibold">{m.author}</span>
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
            <CardContent className="p-3">
              <form
                onSubmit={(e) => { e.preventDefault(); sendReply(); }}
                className="flex items-center gap-2"
              >
                <Input
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder={chat.status === "active" ? "Type a reply..." : chat.status === "waiting" ? "Accept the chat to reply" : "Chat is closed"}
                  disabled={chat.status !== "active"}
                  className="h-10"
                />
                <Button type="submit" size="sm" className="h-10 gap-1.5" disabled={chat.status !== "active" || !reply.trim()}>
                  <Send className="h-3.5 w-3.5" /> Send
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="shadow-card">
            <CardContent className="p-4 space-y-3">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Customer</div>
                <Link to="/users/$id" params={{ id: chat.customerId }} className="text-sm font-semibold text-primary hover:underline">
                  {chat.customerName}
                </Link>
                <div className="text-[11px] text-muted-foreground font-mono">{chat.customerId}</div>
              </div>
              <Button asChild variant="outline" size="sm" className="w-full gap-1.5">
                <Link to="/users/$id" params={{ id: chat.customerId }}>
                  <User className="h-3.5 w-3.5" /> View customer profile
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-4 space-y-2">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Agent</div>
                <div className="text-sm">{chat.agentName ?? <span className="italic text-muted-foreground">Unassigned</span>}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Topic</div>
                <div className="text-sm">{categoryLabel[chat.topic]}</div>
              </div>
              {chat.status === "waiting" && (
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Wait time</div>
                  <div className={`font-mono text-sm ${waitNow > 300 ? "text-destructive font-semibold" : ""}`}>{fmtSecs(waitNow)}</div>
                </div>
              )}
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Messages</div>
                <div className="text-sm">{chat.messages}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Last activity</div>
                <div className="text-sm">{fmtRelative(chat.lastMessageAt)}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
