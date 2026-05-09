import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Users, Shield, Flag, KeyRound, Palette } from "lucide-react";

export const Route = createFileRoute("/_admin/settings")({
  head: () => ({
    meta: [
      { title: "Settings — BazePay Admin" },
      { name: "description", content: "Admins, audit log, feature flags, API keys and branding." },
    ],
  }),
  component: SettingsLayout,
});

const tabs = [
  { to: "/settings", label: "Admins", icon: Users, exact: true },
  { to: "/settings/audit-log", label: "Audit log", icon: Shield },
  { to: "/settings/feature-flags", label: "Feature flags", icon: Flag },
  { to: "/settings/api-keys", label: "API keys", icon: KeyRound },
  { to: "/settings/branding", label: "Branding", icon: Palette },
];

function SettingsLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-5">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage admins, review the audit trail, toggle features per environment and rotate credentials.
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
