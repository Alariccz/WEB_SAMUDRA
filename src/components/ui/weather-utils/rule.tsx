import * as React from "react";
import { clsx } from "clsx";

export interface RuleProps extends React.HTMLAttributes<HTMLHRElement> {
  orientation?: "horizontal" | "vertical";
}

export function Rule({ orientation = "horizontal", className, ...props }: RuleProps) {
  return (
    <hr
      className={clsx(
        "border-0 border-white/10",
        orientation === "horizontal" ? "w-full border-t my-2" : "h-full border-l mx-2",
        className
      )}
      {...props}
    />
  );
}
