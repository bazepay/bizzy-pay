import { Link, useLocation } from "@tanstack/react-router";
import { House, Wallet, ReceiptText, CreditCard, CircleUserRound, type LucideIcon } from "lucide-react";

type Item = { to: string; icon: LucideIcon; label: string };

const items: Item[] = [
  { to: "/home", icon: House, label: "Home" },
  { to: "/wallet", icon: Wallet, label: "Wallet" },
  { to: "/pay", icon: ReceiptText, label: "Pay" },
  { to: "/cards", icon: CreditCard, label: "Cards" },
  { to: "/profile", icon: CircleUserRound, label: "Profile" },
];

export function BottomNav() {
  const { pathname } = useLocation();
  return (
    <div className="absolute bottom-0 left-0 right-0 z-50 px-4 pb-5">
      <div className="bg-card rounded-full shadow-nav flex items-center justify-between px-2 py-2">
        {items.map((it) => {
          const Icon = it.icon;
          const active = pathname.startsWith(it.to);
          if (active) {
            return (
              <Link
                key={it.to}
                to={it.to}
                className="bg-primary text-primary-foreground rounded-full px-4 py-2.5 flex items-center gap-2 font-semibold text-sm"
              >
                <Icon className="w-4 h-4" />
                {it.label}
              </Link>
            );
          }
          return (
            <Link
              key={it.to}
              to={it.to}
              className="w-11 h-11 rounded-full flex items-center justify-center text-card-foreground/55 hover:text-card-foreground transition"
            >
              <Icon className="w-[22px] h-[22px]" strokeWidth={1.75} />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
