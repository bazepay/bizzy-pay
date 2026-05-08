import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, Download, Plus, Filter, Users as UsersIcon, ShieldCheck, AlertTriangle, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  fmtNgn, fmtNum,
} from "@/lib/mock-data";
import {
  users, tierLabel, statusTone, riskTone, fmtRelative, type AccountStatus, type Country, type KycTier,
} from "@/lib/users-data";

export const Route = createFileRoute("/_admin/users/")({
  head: () => ({
    meta: [
      { title: "Users — BazePay Admin" },
      { name: "description", content: "Search, filter and manage all customer accounts." },
    ],
  }),
  component: UsersDirectory,
});

function UsersDirectory() {
  const [q, setQ] = useState("");
  const [tier, setTier] = useState<string>("any");
  const [status, setStatus] = useState<string>("any");
  const [country, setCountry] = useState<string>("any");
  const [page, setPage] = useState(0);
  const pageSize = 12;

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return users.filter((u) => {
      if (needle) {
        const hay = `${u.name} ${u.email} ${u.phone} ${u.id} ${u.bvnLast4 ?? ""} ${u.ninLast4 ?? ""}`.toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      if (tier !== "any" && String(u.kycTier) !== tier) return false;
      if (status !== "any" && u.status !== status) return false;
      if (country !== "any" && u.country !== country) return false;
      return true;
    });
  }, [q, tier, status, country]);

  const paged = filtered.slice(page * pageSize, (page + 1) * pageSize);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  const totals = useMemo(() => {
    const active = users.filter((u) => u.status === "active").length;
    const frozen = users.filter((u) => u.status === "frozen").length;
    const verified = users.filter((u) => u.kycTier > 0).length;
    const ltv = users.reduce((s, u) => s + u.ltvNgn, 0);
    return { active, frozen, verified, ltv };
  }, []);

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-5">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-end justify-between flex-wrap gap-3"
      >
        <div>
          <h1 className="font-display text-2xl font-bold">Users</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {fmtNum(filtered.length)} of {fmtNum(users.length)} accounts
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-3.5 w-3.5 mr-1.5" />
            Export
          </Button>
          <Button size="sm" className="bg-primary text-primary-foreground">
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Invite user
          </Button>
        </div>
      </motion.div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiTile label="Active accounts" value={fmtNum(totals.active)} icon={UsersIcon} tone="success" />
        <KpiTile label="KYC verified" value={fmtNum(totals.verified)} icon={ShieldCheck} tone="primary" />
        <KpiTile label="Frozen" value={fmtNum(totals.frozen)} icon={AlertTriangle} tone="warning" />
        <KpiTile label="Lifetime volume" value={fmtNgn(totals.ltv)} icon={TrendingUp} tone="gold" />
      </div>

      {/* Filters */}
      <Card className="shadow-card">
        <CardContent className="p-4 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => { setQ(e.target.value); setPage(0); }}
              placeholder="Name, email, phone, user-id, BVN/NIN last 4…"
              className="pl-9"
            />
          </div>

          <FilterSelect label="KYC tier" value={tier} onChange={(v) => { setTier(v); setPage(0); }}
            options={[
              { value: "any", label: "Any tier" },
              { value: "0", label: "Unverified" },
              { value: "1", label: "Tier 1" },
              { value: "2", label: "Tier 2" },
              { value: "3", label: "Tier 3" },
            ]}
          />
          <FilterSelect label="Status" value={status} onChange={(v) => { setStatus(v); setPage(0); }}
            options={[
              { value: "any", label: "Any status" },
              { value: "active", label: "Active" },
              { value: "frozen", label: "Frozen" },
              { value: "closed", label: "Closed" },
              { value: "pending", label: "Pending" },
            ]}
          />
          <FilterSelect label="Country" value={country} onChange={(v) => { setCountry(v); setPage(0); }}
            options={[
              { value: "any", label: "All countries" },
              { value: "NG", label: "Nigeria" },
              { value: "GH", label: "Ghana" },
              { value: "KE", label: "Kenya" },
              { value: "ZA", label: "South Africa" },
              { value: "UK", label: "United Kingdom" },
              { value: "US", label: "United States" },
            ]}
          />

          {(q || tier !== "any" || status !== "any" || country !== "any") && (
            <Button variant="ghost" size="sm" onClick={() => { setQ(""); setTier("any"); setStatus("any"); setCountry("any"); setPage(0); }}>
              <Filter className="h-3.5 w-3.5 mr-1.5" />
              Clear
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="shadow-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead>User</TableHead>
              <TableHead>KYC</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Risk</TableHead>
              <TableHead className="text-right">Lifetime value</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>Last active</TableHead>
              <TableHead>Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paged.map((u) => (
              <TableRow key={u.id} className="cursor-pointer">
                <TableCell className="py-3">
                  <Link to="/users/$id" params={{ id: u.id }} className="flex items-center gap-3 group">
                    <div
                      className="h-9 w-9 rounded-full flex items-center justify-center text-xs font-semibold text-primary-foreground shrink-0"
                      style={{ backgroundColor: `oklch(0.45 0.15 ${u.avatarHue})` }}
                    >
                      {u.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium group-hover:text-primary transition truncate">{u.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{u.email} · <span className="font-mono">{u.id}</span></div>
                    </div>
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">{tierLabel(u.kycTier)}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={`text-xs capitalize ${statusTone[u.status]}`}>{u.status}</Badge>
                </TableCell>
                <TableCell className={`text-right font-mono text-sm ${riskTone(u.riskScore)}`}>{u.riskScore}</TableCell>
                <TableCell className="text-right font-mono text-sm">{fmtNgn(u.ltvNgn)}</TableCell>
                <TableCell className="text-sm">{u.country}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{fmtRelative(u.lastActiveAt)}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{new Date(u.signupAt).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
            {paged.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-muted-foreground text-sm">
                  No users match the current filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <div className="flex items-center justify-between p-3 border-t bg-muted/20">
          <div className="text-xs text-muted-foreground">
            Page {page + 1} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>Previous</Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}>Next</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

function KpiTile({ label, value, icon: Icon, tone }: { label: string; value: string; icon: typeof UsersIcon; tone: "success" | "primary" | "warning" | "gold" }) {
  const toneBg = {
    success: "bg-success/15 text-success",
    primary: "bg-primary/10 text-primary",
    warning: "bg-warning/20 text-warning-foreground",
    gold: "bg-gold/15 text-gold-foreground",
  }[tone];
  return (
    <Card className="shadow-card">
      <CardContent className="p-4 flex items-center gap-3">
        <div className={`h-10 w-10 rounded-md flex items-center justify-center ${toneBg}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <div className="text-xs text-muted-foreground">{label}</div>
          <div className="font-display text-lg font-bold tracking-tight truncate">{value}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function FilterSelect({
  value, onChange, options,
}: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[160px] h-9">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
