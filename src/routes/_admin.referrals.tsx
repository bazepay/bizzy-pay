import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { LayoutGrid, Gift, Users, Megaphone, Ticket, Mail } from "lucide-react";

export const Route = createFileRoute("/_admin/referrals")({
  head: () => ({
    meta: [
      { title: "Growth — BazePay Admin" },
      { name: "description", content: "Referral programs, campaigns, newsletters and promo codes." },
    ],
  }),
  component: GrowthLayout,
});

const tabs = [
  { to: "/referrals", label: "Overview", icon: LayoutGrid, exact: true },
  { to: "/referrals/programs", label: "Programs", icon: Gift },
  { to: "/referrals/list", label: "Referrals", icon: Users },
  { to: "/referrals/campaigns", label: "Campaigns", icon: Megaphone },
  { to: "/referrals/newsletter", label: "Newsletter", icon: Mail },
  { to: "/referrals/promos", label: "Promo codes", icon: Ticket },
];

function GrowthLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-5">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl font-bold">Growth</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Referral programs, lifecycle campaigns and promotional codes driving acquisition and retention.
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

      <Outlet />
    </div>
  );
}
