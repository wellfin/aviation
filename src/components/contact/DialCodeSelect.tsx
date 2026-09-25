"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { cn, flagEmoji } from "@/lib/utils";

export const DIAL_CODES = [
  { country: "IN", code: "+91" },
  { country: "GB", code: "+44" },
  { country: "US", code: "+1" },
  { country: "AE", code: "+971" },
  { country: "SA", code: "+966" },
  { country: "QA", code: "+974" },
  { country: "SG", code: "+65" },
  { country: "AU", code: "+61" },
  { country: "DE", code: "+49" },
  { country: "FR", code: "+33" },
  { country: "CH", code: "+41" },
  { country: "NL", code: "+31" },
  { country: "ZA", code: "+27" },
  { country: "MX", code: "+52" },
  { country: "BR", code: "+55" },
  { country: "JP", code: "+81" },
] as const;

/**
 * Country dial-code picker (flag + code + chevron) that sits beside a phone input.
 * A transparent native select overlays the visual so it stays keyboard and screen-reader friendly.
 * Submits the code itself, e.g. "+91".
 */
export function DialCodeSelect({ name = "dialCode", id, className }: { name?: string; id: string; className?: string }) {
  const [index, setIndex] = useState(0);
  const current = DIAL_CODES[index];
  return (
    <div className={cn("relative flex h-12 w-[126px] shrink-0 items-center gap-3 rounded-xl border border-brand/20 bg-white pr-3 pl-2.5 focus-within:border-brand focus-within:ring-3 focus-within:ring-brand/15", className)}>
      <span className="text-[22px] leading-none" aria-hidden>
        {flagEmoji(current.country)}
      </span>
      <span className="flex-1 text-[15px] text-subtle" aria-hidden>
        {current.code}
      </span>
      <ChevronDown className="size-3.5 text-subtle" aria-hidden />
      <label htmlFor={id} className="sr-only">
        Country dialling code
      </label>
      <select
        id={id}
        name={name}
        value={current.code}
        onChange={(e) => setIndex(Math.max(0, DIAL_CODES.findIndex((d) => d.code === e.target.value)))}
        className="absolute inset-0 cursor-pointer opacity-0"
      >
        {DIAL_CODES.map((d) => (
          <option key={d.country} value={d.code}>
            {flagEmoji(d.country)} {d.country} {d.code}
          </option>
        ))}
      </select>
    </div>
  );
}
