import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Search, UserPlus, ShieldOff, ShieldCheck, RotateCw, Mail } from "lucide-react";
import { toast } from "sonner";
import {
  admins as seed,
  roleLabel,
  roleTone,
  adminStatusTone,
  fmtRelative,
  type Admin,
  type AdminRole,
} from "@/lib/settings-data";

export const Route = createFileRoute("/_admin/settings/")({
  component: AdminsPage,
});

const ROLES: AdminRole[] = ["owner", "admin", "ops", "compliance", "support", "finance", "read_only"];

function AdminsPage() {
  const [items, setItems] = useState<Admin[]>(seed);
  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | AdminRole>("all");
  const [inviting, setInviting] = useState(false);
  const [invite, setInvite] = useState({ name: "", email: "", role: "support" as AdminRole });
  const [confirmSuspend, setConfirmSuspend] = useState<Admin | null>(null);

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    return items.filter((a) => {
      if (roleFilter !== "all" && a.role !== roleFilter) return false;
      if (!term) return true;
      return a.name.toLowerCase().includes(term) || a.email.toLowerCase().includes(term) || a.id.includes(term);
    });
  }, [items, q, roleFilter]);

  const setRole = (id: string, role: AdminRole) => {
    setItems((prev) => prev.map((a) => (a.id === id ? { ...a, role } : a)));
    toast.success("Role updated");
  };

  const toggleSuspend = (a: Admin) => {
    setItems((prev) => prev.map((x) => (x.id === a.id ? { ...x, status: x.status === "suspended" ? "active" : "suspended" } : x)));
    toast.success(a.status === "suspended" ? "Reactivated" : "Suspended");
    setConfirmSuspend(null);
  };

  const reset2FA = (a: Admin) => {
    setItems((prev) => prev.map((x) => (x.id === a.id ? { ...x, twoFA: false } : x)));
    toast.success(`2FA reset · ${a.name} must re-enroll on next login`);
  };

  const resendInvite = (a: Admin) => toast.success(`Invite re-sent to ${a.email}`);

  const sendInvite = () => {
    if (!invite.name.trim() || !invite.email.includes("@")) { toast.error("Name and valid email required"); return; }
    const next: Admin = {
      id: `adm_${Math.floor(Math.random() * 900 + 100)}`,
      name: invite.name.trim(),
      email: invite.email.trim().toLowerCase(),
      role: invite.role,
      status: "invited",
      twoFA: false,
      lastLoginAt: null,
      createdAt: new Date().toISOString(),
    };
    setItems((prev) => [next, ...prev]);
    setInviting(false);
    setInvite({ name: "", email: "", role: "support" });
    toast.success(`Invite sent to ${next.email}`);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, email or id…" className="pl-8" />
        </div>
        <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as typeof roleFilter)}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            {ROLES.map((r) => <SelectItem key={r} value={r}>{roleLabel[r]}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button size="sm" className="gap-2" onClick={() => setInviting(true)}>
          <UserPlus className="h-4 w-4" /> Invite admin
        </Button>
      </div>

      <Card className="shadow-card">
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/40 text-muted-foreground">
              <tr className="text-left">
                <th className="px-3 py-2 font-medium">Admin</th>
                <th className="px-3 py-2 font-medium">Role</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium">2FA</th>
                <th className="px-3 py-2 font-medium">Last login</th>
                <th className="px-3 py-2 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((a) => (
                <tr key={a.id} className="hover:bg-muted/20">
                  <td className="px-3 py-2">
                    <div className="font-medium">{a.name}</div>
                    <div className="text-muted-foreground">{a.email}</div>
                  </td>
                  <td className="px-3 py-2">
                    <Select value={a.role} onValueChange={(v) => setRole(a.id, v as AdminRole)} disabled={a.role === "owner"}>
                      <SelectTrigger className="h-7 w-[140px] text-xs">
                        <Badge variant="outline" className={`text-[10px] ${roleTone[a.role]}`}>{roleLabel[a.role]}</Badge>
                      </SelectTrigger>
                      <SelectContent>
                        {ROLES.filter((r) => r !== "owner").map((r) => (
                          <SelectItem key={r} value={r}>{roleLabel[r]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-3 py-2">
                    <Badge variant="outline" className={`text-[10px] capitalize ${adminStatusTone[a.status]}`}>{a.status}</Badge>
                  </td>
                  <td className="px-3 py-2">
                    {a.twoFA ? (
                      <span className="inline-flex items-center gap-1 text-success"><ShieldCheck className="h-3.5 w-3.5" /> on</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-warning"><ShieldOff className="h-3.5 w-3.5" /> off</span>
                    )}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">{fmtRelative(a.lastLoginAt)}</td>
                  <td className="px-3 py-2">
                    <div className="flex justify-end gap-1">
                      {a.status === "invited" && (
                        <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" onClick={() => resendInvite(a)}>
                          <Mail className="h-3 w-3" /> Resend
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" onClick={() => reset2FA(a)} disabled={!a.twoFA}>
                        <RotateCw className="h-3 w-3" /> Reset 2FA
                      </Button>
                      {a.role !== "owner" && (
                        <Button size="sm" variant="ghost" className={`h-7 text-xs gap-1 ${a.status === "suspended" ? "text-success" : "text-destructive"}`} onClick={() => setConfirmSuspend(a)}>
                          {a.status === "suspended" ? "Reactivate" : "Suspend"}
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={6} className="px-3 py-10 text-center text-muted-foreground">No admins match your filters.</td></tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Dialog open={inviting} onOpenChange={setInviting}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Invite admin</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Full name</Label>
              <Input value={invite.name} onChange={(e) => setInvite({ ...invite, name: e.target.value })} placeholder="e.g. Funke Adebayo" />
            </div>
            <div className="space-y-1.5">
              <Label>Work email</Label>
              <Input type="email" value={invite.email} onChange={(e) => setInvite({ ...invite, email: e.target.value })} placeholder="name@bazepay.ng" />
            </div>
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Select value={invite.role} onValueChange={(v) => setInvite({ ...invite, role: v as AdminRole })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ROLES.filter((r) => r !== "owner").map((r) => <SelectItem key={r} value={r}>{roleLabel[r]}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <p className="text-[11px] text-muted-foreground">An email with a one-time setup link will be sent. The admin must enroll TOTP on first login.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviting(false)}>Cancel</Button>
            <Button onClick={sendInvite}>Send invite</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!confirmSuspend} onOpenChange={(o) => !o && setConfirmSuspend(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmSuspend?.status === "suspended" ? "Reactivate" : "Suspend"} {confirmSuspend?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmSuspend?.status === "suspended"
                ? "They will regain access on next login. 2FA enforcement remains."
                : "Active sessions will be terminated and they will be locked out until reactivated."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => confirmSuspend && toggleSuspend(confirmSuspend)}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
