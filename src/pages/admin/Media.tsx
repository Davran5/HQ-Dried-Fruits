import React, { useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { UploadCloud, Trash2, File, Copy, Check, Download, Pencil, X } from "lucide-react";
import { useMedia } from "@/src/contexts/MediaContext";
import type { MediaFile } from "@/src/contexts/MediaContext";
import { Button } from "@/src/components/ui/Button";

function formatFileSize(bytes: number) {
    if (!Number.isFinite(bytes) || bytes <= 0) return "Unknown size";
    const units = ["B", "KB", "MB", "GB"];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex += 1;
    }

    return `${size >= 10 || unitIndex === 0 ? size.toFixed(0) : size.toFixed(1)} ${units[unitIndex]}`;
}

function getDownloadUrl(url: string) {
    return `/api/download-upload?url=${encodeURIComponent(url)}`;
}

function getMediaDetails(item: MediaFile) {
    if (!item.type.startsWith("image/")) return "Document";
    if (!item.width || !item.height) return "Image";
    return `${item.width} x ${item.height}${item.aspectRatio ? ` (${item.aspectRatio})` : ""}`;
}

function splitDisplayName(name: string) {
    const dotIndex = name.lastIndexOf(".");
    if (dotIndex <= 0) return { base: name, ext: "" };
    return { base: name.slice(0, dotIndex), ext: name.slice(dotIndex) };
}

