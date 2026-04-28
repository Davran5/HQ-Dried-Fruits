/**
 * Safe MySQL content importer for HQ Dried Fruits.
 *
 * Default mode is a dry validation run. It connects to MySQL, validates the
 * expected schema, builds all import rows, and prints what would be written.
 *
 * Usage:
 *   node migrate-mysql.cjs
 *   node migrate-mysql.cjs --offline
 *   node migrate-mysql.cjs --execute --i-backed-up
 *
 * Before executing on hosting, create a backup:
 *   mysqldump --no-tablespaces -u USER -p DATABASE_NAME > backup-before-import.sql
 */

const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

const ACTIVE_LOCALES = ["en", "ru", "uz"];
const PRODUCT_IDS = ["sun-dried-apricots", "black-raisins", "pitted-prunes", "mixed-dried-fruits"];

const args = new Set(process.argv.slice(2));
const shouldExecute = args.has("--execute");
const offline = args.has("--offline");
const backupConfirmed = args.has("--i-backed-up") || process.env.MYSQL_IMPORT_BACKUP_CONFIRMED === "1";

if (shouldExecute && !backupConfirmed) {
  console.error("Refusing to write without backup confirmation.");
  console.error("Run a backup first:");
  console.error("  mysqldump --no-tablespaces -u USER -p DATABASE_NAME > backup-before-import.sql");
  console.error("Then run:");
  console.error("  node migrate-mysql.cjs --execute --i-backed-up");
  process.exit(1);
}

function loadEnv(filePath) {
  const env = {};
  if (!fs.existsSync(filePath)) return env;
  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const [key, ...rest] = trimmed.split("=");
    if (!key || rest.length === 0) continue;
    env[key.trim()] = rest.join("=").trim().replace(/^"|"$/g, "");
  }
  return env;
}

function loadJsonIfExists(filePath, fallback) {
  if (!fs.existsSync(filePath)) return fallback;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return fallback;
  }
}

function asString(value, fallback = "") {
  if (value === undefined || value === null) return fallback;
  return String(value);
}

function json(value, fallback) {
  return JSON.stringify(value === undefined || value === null ? fallback : value);
}

function parseMaybeJson(value, fallback) {
  if (value === undefined || value === null || value === "") return fallback;
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function deepMerge(base, incoming) {
  if (!incoming || typeof incoming !== "object" || Array.isArray(incoming)) return base;
  const next = { ...base };
  for (const [key, value] of Object.entries(incoming)) {
    if (value === undefined || value === null || value === "") continue;
    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      next[key] &&
      typeof next[key] === "object" &&
      !Array.isArray(next[key])
    ) {
      next[key] = deepMerge(next[key], value);
    } else {
      next[key] = value;
    }
  }
  return next;
}

function hasUsefulData(row) {
  if (!row || typeof row !== "object") return false;
  return Object.keys(row).some((key) => !["id", "lang"].includes(key) && row[key] !== undefined && row[key] !== null && row[key] !== "");
}

function pickLegacyRow(legacy, tableName, locale) {
  const rows = Array.isArray(legacy?.[tableName]) ? legacy[tableName] : [];
  return rows.find((row) => row?.lang === locale && hasUsefulData(row)) || null;
}

function sanitizeFlexibleContent(pageId, content) {
  const next = { ...(content || {}) };
  if (pageId === "home") {
    delete next.progressSlider;
    delete next.supplyReachTitle;
    delete next.supplyReachOverview;
    delete next.supplyReachBgImage;
    delete next.ctaTitle;
    delete next.ctaSubtitle;
    delete next.ctaButtonLabel;
    delete next.ctaButtonUrl;
    delete next.ctaBgImage;
  }
  return next;
}

const commonVolumeOptions = {
  en: ["1-5 Tons", "5-20 Tons", "1 FCL (20ft)", "Multiple FCLs"],
  ru: ["1-5 тонн", "5-20 тонн", "1 FCL (20 футов)", "Несколько FCL"],
  uz: ["1-5 tonna", "5-20 tonna", "1 FCL (20 fut)", "Bir nechta FCL"],
};

const defaultUiLabels = {
  en: {
    mobileNavigationTitle: "Navigation",
    mobileContactTitle: "Contact Us",
    footerLinksTitle: "Company",
    requestCatalogLabel: "Request Wholesale Catalog",
    exploreProductsLabel: "Explore Products",
  },
  ru: {
    mobileNavigationTitle: "Навигация",
    mobileContactTitle: "Связаться с нами",
    footerLinksTitle: "Компания",
    requestCatalogLabel: "Запросить оптовый каталог",
    exploreProductsLabel: "Смотреть продукцию",
  },
  uz: {
    mobileNavigationTitle: "Navigatsiya",
    mobileContactTitle: "Biz bilan bog'lanish",
    footerLinksTitle: "Kompaniya",
    requestCatalogLabel: "Ulgurji katalog so'rash",
    exploreProductsLabel: "Mahsulotlarni ko'rish",
  },
};

const globalDefaults = {
  en: {
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
    uiLabels: defaultUiLabels.en,
    googleSiteVerificationId: "",
  },
  ru: {
    headerLogo: "",
    siteName: "HQ Dried Fruits",
    navLinks: [
      { label: "Главная", url: "/" },
      { label: "О нас", url: "/about" },
      { label: "Продукция", url: "/products" },
      { label: "Экспорт", url: "/export" },
      { label: "Контакты", url: "/contacts" },
    ],
    ctaText: "Получить расчет",
    ctaUrl: "/contacts",
    footerLogo: "",
    footerDescription: "Качественные сухофрукты из сердца Узбекистана для международных B2B-партнеров.",
    footerLeadText: "Получите актуальные цены и экспортные условия на email или Telegram.",
    quickLinks: [
      { label: "О нас", url: "/about" },
      { label: "Экспорт", url: "/export" },
      { label: "Контакты", url: "/contacts" },
    ],
    officeAddress: "пр-т Амира Темура 107B, Ташкент, Узбекистан",
    phoneNumber: "+998 90 123 45 67",
    emailAddress: "export@hqdriedfruits.com",
    telegramUrl: "",
    footerCtaTitle: "Нужен расчет контейнера?",
    footerCtaEmail: "export@hqdriedfruits.com",
    footerCopyrightText: "HQ Dried Fruits. Все права защищены.",
    uiLabels: defaultUiLabels.ru,
    googleSiteVerificationId: "",
  },
  uz: {
    headerLogo: "",
    siteName: "HQ Dried Fruits",
    navLinks: [
      { label: "Bosh sahifa", url: "/" },
      { label: "Biz haqimizda", url: "/about" },
      { label: "Mahsulotlar", url: "/products" },
      { label: "Eksport", url: "/export" },
      { label: "Kontaktlar", url: "/contacts" },
    ],
    ctaText: "Narx so'rash",
    ctaUrl: "/contacts",
    footerLogo: "",
    footerDescription: "O'zbekiston markazidan xalqaro B2B hamkorlar uchun sifatli quritilgan mevalar.",
    footerLeadText: "So'nggi narxlar va eksport shartlarini email yoki Telegram orqali oling.",
    quickLinks: [
      { label: "Biz haqimizda", url: "/about" },
      { label: "Eksport", url: "/export" },
      { label: "Kontaktlar", url: "/contacts" },
    ],
    officeAddress: "Amir Temur shoh ko'chasi 107B, Toshkent, O'zbekiston",
    phoneNumber: "+998 90 123 45 67",
    emailAddress: "export@hqdriedfruits.com",
    telegramUrl: "",
    footerCtaTitle: "Konteyner uchun maxsus hisob-kitob kerakmi?",
    footerCtaEmail: "export@hqdriedfruits.com",
    footerCopyrightText: "HQ Dried Fruits. Barcha huquqlar himoyalangan.",
    uiLabels: defaultUiLabels.uz,
    googleSiteVerificationId: "",
  },
};

