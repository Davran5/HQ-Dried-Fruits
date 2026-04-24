import dotenv from "dotenv";
import express, { Request } from "express";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import fs from "fs";
import mysql from "mysql2/promise";
import React from "react";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom";
import { AppShell } from "./src/App";

dotenv.config();

console.log("🛠️  Server environment initializing...");
console.log(process.env.TELEGRAM_BOT_TOKEN ? "✅ TELEGRAM_BOT_TOKEN found" : "❌ TELEGRAM_BOT_TOKEN missing");
console.log(process.env.TELEGRAM_CHAT_ID ? "✅ TELEGRAM_CHAT_ID found" : "❌ TELEGRAM_CHAT_ID missing");
console.log(process.env.DB_HOST ? `✅ DB_HOST: ${process.env.DB_HOST}` : "❌ DB_HOST missing — check .env");
console.log(process.env.DB_NAME ? `✅ DB_NAME: ${process.env.DB_NAME}` : "❌ DB_NAME missing — check .env");

const uploadsDir = path.join(process.cwd(), "public", "uploads");
const distDir = path.join(process.cwd(), "dist");

// ---------- MySQL Connection Pool ----------
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "",
  database: process.env.DB_NAME || "hq_dried_fruits",
  port: parseInt(process.env.DB_PORT || "3306"),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

// ---------- DB query wrapper (mirrors old API exactly) ----------
type DbQueryResult<T = Record<string, any>> = {
  rows: T[];
  rowCount: number;
  insertId?: number;
};

const db = {
  query: async <T = Record<string, any>>(sql: string, params: any[] = []): Promise<DbQueryResult<T>> => {
    // Translate PostgreSQL $1,$2 placeholders to MySQL ? placeholders
    const mysqlSql = sql.replace(/\$(\d+)/g, "?");
    console.log(`[DB Query] ${mysqlSql} | Params: ${JSON.stringify(params)}`);
    try {
      const [result] = await pool.execute(mysqlSql, params);
      if (Array.isArray(result)) {
        const rows = result as T[];
        return { rows, rowCount: rows.length };
      }

      const header = result as mysql.ResultSetHeader;
      return {
        rows: [],
        rowCount: Number(header.affectedRows ?? 0),
        insertId: Number(header.insertId ?? 0),
      };
    } catch (err: any) {
      console.error(`[DB Error] ${err?.message}`);
      throw err;
    }
  },
};

