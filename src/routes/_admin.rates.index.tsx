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
import { RefreshCcw, Save, TrendingUp, Plug, CheckCircle2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_admin/rates/")({
  component: ExchangeRatesPage,
});

type Cur = { code: string; name: string; flag: string; usdRate: number; markupBps: number; enabled: boolean };

const SEED: Cur[] = [
  { code: "USD", name: "US Dollar", flag: "🇺🇸", usdRate: 1.0000, markupBps: 0, enabled: true },
  { code: "EUR", name: "Euro", flag: "🇪🇺", usdRate: 1.0940, markupBps: 75, enabled: true },
  { code: "GBP", name: "British Pound", flag: "🇬🇧", usdRate: 1.2812, markupBps: 75, enabled: true },
  { code: "GHS", name: "Ghanaian Cedi", flag: "🇬🇭", usdRate: 0.0670, markupBps: 100, enabled: true },
  { code: "KES", name: "Kenyan Shilling", flag: "🇰🇪", usdRate: 0.0078, markupBps: 100, enabled: true },
  { code: "ZAR", name: "South African Rand", flag: "🇿🇦", usdRate: 0.0540, markupBps: 100, enabled: true },
  { code: "CAD", name: "Canadian Dollar", flag: "🇨🇦", usdRate: 0.7320, markupBps: 75, enabled: false },
];

const PROVIDERS = ["OpenExchangeRates", "ExchangeRate-API", "Fixer.io", "CurrencyLayer", "Manual"];

