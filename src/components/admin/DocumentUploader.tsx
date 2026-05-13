import React, { useRef, useState } from "react";
import { FileText, Upload, X, Loader2, ExternalLink, Library, RefreshCw, Check } from "lucide-react";
import { useMedia } from "@/src/contexts/MediaContext";
import { motion, AnimatePresence } from "motion/react";

interface DocumentUploaderProps {
  fileUrl: string;
  buttonLabel: string;
  onFileUrlChange: (url: string) => void;
  onButtonLabelChange: (label: string) => void;
}

function getFilenameFromUrl(url: string): string {
  if (!url) return "";
  const parts = url.split("/");
  const raw = parts[parts.length - 1] || "";
  const match = raw.match(/^\d+-\d+-(.+)$/);
  return match ? match[1] : raw;
}

export function DocumentUploader({
  fileUrl,
  buttonLabel,
  onFileUrlChange,
  onButtonLabelChange,
}: DocumentUploaderProps) {
  const { media, isLoading: contextLoading, refreshMedia } = useMedia();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload-document", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.error || "Upload failed");
      }

      const payload = await response.json();
      onFileUrlChange(payload.url);
      await refreshMedia(); // Refresh media library to include the newly uploaded document
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleClear = () => {
    onFileUrlChange("");
    if (inputRef.current) inputRef.current.value = "";
  };

  const displayName = getFilenameFromUrl(fileUrl);
  
  // Only show non-image files in the document picker
  const documentFiles = (media || []).filter(m => !m.type.startsWith("image/"));

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-1.5">
          Button Label
        </label>
        <input
          type="text"
          value={buttonLabel}
          onChange={(e) => onButtonLabelChange(e.target.value)}
          placeholder="Download Technical Passport"
          className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 focus:border-earth-500 focus:ring-4 focus:ring-earth-500/10 outline-none transition-all"
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-slate-700 mb-1.5">
          Document File <span className="font-normal text-slate-400">(PDF, DOCX, XLSX — max 50 MB)</span>
        </label>

        {fileUrl ? (
          <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
            <FileText className="h-5 w-5 shrink-0 text-emerald-600" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-emerald-800" title={displayName}>
                {displayName}
              </p>
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-emerald-600 hover:underline"
              >
                Preview <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => setIsLibraryOpen(true)}
                disabled={isUploading}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:border-earth-400 hover:text-earth-700 disabled:opacity-50"
              >
                Library
              </button>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={isUploading}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:border-earth-400 hover:text-earth-700 disabled:opacity-50"
              >
                Replace
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
                title="Remove file"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={isUploading}
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm font-medium text-slate-500 transition-colors hover:border-earth-400 hover:bg-earth-50 hover:text-earth-700 disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading…
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Upload Local
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => setIsLibraryOpen(true)}
              disabled={isUploading}
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm font-medium text-slate-500 transition-colors hover:border-earth-400 hover:bg-earth-50 hover:text-earth-700 disabled:opacity-50"
            >
              <Library className="h-4 w-4" /> Server Library
            </button>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
          onChange={handleFileChange}
        />

        {error && (
          <p className="mt-1.5 text-xs text-red-600">{error}</p>
        )}
      </div>

      <AnimatePresence>
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
                  <h3 className="text-xl font-bold text-slate-900">Server Document Library</h3>
                  <p className="text-xs text-slate-500">Click a document to select it for this field.</p>
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
                    <p className="text-slate-500 font-medium">Loading documents...</p>
                  </div>
                ) : documentFiles.length === 0 ? (
                  <div className="text-center py-20">
                    <FileText className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                    <p className="text-slate-500">No documents found on server.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {documentFiles.map((item) => (
                      <button
                        type="button"
                        key={item.url}
                        onClick={() => {
                          onFileUrlChange(item.url);
                          setIsLibraryOpen(false);
                        }}
                        className={`group relative flex flex-col items-center justify-center aspect-square rounded-xl border-2 overflow-hidden transition-all bg-white p-4 shadow-sm ${
                          fileUrl === item.url
                            ? "border-earth-500 ring-2 ring-earth-500/20"
                            : "border-slate-200 hover:border-earth-300"
                        }`}
                      >
                        <FileText className={`h-8 w-8 mb-2 ${fileUrl === item.url ? "text-earth-500" : "text-slate-400"}`} />
                        <span className="text-xs text-slate-600 text-center break-all line-clamp-3 leading-tight">{item.name}</span>
                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="bg-white text-earth-600 rounded-full p-1.5 shadow-lg">
                            <Check size={16} strokeWidth={3} />
                          </div>
                        </div>
                        {fileUrl === item.url && (
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
