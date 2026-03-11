import pkg from 'pg';
const { Pool } = pkg;

// This must be at the very top of your file
const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// We wrap the migration in a check to ensure 'db' is ready
async function migrateTable(tableName: string, schema: any) {
  try {
    console.log(`Checking migration for: ${tableName}`);

    // This is the fix for the "$1" error: we add "::text"
    const res = await db.query(
      "SELECT column_name FROM information_schema.columns WHERE table_name = $1::text",
      [tableName.toLowerCase()]
    );

    // Postgres returns data in 'res.rows'
    const info = res.rows || [];
    const existingColumns = new Set(info.map((col: any) => col.column_name));

    // ... rest of your logic
  } catch (err) {
    console.error(`Migration failed for ${tableName}:`, err);
  }
}

type SeoRecord = {
  metaTitle: string;
  metaDescription: string;
  slug: string;
  ogTitle: string;
  imageAlt: string;
};

type ProductSectionRecord = {
  title: string;
  body: string;
};

type LeadStatus = "New" | "Contacted" | "In Progress" | "Converted" | "Disqualified";
type PageId = "home" | "about" | "products" | "export" | "contacts" | "privacy" | "terms";

const validLeadStatuses = new Set<LeadStatus>([
  "New",
  "Contacted",
  "In Progress",
  "Converted",
  "Disqualified",
]);

const pageContentTables = {
  home: "home_page",
  about: "about_page",
  privacy: "privacy_page",
  terms: "terms_page",
} as const;

const defaultPageSlugs: Record<PageId, string> = {
  home: "",
  about: "about",
  products: "products",
  export: "export",
  contacts: "contacts",
  privacy: "privacy",
  terms: "terms",
};

const reservedPageSlugs = new Set(["admin", "api", "uploads", "robots.txt", "sitemap.xml"]);

const defaultGlobalSettings = {
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
  footerDescription:
    "Quality sun-dried fruits from the heart of Uzbekistan. Exporting nature's sweetness to global B2B partners with uncompromising quality.",
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
  uiLabels: {
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
  },
  googleSiteVerificationId: "",
};

const defaultProductsPage = {
  pageTitle: "Wholesale Dried Fruits from Uzbekistan",
  pageSubtitle:
    "Explore export-ready apricots, raisins, prunes, and mixed assortments with buyer-focused origin, processing, and application details in one catalog.",
  heroBgImage: "",
  orderingBgImage: "",
  orderingFormTitle: "Wholesale Inquiry",
  orderingFormSubtitle: "Share your target volume and timeline. We will respond with pricing and logistics details.",
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
};

const defaultExportPage = {
  heroTitle: "Our Global Export Network",
  heroSubtitle: "Seamless global logistics from the heart of the Silk Road to your warehouse.",
  heroBgImage: "",
  mapSectionTitle: "Our Global Export Network",
  supplyRoutes: [],
  logisticsContent: "<p>End-to-end multi-modal transport routing.</p>",
  packagingTitle: "Custom Packaging",
  packagingMethods: "<p>Bulk cartons, vacuum-sealed bags, or retail-ready packaging customized with your brand labels.</p>",
  transportationTitle: "Ocean & Rail Freight",
  transportationMethods:
    "<p>Cost-effective FCL (Full Container Load) and LCL shipments via major ports and the trans-Eurasian rail network.</p>",
  documentationTitle: "Customs Clearance",
  documentationContent:
    "<p>Full documentation support including phytosanitary certificates, certificates of origin, and EUR.1.</p>",
  qualityTitle: "The Quality Guarantee",
  technicalSpecs: "<p>X-Ray and Laser sorting guarantee removal of stones, stems, and defects.</p>",
  qualityChecks: [
    { title: "Moisture Control", description: "Strictly maintained at 18-22% for optimal shelf life." },
    { title: "Size Calibration", description: "Laser-graded for uniform sizing (Jumbo, Large, Medium)." },
    { title: "Microbiological Safety", description: "Regular lab testing for aflatoxins and heavy metals." },
  ],
  certificationsGallery: [],
};

const defaultContactsPage = {
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
  headquartersImage: "",
  googleMapsUrl: "",
};

const defaultSimplePages = {
  privacy: {
    title: "Privacy Policy",
    body:
      "<p>We use the information submitted through this website to respond to wholesale inquiries, prepare quotes, and manage customer communication.</p><p>Contact details and inquiry content may be stored in our internal admin system so our sales team can follow up on requests and maintain order history.</p><p>If you need your information corrected or removed, contact our export team using the details listed on the contact page.</p>",
  },
  terms: {
    title: "Terms of Service",
    body:
      "<p>Information on this site is provided for wholesale inquiry and quotation purposes. Final pricing, availability, specifications, and logistics terms are confirmed during direct sales communication.</p><p>Submitting an inquiry does not create a purchase contract. Orders are finalized only after written agreement between HQ Dried Fruits and the buyer.</p><p>Use of this site must comply with applicable law and must not interfere with website operation or data integrity.</p>",
  },
};

const defaultPageSeo: Record<PageId, SeoRecord> = {
  home: {
    metaTitle: "HQ Dried Fruits | High-Quality Organic Export",
    metaDescription:
      "Quality sun-dried fruits from the heart of Uzbekistan. We export the finest apricots, raisins, and prunes to global B2B partners.",
    slug: "",
    ogTitle: "HQ Dried Fruits",
    imageAlt: "Sun-dried apricots from Uzbekistan",
  },
  about: {
    metaTitle: "About HQ Dried Fruits | Our Heritage & Mission",
    metaDescription:
      "Decades of expertise in every harvest. Learn about our mission to deliver the uncompromised, natural sweetness of Uzbekistan's harvest to the world.",
    slug: "about",
    ogTitle: "About HQ Dried Fruits",
    imageAlt: "Sorting facility in Uzbekistan",
  },
  products: {
    metaTitle: "Wholesale Dried Apricots, Raisins, Prunes & Mixed Baskets | HQ Dried Fruits",
    metaDescription:
      "Source Uzbekistan dried apricots, raisins, prunes, and mixed baskets with detailed origin, processing, nutrition, and export information on one page.",
    slug: "products",
    ogTitle: "HQ Dried Fruits Product Catalog",
    imageAlt: "Assorted dried fruits",
  },
  export: {
    metaTitle: "Global Logistics & Export | HQ Dried Fruits",
    metaDescription:
      "Seamless global logistics from the heart of the Silk Road to your warehouse. We handle customs, packaging, and freight forwarding.",
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

function normalizeSlug(value: string, fallback = "") {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || fallback;
}

function getManagedPageSlug(pageId: PageId, pageSeo: Record<PageId, SeoRecord> = defaultPageSeo) {
  if (pageId === "home") {
    return "";
  }

  return normalizeSlug(pageSeo[pageId]?.slug || "", defaultPageSlugs[pageId]);
}

function getManagedPagePath(pageId: PageId, pageSeo: Record<PageId, SeoRecord> = defaultPageSeo) {
  const slug = getManagedPageSlug(pageId, pageSeo);
  return slug ? `/${slug}` : "/";
}

function ensureDirectory(directoryPath: string) {
  if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath, { recursive: true });
  }
}

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function asContentString(value: unknown, fallback = "") {
  const content = asString(value).trim();
  if (!content || content === "[]" || content === "{}" || content === "null") {
    return fallback;
  }
  return content;
}

