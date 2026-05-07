import React, { useRef, useState } from "react";
import { AboutContent, AboutProductionItem } from "@/src/types/page";
import { ImageUploader } from "@/src/components/admin/ImageUploader";
import { Repeater } from "@/src/components/admin/Repeater";
import { RichTextEditor } from "./RichTextEditor";
import { FormSection } from "@/src/components/admin/forms/FormSection";
import { useMedia } from "@/src/contexts/MediaContext";
import { usePages } from "@/src/contexts/PageContext";
import { normalizeAboutTrustItems } from "@/src/lib/aboutTrustItems";
import { Loader2, Plus, Trash2 } from "lucide-react";

interface Props {
    content: AboutContent;
    updateContent: (updates: Partial<AboutContent>) => void;
}

function PartnerLogoGrid({ items, onUpdate }: { items: string[]; onUpdate: (items: string[]) => void }) {
    const { uploadMedia } = useMedia();
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [targetIndex, setTargetIndex] = useState<number | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const openPicker = (index: number | null) => {
        setTargetIndex(index);
        inputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        event.target.value = "";
        if (!file) return;

        setIsUploading(true);
        try {
            const url = await uploadMedia(file);
            const nextItems = [...items];
            if (targetIndex === null) {
                nextItems.push(url);
            } else {
                nextItems[targetIndex] = url;
            }
            onUpdate(nextItems);
        } catch {
            alert("Upload failed.");
        } finally {
            setIsUploading(false);
            setTargetIndex(null);
        }
    };

    const removeLogo = (index: number) => {
        const nextItems = [...items];
        nextItems.splice(index, 1);
        onUpdate(nextItems);
    };

    return (
        <div className="space-y-3">
            <label className="block text-sm font-bold text-slate-800">
                Partner Logos & Certifications - Shared across all languages
            </label>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
                {items.map((logo, index) => (
                    <div key={`${logo}-${index}`} className="group relative aspect-square overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <button
                            type="button"
                            onClick={() => openPicker(index)}
                            className="flex h-full w-full items-center justify-center p-3"
                        >
                            {logo ? (
                                <img src={logo} alt={`Partner logo ${index + 1}`} className="max-h-full max-w-full object-contain" referrerPolicy="no-referrer" />
                            ) : (
                                <Plus className="h-6 w-6 text-slate-300" />
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => removeLogo(index)}
                            className="absolute right-2 top-2 rounded-full bg-white/90 p-1.5 text-slate-400 opacity-0 shadow-sm transition-all hover:text-red-500 group-hover:opacity-100"
                            aria-label="Remove logo"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                ))}

                <button
                    type="button"
                    onClick={() => openPicker(null)}
                    className="flex aspect-square flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-slate-400 transition-colors hover:border-earth-300 hover:bg-earth-50 hover:text-earth-600"
                >
                    {isUploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Plus className="h-7 w-7" />}
                    <span className="text-xs font-bold uppercase tracking-wide">Add Logo</span>
                </button>
            </div>
            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        </div>
    );
}

export function AboutForm({ content, updateContent }: Props) {
    const { globalSettings } = usePages();
    const uiLabels = globalSettings.uiLabels || {};
    const missionNarrativeTitleFallback = uiLabels.missionNarrativeTitle || "What guides the way we grow, process, and deliver";
    const missionNarrativeSublabelFallback = uiLabels.missionNarrativeSublabel || "A clearer look at the company mission, heritage, philosophy, and standards, shaped into one visual section.";
    const aboutTrustItems = normalizeAboutTrustItems(content.aboutTrustItems, uiLabels);
    const updateTrustItem = (index: number, updates: Partial<(typeof aboutTrustItems)[number]>) => {
        updateContent({
            aboutTrustItems: aboutTrustItems.map((item, candidateIndex) =>
                candidateIndex === index ? { ...item, ...updates } : item,
            ),
        });
    };

    return (
        <div className="space-y-4">
            <FormSection title="1. About Hero">
                <ImageUploader
                    label="Main Hero Background Image"
                    value={(content.heroBgImage ?? content.productionMarqueeImages?.[0]) || ""}
                    onChange={url => updateContent({ heroBgImage: url })}
                />

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Large Top Title</label>
                    <input
                        type="text"
                        value={content.marqueeTitle || ""}
                        onChange={e => updateContent({ marqueeTitle: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-earth-500 outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Hero Subtitle / Body Text</label>
                    <textarea
                        rows={3}
                        value={(content.heroSubtitle ?? content.heritageSubtitle) || ""}
                        onChange={e => updateContent({ heroSubtitle: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-earth-500 outline-none resize-none"
                    />
                </div>
            </FormSection>

            <FormSection title="2. About The Company" defaultOpen={false}>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Eyebrow Text Above Title</label>
                    <input
                        type="text"
                        value={content.companyEyebrow || ""}
                        onChange={e => updateContent({ companyEyebrow: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-earth-500 outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Section Title</label>
                    <input
                        type="text"
                        value={content.heritageTitle || ""}
                        onChange={e => updateContent({ heritageTitle: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-earth-500 outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Section Subtitle</label>
                    <input
                        type="text"
                        value={content.heritageSubtitle || ""}
                        onChange={e => updateContent({ heritageSubtitle: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-earth-500 outline-none"
                    />
                </div>

                <RichTextEditor
                    label='"Who We Are" Content'
                    value={content.whoWeAreContent || ""}
                    onChange={val => updateContent({ whoWeAreContent: val })}
                />

                <Repeater<string>
                    label="Featured Heritage Imagery (Gallery)"
                    items={content.heritageImagery || []}
                    emptyItem={""}
                    onUpdate={(items) => updateContent({ heritageImagery: items })}
                    renderItem={(item, index, _updateItem, replaceItem) => (
                        <ImageUploader
                            label={`Heritage Image ${index + 1}`}
                            value={item}
                            onChange={url => replaceItem(index, url)}
                        />
                    )}
                />
            </FormSection>

            <FormSection title="3. Partner / Trust Marquee" defaultOpen={false}>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Section Label</label>
                    <input
                        type="text"
                        value={content.partnerSectionLabel || ""}
                        onChange={e => updateContent({ partnerSectionLabel: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-earth-500 outline-none"
                    />
                </div>
                <PartnerLogoGrid
                    items={content.partnerLogos || []}
                    onUpdate={(items) => updateContent({ partnerLogos: items })}
                />
                <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-800">Trust Items</label>
                        <p className="mt-1 text-xs text-slate-500">
                            Edit the labels shown in the About marquee. Use the toggles to hide or show each fixed item.
                        </p>
                    </div>
                    <div className="space-y-2">
                        {aboutTrustItems.map((item, index) => (
                            <div key={item.key} className="grid gap-3 rounded-xl border border-slate-200 bg-white p-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                                <div>
                                    <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-slate-500">
                                        {item.key}
                                    </label>
                                    <input
                                        type="text"
                                        value={item.label}
                                        onChange={e => updateTrustItem(index, { label: e.target.value })}
                                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-earth-500"
                                    />
                                </div>
                                <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700">
                                    <input
                                        type="checkbox"
                                        checked={item.visible !== false}
                                        onChange={e => updateTrustItem(index, { visible: e.target.checked })}
                                        className="h-4 w-4 rounded border-slate-300 text-earth-600 focus:ring-earth-500"
                                    />
                                    Show
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
            </FormSection>

            <FormSection title="4. Mission & Logistics" defaultOpen={false}>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Mission Narrative Eyebrow</label>
                    <input
                        type="text"
                        value={content.missionNarrativeEyebrow || ""}
                        onChange={e => updateContent({ missionNarrativeEyebrow: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-earth-500 outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Mission Narrative Main Title</label>
                    <input
                        type="text"
                        value={content.missionNarrativeTitle ?? missionNarrativeTitleFallback}
                        onChange={e => updateContent({ missionNarrativeTitle: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-earth-500 outline-none"
                        placeholder="What guides the way we grow, process, and deliver"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Mission Narrative Text Below Title</label>
                    <textarea
                        rows={3}
                        value={content.missionNarrativeSublabel ?? missionNarrativeSublabelFallback}
                        onChange={e => updateContent({ missionNarrativeSublabel: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-earth-500 outline-none resize-none"
                        placeholder="A clearer look at the company mission, heritage, philosophy, and standards, shaped into one visual section."
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Mission Section Title</label>
                    <input
                        type="text"
                        value={content.missionTitle || ""}
                        onChange={e => updateContent({ missionTitle: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-earth-500 outline-none"
                    />
                </div>

                <RichTextEditor
                    label='Mission Statement'
                    value={content.missionStatement || ""}
                    onChange={val => updateContent({ missionStatement: val })}
                />

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Philosophy Section Title</label>
                    <input
                        type="text"
                        value={content.philosophyTitle || ""}
                        onChange={e => updateContent({ philosophyTitle: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-earth-500 outline-none"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Orchard Philosophy Eyebrow</label>
                        <input
                            type="text"
                            value={content.orchardPhilosophyEyebrow || ""}
                            onChange={e => updateContent({ orchardPhilosophyEyebrow: e.target.value })}
                            className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-earth-500 outline-none"
                            placeholder="Philosophy"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Orchard Philosophy Title</label>
                        <input
                            type="text"
                            value={content.orchardPhilosophyTitle || ""}
                            onChange={e => updateContent({ orchardPhilosophyTitle: e.target.value })}
                            className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-earth-500 outline-none"
                            placeholder="Orchard Philosophy"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Orchard Philosophy Text</label>
                    <textarea
                        rows={4}
                        value={content.orchardPhilosophy || ""}
                        onChange={e => updateContent({ orchardPhilosophy: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-earth-500 outline-none resize-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Production Standards Section Title</label>
                    <input
                        type="text"
                        value={content.productionStandardsTitle || ""}
                        onChange={e => updateContent({ productionStandardsTitle: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-earth-500 outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Production Standards</label>
                    <textarea
                        rows={4}
                        value={content.productionStandards || ""}
                        onChange={e => updateContent({ productionStandards: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-earth-500 outline-none resize-none"
                    />
                </div>

                <ImageUploader
                    label="Large-Scale Mission Photography"
                    value={content.missionPhotography || ""}
                    onChange={url => updateContent({ missionPhotography: url })}
                />
            </FormSection>

            <FormSection title="5. Own Production" defaultOpen={false}>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Eyebrow Text Above Title</label>
                    <input
                        type="text"
                        value={content.facilityEyebrow || ""}
                        onChange={e => updateContent({ facilityEyebrow: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-earth-500 outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Section Title</label>
                    <input
                        type="text"
                        value={content.ownProductionTitle || ""}
                        onChange={e => updateContent({ ownProductionTitle: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-earth-500 outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Intro Text</label>
                    <textarea
                        rows={4}
                        value={content.ownProductionIntro || ""}
                        onChange={e => updateContent({ ownProductionIntro: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-earth-500 outline-none resize-none"
                    />
                </div>

                <Repeater<AboutProductionItem>
                    label="Production Columns"
                    items={content.ownProductionItems || []}
                    emptyItem={{ image: "", title: "", subtitle: "", description: "" }}
                    onUpdate={(items) => updateContent({ ownProductionItems: items })}
                    renderItem={(item, index, updateItem) => (
                        <div className="space-y-4">
                            <ImageUploader
                                label={`Production Image ${index + 1}`}
                                value={item.image}
                                onChange={url => updateItem(index, "image", url)}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">Title</label>
                                    <input
                                        type="text"
                                        value={item.title}
                                        onChange={e => updateItem(index, "title", e.target.value)}
                                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">Subtitle</label>
                                    <input
                                        type="text"
                                        value={item.subtitle}
                                        onChange={e => updateItem(index, "subtitle", e.target.value)}
                                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">Description</label>
                                <textarea
                                    rows={3}
                                    value={item.description}
                                    onChange={e => updateItem(index, "description", e.target.value)}
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none resize-none"
                                />
                            </div>
                        </div>
                    )}
                />
            </FormSection>
        </div>
    );
}
