import { createFileRoute, Link } from "@tanstack/react-router";
import { Phone, Wifi, Zap, Tv, Trophy, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/pay/")({
  component: PayHub,
});

const services = [
  { id: "airtime", name: "Airtime", icon: Phone, color: "bg-[oklch(0.92_0.06_50)] text-[oklch(0.4_0.18_30)]" },
  { id: "data", name: "Mobile Data", icon: Wifi, color: "bg-[oklch(0.92_0.06_280)] text-[oklch(0.4_0.18_280)]" },
  { id: "electricity", name: "Electricity", icon: Zap, color: "bg-[oklch(0.94_0.08_85)] text-[oklch(0.45_0.15_70)]" },
  { id: "tv", name: "Cable TV", icon: Tv, color: "bg-[oklch(0.92_0.05_240)] text-[oklch(0.4_0.18_240)]" },
  { id: "betting", name: "Bet Funding", icon: Trophy, color: "bg-[oklch(0.92_0.06_15)] text-[oklch(0.42_0.2_15)]" },
];

function PayHub() {
  return (
    <div>
      <div className="bg-gradient-hero text-white pt-12 pb-8 px-6 rounded-b-[2rem]">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/home" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-display font-bold text-lg">Pay bills</h1>
        </div>
        <p className="text-sm text-white/70">Top up airtime, settle bills and fund your accounts in seconds.</p>
      </div>

      <div className="px-6 pt-6">
        <h2 className="font-display font-bold text-base mb-3">Services</h2>
        <div className="grid grid-cols-2 gap-3">
          {services.map((s) => (
            <Link
              key={s.id}
              to="/pay/$service"
              params={{ service: s.id }}
              className="p-4 rounded-2xl bg-card flex flex-col items-start gap-3 active:scale-95 transition"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${s.color}`}>
                <s.icon className="w-6 h-6" />
              </div>
              <p className="font-semibold text-sm">{s.name}</p>
            </Link>
          ))}
        </div>

        <div className="mt-8 rounded-2xl p-5 bg-gradient-primary text-primary-foreground">
          <p className="text-xs uppercase tracking-widest opacity-70">Tip</p>
          <p className="font-semibold mt-1">Save your favorite billers for one-tap payments.</p>
        </div>
      </div>
    </div>
  );
}
