import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, QrCode, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { esimCountries, esimPlans } from "@/lib/mock";

export const Route = createFileRoute("/esim")({
  component: EsimPage,
});

function EsimPage() {
  const [country, setCountry] = useState(esimCountries[0]);
  const [plan, setPlan] = useState(esimPlans[1]);
  const [step, setStep] = useState<"browse" | "checkout" | "qr">("browse");
  const nav = useNavigate();

  return (
    <div className="min-h-full bg-background">
      <header className="px-6 pt-12 pb-4 flex items-center gap-4">
        <button
          onClick={() => (step === "browse" ? nav({ to: "/home" }) : setStep(step === "qr" ? "checkout" : "browse"))}
          className="w-10 h-10 rounded-full bg-muted flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-display font-bold text-lg">eSIM</h1>
      </header>

      {step === "browse" && (
        <div className="px-6 space-y-6">
          <p className="text-sm text-muted-foreground">Stay connected the moment you land.</p>

          <div>
            <label className="text-xs text-muted-foreground">Destination</label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {esimCountries.map((c) => (
                <button
                  key={c.code}
                  onClick={() => setCountry(c)}
                  className={`p-3 rounded-2xl border-2 flex flex-col items-center gap-1 ${
                    country.code === c.code ? "border-primary bg-primary/5" : "border-border bg-card"
                  }`}
                >
                  <span className="text-2xl">{c.flag}</span>
                  <span className="text-[10px] font-semibold">{c.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground">Plans for {country.name}</label>
            <div className="space-y-2 mt-2">
              {esimPlans.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPlan(p)}
                  className={`w-full p-4 rounded-2xl border-2 flex items-center justify-between text-left ${
                    plan.id === p.id ? "border-primary bg-primary/5" : "border-border bg-card"
                  }`}
                >
                  <div>
                    <p className="font-bold">{p.data}</p>
                    <p className="text-xs text-muted-foreground">{p.validity}</p>
                  </div>
                  <p className="font-bold">${p.price}</p>
                </button>
              ))}
            </div>
          </div>

          <Button onClick={() => setStep("checkout")} className="w-full h-12 bg-primary text-primary-foreground rounded-2xl font-semibold">
            Continue
          </Button>
        </div>
      )}

      {step === "checkout" && (
        <div className="px-6 space-y-4">
          <div className="bg-gradient-hero text-white rounded-3xl p-5 shadow-card">
            <p className="text-xs uppercase tracking-widest text-white/60">Order summary</p>
            <p className="text-3xl font-display font-bold mt-2">{country.flag} {plan.data}</p>
            <p className="text-sm text-white/70 mt-1">{country.name} • {plan.validity}</p>
            <div className="flex justify-between mt-4 pt-4 border-t border-white/15">
              <span className="text-sm">Total</span>
              <span className="font-bold">${plan.price}</span>
            </div>
          </div>
          <div className="bg-card rounded-2xl p-4">
            <p className="text-xs text-muted-foreground">Pay with</p>
            <p className="font-semibold mt-1">BazePay Wallet · USD $1,248.40</p>
          </div>
          <Button onClick={() => setStep("qr")} className="w-full h-12 bg-primary text-primary-foreground rounded-2xl font-semibold">
            Pay ${plan.price}
          </Button>
        </div>
      )}

      {step === "qr" && (
        <div className="px-6 flex flex-col items-center text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }} className="w-16 h-16 rounded-full bg-success/15 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-success" />
          </motion.div>
          <h2 className="mt-4 text-xl font-bold">eSIM ready to install</h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs">Scan this QR with your phone's cellular settings to activate.</p>

          <div className="mt-6 p-6 bg-white rounded-3xl shadow-card">
            <div className="w-48 h-48 grid grid-cols-12 gap-0.5 bg-white">
              {Array.from({ length: 144 }).map((_, i) => (
                <div key={i} className={`aspect-square ${Math.random() > 0.5 ? "bg-black" : "bg-white"}`} />
              ))}
            </div>
          </div>

          <div className="mt-6 w-full bg-card rounded-2xl p-4 text-left text-sm space-y-2">
            <p className="font-semibold">Activation steps</p>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground text-xs">
              <li>Open Settings → Cellular → Add eSIM</li>
              <li>Scan the QR code above</li>
              <li>Set as data plan when you arrive</li>
            </ol>
          </div>

          <Link to="/home" className="mt-6 mb-6 w-full">
            <Button className="w-full h-12 bg-primary text-primary-foreground rounded-2xl font-semibold">Back to home</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
