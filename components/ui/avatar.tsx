import * as React from "react";
import { cn } from "@/lib/utils";

interface AvatarContextValue {
  imageLoaded: boolean;
  setImageLoaded: React.Dispatch<React.SetStateAction<boolean>>;
}

const AvatarContext = React.createContext<AvatarContextValue | null>(null);

const Avatar = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, children, ...props }, ref) => {
  const [imageLoaded, setImageLoaded] = React.useState(false);

  return (
    <AvatarContext.Provider value={{ imageLoaded, setImageLoaded }}>
      <span
        ref={ref}
        data-slot="avatar"
        className={cn(
          "blog3-avatar relative flex size-8 shrink-0 overflow-hidden rounded-full",
          className
        )}
        {...props}
      >
        {children}
      </span>
    </AvatarContext.Provider>
  );
});
Avatar.displayName = "Avatar";

const AvatarImage = React.forwardRef<
  HTMLImageElement,
  React.ImgHTMLAttributes<HTMLImageElement>
>(({ className, src, alt = "", onLoad, onError, ...props }, ref) => {
  const ctx = React.useContext(AvatarContext);
  const [failed, setFailed] = React.useState(false);

  React.useEffect(() => {
    setFailed(false);
    if (!src) {
      ctx?.setImageLoaded(false);
    }
  }, [src]);

  if (!src || failed) {
    return null;
  }

  return (
    <img
      ref={ref}
      src={src}
      alt={alt}
      data-slot="avatar-image"
      className={cn("blog3-avatar-img aspect-square size-full object-cover", className)}
      onLoad={(e) => {
        ctx?.setImageLoaded(true);
        onLoad?.(e);
      }}
      onError={(e) => {
        setFailed(true);
        ctx?.setImageLoaded(false);
        onError?.(e);
      }}
      {...props}
    />
  );
});
AvatarImage.displayName = "AvatarImage";

const AvatarFallback = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => {
  const ctx = React.useContext(AvatarContext);

  if (ctx?.imageLoaded) {
    return null;
  }

  return (
    <span
      ref={ref}
      data-slot="avatar-fallback"
      className={cn(
        "blog3-avatar-fallback bg-muted flex size-full items-center justify-center rounded-full text-xs font-medium",
        className
      )}
      {...props}
    />
  );
});
AvatarFallback.displayName = "AvatarFallback";

export { Avatar, AvatarImage, AvatarFallback };
