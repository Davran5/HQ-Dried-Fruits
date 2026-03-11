import React from "react";
import { SimplePageContent } from "@/src/types/page";
import { RichTextEditor } from "./RichTextEditor";

interface Props {
    content: SimplePageContent;
    updateContent: (updates: Partial<SimplePageContent>) => void;
}

export function SimplePageForm({ content, updateContent }: Props) {
    return (
        <div className="space-y-8">
            <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h4 className="font-bold text-slate-800 text-lg border-b pb-2 mb-4">Page Content</h4>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Page Title</label>
                    <input
                        type="text"
                        value={content.title || ""}
                        onChange={(e) => updateContent({ title: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-earth-500 outline-none"
                    />
                </div>

                <RichTextEditor
                    label="Body Content"
                    value={content.body || ""}
                    onChange={(value) => updateContent({ body: value })}
                />
            </div>
        </div>
    );
}
