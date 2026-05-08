import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft,
  Check,
  Copy,
  RefreshCw,
  Settings2,
  X,
  Plus,
  QrCode,
  Smartphone,
  Mail,
  Trash2,
  Zap,
  ChevronRight,
} from "lucide-react";
import { esims, esimStatusMeta, dataPct, type Esim } from "@/lib/esims";

export const Route = createFileRoute("/_app/esims/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `eSIM · ${params.id} · BazePay` },
      { name: "description", content: "View eSIM data, install QR, top up, and manage subscription." },
    ],
  }),
  loader: ({ params }) => {
    const e = esims.find((x) => x.id === params.id);
    if (!e) throw notFound();
    return { esim: e };
  },
  notFoundComponent: () => (
    <div className="min-h-full flex flex-col items-center justify-center p-6 text-center">
      <p className="text-sm text-foreground/60">eSIM not found.</p>
      <Link to="/esims" className="mt-4 text-sm font-bold text-primary">
        Back to My eSIMs
      </Link>
    </div>
  ),
  component: EsimDetail,
});

function EsimDetail() {
  const { esim } = Route.useLoaderData();
  const navigate = useNavigate();
  const [copied, setCopied] = useState<string | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [showInstall, setShowInstall] = useState(false);
  const [showManage, setShowManage] = useState(false);
  const [autoRenew, setAutoRenew] = useState(esim.autoRenew);

  const copy = (text: string, key: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(key);
        setTimeout(() => setCopied(null), 1400);
      });
    }
  };

  const s = esimStatusMeta(esim.status);
  const pct = dataPct(esim);
  const unlimited = esim.dataTotalGb < 0;
  const usedLabel = unlimited ? "Unlimited" : `${esim.dataUsedGb.toFixed(1)} / ${esim.dataTotalGb} GB`;

  return (
    <div className="min-h-full bg-background text-foreground flex flex-col">
      <div className="h-10" />
      <div className="px-6 pt-2 flex items-center justify-between">
        <button
          onClick={() => navigate({ to: "/esims" })}
          className="w-10 h-10 rounded-full bg-card text-card-foreground flex items-center justify-center"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <button
          onClick={() => setShowManage(true)}
          className="w-10 h-10 rounded-full bg-card text-card-foreground flex items-center justify-center"
          aria-label="Manage"
        >
          <Settings2 className="w-5 h-5" />
        </button>
      </div>

      {/* Header */}
      <div className="px-6 pt-5">
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-foreground/55">
          <span className="text-base">{esim.flag}</span>
          {esim.region}
        </div>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight">{esim.label}</h1>
        <div className="mt-2 flex items-center gap-2 text-[11px] text-foreground/55">
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${s.className}`}>
            {s.label}
          </span>
          <span>·</span>
          <span>{esim.planName}</span>
        </div>
      </div>

      {/* Usage card */}
      <div className="flex-1 mt-6 bg-card text-card-foreground rounded-t-[2rem] px-6 pt-6 pb-28">
        <div className="rounded-2xl bg-card-foreground/[0.04] p-5">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-wider text-card-foreground/55">Data</p>
            <p className="text-[11px] text-card-foreground/55 tabular-nums">{usedLabel}</p>
          </div>
          {!unlimited && (
            <div className="mt-3 h-2 rounded-full bg-card-foreground/[0.08] overflow-hidden">
              <div
                className="h-full rounded-full bg-service-esim transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          )}
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-card-foreground/50">Days left</p>
              <p className="font-display font-bold text-2xl tabular-nums mt-1">
                {esim.status === "expired" ? "—" : esim.daysLeft}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-card-foreground/50">Network</p>
              <p className="font-display font-bold text-base mt-1">{esim.network}</p>
            </div>
          </div>
        </div>

        {/* Primary actions */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Link
            to="/pay/esim"
            search={{ topup: esim.id } as never}
            className="h-12 rounded-full bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-1.5 active:scale-[0.99] transition"
          >
            <Zap className="w-4 h-4" /> Top up
          </Link>
          <button
            onClick={() => setShowQR(true)}
            className="h-12 rounded-full bg-card-foreground/[0.06] font-bold text-sm flex items-center justify-center gap-1.5 active:scale-[0.99] transition"
          >
            <QrCode className="w-4 h-4" /> View QR
          </button>
        </div>

        {/* Detail rows */}
        <div className="mt-5 rounded-2xl bg-card-foreground/[0.04] divide-y divide-card-foreground/[0.06] overflow-hidden">
          <button
            onClick={() => setShowInstall(true)}
            className="w-full flex items-center gap-3 px-4 py-3.5 active:bg-card-foreground/[0.06]"
          >
            <div className="w-9 h-9 rounded-xl bg-service-esim/15 text-service-esim flex items-center justify-center">
              <Smartphone className="w-4 h-4" />
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-semibold">Install instructions</p>
              <p className="text-[11px] text-card-foreground/55 truncate">
                {esim.installedOn ? `Installed on ${esim.installedOn}` : "Not installed yet"}
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-card-foreground/40" />
          </button>
          <button
            onClick={() => copy(esim.iccid, "iccid")}
            className="w-full flex items-center gap-3 px-4 py-3.5 active:bg-card-foreground/[0.06]"
          >
            <div className="w-9 h-9 rounded-xl bg-card-foreground/[0.06] flex items-center justify-center">
              <span className="text-[10px] font-bold">ID</span>
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-semibold">ICCID</p>
              <p className="text-[11px] text-card-foreground/55 tabular-nums truncate">{esim.iccid}</p>
            </div>
            <span className="text-[11px] font-bold text-primary inline-flex items-center gap-1">
              {copied === "iccid" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied === "iccid" ? "Copied" : "Copy"}
            </span>
          </button>
          <div className="flex items-center gap-3 px-4 py-3.5">
            <div className="w-9 h-9 rounded-xl bg-card-foreground/[0.06] flex items-center justify-center">
              <Mail className="w-4 h-4 text-card-foreground/60" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">Receipt sent to</p>
              <p className="text-[11px] text-card-foreground/55 truncate">{esim.email}</p>
            </div>
          </div>
        </div>
      </div>

      {showQR && <QRSheet esim={esim} onClose={() => setShowQR(false)} onCopy={copy} copied={copied} />}
      {showInstall && <InstallSheet onClose={() => setShowInstall(false)} />}
      {showManage && (
        <ManageSheet
          esim={esim}
          autoRenew={autoRenew}
          onToggle={() => setAutoRenew((v) => !v)}
          onClose={() => setShowManage(false)}
        />
      )}
    </div>
  );
}

function QRSheet({
  esim,
  onClose,
  onCopy,
  copied,
}: {
  esim: Esim;
  onClose: () => void;
  onCopy: (t: string, k: string) => void;
  copied: string | null;
}) {
  return (
    <div className="fixed inset-0 z-[80] flex items-end">
      <button onClick={onClose} className="absolute inset-0 bg-black/70 backdrop-blur-sm" aria-label="Close" />
      <div className="relative w-full bg-card text-card-foreground rounded-t-[2rem] pt-3 pb-8 animate-in slide-in-from-bottom duration-300">
        <div className="w-10 h-1 rounded-full bg-card-foreground/15 mx-auto" />
        <div className="px-6 mt-4 flex items-center justify-between">
          <h3 className="font-display font-bold text-lg">Install QR</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-card-foreground/[0.06] flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-6 mt-4">
          <div className="rounded-3xl bg-white p-6 flex items-center justify-center">
            <FakeQR text={esim.qrPayload} />
          </div>
          <p className="text-[11px] text-card-foreground/55 mt-3 text-center">
            Scan with another device's camera to install.
          </p>

          <div className="mt-5 space-y-2">
            <CopyRow label="SM-DP+ Address" value={esim.smdp} k="smdp" onCopy={onCopy} copied={copied} />
            <CopyRow label="Activation Code" value={esim.activationCode} k="ac" onCopy={onCopy} copied={copied} />
          </div>
        </div>
      </div>
    </div>
  );
}

function CopyRow({
  label,
  value,
  k,
  onCopy,
  copied,
}: {
  label: string;
  value: string;
  k: string;
  onCopy: (t: string, k: string) => void;
  copied: string | null;
}) {
  return (
    <button
      onClick={() => onCopy(value, k)}
      className="w-full rounded-2xl bg-card-foreground/[0.04] px-4 py-3 flex items-center justify-between active:scale-[0.99] transition"
    >
      <div className="text-left min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider text-card-foreground/55">{label}</p>
        <p className="text-sm font-mono mt-0.5 truncate">{value}</p>
      </div>
      <span className="text-[11px] font-bold text-primary inline-flex items-center gap-1 shrink-0 ml-3">
        {copied === k ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
        {copied === k ? "Copied" : "Copy"}
      </span>
    </button>
  );
}

function FakeQR({ text }: { text: string }) {
  // Deterministic pseudo-QR pattern from the activation code
  const size = 21;
  const cells: boolean[] = [];
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) >>> 0;
  for (let i = 0; i < size * size; i++) {
    h = (h * 1103515245 + 12345) >>> 0;
    cells.push((h & 1) === 1);
  }
  // Force finder patterns at corners
  const finder = (r: number, c: number) => {
    const inBox = (rr: number, cc: number) => rr >= r && rr < r + 7 && cc >= c && cc < c + 7;
    const onBorder = (rr: number, cc: number) =>
      rr === r || rr === r + 6 || cc === c || cc === c + 6 ||
      (rr >= r + 2 && rr <= r + 4 && cc >= c + 2 && cc <= c + 4);
    for (let rr = 0; rr < size; rr++) {
      for (let cc = 0; cc < size; cc++) {
        if (inBox(rr, cc)) cells[rr * size + cc] = onBorder(rr, cc);
      }
    }
  };
  finder(0, 0);
  finder(0, size - 7);
  finder(size - 7, 0);
  return (
    <div
      className="grid"
      style={{ gridTemplateColumns: `repeat(${size}, 1fr)`, width: 220, height: 220 }}
    >
      {cells.map((on, i) => (
        <div key={i} style={{ background: on ? "#000" : "transparent" }} />
      ))}
    </div>
  );
}

function InstallSheet({ onClose }: { onClose: () => void }) {
  const steps = [
    { os: "iPhone", lines: ["Open Settings → Cellular / Mobile Data", "Tap Add eSIM → Use QR Code", "Scan the QR or paste the activation code", "Label as Travel and turn on data roaming"] },
    { os: "Android", lines: ["Open Settings → Network & internet → SIMs", "Tap Add eSIM → Download a SIM instead", "Scan the QR or enter the code manually", "Set as preferred for mobile data abroad"] },
  ];
  return (
    <div className="fixed inset-0 z-[80] flex items-end">
      <button onClick={onClose} className="absolute inset-0 bg-black/70 backdrop-blur-sm" aria-label="Close" />
      <div className="relative w-full bg-card text-card-foreground rounded-t-[2rem] pt-3 pb-8 animate-in slide-in-from-bottom duration-300 max-h-[85vh] overflow-y-auto">
        <div className="w-10 h-1 rounded-full bg-card-foreground/15 mx-auto" />
        <div className="px-6 mt-4 flex items-center justify-between">
          <h3 className="font-display font-bold text-lg">Install instructions</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-card-foreground/[0.06] flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-6 mt-4 space-y-4">
          {steps.map((g) => (
            <div key={g.os} className="rounded-2xl bg-card-foreground/[0.04] p-4">
              <p className="font-display font-bold text-base">{g.os}</p>
              <ol className="mt-2 space-y-2">
                {g.lines.map((l, i) => (
                  <li key={i} className="flex gap-3 text-[12px] leading-relaxed">
                    <span className="shrink-0 w-5 h-5 rounded-full bg-card-foreground/[0.08] flex items-center justify-center text-[10px] font-bold">
                      {i + 1}
                    </span>
                    <span className="text-card-foreground/75">{l}</span>
                  </li>
                ))}
              </ol>
            </div>
          ))}
          <p className="text-[11px] text-card-foreground/50 text-center">
            Phone must be unlocked and eSIM-compatible. Most iPhones (XS+) and recent Pixel/Samsung devices work.
          </p>
        </div>
      </div>
    </div>
  );
}

function ManageSheet({
  esim,
  autoRenew,
  onToggle,
  onClose,
}: {
  esim: Esim;
  autoRenew: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[80] flex items-end">
      <button onClick={onClose} className="absolute inset-0 bg-black/70 backdrop-blur-sm" aria-label="Close" />
      <div className="relative w-full bg-card text-card-foreground rounded-t-[2rem] pt-3 pb-8 animate-in slide-in-from-bottom duration-300">
        <div className="w-10 h-1 rounded-full bg-card-foreground/15 mx-auto" />
        <div className="px-6 mt-4 flex items-center justify-between">
          <h3 className="font-display font-bold text-lg">Manage eSIM</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-card-foreground/[0.06] flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mx-6 mt-4 rounded-2xl bg-card-foreground/[0.04] p-4">
          <p className="text-[11px] text-card-foreground/55">{esim.label}</p>
          <p className="font-display font-bold text-base mt-0.5">{esim.planName}</p>
        </div>

        <button
          onClick={onToggle}
          className="mx-6 mt-3 rounded-2xl bg-card-foreground/[0.04] p-4 w-[calc(100%-3rem)] flex items-center justify-between active:scale-[0.99] transition"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-service-esim/15 text-service-esim flex items-center justify-center">
              <RefreshCw className="w-4 h-4" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-sm">Auto-renew</p>
              <p className="text-[11px] text-card-foreground/55">Top up the same plan automatically</p>
            </div>
          </div>
          <div className={`w-11 h-6 rounded-full transition relative ${autoRenew ? "bg-primary" : "bg-card-foreground/[0.12]"}`}>
            <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${autoRenew ? "left-[22px]" : "left-0.5"}`} />
          </div>
        </button>

        <div className="px-6 mt-4 space-y-2">
          <Link
            to="/pay/esim"
            search={{ topup: esim.id } as never}
            className="w-full h-12 rounded-full bg-card-foreground/[0.06] font-bold text-sm flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" /> Top up data
          </Link>
          <button className="w-full h-12 rounded-full bg-destructive/10 text-destructive font-bold text-sm flex items-center justify-center gap-2">
            <Trash2 className="w-4 h-4" />
            Remove eSIM
          </button>
        </div>
      </div>
    </div>
  );
}
