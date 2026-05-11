const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");
require("dotenv").config();

// Free Google Translate API
async function translateText(text, targetLang) {
  if (!text || typeof text !== "string") return text;
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
  try {
    const res = await fetch(url);
    const json = await res.json();
    let translated = "";
    if (json && json[0]) {
      for (const segment of json[0]) {
        if (segment[0]) translated += segment[0];
      }
    }
    return translated || text;
  } catch (err) {
    console.error(`Translation failed for: ${text.substring(0, 20)}...`, err.message);
    return text;
  }
}

// Recursively translate object values
async function translateObject(obj, targetLang) {
  if (typeof obj === "string") {
    return await translateText(obj, targetLang);
  }
  if (Array.isArray(obj)) {
    return await Promise.all(obj.map((item) => translateObject(item, targetLang)));
  }
  if (typeof obj === "object" && obj !== null) {
    const newObj = {};
    for (const [key, val] of Object.entries(obj)) {
      if (key === "id" || key === "key" || key === "url" || key === "image" || key === "categoryKey") {
        newObj[key] = val; // don't translate IDs, URLs, or Category Keys
      } else {
        newObj[key] = await translateObject(val, targetLang);
      }
    }
    return newObj;
  }
  return obj;
}

const LANGUAGES = ["pt", "es", "nl", "fr"];

// Default English Content Objects for Pre-population
const DEFAULT_GLOBAL_SETTINGS = {
  site_name: "HQ Dried Fruits",
  nav_links: JSON.stringify([{ label: "Home", url: "/" }, { label: "About", url: "/about" }, { label: "Products", url: "/products" }, { label: "Export", url: "/export" }, { label: "Contacts", url: "/contacts" }]),
  cta_text: "Get Quote",
  cta_url: "/contacts",
  footer_description: "Quality sun-dried fruits from the heart of Uzbekistan. Exporting nature's sweetness to global B2B partners with uncompromising quality.",
  footer_lead_text: "Get our latest pricing and export terms directly to your inbox or Telegram.",
  quick_links: JSON.stringify([{ label: "About Us", url: "/about" }, { label: "Export", url: "/export" }, { label: "Contacts", url: "/contacts" }]),
  office_address: "Amir Temur Ave 107B, Tashkent, Uzbekistan",
  phone_number: "+998 90 123 45 67",
  email_address: "export@hqdriedfruits.com",
  footer_cta_title: "Need a custom container quote?",
  footer_cta_email: "export@hqdriedfruits.com",
  footer_copyright_text: "HQ Dried Fruits. All rights reserved.",
  ui_labels: JSON.stringify({
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
    requestCatalogLabel: "Request Wholesale Catalog",
    exploreProductsLabel: "Explore Products",
    heritageSloganLabel: "Decades of expertise in every harvest.",
    aboutCompanyLabel: "About The Company",
    statYearsLabel: "Years Experience",
    statTonsLabel: "Tons Exported",
    productSelectionSublabel: "Hand-picked and naturally sun-dried.",
    viewFullCatalogLabel: "View Full Catalog",
    requestSampleLabel: "Request Sample",
    productCardViewSpecsLabel: "View Specifications",
    requestQuoteBtn: "Request Wholesale Quote",
    learnMoreLabel: "Learn About Our Export Process",
    getPricingLabel: "Get Pricing & Samples",
    heritageStat1Title: "The First Harvest",
    heritageStat1Desc: "Started as a small family orchard in the Fergana Valley.",
    heritageStat2Title: "Scaling Operations",
    heritageStat2Desc: "Introduced modern sun-drying techniques.",
    heritageStat3Title: "Going Global",
    heritageStat3Desc: "Achieved international organic certifications.",
    heritageStat4Title: "Modern Logistics",
    heritageStat4Desc: "State-of-the-art logistics hub in Tashkent.",
    prodStep1Title: "Raw Intake",
    prodStep1Subtitle: "Harvest Selection",
    prodStep1Desc: "Incoming fruit is sorted by batch, moisture profile, and destination requirements before processing begins.",
    prodStep2Title: "Processing",
    prodStep2Subtitle: "Laser & X-Ray Control",
    prodStep2Desc: "Each production line is calibrated for purity, defect removal, and export-grade consistency across volume orders.",
    prodStep3Title: "Packaging",
    prodStep3Subtitle: "Buyer-Specific Formats",
    prodStep3Desc: "We pack for retail, private label, and industrial shipments with the same in-house quality checks before dispatch.",
    prodStep4Title: "Dispatch",
    prodStep4Subtitle: "Export Handover",
    prodStep4Desc: "Finished cargo is documented, palletized, and scheduled for the route that best fits the buyer’s timeline and market.",
    missionPurposeLabel: "Purpose",
    missionHeritageLabel: "Heritage",
    missionPhilosophyLabel: "Philosophy",
    missionStandardsLabel: "Standards",
    orchardPhilosophyLabel: "Orchard Philosophy",
    whoWeAreFallback1: "Deeply embedded in the agricultural heart of Central Asia, HQ Dried Fruits brings orchard control, processing discipline, and export execution into one operating system.",
    whoWeAreFallback2: "That structure helps wholesale buyers secure consistent product, clearer documentation, and repeatable shipment preparation across seasons.",
    missionNarrativeEyebrow: "Mission Narrative",
    missionNarrativeTitle: "What guides the way we grow, process, and deliver",
    missionNarrativeSublabel: "A clearer look at the company mission, heritage, philosophy, and standards, shaped into one visual section.",
    insideFacilityEyebrow: "Inside The Facility",
    haccpLabel: "HACCP Certified",
    isoLabel: "ISO 9001:2015",
    organicLabel: "100% Organic",
    globalGapLabel: "GlobalGap",
    fdaLabel: "FDA Registered",
    exportOpsEyebrow: "Export Operations",
    exportOpsTitle: "Built for Buyer-Specific Routing, Documentation, and Packing",
    logisticsDesc1: "We handle end-to-end multi-modal transport routing around buyer requirements, from packing format and paperwork to the most efficient lane for delivery.",
    logisticsDesc2: "Each shipment is structured around repeatability, destination compliance, and wholesale practicality so importers can move with less friction from order to warehouse receipt.",
    packagingTitle: "Custom Packaging",
    packagingDesc: "Bulk cartons, vacuum-sealed bags, or retail-ready packaging customized with your brand labels.",
    transportationTitle: "Ocean & Rail Freight",
    transportationDesc: "Cost-effective FCL (Full Container Load) and LCL shipments via major ports and the trans-Eurasian rail network.",
    documentationTitle: "Customs Clearance",
    documentationDesc: "Full documentation support including phytosanitary certificates, certificates of origin, and EUR.1.",
    destinationBreakdownEyebrow: "Destination Breakdown",
    destinationBreakdownTitle: "How each destination lane is prepared before dispatch",
    destinationBreakdownDesc: "Export planning changes by market. Select a destination to preview the lane focus, the route context, and how we position packing and documentation around buyer expectations.",
    qualityGuaranteeTitle: "The Quality Guarantee",
    qualityGuaranteeDesc: "Our processing facilities utilize advanced laser sorting and X-ray inspection to guarantee 99.9% purity.",
    moistureControlLabel: "Moisture Control",
    moistureControlDesc: "Strictly maintained at 18-22% for optimal shelf life.",
    sizeCalibrationLabel: "Size Calibration",
    sizeCalibrationDesc: "Laser-graded for uniform sizing (Jumbo, Large, Medium).",
    microSafeLabel: "Microbiological Safety",
    microSafeDesc: "Regular lab testing for aflatoxins and heavy metals.",
    qualitySealLabel: "Product Quality Seal",
    contactsTitle: "Let's Connect",
    contactsIntroFallback: "Whether you need a custom quote, a sample box, or logistics details, our export team is ready to assist you.",
    sendInquiryTitle: "Send an Inquiry",
    formNameLabel: "Full Name",
    formEmailLabel: "Work Email",
    formPhoneLabel: "Phone Number",
    formMessageLabel: "Message",
    formCompanyLabel: "Company",
    submitBtnLabel: "Send Inquiry",
    submittingLabel: "Sending...",
    sendMessageLabel: "Send Message",
    inquirySuccessMsg: "Inquiry received. The export team will contact you shortly.",
    inquiryFailureMsg: "Submission failed. Please try again.",
    directContactEyebrow: "Direct Contact",
    contactDetailsTitle: "Contact Details",
    contactDetailsDesc: "Reach our sales and export coordination team through the fastest channel for your request.",
    emailLabel: "Email",
    phoneLabel: "Phone",
    headquartersLabel: "Headquarters",
    workingHoursLabel: "Working Hours",
    homeCategoryEyebrowVisible: true,
    homeCategoryBadgesVisible: true,
    homeCategoryTypesVisible: true,
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
    productsTitle: "Wholesale Catalog",
    productsSubtitle: "Explore our export-ready collection.",
    overviewLabel: "Overview",
    originLabel: "Origin",
    benefitsLabel: "Benefits",
    exportLabel: "Export",
    orderingFormStepLabel: "Step",
    privacyTitle: "Privacy Policy",
    termsTitle: "Terms of Service"
  })
};

