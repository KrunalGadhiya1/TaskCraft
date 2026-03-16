import * as React from "react";
import { cn } from "../../lib/cn";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "h-10 w-full rounded-xl px-3 text-sm",
          "bg-white/5 border border-white/10 text-white placeholder:text-white/35",
          "focus:outline-none focus:ring-2 focus:ring-violet-400/30 focus:border-white/20",
          className,
        )}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

