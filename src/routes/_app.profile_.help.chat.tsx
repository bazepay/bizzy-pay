import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Send, Sparkles, Phone, Paperclip, X, FileText, Image as ImageIcon } from "lucide-react";

export const Route = createFileRoute("/_app/profile_/help/chat")({
  head: () => ({
    meta: [
      { title: "Support chat — BazePay" },
      { name: "description", content: "Chat with BazePay support." },
    ],
  }),
  component: SupportChat,
});

type Attachment = { name: string; size: number; type: string; url?: string };
type Msg = {
  id: string;
  from: "me" | "agent";
  text: string;
  at: string;
  attachments?: Attachment[];
};

const QUICK = [
  "I can't fund my wallet",
  "My card was declined",
  "Reverse a transaction",
  "Upgrade my account tier",
];

function botReply(input: string): string {
  const q = input.toLowerCase();
  if (q.includes("fund") || q.includes("deposit"))
    return "Got it. Funding usually clears within 30 seconds. Could you share the time of the transfer and the bank used?";
  if (q.includes("decline") || q.includes("card"))
    return "Sorry about that. Most declines are due to insufficient balance or a merchant block. Want me to check the last 5 attempts on your card?";
  if (q.includes("revers") || q.includes("refund"))
    return "I can raise a reversal. Please send the transaction reference (BZP-…) and I'll trace it with our partner bank.";
  if (q.includes("tier") || q.includes("upgrade") || q.includes("limit"))
    return "Upgrading to Tier 3 takes about 2 minutes. Open Profile → Verification → Upgrade and have your utility bill ready.";
  if (q.includes("airtime") || q.includes("data") || q.includes("bill"))
    return "Bill purchases are instant. If it didn't deliver in 2 minutes you'll see an automatic reversal in your wallet.";
  if (q.includes("pin") || q.includes("password"))
    return "You can reset your PIN from Profile → Security → Reset PIN. We'll verify via your phone number.";
  if (q.length < 6)
    return "Could you tell me a bit more about what's happening so I can help?";
  return "Thanks — a specialist is jumping in. In the meantime, can you share the date, amount, and reference of the transaction?";
}

const now = () =>
  new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