export function AdminMedia() {
    const { media, uploadMedia, deleteMedia, renameMedia, isLoading } = useMedia();
    const [isDragging, setIsDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [editingUrl, setEditingUrl] = useState<string | null>(null);
    const [renameValue, setRenameValue] = useState("");
    const [renamingUrl, setRenamingUrl] = useState<string | null>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            await processFiles(Array.from(e.dataTransfer.files));
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            await processFiles(Array.from(e.target.files));
        }
    };

    const processFiles = async (files: File[]) => {
        setUploading(true);
        for (const file of files) {            if (file.size > 10 * 1024 * 1024) {
                alert(`${file.name} is too large. Max 10MB allowed.`);
                continue;
            }
            try {
                await uploadMedia(file);
            } catch (err) {
                console.error("Upload failed for", file.name, err);
                alert(`Failed to upload ${file.name}`);
            }
        }
        setUploading(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const copyToClipboard = (url: string, id: string) => {
        navigator.clipboard.writeText(url).then(() => {
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        });
    };

    const startRename = (item: MediaFile) => {
        const { base } = splitDisplayName(item.name || item.url.split("/").pop() || "File");
        setEditingUrl(item.url);
        setRenameValue(base);
    };

    const cancelRename = () => {
        setEditingUrl(null);
        setRenameValue("");
    };

    const submitRename = async (item: MediaFile) => {
        const nextName = renameValue.trim();
        if (!nextName) {
            alert("File name cannot be empty.");
            return;
        }

        setRenamingUrl(item.url);
        try {
            await renameMedia(item.url, nextName);
            cancelRename();
        } catch (error) {
            alert(error instanceof Error ? error.message : "Failed to rename the file.");
        } finally {
            setRenamingUrl(null);
        }
    };

    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">Media Library</h2>
                <p className="text-sm text-slate-500">Upload, inspect, download, and manage local images and document files.</p>
            </div>            <div
                className={`relative rounded-lg border border-dashed p-6 text-center transition-all ${isDragging ? "border-earth-500 bg-earth-50" : "border-slate-300 bg-white hover:border-earth-400"
                    }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    multiple
                    accept="image/*,application/pdf"
                />
                <div className="flex flex-col items-center justify-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                        <UploadCloud size={32} />
                    </div>
                    <div>
                        <p className="text-lg font-medium text-slate-900">Drag & drop files here</p>
                        <p className="text-sm text-slate-500 mb-4">Support for Images (JPG, PNG, WebP) and PDFs (Max 10MB)</p>
                        <Button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            className="bg-earth-600 hover:bg-earth-700 text-white"
                        >
                            {uploading ? "Uploading..." : "Browse Files"}
                        </Button>
                    </div>
                </div>
            </div>            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden p-6">
                <h3 className="mb-3 font-bold text-slate-900">Uploaded Files ({(media || []).length})</h3>

                {isLoading ? (
                    <div className="py-12 text-center text-slate-500">Loading media library...</div>
                ) : (media || []).length === 0 ? (
                    <div className="py-12 text-center text-slate-500">No media files found. Upload some to get started.</div>
                ) : (
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                        <AnimatePresence>
                            {(media || []).map((item) => {
                                const url = item.url;
                                const isImage = item.type.startsWith("image/");
                                const name = item.name || url.split("/").pop() || "File";
                                const { ext } = splitDisplayName(name);
                                const isEditing = editingUrl === url;
                                return (
                                    <motion.div
                                        key={url}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className="group relative flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-slate-50"
                                    >                                        <div className="h-40 w-full bg-slate-200 flex items-center justify-center overflow-hidden relative">
                                            {isImage ? (
                                                <img src={url} alt={name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="flex flex-col items-center text-slate-400">
                                                    <File size={48} className="mb-2" />
                                                    <span className="text-xs font-bold uppercase tracking-wider">FILE</span>
                                                </div>
                                            )}                                            <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => copyToClipboard(url, url)}
                                                    className="p-2 bg-white text-slate-700 rounded-lg hover:bg-earth-50 hover:text-earth-600 transition-colors"
                                                    title="Copy URL"
                                                >
                                                    {copiedId === url ? <Check size={18} className="text-emerald-500" /> : <Copy size={18} />}
                                                </button>
                                                <a
                                                    href={getDownloadUrl(url)}
                                                    className="p-2 bg-white text-slate-700 rounded-lg hover:bg-earth-50 hover:text-earth-600 transition-colors"
                                                    title="Download File"
                                                >
                                                    <Download size={18} />
                                                </a>
                                                <button
                                                    onClick={() => deleteMedia(url)}
                                                    className="p-2 bg-white text-slate-700 rounded-lg hover:bg-red-50 hover:text-red-500 transition-colors"
                                                    title="Delete File"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>                                        <div className="p-3 border-t border-slate-200 bg-white">
                                            {isEditing ? (
                                                <div className="flex items-center gap-1.5">
                                                    <input
                                                        autoFocus
                                                        value={renameValue}
                                                        onChange={(e) => setRenameValue(e.target.value)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === "Enter") void submitRename(item);
                                                            if (e.key === "Escape") cancelRename();
                                                        }}
                                                        className="min-w-0 flex-1 rounded-md border border-slate-300 px-2 py-1 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-earth-500"
                                                        aria-label="New file name"
                                                    />
                                                    {ext ? <span className="max-w-[3.5rem] truncate text-xs text-slate-500">{ext}</span> : null}
                                                    <button
                                                        type="button"
                                                        onClick={() => submitRename(item)}
                                                        disabled={renamingUrl === url}
                                                        className="rounded-md p-1.5 text-emerald-600 hover:bg-emerald-50 disabled:opacity-50"
                                                        title="Save file name"
                                                    >
                                                        <Check size={16} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={cancelRename}
                                                        className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100"
                                                        title="Cancel rename"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <p className="min-w-0 flex-1 truncate text-sm font-medium text-slate-900" title={name}>{name}</p>
                                                    <button
                                                        type="button"
                                                        onClick={() => startRename(item)}
                                                        className="shrink-0 rounded-md p-1.5 text-slate-400 transition-colors hover:bg-earth-50 hover:text-earth-600"
                                                        title="Rename file"
                                                    >
                                                        <Pencil size={15} />
                                                    </button>
                                                </div>
                                            )}
                                            <div className="mt-2 space-y-1 text-xs text-slate-500">
                                                <p>{formatFileSize(item.size)}</p>
                                                <p className="truncate" title={getMediaDetails(item)}>{getMediaDetails(item)}</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
}
