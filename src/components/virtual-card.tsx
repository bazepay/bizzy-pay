import { Eye, EyeOff, Snowflake } from "lucide-react";
import type { VirtualCard } from "@/lib/cards";
import { maskPan } from "@/lib/cards";

export function VirtualCardArt({
  card,
  revealed = false,
  size = "md",
}: {
  card: VirtualCard;
  revealed?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const padding = size === "sm" ? "p-4" : size === "lg" ? "p-6" : "p-5";
  const titleSize = size === "lg" ? "text-base" : "text-[12px]";
  const panSize = size === "lg" ? "text-xl" : "text-base";

  return (
    <div
      className={`relative aspect-[1.586/1] w-full rounded-3xl overflow-hidden ${padding} text-white shadow-[0_20px_60px_-20px_rgba(0,0,0,0.5)]`}
      style={{
        background: `linear-gradient(135deg, ${card.gradient.from} 0%, ${card.gradient.to} 100%)`,
      }}
    >
      <div
        className="absolute -top-12 -right-12 w-48 h-48 rounded-full opacity-30 blur-3xl"
        style={{ background: "oklch(0.82 0.16 85)" }}
      />
      <div
        className="absolute -bottom-16 -left-10 w-44 h-44 rounded-full opacity-25 blur-3xl"
        style={{ background: "#fff" }}
      />

      {card.status === "frozen" && (
        <div className="absolute inset-0 backdrop-blur-[2px] bg-black/20 flex items-center justify-center z-10">
          <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider">
            <Snowflake className="w-3.5 h-3.5" /> Frozen
          </div>
        </div>
      )}

      <div className="relative h-full flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div>
            <p className={`font-bold uppercase tracking-[0.18em] opacity-75 ${titleSize}`}>
              {card.label}
            </p>
            <p className="text-[10px] opacity-60 mt-0.5">{card.currency} · Virtual</p>
          </div>
          <div className="w-10 h-7 rounded-md bg-gradient-to-br from-amber-200 to-amber-500 opacity-90" />
        </div>

        <div>
          <p className={`font-mono font-semibold tabular-nums tracking-wider ${panSize}`}>
            {revealed ? card.pan : maskPan(card.pan)}
          </p>
          <div className="mt-3 flex items-end justify-between">
            <div>
              <p className="text-[8px] opacity-55 uppercase tracking-wider">Cardholder</p>
              <p className="text-[11px] font-bold tracking-wide">{card.holder}</p>
            </div>
            <div>
              <p className="text-[8px] opacity-55 uppercase tracking-wider">Expires</p>
              <p className="text-[11px] font-bold tabular-nums">
                {revealed ? card.expiry : "••/••"}
              </p>
            </div>
            <p className="font-display text-base italic font-bold tracking-tight">
              {card.brand}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function RevealToggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="h-10 px-4 rounded-full bg-card-foreground/[0.06] text-sm font-bold flex items-center gap-1.5 active:scale-[0.98] transition"
    >
      {on ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      {on ? "Hide" : "Reveal"}
    </button>
  );
}
