import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
    PageData,
    HomeContent,
    AboutContent,
    ProductsContent,
    ExportContent,
    ContactsContent,
    GlobalSettings,
    SimplePageContent,
} from "../types/page";
import { SEOData } from "../types/product";

interface PageContextType {
    globalSettings: GlobalSettings;
    updateGlobalSettings: (settings: GlobalSettings) => Promise<void>;
    pages: PageData[];
    updatePage: (id: string, newPageData: PageData) => Promise<void>;
    pageSeo: Record<string, SEOData>;
    pageSeoLoaded: boolean;
    updatePageSeo: (id: string, seo: SEOData) => Promise<void>;
}

const defaultUiLabels = {
    mobileNavigationTitle: "Navigation",
    mobileContactTitle: "Contact Us",
    footerLinksTitle: "Company",
    footerCompanyPlaceholder: "Company Name",
    footerEmailPlaceholder: "Email Address",
    footerSubmitLabel: "Send",
    footerSubmittingLabel: "Sending",
    footerSecondaryContactPrefix: "Prefer direct contact?",
    footerTelegramLinkLabel: "contact us on Telegram",
    footerAdminLinkLabel: "Admin Panel",
    footerPrivacyLinkLabel: "Privacy Policy",
    footerTermsLinkLabel: "Terms of Service",
    routeLoadingLabel: "Loading route...",
    notFoundTitle: "Page Not Found",
    notFoundBody: "The page you requested does not exist or its address has changed.",
    notFoundButtonLabel: "Back to Homepage",
};

const initialGlobalSettings: GlobalSettings = {
    headerLogo: "",
    siteName: "HQ Dried Fruits",
    navLinks: [
        { label: "Home", url: "/" },
        { label: "About", url: "/about" },
        { label: "Products", url: "/products" },
        { label: "Export", url: "/export" },
        { label: "Contacts", url: "/contacts" },
    ],
    ctaText: "Get Quote",
    ctaUrl: "/contacts",
    footerLogo: "",
    footerDescription: "Quality sun-dried fruits from the heart of Uzbekistan. Exporting nature's sweetness to global B2B partners with uncompromising quality.",
    footerLeadText: "Get our latest pricing and export terms directly to your inbox or Telegram.",
    quickLinks: [
        { label: "About Us", url: "/about" },
        { label: "Export", url: "/export" },
        { label: "Contacts", url: "/contacts" },
    ],
    officeAddress: "Amir Temur Ave 107B, Tashkent, Uzbekistan",
    phoneNumber: "+998 90 123 45 67",
    emailAddress: "export@hqdriedfruits.com",
    telegramUrl: "",
    footerCtaTitle: "Need a custom container quote?",
    footerCtaEmail: "export@hqdriedfruits.com",
    footerCopyrightText: "HQ Dried Fruits. All rights reserved.",
    uiLabels: defaultUiLabels,
    googleSiteVerificationId: "",
};

