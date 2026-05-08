import { createFileRoute, Link } from "@tanstack/react-router";
import { Phone, Smartphone, Zap, Tv, Dices, Wifi, ChevronRight, Search, Globe2, Sparkles, Router } from "lucide-react";
import { useState } from "react";
import { BottomNav } from "@/components/bottom-nav";

export const Route = createFileRoute("/_app/pay/")({
  head: () => ({
    meta: [
      { title: "Pay bills · BazePay" },
      { name: "description", content: "Airtime, data, electricity, TV and more in one tap." },
    ],
  }),
  component: PayHub,
});

type Service = {
  slug: string;
  label: string;
  desc: string;
  icon: typeof Phone;
  token: string;
};

const services: Service[] = [
  { slug: "airtime", label: "Airtime", desc: "MTN, Glo, Airtel, 9mobile", icon: Phone, token: "service-airtime" },
  { slug: "data", label: "Data bundles", desc: "Daily, weekly, monthly", icon: Smartphone, token: "service-data" },
  { slug: "electricity", label: "Electricity", desc: "Prepaid & postpaid meters", icon: Zap, token: "service-electricity" },
  { slug: "tv", label: "TV subscription", desc: "DStv · GOTV · Startimes", icon: Tv, token: "service-cable" },
  { slug: "betting", label: "Betting", desc: "Bet9ja · SportyBet · 1xBet", icon: Dices, token: "service-betting" },
  { slug: "internet", label: "Internet", desc: "ipNX · Smile · Spectranet", icon: Router, token: "service-internet" },
];

const recents = [
  { slug: "airtime", label: "MTN · 0803 555 0142" },
  { slug: "electricity", label: "Ikeja · 0123456789" },
  { slug: "tv", label: "DStv · 7012345678" },
];

