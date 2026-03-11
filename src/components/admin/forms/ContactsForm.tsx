import React from "react";
import { ContactsContent } from "@/src/types/page";
import { ImageUploader } from "@/src/components/admin/ImageUploader";
import { FormSection } from "@/src/components/admin/forms/FormSection";

interface Props {
    content: ContactsContent;
    updateContent: (updates: Partial<ContactsContent>) => void;
}

export function ContactsForm({ content, updateContent }: Props) {
    return (
        <div className="space-y-8">            <FormSection title="1. Split Interaction Grid - Communication Hub">

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
                    <label className="block text-sm font-medium text-slate-700 mb-1">High-level Introduction</label>
                    <textarea
                        rows={4}
                        value={content.introText || ""}
                        onChange={e => updateContent({ introText: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-earth-500 outline-none resize-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Form Destination Email</label>
                    <input
                        type="email"
                        value={content.formDestinationEmail || ""}
                        onChange={e => updateContent({ formDestinationEmail: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-earth-500 outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Form Title</label>
                    <input
                        type="text"
                        value={content.contactFormTitle || ""}
                        onChange={e => updateContent({ contactFormTitle: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-earth-500 outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Response Prefix</label>
                    <input
                        type="text"
                        value={content.responseLabelPrefix || ""}
                        onChange={e => updateContent({ responseLabelPrefix: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-earth-500 outline-none"
                    />
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Name Field Label</label>
                        <input
                            type="text"
                            value={content.formNameLabel || ""}
                            onChange={e => updateContent({ formNameLabel: e.target.value })}
                            className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-earth-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Company Field Label</label>
                        <input
                            type="text"
                            value={content.formCompanyLabel || ""}
                            onChange={e => updateContent({ formCompanyLabel: e.target.value })}
                            className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-earth-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email Field Label</label>
                        <input
                            type="text"
                            value={content.formEmailLabel || ""}
                            onChange={e => updateContent({ formEmailLabel: e.target.value })}
                            className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-earth-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Message Field Label</label>
                        <input
                            type="text"
                            value={content.formMessageLabel || ""}
                            onChange={e => updateContent({ formMessageLabel: e.target.value })}
                            className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-earth-500 outline-none"
                        />
                    </div>
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
            </FormSection>
            <FormSection title="2. Info Blocks (2x2 Grid)" defaultOpen={false}>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email Card Label</label>
                        <input
                            type="text"
                            value={content.infoEmailLabel || ""}
                            onChange={e => updateContent({ infoEmailLabel: e.target.value })}
                            className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-earth-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Phone Card Label</label>
                        <input
                            type="text"
                            value={content.infoPhoneLabel || ""}
                            onChange={e => updateContent({ infoPhoneLabel: e.target.value })}
                            className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-earth-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Address Card Label</label>
                        <input
                            type="text"
                            value={content.infoAddressLabel || ""}
                            onChange={e => updateContent({ infoAddressLabel: e.target.value })}
                            className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-earth-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Hours Card Label</label>
                        <input
                            type="text"
                            value={content.infoHoursLabel || ""}
                            onChange={e => updateContent({ infoHoursLabel: e.target.value })}
                            className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-earth-500 outline-none"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                        <input
                            type="email"
                            value={content.emailAddress || ""}
                            onChange={e => updateContent({ emailAddress: e.target.value })}
                            className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-earth-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                        <input
                            type="text"
                            value={content.phoneNumber || ""}
                            onChange={e => updateContent({ phoneNumber: e.target.value })}
                            className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-earth-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Office Address</label>
                        <input
                            type="text"
                            value={content.officeAddress || ""}
                            onChange={e => updateContent({ officeAddress: e.target.value })}
                            className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-earth-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Working Hours</label>
                        <input
                            type="text"
                            value={content.workingHours || ""}
                            onChange={e => updateContent({ workingHours: e.target.value })}
                            className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-earth-500 outline-none"
                        />
                    </div>
                </div>
            </FormSection>
            <FormSection title="3. Brand Imagery & Local Map" defaultOpen={false}>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Social Section Title</label>
                    <input
                        type="text"
                        value={content.socialSectionTitle || ""}
                        onChange={e => updateContent({ socialSectionTitle: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-earth-500 outline-none block"
                    />
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Telegram URL</label>
                        <input
                            type="text"
                            value={content.telegramUrl || ""}
                            onChange={e => updateContent({ telegramUrl: e.target.value })}
                            className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-earth-500 outline-none block"
                            placeholder="https://t.me/yourhandle"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Instagram URL</label>
                        <input
                            type="text"
                            value={content.instagramUrl || ""}
                            onChange={e => updateContent({ instagramUrl: e.target.value })}
                            className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-earth-500 outline-none block"
                            placeholder="https://instagram.com/yourhandle"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">WhatsApp URL</label>
                        <input
                            type="text"
                            value={content.whatsappUrl || ""}
                            onChange={e => updateContent({ whatsappUrl: e.target.value })}
                            className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-earth-500 outline-none block"
                            placeholder="https://wa.me/998..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Facebook URL</label>
                        <input
                            type="text"
                            value={content.facebookUrl || ""}
                            onChange={e => updateContent({ facebookUrl: e.target.value })}
                            className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-earth-500 outline-none block"
                            placeholder="https://facebook.com/yourpage"
                        />
                    </div>
                </div>

                <ImageUploader
                    label="Large-Scale Headquarters Image"
                    value={content.headquartersImage || ""}
                    onChange={url => updateContent({ headquartersImage: url })}
                />

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Map Pin Label</label>
                    <input
                        type="text"
                        value={content.mapPinLabel || ""}
                        onChange={e => updateContent({ mapPinLabel: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-earth-500 outline-none block"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Google Maps Embed URL / iframe SRC</label>
                    <input
                        type="text"
                        value={content.googleMapsUrl || ""}
                        onChange={e => updateContent({ googleMapsUrl: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-earth-500 outline-none block"
                        placeholder="https://www.google.com/maps/embed?..."
                    />
                </div>
            </FormSection>
        </div>
    );
}
