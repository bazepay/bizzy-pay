import { ReactNode } from "react";

/**
 * Phone-frame shell. On wide screens, content is rendered inside a phone
 * silhouette so the prototype feels like a mobile app. On real mobile the
 * frame collapses to full-bleed.
 */
export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[oklch(0.94_0.02_280)] md:py-8">
      <div className="relative w-full md:w-[420px] md:h-[860px] md:rounded-[3rem] md:border-[10px] md:border-black md:shadow-[0_30px_80px_-20px_rgba(20,10,60,0.5)] overflow-hidden bg-background min-h-screen md:min-h-0">
        {/* notch (desktop only) */}
        <div className="hidden md:block absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl z-50" />
        <div className="relative h-full w-full overflow-y-auto no-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
}
