import React from "react";
import { ExportContent, SupplyRoute, CertItem, TextBlockItem } from "@/src/types/page";
import { ImageUploader } from "@/src/components/admin/ImageUploader";
import { Repeater } from "@/src/components/admin/Repeater";
import { RichTextEditor } from "./RichTextEditor";
import { FormSection } from "@/src/components/admin/forms/FormSection";
import { useAdminLanguage } from "@/src/contexts/AdminLanguageContext";
import { t as translate } from "@/src/i18n";
import { getDefaultBuyerChannelRoutes, normalizeSupplyRoutes } from "@/src/lib/buyerChannels";

interface Props {
    content: ExportContent;
    updateContent: (updates: Partial<ExportContent>) => void;
}

export function ExportForm({ content, updateContent }: Props) {
    const { editingLang } = useAdminLanguage();
    const buyerChannels = normalizeSupplyRoutes(content.supplyRoutes, editingLang);
    const buyerChannelEyebrow = content.destinationEyebrow || translate(editingLang, "exportDestinationEyebrow");
    const buyerChannelTitle = content.mapSectionTitle || translate(editingLang, "exportDestinationTitle");
    const updateBuyerChannel = (index: number, updates: Partial<SupplyRoute>) => {
        updateContent({
            supplyRoutes: buyerChannels.map((item, candidateIndex) =>
                candidateIndex === index ? { ...item, ...updates } : item,
            ),
        });
    };

    return (
        <div className="space-y-4">
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

            <FormSection title="2. Operational Standards" defaultOpen={false}>
                <ImageUploader
                    label="Operational Standards Image"
                    value={content.operationsImage || ""}
                    onChange={url => updateContent({ operationsImage: url })}
                    placeholder="Shown beside the operational standards text. Falls back to the hero image if empty."
                />

                <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Operations Eyebrow</label>
                    <input
                        type="text"
                        value={content.operationsEyebrow || ""}
                        onChange={e => updateContent({ operationsEyebrow: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-earth-500 outline-none"
                    />
                </div>

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

            <FormSection
                title="3. Buyer Channels"
                actions={
                    <button
                        type="button"
                        onClick={() => updateContent({ supplyRoutes: getDefaultBuyerChannelRoutes(editingLang) })}
                        className="rounded-full border border-earth-200 bg-earth-50 px-4 py-2 text-xs font-bold uppercase tracking-widest text-earth-700 transition-colors hover:border-earth-300 hover:bg-earth-100"
                    >
                        Load Buyer Channels
                    </button>
                }
            >

                <p className="text-sm leading-6 text-slate-500">
                    Use short channel codes like <span className="font-semibold text-slate-700">RTL</span>, <span className="font-semibold text-slate-700">WHL</span>, <span className="font-semibold text-slate-700">IND</span>, or <span className="font-semibold text-slate-700">PL</span>.
                </p>

                <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Buyer Channel Eyebrow</label>
                    <input
                        type="text"
                        value={buyerChannelEyebrow}
                        onChange={e => updateContent({ destinationEyebrow: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-earth-500 outline-none"
                    />
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Section Title</label>
                    <input
                        type="text"
                        value={buyerChannelTitle}
                        onChange={e => updateContent({ mapSectionTitle: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-earth-500 outline-none"
                    />
                </div>

                <div className="space-y-3">
                    <label className="block text-sm font-bold text-slate-800">
                        Buyer Channels - fixed 4 rows
                    </label>
                    <div className="grid gap-4">
                        {buyerChannels.map((item, index) => (
                            <div key={index} className="space-y-4 rounded-xl border border-slate-200 bg-white/70 p-4">
                                <div className="border-b border-slate-100 pb-3">
                                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                        Buyer Channel {index + 1}
                                    </p>
                                    <h4 className="text-sm font-bold text-slate-800">{item.countryName}</h4>
                                </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-slate-500">Channel Name</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Retail"
                                        value={item.countryName}
                                        onChange={e => updateBuyerChannel(index, { countryName: e.target.value })}
                                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-earth-500"
                                    />
                                </div>
                                <div>
                                    <div className="mb-1 flex items-center justify-between">
                                        <label className="block text-xs font-medium text-slate-500">Channel Code</label>
                                        <span className="text-[10px] font-normal text-slate-400">Short code</span>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="RTL"
                                        value={item.mapCoordinatesId}
                                        onChange={e => updateBuyerChannel(index, { mapCoordinatesId: e.target.value })}
                                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-earth-500 uppercase"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-medium text-slate-500">Channel Description</label>
                                <textarea
                                    rows={2}
                                    value={item.tooltipDescription}
                                    onChange={e => updateBuyerChannel(index, { tooltipDescription: e.target.value })}
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none resize-none focus:border-earth-500"
                                />
                            </div>

                            <ImageUploader
                                label="Destination Image"
                                value={item.image || ""}
                                onChange={url => updateBuyerChannel(index, { image: url })}
                            />
                            </div>
                        ))}
                    </div>
                </div>
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