function safeParseJson<T>(value: unknown, fallback: T): T {
  if (typeof value !== "string" || value.trim() === "") {
    return fallback;
  }
  try {
    const parsed = JSON.parse(value) as T | null;
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function ensureSingletonRow(tableName: string) {
  db.prepare(`INSERT OR IGNORE INTO ${tableName} (id) VALUES (1)`).run();
}

async function migrateTable(tableName: string, schema: any) {
  try {
    // 1. Get column info specifically for PostgreSQL
    const res = await db.query(
      `SELECT column_name FROM information_schema.columns WHERE table_name = $1`,
      [tableName.toLowerCase()] // Postgres is case-sensitive with table names
    );

    // 2. The Fix: Ensure 'info' is an array. Postgres returns rows in 'res.rows'
    const info = res.rows || [];

    // 3. Now .map() will work because 'info' is guaranteed to be an array
    const existingColumns = new Set(info.map((column: any) => column.column_name));

    // ... (rest of your migration logic where it compares existingColumns to schema)
    console.log(`Migration check complete for ${tableName}`);
  } catch (error) {
    console.error(`Migration failed for ${tableName}:`, error);
  }
}

function createLeadId() {
  const timestamp = new Date().toISOString().replace(/\D/g, "").slice(2, 14);
  return `L-${timestamp}-${Math.floor(100 + Math.random() * 900)}`;
}

function normalizePathname(pathname: string) {
  const trimmed = pathname.replace(/\/+$/, "");
  return trimmed === "" ? "/" : trimmed;
}

function stripHtml(value: string) {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function toAbsoluteUrl(value: string, origin: string) {
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith("/")) return `${origin}${value}`;
  return `${origin}/${value}`;
}

function getOrigin(req: Request) {
  return `${req.header("x-forwarded-proto") || req.protocol || "http"}://${req.get("host") || "localhost:3001"}`;
}

ensureDirectory(uploadsDir);

function sanitizeUploadBaseName(filename: string) {
  const sanitized = path
    .parse(filename).name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 60);

  return sanitized || "image";
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

// Database Connection Handling
const isProd = process.env.NODE_ENV === "production" || !!process.env.DATABASE_URL;
let db: any;
let pgPool: pg.Pool | null = null;

if (isProd && process.env.DATABASE_URL) {
  pgPool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  // Mock 'better-sqlite3' interface for PG
  db = {
    prepare: (query: string) => {
      // Basic conversion of SQLite syntax to PG
      const pgQuery = query.replace(/\?/g, (_, i) => `$${i + 1}`).replace(/INSERT OR IGNORE/gi, "INSERT").replace(/id = 1 CHECK \(id = 1\)/gi, "id = 1");
      return {
        run: async (...args: any[]) => {
          await pgPool!.query(pgQuery, args);
          return { changes: 1 };
        },
        get: async (...args: any[]) => {
          const res = await pgPool!.query(pgQuery, args);
          return res.rows[0];
        },
        all: async (...args: any[]) => {
          const res = await pgPool!.query(pgQuery, args);
          return res.rows;
        }
      };
    },
    exec: async (query: string) => {
      const pgQuery = query.replace(/INTEGER PRIMARY KEY/gi, "SERIAL PRIMARY KEY").replace(/TEXT PRIMARY KEY/gi, "TEXT PRIMARY KEY").replace(/CHECK \(id = 1\)/gi, "");
      await pgPool!.query(pgQuery);
    }
  };
} else {
  db = new Database(dbPath);
}

const app = express();

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use("/uploads", express.static(uploadsDir));

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
  const seoFallback = {
    metaTitle: `${asString(row?.name)} | HQ Dried Fruits`,
    metaDescription: asString(row?.short_description),
    slug: normalizeSlug(asString(row?.id), asString(row?.id)),
    ogTitle: asString(row?.name),
    imageAlt: asString(row?.name),
  };

  return {
    id: asString(row?.id),
    name: asString(row?.name),
    category: asString(row?.category),
    status: asString(row?.status, "Active"),
    image: asString(row?.image),
    imageGallery: safeParseJson<string[]>(row?.image_gallery, []),
    shortDescription: asString(row?.short_description),
    longDescription: asString(row?.long_description),
    highlights: safeParseJson<string[]>(row?.highlights, []),
    contentSections: safeParseJson<ProductSectionRecord[]>(row?.content_sections, []),
    nutrition: safeParseJson<Record<string, string>>(row?.nutrition, {
      energy: "",
      protein: "",
      fat: "",
      carbs: "",
    }),
    inquirySubjectLine: asString(row?.inquiry_subject_line),
    tonnageOptions: safeParseJson<string[]>(row?.tonnage_options, []),
    seo: {
      ...seoFallback,
      ...parsedSeo,
      slug: normalizeSlug(asString(parsedSeo.slug), seoFallback.slug),
    },
  };
}

function mapGlobalSettings(row: any) {
  return {
    headerLogo: asString(row?.header_logo, defaultGlobalSettings.headerLogo),
    siteName: asString(row?.site_name, defaultGlobalSettings.siteName),
    navLinks: safeParseJson(row?.nav_links, defaultGlobalSettings.navLinks),
    ctaText: asString(row?.cta_text, defaultGlobalSettings.ctaText),
    ctaUrl: asString(row?.cta_url, defaultGlobalSettings.ctaUrl),
    footerLogo: asString(row?.footer_logo, defaultGlobalSettings.footerLogo),
    footerDescription: asString(row?.footer_description, defaultGlobalSettings.footerDescription),
    footerLeadText: asString(row?.footer_lead_text, defaultGlobalSettings.footerLeadText),
    quickLinks: safeParseJson(row?.quick_links, defaultGlobalSettings.quickLinks),
    officeAddress: asString(row?.office_address, defaultGlobalSettings.officeAddress),
    phoneNumber: asString(row?.phone_number, defaultGlobalSettings.phoneNumber),
    emailAddress: asString(row?.email_address, defaultGlobalSettings.emailAddress),
    telegramUrl: asString(row?.telegram_url, defaultGlobalSettings.telegramUrl),
    footerCtaTitle: asString(row?.footer_cta_title, defaultGlobalSettings.footerCtaTitle),
    footerCtaEmail: asString(row?.footer_cta_email, defaultGlobalSettings.footerCtaEmail),
    footerCopyrightText: asString(row?.footer_copyright_text, defaultGlobalSettings.footerCopyrightText),
    uiLabels: {
      ...defaultGlobalSettings.uiLabels,
      ...safeParseJson(row?.ui_labels, defaultGlobalSettings.uiLabels),
    },
    googleSiteVerificationId: asString(row?.google_site_verification_id, defaultGlobalSettings.googleSiteVerificationId),
  };
}

function mapProductsPage(row: any) {
  return {
    pageTitle: asString(row?.page_title, defaultProductsPage.pageTitle),
    pageSubtitle: asString(row?.page_subtitle, defaultProductsPage.pageSubtitle),
    heroBgImage: asString(row?.hero_bg_image, defaultProductsPage.heroBgImage),
    orderingBgImage: asString(row?.ordering_bg_image, defaultProductsPage.orderingBgImage),
    orderingFormTitle: asString(row?.ordering_form_title, defaultProductsPage.orderingFormTitle),
    orderingFormSubtitle: asString(row?.ordering_form_subtitle, defaultProductsPage.orderingFormSubtitle),
    stepOneLabel: asString(row?.step_one_label, defaultProductsPage.stepOneLabel),
    stepTwoLabel: asString(row?.step_two_label, defaultProductsPage.stepTwoLabel),
    stepThreeLabel: asString(row?.step_three_label, defaultProductsPage.stepThreeLabel),
    mixedContainerLabel: asString(row?.mixed_container_label, defaultProductsPage.mixedContainerLabel),
    volumeOptions: safeParseJson(row?.volume_options, defaultProductsPage.volumeOptions),
    viewSpecsLabel: asString(row?.view_specs_label, defaultProductsPage.viewSpecsLabel),
    stepOnePlaceholder: asString(row?.step_one_placeholder, defaultProductsPage.stepOnePlaceholder),
    stepThreePlaceholder: asString(row?.step_three_placeholder, defaultProductsPage.stepThreePlaceholder),
    nextStepButtonLabel: asString(row?.next_step_button_label, defaultProductsPage.nextStepButtonLabel),
    backButtonLabel: asString(row?.back_button_label, defaultProductsPage.backButtonLabel),
    submitButtonLabel: asString(row?.submit_button_label, defaultProductsPage.submitButtonLabel),
    submittingButtonLabel: asString(row?.submitting_button_label, defaultProductsPage.submittingButtonLabel),
    detailUi: {
      ...defaultProductsPage.detailUi,
      ...safeParseJson(row?.detail_ui, defaultProductsPage.detailUi),
    },
    quickContactTitle: asString(row?.quick_contact_title, defaultProductsPage.quickContactTitle),
    quickContactSubtitle: asString(row?.quick_contact_subtitle, defaultProductsPage.quickContactSubtitle),
    telegramLabel: asString(row?.telegram_label, defaultProductsPage.telegramLabel),
    telegramSublabel: asString(row?.telegram_sublabel, defaultProductsPage.telegramSublabel),
    callLabel: asString(row?.call_label, defaultProductsPage.callLabel),
    emailLabel: asString(row?.email_label, defaultProductsPage.emailLabel),
    quickPhone: asString(row?.quick_phone, defaultProductsPage.quickPhone),
    quickEmail: asString(row?.quick_email, defaultProductsPage.quickEmail),
  };
}

function mapExportPage(row: any) {
  return {
    heroTitle: asString(row?.hero_title, defaultExportPage.heroTitle),
    heroSubtitle: asString(row?.hero_subtitle, defaultExportPage.heroSubtitle),
    heroBgImage: asString(row?.hero_bg_image, defaultExportPage.heroBgImage),
    mapSectionTitle: asString(row?.map_section_title, defaultExportPage.mapSectionTitle),
    supplyRoutes: safeParseJson(row?.supply_routes, defaultExportPage.supplyRoutes),
    logisticsContent: asContentString(row?.logistics_content, defaultExportPage.logisticsContent),
    packagingTitle: asContentString(row?.packaging_title, defaultExportPage.packagingTitle),
    packagingMethods: asContentString(row?.packaging_methods, defaultExportPage.packagingMethods),
    transportationTitle: asContentString(row?.transportation_title, defaultExportPage.transportationTitle),
    transportationMethods: asContentString(row?.transportation_methods, defaultExportPage.transportationMethods),
    documentationTitle: asContentString(row?.documentation_title, defaultExportPage.documentationTitle),
    documentationContent: asContentString(row?.documentation_content, defaultExportPage.documentationContent),
    qualityTitle: asContentString(row?.quality_title, defaultExportPage.qualityTitle),
    technicalSpecs: asContentString(row?.technical_specs, defaultExportPage.technicalSpecs),
    qualityChecks: safeParseJson(row?.quality_checks, defaultExportPage.qualityChecks),
    certificationsGallery: safeParseJson(row?.certifications_gallery, defaultExportPage.certificationsGallery),
  };
}

function mapContactsPage(row: any) {
  return {
    pageTitle: asString(row?.page_title, defaultContactsPage.pageTitle),
    introText: asString(row?.intro_text, defaultContactsPage.introText),
    formDestinationEmail: asString(row?.form_destination_email, defaultContactsPage.formDestinationEmail),
    contactFormTitle: asString(row?.contact_form_title, defaultContactsPage.contactFormTitle),
    responseLabelPrefix: asString(row?.response_label_prefix, defaultContactsPage.responseLabelPrefix),
    formNameLabel: asString(row?.form_name_label, defaultContactsPage.formNameLabel),
    formCompanyLabel: asString(row?.form_company_label, defaultContactsPage.formCompanyLabel),
    formEmailLabel: asString(row?.form_email_label, defaultContactsPage.formEmailLabel),
    formMessageLabel: asString(row?.form_message_label, defaultContactsPage.formMessageLabel),
    submitButtonLabel: asString(row?.submit_button_label, defaultContactsPage.submitButtonLabel),
    submittingButtonLabel: asString(row?.submitting_button_label, defaultContactsPage.submittingButtonLabel),
    emailAddress: asString(row?.email, defaultContactsPage.emailAddress),
    phoneNumber: asString(row?.phone, defaultContactsPage.phoneNumber),
    officeAddress: asString(row?.office_address, defaultContactsPage.officeAddress),
    workingHours: asString(row?.working_hours, defaultContactsPage.workingHours),
    mapPinLabel: asString(row?.map_pin_label, defaultContactsPage.mapPinLabel),
    infoEmailLabel: asString(row?.info_email_label, defaultContactsPage.infoEmailLabel),
    infoPhoneLabel: asString(row?.info_phone_label, defaultContactsPage.infoPhoneLabel),
    infoAddressLabel: asString(row?.info_address_label, defaultContactsPage.infoAddressLabel),
    infoHoursLabel: asString(row?.info_hours_label, defaultContactsPage.infoHoursLabel),
    socialSectionTitle: asString(row?.social_section_title, defaultContactsPage.socialSectionTitle),
    telegramUrl: asString(row?.telegram_url, defaultContactsPage.telegramUrl),
    instagramUrl: asString(row?.instagram_url, defaultContactsPage.instagramUrl),
    whatsappUrl: asString(row?.whatsapp_url, defaultContactsPage.whatsappUrl),
    facebookUrl: asString(row?.facebook_url, defaultContactsPage.facebookUrl),
    headquartersImage: asString(row?.headquarters_image, defaultContactsPage.headquartersImage),
    googleMapsUrl: asString(row?.google_maps_url, defaultContactsPage.googleMapsUrl),
  };
}

function readContentTable(pageId: keyof typeof pageContentTables) {
  const row = db.prepare(`SELECT content FROM ${pageContentTables[pageId]} WHERE id = 1`).get() as any;
  const fallback = pageId === "privacy" || pageId === "terms" ? defaultSimplePages[pageId] : {};
  return safeParseJson(row?.content, fallback);
}

function writeContentTable(pageId: keyof typeof pageContentTables, content: Record<string, unknown>) {
  ensureSingletonRow(pageContentTables[pageId]);
  db.prepare(`UPDATE ${pageContentTables[pageId]} SET content = ? WHERE id = 1`).run(JSON.stringify(content));
}

function getGlobalSettings() {
  return mapGlobalSettings(db.prepare("SELECT * FROM global_settings WHERE id = 1").get());
}

function getPageSeo() {
  const rows = db.prepare("SELECT * FROM page_seo").all() as any[];
  const seoByPage = rows.reduce<Record<string, SeoRecord>>((acc, row) => {
    const pageId = asString(row.page_id) as PageId;
    if (pageId in defaultPageSeo) {
      acc[pageId] = mapSeoRecord(row, pageId);
    }
    return acc;
  }, {});
  for (const pageId of Object.keys(defaultPageSeo) as PageId[]) {
    if (!seoByPage[pageId]) seoByPage[pageId] = defaultPageSeo[pageId];
  }
  return seoByPage as Record<PageId, SeoRecord>;
}

function findProductRowByIdentifier(identifier: string) {
  const normalizedIdentifier = normalizeSlug(identifier, identifier.trim().toLowerCase());
  const rows = db.prepare("SELECT * FROM products").all() as any[];
  return rows.find((row) => {
    const rowId = asString(row?.id);
    const rowSlug = asString(safeParseJson<Partial<SeoRecord>>(row?.seo, {}).slug);
    return normalizeSlug(rowId, rowId) === normalizedIdentifier || normalizeSlug(rowSlug, rowId) === normalizedIdentifier;
  });
}

function getManagedProductSlug(product: ReturnType<typeof mapProduct>) {
  return normalizeSlug(asString(product.seo?.slug), normalizeSlug(product.id, product.id));
}

function getProductPath(product: ReturnType<typeof mapProduct>, pageSeo: Record<PageId, SeoRecord> = defaultPageSeo) {
  return `${getManagedPagePath("products", pageSeo)}/${getManagedProductSlug(product)}`;
}

function resolveStaticPageByPath(pathname: string, pageSeo: Record<PageId, SeoRecord>) {
  const normalizedPath = normalizePathname(pathname);

  for (const pageId of Object.keys(defaultPageSeo) as PageId[]) {
    const canonicalPath = getManagedPagePath(pageId, pageSeo);
    const legacyPath = getManagedPagePath(pageId);
    if (normalizedPath === canonicalPath || normalizedPath === legacyPath) {
      return { pageId, canonicalPath };
    }
  }

  return null;
}

function resolveProductPath(pathname: string, pageSeo: Record<PageId, SeoRecord>) {
  const normalizedPath = normalizePathname(pathname);
  const segments = normalizedPath.split("/").filter(Boolean);

  if (segments.length !== 2) {
    return null;
  }

  const [sectionSlug, productIdentifier] = segments;
  const canonicalSectionSlug = getManagedPageSlug("products", pageSeo);
  const legacySectionSlug = getManagedPageSlug("products");

  if (sectionSlug !== canonicalSectionSlug && sectionSlug !== legacySectionSlug) {
    return null;
  }

  const row = findProductRowByIdentifier(productIdentifier);
  if (!row) {
    return null;
  }

  const product = mapProduct(row);
  return {
    product,
    canonicalPath: getProductPath(product, pageSeo),
  };
}

function validatePageSeoInput(pageId: PageId, payload: any) {
  const currentSeo = getPageSeo();
  const fallback = defaultPageSeo[pageId];
  const nextSeo: SeoRecord = {
    metaTitle: asString(payload.metaTitle, fallback.metaTitle),
    metaDescription: asString(payload.metaDescription, fallback.metaDescription),
    slug: pageId === "home" ? "" : normalizeSlug(asString(payload.slug), defaultPageSlugs[pageId]),
    ogTitle: asString(payload.ogTitle, fallback.ogTitle),
    imageAlt: asString(payload.imageAlt, fallback.imageAlt),
  };

  if (pageId !== "home") {
    if (!nextSeo.slug) {
      throw new Error("A URL slug is required for this page.");
    }
    if (reservedPageSlugs.has(nextSeo.slug)) {
      throw new Error(`The slug "${nextSeo.slug}" is reserved.`);
    }
  }

  for (const otherPageId of Object.keys(defaultPageSeo) as PageId[]) {
    if (otherPageId === pageId || otherPageId === "home") {
      continue;
    }
    if (getManagedPageSlug(otherPageId, currentSeo) === nextSeo.slug) {
      throw new Error(`The slug "${nextSeo.slug}" is already used by ${otherPageId}.`);
    }
  }

  return nextSeo;
}

function validateProductPayload(product: any, existingId = "") {
  const fallbackId = asString(existingId || product.id);
  const fallbackSlug = normalizeSlug(asString(product?.name), normalizeSlug(fallbackId, fallbackId));
  const normalizedSeoSlug = normalizeSlug(asString(product?.seo?.slug), fallbackSlug);
  if (!fallbackId) {
    throw new Error("Product id is required");
  }
  if (!normalizedSeoSlug) {
    throw new Error("A product SEO slug is required.");
  }

  const rows = db.prepare("SELECT * FROM products").all() as any[];
  const duplicate = rows.find((row) => {
    const rowId = asString(row?.id);
    if (rowId === fallbackId) {
      return false;
    }
    const rowSlug = normalizeSlug(asString(safeParseJson<Partial<SeoRecord>>(row?.seo, {}).slug), normalizeSlug(rowId, rowId));
    return rowSlug === normalizedSeoSlug;
  });

  if (duplicate) {
    throw new Error(`The product slug "${normalizedSeoSlug}" is already in use.`);
  }

  const seoPayload = product?.seo ?? {};
  return {
    id: fallbackId,
    name: asString(product.name),
    category: asString(product.category),
    status: asString(product.status, "Active"),
    image: asString(product.image),
    imageGallery: Array.isArray(product.imageGallery) ? product.imageGallery : [],
    shortDescription: asString(product.shortDescription),
    longDescription: asString(product.longDescription),
    highlights: Array.isArray(product.highlights) ? product.highlights : [],
    contentSections: Array.isArray(product.contentSections)
      ? product.contentSections.map((section: any) => ({
        title: asString(section?.title),
        body: asString(section?.body),
      }))
      : [],
    nutrition: product.nutrition ?? {},
    inquirySubjectLine: asString(product.inquirySubjectLine),
    tonnageOptions: Array.isArray(product.tonnageOptions) ? product.tonnageOptions : [],
    seo: {
      metaTitle: asString(seoPayload.metaTitle, `${asString(product.name)} | HQ Dried Fruits`),
      metaDescription: asString(seoPayload.metaDescription, asString(product.shortDescription)),
      slug: normalizedSeoSlug,
      ogTitle: asString(seoPayload.ogTitle, asString(product.name)),
      imageAlt: asString(seoPayload.imageAlt, asString(product.name)),
    },
  };
}

function getIndexTemplate() {
  return fs.readFileSync(path.join(distDir, "index.html"), "utf8");
}

function renderHtmlWithSeo(template: string, meta: {
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
}) {
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
  ];

  let html = template;
  for (const pattern of patterns) html = html.replace(pattern, "");

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

  return html.replace("</head>", `  ${tags.join("\n  ")}\n</head>`);
}

