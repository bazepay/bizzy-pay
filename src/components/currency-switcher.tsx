import { useState } from "react";
import { ChevronDown, Check } from "lucide-react";
import { wallets, currencyOrder, type CurrencyCode } from "@/lib/wallets";

export function CurrencySwitcher({
  value,
  onChange,
}: {
  value: CurrencyCode;
  onChange: (c: CurrencyCode) => void;
}) {
  const [open, setOpen] = useState(false);
  const w = wallets[value];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 bg-white/8 border border-white/10 rounded-full px-3 py-1.5 text-xs font-semibold"
      >
        <span className="w-4 h-4 rounded-full" style={{ background: w.gradient }} />
        {value}
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-36 bg-[#16161F] border border-white/10 rounded-2xl p-1.5 shadow-xl z-20">
          {currencyOrder.map((code) => (
            <button
              key={code}
              onClick={() => {
                onChange(code);
                setOpen(false);
              }}
              className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl hover:bg-white/5 text-xs font-semibold"
            >
              <span
                className="w-4 h-4 rounded-full shrink-0"
                style={{ background: wallets[code].gradient }}
              />
              <span className="flex-1 text-left">{code}</span>
              {value === code && <Check className="w-3.5 h-3.5 text-lime" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
