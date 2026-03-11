import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, Save, Globe, Layout, Mail, ChevronDown, Flag, Settings2 } from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { usePages } from "@/src/contexts/PageContext";
import { ImageUploader } from "@/src/components/admin/ImageUploader";
import { Repeater } from "@/src/components/admin/Repeater";
import { NavLink } from "@/src/types/page";

export function AdminGlobalSettings() {
    const { globalSettings, updateGlobalSettings } = usePages();
    const [settings, setSettings] = useState(globalSettings);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [activeSection, setActiveSection] = useState<string | null>("branding");    React.useEffect(() => {
        setSettings(globalSettings);
    }, [globalSettings]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await updateGlobalSettings(settings);
            setSuccessMessage("Global settings saved successfully!");
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (error) {
            console.error("Failed to save global settings:", error);
            alert("Failed to save global settings. Please try again.");
        }
    };

    const toggleSection = (id: string) => {
        setActiveSection(activeSection === id ? null : id);
    };

    const sections = [
        {
            id: "branding",
            title: "Header & Branding",
            description: "Customize your site logo and navigation menu.",
            icon: <Layout className="text-earth-500" size={20} />
        },
        {
            id: "footer",
            title: "Footer & Contact",
            description: "Manage footer information, contact details, and CTA forms.",
            icon: <Mail className="text-earth-500" size={20} />
        },
        {
            id: "seo",
            title: "SEO & Integrations",
            description: "Configure Google verification and global search settings.",
            icon: <Globe className="text-earth-500" size={20} />
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Global Settings</h2>
                    <p className="text-sm text-slate-500">Manage site-wide variables like Header & Footer.</p>
                </div>
            </div>

            <AnimatePresence>
                {successMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed top-4 right-4 z-[100] flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-3 text-emerald-800 shadow-lg border border-emerald-200"
                    >
                        <CheckCircle2 size={20} className="text-emerald-500" />
                        <span className="text-sm font-medium">{successMessage}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <form onSubmit={handleSave} className="space-y-4">
                {sections.map((section) => {
                    const isOpen = activeSection === section.id;
                    return (
                        <div
                            key={section.id}
                            className={`rounded-xl border transition-all duration-300 overflow-hidden ${isOpen ? 'border-earth-300 shadow-xl ring-1 ring-earth-500/10' : 'border-slate-200 bg-white shadow-sm hover:border-earth-200'}`}
                        >                            <div
                                onClick={() => toggleSection(section.id)}
                                className={`group flex items-center justify-between px-6 py-5 cursor-pointer select-none transition-colors ${isOpen ? 'bg-earth-50' : 'hover:bg-slate-50'}`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center transition-colors ${isOpen ? 'bg-earth-600 text-white shadow-lg shadow-earth-500/20' : 'bg-slate-100 text-slate-400 group-hover:bg-earth-100 group-hover:text-earth-600'}`}>
                                        {section.icon}
                                    </div>
                                    <div>
                                        <h3 className={`font-bold transition-colors ${isOpen ? 'text-earth-900' : 'text-slate-900'}`}>{section.title}</h3>
                                        <p className="text-xs text-slate-500 mt-0.5">{section.description}</p>
                                    </div>
                                </div>
                                <div className={`p-2 rounded-full transition-all duration-300 ${isOpen ? 'rotate-180 bg-earth-200 text-earth-700' : 'text-slate-400 group-hover:text-earth-600'}`}>
                                    <ChevronDown size={20} />
                                </div>
                            </div>                            <AnimatePresence initial={false}>
                                {isOpen && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                    >
                                        <div className="p-8 bg-slate-50/50 border-t border-slate-100 space-y-8">
                                            {section.id === "branding" && (
                                                <div className="space-y-8">
                                                    <ImageUploader
                                                        label="Main Branding Logo"
                                                        value={settings.headerLogo}
                                                        onChange={url => setSettings({ ...settings, headerLogo: url })}
                                                    />

                                                    <div>
                                                        <label className="block text-sm font-bold text-slate-700 mb-2">Site Name</label>
                                                        <input
                                                            type="text"
                                                            value={settings.siteName || ""}
                                                            onChange={e => setSettings({ ...settings, siteName: e.target.value })}
                                                            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-earth-500 outline-none transition-all"
                                                        />
                                                    </div>

                                                    <Repeater<NavLink>
                                                        label="Main Navigation Menu"
                                                        items={settings.navLinks || []}
                                                        emptyItem={{ label: "", url: "" }}
                                                        onUpdate={(items) => setSettings({ ...settings, navLinks: items })}
                                                        renderItem={(item, index, updateItem, replaceItem) => (
                                                            <div className="grid grid-cols-2 gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                                                <div>
                                                                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Display Label</label>
                                                                    <input
                                                                        type="text"
                                                                        value={item.label}
                                                                        onChange={e => updateItem(index, "label", e.target.value)}
                                                                        className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-900 focus:border-earth-500 outline-none"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Target URL</label>
                                                                    <input
                                                                        type="text"
                                                                        value={item.url}
                                                                        onChange={e => updateItem(index, "url", e.target.value)}
                                                                        className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-900 focus:border-earth-500 outline-none"
                                                                    />
                                                                </div>
                                                            </div>
                                                        )}
                                                    />

                                                    <div className="grid grid-cols-2 gap-6 pt-4">
                                                        <div>
                                                            <label className="block text-sm font-bold text-slate-700 mb-2">"Learn More" CTA Text</label>
                                                            <input
                                                                type="text"
                                                                value={settings.ctaText || ""}
                                                                onChange={e => setSettings({ ...settings, ctaText: e.target.value })}
                                                                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-earth-500 outline-none transition-all"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-bold text-slate-700 mb-2">"Learn More" CTA URL</label>
                                                            <input
                                                                type="text"
                                                                value={settings.ctaUrl || ""}
                                                                onChange={e => setSettings({ ...settings, ctaUrl: e.target.value })}
                                                                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-earth-500 outline-none transition-all"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                                                        <h4 className="font-bold text-slate-900">Shared Navigation Labels</h4>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Mobile Menu Title</label>
                                                                <input
                                                                    type="text"
                                                                    value={settings.uiLabels?.mobileNavigationTitle || ""}
                                                                    onChange={e => setSettings({ ...settings, uiLabels: { ...settings.uiLabels, mobileNavigationTitle: e.target.value } })}
                                                                    className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-900 focus:border-earth-500 outline-none"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Mobile Contact Title</label>
                                                                <input
                                                                    type="text"
                                                                    value={settings.uiLabels?.mobileContactTitle || ""}
                                                                    onChange={e => setSettings({ ...settings, uiLabels: { ...settings.uiLabels, mobileContactTitle: e.target.value } })}
                                                                    className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-900 focus:border-earth-500 outline-none"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Route Loading Label</label>
                                                                <input
                                                                    type="text"
                                                                    value={settings.uiLabels?.routeLoadingLabel || ""}
                                                                    onChange={e => setSettings({ ...settings, uiLabels: { ...settings.uiLabels, routeLoadingLabel: e.target.value } })}
                                                                    className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-900 focus:border-earth-500 outline-none"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">404 Button Label</label>
                                                                <input
                                                                    type="text"
                                                                    value={settings.uiLabels?.notFoundButtonLabel || ""}
                                                                    onChange={e => setSettings({ ...settings, uiLabels: { ...settings.uiLabels, notFoundButtonLabel: e.target.value } })}
                                                                    className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-900 focus:border-earth-500 outline-none"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">404 Title</label>
                                                                <input
                                                                    type="text"
                                                                    value={settings.uiLabels?.notFoundTitle || ""}
                                                                    onChange={e => setSettings({ ...settings, uiLabels: { ...settings.uiLabels, notFoundTitle: e.target.value } })}
                                                                    className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-900 focus:border-earth-500 outline-none"
                                                                />
                                                            </div>
                                                            <div className="col-span-2">
                                                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">404 Description</label>
                                                                <input
                                                                    type="text"
                                                                    value={settings.uiLabels?.notFoundBody || ""}
                                                                    onChange={e => setSettings({ ...settings, uiLabels: { ...settings.uiLabels, notFoundBody: e.target.value } })}
                                                                    className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-900 focus:border-earth-500 outline-none"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {section.id === "footer" && (
                                                <div className="space-y-8">
                                                    <ImageUploader
                                                        label="Footer Branding Logo"
                                                        value={settings.footerLogo}
                                                        onChange={url => setSettings({ ...settings, footerLogo: url })}
                                                    />

                                                    <div>
                                                        <label className="block text-sm font-bold text-slate-700 mb-2">Footer Description</label>
                                                        <textarea
                                                            rows={3}
                                                            value={settings.footerDescription || ""}
                                                            onChange={e => setSettings({ ...settings, footerDescription: e.target.value })}
                                                            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 focus:border-earth-500 outline-none resize-none"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-bold text-slate-700 mb-2">Footer Lead Capture Text</label>
                                                        <textarea
                                                            rows={2}
                                                            value={settings.footerLeadText || ""}
                                                            onChange={e => setSettings({ ...settings, footerLeadText: e.target.value })}
                                                            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 focus:border-earth-500 outline-none resize-none"
                                                        />
                                                    </div>

                                                    <Repeater<NavLink>
                                                        label="Footer Quick Links"
                                                        items={settings.quickLinks || []}
                                                        emptyItem={{ label: "", url: "" }}
                                                        onUpdate={(items) => setSettings({ ...settings, quickLinks: items })}
                                                        renderItem={(item, index, updateItem, replaceItem) => (
                                                            <div className="grid grid-cols-2 gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                                                <div>
                                                                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Label</label>
                                                                    <input
                                                                        type="text"
                                                                        value={item.label}
                                                                        onChange={e => updateItem(index, "label", e.target.value)}
                                                                        className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-900 focus:border-earth-500 outline-none"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Link</label>
                                                                    <input
                                                                        type="text"
                                                                        value={item.url}
                                                                        onChange={e => updateItem(index, "url", e.target.value)}
                                                                        className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-900 focus:border-earth-500 outline-none"
                                                                    />
                                                                </div>
                                                            </div>
                                                        )}
                                                    />

                                                    <div className="grid grid-cols-2 gap-6">
                                                        <div>
                                                            <label className="block text-sm font-bold text-slate-700 mb-2">HQ Office Address</label>
                                                            <input
                                                                type="text"
                                                                value={settings.officeAddress || ""}
                                                                onChange={e => setSettings({ ...settings, officeAddress: e.target.value })}
                                                                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 focus:border-earth-500 outline-none"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-bold text-slate-700 mb-2">Public Phone Number</label>
                                                            <input
                                                                type="text"
                                                                value={settings.phoneNumber || ""}
                                                                onChange={e => setSettings({ ...settings, phoneNumber: e.target.value })}
                                                                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 focus:border-earth-500 outline-none"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-6">
                                                        <div>
                                                            <label className="block text-sm font-bold text-slate-700 mb-2">Inquiry Destination Email</label>
                                                            <input
                                                                type="text"
                                                                value={settings.emailAddress || ""}
                                                                onChange={e => setSettings({ ...settings, emailAddress: e.target.value })}
                                                                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 focus:border-earth-500 outline-none"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-bold text-slate-700 mb-2">CTA Form Header Title</label>
                                                            <input
                                                                type="text"
                                                                value={settings.footerCtaTitle || ""}
                                                                onChange={e => setSettings({ ...settings, footerCtaTitle: e.target.value })}
                                                                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 focus:border-earth-500 outline-none"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-6">
                                                        <div>
                                                            <label className="block text-sm font-bold text-slate-700 mb-2">CTA Routing Email</label>
                                                            <input
                                                                type="text"
                                                                value={settings.footerCtaEmail || ""}
                                                                onChange={e => setSettings({ ...settings, footerCtaEmail: e.target.value })}
                                                                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 focus:border-earth-500 outline-none"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-bold text-slate-700 mb-2">Telegram URL</label>
                                                            <input
                                                                type="text"
                                                                value={settings.telegramUrl || ""}
                                                                onChange={e => setSettings({ ...settings, telegramUrl: e.target.value })}
                                                                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 focus:border-earth-500 outline-none"
                                                                placeholder="https://t.me/yourhandle"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-bold text-slate-700 mb-2">Footer Copyright Text</label>
                                                        <input
                                                            type="text"
                                                            value={settings.footerCopyrightText || ""}
                                                            onChange={e => setSettings({ ...settings, footerCopyrightText: e.target.value })}
                                                            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 focus:border-earth-500 outline-none"
                                                        />
                                                    </div>

                                                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                                                        <h4 className="font-bold text-slate-900">Footer UI Labels</h4>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Links Section Title</label>
                                                                <input
                                                                    type="text"
                                                                    value={settings.uiLabels?.footerLinksTitle || ""}
                                                                    onChange={e => setSettings({ ...settings, uiLabels: { ...settings.uiLabels, footerLinksTitle: e.target.value } })}
                                                                    className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-900 focus:border-earth-500 outline-none"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Company Placeholder</label>
                                                                <input
                                                                    type="text"
                                                                    value={settings.uiLabels?.footerCompanyPlaceholder || ""}
                                                                    onChange={e => setSettings({ ...settings, uiLabels: { ...settings.uiLabels, footerCompanyPlaceholder: e.target.value } })}
                                                                    className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-900 focus:border-earth-500 outline-none"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Email Placeholder</label>
                                                                <input
                                                                    type="text"
                                                                    value={settings.uiLabels?.footerEmailPlaceholder || ""}
                                                                    onChange={e => setSettings({ ...settings, uiLabels: { ...settings.uiLabels, footerEmailPlaceholder: e.target.value } })}
                                                                    className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-900 focus:border-earth-500 outline-none"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Submit Button Label</label>
                                                                <input
                                                                    type="text"
                                                                    value={settings.uiLabels?.footerSubmitLabel || ""}
                                                                    onChange={e => setSettings({ ...settings, uiLabels: { ...settings.uiLabels, footerSubmitLabel: e.target.value } })}
                                                                    className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-900 focus:border-earth-500 outline-none"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Submitting Label</label>
                                                                <input
                                                                    type="text"
                                                                    value={settings.uiLabels?.footerSubmittingLabel || ""}
                                                                    onChange={e => setSettings({ ...settings, uiLabels: { ...settings.uiLabels, footerSubmittingLabel: e.target.value } })}
                                                                    className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-900 focus:border-earth-500 outline-none"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Direct Contact Prefix</label>
                                                                <input
                                                                    type="text"
                                                                    value={settings.uiLabels?.footerSecondaryContactPrefix || ""}
                                                                    onChange={e => setSettings({ ...settings, uiLabels: { ...settings.uiLabels, footerSecondaryContactPrefix: e.target.value } })}
                                                                    className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-900 focus:border-earth-500 outline-none"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Telegram Link Label</label>
                                                                <input
                                                                    type="text"
                                                                    value={settings.uiLabels?.footerTelegramLinkLabel || ""}
                                                                    onChange={e => setSettings({ ...settings, uiLabels: { ...settings.uiLabels, footerTelegramLinkLabel: e.target.value } })}
                                                                    className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-900 focus:border-earth-500 outline-none"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Admin Link Label</label>
                                                                <input
                                                                    type="text"
                                                                    value={settings.uiLabels?.footerAdminLinkLabel || ""}
                                                                    onChange={e => setSettings({ ...settings, uiLabels: { ...settings.uiLabels, footerAdminLinkLabel: e.target.value } })}
                                                                    className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-900 focus:border-earth-500 outline-none"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Privacy Link Label</label>
                                                                <input
                                                                    type="text"
                                                                    value={settings.uiLabels?.footerPrivacyLinkLabel || ""}
                                                                    onChange={e => setSettings({ ...settings, uiLabels: { ...settings.uiLabels, footerPrivacyLinkLabel: e.target.value } })}
                                                                    className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-900 focus:border-earth-500 outline-none"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Terms Link Label</label>
                                                                <input
                                                                    type="text"
                                                                    value={settings.uiLabels?.footerTermsLinkLabel || ""}
                                                                    onChange={e => setSettings({ ...settings, uiLabels: { ...settings.uiLabels, footerTermsLinkLabel: e.target.value } })}
                                                                    className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-900 focus:border-earth-500 outline-none"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {section.id === "seo" && (
                                                <div className="space-y-6 max-w-2xl bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Settings2 size={18} className="text-earth-500" />
                                                        <h4 className="font-bold text-slate-900">Search Engine Verification</h4>
                                                    </div>
                                                    <label className="block text-sm font-medium text-slate-700 mb-1">Google Site Verification ID</label>
                                                    <input
                                                        type="text"
                                                        placeholder="e.g. Ms-3490..."
                                                        value={settings.googleSiteVerificationId || ""}
                                                        onChange={e => setSettings({ ...settings, googleSiteVerificationId: e.target.value })}
                                                        className="w-full rounded-xl border border-slate-300 px-5 py-3 text-slate-900 outline-none focus:border-earth-500 transition-all"
                                                    />
                                                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-3">
                                                        <Flag className="text-blue-500 shrink-0 mt-0.5" size={16} />
                                                        <p className="text-xs text-blue-800 leading-relaxed font-medium">
                                                            Enter the code from the HTML tag content attribute provided by Google Search Console (e.g., Ms-3490...). This will be injected into the site &lt;head&gt;.
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}

                <div className="flex justify-end pt-8">
                    <Button type="submit" className="bg-earth-600 hover:bg-earth-700 text-white min-w-[200px] py-6 rounded-xl shadow-xl shadow-earth-500/20 font-bold text-lg">
                        <Save size={20} className="mr-2" />
                        Apply Global Changes
                    </Button>
                </div>
            </form>
        </div>
    );
}
