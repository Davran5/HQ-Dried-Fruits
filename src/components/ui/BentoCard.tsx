import { ReactNode } from "react";
import { motion } from "motion/react";
import { cn } from "@/src/lib/utils";

interface BentoCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function BentoCard({ children, className, delay = 0 }: BentoCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      whileHover={{ y: -5 }}
      className={cn(
        "overflow-hidden rounded-[2.5rem] bg-white p-8 shadow-sm transition-shadow hover:shadow-xl border border-earth-50",
        className
      )}
    >
      {children}
    </motion.div>
  );
}