const DEFAULT_PRODUCTS_PAGE = {
  page_title: "Wholesale Dried Fruits from Uzbekistan",
  page_subtitle: "Explore export-ready apricots, raisins, prunes, and mixed assortments with buyer-focused origin, processing, and application details in one catalog.",
  intro_eyebrow: "Uzbekistan Origin",
  intro_title: "One Page. Four Core Product Lines. Real Buyer Context.",
  intro_content: "<p>Compare origin, processing, specifications, packing, and use cases without jumping between separate catalog pages.</p><p>Each product profile is structured for wholesale buyers who need practical sourcing information, not only marketing copy.</p>",
  intro_facts: JSON.stringify([
    { title: "Orchard Base", description: "Fruit-growing zones in Uzbekistan rely on irrigated valley and foothill production systems rather than rain-fed uncertainty." },
    { title: "Growing Conditions", description: "Hot, dry summers and sunlight help apricots, grapes, and plums build sugar." },
    { title: "Export Readiness", description: "Every line is positioned for buyer-specific cartons and repeat wholesale programs." },
  ]),
  catalog_eyebrow: "Filter by category",
  catalog_title: "Product Catalog",
  ordering_form_title: "Wholesale Inquiry",
  ordering_form_subtitle: "Share your target volume and timeline. We will respond with pricing and logistics details.",
  step_one_label: "Which product are you interested in?",
  step_two_label: "Estimated Monthly Volume?",
  step_three_label: "Where should we send the quote?",
  mixed_container_label: "Mixed Container",
  volume_options: JSON.stringify(["1-5 Tons", "5-20 Tons", "1 FCL (20ft)", "Multiple FCLs"]),
  view_specs_label: "View Specifications",
  step_one_placeholder: "Select a product...",
  step_three_placeholder: "Work Email Address",
  next_step_button_label: "Next Step",
  back_button_label: "Back",
  submit_button_label: "Get Instant Quote",
  submitting_button_label: "Sending...",
  detail_ui: JSON.stringify({ loadingLabel: "Loading Specifications...", notFoundTitle: "Product Not Found", notFoundBody: "The product you're looking for doesn't exist.", backToCatalogLabel: "Back to Catalog", nutritionTitle: "Product Information", nutritionPerLabel: "", caloriesLabel: "Field 1", proteinLabel: "Field 2", fatLabel: "Field 3", carbsLabel: "Field 4", inquiryTitle: "Request a Sample or Quote", companyPlaceholder: "Company Name", emailPlaceholder: "Work Email", volumePlaceholder: "Leave a message...", inquiryButtonLabel: "Send Inquiry", inquirySubmittingLabel: "Sending Inquiry..." }),
  quick_contact_title: "Need it faster?",
  quick_contact_subtitle: "Skip the form. Connect with our export sales team directly for immediate assistance.",
  telegram_label: "Telegram Bot",
  telegram_sublabel: "Instant quotes & catalog PDF",
  call_label: "Call Sales",
  email_label: "Email Us",
  quick_phone: "+998 90 123 45 67",
  quick_email: "sales@hqdriedfruits.com",
};

