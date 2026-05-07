import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Bell,
  MessageSquare,
  ChevronDown,
  Plus,
  ArrowUp,
  ArrowDown,
  LayoutGrid,
  Home,
  CreditCard,
  Lightbulb,
  User,
  ScanLine,
} from "lucide-react";

export const Route = createFileRoute("/_app/home3")({
  component: Home3Page,
});

const contacts = [
  { name: "Add", isAdd: true },
  { name: "Carter", color: "#F4C28A" },
  { name: "William", color: "#D4D4D4" },
  { name: "Jenkins", color: "#F4D35E" },
  { name: "Rogers", color: "#A7C7E7" },
  { name: "Jenny", color: "#E8B4B8" },
];

const txns = [
  { id: 1, name: "Cody Lee", time: "10:45 PM", amount: -220, label: "Send", color: "#E8B4B8" },
  { id: 2, name: "Sam Charm", time: "10:45 PM", amount: 220, label: "Deposit", initials: "SA", color: "#A7C7E7" },
  { id: 3, name: "William", time: "10:45 PM", amount: -220, label: "Traveling", color: "#D4D4D4" },
  { id: 4, name: "William", time: "10:45 PM", amount: -220, label: "Traveling", color: "#C9B8A8" },
];

function Home3Page() {
  return (
    <div className="min-h-full bg-[#F4F6FA] text-[#0A2540] flex flex-col relative pb-28">
      {/* Blue header */}
      <div className="bg-[#1E5BFF] pt-12 pb-20 px-5">
        <div className="flex items-center justify-between">
          <button className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-300 to-orange-300 ring-2 ring-white/40" />
            <span className="text-white text-sm font-semibold">Hi, Elvis Presley</span>
            <ChevronDown className="w-3.5 h-3.5 text-white" />
          </button>
          <div className="flex items-center gap-2">
            <button className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-white" />
            </button>
            <button className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center relative">
              <Bell className="w-4 h-4 text-white" />
              <span className="absolute top-2 right-2.5 w-1.5 h-1.5 rounded-full bg-red-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Balance card overlapping header */}
      <div className="px-5 -mt-16">
        <div className="bg-white rounded-2xl px-5 py-4 shadow-[0_8px_24px_-12px_rgba(10,37,64,0.15)]">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#0A2540]/60">Available Balance</span>
            <button className="flex items-center gap-1 text-xs font-semibold">
              <span className="w-5 h-5 rounded-full bg-gradient-to-br from-red-500 via-white to-blue-600 ring-1 ring-black/10" />
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>
          <h1 className="font-display text-3xl font-bold mt-1 tracking-tight">$12,253.70</h1>

          <div className="grid grid-cols-4 gap-2 mt-5">
            <ActionBtn icon={Plus} label="Top Up" />
            <ActionBtn icon={ArrowUp} label="Send" />
            <ActionBtn icon={ArrowDown} label="Receive" />
            <ActionBtn icon={LayoutGrid} label="More" />
          </div>
        </div>
      </div>

      {/* Frequently Contacts */}
      <div className="px-5 mt-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-[15px]">Frequently Contacts</h2>
          <Link to="/wallet" className="text-xs font-semibold text-[#1E5BFF]">View All</Link>
        </div>

        <div className="mt-3 flex gap-4 overflow-x-auto no-scrollbar">
          {contacts.map((c) => (
            <div key={c.name} className="flex flex-col items-center gap-1.5 shrink-0">
              {c.isAdd ? (
                <div className="w-12 h-12 rounded-full bg-[#0A2540] flex items-center justify-center text-white">
                  <Plus className="w-5 h-5" />
                </div>
              ) : (
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center font-display font-bold text-white text-sm ring-1 ring-black/5"
                  style={{ background: c.color }}
                >
                  {c.name[0]}
                </div>
              )}
              <span className="text-[11px] text-[#0A2540]/80">{c.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Transaction History card */}
      <div className="px-5 mt-5">
        <div className="bg-white rounded-2xl p-4 shadow-[0_8px_24px_-12px_rgba(10,37,64,0.1)]">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-[15px]">Transaction History</h2>
            <Link to="/wallet" className="text-xs font-semibold text-[#1E5BFF]">View All</Link>
          </div>

          <div className="mt-3 space-y-3">
            {txns.map((t) => (
              <div key={t.id} className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-[#0A2540] font-display font-bold text-xs ring-1 ring-black/5"
                  style={{ background: t.color }}
                >
                  {t.initials ?? t.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{t.name}</p>
                  <p className="text-[11px] text-[#0A2540]/50">{t.time}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${t.amount > 0 ? "text-[#1E5BFF]" : "text-[#0A2540]"}`}>
                    {t.amount > 0 ? "+" : "-"}${Math.abs(t.amount).toFixed(2)}
                  </p>
                  <p className="text-[10px] text-[#0A2540]/50">{t.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom nav */}
      <div className="absolute bottom-0 left-0 right-0 z-50 bg-white border-t border-black/5 pt-2 pb-5 px-2">
        <div className="grid grid-cols-5 items-end text-[10px]">
          <NavItem icon={Home} label="Home" active />
          <NavItem icon={CreditCard} label="My Cards" />
          <div />
          <NavItem icon={Lightbulb} label="Tips" />
          <NavItem icon={User} label="Profile" />
        </div>
        <button className="absolute left-1/2 -translate-x-1/2 -top-6 w-14 h-14 rounded-full bg-[#0A2540] text-white flex items-center justify-center shadow-lg ring-4 ring-white">
          <ScanLine className="w-6 h-6" />
        </button>
      </div>

      {/* compare links */}
      <div className="absolute top-2 right-3 z-50 flex gap-2">
        <Link to="/home" className="text-[10px] text-white/80 underline">H1</Link>
        <Link to="/home2" className="text-[10px] text-white/80 underline">H2</Link>
      </div>
    </div>
  );
}

function ActionBtn({ icon: Icon, label }: { icon: typeof Plus; label: string }) {
  return (
    <button className="flex flex-col items-center gap-1.5 active:scale-95 transition">
      <div className="w-12 h-12 rounded-full bg-[#EDF2FF] flex items-center justify-center text-[#1E5BFF]">
        <Icon className="w-5 h-5" strokeWidth={2.2} />
      </div>
      <span className="text-[11px] font-medium text-[#0A2540]">{label}</span>
    </button>
  );
}

function NavItem({
  icon: Icon,
  label,
  active = false,
}: {
  icon: typeof Home;
  label: string;
  active?: boolean;
}) {
  return (
    <button className={`flex flex-col items-center gap-1 py-1 ${active ? "text-[#1E5BFF]" : "text-[#0A2540]/50"}`}>
      <Icon className="w-5 h-5" />
      <span className="font-medium">{label}</span>
    </button>
  );
}
