import * as React from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant =
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"
  | "link";

export type ButtonSize =
  | "default"
  | "xs"
  | "sm"
  | "lg"
  | "icon"
  | "icon-xs"
  | "icon-sm"
  | "icon-lg";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
  render?: React.ReactElement<Record<string, unknown>>;
  nativeButton?: boolean;
}

export function buttonVariants({
  variant = "default",
  size = "default",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}) {
  const variantClasses: Record<ButtonVariant, string> = {
    default: "blog3-btn--default bg-primary text-primary-foreground",
    destructive: "blog3-btn--destructive bg-destructive text-white",
    outline: "blog3-btn--outline border bg-background",
    secondary: "blog3-btn--secondary bg-secondary text-secondary-foreground",
    ghost: "blog3-btn--ghost",
    link: "blog3-btn--link text-primary underline-offset-4",
  };

  const sizeClasses: Record<ButtonSize, string> = {
    default: "blog3-btn--size-default h-9 px-4 py-2",
    xs: "blog3-btn--size-xs h-7 px-2.5 text-xs",
    sm: "blog3-btn--size-sm h-8 rounded-md gap-1.5 px-3 text-xs",
    lg: "blog3-btn--size-lg h-10 rounded-md px-6",
    icon: "blog3-btn--size-icon size-9",
    "icon-xs": "blog3-btn--size-icon-xs size-6",
    "icon-sm": "blog3-btn--size-icon-sm size-8",
    "icon-lg": "blog3-btn--size-icon-lg size-10",
  };

  return cn(
    "blog3-btn inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 shrink-0 outline-none",
    variantClasses[variant],
    sizeClasses[size],
    className
  );
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "default",
      asChild = false,
      render,
      nativeButton: _nativeButton,
      children,
      type = "button",
      ...props
    },
    ref
  ) => {
    const mergedClassName = buttonVariants({ variant, size, className });

    if (render && React.isValidElement(render)) {
      const renderProps = render.props as Record<string, unknown>;
      return React.cloneElement(render, {
        ...props,
        ...renderProps,
        ref,
        "data-slot": "button",
        "data-variant": variant,
        "data-size": size,
        className: cn(mergedClassName, renderProps.className as string | undefined),
        children: renderProps.children ?? children,
      });
    }

    if (asChild && React.isValidElement(children)) {
      const childProps = children.props as Record<string, unknown>;
      return React.cloneElement(
        children as React.ReactElement<Record<string, unknown>>,
        {
          ...props,
          ...childProps,
          ref,
          "data-slot": "button",
          className: cn(mergedClassName, childProps.className as string | undefined),
        }
      );
    }

    return (
      <button
        ref={ref}
        type={type}
        data-slot="button"
        data-variant={variant}
        data-size={size}
        className={mergedClassName}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button };
