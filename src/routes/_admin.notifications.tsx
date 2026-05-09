import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { LayoutGrid, FileText, Send, ListChecks, Plug } from "lucide-react";

export const Route = createFileRoute("/_admin/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — BazePay Admin" },
      { name: "description", content: "Templates, broadcasts, delivery log and provider channels." },
    ],
  }),
  component: NotificationsLayout,
});

const tabs = [
  { to: "/notifications", label: "Overview", icon: LayoutGrid, exact: true },
  { to: "/notifications/templates", label: "Templates", icon: FileText },
  { to: "/notifications/broadcasts", label: "Broadcasts", icon: Send },
  { to: "/notifications/delivery", label: "Delivery log", icon: ListChecks },
  { to: "/notifications/channels", label: "Channels", icon: Plug },
];

function NotificationsLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-5">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl font-bold">Notifications</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Push, email, SMS and in-app messaging — templates, broadcasts and delivery monitoring.
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
