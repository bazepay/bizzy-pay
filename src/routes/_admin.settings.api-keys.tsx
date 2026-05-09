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
import { Search, Plus, RotateCw, Trash2, Copy, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { apiKeys as seed, fmtRelative, type ApiKey, type FlagEnv } from "@/lib/settings-data";

export const Route = createFileRoute("/_admin/settings/api-keys")({
  component: ApiKeysPage,
});

const ENV_TONE: Record<FlagEnv, string> = {
  sandbox: "border-muted-foreground/30 text-muted-foreground",
  staging: "border-warning/40 text-warning",
  prod: "border-destructive/40 text-destructive",
};
const SCOPE_TONE: Record<ApiKey["scope"], string> = {
  read: "border-success/40 text-success",
  write: "border-primary/40 text-primary",
  admin: "border-destructive/40 text-destructive",
};

function ApiKeysPage() {
  const [items, setItems] = useState<ApiKey[]>(seed);
  const [q, setQ] = useState("");
  const [envFilter, setEnvFilter] = useState<"all" | FlagEnv>("all");
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState({ name: "", service: "", scope: "read" as ApiKey["scope"], env: "sandbox" as FlagEnv });
  const [revealed, setRevealed] = useState<{ name: string; secret: string } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<ApiKey | null>(null);

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    return items.filter((k) => {
      if (envFilter !== "all" && k.env !== envFilter) return false;
      if (!term) return true;
      return k.name.toLowerCase().includes(term) || k.service.toLowerCase().includes(term) || k.id.includes(term);
    });
  }, [items, q, envFilter]);

  const genSecret = (env: FlagEnv) => {
    const prefix = env === "prod" ? "live" : env === "staging" ? "stg" : "sbx";
    const body = Array.from({ length: 32 }, () => Math.random().toString(36).charAt(2)).join("");
    return `bz-${prefix}-${body}`;
  };

  const create = () => {
    if (!draft.name.trim() || !draft.service.trim()) { toast.error("Name and service required"); return; }
    const secret = genSecret(draft.env);
    const next: ApiKey = {
      id: `ak_${Math.floor(Math.random() * 900 + 100)}`,
      name: draft.name.trim(),
      service: draft.service.trim(),
      scope: draft.scope,
      env: draft.env,
      masked: `${secret.slice(0, 8)}••••${secret.slice(-4).toUpperCase()}`,
      lastUsedAt: null,
      rotatedAt: new Date().toISOString(),
      createdBy: "You",
    };
    setItems((prev) => [next, ...prev]);
    setCreating(false);
    setDraft({ name: "", service: "", scope: "read", env: "sandbox" });
    setRevealed({ name: next.name, secret });
  };

  const rotate = (k: ApiKey) => {
    const secret = genSecret(k.env);
    setItems((prev) => prev.map((x) => (x.id === k.id
      ? { ...x, masked: `${secret.slice(0, 8)}••••${secret.slice(-4).toUpperCase()}`, rotatedAt: new Date().toISOString(), lastUsedAt: null }
      : x)));
    setRevealed({ name: k.name, secret });
    toast.success(`Rotated ${k.name}`);
  };

  const remove = (k: ApiKey) => {
    setItems((prev) => prev.filter((x) => x.id !== k.id));
    toast.success(`Revoked ${k.name}`);
    setConfirmDelete(null);
  };

  const copy = async (s: string) => {
    try { await navigator.clipboard.writeText(s); toast.success("Copied"); } catch { toast.error("Copy failed"); }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, service or id…" className="pl-8" />
        </div>
        <Select value={envFilter} onValueChange={(v) => setEnvFilter(v as typeof envFilter)}>
          <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All envs</SelectItem>
            <SelectItem value="sandbox">Sandbox</SelectItem>
            <SelectItem value="staging">Staging</SelectItem>
            <SelectItem value="prod">Production</SelectItem>
          </SelectContent>
        </Select>
        <Button size="sm" className="gap-2" onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4" /> New key
        </Button>
      </div>

      <Card className="shadow-card">
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/40 text-muted-foreground">
              <tr className="text-left">
                <th className="px-3 py-2 font-medium">Name</th>
                <th className="px-3 py-2 font-medium">Service</th>
                <th className="px-3 py-2 font-medium">Env</th>
                <th className="px-3 py-2 font-medium">Scope</th>
                <th className="px-3 py-2 font-medium">Key</th>
                <th className="px-3 py-2 font-medium">Last used</th>
                <th className="px-3 py-2 font-medium">Rotated</th>
                <th className="px-3 py-2 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((k) => (
                <tr key={k.id} className="hover:bg-muted/20">
                  <td className="px-3 py-2">
                    <div className="font-medium">{k.name}</div>
                    <div className="text-muted-foreground font-mono text-[10px]">{k.id} · {k.createdBy}</div>
                  </td>
                  <td className="px-3 py-2">{k.service}</td>
                  <td className="px-3 py-2"><Badge variant="outline" className={`text-[10px] uppercase ${ENV_TONE[k.env]}`}>{k.env}</Badge></td>
                  <td className="px-3 py-2"><Badge variant="outline" className={`text-[10px] capitalize ${SCOPE_TONE[k.scope]}`}>{k.scope}</Badge></td>
                  <td className="px-3 py-2 font-mono">{k.masked}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{fmtRelative(k.lastUsedAt)}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{fmtRelative(k.rotatedAt)}</td>
                  <td className="px-3 py-2">
                    <div className="flex justify-end gap-1">
                      <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" onClick={() => rotate(k)}>
                        <RotateCw className="h-3 w-3" /> Rotate
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 text-xs gap-1 text-destructive" onClick={() => setConfirmDelete(k)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={8} className="px-3 py-10 text-center text-muted-foreground">No keys match your filters.</td></tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Create */}
      <Dialog open={creating} onOpenChange={setCreating}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>New API key</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="e.g. NIBSS payouts (prod)" />
            </div>
            <div className="space-y-1.5">
              <Label>Service / partner</Label>
              <Input value={draft.service} onChange={(e) => setDraft({ ...draft, service: e.target.value })} placeholder="e.g. NIBSS, Visa, Termii" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Env</Label>
                <Select value={draft.env} onValueChange={(v) => setDraft({ ...draft, env: v as FlagEnv })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sandbox">Sandbox</SelectItem>
                    <SelectItem value="staging">Staging</SelectItem>
                    <SelectItem value="prod">Production</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Scope</Label>
                <Select value={draft.scope} onValueChange={(v) => setDraft({ ...draft, scope: v as ApiKey["scope"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="read">Read</SelectItem>
                    <SelectItem value="write">Write</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreating(false)}>Cancel</Button>
            <Button onClick={create}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reveal once */}
      <Dialog open={!!revealed} onOpenChange={(o) => !o && setRevealed(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><KeyRound className="h-4 w-4" /> Copy key now</DialogTitle></DialogHeader>
          <p className="text-xs text-muted-foreground">This is the only time the full secret will be shown. Store it in your secret manager.</p>
          {revealed && (
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground">{revealed.name}</div>
              <div className="rounded-md bg-muted p-2 font-mono text-xs break-all">{revealed.secret}</div>
              <Button size="sm" variant="outline" className="gap-1.5 w-full" onClick={() => copy(revealed.secret)}>
                <Copy className="h-3.5 w-3.5" /> Copy to clipboard
              </Button>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setRevealed(null)}>I've saved it</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete */}
      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke {confirmDelete?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This immediately invalidates the key. Any service still using it will fail authentication. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => confirmDelete && remove(confirmDelete)}>Revoke</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
