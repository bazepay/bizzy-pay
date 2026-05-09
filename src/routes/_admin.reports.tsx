import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { LayoutDashboard, Banknote, Activity, Scale, CalendarClock, Download } from "lucide-react";

export const Route = createFileRoute("/_admin/reports")({
  head: () => ({
    meta: [
      { title: "Reports — BazePay Admin" },
      { name: "description", content: "Financial, operations and compliance reports with scheduled exports." },
    ],
  }),
  component: ReportsLayout,
});

const tabs = [
  { to: "/reports", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/reports/financial", label: "Financial", icon: Banknote },
  { to: "/reports/operations", label: "Operations", icon: Activity },
  { to: "/reports/compliance", label: "Compliance", icon: Scale },
  { to: "/reports/scheduled", label: "Scheduled", icon: CalendarClock },
  { to: "/reports/exports", label: "Exports", icon: Download },
];

function ReportsLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-5">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl font-bold">Reports</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Generate and schedule financial, operations and compliance reports. All amounts in NGN.
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
