import * as React from "react";
import { clsx } from "clsx";

export interface LedProps extends React.HTMLAttributes<HTMLSpanElement> {
  kind?: "live" | "off" | "warn";
}

export function Led({ kind = "live", className, ...props }: LedProps) {
  return (
    <span
      className={clsx(
        "inline-block size-2 rounded-full",
        kind === "live" && "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse",
        kind === "warn" && "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]",
        kind === "off" && "bg-gray-600",
        className
      )}
      {...props}
    />
  );
}