const defaultPageSeo = {
  en: {
    home: ["HQ Dried Fruits | High-Quality Organic Export", "Quality sun-dried fruits from the heart of Uzbekistan. We export apricots, raisins, prunes, and mixed dried fruits to global B2B buyers.", "", "HQ Dried Fruits", "Sun-dried fruits from Uzbekistan"],
    about: ["About HQ Dried Fruits | Our Heritage & Mission", "Learn about our Uzbek dried fruit production, quality controls, and export-ready processing.", "about", "About HQ Dried Fruits", "Sorting facility in Uzbekistan"],
    products: ["Wholesale Dried Apricots, Raisins, Prunes & Mixed Fruits | HQ Dried Fruits", "Source Uzbekistan dried apricots, raisins, prunes, and mixed dried fruits with buyer-ready export information.", "products", "HQ Dried Fruits Product Catalog", "Assorted dried fruits"],
    export: ["Global Logistics & Export | HQ Dried Fruits", "Seamless global logistics, documentation, packaging, and routing for wholesale dried fruit buyers.", "export", "HQ Dried Fruits Export", "Global supply map"],
    contacts: ["Contact HQ Dried Fruits | Wholesale Inquiries", "Request wholesale pricing, samples, and logistics support from the HQ Dried Fruits export team.", "contacts", "Contact HQ Dried Fruits", "HQ Dried Fruits contact office"],
    privacy: ["Privacy Policy | HQ Dried Fruits", "Privacy policy for HQ Dried Fruits.", "privacy", "Privacy Policy | HQ Dried Fruits", "Privacy Policy"],
    terms: ["Terms of Service | HQ Dried Fruits", "Terms of service for HQ Dried Fruits.", "terms", "Terms of Service | HQ Dried Fruits", "Terms of Service"],
  },
  ru: {
    home: ["HQ Dried Fruits | Качественный экспорт сухофруктов", "Качественные сухофрукты из Узбекистана: курага, изюм, чернослив и смеси для B2B-покупателей.", "", "HQ Dried Fruits", "Сухофрукты из Узбекистана"],
    about: ["О HQ Dried Fruits | Производство и миссия", "Узнайте о производстве, контроле качества и экспортной подготовке сухофруктов HQ Dried Fruits.", "about", "О HQ Dried Fruits", "Производство сухофруктов в Узбекистане"],
    products: ["Оптовые сухофрукты из Узбекистана | HQ Dried Fruits", "Курага, изюм, чернослив и смеси сухофруктов из Узбекистана для оптовых покупателей.", "products", "Каталог HQ Dried Fruits", "Ассорти сухофруктов"],
    export: ["Экспорт и логистика | HQ Dried Fruits", "Международная логистика, документы, упаковка и маршрутизация для оптовых покупателей сухофруктов.", "export", "Экспорт HQ Dried Fruits", "Карта экспортных направлений"],
    contacts: ["Контакты HQ Dried Fruits | Оптовые запросы", "Запросите цены, образцы и логистическую поддержку у экспортной команды HQ Dried Fruits.", "contacts", "Контакты HQ Dried Fruits", "Офис HQ Dried Fruits"],
    privacy: ["Политика конфиденциальности | HQ Dried Fruits", "Политика конфиденциальности HQ Dried Fruits.", "privacy", "Политика конфиденциальности", "Политика конфиденциальности"],
    terms: ["Условия использования | HQ Dried Fruits", "Условия использования сайта HQ Dried Fruits.", "terms", "Условия использования", "Условия использования"],
  },
  uz: {
    home: ["HQ Dried Fruits | Sifatli quritilgan mevalar eksporti", "O'zbekistondan sifatli quritilgan o'rik, mayiz, qora olxo'ri va aralash mahsulotlar.", "", "HQ Dried Fruits", "O'zbekiston quritilgan mevalari"],
    about: ["HQ Dried Fruits haqida | Ishlab chiqarish va missiya", "HQ Dried Fruits ishlab chiqarishi, sifat nazorati va eksport tayyorgarligi haqida.", "about", "HQ Dried Fruits haqida", "O'zbekistondagi quritilgan meva ishlab chiqarish"],
    products: ["Ulgurji quritilgan mevalar | HQ Dried Fruits", "O'zbekistondan quritilgan o'rik, mayiz, qora olxo'ri va aralash quritilgan mevalar.", "products", "HQ Dried Fruits mahsulot katalogi", "Quritilgan mevalar assortimenti"],
    export: ["Eksport va logistika | HQ Dried Fruits", "Ulgurji xaridorlar uchun xalqaro logistika, hujjatlar, qadoqlash va yo'nalishlar.", "export", "HQ Dried Fruits eksporti", "Eksport yo'nalishlari xaritasi"],
    contacts: ["HQ Dried Fruits kontaktlari | Ulgurji so'rovlar", "Narxlar, namunalar va logistika bo'yicha HQ Dried Fruits eksport jamoasiga murojaat qiling.", "contacts", "HQ Dried Fruits kontaktlari", "HQ Dried Fruits ofisi"],
    privacy: ["Maxfiylik siyosati | HQ Dried Fruits", "HQ Dried Fruits maxfiylik siyosati.", "privacy", "Maxfiylik siyosati", "Maxfiylik siyosati"],
    terms: ["Foydalanish shartlari | HQ Dried Fruits", "HQ Dried Fruits saytidan foydalanish shartlari.", "terms", "Foydalanish shartlari", "Foydalanish shartlari"],
  },
};

