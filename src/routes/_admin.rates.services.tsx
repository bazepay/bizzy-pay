import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Save, Phone, Wifi, Tv, Zap, GraduationCap, Smartphone, Hash } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_admin/rates/services")({
  component: ServiceFeesPage,
});

type FeeType = "percent" | "flat" | "discount";

type Service = {
  id: string;
  category: string;
  name: string;
  icon: typeof Phone;
  feeType: FeeType;
  value: number;          // % or NGN
  capNgn: number | null;  // cap when percent
  minNgn: number;
  enabled: boolean;
};

const SEED: Service[] = [
  { id: "airtime", category: "Telco", name: "Airtime top-up", icon: Phone, feeType: "discount", value: 3, capNgn: null, minNgn: 50, enabled: true },
  { id: "data", category: "Telco", name: "Mobile data", icon: Wifi, feeType: "discount", value: 4, capNgn: null, minNgn: 100, enabled: true },
  { id: "cable", category: "TV", name: "Cable TV (DStv, GOtv, StarTimes)", icon: Tv, feeType: "flat", value: 100, capNgn: null, minNgn: 1000, enabled: true },
  { id: "electricity", category: "Utility", name: "Electricity bills", icon: Zap, feeType: "flat", value: 100, capNgn: null, minNgn: 500, enabled: true },
  { id: "education", category: "Utility", name: "Education / WAEC / JAMB", icon: GraduationCap, feeType: "flat", value: 200, capNgn: null, minNgn: 1000, enabled: true },
  { id: "esim", category: "Connectivity", name: "eSIM data plans", icon: Smartphone, feeType: "percent", value: 5, capNgn: 5000, minNgn: 0, enabled: true },
  { id: "vnumber", category: "Connectivity", name: "Virtual numbers", icon: Hash, feeType: "percent", value: 8, capNgn: 10000, minNgn: 0, enabled: true },
];

function ServiceFeesPage() {
  const [items, setItems] = useState<Service[]>(SEED);

  const update = (id: string, patch: Partial<Service>) => {
    setItems((xs) => xs.map((x) => x.id === id ? { ...x, ...patch } : x));
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Stat label="Active services" value={items.filter((i) => i.enabled).length} sub={`of ${items.length}`} />
        <Stat label="Avg discount (telco)" value="3.5%" sub="Airtime + data" />
        <Stat label="Avg flat fee" value="₦133" sub="Bills & utilities" />
      </div>

      <Card className="shadow-card overflow-hidden">
        <CardContent className="p-5 pb-3 flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Service-level pricing</h3>
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold">Discount</span> = give back % to user · <span className="font-semibold">Flat</span> = fixed NGN added · <span className="font-semibold">Percent</span> = % of amount with optional cap.
            </p>
          </div>
        </CardContent>
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead>Service</TableHead>
              <TableHead>Fee type</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Cap (₦)</TableHead>
              <TableHead>Min txn (₦)</TableHead>
              <TableHead>Enabled</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((s) => {
              const Icon = s.icon;
              return (
                <TableRow key={s.id}>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">{s.name}</div>
                        <div className="text-[11px] text-muted-foreground">{s.category}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select value={s.feeType} onValueChange={(v) => update(s.id, { feeType: v as FeeType })}>
                      <SelectTrigger className="h-8 w-32"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percent">Percent (%)</SelectItem>
                        <SelectItem value="flat">Flat (₦)</SelectItem>
                        <SelectItem value="discount">Discount (%)</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Input type="number" step="0.01" value={s.value}
                        onChange={(e) => update(s.id, { value: parseFloat(e.target.value) || 0 })}
                        className="h-8 w-24 font-mono text-xs" />
                      <span className="text-[11px] text-muted-foreground">{s.feeType === "flat" ? "₦" : "%"}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Input type="number" value={s.capNgn ?? ""} placeholder="—"
                      disabled={s.feeType === "flat"}
                      onChange={(e) => update(s.id, { capNgn: e.target.value ? parseInt(e.target.value) : null })}
                      className="h-8 w-24 font-mono text-xs" />
                  </TableCell>
                  <TableCell>
                    <Input type="number" value={s.minNgn}
                      onChange={(e) => update(s.id, { minNgn: parseInt(e.target.value) || 0 })}
                      className="h-8 w-24 font-mono text-xs" />
                  </TableCell>
                  <TableCell>
                    <Switch checked={s.enabled} onCheckedChange={(v) => update(s.id, { enabled: v })} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        <div className="p-4 border-t flex justify-end">
          <Button size="sm" onClick={() => toast.success("Service fees saved")}>
            <Save className="h-3.5 w-3.5 mr-1.5" /> Save all
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="font-display text-2xl font-bold tracking-tight">{value}</div>
        {sub && <div className="text-[11px] text-muted-foreground mt-0.5">{sub}</div>}
      </CardContent>
    </Card>
  );
}