// ---------- Schema Bootstrap ----------
async function initDb() {
  const conn = await pool.getConnection();
  try {
    console.log("🗄️  Bootstrapping MySQL schema...");

    // Singleton-page tables with lang support
    await conn.execute(`CREATE TABLE IF NOT EXISTS global_settings (
      id INT NOT NULL DEFAULT 1, lang VARCHAR(10) NOT NULL DEFAULT 'en',
      header_logo TEXT, site_name TEXT, nav_links TEXT, cta_text TEXT, cta_url TEXT,
      footer_logo TEXT, footer_description TEXT, footer_lead_text TEXT, quick_links TEXT,
      office_address TEXT, phone_number TEXT, email_address TEXT, telegram_url TEXT,
      footer_cta_title TEXT, footer_cta_email TEXT, footer_copyright_text TEXT,
      ui_labels LONGTEXT, google_site_verification_id TEXT,
      PRIMARY KEY (id, lang)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);

    await conn.execute(`CREATE TABLE IF NOT EXISTS products_page (
      id INT NOT NULL DEFAULT 1, lang VARCHAR(10) NOT NULL DEFAULT 'en',
      page_title TEXT, page_subtitle TEXT, hero_bg_image TEXT, ordering_bg_image TEXT,
      ordering_form_title TEXT, ordering_form_subtitle TEXT, step_one_label TEXT,
      step_two_label TEXT, step_three_label TEXT, mixed_container_label TEXT,
      volume_options TEXT, view_specs_label TEXT, step_one_placeholder TEXT,
      step_three_placeholder TEXT, next_step_button_label TEXT, back_button_label TEXT,
      submit_button_label TEXT, submitting_button_label TEXT, detail_ui LONGTEXT,
      quick_contact_title TEXT, quick_contact_subtitle TEXT, telegram_label TEXT,
      telegram_sublabel TEXT, call_label TEXT, email_label TEXT, quick_phone TEXT, quick_email TEXT,
      PRIMARY KEY (id, lang)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);

    await conn.execute(`CREATE TABLE IF NOT EXISTS export_page (
      id INT NOT NULL DEFAULT 1, lang VARCHAR(10) NOT NULL DEFAULT 'en',
      hero_title TEXT, hero_subtitle TEXT, hero_bg_image TEXT, map_section_title TEXT,
      supply_routes LONGTEXT, logistics_content LONGTEXT, packaging_title TEXT,
      packaging_methods LONGTEXT, transportation_title TEXT, transportation_methods LONGTEXT,
      documentation_title TEXT, documentation_content LONGTEXT, quality_title TEXT,
      technical_specs LONGTEXT, quality_checks LONGTEXT, certifications_gallery LONGTEXT,
      PRIMARY KEY (id, lang)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);

    await conn.execute(`CREATE TABLE IF NOT EXISTS contacts_page (
      id INT NOT NULL DEFAULT 1, lang VARCHAR(10) NOT NULL DEFAULT 'en',
      page_title TEXT, intro_text TEXT, form_destination_email TEXT, contact_form_title TEXT,
      response_label_prefix TEXT, form_name_label TEXT, form_company_label TEXT,
      form_email_label TEXT, form_message_label TEXT, submit_button_label TEXT,
      submitting_button_label TEXT, email TEXT, phone TEXT, office_address TEXT,
      working_hours TEXT, map_pin_label TEXT, info_email_label TEXT, info_phone_label TEXT,
      info_address_label TEXT, info_hours_label TEXT, social_section_title TEXT,
      telegram_url TEXT, instagram_url TEXT, whatsapp_url TEXT, facebook_url TEXT,
      headquarters_image TEXT, google_maps_url TEXT,
      PRIMARY KEY (id, lang)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);

    // Flexible content tables (home, about, privacy, terms)
    for (const tableName of ['home_page', 'about_page', 'privacy_page', 'terms_page']) {
      await conn.execute(`CREATE TABLE IF NOT EXISTS ${tableName} (
        id INT NOT NULL DEFAULT 1, lang VARCHAR(10) NOT NULL DEFAULT 'en',
        content LONGTEXT,
        PRIMARY KEY (id, lang)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
    }

    await conn.execute(`CREATE TABLE IF NOT EXISTS products (
      id VARCHAR(255) NOT NULL, lang VARCHAR(10) NOT NULL DEFAULT 'en',
      name TEXT, category TEXT, status TEXT, image TEXT, image_gallery LONGTEXT,
      short_description TEXT, long_description LONGTEXT, highlights LONGTEXT,
      content_sections LONGTEXT, nutrition LONGTEXT, inquiry_subject_line TEXT,
      tonnage_options TEXT, seo LONGTEXT,
      PRIMARY KEY (id, lang)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);

    await conn.execute(`CREATE TABLE IF NOT EXISTS leads (
      id VARCHAR(255) PRIMARY KEY, date TEXT, name TEXT, company TEXT, email TEXT,
      phone TEXT, telegram TEXT, product_interest TEXT, est_tonnage TEXT,
      status TEXT, message TEXT, notes TEXT
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);

    await conn.execute(`CREATE TABLE IF NOT EXISTS page_seo (
      page_id VARCHAR(100) NOT NULL, lang VARCHAR(10) NOT NULL DEFAULT 'en',
      meta_title TEXT, meta_description TEXT, slug TEXT, og_title TEXT, image_alt TEXT,
      PRIMARY KEY (page_id, lang)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);

    // Seed empty singleton rows for each locale if missing
    const singletonTables = ['global_settings','products_page','export_page','contacts_page','home_page','about_page','privacy_page','terms_page'];
    const langs = ['en','ru','uz'];
    for (const table of singletonTables) {
      for (const lang of langs) {
        await conn.execute(
          `INSERT IGNORE INTO ${table} (id, lang) VALUES (1, ?)`,
          [lang]
        );
      }
    }

    console.log("✅ MySQL database initialized");
  } catch (err) {
    console.error("❌ MySQL schema bootstrap failed:", err);
    throw err;
  } finally {
    conn.release();
  }
}
type SeoRecord = { metaTitle: string; metaDescription: string; slug: string; ogTitle: string; imageAlt: string; };
type ProductSectionRecord = { title: string; body: string; };
type LeadStatus = "New" | "Contacted" | "In Progress" | "Converted" | "Disqualified";
type PageId = "home" | "about" | "products" | "export" | "contacts" | "privacy" | "terms";

const validLeadStatuses = new Set<LeadStatus>(["New", "Contacted", "In Progress", "Converted", "Disqualified"]);

const pageContentTables = { home: "home_page", about: "about_page", privacy: "privacy_page", terms: "terms_page" } as const;

const defaultPageSlugs: Record<PageId, string> = { home: "", about: "about", products: "products", export: "export", contacts: "contacts", privacy: "privacy", terms: "terms" };

const reservedPageSlugs = new Set(["admin", "api", "uploads", "robots.txt", "sitemap.xml"]);

const defaultGlobalSettings = {
  headerLogo: "", siteName: "HQ Dried Fruits",
  navLinks: [{ label: "Home", url: "/" }, { label: "About", url: "/about" }, { label: "Products", url: "/products" }, { label: "Export", url: "/export" }, { label: "Contacts", url: "/contacts" }],
  ctaText: "Get Quote", ctaUrl: "/contacts", footerLogo: "",
  footerDescription: "Quality sun-dried fruits from the heart of Uzbekistan. Exporting nature's sweetness to global B2B partners with uncompromising quality.",
  footerLeadText: "Get our latest pricing and export terms directly to your inbox or Telegram.",
  quickLinks: [{ label: "About Us", url: "/about" }, { label: "Export", url: "/export" }, { label: "Contacts", url: "/contacts" }],
  officeAddress: "Amir Temur Ave 107B, Tashkent, Uzbekistan", phoneNumber: "+998 90 123 45 67", emailAddress: "export@hqdriedfruits.com", telegramUrl: "",
  footerCtaTitle: "Need a custom container quote?", footerCtaEmail: "export@hqdriedfruits.com", footerCopyrightText: "HQ Dried Fruits. All rights reserved.",
  uiLabels: { 
    // Navigation & General
    mobileNavigationTitle: "Navigation", 
    mobileContactTitle: "Contact Us", 
    homeMetaTitle: "HQ Dried Fruits | High-Quality Organic Export",
    productsMetaTitle: "Our Products | Wholesale Catalog",
    exportMetaTitle: "Global Export & Logistics",
    contactsMetaTitle: "Contact Us | Wholesale Inquiries",
    routeLoadingLabel: "Loading route...", 
    notFoundTitle: "Page Not Found", 
    notFoundBody: "The page you requested does not exist or its address has changed.", 
    notFoundButtonLabel: "Back to Homepage",
    
    // Homepage Specifics
    requestCatalogLabel: "Request Wholesale Catalog",
    exploreProductsLabel: "Explore Products",
    heritageSloganLabel: "Decades of expertise in every harvest.",
    aboutCompanyLabel: "About The Company",
    statYearsLabel: "Years Experience",
    statTonsLabel: "Tons Exported",
    productSelectionSublabel: "Hand-picked and naturally sun-dried.",
    viewFullCatalogLabel: "View Full Catalog",
    requestSampleLabel: "Request Sample",
    learnMoreLabel: "Learn About Our Export Process",
    getPricingLabel: "Get Pricing & Samples",
    
    // About Page Specifics
    heritageStat1Title: "The First Harvest", heritageStat1Desc: "Started as a small family orchard in the Fergana Valley.",
    heritageStat2Title: "Scaling Operations", heritageStat2Desc: "Introduced modern sun-drying techniques.",
    heritageStat3Title: "Going Global", heritageStat3Desc: "Achieved international organic certifications.",
    heritageStat4Title: "Modern Logistics", heritageStat4Desc: "State-of-the-art logistics hub in Tashkent.",
    prodStep1Title: "Raw Intake", prodStep1Subtitle: "Harvest Selection", prodStep1Desc: "Incoming fruit is sorted by batch, moisture profile, and destination requirements before processing begins.",
    prodStep2Title: "Processing", prodStep2Subtitle: "Laser & X-Ray Control", prodStep2Desc: "Each production line is calibrated for purity, defect removal, and export-grade consistency across volume orders.",
    prodStep3Title: "Packaging", prodStep3Subtitle: "Buyer-Specific Formats", prodStep3Desc: "We pack for retail, private label, and industrial shipments with the same in-house quality checks before dispatch.",
    prodStep4Title: "Dispatch", prodStep4Subtitle: "Export Handover", prodStep4Desc: "Finished cargo is documented, palletized, and scheduled for the route that best fits the buyer’s timeline and market.",
    missionPurposeLabel: "Purpose", missionHeritageLabel: "Heritage", missionPhilosophyLabel: "Philosophy", missionStandardsLabel: "Standards",
    orchardPhilosophyLabel: "Orchard Philosophy",
    whoWeAreFallback1: "Deeply embedded in the agricultural heart of Central Asia, HQ Dried Fruits brings orchard control, processing discipline, and export execution into one operating system.",
    whoWeAreFallback2: "That structure helps wholesale buyers secure consistent product, clearer documentation, and repeatable shipment preparation across seasons.",
    missionNarrativeEyebrow: "Mission Narrative", missionNarrativeTitle: "What guides the way we grow, process, and deliver", missionNarrativeSublabel: "A clearer look at the company mission, heritage, philosophy, and standards, shaped into one visual section.",
    insideFacilityEyebrow: "Inside The Facility",
    haccpLabel: "HACCP Certified", isoLabel: "ISO 9001:2015", organicLabel: "100% Organic", globalGapLabel: "GlobalGap", fdaLabel: "FDA Registered",
    
    // Export Page Specifics
    exportOpsEyebrow: "Export Operations", exportOpsTitle: "Built for Buyer-Specific Routing, Documentation, and Packing",
    logisticsDesc1: "We handle end-to-end multi-modal transport routing around buyer requirements, from packing format and paperwork to the most efficient lane for delivery.",
    logisticsDesc2: "Each shipment is structured around repeatability, destination compliance, and wholesale practicality so importers can move with less friction from order to warehouse receipt.",
    packagingTitle: "Custom Packaging", packagingDesc: "Bulk cartons, vacuum-sealed bags, or retail-ready packaging customized with your brand labels.",
    transportationTitle: "Ocean & Rail Freight", transportationDesc: "Cost-effective FCL (Full Container Load) and LCL shipments via major ports and the trans-Eurasian rail network.",
    documentationTitle: "Customs Clearance", documentationDesc: "Full documentation support including phytosanitary certificates, certificates of origin, and EUR.1.",
    destinationBreakdownEyebrow: "Destination Breakdown", destinationBreakdownTitle: "How each destination lane is prepared before dispatch", destinationBreakdownDesc: "Export planning changes by market. Select a destination to preview the lane focus, the route context, and how we position packing and documentation around buyer expectations.",
    qualityGuaranteeTitle: "The Quality Guarantee", qualityGuaranteeDesc: "Our processing facilities utilize advanced laser sorting and X-ray inspection to guarantee 99.9% purity.",
    moistureControlLabel: "Moisture Control", moistureControlDesc: "Strictly maintained at 18-22% for optimal shelf life.",
    sizeCalibrationLabel: "Size Calibration", sizeCalibrationDesc: "Laser-graded for uniform sizing (Jumbo, Large, Medium).",
    microSafeLabel: "Microbiological Safety", microSafeDesc: "Regular lab testing for aflatoxins and heavy metals.",
    qualitySealLabel: "Product Quality Seal",
    
    // Contacts Page & Forms
    contactsTitle: "Let's Connect",
    contactsIntroFallback: "Whether you need a custom quote, a sample box, or logistics details, our export team is ready to assist you.",
    sendInquiryTitle: "Send an Inquiry",
    formNameLabel: "Full Name", formEmailLabel: "Work Email", formPhoneLabel: "Phone Number", formMessageLabel: "Message", formCompanyLabel: "Company",
    submitBtnLabel: "Send Inquiry", submittingLabel: "Sending...", sendMessageLabel: "Send Message",
    inquirySuccessMsg: "Inquiry received. The export team will contact you shortly.",
    inquiryFailureMsg: "Submission failed. Please try again.",
    directContactEyebrow: "Direct Contact", contactDetailsTitle: "Contact Details", contactDetailsDesc: "Reach our sales and export coordination team through the fastest channel for your request.",
    emailLabel: "Email", phoneLabel: "Phone", headquartersLabel: "Headquarters", workingHoursLabel: "Working Hours",
    
    // Footer Labels
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
    footerCopyright: "HQ Dried Fruits. All rights reserved.",
    footerInquirySuccess: "Thanks for reaching out! We will contact you shortly.",

    // Products Page Labels
    productsTitle: "Wholesale Catalog", productsSubtitle: "Explore our export-ready collection.",
    overviewLabel: "Overview", originLabel: "Origin", benefitsLabel: "Benefits", exportLabel: "Export",
    requestQuoteBtn: "Request Wholesale Quote", orderingFormStepLabel: "Step",
    privacyTitle: "Privacy Policy", termsTitle: "Terms of Service"
  },
  googleSiteVerificationId: "",
};

const defaultProductsPage = {
  pageTitle: "Wholesale Dried Fruits from Uzbekistan",
  pageSubtitle: "Explore export-ready apricots, raisins, prunes, and mixed assortments with buyer-focused origin, processing, and application details in one catalog.",
  heroBgImage: "", orderingBgImage: "", orderingFormTitle: "Wholesale Inquiry",
  orderingFormSubtitle: "Share your target volume and timeline. We will respond with pricing and logistics details.",
  stepOneLabel: "Which product are you interested in?", stepTwoLabel: "Estimated Monthly Volume?", stepThreeLabel: "Where should we send the quote?",
  mixedContainerLabel: "Mixed Container", volumeOptions: ["1-5 Tons", "5-20 Tons", "1 FCL (20ft)", "Multiple FCLs"],
  viewSpecsLabel: "View Specifications", stepOnePlaceholder: "Select a product...", stepThreePlaceholder: "Work Email Address",
  nextStepButtonLabel: "Next Step", backButtonLabel: "Back", submitButtonLabel: "Get Instant Quote", submittingButtonLabel: "Sending...",
  detailUi: { loadingLabel: "Loading Specifications...", notFoundTitle: "Product Not Found", notFoundBody: "The product you're looking for doesn't exist.", backToCatalogLabel: "Back to Catalog", nutritionTitle: "Nutritional Profile", nutritionPerLabel: "(per 100g)", caloriesLabel: "Calories", proteinLabel: "Protein", fatLabel: "Fat", carbsLabel: "Carbs", inquiryTitle: "Request a Sample or Quote", companyPlaceholder: "Company Name", emailPlaceholder: "Work Email", volumePlaceholder: "Select Volume...", inquiryButtonLabel: "Send Inquiry", inquirySubmittingLabel: "Sending Inquiry..." },
  quickContactTitle: "Need it faster?", quickContactSubtitle: "Skip the form. Connect with our export sales team directly for immediate assistance.",
  telegramLabel: "Telegram Bot", telegramSublabel: "Instant quotes & catalog PDF", callLabel: "Call Sales", emailLabel: "Email Us",
  quickPhone: "+998 90 123 45 67", quickEmail: "sales@hqdriedfruits.com",
};

const defaultExportPage = {
  heroTitle: "Our Global Export Network", heroSubtitle: "Seamless global logistics from the heart of the Silk Road to your warehouse.", heroBgImage: "",
  mapSectionTitle: "Our Global Export Network", supplyRoutes: [], logisticsContent: "<p>End-to-end multi-modal transport routing.</p>",
  packagingTitle: "Custom Packaging", packagingMethods: "<p>Bulk cartons, vacuum-sealed bags, or retail-ready packaging customized with your brand labels.</p>",
  transportationTitle: "Ocean & Rail Freight", transportationMethods: "<p>Cost-effective FCL (Full Container Load) and LCL shipments via major ports and the trans-Eurasian rail network.</p>",
  documentationTitle: "Customs Clearance", documentationContent: "<p>Full documentation support including phytosanitary certificates, certificates of origin, and EUR.1.</p>",
  qualityTitle: "The Quality Guarantee", technicalSpecs: "<p>X-Ray and Laser sorting guarantee removal of stones, stems, and defects.</p>",
  qualityChecks: [{ title: "Moisture Control", description: "Strictly maintained at 18-22% for optimal shelf life." }, { title: "Size Calibration", description: "Laser-graded for uniform sizing (Jumbo, Large, Medium)." }, { title: "Microbiological Safety", description: "Regular lab testing for aflatoxins and heavy metals." }],
  certificationsGallery: [],
};

const defaultContactsPage = {
  pageTitle: "Let's Connect", introText: "Whether you need a mixed container or a dedicated harvest line, our B2B team is available 24/7.",
  formDestinationEmail: "sales@hqdriedfruits.com", contactFormTitle: "Send an Inquiry", responseLabelPrefix: "Replies are monitored at",
  formNameLabel: "Full Name", formCompanyLabel: "Company", formEmailLabel: "Work Email", formMessageLabel: "Message",
  submitButtonLabel: "Send Message", submittingButtonLabel: "Sending...", emailAddress: "sales@hqdriedfruits.com", phoneNumber: "+998 90 123 45 67",
  officeAddress: "Amir Temur Ave 107B", workingHours: "Mon-Sat: 09:00 - 18:00 (Tashkent Time)", mapPinLabel: "HQ Dried Fruits HQ",
  infoEmailLabel: "Email", infoPhoneLabel: "Phone", infoAddressLabel: "Headquarters", infoHoursLabel: "Working Hours",
  socialSectionTitle: "Social Media", telegramUrl: "", instagramUrl: "", whatsappUrl: "", facebookUrl: "", headquartersImage: "", googleMapsUrl: "",
};

const defaultSimplePages = {
  privacy: { title: "Privacy Policy", body: "<p>We use the information submitted through this website to respond to wholesale inquiries, prepare quotes, and manage customer communication.</p>" },
  terms: { title: "Terms of Service", body: "<p>Information on this site is provided for wholesale inquiry and quotation purposes.</p>" },
};

const defaultPageSeo: Record<PageId, SeoRecord> = {
  home: { metaTitle: "HQ Dried Fruits | High-Quality Organic Export", metaDescription: "Quality sun-dried fruits from the heart of Uzbekistan.", slug: "", ogTitle: "HQ Dried Fruits", imageAlt: "Sun-dried apricots from Uzbekistan" },
  about: { metaTitle: "About HQ Dried Fruits | Our Heritage & Mission", metaDescription: "Decades of expertise in every harvest.", slug: "about", ogTitle: "About HQ Dried Fruits", imageAlt: "Sorting facility in Uzbekistan" },
  products: { metaTitle: "Wholesale Dried Apricots, Raisins, Prunes | HQ Dried Fruits", metaDescription: "Source Uzbekistan dried apricots, raisins, and prunes.", slug: "products", ogTitle: "HQ Dried Fruits Product Catalog", imageAlt: "Assorted dried fruits" },
  export: { metaTitle: "Global Logistics & Export | HQ Dried Fruits", metaDescription: "Seamless global logistics from the heart of the Silk Road to your warehouse.", slug: "export", ogTitle: "HQ Dried Fruits Export", imageAlt: "Global supply map" },
  contacts: { metaTitle: "Contact HQ Dried Fruits | Wholesale Inquiries", metaDescription: "Get our latest wholesale pricing, request a sample box, or discuss logistics with our export team.", slug: "contacts", ogTitle: "Contact HQ Dried Fruits", imageAlt: "HQ Dried Fruits Headquarters Map" },
  privacy: { metaTitle: "Privacy Policy | HQ Dried Fruits", metaDescription: "Privacy policy for HQ Dried Fruits.", slug: "privacy", ogTitle: "Privacy Policy | HQ Dried Fruits", imageAlt: "Privacy Policy" },
  terms: { metaTitle: "Terms of Service | HQ Dried Fruits", metaDescription: "Terms of service for HQ Dried Fruits.", slug: "terms", ogTitle: "Terms of Service | HQ Dried Fruits", imageAlt: "Terms of Service" },
};

function normalizeSlug(value: string, fallback = "") {
  const normalized = value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return normalized || fallback;
}

function getManagedPageSlug(pageId: PageId, pageSeo: Record<PageId, SeoRecord> = defaultPageSeo) {
  if (pageId === "home") return "";
  return normalizeSlug(pageSeo[pageId]?.slug || "", defaultPageSlugs[pageId]);
}

function getManagedPagePath(pageId: PageId, pageSeo: Record<PageId, SeoRecord> = defaultPageSeo) {
  const slug = getManagedPageSlug(pageId, pageSeo);
  return slug ? `/${slug}` : "/";
}

const activeLocales = ["en", "ru", "uz"] as const;
type ActiveLocale = (typeof activeLocales)[number];

function isActiveLocale(value: string | null | undefined): value is ActiveLocale {
  return Boolean(value && activeLocales.includes(value as ActiveLocale));
}

function normalizeLocale(value: string | null | undefined, fallback: ActiveLocale = "en"): ActiveLocale {
  const normalized = asString(value).trim().toLowerCase();
  return isActiveLocale(normalized) ? normalized : fallback;
}

function buildLocalePath(locale: ActiveLocale, pathname = "/") {
  const normalizedPath = normalizePathname(pathname);
  return normalizedPath === "/" ? `/${locale}` : `/${locale}${normalizedPath}`;
}

function parseLocalePathname(pathname: string) {
  const normalizedPath = normalizePathname(pathname);
  const segments = normalizedPath.split("/").filter(Boolean);

  if (segments.length === 0) {
    return {
      locale: null as ActiveLocale | null,
      pathname: "/",
      isLocalePrefixed: false,
    };
  }

  const [candidateLocale, ...rest] = segments;
  if (!isActiveLocale(candidateLocale)) {
    return {
      locale: null as ActiveLocale | null,
      pathname: normalizedPath,
      isLocalePrefixed: false,
    };
  }

  return {
    locale: candidateLocale,
    pathname: rest.length > 0 ? `/${rest.join("/")}` : "/",
    isLocalePrefixed: true,
  };
}

function getLocalizedPagePath(pageId: PageId, locale: ActiveLocale, pageSeo: Record<PageId, SeoRecord> = defaultPageSeo) {
  return buildLocalePath(locale, getManagedPagePath(pageId, pageSeo));
}

function getLocalizedProductPath(product: ReturnType<typeof mapProduct>, locale: ActiveLocale, pageSeo: Record<PageId, SeoRecord> = defaultPageSeo) {
  return buildLocalePath(locale, getProductPath(product, pageSeo));
}

function ensureDirectory(directoryPath: string) {
  if (!fs.existsSync(directoryPath)) fs.mkdirSync(directoryPath, { recursive: true });
}

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function asContentString(value: unknown, fallback = "") {
  const content = asString(value).trim();
  if (!content || content === "[]" || content === "{}" || content === "null") return fallback;
  return content;
}

function safeParseJson<T>(value: unknown, fallback: T): T {
  if (value !== null && typeof value === "object") return value as T;
  if (typeof value !== "string" || value.trim() === "") return fallback;
  try {
    const parsed = JSON.parse(value);
    return parsed !== null ? (parsed as T) : fallback;
  } catch {
    return fallback;
  }
}

type SharedMediaConfig = {
  scalar?: string[];
  imageOnlyArrays?: string[];
  mixedImageArrays?: string[];
};

const sharedMediaConfigs: Record<string, SharedMediaConfig> = {
  home: {
    scalar: ["heroBgImage", "introImage", "supplyReachBgImage", "ctaBgImage"],
    mixedImageArrays: ["productCategories", "exportMarkets"],
  },
  about: {
    scalar: ["missionPhotography"],
    imageOnlyArrays: ["productionMarqueeImages", "partnerLogos", "heritageImagery"],
    mixedImageArrays: ["ownProductionItems"],
  },
  products: {
    scalar: ["heroBgImage", "orderingBgImage"],
  },
  export: {
    scalar: ["heroBgImage"],
    mixedImageArrays: ["supplyRoutes", "certificationsGallery"],
  },
  contacts: {
    scalar: ["headquartersImage"],
  },
};

function sanitizeFlexiblePageContent(pageId: keyof typeof pageContentTables, content: any) {
  if (!content || typeof content !== "object" || Array.isArray(content)) return {};
  const next = { ...content };

  if (pageId === "home") {
    delete next.progressSlider;
  }

  return next;
}

function hasOwn(value: Record<string, unknown>, key: string) {
  return Object.prototype.hasOwnProperty.call(value, key);
}

function localePreferenceRows(rows: any[], order: readonly string[]) {
  const used = new Set<any>();
  const ordered = order
    .map((locale) => rows.find((row) => asString(row?.lang, "en") === locale))
    .filter(Boolean);
  ordered.forEach((row) => used.add(row));
  return [...ordered, ...rows.filter((row) => !used.has(row))];
}

function sharedMediaRows(rows: any[]) {
  return localePreferenceRows(rows, ["en", ...activeLocales.filter((locale) => locale !== "en")]);
}

function arrayHasImage(items: unknown) {
  if (!Array.isArray(items)) return false;
  return items.some((item) => {
    if (typeof item === "string") return item.trim().length > 0;
    if (!item || typeof item !== "object" || Array.isArray(item)) return false;
    return asString((item as any).image).trim().length > 0;
  });
}

function hasSharedMedia(content: any, config?: SharedMediaConfig) {
  if (!config || !content || typeof content !== "object") return false;

  if ((config.scalar || []).some((key) => asString(content[key]).trim().length > 0)) return true;
  if ((config.imageOnlyArrays || []).some((key) => arrayHasImage(content[key]))) return true;
  if ((config.mixedImageArrays || []).some((key) => arrayHasImage(content[key]))) return true;

  return false;
}

function mergeMixedImageArray(sourceItems: unknown, targetItems: unknown) {
  if (!Array.isArray(sourceItems)) return Array.isArray(targetItems) ? targetItems : [];
  const existingItems = Array.isArray(targetItems) ? targetItems : [];

  return sourceItems.map((sourceItem, index) => {
    if (!sourceItem || typeof sourceItem !== "object" || Array.isArray(sourceItem)) {
      return sourceItem;
    }

    const existingItem = existingItems[index];
    const base = existingItem && typeof existingItem === "object" && !Array.isArray(existingItem)
      ? { ...(existingItem as Record<string, unknown>) }
      : { ...(sourceItem as Record<string, unknown>) };

    base.image = asString((sourceItem as any).image);
    return base;
  });
}

function applySharedMedia(targetContent: any, sourceContent: any, config?: SharedMediaConfig) {
  if (!config || !sourceContent || typeof sourceContent !== "object") return targetContent;
  const next = targetContent && typeof targetContent === "object" && !Array.isArray(targetContent)
    ? { ...targetContent }
    : {};

  for (const key of config.scalar || []) {
    if (hasOwn(sourceContent, key)) next[key] = asString(sourceContent[key]);
  }

  for (const key of config.imageOnlyArrays || []) {
    if (hasOwn(sourceContent, key)) next[key] = Array.isArray(sourceContent[key]) ? sourceContent[key] : [];
  }

  for (const key of config.mixedImageArrays || []) {
    if (hasOwn(sourceContent, key)) next[key] = mergeMixedImageArray(sourceContent[key], next[key]);
  }

  return next;
}

function pickSharedMediaContent(contents: Array<{ lang: string; content: any }>, config?: SharedMediaConfig) {
  return sharedMediaRows(contents)
    .map((entry) => entry.content)
    .find((content) => hasSharedMedia(content, config));
}

function pickSharedMediaField(rows: any[], field: string, fallback: unknown = "") {
  const row = sharedMediaRows(rows).find((candidate) => {
    const value = candidate?.[field];
    if (typeof value !== "string" || !value.trim()) return false;
    if (value.trim().startsWith("[")) return safeParseJson<unknown[]>(value, []).length > 0;
    return true;
  });

  return row ? row[field] : fallback;
}

function mergeProductSharedMedia(row: any, rows: any[]) {
  return {
    ...row,
    image: asString(pickSharedMediaField(rows, "image", row?.image)),
    image_gallery: pickSharedMediaField(rows, "image_gallery", row?.image_gallery),
  };
}

function createLeadId() {
  const timestamp = new Date().toISOString().replace(/\D/g, "").slice(2, 14);
  return `L-${timestamp}-${Math.floor(100 + Math.random() * 900)}`;
}

function normalizePathname(pathname: string) {
  const trimmed = pathname.replace(/\/+$/, "");
  return trimmed === "" ? "/" : trimmed;
}

function stripHtml(value: string) { return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(); }
function escapeHtml(value: string) { return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;"); }
function toAbsoluteUrl(value: string, origin: string) {
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;
  return value.startsWith("/") ? `${origin}${value}` : `${origin}/${value}`;
}

function getOrigin(req: Request) { return `${req.header("x-forwarded-proto") || req.protocol || "http"}://${req.get("host") || "localhost:3001"}`; }

ensureDirectory(uploadsDir);

function sanitizeUploadBaseName(filename: string) {
  const sanitized = path.parse(filename).name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "").slice(0, 60);
  return sanitized || "image";
}

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

const app = express();
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use("/uploads", express.static(uploadsDir));

// ---------- Auth Token Store ----------
const activeSessions = new Set<string>();

function generateToken(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  for (let i = 0; i < 48; i++) token += chars[Math.floor(Math.random() * chars.length)];
  return token;
}

// POST /api/auth/login
app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body ?? {};
  const expectedUser = process.env.ADMIN_USERNAME || "admin";
  const expectedPass = process.env.ADMIN_PASSWORD || "";

  if (!expectedPass) {
    return res.status(500).json({ error: "Admin credentials not configured. Set ADMIN_USERNAME and ADMIN_PASSWORD in .env" });
  }

  if (username === expectedUser && password === expectedPass) {
    const token = generateToken();
    activeSessions.add(token);
    console.log(`✅ Admin login successful for user: ${username}`);
    return res.json({ success: true, token });
  }
  console.warn(`⚠️  Failed admin login attempt for user: ${username}`);
  return res.status(401).json({ error: "Invalid username or password." });
});

// GET /api/health
app.get("/api/health", async (_req, res) => {
  try {
    await pool.execute("SELECT 1");
    res.json({ status: "ok", engine: "MySQL", connected: true });
  } catch (err: any) {
    res.status(500).json({ status: "error", engine: "MySQL", connected: false, message: err?.message });
  }
});

// GET /api/auth/verify
app.get("/api/auth/verify", (req, res) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (token && activeSessions.has(token)) {
    return res.json({ valid: true });
  }
  return res.status(401).json({ valid: false });
});

// POST /api/auth/logout
app.post("/api/auth/logout", (req, res) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  activeSessions.delete(token);
  return res.json({ success: true });
});



app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Global error handler
app.use((err: any, req: Request, res: any, next: any) => {
  console.error("🔥 Global Error Handler:", err);
  res.status(500).json({ 
    error: "Internal Server Error", 
    message: err.message,
    path: req.path
  });
});

// --- ASYNC DATABASE HELPERS ---
async function ensureSingletonRow(tableName: string) {
  // Not needed for JSON but kept for API compatibility
}

async function getGlobalSettings(locale: string = "en") {
  const resolvedLocale = normalizeLocale(locale);
  const res = await db.query("SELECT * FROM global_settings WHERE id = 1");
  const targetRow = res.rows.find((row: any) => asString(row?.lang, "en") === resolvedLocale) || {};
  return mapGlobalSettings({
    ...targetRow,
    header_logo: pickSharedMediaField(res.rows, "header_logo", targetRow?.header_logo),
    footer_logo: pickSharedMediaField(res.rows, "footer_logo", targetRow?.footer_logo),
  });
}

async function getPageSeo(locale: string = "en") {
  const resolvedLocale = normalizeLocale(locale);
  const res = await db.query("SELECT * FROM page_seo WHERE lang = $1", [resolvedLocale]);
  const seoByPage = (res.rows as any[]).reduce<Record<string, SeoRecord>>((acc, row) => {
    const pageId = asString(row.page_id) as PageId;
    if (pageId in defaultPageSeo) acc[pageId] = mapSeoRecord(row, pageId);
    return acc;
  }, {});
  for (const pageId of Object.keys(defaultPageSeo) as PageId[]) {
    if (!seoByPage[pageId]) seoByPage[pageId] = defaultPageSeo[pageId];
  }
  return seoByPage as Record<PageId, SeoRecord>;
}

function getPreferredProductRow(rows: any[], locale: string) {
  const resolvedLocale = normalizeLocale(locale);
  return rows.find((row) => asString(row?.lang, "en") === resolvedLocale)
    || rows.find((row) => asString(row?.lang, "en") === "en")
    || rows[0]
    || null;
}

async function findProductRowByIdentifier(identifier: string, locale: string = "en") {
  const normalizedIdentifier = normalizeSlug(identifier, identifier.trim().toLowerCase());
  const res = await db.query("SELECT * FROM products");
  const matches = res.rows.filter((row) => {
    const rowId = asString(row?.id);
    const rowSlug = asString(safeParseJson<Partial<SeoRecord>>(row?.seo, {}).slug);
    return normalizeSlug(rowId, rowId) === normalizedIdentifier || normalizeSlug(rowSlug, rowId) === normalizedIdentifier;
  });
  const preferredRow = getPreferredProductRow(matches, locale);
  return preferredRow ? mergeProductSharedMedia(preferredRow, matches) : null;
}

function mapSeoRecord(row: any, pageId: PageId): SeoRecord {
  const fallback = defaultPageSeo[pageId];
  return {
    metaTitle: asString(row?.meta_title, fallback.metaTitle),
    metaDescription: asString(row?.meta_description, fallback.metaDescription),
    slug: pageId === "home" ? "" : normalizeSlug(asString(row?.slug), defaultPageSlugs[pageId]),
    ogTitle: asString(row?.og_title, fallback.ogTitle),
    imageAlt: asString(row?.image_alt, fallback.imageAlt),
  };
}

function mapProduct(row: any) {
  const parsedSeo = safeParseJson<Partial<SeoRecord>>(row?.seo, {});
  const seoFallback = { metaTitle: `${asString(row?.name)} | HQ Dried Fruits`, metaDescription: asString(row?.short_description), slug: normalizeSlug(asString(row?.id), asString(row?.id)), ogTitle: asString(row?.name), imageAlt: asString(row?.name) };
  return {
    id: asString(row?.id), name: asString(row?.name), category: asString(row?.category), status: asString(row?.status, "Active"), image: asString(row?.image),
    imageGallery: safeParseJson<string[]>(row?.image_gallery, []), shortDescription: asString(row?.short_description), longDescription: asString(row?.long_description),
    highlights: safeParseJson<string[]>(row?.highlights, []), contentSections: safeParseJson<ProductSectionRecord[]>(row?.content_sections, []),
    nutrition: safeParseJson<Record<string, string>>(row?.nutrition, { energy: "", protein: "", fat: "", carbs: "" }),
    inquirySubjectLine: asString(row?.inquiry_subject_line), tonnageOptions: safeParseJson<string[]>(row?.tonnage_options, []),
    seo: { ...seoFallback, ...parsedSeo, slug: normalizeSlug(asString(parsedSeo.slug), seoFallback.slug) },
  };
}

function mapGlobalSettings(row: any) {
  return {
    headerLogo: asString(row?.header_logo, defaultGlobalSettings.headerLogo), siteName: asString(row?.site_name, defaultGlobalSettings.siteName), navLinks: safeParseJson(row?.nav_links, defaultGlobalSettings.navLinks), ctaText: asString(row?.cta_text, defaultGlobalSettings.ctaText), ctaUrl: asString(row?.cta_url, defaultGlobalSettings.ctaUrl), footerLogo: asString(row?.footer_logo, defaultGlobalSettings.footerLogo), footerDescription: asString(row?.footer_description, defaultGlobalSettings.footerDescription), footerLeadText: asString(row?.footer_lead_text, defaultGlobalSettings.footerLeadText), quickLinks: safeParseJson(row?.quick_links, defaultGlobalSettings.quickLinks), officeAddress: asString(row?.office_address, defaultGlobalSettings.officeAddress), phoneNumber: asString(row?.phone_number, defaultGlobalSettings.phoneNumber), emailAddress: asString(row?.email_address, defaultGlobalSettings.emailAddress), telegramUrl: asString(row?.telegram_url, defaultGlobalSettings.telegramUrl), footerCtaTitle: asString(row?.footer_cta_title, defaultGlobalSettings.footerCtaTitle), footerCtaEmail: asString(row?.footer_cta_email, defaultGlobalSettings.footerCtaEmail), footerCopyrightText: asString(row?.footer_copyright_text, defaultGlobalSettings.footerCopyrightText),
    uiLabels: { ...defaultGlobalSettings.uiLabels, ...safeParseJson(row?.ui_labels, defaultGlobalSettings.uiLabels) },
    googleSiteVerificationId: asString(row?.google_site_verification_id, defaultGlobalSettings.googleSiteVerificationId),
  };
}

function mapProductsPage(row: any) {
  return {
    pageTitle: asString(row?.page_title, defaultProductsPage.pageTitle), pageSubtitle: asString(row?.page_subtitle, defaultProductsPage.pageSubtitle), heroBgImage: asString(row?.hero_bg_image, defaultProductsPage.heroBgImage), orderingBgImage: asString(row?.ordering_bg_image, defaultProductsPage.orderingBgImage), orderingFormTitle: asString(row?.ordering_form_title, defaultProductsPage.orderingFormTitle), orderingFormSubtitle: asString(row?.ordering_form_subtitle, defaultProductsPage.orderingFormSubtitle), stepOneLabel: asString(row?.step_one_label, defaultProductsPage.stepOneLabel), stepTwoLabel: asString(row?.step_two_label, defaultProductsPage.stepTwoLabel), stepThreeLabel: asString(row?.step_three_label, defaultProductsPage.stepThreeLabel), mixedContainerLabel: asString(row?.mixed_container_label, defaultProductsPage.mixedContainerLabel), volumeOptions: safeParseJson(row?.volume_options, defaultProductsPage.volumeOptions), viewSpecsLabel: asString(row?.view_specs_label, defaultProductsPage.viewSpecsLabel), stepOnePlaceholder: asString(row?.step_one_placeholder, defaultProductsPage.stepOnePlaceholder), stepThreePlaceholder: asString(row?.step_three_placeholder, defaultProductsPage.stepThreePlaceholder), nextStepButtonLabel: asString(row?.next_step_button_label, defaultProductsPage.nextStepButtonLabel), backButtonLabel: asString(row?.back_button_label, defaultProductsPage.backButtonLabel), submitButtonLabel: asString(row?.submit_button_label, defaultProductsPage.submitButtonLabel), submittingButtonLabel: asString(row?.submitting_button_label, defaultProductsPage.submittingButtonLabel), detailUi: { ...defaultProductsPage.detailUi, ...safeParseJson(row?.detail_ui, defaultProductsPage.detailUi) }, quickContactTitle: asString(row?.quick_contact_title, defaultProductsPage.quickContactTitle), quickContactSubtitle: asString(row?.quick_contact_subtitle, defaultProductsPage.quickContactSubtitle), telegramLabel: asString(row?.telegram_label, defaultProductsPage.telegramLabel), telegramSublabel: asString(row?.telegram_sublabel, defaultProductsPage.telegramSublabel), callLabel: asString(row?.call_label, defaultProductsPage.callLabel), emailLabel: asString(row?.email_label, defaultProductsPage.emailLabel), quickPhone: asString(row?.quick_phone, defaultProductsPage.quickPhone), quickEmail: asString(row?.quick_email, defaultProductsPage.quickEmail),
  };
}

function mapExportPage(row: any) {
  return {
    heroTitle: asString(row?.hero_title, defaultExportPage.heroTitle), heroSubtitle: asString(row?.hero_subtitle, defaultExportPage.heroSubtitle), heroBgImage: asString(row?.hero_bg_image, defaultExportPage.heroBgImage), mapSectionTitle: asString(row?.map_section_title, defaultExportPage.mapSectionTitle), supplyRoutes: safeParseJson(row?.supply_routes, defaultExportPage.supplyRoutes), logisticsContent: asContentString(row?.logistics_content, defaultExportPage.logisticsContent), packagingTitle: asContentString(row?.packaging_title, defaultExportPage.packagingTitle), packagingMethods: asContentString(row?.packaging_methods, defaultExportPage.packagingMethods), transportationTitle: asContentString(row?.transportation_title, defaultExportPage.transportationTitle), transportationMethods: asContentString(row?.transportation_methods, defaultExportPage.transportationMethods), documentationTitle: asContentString(row?.documentation_title, defaultExportPage.documentationTitle), documentationContent: asContentString(row?.documentation_content, defaultExportPage.documentationContent), qualityTitle: asContentString(row?.quality_title, defaultExportPage.qualityTitle), technicalSpecs: asContentString(row?.technical_specs, defaultExportPage.technicalSpecs), qualityChecks: safeParseJson(row?.quality_checks, defaultExportPage.qualityChecks), certificationsGallery: safeParseJson(row?.certifications_gallery, defaultExportPage.certificationsGallery),
  };
}

function mapContactsPage(row: any) {
  return {
    pageTitle: asString(row?.page_title, defaultContactsPage.pageTitle), introText: asString(row?.intro_text, defaultContactsPage.introText), formDestinationEmail: asString(row?.form_destination_email, defaultContactsPage.formDestinationEmail), contactFormTitle: asString(row?.contact_form_title, defaultContactsPage.contactFormTitle), responseLabelPrefix: asString(row?.response_label_prefix, defaultContactsPage.responseLabelPrefix), formNameLabel: asString(row?.form_name_label, defaultContactsPage.formNameLabel), formCompanyLabel: asString(row?.form_company_label, defaultContactsPage.formCompanyLabel), formEmailLabel: asString(row?.form_email_label, defaultContactsPage.formEmailLabel), formMessageLabel: asString(row?.form_message_label, defaultContactsPage.formMessageLabel), submitButtonLabel: asString(row?.submit_button_label, defaultContactsPage.submitButtonLabel), submittingButtonLabel: asString(row?.submitting_button_label, defaultContactsPage.submittingButtonLabel), emailAddress: asString(row?.email, defaultContactsPage.emailAddress), phoneNumber: asString(row?.phone, defaultContactsPage.phoneNumber), officeAddress: asString(row?.office_address, defaultContactsPage.officeAddress), workingHours: asString(row?.working_hours, defaultContactsPage.workingHours), mapPinLabel: asString(row?.map_pin_label, defaultContactsPage.mapPinLabel), infoEmailLabel: asString(row?.info_email_label, defaultContactsPage.infoEmailLabel), infoPhoneLabel: asString(row?.info_phone_label, defaultContactsPage.infoPhoneLabel), infoAddressLabel: asString(row?.info_address_label, defaultContactsPage.infoAddressLabel), infoHoursLabel: asString(row?.info_hours_label, defaultContactsPage.infoHoursLabel), socialSectionTitle: asString(row?.social_section_title, defaultContactsPage.socialSectionTitle), telegramUrl: asString(row?.telegram_url, defaultContactsPage.telegramUrl), instagramUrl: asString(row?.instagram_url, defaultContactsPage.instagramUrl), whatsappUrl: asString(row?.whatsapp_url, defaultContactsPage.whatsappUrl), facebookUrl: asString(row?.facebook_url, defaultContactsPage.facebookUrl), headquartersImage: asString(row?.headquarters_image, defaultContactsPage.headquartersImage), googleMapsUrl: asString(row?.google_maps_url, defaultContactsPage.googleMapsUrl),
  };
}

async function readContentTable(pageId: keyof typeof pageContentTables, locale: string = "en") {
  const resolvedLocale = normalizeLocale(locale);
  const res = await db.query(`SELECT lang, content FROM ${pageContentTables[pageId]} WHERE id = 1`);
  const row = res.rows.find((candidate: any) => asString(candidate?.lang, "en") === resolvedLocale);
  const fallback = (pageId === "privacy" || pageId === "terms") ? defaultSimplePages[pageId as keyof typeof defaultSimplePages] : {};
  const targetContent = sanitizeFlexiblePageContent(pageId, safeParseJson(row?.content, fallback));
  const config = sharedMediaConfigs[pageId];
  const contents = res.rows.map((candidate: any) => ({
    lang: asString(candidate?.lang, "en"),
    content: sanitizeFlexiblePageContent(pageId, safeParseJson(candidate?.content, {})),
  }));
  const sharedContent = pickSharedMediaContent(contents, config);
  const mergedContent = sharedContent ? applySharedMedia(targetContent, sharedContent, config) : targetContent;
  return sanitizeFlexiblePageContent(pageId, mergedContent);
}

async function writeContentTable(pageId: keyof typeof pageContentTables, content: Record<string, unknown>, locale: string = "en") {
  const resolvedLocale = normalizeLocale(locale);
  const sanitizedContent = sanitizeFlexiblePageContent(pageId, content);
  await db.query(`UPDATE ${pageContentTables[pageId]} SET content = $1 WHERE id = 1 AND lang = $2`, [JSON.stringify(sanitizedContent), resolvedLocale]);
}

async function syncFlexiblePageSharedMedia(pageId: keyof typeof pageContentTables, sourceContent: Record<string, unknown>) {
  const config = sharedMediaConfigs[pageId];
  if (!config) return;

  const tableName = pageContentTables[pageId];
  const res = await db.query(`SELECT lang, content FROM ${tableName} WHERE id = 1`);

  await Promise.all(activeLocales.map(async (locale) => {
    const row = res.rows.find((candidate: any) => asString(candidate?.lang, "en") === locale);
    const existingContent = sanitizeFlexiblePageContent(pageId, safeParseJson(row?.content, {}));
    const nextContent = sanitizeFlexiblePageContent(pageId, applySharedMedia(existingContent, sourceContent, config));
    await db.query(`UPDATE ${tableName} SET content = $1 WHERE id = 1 AND lang = $2`, [JSON.stringify(nextContent), locale]);
  }));
}

async function purgeDeprecatedHomeProgressSlider() {
  const res = await db.query("SELECT lang, content FROM home_page WHERE id = 1");

  await Promise.all(res.rows.map(async (row: any) => {
    const content = safeParseJson(row?.content, null);
    if (!content || typeof content !== "object" || Array.isArray(content) || !hasOwn(content, "progressSlider")) return;

    delete content.progressSlider;
    await db.query("UPDATE home_page SET content = $1 WHERE id = 1 AND lang = $2", [
      JSON.stringify(content),
      asString(row?.lang, "en"),
    ]);
  }));
}

async function syncGlobalSharedMedia(settings: any) {
  await db.query(
    "UPDATE global_settings SET header_logo = $1, footer_logo = $2 WHERE id = 1",
    [asString(settings.headerLogo), asString(settings.footerLogo)],
  );
}

async function syncProductsPageSharedMedia(content: any) {
  await db.query(
    "UPDATE products_page SET hero_bg_image = $1, ordering_bg_image = $2 WHERE id = 1",
    [asString(content.heroBgImage), asString(content.orderingBgImage)],
  );
}

async function syncExportPageSharedMedia(content: any) {
  const res = await db.query("SELECT lang, supply_routes, certifications_gallery FROM export_page WHERE id = 1");

  await Promise.all(activeLocales.map(async (locale) => {
    const row = res.rows.find((candidate: any) => asString(candidate?.lang, "en") === locale);
    const existingContent = {
      supplyRoutes: safeParseJson(row?.supply_routes, []),
      certificationsGallery: safeParseJson(row?.certifications_gallery, []),
    };
    const nextContent = applySharedMedia(existingContent, content, sharedMediaConfigs.export);

    await db.query(
      "UPDATE export_page SET hero_bg_image = $1, supply_routes = $2, certifications_gallery = $3 WHERE id = 1 AND lang = $4",
      [
        asString(content.heroBgImage),
        JSON.stringify(Array.isArray(nextContent.supplyRoutes) ? nextContent.supplyRoutes : []),
        JSON.stringify(Array.isArray(nextContent.certificationsGallery) ? nextContent.certificationsGallery : []),
        locale,
      ],
    );
  }));
}

async function syncContactsPageSharedMedia(content: any) {
  await db.query(
    "UPDATE contacts_page SET headquarters_image = $1 WHERE id = 1",
    [asString(content.headquartersImage)],
  );
}

async function syncProductSharedMedia(product: any) {
  await db.query(
    "UPDATE products SET image = $1, image_gallery = $2 WHERE id = $3",
    [asString(product.image), JSON.stringify(Array.isArray(product.imageGallery) ? product.imageGallery : []), asString(product.id)],
  );
}

function getManagedProductSlug(product: ReturnType<typeof mapProduct>) { return normalizeSlug(asString(product.seo?.slug), normalizeSlug(product.id, product.id)); }
function getProductPath(product: ReturnType<typeof mapProduct>, pageSeo: Record<PageId, SeoRecord> = defaultPageSeo) { return `${getManagedPagePath("products", pageSeo)}/${getManagedProductSlug(product)}`; }

async function getProductsForLocale(locale: string = "en") {
  const resolvedLocale = normalizeLocale(locale);
  const result = await db.query("SELECT * FROM products");
  const rowsById = new Map<string, any[]>();

  result.rows.forEach((row: any) => {
    const key = asString(row?.id);
    const bucket = rowsById.get(key) || [];
    bucket.push(row);
    rowsById.set(key, bucket);
  });

  return Array.from(rowsById.values())
    .map((rows) => {
      const preferredRow = getPreferredProductRow(rows, resolvedLocale);
      return preferredRow ? mergeProductSharedMedia(preferredRow, rows) : null;
    })
    .filter(Boolean)
    .map(mapProduct);
}

async function getSharedStructuredPageContent(tableName: string, locale: string, mapper: (row: any) => any, config: SharedMediaConfig) {
  const resolvedLocale = normalizeLocale(locale);
  const res = await db.query(`SELECT * FROM ${tableName} WHERE id = 1`);
  const targetRow = res.rows.find((row: any) => asString(row?.lang, "en") === resolvedLocale) || {};
  const targetContent = mapper(targetRow);
  const mappedContents = res.rows.map((row: any) => ({
    lang: asString(row?.lang, "en"),
    content: mapper(row),
  }));
  const sharedContent = pickSharedMediaContent(mappedContents, config);
  return sharedContent ? applySharedMedia(targetContent, sharedContent, config) : targetContent;
}

async function getPageContent(pageId: PageId, locale: string = "en") {
  const resolvedLocale = normalizeLocale(locale);

  if (pageId === "products") {
    return getSharedStructuredPageContent("products_page", resolvedLocale, mapProductsPage, sharedMediaConfigs.products);
  }

  if (pageId === "export") {
    return getSharedStructuredPageContent("export_page", resolvedLocale, mapExportPage, sharedMediaConfigs.export);
  }

  if (pageId === "contacts") {
    return getSharedStructuredPageContent("contacts_page", resolvedLocale, mapContactsPage, sharedMediaConfigs.contacts);
  }

  if (pageId in pageContentTables) {
    return readContentTable(pageId, resolvedLocale);
  }

  return {};
}

function resolveStaticPageByPath(pathname: string, pageSeo: Record<PageId, SeoRecord>) {
  const normalizedPath = normalizePathname(pathname);
  for (const pageId of Object.keys(defaultPageSeo) as PageId[]) {
    const canonicalPath = getManagedPagePath(pageId, pageSeo);
    const legacyPath = getManagedPagePath(pageId);
    if (normalizedPath === canonicalPath || normalizedPath === legacyPath) return { pageId, canonicalPath };
  }
  return null;
}

async function resolveProductPath(pathname: string, pageSeo: Record<PageId, SeoRecord>) {
  const normalizedPath = normalizePathname(pathname);
  const segments = normalizedPath.split("/").filter(Boolean);
  if (segments.length !== 2) return null;
  const [sectionSlug, productIdentifier] = segments;
  const canonicalSectionSlug = getManagedPageSlug("products", pageSeo);
  const legacySectionSlug = getManagedPageSlug("products");
  if (sectionSlug !== canonicalSectionSlug && sectionSlug !== legacySectionSlug) return null;

  const row = await findProductRowByIdentifier(productIdentifier);
  if (!row) return null;

  const product = mapProduct(row);
  return { product, canonicalPath: getProductPath(product, pageSeo) };
}

function resolveStaticLocalePageByPath(pathname: string, pageSeo: Record<PageId, SeoRecord>, fallbackLocale: ActiveLocale = "en") {
  const parsed = parseLocalePathname(pathname);
  const normalizedLocalPath = parsed.pathname;
  const locale = parsed.locale ?? fallbackLocale;

  for (const pageId of Object.keys(defaultPageSeo) as PageId[]) {
    const canonicalLocalPath = getManagedPagePath(pageId, pageSeo);
    const legacyLocalPath = getManagedPagePath(pageId);
    if (normalizedLocalPath === canonicalLocalPath || normalizedLocalPath === legacyLocalPath) {
      return {
        pageId,
        locale,
        canonicalPath: getLocalizedPagePath(pageId, locale, pageSeo),
        isLocalePrefixed: parsed.isLocalePrefixed,
      };
    }
  }

  return null;
}

async function resolveLocaleProductPath(pathname: string, pageSeo: Record<PageId, SeoRecord>, fallbackLocale: ActiveLocale = "en") {
  const parsed = parseLocalePathname(pathname);
  const segments = parsed.pathname.split("/").filter(Boolean);
  const locale = parsed.locale ?? fallbackLocale;

  if (segments.length !== 2) {
    return null;
  }

  const [sectionSlug, productIdentifier] = segments;
  const canonicalSectionSlug = getManagedPageSlug("products", pageSeo);
  const legacySectionSlug = getManagedPageSlug("products");
  if (sectionSlug !== canonicalSectionSlug && sectionSlug !== legacySectionSlug) {
    return null;
  }

  const row = await findProductRowByIdentifier(productIdentifier, locale);
  if (!row) {
    return null;
  }

  const product = mapProduct(row);
  return {
    product,
    locale,
    canonicalPath: buildLocalePath(locale, `/${canonicalSectionSlug}/${getManagedProductSlug(product)}`),
    isLocalePrefixed: parsed.isLocalePrefixed,
  };
}

async function validatePageSeoInput(pageId: PageId, payload: any, locale: string = "en") {
  const currentSeo = await getPageSeo(locale);
  const fallback = defaultPageSeo[pageId];
  const nextSeo: SeoRecord = {
    metaTitle: asString(payload.metaTitle, fallback.metaTitle), metaDescription: asString(payload.metaDescription, fallback.metaDescription), slug: pageId === "home" ? "" : normalizeSlug(asString(payload.slug), defaultPageSlugs[pageId]), ogTitle: asString(payload.ogTitle, fallback.ogTitle), imageAlt: asString(payload.imageAlt, fallback.imageAlt),
  };
  if (pageId !== "home") {
    if (!nextSeo.slug) throw new Error("A URL slug is required for this page.");
    if (reservedPageSlugs.has(nextSeo.slug)) throw new Error(`The slug "${nextSeo.slug}" is reserved.`);
  }
  for (const otherPageId of Object.keys(defaultPageSeo) as PageId[]) {
    if (otherPageId === pageId || otherPageId === "home") continue;
    if (getManagedPageSlug(otherPageId, currentSeo) === nextSeo.slug) throw new Error(`The slug "${nextSeo.slug}" is already used by ${otherPageId}.`);
  }
  return nextSeo;
}

async function validateProductPayload(product: any, existingId = "", locale: string = "en") {
  const fallbackId = asString(existingId || product.id);
  const fallbackSlug = normalizeSlug(asString(product?.name), normalizeSlug(fallbackId, fallbackId));
  const normalizedSeoSlug = normalizeSlug(asString(product?.seo?.slug), fallbackSlug);
  if (!fallbackId) throw new Error("Product id is required");
  if (!normalizedSeoSlug) throw new Error("A product SEO slug is required.");

  const res = await db.query("SELECT * FROM products");
  const duplicate = res.rows.find((row) => {
    const rowLocale = normalizeLocale(asString(row?.lang, "en"));
    if (rowLocale !== normalizeLocale(locale)) return false;
    const rowId = asString(row?.id);
    if (rowId === fallbackId) return false;
    const rowSlug = normalizeSlug(asString(safeParseJson<Partial<SeoRecord>>(row?.seo, {}).slug), normalizeSlug(rowId, rowId));
    return rowSlug === normalizedSeoSlug;
  });

  if (duplicate) throw new Error(`The product slug "${normalizedSeoSlug}" is already in use.`);
  const seoPayload = product?.seo ?? {};
  return {
    id: fallbackId, name: asString(product.name), category: asString(product.category), status: asString(product.status, "Active"), image: asString(product.image),
    imageGallery: Array.isArray(product.imageGallery) ? product.imageGallery : [], shortDescription: asString(product.shortDescription), longDescription: asString(product.longDescription),
    highlights: Array.isArray(product.highlights) ? product.highlights : [],
    contentSections: Array.isArray(product.contentSections) ? product.contentSections.map((section: any) => ({ title: asString(section?.title), body: asString(section?.body) })) : [],
    nutrition: product.nutrition ?? {}, inquirySubjectLine: asString(product.inquirySubjectLine), tonnageOptions: Array.isArray(product.tonnageOptions) ? product.tonnageOptions : [],
    seo: { metaTitle: asString(seoPayload.metaTitle, `${asString(product.name)} | HQ Dried Fruits`), metaDescription: asString(seoPayload.metaDescription, asString(product.shortDescription)), slug: normalizedSeoSlug, ogTitle: asString(seoPayload.ogTitle, asString(product.name)), imageAlt: asString(seoPayload.imageAlt, asString(product.name)) },
  };
}

function getIndexTemplate() { return fs.readFileSync(path.join(distDir, "index.html"), "utf8"); }

type AlternateLink = { hrefLang: string; href: string };
type RenderMeta = {
  statusCode: number;
  htmlLang: string;
  title: string;
  description: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  imageAlt: string;
  canonicalUrl: string;
  robots: string;
  ogType: string;
  siteName: string;
  googleSiteVerificationId: string;
  faviconUrl?: string;
  redirectTo?: string;
  appHtml?: string;
  bootstrapData?: any;
  alternateLinks?: AlternateLink[];
};

function toCanonicalUrl(origin: string, pathname: string) {
  const normalizedPath = normalizePathname(pathname);
  return normalizedPath === "/" ? `${origin}/` : `${origin}${normalizedPath}`;
}

function formatLocaleTag(locale: string) {
  const [language, region] = locale.split("-");
  return region ? `${language.toLowerCase()}-${region.toUpperCase()}` : language.toLowerCase();
}

function serializeBootstrapData(payload: unknown) {
  return JSON.stringify(payload).replace(/</g, "\\u003c");
}

function renderHtmlWithSeo(template: string, meta: RenderMeta) {
  const patterns = [
    /<title>[\s\S]*?<\/title>/gi,
    /<meta[^>]+name="description"[^>]*>/gi,
    /<meta[^>]+name="robots"[^>]*>/gi,
    /<meta[^>]+name="google-site-verification"[^>]*>/gi,
    /<meta[^>]+name="twitter:title"[^>]*>/gi,
    /<meta[^>]+name="twitter:description"[^>]*>/gi,
    /<meta[^>]+name="twitter:image"[^>]*>/gi,
    /<meta[^>]+name="twitter:image:alt"[^>]*>/gi,
    /<meta[^>]+name="twitter:card"[^>]*>/gi,
    /<meta[^>]+property="og:title"[^>]*>/gi,
    /<meta[^>]+property="og:description"[^>]*>/gi,
    /<meta[^>]+property="og:image"[^>]*>/gi,
    /<meta[^>]+property="og:image:alt"[^>]*>/gi,
    /<meta[^>]+property="og:type"[^>]*>/gi,
    /<meta[^>]+property="og:url"[^>]*>/gi,
    /<meta[^>]+property="og:site_name"[^>]*>/gi,
    /<link[^>]+rel="canonical"[^>]*>/gi,
    /<link[^>]+rel="(?:icon|shortcut icon|apple-touch-icon)"[^>]*>/gi,
    /<link[^>]+rel="alternate"[^>]*hreflang="[^"]+"[^>]*>/gi,
  ];
  let html = template;
  for (const pattern of patterns) html = html.replace(pattern, "");
  html = /<html[^>]+lang=/i.test(html)
    ? html.replace(/<html([^>]*)lang="[^"]*"([^>]*)>/i, `<html$1lang="${escapeHtml(meta.htmlLang)}"$2>`)
    : html.replace(/<html([^>]*)>/i, `<html$1 lang="${escapeHtml(meta.htmlLang)}">`);

  const tags = [
    `<title>${escapeHtml(meta.title)}</title>`,
    `<meta name="description" content="${escapeHtml(meta.description)}" />`,
    `<meta name="robots" content="${escapeHtml(meta.robots)}" />`,
    `<link rel="canonical" href="${escapeHtml(meta.canonicalUrl)}" />`,
    `<meta property="og:type" content="${escapeHtml(meta.ogType)}" />`,
    `<meta property="og:site_name" content="${escapeHtml(meta.siteName)}" />`,
    `<meta property="og:title" content="${escapeHtml(meta.ogTitle)}" />`,
    `<meta property="og:description" content="${escapeHtml(meta.ogDescription)}" />`,
    `<meta property="og:url" content="${escapeHtml(meta.canonicalUrl)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeHtml(meta.ogTitle)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(meta.ogDescription)}" />`,
  ];

  if (meta.ogImage) {
    tags.push(`<meta property="og:image" content="${escapeHtml(meta.ogImage)}" />`);
    tags.push(`<meta name="twitter:image" content="${escapeHtml(meta.ogImage)}" />`);
  }
  if (meta.imageAlt) {
    tags.push(`<meta property="og:image:alt" content="${escapeHtml(meta.imageAlt)}" />`);
    tags.push(`<meta name="twitter:image:alt" content="${escapeHtml(meta.imageAlt)}" />`);
  }
  if (meta.googleSiteVerificationId) {
    tags.push(`<meta name="google-site-verification" content="${escapeHtml(meta.googleSiteVerificationId)}" />`);
  }
  if (meta.faviconUrl) {
    tags.push(`<link rel="icon" href="${escapeHtml(meta.faviconUrl)}" />`);
    tags.push(`<link rel="apple-touch-icon" href="${escapeHtml(meta.faviconUrl)}" />`);
  }
  for (const alternate of meta.alternateLinks || []) {
    tags.push(`<link rel="alternate" hreflang="${escapeHtml(alternate.hrefLang)}" href="${escapeHtml(alternate.href)}" />`);
  }

  html = html.replace("</head>", `  ${tags.join("\n  ")}\n</head>`);

  if (typeof meta.appHtml === "string") {
    html = html.replace('<div id="root"></div>', `<div id="root">${meta.appHtml}</div>`);
  }

  if (meta.bootstrapData) {
    const bootstrapScript = `<script>window.__HQ_PUBLIC_BOOTSTRAP__=${serializeBootstrapData(meta.bootstrapData)};</script>`;
    html = html.replace("</body>", `  ${bootstrapScript}\n</body>`);
  }

  return html;
}

