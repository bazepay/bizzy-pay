import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { LayoutGrid, Building2, Layers, ShoppingCart, ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/_admin/pay")({
  head: () => ({
    meta: [
      { title: "Bill Pay — BazePay Admin" },
      { name: "description", content: "Airtime, Data, Electricity, TV, Betting and Internet bill payment operations." },
    ],
  }),
  component: PayLayout,
});

const tabs = [
  { to: "/pay", label: "Overview", icon: LayoutGrid, exact: true },
  { to: "/pay/billers", label: "Billers", icon: Building2 },
  { to: "/pay/plans", label: "Plans", icon: Layers },
  { to: "/pay/orders", label: "Orders", icon: ShoppingCart },
  { to: "/pay/incidents", label: "Incidents", icon: ShieldAlert },
];

function PayLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const onDetail = /^\/pay\/(?!billers$|plans$|orders$)/.test(pathname);

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-5">
      {!onDetail && (
        <>
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-display text-3xl font-bold">Bill Pay</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Airtime, Data, Electricity, TV, Betting and Internet — billers, plans and live orders.
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
