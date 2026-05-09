import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { LayoutGrid, AlertTriangle, ShieldAlert, ScrollText, FileCheck2 } from "lucide-react";

export const Route = createFileRoute("/_admin/compliance")({
  head: () => ({
    meta: [
      { title: "Compliance — BazePay Admin" },
      { name: "description", content: "AML alerts, sanctions screening, audit log and policies." },
    ],
  }),
  component: ComplianceLayout,
});

const tabs = [
  { to: "/compliance", label: "Overview", icon: LayoutGrid, exact: true },
  { to: "/compliance/alerts", label: "AML alerts", icon: AlertTriangle },
  { to: "/compliance/sanctions", label: "Sanctions", icon: ShieldAlert },
  { to: "/compliance/audit", label: "Audit log", icon: ScrollText },
  { to: "/compliance/policies", label: "Policies", icon: FileCheck2 },
];

function ComplianceLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-5">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl font-bold">Compliance</h1>
        <p className="text-sm text-muted-foreground mt-1">
          AML alerts, sanctions screening, audit trail and policy library across the BazePay platform.
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
