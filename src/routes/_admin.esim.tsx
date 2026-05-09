import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { LayoutGrid, Layers, Package, ShoppingCart } from "lucide-react";

export const Route = createFileRoute("/_admin/esim")({
  head: () => ({
    meta: [
      { title: "eSIM — BazePay Admin" },
      { name: "description", content: "eSIM plans, inventory, orders and activations." },
    ],
  }),
  component: EsimLayout,
});

const tabs = [
  { to: "/esim", label: "Overview", icon: LayoutGrid, exact: true },
  { to: "/esim/plans", label: "Plans", icon: Layers },
  { to: "/esim/inventory", label: "Inventory", icon: Package },
  { to: "/esim/orders", label: "Orders", icon: ShoppingCart },
];

function EsimLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  // Hide tabs on order detail pages (/esim/eso_xxxxx)
  const onDetail = /^\/esim\/(?!plans$|inventory$|orders$)/.test(pathname);

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-5">
      {!onDetail && (
        <>
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-display text-3xl font-bold">eSIM</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Plan catalogue, supplier inventory and order activations.
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
