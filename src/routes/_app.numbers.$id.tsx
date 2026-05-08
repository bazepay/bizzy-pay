import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  Copy,
  RefreshCw,
  Settings2,
  X,
  Inbox,
  Trash2,
} from "lucide-react";
import { virtualNumbers, vnMessages, relativeTime } from "@/lib/virtual-numbers";

export const Route = createFileRoute("/_app/numbers/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Inbox · ${params.id} · BazePay` },
      { name: "description", content: "Receive SMS verification codes on your virtual number." },
    ],
  }),
  loader: ({ params }) => {
    const number = virtualNumbers.find((n) => n.id === params.id);
    if (!number) throw notFound();
    return { number };
  },
  notFoundComponent: () => (
    <div className="min-h-full flex flex-col items-center justify-center p-6 text-center">
      <p className="text-sm text-foreground/60">Number not found.</p>
      <Link to="/numbers" className="mt-4 text-sm font-bold text-primary">
        Back to My Numbers
      </Link>
    </div>
  ),
  component: NumberDetail,
});

function NumberDetail() {
  const { number } = Route.useLoaderData();
  const navigate = useNavigate();
  const messages = useMemo(
    () =>
      vnMessages
        .filter((m) => m.numberId === number.id)
        .sort((a, b) => +new Date(b.receivedAt) - +new Date(a.receivedAt)),
    [number.id],
  );
  const [copied, setCopied] = useState<string | null>(null);
  const [showManage, setShowManage] = useState(false);
  const [autoRenew, setAutoRenew] = useState(number.autoRenew);

  const copy = (text: string, key: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(key);
        setTimeout(() => setCopied(null), 1400);
      });
    }
  };

  return (
    <div className="min-h-full bg-background text-foreground flex flex-col">
      <div className="h-10" />
      <div className="px-6 pt-2 flex items-center justify-between">
        <button
          onClick={() => navigate({ to: "/numbers" })}
          className="w-10 h-10 rounded-full bg-card text-card-foreground flex items-center justify-center"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <button
          onClick={() => setShowManage(true)}
          className="w-10 h-10 rounded-full bg-card text-card-foreground flex items-center justify-center"
          aria-label="Manage"
        >
          <Settings2 className="w-5 h-5" />
        </button>
      </div>

      {/* Number card */}
      <div className="px-6 pt-5">
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-foreground/55">
          <span className="text-base">{number.countryFlag}</span>
          {number.countryName} · {number.plan}
        </div>
        <button
          onClick={() => copy(number.msisdn, "msisdn")}
          className="mt-2 flex items-center gap-2 text-left active:opacity-70"
        >
          <h1 className="font-display text-3xl font-bold tracking-tight tabular-nums">
            {number.msisdn}
          </h1>
          <span className="ml-1 inline-flex items-center gap-1 text-[11px] font-bold text-primary">
            {copied === "msisdn" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied === "msisdn" ? "Copied" : "Copy"}
          </span>
        </button>
        <div className="mt-2 flex items-center gap-2 text-[11px] text-foreground/55">
          <span className="inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" /> Receiving
          </span>
          <span>·</span>
          <span>{number.daysLeft} days left</span>
          <span>·</span>
          <span>Auto-renew {autoRenew ? "on" : "off"}</span>
        </div>
      </div>

      {/* Inbox */}
      <div className="flex-1 mt-6 bg-card text-card-foreground rounded-t-[2rem] px-6 pt-6 pb-28">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-base">Inbox</h2>
          <span className="text-[11px] text-card-foreground/55">{messages.length} messages</span>
        </div>

        {messages.length === 0 ? (
          <div className="mt-6 flex flex-col items-center text-center py-8">
            <div className="w-14 h-14 rounded-2xl bg-card-foreground/[0.05] flex items-center justify-center">
              <Inbox className="w-6 h-6 text-card-foreground/40" />
            </div>
            <p className="text-[12px] text-card-foreground/55 mt-3 max-w-[240px]">
              No messages yet. Use this number on any service — codes appear here in real time.
            </p>
          </div>
        ) : (
          <div className="mt-3 space-y-2">
            {messages.map((m) => (
              <div
                key={m.id}
                className="rounded-2xl bg-card-foreground/[0.04] p-4 relative"
              >
                {m.unread && (
                  <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-primary" />
                )}
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-sm">{m.sender}</p>
                  <p className="text-[11px] text-card-foreground/50">{relativeTime(m.receivedAt)}</p>
                </div>
                {m.otp && (
                  <button
                    onClick={() => copy(m.otp!, m.id)}
                    className="mt-3 w-full rounded-xl bg-card-foreground/[0.05] px-3 py-2.5 flex items-center justify-between active:scale-[0.99] transition"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-card-foreground/55">
                        Code
                      </span>
                      <span className="font-display font-bold text-lg tabular-nums tracking-tight">
                        {m.otp}
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-primary inline-flex items-center gap-1">
                      {copied === m.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied === m.id ? "Copied" : "Copy"}
                    </span>
                  </button>
                )}
                <p className="text-[12px] text-card-foreground/65 mt-2.5 leading-relaxed">
                  {m.body}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {showManage && (
        <ManageSheet
          number={number}
          autoRenew={autoRenew}
          onToggle={() => setAutoRenew((v: boolean) => !v)}
          onClose={() => setShowManage(false)}
        />
      )}
    </div>
  );
}

function ManageSheet({
  number,
  autoRenew,
  onToggle,
  onClose,
}: {
  number: ReturnType<typeof Route.useLoaderData>["number"];
  autoRenew: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[80] flex items-end">
      <button
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        aria-label="Close"
      />
      <div className="relative w-full bg-card text-card-foreground rounded-t-[2rem] pt-3 pb-8 animate-in slide-in-from-bottom duration-300">
        <div className="w-10 h-1 rounded-full bg-card-foreground/15 mx-auto" />
        <div className="px-6 mt-4 flex items-center justify-between">
          <h3 className="font-display font-bold text-lg">Manage subscription</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-card-foreground/[0.06] flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mx-6 mt-4 rounded-2xl bg-card-foreground/[0.04] p-4">
          <p className="text-[11px] text-card-foreground/55">Number</p>
          <p className="font-display font-bold tabular-nums text-base mt-0.5">{number.msisdn}</p>
          <p className="text-[11px] text-card-foreground/55 mt-1">
            {number.plan} plan · ${number.nextChargeUsd.toFixed(2)} / renewal
          </p>
        </div>

        <button
          onClick={onToggle}
          className="mx-6 mt-3 rounded-2xl bg-card-foreground/[0.04] p-4 w-[calc(100%-3rem)] flex items-center justify-between active:scale-[0.99] transition"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-service-esim/15 text-service-esim flex items-center justify-center">
              <RefreshCw className="w-4 h-4" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-sm">Auto-renew</p>
              <p className="text-[11px] text-card-foreground/55">Keep this number long-term</p>
            </div>
          </div>
          <div
            className={`w-11 h-6 rounded-full transition relative ${autoRenew ? "bg-primary" : "bg-card-foreground/[0.12]"}`}
          >
            <div
              className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${autoRenew ? "left-[22px]" : "left-0.5"}`}
            />
          </div>
        </button>

        <div className="px-6 mt-4 space-y-2">
          <button className="w-full h-12 rounded-full bg-card-foreground/[0.06] font-bold text-sm">
            Switch plan
          </button>
          <button className="w-full h-12 rounded-full bg-destructive/10 text-destructive font-bold text-sm flex items-center justify-center gap-2">
            <Trash2 className="w-4 h-4" />
            Cancel & release number
          </button>
        </div>
      </div>
    </div>
  );
}
