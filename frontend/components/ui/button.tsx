import * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = {
  default:
    "bg-[#1f1a11] text-white shadow-[0_18px_45px_-28px_rgba(22,16,8,0.95)] hover:-translate-y-0.5 hover:bg-[#2a2318]",
  secondary:
    "bg-[#f5ede0] text-[#20170d] shadow-[0_16px_42px_-32px_rgba(31,24,14,0.55)] hover:-translate-y-0.5 hover:bg-[#efe3d2]",
  outline:
    "border border-[#dbcdb7] bg-white/70 text-[#20170d] hover:-translate-y-0.5 hover:bg-white",
  ghost: "text-[#20170d] hover:bg-white/70",
} as const;

const buttonSizes = {
  default: "h-11 px-5 text-sm",
  sm: "h-9 px-3.5 text-sm",
  lg: "h-12 px-6 text-base",
  icon: "size-10",
} as const;

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof buttonVariants;
  size?: keyof typeof buttonSizes;
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "default",
      type = "button",
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-full font-medium transition duration-200 ease-out disabled:pointer-events-none disabled:translate-y-0 disabled:opacity-55",
          buttonVariants[variant],
          buttonSizes[size],
          className,
        )}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";