function ExchangeRatesPage() {
  // Base USD/NGN — drives the entire system
  const [usdNgn, setUsdNgn] = useState(1547.20);
  const [draftUsdNgn, setDraftUsdNgn] = useState("1547.20");
  const [buyMarkup, setBuyMarkup] = useState(150); // bps
  const [sellMarkup, setSellMarkup] = useState(150);
  const [provider, setProvider] = useState("OpenExchangeRates");
  const [apiKey, setApiKey] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [intervalMin, setIntervalMin] = useState(15);
  const [lastSync, setLastSync] = useState(new Date());
  const [currencies, setCurrencies] = useState<Cur[]>(SEED);

  const buyRate = +(usdNgn * (1 + buyMarkup / 10000)).toFixed(2);
  const sellRate = +(usdNgn * (1 - sellMarkup / 10000)).toFixed(2);

  const saveUsdNgn = () => {
    const v = parseFloat(draftUsdNgn);
    if (!v || v <= 0) { toast.error("Invalid rate"); return; }
    setUsdNgn(v);
    toast.success(`USD/NGN updated to ₦${v.toLocaleString()}`);
  };

  const refreshFeed = () => {
    setCurrencies((cs) => cs.map((c) => c.code === "USD" ? c : ({
      ...c,
      usdRate: +(c.usdRate * (1 + (Math.random() - 0.5) * 0.004)).toFixed(4),
    })));
    setLastSync(new Date());
    toast.success(`Rates pulled from ${provider}`);
  };

  const updateCurrency = (code: string, patch: Partial<Cur>) => {
    setCurrencies((cs) => cs.map((c) => c.code === code ? { ...c, ...patch } : c));
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      {/* Base USD/NGN card */}
      <Card className="shadow-card border-primary/30">
        <CardContent className="p-5 space-y-4">
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px] uppercase border-primary/40 text-primary">Base pair</Badge>
                <h2 className="font-display text-lg font-bold">USD → NGN</h2>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                The single source of truth. All foreign currencies convert via USD, then to NGN.
              </p>
            </div>
            <div className="text-right">
              <div className="text-[11px] text-muted-foreground uppercase tracking-wider">Live mid-rate</div>
              <div className="font-display text-3xl font-bold">₦{usdNgn.toLocaleString("en-NG", { minimumFractionDigits: 2 })}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <Label className="text-xs">Mid rate (NGN per USD)</Label>
              <div className="flex gap-2 mt-1">
                <Input type="number" step="0.01" value={draftUsdNgn} onChange={(e) => setDraftUsdNgn(e.target.value)} className="font-mono" />
                <Button size="sm" onClick={saveUsdNgn}><Save className="h-3.5 w-3.5 mr-1.5" />Set</Button>
              </div>
            </div>
            <div>
              <Label className="text-xs">Buy markup (bps)</Label>
              <Input type="number" value={buyMarkup} onChange={(e) => setBuyMarkup(parseInt(e.target.value) || 0)} className="font-mono mt-1" />
              <div className="text-[11px] text-muted-foreground mt-1">User pays: <span className="font-mono text-foreground">₦{buyRate.toLocaleString()}</span> / USD</div>
            </div>
            <div>
              <Label className="text-xs">Sell markup (bps)</Label>
              <Input type="number" value={sellMarkup} onChange={(e) => setSellMarkup(parseInt(e.target.value) || 0)} className="font-mono mt-1" />
              <div className="text-[11px] text-muted-foreground mt-1">User receives: <span className="font-mono text-foreground">₦{sellRate.toLocaleString()}</span> / USD</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API provider */}
      <Card className="shadow-card">
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Plug className="h-4 w-4 text-primary" />
              <h3 className="font-semibold">Exchange rate API</h3>
              <Badge variant="outline" className="text-[10px] bg-success/10 text-success border-success/30">
                <CheckCircle2 className="h-3 w-3 mr-1" /> Connected
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Last sync · {lastSync.toLocaleTimeString()}</span>
              <Button size="sm" variant="outline" onClick={refreshFeed}>
                <RefreshCcw className="h-3.5 w-3.5 mr-1.5" /> Pull now
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <Label className="text-xs">Provider</Label>
              <Select value={provider} onValueChange={setProvider}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PROVIDERS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Label className="text-xs">API key</Label>
              <Input type="password" placeholder="Enter API key" value={apiKey} onChange={(e) => setApiKey(e.target.value)} className="font-mono mt-1" />
            </div>
            <div>
              <Label className="text-xs">Refresh every (min)</Label>
              <Input type="number" value={intervalMin} onChange={(e) => setIntervalMin(parseInt(e.target.value) || 15)} className="font-mono mt-1" />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-md border border-border p-3">
            <div>
              <div className="text-sm font-medium">Auto-refresh</div>
              <div className="text-[11px] text-muted-foreground">Pull foreign currency → USD rates on schedule</div>
            </div>
            <Switch checked={autoRefresh} onCheckedChange={setAutoRefresh} />
          </div>

          <div className="rounded-md border border-warning/40 bg-warning/10 px-3 py-2 flex items-center gap-2 text-xs">
            <AlertTriangle className="h-3.5 w-3.5 text-warning shrink-0" />
            <span>USD/NGN is set <span className="font-semibold">manually</span> above. The API only fetches USD-denominated cross-rates (EUR/USD, GBP/USD, etc.).</span>
          </div>
        </CardContent>
      </Card>

      {/* Currency table */}
      <Card className="shadow-card overflow-hidden">
        <CardContent className="p-5 pb-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Foreign currencies</h3>
              <p className="text-xs text-muted-foreground">Each currency converts to USD via API, then to NGN at the base rate.</p>
            </div>
          </div>
        </CardContent>
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead>Currency</TableHead>
              <TableHead>1 unit → USD</TableHead>
              <TableHead>1 unit → NGN</TableHead>
              <TableHead>Markup (bps)</TableHead>
              <TableHead>Effective NGN</TableHead>
              <TableHead>Enabled</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currencies.map((c) => {
              const ngn = +(c.usdRate * usdNgn).toFixed(2);
              const eff = +(ngn * (1 + c.markupBps / 10000)).toFixed(2);
              return (
                <TableRow key={c.code}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{c.flag}</span>
                      <div>
                        <div className="font-mono font-semibold text-sm">{c.code}</div>
                        <div className="text-[11px] text-muted-foreground">{c.name}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {c.code === "USD" ? (
                      <span className="font-mono text-muted-foreground">1.0000</span>
                    ) : (
                      <Input
                        type="number" step="0.0001"
                        value={c.usdRate}
                        onChange={(e) => updateCurrency(c.code, { usdRate: parseFloat(e.target.value) || 0 })}
                        className="h-8 w-28 font-mono text-xs"
                      />
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-sm">₦{ngn.toLocaleString()}</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={c.markupBps}
                      onChange={(e) => updateCurrency(c.code, { markupBps: parseInt(e.target.value) || 0 })}
                      className="h-8 w-24 font-mono text-xs"
                    />
                  </TableCell>
                  <TableCell className="font-mono text-sm font-semibold flex items-center gap-1">
                    <TrendingUp className="h-3.5 w-3.5 text-primary" />
                    ₦{eff.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Switch checked={c.enabled} onCheckedChange={(v) => updateCurrency(c.code, { enabled: v })} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        <div className="p-4 border-t flex justify-end">
          <Button size="sm" onClick={() => toast.success("Currency settings saved")}>
            <Save className="h-3.5 w-3.5 mr-1.5" /> Save changes
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}