function SupportChat() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Msg[]>([
    {
      id: "m0",
      from: "agent",
      text: "Hi, I'm Ada from BazePay support. How can I help today?",
      at: now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState<Attachment[]>([]);
  const [typing, setTyping] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  useEffect(() => {
    return () => {
      pending.forEach((a) => a.url && URL.revokeObjectURL(a.url));
    };
  }, [pending]);

  const onFiles = (files: FileList | null) => {
    if (!files?.length) return;
    const next: Attachment[] = [];
    for (const f of Array.from(files).slice(0, 5)) {
      if (f.size > 10 * 1024 * 1024) continue;
      next.push({
        name: f.name,
        size: f.size,
        type: f.type,
        url: f.type.startsWith("image/") ? URL.createObjectURL(f) : undefined,
      });
    }
    setPending((p) => [...p, ...next].slice(0, 5));
    if (fileInput.current) fileInput.current.value = "";
  };

  const send = (text: string) => {
    const t = text.trim();
    if (!t && pending.length === 0) return;
    const atts = pending;
    const mine: Msg = {
      id: `m-${Date.now()}`,
      from: "me",
      text: t,
      at: now(),
      attachments: atts.length ? atts : undefined,
    };
    setMessages((m) => [...m, mine]);
    setInput("");
    setPending([]);
    setTyping(true);
    setTimeout(() => {
      const reply: Msg = {
        id: `m-${Date.now() + 1}`,
        from: "agent",
        text: atts.length
          ? `Got it — I can see ${atts.length === 1 ? "the file" : `all ${atts.length} files`} you sent. Let me take a look and get back to you shortly.`
          : botReply(t),
        at: now(),
      };
      setMessages((m) => [...m, reply]);
      setTyping(false);
    }, 900 + Math.random() * 700);
  };

  return (
    <div className="min-h-full h-full flex flex-col bg-card text-card-foreground">
      <header className="px-5 pt-12 pb-3 flex items-center gap-3 border-b border-card-foreground/[0.06]">
        <button
          onClick={() => navigate({ to: "/profile/help" })}
          className="w-10 h-10 rounded-full bg-card-foreground/[0.06] flex items-center justify-center"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="font-display font-bold text-base leading-tight">Ada · BazePay</p>
          <p className="text-[11px] text-card-foreground/55 inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-success" /> Online · usually replies in 1 min
          </p>
        </div>
        <button
          className="w-10 h-10 rounded-full bg-card-foreground/[0.06] flex items-center justify-center"
          aria-label="Call support"
        >
          <Phone className="w-4 h-4" />
        </button>
      </header>

      <div ref={scroller} className="flex-1 overflow-y-auto no-scrollbar px-5 py-4 space-y-3">
        {messages.map((m) => {
          const mine = m.from === "me";
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div className="max-w-[78%] space-y-1.5">
                {m.attachments?.map((a, i) => (
                  <AttachmentBubble key={i} att={a} mine={mine} />
                ))}
                {m.text && (
                  <div
                    className={`px-3.5 py-2.5 rounded-2xl text-sm leading-snug ${
                      mine
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-card-foreground/[0.06] rounded-bl-md"
                    }`}
                  >
                    {m.text}
                  </div>
                )}
                <p className={`text-[10px] text-card-foreground/45 ${mine ? "text-right" : "text-left"}`}>
                  {m.at}
                </p>
              </div>
            </div>
          );
        })}
        {typing && (
          <div className="flex justify-start">
            <div className="px-3.5 py-3 rounded-2xl rounded-bl-md bg-card-foreground/[0.06] flex items-center gap-1">
              <Dot delay={0} />
              <Dot delay={150} />
              <Dot delay={300} />
            </div>
          </div>
        )}

        {messages.length === 1 && (
          <div className="pt-2">
            <p className="text-[10px] uppercase tracking-widest text-card-foreground/45 font-bold mb-2 inline-flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" /> Quick topics
            </p>
            <div className="flex flex-wrap gap-2">
              {QUICK.map((q) => (
                <button
                  key={q}
                  onClick={() => send(q)}
                  className="px-3 py-1.5 rounded-full bg-card-foreground/[0.05] text-xs font-semibold active:scale-95 transition"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-card-foreground/[0.06]">
        {pending.length > 0 && (
          <div className="px-5 pt-3 flex gap-2 overflow-x-auto no-scrollbar">
            {pending.map((a, i) => (
              <div
                key={i}
                className="relative shrink-0 rounded-xl bg-card-foreground/[0.06] p-1.5 pr-2 flex items-center gap-2 max-w-[180px]"
              >
                {a.url ? (
                  <img src={a.url} alt={a.name} className="w-10 h-10 rounded-lg object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-card-foreground/[0.08] flex items-center justify-center">
                    <FileText className="w-4 h-4 text-card-foreground/60" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold truncate">{a.name}</p>
                  <p className="text-[10px] text-card-foreground/50">{formatSize(a.size)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setPending((p) => p.filter((_, j) => j !== i))}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-card-foreground text-card flex items-center justify-center"
                  aria-label="Remove"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="px-5 pt-3 pb-6 flex items-center gap-2"
        >
          <input
            ref={fileInput}
            type="file"
            multiple
            accept="image/*,application/pdf,.doc,.docx,.txt,.csv"
            className="hidden"
            onChange={(e) => onFiles(e.target.files)}
          />
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            className="w-11 h-12 rounded-full bg-card-foreground/[0.06] flex items-center justify-center active:scale-95 transition shrink-0"
            aria-label="Attach file"
          >
            <Paperclip className="w-4 h-4" />
          </button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message…"
            className="flex-1 h-12 rounded-full bg-card-foreground/[0.06] px-4 text-sm outline-none focus:ring-2 ring-primary/40"
          />
          <button
            type="submit"
            disabled={!input.trim() && pending.length === 0}
            className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-40 active:scale-95 transition"
            aria-label="Send"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function AttachmentBubble({ att, mine }: { att: Attachment; mine: boolean }) {
  if (att.url) {
    return (
      <a
        href={att.url}
        target="_blank"
        rel="noreferrer"
        className="block rounded-2xl overflow-hidden border border-card-foreground/[0.08]"
      >
        <img src={att.url} alt={att.name} className="max-h-56 w-full object-cover" />
      </a>
    );
  }
  return (
    <div
      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-2xl ${
        mine ? "bg-primary text-primary-foreground" : "bg-card-foreground/[0.06]"
      }`}
    >
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
          mine ? "bg-primary-foreground/20" : "bg-card-foreground/[0.08]"
        }`}
      >
        {att.type.startsWith("image/") ? <ImageIcon className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
      </div>
      <div className="min-w-0">
        <p className="text-[12px] font-semibold truncate max-w-[180px]">{att.name}</p>
        <p className={`text-[10px] ${mine ? "text-primary-foreground/70" : "text-card-foreground/50"}`}>
          {formatSize(att.size)}
        </p>
      </div>
    </div>
  );
}

function Dot({ delay }: { delay: number }) {
  return (
    <span
      className="w-1.5 h-1.5 rounded-full bg-card-foreground/50 animate-bounce"
      style={{ animationDelay: `${delay}ms`, animationDuration: "1s" }}
    />
  );
}