const pageContentDefaults = {
  en: {
    home: {
      heroBgImage: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?q=80&w=2000&auto=format&fit=crop",
      heroTitle: "High-Quality Sun-Dried Fruits from Uzbekistan",
      heroSubtitle: "Hand-picked and processed to global export standards.",
      heroPrimaryCtaLabel: "Request Wholesale Catalog",
      heroSecondaryCtaLabel: "Our Processing Facilities",
      introLabel: "The HQ Dried Fruits Difference",
      introEyebrow: "About Us",
      introImage: "",
      introText: "We cultivate, process, and directly export premium dried fruits from Uzbekistan with buyer-ready quality control, sorting, packing, and documentation.",
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
        { categoryName: "Dried Apricots", image: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?q=80&w=800", shortDescription: "Golden and natural dried apricot lines.", url: "/products/sun-dried-apricots", nutrition: { energy: "280 kcal", protein: "2.5 g", fat: "0.4 g", carbs: "72 g" } },
        { categoryName: "Black Raisins", image: "https://images.unsplash.com/photo-1596591606975-97ee5cef3a1e?q=80&w=800", shortDescription: "Sweet raisins for retail and ingredient use.", url: "/products/black-raisins", nutrition: { energy: "299 kcal", protein: "3.1 g", fat: "0.5 g", carbs: "79 g" } },
        { categoryName: "Pitted Prunes", image: "https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?q=80&w=800", shortDescription: "Soft pitted and unpitted prune options.", url: "/products/pitted-prunes", nutrition: { energy: "240 kcal", protein: "2.2 g", fat: "0.4 g", carbs: "64 g" } },
      ],
      exportMarketsEyebrow: "Export Focus",
      exportMarketsTitle: "Built for Buyers Across Key Trade Corridors",
      exportMarketsIntro: "Our export team plans routing, documents, and buyer-ready packaging market by market.",
      exportMarkets: [
        { countryName: "Germany", shortDescription: "Structured pallet and container supply for Central European wholesale buyers.", statLabel: "Lead Time Window", statValue: "18-24 days", image: "https://images.unsplash.com/photo-1526778548025-fa2f459cd5ce?q=80&w=1600&auto=format&fit=crop" },
        { countryName: "Netherlands", shortDescription: "High-frequency logistics support for import partners and distribution hubs.", statLabel: "Port Routing", statValue: "Rotterdam-first", image: "https://images.unsplash.com/photo-1521295121783-8a321d551ad2?q=80&w=1600&auto=format&fit=crop" },
        { countryName: "UAE", shortDescription: "Flexible mixed-load planning for GCC routes and re-export buyers.", statLabel: "Documentation", statValue: "Buyer-ready set", image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1600&auto=format&fit=crop" },
        { countryName: "Kazakhstan", shortDescription: "Fast regional replenishment with land-linked scheduling from Tashkent.", statLabel: "Transport Mode", statValue: "Road + rail", image: "https://images.unsplash.com/photo-1502920514313-52581002a659?q=80&w=1600&auto=format&fit=crop" },
      ],
    },
    about: {
      heroBgImage: "",
      marqueeTitle: "Global Partners & Facilities",
      heroSubtitle: "A journey of quality and tradition.",
      productionMarqueeImages: [],
      partnerLogos: [],
      partnerSectionLabel: "Certified Quality & Trusted Partners",
      companyEyebrow: "About The Company",
      heritageTitle: "Our Roots in the Silk Road",
      heritageSubtitle: "A journey of quality and tradition.",
      whoWeAreContent: "<p>HQ Dried Fruits combines long-term orchard relationships, disciplined processing, and export execution for wholesale buyers.</p><p>Our team works across cultivation, sorting, packing, and shipment preparation so importers receive consistent products and clear documentation.</p>",
      heritageStats: [
        { boxNumber: "01", title: "Orchard Cultivation", description: "Direct oversight of farming practices." },
        { boxNumber: "02", title: "Laser Sorting", description: "Modern processing lines for export purity." },
      ],
      heritageImagery: [],
      missionTitle: "Our Mission",
      missionStatement: "<p>Our mission is to connect Uzbekistan's natural fruit-growing strength with the reliability demanded by modern wholesale trade.</p>",
      philosophyTitle: "Heritage & Philosophy",
      orchardPhilosophy: "Strong export supply starts before the final carton is packed: crop knowledge, disciplined controls, and systems buyers can trust.",
      productionStandardsTitle: "Production Standards",
      productionStandards: "Our production standards focus on export readiness, food-safety controls, calibrated sorting, and buyer-specific packing formats.",
      missionPhotography: "https://images.unsplash.com/photo-1596591606975-97ee5cef3a1e?q=80&w=2000",
      missionNarrativeEyebrow: "Mission Narrative",
      facilityEyebrow: "Inside The Facility",
      ownProductionTitle: "Own Production",
      ownProductionIntro: "From orchard intake to export packing, each stage is managed for consistency, traceability, and buyer-ready execution.",
      ownProductionItems: [
        { image: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?q=80&w=1200&auto=format&fit=crop", title: "Raw Intake", subtitle: "Harvest Selection", description: "Incoming fruit is sorted by batch, moisture profile, and destination requirements." },
        { image: "https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?q=80&w=1200&auto=format&fit=crop", title: "Processing", subtitle: "Laser & X-Ray Control", description: "Production lines are calibrated for purity and export-grade consistency." },
        { image: "https://images.unsplash.com/photo-1596591606975-97ee5cef3a1e?q=80&w=1200&auto=format&fit=crop", title: "Packaging", subtitle: "Buyer-Specific Formats", description: "We pack for retail, private label, and industrial shipment needs." },
        { image: "https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1200&auto=format&fit=crop", title: "Dispatch", subtitle: "Export Handover", description: "Finished cargo is documented, palletized, and scheduled for the buyer's route." },
      ],
    },
    privacy: {
      title: "Privacy Policy",
      body: "<p>We use information submitted through this website to respond to wholesale inquiries, prepare quotes, and manage customer communication.</p><p>If you need your information corrected or removed, contact our export team.</p>",
    },
    terms: {
      title: "Terms of Service",
      body: "<p>Information on this site is provided for wholesale inquiry and quotation purposes. Final pricing, availability, specifications, and logistics terms are confirmed during direct sales communication.</p>",
    },
  },
};

pageContentDefaults.ru = {
  home: deepMerge(pageContentDefaults.en.home, {
    heroTitle: "Качественные сухофрукты из Узбекистана",
    heroSubtitle: "Отборные плоды, обработанные по международным экспортным стандартам.",
    heroPrimaryCtaLabel: "Запросить оптовый каталог",
    heroSecondaryCtaLabel: "Наше производство",
    introLabel: "Преимущество HQ Dried Fruits",
    introEyebrow: "О нас",
    introText: "Мы выращиваем, перерабатываем и экспортируем сухофрукты из Узбекистана с контролем качества, сортировкой, упаковкой и документами для оптовых покупателей.",
    productPreviewTitle: "Основные урожаи",
    productPreviewButtonLabel: "Смотреть каталог",
    productPreviewItemCtaLabel: "Запросить образец",
    exportMarketsEyebrow: "Экспортный фокус",
    exportMarketsTitle: "Поставка для ключевых торговых направлений",
    exportMarketsIntro: "Наша экспортная команда планирует маршруты, документы и упаковку под каждый рынок.",
  }),
  about: deepMerge(pageContentDefaults.en.about, {
    marqueeTitle: "Глобальные партнеры и производство",
    heroSubtitle: "История качества и традиций.",
    partnerSectionLabel: "Сертифицированное качество и надежные партнеры",
    companyEyebrow: "О компании",
    heritageTitle: "Наши корни на Шелковом пути",
    heritageSubtitle: "История качества и традиций.",
    whoWeAreContent: "<p>HQ Dried Fruits объединяет садоводческие связи, дисциплинированную переработку и экспортное исполнение для оптовых покупателей.</p><p>Мы контролируем сортировку, упаковку и подготовку к отгрузке, чтобы импортеры получали стабильный продукт и понятные документы.</p>",
    missionTitle: "Наша миссия",
    missionStatement: "<p>Наша миссия — соединить природный потенциал Узбекистана с надежностью, необходимой современной оптовой торговле.</p>",
    philosophyTitle: "Наследие и философия",
    orchardPhilosophy: "Сильная экспортная поставка начинается задолго до упаковки: знание урожая, контроль процессов и системы, которым доверяют покупатели.",
    productionStandardsTitle: "Производственные стандарты",
    productionStandards: "Наши стандарты ориентированы на экспортную готовность, пищевую безопасность, сортировку и упаковку под требования покупателя.",
    missionNarrativeEyebrow: "Миссия",
    facilityEyebrow: "Внутри производства",
    ownProductionTitle: "Собственное производство",
    ownProductionIntro: "От приемки урожая до экспортной упаковки каждый этап управляется для стабильности и прослеживаемости.",
  }),
  privacy: { title: "Политика конфиденциальности", body: "<p>Мы используем данные из форм сайта для ответа на оптовые запросы, подготовки расчетов и коммуникации с клиентами.</p>" },
  terms: { title: "Условия использования", body: "<p>Информация на сайте предоставляется для оптовых запросов и предварительных расчетов. Финальные условия подтверждаются в прямой коммуникации.</p>" },
};

pageContentDefaults.uz = {
  home: deepMerge(pageContentDefaults.en.home, {
    heroTitle: "O'zbekistondan sifatli quritilgan mevalar",
    heroSubtitle: "Saralangan va xalqaro eksport standartlari bo'yicha tayyorlangan mahsulotlar.",
    heroPrimaryCtaLabel: "Ulgurji katalog so'rash",
    heroSecondaryCtaLabel: "Ishlab chiqarishimiz",
    introLabel: "HQ Dried Fruits afzalligi",
    introEyebrow: "Biz haqimizda",
    introText: "Biz O'zbekistondagi yuqori sifatli quritilgan mevalarni yetishtiramiz, qayta ishlaymiz va eksport qilamiz.",
    productPreviewTitle: "Asosiy hosillar",
    productPreviewButtonLabel: "Katalogni ko'rish",
    productPreviewItemCtaLabel: "Namuna so'rash",
    exportMarketsEyebrow: "Eksport yo'nalishi",
    exportMarketsTitle: "Asosiy savdo yo'nalishlari uchun tayyor ta'minot",
    exportMarketsIntro: "Eksport jamoamiz har bir bozor uchun yo'nalish, hujjatlar va qadoqlashni rejalashtiradi.",
  }),
  about: deepMerge(pageContentDefaults.en.about, {
    marqueeTitle: "Global hamkorlar va ishlab chiqarish",
    heroSubtitle: "Sifat va an'analar yo'li.",
    partnerSectionLabel: "Sertifikatlangan sifat va ishonchli hamkorlar",
    companyEyebrow: "Kompaniya haqida",
    heritageTitle: "Ipak yo'lidagi ildizlarimiz",
    heritageSubtitle: "Sifat va an'analar yo'li.",
    whoWeAreContent: "<p>HQ Dried Fruits ulgurji xaridorlar uchun bog'lar bilan uzoq muddatli hamkorlik, intizomli qayta ishlash va eksport jarayonlarini birlashtiradi.</p>",
    missionTitle: "Missiyamiz",
    missionStatement: "<p>Missiyamiz O'zbekistonning meva yetishtirish salohiyatini zamonaviy ulgurji savdo ishonchliligi bilan bog'lashdir.</p>",
    philosophyTitle: "Meros va falsafa",
    orchardPhilosophy: "Kuchli eksport ta'minoti hosilni bilish, jarayon nazorati va xaridor ishonadigan tizimlardan boshlanadi.",
    productionStandardsTitle: "Ishlab chiqarish standartlari",
    productionStandards: "Standartlarimiz eksportga tayyorgarlik, oziq-ovqat xavfsizligi, saralash va xaridor talabidagi qadoqlashga qaratilgan.",
    missionNarrativeEyebrow: "Missiya",
    facilityEyebrow: "Korxona ichida",
    ownProductionTitle: "O'z ishlab chiqarishimiz",
    ownProductionIntro: "Hosil qabulidan eksport qadoqlashgacha har bir bosqich barqarorlik va kuzatuvchanlik uchun boshqariladi.",
  }),
  privacy: { title: "Maxfiylik siyosati", body: "<p>Sayt formalaridagi ma'lumotlardan ulgurji so'rovlarga javob berish va mijozlar bilan aloqa qilish uchun foydalanamiz.</p>" },
  terms: { title: "Foydalanish shartlari", body: "<p>Saytdagi ma'lumotlar ulgurji so'rov va dastlabki hisob-kitob uchun beriladi. Yakuniy shartlar bevosita kelishuvda tasdiqlanadi.</p>" },
};

const productsPageDefaults = {
  en: {
    pageTitle: "Wholesale Dried Fruits from Uzbekistan",
    pageSubtitle: "Explore export-ready apricots, raisins, prunes, and mixed assortments with buyer-focused origin, processing, and application details in one catalog.",
    heroBgImage: "",
    introEyebrow: "Uzbekistan Origin",
    introTitle: "One Page. Four Core Product Lines. Real Buyer Context.",
    introContent: "<p>Compare origin, processing, nutrition, packing, and use cases without jumping between separate catalog pages.</p><p>Each product profile is structured for wholesale buyers who need practical sourcing information, not only marketing copy.</p>",
    introImage: "",
    introFacts: [
      { title: "Orchard Base", description: "Fruit-growing zones in Uzbekistan rely on irrigated valley and foothill production systems." },
      { title: "Growing Conditions", description: "Hot, dry summers and sunlight help apricots, grapes, and plums build sugar." },
      { title: "Export Readiness", description: "Every line is positioned for buyer-specific cartons and repeat wholesale programs." },
    ],
    orderingBgImage: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?q=80&w=2000",
    orderingFormTitle: "Wholesale Inquiry",
    orderingFormSubtitle: "Share your target volume and timeline. We will respond with pricing and logistics details.",
    stepOneLabel: "Which product are you interested in?",
    stepTwoLabel: "Estimated Monthly Volume?",
    stepThreeLabel: "Where should we send the quote?",
    mixedContainerLabel: "Mixed Container",
    volumeOptions: commonVolumeOptions.en,
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
  },
};

productsPageDefaults.ru = deepMerge(productsPageDefaults.en, {
  pageTitle: "Оптовые сухофрукты из Узбекистана",
  pageSubtitle: "Курага, изюм, чернослив и смеси с информацией об origin, обработке, питательной ценности и применении.",
  introEyebrow: "Происхождение Узбекистан",
  introTitle: "Одна страница. Четыре продуктовые линии. Реальный контекст для покупателя.",
  introContent: "<p>Сравните происхождение, переработку, питательность, упаковку и применение без перехода между отдельными каталогами.</p><p>Каждый профиль создан для оптовых покупателей, которым нужна практичная информация для закупки.</p>",
  introFacts: [
    { title: "Садовая база", description: "Плодовые зоны Узбекистана опираются на долинное и предгорное производство." },
    { title: "Условия выращивания", description: "Жаркое сухое лето и солнце помогают фруктам набирать сахар." },
    { title: "Экспортная готовность", description: "Каждая линия подготовлена для упаковки под покупателя и повторных поставок." },
  ],
  orderingFormTitle: "Оптовый запрос",
  orderingFormSubtitle: "Укажите объем и сроки, и мы подготовим цены и логистику.",
  stepOneLabel: "Какой продукт вас интересует?",
  stepTwoLabel: "Ожидаемый месячный объем?",
  stepThreeLabel: "Куда отправить расчет?",
  mixedContainerLabel: "Смешанный контейнер",
  volumeOptions: commonVolumeOptions.ru,
  viewSpecsLabel: "Смотреть спецификацию",
  stepOnePlaceholder: "Выберите продукт...",
  stepThreePlaceholder: "Рабочий email",
  nextStepButtonLabel: "Далее",
  backButtonLabel: "Назад",
  submitButtonLabel: "Получить расчет",
  submittingButtonLabel: "Отправка...",
  quickContactTitle: "Нужно быстрее?",
  quickContactSubtitle: "Свяжитесь напрямую с экспортной командой.",
  telegramLabel: "Telegram",
  telegramSublabel: "Быстрые цены и PDF-каталог",
  callLabel: "Позвонить",
  emailLabel: "Написать",
});

productsPageDefaults.uz = deepMerge(productsPageDefaults.en, {
  pageTitle: "O'zbekistondan ulgurji quritilgan mevalar",
  pageSubtitle: "Quritilgan o'rik, mayiz, qora olxo'ri va aralash assortiment bo'yicha xaridorga kerakli ma'lumotlar.",
  introEyebrow: "O'zbekiston kelib chiqishi",
  introTitle: "Bir sahifa. To'rtta asosiy mahsulot liniyasi. Xaridor uchun aniq kontekst.",
  introContent: "<p>Kelib chiqish, qayta ishlash, oziqlanish qiymati, qadoqlash va qo'llanilishni bir katalogda solishtiring.</p><p>Har bir mahsulot profili amaliy xarid ma'lumotiga muhtoj ulgurji xaridorlar uchun tuzilgan.</p>",
  introFacts: [
    { title: "Bog'lar bazasi", description: "O'zbekiston meva zonalari vodiy va tog'oldi ishlab chiqarish tizimlariga tayanadi." },
    { title: "Yetishtirish sharoiti", description: "Issiq, quruq yoz va quyosh mevalarning shakar yig'ishiga yordam beradi." },
    { title: "Eksportga tayyorgarlik", description: "Har bir liniya xaridorga mos kartonlar va takroriy ulgurji dasturlar uchun tayyor." },
  ],
  orderingFormTitle: "Ulgurji so'rov",
  orderingFormSubtitle: "Kerakli hajm va muddatni yuboring, biz narx va logistika ma'lumotlarini tayyorlaymiz.",
  stepOneLabel: "Qaysi mahsulot sizni qiziqtiradi?",
  stepTwoLabel: "Taxminiy oylik hajm?",
  stepThreeLabel: "Hisob-kitobni qayerga yuboraylik?",
  mixedContainerLabel: "Aralash konteyner",
  volumeOptions: commonVolumeOptions.uz,
  viewSpecsLabel: "Spetsifikatsiyani ko'rish",
  stepOnePlaceholder: "Mahsulotni tanlang...",
  stepThreePlaceholder: "Ish emaili",
  nextStepButtonLabel: "Keyingi",
  backButtonLabel: "Orqaga",
  submitButtonLabel: "Narx olish",
  submittingButtonLabel: "Yuborilmoqda...",
  quickContactTitle: "Tezroq kerakmi?",
  quickContactSubtitle: "Eksport savdo jamoamiz bilan bevosita bog'laning.",
  telegramLabel: "Telegram",
  telegramSublabel: "Tezkor narxlar va PDF katalog",
  callLabel: "Qo'ng'iroq",
  emailLabel: "Email",
});

const exportPageDefaults = {
  en: {
    heroTitle: "Our Global Export Network",
    heroSubtitle: "Seamless global logistics from the heart of the Silk Road to your warehouse.",
    heroBgImage: "",
    operationsImage: "",
    operationsEyebrow: "Export Operations",
    destinationEyebrow: "Export Geography",
    mapSectionTitle: "Our Global Export Network",
    supplyRoutes: [
      { countryName: "Germany", mapCoordinatesId: "DE", tooltipDescription: "Structured pallet and container distribution for Central Europe.", image: "" },
      { countryName: "UAE", mapCoordinatesId: "AE", tooltipDescription: "Flexible documentation and mixed-load preparation for GCC importers.", image: "" },
      { countryName: "Kazakhstan", mapCoordinatesId: "KZ", tooltipDescription: "Land-linked replenishment for regional buyers.", image: "" },
      { countryName: "Turkey", mapCoordinatesId: "TR", tooltipDescription: "Cross-regional trade flow connecting Europe and the Middle East.", image: "" },
    ],
    logisticsContent: "<p>We handle end-to-end multimodal transport routing based on buyer requirements, from packing format and paperwork to delivery lane planning.</p>",
    packagingTitle: "Custom Packaging",
    packagingMethods: "<p>Bulk cartons, vacuum-sealed bags, and retail-ready packaging can be prepared with buyer labels and required markings.</p>",
    transportationTitle: "Ocean & Rail Freight",
    transportationMethods: "<p>We support FCL and LCL shipments through major port, rail, and road routes depending on destination and schedule.</p>",
    documentationTitle: "Customs Clearance",
    documentationContent: "<p>Documentation support includes phytosanitary certificates, certificates of origin, invoices, packing lists, and buyer-specific paperwork.</p>",
    qualityTitle: "The Quality Guarantee",
    technicalSpecs: "<p>Sorting, moisture control, and batch checks help keep each shipment aligned with buyer specifications.</p>",
    qualityChecks: [
      { title: "Moisture Control", description: "Maintained for shelf life and destination requirements." },
      { title: "Size Calibration", description: "Graded for consistent retail, ingredient, or bulk use." },
      { title: "Microbiological Safety", description: "Prepared with food-safety procedures and documentation support." },
    ],
    certificationsGallery: [],
  },
};

exportPageDefaults.ru = deepMerge(exportPageDefaults.en, {
  heroTitle: "Наша глобальная экспортная сеть",
  heroSubtitle: "Логистика от сердца Шелкового пути до склада покупателя.",
  operationsEyebrow: "Экспортные операции",
  destinationEyebrow: "География экспорта",
  mapSectionTitle: "Наша глобальная экспортная сеть",
  logisticsContent: "<p>Мы планируем мультимодальную логистику под требования покупателя: упаковку, документы и маршрут доставки.</p>",
  packagingTitle: "Индивидуальная упаковка",
  packagingMethods: "<p>Картонные коробки, вакуумные пакеты и розничная упаковка могут быть подготовлены с маркировкой покупателя.</p>",
  transportationTitle: "Морские и железнодорожные перевозки",
  transportationMethods: "<p>Поддерживаем FCL и LCL поставки через портовые, железнодорожные и автомобильные маршруты.</p>",
  documentationTitle: "Таможенные документы",
  documentationContent: "<p>Помогаем с фитосанитарными сертификатами, сертификатами происхождения, инвойсами и упаковочными листами.</p>",
  qualityTitle: "Гарантия качества",
  technicalSpecs: "<p>Сортировка, контроль влажности и проверка партий помогают соблюдать спецификации покупателя.</p>",
});

exportPageDefaults.uz = deepMerge(exportPageDefaults.en, {
  heroTitle: "Global eksport tarmog'imiz",
  heroSubtitle: "Ipak yo'li markazidan xaridor omborigacha qulay logistika.",
  operationsEyebrow: "Eksport operatsiyalari",
  destinationEyebrow: "Eksport geografiyasi",
  mapSectionTitle: "Global eksport tarmog'imiz",
  logisticsContent: "<p>Biz qadoqlash, hujjatlar va yetkazib berish yo'nalishini xaridor talabi asosida rejalashtiramiz.</p>",
  packagingTitle: "Maxsus qadoqlash",
  packagingMethods: "<p>Kartonlar, vakuum paketlar va chakana qadoqlar xaridor yorlig'i va talab qilingan belgilar bilan tayyorlanadi.</p>",
  transportationTitle: "Dengiz va temir yo'l tashuvlari",
  transportationMethods: "<p>Manzil va jadvalga qarab FCL va LCL jo'natmalarini qo'llab-quvvatlaymiz.</p>",
  documentationTitle: "Bojxona hujjatlari",
  documentationContent: "<p>Fitosanitariya sertifikatlari, kelib chiqish sertifikatlari, invoice va packing list bo'yicha yordam beramiz.</p>",
  qualityTitle: "Sifat kafolati",
  technicalSpecs: "<p>Saralash, namlik nazorati va partiya tekshiruvlari mahsulotni xaridor spetsifikatsiyasiga mos ushlaydi.</p>",
});

const contactsPageDefaults = {
  en: {
    pageTitle: "Let's Connect",
    introText: "Whether you need a mixed container or a dedicated harvest line, our B2B team is available for export inquiries.",
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
    headquartersImage: "",
    googleMapsUrl: "",
  },
};

contactsPageDefaults.ru = deepMerge(contactsPageDefaults.en, {
  pageTitle: "Свяжитесь с нами",
  introText: "Если вам нужен смешанный контейнер или отдельная линия урожая, наша B2B-команда готова ответить на экспортный запрос.",
  directContactEyebrow: "Прямой контакт",
  contactFormTitle: "Отправить запрос",
  responseLabelPrefix: "Ответы отслеживаются на",
  formNameLabel: "Полное имя",
  formCompanyLabel: "Компания",
  formEmailLabel: "Рабочий email",
  formMessageLabel: "Сообщение",
  submitButtonLabel: "Отправить",
  submittingButtonLabel: "Отправка...",
  infoEmailLabel: "Email",
  infoPhoneLabel: "Телефон",
  infoAddressLabel: "Офис",
  infoHoursLabel: "Рабочие часы",
  socialSectionTitle: "Социальные сети",
});

contactsPageDefaults.uz = deepMerge(contactsPageDefaults.en, {
  pageTitle: "Bog'laning",
  introText: "Aralash konteyner yoki alohida hosil liniyasi kerak bo'lsa, B2B jamoamiz eksport so'rovlariga tayyor.",
  directContactEyebrow: "Bevosita aloqa",
  contactFormTitle: "So'rov yuborish",
  responseLabelPrefix: "Javoblar kuzatiladi:",
  formNameLabel: "To'liq ism",
  formCompanyLabel: "Kompaniya",
  formEmailLabel: "Ish emaili",
  formMessageLabel: "Xabar",
  submitButtonLabel: "Yuborish",
  submittingButtonLabel: "Yuborilmoqda...",
  infoEmailLabel: "Email",
  infoPhoneLabel: "Telefon",
  infoAddressLabel: "Ofis",
  infoHoursLabel: "Ish vaqti",
  socialSectionTitle: "Ijtimoiy tarmoqlar",
});

const productMedia = {
  "sun-dried-apricots": {
    image: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?q=80&w=1400&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?q=80&w=1400&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1508747703725-719777637510?q=80&w=1400&auto=format&fit=crop",
    ],
  },
  "black-raisins": {
    image: "https://images.unsplash.com/photo-1596591606975-97ee5cef3a1e?q=80&w=1400&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1596591606975-97ee5cef3a1e?q=80&w=1400&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?q=80&w=1400&auto=format&fit=crop",
    ],
  },
  "pitted-prunes": {
    image: "https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?q=80&w=1400&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?q=80&w=1400&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?q=80&w=1400&auto=format&fit=crop",
    ],
  },
  "mixed-dried-fruits": {
    image: "https://images.unsplash.com/photo-1606914469633-bd39206ea739?q=80&w=1400&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1606914469633-bd39206ea739?q=80&w=1400&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1615485500704-8e990f9900f7?q=80&w=1400&auto=format&fit=crop",
    ],
  },
};

