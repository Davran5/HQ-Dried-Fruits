import React from "react";
import { ExportContent, SupplyRoute, CertItem, TextBlockItem } from "@/src/types/page";
import { ImageUploader } from "@/src/components/admin/ImageUploader";
import { Repeater } from "@/src/components/admin/Repeater";
import { RichTextEditor } from "./RichTextEditor";
import { FormSection } from "@/src/components/admin/forms/FormSection";

interface Props {
    content: ExportContent;
    updateContent: (updates: Partial<ExportContent>) => void;
}

const suggestedRoutes: SupplyRoute[] = [
    { countryName: "Germany", mapCoordinatesId: "DE", tooltipDescription: "Central Europe pallet and container distribution.", image: "" },
    { countryName: "Poland", mapCoordinatesId: "PL", tooltipDescription: "Fast Eastern Europe routing for wholesale fulfillment.", image: "" },
    { countryName: "UAE", mapCoordinatesId: "AE", tooltipDescription: "Regional trade hub for GCC importers and re-export buyers.", image: "" },
    { countryName: "Saudi Arabia", mapCoordinatesId: "SA", tooltipDescription: "Retail and foodservice volume routed through Gulf distribution partners.", image: "" },
    { countryName: "India", mapCoordinatesId: "IN", tooltipDescription: "High-volume dried fruit demand with flexible multimodal delivery.", image: "" },
    { countryName: "China", mapCoordinatesId: "CN", tooltipDescription: "Containerized supply lanes for repeat industrial buyers.", image: "" },
    { countryName: "Turkey", mapCoordinatesId: "TR", tooltipDescription: "Cross-regional trade flow connecting Europe and the Middle East.", image: "" },
    { countryName: "Kazakhstan", mapCoordinatesId: "KZ", tooltipDescription: "Land-linked regional route for rapid replenishment.", image: "" },
];

