import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Smartphone, Monitor, KeyRound, ShieldAlert, LogOut } from "lucide-react";
import { toast } from "sonner";
import { getDevices, getUser } from "@/lib/users-data";

export const Route = createFileRoute("/_admin/users/$id/devices")({
  component: DevicesTab,
});

function DevicesTab() {
  const { id } = Route.useParams();
  const user = getUser(id)!;
  const devices = getDevices(id);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card className="shadow-card lg:col-span-2">
        <CardContent className="p-0 divide-y">
          {devices.map((d) => {
            const Icon = d.os.toLowerCase().includes("mac") || d.os.toLowerCase().includes("windows") ? Monitor : Smartphone;
            return (
              <div key={d.id} className="p-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-medium">{d.name}</div>
                    {d.current && <Badge variant="outline" className="text-[10px] bg-success/15 text-success border-success/30">Current</Badge>}
                  </div>
                  <div className="text-xs text-muted-foreground">{d.os} · {d.ip} · {d.geo}</div>
                </div>
                <div className="text-xs text-muted-foreground">{d.lastActive}</div>
                <Button size="sm" variant="outline" onClick={() => toast.success(`Revoked ${d.name}.`)}>
                  Revoke
                </Button>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardContent className="p-4 space-y-2">
          <div className="text-sm font-medium mb-2">Auth state</div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">2FA</span>
            <Badge variant="outline" className="text-xs">{user.twoFa ? "Enabled" : "Disabled"}</Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Transaction PIN</span>
            <Badge variant="outline" className="text-xs">{user.pinSet ? "Set" : "Not set"}</Badge>
          </div>
          <div className="grid gap-1.5 pt-3">
            <Button size="sm" variant="outline" onClick={() => toast.success("PIN reset queued.")}>
              <KeyRound className="h-3.5 w-3.5 mr-1.5" /> Reset PIN
            </Button>
            <Button size="sm" variant="outline" onClick={() => toast.success("2FA reset.")}>
              <ShieldAlert className="h-3.5 w-3.5 mr-1.5" /> Reset 2FA
            </Button>
            <Button size="sm" variant="outline" onClick={() => toast.success("All sessions revoked.")}>
              <LogOut className="h-3.5 w-3.5 mr-1.5" /> Revoke all sessions
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
