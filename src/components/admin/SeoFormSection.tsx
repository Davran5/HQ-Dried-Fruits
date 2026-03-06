import React from 'react';

export interface SEOData {
  metaTitle: string;
  metaDescription: string;
  slug: string;
  ogTitle: string;
  imageAlt: string;
}

interface SeoFormSectionProps {
  data: SEOData;
  onChange: (data: SEOData) => void;
}

export function SeoFormSection({ data, onChange }: SeoFormSectionProps) {
  return (
    <div className="space-y-4 mt-6">
      <h4 className="text-sm font-bold text-slate-900 mb-3 border-b border-slate-100 pb-2">SEO Configuration</h4>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Meta Title</label>
          <input 
            type="text" 
            value={data.metaTitle}
            onChange={e => onChange({ ...data, metaTitle: e.target.value })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-earth-500 outline-none transition-all"
            placeholder="e.g. Premium Sun-Dried Apricots"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Custom URL Slug</label>
          <input 
            type="text" 
            value={data.slug}
            onChange={e => onChange({ ...data, slug: e.target.value })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-earth-500 outline-none transition-all"
            placeholder="e.g. sun-dried-apricots"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-slate-500 mb-1">Meta Description</label>
          <textarea 
            rows={2}
            value={data.metaDescription}
            onChange={e => onChange({ ...data, metaDescription: e.target.value })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-earth-500 outline-none transition-all resize-none"
            placeholder="Brief description for search engines..."
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Open Graph Title</label>
          <input 
            type="text" 
            value={data.ogTitle}
            onChange={e => onChange({ ...data, ogTitle: e.target.value })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-earth-500 outline-none transition-all"
            placeholder="Title for social sharing"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Image Alt Text</label>
          <input 
            type="text" 
            value={data.imageAlt}
            onChange={e => onChange({ ...data, imageAlt: e.target.value })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-earth-500 outline-none transition-all"
            placeholder="Descriptive text for the image"
          />
        </div>
      </div>
    </div>
  );
}
