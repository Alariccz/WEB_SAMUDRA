import * as React from "react";
import { clsx } from "clsx";

export interface SurfaceProps extends React.HTMLAttributes<HTMLElement> {
  as?: React.ElementType;
  material?: "flat" | "raise" | "sunken";
  radius?: "none" | "card" | "full";
}

export const Surface = React.forwardRef<HTMLElement, SurfaceProps>(
  function Surface(
    { as: Comp = "div", material = "raise", radius = "card", className, ...props },
    ref
  ) {
    return (
      <Comp
        ref={ref}
        className={clsx(
          "relative overflow-hidden transition-all duration-300",
          radius === "card" && "rounded-2xl",
          material === "raise" && "bg-[#0b101b] border border-white/10 shadow-2xl",
          className
        )}
        {...props}
      />
    );
  }
);