function buildSeoMeta(req: Request) {
  const globals = getGlobalSettings();
  const pageSeo = getPageSeo();
  const origin = getOrigin(req);
  const normalizedPath = normalizePathname(req.path);
  const siteName = globals.siteName || defaultGlobalSettings.siteName;
  const defaultImage = toAbsoluteUrl(globals.headerLogo, origin);
  const googleSiteVerificationId = globals.googleSiteVerificationId || "";
  const toCanonicalUrl = (pathname: string) => `${origin}${pathname === "/" ? "" : pathname}`;

  const fromPage = (pageId: PageId, canonicalPath: string, robots = "index,follow") => ({
    statusCode: 200,
    title: pageSeo[pageId].metaTitle,
    description: pageSeo[pageId].metaDescription,
    ogTitle: pageSeo[pageId].ogTitle || pageSeo[pageId].metaTitle,
    ogDescription: pageSeo[pageId].metaDescription,
    ogImage: defaultImage,
    imageAlt: pageSeo[pageId].imageAlt,
    canonicalUrl: toCanonicalUrl(canonicalPath),
    robots,
    ogType: "website",
    siteName,
    googleSiteVerificationId,
  });

  const staticMatch = resolveStaticPageByPath(normalizedPath, pageSeo);
  if (staticMatch) {
    return {
      ...fromPage(staticMatch.pageId, staticMatch.canonicalPath),
      redirectTo: staticMatch.canonicalPath !== normalizedPath ? staticMatch.canonicalPath : "",
    };
  }

  const productMatch = resolveProductPath(normalizedPath, pageSeo);
  if (productMatch) {
    const { product } = productMatch;
    const productsPagePath = getManagedPagePath("products", pageSeo);
    return {
      ...fromPage("products", productsPagePath),
      canonicalUrl: toCanonicalUrl(productsPagePath),
      robots: "index,follow",
      ogType: "website",
      redirectTo: `${productsPagePath}#${getManagedProductSlug(product)}`,
    };
  }

  if (normalizedPath === "/admin" || normalizedPath.startsWith("/admin/")) {
    return {
      statusCode: 200,
      title: `Admin Panel | ${siteName}`,
      description: `Administrative workspace for ${siteName}.`,
      ogTitle: `Admin Panel | ${siteName}`,
      ogDescription: `Administrative workspace for ${siteName}.`,
      ogImage: defaultImage,
      imageAlt: `${siteName} admin panel`,
      canonicalUrl: toCanonicalUrl(normalizedPath),
      robots: "noindex,nofollow",
      ogType: "website",
      siteName,
      googleSiteVerificationId,
      redirectTo: "",
    };
  }

  return {
    statusCode: 404,
    title: `Page Not Found | ${siteName}`,
    description: "The requested page could not be found.",
    ogTitle: `Page Not Found | ${siteName}`,
    ogDescription: "The requested page could not be found.",
    ogImage: defaultImage,
    imageAlt: "Page not found",
    canonicalUrl: toCanonicalUrl(normalizedPath),
    robots: "noindex,nofollow",
    ogType: "website",
    siteName,
    googleSiteVerificationId,
    redirectTo: "",
  };
}

