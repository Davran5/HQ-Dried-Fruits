import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/src/lib/utils";

export interface SelectOption {
    value: string;
    label: string;
    disabled?: boolean;
}

interface SelectProps {
    options: SelectOption[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export function Select({ options, value, onChange, placeholder = "Select an option...", className }: SelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find((opt) => opt.value === value);

    useEffect(() => {
        const handleOutsideClick = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleOutsideClick);
        return () => document.removeEventListener("mousedown", handleOutsideClick);
    }, []);

    return (
        <div className="relative w-full" ref={containerRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "flex w-full items-center justify-between rounded-xl border border-earth-200 bg-earth-50 px-4 py-4 text-left text-earth-900 outline-none transition-all focus:ring-2 focus:ring-earth-500",
                    isOpen ? "ring-2 ring-earth-500 border-earth-500" : "hover:border-earth-300",
                    !selectedOption && "text-earth-500",
                    className
                )}
            >
                <span className="truncate pr-4">{selectedOption ? selectedOption.label : placeholder}</span>
                <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown size={20} className="text-earth-400 shrink-0" />
                </motion.div>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-earth-100 bg-white shadow-xl shadow-earth-900/5"
                    >
                        <div className="max-h-64 overflow-y-auto p-2">
                            {options.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    disabled={option.disabled}
                                    onClick={() => {
                                        if (!option.disabled) {
                                            onChange(option.value);
                                            setIsOpen(false);
                                        }
                                    }}
                                    className={cn(
                                        "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                                        option.disabled ? "cursor-not-allowed text-earth-400 opacity-60" : "hover:bg-earth-50",
                                        value === option.value ? "bg-earth-100 text-earth-900 font-semibold" : "text-earth-700 font-medium"
                                    )}
                                >
                                    <span className="truncate">{option.label}</span>
                                    {value === option.value && <Check size={16} className="text-earth-600 ml-2 shrink-0" />}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
