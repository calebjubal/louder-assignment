import * as React from "react";

import { cn } from "@/lib/utils";

const badgeVariants = {
  default: "bg-[#20180e] text-white",
  subtle: "bg-white/75 text-[#443625]",
  outline: "border border-[#dccdb4] bg-transparent text-[#57452f]",
  accent: "bg-[#f1d5b6] text-[#8a4a12]",
} as const;

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: keyof typeof badgeVariants;
};

export function Badge({
  className,
  variant = "subtle",
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium tracking-[0.16em] uppercase",
        badgeVariants[variant],
        className,
      )}
      {...props}
    />
  );
}
