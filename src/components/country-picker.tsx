import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Check, X } from "lucide-react";
import { COUNTRIES, DIAL_CODES } from "@/lib/countries";

export function Flag({ code, className = "w-7 h-5" }: { code: string; className?: string }) {
  const lower = code.toLowerCase();
  return (
    <img
      src={`https://flagcdn.com/w80/${lower}.png`}
      srcSet={`https://flagcdn.com/w160/${lower}.png 2x`}
      width={32}
      height={24}
      alt=""
      className={`${className} rounded-[3px] object-cover shadow-sm shrink-0`}
      loading="lazy"
    />
  );
}

export function CountrySheet({
  open,
  onClose,
  value,
  onChange,
}: {
  open: boolean;
  onClose: () => void;
  value: string;
  onChange: (code: string) => void;
}) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter(
      (c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q),
    );
  }, [search]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 z-40 bg-black/70 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            className="absolute inset-x-0 bottom-0 z-50 bg-card text-card-foreground rounded-t-[2rem] flex flex-col max-h-[85%]"
          >
            <div className="pt-3 flex justify-center">
              <div className="h-1 w-10 rounded-full bg-card-foreground/15" />
            </div>
            <div className="px-6 pt-4 pb-3 flex items-center justify-between">
              <h2 className="font-display text-xl font-bold">Select country</h2>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-muted flex items-center justify-center hover:bg-muted/70 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-6 pb-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-card-foreground/40" />
                <input
                  autoFocus
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search country"
                  className="w-full h-12 pl-11 pr-4 rounded-2xl bg-muted text-[14px] text-card-foreground placeholder:text-card-foreground/40 focus:outline-none focus:border-primary/40 border border-transparent"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-3 pb-6">
              {filtered.map((c) => {
                const selected = c.code === value;
                return (
                  <button
                    key={c.code}
                    onClick={() => {
                      onChange(c.code);
                      setSearch("");
                      onClose();
                    }}
                    className={`w-full px-3 py-3 rounded-xl flex items-center gap-3 text-left transition ${
                      selected ? "bg-primary/10" : "hover:bg-muted"
                    }`}
                  >
                    <Flag code={c.code} />
                    <span className="flex-1 text-[14.5px] font-medium">{c.name}</span>
                    <span className="text-[12.5px] text-card-foreground/50">
                      +{DIAL_CODES[c.code] ?? ""}
                    </span>
                    {selected && <Check className="w-4 h-4 text-primary" />}
                  </button>
                );
              })}
              {filtered.length === 0 && (
                <p className="text-center text-[13px] text-card-foreground/50 py-8">
                  No country found
                </p>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
