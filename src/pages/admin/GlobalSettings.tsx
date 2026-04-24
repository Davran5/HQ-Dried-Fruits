import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, Globe, Layout, Mail, ChevronDown, Loader2, Languages } from "lucide-react";
import { usePages } from "@/src/contexts/PageContext";
import { ImageUploader } from "@/src/components/admin/ImageUploader";
import { Repeater } from "@/src/components/admin/Repeater";
import { NavLink } from "@/src/types/page";
import { useAdminLanguage } from "@/src/contexts/AdminLanguageContext";
import { useAdminSidebarAction } from "@/src/components/layout/AdminLayout";

export function AdminGlobalSettings() {
    const { globalSettings, updateGlobalSettings, refreshData } = usePages();
    const { editingLang } = useAdminLanguage();
    const { setAction } = useAdminSidebarAction();
    const [settings, setSettings] = useState(globalSettings);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [activeSection, setActiveSection] = useState<string | null>("branding");
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Refresh data whenever the editing language changes
    React.useEffect(() => {
        const loadLangData = async () => {
            setIsRefreshing(true);
            try {
                await refreshData(editingLang);
            } catch (err) {
                console.error("Failed to load language data:", err);
            } finally {
                setIsRefreshing(false);
            }
        };
        loadLangData();
    }, [editingLang]);

    // Sync local state with context data
    React.useEffect(() => {
        setSettings(globalSettings);
    }, [globalSettings]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await updateGlobalSettings(settings, editingLang);
            setSuccessMessage(`Global settings (${editingLang.toUpperCase()}) saved successfully!`);
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (error) {
            console.error("Failed to save global settings:", error);
            alert("Failed to save global settings. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    React.useEffect(() => {
        setAction({
            label: `Save Settings`,
            formId: "global-settings-form",
            isLoading: isSaving,
            disabled: isSaving || isRefreshing,
        });

        return () => setAction(null);
    }, [isRefreshing, isSaving, setAction]);

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
        },
        {
            id: "translations",
            title: "UI Labels & Translations",
            description: "Translate buttons, form labels, and small UI strings.",
            icon: <Languages className="text-earth-500" size={20} />
        }
    ];

    if (isRefreshing) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-earth-600" />
                    <p className="text-sm text-slate-500 font-medium">Switching to {editingLang.toUpperCase()} content...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Global Settings</h2>
                    <p className="text-sm text-slate-500">Manage site-wide variables like Header & Footer for the {editingLang.toUpperCase()} version.</p>
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

            <form id="global-settings-form" onSubmit={handleSave} className="space-y-4">
                {sections.map((section) => {
                    const isOpen = activeSection === section.id;
                    return (
                        <div
                            key={section.id}
                            className={`rounded-xl border transition-all duration-300 overflow-hidden ${isOpen ? 'border-earth-300 shadow-xl ring-1 ring-earth-500/10' : 'border-slate-200 bg-white shadow-sm hover:border-earth-200'}`}
                        >
                            <div
                                onClick={() => toggleSection(section.id)}
                                className={`group flex items-center justify-between px-5 py-4 cursor-pointer select-none transition-colors ${isOpen ? 'bg-earth-50' : 'hover:bg-slate-50'}`}
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
                            </div>

                            <AnimatePresence initial={false}>
                                {isOpen && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                    >
                                        <div className="p-5 bg-slate-50/50 border-t border-slate-100 space-y-5">
                                            {section.id === "branding" && (
                                                <div className="space-y-5">
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

                                                    <div className="grid grid-cols-1 gap-5 pt-2 md:grid-cols-2">
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
                                                            <label className="block text-sm font-bold text-slate-700 mb-2">"Learn More" CTA Link</label>
                                                            <input
                                                                type="text"
                                                                value={settings.ctaUrl || ""}
                                                                onChange={e => setSettings({ ...settings, ctaUrl: e.target.value })}
                                                                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-earth-500 outline-none transition-all"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {section.id === "footer" && (
                                                <div className="space-y-5">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                        <ImageUploader
                                                            label="Footer Logo"
                                                            value={settings.footerLogo}
                                                            onChange={url => setSettings({ ...settings, footerLogo: url })}
                                                        />
                                                        <div>
                                                            <label className="block text-sm font-bold text-slate-700 mb-2">Footer Description</label>
                                                            <textarea
                                                                value={settings.footerDescription || ""}
                                                                onChange={e => setSettings({ ...settings, footerDescription: e.target.value })}
                                                                rows={4}
                                                                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-earth-500 outline-none transition-all"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                        <div>
                                                            <label className="block text-sm font-bold text-slate-700 mb-2">Office Address</label>
                                                            <input
                                                                type="text"
                                                                value={settings.officeAddress || ""}
                                                                onChange={e => setSettings({ ...settings, officeAddress: e.target.value })}
                                                                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-earth-500 outline-none transition-all"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-bold text-slate-700 mb-2">Phone Number</label>
                                                            <input
                                                                type="text"
                                                                value={settings.phoneNumber || ""}
                                                                onChange={e => setSettings({ ...settings, phoneNumber: e.target.value })}
                                                                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-earth-500 outline-none transition-all"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                                        <div>
                                                            <label className="block text-sm font-bold text-slate-700 mb-2">Contact Email</label>
                                                            <input
                                                                type="email"
                                                                value={settings.emailAddress || ""}
                                                                onChange={e => setSettings({ ...settings, emailAddress: e.target.value })}
                                                                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-earth-500 outline-none transition-all"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-bold text-slate-700 mb-2">Telegram URL</label>
                                                            <input
                                                                type="text"
                                                                value={settings.telegramUrl || ""}
                                                                onChange={e => setSettings({ ...settings, telegramUrl: e.target.value })}
                                                                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-earth-500 outline-none transition-all"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-bold text-slate-700 mb-2">Copyright Text</label>
                                                            <input
                                                                type="text"
                                                                value={settings.footerCopyrightText || ""}
                                                                onChange={e => setSettings({ ...settings, footerCopyrightText: e.target.value })}
                                                                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-earth-500 outline-none transition-all"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {section.id === "seo" && (
                                                <div className="space-y-5">
                                                    <div>
                                                        <label className="block text-sm font-bold text-slate-700 mb-2">Google Site Verification ID</label>
                                                        <input
                                                            type="text"
                                                            value={settings.googleSiteVerificationId || ""}
                                                            onChange={e => setSettings({ ...settings, googleSiteVerificationId: e.target.value })}
                                                            placeholder="e.g. google1234567890abcdef"
                                                            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-earth-500 outline-none transition-all"
                                                        />
                                                        <p className="text-xs text-slate-500 mt-2 italic">Found in the meta tag: content="YOUR_ID"</p>
                                                    </div>
                                                </div>
                                            )}

                                            {section.id === "translations" && (
                                                <div className="space-y-10">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                                        <div className="col-span-full border-b border-slate-200 pb-2">
                                                            <h4 className="text-sm font-bold text-earth-700 uppercase tracking-wider">General & Navigation</h4>
                                                        </div>
                                                        
                                                        <UIField label="Mobile Menu Title" field="mobileNavigationTitle" settings={settings} setSettings={setSettings} />
                                                        <UIField label="Mobile Contact Title" field="mobileContactTitle" settings={settings} setSettings={setSettings} />
                                                        <UIField label="Home Meta Title" field="homeMetaTitle" settings={settings} setSettings={setSettings} />
                                                        <UIField label="Products Meta Title" field="productsMetaTitle" settings={settings} setSettings={setSettings} />
                                                        <UIField label="Export Meta Title" field="exportMetaTitle" settings={settings} setSettings={setSettings} />
                                                        <UIField label="Contacts Meta Title" field="contactsMetaTitle" settings={settings} setSettings={setSettings} />

                                                        <div className="col-span-full border-b border-slate-200 pb-2 pt-4">
                                                             <h4 className="text-sm font-bold text-earth-700 uppercase tracking-wider">Homepage</h4>
                                                         </div>
                                                         <UIField label="Request Catalog" field="requestCatalogLabel" settings={settings} setSettings={setSettings} />
                                                         <UIField label="Explore Products" field="exploreProductsLabel" settings={settings} setSettings={setSettings} />
                                                         <UIField label="Heritage Slogan" field="heritageSloganLabel" settings={settings} setSettings={setSettings} />
                                                         <UIField label="About Company Title" field="aboutCompanyLabel" settings={settings} setSettings={setSettings} />
                                                         <UIField label="Experience Years" field="statYearsLabel" settings={settings} setSettings={setSettings} />
                                                         <UIField label="Tons Exported" field="statTonsLabel" settings={settings} setSettings={setSettings} />
                                                         <UIField label="Product Selection Sub" field="productSelectionSublabel" settings={settings} setSettings={setSettings} />
                                                         <UIField label="View Catalog Btn" field="viewFullCatalogLabel" settings={settings} setSettings={setSettings} />
                                                         <UIField label="Request Sample Link" field="requestSampleLabel" settings={settings} setSettings={setSettings} />
                                                         <UIField label="Learn More Btn" field="learnMoreLabel" settings={settings} setSettings={setSettings} />
                                                         <UIField label="Pricing CTA Btn" field="getPricingLabel" settings={settings} setSettings={setSettings} /><div className="col-span-full border-b border-slate-200 pb-2 pt-4">
                                                             <h4 className="text-sm font-bold text-earth-700 uppercase tracking-wider">About Page</h4>
                                                         </div>
                                                         <UIField label="Mission Narrative Eyebrow" field="missionNarrativeEyebrow" settings={settings} setSettings={setSettings} />
                                                         <UIField label="Mission Narrative Title" field="missionNarrativeTitle" settings={settings} setSettings={setSettings} />
                                                         <UIField label="Mission Narrative Sub" field="missionNarrativeSublabel" settings={settings} setSettings={setSettings} />
                                                         <UIField label="Inside Facility Eyebrow" field="insideFacilityEyebrow" settings={settings} setSettings={setSettings} />
                                                         <UIField label="HACCP Label" field="haccpLabel" settings={settings} setSettings={setSettings} />
                                                         <UIField label="ISO Label" field="isoLabel" settings={settings} setSettings={setSettings} />
                                                         <UIField label="Organic Label" field="organicLabel" settings={settings} setSettings={setSettings} />
                                                         <UIField label="GlobalGap Label" field="globalGapLabel" settings={settings} setSettings={setSettings} />
                                                         <UIField label="FDA Label" field="fdaLabel" settings={settings} setSettings={setSettings} /><div className="col-span-full border-b border-slate-200 pb-2 pt-4">
                                                             <h4 className="text-sm font-bold text-earth-700 uppercase tracking-wider">Export Page</h4>
                                                         </div>
                                                         <UIField label="Ops Eyebrow" field="exportOpsEyebrow" settings={settings} setSettings={setSettings} />
                                                         <UIField label="Ops Title" field="exportOpsTitle" settings={settings} setSettings={setSettings} />
                                                         <UIField label="Packaging Title" field="packagingTitle" settings={settings} setSettings={setSettings} />
                                                         <UIField label="Transport Title" field="transportationTitle" settings={settings} setSettings={setSettings} />
                                                         <UIField label="Clearance Title" field="documentationTitle" settings={settings} setSettings={setSettings} />
                                                         <UIField label="Dest. Eyebrow" field="destinationBreakdownEyebrow" settings={settings} setSettings={setSettings} />
                                                         <UIField label="Dest. Title" field="destinationBreakdownTitle" settings={settings} setSettings={setSettings} />
                                                         <UIField label="Quality Title" field="qualityGuaranteeTitle" settings={settings} setSettings={setSettings} />
                                                         <UIField label="Moisture Label" field="moistureControlLabel" settings={settings} setSettings={setSettings} />
                                                         <UIField label="Calibration Label" field="sizeCalibrationLabel" settings={settings} setSettings={setSettings} />
                                                         <UIField label="Micro Safe Label" field="microSafeLabel" settings={settings} setSettings={setSettings} /><div className="col-span-full border-b border-slate-200 pb-2 pt-4">
                                                            <h4 className="text-sm font-bold text-earth-700 uppercase tracking-wider">Footer Labels</h4>
                                                        </div>
                                                        <UIField label="Links Section Title" field="footerLinksTitle" settings={settings} setSettings={setSettings} />
                                                        <UIField label="Copyright Text" field="footerCopyright" settings={settings} setSettings={setSettings} />
                                                        <UIField label="Privacy Link" field="footerPrivacyLinkLabel" settings={settings} setSettings={setSettings} />
                                                        <UIField label="Terms Link" field="footerTermsLinkLabel" settings={settings} setSettings={setSettings} />
                                                        <UIField label="Success Message" field="footerInquirySuccess" settings={settings} setSettings={setSettings} />
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
            </form>
        </div>
    );
}

function UIField({ label, field, settings, setSettings }: { label: string, field: string, settings: any, setSettings: any }) {
    const value = settings.uiLabels?.[field] || "";
    return (
        <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">{label}</label>
            <input
                type="text"
                value={value}
                onChange={e => {
                    const newLabels = { ...(settings.uiLabels || {}), [field]: e.target.value };
                    setSettings({ ...settings, uiLabels: newLabels });
                }}
                className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-900 focus:border-earth-500 outline-none transition-all hover:border-slate-300"
                placeholder={`Enter ${label.toLowerCase()}...`}
            />
        </div>
    );
}
