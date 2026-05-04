import React, { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { ChevronDown } from "lucide-react";

interface FormSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  actions?: React.ReactNode;
}

export function FormSection({ title, children, defaultOpen = true, actions }: FormSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOpenSection = (event: Event) => {
      const target = (event as CustomEvent<{ target?: HTMLElement | null }>).detail?.target;
      if (target && sectionRef.current?.contains(target)) {
        setIsOpen(true);
      }
    };

    window.addEventListener("admin:open-section", handleOpenSection as EventListener);
    return () => window.removeEventListener("admin:open-section", handleOpenSection as EventListener);
  }, []);

  return (
    <div
      ref={sectionRef}
      data-admin-search-section="true"
      data-admin-search-title={title}
      className="overflow-hidden rounded-lg border border-slate-200 bg-white/70"
    >
      <div
        className={`flex items-center justify-between gap-3 px-3 py-2.5 transition-colors ${
          isOpen ? "bg-earth-50/70" : "hover:bg-slate-50"
        }`}
      >
        <button
          type="button"
          onClick={() => setIsOpen((value) => !value)}
          aria-expanded={isOpen}
          className="flex flex-1 items-center justify-between gap-4 text-left"
        >
          <h4 className="text-sm font-bold text-slate-800">{title}</h4>
          <div
            className={`rounded-md p-1.5 transition-all duration-300 ${
              isOpen ? "rotate-180 bg-earth-100 text-earth-700" : "text-slate-400"
            }`}
          >
            <ChevronDown size={16} />
          </div>
        </button>
        {actions}
      </div>

      <motion.div
        initial={false}
        animate={isOpen ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
        aria-hidden={!isOpen}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="overflow-hidden border-t border-slate-100"
      >
        <div className={`space-y-3 p-3 ${isOpen ? "visible" : "pointer-events-none invisible"}`}>
          {children}
        </div>
      </motion.div>
    </div>
  );
}
