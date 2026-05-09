import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeftRight, Receipt, Wallet } from "lucide-react";

export const Route = createFileRoute("/_admin/rates")({
  head: () => ({
    meta: [
      { title: "Rates & Fees — BazePay Admin" },
      { name: "description", content: "Manage USD→NGN exchange rates and service / transaction fees." },
    ],
  }),
  component: RatesLayout,
});

const tabs = [
  { to: "/rates", label: "Exchange rates", icon: ArrowLeftRight, exact: true },
  { to: "/rates/services", label: "Service fees", icon: Receipt },
  { to: "/rates/transactions", label: "Transaction fees", icon: Wallet },
];

function RatesLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-5">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl font-bold">Rates & Fees</h1>
        <p className="text-sm text-muted-foreground mt-1">
          USD is the base reference. NGN is derived from USD/NGN; all other currencies convert to USD via API.
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
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
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
