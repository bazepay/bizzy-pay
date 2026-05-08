import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ChevronRight, Hash, Plus, Inbox, AlertTriangle } from "lucide-react";
import { virtualNumbers, vnMessages, type VnStatus } from "@/lib/virtual-numbers";

export const Route = createFileRoute("/_app/numbers/")({
  head: () => ({
    meta: [
      { title: "My Numbers · BazePay" },
      { name: "description", content: "Manage your virtual phone numbers and SMS inbox." },
    ],
  }),
  component: NumbersList,
});

const statusStyles: Record<VnStatus, { label: string; className: string }> = {
  active: { label: "Active", className: "bg-success/15 text-success" },
  expiring: { label: "Expiring soon", className: "bg-amber-500/15 text-amber-600" },
  expired: { label: "Expired", className: "bg-destructive/15 text-destructive" },
};

function NumbersList() {
  const navigate = useNavigate();
  const numbers = virtualNumbers;
  const unreadByNumber = vnMessages.reduce<Record<string, number>>((acc, m) => {
    if (m.unread) acc[m.numberId] = (acc[m.numberId] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="min-h-full bg-background text-foreground flex flex-col">
      <div className="h-10" />
      <div className="px-6 pt-2 flex items-center justify-between">
        <button
          onClick={() => navigate({ to: "/pay" })}
          className="w-10 h-10 rounded-full bg-card text-card-foreground flex items-center justify-center"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <Link
          to="/pay/esim"
          className="h-9 px-3.5 rounded-full bg-card text-card-foreground text-[12px] font-bold flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" /> Get number
        </Link>
      </div>

      <div className="px-6 pt-5">
        <h1 className="font-display text-3xl font-bold tracking-tight">My Numbers</h1>
        <p className="text-xs text-foreground/55 mt-1.5">
          Receive SMS codes for {numbers.length} virtual {numbers.length === 1 ? "number" : "numbers"}.
        </p>
      </div>

      <div className="flex-1 mt-6 bg-card text-card-foreground rounded-t-[2rem] px-6 pt-6 pb-28">
        {numbers.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-3">
            {numbers.map((n) => {
              const s = statusStyles[n.status];
              const unread = unreadByNumber[n.id] ?? 0;
              const pct = Math.max(2, Math.round((n.daysLeft / n.totalDays) * 100));
              return (
                <Link
                  key={n.id}
                  to="/numbers/$id"
                  params={{ id: n.id }}
                  className="block rounded-2xl bg-card-foreground/[0.04] p-4 active:scale-[0.99] transition"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-service-esim/15 text-service-esim flex items-center justify-center text-xl">
                      {n.countryFlag}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-display font-bold text-base tracking-tight tabular-nums truncate">
                          {n.msisdn}
                        </p>
                        {unread > 0 && (
                          <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                            {unread}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-card-foreground/55 mt-0.5">
                        {n.countryName} · {n.plan} plan
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-card-foreground/40 mt-3" />
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${s.className}`}>
                      {s.label}
                    </span>
                    <span className="text-[11px] text-card-foreground/55">
                      {n.status === "expired"
                        ? "Released"
                        : n.daysLeft === 1
                          ? "1 day left"
                          : `${n.daysLeft} days left`}
                    </span>
                  </div>

                  {n.status !== "expired" && (
                    <div className="mt-2 h-1 rounded-full bg-card-foreground/[0.06] overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${pct}%`,
                          background:
                            n.status === "expiring"
                              ? "var(--service-electricity, #F59E0B)"
                              : "var(--service-esim, currentColor)",
                        }}
                      />
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        )}

        <div className="mt-6 rounded-2xl bg-card-foreground/[0.04] p-4 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="text-[12px] text-card-foreground/70 leading-relaxed">
            Numbers are released when the subscription ends. Turn on auto-renew to keep the same number.
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center text-center py-10">
      <div className="w-16 h-16 rounded-2xl bg-service-esim/15 text-service-esim flex items-center justify-center">
        <Inbox className="w-7 h-7" />
      </div>
      <h3 className="font-display font-bold text-lg mt-4">No numbers yet</h3>
      <p className="text-[12px] text-card-foreground/55 mt-1 max-w-[260px]">
        Get a real local phone number to receive SMS codes from WhatsApp, Google, banks and more.
      </p>
      <Link
        to="/pay/esim"
        className="mt-5 h-11 px-5 rounded-full bg-primary text-primary-foreground font-bold text-sm inline-flex items-center gap-1.5"
      >
        <Hash className="w-4 h-4" /> Get a number
      </Link>
    </div>
  );
}