function getRequestLocale(req: Request) {
  return normalizeLocale(asString(req.query.locale || req.query.lang || parseLocalePathname(req.path).locale || "en"));
}

async function buildPageAlternates(pageId: PageId, origin: string) {
  const perLocale = await Promise.all(
    activeLocales.map(async (locale) => {
      const pageSeo = await getPageSeo(locale);
      return {
        hrefLang: formatLocaleTag(locale),
        href: toCanonicalUrl(origin, getLocalizedPagePath(pageId, locale, pageSeo)),
      };
    }),
  );

  if (pageId === "home") {
    return [{ hrefLang: "x-default", href: toCanonicalUrl(origin, "/") }, ...perLocale];
  }

  return perLocale;
}

async function buildProductAlternates(productId: string, origin: string) {
  const perLocale = await Promise.all(
    activeLocales.map(async (locale) => {
      const [pageSeo, row] = await Promise.all([getPageSeo(locale), findProductRowByIdentifier(productId, locale)]);
      if (!row) {
        return null;
      }

      const product = mapProduct(row);
      return {
        hrefLang: formatLocaleTag(locale),
        href: toCanonicalUrl(origin, getLocalizedProductPath(product, locale, pageSeo)),
      };
    }),
  );

  return perLocale.filter(Boolean) as AlternateLink[];
}

