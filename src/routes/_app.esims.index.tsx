import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ChevronRight, Plus, Smartphone, AlertTriangle, Wifi } from "lucide-react";
import { esims, esimStatusMeta, dataPct } from "@/lib/esims";

export const Route = createFileRoute("/_app/esims/")({
  head: () => ({
    meta: [
      { title: "My eSIMs · BazePay" },
      { name: "description", content: "Manage your travel and local eSIMs, top up data, and re-install QR codes." },
    ],
  }),
  component: EsimsList,
});

function EsimsList() {
  const navigate = useNavigate();
  const items = esims;

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
          <Plus className="w-3.5 h-3.5" /> Buy eSIM
        </Link>
      </div>

      <div className="px-6 pt-5">
        <h1 className="font-display text-3xl font-bold tracking-tight">My eSIMs</h1>
        <p className="text-xs text-foreground/55 mt-1.5">
          {items.length} {items.length === 1 ? "eSIM" : "eSIMs"} on this account.
        </p>
      </div>

      <div className="flex-1 mt-6 bg-card text-card-foreground rounded-t-[2rem] px-6 pt-6 pb-28">
        {items.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-3">
            {items.map((e) => {
              const s = esimStatusMeta(e.status);
              const pct = dataPct(e);
              const unlimited = e.dataTotalGb < 0;
              const remaining = unlimited
                ? "Unlimited"
                : `${(e.dataTotalGb - e.dataUsedGb).toFixed(1)} GB left`;
              return (
                <Link
                  key={e.id}
                  to="/esims/$id"
                  params={{ id: e.id }}
                  className="block rounded-2xl bg-card-foreground/[0.04] p-4 active:scale-[0.99] transition"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-service-esim/15 text-service-esim flex items-center justify-center text-xl">
                      {e.flag}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-display font-bold text-base tracking-tight truncate">
                          {e.label}
                        </p>
                        {e.has5g && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-primary/15 text-primary">
                            5G
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-card-foreground/55 mt-0.5 truncate">
                        {e.planName} · {e.region}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-card-foreground/40 mt-3" />
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${s.className}`}>
                      {s.label}
                    </span>
                    <span className="text-[11px] text-card-foreground/55 tabular-nums">
                      {e.status === "expired" ? "Renew to reuse" : `${remaining} · ${e.daysLeft}d left`}
                    </span>
                  </div>

                  {e.status !== "expired" && !unlimited && (
                    <div className="mt-2 h-1 rounded-full bg-card-foreground/[0.06] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-service-esim"
                        style={{ width: `${pct}%` }}
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
            Lost your QR? Tap any eSIM to re-download the install code. Compatibility: iPhone XS+ or any unlocked Android with eSIM.
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
        <Smartphone className="w-7 h-7" />
      </div>
      <h3 className="font-display font-bold text-lg mt-4">No eSIMs yet</h3>
      <p className="text-[12px] text-card-foreground/55 mt-1 max-w-[260px]">
        Get instant data abroad. Works in 190+ countries with no roaming fees.
      </p>
      <Link
        to="/pay/esim"
        className="mt-5 h-11 px-5 rounded-full bg-primary text-primary-foreground font-bold text-sm inline-flex items-center gap-1.5"
      >
        <Wifi className="w-4 h-4" /> Buy your first eSIM
      </Link>
    </div>
  );
}
