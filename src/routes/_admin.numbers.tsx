import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { LayoutGrid, Boxes, FileText } from "lucide-react";

export const Route = createFileRoute("/_admin/numbers")({
  head: () => ({
    meta: [
      { title: "Numbers — BazePay Admin" },
      { name: "description", content: "Virtual numbers pool, leases and SMS." },
    ],
  }),
  component: NumbersLayout,
});

const tabs = [
  { to: "/numbers", label: "Overview", icon: LayoutGrid, exact: true },
  { to: "/numbers/pool", label: "Pool", icon: Boxes },
  { to: "/numbers/leases", label: "Leases", icon: FileText },
];

function NumbersLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const onDetail = /^\/numbers\/(?!pool$|leases$)/.test(pathname);

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-5">
      {!onDetail && (
        <>
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-display text-3xl font-bold">Virtual Numbers</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Number inventory by country, active leases, renewals and SMS routing.
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
