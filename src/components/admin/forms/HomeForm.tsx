import React from "react";
import { HomeContent, HomeExportMarketItem, StatItem, ProductCategoryItem } from "@/src/types/page";
import { ImageUploader } from "@/src/components/admin/ImageUploader";
import { Repeater } from "@/src/components/admin/Repeater";
import { FormSection } from "@/src/components/admin/forms/FormSection";

interface Props {
    content: HomeContent;
    updateContent: (updates: Partial<HomeContent>) => void;
}

export function HomeForm({ content, updateContent }: Props) {
    return (
        <div className="space-y-4">
            <FormSection title="1. Hero Orchard Section">

                <ImageUploader
                    label="Background Image/Video"
                    value={content.heroBgImage || ""}
                    onChange={url => updateContent({ heroBgImage: url })}
                />

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Welcome Title</label>
                    <input
                        type="text"
                        value={content.heroTitle || ""}
                        onChange={e => updateContent({ heroTitle: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-earth-500 outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Subtitle</label>
                    <input
                        type="text"
                        value={content.heroSubtitle || ""}
                        onChange={e => updateContent({ heroSubtitle: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-earth-500 outline-none"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Primary CTA Label</label>
                        <input
                            type="text"
                            value={content.heroPrimaryCtaLabel || ""}
                            onChange={e => updateContent({ heroPrimaryCtaLabel: e.target.value })}
                            className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-earth-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Secondary CTA Label</label>
                        <input
                            type="text"
                            value={content.heroSecondaryCtaLabel || ""}
                            onChange={e => updateContent({ heroSecondaryCtaLabel: e.target.value })}
                            className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-earth-500 outline-none"
                        />
                    </div>
                </div>

            </FormSection>

            <FormSection title="2. Introduction (About Us)" defaultOpen={false}>

                <ImageUploader
                    label="About Section Image"
                    value={content.introImage || ""}
                    onChange={url => updateContent({ introImage: url })}
                />

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Eyebrow Text Above Title</label>
                    <input
                        type="text"
                        value={content.introEyebrow || ""}
                        onChange={e => updateContent({ introEyebrow: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-earth-500 outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Side-Label</label>
                    <input
                        type="text"
                        value={content.introLabel || ""}
                        onChange={e => updateContent({ introLabel: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-earth-500 outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Main Introduction Text</label>
                    <textarea
                        rows={4}
                        value={content.introText || ""}
                        onChange={e => updateContent({ introText: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-earth-500 outline-none resize-none"
                    />
                </div>

                <Repeater<StatItem>
                    label="2x2 Stats Grid (Maximum 4)"
                    items={content.statsGrid || []}
                    emptyItem={{ value: "", label: "" }}
                    onUpdate={(items) => updateContent({ statsGrid: items.slice(0, 4) })} // Enforce 4 constraint logic if needed, or just let them add
                    renderItem={(item, index, updateItem) => (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">Number/Value</label>
                                <input
                                    type="text"
                                    value={item.value}
                                    onChange={e => updateItem(index, "value", e.target.value)}
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">Stat Label</label>
                                <input
                                    type="text"
                                    value={item.label}
                                    onChange={e => updateItem(index, "label", e.target.value)}
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none"
                                />
                            </div>
                        </div>
                    )}
                />
            </FormSection>

            <FormSection title="3. Product Preview" defaultOpen={false}>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Section Title</label>
                    <input
                        type="text"
                        value={content.productPreviewTitle || ""}
                        onChange={e => updateContent({ productPreviewTitle: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-earth-500 outline-none"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Section Button Label</label>
                        <input
                            type="text"
                            value={content.productPreviewButtonLabel || ""}
                            onChange={e => updateContent({ productPreviewButtonLabel: e.target.value })}
                            className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-earth-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Card CTA Label</label>
                        <input
                            type="text"
                            value={content.productPreviewItemCtaLabel || ""}
                            onChange={e => updateContent({ productPreviewItemCtaLabel: e.target.value })}
                            className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-earth-500 outline-none"
                        />
                    </div>
                </div>

                <Repeater<ProductCategoryItem>
                    label="Product Categories Grid (Maximum 4 items)"
                    items={content.productCategories || []}
                    emptyItem={{ categoryName: "", image: "", shortDescription: "", variantSummary: "", infoItems: [], url: "" }}
                    onUpdate={(items) => updateContent({ productCategories: items.slice(0, 4) })}
                    renderItem={(item, index, updateItem, replaceItem) => {
                        const infoItems = (item.infoItems || []).slice(0, 5);
                        const replaceInfoItems = (nextInfoItems: NonNullable<ProductCategoryItem["infoItems"]>) => {
                            replaceItem(index, { ...item, infoItems: nextInfoItems.slice(0, 5) });
                        };

                        return (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">Category Name</label>
                                    <input
                                        type="text"
                                        value={item.categoryName}
                                        onChange={e => updateItem(index, "categoryName", e.target.value)}
                                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none"
                                    />
                                </div>
                                <ImageUploader
                                    label={`Thumbnail Image ${index + 1}`}
                                    value={item.image}
                                    onChange={url => updateItem(index, "image", url)}
                                />
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">Short Description</label>
                                    <textarea
                                        rows={2}
                                        value={item.shortDescription}
                                        onChange={e => updateItem(index, "shortDescription", e.target.value)}
                                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none resize-none"
                                    />
                                </div>
                                <div>
                                    <div className="mb-2 flex items-center justify-between gap-3">
                                        <label className="block text-xs font-medium text-slate-500">Card Info Labels (Maximum 5)</label>
                                        <button
                                            type="button"
                                            onClick={() => replaceInfoItems([...infoItems, { label: "", value: "" }])}
                                            disabled={infoItems.length >= 5}
                                            className="rounded-md border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 transition-colors hover:border-earth-400 hover:text-earth-700 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            Add Info
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        {infoItems.length === 0 ? (
                                            <div className="rounded-md border border-dashed border-slate-300 py-3 text-center text-sm text-slate-500">
                                                No card info added yet.
                                            </div>
                                        ) : (
                                            infoItems.map((info, infoIndex) => (
                                                <div key={infoIndex} className="grid gap-2 rounded-lg border border-slate-200 bg-white/70 p-2 md:grid-cols-[0.85fr_1.15fr_auto]">
                                                    <input
                                                        type="text"
                                                        value={info.label}
                                                        onChange={e => {
                                                            const next = [...infoItems];
                                                            next[infoIndex] = { ...info, label: e.target.value };
                                                            replaceInfoItems(next);
                                                        }}
                                                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none"
                                                        placeholder="Label, e.g. Grade"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={info.value}
                                                        onChange={e => {
                                                            const next = [...infoItems];
                                                            next[infoIndex] = { ...info, value: e.target.value };
                                                            replaceInfoItems(next);
                                                        }}
                                                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none"
                                                        placeholder="Info, e.g. Highest"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => replaceInfoItems(infoItems.filter((_, candidateIndex) => candidateIndex !== infoIndex))}
                                                        className="rounded-md border border-red-200 px-3 py-2 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                    <p className="mt-2 text-xs text-slate-500">These rows replace the old nutritional facts on the public homepage card.</p>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">Legacy Variant Summary / Fallback</label>
                                    <input
                                        type="text"
                                        value={item.variantSummary || ""}
                                        onChange={e => updateItem(index, "variantSummary", e.target.value)}
                                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none"
                                        placeholder="Used only if no info rows are added"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">Learn More URL</label>
                                    <input
                                        type="text"
                                        value={item.url}
                                        onChange={e => updateItem(index, "url", e.target.value)}
                                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none"
                                    />
                                </div>
                            </div>
                        );
                    }}
                />
            </FormSection>

            <FormSection title="4. Export Markets" defaultOpen={false}>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Eyebrow Label</label>
                    <input
                        type="text"
                        value={content.exportMarketsEyebrow || ""}
                        onChange={e => updateContent({ exportMarketsEyebrow: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-earth-500 outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Section Title</label>
                    <input
                        type="text"
                        value={content.exportMarketsTitle || ""}
                        onChange={e => updateContent({ exportMarketsTitle: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-earth-500 outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Intro Text</label>
                    <textarea
                        rows={4}
                        value={content.exportMarketsIntro || ""}
                        onChange={e => updateContent({ exportMarketsIntro: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-earth-500 outline-none resize-none"
                    />
                </div>

                <Repeater<HomeExportMarketItem>
                    label="Country Buttons / Map States"
                    items={content.exportMarkets || []}
                    emptyItem={{ countryName: "", shortDescription: "", statLabel: "", statValue: "", image: "" }}
                    onUpdate={(items) => updateContent({ exportMarkets: items })}
                    renderItem={(item, index, updateItem) => (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">Country Name</label>
                                    <input
                                        type="text"
                                        value={item.countryName}
                                        onChange={e => updateItem(index, "countryName", e.target.value)}
                                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">Stat Label</label>
                                    <input
                                        type="text"
                                        value={item.statLabel}
                                        onChange={e => updateItem(index, "statLabel", e.target.value)}
                                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">Short Description</label>
                                <textarea
                                    rows={3}
                                    value={item.shortDescription}
                                    onChange={e => updateItem(index, "shortDescription", e.target.value)}
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none resize-none"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">Stat Value</label>
                                    <input
                                        type="text"
                                        value={item.statValue}
                                        onChange={e => updateItem(index, "statValue", e.target.value)}
                                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none"
                                    />
                                </div>
                                <ImageUploader
                                    label="Map / Market Image"
                                    value={item.image}
                                    onChange={url => updateItem(index, "image", url)}
                                />
                            </div>
                        </div>
                    )}
                />
            </FormSection>

        </div>
    );
}
