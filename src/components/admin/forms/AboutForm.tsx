import React from "react";
import { AboutContent, AboutProductionItem, StatBox } from "@/src/types/page";
import { ImageUploader } from "@/src/components/admin/ImageUploader";
import { Repeater } from "@/src/components/admin/Repeater";
import { RichTextEditor } from "./RichTextEditor";
import { FormSection } from "@/src/components/admin/forms/FormSection";

interface Props {
    content: AboutContent;
    updateContent: (updates: Partial<AboutContent>) => void;
}

export function AboutForm({ content, updateContent }: Props) {
    return (
        <div className="space-y-8">
            <FormSection title="1. Marquee Hero">

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Large Top Title</label>
                    <input
                        type="text"
                        value={content.marqueeTitle || ""}
                        onChange={e => updateContent({ marqueeTitle: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-earth-500 outline-none"
                    />
                </div>

                <Repeater<string>
                    label="Orchard/Production Marquee Images"
                    items={content.productionMarqueeImages || []}
                    emptyItem={""}
                    onUpdate={(items) => updateContent({ productionMarqueeImages: items })}
                    renderItem={(item, index, updateItem, replaceItem) => (
                        <ImageUploader
                            label={`Image ${index + 1}`}
                            value={item}
                            onChange={url => replaceItem(index, url)}
                        />
                    )}
                />
            </FormSection>

            <FormSection title="2. Partner / Trust Marquee" defaultOpen={false}>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Section Label</label>
                    <input
                        type="text"
                        value={content.partnerSectionLabel || ""}
                        onChange={e => updateContent({ partnerSectionLabel: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-earth-500 outline-none"
                    />
                </div>
                <Repeater<string>
                    label="Partner Logos & Certifications"
                    items={content.partnerLogos || []}
                    emptyItem={""}
                    onUpdate={(items) => updateContent({ partnerLogos: items })}
                    renderItem={(item, index, updateItem, replaceItem) => (
                        <ImageUploader
                            label={`Logo ${index + 1}`}
                            value={item}
                            onChange={url => replaceItem(index, url)}
                        />
                    )}
                />
            </FormSection>

            <FormSection title="3. Company Heritage" defaultOpen={false}>

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

                <Repeater<StatBox>
                    label="Numbered Stats Boxes"
                    items={content.heritageStats || []}
                    emptyItem={{ boxNumber: "", title: "", description: "" }}
                    onUpdate={(items) => updateContent({ heritageStats: items })}
                    renderItem={(item, index, updateItem) => (
                        <div className="space-y-2">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">Box Number</label>
                                    <input
                                        type="text"
                                        value={item.boxNumber}
                                        onChange={e => updateItem(index, "boxNumber", e.target.value)}
                                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none"
                                        placeholder="e.g. 01"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">Box Title</label>
                                    <input
                                        type="text"
                                        value={item.title}
                                        onChange={e => updateItem(index, "title", e.target.value)}
                                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none"
                                        placeholder="e.g. Global Scale"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">Short Description</label>
                                <textarea
                                    rows={2}
                                    value={item.description}
                                    onChange={e => updateItem(index, "description", e.target.value)}
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none resize-none"
                                />
                            </div>
                        </div>
                    )}
                />

                <Repeater<string>
                    label="Featured Heritage Imagery (Gallery)"
                    items={content.heritageImagery || []}
                    emptyItem={""}
                    onUpdate={(items) => updateContent({ heritageImagery: items })}
                    renderItem={(item, index, updateItem, replaceItem) => (
                        <ImageUploader
                            label={`Heritage Image ${index + 1}`}
                            value={item}
                            onChange={url => replaceItem(index, url)}
                        />
                    )}
                />
            </FormSection>

            <FormSection title="4. Mission & Logistics" defaultOpen={false}>

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

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Orchard Philosophy</label>
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
