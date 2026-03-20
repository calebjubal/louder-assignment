import * as React from "react";

import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-[152px] w-full rounded-[24px] border border-[#ddd0bc] bg-white/85 px-5 py-4 text-sm leading-7 text-[#22180e] shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] outline-none transition duration-200 placeholder:text-[#8c7e69] focus:border-[#c97726] focus:ring-4 focus:ring-[#f0d5b8]",
        className,
      )}
      {...props}
    />
  );
});

Textarea.displayName = "Textarea";
