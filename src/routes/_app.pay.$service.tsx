import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { networks, dataPlans, discos, tvPackages, bettingPlatforms } from "@/lib/mock";
import { BottomSheet, SuccessView } from "./_app.wallet";

export const Route = createFileRoute("/pay/$service")({
  component: ServicePage,
});

const titles: Record<string, string> = {
  airtime: "Buy airtime",
  data: "Buy data",
  electricity: "Pay electricity",
  tv: "Cable TV",
  betting: "Fund betting account",
};

function ServicePage() {
  const { service } = Route.useParams();
  const nav = useNavigate();
  const [showSuccess, setShowSuccess] = useState(false);
  const [provider, setProvider] = useState(
    service === "airtime" || service === "data"
      ? networks[0].name
      : service === "electricity"
      ? discos[0]
      : service === "tv"
      ? "DStv"
      : bettingPlatforms[0],
  );
  const [amount, setAmount] = useState("5000");
  const [ref, setRef] = useState(service === "tv" ? "7012345678" : service === "electricity" ? "0123456789" : "+234 803 555 0142");
  const [plan, setPlan] = useState(dataPlans[1].id);
  const [pkg, setPkg] = useState(tvPackages[0].id);

  return (
    <div className="min-h-full">
      <header className="px-6 pt-12 pb-4 flex items-center gap-4">
        <Link to="/pay" className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="font-display font-bold text-lg">{titles[service] || service}</h1>
      </header>

      <div className="px-6 space-y-4">
        {(service === "airtime" || service === "data") && (
          <div>
            <label className="text-xs text-muted-foreground">Network</label>
            <div className="flex gap-2 mt-2">
              {networks.map((n) => (
                <button
                  key={n.id}
                  onClick={() => setProvider(n.name)}
                  className={`flex-1 py-3 rounded-2xl border-2 text-xs font-bold ${
                    provider === n.name ? "border-primary bg-primary/5" : "border-border bg-card"
                  }`}
                  style={{ color: n.color }}
                >
                  {n.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {service === "electricity" && (
          <SelectField label="Disco" value={provider} onChange={setProvider} options={discos} />
        )}
        {service === "tv" && (
          <SelectField label="Provider" value={provider} onChange={setProvider} options={["DStv", "GOTV", "Startimes"]} />
        )}
        {service === "betting" && (
          <SelectField label="Platform" value={provider} onChange={setProvider} options={bettingPlatforms} />
        )}

        <div>
          <label className="text-xs text-muted-foreground">
            {service === "airtime" || service === "data" ? "Phone number" : service === "electricity" ? "Meter number" : service === "tv" ? "IUC / Smartcard" : "User ID"}
          </label>
          <Input value={ref} onChange={(e) => setRef(e.target.value)} className="h-12 rounded-2xl mt-1" />
        </div>

        {service === "data" && (
          <div>
            <label className="text-xs text-muted-foreground">Plan</label>
            <div className="space-y-2 mt-2">
              {dataPlans.map((p) => (
                <button
                  key={p.id}
                  onClick={() => { setPlan(p.id); setAmount(String(p.price)); }}
                  className={`w-full p-4 rounded-2xl border-2 flex items-center justify-between text-left ${
                    plan === p.id ? "border-primary bg-primary/5" : "border-border bg-card"
                  }`}
                >
                  <div>
                    <p className="font-semibold">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.validity}</p>
                  </div>
                  <p className="font-bold">₦{p.price.toLocaleString()}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {service === "tv" && (
          <div>
            <label className="text-xs text-muted-foreground">Package</label>
            <div className="space-y-2 mt-2">
              {tvPackages.filter((p) => p.provider === provider || provider === "DStv" && p.provider === "DStv").map((p) => (
                <button
                  key={p.id}
                  onClick={() => { setPkg(p.id); setAmount(String(p.price)); }}
                  className={`w-full p-4 rounded-2xl border-2 flex items-center justify-between text-left ${
                    pkg === p.id ? "border-primary bg-primary/5" : "border-border bg-card"
                  }`}
                >
                  <p className="font-semibold">{p.provider} {p.name}</p>
                  <p className="font-bold">₦{p.price.toLocaleString()}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {(service === "airtime" || service === "electricity" || service === "betting") && (
          <div>
            <label className="text-xs text-muted-foreground">Amount (₦)</label>
            <Input value={amount} onChange={(e) => setAmount(e.target.value)} className="h-14 text-xl font-bold rounded-2xl mt-1" />
            <div className="flex gap-2 mt-2">
              {["1000", "2000", "5000", "10000"].map((a) => (
                <button key={a} onClick={() => setAmount(a)} className="flex-1 py-2 rounded-xl bg-muted text-xs font-semibold">
                  ₦{Number(a).toLocaleString()}
                </button>
              ))}
            </div>
          </div>
        )}

        <Button onClick={() => setShowSuccess(true)} className="w-full h-12 bg-primary text-primary-foreground rounded-2xl font-semibold mt-6">
          Pay ₦{Number(amount).toLocaleString()}
        </Button>
      </div>

      <BottomSheet open={showSuccess} onClose={() => nav({ to: "/pay" })} title="Payment successful">
        <SuccessView title="Done!" subtitle={`${titles[service]} of ₦${Number(amount).toLocaleString()} completed`} onDone={() => nav({ to: "/home" })} />
      </BottomSheet>
    </div>
  );
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div>
      <label className="text-xs text-muted-foreground">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full mt-1 h-12 px-3 rounded-2xl bg-muted border border-border">
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
    </div>
  );
}
