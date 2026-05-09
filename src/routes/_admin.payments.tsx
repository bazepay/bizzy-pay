import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { LayoutGrid, Plug, GitBranch, Banknote, Webhook } from "lucide-react";

export const Route = createFileRoute("/_admin/payments")({
  head: () => ({
    meta: [
      { title: "Providers — BazePay Admin" },
      { name: "description", content: "Payment processors, routing rules, settlements and webhooks." },
    ],
  }),
  component: PaymentsLayout,
});

const tabs = [
  { to: "/payments", label: "Overview", icon: LayoutGrid, exact: true },
  { to: "/payments/providers", label: "Providers", icon: Plug },
  { to: "/payments/routing", label: "Routing", icon: GitBranch },
  { to: "/payments/settlements", label: "Settlements", icon: Banknote },
  { to: "/payments/webhooks", label: "Webhooks", icon: Webhook },
];

function PaymentsLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const onDetail = /^\/payments\/(?!providers$|routing$|settlements$|webhooks$)/.test(pathname);

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-5">
      {!onDetail && (
        <>
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-display text-3xl font-bold">Providers</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Payment processors, gateway routing, settlements and webhooks across wallet, card and bill flows.
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
        </>
      )}

      <Outlet />
    </div>
  );
}
