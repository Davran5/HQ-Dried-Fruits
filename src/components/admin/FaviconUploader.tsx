import React, { useRef, useState } from "react";
import { Upload, Link as LinkIcon, Image as ImageIcon, Loader2, X } from "lucide-react";

interface FaviconUploaderProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export function FaviconUploader({ label, value, onChange, placeholder }: FaviconUploaderProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [mode, setMode] = useState<"upload" | "url">("url");

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            if (file.size > 5 * 1024 * 1024) {
                alert("File too large. Max 5MB.");
                return;
            }
            setIsUploading(true);
            try {
                const formData = new FormData();
                formData.append("file", file);
                const res = await fetch("/api/upload-favicon", {
                    method: "POST",
                    body: formData,
                });
                if (!res.ok) throw new Error("Upload failed");
                const data = await res.json();
                onChange(data.url);
                setMode("url");
            } catch (err) {
                alert("Upload failed.");
            } finally {
                setIsUploading(false);
            }
        }
    };

    const isInternalImage = (val: string) => {
        return val && (val.startsWith("http") || val.startsWith("data:image") || val.startsWith("/"));
    };

    return (
        <div className="space-y-2.5">
            <label className="block text-sm font-bold text-slate-700">{label}</label>
            <div className="flex items-start gap-4">
                <div className="relative h-24 w-24 shrink-0 rounded-xl border-2 border-slate-200 bg-slate-50 overflow-hidden shadow-inner flex items-center justify-center">
                    {isInternalImage(value) ? (
                        <img src={value} alt="Preview" className="h-full w-full object-contain p-2" referrerPolicy="no-referrer" />
                    ) : (
                        <div className="flex flex-col items-center gap-1 text-slate-300">
                            <ImageIcon size={24} />
                            <span className="text-[10px] font-bold uppercase tracking-tighter">No Favicon</span>
                        </div>
                    )}
                    {isUploading && (
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                            <Loader2 className="animate-spin text-earth-600" size={24} />
                        </div>
                    )}
                </div>

                <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap gap-2">
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
                    </div>
                    <div className="relative">
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
            </div>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
            />
        </div>
    );
}
