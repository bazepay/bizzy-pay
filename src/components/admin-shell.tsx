import { Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { Bell, Command, ChevronDown, LogOut } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { logout, useSession } from "@/lib/auth";

export function AdminShell() {
  const session = useSession();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!session) navigate({ to: "/login", replace: true });
  }, [session, navigate]);

  if (!session) return null;

  const crumbs = pathname === "/" ? ["Dashboard"] : pathname.split("/").filter(Boolean);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />

        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center justify-between border-b border-border bg-card px-4 sticky top-0 z-30 shadow-card">
            <div className="flex items-center gap-3 min-w-0">
              <SidebarTrigger />
              <div className="h-5 w-px bg-border" />
              <nav className="flex items-center gap-1.5 text-sm">
                {crumbs.map((c, i) => (
                  <span key={i} className="flex items-center gap-1.5">
                    {i > 0 && <span className="text-muted-foreground/50">/</span>}
                    <span
                      className={
                        i === crumbs.length - 1
                          ? "font-medium text-foreground capitalize"
                          : "text-muted-foreground capitalize"
                      }
                    >
                      {c}
                    </span>
                  </span>
                ))}
              </nav>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="hidden md:flex gap-2 text-muted-foreground">
                <Command className="h-3.5 w-3.5" />
                <span className="text-xs">Quick search</span>
                <kbd className="ml-2 text-[10px] bg-muted px-1.5 py-0.5 rounded border border-border">⌘K</kbd>
              </Button>

              <Badge variant="secondary" className="hidden sm:inline-flex bg-warning/15 text-warning-foreground border-warning/30 font-medium">
                Sandbox
              </Badge>

              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-4 w-4" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2 pl-1.5 pr-2">
                    <div className="h-7 w-7 rounded-full bg-gradient-primary flex items-center justify-center text-xs font-semibold text-primary-foreground">
                      {session.name[0]}
                    </div>
                    <span className="text-sm font-medium hidden sm:inline">{session.name}</span>
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="font-semibold">{session.name}</div>
                    <div className="text-xs text-muted-foreground">{session.email}</div>
                    <div className="text-[10px] text-muted-foreground capitalize mt-1">
                      {session.role.replace("_", " ")}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      logout();
                      navigate({ to: "/login", replace: true });
                    }}
                    className="text-destructive focus:text-destructive"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          <main className="flex-1 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