db.exec(`
  CREATE TABLE IF NOT EXISTS global_settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    header_logo TEXT, site_name TEXT, nav_links TEXT, cta_text TEXT, cta_url TEXT,
    footer_logo TEXT, footer_description TEXT, footer_lead_text TEXT, quick_links TEXT,
    office_address TEXT, phone_number TEXT, email_address TEXT, telegram_url TEXT,
    footer_cta_title TEXT, footer_cta_email TEXT, footer_copyright_text TEXT,
    ui_labels TEXT, google_site_verification_id TEXT
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS products_page (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    page_title TEXT, page_subtitle TEXT, hero_bg_image TEXT, ordering_bg_image TEXT, ordering_form_title TEXT,
    ordering_form_subtitle TEXT, step_one_label TEXT, step_two_label TEXT, step_three_label TEXT,
    mixed_container_label TEXT, volume_options TEXT, view_specs_label TEXT, step_one_placeholder TEXT,
    step_three_placeholder TEXT, next_step_button_label TEXT, back_button_label TEXT, submit_button_label TEXT,
    submitting_button_label TEXT, detail_ui TEXT, quick_contact_title TEXT, quick_contact_subtitle TEXT,
    telegram_label TEXT, telegram_sublabel TEXT, call_label TEXT, email_label TEXT, quick_phone TEXT, quick_email TEXT
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS export_page (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      hero_title TEXT, hero_subtitle TEXT, hero_bg_image TEXT,
      map_section_title TEXT, supply_routes TEXT, logistics_content TEXT, packaging_title TEXT,
      packaging_methods TEXT, transportation_title TEXT, transportation_methods TEXT,
      documentation_title TEXT, documentation_content TEXT, quality_title TEXT,
      technical_specs TEXT, quality_checks TEXT, certifications_gallery TEXT
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS contacts_page (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    page_title TEXT, intro_text TEXT, form_destination_email TEXT, contact_form_title TEXT, response_label_prefix TEXT,
    form_name_label TEXT, form_company_label TEXT, form_email_label TEXT, form_message_label TEXT,
    submit_button_label TEXT, submitting_button_label TEXT, email TEXT, phone TEXT, office_address TEXT,
    working_hours TEXT, map_pin_label TEXT, info_email_label TEXT, info_phone_label TEXT, info_address_label TEXT,
    info_hours_label TEXT, social_section_title TEXT, telegram_url TEXT, instagram_url TEXT, whatsapp_url TEXT, facebook_url TEXT,
    headquarters_image TEXT, google_maps_url TEXT
  )
`);

for (const tableName of Object.values(pageContentTables)) {
  db.exec(`CREATE TABLE IF NOT EXISTS ${tableName} (id INTEGER PRIMARY KEY CHECK (id = 1), content TEXT)`);
}

