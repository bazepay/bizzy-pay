import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { LayoutGrid, Layers, CreditCard, Package, Settings2 } from "lucide-react";

export const Route = createFileRoute("/_admin/cards")({
  head: () => ({
    meta: [
      { title: "Cards — BazePay Admin" },
      { name: "description", content: "Card programs, issued cards and program controls." },
    ],
  }),
  component: CardsLayout,
});

const tabs = [
  { to: "/cards", label: "Overview", icon: LayoutGrid, exact: true },
  { to: "/cards/programs", label: "Programs", icon: Layers },
  { to: "/cards/issued", label: "Issued cards", icon: CreditCard },
  { to: "/cards/requests", label: "Physical requests", icon: Package },
  { to: "/cards/physical-settings", label: "Physical settings", icon: Settings2 },
];

function CardsLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  // Hide tabs only on individual card detail pages (/cards/vc_xxxx)
  const onDetail = /^\/cards\/(?!programs$|issued$|requests$|physical-settings$)/.test(pathname);

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-5">
      {!onDetail && (
        <>
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-display text-3xl font-bold">Cards</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Card program configuration, issuance pipeline and per-card controls.
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