const productText = {
  en: {
    "sun-dried-apricots": {
      name: "Sun-Dried Apricots",
      category: "Dried Apricots",
      shortDescription: "Naturally sweet Uzbek apricots prepared for wholesale, retail packing, and ingredient use.",
      longDescription: "<p>Uzbek sun-dried apricots are valued for their concentrated sweetness, bright fruit character, and flexible use across retail, bakery, confectionery, and foodservice programs.</p><p>We prepare apricot lines with attention to moisture, grading, and buyer-specific packing so repeat orders stay consistent.</p>",
      highlights: ["Uzbekistan origin", "Golden and natural styles", "Wholesale cartons and private label options", "Moisture and size control"],
      sections: [
        { title: "Buyer Context", body: "<p>A strong fit for distributors, retail brands, confectionery makers, and ingredient buyers needing reliable apricot supply.</p>" },
        { title: "Processing & Quality", body: "<p>Fruit is sorted for size, appearance, and moisture profile before packing according to buyer requirements.</p>" },
        { title: "Packaging", body: "<p>Available in bulk cartons, foodservice formats, and private-label retail packs.</p>" },
      ],
      nutrition: { energy: "280 kcal", protein: "2.5 g", fat: "0.4 g", carbs: "72 g" },
      inquiry: "Wholesale inquiry: Sun-Dried Apricots",
      seo: ["Wholesale Sun-Dried Apricots from Uzbekistan | HQ Dried Fruits", "Source export-ready Uzbek dried apricots with wholesale packing, grading, and documentation support.", "sun-dried-apricots", "Sun-Dried Apricots", "Sun-dried apricots from Uzbekistan"],
    },
    "black-raisins": {
      name: "Black Raisins",
      category: "Raisins",
      shortDescription: "Sweet Uzbek raisins for retail packs, bakery applications, ingredient sourcing, and mixed containers.",
      longDescription: "<p>Black raisins from Uzbekistan offer rich sweetness, deep color, and practical versatility for wholesale buyers.</p><p>They are suitable for retail shelves, bakery mixes, confectionery, muesli, and foodservice supply programs.</p>",
      highlights: ["Deep natural sweetness", "Retail and ingredient use", "Consistent grading", "Mixed-container friendly"],
      sections: [
        { title: "Buyer Context", body: "<p>Designed for importers and brands that need dependable raisin volume with practical export documentation.</p>" },
        { title: "Processing & Quality", body: "<p>Raisins are cleaned, graded, and checked for moisture and foreign material before packing.</p>" },
        { title: "Packaging", body: "<p>Bulk cartons and buyer-specific pack formats are available for wholesale programs.</p>" },
      ],
      nutrition: { energy: "299 kcal", protein: "3.1 g", fat: "0.5 g", carbs: "79 g" },
      inquiry: "Wholesale inquiry: Black Raisins",
      seo: ["Wholesale Black Raisins from Uzbekistan | HQ Dried Fruits", "Buy Uzbek black raisins for retail, bakery, ingredient, and wholesale export programs.", "black-raisins", "Black Raisins", "Black raisins from Uzbekistan"],
    },
    "pitted-prunes": {
      name: "Pitted Prunes",
      category: "Prunes",
      shortDescription: "Soft dried plums available in pitted and unpitted formats for wholesale supply.",
      longDescription: "<p>Our prune lines are prepared for buyers that need soft texture, stable moisture, and flexible packing formats.</p><p>Pitted and unpitted options support retail, foodservice, and ingredient programs.</p>",
      highlights: ["Pitted and unpitted options", "Soft texture", "Moisture-controlled packing", "Retail and foodservice formats"],
      sections: [
        { title: "Buyer Context", body: "<p>Prunes are suited for health-focused retail, bakery fillings, foodservice, and ingredient sourcing.</p>" },
        { title: "Processing & Quality", body: "<p>Product is sorted and checked for texture, moisture, and pit control according to the selected format.</p>" },
        { title: "Packaging", body: "<p>Wholesale cartons and buyer-specific packaging can be prepared for destination requirements.</p>" },
      ],
      nutrition: { energy: "240 kcal", protein: "2.2 g", fat: "0.4 g", carbs: "64 g" },
      inquiry: "Wholesale inquiry: Pitted Prunes",
      seo: ["Wholesale Pitted Prunes from Uzbekistan | HQ Dried Fruits", "Source pitted and unpitted dried prunes for wholesale, retail, and ingredient supply.", "pitted-prunes", "Pitted Prunes", "Pitted prunes"],
    },
    "mixed-dried-fruits": {
      name: "Mixed Dried Fruits",
      category: "Assortments",
      shortDescription: "Buyer-ready mixes combining apricots, raisins, prunes, and other dried fruit lines.",
      longDescription: "<p>Mixed dried fruit assortments help buyers combine several Uzbek-origin product lines in one practical program.</p><p>Mixes can be structured for retail packs, foodservice, gifting, or mixed-container wholesale orders.</p>",
      highlights: ["Custom blend options", "Retail and foodservice formats", "Mixed-container programs", "Flexible labeling"],
      sections: [
        { title: "Buyer Context", body: "<p>Ideal for importers and brands that want multiple dried fruit lines in one buyer-ready solution.</p>" },
        { title: "Blend Planning", body: "<p>Assortments can be configured by fruit type, size, color, sweetness profile, and target pack format.</p>" },
        { title: "Packaging", body: "<p>Available for retail packs, foodservice cartons, private label, and promotional formats.</p>" },
      ],
      nutrition: { energy: "285 kcal", protein: "2.7 g", fat: "0.5 g", carbs: "73 g" },
      inquiry: "Wholesale inquiry: Mixed Dried Fruits",
      seo: ["Wholesale Mixed Dried Fruits from Uzbekistan | HQ Dried Fruits", "Create buyer-ready dried fruit assortments with Uzbek apricots, raisins, prunes, and mixed packs.", "mixed-dried-fruits", "Mixed Dried Fruits", "Mixed dried fruits"],
    },
  },
};

