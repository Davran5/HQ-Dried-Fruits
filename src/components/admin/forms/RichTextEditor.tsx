import React from "react";

interface Props {
    label: string;
    value: string;
    onChange: (value: string) => void;
    rows?: number;
}

export function RichTextEditor({ label, value, onChange, rows = 6 }: Props) {
    return (
        <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
                {label} <span className="text-xs text-earth-500 font-normal ml-2">(Rich Text / HTML Supported)</span>
            </label>
            <div className="rounded-lg border border-slate-300 overflow-hidden focus-within:ring-2 focus-within:ring-earth-500/20 focus-within:border-earth-500 transition-all">                <div className="bg-slate-50 border-b border-slate-200 px-3 py-2 flex items-center gap-2 text-slate-500">
                    <button type="button" className="px-2 hover:bg-slate-200 rounded font-bold">B</button>
                    <button type="button" className="px-2 hover:bg-slate-200 rounded italic">I</button>
                    <button type="button" className="px-2 hover:bg-slate-200 rounded underline">U</button>
                    <div className="w-px h-4 bg-slate-300 mx-1"></div>
                    <button type="button" className="px-2 hover:bg-slate-200 rounded text-sm">&lt;/&gt;</button>
                </div>
                <textarea
                    rows={rows}
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    className="w-full px-4 py-3 text-slate-900 outline-none resize-y min-h-[120px]"
                    placeholder="Enter content here..."
                />
            </div>
        </div>
    );
}
