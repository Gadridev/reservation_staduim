import { useState } from "react";

const CHIPS = ["Near me", "5-a-side", "7-a-side", "11-a-side", "Floodlights", "Indoor", "4.5★ and up"];

export function FilterChips() {
  const [active, setActive] = useState("Near me");

  return (
    <div className="flex flex-wrap gap-2.5">
      {CHIPS.map((chip) => {
        const isActive = chip === active;
        return (
          <button
            key={chip}
            type="button"
            onClick={() => setActive(chip)}
            className={`rounded-full border px-3.5 py-2 text-[13px] font-semibold transition-colors ${
              isActive
                ? "border-amber bg-amber text-pitch-dark"
                : "border-white/15 bg-white/5 text-cream/85 hover:bg-white/10"
            }`}
          >
            {chip}
          </button>
        );
      })}
    </div>
  );
}
