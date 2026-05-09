import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Wallet, ArrowLeftRight, Banknote, Download, Users } from "lucide-react";

export const Route = createFileRoute("/_admin/wallets")({
  head: () => ({
    meta: [
      { title: "Wallets — BazePay Admin" },
      { name: "description", content: "Float accounts, FX rates, payouts and top-up reconciliation." },
    ],
  }),
  component: WalletsLayout,
});

const tabs = [
  { to: "/wallets", label: "Float", icon: Wallet, exact: true },
  { to: "/wallets/fx", label: "FX", icon: ArrowLeftRight },
  { to: "/wallets/payouts", label: "Payouts", icon: Banknote },
  { to: "/wallets/topups", label: "Top-ups", icon: Download },
];

function WalletsLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-5">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl font-bold">Wallets</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Treasury operations: float balances, FX, payouts and inbound funding.
        </p>
      </motion.div>

      <div className="border-b border-border">
        <nav className="flex gap-1 -mb-px overflow-x-auto">
          {tabs.map((t) => {
            const active = t.exact ? pathname === t.to : pathname.startsWith(t.to);
            const Icon = t.icon;
            return (
              <Link
                key={t.to}
                to={t.to}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  active
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                }`}
              >
                <Icon className="h-4 w-4" />
                {t.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <Outlet />
    </div>
  );
}
