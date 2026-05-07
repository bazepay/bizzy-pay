import { createFileRoute, Outlet, Link, useLocation } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/phone-frame";
import { Home, Wallet, Receipt, CreditCard, User } from "lucide-react";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

const tabs = [
  { to: "/_app/home", label: "Home", icon: Home },
  { to: "/_app/wallet", label: "Wallet", icon: Wallet },
  { to: "/_app/pay", label: "Pay", icon: Receipt },
  { to: "/_app/cards", label: "Cards", icon: CreditCard },
  { to: "/_app/profile", label: "Profile", icon: User },
] as const;

function AppLayout() {
  const loc = useLocation();
  return (
    <PhoneFrame>
      <div className="min-h-screen md:h-[860px] flex flex-col bg-background">
        <main className="flex-1 overflow-y-auto pb-24 no-scrollbar">
          <Outlet />
        </main>
        <nav className="absolute bottom-0 left-0 right-0 bg-card/95 backdrop-blur border-t border-border px-2 pt-2 pb-6 flex justify-around z-40">
          {tabs.map((t) => {
            const active = loc.pathname.startsWith(t.to);
            const Icon = t.icon;
            return (
              <Link
                key={t.to}
                to={t.to}
                className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? "stroke-[2.5]" : ""}`} />
                <span className="text-[10px] font-medium">{t.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </PhoneFrame>
  );
}
