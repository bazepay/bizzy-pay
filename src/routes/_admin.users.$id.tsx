import { createFileRoute, Link, Outlet, useRouterState, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft, Eye, EyeOff, MoreHorizontal, KeyRound, ShieldAlert, LogOut as LogOutIcon, Lock, UserX, RefreshCw, MessageSquare, Edit3, Phone, Mail, MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { fmtNgn } from "@/lib/mock-data";
import {
  getUser, kycLabel, kycTone, statusTone, riskTone, fmtRelative,
} from "@/lib/users-data";

export const Route = createFileRoute("/_admin/users/$id")({
  head: ({ params }) => ({
    meta: [{ title: `User ${params.id} — BazePay Admin` }],
  }),
  component: User360Layout,
  notFoundComponent: () => (
    <div className="p-12 text-center">
      <h1 className="text-2xl font-bold">User not found</h1>
      <Link to="/users" className="text-primary text-sm mt-2 inline-block">Back to directory</Link>
    </div>
  ),
});

const TABS = [
  { value: "", label: "Overview" },
  { value: "kyc", label: "KYC" },
  { value: "wallets", label: "Wallets" },
  { value: "transactions", label: "Transactions" },
  { value: "cards", label: "Cards" },
  { value: "esims", label: "eSIMs" },
  { value: "numbers", label: "Numbers" },
  { value: "devices", label: "Devices" },
  { value: "notes", label: "Notes" },
] as const;

function User360Layout() {
  const { id } = Route.useParams();
  const user = getUser(id);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [showPhone, setShowPhone] = useState(false);

  if (!user) {
    return (
      <div className="p-12 text-center">
        <h1 className="text-2xl font-bold">User {id} not found</h1>
        <Link to="/users" className="text-primary text-sm mt-2 inline-block">Back to directory</Link>
      </div>
    );
  }

  const activeTab =
    TABS.slice(1).find((t) => pathname.endsWith("/" + t.value))?.value ?? "";

  const masked = (s: string) => s.replace(/\d(?=\d{4})/g, "•");

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-5">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <Link to="/users" className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground mb-3">
          <ArrowLeft className="h-3 w-3 mr-1" />
          Back to users
        </Link>

        {/* Header card */}
        <Card className="shadow-card overflow-hidden">
          <div className="bg-gradient-hero p-5 flex items-start gap-4 flex-wrap text-primary-foreground">
            <div
              className="h-16 w-16 rounded-full flex items-center justify-center text-lg font-display font-bold text-white shrink-0 ring-2 ring-white/20"
              style={{ backgroundColor: `oklch(0.55 0.18 ${user.avatarHue})` }}
            >
              {user.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
            </div>

            <div className="flex-1 min-w-[260px]">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-display text-2xl font-bold text-primary-foreground">{user.name}</h1>
                <Badge variant="outline" className={`text-xs capitalize ${statusTone[user.status]}`}>{user.status}</Badge>
                <Badge variant="outline" className={`text-xs ${kycTone(user.kyc)}`}>{kycLabel(user.kyc)}</Badge>
              </div>
              <div className="mt-2 flex items-center gap-4 text-sm text-primary-foreground/75 flex-wrap">
                <span className="inline-flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" />
                  {showPhone ? user.phone : masked(user.phone)}
                  <button onClick={() => setShowPhone((s) => !s)} className="text-primary-foreground/90 text-xs ml-1">
                    {showPhone ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  </button>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" />
                  {user.email}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  {user.country}
                </span>
                <span className="font-mono text-xs">{user.id}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-right">
              <div>
                <div className="text-[11px] uppercase tracking-wider text-primary-foreground/60">Risk</div>
                <div className={`font-display text-lg font-bold ${riskTone(user.riskScore)}`}>{user.riskScore}</div>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wider text-primary-foreground/60">LTV</div>
                <div className="font-display text-lg font-bold text-primary-foreground">{fmtNgn(user.ltvNgn)}</div>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wider text-primary-foreground/60">Last seen</div>
                <div className="font-display text-lg font-bold text-primary-foreground">{fmtRelative(user.lastActiveAt)}</div>
              </div>
            </div>

            <div className="w-full md:w-auto">
              <UserActions userId={user.id} status={user.status} />
            </div>
          </div>

          {/* Tabs */}
          <div className="border-t bg-card">
            <div className="flex gap-1 px-3 overflow-x-auto">
              {TABS.map((t) => {
                const isActive = activeTab === t.value;
                return (
                  <Link
                    key={t.value}
                    to={t.value === "" ? "/users/$id" : (`/users/$id/${t.value}` as "/users/$id/kyc")}
                    params={{ id: user.id }}
                    className={`relative px-4 py-3 text-sm font-medium whitespace-nowrap transition ${
                      isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {t.label}
                    {isActive && (
                      <motion.div
                        layoutId="user-tab-underline"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </Card>
      </motion.div>

      <Outlet />
    </div>
  );
}

function UserActions({ userId, status }: { userId: string; status: string }) {
  const navigate = useNavigate();
  const [messageOpen, setMessageOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [reasonOpen, setReasonOpen] = useState<null | { title: string; description: string; cta: string; danger?: boolean; onConfirm: (reason: string) => void }>(null);
  const [reason, setReason] = useState("");

  const ask = (cfg: NonNullable<typeof reasonOpen>) => {
    setReason("");
    setReasonOpen(cfg);
  };

  return (
    <>
      <div className="flex items-center gap-2 justify-end flex-wrap">
        <Button size="sm" variant="secondary" onClick={() => setMessageOpen(true)}>
          <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
          Message
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="secondary">
              <MoreHorizontal className="h-3.5 w-3.5 mr-1.5" />
              Actions
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Account actions</DropdownMenuLabel>
            <DropdownMenuItem onSelect={() => setEditOpen(true)}>
              <Edit3 className="h-4 w-4 mr-2" /> Edit profile
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => ask({
              title: "Reset PIN?",
              description: "User will be forced to set a new transaction PIN on their next login.",
              cta: "Reset PIN",
              onConfirm: () => toast.success("PIN reset queued. User will set up a new PIN on next login."),
            })}>
              <KeyRound className="h-4 w-4 mr-2" /> Reset PIN
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => ask({
              title: "Reset 2FA?",
              description: "Removes the user's TOTP/SMS factor. They'll be prompted to set up 2FA again.",
              cta: "Reset 2FA",
              onConfirm: () => toast.success("2FA reset for user."),
            })}>
              <ShieldAlert className="h-4 w-4 mr-2" /> Reset 2FA
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => ask({
              title: "Force logout all sessions?",
              description: "Revokes every active session and refresh token across all devices.",
              cta: "Force logout",
              onConfirm: () => toast.success("All sessions revoked."),
            })}>
              <LogOutIcon className="h-4 w-4 mr-2" /> Force logout
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => ask({
              title: "Re-trigger KYC?",
              description: "Resets KYC state and prompts the user to re-submit their selfie and documents.",
              cta: "Re-trigger KYC",
              onConfirm: () => toast.success("KYC re-trigger queued."),
            })}>
              <RefreshCw className="h-4 w-4 mr-2" /> Re-trigger KYC
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {status !== "frozen" ? (
              <DropdownMenuItem
                className="text-warning-foreground focus:text-warning-foreground"
                onSelect={() => ask({
                  title: "Freeze account?",
                  description: "Blocks all financial endpoints. The user can still log in but cannot transact.",
                  cta: "Freeze account",
                  danger: true,
                  onConfirm: () => toast.success("Account frozen."),
                })}>
                <Lock className="h-4 w-4 mr-2" /> Freeze account
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onSelect={() => ask({
                title: "Unfreeze account?",
                description: "Restores the user's ability to transact.",
                cta: "Unfreeze",
                onConfirm: () => toast.success("Account unfrozen."),
              })}>
                <Lock className="h-4 w-4 mr-2" /> Unfreeze account
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onSelect={() => ask({
                title: "Close account?",
                description: "Soft-deletes the account and retains the ledger for compliance. This cannot be undone via the console.",
                cta: "Close account",
                danger: true,
                onConfirm: () => {
                  toast.success("Account closed.");
                  navigate({ to: "/users" });
                },
              })}>
              <UserX className="h-4 w-4 mr-2" /> Close account
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Reason dialog */}
      <AlertDialog open={reasonOpen !== null} onOpenChange={(o) => !o && setReasonOpen(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{reasonOpen?.title}</AlertDialogTitle>
            <AlertDialogDescription>{reasonOpen?.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2">
            <Label htmlFor="reason">Reason (audit log)</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why are you taking this action?"
              rows={3}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={reason.trim().length < 4}
              className={reasonOpen?.danger ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
              onClick={() => {
                reasonOpen?.onConfirm(reason);
                setReasonOpen(null);
              }}
            >
              {reasonOpen?.cta}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Send message */}
      <Dialog open={messageOpen} onOpenChange={setMessageOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send message</DialogTitle>
            <DialogDescription>Sent to user {userId} via push, email and SMS.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Subject</Label>
              <Input placeholder="Subject line" />
            </div>
            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea rows={5} placeholder="Write your message…" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMessageOpen(false)}>Cancel</Button>
            <Button onClick={() => { toast.success("Message sent."); setMessageOpen(false); }}>Send</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit profile (gated) */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>
              Post-KYC profile fields are read-only. Request a profile-unlock workflow from Compliance to edit.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Close</Button>
            <Button onClick={() => { toast.success("Profile-unlock request sent to Compliance."); setEditOpen(false); }}>
              Request unlock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
