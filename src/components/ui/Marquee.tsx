import { ReactNode } from "react";
import { motion } from "motion/react";
import { cn } from "@/src/lib/utils";

interface MarqueeProps {
  children: ReactNode;
  className?: string;
  speed?: number;
  direction?: "left" | "right";
}

export function Marquee({ children, className, speed = 20, direction = "left" }: MarqueeProps) {
  return (
    <div className={cn("flex w-full overflow-hidden", className)}>
      <motion.div
        className="flex min-w-full shrink-0 gap-4 pr-4"
        animate={{
          x: direction === "left" ? ["0%", "-100%"] : ["-100%", "0%"],
        }}
        transition={{
          duration: speed,
          ease: "linear",
          repeat: Infinity,
        }}
      >
        {children}
      </motion.div>
      <motion.div
        className="flex min-w-full shrink-0 gap-4 pr-4"
        animate={{
          x: direction === "left" ? ["0%", "-100%"] : ["-100%", "0%"],
        }}
        transition={{
          duration: speed,
          ease: "linear",
          repeat: Infinity,
        }}
        aria-hidden="true"
      >
        {children}
      </motion.div>
    </div>
  );
}
