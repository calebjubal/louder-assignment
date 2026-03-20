import * as React from "react";

import { cn } from "@/lib/utils";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        "flex h-11 w-full rounded-full border border-[#ddd0bc] bg-white/82 px-4 text-sm text-[#22180e] outline-none transition duration-200 placeholder:text-[#8c7e69] focus:border-[#c97726] focus:ring-4 focus:ring-[#f0d5b8]",
        className,
      )}
      {...props}
    />
  );
});

Input.displayName = "Input";