function buildSelectorAlternates(origin: string) {
  return [
    { hrefLang: "x-default", href: toCanonicalUrl(origin, "/") },
    ...activeLocales.map((locale) => ({ hrefLang: formatLocaleTag(locale), href: toCanonicalUrl(origin, buildLocalePath(locale)) })),
  ];
}

async function getPublicBootstrap(locale: ActiveLocale) {
  const [globalSettings, pageSeo, products, homeContent, aboutContent, productsContent, exportContent, contactsContent, privacyContent, termsContent] = await Promise.all([
    getGlobalSettings(locale),
    getPageSeo(locale),
    getProductsForLocale(locale),
    getPageContent("home", locale),
    getPageContent("about", locale),
    getPageContent("products", locale),
    getPageContent("export", locale),
    getPageContent("contacts", locale),
    getPageContent("privacy", locale),
    getPageContent("terms", locale),
  ]);

  return {
    locale,
    globalSettings,
    pageSeo,
    products,
    pages: [
      { id: "home", name: "Home", path: getLocalizedPagePath("home", locale, pageSeo), content: homeContent },
      { id: "about", name: "About Us", path: getLocalizedPagePath("about", locale, pageSeo), content: aboutContent },
      { id: "products", name: "Products Hub", path: getLocalizedPagePath("products", locale, pageSeo), content: productsContent },
      { id: "export", name: "Export", path: getLocalizedPagePath("export", locale, pageSeo), content: exportContent },
      { id: "contacts", name: "Contacts", path: getLocalizedPagePath("contacts", locale, pageSeo), content: contactsContent },
      { id: "privacy", name: "Privacy Policy", path: getLocalizedPagePath("privacy", locale, pageSeo), content: privacyContent },
      { id: "terms", name: "Terms of Service", path: getLocalizedPagePath("terms", locale, pageSeo), content: termsContent },
    ],
  };
}