productText.ru = {
  "sun-dried-apricots": deepMerge(productText.en["sun-dried-apricots"], {
    name: "Сушеная курага",
    category: "Курага",
    shortDescription: "Натурально сладкая узбекская курага для оптовых поставок, розничной упаковки и ингредиентного использования.",
    longDescription: "<p>Узбекская сушеная курага ценится за насыщенную сладость, фруктовый вкус и универсальность для розницы, выпечки, кондитерского производства и HoReCa.</p><p>Мы готовим партии с контролем влажности, калибровки и упаковки под требования покупателя.</p>",
    highlights: ["Происхождение Узбекистан", "Золотые и натуральные виды", "Оптовые коробки и private label", "Контроль влажности и размера"],
    sections: [
      { title: "Контекст для покупателя", body: "<p>Подходит дистрибьюторам, розничным брендам, кондитерским производителям и ингредиентным закупкам.</p>" },
      { title: "Переработка и качество", body: "<p>Плоды сортируются по размеру, внешнему виду и влажности перед упаковкой.</p>" },
      { title: "Упаковка", body: "<p>Доступны оптовые коробки, foodservice-форматы и розничные упаковки под брендом покупателя.</p>" },
    ],
    inquiry: "Оптовый запрос: сушеная курага",
    seo: ["Оптовая сушеная курага из Узбекистана | HQ Dried Fruits", "Поставки узбекской кураги с экспортной упаковкой, калибровкой и документами.", "sun-dried-apricots", "Сушеная курага", "Сушеная курага из Узбекистана"],
  }),
  "black-raisins": deepMerge(productText.en["black-raisins"], {
    name: "Черный изюм",
    category: "Изюм",
    shortDescription: "Сладкий узбекский изюм для розницы, выпечки, ингредиентных закупок и смешанных контейнеров.",
    longDescription: "<p>Черный изюм из Узбекистана обладает насыщенной сладостью, глубоким цветом и практичной универсальностью для оптовых покупателей.</p>",
    highlights: ["Натуральная сладость", "Для розницы и ингредиентов", "Стабильная калибровка", "Подходит для смешанных контейнеров"],
    sections: [
      { title: "Контекст для покупателя", body: "<p>Для импортеров и брендов, которым нужен стабильный объем изюма с экспортными документами.</p>" },
      { title: "Переработка и качество", body: "<p>Изюм очищается, сортируется и проверяется по влажности и посторонним примесям.</p>" },
      { title: "Упаковка", body: "<p>Доступны оптовые коробки и упаковка под требования покупателя.</p>" },
    ],
    inquiry: "Оптовый запрос: черный изюм",
    seo: ["Оптовый черный изюм из Узбекистана | HQ Dried Fruits", "Узбекский черный изюм для розницы, выпечки и экспортных оптовых программ.", "black-raisins", "Черный изюм", "Черный изюм из Узбекистана"],
  }),
  "pitted-prunes": deepMerge(productText.en["pitted-prunes"], {
    name: "Чернослив без косточки",
    category: "Чернослив",
    shortDescription: "Мягкий чернослив в форматах с косточкой и без косточки для оптовых поставок.",
    longDescription: "<p>Наши линии чернослива подходят покупателям, которым нужна мягкая текстура, стабильная влажность и гибкая упаковка.</p>",
    highlights: ["С косточкой и без косточки", "Мягкая текстура", "Контроль влажности", "Розничные и foodservice-форматы"],
    sections: [
      { title: "Контекст для покупателя", body: "<p>Подходит для health-розницы, начинки, foodservice и ингредиентных закупок.</p>" },
      { title: "Переработка и качество", body: "<p>Продукт сортируется и проверяется по текстуре, влажности и контролю косточки.</p>" },
      { title: "Упаковка", body: "<p>Оптовые коробки и упаковка под требования рынка назначения.</p>" },
    ],
    inquiry: "Оптовый запрос: чернослив без косточки",
    seo: ["Оптовый чернослив из Узбекистана | HQ Dried Fruits", "Чернослив с косточкой и без косточки для розницы, foodservice и ингредиентных поставок.", "pitted-prunes", "Чернослив без косточки", "Чернослив без косточки"],
  }),
  "mixed-dried-fruits": deepMerge(productText.en["mixed-dried-fruits"], {
    name: "Смеси сухофруктов",
    category: "Ассорти",
    shortDescription: "Смеси кураги, изюма, чернослива и других сухофруктов под задачи покупателя.",
    longDescription: "<p>Смеси сухофруктов позволяют объединить несколько узбекских продуктовых линий в одном практичном решении.</p>",
    highlights: ["Индивидуальные смеси", "Розничные и foodservice-форматы", "Смешанные контейнеры", "Гибкая маркировка"],
    sections: [
      { title: "Контекст для покупателя", body: "<p>Для импортеров и брендов, которым нужно несколько линеек сухофруктов в одном решении.</p>" },
      { title: "Планирование смеси", body: "<p>Ассортимент можно настроить по типу фруктов, размеру, цвету, сладости и формату упаковки.</p>" },
      { title: "Упаковка", body: "<p>Розничные пакеты, foodservice-коробки, private label и промо-форматы.</p>" },
    ],
    inquiry: "Оптовый запрос: смеси сухофруктов",
    seo: ["Оптовые смеси сухофруктов из Узбекистана | HQ Dried Fruits", "Создайте ассорти из кураги, изюма, чернослива и других сухофруктов.", "mixed-dried-fruits", "Смеси сухофруктов", "Смеси сухофруктов"],
  }),
};

