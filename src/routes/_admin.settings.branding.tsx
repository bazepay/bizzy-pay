import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { RotateCcw, Save, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { initialBrand, type BrandTokens } from "@/lib/settings-data";

export const Route = createFileRoute("/_admin/settings/branding")({
  component: BrandingPage,
});

const STORAGE_KEY = "bz_brand_tokens";

function BrandingPage() {
  const [brand, setBrand] = useState<BrandTokens>(() => {
    if (typeof window === "undefined") return initialBrand;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? { ...initialBrand, ...JSON.parse(raw) } : initialBrand;
    } catch { return initialBrand; }
  });

  const update = <K extends keyof BrandTokens>(key: K, value: BrandTokens[K]) =>
    setBrand((b) => ({ ...b, [key]: value }));

  const save = () => {
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(brand)); } catch {}
    toast.success("Brand tokens saved · will roll out to mobile shell on next launch");
  };
  const reset = () => {
    setBrand(initialBrand);
    try { window.localStorage.removeItem(STORAGE_KEY); } catch {}
    toast.success("Reverted to defaults");
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 space-y-4">
        <Card className="shadow-card">
          <CardContent className="p-4 space-y-3">
            <h2 className="text-sm font-display font-bold">Identity</h2>
            <div className="grid grid-cols-2 gap-3">
              <Field label="App name">
                <Input value={brand.appName} onChange={(e) => update("appName", e.target.value)} />
              </Field>
              <Field label="Logo glyph">
                <Input value={brand.logoUrl} onChange={(e) => update("logoUrl", e.target.value)} maxLength={2} className="font-display" />
              </Field>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-4 space-y-3">
            <h2 className="text-sm font-display font-bold">Color tokens</h2>
            <p className="text-[11px] text-muted-foreground">Use OKLCH (e.g. <code className="font-mono">oklch(0.78 0.16 80)</code>). These flow into both this admin and the mobile shell.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <ColorField label="Primary" value={brand.primary} onChange={(v) => update("primary", v)} />
              <ColorField label="Primary glow" value={brand.primaryGlow} onChange={(v) => update("primaryGlow", v)} />
              <ColorField label="Background" value={brand.background} onChange={(v) => update("background", v)} />
              <ColorField label="Foreground" value={brand.foreground} onChange={(v) => update("foreground", v)} />
              <ColorField label="Accent" value={brand.accent} onChange={(v) => update("accent", v)} />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-4 space-y-3">
            <h2 className="text-sm font-display font-bold">Geometry</h2>
            <Field label={`Corner radius · ${brand.radius}px`}>
              <Slider value={[brand.radius]} min={0} max={28} step={1} onValueChange={(v) => update("radius", v[0])} />
            </Field>
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={reset}>
            <RotateCcw className="h-3.5 w-3.5" /> Reset
          </Button>
          <Button size="sm" className="gap-1.5" onClick={save}>
            <Save className="h-3.5 w-3.5" /> Save changes
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-display font-bold flex items-center gap-2"><Smartphone className="h-4 w-4" /> Live preview</h2>
        <div
          className="mx-auto rounded-[28px] border-4 border-foreground/80 p-3 w-[260px] shadow-elegant overflow-hidden"
          style={{ background: brand.background, color: brand.foreground }}
        >
          <div className="flex items-center justify-between text-[10px] mb-3 opacity-70">
            <span>9:41</span>
            <span>●●● 5G</span>
          </div>
          <div className="flex items-center gap-2 mb-4">
            <div
              className="h-9 w-9 flex items-center justify-center font-display text-base font-bold"
              style={{ background: `linear-gradient(135deg, ${brand.primary}, ${brand.primaryGlow})`, color: brand.background, borderRadius: brand.radius }}
            >
              {brand.logoUrl}
            </div>
            <div>
              <div className="font-display text-sm font-bold">{brand.appName}</div>
              <div className="text-[10px] opacity-60">Wallet</div>
            </div>
          </div>
          <div
            className="p-3 mb-3"
            style={{ background: brand.accent, borderRadius: brand.radius }}
          >
            <div className="text-[10px] opacity-70 uppercase tracking-wider">NGN balance</div>
            <div className="font-display text-xl font-bold">₦248,500</div>
          </div>
          <button
            className="w-full text-xs font-semibold py-2.5"
            style={{ background: `linear-gradient(135deg, ${brand.primary}, ${brand.primaryGlow})`, color: brand.background, borderRadius: brand.radius }}
          >
            Send money
          </button>
          <button
            className="w-full text-xs font-semibold py-2.5 mt-2"
            style={{ background: "transparent", border: `1px solid ${brand.foreground}`, color: brand.foreground, borderRadius: brand.radius }}
          >
            Top up
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <div className="h-9 w-9 rounded-md border border-border shrink-0" style={{ background: value }} />
        <Input value={value} onChange={(e) => onChange(e.target.value)} className="font-mono text-xs" />
      </div>
    </div>
  );
}