const DEFAULT_EXPORT_PAGE = {
  hero_title: "Our Global Export Network",
  hero_subtitle: "Seamless global logistics from the heart of the Silk Road to your warehouse.",
  operations_eyebrow: "Export Operations",
  destination_eyebrow: "Buyer Channels",
  map_section_title: "Prepared for the way your business sells",
  supply_routes: JSON.stringify([]),
  logistics_content: "<p>End-to-end multi-modal transport routing.</p>",
  packaging_title: "Custom Packaging",
  packaging_methods: "<p>Bulk cartons, vacuum-sealed bags, or retail-ready packaging customized with your brand labels.</p>",
  transportation_title: "Ocean & Rail Freight",
  transportation_methods: "<p>Cost-effective FCL (Full Container Load) and LCL shipments via major ports and the trans-Eurasian rail network.</p>",
  documentation_title: "Customs Clearance",
  documentation_content: "<p>Full documentation support including phytosanitary certificates, certificates of origin, and EUR.1.</p>",
  quality_title: "The Quality Guarantee",
  technical_specs: "<p>X-Ray and Laser sorting guarantee removal of stones, stems, and defects.</p>",
  quality_checks: JSON.stringify([{ title: "Moisture Control", description: "Strictly maintained at 18-22% for optimal shelf life." }, { title: "Size Calibration", description: "Laser-graded for uniform sizing (Jumbo, Large, Medium)." }, { title: "Microbiological Safety", description: "Regular lab testing for aflatoxins and heavy metals." }]),
  certifications_gallery: JSON.stringify([]),
};

const DEFAULT_CONTACTS_PAGE = {
  page_title: "Let's Connect",
  intro_text: "Whether you need a mixed container or a dedicated harvest line, our B2B team is available 24/7.",
  direct_contact_eyebrow: "Direct Contact",
  form_destination_email: "sales@hqdriedfruits.com",
  contact_form_title: "Send an Inquiry",
  response_label_prefix: "Replies are monitored at",
  form_name_label: "Full Name",
  form_company_label: "Company",
  form_email_label: "Work Email",
  form_message_label: "Message",
  submit_button_label: "Send Message",
  submitting_button_label: "Sending...",
  email: "sales@hqdriedfruits.com",
  phone: "+998 90 123 45 67",
  office_address: "Amir Temur Ave 107B",
  working_hours: "Mon-Sat: 09:00 - 18:00 (Tashkent Time)",
  map_pin_label: "HQ Dried Fruits HQ",
  info_email_label: "Email",
  info_phone_label: "Phone",
  info_address_label: "Headquarters",
  info_hours_label: "Working Hours",
  social_section_title: "Social Media",
  telegram_url: "",
  instagram_url: "",
  whatsapp_url: "",
  facebook_url: "",
  headquarters_image: "",
  google_maps_url: "",
};

const DEFAULT_PAGE_SEO = [
  { page_id: "home", meta_title: "HQ Dried Fruits | High-Quality Organic Export", meta_description: "Quality sun-dried fruits from the heart of Uzbekistan.", slug: "", og_title: "HQ Dried Fruits", image_alt: "Sun-dried apricots from Uzbekistan" },
  { page_id: "about", meta_title: "About HQ Dried Fruits | Our Heritage & Mission", meta_description: "Decades of expertise in every harvest.", slug: "about", og_title: "About HQ Dried Fruits", image_alt: "Sorting facility in Uzbekistan" },
  { page_id: "products", meta_title: "Wholesale Dried Apricots, Raisins, Prunes | HQ Dried Fruits", meta_description: "Source Uzbekistan dried apricots, raisins, and prunes.", slug: "products", og_title: "HQ Dried Fruits Product Catalog", image_alt: "Assorted dried fruits" },
  { page_id: "export", meta_title: "Global Logistics & Export | HQ Dried Fruits", meta_description: "Seamless global logistics from the heart of the Silk Road to your warehouse.", slug: "export", og_title: "HQ Dried Fruits Export", image_alt: "Global supply map" },
  { page_id: "contacts", meta_title: "Contact HQ Dried Fruits | Wholesale Inquiries", meta_description: "Get our latest wholesale pricing, request a sample box, or discuss logistics with our export team.", slug: "contacts", og_title: "Contact HQ Dried Fruits", image_alt: "HQ Dried Fruits Headquarters Map" },
  { page_id: "privacy", meta_title: "Privacy Policy | HQ Dried Fruits", meta_description: "Privacy policy for HQ Dried Fruits.", slug: "privacy", og_title: "Privacy Policy | HQ Dried Fruits", image_alt: "Privacy Policy" },
  { page_id: "terms", meta_title: "Terms of Service | HQ Dried Fruits", meta_description: "Terms of service for HQ Dried Fruits.", slug: "terms", og_title: "Terms of Service | HQ Dried Fruits", image_alt: "Terms of Service" },
];

