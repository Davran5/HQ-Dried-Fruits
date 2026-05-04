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
                    emptyItem={{ categoryName: "", image: "", shortDescription: "", url: "", nutrition: { energy: "", protein: "", fat: "", carbs: "" } }}
                    onUpdate={(items) => updateContent({ productCategories: items.slice(0, 4) })}
                    renderItem={(item, index, updateItem, replaceItem) => (
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
                            <div className="rounded-lg border border-slate-200 bg-white/70 p-3">
                                <h5 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-500">
                                    Nutritional Facts (per 100g)
                                </h5>
                                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                                    {[
                                        ["energy", "Energy"],
                                        ["protein", "Protein"],
                                        ["fat", "Fat"],
                                        ["carbs", "Carbs"],
                                    ].map(([key, label]) => (
                                        <div key={key}>
                                            <label className="block text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-1">{label}</label>
                                            <input
                                                type="text"
                                                value={item.nutrition?.[key as keyof NonNullable<ProductCategoryItem["nutrition"]>] || ""}
                                                onChange={e => replaceItem(index, {
                                                    ...item,
                                                    nutrition: {
                                                        energy: item.nutrition?.energy || "",
                                                        protein: item.nutrition?.protein || "",
                                                        fat: item.nutrition?.fat || "",
                                                        carbs: item.nutrition?.carbs || "",
                                                        [key]: e.target.value,
                                                    },
                                                })}
                                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-earth-500"
                                                placeholder={key === "energy" ? "280 kcal" : "2.5 g"}
                                            />
                                        </div>
                                    ))}
                                </div>
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

        </div>
    );
}
