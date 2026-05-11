import React, { useRef, useState } from "react";
import { Upload, Link as LinkIcon, Image as ImageIcon, Library, Loader2, X, Check, RefreshCw, Move } from "lucide-react";
import { useMedia } from "@/src/contexts/MediaContext";
import { motion, AnimatePresence } from "motion/react";
import { getImageObjectPosition, getImagePosition, getImageUrl, withImagePosition } from "@/src/lib/imagePosition";

interface ImageUploaderProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export function ImageUploader({ label: rawLabel, value, onChange, placeholder }: ImageUploaderProps) {
    const label = `${rawLabel} - Shared across all languages`;
    const { uploadMedia, images: contextImages, isLoading: contextLoading, refreshMedia } = useMedia();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [mode, setMode] = useState<"upload" | "url">("url");
    const [isLibraryOpen, setIsLibraryOpen] = useState(false);
    const [isPositionOpen, setIsPositionOpen] = useState(false);
    const position = getImagePosition(value);
    const previewUrl = getImageUrl(value);

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
                onChange(withImagePosition(dataUrl, position));
                setMode("url");
            } catch (err) {
                alert("Upload failed.");
            } finally {
                setIsUploading(false);
            }
        }
    };

    const updatePosition = (axis: "x" | "y", nextValue: number) => {
        onChange(withImagePosition(value, { ...position, [axis]: nextValue }));
    };

    const handleUrlChange = (nextValue: string) => {
        onChange(nextValue);
    };

    const isInternalImage = (val: string) => {
        const cleanValue = getImageUrl(val);
        return cleanValue && (cleanValue.startsWith("http") || cleanValue.startsWith("data:image") || cleanValue.startsWith("/") || cleanValue.includes("unsplash.com"));
    };

    return (
        <div className="space-y-2.5" data-shared-media-field="true">
            <label className="block text-sm font-bold text-slate-700">{label}</label>            <div className="flex items-start gap-4">
                <div className="relative h-24 w-24 shrink-0 rounded-xl border-2 border-slate-200 bg-slate-50 overflow-hidden shadow-inner flex items-center justify-center">
                    {isInternalImage(value) ? (
                        <img
                            src={previewUrl}
                            alt="Preview"
                            className="h-full w-full object-cover"
                            style={{ objectPosition: getImageObjectPosition(value) }}
                            referrerPolicy="no-referrer"
                        />
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
                        {isInternalImage(value) && (
                            <button
                                type="button"
                                onClick={() => setIsPositionOpen(true)}
                                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-earth-50 border border-earth-200 text-xs font-bold text-earth-700 hover:border-earth-400 hover:text-earth-900 transition-all shadow-sm"
                            >
                                <Move size={14} /> Position Image
                            </button>
                        )}
                    </div>                    <div className="relative">
                        <input
                            type="text"
                            value={value}
                            onChange={e => handleUrlChange(e.target.value)}
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
                {isPositionOpen && isInternalImage(value) && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsPositionOpen(false)}
                            className="absolute inset-0 bg-slate-900/65 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative flex max-h-[88vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
                        >
                            <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900">Position Image</h3>
                                    <p className="text-xs text-slate-500">Move the image inside fixed website boxes without changing the box size.</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsPositionOpen(false)}
                                    className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="grid flex-1 gap-5 overflow-y-auto bg-slate-50/70 p-5 lg:grid-cols-[minmax(0,1fr)_18rem]">
                                <div className="space-y-4">
                                    <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 shadow-inner">
                                        <img
                                            src={previewUrl}
                                            alt="Large placement preview"
                                            className="h-full w-full object-cover"
                                            style={{ objectPosition: getImageObjectPosition(value) }}
                                            referrerPolicy="no-referrer"
                                        />
                                        <div className="pointer-events-none absolute inset-x-1/2 inset-y-0 border-l border-white/85 shadow-[0_0_0_1px_rgba(15,23,42,0.22)]" />
                                        <div className="pointer-events-none absolute inset-x-0 inset-y-1/2 border-t border-white/85 shadow-[0_0_0_1px_rgba(15,23,42,0.22)]" />
                                    </div>
                                    <div className="grid gap-3 sm:grid-cols-3">
                                        <div className="aspect-[4/3] overflow-hidden rounded-xl border border-slate-200 bg-slate-200">
                                            <img src={previewUrl} alt="4 by 3 preview" className="h-full w-full object-cover" style={{ objectPosition: getImageObjectPosition(value) }} referrerPolicy="no-referrer" />
                                        </div>
                                        <div className="aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-200">
                                            <img src={previewUrl} alt="Square preview" className="h-full w-full object-cover" style={{ objectPosition: getImageObjectPosition(value) }} referrerPolicy="no-referrer" />
                                        </div>
                                        <div className="aspect-[3/4] overflow-hidden rounded-xl border border-slate-200 bg-slate-200">
                                            <img src={previewUrl} alt="Portrait preview" className="h-full w-full object-cover" style={{ objectPosition: getImageObjectPosition(value) }} referrerPolicy="no-referrer" />
                                        </div>
                                    </div>
                                </div>
                                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                                    <div className="mb-4 flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                                            <Move size={14} />
                                            X / Y
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => onChange(withImagePosition(value, { x: 50, y: 50 }))}
                                            className="text-xs font-bold text-earth-600 hover:text-earth-800"
                                        >
                                            Center
                                        </button>
                                    </div>
                                    <div className="space-y-5">
                                        <label className="block">
                                            <div className="mb-2 flex items-center justify-between text-sm font-semibold text-slate-700">
                                                <span>X position</span>
                                                <span>{position.x}%</span>
                                            </div>
                                            <input
                                                type="range"
                                                min={0}
                                                max={100}
                                                value={position.x}
                                                onChange={(e) => updatePosition("x", Number(e.target.value))}
                                                className="w-full accent-earth-600"
                                            />
                                        </label>
                                        <label className="block">
                                            <div className="mb-2 flex items-center justify-between text-sm font-semibold text-slate-700">
                                                <span>Y position</span>
                                                <span>{position.y}%</span>
                                            </div>
                                            <input
                                                type="range"
                                                min={0}
                                                max={100}
                                                value={position.y}
                                                onChange={(e) => updatePosition("y", Number(e.target.value))}
                                                className="w-full accent-earth-600"
                                            />
                                        </label>
                                    </div>
                                    <div className="mt-5 grid grid-cols-3 gap-2">
                                        {[
                                            { label: "Top", x: 50, y: 0 },
                                            { label: "Left", x: 0, y: 50 },
                                            { label: "Right", x: 100, y: 50 },
                                            { label: "Bottom", x: 50, y: 100 },
                                            { label: "Center", x: 50, y: 50 },
                                            { label: "Face", x: 50, y: 35 },
                                        ].map((preset) => (
                                            <button
                                                key={preset.label}
                                                type="button"
                                                onClick={() => onChange(withImagePosition(value, { x: preset.x, y: preset.y }))}
                                                className="rounded-lg border border-slate-200 px-2 py-2 text-xs font-bold text-slate-600 transition-colors hover:border-earth-300 hover:bg-earth-50 hover:text-earth-700"
                                            >
                                                {preset.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end border-t border-slate-100 px-5 py-4 sm:px-6">
                                <button
                                    type="button"
                                    onClick={() => setIsPositionOpen(false)}
                                    className="rounded-lg bg-earth-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-earth-700"
                                >
                                    Done
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
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
                            <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-slate-100">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900">Server Media Library</h3>
                                    <p className="text-xs text-slate-500">Click an image to select it for this field.</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => refreshMedia()}
                                        disabled={contextLoading}
                                        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 transition-colors hover:border-earth-400 hover:text-earth-600 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        <RefreshCw size={14} className={contextLoading ? "animate-spin" : ""} />
                                        Refresh
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsLibraryOpen(false)}
                                        className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
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
                                                    onChange(withImagePosition(img, position));
                                                    setIsLibraryOpen(false);
                                                }}
                                                className={`group relative aspect-square rounded-xl border-2 overflow-hidden transition-all bg-white shadow-sm ${getImageUrl(value) === img ? "border-earth-500 ring-2 ring-earth-500/20" : "border-transparent hover:border-earth-300"
                                                    }`}
                                            >
                                                <img src={img} alt="Library Item" className="h-full w-full object-cover" />
                                                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <div className="bg-white text-earth-600 rounded-full p-1.5 shadow-lg">
                                                        <Check size={16} strokeWidth={3} />
                                                    </div>
                                                </div>
                                                {getImageUrl(value) === img && (
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