productText.uz = {
  "sun-dried-apricots": deepMerge(productText.en["sun-dried-apricots"], {
    name: "Quyoshda quritilgan o'rik",
    category: "Quritilgan o'rik",
    shortDescription: "Ulgurji yetkazib berish, chakana qadoqlash va ingredient ishlatish uchun tabiiy shirin o'zbek o'rigi.",
    longDescription: "<p>O'zbek quritilgan o'rigi shirinligi, mevali ta'mi va chakana, nonvoylik hamda foodservice dasturlaridagi moslashuvchanligi bilan qadrlanadi.</p>",
    highlights: ["O'zbekiston kelib chiqishi", "Oltin va tabiiy turlar", "Ulgurji kartonlar va private label", "Namlik va o'lcham nazorati"],
    sections: [
      { title: "Xaridor konteksti", body: "<p>Distribyutorlar, chakana brendlar, qandolatchilik va ingredient xaridorlari uchun mos.</p>" },
      { title: "Qayta ishlash va sifat", body: "<p>Mevalar o'lcham, ko'rinish va namlik bo'yicha saralanadi.</p>" },
      { title: "Qadoqlash", body: "<p>Ulgurji kartonlar, foodservice formatlar va xaridor brendidagi chakana qadoqlar mavjud.</p>" },
    ],
    inquiry: "Ulgurji so'rov: quritilgan o'rik",
    seo: ["O'zbekistondan ulgurji quritilgan o'rik | HQ Dried Fruits", "Eksportga tayyor o'zbek quritilgan o'rigi: qadoqlash, saralash va hujjatlar.", "sun-dried-apricots", "Quritilgan o'rik", "O'zbekiston quritilgan o'rigi"],
  }),
  "black-raisins": deepMerge(productText.en["black-raisins"], {
    name: "Qora mayiz",
    category: "Mayiz",
    shortDescription: "Chakana, nonvoylik, ingredient va aralash konteynerlar uchun shirin o'zbek mayizi.",
    longDescription: "<p>O'zbek qora mayizi ulgurji xaridorlar uchun tabiiy shirinlik, chuqur rang va amaliy moslashuvchanlik beradi.</p>",
    highlights: ["Tabiiy shirinlik", "Chakana va ingredient uchun", "Barqaror saralash", "Aralash konteynerga mos"],
    sections: [
      { title: "Xaridor konteksti", body: "<p>Eksport hujjatlari bilan barqaror mayiz hajmiga muhtoj importer va brendlar uchun.</p>" },
      { title: "Qayta ishlash va sifat", body: "<p>Mayiz tozalanadi, saralanadi va namlik hamda begona aralashmalar bo'yicha tekshiriladi.</p>" },
      { title: "Qadoqlash", body: "<p>Ulgurji kartonlar va xaridor talabidagi formatlar mavjud.</p>" },
    ],
    inquiry: "Ulgurji so'rov: qora mayiz",
    seo: ["O'zbekistondan ulgurji qora mayiz | HQ Dried Fruits", "Chakana, nonvoylik va ingredient eksport dasturlari uchun o'zbek qora mayizi.", "black-raisins", "Qora mayiz", "O'zbekiston qora mayizi"],
  }),
  "pitted-prunes": deepMerge(productText.en["pitted-prunes"], {
    name: "Danaksiz qora olxo'ri",
    category: "Quritilgan qora olxo'ri",
    shortDescription: "Ulgurji ta'minot uchun danakli va danaksiz yumshoq quritilgan olxo'ri.",
    longDescription: "<p>Quritilgan olxo'ri liniyalarimiz yumshoq tekstura, barqaror namlik va moslashuvchan qadoqlash talab qiladigan xaridorlar uchun tayyorlanadi.</p>",
    highlights: ["Danakli va danaksiz", "Yumshoq tekstura", "Namlik nazorati", "Chakana va foodservice formatlar"],
    sections: [
      { title: "Xaridor konteksti", body: "<p>Sog'lom chakana savdo, pishiriq to'ldirmalari, foodservice va ingredient xaridlari uchun mos.</p>" },
      { title: "Qayta ishlash va sifat", body: "<p>Mahsulot tekstura, namlik va danak nazorati bo'yicha saralanadi.</p>" },
      { title: "Qadoqlash", body: "<p>Ulgurji kartonlar va bozor talabidagi qadoqlash tayyorlanadi.</p>" },
    ],
    inquiry: "Ulgurji so'rov: danaksiz qora olxo'ri",
    seo: ["O'zbekistondan ulgurji danaksiz qora olxo'ri | HQ Dried Fruits", "Chakana, foodservice va ingredient ta'minoti uchun danakli va danaksiz quritilgan olxo'ri.", "pitted-prunes", "Danaksiz qora olxo'ri", "Danaksiz qora olxo'ri"],
  }),
  "mixed-dried-fruits": deepMerge(productText.en["mixed-dried-fruits"], {
    name: "Aralash quritilgan mevalar",
    category: "Assortiment",
    shortDescription: "Quritilgan o'rik, mayiz, qora olxo'ri va boshqa mevalardan xaridor uchun tayyor aralashmalar.",
    longDescription: "<p>Aralash quritilgan mevalar bir nechta o'zbek mahsulot liniyasini bitta amaliy dasturga birlashtiradi.</p>",
    highlights: ["Maxsus aralashmalar", "Chakana va foodservice formatlar", "Aralash konteyner dasturlari", "Moslashuvchan yorliqlash"],
    sections: [
      { title: "Xaridor konteksti", body: "<p>Bir nechta quritilgan meva liniyasini bitta yechimda xohlaydigan importer va brendlar uchun.</p>" },
      { title: "Aralashma rejalash", body: "<p>Assortiment meva turi, o'lcham, rang, shirinlik va qadoq formati bo'yicha tuziladi.</p>" },
      { title: "Qadoqlash", body: "<p>Chakana paketlar, foodservice kartonlar, private label va promo formatlar mavjud.</p>" },
    ],
    inquiry: "Ulgurji so'rov: aralash quritilgan mevalar",
    seo: ["O'zbekistondan ulgurji aralash quritilgan mevalar | HQ Dried Fruits", "Quritilgan o'rik, mayiz, qora olxo'ri va boshqa mevalardan tayyor assortimenti.", "mixed-dried-fruits", "Aralash quritilgan mevalar", "Aralash quritilgan mevalar"],
  }),
};

