import React, { createContext, useContext, useEffect, useMemo, useRef, useState, ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { useLanguage } from "./LanguageContext";
import { getActiveLocale, type ActiveLocaleCode, type LocaleCode } from "../i18n";
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
import { PublicBootstrapPayload } from "../types/bootstrap";

interface PageContextType {
    globalSettings: GlobalSettings;
    pageDataLoaded: boolean;
    currentLocale: ActiveLocaleCode;
    updateGlobalSettings: (settings: GlobalSettings, locale?: LocaleCode) => Promise<void>;
    pages: PageData[];
    updatePage: (id: string, newPageData: PageData, locale?: LocaleCode, changedPaths?: string[]) => Promise<void>;
    pageSeo: Record<string, SEOData>;
    pageSeoLoaded: boolean;
    updatePageSeo: (id: string, seo: SEOData, locale?: LocaleCode) => Promise<void>;
    refreshData: (locale?: LocaleCode) => Promise<void>;
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

    requestCatalogLabel: "Request Wholesale Catalog",
    exploreProductsLabel: "Explore Products",
    aboutCompanyLabel: "About The Company",
    heritageSloganLabel: "Decades of expertise in every harvest.",
    learnMoreLabel: "About our export process",
    getPricingLabel: "Pricing & Samples",
    viewFullCatalogLabel: "View Full Catalog",
    requestSampleLabel: "Request Samples",
    productCardViewSpecsLabel: "View Specifications",
    requestQuoteBtn: "Request Wholesale Quote",
    productSelectionSublabel: "Hand-selected and sun-dried.",

    homeMetaTitle: "HQ Dried Fruits | High-Quality Organic Export",
    productsMetaTitle: "Our Products | Wholesale Catalog",
    exportMetaTitle: "Global Export & Logistics",
    contactsMetaTitle: "Contact Us | Wholesale Inquiries",

    statYearsLabel: "Years of Experience",
    statTonsLabel: "Tons Exported",

    contactsTitle: "Let's Connect",
    sendInquiryTitle: "Send an Inquiry",
    formNameLabel: "Full Name",
    formEmailLabel: "Work Email",
    formPhoneLabel: "Phone Number",
    formMessageLabel: "Message",
    formCompanyLabel: "Company",
    submitBtnLabel: "Send Inquiry",
    submittingLabel: "Sending...",
    inquirySuccessMsg: "Inquiry received. The export team will contact you shortly.",
    inquiryFailureMsg: "Submission failed. Please try again.",
    sendMessageLabel: "Send Message",

    missionPurposeLabel: "Purpose",
    missionHeritageLabel: "Heritage",
    missionPhilosophyLabel: "Philosophy",
    missionStandardsLabel: "Standards",
    orchardPhilosophyLabel: "Orchard Philosophy",
    missionNarrativeEyebrow: "Mission",
    missionNarrativeTitle: "What guides the way we grow, process, and deliver",
    missionNarrativeSublabel: "A clearer look at the company mission, heritage, philosophy, and standards, shaped into one visual section.",

    insideFacilityEyebrow: "Inside the Facility",
    haccpLabel: "HACCP Certified",
    isoLabel: "ISO 9001:2015",
    organicLabel: "100% Organic",
    globalGapLabel: "GlobalGap",
    fdaLabel: "FDA Registered",

    exportOpsEyebrow: "Export Operations",
    exportOpsTitle: "Logistics, Documentation & Packaging tailored for buyers",
    logisticsDesc1: "We provide full multimodal transport based on buyer requirements.",
    logisticsDesc2: "Every shipment is structured for repeatability and compliance with destination country regulations.",
    packagingTitle: "Custom Packaging",
    packagingDesc: "Cartons, vacuum-sealed bags, or retail packaging under your brand.",
    transportationTitle: "Ocean & Rail Freight",
    transportationDesc: "Cost-effective FCL and LCL shipments via major ports and rail networks.",
    documentationTitle: "Customs Clearance",
    documentationDesc: "Full documentary support including phytosanitary and origin certificates.",

    destinationBreakdownEyebrow: "Buyer Channels",
    destinationBreakdownTitle: "Prepared for the way your business sells",
    destinationBreakdownDesc: "Different buyers need different packing, documentation, and product presentation.",

    qualityGuaranteeTitle: "Quality Guarantee",
    qualityGuaranteeDesc: "Our facilities utilize laser sorting to ensure 99.9% purity across all exports.",
    qualitySealLabel: "Product Quality Seal",
    moistureControlLabel: "Moisture Control",
    moistureControlDesc: "Strictly maintained at 18-22% for optimal shelf life.",
    sizeCalibrationLabel: "Size Calibration",
    sizeCalibrationDesc: "Laser-calibrated for uniform sizing (Jumbo, Large, Medium).",
    microSafeLabel: "Microbiological Safety",
    microSafeDesc: "Regular lab testing for aflatoxins and heavy metals.",

    contactsIntroFallback: "Whether you need pricing, samples, or logistics details, our team is ready to help.",
    directContactEyebrow: "Direct Contact",
    contactDetailsTitle: "Contact Details",
    contactDetailsDesc: "Connect with our sales department through your preferred channel.",
    emailLabel: "Email",
    phoneLabel: "Phone",
    headquartersLabel: "Headquarters",
    workingHoursLabel: "Working Hours",
    homeCategoryEyebrowVisible: true,
    homeCategoryBadgesVisible: true,
    homeCategoryTypesVisible: true,
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
            heroTitle: "Naturally Sweet Fruits From Rich Soil",
            heroSubtitle: "Hand-picked and processed to global export standards.",
            heroPrimaryCtaLabel: "Request Wholesale Catalog",
            heroSecondaryCtaLabel: "Our Processing Facilities",
            introLabel: "The HQ Dried Fruits Difference",
            introEyebrow: "About Us",
            introImage: "",
            introText: "We cultivate, process, and directly export the finest dried fruits from the Fergana Valley. Using advanced laser-sorting technology, we guarantee 99.9% purity for high-volume wholesale buyers across Europe and Asia.",
            statsGrid: [
                { value: "25+", label: "Years Experience" },
                { value: "10,000", label: "Tons Exported Annually" },
                { value: "40+", label: "Countries Served" },
                { value: "99.9%", label: "Sorting Purity" },
            ],
            productPreviewTitle: "Product Categories",
            productPreviewButtonLabel: "View Full Catalog",
            productPreviewItemCtaLabel: "View in Catalog",
            productPreviewCategoryLabel: "Product Category",
            productPreviewTypesLabel: "Types",
            productCategories: [
                { categoryKey: "raisins", categoryName: "Raisins", image: "/uploads/category-raisins.png", shortDescription: "Export-ready raisin lines across golden, brown, and dark varieties for wholesale buyers.", variantSummary: "Golden, Sultana, Soyaki, Black-Red", url: "/products" },
                { categoryKey: "dried-apricot", categoryName: "Dried Apricot", image: "/uploads/category-apricots.png", shortDescription: "Sun-dried apricot categories prepared for retail, confectionery, and mixed container orders.", variantSummary: "Subhana 3-4, Subhana 4-5, Subhana confectioner", url: "/products" },
                { categoryKey: "prunes", categoryName: "Prunes", image: "/uploads/category-prunes.png", shortDescription: "Calibrated prune selections with pitted and unpitted supply options for export programs.", variantSummary: "Spain, Hungarian Unpitted, Ashlock", url: "/products" },
                { categoryKey: "peanuts", categoryName: "Peanuts", image: "/uploads/category-peanuts.png", shortDescription: "Sorted peanut supply for food production, trading, and feed-related buyer requirements.", variantSummary: "In shell, Unshelled, Bird Feed", url: "/products" },
            ],
            exportMarketsEyebrow: "Buyer Channels",
            exportMarketsTitle: "Prepared for the way your business sells",
            exportMarketsIntro: "Different buyers need different packing, documentation, and product presentation. We prepare Uzbek dried fruit lines for retail shelves, wholesale cartons, food production, and private-label programs.",
            exportMarkets: [
                {
                    countryName: "Retail",
                    shortDescription: "Shelf-ready dried fruit lines for pouch, tray, and branded pack programs.",
                    statLabel: "Channel Fit",
                    statValue: "Shelf-ready",
                    image: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?q=80&w=1600&auto=format&fit=crop",
                },
                {
                    countryName: "Wholesale",
                    shortDescription: "Carton-based supply for importers, distributors, and trading programs.",
                    statLabel: "Format",
                    statValue: "Cartons",
                    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1600&auto=format&fit=crop",
                },
                {
                    countryName: "Food Industry",
                    shortDescription: "Ingredient-ready fruit and peanut lines for bakeries, confectionery, snacks, cereals, and processing.",
                    statLabel: "Use Case",
                    statValue: "Ingredients",
                    image: "https://images.unsplash.com/photo-1556911220-bff31c812dba?q=80&w=1600&auto=format&fit=crop",
                },
                {
                    countryName: "Private Label",
                    shortDescription: "Buyer-brand packing discussions with label, carton, and repeat-order consistency in mind.",
                    statLabel: "Branding",
                    statValue: "Buyer label",
                    image: "https://images.unsplash.com/photo-1607082350899-7e105aa886ae?q=80&w=1600&auto=format&fit=crop",
                },
            ],
        } as HomeContent,
    },
    {
        id: "about",
        name: "About Us",
        path: "/about",
        content: {
            heroBgImage: "",
            marqueeTitle: "Global Partners & Facilities",
            heroSubtitle: "A journey of quality and tradition.",
            productionMarqueeImages: [],
            partnerLogos: [],
            partnerSectionLabel: "Certified Quality & Trusted Partners",
            aboutTrustItems: [
                { key: "fda", label: "FDA Registered", visible: true },
                { key: "haccp", label: "HACCP Certified", visible: true },
                { key: "iso", label: "ISO 9001:2015", visible: true },
                { key: "organic", label: "100% Organic", visible: true },
                { key: "globalgap", label: "GlobalGAP", visible: true },
            ],
            companyEyebrow: "About The Company",
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
            orchardPhilosophyEyebrow: "Philosophy",
            orchardPhilosophyTitle: "Orchard Philosophy",
            orchardPhilosophy: "We believe strong export supply starts long before the final carton is packed. That means respecting the agricultural rhythm of each crop, maintaining disciplined processing controls, and building operations that scale without losing product character. Our philosophy is simple: preserve what makes the fruit valuable in the first place, then support it with systems buyers can trust.",
            productionStandardsTitle: "Production Standards",
            productionStandards: "Our production standards are built around export readiness, not just factory output. We work with controlled intake, calibrated sorting, food-safety procedures, and buyer-specific packing formats so product quality holds from the line to final dispatch. ISO, HACCP, and certification-led controls are part of that framework, but the real goal is practical consistency that importers can rely on across repeat orders.",
            missionPhotography: "https://images.unsplash.com/photo-1596591606975-97ee5cef3a1e?q=80&w=2000",
            missionNarrativeEyebrow: "Mission Narrative",
            missionNarrativeTitle: "What guides the way we grow, process, and deliver",
            missionNarrativeSublabel: "A clearer look at the company mission, heritage, philosophy, and standards, shaped into one visual section.",
            facilityEyebrow: "Inside The Facility",
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
            introEyebrow: "Uzbekistan Origin",
            introTitle: "One Page. Four Core Product Lines. Real Buyer Context.",
            introContent: "<p>Compare origin, processing, specifications, packing, and use cases without jumping between separate catalog pages.</p><p>Each product profile is structured for wholesale buyers who need practical sourcing information, not only marketing copy.</p>",
            introImage: "",
            introFacts: [
                { title: "Orchard Base", description: "Fruit-growing zones in Uzbekistan rely on irrigated valley and foothill production systems rather than rain-fed uncertainty." },
                { title: "Growing Conditions", description: "Hot, dry summers and sunlight help apricots, grapes, and plums build sugar." },
                { title: "Export Readiness", description: "Every line is positioned for buyer-specific cartons and repeat wholesale programs." },
            ],
            catalogEyebrow: "Filter by category",
            catalogTitle: "Product Catalog",
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
                nutritionTitle: "Product Information",
                nutritionPerLabel: "",
                caloriesLabel: "Field 1",
                proteinLabel: "Field 2",
                fatLabel: "Field 3",
                carbsLabel: "Field 4",
                inquiryTitle: "Request a Sample or Quote",
                companyPlaceholder: "Company Name",
                emailPlaceholder: "Work Email",
                volumePlaceholder: "Leave a message...",
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
            operationsImage: "",
            operationsEyebrow: "Export Operations",
            destinationEyebrow: "Buyer Channels",
            mapSectionTitle: "Prepared for the way your business sells",
            supplyRoutes: [
                { countryName: "Retail", mapCoordinatesId: "RTL", tooltipDescription: "Shelf-ready dried fruit lines for pouch, tray, and branded pack programs.", image: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?q=80&w=1400&auto=format&fit=crop" },
                { countryName: "Wholesale", mapCoordinatesId: "WHL", tooltipDescription: "Carton-based supply for importers, distributors, and trading programs.", image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1400&auto=format&fit=crop" },
                { countryName: "Food Industry", mapCoordinatesId: "IND", tooltipDescription: "Ingredient-ready fruit and peanut lines for bakeries, confectionery, snacks, cereals, and processing.", image: "https://images.unsplash.com/photo-1556911220-bff31c812dba?q=80&w=1400&auto=format&fit=crop" },
                { countryName: "Private Label", mapCoordinatesId: "PL", tooltipDescription: "Buyer-brand packing discussions with label, carton, and repeat-order consistency in mind.", image: "https://images.unsplash.com/photo-1607082350899-7e105aa886ae?q=80&w=1400&auto=format&fit=crop" },
            ],
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
            directContactEyebrow: "Direct Contact",
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

const managedPageIds = ["home", "about", "products", "export", "contacts", "privacy", "terms"] as const;

function mergePagesWithDefaults(pages?: PageData[]) {
    if (!pages?.length) {
        return initialPages;
    }

    return initialPages.map((page) => {
        const incoming = pages.find((candidate) => candidate.id === page.id);
        if (!incoming) {
            return page;
        }

        return {
            ...page,
            ...incoming,
            content: incoming.content ?? page.content,
        };
    });
}

const PageContext = createContext<PageContextType | undefined>(undefined);

export const PageProvider: React.FC<{ children: ReactNode; initialData?: PublicBootstrapPayload | null }> = ({ children, initialData }) => {
    const { locale } = useLanguage();
    const location = useLocation();
    const isAdminRoute = location.pathname === "/control-room" || location.pathname.startsWith("/control-room/");
    const bootstrapData = useMemo(
        () => (initialData && initialData.locale === locale ? initialData : null),
        [initialData, locale],
    );
    const [globalSettings, setGlobalSettings] = useState<GlobalSettings>(bootstrapData?.globalSettings ?? initialGlobalSettings);
    const [pages, setPages] = useState<PageData[]>(mergePagesWithDefaults(bootstrapData?.pages));
    const [pageSeo, setPageSeo] = useState<Record<string, SEOData>>(bootstrapData?.pageSeo ?? defaultPageSeoSettings);
    const [pageSeoLoaded, setPageSeoLoaded] = useState(Boolean(bootstrapData));
    const [pageDataLoaded, setPageDataLoaded] = useState(Boolean(bootstrapData));
    const [loadedLocale, setLoadedLocale] = useState<ActiveLocaleCode | null>(bootstrapData?.locale ?? null);
    const refreshRequestIdRef = useRef(0);

    const refreshData = async (requestedLocale?: LocaleCode) => {
        const targetLocale = getActiveLocale(requestedLocale || locale);
        const requestId = refreshRequestIdRef.current + 1;
        refreshRequestIdRef.current = requestId;
        setPageDataLoaded(false);
        setPageSeoLoaded(false);

        try {
            const localeQuery = `?locale=${encodeURIComponent(targetLocale)}&v=${Date.now()}`;
            const [globalsRes, seoRes] = await Promise.all([
                fetch(`/api/globals${localeQuery}`),
                fetch(`/api/seo/pages${localeQuery}`),
            ]);

            const [globalsData, seoData] = await Promise.all([
                globalsRes.ok ? globalsRes.json() : Promise.resolve(null),
                seoRes.ok ? seoRes.json() : Promise.resolve(null),
            ]);

            const pagePromises = managedPageIds.map(async (id) => {
                const res = await fetch(`/api/pages/${id}${localeQuery}`);
                if (!res.ok) {
                    return null;
                }

                return { id, content: await res.json() };
            });
            const results = await Promise.all(pagePromises);

            if (requestId !== refreshRequestIdRef.current) {
                return;
            }

            if (globalsData) {
                setGlobalSettings(globalsData);
            }

            if (seoData) {
                setPageSeo(seoData);
            }

            setPages(
                initialPages.map((page) => {
                    const match = results.find((result) => result?.id === page.id);
                    return match ? { ...page, content: match.content } : page;
                }),
            );
            setLoadedLocale(targetLocale);
        } catch (error) {
            console.error("Failed to refresh page data:", error);
        } finally {
            if (requestId === refreshRequestIdRef.current) {
                setPageDataLoaded(true);
                setPageSeoLoaded(true);
            }
        }
    };

    useEffect(() => {
        if (isAdminRoute) {
            return;
        }

        if (bootstrapData) {
            setGlobalSettings(bootstrapData.globalSettings);
            setPages(mergePagesWithDefaults(bootstrapData.pages));
            setPageSeo(bootstrapData.pageSeo);
            setPageDataLoaded(true);
            setPageSeoLoaded(true);
            setLoadedLocale(bootstrapData.locale);
            return;
        }

        if (loadedLocale === locale && pageDataLoaded && pageSeoLoaded) {
            return;
        }

        void refreshData(locale);
    }, [bootstrapData, isAdminRoute, loadedLocale, locale]);

    const updateGlobalSettings = async (settings: GlobalSettings, requestedLocale?: LocaleCode) => {
        const targetLocale = getActiveLocale(requestedLocale || locale);
        const response = await fetch(`/api/globals?locale=${encodeURIComponent(targetLocale)}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(settings),
        });
        if (response.ok) {
            setGlobalSettings(settings);
        } else {
            throw new Error("Failed to update global settings");
        }
    };

    const updatePage = async (id: string, newPageData: PageData, requestedLocale?: LocaleCode, changedPaths?: string[]) => {
        const targetLocale = getActiveLocale(requestedLocale || locale);
        const response = await fetch(`/api/pages/${id}?locale=${encodeURIComponent(targetLocale)}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: newPageData.content, changedPaths }),
        });
        if (response.ok) {
            setPages((prev) => prev.map((p) => (p.id === id ? newPageData : p)));
        } else {
            throw new Error("Failed to update page");
        }
    };

    const updatePageSeo = async (id: string, seo: SEOData, requestedLocale?: LocaleCode) => {
        const targetLocale = getActiveLocale(requestedLocale || locale);
        const response = await fetch(`/api/seo/pages/${id}?locale=${encodeURIComponent(targetLocale)}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(seo),
        });
        if (response.ok) {
            setPageSeo((prev) => ({ ...prev, [id]: seo }));
        } else {
            throw new Error("Failed to update SEO settings");
        }
    };

    return (
        <PageContext.Provider
            value={{
                globalSettings,
                pageDataLoaded,
                currentLocale: locale,
                updateGlobalSettings,
                pages,
                updatePage,
                pageSeo,
                pageSeoLoaded,
                updatePageSeo,
                refreshData,
            }}
        >
            {children}
        </PageContext.Provider>
    );
};

export function usePages() {
    const context = useContext(PageContext);
    if (!context) {
        throw new Error("usePages must be used within a PageProvider");
    }
    return context;
}
