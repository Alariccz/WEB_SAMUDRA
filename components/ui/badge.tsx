import * as React from "react";
import { cn } from "@/lib/utils";

export type BadgeVariant =
  | "default"
  | "secondary"
  | "destructive"
  | "outline"
  | "ghost"
  | "link";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function badgeVariants({
  variant = "default",
  className,
}: {
  variant?: BadgeVariant;
  className?: string;
} = {}) {
  const variantClasses: Record<BadgeVariant, string> = {
    default: "blog3-badge--default bg-primary text-primary-foreground border-transparent",
    secondary: "blog3-badge--secondary bg-secondary text-secondary-foreground border-transparent",
    destructive: "blog3-badge--destructive bg-destructive text-white border-transparent",
    outline: "blog3-badge--outline text-foreground border-border",
    ghost: "blog3-badge--ghost border-transparent text-foreground",
    link: "blog3-badge--link border-transparent text-primary underline-offset-4",
  };

  return cn(
    "blog3-badge inline-flex items-center justify-center rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap shrink-0 gap-1.5 transition-[color,box-shadow]",
    variantClasses[variant],
    className
  );
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <span
        ref={ref}
        data-slot="badge"
        data-variant={variant}
        className={badgeVariants({ variant, className })}
        {...props}
      />
    );
  }
);
Badge.displayName = "Badge";

export { Badge };
