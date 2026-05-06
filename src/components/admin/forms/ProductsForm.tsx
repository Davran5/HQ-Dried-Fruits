import React from "react";
import { ProductsContent } from "@/src/types/page";
import { ImageUploader } from "@/src/components/admin/ImageUploader";
import { Repeater } from "@/src/components/admin/Repeater";
import { FormSection } from "@/src/components/admin/forms/FormSection";
import { RichTextEditor } from "@/src/components/admin/forms/RichTextEditor";

interface Props {
    content: ProductsContent;
    updateContent: (updates: Partial<ProductsContent>) => void;
    catalogSlot?: React.ReactNode;
}

export function ProductsForm({ content, updateContent, catalogSlot }: Props) {
    return (
        <div className="space-y-4">
            <FormSection title="1. Hero">
                <ImageUploader
                    label="Hero Background Image"
                    value={content.heroBgImage || ""}
                    onChange={url => updateContent({ heroBgImage: url })}
                    placeholder="Upload the full-width image shown behind the page title"
                />

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Page Title</label>
                    <input
                        type="text"
                        value={content.pageTitle || ""}
                        onChange={e => updateContent({ pageTitle: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-earth-500 outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Page Subtitle</label>
                    <input
                        type="text"
                        value={content.pageSubtitle || ""}
                        onChange={e => updateContent({ pageSubtitle: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-earth-500 outline-none"
                    />
                </div>

            </FormSection>

            <FormSection title="2. Intro / Origin Card" defaultOpen={false}>
                <ImageUploader
                    label="Intro Showcase Image"
                    value={content.introImage || ""}
                    onChange={url => updateContent({ introImage: url })}
                    placeholder="Optional. If empty, the first product image is used."
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
                    <label className="block text-sm font-medium text-slate-700 mb-1">Intro Title</label>
                    <input
                        type="text"
                        value={content.introTitle || ""}
                        onChange={e => updateContent({ introTitle: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-earth-500 outline-none"
                    />
                </div>

                <RichTextEditor
                    label="Intro Body Text"
                    value={content.introContent || ""}
                    onChange={val => updateContent({ introContent: val })}
                />

                <Repeater
                    label="Three Intro Fact Cards"
                    items={content.introFacts || []}
                    emptyItem={{ title: "", description: "" }}
                    onUpdate={(items) => updateContent({ introFacts: items.slice(0, 3) })}
                    renderItem={(item, index, updateItem) => (
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">Card Title</label>
                                <input
                                    type="text"
                                    value={item.title}
                                    onChange={e => updateItem(index, "title", e.target.value)}
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">Card Description</label>
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
            </FormSection>

            {catalogSlot}

            <FormSection title="4. Ordering Hub (Bulk Requests)" defaultOpen={false}>
                <ImageUploader
                    label="Background Image"
                    value={content.orderingBgImage || ""}
                    onChange={url => updateContent({ orderingBgImage: url })}
                />

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Form Title</label>
                    <input
                        type="text"
                        value={content.orderingFormTitle || ""}
                        onChange={e => updateContent({ orderingFormTitle: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-earth-500 outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Form Subtitle</label>
                    <input
                        type="text"
                        value={content.orderingFormSubtitle || ""}
                        onChange={e => updateContent({ orderingFormSubtitle: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-earth-500 outline-none"
                    />
                </div>

                <div className="grid grid-cols-1 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Step 1 Prompt</label>
                        <input
                            type="text"
                            value={content.stepOneLabel || ""}
                            onChange={e => updateContent({ stepOneLabel: e.target.value })}
                            className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-earth-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Step 2 Prompt</label>
                        <input
                            type="text"
                            value={content.stepTwoLabel || ""}
                            onChange={e => updateContent({ stepTwoLabel: e.target.value })}
                            className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-earth-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Step 3 Prompt</label>
                        <input
                            type="text"
                            value={content.stepThreeLabel || ""}
                            onChange={e => updateContent({ stepThreeLabel: e.target.value })}
                            className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-earth-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Mixed Container Label</label>
                        <input
                            type="text"
                            value={content.mixedContainerLabel || ""}
                            onChange={e => updateContent({ mixedContainerLabel: e.target.value })}
                            className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-earth-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Catalog Button Label</label>
                        <input
                            type="text"
                            value={content.viewSpecsLabel || ""}
                            onChange={e => updateContent({ viewSpecsLabel: e.target.value })}
                            className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-earth-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Step 1 Placeholder</label>
                        <input
                            type="text"
                            value={content.stepOnePlaceholder || ""}
                            onChange={e => updateContent({ stepOnePlaceholder: e.target.value })}
                            className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-earth-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Step 3 Placeholder</label>
                        <input
                            type="text"
                            value={content.stepThreePlaceholder || ""}
                            onChange={e => updateContent({ stepThreePlaceholder: e.target.value })}
                            className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-earth-500 outline-none"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Step Button Label</label>
                            <input
                                type="text"
                                value={content.nextStepButtonLabel || ""}
                                onChange={e => updateContent({ nextStepButtonLabel: e.target.value })}
                                className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-earth-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Back Button Label</label>
                            <input
                                type="text"
                                value={content.backButtonLabel || ""}
                                onChange={e => updateContent({ backButtonLabel: e.target.value })}
                                className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-earth-500 outline-none"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Submit Button Label</label>
                            <input
                                type="text"
                                value={content.submitButtonLabel || ""}
                                onChange={e => updateContent({ submitButtonLabel: e.target.value })}
                                className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-earth-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Submitting Label</label>
                            <input
                                type="text"
                                value={content.submittingButtonLabel || ""}
                                onChange={e => updateContent({ submittingButtonLabel: e.target.value })}
                                className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-earth-500 outline-none"
                            />
                        </div>
                    </div>
                </div>

                <Repeater<string>
                    label="Volume Options"
                    items={content.volumeOptions || []}
                    emptyItem={""}
                    onUpdate={(items) => updateContent({ volumeOptions: items })}
                    renderItem={(item, index, _updateItem, replaceItem) => (
                        <input
                            type="text"
                            value={item}
                            onChange={e => replaceItem(index, e.target.value)}
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none"
                            placeholder="e.g. 1 FCL (20ft)"
                        />
                    )}
                />
            </FormSection>

            <FormSection title="5. Quick Contacts" defaultOpen={false}>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Section Title</label>
                        <input
                            type="text"
                            value={content.quickContactTitle || ""}
                            onChange={e => updateContent({ quickContactTitle: e.target.value })}
                            className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-earth-500 outline-none"
                            placeholder="e.g. Need it faster?"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Section Subtitle</label>
                        <input
                            type="text"
                            value={content.quickContactSubtitle || ""}
                            onChange={e => updateContent({ quickContactSubtitle: e.target.value })}
                            className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-earth-500 outline-none"
                            placeholder="e.g. Skip the form..."
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Telegram Label</label>
                        <input
                            type="text"
                            value={content.telegramLabel || ""}
                            onChange={e => updateContent({ telegramLabel: e.target.value })}
                            className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-earth-500 outline-none"
                            placeholder="e.g. Telegram Bot"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Telegram Sublabel</label>
                        <input
                            type="text"
                            value={content.telegramSublabel || ""}
                            onChange={e => updateContent({ telegramSublabel: e.target.value })}
                            className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-earth-500 outline-none"
                            placeholder="e.g. Instant quotes..."
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Call Card Label</label>
                        <input
                            type="text"
                            value={content.callLabel || ""}
                            onChange={e => updateContent({ callLabel: e.target.value })}
                            className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-earth-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email Card Label</label>
                        <input
                            type="text"
                            value={content.emailLabel || ""}
                            onChange={e => updateContent({ emailLabel: e.target.value })}
                            className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-earth-500 outline-none"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Dedicated Phone Number</label>
                        <input
                            type="text"
                            value={content.quickPhone || ""}
                            onChange={e => updateContent({ quickPhone: e.target.value })}
                            className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-earth-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Dedicated Sales Email</label>
                        <input
                            type="text"
                            value={content.quickEmail || ""}
                            onChange={e => updateContent({ quickEmail: e.target.value })}
                            className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-earth-500 outline-none"
                        />
                    </div>
                </div>
            </FormSection>

            <FormSection title="6. Product Detail UI" defaultOpen={false}>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Loading Label</label>
                        <input
                            type="text"
                            value={content.detailUi?.loadingLabel || ""}
                            onChange={e => updateContent({ detailUi: { ...content.detailUi, loadingLabel: e.target.value } })}
                            className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-earth-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Not Found Title</label>
                        <input
                            type="text"
                            value={content.detailUi?.notFoundTitle || ""}
                            onChange={e => updateContent({ detailUi: { ...content.detailUi, notFoundTitle: e.target.value } })}
                            className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-earth-500 outline-none"
                        />
                    </div>
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Not Found Description</label>
                        <input
                            type="text"
                            value={content.detailUi?.notFoundBody || ""}
                            onChange={e => updateContent({ detailUi: { ...content.detailUi, notFoundBody: e.target.value } })}
                            className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-earth-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Back to Catalog Label</label>
                        <input
                            type="text"
                            value={content.detailUi?.backToCatalogLabel || ""}
                            onChange={e => updateContent({ detailUi: { ...content.detailUi, backToCatalogLabel: e.target.value } })}
                            className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-earth-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Product Info Title</label>
                        <input
                            type="text"
                            value={content.detailUi?.nutritionTitle || ""}
                            onChange={e => updateContent({ detailUi: { ...content.detailUi, nutritionTitle: e.target.value } })}
                            className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-earth-500 outline-none"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Product Info Subtitle</label>
                        <input
                            type="text"
                            value={content.detailUi?.nutritionPerLabel || ""}
                            onChange={e => updateContent({ detailUi: { ...content.detailUi, nutritionPerLabel: e.target.value } })}
                            className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-earth-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Inquiry Title</label>
                        <input
                            type="text"
                            value={content.detailUi?.inquiryTitle || ""}
                            onChange={e => updateContent({ detailUi: { ...content.detailUi, inquiryTitle: e.target.value } })}
                            className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-earth-500 outline-none"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Legacy Field 1 Label</label>
                        <input
                            type="text"
                            value={content.detailUi?.caloriesLabel || ""}
                            onChange={e => updateContent({ detailUi: { ...content.detailUi, caloriesLabel: e.target.value } })}
                            className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-earth-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Legacy Field 2 Label</label>
                        <input
                            type="text"
                            value={content.detailUi?.proteinLabel || ""}
                            onChange={e => updateContent({ detailUi: { ...content.detailUi, proteinLabel: e.target.value } })}
                            className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-earth-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Legacy Field 3 Label</label>
                        <input
                            type="text"
                            value={content.detailUi?.fatLabel || ""}
                            onChange={e => updateContent({ detailUi: { ...content.detailUi, fatLabel: e.target.value } })}
                            className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-earth-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Legacy Field 4 Label</label>
                        <input
                            type="text"
                            value={content.detailUi?.carbsLabel || ""}
                            onChange={e => updateContent({ detailUi: { ...content.detailUi, carbsLabel: e.target.value } })}
                            className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-earth-500 outline-none"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Company Placeholder</label>
                        <input
                            type="text"
                            value={content.detailUi?.companyPlaceholder || ""}
                            onChange={e => updateContent({ detailUi: { ...content.detailUi, companyPlaceholder: e.target.value } })}
                            className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-earth-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email Placeholder</label>
                        <input
                            type="text"
                            value={content.detailUi?.emailPlaceholder || ""}
                            onChange={e => updateContent({ detailUi: { ...content.detailUi, emailPlaceholder: e.target.value } })}
                            className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-earth-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Message Placeholder</label>
                        <input
                            type="text"
                            value={content.detailUi?.volumePlaceholder || ""}
                            onChange={e => updateContent({ detailUi: { ...content.detailUi, volumePlaceholder: e.target.value } })}
                            className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-earth-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Inquiry Button Label</label>
                        <input
                            type="text"
                            value={content.detailUi?.inquiryButtonLabel || ""}
                            onChange={e => updateContent({ detailUi: { ...content.detailUi, inquiryButtonLabel: e.target.value } })}
                            className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-earth-500 outline-none"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Inquiry Submitting Label</label>
                    <input
                        type="text"
                        value={content.detailUi?.inquirySubmittingLabel || ""}
                        onChange={e => updateContent({ detailUi: { ...content.detailUi, inquirySubmittingLabel: e.target.value } })}
                        className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-earth-500 outline-none"
                    />
                </div>
            </FormSection>

        </div>
    );
}