export function ExportForm({ content, updateContent }: Props) {
    return (
        <div className="space-y-8">
            <FormSection
                title="1. Hero"
            >
                <ImageUploader
                    label="Hero Background Image"
                    value={content.heroBgImage || ""}
                    onChange={url => updateContent({ heroBgImage: url })}
                />

                <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Hero Title</label>
                    <input
                        type="text"
                        value={content.heroTitle || ""}
                        onChange={e => updateContent({ heroTitle: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-earth-500 outline-none"
                    />
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Hero Subtitle</label>
                    <textarea
                        rows={3}
                        value={content.heroSubtitle || ""}
                        onChange={e => updateContent({ heroSubtitle: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 outline-none resize-none focus:border-earth-500"
                    />
                </div>
            </FormSection>

            <FormSection
                title="2. Global Supply Map"
                actions={
                    <button
                        type="button"
                        onClick={() => updateContent({ supplyRoutes: suggestedRoutes.map((route) => ({ ...route })) })}
                        className="rounded-full border border-earth-200 bg-earth-50 px-4 py-2 text-xs font-bold uppercase tracking-widest text-earth-700 transition-colors hover:border-earth-300 hover:bg-earth-100"
                    >
                        Load Suggested Countries
                    </button>
                }
            >

                <p className="text-sm leading-6 text-slate-500">
                    Use ISO 2-letter country codes like <span className="font-semibold text-slate-700">DE</span> or custom map points as <span className="font-semibold text-slate-700">52.52,13.40</span>.
                </p>

                <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Section Title</label>
                    <input
                        type="text"
                        value={content.mapSectionTitle || ""}
                        onChange={e => updateContent({ mapSectionTitle: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-earth-500 outline-none"
                    />
                </div>

                <Repeater<SupplyRoute>
                    label="Supply Routes/Countries"
                    items={content.supplyRoutes || []}
                    emptyItem={{ countryName: "", mapCoordinatesId: "", tooltipDescription: "", image: "" }}
                    onUpdate={(items) => updateContent({ supplyRoutes: items })}
                    renderItem={(item, index, updateItem) => (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-slate-500">Country Name</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Germany"
                                        value={item.countryName}
                                        onChange={e => updateItem(index, "countryName", e.target.value)}
                                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-earth-500"
                                    />
                                </div>
                                <div>
                                    <div className="mb-1 flex items-center justify-between">
                                        <label className="block text-xs font-medium text-slate-500">Coordinate/Map ID</label>
                                        <span className="text-[10px] font-normal text-slate-400">ISO code or lat,lng</span>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="DE or 52.52,13.40"
                                        value={item.mapCoordinatesId}
                                        onChange={e => updateItem(index, "mapCoordinatesId", e.target.value)}
                                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-earth-500 uppercase"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-medium text-slate-500">Short Tooltip Description</label>
                                <textarea
                                    rows={2}
                                    value={item.tooltipDescription}
                                    onChange={e => updateItem(index, "tooltipDescription", e.target.value)}
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none resize-none focus:border-earth-500"
                                />
                            </div>

                            <ImageUploader
                                label="Destination Image"
                                value={item.image || ""}
                                onChange={url => updateItem(index, "image", url)}
                            />
                        </div>
                    )}
                />
            </FormSection>

            <FormSection title="3. Operational Standards" defaultOpen={false}>

                <RichTextEditor
                    label="Export Content"
                    value={content.logisticsContent || ""}
                    onChange={val => updateContent({ logisticsContent: val })}
                />

                <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Packaging Title</label>
                    <input
                        type="text"
                        value={content.packagingTitle || ""}
                        onChange={e => updateContent({ packagingTitle: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-earth-500 outline-none"
                    />
                </div>

                <RichTextEditor
                    label="Packaging Methods"
                    value={content.packagingMethods || ""}
                    onChange={val => updateContent({ packagingMethods: val })}
                />

                <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Transportation Title</label>
                    <input
                        type="text"
                        value={content.transportationTitle || ""}
                        onChange={e => updateContent({ transportationTitle: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-earth-500 outline-none"
                    />
                </div>

                <RichTextEditor
                    label="Transportation Methods"
                    value={content.transportationMethods || ""}
                    onChange={val => updateContent({ transportationMethods: val })}
                />

                <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Documentation Title</label>
                    <input
                        type="text"
                        value={content.documentationTitle || ""}
                        onChange={e => updateContent({ documentationTitle: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-earth-500 outline-none"
                    />
                </div>

                <RichTextEditor
                    label="Documentation Content"
                    value={content.documentationContent || ""}
                    onChange={val => updateContent({ documentationContent: val })}
                />
            </FormSection>

            <FormSection title="4. Quality Guarantee" defaultOpen={false}>

                <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Section Title</label>
                    <input
                        type="text"
                        value={content.qualityTitle || ""}
                        onChange={e => updateContent({ qualityTitle: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-earth-500 outline-none"
                    />
                </div>

                <RichTextEditor
                    label="Technical Specifications"
                    value={content.technicalSpecs || ""}
                    onChange={val => updateContent({ technicalSpecs: val })}
                />

                <Repeater<TextBlockItem>
                    label="Quality Checklist Items"
                    items={content.qualityChecks || []}
                    emptyItem={{ title: "", description: "" }}
                    onUpdate={(items) => updateContent({ qualityChecks: items })}
                    renderItem={(item, index, updateItem) => (
                        <div className="space-y-3">
                            <div>
                                <label className="mb-1 block text-xs font-medium text-slate-500">Title</label>
                                <input
                                    type="text"
                                    value={item.title}
                                    onChange={e => updateItem(index, "title", e.target.value)}
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-earth-500"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-medium text-slate-500">Description</label>
                                <textarea
                                    rows={2}
                                    value={item.description}
                                    onChange={e => updateItem(index, "description", e.target.value)}
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none resize-none focus:border-earth-500"
                                />
                            </div>
                        </div>
                    )}
                />
            </FormSection>

            <FormSection title="5. Certifications Gallery" defaultOpen={false}>

                <Repeater<CertItem>
                    label="Gallery Grid"
                    items={content.certificationsGallery || []}
                    emptyItem={{ image: "", caption: "" }}
                    onUpdate={(items) => updateContent({ certificationsGallery: items })}
                    renderItem={(item, index, updateItem) => (
                        <div className="space-y-4">
                            <ImageUploader
                                label="Certificate Image"
                                value={item.image}
                                onChange={url => updateItem(index, "image", url)}
                            />

                            <div>
                                <label className="mb-1 block text-xs font-medium text-slate-500">Title/Caption (e.g. HACCP, ISO)</label>
                                <input
                                    type="text"
                                    value={item.caption}
                                    onChange={e => updateItem(index, "caption", e.target.value)}
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-earth-500"
                                />
                            </div>
                        </div>
                    )}
                />
            </FormSection>
        </div>
    );
}
