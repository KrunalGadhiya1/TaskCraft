
import { cn } from "../../lib/cn";
import { motion, type HTMLMotionProps } from "framer-motion";

type Variant = "primary" | "ghost";
type Size = "sm" | "md";

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: HTMLMotionProps<"button"> & { variant?: Variant; size?: Size }) {
  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -1 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition",
        "focus:outline-none focus:ring-2 focus:ring-violet-400/40 focus:ring-offset-0 disabled:opacity-50 disabled:pointer-events-none",
        variant === "primary" &&
          "bg-gradient-to-b from-violet-500/90 to-indigo-600/90 text-white shadow-[0_12px_40px_rgba(79,70,229,0.25)] hover:from-violet-500 hover:to-indigo-600",
        variant === "ghost" && "bg-white/5 text-white hover:bg-white/10 border border-white/10",
        size === "sm" && "h-9 px-3",
        size === "md" && "h-10 px-4",
        className,
      )}
      {...props}
    />
  );
}

