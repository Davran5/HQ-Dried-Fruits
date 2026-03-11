import React, { useRef, useState, useEffect } from "react";
import { Upload, Link as LinkIcon, Image as ImageIcon, Library, Loader2, X, Check } from "lucide-react";
import { useMedia } from "@/src/contexts/MediaContext";
import { motion, AnimatePresence } from "motion/react";

interface ImageUploaderProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export function ImageUploader({ label, value, onChange, placeholder }: ImageUploaderProps) {
    const { uploadMedia, images: contextImages, isLoading: contextLoading } = useMedia();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [mode, setMode] = useState<"upload" | "url">("url");
    const [isLibraryOpen, setIsLibraryOpen] = useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            if (file.size > 10 * 1024 * 1024) {
                alert("File too large. Max 10MB.");
                return;
            }
            setIsUploading(true);
            try {
                const dataUrl = await uploadMedia(file);
                onChange(dataUrl);
                setMode("url");
            } catch (err) {
                alert("Upload failed.");
            } finally {
                setIsUploading(false);
            }
        }
    };

    const isInternalImage = (val: string) => {
        return val && (val.startsWith("http") || val.startsWith("data:image") || val.startsWith("/") || val.includes("unsplash.com"));
    };

    return (
        <div className="space-y-3">
            <label className="block text-sm font-bold text-slate-700">{label}</label>            <div className="flex items-start gap-4">
                <div className="relative h-24 w-24 shrink-0 rounded-xl border-2 border-slate-200 bg-slate-50 overflow-hidden shadow-inner flex items-center justify-center">
                    {isInternalImage(value) ? (
                        <img src={value} alt="Preview" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                        <div className="flex flex-col items-center gap-1 text-slate-300">
                            <ImageIcon size={24} />
                            <span className="text-[10px] font-bold uppercase tracking-tighter">No Image</span>
                        </div>
                    )}
                    {isUploading && (
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                            <Loader2 className="animate-spin text-earth-600" size={24} />
                        </div>
                    )}
                </div>

                <div className="flex-1 space-y-3">                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={() => setIsLibraryOpen(true)}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-600 hover:border-earth-400 hover:text-earth-600 transition-all shadow-sm"
                        >
                            <Library size={14} /> Server Library
                        </button>
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-600 hover:border-earth-400 hover:text-earth-600 transition-all shadow-sm"
                        >
                            <Upload size={14} /> {isUploading ? "Uploading..." : "Upload Local"}
                        </button>
                        <button
                            type="button"
                            onClick={() => setMode(mode === "url" ? "upload" : "url")}
                            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all text-xs font-bold shadow-sm border ${mode === "url" ? "bg-earth-50 border-earth-200 text-earth-700" : "bg-white border-slate-200 text-slate-600"}`}
                        >
                            <LinkIcon size={14} /> {mode === "url" ? "URL Mode: ON" : "Switcher"}
                        </button>
                    </div>                    <div className="relative">
                        <input
                            type="text"
                            value={value}
                            onChange={e => onChange(e.target.value)}
                            className="w-full rounded-lg border border-slate-300 pl-4 pr-10 py-2 text-sm text-slate-900 focus:border-earth-500 focus:ring-2 focus:ring-earth-500/10 outline-none transition-all"
                            placeholder={placeholder || "Paste image URL here..."}
                        />
                        {value && (
                            <button
                                type="button"
                                onClick={() => onChange("")}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-red-500 transition-colors"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>
                </div>
            </div>            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
            />            <AnimatePresence>
                {isLibraryOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsLibraryOpen(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-4xl max-h-[80vh] overflow-hidden bg-white rounded-2xl shadow-2xl flex flex-col"
                        >
                            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900">Server Media Library</h3>
                                    <p className="text-xs text-slate-500">Click an image to select it for this field.</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsLibraryOpen(false)}
                                    className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
                                {contextLoading ? (
                                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                                        <Loader2 className="animate-spin text-earth-600 h-10 w-10" />
                                        <p className="text-slate-500 font-medium">Loading assets...</p>
                                    </div>
                                ) : (contextImages || []).length === 0 ? (
                                    <div className="text-center py-20">
                                        <ImageIcon className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                                        <p className="text-slate-500">No images found on server.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                        {contextImages.map((img) => (
                                            <button
                                                type="button"
                                                key={img}
                                                onClick={() => {
                                                    onChange(img);
                                                    setIsLibraryOpen(false);
                                                }}
                                                className={`group relative aspect-square rounded-xl border-2 overflow-hidden transition-all bg-white shadow-sm ${value === img ? "border-earth-500 ring-2 ring-earth-500/20" : "border-transparent hover:border-earth-300"
                                                    }`}
                                            >
                                                <img src={img} alt="Library Item" className="h-full w-full object-cover" />
                                                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <div className="bg-white text-earth-600 rounded-full p-1.5 shadow-lg">
                                                        <Check size={16} strokeWidth={3} />
                                                    </div>
                                                </div>
                                                {value === img && (
                                                    <div className="absolute top-2 right-2 bg-earth-500 text-white rounded-full p-1 shadow-md">
                                                        <Check size={12} strokeWidth={4} />
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="px-6 py-4 border-t border-slate-100 flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => setIsLibraryOpen(false)}
                                    className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
