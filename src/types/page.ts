export interface NavLink {
    label: string;
    url: string;
}

export interface GlobalUILabels {
    mobileNavigationTitle: string;
    mobileContactTitle: string;
    footerLinksTitle: string;
    footerCompanyPlaceholder: string;
    footerEmailPlaceholder: string;
    footerSubmitLabel: string;
    footerSubmittingLabel: string;
    footerSecondaryContactPrefix: string;
    footerTelegramLinkLabel: string;
    footerAdminLinkLabel: string;
    footerPrivacyLinkLabel: string;
    footerTermsLinkLabel: string;
    routeLoadingLabel: string;
    notFoundTitle: string;
    notFoundBody: string;
    notFoundButtonLabel: string;
}

export interface SocialLink {
    platformName: string;
    url: string;
    iconImage: string;
}

export interface GlobalSettings {
    headerLogo: string;
    siteName: string;
    navLinks: NavLink[];
    ctaText: string;
    ctaUrl: string;

    footerLogo: string;
    footerDescription: string;
    footerLeadText: string;
    quickLinks: NavLink[];
    officeAddress: string;
    phoneNumber: string;
    emailAddress: string;
    telegramUrl: string;
    footerCtaTitle: string;
    footerCtaEmail: string;
    footerCopyrightText: string;
    uiLabels: GlobalUILabels;

    googleSiteVerificationId?: string;
}

export interface StatItem {
    value: string;
    label: string;
}

export interface ImageLabelPair {
    image: string;
    label: string;
}

export interface ProductCategoryItem {
    categoryName: string;
    image: string;
    shortDescription: string;
    url: string;
}

export interface HomeExportMarketItem {
    countryName: string;
    shortDescription: string;
    statLabel: string;
    statValue: string;
    image: string;
}

export interface StatBox {
    boxNumber: string;
    title: string;
    description: string;
}

export interface TextBlockItem {
    title: string;
    description: string;
}

export interface SupplyRoute {
    countryName: string;
    mapCoordinatesId: string;
    tooltipDescription: string;
    image: string;
}

export interface CertItem {
    image: string;
    caption: string;
}

export interface AboutProductionItem {
    image: string;
    title: string;
    subtitle: string;
    description: string;
}

export interface HomeContent {
    heroBgImage: string;
    heroTitle: string;
    heroSubtitle: string;
    heroPrimaryCtaLabel: string;
    heroSecondaryCtaLabel: string;
    progressSlider: ImageLabelPair[];

    introLabel: string;
    introText: string;
    statsGrid: StatItem[];

    productPreviewTitle: string;
    productPreviewButtonLabel: string;
    productPreviewItemCtaLabel: string;
    productCategories: ProductCategoryItem[];

    exportMarketsEyebrow: string;
    exportMarketsTitle: string;
    exportMarketsIntro: string;
    exportMarkets: HomeExportMarketItem[];

    supplyReachTitle: string;
    supplyReachOverview: string;
    supplyReachBgImage: string;
    supplyReachButtonLabel: string;

    ctaBgImage: string;
    ctaHeading: string;
    ctaSubheading: string;
    ctaButtonText: string;
    ctaButtonUrl: string;
    ctaLinkLabel: string;
    ctaEmailPlaceholder: string;
    ctaSubmittingLabel: string;
}

export interface ProductDetailUIContent {
    loadingLabel: string;
    notFoundTitle: string;
    notFoundBody: string;
    backToCatalogLabel: string;
    nutritionTitle: string;
    nutritionPerLabel: string;
    caloriesLabel: string;
    proteinLabel: string;
    fatLabel: string;
    carbsLabel: string;
    inquiryTitle: string;
    companyPlaceholder: string;
    emailPlaceholder: string;
    volumePlaceholder: string;
    inquiryButtonLabel: string;
    inquirySubmittingLabel: string;
}

export interface AboutContent {
    marqueeTitle: string;
    productionMarqueeImages: string[];
    partnerLogos: string[];
    partnerSectionLabel: string;

    heritageTitle: string;
    heritageSubtitle: string;
    whoWeAreContent: string;
    heritageStats: StatBox[];
    heritageImagery: string[];

    missionTitle: string;
    missionStatement: string;
    philosophyTitle: string;
    orchardPhilosophy: string;
    productionStandardsTitle: string;
    productionStandards: string;
    missionPhotography: string;
    ownProductionTitle: string;
    ownProductionIntro: string;
    ownProductionItems: AboutProductionItem[];
}

export interface ProductsContent {
    pageTitle: string;
    pageSubtitle: string;
    heroBgImage: string;

    orderingBgImage: string;
    orderingFormTitle: string;
    orderingFormSubtitle: string;
    stepOneLabel: string;
    stepTwoLabel: string;
    stepThreeLabel: string;
    mixedContainerLabel: string;
    volumeOptions: string[];
    viewSpecsLabel: string;
    stepOnePlaceholder: string;
    stepThreePlaceholder: string;
    nextStepButtonLabel: string;
    backButtonLabel: string;
    submitButtonLabel: string;
    submittingButtonLabel: string;
    detailUi: ProductDetailUIContent;

    quickContactTitle: string;
    quickContactSubtitle: string;
    telegramLabel: string;
    telegramSublabel: string;
    callLabel: string;
    emailLabel: string;
    quickPhone: string;
    quickEmail: string;
}

export interface ExportContent {
    heroTitle: string;
    heroSubtitle: string;
    heroBgImage: string;
    mapSectionTitle: string;
    supplyRoutes: SupplyRoute[];

    logisticsContent: string;
    packagingTitle: string;
    packagingMethods: string;
    transportationTitle: string;
    transportationMethods: string;
    documentationTitle: string;
    documentationContent: string;

    qualityTitle: string;
    technicalSpecs: string;
    qualityChecks: TextBlockItem[];

    certificationsGallery: CertItem[];
}

export interface ContactsContent {
    pageTitle: string;
    introText: string;
    formDestinationEmail: string;
    contactFormTitle: string;
    responseLabelPrefix: string;
    formNameLabel: string;
    formCompanyLabel: string;
    formEmailLabel: string;
    formMessageLabel: string;
    submitButtonLabel: string;
    submittingButtonLabel: string;

    emailAddress: string;
    phoneNumber: string;
    officeAddress: string;
    workingHours: string;
    mapPinLabel: string;
    infoEmailLabel: string;
    infoPhoneLabel: string;
    infoAddressLabel: string;
    infoHoursLabel: string;
    socialSectionTitle: string;
    telegramUrl: string;
    instagramUrl: string;
    whatsappUrl: string;
    facebookUrl: string;

    headquartersImage: string;
    googleMapsUrl: string;
}

export interface SimplePageContent {
    title: string;
    body: string;
}

export interface PageData {
    id: string;
    name: string;
    path: string;
    content: HomeContent | AboutContent | ProductsContent | ExportContent | ContactsContent | SimplePageContent | any;
}
