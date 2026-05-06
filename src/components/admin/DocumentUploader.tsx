import React, { useRef, useState } from "react";
import { FileText, Upload, X, Loader2, ExternalLink } from "lucide-react";

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
  // Strip the timestamp-random prefix: {ts}-{rand}-{name}.ext
  const match = raw.match(/^\d+-\d+-(.+)$/);
  return match ? match[1] : raw;
}

export function DocumentUploader({
  fileUrl,
  buttonLabel,
  onFileUrlChange,
  onButtonLabelChange,
}: DocumentUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="space-y-3">
      {/* Button label field */}
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

      {/* File area */}
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
            <div className="flex shrink-0 items-center gap-1">
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
                Click to upload document
              </>
            )}
          </button>
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
    </div>
  );
}