const DEFAULT_HOME_PAGE_CONTENT = {
  heroTitle: "Sun-dried sweetness, perfected by nature.",
  heroSubtitle: "Premium dried fruits from Uzbekistan. Exporting organic apricots, raisins, and prunes to global markets.",
  heroPrimaryCtaLabel: "Request Catalog",
  heroSecondaryCtaLabel: "Products",
  introLabel: "Uzbekistan Sourcing",
  introText: "Our climate enables natural sun-drying without additives.",
  productPreviewTitle: "Product Lines",
  productPreviewButtonLabel: "View Full Catalog",
  productPreviewItemCtaLabel: "View in Catalog",
  productPreviewCategoryLabel: "Product Category",
  productPreviewTypesLabel: "Types",
  ctaHeading: "Ready to order?",
  ctaSubheading: "Get pricing details and samples.",
  ctaButtonText: "Get Pricing",
  productCategories: [
    { categoryKey: "raisins", categoryName: "Raisins", image: "/uploads/category-raisins.png", shortDescription: "Export-ready raisin lines across golden, brown, and dark varieties for wholesale buyers.", variantSummary: "Golden, Sultana, Soyaki, Black-Red", url: "/products" },
    { categoryKey: "dried-apricot", categoryName: "Dried Apricot", image: "/uploads/category-apricots.png", shortDescription: "Sun-dried apricot categories prepared for retail, confectionery, and mixed container orders.", variantSummary: "Subhana, Subhana confectioner", url: "/products" },
    { categoryKey: "prunes", categoryName: "Prunes", image: "/uploads/category-prunes.png", shortDescription: "Calibrated prune selections with pitted and unpitted supply options for export programs.", variantSummary: "Spanish Prunes, Hungarian Unpitted, Ashlock", url: "/products" },
    { categoryKey: "peanuts", categoryName: "Peanuts", image: "/uploads/category-peanuts.png", shortDescription: "Sorted peanut supply for food production, trading, and feed-related buyer requirements.", variantSummary: "In shell, Unshelled, Bird Feed", url: "/products" }
  ]
};

const DEFAULT_ABOUT_PAGE_CONTENT = {
  marqueeTitle: "Global Partners & Processing Facilities",
  heritageSubtitle: "Orchards, standards, and our operations infrastructure.",
  missionTitle: "Our Mission",
  missionStatement: "<p>Combining traditional sun-drying with strict modern safety standards.</p>",
  philosophyTitle: "Heritage & Philosophy",
  whoWeAreContent: "<p>HQ Dried Fruits guarantees stable, premium supplies for wholesale buyers.</p>",
  orchardPhilosophy: "Sustainable cultivation meets modern logistics efficiency.",
  productionStandardsTitle: "Production Standards",
  productionStandards: "Facilities certified under ISO 22000, HACCP, and Organic.",
};

const DEFAULT_PRIVACY_CONTENT = {
  title: "Privacy Policy",
  body: "<p>We use the information submitted through this website to respond to wholesale inquiries, prepare quotes, and manage customer communication.</p>",
};

const DEFAULT_TERMS_CONTENT = {
  title: "Terms of Service",
  body: "<p>Information on this site is provided for wholesale inquiry and quotation purposes.</p>",
};