function PayHub() {
  const [q, setQ] = useState("");
  const filtered = services.filter(
    (s) =>
      s.label.toLowerCase().includes(q.toLowerCase()) ||
      s.desc.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div className="min-h-full bg-background text-foreground flex flex-col">
      <div className="h-10" />
      <div className="px-6 pt-4">
        <h1 className="font-display text-3xl font-bold tracking-tight">Pay bills</h1>
        <p className="text-xs text-foreground/50 mt-1.5">Top up, settle bills, manage subscriptions</p>
      </div>

      {/* search */}
      <div className="px-6 mt-5">
        <div className="h-12 rounded-full bg-card text-card-foreground flex items-center gap-2 px-4">
          <Search className="w-4 h-4 text-card-foreground/50" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search services"
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-card-foreground/40"
          />
        </div>
      </div>

      {/* services */}
      <div className="flex-1 mt-6 bg-card text-card-foreground rounded-t-[2rem] px-6 pt-6 pb-28">
        {/* eSIM hero — flagship feature */}
        {q === "" && (
          <Link
            to="/pay/esim"
            className="relative block overflow-hidden rounded-3xl p-5 mb-5 active:scale-[0.99] transition"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.32 0.14 220) 0%, oklch(0.22 0.12 260) 60%, oklch(0.18 0.08 290) 100%)",
              color: "#fff",
            }}
          >
            <div
              className="absolute -top-10 -right-10 w-44 h-44 rounded-full opacity-40 blur-2xl"
              style={{ background: "oklch(0.72 0.16 220)" }}
            />
            <div
              className="absolute -bottom-12 -left-8 w-40 h-40 rounded-full opacity-25 blur-2xl"
              style={{ background: "oklch(0.7 0.2 320)" }}
            />
            <div className="relative">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/15 backdrop-blur-sm text-[9px] font-bold uppercase tracking-[0.18em]">
                  <Sparkles className="w-2.5 h-2.5" /> New
                </span>
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] opacity-75">
                  Travel · 190+ countries
                </span>
              </div>
              <div className="mt-3 flex items-end justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-display text-2xl font-bold tracking-tight leading-tight">
                    Travel eSIM
                  </h3>
                  <p className="text-[12px] opacity-80 mt-1 leading-snug">
                    Instant data abroad. No roaming fees. Works on any unlocked phone.
                  </p>
                  <div className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-bold">
                    <span>From $4.50 / GB</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="shrink-0 w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/15">
                  <Globe2 className="w-8 h-8" strokeWidth={1.8} />
                </div>
              </div>
            </div>
          </Link>
        )}

        {q === "" && (
          <div className="mt-1 mb-5 grid grid-cols-2 gap-3">
            <Link
              to="/esims"
              className="flex items-center gap-3 rounded-2xl bg-card-foreground/[0.04] p-4 active:scale-[0.99] transition"
            >
              <div className="w-10 h-10 rounded-xl bg-service-esim/15 text-service-esim flex items-center justify-center">
                <Smartphone className="w-5 h-5" strokeWidth={2.2} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">My eSIMs</p>
                <p className="text-[11px] text-card-foreground/55 mt-0.5 truncate">2 active · top up</p>
              </div>
              <ChevronRight className="w-4 h-4 text-card-foreground/40 shrink-0" />
            </Link>
            <Link
              to="/numbers"
              className="flex items-center gap-3 rounded-2xl bg-card-foreground/[0.04] p-4 active:scale-[0.99] transition"
            >
              <div className="w-10 h-10 rounded-xl bg-service-esim/15 text-service-esim flex items-center justify-center">
                <Phone className="w-5 h-5" strokeWidth={2.2} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">My Numbers</p>
                <p className="text-[11px] text-card-foreground/55 mt-0.5 truncate">3 active · 2 SMS</p>
              </div>
              <ChevronRight className="w-4 h-4 text-card-foreground/40 shrink-0" />
            </Link>
          </div>
        )}

        <h2 className="font-display font-bold text-base">All services</h2>

        <div className="mt-4 grid grid-cols-2 gap-3">
          {filtered.map((s) => {
            const Icon = s.icon;
            const linkProps =
              s.slug === "airtime"
                ? ({ to: "/pay/airtime" } as const)
                : s.slug === "data"
                ? ({ to: "/pay/data" } as const)
                : s.slug === "electricity"
                ? ({ to: "/pay/electricity" } as const)
                : s.slug === "tv"
                ? ({ to: "/pay/tv" } as const)
                : s.slug === "betting"
                ? ({ to: "/pay/betting" } as const)
                : s.slug === "internet"
                ? ({ to: "/pay/internet" } as const)
                : ({ to: "/pay/$service", params: { service: s.slug } } as const);
            return (
              <Link
                key={s.slug}
                {...linkProps}
                className="rounded-2xl bg-card-foreground/[0.04] p-4 active:scale-[0.98] transition flex flex-col gap-3"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{
                    backgroundColor: `color-mix(in oklab, var(--${s.token}) 16%, transparent)`,
                  }}
                >
                  <Icon className="w-5 h-5" style={{ color: `var(--${s.token})` }} strokeWidth={2.2} />
                </div>
                <div className="min-w-0 w-full">
                  <p className="font-semibold text-sm">{s.label}</p>
                  <p className="text-[11px] text-card-foreground/55 mt-0.5 leading-tight truncate">{s.desc}</p>
                </div>
              </Link>
            );
          })}
        </div>

        {/* recents */}
        {q === "" && (
          <>
            <h2 className="font-display font-bold text-base mt-7">Recents</h2>
            <div className="mt-3 rounded-2xl bg-card-foreground/[0.04] divide-y divide-card-foreground/[0.06] overflow-hidden">
              {recents.map((r) => {
                const svc = services.find((s) => s.slug === r.slug)!;
                const Icon = svc.icon;
                const linkProps =
                  r.slug === "airtime"
                    ? ({ to: "/pay/airtime" } as const)
                    : r.slug === "data"
                    ? ({ to: "/pay/data" } as const)
                    : r.slug === "electricity"
                    ? ({ to: "/pay/electricity" } as const)
                    : r.slug === "tv"
                    ? ({ to: "/pay/tv" } as const)
                    : r.slug === "betting"
                    ? ({ to: "/pay/betting" } as const)
                    : r.slug === "internet"
                    ? ({ to: "/pay/internet" } as const)
                    : ({ to: "/pay/$service", params: { service: r.slug } } as const);
                return (
                  <Link
                    key={r.label}
                    {...linkProps}
                    className="flex items-center gap-3 px-4 py-3.5 active:bg-card-foreground/[0.06]"
                  >
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center"
                      style={{
                        backgroundColor: `color-mix(in oklab, var(--${svc.token}) 16%, transparent)`,
                      }}
                    >
                      <Icon className="w-4 h-4" style={{ color: `var(--${svc.token})` }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold">{svc.label}</p>
                      <p className="text-[11px] text-card-foreground/55 truncate">{r.label}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-card-foreground/40" />
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