function applyLegacyGlobal(defaults, legacyRow) {
  if (!legacyRow) return defaults;
  return deepMerge(defaults, {
    headerLogo: asString(legacyRow.header_logo, defaults.headerLogo),
    siteName: asString(legacyRow.site_name, defaults.siteName),
    navLinks: parseMaybeJson(legacyRow.nav_links, defaults.navLinks),
    ctaText: asString(legacyRow.cta_text, defaults.ctaText),
    ctaUrl: asString(legacyRow.cta_url, defaults.ctaUrl),
    footerLogo: asString(legacyRow.footer_logo, defaults.footerLogo),
    footerDescription: asString(legacyRow.footer_description, defaults.footerDescription),
    footerLeadText: asString(legacyRow.footer_lead_text, defaults.footerLeadText),
    quickLinks: parseMaybeJson(legacyRow.quick_links, defaults.quickLinks),
    officeAddress: asString(legacyRow.office_address, defaults.officeAddress),
    phoneNumber: asString(legacyRow.phone_number, defaults.phoneNumber),
    emailAddress: asString(legacyRow.email_address, defaults.emailAddress),
    telegramUrl: asString(legacyRow.telegram_url, defaults.telegramUrl),
    footerCtaTitle: asString(legacyRow.footer_cta_title, defaults.footerCtaTitle),
    footerCtaEmail: asString(legacyRow.footer_cta_email, defaults.footerCtaEmail),
    footerCopyrightText: asString(legacyRow.footer_copyright_text, defaults.footerCopyrightText),
    uiLabels: parseMaybeJson(legacyRow.ui_labels, defaults.uiLabels),
    googleSiteVerificationId: asString(legacyRow.google_site_verification_id, defaults.googleSiteVerificationId),
  });
}

function sqlRow(table, columns, values) {
  return { table, columns, values };
}

function buildRows() {
  const legacy = loadJsonIfExists(path.join(process.cwd(), "database.json"), {});
  const rows = [];

  for (const locale of ACTIVE_LOCALES) {
    const globals = applyLegacyGlobal(globalDefaults[locale], pickLegacyRow(legacy, "global_settings", locale));
    rows.push(sqlRow("global_settings", [
      "id", "lang", "header_logo", "site_name", "nav_links", "cta_text", "cta_url", "footer_logo",
      "footer_description", "footer_lead_text", "quick_links", "office_address", "phone_number", "email_address",
      "telegram_url", "footer_cta_title", "footer_cta_email", "footer_copyright_text", "ui_labels", "google_site_verification_id",
    ], [
      1, locale, globals.headerLogo, globals.siteName, json(globals.navLinks, []), globals.ctaText, globals.ctaUrl,
      globals.footerLogo, globals.footerDescription, globals.footerLeadText, json(globals.quickLinks, []), globals.officeAddress,
      globals.phoneNumber, globals.emailAddress, globals.telegramUrl, globals.footerCtaTitle, globals.footerCtaEmail,
      globals.footerCopyrightText, json(globals.uiLabels, {}), globals.googleSiteVerificationId,
    ]));

    for (const pageId of ["home", "about", "privacy", "terms"]) {
      const legacyRow = pickLegacyRow(legacy, `${pageId}_page`, locale);
      const legacyContent = legacyRow?.content && typeof legacyRow.content === "object" && !Array.isArray(legacyRow.content) ? legacyRow.content : {};
      const content = sanitizeFlexibleContent(pageId, deepMerge(pageContentDefaults[locale][pageId], legacyContent));
      rows.push(sqlRow(`${pageId}_page`, ["id", "lang", "content"], [1, locale, json(content, {})]));
    }

    const productsPage = productsPageDefaults[locale];
    rows.push(sqlRow("products_page", [
      "id", "lang", "page_title", "page_subtitle", "hero_bg_image", "intro_eyebrow", "intro_title", "intro_content",
      "intro_image", "intro_facts", "ordering_bg_image", "ordering_form_title", "ordering_form_subtitle", "step_one_label",
      "step_two_label", "step_three_label", "mixed_container_label", "volume_options", "view_specs_label",
      "step_one_placeholder", "step_three_placeholder", "next_step_button_label", "back_button_label", "submit_button_label",
      "submitting_button_label", "detail_ui", "quick_contact_title", "quick_contact_subtitle", "telegram_label",
      "telegram_sublabel", "call_label", "email_label", "quick_phone", "quick_email",
    ], [
      1, locale, productsPage.pageTitle, productsPage.pageSubtitle, productsPage.heroBgImage, productsPage.introEyebrow,
      productsPage.introTitle, productsPage.introContent, productsPage.introImage, json(productsPage.introFacts, []),
      productsPage.orderingBgImage, productsPage.orderingFormTitle, productsPage.orderingFormSubtitle, productsPage.stepOneLabel,
      productsPage.stepTwoLabel, productsPage.stepThreeLabel, productsPage.mixedContainerLabel, json(productsPage.volumeOptions, []),
      productsPage.viewSpecsLabel, productsPage.stepOnePlaceholder, productsPage.stepThreePlaceholder, productsPage.nextStepButtonLabel,
      productsPage.backButtonLabel, productsPage.submitButtonLabel, productsPage.submittingButtonLabel, json(productsPage.detailUi, {}),
      productsPage.quickContactTitle, productsPage.quickContactSubtitle, productsPage.telegramLabel, productsPage.telegramSublabel,
      productsPage.callLabel, productsPage.emailLabel, productsPage.quickPhone, productsPage.quickEmail,
    ]));

    const exportPage = exportPageDefaults[locale];
    rows.push(sqlRow("export_page", [
      "id", "lang", "hero_title", "hero_subtitle", "hero_bg_image", "operations_image", "operations_eyebrow",
      "destination_eyebrow", "map_section_title", "supply_routes", "logistics_content", "packaging_title",
      "packaging_methods", "transportation_title", "transportation_methods", "documentation_title", "documentation_content",
      "quality_title", "technical_specs", "quality_checks", "certifications_gallery",
    ], [
      1, locale, exportPage.heroTitle, exportPage.heroSubtitle, exportPage.heroBgImage, exportPage.operationsImage,
      exportPage.operationsEyebrow, exportPage.destinationEyebrow, exportPage.mapSectionTitle, json(exportPage.supplyRoutes, []),
      exportPage.logisticsContent, exportPage.packagingTitle, exportPage.packagingMethods, exportPage.transportationTitle,
      exportPage.transportationMethods, exportPage.documentationTitle, exportPage.documentationContent, exportPage.qualityTitle,
      exportPage.technicalSpecs, json(exportPage.qualityChecks, []), json(exportPage.certificationsGallery, []),
    ]));

    const contactsPage = contactsPageDefaults[locale];
    rows.push(sqlRow("contacts_page", [
      "id", "lang", "page_title", "intro_text", "direct_contact_eyebrow", "form_destination_email", "contact_form_title",
      "response_label_prefix", "form_name_label", "form_company_label", "form_email_label", "form_message_label",
      "submit_button_label", "submitting_button_label", "email", "phone", "office_address", "working_hours",
      "map_pin_label", "info_email_label", "info_phone_label", "info_address_label", "info_hours_label",
      "social_section_title", "telegram_url", "instagram_url", "whatsapp_url", "facebook_url", "headquarters_image",
      "google_maps_url",
    ], [
      1, locale, contactsPage.pageTitle, contactsPage.introText, contactsPage.directContactEyebrow, contactsPage.formDestinationEmail,
      contactsPage.contactFormTitle, contactsPage.responseLabelPrefix, contactsPage.formNameLabel, contactsPage.formCompanyLabel,
      contactsPage.formEmailLabel, contactsPage.formMessageLabel, contactsPage.submitButtonLabel, contactsPage.submittingButtonLabel,
      contactsPage.emailAddress, contactsPage.phoneNumber, contactsPage.officeAddress, contactsPage.workingHours, contactsPage.mapPinLabel,
      contactsPage.infoEmailLabel, contactsPage.infoPhoneLabel, contactsPage.infoAddressLabel, contactsPage.infoHoursLabel,
      contactsPage.socialSectionTitle, contactsPage.telegramUrl, contactsPage.instagramUrl, contactsPage.whatsappUrl,
      contactsPage.facebookUrl, contactsPage.headquartersImage, contactsPage.googleMapsUrl,
    ]));

    for (const [pageId, seoParts] of Object.entries(defaultPageSeo[locale])) {
      rows.push(sqlRow("page_seo", ["page_id", "lang", "meta_title", "meta_description", "slug", "og_title", "image_alt"], [
        pageId, locale, seoParts[0], seoParts[1], seoParts[2], seoParts[3], seoParts[4],
      ]));
    }

    for (const productId of PRODUCT_IDS) {
      const text = productText[locale][productId];
      const media = productMedia[productId];
      rows.push(sqlRow("products", [
        "id", "lang", "name", "category", "status", "image", "image_gallery", "short_description",
        "long_description", "highlights", "content_sections", "nutrition", "inquiry_subject_line", "tonnage_options", "seo",
      ], [
        productId, locale, text.name, text.category, "Active", media.image, json(media.gallery, []), text.shortDescription,
        text.longDescription, json(text.highlights, []), json(text.sections, []), json(text.nutrition, {}),
        text.inquiry, json(commonVolumeOptions[locale], []), json({
          metaTitle: text.seo[0],
          metaDescription: text.seo[1],
          slug: text.seo[2],
          ogTitle: text.seo[3],
          imageAlt: text.seo[4],
        }, {}),
      ]));
    }
  }

  return rows;
}