db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY, name TEXT, category TEXT, status TEXT, image TEXT, image_gallery TEXT,
    short_description TEXT, long_description TEXT, highlights TEXT, content_sections TEXT, nutrition TEXT,
    inquiry_subject_line TEXT, tonnage_options TEXT, seo TEXT
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS leads (
    id TEXT PRIMARY KEY, date TEXT, name TEXT, company TEXT, email TEXT, phone TEXT, telegram TEXT,
    product_interest TEXT, est_tonnage TEXT, status TEXT, message TEXT, notes TEXT
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS page_seo (
    page_id TEXT PRIMARY KEY, meta_title TEXT, meta_description TEXT, slug TEXT, og_title TEXT, image_alt TEXT
  )
`);

migrateTable("global_settings", [
  "header_logo", "site_name", "nav_links", "cta_text", "cta_url", "footer_logo", "footer_description",
  "footer_lead_text", "quick_links", "office_address", "phone_number", "email_address", "telegram_url",
  "footer_cta_title", "footer_cta_email", "footer_copyright_text", "ui_labels", "google_site_verification_id",
]);
migrateTable("products_page", [
  "page_title", "page_subtitle", "hero_bg_image", "ordering_bg_image", "ordering_form_title", "ordering_form_subtitle",
  "step_one_label", "step_two_label", "step_three_label", "mixed_container_label", "volume_options",
  "view_specs_label", "step_one_placeholder", "step_three_placeholder", "next_step_button_label",
  "back_button_label", "submit_button_label", "submitting_button_label", "detail_ui", "quick_contact_title",
  "quick_contact_subtitle", "telegram_label", "telegram_sublabel", "call_label", "email_label", "quick_phone",
  "quick_email",
]);
migrateTable("export_page", [
  "hero_title", "hero_subtitle", "hero_bg_image",
  "map_section_title", "supply_routes", "logistics_content", "packaging_title", "packaging_methods",
  "transportation_title", "transportation_methods", "documentation_title", "documentation_content",
  "quality_title", "technical_specs", "quality_checks", "certifications_gallery",
]);
migrateTable("contacts_page", [
  "page_title", "intro_text", "form_destination_email", "contact_form_title", "response_label_prefix",
  "form_name_label", "form_company_label", "form_email_label", "form_message_label", "submit_button_label",
  "submitting_button_label", "email", "phone", "office_address", "working_hours", "map_pin_label",
  "info_email_label", "info_phone_label", "info_address_label", "info_hours_label", "social_section_title",
  "telegram_url", "instagram_url", "whatsapp_url", "facebook_url", "headquarters_image",
  "google_maps_url",
]);
migrateTable("products", [
  "name", "category", "status", "image", "image_gallery", "short_description", "long_description",
  "highlights", "content_sections", "nutrition", "inquiry_subject_line", "tonnage_options", "seo",
]);
migrateTable("leads", [
  "date", "name", "company", "email", "phone", "telegram", "product_interest", "est_tonnage", "status", "message", "notes",
]);

db.prepare(`
  INSERT OR IGNORE INTO global_settings (
    id, header_logo, site_name, nav_links, cta_text, cta_url, footer_logo, footer_description, footer_lead_text,
    quick_links, office_address, phone_number, email_address, telegram_url, footer_cta_title, footer_cta_email,
    footer_copyright_text, ui_labels, google_site_verification_id
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`).run(
  1, defaultGlobalSettings.headerLogo, defaultGlobalSettings.siteName, JSON.stringify(defaultGlobalSettings.navLinks),
  defaultGlobalSettings.ctaText, defaultGlobalSettings.ctaUrl, defaultGlobalSettings.footerLogo,
  defaultGlobalSettings.footerDescription, defaultGlobalSettings.footerLeadText, JSON.stringify(defaultGlobalSettings.quickLinks),
  defaultGlobalSettings.officeAddress, defaultGlobalSettings.phoneNumber, defaultGlobalSettings.emailAddress,
  defaultGlobalSettings.telegramUrl, defaultGlobalSettings.footerCtaTitle, defaultGlobalSettings.footerCtaEmail,
  defaultGlobalSettings.footerCopyrightText, JSON.stringify(defaultGlobalSettings.uiLabels), defaultGlobalSettings.googleSiteVerificationId,
);

db.prepare(`
  INSERT OR IGNORE INTO products_page (
    id, page_title, page_subtitle, hero_bg_image, ordering_bg_image, ordering_form_title, ordering_form_subtitle,
    step_one_label, step_two_label, step_three_label, mixed_container_label, volume_options, view_specs_label,
    step_one_placeholder, step_three_placeholder, next_step_button_label, back_button_label, submit_button_label,
    submitting_button_label, detail_ui, quick_contact_title, quick_contact_subtitle, telegram_label,
    telegram_sublabel, call_label, email_label, quick_phone, quick_email
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`).run(
  1, defaultProductsPage.pageTitle, defaultProductsPage.pageSubtitle, defaultProductsPage.heroBgImage, defaultProductsPage.orderingBgImage,
  defaultProductsPage.orderingFormTitle, defaultProductsPage.orderingFormSubtitle, defaultProductsPage.stepOneLabel,
  defaultProductsPage.stepTwoLabel, defaultProductsPage.stepThreeLabel, defaultProductsPage.mixedContainerLabel,
  JSON.stringify(defaultProductsPage.volumeOptions), defaultProductsPage.viewSpecsLabel, defaultProductsPage.stepOnePlaceholder,
  defaultProductsPage.stepThreePlaceholder, defaultProductsPage.nextStepButtonLabel, defaultProductsPage.backButtonLabel,
  defaultProductsPage.submitButtonLabel, defaultProductsPage.submittingButtonLabel, JSON.stringify(defaultProductsPage.detailUi),
  defaultProductsPage.quickContactTitle,
  defaultProductsPage.quickContactSubtitle, defaultProductsPage.telegramLabel, defaultProductsPage.telegramSublabel,
  defaultProductsPage.callLabel, defaultProductsPage.emailLabel, defaultProductsPage.quickPhone, defaultProductsPage.quickEmail,
);

db.prepare(`
    INSERT OR IGNORE INTO export_page (
      id, hero_title, hero_subtitle, hero_bg_image, map_section_title, supply_routes, logistics_content, packaging_title, packaging_methods,
      transportation_title, transportation_methods, documentation_title, documentation_content,
      quality_title, technical_specs, quality_checks, certifications_gallery
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
  1, defaultExportPage.heroTitle, defaultExportPage.heroSubtitle, defaultExportPage.heroBgImage,
  defaultExportPage.mapSectionTitle, JSON.stringify(defaultExportPage.supplyRoutes), defaultExportPage.logisticsContent,
  defaultExportPage.packagingTitle, defaultExportPage.packagingMethods, defaultExportPage.transportationTitle,
  defaultExportPage.transportationMethods, defaultExportPage.documentationTitle, defaultExportPage.documentationContent,
  defaultExportPage.qualityTitle, defaultExportPage.technicalSpecs, JSON.stringify(defaultExportPage.qualityChecks),
  JSON.stringify(defaultExportPage.certificationsGallery),
);

db.prepare(`
  INSERT OR IGNORE INTO contacts_page (
    id, page_title, intro_text, form_destination_email, contact_form_title, response_label_prefix,
    form_name_label, form_company_label, form_email_label, form_message_label, submit_button_label,
    submitting_button_label, email, phone, office_address, working_hours, map_pin_label, info_email_label,
    info_phone_label, info_address_label, info_hours_label, social_section_title, telegram_url, instagram_url, whatsapp_url, facebook_url,
    headquarters_image, google_maps_url
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`).run(
  1, defaultContactsPage.pageTitle, defaultContactsPage.introText, defaultContactsPage.formDestinationEmail,
  defaultContactsPage.contactFormTitle, defaultContactsPage.responseLabelPrefix, defaultContactsPage.formNameLabel,
  defaultContactsPage.formCompanyLabel, defaultContactsPage.formEmailLabel, defaultContactsPage.formMessageLabel,
  defaultContactsPage.submitButtonLabel, defaultContactsPage.submittingButtonLabel, defaultContactsPage.emailAddress,
  defaultContactsPage.phoneNumber, defaultContactsPage.officeAddress, defaultContactsPage.workingHours, defaultContactsPage.mapPinLabel,
  defaultContactsPage.infoEmailLabel, defaultContactsPage.infoPhoneLabel, defaultContactsPage.infoAddressLabel,
  defaultContactsPage.infoHoursLabel, defaultContactsPage.socialSectionTitle, defaultContactsPage.telegramUrl,
  defaultContactsPage.instagramUrl, defaultContactsPage.whatsappUrl, defaultContactsPage.facebookUrl,
  defaultContactsPage.headquartersImage, defaultContactsPage.googleMapsUrl,
);

for (const pageId of Object.keys(pageContentTables) as Array<keyof typeof pageContentTables>) {
  const fallback = pageId === "privacy" || pageId === "terms" ? defaultSimplePages[pageId] : {};
  db.prepare(`INSERT OR IGNORE INTO ${pageContentTables[pageId]} (id, content) VALUES (1, ?)`).run(JSON.stringify(fallback));
}

const productSeeds = [
  {
    id: "sun-dried-apricots",
    legacyNames: ["Sun-Dried Apricots"],
    name: "Apricots",
    category: "Sun-Dried Orchard Fruit",
    status: "Active",
    image: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?q=80&w=1200&auto=format&fit=crop",
    imageGallery: [
      "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1471943311424-646960669fbc?q=80&w=1200&auto=format&fit=crop",
    ],
    shortDescription:
      "Uzbekistan apricots are sourced for high natural sugar, clean color, and stable drying performance for retail, bakery, and industrial buyers.",
    longDescription:
      "<p>Our export apricots are selected from Uzbekistan's traditional fruit-growing belts, where long sunny summers support high brix development before drying. The result is a dense, naturally sweet product that performs well for snacking, bakery inclusions, confectionery, and further processing.</p><p>We sort for size, moisture balance, and visual uniformity, then prepare each lot for the destination market, whether the buyer needs industrial cartons, private-label repacking, or mixed-container loading with other dried fruits.</p>",
    highlights: [
      "Naturally sweet profile with strong consumer familiarity",
      "Suitable for bakery, snack, cereal, and ingredient channels",
      "Laser-sorted and conditioned for export consistency",
      "Available for bulk cartons and mixed-container programs",
    ],
    contentSections: [
      {
        title: "Overview",
        body:
          "<p>Uzbek dried apricots are one of the country's best-known fruit exports because they combine high natural sweetness with dependable processing behavior. We position apricots as a versatile line for importers who need a fruit that can move across snack packs, baking, cereals, fillings, and ingredient applications without losing identity on shelf.</p><p>For wholesale buyers, the key advantage is consistency: the fruit dries into a dense, chewy texture, holds color well when properly graded, and supports multiple export formats from industrial cartons to buyer-specific retail repacking.</p>",
      },
      {
        title: "Origin & Growing Conditions",
        body:
          "<p>Across Uzbekistan's fruit belts, orchards commonly operate in irrigated valley and foothill zones where sierozem soils, meadow soils, and alluvial soils are widespread. These soils are valued in local horticulture because they drain well, respond predictably to irrigation, and support the sugar accumulation fruit buyers care about.</p><p>The country's sharply continental climate also matters: long hot summers, low humidity during ripening, and strong sunlight help apricots concentrate flavor before drying. In export terms, that gives buyers a naturally sweeter raw material instead of a product that depends on added sugars or heavy post-processing.</p>",
      },
      {
        title: "Benefits & Buyer Uses",
        body:
          "<p>Apricots are commercially attractive because they carry a strong wellness association while still functioning as a flexible ingredient. Buyers use them in breakfast mixes, snack blends, bakery fillings, bars, chocolate-coated products, and foodservice programs where a softer dried fruit is preferred.</p><p>Nutritionally, dried apricots are known for carbohydrates that provide quick energy, along with fiber and potassium. That combination helps position the product for both mainstream snacking and better-for-you private-label ranges.</p>",
      },
      {
        title: "Export & Handling",
        body:
          "<p>We prepare apricot lots around buyer requirements for size grading, moisture management, and final format. Depending on the lane, shipments can be packed in export cartons for industrial users or prepared for secondary repacking by distributors and private-label processors.</p><p>Typical use cases include trial orders, recurring monthly programs, and mixed-container combinations with raisins or prunes. This makes apricots a strong anchor item when importers want a familiar dried-fruit line with high turnover potential.</p>",
      },
    ] as ProductSectionRecord[],
    nutrition: { energy: "241", protein: "3.4g", fat: "0.5g", carbs: "63g" },
    inquirySubjectLine: "Wholesale Inquiry for Apricots",
    tonnageOptions: ["Sample Carton", "1 - 5 Tons", "5 - 20 Tons", "20ft / 40ft Container Program"],
    seo: {
      metaTitle: "Wholesale Dried Apricots from Uzbekistan | HQ Dried Fruits",
      metaDescription:
        "Source Uzbekistan dried apricots with detailed origin, soil, processing, nutrition, and export-use information for wholesale buyers.",
      slug: "sun-dried-apricots",
      ogTitle: "Uzbekistan Dried Apricots",
      imageAlt: "Wholesale dried apricots from Uzbekistan",
    },
  },
  {
    id: "black-raisins",
    legacyNames: ["Black Raisins"],
    name: "Raisins",
    category: "Dark Grape Selection",
    status: "Active",
    image: "https://images.unsplash.com/photo-1596591606975-97ee5cef3a1e?q=80&w=1200&auto=format&fit=crop",
    imageGallery: [
      "https://images.unsplash.com/photo-1596591606975-97ee5cef3a1e?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1515543904379-3d757afe72e1?q=80&w=1200&auto=format&fit=crop",
    ],
    shortDescription:
      "Uzbek raisins are valued for concentrated sweetness, strong color, and broad use across snack, bakery, cereal, and ingredient channels.",
    longDescription:
      "<p>Raisins remain one of the most trade-friendly dried fruit lines because they fit almost every category from bulk ingredients to retail snacking. Our Uzbek raisin offer is built around full flavor, visual depth, and careful sorting so importers receive a product that can move into bakery, cereal, bars, confectionery, and foodservice with minimal adjustment.</p><p>For B2B buyers, the appeal is a combination of recognizable consumer demand and easy logistics handling. Raisins travel well, integrate easily into mixed programs, and support recurring supply schedules when a buyer wants a reliable everyday dried-fruit line.</p>",
    highlights: [
      "High-volume staple for bakery, cereal, snack, and ingredient buyers",
      "Naturally concentrated sweetness from hot, dry growing conditions",
      "Strong shelf familiarity for retail and private-label programs",
      "Efficient to combine with apricots and prunes in mixed loads",
    ],
    contentSections: [
      {
        title: "Overview",
        body:
          "<p>Raisins are one of the easiest Uzbek dried fruits to commercialize because they work in both value and premium segments. Importers can position them as everyday snack fruit, ingredient fruit, or part of a broader dried-fruit assortment without having to educate the end buyer from zero.</p><p>That makes raisins useful for distributors, repackers, cereal manufacturers, bakery customers, and traders who want a line with fast use cases and predictable turnover.</p>",
      },
      {
        title: "Origin & Growing Conditions",
        body:
          "<p>Uzbekistan's grape-growing regions benefit from irrigated valley systems, strong summer sun, and a dry continental harvest season that supports sugar concentration before drying. In these zones, alluvial and sierozem soils are common, and growers depend on irrigation management rather than rainfall at the critical ripening stage.</p><p>For exporters, those conditions matter because grapes develop sweetness efficiently while facing less late-season humidity pressure than in wetter climates. The result is a raisin profile that is naturally intense rather than artificially sweetened.</p>",
      },
      {
        title: "Benefits & Buyer Uses",
        body:
          "<p>Raisins are attractive to buyers because they combine familiar taste with a straightforward nutrition story: natural sugars, fiber, potassium, and fruit-derived polyphenols. That makes them easy to position in better-for-you snack sets, bakery mixes, muesli, granola, trail mixes, and confectionery.</p><p>On the commercial side, they are also one of the easiest dried fruits to integrate into industrial formulas. They can be blended, chopped, coated, packed as-is, or used as a sweetness-carrying ingredient in bars and breakfast products.</p>",
      },
      {
        title: "Export & Handling",
        body:
          "<p>We prepare raisin lots for export with attention to sorting, stem control, moisture balance, and lot uniformity so the product arrives ready for direct resale or secondary packing. Buyers can use them in dedicated shipments or as part of mixed-container programs where raisins provide a stable, fast-moving base line.</p><p>Typical order structures range from sample cartons and trial volumes to container-based monthly procurement for distributors and food manufacturers.</p>",
      },
    ] as ProductSectionRecord[],
    nutrition: { energy: "299", protein: "3.1g", fat: "0.5g", carbs: "79g" },
    inquirySubjectLine: "Wholesale Inquiry for Raisins",
    tonnageOptions: ["Sample Carton", "1 - 5 Tons", "5 - 20 Tons", "20ft / 40ft Container Program"],
    seo: {
      metaTitle: "Wholesale Raisins from Uzbekistan | HQ Dried Fruits",
      metaDescription:
        "Source Uzbek raisins with detailed climate, soil, nutrition, processing, and wholesale-use information for importers and ingredient buyers.",
      slug: "black-raisins",
      ogTitle: "Uzbekistan Raisins",
      imageAlt: "Wholesale raisins from Uzbekistan",
    },
  },
  {
    id: "pitted-prunes",
    legacyNames: ["Pitted Prunes"],
    name: "Prunes",
    category: "Dried Plum Program",
    status: "Active",
    image: "https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?q=80&w=1200&auto=format&fit=crop",
    imageGallery: [
      "https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?q=80&w=1200&auto=format&fit=crop",
    ],
    shortDescription:
      "Uzbek prunes combine soft texture, dark color, and moisture-controlled handling for ingredient, snack, and foodservice applications.",
    longDescription:
      "<p>Prunes serve buyers who want a softer dried fruit with strong culinary flexibility. They move into direct snacking, bakery, fillings, sauces, purees, breakfast applications, and ingredient programs where texture and natural fruit sweetness matter as much as shelf stability.</p><p>Our prune line is positioned around consistency and handling control. Moisture-balanced lots reduce unnecessary stickiness, help preserve a fleshy bite, and make the product easier to repack or process further in destination markets.</p>",
    highlights: [
      "Soft texture and dark visual profile for premium and mainstream formats",
      "Strong fit for bakery, fillings, sauces, purees, and snacking",
      "Moisture-balanced preparation for stable handling in transit",
      "Suitable for both dedicated and mixed-container orders",
    ],
    contentSections: [
      {
        title: "Overview",
        body:
          "<p>Prunes give importers a dried fruit with a broader texture profile than raisins and a darker, richer eating character than apricots. That makes them useful when a buyer wants a line for both direct consumption and industrial processing.</p><p>In commercial terms, prunes are often a high-value supporting item within a dried-fruit portfolio because they can move through bakery, wellness-oriented retail, foodservice, and ingredient channels with different packaging formats.</p>",
      },
      {
        title: "Origin & Growing Conditions",
        body:
          "<p>Uzbek plum production benefits from the same irrigated orchard systems that support much of the country's high-value horticulture. Fruit-growing zones typically combine fertile irrigated soils with hot summer days and comparatively dry harvest conditions, creating a strong platform for sugar development and drying performance.</p><p>For buyers, that matters because prune quality is closely linked to the raw fruit's maturity and solids content. Warm valley and foothill conditions help deliver the dense sweetness and deep color commercial dried plums are expected to carry.</p>",
      },
      {
        title: "Benefits & Buyer Uses",
        body:
          "<p>Prunes are associated with fiber, naturally occurring sorbitol, and potassium, which gives them a credible nutrition story for modern retail and private-label ranges. At the same time, they are highly practical for processors because they can be sold whole, chopped, pasted, pureed, or blended into compound fruit products.</p><p>Common buyer applications include bakery fillings, breakfast products, snack pouches, compotes, sauces, and fruit-based ingredient systems where a darker fruit note is preferred.</p>",
      },
      {
        title: "Export & Handling",
        body:
          "<p>We position prunes around controlled moisture and clean packing so the product remains workable after transit. That is especially important for buyers who repack locally or use the fruit as an input for secondary processing.</p><p>Prunes can be offered in trial lots, recurring wholesale volumes, or mixed-container programs paired with apricots and raisins when a buyer wants a broader dried-fruit offer in one shipment.</p>",
      },
    ] as ProductSectionRecord[],
    nutrition: { energy: "240", protein: "2.2g", fat: "0.4g", carbs: "64g" },
    inquirySubjectLine: "Wholesale Inquiry for Prunes",
    tonnageOptions: ["Sample Carton", "1 - 5 Tons", "5 - 20 Tons", "20ft / 40ft Container Program"],
    seo: {
      metaTitle: "Wholesale Prunes from Uzbekistan | HQ Dried Fruits",
      metaDescription:
        "Source Uzbekistan prunes with detailed orchard, climate, moisture, nutrition, and export application information for wholesale buyers.",
      slug: "pitted-prunes",
      ogTitle: "Uzbekistan Prunes",
      imageAlt: "Wholesale prunes from Uzbekistan",
    },
  },
];

const insertProduct = db.prepare(`
  INSERT OR IGNORE INTO products (
    id, name, category, status, image, image_gallery, short_description, long_description,
    highlights, content_sections, nutrition, inquiry_subject_line, tonnage_options, seo
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const updateSeededProduct = db.prepare(`
  UPDATE products SET
    name = ?, category = ?, status = ?, image = ?, image_gallery = ?, short_description = ?, long_description = ?,
    highlights = ?, content_sections = ?, nutrition = ?, inquiry_subject_line = ?, tonnage_options = ?, seo = ?
  WHERE id = ?
`);

for (const product of productSeeds) {
  insertProduct.run(
    product.id,
    product.name,
    product.category,
    product.status,
    product.image,
    JSON.stringify(product.imageGallery),
    product.shortDescription,
    product.longDescription,
    JSON.stringify(product.highlights),
    JSON.stringify(product.contentSections),
    JSON.stringify(product.nutrition),
    product.inquirySubjectLine,
    JSON.stringify(product.tonnageOptions),
    JSON.stringify(product.seo),
  );

  const existingRow = db.prepare("SELECT * FROM products WHERE id = ?").get(product.id);
  if (!existingRow) {
    continue;
  }

  const current = mapProduct(existingRow);
  const currentSectionCount = Array.isArray(current.contentSections) ? current.contentSections.length : 0;
  const currentLegacyName = (product.legacyNames as string[]).includes(current.name);
  const mergedProduct = {
    ...current,
    name: !current.name || currentLegacyName ? product.name : current.name,
    category: current.category || product.category,
    status: current.status || product.status,
    image: current.image || product.image,
    imageGallery: current.imageGallery.length > 0 ? current.imageGallery : product.imageGallery,
    shortDescription: current.shortDescription || product.shortDescription,
    longDescription: current.longDescription || product.longDescription,
    highlights: current.highlights.length > 0 ? current.highlights : product.highlights,
    contentSections: currentSectionCount > 0 ? current.contentSections : product.contentSections,
    nutrition: current.nutrition?.energy ? current.nutrition : product.nutrition,
    inquirySubjectLine: current.inquirySubjectLine || product.inquirySubjectLine,
    tonnageOptions: current.tonnageOptions.length > 0 ? current.tonnageOptions : product.tonnageOptions,
    seo: {
      ...product.seo,
      ...current.seo,
      metaTitle: current.seo?.metaTitle || product.seo.metaTitle,
      metaDescription: current.seo?.metaDescription || product.seo.metaDescription,
      slug: current.seo?.slug || product.seo.slug,
      ogTitle: current.seo?.ogTitle || product.seo.ogTitle,
      imageAlt: current.seo?.imageAlt || product.seo.imageAlt,
    },
  };

  updateSeededProduct.run(
    mergedProduct.name,
    mergedProduct.category,
    mergedProduct.status,
    mergedProduct.image,
    JSON.stringify(mergedProduct.imageGallery),
    mergedProduct.shortDescription,
    mergedProduct.longDescription,
    JSON.stringify(mergedProduct.highlights),
    JSON.stringify(mergedProduct.contentSections),
    JSON.stringify(mergedProduct.nutrition),
    mergedProduct.inquirySubjectLine,
    JSON.stringify(mergedProduct.tonnageOptions),
    JSON.stringify(mergedProduct.seo),
    product.id,
  );
}

const upsertPageSeo = db.prepare(`
  INSERT INTO page_seo (page_id, meta_title, meta_description, slug, og_title, image_alt)
  VALUES (?, ?, ?, ?, ?, ?)
  ON CONFLICT(page_id) DO UPDATE SET
    meta_title = excluded.meta_title,
    meta_description = excluded.meta_description,
    slug = excluded.slug,
    og_title = excluded.og_title,
    image_alt = excluded.image_alt
`);

for (const [pageId, seo] of Object.entries(defaultPageSeo)) {
  db.prepare(`
    INSERT OR IGNORE INTO page_seo (page_id, meta_title, meta_description, slug, og_title, image_alt)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(pageId, seo.metaTitle, seo.metaDescription, seo.slug, seo.ogTitle, seo.imageAlt);
}

app.get("/api/uploads", (_req, res) => {
  try {
    const files = fs.existsSync(uploadsDir) ? fs.readdirSync(uploadsDir) : [];
    res.json(files.sort((a, b) => b.localeCompare(a)).map((file) => `/uploads/${file}`));
  } catch (error) {
    console.error("Uploads read error:", error);
    res.status(500).json({ error: "Failed to read uploads directory" });
  }
});

app.get("/api/globals", (_req, res) => {
  try {
    res.json(getGlobalSettings());
  } catch (error) {
    console.error("Globals fetch error:", error);
    res.status(500).json({ error: "Failed to fetch settings" });
  }
});

app.post("/api/globals", (req, res) => {
  try {
    ensureSingletonRow("global_settings");
    const settings = req.body ?? {};
    db.prepare(`
      UPDATE global_settings SET
        header_logo = ?, site_name = ?, nav_links = ?, cta_text = ?, cta_url = ?, footer_logo = ?,
        footer_description = ?, footer_lead_text = ?, quick_links = ?, office_address = ?, phone_number = ?,
        email_address = ?, telegram_url = ?, footer_cta_title = ?, footer_cta_email = ?,
        footer_copyright_text = ?, ui_labels = ?, google_site_verification_id = ?
      WHERE id = 1
    `).run(
      asString(settings.headerLogo),
      asString(settings.siteName, defaultGlobalSettings.siteName),
      JSON.stringify(Array.isArray(settings.navLinks) ? settings.navLinks : []),
      asString(settings.ctaText),
      asString(settings.ctaUrl),
      asString(settings.footerLogo),
      asString(settings.footerDescription),
      asString(settings.footerLeadText),
      JSON.stringify(Array.isArray(settings.quickLinks) ? settings.quickLinks : []),
      asString(settings.officeAddress),
      asString(settings.phoneNumber),
      asString(settings.emailAddress),
      asString(settings.telegramUrl),
      asString(settings.footerCtaTitle),
      asString(settings.footerCtaEmail),
      asString(settings.footerCopyrightText),
      JSON.stringify(typeof settings.uiLabels === "object" && settings.uiLabels ? settings.uiLabels : defaultGlobalSettings.uiLabels),
      asString(settings.googleSiteVerificationId),
    );
    res.json({ success: true });
  } catch (error) {
    console.error("Globals update error:", error);
    res.status(500).json({ error: "Update failed" });
  }
});

app.get("/api/seo/pages", (_req, res) => {
  try {
    res.json(getPageSeo());
  } catch (error) {
    console.error("SEO fetch error:", error);
    res.status(500).json({ error: "Failed to fetch SEO settings" });
  }
});

app.post("/api/seo/pages/:id", (req, res) => {
  try {
    const pageId = asString(req.params.id) as PageId;
    if (!(pageId in defaultPageSeo)) {
      return res.status(404).json({ error: "Unknown page id" });
    }
    const nextSeo = validatePageSeoInput(pageId, req.body ?? {});
    upsertPageSeo.run(
      pageId,
      nextSeo.metaTitle,
      nextSeo.metaDescription,
      nextSeo.slug,
      nextSeo.ogTitle,
      nextSeo.imageAlt,
    );
    res.json({ success: true });
  } catch (error) {
    console.error("SEO update error:", error);
    res.status(400).json({ error: error instanceof Error ? error.message : "Failed to save SEO settings" });
  }
});

app.get("/api/products", (_req, res) => {
  try {
    const rows = db.prepare("SELECT * FROM products").all() as any[];
    res.json(rows.map(mapProduct));
  } catch (error) {
    console.error("Products fetch error:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

app.get("/api/products/:id", (req, res) => {
  try {
    const row = findProductRowByIdentifier(asString(req.params.id));
    if (!row) return res.status(404).json({ error: "Product not found" });
    res.json(mapProduct(row));
  } catch (error) {
    console.error("Product fetch error:", error);
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

app.post("/api/products", (req, res) => {
  try {
    const product = validateProductPayload(req.body ?? {});
    db.prepare(`
      INSERT INTO products (
        id, name, category, status, image, image_gallery, short_description, long_description,
        highlights, content_sections, nutrition, inquiry_subject_line, tonnage_options, seo
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      product.id,
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
    );
    res.json({ success: true, id: product.id, product });
  } catch (error) {
    console.error("Product create error:", error);
    res.status(400).json({ error: error instanceof Error ? error.message : "Failed to create product" });
  }
});

app.post("/api/products/:id", (req, res) => {
  try {
    const product = validateProductPayload(req.body ?? {}, asString(req.params.id));
    const result = db.prepare(`
      UPDATE products SET
        name = ?, category = ?, status = ?, image = ?, image_gallery = ?, short_description = ?,
        long_description = ?, highlights = ?, content_sections = ?, nutrition = ?, inquiry_subject_line = ?, tonnage_options = ?, seo = ?
      WHERE id = ?
    `).run(
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
      asString(req.params.id),
    );
    if (result.changes === 0) return res.status(404).json({ error: "Product not found" });
    res.json({ success: true, product });
  } catch (error) {
    console.error("Product update error:", error);
    res.status(400).json({ error: error instanceof Error ? error.message : "Failed to update product" });
  }
});

app.delete("/api/products/:id", (req, res) => {
  try {
    db.prepare("DELETE FROM products WHERE id = ?").run(asString(req.params.id));
    res.json({ success: true });
  } catch (error) {
    console.error("Product delete error:", error);
    res.status(500).json({ error: "Failed to delete product" });
  }
});

app.get("/api/pages/:id", (req, res) => {
  try {
    const pageId = asString(req.params.id);
    if (pageId === "products") return res.json(mapProductsPage(db.prepare("SELECT * FROM products_page WHERE id = 1").get()));
    if (pageId === "export") return res.json(mapExportPage(db.prepare("SELECT * FROM export_page WHERE id = 1").get()));
    if (pageId === "contacts") return res.json(mapContactsPage(db.prepare("SELECT * FROM contacts_page WHERE id = 1").get()));
    if (pageId in pageContentTables) return res.json(readContentTable(pageId as keyof typeof pageContentTables));
    return res.status(404).json({ error: "Page template not found" });
  } catch (error) {
    console.error("Page fetch error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/api/pages/:id", (req, res) => {
  try {
    const pageId = asString(req.params.id);
    const content = req.body ?? {};

    if (pageId === "products") {
      ensureSingletonRow("products_page");
      db.prepare(`
        UPDATE products_page SET
          page_title = ?, page_subtitle = ?, hero_bg_image = ?, ordering_bg_image = ?, ordering_form_title = ?, ordering_form_subtitle = ?,
          step_one_label = ?, step_two_label = ?, step_three_label = ?, mixed_container_label = ?, volume_options = ?,
          view_specs_label = ?, step_one_placeholder = ?, step_three_placeholder = ?, next_step_button_label = ?,
          back_button_label = ?, submit_button_label = ?, submitting_button_label = ?, detail_ui = ?, quick_contact_title = ?,
          quick_contact_subtitle = ?, telegram_label = ?, telegram_sublabel = ?, call_label = ?, email_label = ?,
          quick_phone = ?, quick_email = ?
        WHERE id = 1
      `).run(
        asString(content.pageTitle), asString(content.pageSubtitle), asString(content.heroBgImage), asString(content.orderingBgImage),
        asString(content.orderingFormTitle), asString(content.orderingFormSubtitle), asString(content.stepOneLabel),
        asString(content.stepTwoLabel), asString(content.stepThreeLabel), asString(content.mixedContainerLabel),
        JSON.stringify(Array.isArray(content.volumeOptions) ? content.volumeOptions : []), asString(content.viewSpecsLabel),
        asString(content.stepOnePlaceholder), asString(content.stepThreePlaceholder), asString(content.nextStepButtonLabel),
        asString(content.backButtonLabel), asString(content.submitButtonLabel), asString(content.submittingButtonLabel),
        JSON.stringify(typeof content.detailUi === "object" && content.detailUi ? content.detailUi : defaultProductsPage.detailUi),
        asString(content.quickContactTitle), asString(content.quickContactSubtitle), asString(content.telegramLabel),
        asString(content.telegramSublabel), asString(content.callLabel), asString(content.emailLabel), asString(content.quickPhone),
        asString(content.quickEmail),
      );
      return res.json({ success: true });
    }

    if (pageId === "export") {
      ensureSingletonRow("export_page");
      db.prepare(`
          UPDATE export_page SET
            hero_title = ?, hero_subtitle = ?, hero_bg_image = ?,
            map_section_title = ?, supply_routes = ?, logistics_content = ?, packaging_title = ?, packaging_methods = ?,
            transportation_title = ?, transportation_methods = ?, documentation_title = ?, documentation_content = ?,
            quality_title = ?, technical_specs = ?, quality_checks = ?, certifications_gallery = ?
          WHERE id = 1
        `).run(
        asString(content.heroTitle), asString(content.heroSubtitle), asString(content.heroBgImage),
        asString(content.mapSectionTitle), JSON.stringify(Array.isArray(content.supplyRoutes) ? content.supplyRoutes : []),
        asString(content.logisticsContent), asString(content.packagingTitle), asString(content.packagingMethods),
        asString(content.transportationTitle), asString(content.transportationMethods), asString(content.documentationTitle),
        asString(content.documentationContent), asString(content.qualityTitle), asString(content.technicalSpecs),
        JSON.stringify(Array.isArray(content.qualityChecks) ? content.qualityChecks : []),
        JSON.stringify(Array.isArray(content.certificationsGallery) ? content.certificationsGallery : []),
      );
      return res.json({ success: true });
    }

    if (pageId === "contacts") {
      ensureSingletonRow("contacts_page");
      db.prepare(`
        UPDATE contacts_page SET
          page_title = ?, intro_text = ?, form_destination_email = ?, contact_form_title = ?, response_label_prefix = ?,
          form_name_label = ?, form_company_label = ?, form_email_label = ?, form_message_label = ?, submit_button_label = ?,
          submitting_button_label = ?, email = ?, phone = ?, office_address = ?, working_hours = ?, map_pin_label = ?,
          info_email_label = ?, info_phone_label = ?, info_address_label = ?, info_hours_label = ?, social_section_title = ?,
          telegram_url = ?, instagram_url = ?, whatsapp_url = ?, facebook_url = ?, headquarters_image = ?, google_maps_url = ?
        WHERE id = 1
      `).run(
        asString(content.pageTitle), asString(content.introText), asString(content.formDestinationEmail),
        asString(content.contactFormTitle), asString(content.responseLabelPrefix), asString(content.formNameLabel),
        asString(content.formCompanyLabel), asString(content.formEmailLabel), asString(content.formMessageLabel),
        asString(content.submitButtonLabel), asString(content.submittingButtonLabel), asString(content.emailAddress),
        asString(content.phoneNumber), asString(content.officeAddress), asString(content.workingHours), asString(content.mapPinLabel),
        asString(content.infoEmailLabel), asString(content.infoPhoneLabel), asString(content.infoAddressLabel),
        asString(content.infoHoursLabel), asString(content.socialSectionTitle), asString(content.telegramUrl),
        asString(content.instagramUrl), asString(content.whatsappUrl), asString(content.facebookUrl),
        asString(content.headquartersImage), asString(content.googleMapsUrl),
      );
      return res.json({ success: true });
    }

    if (pageId in pageContentTables) {
      writeContentTable(pageId as keyof typeof pageContentTables, content);
      return res.json({ success: true });
    }

    return res.status(404).json({ error: "Page template not found" });
  } catch (error) {
    console.error("Page update error:", error);
    res.status(500).json({ error: "Update failed" });
  }
});

app.get("/api/leads", (_req, res) => {
  try {
    const rows = db.prepare("SELECT * FROM leads ORDER BY date DESC").all() as any[];
    res.json(rows.map((row) => ({
      id: asString(row.id),
      date: asString(row.date),
      name: asString(row.name),
      company: asString(row.company),
      email: asString(row.email),
      phone: asString(row.phone),
      telegram: asString(row.telegram),
      productInterest: asString(row.product_interest),
      estTonnage: asString(row.est_tonnage),
      status: asString(row.status, "New"),
      message: asString(row.message),
      notes: asString(row.notes),
    })));
  } catch (error) {
    console.error("Leads fetch error:", error);
    res.status(500).json({ error: "Failed to fetch leads" });
  }
});

app.post("/api/leads", (req, res) => {
  try {
    const payload = req.body ?? {};
    const email = asString(payload.email).trim();
    if (!email) return res.status(400).json({ error: "Email is required" });
    const id = createLeadId();
    db.prepare(`
      INSERT INTO leads (
        id, date, name, company, email, phone, telegram, product_interest, est_tonnage, status, message, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, new Date().toISOString(), asString(payload.name), asString(payload.company), email,
      asString(payload.phone), asString(payload.telegram), asString(payload.productInterest, "General Inquiry"),
      asString(payload.estTonnage), "New", asString(payload.message), "",
    );
    res.status(201).json({ success: true, id });
  } catch (error) {
    console.error("Lead create error:", error);
    res.status(500).json({ error: "Failed to submit inquiry" });
  }
});

app.post("/api/leads/:id", (req, res) => {
  try {
    const status = asString(req.body?.status, "New") as LeadStatus;
    if (!validLeadStatuses.has(status)) return res.status(400).json({ error: "Invalid lead status" });
    db.prepare("UPDATE leads SET status = ?, notes = ? WHERE id = ?").run(status, asString(req.body?.notes), asString(req.params.id));
    res.json({ success: true });
  } catch (error) {
    console.error("Lead update error:", error);
    res.status(500).json({ error: "Failed to update lead" });
  }
});

app.post("/api/upload", upload.single("file"), async (req, res) => {
  try {
    const uploadedFile = (req as any).file as
      | {
        originalname: string;
        buffer: Buffer;
      }
      | undefined;
    if (!uploadedFile) return res.status(400).json({ error: "No file uploaded" });

    const baseName = sanitizeUploadBaseName(uploadedFile.originalname);
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${baseName}.webp`;
    const outputPath = path.join(uploadsDir, filename);

    await sharp(uploadedFile.buffer)
      .rotate()
      .resize({ width: 2400, height: 2400, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82, effort: 6 })
      .toFile(outputPath);

    res.json({ url: `/uploads/${filename}` });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Upload failed on server" });
  }
});

app.post("/api/media/delete", (req, res) => {
  try {
    const url = asString(req.body?.url);
    if (!url) return res.status(400).json({ error: "No URL provided" });
    const filePath = path.join(uploadsDir, url.replace(/^\/uploads\//, ""));
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    res.json({ success: true });
  } catch (error) {
    console.error("Media delete error:", error);
    res.status(500).json({ error: "Failed to delete from disk" });
  }
});

app.get("/robots.txt", (req, res) => {
  res.type("text/plain").send(`User-agent: *\nAllow: /\nDisallow: /admin\nSitemap: ${getOrigin(req)}/sitemap.xml\n`);
});

app.get("/sitemap.xml", (req, res) => {
  try {
    const origin = getOrigin(req);
    const pageSeo = getPageSeo();
    const staticUrls = (Object.keys(defaultPageSeo) as PageId[])
      .map((pageId) => `${origin}${getManagedPagePath(pageId, pageSeo) === "/" ? "" : getManagedPagePath(pageId, pageSeo)}`);
    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${staticUrls.map((url) => `<url><loc>${escapeHtml(url)}</loc></url>`).join("\n")}\n</urlset>`;
    res.type("application/xml").send(xml);
  } catch (error) {
    console.error("Sitemap generation error:", error);
    res.status(500).send("Failed to generate sitemap");
  }
});

if (fs.existsSync(distDir)) {
  app.use(express.static(distDir, { index: false }));

  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api") || req.path.startsWith("/uploads")) return next();

    try {
      const meta = buildSeoMeta(req);
      if (meta.redirectTo) {
        return res.redirect(301, meta.redirectTo);
      }
      const html = renderHtmlWithSeo(getIndexTemplate(), meta);
      res.status(meta.statusCode).send(html);
    } catch (error) {
      console.error("HTML render error:", error);
      res.status(500).send("Failed to render application shell");
    }
  });
}

const port = Number(process.env.PORT || 3001);
app.listen(port, () => {
  console.log(`Backend server running on http://localhost:${port}`);
});
