import React from "react";
import { HomeContent, HomeExportMarketItem, StatItem, ProductCategoryItem } from "@/src/types/page";
import { ImageUploader } from "@/src/components/admin/ImageUploader";
import { Repeater } from "@/src/components/admin/Repeater";
import { FormSection } from "@/src/components/admin/forms/FormSection";
import { Select } from "@/src/components/ui/Select";
import { useAdminLanguage } from "@/src/contexts/AdminLanguageContext";
import { t as translate } from "@/src/i18n";
import { normalizeHomeBuyerChannels } from "@/src/lib/buyerChannels";
import { getProductCategoryLabel, getProductCategorySelectOptions, resolveProductCategoryKey } from "@/src/lib/productCategories";

interface Props {
    content: HomeContent;
    updateContent: (updates: Partial<HomeContent>) => void;
}

export function HomeForm({ content, updateContent }: Props) {
    const { editingLang } = useAdminLanguage();
    const categoryOptions = getProductCategorySelectOptions(editingLang);
    const buyerChannels = normalizeHomeBuyerChannels(content.exportMarkets, editingLang);
    const buyerChannelsEyebrow = content.exportMarketsEyebrow || translate(editingLang, "homeExportFocusEyebrow");
    const buyerChannelsTitle = content.exportMarketsTitle || translate(editingLang, "homeExportMarketsTitle");
    const buyerChannelsIntro = content.exportMarketsIntro || translate(editingLang, "homeExportMarketsIntro");
    const updateBuyerChannel = (index: number, updates: Partial<HomeExportMarketItem>) => {
        updateContent({
            exportMarkets: buyerChannels.map((item, candidateIndex) =>
                candidateIndex === index ? { ...item, ...updates } : item,
            ),
        });
    };

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
                    onUpdate={(items) => updateContent({ statsGrid: items.slice(0, 4) })}
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

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Card Eyebrow Label</label>
                        <input
                            type="text"
                            value={content.productPreviewCategoryLabel || ""}
                            onChange={e => updateContent({ productPreviewCategoryLabel: e.target.value })}
                            className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-earth-500 outline-none"
                            placeholder="Product Category"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Types Column Label</label>
                        <input
                            type="text"
                            value={content.productPreviewTypesLabel || ""}
                            onChange={e => updateContent({ productPreviewTypesLabel: e.target.value })}
                            className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-earth-500 outline-none"
                            placeholder="Types"
                        />
                    </div>
                </div>

                <Repeater<ProductCategoryItem>
                    label="Product Categories Grid (Maximum 4 items)"
                    items={content.productCategories || []}
                    emptyItem={{ categoryKey: "", categoryName: "", image: "", shortDescription: "", variantSummary: "", url: "" }}
                    onUpdate={(items) => updateContent({ productCategories: items.slice(0, 4) })}
                    renderItem={(item, index, updateItem, replaceItem) => {
                        const selectedCategoryKey = item.categoryKey || resolveProductCategoryKey(item.categoryName) || "";

                        return (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">Category</label>
                                    <Select
                                        value={selectedCategoryKey}
                                        onChange={(value) =>
                                            replaceItem(index, {
                                                ...item,
                                                categoryKey: value,
                                                categoryName: getProductCategoryLabel(value, editingLang),
                                                url: "/products",
                                            })
                                        }
                                        options={categoryOptions}
                                        placeholder="Select category"
                                        className="border-slate-300 bg-white py-2.5 text-sm"
                                    />
                                    {selectedCategoryKey && (
                                        <p className="mt-1 text-xs text-slate-500">
                                            Public label: {getProductCategoryLabel(selectedCategoryKey, editingLang)}
                                        </p>
                                    )}
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
                                    <label className="block text-xs font-medium text-slate-500 mb-1">Variant Summary / Examples</label>
                                    <input
                                        type="text"
                                        value={item.variantSummary || ""}
                                        onChange={e => updateItem(index, "variantSummary", e.target.value)}
                                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none"
                                        placeholder="e.g. Golden, Sultana, Soyaki, Black-Red"
                                    />
                                </div>
                            </div>
                        );
                    }}
                />
            </FormSection>

            <FormSection title="4. Buyer Channels" defaultOpen={false}>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Eyebrow Label</label>
                    <input
                        type="text"
                        value={buyerChannelsEyebrow}
                        onChange={e => updateContent({ exportMarketsEyebrow: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-earth-500 outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Section Title</label>
                    <input
                        type="text"
                        value={buyerChannelsTitle}
                        onChange={e => updateContent({ exportMarketsTitle: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-earth-500 outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Intro Text</label>
                    <textarea
                        rows={4}
                        value={buyerChannelsIntro}
                        onChange={e => updateContent({ exportMarketsIntro: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-earth-500 outline-none resize-none"
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
                                    <label className="block text-xs font-medium text-slate-500 mb-1">Channel Name</label>
                                    <input
                                        type="text"
                                        value={item.countryName}
                                        onChange={e => updateBuyerChannel(index, { countryName: e.target.value })}
                                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">Stat Label</label>
                                    <input
                                        type="text"
                                        value={item.statLabel}
                                        onChange={e => updateBuyerChannel(index, { statLabel: e.target.value })}
                                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">Short Description</label>
                                <textarea
                                    rows={3}
                                    value={item.shortDescription}
                                    onChange={e => updateBuyerChannel(index, { shortDescription: e.target.value })}
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none resize-none"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">Stat Value</label>
                                    <input
                                        type="text"
                                        value={item.statValue}
                                        onChange={e => updateBuyerChannel(index, { statValue: e.target.value })}
                                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none"
                                    />
                                </div>
                                <ImageUploader
                                    label="Buyer Channel Image"
                                    value={item.image}
                                    onChange={url => updateBuyerChannel(index, { image: url })}
                                />
                            </div>
                            </div>
                        ))}
                    </div>
                </div>
            </FormSection>

        </div>
    );
}
