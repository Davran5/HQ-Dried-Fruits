import React, { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown } from "lucide-react";

interface FormSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  actions?: React.ReactNode;
}

export function FormSection({ title, children, defaultOpen = true, actions }: FormSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div
        className={`flex items-center justify-between gap-4 px-6 py-4 transition-colors ${
          isOpen ? "bg-earth-50" : "hover:bg-slate-50"
        }`}
      >
        <button
          type="button"
          onClick={() => setIsOpen((value) => !value)}
          className="flex flex-1 items-center justify-between gap-4 text-left"
        >
          <h4 className="text-lg font-bold text-slate-800">{title}</h4>
          <div
            className={`rounded-full p-2 transition-all duration-300 ${
              isOpen ? "rotate-180 bg-earth-200 text-earth-700" : "text-slate-400"
            }`}
          >
            <ChevronDown size={18} />
          </div>
        </button>
        {actions}
      </div>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden border-t border-slate-100"
          >
            <div className="space-y-4 p-6">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
