import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  Receipt,
  Wallet,
  CreditCard,
  Smartphone,
  Phone,
  ListTree,
  Plug,
  Gift,
  Headphones,
  Scale,
  FileText,
  Bell,
  Settings,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useSession } from "@/lib/auth";

type Item = { title: string; url: string; icon: typeof LayoutDashboard };

const overview: Item[] = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
];

const operations: Item[] = [
  { title: "Users", url: "/users", icon: Users },
  { title: "KYC", url: "/kyc", icon: ShieldCheck },
  { title: "Transactions", url: "/transactions", icon: Receipt },
  { title: "Wallets", url: "/wallets", icon: Wallet },
];

const products: Item[] = [
  { title: "Cards", url: "/cards", icon: CreditCard },
  { title: "eSIM", url: "/esim", icon: Smartphone },
  { title: "Numbers", url: "/numbers", icon: Phone },
  { title: "Bill Pay", url: "/pay", icon: ListTree },
  { title: "Providers", url: "/payments", icon: Plug },
];

const business: Item[] = [
  { title: "Growth", url: "/referrals", icon: Gift },
  { title: "Support", url: "/support", icon: Headphones },
  { title: "Compliance", url: "/compliance", icon: Scale },
  { title: "Content", url: "/content", icon: FileText },
  { title: "Notifications", url: "/notifications", icon: Bell },
];

const settings: Item[] = [
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const session = useSession();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const isActive = (url: string) =>
    url === "/" ? pathname === "/" : pathname === url || pathname.startsWith(url + "/");

  const renderGroup = (label: string, items: Item[]) => (
    <SidebarGroup>
      {!collapsed && (
        <SidebarGroupLabel className="text-sidebar-foreground/50 uppercase text-[10px] tracking-wider">
          {label}
        </SidebarGroupLabel>
      )}
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const active = isActive(item.url);
            return (
              <SidebarMenuItem key={item.url}>
                <SidebarMenuButton
                  asChild
                  isActive={active}
                  className="data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-primary data-[active=true]:font-semibold hover:bg-sidebar-accent/60"
                >
                  <Link to={item.url} className="flex items-center gap-3">
                    <item.icon className="h-4 w-4 shrink-0" />
                    {!collapsed && <span className="text-sm">{item.title}</span>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2.5 px-1.5 py-2">
          <div className="h-8 w-8 rounded-md bg-gradient-gold flex items-center justify-center font-display text-sm font-bold text-gold-foreground shrink-0">
            B
          </div>
          {!collapsed && (
            <div className="leading-tight">
              <div className="font-display text-sm font-bold text-sidebar-foreground">BazePay</div>
              <div className="text-[10px] text-sidebar-foreground/60 uppercase tracking-wider">Admin Console</div>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="gap-0">
        {renderGroup("Overview", overview)}
        {renderGroup("Operations", operations)}
        {renderGroup("Products", products)}
        {renderGroup("Business", business)}
        {renderGroup("System", settings)}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <div className="flex items-center gap-2.5 px-1.5 py-1.5">
          <div className="h-8 w-8 rounded-full bg-sidebar-accent flex items-center justify-center text-xs font-semibold text-sidebar-primary shrink-0">
            {session?.name?.[0] ?? "A"}
          </div>
          {!collapsed && session && (
            <div className="leading-tight min-w-0">
              <div className="text-xs font-semibold text-sidebar-foreground truncate">{session.name}</div>
              <div className="text-[10px] text-sidebar-foreground/60 capitalize">{session.role.replace("_", " ")}</div>
            </div>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