// 12 Premium Products requested by USER
const DEFAULT_PRODUCTS = [
  {
    id: "soyaki",
    name: "Soyaki",
    category_key: "raisins",
    category: "Raisins",
    status: "published",
    image: "https://images.unsplash.com/photo-1596591606975-97ee5cef3a1e?q=80&w=1400",
    image_gallery: JSON.stringify(["https://images.unsplash.com/photo-1596591606975-97ee5cef3a1e?q=80&w=1400"]),
    short_description: "Uzbekistan's signature black raisin — sun-dried, sulfur-free, available in four calibers.",
    long_description: "<p>Uzbekistan's signature black raisin. Naturally sun-dried, completely sulfur-free, and available in four calibers to suit premium retail and industrial needs.</p>",
    highlights: JSON.stringify(["100% Natural & Organic", "No Added Sugars"]),
    content_sections: JSON.stringify([{ title: "Origin", body: "<p>Harvested from selected Fergana Valley vineyards, sun-dried without chemical additives.</p>" }]),
    nutrition: JSON.stringify({ energy: "299 kcal", protein: "3.1 g", fat: "0.5 g", carbs: "79 g" }),
    inquiry_subject_line: "Wholesale inquiry: Soyaki Raisins",
    tonnage_options: JSON.stringify(["1-5 Tons", "5-20 Tons", "1 FCL (20ft)", "Multiple FCLs"]),
    seo: JSON.stringify({ metaTitle: "Wholesale Soyaki Raisins from Uzbekistan | HQ Dried Fruits", metaDescription: "Source signature Uzbek Soyaki black raisins. Sun-dried, sulfur-free, premium grade.", slug: "soyaki" }),
    display_order: 1,
    technical_passport: null
  },
  {
    id: "sultana",
    name: "Sultana",
    category_key: "raisins",
    category: "Raisins",
    status: "published",
    image: "https://images.unsplash.com/photo-1511250325439-012b18f03c00?q=80&w=1400",
    image_gallery: JSON.stringify(["https://images.unsplash.com/photo-1511250325439-012b18f03c00?q=80&w=1400"]),
    short_description: "The backbone of bakery supply. Clean, consistent, calibrated for scale.",
    long_description: "<p>The backbone of commercial baking and confectionery supply. Our Sultanas are cleaned, calibrated, and consistent across high-volume container shipments.</p>",
    highlights: JSON.stringify(["100% Natural & Organic", "No Added Sugars"]),
    content_sections: JSON.stringify([{ title: "Use Case", body: "<p>Ideal for commercial bakeries, muesli production, and bulk distribution.</p>" }]),
    nutrition: JSON.stringify({ energy: "302 kcal", protein: "2.8 g", fat: "0.4 g", carbs: "80 g" }),
    inquiry_subject_line: "Wholesale inquiry: Sultana Raisins",
    tonnage_options: JSON.stringify(["1-5 Tons", "5-20 Tons", "1 FCL (20ft)", "Multiple FCLs"]),
    seo: JSON.stringify({ metaTitle: "Wholesale Sultana Raisins | HQ Dried Fruits", metaDescription: "Buy consistent, high-grade Uzbek Sultana raisins in bulk. Cleaned and calibrated for baking.", slug: "sultana" }),
    display_order: 2,
    technical_passport: null
  },
  {
    id: "black-red",
    name: "Black-Red",
    category_key: "raisins",
    category: "Raisins",
    status: "published",
    image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?q=80&w=1400",
    image_gallery: JSON.stringify(["https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?q=80&w=1400"]),
    short_description: "The engine of industrial sourcing. Reliable volume, deep color, priced for production.",
    long_description: "<p>The engine of industrial food sourcing. Deep natural color, reliable high volume, and priced competitively for large-scale production programs.</p>",
    highlights: JSON.stringify(["100% Natural & Organic", "No Added Sugars"]),
    content_sections: JSON.stringify([{ title: "Industrial Specs", body: "<p>Priced and packed for industrial processors, bulk packaging, and confectionery manufacturers.</p>" }]),
    nutrition: JSON.stringify({ energy: "295 kcal", protein: "3.0 g", fat: "0.5 g", carbs: "78 g" }),
    inquiry_subject_line: "Wholesale inquiry: Black-Red Raisins",
    tonnage_options: JSON.stringify(["1-5 Tons", "5-20 Tons", "1 FCL (20ft)", "Multiple FCLs"]),
    seo: JSON.stringify({ metaTitle: "Bulk Black-Red Raisins Sourcing | HQ Dried Fruits", metaDescription: "Source reliable volumes of Black-Red raisins for industrial food production.", slug: "black-red" }),
    display_order: 3,
    technical_passport: null
  },
  {
    id: "golden",
    name: "Golden",
    category_key: "raisins",
    category: "Raisins",
    status: "published",
    image: "https://images.unsplash.com/photo-1628102476695-8d41341c24a2?q=80&w=1400",
    image_gallery: JSON.stringify(["https://images.unsplash.com/photo-1628102476695-8d41341c24a2?q=80&w=1400"]),
    short_description: "Sun-kissed and naturally sweet. The bright choice for premium retail and confectionery.",
    long_description: "<p>Sun-kissed and naturally sweet. Offering a bright, golden color that makes it the choice of premium retail brands and high-end confectionery lines.</p>",
    highlights: JSON.stringify(["100% Natural & Organic", "No Added Sugars"]),
    content_sections: JSON.stringify([{ title: "Visual Quality", body: "<p>Carefully sorted for uniform golden color and size to ensure a premium shelf presentation.</p>" }]),
    nutrition: JSON.stringify({ energy: "305 kcal", protein: "2.9 g", fat: "0.4 g", carbs: "81 g" }),
    inquiry_subject_line: "Wholesale inquiry: Golden Raisins",
    tonnage_options: JSON.stringify(["1-5 Tons", "5-20 Tons", "1 FCL (20ft)", "Multiple FCLs"]),
    seo: JSON.stringify({ metaTitle: "Premium Golden Raisins Wholesale | HQ Dried Fruits", metaDescription: "Buy golden sun-dried raisins from Uzbekistan. Sorted for bright uniform color and premium retail.", slug: "golden" }),
    display_order: 4,
    technical_passport: null
  },
  {
    id: "subhana",
    name: "Subhana",
    category_key: "dried-apricot",
    category: "Dried Apricot",
    status: "published",
    image: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?q=80&w=1400",
    image_gallery: JSON.stringify(["https://images.unsplash.com/photo-1596422846543-75c6fc197f07?q=80&w=1400"]),
    short_description: "Soft, golden, full of sun. Available in premium and confectionery grades.",
    long_description: "<p>Soft, golden, and packed with traditional sweetness. Subhana apricots are sun-dried to lock in maximum flavor, available in both premium retail and industrial confectionery grades.</p>",
    highlights: JSON.stringify(["100% Natural & Organic", "No Added Sugars"]),
    content_sections: JSON.stringify([{ title: "Texture", body: "<p>Perfectly balanced moisture (18-22%) ensures a soft, tender bite and long shelf life.</p>" }]),
    nutrition: JSON.stringify({ energy: "280 kcal", protein: "2.5 g", fat: "0.4 g", carbs: "72 g" }),
    inquiry_subject_line: "Wholesale inquiry: Subhana Apricots",
    tonnage_options: JSON.stringify(["1-5 Tons", "5-20 Tons", "1 FCL (20ft)", "Multiple FCLs"]),
    seo: JSON.stringify({ metaTitle: "Subhana Dried Apricots Wholesale | HQ Dried Fruits", metaDescription: "Source premium Subhana sun-dried apricots from Uzbekistan. Calibrated and moisture-controlled.", slug: "subhana" }),
    display_order: 5,
    technical_passport: null
  },
  {
    id: "subhana-confectioner",
    name: "Subhana confectioner",
    category_key: "dried-apricot",
    category: "Dried Apricot",
    status: "published",
    image: "https://images.unsplash.com/photo-1508747703725-719777637510?q=80&w=1400",
    image_gallery: JSON.stringify(["https://images.unsplash.com/photo-1508747703725-719777637510?q=80&w=1400"]),
    short_description: "Small in form, big in flavor. The pastry chef's go-to apricot for jams, fillings, and confectionery blends.",
    long_description: "<p>Small in form but packed with intense, natural apricot flavor. The pastry chef's go-to ingredient line for jams, bakery fillings, and confectionery blends.</p>",
    highlights: JSON.stringify(["100% Natural & Organic", "No Added Sugars"]),
    content_sections: JSON.stringify([{ title: "Confectionery Grade", body: "<p>Excellent for industrial cooking, pureeing, chopping, and bakery incorporation.</p>" }]),
    nutrition: JSON.stringify({ energy: "275 kcal", protein: "2.4 g", fat: "0.4 g", carbs: "70 g" }),
    inquiry_subject_line: "Wholesale inquiry: Subhana Confectioner Apricots",
    tonnage_options: JSON.stringify(["1-5 Tons", "5-20 Tons", "1 FCL (20ft)", "Multiple FCLs"]),
    seo: JSON.stringify({ metaTitle: "Subhana Confectioner Apricots Bulk | HQ Dried Fruits", metaDescription: "Buy confectionery-grade Uzbek Subhana apricots for jams, bakery fillings, and commercial recipes.", slug: "subhana-confectioner" }),
    display_order: 6,
    technical_passport: null
  },
  {
    id: "hungarian-unpitted",
    name: "Hungarian Unpitted",
    category_key: "prunes",
    category: "Prunes",
    status: "published",
    image: "https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?q=80&w=1400",
    image_gallery: JSON.stringify(["https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?q=80&w=1400"]),
    short_description: "Whole, natural, nothing removed. A prune the way it was meant to be — rich, tender, and full of depth.",
    long_description: "<p>Whole, natural, and completely unpitted. Prepared exactly how nature intended — rich, tender, deeply sweet, and full of depth for gourmet and wholesale markets.</p>",
    highlights: JSON.stringify(["100% Natural & Organic", "No Added Sugars"]),
    content_sections: JSON.stringify([{ title: "Traditional Quality", body: "<p>Grown in traditional orchards, naturally sun-dried to protect the full integrity of the plum.</p>" }]),
    nutrition: JSON.stringify({ energy: "240 kcal", protein: "2.2 g", fat: "0.4 g", carbs: "64 g" }),
    inquiry_subject_line: "Wholesale inquiry: Hungarian Unpitted Prunes",
    tonnage_options: JSON.stringify(["1-5 Tons", "5-20 Tons", "1 FCL (20ft)", "Multiple FCLs"]),
    seo: JSON.stringify({ metaTitle: "Hungarian Unpitted Prunes Wholesale | HQ Dried Fruits", metaDescription: "Buy traditional Hungarian unpitted prunes. Soft, tender, rich flavor.", slug: "hungarian-unpitted" }),
    display_order: 7,
    technical_passport: null
  },
  {
    id: "spanish-prunes",
    name: "Spanish Prunes",
    category_key: "prunes",
    category: "Prunes",
    status: "published",
    image: "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?q=80&w=1400",
    image_gallery: JSON.stringify(["https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?q=80&w=1400"]),
    short_description: "Firm, meaty, deeply sweet. Built for premium retail and gourmet applications.",
    long_description: "<p>Firm, meaty, and deeply sweet. Our Spanish prunes are prepared specifically for premium retail branding, snack packers, and gourmet applications.</p>",
    highlights: JSON.stringify(["100% Natural & Organic", "No Added Sugars"]),
    content_sections: JSON.stringify([{ title: "Gourmet Style", body: "<p>Firm texture that holds up well in retail pouches, gourmet snack mixes, and pantry packs.</p>" }]),
    nutrition: JSON.stringify({ energy: "245 kcal", protein: "2.3 g", fat: "0.3 g", carbs: "65 g" }),
    inquiry_subject_line: "Wholesale inquiry: Spanish Prunes",
    tonnage_options: JSON.stringify(["1-5 Tons", "5-20 Tons", "1 FCL (20ft)", "Multiple FCLs"]),
    seo: JSON.stringify({ metaTitle: "Spanish Prunes Bulk Supply | HQ Dried Fruits", metaDescription: "Source premium Spanish prunes. Firm, deeply sweet, perfect for retail packs.", slug: "spanish-prunes" }),
    display_order: 8,
    technical_passport: null
  },
  {
    id: "ashlock",
    name: "Ashlock",
    category_key: "prunes",
    category: "Prunes",
    status: "published",
    image: "https://images.unsplash.com/photo-1595124253363-c594628ec968?q=80&w=1400",
    image_gallery: JSON.stringify(["https://images.unsplash.com/photo-1595124253363-c594628ec968?q=80&w=1400"]),
    short_description: "Small size, serious purpose. The high-volume prune built for food processing and ingredient programs.",
    long_description: "<p>Small size, serious purpose. Calibrated Ashlock prunes are prepared in high volume, perfect for food processing, bakery ingredients, and bulk wholesale programs.</p>",
    highlights: JSON.stringify(["100% Natural & Organic", "No Added Sugars"]),
    content_sections: JSON.stringify([{ title: "Processing Focus", body: "<p>Cleaned, pitted, and sized for optimal processing in automated food manufacturing lines.</p>" }]),
    nutrition: JSON.stringify({ energy: "238 kcal", protein: "2.1 g", fat: "0.4 g", carbs: "63 g" }),
    inquiry_subject_line: "Wholesale inquiry: Ashlock Prunes",
    tonnage_options: JSON.stringify(["1-5 Tons", "5-20 Tons", "1 FCL (20ft)", "Multiple FCLs"]),
    seo: JSON.stringify({ metaTitle: "Ashlock Pitted Prunes Wholesale | HQ Dried Fruits", metaDescription: "Buy Ashlock pitted prunes in bulk. Calibrated and prepared for food processors.", slug: "ashlock" }),
    display_order: 9,
    technical_passport: null
  },
  {
    id: "in-shell-peanuts",
    name: "In-shell Peanuts",
    category_key: "peanuts",
    category: "Peanuts",
    status: "published",
    image: "https://images.unsplash.com/photo-1567894340315-735d7c361db0?q=80&w=1400",
    image_gallery: JSON.stringify(["https://images.unsplash.com/photo-1567894340315-735d7c361db0?q=80&w=1400"]),
    short_description: "Crunchy, natural, straight from the harvest. Sorted and ready for retail, roasting, or bird feed programs.",
    long_description: "<p>Crunchy, earthy, and straight from the fields. Carefully sorted to remove empty shells and debris, ready for retail snack roasting, wholesale distribution, or pet feed programs.</p>",
    highlights: JSON.stringify(["100% Natural & Organic", "No Added Sugars"]),
    content_sections: JSON.stringify([{ title: "Harvest", body: "<p>Cleaned and dried in modern facilities to ensure shell strength and seed health.</p>" }]),
    nutrition: JSON.stringify({ energy: "567 kcal", protein: "25.8 g", fat: "49.2 g", carbs: "16.1 g" }),
    inquiry_subject_line: "Wholesale inquiry: In-shell Peanuts",
    tonnage_options: JSON.stringify(["1-5 Tons", "5-20 Tons", "1 FCL (20ft)", "Multiple FCLs"]),
    seo: JSON.stringify({ metaTitle: "In-shell Peanuts Bulk | HQ Dried Fruits", metaDescription: "Buy unshelled in-shell peanuts. Sorted, clean, perfect for roasting.", slug: "in-shell-peanuts" }),
    display_order: 10,
    technical_passport: null
  },
  {
    id: "shelled-peanuts",
    name: "Shelled Peanuts",
    category_key: "peanuts",
    category: "Peanuts",
    status: "published",
    image: "https://images.unsplash.com/photo-1527324688151-0e627063f2b1?q=80&w=1400",
    image_gallery: JSON.stringify(["https://images.unsplash.com/photo-1527324688151-0e627063f2b1?q=80&w=1400"]),
    short_description: "Stripped to the essentials. First choice for snack production and food processing.",
    long_description: "<p>Stripped of the shell, showing uniform, high-quality kernels. The first choice for snack manufacturers, peanut butter makers, and commercial food processors.</p>",
    highlights: JSON.stringify(["100% Natural & Organic", "No Added Sugars"]),
    content_sections: JSON.stringify([{ title: "Grading", body: "<p>Laser-sorted and graded by size to guarantee high kernel purity and uniform roast profiles.</p>" }]),
    nutrition: JSON.stringify({ energy: "585 kcal", protein: "26.2 g", fat: "49.7 g", carbs: "16.4 g" }),
    inquiry_subject_line: "Wholesale inquiry: Shelled Peanuts",
    tonnage_options: JSON.stringify(["1-5 Tons", "5-20 Tons", "1 FCL (20ft)", "Multiple FCLs"]),
    seo: JSON.stringify({ metaTitle: "Shelled Peanuts Wholesale | HQ Dried Fruits", metaDescription: "Source high-purity shelled peanuts for snack production, butter making, and food ingredients.", slug: "shelled-peanuts" }),
    display_order: 11,
    technical_passport: null
  },
  {
    id: "bird-feed",
    name: "Bird Feed",
    category_key: "peanuts",
    category: "Peanuts",
    status: "published",
    image: "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?q=80&w=1400",
    image_gallery: JSON.stringify(["https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?q=80&w=1400"]),
    short_description: "Simple, natural, straight to the point. Quality peanuts redirected where they're needed most.",
    long_description: "<p>Simple, natural, and straight to the point. High-quality wild bird feed grade peanuts, redirected to feed programs and pet brands looking for high-fat, high-protein nut kernels.</p>",
    highlights: JSON.stringify(["100% Natural & Organic", "No Added Sugars"]),
    content_sections: JSON.stringify([{ title: "Feed Grade", body: "<p>Carefully selected feed-grade peanuts suitable for backyard wild bird feeding programs and pet food supply.</p>" }]),
    nutrition: JSON.stringify({ energy: "560 kcal", protein: "25.0 g", fat: "48.5 g", carbs: "16.0 g" }),
    inquiry_subject_line: "Wholesale inquiry: Bird Feed Peanuts",
    tonnage_options: JSON.stringify(["1-5 Tons", "5-20 Tons", "1 FCL (20ft)", "Multiple FCLs"]),
    seo: JSON.stringify({ metaTitle: "Wild Bird Feed Peanuts Bulk | HQ Dried Fruits", metaDescription: "Source reliable feed-grade peanuts in bulk for bird feed and pet food manufacturing.", slug: "bird-feed" }),
    display_order: 12,
    technical_passport: null
  }
];

