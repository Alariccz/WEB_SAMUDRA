import * as React from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Bookmark,
  BookOpen,
  Calendar,
  Clock,
  Layers,
  Sparkles,
  Tag,
  type LucideProps,
} from "lucide-react";
import { cn } from "@/lib/utils";

const LUCIDE_ICON_MAP: Record<string, React.ComponentType<LucideProps>> = {
  Bookmark,
  Clock,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Sparkles,
  Calendar,
  Tag,
  Layers,
};

export interface IconPlaceholderProps extends Omit<LucideProps, "ref"> {
  lucide?: string;
  tabler?: string;
  hugeicons?: string;
  phosphor?: string;
  remixicon?: string;
  "data-icon"?: string;
}

export function IconPlaceholder({
  lucide = "Bookmark",
  tabler: _tabler,
  hugeicons: _hugeicons,
  phosphor: _phosphor,
  remixicon: _remixicon,
  className,
  size = 16,
  ...props
}: IconPlaceholderProps) {
  const Icon = LUCIDE_ICON_MAP[lucide] ?? Bookmark;

  return (
    <Icon
      size={size}
      aria-hidden="true"
      className={cn("blog3-icon shrink-0", className)}
      {...props}
    />
  );
}