async function buildRenderMeta(req: Request): Promise<RenderMeta> {
  const origin = getOrigin(req);
  const normalizedPath = normalizePathname(req.path);
  const defaultLocale: ActiveLocale = "en";

  if (normalizedPath === "/") {
    const globals = await getGlobalSettings(defaultLocale);
    const siteName = globals.siteName || defaultGlobalSettings.siteName;
    const defaultImage = toAbsoluteUrl(globals.headerLogo, origin);

    return {
      statusCode: 200,
      htmlLang: formatLocaleTag(defaultLocale),
      title: `${siteName} | Choose Language`,
      description: "Select a localized version of the HQ Dried Fruits website.",
      ogTitle: `${siteName} | Choose Language`,
      ogDescription: "Select a localized version of the HQ Dried Fruits website.",
      ogImage: defaultImage,
      imageAlt: `${siteName} locale selector`,
      canonicalUrl: toCanonicalUrl(origin, "/"),
      robots: "index,follow",
      ogType: "website",
      siteName,
      googleSiteVerificationId: globals.googleSiteVerificationId || "",
      faviconUrl: defaultImage,
      alternateLinks: buildSelectorAlternates(origin),
    };
  }

  if (normalizedPath === "/control-room" || normalizedPath.startsWith("/control-room/")) {
    const globals = await getGlobalSettings(defaultLocale);
    const siteName = globals.siteName || defaultGlobalSettings.siteName;
    const defaultImage = toAbsoluteUrl(globals.headerLogo, origin);

    return {
      statusCode: 200,
      htmlLang: formatLocaleTag(defaultLocale),
      title: `Admin Panel | ${siteName}`,
      description: `Administrative workspace for ${siteName}.`,
      ogTitle: `Admin Panel | ${siteName}`,
      ogDescription: `Administrative workspace for ${siteName}.`,
      ogImage: defaultImage,
      imageAlt: `${siteName} admin panel`,
      canonicalUrl: toCanonicalUrl(origin, normalizedPath),
      robots: "noindex,nofollow",
      ogType: "website",
      siteName,
      googleSiteVerificationId: globals.googleSiteVerificationId || "",
      faviconUrl: defaultImage,
      alternateLinks: [],
    };
  }

  const legacyPageSeo = await getPageSeo(defaultLocale);
  const legacyStaticMatch = resolveStaticLocalePageByPath(normalizedPath, legacyPageSeo, defaultLocale);
  if (legacyStaticMatch && !legacyStaticMatch.isLocalePrefixed) {
    const globals = await getGlobalSettings(defaultLocale);
    const siteName = globals.siteName || defaultGlobalSettings.siteName;
    const defaultImage = toAbsoluteUrl(globals.headerLogo, origin);

    return {
      statusCode: 301,
      htmlLang: formatLocaleTag(defaultLocale),
      title: legacyPageSeo[legacyStaticMatch.pageId].metaTitle,
      description: legacyPageSeo[legacyStaticMatch.pageId].metaDescription,
      ogTitle: legacyPageSeo[legacyStaticMatch.pageId].ogTitle || legacyPageSeo[legacyStaticMatch.pageId].metaTitle,
      ogDescription: legacyPageSeo[legacyStaticMatch.pageId].metaDescription,
      ogImage: defaultImage,
      imageAlt: legacyPageSeo[legacyStaticMatch.pageId].imageAlt,
      canonicalUrl: toCanonicalUrl(origin, legacyStaticMatch.canonicalPath),
      robots: "index,follow",
      ogType: "website",
      siteName,
      googleSiteVerificationId: globals.googleSiteVerificationId || "",
      faviconUrl: defaultImage,
      redirectTo: legacyStaticMatch.canonicalPath,
      alternateLinks: await buildPageAlternates(legacyStaticMatch.pageId, origin),
    };
  }

  const legacyProductMatch = await resolveLocaleProductPath(normalizedPath, legacyPageSeo, defaultLocale);
  if (legacyProductMatch && !legacyProductMatch.isLocalePrefixed) {
    const globals = await getGlobalSettings(defaultLocale);
    const siteName = globals.siteName || defaultGlobalSettings.siteName;
    const defaultImage = toAbsoluteUrl(globals.headerLogo, origin);
    const productSeo = legacyProductMatch.product.seo;

    return {
      statusCode: 301,
      htmlLang: formatLocaleTag(defaultLocale),
      title: productSeo?.metaTitle || `${legacyProductMatch.product.name} | ${siteName}`,
      description: productSeo?.metaDescription || legacyProductMatch.product.shortDescription,
      ogTitle: productSeo?.ogTitle || productSeo?.metaTitle || legacyProductMatch.product.name,
      ogDescription: productSeo?.metaDescription || legacyProductMatch.product.shortDescription,
      ogImage: toAbsoluteUrl(legacyProductMatch.product.image, origin) || defaultImage,
      imageAlt: productSeo?.imageAlt || legacyProductMatch.product.name,
      canonicalUrl: toCanonicalUrl(origin, legacyProductMatch.canonicalPath),
      robots: "index,follow",
      ogType: "product",
      siteName,
      googleSiteVerificationId: globals.googleSiteVerificationId || "",
      faviconUrl: defaultImage,
      redirectTo: legacyProductMatch.canonicalPath,
      alternateLinks: await buildProductAlternates(legacyProductMatch.product.id, origin),
    };
  }

  const locale = getRequestLocale(req);
  const bootstrap = await getPublicBootstrap(locale);
  const pageSeo = bootstrap.pageSeo as Record<PageId, SeoRecord>;
  const globals = bootstrap.globalSettings;
  const siteName = globals.siteName || defaultGlobalSettings.siteName;
  const defaultImage = toAbsoluteUrl(globals.headerLogo, origin);
  const googleSiteVerificationId = globals.googleSiteVerificationId || "";
  const baseMeta = {
    siteName,
    googleSiteVerificationId,
    faviconUrl: defaultImage,
  };

  const staticMatch = resolveStaticLocalePageByPath(normalizedPath, pageSeo, locale);
  if (staticMatch) {
    const pageMeta = pageSeo[staticMatch.pageId];
    return {
      statusCode: 200,
      htmlLang: formatLocaleTag(locale),
      title: pageMeta.metaTitle,
      description: pageMeta.metaDescription,
      ogTitle: pageMeta.ogTitle || pageMeta.metaTitle,
      ogDescription: pageMeta.metaDescription,
      ogImage: defaultImage,
      imageAlt: pageMeta.imageAlt,
      canonicalUrl: toCanonicalUrl(origin, staticMatch.canonicalPath),
      robots: "index,follow",
      ogType: "website",
      redirectTo: staticMatch.canonicalPath !== normalizedPath ? staticMatch.canonicalPath : "",
      alternateLinks: await buildPageAlternates(staticMatch.pageId, origin),
      bootstrapData: bootstrap,
      ...baseMeta,
    };
  }

  const productMatch = await resolveLocaleProductPath(normalizedPath, pageSeo, locale);
  if (productMatch) {
    const productSeo = productMatch.product.seo;
    const canonicalPath = getLocalizedProductPath(productMatch.product, locale, pageSeo);

    return {
      statusCode: 200,
      htmlLang: formatLocaleTag(locale),
      title: productSeo?.metaTitle || `${productMatch.product.name} | ${siteName}`,
      description: productSeo?.metaDescription || productMatch.product.shortDescription,
      ogTitle: productSeo?.ogTitle || productSeo?.metaTitle || productMatch.product.name,
      ogDescription: productSeo?.metaDescription || productMatch.product.shortDescription,
      ogImage: toAbsoluteUrl(productMatch.product.image, origin) || defaultImage,
      imageAlt: productSeo?.imageAlt || productMatch.product.name,
      canonicalUrl: toCanonicalUrl(origin, canonicalPath),
      robots: "index,follow",
      ogType: "product",
      redirectTo: canonicalPath !== normalizedPath ? canonicalPath : "",
      alternateLinks: await buildProductAlternates(productMatch.product.id, origin),
      bootstrapData: bootstrap,
      ...baseMeta,
    };
  }

  return {
    statusCode: 404,
    htmlLang: formatLocaleTag(locale),
    title: `Page Not Found | ${siteName}`,
    description: "The requested page could not be found.",
    ogTitle: `Page Not Found | ${siteName}`,
    ogDescription: "The requested page could not be found.",
    ogImage: defaultImage,
    imageAlt: "Page not found",
    canonicalUrl: toCanonicalUrl(origin, normalizedPath),
    robots: "noindex,nofollow",
    ogType: "website",
    bootstrapData: parseLocalePathname(normalizedPath).isLocalePrefixed ? bootstrap : undefined,
    alternateLinks: [],
    ...baseMeta,
  };
}