const requiredColumns = {
  global_settings: ["id", "lang", "header_logo", "site_name", "nav_links", "cta_text", "cta_url", "footer_logo", "footer_description", "footer_lead_text", "quick_links", "office_address", "phone_number", "email_address", "telegram_url", "footer_cta_title", "footer_cta_email", "footer_copyright_text", "ui_labels", "google_site_verification_id"],
  home_page: ["id", "lang", "content"],
  about_page: ["id", "lang", "content"],
  privacy_page: ["id", "lang", "content"],
  terms_page: ["id", "lang", "content"],
  products_page: ["id", "lang", "page_title", "page_subtitle", "hero_bg_image", "intro_eyebrow", "intro_title", "intro_content", "intro_image", "intro_facts", "ordering_bg_image", "ordering_form_title", "ordering_form_subtitle", "step_one_label", "step_two_label", "step_three_label", "mixed_container_label", "volume_options", "view_specs_label", "step_one_placeholder", "step_three_placeholder", "next_step_button_label", "back_button_label", "submit_button_label", "submitting_button_label", "detail_ui", "quick_contact_title", "quick_contact_subtitle", "telegram_label", "telegram_sublabel", "call_label", "email_label", "quick_phone", "quick_email"],
  export_page: ["id", "lang", "hero_title", "hero_subtitle", "hero_bg_image", "operations_image", "operations_eyebrow", "destination_eyebrow", "map_section_title", "supply_routes", "logistics_content", "packaging_title", "packaging_methods", "transportation_title", "transportation_methods", "documentation_title", "documentation_content", "quality_title", "technical_specs", "quality_checks", "certifications_gallery"],
  contacts_page: ["id", "lang", "page_title", "intro_text", "direct_contact_eyebrow", "form_destination_email", "contact_form_title", "response_label_prefix", "form_name_label", "form_company_label", "form_email_label", "form_message_label", "submit_button_label", "submitting_button_label", "email", "phone", "office_address", "working_hours", "map_pin_label", "info_email_label", "info_phone_label", "info_address_label", "info_hours_label", "social_section_title", "telegram_url", "instagram_url", "whatsapp_url", "facebook_url", "headquarters_image", "google_maps_url"],
  products: ["id", "lang", "name", "category", "status", "image", "image_gallery", "short_description", "long_description", "highlights", "content_sections", "nutrition", "inquiry_subject_line", "tonnage_options", "seo"],
  page_seo: ["page_id", "lang", "meta_title", "meta_description", "slug", "og_title", "image_alt"],
  leads: ["id"],
};

function validateJsonValues(rows) {
  const jsonColumnHints = new Set([
    "nav_links", "quick_links", "ui_labels", "content", "intro_facts", "volume_options", "detail_ui",
    "supply_routes", "quality_checks", "certifications_gallery", "image_gallery", "highlights",
    "content_sections", "nutrition", "tonnage_options", "seo",
  ]);

  for (const row of rows) {
    row.columns.forEach((column, index) => {
      if (!jsonColumnHints.has(column)) return;
      const value = row.values[index];
      if (typeof value !== "string") return;
      JSON.parse(value);
    });
  }
}

async function validateSchema(conn) {
  for (const [table, columns] of Object.entries(requiredColumns)) {
    const [rows] = await conn.query(`SHOW COLUMNS FROM \`${table}\``);
    const actual = new Set(rows.map((row) => row.Field));
    const missing = columns.filter((column) => !actual.has(column));
    if (missing.length) {
      throw new Error(`Table ${table} is missing columns: ${missing.join(", ")}`);
    }
  }
}

function createReplaceSql(row) {
  const columns = row.columns.map((column) => `\`${column}\``).join(", ");
  const placeholders = row.columns.map(() => "?").join(", ");
  return `REPLACE INTO \`${row.table}\` (${columns}) VALUES (${placeholders})`;
}

async function executeImport(conn, rows) {
  await conn.beginTransaction();
  try {
    const productPlaceholders = PRODUCT_IDS.map(() => "?").join(", ");
    await conn.execute(`DELETE FROM products WHERE id NOT IN (${productPlaceholders})`, PRODUCT_IDS);

    for (const row of rows) {
      await conn.execute(createReplaceSql(row), row.values);
    }

    await conn.commit();
  } catch (error) {
    await conn.rollback();
    throw error;
  }
}

async function verify(conn) {
  const tables = ["global_settings", "home_page", "about_page", "products_page", "export_page", "contacts_page", "privacy_page", "terms_page", "page_seo", "products", "leads"];
  for (const table of tables) {
    const [rows] = await conn.query(`SELECT COUNT(*) AS count FROM \`${table}\``);
    console.log(`${table}: ${rows[0].count}`);
  }

  for (const locale of ACTIVE_LOCALES) {
    const [rows] = await conn.query("SELECT id, name, status FROM products WHERE lang = ? ORDER BY id", [locale]);
    console.log(`products/${locale}: ${rows.length} -> ${rows.map((row) => row.id).join(", ")}`);
  }
}

async function main() {
  const env = loadEnv(path.join(process.cwd(), ".env"));
  const rows = buildRows();
  validateJsonValues(rows);

  const byTable = rows.reduce((acc, row) => {
    acc[row.table] = (acc[row.table] || 0) + 1;
    return acc;
  }, {});

  console.log(shouldExecute ? "Mode: EXECUTE" : "Mode: DRY RUN");
  console.log(offline ? "Database: offline schema validation skipped" : `Database: ${env.DB_HOST || "localhost"}:${env.DB_PORT || "3306"}/${env.DB_NAME || "hqdriedfruits_db"}`);
  console.log("Rows prepared:");
  for (const [table, count] of Object.entries(byTable).sort()) {
    console.log(`  ${table}: ${count}`);
  }

  if (offline) {
    console.log("Offline validation complete. No database connection was opened.");
    return;
  }

  const conn = await mysql.createConnection({
    host: env.DB_HOST || "localhost",
    user: env.DB_USER || "root",
    password: env.DB_PASS || "",
    database: env.DB_NAME || "hqdriedfruits_db",
    port: Number(env.DB_PORT || 3306),
    multipleStatements: false,
  });

  try {
    await validateSchema(conn);
    console.log("Schema validation passed.");

    if (shouldExecute) {
      await executeImport(conn, rows);
      console.log("Import completed.");
    } else {
      console.log("Dry run complete. No rows were written.");
    }

    await verify(conn);
  } finally {
    await conn.end();
  }
}

main().catch((error) => {
  console.error("MySQL import failed:");
  console.error(error.message || error);
  process.exit(1);
});
