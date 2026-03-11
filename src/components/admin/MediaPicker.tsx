import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Search, Image as ImageIcon, File, Check } from "lucide-react";
import { useMedia } from "@/src/contexts/MediaContext";
import { Button } from "@/src/components/ui/Button";

interface MediaPickerProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (url: string) => void;
    currentValue?: string;
}

export function MediaPicker({ isOpen, onClose, onSelect, currentValue }: MediaPickerProps) {
    const { media, isLoading } = useMedia();
    const [searchQuery, setSearchQuery] = useState("");

    const filteredMedia = media.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSelect = (url: string) => {
        onSelect(url);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                />
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-4xl max-h-[85vh] overflow-hidden bg-white rounded-2xl shadow-2xl flex flex-col"
                >                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 font-display">Media Library</h3>
                            <p className="text-xs text-slate-500">Pick an image from your saved assets.</p>
                        </div>
                        <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors">
                            <X size={20} />
                        </button>
                    </div>                    <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 shrink-0">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search media by name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-earth-500/20 focus:border-earth-500 transition-all"
                            />
                        </div>
                    </div>                    <div className="flex-1 overflow-y-auto p-6 min-h-[300px]">
                        {isLoading ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-earth-500"></div>
                                <p className="text-sm">Loading your library...</p>
                            </div>
                        ) : filteredMedia.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3 py-12">
                                <ImageIcon size={48} className="opacity-20" />
                                <p className="text-sm">{searchQuery ? "No matches found." : "Your media library is empty."}</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {filteredMedia.map((item) => {
                                    const isImage = item.type.startsWith("image/");
                                    const isSelected = currentValue === item.dataUrl;

                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => handleSelect(item.dataUrl)}
                                            className={`group relative aspect-square rounded-xl border-2 transition-all overflow-hidden bg-slate-100 flex flex-col ${isSelected ? "border-earth-500 ring-2 ring-earth-500/20" : "border-transparent hover:border-earth-300"
                                                }`}
                                        >
                                            {isImage ? (
                                                <img src={item.dataUrl} alt={item.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-slate-400">
                                                    <File size={32} />
                                                    <span className="text-[10px] uppercase font-bold tracking-tight">PDF</span>
                                                </div>
                                            )}                                            <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2 text-center">
                                                <p className="text-[10px] text-white font-medium truncate w-full px-1">{item.name}</p>
                                                {isSelected && (
                                                    <div className="mt-1 h-6 w-6 rounded-full bg-earth-500 flex items-center justify-center text-white">
                                                        <Check size={14} strokeWidth={3} />
                                                    </div>
                                                )}
                                            </div>

                                            {isSelected && (
                                                <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-earth-500 flex items-center justify-center text-white shadow-md">
                                                    <Check size={12} strokeWidth={3} />
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>                    <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3 shrink-0">
                        <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
