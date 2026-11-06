import * as React from "react";
import { clsx } from "clsx";

export interface WellProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "field" | "sunken";
}

export const Well = React.forwardRef<HTMLDivElement, WellProps>(
  function Well({ variant = "field", className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={clsx(
          "relative overflow-hidden bg-[#040812] border border-white/5",
          className
        )}
        {...props}
      />
    );
  }
);