export const defaultPageSeoSettings: Record<string, SEOData> = {
    home: {
        metaTitle: "HQ Dried Fruits | High-Quality Organic Export",
        metaDescription: "Quality sun-dried fruits from the heart of Uzbekistan. We export the finest apricots, raisins, and prunes to global B2B partners.",
        slug: "",
        ogTitle: "HQ Dried Fruits",
        imageAlt: "Sun-dried apricots from Uzbekistan",
    },
    about: {
        metaTitle: "About HQ Dried Fruits | Our Heritage & Mission",
        metaDescription: "Decades of expertise in every harvest. Learn about our mission to deliver the uncompromised, natural sweetness of Uzbekistan's harvest to the world.",
        slug: "about",
        ogTitle: "About HQ Dried Fruits",
        imageAlt: "Sorting facility in Uzbekistan",
    },
    products: {
        metaTitle: "Wholesale Dried Apricots, Raisins, Prunes & Mixed Baskets | HQ Dried Fruits",
        metaDescription: "Source Uzbekistan dried apricots, raisins, prunes, and mixed baskets with detailed origin, processing, nutrition, and export information on one page.",
        slug: "products",
        ogTitle: "HQ Dried Fruits Product Catalog",
        imageAlt: "Assorted dried fruits",
    },
    export: {
        metaTitle: "Global Logistics & Export | HQ Dried Fruits",
        metaDescription: "Seamless global logistics from the heart of the Silk Road to your warehouse. We handle customs, packaging, and freight forwarding.",
        slug: "export",
        ogTitle: "HQ Dried Fruits Export",
        imageAlt: "Global supply map",
    },
    contacts: {
        metaTitle: "Contact HQ Dried Fruits | Wholesale Inquiries",
        metaDescription: "Get our latest wholesale pricing, request a sample box, or discuss logistics with our export team.",
        slug: "contacts",
        ogTitle: "Contact HQ Dried Fruits",
        imageAlt: "HQ Dried Fruits Headquarters Map",
    },
    privacy: {
        metaTitle: "Privacy Policy | HQ Dried Fruits",
        metaDescription: "Privacy policy for HQ Dried Fruits.",
        slug: "privacy",
        ogTitle: "Privacy Policy | HQ Dried Fruits",
        imageAlt: "Privacy Policy",
    },
    terms: {
        metaTitle: "Terms of Service | HQ Dried Fruits",
        metaDescription: "Terms of service for HQ Dried Fruits.",
        slug: "terms",
        ogTitle: "Terms of Service | HQ Dried Fruits",
        imageAlt: "Terms of Service",
    },
};

