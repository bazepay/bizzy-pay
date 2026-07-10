import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { physicalSettings, type PhysicalSettings } from "@/lib/cards-data";
import { toast } from "sonner";

export const Route = createFileRoute("/_admin/cards/physical-settings")({
  component: PhysicalSettingsPage,
});

function PhysicalSettingsPage() {
  const [s, setS] = useState<PhysicalSettings>(physicalSettings);
  const set = <K extends keyof PhysicalSettings>(k: K, v: PhysicalSettings[K]) => setS((p) => ({ ...p, [k]: v }));

  const save = () => toast.success("Physical card settings saved");

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="shadow-card">
          <CardHeader><CardTitle className="text-base">Fees</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <NumberField label="Issuance fee (₦)" value={s.issuanceFeeNgn} onChange={(v) => set("issuanceFeeNgn", v)} />
            <NumberField label="Replacement fee (₦)" value={s.replacementFeeNgn} onChange={(v) => set("replacementFeeNgn", v)} />
            <NumberField label="Express shipping surcharge (₦)" value={s.expressShippingFeeNgn} onChange={(v) => set("expressShippingFeeNgn", v)} />
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader><CardTitle className="text-base">Eligibility & limits</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>Auto-approve at KYC tier</Label>
              <Select value={s.autoApproveKycTier} onValueChange={(v: PhysicalSettings["autoApproveKycTier"]) => set("autoApproveKycTier", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="tier1">Tier 1 (basic)</SelectItem>
                  <SelectItem value="tier2">Tier 2 (ID verified)</SelectItem>
                  <SelectItem value="tier3">Tier 3 (fully verified)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground mt-1">Requests below this tier require manual approval.</p>
            </div>
            <NumberField label="Max active cards per user" value={s.maxRequestsPerUser} onChange={(v) => set("maxRequestsPerUser", v)} />
            <NumberField label="Activation window (days)" value={s.activationWindowDays} onChange={(v) => set("activationWindowDays", v)} />
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader><CardTitle className="text-base">SLA</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <NumberField label="Production SLA (days)" value={s.productionSlaDays} onChange={(v) => set("productionSlaDays", v)} />
            <NumberField label="Shipping SLA (days)" value={s.shippingSlaDays} onChange={(v) => set("shippingSlaDays", v)} />
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader><CardTitle className="text-base">Delivery controls</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <ToggleRow label="Require address verification" desc="Ask user to confirm via OTP + document match" value={s.requireAddressVerification} onChange={(v) => set("requireAddressVerification", v)} />
            <ToggleRow label="Require photo ID on delivery" desc="Courier must confirm government ID matches user" value={s.requireIdOnDelivery} onChange={(v) => set("requireIdOnDelivery", v)} />
            <ToggleRow label="Allow PO Box addresses" value={s.allowPoBox} onChange={(v) => set("allowPoBox", v)} />
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-card">
        <CardHeader><CardTitle className="text-base">Couriers</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {s.couriers.map((c, i) => (
            <div key={c.name} className="flex items-center justify-between rounded-md border p-3">
              <div>
                <div className="text-sm font-medium">{c.name}</div>
                <div className="text-xs text-muted-foreground">Zones: {c.zones.join(", ")}</div>
              </div>
              <Switch checked={c.enabled} onCheckedChange={(v) => set("couriers", s.couriers.map((x, j) => j === i ? { ...x, enabled: v } : x))} />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader><CardTitle className="text-base">Card designs</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {s.designs.map((d, i) => (
            <div key={d.id} className="flex items-center justify-between rounded-md border p-3">
              <div>
                <div className="text-sm font-medium">{d.name}</div>
                <div className="text-xs text-muted-foreground flex items-center gap-2">
                  <span className="font-mono">{d.id}</span>
                  {d.tierRequired === "gold" && <Badge variant="outline" className="text-[10px]">Gold tier only</Badge>}
                </div>
              </div>
              <Switch checked={d.enabled} onCheckedChange={(v) => set("designs", s.designs.map((x, j) => j === i ? { ...x, enabled: v } : x))} />
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={save}><Save className="h-4 w-4 mr-1.5" /> Save settings</Button>
      </div>
    </motion.div>
  );
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <Label>{label}</Label>
      <Input type="number" value={value} onChange={(e) => onChange(Number(e.target.value) || 0)} />
    </div>
  );
}

function ToggleRow({ label, desc, value, onChange }: { label: string; desc?: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between rounded-md border p-3">
      <div>
        <div className="text-sm">{label}</div>
        {desc && <div className="text-xs text-muted-foreground">{desc}</div>}
      </div>
      <Switch checked={value} onCheckedChange={onChange} />
    </div>
  );
}