async function translateDatabase() {
  console.log("--- Translating Database ---");
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
  });

  // Step 1: Pre-populate English rows with standard defaults to ensure they are NOT empty/null
  console.log("Pre-populating baseline English rows...");

  // global_settings
  const setCols = Object.keys(DEFAULT_GLOBAL_SETTINGS).map(col => `${col} = ?`).join(", ");
  const setVals = Object.values(DEFAULT_GLOBAL_SETTINGS);
  await connection.execute(`UPDATE global_settings SET ${setCols} WHERE lang = 'en'`, setVals);

  // products_page
  const prodPageCols = Object.keys(DEFAULT_PRODUCTS_PAGE).map(col => `${col} = ?`).join(", ");
  const prodPageVals = Object.values(DEFAULT_PRODUCTS_PAGE);
  await connection.execute(`UPDATE products_page SET ${prodPageCols} WHERE lang = 'en'`, prodPageVals);

  // export_page
  const expPageCols = Object.keys(DEFAULT_EXPORT_PAGE).map(col => `${col} = ?`).join(", ");
  const expPageVals = Object.values(DEFAULT_EXPORT_PAGE);
  await connection.execute(`UPDATE export_page SET ${expPageCols} WHERE lang = 'en'`, expPageVals);

  // contacts_page
  const contPageCols = Object.keys(DEFAULT_CONTACTS_PAGE).map(col => `${col} = ?`).join(", ");
  const contPageVals = Object.values(DEFAULT_CONTACTS_PAGE);
  await connection.execute(`UPDATE contacts_page SET ${contPageCols} WHERE lang = 'en'`, contPageVals);

  // home_page
  await connection.execute(`UPDATE home_page SET content = ? WHERE lang = 'en'`, [JSON.stringify(DEFAULT_HOME_PAGE_CONTENT)]);

  // about_page
  await connection.execute(`UPDATE about_page SET content = ? WHERE lang = 'en'`, [JSON.stringify(DEFAULT_ABOUT_PAGE_CONTENT)]);

  // privacy_page
  await connection.execute(`UPDATE privacy_page SET content = ? WHERE lang = 'en'`, [JSON.stringify(DEFAULT_PRIVACY_CONTENT)]);

  // terms_page
  await connection.execute(`UPDATE terms_page SET content = ? WHERE lang = 'en'`, [JSON.stringify(DEFAULT_TERMS_CONTENT)]);

  // page_seo pre-population
  await connection.execute(`DELETE FROM page_seo WHERE lang = 'en'`);
  for (const seo of DEFAULT_PAGE_SEO) {
    await connection.execute(
      `INSERT INTO page_seo (page_id, meta_title, meta_description, slug, og_title, image_alt, lang) VALUES (?, ?, ?, ?, ?, ?, 'en')`,
      [seo.page_id, seo.meta_title, seo.meta_description, seo.slug, seo.og_title, seo.image_alt]
    );
  }

  // products pre-population for lang = 'en'
  await connection.execute(`DELETE FROM products WHERE lang = 'en'`);
  for (const prod of DEFAULT_PRODUCTS) {
    const cols = Object.keys(prod);
    const vals = Object.values(prod);
    const placeholders = cols.map(() => "?").join(", ");
    await connection.execute(
      `INSERT INTO products (${cols.map(c => `\`${c}\``).join(", ")}, lang) VALUES (${placeholders}, 'en')`,
      vals
    );
  }

  console.log("Baseline English rows successfully pre-populated!");

  const tablesWithLang = [
    "global_settings",
    "page_seo",
    "home_page",
    "about_page",
    "products_page",
    "export_page",
    "contacts_page",
    "privacy_page",
    "terms_page",
    "products"
  ];

  for (const table of tablesWithLang) {
    console.log(`Processing table: ${table}`);
    
    try {
      await connection.execute(`DELETE FROM \`${table}\` WHERE lang IN ('ru', 'uz', 'pt', 'es', 'nl', 'fr')`);
      console.log(`  Deleted old records from ${table}`);
    } catch (err) {
      console.log(`  Table ${table} might not have lang column or error: ${err.message}`);
      continue; // Skip if table doesn't exist or has no lang
    }

    // Get English rows
    const [enRows] = await connection.execute(`SELECT * FROM \`${table}\` WHERE lang = 'en'`);
    
    for (const lang of LANGUAGES) {
      for (const row of enRows) {
        const newRow = { ...row };
        newRow.lang = lang;
        
        // Skip id auto-generation/deletion unless specific tables
        if (table !== "products" && table !== "global_settings" && table !== "products_page" && table !== "export_page" && table !== "contacts_page" && table !== "home_page" && table !== "about_page" && table !== "privacy_page" && table !== "terms_page" && table !== "page_seo") {
          delete newRow.id;
        }
        
        const cols = Object.keys(newRow).filter(k => k !== "created_at" && k !== "updated_at");

        for (const col of cols) {
          if (["id", "lang", "slug", "category_key", "image", "hero_bg_image", "ordering_bg_image", "cta_url", "telegram_url", "instagram_url", "whatsapp_url", "facebook_url", "headquarters_image", "google_maps_url", "operations_image", "categoryKey"].includes(col)) continue;
          
          if (typeof newRow[col] === "string" && newRow[col].trim() !== "") {
            try {
              const parsed = JSON.parse(newRow[col]);
              if (typeof parsed === "object" && parsed !== null) {
                newRow[col] = JSON.stringify(await translateObject(parsed, lang));
              } else {
                newRow[col] = await translateText(newRow[col], lang);
              }
            } catch (e) {
              newRow[col] = await translateText(newRow[col], lang);
            }
          } else if (newRow[col] && typeof newRow[col] === "object") {
            newRow[col] = JSON.stringify(await translateObject(newRow[col], lang));
          }
        }

        const vals = cols.map(c => newRow[c]);
        const placeholders = cols.map(() => "?").join(", ");
        
        try {
          await connection.execute(
            `INSERT INTO \`${table}\` (${cols.map(c => `\`${c}\``).join(", ")}) VALUES (${placeholders})`,
            vals
          );
          console.log(`  Inserted ${lang} into ${table}`);
        } catch (err) {
          console.log(`  Failed to insert ${lang} into ${table}: ${err.message}`);
        }
      }
    }
  }

  await connection.end();
}

async function main() {
  try {
    await translateDatabase();
    console.log("All done!");
  } catch (err) {
    console.error("Migration failed:", err);
  }
}

main();