// --- INITIALIZE DATABASE AND START SERVER ---
async function initDbLegacyJsonDoNotUse() {
  if (false) {
    console.log("📝 Creating initial database.json...");
    return;
  }
  console.log("✅ JSON database initialized");
}

// --- API ENDPOINTS ---
app.get("/api/uploads", (_req, res) => {
  try {
    const files = fs.existsSync(uploadsDir) ? fs.readdirSync(uploadsDir) : [];
    res.json(files.sort((a, b) => b.localeCompare(a)).map((file) => `/uploads/${file}`));
  } catch (error) { res.status(500).json({ error: "Failed to read uploads directory" }); }
});

app.get("/api/globals", async (req, res) => {
  try { res.json(await getGlobalSettings(getRequestLocale(req))); } 
  catch (error) { res.status(500).json({ error: "Failed to fetch settings" }); }
});

app.post("/api/globals", async (req, res) => {
  try {
    const settings = req.body ?? {};
    const locale = getRequestLocale(req);
    await db.query(`UPDATE global_settings SET header_logo = $1, site_name = $2, nav_links = $3, cta_text = $4, cta_url = $5, footer_logo = $6, footer_description = $7, footer_lead_text = $8, quick_links = $9, office_address = $10, phone_number = $11, email_address = $12, telegram_url = $13, footer_cta_title = $14, footer_cta_email = $15, footer_copyright_text = $16, ui_labels = $17, google_site_verification_id = $18 WHERE id = 1 AND lang = $19`, [asString(settings.headerLogo), asString(settings.siteName, defaultGlobalSettings.siteName), JSON.stringify(Array.isArray(settings.navLinks) ? settings.navLinks : []), asString(settings.ctaText), asString(settings.ctaUrl), asString(settings.footerLogo), asString(settings.footerDescription), asString(settings.footerLeadText), JSON.stringify(Array.isArray(settings.quickLinks) ? settings.quickLinks : []), asString(settings.officeAddress), asString(settings.phoneNumber), asString(settings.emailAddress), asString(settings.telegramUrl), asString(settings.footerCtaTitle), asString(settings.footerCtaEmail), asString(settings.footerCopyrightText), JSON.stringify(typeof settings.uiLabels === "object" && settings.uiLabels ? settings.uiLabels : defaultGlobalSettings.uiLabels), asString(settings.googleSiteVerificationId), locale]);
    await syncGlobalSharedMedia(settings);
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: "Update failed" }); }
});