const initialPages: PageData[] = [
    {
        id: "home",
        name: "Home",
        path: "/",
        content: {
            heroBgImage: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?q=80&w=2000&auto=format&fit=crop",
            heroTitle: "High-Quality Sun-Dried Fruits from Uzbekistan",
            heroSubtitle: "Hand-picked and processed to global export standards.",
            heroPrimaryCtaLabel: "Request Wholesale Catalog",
            heroSecondaryCtaLabel: "Our Processing Facilities",
            progressSlider: [],
            introLabel: "The HQ Dried Fruits Difference",
            introText: "We cultivate, process, and directly export the finest dried fruits from the Fergana Valley. Using advanced laser-sorting technology, we guarantee 99.9% purity for high-volume wholesale buyers across Europe and Asia.",
            statsGrid: [
                { value: "25+", label: "Years Experience" },
                { value: "10,000", label: "Tons Exported Annually" },
                { value: "40+", label: "Countries Served" },
                { value: "99.9%", label: "Sorting Purity" },
            ],
            productPreviewTitle: "Featured Harvests",
            productPreviewButtonLabel: "View Full Catalog",
            productPreviewItemCtaLabel: "Request Sample",
            productCategories: [
                { categoryName: "Dried Apricots", image: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?q=80&w=800", shortDescription: "High-quality dark and golden varieties.", url: "/products/sun-dried-apricots" },
                { categoryName: "Dried Prunes", image: "https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?q=80&w=800", shortDescription: "Pitted and unpitted sweet plums.", url: "/products/pitted-prunes" },
                { categoryName: "Shadow-Dried Raisins", image: "https://images.unsplash.com/photo-1596591606975-97ee5cef3a1e?q=80&w=800", shortDescription: "Traditional drying process for max flavor.", url: "/products/black-raisins" },
            ],
            exportMarketsEyebrow: "Export Focus",
            exportMarketsTitle: "Built for Buyers Across Key Trade Corridors",
            exportMarketsIntro: "Our export team plans routing, documents, and buyer-ready packaging market by market. Select a destination to preview how we position each lane.",
            exportMarkets: [
                {
                    countryName: "Germany",
                    shortDescription: "Structured pallet and container supply for Central European wholesale buyers.",
                    statLabel: "Lead Time Window",
                    statValue: "18-24 days",
                    image: "https://images.unsplash.com/photo-1526778548025-fa2f459cd5ce?q=80&w=1600&auto=format&fit=crop",
                },
                {
                    countryName: "Netherlands",
                    shortDescription: "High-frequency logistics support for import partners and regional distribution hubs.",
                    statLabel: "Port Routing",
                    statValue: "Rotterdam-first",
                    image: "https://images.unsplash.com/photo-1521295121783-8a321d551ad2?q=80&w=1600&auto=format&fit=crop",
                },
                {
                    countryName: "UAE",
                    shortDescription: "Flexible mixed-load planning for GCC trade routes and re-export buyers.",
                    statLabel: "Documentation",
                    statValue: "Buyer-ready set",
                    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1600&auto=format&fit=crop",
                },
                {
                    countryName: "Kazakhstan",
                    shortDescription: "Fast regional replenishment with land-linked scheduling from Tashkent.",
                    statLabel: "Transport Mode",
                    statValue: "Road + rail",
                    image: "https://images.unsplash.com/photo-1502920514313-52581002a659?q=80&w=1600&auto=format&fit=crop",
                },
            ],
            supplyReachTitle: "Seamless Global Supply",
            supplyReachOverview: "From FCA Tashkent logistics to DAP warehouse deliveries, our in-house export team manages all customs, transit certificates, and phytosanitary requirements.",
            supplyReachBgImage: "https://images.unsplash.com/photo-1596591606975-97ee5cef3a1e?q=80&w=2000",
            supplyReachButtonLabel: "Explore Our Supply Chain",
            ctaBgImage: "https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2000",
            ctaHeading: "Start Your Bulk Order",
            ctaSubheading: "Connect with our export sales team to discuss tonnage, packaging, and logistics schedules.",
            ctaButtonText: "Request Pricing PDF",
            ctaButtonUrl: "/contacts",
            ctaLinkLabel: "Contact Sales directly",
            ctaEmailPlaceholder: "Enter your work email",
            ctaSubmittingLabel: "Sending...",
        } as HomeContent,
    },
    {
        id: "about",
        name: "About Us",
        path: "/about",
        content: {
            marqueeTitle: "Global Partners & Facilities",
            productionMarqueeImages: [],
            partnerLogos: [],
            partnerSectionLabel: "Certified Quality & Trusted Partners",
            heritageTitle: "Our Roots in the Silk Road",
            heritageSubtitle: "A journey of quality and tradition.",
            whoWeAreContent: "<p>Deeply embedded in the agricultural heart of Central Asia, HQ Dried Fruits was built around long-term orchard relationships, disciplined processing, and export execution that works for wholesale buyers year after year.</p><p>Our team operates across cultivation, sorting, packing, and shipment preparation so buyers are not dealing with fragmented supply. That structure gives us tighter control over product consistency, moisture profile, documentation, and dispatch planning.</p><p>What began with local agricultural know-how has evolved into a buyer-facing export operation that understands not just dried fruit quality, but also the operational realities of importers, distributors, and private-label partners.</p>",
            heritageStats: [
                { boxNumber: "01", title: "Orchard Cultivation", description: "Direct oversight of farming practices." },
                { boxNumber: "02", title: "Laser Sorting", description: "State of the art processing lines." },
            ],
            heritageImagery: [],
            missionTitle: "Our Mission",
            missionStatement: "<p>Our mission is to connect the natural fruit-growing strength of Uzbekistan with the reliability demanded by modern wholesale trade. We do that by combining traditional harvest knowledge with disciplined food-safety systems, export documentation, and buyer-specific packing standards.</p><p>For our team, quality is not only about taste or appearance. It is about repeatability across every shipment: stable grading, traceable processing, dependable preparation, and product that arrives ready for retail, ingredient, or distribution programs.</p><p>We are focused on building supply relationships that last, where buyers can scale with confidence instead of re-solving the same quality and logistics problems every season.</p>",
            philosophyTitle: "Heritage & Philosophy",
            orchardPhilosophy: "We believe strong export supply starts long before the final carton is packed. That means respecting the agricultural rhythm of each crop, maintaining disciplined processing controls, and building operations that scale without losing product character. Our philosophy is simple: preserve what makes the fruit valuable in the first place, then support it with systems buyers can trust.",
            productionStandardsTitle: "Production Standards",
            productionStandards: "Our production standards are built around export readiness, not just factory output. We work with controlled intake, calibrated sorting, food-safety procedures, and buyer-specific packing formats so product quality holds from the line to final dispatch. ISO, HACCP, and certification-led controls are part of that framework, but the real goal is practical consistency that importers can rely on across repeat orders.",
            missionPhotography: "https://images.unsplash.com/photo-1596591606975-97ee5cef3a1e?q=80&w=2000",
            ownProductionTitle: "Own Production",
            ownProductionIntro: "From orchard intake to final export packing, each production stage is managed inside our own operation for consistency, traceability, and buyer-ready execution.",
            ownProductionItems: [
                {
                    image: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?q=80&w=1200&auto=format&fit=crop",
                    title: "Raw Intake",
                    subtitle: "Harvest Selection",
                    description: "Incoming fruit is sorted by batch, moisture profile, and destination requirements before processing begins.",
                },
                {
                    image: "https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?q=80&w=1200&auto=format&fit=crop",
                    title: "Processing",
                    subtitle: "Laser & X-Ray Control",
                    description: "Each production line is calibrated for purity, defect removal, and export-grade consistency across volume orders.",
                },
                {
                    image: "https://images.unsplash.com/photo-1596591606975-97ee5cef3a1e?q=80&w=1200&auto=format&fit=crop",
                    title: "Packaging",
                    subtitle: "Buyer-Specific Formats",
                    description: "We pack for retail, private label, and industrial shipments with the same in-house quality checks before dispatch.",
                },
                {
                    image: "https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1200&auto=format&fit=crop",
                    title: "Dispatch",
                    subtitle: "Export Handover",
                    description: "Finished cargo is documented, palletized, and scheduled for the route that best fits the buyer’s timeline and market.",
                },
            ],
        } as AboutContent,
    },
    {
        id: "products",
        name: "Products Hub",
        path: "/products",
        content: {
            pageTitle: "Wholesale Dried Fruits from Uzbekistan",
            pageSubtitle: "Explore export-ready apricots, raisins, prunes, and mixed assortments with buyer-focused origin, processing, and application details in one catalog.",
            heroBgImage: "",
            orderingBgImage: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?q=80&w=2000",
            orderingFormTitle: "Wholesale Inquiry",
            orderingFormSubtitle: "Submit your container schedule.",
            stepOneLabel: "Which product are you interested in?",
            stepTwoLabel: "Estimated Monthly Volume?",
            stepThreeLabel: "Where should we send the quote?",
            mixedContainerLabel: "Mixed Container",
            volumeOptions: ["1-5 Tons", "5-20 Tons", "1 FCL (20ft)", "Multiple FCLs"],
            viewSpecsLabel: "View Specifications",
            stepOnePlaceholder: "Select a product...",
            stepThreePlaceholder: "Work Email Address",
            nextStepButtonLabel: "Next Step",
            backButtonLabel: "Back",
            submitButtonLabel: "Get Instant Quote",
            submittingButtonLabel: "Sending...",
            detailUi: {
                loadingLabel: "Loading Specifications...",
                notFoundTitle: "Product Not Found",
                notFoundBody: "The product you're looking for doesn't exist.",
                backToCatalogLabel: "Back to Catalog",
                nutritionTitle: "Nutritional Profile",
                nutritionPerLabel: "(per 100g)",
                caloriesLabel: "Calories",
                proteinLabel: "Protein",
                fatLabel: "Fat",
                carbsLabel: "Carbs",
                inquiryTitle: "Request a Sample or Quote",
                companyPlaceholder: "Company Name",
                emailPlaceholder: "Work Email",
                volumePlaceholder: "Select Volume...",
                inquiryButtonLabel: "Send Inquiry",
                inquirySubmittingLabel: "Sending Inquiry...",
            },
            quickContactTitle: "Need it faster?",
            quickContactSubtitle: "Skip the form. Connect with our export sales team directly for immediate assistance.",
            telegramLabel: "Telegram Bot",
            telegramSublabel: "Instant quotes & catalog PDF",
            callLabel: "Call Sales",
            emailLabel: "Email Us",
            quickPhone: "+998 90 123 45 67",
            quickEmail: "sales@hqdriedfruits.com",
        } as ProductsContent,
    },
    {
        id: "export",
        name: "Export",
        path: "/export",
        content: {
            heroTitle: "Our Global Export Network",
            heroSubtitle: "Seamless global logistics from the heart of the Silk Road to your warehouse.",
            heroBgImage: "",
            mapSectionTitle: "Our Global Export Network",
            supplyRoutes: [],
            logisticsContent: "<p>We handle end-to-end multi-modal transport routing.</p>",
            packagingTitle: "Custom Packaging",
            packagingMethods: "<p>Bulk cartons, vacuum-sealed bags, or retail-ready packaging customized with your brand labels.</p>",
            transportationTitle: "Ocean & Rail Freight",
            transportationMethods: "<p>Cost-effective FCL (Full Container Load) and LCL shipments via major ports and the trans-Eurasian rail network.</p>",
            documentationTitle: "Customs Clearance",
            documentationContent: "<p>Full documentation support including phytosanitary certificates, certificates of origin, and EUR.1.</p>",
            qualityTitle: "The Quality Guarantee",
            technicalSpecs: "<p>X-Ray and Laser sorting guarantee removal of stones, stems, and defects.</p>",
            qualityChecks: [
                { title: "Moisture Control", description: "Strictly maintained at 18-22% for optimal shelf life." },
                { title: "Size Calibration", description: "Laser-graded for uniform sizing (Jumbo, Large, Medium)." },
                { title: "Microbiological Safety", description: "Regular lab testing for aflatoxins and heavy metals." },
            ],
            certificationsGallery: [],
        } as ExportContent,
    },
    {
        id: "contacts",
        name: "Contacts",
        path: "/contacts",
        content: {
            pageTitle: "Let's Connect",
            introText: "Whether you need a mixed container or a dedicated harvest line, our B2B team is available 24/7.",
            formDestinationEmail: "sales@hqdriedfruits.com",
            contactFormTitle: "Send an Inquiry",
            responseLabelPrefix: "Replies are monitored at",
            formNameLabel: "Full Name",
            formCompanyLabel: "Company",
            formEmailLabel: "Work Email",
            formMessageLabel: "Message",
            submitButtonLabel: "Send Message",
            submittingButtonLabel: "Sending...",
            emailAddress: "sales@hqdriedfruits.com",
            phoneNumber: "+998 90 123 45 67",
            officeAddress: "Amir Temur Ave 107B",
            workingHours: "Mon-Sat: 09:00 - 18:00 (Tashkent Time)",
            mapPinLabel: "HQ Dried Fruits HQ",
            infoEmailLabel: "Email",
            infoPhoneLabel: "Phone",
            infoAddressLabel: "Headquarters",
            infoHoursLabel: "Working Hours",
            socialSectionTitle: "Social Media",
            telegramUrl: "",
            instagramUrl: "",
            whatsappUrl: "",
            facebookUrl: "",
            headquartersImage: "https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1500",
            googleMapsUrl: "",
        } as ContactsContent,
    },
    {
        id: "privacy",
        name: "Privacy Policy",
        path: "/privacy",
        content: {
            title: "Privacy Policy",
            body: "<p>We use the information submitted through this website to respond to wholesale inquiries, prepare quotes, and manage customer communication.</p><p>Contact details and inquiry content may be stored in our internal admin system so our sales team can follow up on requests and maintain order history.</p><p>If you need your information corrected or removed, contact our export team using the details listed on the contact page.</p>",
        } as SimplePageContent,
    },
    {
        id: "terms",
        name: "Terms of Service",
        path: "/terms",
        content: {
            title: "Terms of Service",
            body: "<p>Information on this site is provided for wholesale inquiry and quotation purposes. Final pricing, availability, specifications, and logistics terms are confirmed during direct sales communication.</p><p>Submitting an inquiry does not create a purchase contract. Orders are finalized only after written agreement between HQ Dried Fruits and the buyer.</p><p>Use of this site must comply with applicable law and must not interfere with website operation or data integrity.</p>",
        } as SimplePageContent,
    },
];

const PageContext = createContext<PageContextType | undefined>(undefined);

export function PageProvider({ children }: { children: ReactNode }) {
    const [pages, setPages] = useState<PageData[]>(initialPages);
    const [globalSettings, setGlobalSettings] = useState<GlobalSettings>(initialGlobalSettings);
    const [pageSeo, setPageSeo] = useState<Record<string, SEOData>>(defaultPageSeoSettings);
    const [pageSeoLoaded, setPageSeoLoaded] = useState(false);

    useEffect(() => {
        fetch("/api/globals")
            .then((res) => res.json())
            .then((data) => {
                if (data && typeof data === "object") {
                    setGlobalSettings((prev) => ({
                        ...initialGlobalSettings,
                        ...prev,
                        ...data,
                        uiLabels: {
                            ...defaultUiLabels,
                            ...prev.uiLabels,
                            ...(typeof data.uiLabels === "object" && data.uiLabels ? data.uiLabels : {}),
                        },
                    }));
                }
            })
            .catch((err) => console.error("Error loading globals:", err));

        fetch("/api/seo/pages")
            .then((res) => res.json())
            .then((data) => {
                if (data && typeof data === "object") {
                    setPageSeo((prev) => ({ ...prev, ...data }));
                }
            })
            .finally(() => setPageSeoLoaded(true))
            .catch((err) => console.error("Error loading page SEO:", err));

        ["home", "about", "products", "export", "contacts", "privacy", "terms"].forEach(async (id) => {
            try {
                const res = await fetch(`/api/pages/${id}`);
                if (!res.ok) {
                    return;
                }

                const content = await res.json();
                if (content && typeof content === "object") {
                    setPages((prev) =>
                        prev.map((page) =>
                            page.id === id ? { ...page, content: { ...page.content, ...content } } : page,
                        ),
                    );
                }
            } catch (err) {
                console.error(`[PageContext] Failed to load page '${id}':`, err);
            }
        });
    }, []);

    const updatePage = async (id: string, newPageData: PageData) => {
        if (!newPageData || typeof newPageData.content !== "object") {
            throw new Error("Invalid page data");
        }

        const response = await fetch(`/api/pages/${id}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newPageData.content),
        });

        if (!response.ok) {
            const payload = await response.json().catch(() => null);
            throw new Error(payload?.error || `Failed to save page ${id}`);
        }

        setPages((prev) =>
            prev.map((page) =>
                page.id === id ? { ...page, content: { ...page.content, ...newPageData.content } } : page,
            ),
        );
    };

    const updateGlobalSettings = async (newSettings: GlobalSettings) => {
        const response = await fetch("/api/globals", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newSettings),
        });

        if (!response.ok) {
            const payload = await response.json().catch(() => null);
            throw new Error(payload?.error || "Failed to save global settings");
        }

        setGlobalSettings((prev) => ({
            ...prev,
            ...newSettings,
            uiLabels: {
                ...defaultUiLabels,
                ...prev.uiLabels,
                ...newSettings.uiLabels,
            },
        }));
    };

    const updatePageSeo = async (id: string, seo: SEOData) => {
        const response = await fetch(`/api/seo/pages/${id}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(seo),
        });

        if (!response.ok) {
            const payload = await response.json().catch(() => null);
            throw new Error(payload?.error || `Failed to save SEO for ${id}`);
        }

        setPageSeo((prev) => ({ ...prev, [id]: seo }));
    };

    return (
        <PageContext.Provider value={{ pages, updatePage, globalSettings, updateGlobalSettings, pageSeo, pageSeoLoaded, updatePageSeo }}>
            {children}
        </PageContext.Provider>
    );
}

export function usePages() {
    const context = useContext(PageContext);
    if (!context) {
        throw new Error("usePages must be used within a PageProvider");
    }
    return context;
}
