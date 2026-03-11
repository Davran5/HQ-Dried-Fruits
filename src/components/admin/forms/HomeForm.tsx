import React from "react";
import { HomeContent, HomeExportMarketItem, ImageLabelPair, StatItem, ProductCategoryItem } from "@/src/types/page";
import { ImageUploader } from "@/src/components/admin/ImageUploader";
import { Repeater } from "@/src/components/admin/Repeater";
import { FormSection } from "@/src/components/admin/forms/FormSection";

interface Props {
    content: HomeContent;
    updateContent: (updates: Partial<HomeContent>) => void;
}

export function HomeForm({ content, updateContent }: Props) {
    return (
        <div className="space-y-8">
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

                <Repeater<ImageLabelPair>
                    label="Progress Slider"
                    items={content.progressSlider || []}
                    emptyItem={{ image: "", label: "" }}
                    onUpdate={(items) => updateContent({ progressSlider: items })}
                    renderItem={(item, index, updateItem) => (
                        <div className="space-y-4">
                            <ImageUploader
                                label={`Thumbnail Image ${index + 1}`}
                                value={item.image}
                                onChange={url => updateItem(index, "image", url)}
                            />
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">Label Text</label>
                                <input
                                    type="text"
                                    value={item.label}
                                    onChange={e => updateItem(index, "label", e.target.value)}
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-earth-500"
                                />
                            </div>
                        </div>
                    )}
                />
            </FormSection>

            <FormSection title="2. Introduction (About Us)" defaultOpen={false}>

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
                    label="Product Categories Grid (Exactly 3 items)"
                    items={content.productCategories || []}
                    emptyItem={{ categoryName: "", image: "", shortDescription: "", url: "" }}
                    onUpdate={(items) => updateContent({ productCategories: items.slice(0, 3) })}
                    renderItem={(item, index, updateItem) => (
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
                                <label className="block text-xs font-medium text-slate-500 mb-1">Learn More URL</label>
                                <input
                                    type="text"
                                    value={item.url}
                                    onChange={e => updateItem(index, "url", e.target.value)}
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none"
                                />
                            </div>
                        </div>
                    )}
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

            <FormSection title="5. Supply Reach" defaultOpen={false}>

                <ImageUploader
                    label="Background Image"
                    value={content.supplyReachBgImage || ""}
                    onChange={url => updateContent({ supplyReachBgImage: url })}
                />

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Section Title</label>
                    <input
                        type="text"
                        value={content.supplyReachTitle || ""}
                        onChange={e => updateContent({ supplyReachTitle: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-earth-500 outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Global Reach Overview</label>
                    <textarea
                        rows={4}
                        value={content.supplyReachOverview || ""}
                        onChange={e => updateContent({ supplyReachOverview: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-earth-500 outline-none resize-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Section Button Label</label>
                    <input
                        type="text"
                        value={content.supplyReachButtonLabel || ""}
                        onChange={e => updateContent({ supplyReachButtonLabel: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-earth-500 outline-none"
                    />
                </div>
            </FormSection>

            <FormSection title="6. Final Order CTA" defaultOpen={false}>

                <ImageUploader
                    label="Background Image"
                    value={content.ctaBgImage || ""}
                    onChange={url => updateContent({ ctaBgImage: url })}
                />

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Main Heading</label>
                    <input
                        type="text"
                        value={content.ctaHeading || ""}
                        onChange={e => updateContent({ ctaHeading: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-earth-500 outline-none"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Subheading</label>
                    <input
                        type="text"
                        value={content.ctaSubheading || ""}
                        onChange={e => updateContent({ ctaSubheading: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-earth-500 outline-none"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Button Text</label>
                        <input
                            type="text"
                            value={content.ctaButtonText || ""}
                            onChange={e => updateContent({ ctaButtonText: e.target.value })}
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Button URL</label>
                        <input
                            type="text"
                            value={content.ctaButtonUrl || ""}
                            onChange={e => updateContent({ ctaButtonUrl: e.target.value })}
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Secondary Link Label</label>
                    <input
                        type="text"
                        value={content.ctaLinkLabel || ""}
                        onChange={e => updateContent({ ctaLinkLabel: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-earth-500 outline-none"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Email Placeholder</label>
                        <input
                            type="text"
                            value={content.ctaEmailPlaceholder || ""}
                            onChange={e => updateContent({ ctaEmailPlaceholder: e.target.value })}
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Submitting Label</label>
                        <input
                            type="text"
                            value={content.ctaSubmittingLabel || ""}
                            onChange={e => updateContent({ ctaSubmittingLabel: e.target.value })}
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none"
                        />
                    </div>
                </div>
            </FormSection>
        </div>
    );
}