app.get("/api/seo/pages", async (req, res) => {
  try { res.json(await getPageSeo(getRequestLocale(req))); } 
  catch (error) { res.status(500).json({ error: "Failed to fetch SEO settings" }); }
});

app.post("/api/seo/pages/:id", async (req, res) => {
  try {
    const pageId = asString(req.params.id) as PageId;
    const locale = getRequestLocale(req);
    if (!(pageId in defaultPageSeo)) return res.status(404).json({ error: "Unknown page id" });
    const nextSeo = await validatePageSeoInput(pageId, req.body ?? {}, locale);
    await db.query(`REPLACE INTO page_seo (page_id, meta_title, meta_description, slug, og_title, image_alt, lang) VALUES ($1, $2, $3, $4, $5, $6, $7)`, [pageId, nextSeo.metaTitle, nextSeo.metaDescription, nextSeo.slug, nextSeo.ogTitle, nextSeo.imageAlt, locale]);
    res.json({ success: true });
  } catch (error) { res.status(400).json({ error: error instanceof Error ? error.message : "Failed to save SEO settings" }); }
});

app.get("/api/products", async (req, res) => {
  try {
    res.json(await getProductsForLocale(getRequestLocale(req)));
  } catch (error) { res.status(500).json({ error: "Failed to fetch products" }); }
});

app.get("/api/products/:id", async (req, res) => {
  try {
    const locale = getRequestLocale(req);
    const row = await findProductRowByIdentifier(asString(req.params.id), locale);
    if (!row) return res.status(404).json({ error: "Product not found" });
    res.json(mapProduct(row));
  } catch (error) { res.status(500).json({ error: "Failed to fetch product" }); }
});

app.post("/api/products", async (req, res) => {
  try {
    const locale = getRequestLocale(req);
    const product = await validateProductPayload(req.body ?? {}, "", locale);
    await db.query(`REPLACE INTO products (id, name, category, status, image, image_gallery, short_description, long_description, highlights, content_sections, nutrition, inquiry_subject_line, tonnage_options, seo, lang) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`, [product.id, product.name, product.category, product.status, product.image, JSON.stringify(product.imageGallery), product.shortDescription, product.longDescription, JSON.stringify(product.highlights), JSON.stringify(product.contentSections), JSON.stringify(product.nutrition ?? {}), product.inquirySubjectLine, JSON.stringify(product.tonnageOptions), JSON.stringify(product.seo), locale]);
    await syncProductSharedMedia(product);
    res.json({ success: true, id: product.id, product });
  } catch (error) { res.status(400).json({ error: error instanceof Error ? error.message : "Failed to create product" }); }
});

app.post("/api/products/:id", async (req, res) => {
  try {
    const locale = getRequestLocale(req);
    const product = await validateProductPayload(req.body ?? {}, asString(req.params.id), locale);
    const existing = await findProductRowByIdentifier(asString(req.params.id), locale);

    if (!existing || asString(existing?.lang, "en") !== locale || asString(existing?.id) !== asString(req.params.id)) {
      await db.query(
        `INSERT INTO products (id, name, category, status, image, image_gallery, short_description, long_description, highlights, content_sections, nutrition, inquiry_subject_line, tonnage_options, seo, lang) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
        [
          asString(req.params.id),
          product.name,
          product.category,
          product.status,
          product.image,
          JSON.stringify(product.imageGallery),
          product.shortDescription,
          product.longDescription,
          JSON.stringify(product.highlights),
          JSON.stringify(product.contentSections),
          JSON.stringify(product.nutrition ?? {}),
          product.inquirySubjectLine,
          JSON.stringify(product.tonnageOptions),
          JSON.stringify(product.seo),
          locale,
        ],
      );
      await syncProductSharedMedia({ ...product, id: asString(req.params.id) });
      return res.json({ success: true, product: { ...product, id: asString(req.params.id) } });
    }

    const result = await db.query(
      `UPDATE products SET name = $1, category = $2, status = $3, image = $4, image_gallery = $5, short_description = $6, long_description = $7, highlights = $8, content_sections = $9, nutrition = $10, inquiry_subject_line = $11, tonnage_options = $12, seo = $13 WHERE id = $14 AND lang = $15`,
      [product.name, product.category, product.status, product.image, JSON.stringify(product.imageGallery), product.shortDescription, product.longDescription, JSON.stringify(product.highlights), JSON.stringify(product.contentSections), JSON.stringify(product.nutrition ?? {}), product.inquirySubjectLine, JSON.stringify(product.tonnageOptions), JSON.stringify(product.seo), asString(req.params.id), locale],
    );
    if (result.rowCount === 0) return res.status(404).json({ error: "Product not found" });
    await syncProductSharedMedia(product);
    res.json({ success: true, product });
  } catch (error) { res.status(400).json({ error: error instanceof Error ? error.message : "Failed to update product" }); }
});

app.delete("/api/products/:id", async (req, res) => {
  try {
    await db.query("DELETE FROM products WHERE id = $1", [asString(req.params.id)]);
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: "Failed to delete product" }); }
});

app.get("/api/pages/:id", async (req, res) => {
  try {
    const pageId = asString(req.params.id) as PageId;
    const locale = getRequestLocale(req);
    if (pageId in defaultPageSeo) return res.json(await getPageContent(pageId, locale));
    return res.status(404).json({ error: "Page template not found" });
  } catch (error) { res.status(500).json({ error: "Internal Server Error" }); }
});

app.post("/api/pages/:id", async (req, res) => {
  try {
    const pageId = asString(req.params.id);
    const locale = getRequestLocale(req);
    const content = req.body ?? {};
    if (pageId === "products") {
      await db.query(`UPDATE products_page SET page_title = $1, page_subtitle = $2, hero_bg_image = $3, ordering_bg_image = $4, ordering_form_title = $5, ordering_form_subtitle = $6, step_one_label = $7, step_two_label = $8, step_three_label = $9, mixed_container_label = $10, volume_options = $11, view_specs_label = $12, step_one_placeholder = $13, step_three_placeholder = $14, next_step_button_label = $15, back_button_label = $16, submit_button_label = $17, submitting_button_label = $18, detail_ui = $19, quick_contact_title = $20, quick_contact_subtitle = $21, telegram_label = $22, telegram_sublabel = $23, call_label = $24, email_label = $25, quick_phone = $26, quick_email = $27 WHERE id = 1 AND lang = $28`, [asString(content.pageTitle), asString(content.pageSubtitle), asString(content.heroBgImage), asString(content.orderingBgImage), asString(content.orderingFormTitle), asString(content.orderingFormSubtitle), asString(content.stepOneLabel), asString(content.stepTwoLabel), asString(content.stepThreeLabel), asString(content.mixedContainerLabel), JSON.stringify(Array.isArray(content.volumeOptions) ? content.volumeOptions : []), asString(content.viewSpecsLabel), asString(content.stepOnePlaceholder), asString(content.stepThreePlaceholder), asString(content.nextStepButtonLabel), asString(content.backButtonLabel), asString(content.submitButtonLabel), asString(content.submittingButtonLabel), JSON.stringify(typeof content.detailUi === "object" && content.detailUi ? content.detailUi : defaultProductsPage.detailUi), asString(content.quickContactTitle), asString(content.quickContactSubtitle), asString(content.telegramLabel), asString(content.telegramSublabel), asString(content.callLabel), asString(content.emailLabel), asString(content.quickPhone), asString(content.quickEmail), locale]);
      await syncProductsPageSharedMedia(content);
      return res.json({ success: true });
    }
    if (pageId === "export") {
      await db.query(`UPDATE export_page SET hero_title = $1, hero_subtitle = $2, hero_bg_image = $3, map_section_title = $4, supply_routes = $5, logistics_content = $6, packaging_title = $7, packaging_methods = $8, transportation_title = $9, transportation_methods = $10, documentation_title = $11, documentation_content = $12, quality_title = $13, technical_specs = $14, quality_checks = $15, certifications_gallery = $16 WHERE id = 1 AND lang = $17`, [asString(content.heroTitle), asString(content.heroSubtitle), asString(content.heroBgImage), asString(content.mapSectionTitle), JSON.stringify(Array.isArray(content.supplyRoutes) ? content.supplyRoutes : []), asString(content.logisticsContent), asString(content.packagingTitle), asString(content.packagingMethods), asString(content.transportationTitle), asString(content.transportationMethods), asString(content.documentationTitle), asString(content.documentationContent), asString(content.qualityTitle), asString(content.technicalSpecs), JSON.stringify(Array.isArray(content.qualityChecks) ? content.qualityChecks : []), JSON.stringify(Array.isArray(content.certificationsGallery) ? content.certificationsGallery : []), locale]);
      await syncExportPageSharedMedia(content);
      return res.json({ success: true });
    }
    if (pageId === "contacts") {
      await db.query(`UPDATE contacts_page SET page_title = $1, intro_text = $2, form_destination_email = $3, contact_form_title = $4, response_label_prefix = $5, form_name_label = $6, form_company_label = $7, form_email_label = $8, form_message_label = $9, submit_button_label = $10, submitting_button_label = $11, email = $12, phone = $13, office_address = $14, working_hours = $15, map_pin_label = $16, info_email_label = $17, info_phone_label = $18, info_address_label = $19, info_hours_label = $20, social_section_title = $21, telegram_url = $22, instagram_url = $23, whatsapp_url = $24, facebook_url = $25, headquarters_image = $26, google_maps_url = $27 WHERE id = 1 AND lang = $28`, [asString(content.pageTitle), asString(content.introText), asString(content.formDestinationEmail), asString(content.contactFormTitle), asString(content.responseLabelPrefix), asString(content.formNameLabel), asString(content.formCompanyLabel), asString(content.formEmailLabel), asString(content.formMessageLabel), asString(content.submitButtonLabel), asString(content.submittingButtonLabel), asString(content.emailAddress), asString(content.phoneNumber), asString(content.officeAddress), asString(content.workingHours), asString(content.mapPinLabel), asString(content.infoEmailLabel), asString(content.infoPhoneLabel), asString(content.infoAddressLabel), asString(content.infoHoursLabel), asString(content.socialSectionTitle), asString(content.telegramUrl), asString(content.instagramUrl), asString(content.whatsappUrl), asString(content.facebookUrl), asString(content.headquartersImage), asString(content.googleMapsUrl), locale]);
      await syncContactsPageSharedMedia(content);
      return res.json({ success: true });
    }
    if (pageId in pageContentTables) {
      await writeContentTable(pageId as keyof typeof pageContentTables, content, locale);
      await syncFlexiblePageSharedMedia(pageId as keyof typeof pageContentTables, content);
      return res.json({ success: true });
    }
    return res.status(404).json({ error: "Page template not found" });
  } catch (error) { res.status(500).json({ error: "Update failed" }); }
});

app.get("/api/leads", async (_req, res) => {
  try {
    const result = await db.query("SELECT * FROM leads ORDER BY date DESC");
    res.json(result.rows.map((row) => ({ id: asString(row.id), date: asString(row.date), name: asString(row.name), company: asString(row.company), email: asString(row.email), phone: asString(row.phone), telegram: asString(row.telegram), productInterest: asString(row.product_interest), estTonnage: asString(row.est_tonnage), status: asString(row.status, "New"), message: asString(row.message), notes: asString(row.notes) })));
  } catch (error) { res.status(500).json({ error: "Failed to fetch leads" }); }
});

app.post("/api/leads", async (req, res) => {
  try {
    const payload = req.body ?? {};
    const email = asString(payload.email).trim();
    if (!email) return res.status(400).json({ error: "Email is required" });
    const id = createLeadId();
    await db.query(`INSERT IGNORE INTO leads (id, date, name, company, email, phone, telegram, product_interest, est_tonnage, status, message, notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`, [id, new Date().toISOString(), asString(payload.name), asString(payload.company), email, asString(payload.phone), asString(payload.telegram), asString(payload.productInterest, "General Inquiry"), asString(payload.estTonnage), "New", asString(payload.message), ""]);
    
    const token = process.env.TELEGRAM_BOT_TOKEN || "";
    const chatId = process.env.TELEGRAM_CHAT_ID || "";
    
    if (!token || !chatId) {
      console.warn("⚠️ Telegram notification skipped: TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is missing in .env");
    } else {
      const text = `🌟 <b>New Lead from Website</b> 🌟\n\n👤 <b>Name:</b> ${asString(payload.name) || "N/A"}\n🏢 <b>Company:</b> ${asString(payload.company) || "N/A"}\n📧 <b>Email:</b> ${email}\n📞 <b>Phone:</b> ${asString(payload.phone) || "N/A"}\n✈️ <b>Telegram:</b> ${asString(payload.telegram) || "N/A"}\n📦 <b>Product:</b> ${asString(payload.productInterest, "General Inquiry")}\n⚖️ <b>Volume:</b> ${asString(payload.estTonnage) || "N/A"}\n\n📝 <b>Message:</b>\n${asString(payload.message) || "N/A"}`;
      
      fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" })
      })
      .then(async response => {
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error("❌ Telegram API Error:", response.status, errorData);
        } else {
          console.log("✅ Telegram notification sent successfully");
        }
      })
      .catch(err => console.error("❌ Telegram fetch failed:", err));
    }

    res.status(201).json({ success: true, id });
  } catch (error) { res.status(500).json({ error: "Failed to submit inquiry" }); }
});

app.post("/api/leads/:id", async (req, res) => {
  try {
    const status = asString(req.body?.status, "New") as LeadStatus;
    if (!validLeadStatuses.has(status)) return res.status(400).json({ error: "Invalid lead status" });
    await db.query("UPDATE leads SET status = $1, notes = $2 WHERE id = $3", [status, asString(req.body?.notes), asString(req.params.id)]);
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: "Failed to update lead" }); }
});

app.post("/api/upload", upload.single("file"), async (req, res) => {
  try {
    const uploadedFile = (req as any).file;
    if (!uploadedFile) return res.status(400).json({ error: "No file uploaded" });
    const baseName = sanitizeUploadBaseName(uploadedFile.originalname);
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${baseName}.webp`;
    const filePath = path.join(uploadsDir, filename);

    // Optional: Try to use jimp for optimization
    try {
      // @ts-ignore
      const Jimp = (await import("jimp")).default;
      const image = await Jimp.read(uploadedFile.buffer);
      await image
        .scaleToFit(1200, 1200)
        .quality(82)
        .writeAsync(filePath);
    } catch (err) {
      console.warn("⚠️ Jimp resizing failed, saving original file:", err);
      fs.writeFileSync(filePath, uploadedFile.buffer);
    }
    
    res.json({ url: `/uploads/${filename}` });
  } catch (error) { res.status(500).json({ error: "Upload failed on server" }); }
});

app.post("/api/media/delete", (req, res) => {
  try {
    const url = asString(req.body?.url);
    if (!url) return res.status(400).json({ error: "No URL provided" });
    const filePath = path.join(uploadsDir, url.replace(/^\/uploads\//, ""));
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: "Failed to delete from disk" }); }
});

app.get("/robots.txt", async (req, res) => {
  res.type("text/plain").send(`User-agent: *\nAllow: /\nDisallow: /control-room\nSitemap: ${getOrigin(req)}/sitemap.xml\n`);
});

app.get("/sitemap.xml", async (req, res) => {
  try {
    const origin = getOrigin(req);
    const localeBundles = await Promise.all(
      activeLocales.map(async (locale) => ({
        locale,
        pageSeo: await getPageSeo(locale),
        products: await getProductsForLocale(locale),
      })),
    );

    const renderAlternateLinks = (alternates: AlternateLink[]) =>
      alternates
        .map((alternate) => `<xhtml:link rel="alternate" hreflang="${escapeHtml(alternate.hrefLang)}" href="${escapeHtml(alternate.href)}" />`)
        .join("");

    const selectorEntry = `<url><loc>${escapeHtml(toCanonicalUrl(origin, "/"))}</loc>${renderAlternateLinks(buildSelectorAlternates(origin))}</url>`;

    const staticEntries = localeBundles.flatMap(({ locale, pageSeo }) =>
      (Object.keys(defaultPageSeo) as PageId[]).map((pageId) => {
        const alternates = pageId === "home"
          ? buildSelectorAlternates(origin)
          : localeBundles.map((bundle) => ({
              hrefLang: formatLocaleTag(bundle.locale),
              href: toCanonicalUrl(origin, getLocalizedPagePath(pageId, bundle.locale, bundle.pageSeo)),
            }));

        return `<url><loc>${escapeHtml(toCanonicalUrl(origin, getLocalizedPagePath(pageId, locale, pageSeo)))}</loc>${renderAlternateLinks(alternates)}</url>`;
      }),
    );

    const productEntries = localeBundles.flatMap(({ locale, pageSeo, products }) =>
      products.map((product) => {
        const alternates = localeBundles
          .map((bundle) => {
            const targetProduct = bundle.products.find((candidate) => candidate.id === product.id);
            if (!targetProduct) {
              return null;
            }

            return {
              hrefLang: formatLocaleTag(bundle.locale),
              href: toCanonicalUrl(origin, getLocalizedProductPath(targetProduct, bundle.locale, bundle.pageSeo)),
            };
          })
          .filter(Boolean) as AlternateLink[];

        return `<url><loc>${escapeHtml(toCanonicalUrl(origin, getLocalizedProductPath(product, locale, pageSeo)))}</loc>${renderAlternateLinks(alternates)}</url>`;
      }),
    );

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${[selectorEntry, ...staticEntries, ...productEntries].join("\n")}\n</urlset>`;
    res.type("application/xml").send(xml);
  } catch (error) { res.status(500).send("Failed to generate sitemap"); }
});

if (fs.existsSync(distDir)) {
  app.use(express.static(distDir, { index: false }));
  app.get("*", async (req, res, next) => {
    if (req.path.startsWith("/api") || req.path.startsWith("/uploads")) return next();
    try {
      const meta = await buildRenderMeta(req);
      if (meta.redirectTo) return res.redirect(301, meta.redirectTo);
      const appHtml = renderToString(
        React.createElement(
          StaticRouter,
          { location: req.originalUrl },
          React.createElement(AppShell, { initialData: meta.bootstrapData ?? null }),
        ),
      );
      const html = renderHtmlWithSeo(getIndexTemplate(), { ...meta, appHtml });
      res.status(meta.statusCode).send(html);
    } catch (error) {
      console.error("SSR render failed:", error);
      res.status(500).send("Failed to render application shell");
    }
  });
}

// Start everything up safely
const port = process.env.PORT || 10000;

initDb().then(async () => {
  await purgeDeprecatedHomeProgressSlider();
  app.listen(port, () => {
    console.log(`✅ Server listening on: ${port}`);
  });
}).catch((err) => {
  console.error('❌ Failed to initialize database, server not started:', err);
  process.exit(1);
});
