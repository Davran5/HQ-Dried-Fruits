const mysql = require("mysql2/promise");
require("dotenv").config();

const execute = process.argv.includes("--execute");
const backupConfirmed = process.argv.includes("--i-backed-up") || process.env.MYSQL_IMPORT_BACKUP_CONFIRMED === "1";
const activeLocales = ["en", "pt", "es", "nl", "fr"];
const pageIds = ["home", "about", "products", "export", "contacts", "privacy", "terms"];
const singletonTables = ["global_settings", "home_page", "about_page", "products_page", "export_page", "contacts_page", "privacy_page", "terms_page"];

if (execute && !backupConfirmed) {
  console.error("Refusing to write without backup confirmation.");
  console.error("Run a DB backup first, then run:");
  console.error("  npm run repair:copy:execute -- --i-backed-up");
  process.exit(1);
}

const categoryCopy = {
  en: {
    raisins: "Raisins",
    "dried-apricot": "Dried Apricots",
    prunes: "Prunes",
    peanuts: "Peanuts",
  },
  pt: {
    raisins: "Passas",
    "dried-apricot": "Damascos secos",
    prunes: "Ameixas secas",
    peanuts: "Amendoim",
  },
  es: {
    raisins: "Pasas",
    "dried-apricot": "Albaricoques secos",
    prunes: "Ciruelas pasas",
    peanuts: "Maní",
  },
  nl: {
    raisins: "Rozijnen",
    "dried-apricot": "Gedroogde abrikozen",
    prunes: "Gedroogde pruimen",
    peanuts: "Pinda's",
  },
  fr: {
    raisins: "Raisins secs",
    "dried-apricot": "Abricots secs",
    prunes: "Pruneaux",
    peanuts: "Cacahuètes",
  },
};

const globalCopy = {
  en: {
    nav: ["Home", "About", "Products", "Export", "Contacts"],
    cta: "Request a quote",
    footerDescription:
      "Uzbek dried fruit supply for importers, manufacturers, and wholesale programs that need consistent lots, clear documents, and reliable dispatch.",
    footerLeadText: "Send us your target product, volume, and destination. We will come back with practical export options.",
    quickLinks: ["About", "Export", "Contacts"],
    footerCtaTitle: "Planning a container or mixed load?",
    copyright: "HQ Dried Fruits. All rights reserved.",
    ui: {
      routeLoadingLabel: "Loading page...",
      notFoundTitle: "Page not found",
      notFoundBody: "This address is no longer active or the page has moved.",
      notFoundButtonLabel: "Return home",
      requestCatalogLabel: "Request catalog",
      exploreProductsLabel: "Explore products",
      footerLinksTitle: "Company",
      footerSubmitLabel: "Send",
      footerSubmittingLabel: "Sending",
      footerInquirySuccess: "Request received. Our export team will reply shortly.",
      footerInquiryError: "The request could not be sent. Please try again.",
    },
  },
  pt: {
    nav: ["Início", "Sobre", "Produtos", "Exportação", "Contato"],
    cta: "Solicitar cotação",
    footerDescription:
      "Frutas secas do Uzbequistão para importadores, indústrias e programas atacadistas que precisam de lotes consistentes, documentos claros e embarques confiáveis.",
    footerLeadText: "Envie produto, volume e destino. Respondemos com opções reais de exportação, sem texto genérico.",
    quickLinks: ["Sobre", "Exportação", "Contato"],
    footerCtaTitle: "Está planejando um contêiner ou carga mista?",
    copyright: "HQ Dried Fruits. Todos os direitos reservados.",
    ui: {
      routeLoadingLabel: "Carregando página...",
      notFoundTitle: "Página não encontrada",
      notFoundBody: "Este endereço não está mais ativo ou a página mudou.",
      notFoundButtonLabel: "Voltar ao início",
      requestCatalogLabel: "Solicitar catálogo",
      exploreProductsLabel: "Ver produtos",
      footerLinksTitle: "Empresa",
      footerSubmitLabel: "Enviar",
      footerSubmittingLabel: "Enviando",
      footerInquirySuccess: "Solicitação recebida. Nossa equipe de exportação responderá em breve.",
      footerInquiryError: "Não foi possível enviar a solicitação. Tente novamente.",
    },
  },
  es: {
    nav: ["Inicio", "Empresa", "Productos", "Exportación", "Contacto"],
    cta: "Solicitar cotización",
    footerDescription:
      "Suministro uzbeko de frutos secos para importadores, fabricantes y programas mayoristas que necesitan lotes constantes, documentación clara y despachos fiables.",
    footerLeadText: "Indíquenos producto, volumen y destino. Le responderemos con opciones de exportación concretas.",
    quickLinks: ["Empresa", "Exportación", "Contacto"],
    footerCtaTitle: "¿Está preparando un contenedor o una carga mixta?",
    copyright: "HQ Dried Fruits. Todos los derechos reservados.",
    ui: {
      routeLoadingLabel: "Cargando página...",
      notFoundTitle: "Página no encontrada",
      notFoundBody: "Esta dirección ya no está activa o la página fue movida.",
      notFoundButtonLabel: "Volver al inicio",
      requestCatalogLabel: "Solicitar catálogo",
      exploreProductsLabel: "Ver productos",
      footerLinksTitle: "Empresa",
      footerSubmitLabel: "Enviar",
      footerSubmittingLabel: "Enviando",
      footerInquirySuccess: "Solicitud recibida. Nuestro equipo de exportación responderá pronto.",
      footerInquiryError: "No se pudo enviar la solicitud. Inténtelo de nuevo.",
    },
  },
  nl: {
    nav: ["Home", "Over ons", "Producten", "Export", "Contact"],
    cta: "Offerte aanvragen",
    footerDescription:
      "Oezbeekse gedroogde vruchten voor importeurs, producenten en groothandelsprogramma's die vaste partijen, duidelijke documenten en betrouwbare verzending nodig hebben.",
    footerLeadText: "Stuur product, volume en bestemming door. Wij reageren met praktische exportopties.",
    quickLinks: ["Over ons", "Export", "Contact"],
    footerCtaTitle: "Een container of gemengde lading aan het plannen?",
    copyright: "HQ Dried Fruits. Alle rechten voorbehouden.",
    ui: {
      routeLoadingLabel: "Pagina laden...",
      notFoundTitle: "Pagina niet gevonden",
      notFoundBody: "Dit adres is niet meer actief of de pagina is verplaatst.",
      notFoundButtonLabel: "Terug naar home",
      requestCatalogLabel: "Catalogus aanvragen",
      exploreProductsLabel: "Producten bekijken",
      footerLinksTitle: "Bedrijf",
      footerSubmitLabel: "Verzenden",
      footerSubmittingLabel: "Verzenden",
      footerInquirySuccess: "Aanvraag ontvangen. Ons exportteam neemt binnenkort contact op.",
      footerInquiryError: "De aanvraag kon niet worden verzonden. Probeer het opnieuw.",
    },
  },
  fr: {
    nav: ["Accueil", "À propos", "Produits", "Export", "Contact"],
    cta: "Demander un devis",
    footerDescription:
      "Fruits secs d'Ouzbékistan pour importateurs, industriels et programmes de gros qui exigent des lots réguliers, des documents clairs et des expéditions fiables.",
    footerLeadText: "Indiquez le produit, le volume et la destination. Nous reviendrons avec des options d'exportation concrètes.",
    quickLinks: ["À propos", "Export", "Contact"],
    footerCtaTitle: "Vous préparez un conteneur ou un chargement mixte ?",
    copyright: "HQ Dried Fruits. Tous droits réservés.",
    ui: {
      routeLoadingLabel: "Chargement de la page...",
      notFoundTitle: "Page introuvable",
      notFoundBody: "Cette adresse n'est plus active ou la page a été déplacée.",
      notFoundButtonLabel: "Retour à l'accueil",
      requestCatalogLabel: "Demander le catalogue",
      exploreProductsLabel: "Voir les produits",
      footerLinksTitle: "Entreprise",
      footerSubmitLabel: "Envoyer",
      footerSubmittingLabel: "Envoi",
      footerInquirySuccess: "Demande reçue. Notre équipe export vous répondra rapidement.",
      footerInquiryError: "La demande n'a pas pu être envoyée. Veuillez réessayer.",
    },
  },
};

const buyerChannelImages = {
  retail: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?q=80&w=1600&auto=format&fit=crop",
  wholesale: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1600&auto=format&fit=crop",
  industry: "https://images.unsplash.com/photo-1556911220-bff31c812dba?q=80&w=1600&auto=format&fit=crop",
  privateLabel: "https://images.unsplash.com/photo-1607082350899-7e105aa886ae?q=80&w=1600&auto=format&fit=crop",
};

const buyerChannelCopy = {
  en: {
    eyebrow: "Buyer Channels",
    title: "Prepared for the way your business sells",
    intro: "Different buyers need different packing, documentation, and product presentation. We prepare Uzbek dried fruit lines for retail shelves, wholesale cartons, food production, and private-label programs.",
    channels: [
      ["Retail", "RTL", "Shelf-ready dried fruit lines for pouch, tray, and branded pack programs.", "Channel Fit", "Shelf-ready", buyerChannelImages.retail],
      ["Wholesale", "WHL", "Carton-based supply for importers, distributors, and trading programs.", "Format", "Cartons", buyerChannelImages.wholesale],
      ["Food Industry", "IND", "Ingredient-ready fruit and peanut lines for bakeries, confectionery, snacks, cereals, and processing.", "Use Case", "Ingredients", buyerChannelImages.industry],
      ["Private Label", "PL", "Buyer-brand packing discussions with label, carton, and repeat-order consistency in mind.", "Branding", "Buyer label", buyerChannelImages.privateLabel],
    ],
  },
  pt: {
    eyebrow: "Canais compradores",
    title: "Preparado para a forma como o seu negócio vende",
    intro: "Cada comprador precisa de embalagem, documentação e apresentação de produto diferentes. Preparamos frutas secas uzbeques para prateleiras de varejo, caixas de atacado, produção alimentícia e programas de marca própria.",
    channels: [
      ["Varejo", "RTL", "Linhas de frutas secas prontas para prateleira, em pouches, bandejas e embalagens de marca.", "Perfil do canal", "Pronto para prateleira", buyerChannelImages.retail],
      ["Atacado", "WHL", "Fornecimento em caixas para importadores, distribuidores e programas de trading.", "Formato", "Caixas", buyerChannelImages.wholesale],
      ["Indústria alimentícia", "IND", "Frutas e amendoim prontos para uso como ingredientes em panificação, confeitaria, snacks, cereais e processamento.", "Uso", "Ingredientes", buyerChannelImages.industry],
      ["Marca própria", "PL", "Discussões de embalagem com a marca do comprador, considerando rótulo, caixa e consistência em pedidos recorrentes.", "Marca", "Rótulo do comprador", buyerChannelImages.privateLabel],
    ],
  },
  es: {
    eyebrow: "Canales compradores",
    title: "Preparado para la forma en que vende su negocio",
    intro: "Cada comprador necesita un empaque, documentación y presentación de producto diferentes. Preparamos frutas secas uzbekas para retail, cajas mayoristas, producción alimentaria y programas de marca privada.",
    channels: [
      ["Retail", "RTL", "Líneas de frutas secas listas para el punto de venta, en pouch, bandeja y formatos de marca.", "Perfil del canal", "Listo para retail", buyerChannelImages.retail],
      ["Mayorista", "WHL", "Suministro en cajas para importadores, distribuidores y programas de trading.", "Formato", "Cajas", buyerChannelImages.wholesale],
      ["Industria alimentaria", "IND", "Frutas y maní listos como ingredientes para panaderías, confitería, snacks, cereales y procesamiento.", "Uso", "Ingredientes", buyerChannelImages.industry],
      ["Marca privada", "PL", "Proyectos de empaque con la marca del comprador, cuidando etiqueta, caja y consistencia en pedidos repetidos.", "Marca", "Etiqueta del comprador", buyerChannelImages.privateLabel],
    ],
  },
  nl: {
    eyebrow: "Koperskanalen",
    title: "Voorbereid op hoe uw bedrijf verkoopt",
    intro: "Elke koper heeft andere verpakking, documentatie en productpresentatie nodig. Wij bereiden Oezbeekse gedroogde vruchten voor retail, groothandelskartons, voedselproductie en private-labelprogramma's.",
    channels: [
      ["Retail", "RTL", "Schapklare gedroogde fruitlijnen voor pouches, trays en merkverpakkingen.", "Kanaalfit", "Schapklaar", buyerChannelImages.retail],
      ["Groothandel", "WHL", "Kartongebaseerde levering voor importeurs, distributeurs en handelsprogramma's.", "Formaat", "Kartons", buyerChannelImages.wholesale],
      ["Voedingsindustrie", "IND", "Ingrediëntklare fruit- en pindalijnen voor bakkerij, confiserie, snacks, ontbijtgranen en verwerking.", "Gebruik", "Ingrediënten", buyerChannelImages.industry],
      ["Private Label", "PL", "Verpakkingsafstemming voor het merk van de koper, met aandacht voor label, karton en herhaalorderconsistentie.", "Branding", "Koperslabel", buyerChannelImages.privateLabel],
    ],
  },
  fr: {
    eyebrow: "Canaux acheteurs",
    title: "Préparé pour la façon dont votre entreprise vend",
    intro: "Chaque acheteur attend un emballage, des documents et une présentation produit adaptés. Nous préparons les fruits secs ouzbeks pour le retail, les cartons de gros, l'industrie alimentaire et les programmes de marque privée.",
    channels: [
      ["Retail", "RTL", "Lignes de fruits secs prêtes pour le rayon, en sachets, barquettes et emballages de marque.", "Profil canal", "Prêt rayon", buyerChannelImages.retail],
      ["Gros", "WHL", "Approvisionnement en cartons pour importateurs, distributeurs et programmes de trading.", "Format", "Cartons", buyerChannelImages.wholesale],
      ["Industrie alimentaire", "IND", "Fruits et cacahuètes prêts pour ingrédients, adaptés à la boulangerie, confiserie, snacks, céréales et transformation.", "Usage", "Ingrédients", buyerChannelImages.industry],
      ["Marque privée", "PL", "Discussions d'emballage à la marque de l'acheteur, avec attention portée à l'étiquette, au carton et à la régularité des commandes.", "Marque", "Étiquette acheteur", buyerChannelImages.privateLabel],
    ],
  },
};

function buyerChannelHomeMarkets(locale) {
  return buyerChannelCopy[locale].channels.map(([countryName, , shortDescription, statLabel, statValue, image]) => ({
    countryName,
    shortDescription,
    statLabel,
    statValue,
    image,
  }));
}

function buyerChannelSupplyRoutes(locale) {
  return buyerChannelCopy[locale].channels.map(([countryName, mapCoordinatesId, tooltipDescription, , , image]) => ({
    countryName,
    mapCoordinatesId,
    tooltipDescription,
    image,
  }));
}

const homeCopy = {
  en: {
    heroTitle: "Naturally Sweet Fruits From Rich Soil",
    heroSubtitle:
      "Export-ready raisins, apricots, prunes, and peanuts from Uzbekistan, sorted for buyers who care about stable lots, clean documentation, and repeat supply.",
    heroPrimaryCtaLabel: "Request catalog",
    heroSecondaryCtaLabel: "View products",
    introLabel: "Uzbekistan sourcing",
    introText:
      "Our work starts with the crop: grape, apricot, plum, and peanut lines selected for drying quality, cleaned before packing, and prepared around wholesale requirements.",
    productPreviewTitle: "Product categories",
    productPreviewButtonLabel: "View full catalog",
    productPreviewItemCtaLabel: "View in catalog",
    productPreviewCategoryLabel: "Product category",
    productPreviewTypesLabel: "Types",
    productCategories: [
      ["raisins", "Raisins", "Calibrated raisin lines for bakeries, snack brands, importers, and ingredient buyers.", "Golden, Sultana, Soyaki, Black-Red"],
      ["dried-apricot", "Dried Apricots", "Uzbek apricot selections for retail packs, confectionery, bakery use, and mixed containers.", "Subhana, Subhana Confectioner"],
      ["prunes", "Prunes", "Prune lots prepared for retail, processing, and wholesale programs that need predictable sizing.", "Spanish Prunes, Hungarian Unpitted, Ashlock"],
      ["peanuts", "Peanuts", "Sorted peanut supply for roasting, snack production, trading, and feed-related demand.", "In shell, Shelled, Bird Feed"],
    ],
    exportMarketsEyebrow: buyerChannelCopy.en.eyebrow,
    exportMarketsTitle: buyerChannelCopy.en.title,
    exportMarketsIntro: buyerChannelCopy.en.intro,
    exportMarkets: buyerChannelHomeMarkets("en"),
  },
  pt: {
    heroTitle: "Frutas naturalmente doces de um solo fértil",
    heroSubtitle:
      "Passas, damascos, ameixas secas e amendoim preparados para exportação, com seleção cuidadosa, documentação clara e fornecimento recorrente.",
    heroPrimaryCtaLabel: "Solicitar catálogo",
    heroSecondaryCtaLabel: "Ver produtos",
    introLabel: "Origem Uzbequistão",
    introText:
      "A qualidade começa na safra: uvas, damascos, ameixas e amendoim escolhidos pela aptidão de secagem, limpos antes da embalagem e ajustados às exigências do atacado.",
    productPreviewTitle: "Categorias de produtos",
    productPreviewButtonLabel: "Ver catálogo completo",
    productPreviewItemCtaLabel: "Ver no catálogo",
    productPreviewCategoryLabel: "Categoria",
    productPreviewTypesLabel: "Tipos",
    productCategories: [
      ["raisins", "Passas", "Linhas calibradas de passas para padarias, marcas de snacks, importadores e compradores industriais.", "Golden, Sultana, Soyaki, Black-Red"],
      ["dried-apricot", "Damascos secos", "Seleções uzbeques de damasco para varejo, confeitaria, panificação e contêineres mistos.", "Subhana, Subhana Confectioner"],
      ["prunes", "Ameixas secas", "Lotes de ameixa seca para varejo, processamento e programas atacadistas com tamanho previsível.", "Spanish Prunes, Hungarian Unpitted, Ashlock"],
      ["peanuts", "Amendoim", "Amendoim selecionado para torrefação, snacks, trading e demandas ligadas à alimentação animal.", "Com casca, Descascado, Bird Feed"],
    ],
    exportMarketsEyebrow: buyerChannelCopy.pt.eyebrow,
    exportMarketsTitle: buyerChannelCopy.pt.title,
    exportMarketsIntro: buyerChannelCopy.pt.intro,
    exportMarkets: buyerChannelHomeMarkets("pt"),
  },
  es: {
    heroTitle: "Frutas naturalmente dulces de una tierra fértil",
    heroSubtitle:
      "Pasas, albaricoques, ciruelas pasas y maní preparados para exportación, con lotes seleccionados, documentación clara y suministro repetible.",
    heroPrimaryCtaLabel: "Solicitar catálogo",
    heroSecondaryCtaLabel: "Ver productos",
    introLabel: "Origen Uzbekistán",
    introText:
      "La calidad empieza en la cosecha: uvas, albaricoques, ciruelas y maní elegidos por su comportamiento en secado, limpiados antes del empaque y preparados para compras mayoristas.",
    productPreviewTitle: "Categorías de producto",
    productPreviewButtonLabel: "Ver catálogo completo",
    productPreviewItemCtaLabel: "Ver en catálogo",
    productPreviewCategoryLabel: "Categoría",
    productPreviewTypesLabel: "Tipos",
    productCategories: [
      ["raisins", "Pasas", "Líneas calibradas de pasas para panificación, snacks, importadores y compradores de ingredientes.", "Golden, Sultana, Soyaki, Black-Red"],
      ["dried-apricot", "Albaricoques secos", "Selecciones uzbekas de albaricoque para retail, confitería, panadería y cargas mixtas.", "Subhana, Subhana Confectioner"],
      ["prunes", "Ciruelas pasas", "Lotes de ciruela pasa para retail, procesamiento y programas mayoristas con tamaño estable.", "Spanish Prunes, Hungarian Unpitted, Ashlock"],
      ["peanuts", "Maní", "Maní seleccionado para tostado, snacks, trading y necesidades relacionadas con alimento animal.", "Con cáscara, Pelado, Bird Feed"],
    ],
    exportMarketsEyebrow: buyerChannelCopy.es.eyebrow,
    exportMarketsTitle: buyerChannelCopy.es.title,
    exportMarketsIntro: buyerChannelCopy.es.intro,
    exportMarkets: buyerChannelHomeMarkets("es"),
  },
  nl: {
    heroTitle: "Natuurlijk zoete vruchten uit vruchtbare grond",
    heroSubtitle:
      "Rozijnen, abrikozen, gedroogde pruimen en pinda's exportklaar gemaakt voor kopers die vaste partijen, duidelijke documenten en herhaalbare levering nodig hebben.",
    heroPrimaryCtaLabel: "Catalogus aanvragen",
    heroSecondaryCtaLabel: "Producten bekijken",
    introLabel: "Herkomst Oezbekistan",
    introText:
      "De kwaliteit begint bij de oogst: druiven, abrikozen, pruimen en pinda's geselecteerd op droogkwaliteit, gereinigd voor verpakking en afgestemd op groothandelsbehoeften.",
    productPreviewTitle: "Productcategorieën",
    productPreviewButtonLabel: "Volledige catalogus",
    productPreviewItemCtaLabel: "Bekijk in catalogus",
    productPreviewCategoryLabel: "Categorie",
    productPreviewTypesLabel: "Typen",
    productCategories: [
      ["raisins", "Rozijnen", "Gekalibreerde rozijnenlijnen voor bakkerijen, snackmerken, importeurs en ingrediëntkopers.", "Golden, Sultana, Soyaki, Black-Red"],
      ["dried-apricot", "Gedroogde abrikozen", "Oezbeekse abrikozen voor retailverpakking, confiserie, bakkerijgebruik en gemengde containers.", "Subhana, Subhana Confectioner"],
      ["prunes", "Gedroogde pruimen", "Pruimenpartijen voor retail, verwerking en groothandelsprogramma's met voorspelbare sortering.", "Spanish Prunes, Hungarian Unpitted, Ashlock"],
      ["peanuts", "Pinda's", "Gesorteerde pinda's voor roosteren, snackproductie, handel en feed-gerelateerde vraag.", "In de dop, Gepeld, Bird Feed"],
    ],
    exportMarketsEyebrow: buyerChannelCopy.nl.eyebrow,
    exportMarketsTitle: buyerChannelCopy.nl.title,
    exportMarketsIntro: buyerChannelCopy.nl.intro,
    exportMarkets: buyerChannelHomeMarkets("nl"),
  },
  fr: {
    heroTitle: "Des fruits naturellement doux issus d'une terre fertile",
    heroSubtitle:
      "Raisins secs, abricots, pruneaux et cacahuètes préparés pour l'export, avec lots réguliers, documentation claire et approvisionnement reconductible.",
    heroPrimaryCtaLabel: "Demander le catalogue",
    heroSecondaryCtaLabel: "Voir les produits",
    introLabel: "Origine Ouzbékistan",
    introText:
      "La qualité commence à la récolte : raisins, abricots, prunes et cacahuètes choisis pour leur tenue au séchage, nettoyés avant emballage et préparés selon les besoins du gros.",
    productPreviewTitle: "Catégories de produits",
    productPreviewButtonLabel: "Voir tout le catalogue",
    productPreviewItemCtaLabel: "Voir au catalogue",
    productPreviewCategoryLabel: "Catégorie",
    productPreviewTypesLabel: "Types",
    productCategories: [
      ["raisins", "Raisins secs", "Lignes calibrées de raisins secs pour boulangerie, snacks, importateurs et acheteurs ingrédients.", "Golden, Sultana, Soyaki, Black-Red"],
      ["dried-apricot", "Abricots secs", "Sélections d'abricots ouzbeks pour retail, confiserie, boulangerie et chargements mixtes.", "Subhana, Subhana Confectioner"],
      ["prunes", "Pruneaux", "Lots de pruneaux pour retail, transformation et programmes de gros avec calibre maîtrisé.", "Spanish Prunes, Hungarian Unpitted, Ashlock"],
      ["peanuts", "Cacahuètes", "Cacahuètes triées pour torréfaction, snacks, trading et besoins liés à l'alimentation animale.", "En coque, Décortiquées, Bird Feed"],
    ],
    exportMarketsEyebrow: buyerChannelCopy.fr.eyebrow,
    exportMarketsTitle: buyerChannelCopy.fr.title,
    exportMarketsIntro: buyerChannelCopy.fr.intro,
    exportMarkets: buyerChannelHomeMarkets("fr"),
  },
};

const aboutCopy = {
  en: {
    marqueeTitle: "Production, sourcing, and export under one roof",
    heritageSubtitle: "A practical view of the orchards, processing discipline, and documents behind each shipment.",
    missionTitle: "Our role",
    missionStatement:
      "<p>We connect Uzbek agricultural supply with buyers who need repeatable dried fruit programs, not one-off spot offers.</p>",
    philosophyTitle: "How we work",
    whoWeAreContent:
      "<p>HQ Dried Fruits works with selected crop lines, controlled processing, and export documentation so importers can evaluate products with less guesswork.</p><p>The aim is straightforward: stable quality, honest specifications, and shipments prepared around the buyer's market.</p>",
    orchardPhilosophy:
      "Reliable export supply is built before packing starts: crop selection, moisture control, sorting discipline, and clear records decide whether a lot can be repeated.",
    productionStandardsTitle: "Production standards",
    productionStandards:
      "Lots are cleaned, sorted, checked, and packed with traceability in mind. Certification labels matter, but daily process control matters more.",
  },
  pt: {
    marqueeTitle: "Produção, origem e exportação no mesmo processo",
    heritageSubtitle: "Uma visão prática dos pomares, do controle de processamento e dos documentos de cada embarque.",
    missionTitle: "Nosso papel",
    missionStatement:
      "<p>Ligamos a produção agrícola do Uzbequistão a compradores que precisam de programas recorrentes de frutas secas, não apenas ofertas pontuais.</p>",
    philosophyTitle: "Como trabalhamos",
    whoWeAreContent:
      "<p>A HQ Dried Fruits combina linhas de safra selecionadas, processamento controlado e documentação de exportação para reduzir incertezas na compra.</p><p>O objetivo é simples: qualidade estável, especificações honestas e embarques preparados para o mercado do comprador.</p>",
    orchardPhilosophy:
      "Fornecimento confiável se constrói antes da embalagem: seleção da safra, controle de umidade, triagem disciplinada e registros claros definem se um lote pode ser repetido.",
    productionStandardsTitle: "Padrões de produção",
    productionStandards:
      "Os lotes são limpos, selecionados, conferidos e embalados com rastreabilidade. Certificações ajudam, mas o controle diário do processo é decisivo.",
  },
  es: {
    marqueeTitle: "Producción, origen y exportación en un solo proceso",
    heritageSubtitle: "Una mirada práctica a los huertos, el control de proceso y la documentación de cada despacho.",
    missionTitle: "Nuestro papel",
    missionStatement:
      "<p>Conectamos la oferta agrícola de Uzbekistán con compradores que necesitan programas repetibles de frutos secos, no operaciones aisladas.</p>",
    philosophyTitle: "Cómo trabajamos",
    whoWeAreContent:
      "<p>HQ Dried Fruits combina líneas de cosecha seleccionadas, procesamiento controlado y documentación de exportación para que el importador compre con menos incertidumbre.</p><p>El objetivo es claro: calidad estable, especificaciones honestas y despachos preparados para el mercado de destino.</p>",
    orchardPhilosophy:
      "Un suministro exportable se construye antes del empaque: selección de cosecha, control de humedad, clasificación disciplinada y registros claros definen si un lote puede repetirse.",
    productionStandardsTitle: "Estándares de producción",
    productionStandards:
      "Los lotes se limpian, clasifican, revisan y empacan pensando en trazabilidad. Las certificaciones importan, pero el control diario del proceso pesa más.",
  },
  nl: {
    marqueeTitle: "Productie, herkomst en export in één proces",
    heritageSubtitle: "Een praktische blik op teelt, verwerking en documentatie achter elke zending.",
    missionTitle: "Onze rol",
    missionStatement:
      "<p>Wij verbinden Oezbeekse landbouwproductie met kopers die herhaalbare programma's voor gedroogde vruchten nodig hebben, niet alleen losse spotpartijen.</p>",
    philosophyTitle: "Hoe wij werken",
    whoWeAreContent:
      "<p>HQ Dried Fruits werkt met geselecteerde oogstlijnen, gecontroleerde verwerking en exportdocumentatie, zodat importeurs met minder onzekerheid kunnen inkopen.</p><p>Het doel is eenvoudig: stabiele kwaliteit, eerlijke specificaties en zendingen afgestemd op de markt van de koper.</p>",
    orchardPhilosophy:
      "Betrouwbare export begint vóór het verpakken: gewasselectie, vochtcontrole, strakke sortering en duidelijke registratie bepalen of een partij herhaalbaar is.",
    productionStandardsTitle: "Productiestandaarden",
    productionStandards:
      "Partijen worden gereinigd, gesorteerd, gecontroleerd en verpakt met traceerbaarheid als uitgangspunt. Certificaten helpen, maar dagelijks procesbeheer is doorslaggevend.",
  },
  fr: {
    marqueeTitle: "Production, origine et export dans un même processus",
    heritageSubtitle: "Un aperçu concret des vergers, du contrôle de production et des documents derrière chaque expédition.",
    missionTitle: "Notre rôle",
    missionStatement:
      "<p>Nous relions l'offre agricole ouzbèke aux acheteurs qui recherchent des programmes réguliers de fruits secs, pas seulement des lots ponctuels.</p>",
    philosophyTitle: "Notre méthode",
    whoWeAreContent:
      "<p>HQ Dried Fruits associe lots de récolte sélectionnés, transformation contrôlée et documentation export pour permettre aux importateurs d'acheter avec moins d'incertitude.</p><p>L'objectif est simple : qualité stable, spécifications honnêtes et expéditions préparées selon le marché de l'acheteur.</p>",
    orchardPhilosophy:
      "Un approvisionnement fiable se prépare avant l'emballage : sélection de la récolte, maîtrise de l'humidité, tri rigoureux et dossiers clairs déterminent si un lot pourra être répété.",
    productionStandardsTitle: "Standards de production",
    productionStandards:
      "Les lots sont nettoyés, triés, contrôlés et emballés avec la traçabilité en tête. Les certificats comptent, mais le contrôle quotidien du processus compte davantage.",
  },
};

const ownProductionCopy = {
  en: [
    ["Raw Intake", "Harvest Selection", "Incoming fruit is sorted by batch, moisture profile, and destination requirements before processing begins."],
    ["Processing", "Laser & X-Ray Control", "Each production line is calibrated for purity, defect removal, and export-grade consistency across volume orders."],
    ["Packaging", "Buyer-Specific Formats", "We pack for retail, private label, and industrial shipments with the same in-house quality checks before dispatch."],
    ["Dispatch", "Export Handover", "Finished cargo is documented, palletized, and scheduled for the route that best fits the buyer's timeline and market."],
  ],
  pt: [
    ["Recebimento", "Selecao da colheita", "A fruta recebida e classificada por lote, perfil de umidade e requisitos do destino antes do processamento."],
    ["Processamento", "Controle laser e raio X", "Cada linha e calibrada para pureza, remocao de defeitos e consistencia de exportacao em pedidos de volume."],
    ["Embalagem", "Formatos do comprador", "Embalamos para varejo, marca propria e embarques industriais com os mesmos controles internos antes do despacho."],
    ["Despacho", "Entrega para exportacao", "A carga final e documentada, paletizada e programada para a rota que melhor atende prazo e mercado do comprador."],
  ],
  es: [
    ["Recepcion", "Seleccion de cosecha", "La fruta recibida se clasifica por lote, perfil de humedad y requisitos de destino antes del procesamiento."],
    ["Procesamiento", "Control laser y rayos X", "Cada linea se calibra para pureza, eliminacion de defectos y consistencia exportable en pedidos de volumen."],
    ["Empaque", "Formatos del comprador", "Empacamos para retail, marca privada e industria con los mismos controles internos antes del despacho."],
    ["Despacho", "Entrega de exportacion", "La carga final se documenta, paletiza y programa para la ruta que mejor encaja con plazo y mercado del comprador."],
  ],
  nl: [
    ["Inname", "Oogstselectie", "Binnenkomend fruit wordt per partij, vochtprofiel en bestemmingseis gesorteerd voordat verwerking start."],
    ["Verwerking", "Laser- en rontgencontrole", "Elke lijn wordt afgesteld op zuiverheid, defectverwijdering en exportconsistentie bij volumeorders."],
    ["Verpakking", "Koperspecifieke formaten", "Wij verpakken voor retail, private label en industriele zendingen met dezelfde interne controles voor verzending."],
    ["Verzending", "Exportoverdracht", "Gereed product wordt gedocumenteerd, gepalletiseerd en ingepland op de route die past bij planning en markt."],
  ],
  fr: [
    ["Reception", "Selection de recolte", "Les fruits entrants sont tries par lot, profil d'humidite et exigences de destination avant transformation."],
    ["Traitement", "Controle laser et rayons X", "Chaque ligne est calibree pour la purete, le retrait des defauts et la regularite export sur les volumes."],
    ["Conditionnement", "Formats acheteur", "Nous emballons pour retail, marque privee et industrie avec les memes controles internes avant expedition."],
    ["Expedition", "Remise export", "La cargaison finale est documentee, palettisee et planifiee sur la route adaptee au delai et au marche."],
  ],
};

const ownProductionDefaultImages = [
  "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1596591606975-97ee5cef3a1e?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1200&auto=format&fit=crop",
];

const productsPageCopy = {
  en: {
    pageTitle: "Wholesale dried fruit from Uzbekistan",
    pageSubtitle:
      "Compare active raisin, apricot, prune, and peanut lines with the details buyers need before asking for price, packing, or shipment options.",
    introEyebrow: "Uzbekistan origin",
    introTitle: "A catalog built for sourcing decisions",
    introContent:
      "<p>This catalog keeps the commercial context close to the product: origin, processing role, use case, and basic specification signals.</p><p>Use it to shortlist the right line before requesting price, sample, packing format, or a mixed-load plan.</p>",
    introFacts: [
      ["Crop base", "Irrigated valleys and foothill production support stable drying quality across grapes, apricots, plums, and peanuts."],
      ["Processing", "Lots are cleaned, sorted, and prepared around buyer specifications before export packing."],
      ["Export use", "Retail, bakery, confectionery, ingredient, trading, and feed-related programs can be planned from one catalog."],
    ],
    catalogEyebrow: "Filter by category",
    catalogTitle: "Product catalog",
    viewSpecsLabel: "View specification",
    quickContactTitle: "Need a faster answer?",
    quickContactSubtitle: "Send product, target volume, and destination. We will reply with the practical next step.",
    submitButtonLabel: "Send inquiry",
    submittingButtonLabel: "Sending...",
    detailUi: {
      loadingLabel: "Loading specification...",
      notFoundTitle: "Product not found",
      notFoundBody: "This product is not available in the current catalog.",
      backToCatalogLabel: "Back to catalog",
      nutritionTitle: "Product information",
      inquiryTitle: "Send a product inquiry",
      companyPlaceholder: "Company name",
      emailPlaceholder: "Work email",
      volumePlaceholder: "Tell us your target volume, destination, packing needs, or question.",
      inquiryButtonLabel: "Send inquiry",
      inquirySubmittingLabel: "Sending inquiry...",
    },
  },
  pt: {
    pageTitle: "Frutas secas do Uzbequistão no atacado",
    pageSubtitle:
      "Compare linhas ativas de passas, damascos, ameixas secas e amendoim com as informações necessárias antes de pedir preço, embalagem ou embarque.",
    introEyebrow: "Origem Uzbequistão",
    introTitle: "Um catálogo pensado para decisão de compra",
    introContent:
      "<p>O catálogo aproxima o contexto comercial do produto: origem, processamento, aplicação e sinais básicos de especificação.</p><p>Use para selecionar a linha certa antes de pedir preço, amostra, formato de embalagem ou plano de carga mista.</p>",
    introFacts: [
      ["Base agrícola", "Vales irrigados e áreas de encosta ajudam a manter qualidade de secagem em uvas, damascos, ameixas e amendoim."],
      ["Processamento", "Os lotes são limpos, selecionados e preparados conforme exigências do comprador antes da embalagem de exportação."],
      ["Uso comercial", "Programas de varejo, panificação, confeitaria, ingredientes, trading e alimentação animal podem ser planejados no mesmo catálogo."],
    ],
    catalogEyebrow: "Filtrar por categoria",
    catalogTitle: "Catálogo de produtos",
    viewSpecsLabel: "Ver especificação",
    quickContactTitle: "Precisa de uma resposta rápida?",
    quickContactSubtitle: "Envie produto, volume alvo e destino. Retornamos com o próximo passo prático.",
    submitButtonLabel: "Enviar consulta",
    submittingButtonLabel: "Enviando...",
    detailUi: {
      loadingLabel: "Carregando especificação...",
      notFoundTitle: "Produto não encontrado",
      notFoundBody: "Este produto não está disponível no catálogo atual.",
      backToCatalogLabel: "Voltar ao catálogo",
      nutritionTitle: "Informações do produto",
      inquiryTitle: "Enviar consulta sobre o produto",
      companyPlaceholder: "Nome da empresa",
      emailPlaceholder: "E-mail profissional",
      volumePlaceholder: "Informe volume, destino, embalagem desejada ou sua pergunta.",
      inquiryButtonLabel: "Enviar consulta",
      inquirySubmittingLabel: "Enviando consulta...",
    },
  },
  es: {
    pageTitle: "Frutos secos de Uzbekistán al por mayor",
    pageSubtitle:
      "Compare líneas activas de pasas, albaricoques, ciruelas pasas y maní con la información que necesita antes de pedir precio, empaque o despacho.",
    introEyebrow: "Origen Uzbekistán",
    introTitle: "Un catálogo pensado para decisiones de compra",
    introContent:
      "<p>El catálogo mantiene cerca el contexto comercial: origen, procesamiento, aplicación y señales básicas de especificación.</p><p>Úselo para preseleccionar la línea correcta antes de solicitar precio, muestra, formato de empaque o plan de carga mixta.</p>",
    introFacts: [
      ["Base agrícola", "Valles irrigados y zonas de piedemonte sostienen una calidad de secado estable en uvas, albaricoques, ciruelas y maní."],
      ["Procesamiento", "Los lotes se limpian, clasifican y preparan según requisitos del comprador antes del empaque de exportación."],
      ["Uso comercial", "Retail, panificación, confitería, ingredientes, trading y programas de alimento animal pueden planificarse desde un mismo catálogo."],
    ],
    catalogEyebrow: "Filtrar por categoría",
    catalogTitle: "Catálogo de productos",
    viewSpecsLabel: "Ver especificación",
    quickContactTitle: "¿Necesita una respuesta rápida?",
    quickContactSubtitle: "Envíenos producto, volumen objetivo y destino. Responderemos con el siguiente paso práctico.",
    submitButtonLabel: "Enviar consulta",
    submittingButtonLabel: "Enviando...",
    detailUi: {
      loadingLabel: "Cargando especificación...",
      notFoundTitle: "Producto no encontrado",
      notFoundBody: "Este producto no está disponible en el catálogo actual.",
      backToCatalogLabel: "Volver al catálogo",
      nutritionTitle: "Información del producto",
      inquiryTitle: "Enviar consulta de producto",
      companyPlaceholder: "Empresa",
      emailPlaceholder: "Correo de trabajo",
      volumePlaceholder: "Indique volumen, destino, empaque requerido o su pregunta.",
      inquiryButtonLabel: "Enviar consulta",
      inquirySubmittingLabel: "Enviando consulta...",
    },
  },
  nl: {
    pageTitle: "Oezbeekse gedroogde vruchten voor groothandel",
    pageSubtitle:
      "Vergelijk actieve lijnen voor rozijnen, abrikozen, gedroogde pruimen en pinda's met de informatie die nodig is voor prijs, verpakking of verzending.",
    introEyebrow: "Herkomst Oezbekistan",
    introTitle: "Een catalogus voor inkoopbeslissingen",
    introContent:
      "<p>Deze catalogus houdt de commerciële context dicht bij het product: herkomst, verwerking, toepassing en basisindicaties van specificatie.</p><p>Gebruik hem om de juiste lijn te selecteren voordat u prijs, monsters, verpakking of een gemengde lading aanvraagt.</p>",
    introFacts: [
      ["Teeltbasis", "Geïrrigeerde valleien en heuvelgebieden ondersteunen stabiele droogkwaliteit voor druiven, abrikozen, pruimen en pinda's."],
      ["Verwerking", "Partijen worden gereinigd, gesorteerd en voorbereid volgens koperspecificaties vóór exportverpakking."],
      ["Commercieel gebruik", "Retail, bakkerij, confiserie, ingrediënten, handel en feed-gerelateerde programma's kunnen vanuit één catalogus worden gepland."],
    ],
    catalogEyebrow: "Filter op categorie",
    catalogTitle: "Productcatalogus",
    viewSpecsLabel: "Specificatie bekijken",
    quickContactTitle: "Snel antwoord nodig?",
    quickContactSubtitle: "Stuur product, doelvolume en bestemming. Wij reageren met de praktische vervolgstap.",
    submitButtonLabel: "Aanvraag verzenden",
    submittingButtonLabel: "Verzenden...",
    detailUi: {
      loadingLabel: "Specificatie laden...",
      notFoundTitle: "Product niet gevonden",
      notFoundBody: "Dit product is niet beschikbaar in de huidige catalogus.",
      backToCatalogLabel: "Terug naar catalogus",
      nutritionTitle: "Productinformatie",
      inquiryTitle: "Productaanvraag verzenden",
      companyPlaceholder: "Bedrijfsnaam",
      emailPlaceholder: "Zakelijk e-mailadres",
      volumePlaceholder: "Vermeld volume, bestemming, verpakkingswens of uw vraag.",
      inquiryButtonLabel: "Aanvraag verzenden",
      inquirySubmittingLabel: "Aanvraag verzenden...",
    },
  },
  fr: {
    pageTitle: "Fruits secs d'Ouzbékistan en gros",
    pageSubtitle:
      "Comparez les lignes actives de raisins secs, abricots, pruneaux et cacahuètes avec les informations utiles avant de demander prix, emballage ou expédition.",
    introEyebrow: "Origine Ouzbékistan",
    introTitle: "Un catalogue conçu pour l'achat",
    introContent:
      "<p>Le catalogue garde le contexte commercial près du produit : origine, transformation, application et premiers repères de spécification.</p><p>Il sert à choisir la bonne ligne avant de demander un prix, un échantillon, un format d'emballage ou un plan de chargement mixte.</p>",
    introFacts: [
      ["Base agricole", "Vallées irriguées et zones de piémont soutiennent une qualité de séchage régulière pour raisins, abricots, prunes et cacahuètes."],
      ["Transformation", "Les lots sont nettoyés, triés et préparés selon les exigences de l'acheteur avant l'emballage export."],
      ["Usage commercial", "Retail, boulangerie, confiserie, ingrédients, trading et programmes liés à l'alimentation animale peuvent être étudiés depuis un seul catalogue."],
    ],
    catalogEyebrow: "Filtrer par catégorie",
    catalogTitle: "Catalogue produits",
    viewSpecsLabel: "Voir la spécification",
    quickContactTitle: "Besoin d'une réponse rapide ?",
    quickContactSubtitle: "Envoyez produit, volume cible et destination. Nous répondrons avec l'étape concrète suivante.",
    submitButtonLabel: "Envoyer la demande",
    submittingButtonLabel: "Envoi...",
    detailUi: {
      loadingLabel: "Chargement de la spécification...",
      notFoundTitle: "Produit introuvable",
      notFoundBody: "Ce produit n'est pas disponible dans le catalogue actuel.",
      backToCatalogLabel: "Retour au catalogue",
      nutritionTitle: "Informations produit",
      inquiryTitle: "Envoyer une demande produit",
      companyPlaceholder: "Nom de l'entreprise",
      emailPlaceholder: "E-mail professionnel",
      volumePlaceholder: "Indiquez volume, destination, emballage souhaité ou votre question.",
      inquiryButtonLabel: "Envoyer la demande",
      inquirySubmittingLabel: "Envoi de la demande...",
    },
  },
};

const exportCopy = {
  en: {
    heroTitle: "Export planning that starts before dispatch",
    heroSubtitle:
      "From lot preparation to documents and routing, each shipment is arranged around the buyer's market, packing format, and delivery window.",
    operationsEyebrow: "Export operations",
    destinationEyebrow: buyerChannelCopy.en.eyebrow,
    mapSectionTitle: buyerChannelCopy.en.title,
    supplyRoutes: buyerChannelSupplyRoutes("en"),
    logisticsContent:
      "<p>We prepare shipments around real trade requirements: carton format, label needs, destination paperwork, and the lane that makes sense for the buyer's volume.</p><p>The goal is not simply to load cargo. It is to make repeat orders easier to receive, inspect, and clear.</p>",
    packagingTitle: "Packing formats",
    packagingMethods:
      "<p>Bulk cartons, inner bags, private-label-ready cartons, and mixed loads can be discussed according to product, lot size, and destination requirements.</p>",
    transportationTitle: "Transport coordination",
    transportationMethods:
      "<p>Road, rail, sea-linked, and multimodal routes are planned around cost, timing, and documentation needs rather than a single fixed lane.</p>",
    documentationTitle: "Export documents",
    documentationContent:
      "<p>Commercial invoice, packing list, origin paperwork, phytosanitary documents, and buyer-specific files are prepared before dispatch.</p>",
    qualityTitle: "Quality controls before release",
    technicalSpecs:
      "<p>Lots are checked for moisture, visual defects, foreign material, sizing, and packing condition before they are released for shipment.</p>",
    qualityChecks: [
      ["Moisture review", "Product moisture is checked against the intended use and shelf-life expectation."],
      ["Sorting and calibration", "Visual sorting and size control help reduce surprises at receiving."],
      ["Dispatch file", "Packing lists, certificates, and buyer documents are aligned before loading."],
    ],
  },
  pt: {
    heroTitle: "Planejamento de exportação antes do embarque",
    heroSubtitle:
      "Da preparação do lote aos documentos e rotas, cada embarque é organizado conforme mercado do comprador, formato de embalagem e janela de entrega.",
    operationsEyebrow: "Operação de exportação",
    destinationEyebrow: buyerChannelCopy.pt.eyebrow,
    mapSectionTitle: buyerChannelCopy.pt.title,
    supplyRoutes: buyerChannelSupplyRoutes("pt"),
    logisticsContent:
      "<p>Preparamos embarques com base em exigências reais de comércio: embalagem, rotulagem, documentação do destino e rota adequada ao volume do comprador.</p><p>O objetivo não é apenas carregar mercadoria, mas facilitar pedidos recorrentes, recebimento, inspeção e desembaraço.</p>",
    packagingTitle: "Formatos de embalagem",
    packagingMethods:
      "<p>Caixas a granel, sacos internos, caixas prontas para marca própria e cargas mistas podem ser ajustadas por produto, volume e destino.</p>",
    transportationTitle: "Coordenação logística",
    transportationMethods:
      "<p>Rotas rodoviárias, ferroviárias, marítimas conectadas e multimodais são planejadas por custo, prazo e documentação necessária.</p>",
    documentationTitle: "Documentos de exportação",
    documentationContent:
      "<p>Fatura comercial, packing list, documentos de origem, fitossanitários e arquivos específicos do comprador são preparados antes do embarque.</p>",
    qualityTitle: "Controles antes da liberação",
    technicalSpecs:
      "<p>Os lotes são verificados quanto a umidade, defeitos visuais, material estranho, calibre e condição de embalagem antes da liberação.</p>",
    qualityChecks: [
      ["Revisão de umidade", "A umidade é conferida conforme uso previsto e expectativa de vida útil."],
      ["Triagem e calibração", "Seleção visual e controle de tamanho reduzem surpresas no recebimento."],
      ["Arquivo de embarque", "Listas de embalagem, certificados e documentos do comprador são alinhados antes do carregamento."],
    ],
  },
  es: {
    heroTitle: "Planificación de exportación antes del despacho",
    heroSubtitle:
      "Desde la preparación del lote hasta los documentos y la ruta, cada embarque se organiza según mercado del comprador, empaque y ventana de entrega.",
    operationsEyebrow: "Operación de exportación",
    destinationEyebrow: buyerChannelCopy.es.eyebrow,
    mapSectionTitle: buyerChannelCopy.es.title,
    supplyRoutes: buyerChannelSupplyRoutes("es"),
    logisticsContent:
      "<p>Preparamos embarques según requisitos comerciales reales: formato de empaque, rotulado, documentación del destino y ruta adecuada al volumen.</p><p>No se trata solo de cargar mercancía, sino de facilitar pedidos repetidos, recepción, inspección y despacho aduanero.</p>",
    packagingTitle: "Formatos de empaque",
    packagingMethods:
      "<p>Cajas a granel, bolsas internas, cajas listas para marca privada y cargas mixtas pueden ajustarse por producto, tamaño de lote y destino.</p>",
    transportationTitle: "Coordinación logística",
    transportationMethods:
      "<p>Rutas por carretera, ferrocarril, conexión marítima y soluciones multimodales se planifican por costo, plazo y documentación.</p>",
    documentationTitle: "Documentación de exportación",
    documentationContent:
      "<p>Factura comercial, lista de empaque, documentos de origen, fitosanitarios y archivos específicos del comprador se preparan antes del despacho.</p>",
    qualityTitle: "Controles antes de liberar el lote",
    technicalSpecs:
      "<p>Los lotes se revisan por humedad, defectos visuales, material extraño, calibre y condición de empaque antes de liberarse para embarque.</p>",
    qualityChecks: [
      ["Control de humedad", "La humedad se revisa según uso previsto y expectativa de vida útil."],
      ["Clasificación y calibre", "La selección visual y el control de tamaño reducen sorpresas en recepción."],
      ["Archivo de despacho", "Listas de empaque, certificados y documentos del comprador se alinean antes de la carga."],
    ],
  },
  nl: {
    heroTitle: "Exportplanning vóór verzending",
    heroSubtitle:
      "Van partijvoorbereiding tot documenten en route: elke zending wordt afgestemd op markt, verpakking en levervenster van de koper.",
    operationsEyebrow: "Exportoperatie",
    destinationEyebrow: buyerChannelCopy.nl.eyebrow,
    mapSectionTitle: buyerChannelCopy.nl.title,
    supplyRoutes: buyerChannelSupplyRoutes("nl"),
    logisticsContent:
      "<p>Wij bereiden zendingen voor op basis van echte handelsvereisten: kartonformaat, labels, bestemmingsdocumenten en een route die past bij het volume.</p><p>Het doel is niet alleen laden, maar herhaalorders eenvoudiger laten ontvangen, controleren en inklaren.</p>",
    packagingTitle: "Verpakkingsformaten",
    packagingMethods:
      "<p>Bulkdozen, binnenzakken, private-label-ready dozen en gemengde ladingen kunnen worden afgestemd op product, partijgrootte en bestemming.</p>",
    transportationTitle: "Transportcoördinatie",
    transportationMethods:
      "<p>Weg-, spoor-, zeegekoppelde en multimodale routes worden gepland op basis van kosten, timing en documentatiebehoefte.</p>",
    documentationTitle: "Exportdocumenten",
    documentationContent:
      "<p>Handelsfactuur, paklijst, oorsprongsdocumenten, fytosanitaire documenten en koper-specifieke bestanden worden vóór vertrek voorbereid.</p>",
    qualityTitle: "Kwaliteitscontrole vóór vrijgave",
    technicalSpecs:
      "<p>Partijen worden gecontroleerd op vocht, zichtbare defecten, vreemd materiaal, sortering en verpakkingsconditie voordat ze worden vrijgegeven.</p>",
    qualityChecks: [
      ["Vochtcontrole", "Het vochtgehalte wordt beoordeeld op basis van gebruik en houdbaarheidsverwachting."],
      ["Sortering en kalibratie", "Visuele sortering en maatcontrole beperken verrassingen bij ontvangst."],
      ["Verzenddossier", "Paklijsten, certificaten en kopersdocumenten worden vóór laden afgestemd."],
    ],
  },
  fr: {
    heroTitle: "Planification export avant expédition",
    heroSubtitle:
      "Du lot aux documents et au routage, chaque expédition est organisée selon le marché de l'acheteur, le format d'emballage et la fenêtre de livraison.",
    operationsEyebrow: "Opérations export",
    destinationEyebrow: buyerChannelCopy.fr.eyebrow,
    mapSectionTitle: buyerChannelCopy.fr.title,
    supplyRoutes: buyerChannelSupplyRoutes("fr"),
    logisticsContent:
      "<p>Nous préparons les expéditions autour d'exigences commerciales réelles : format carton, étiquetage, documents de destination et route adaptée au volume.</p><p>L'objectif n'est pas seulement de charger la marchandise, mais de faciliter les commandes répétées, la réception, le contrôle et le dédouanement.</p>",
    packagingTitle: "Formats d'emballage",
    packagingMethods:
      "<p>Cartons vrac, sachets intérieurs, cartons prêts pour marque privée et chargements mixtes peuvent être étudiés selon produit, volume et destination.</p>",
    transportationTitle: "Coordination transport",
    transportationMethods:
      "<p>Routes routières, ferroviaires, maritimes connectées et multimodales sont planifiées selon coût, délai et exigences documentaires.</p>",
    documentationTitle: "Documents export",
    documentationContent:
      "<p>Facture commerciale, packing list, documents d'origine, certificats phytosanitaires et dossiers spécifiques acheteur sont préparés avant départ.</p>",
    qualityTitle: "Contrôles avant libération",
    technicalSpecs:
      "<p>Les lots sont vérifiés sur humidité, défauts visuels, corps étrangers, calibre et état d'emballage avant libération pour expédition.</p>",
    qualityChecks: [
      ["Contrôle d'humidité", "L'humidité est vérifiée selon l'usage prévu et la durée de conservation attendue."],
      ["Tri et calibration", "Le tri visuel et le contrôle de calibre réduisent les surprises à réception."],
      ["Dossier d'expédition", "Listes de colisage, certificats et documents acheteur sont alignés avant chargement."],
    ],
  },
};

const contactsCopy = {
  en: {
    pageTitle: "Talk to our export team",
    introText:
      "Share the product line, volume, destination, and packing question. We will answer with the information needed for a serious next step.",
    directContactEyebrow: "Direct contact",
    responseLabelPrefix: "Replies are monitored at",
    contactFormTitle: "Send an inquiry",
    formNameLabel: "Full name",
    formCompanyLabel: "Company",
    formEmailLabel: "Work email",
    formMessageLabel: "Message",
    submitButtonLabel: "Send message",
    submittingButtonLabel: "Sending...",
    mapPinLabel: "HQ Dried Fruits office",
    infoEmailLabel: "Email",
    infoPhoneLabel: "Phone",
    infoAddressLabel: "Office",
    infoHoursLabel: "Working hours",
    socialSectionTitle: "Direct channels",
  },
  pt: {
    pageTitle: "Fale com nossa equipe de exportação",
    introText:
      "Informe produto, volume, destino e dúvida de embalagem. Respondemos com os dados necessários para avançar de forma objetiva.",
    directContactEyebrow: "Contato direto",
    responseLabelPrefix: "Respostas monitoradas em",
    contactFormTitle: "Enviar consulta",
    formNameLabel: "Nome completo",
    formCompanyLabel: "Empresa",
    formEmailLabel: "E-mail profissional",
    formMessageLabel: "Mensagem",
    submitButtonLabel: "Enviar mensagem",
    submittingButtonLabel: "Enviando...",
    mapPinLabel: "Escritório HQ Dried Fruits",
    infoEmailLabel: "E-mail",
    infoPhoneLabel: "Telefone",
    infoAddressLabel: "Escritório",
    infoHoursLabel: "Horário",
    socialSectionTitle: "Canais diretos",
  },
  es: {
    pageTitle: "Hable con nuestro equipo de exportación",
    introText:
      "Indique producto, volumen, destino y consulta de empaque. Responderemos con la información necesaria para avanzar con seriedad.",
    directContactEyebrow: "Contacto directo",
    responseLabelPrefix: "Respuestas monitoreadas en",
    contactFormTitle: "Enviar consulta",
    formNameLabel: "Nombre completo",
    formCompanyLabel: "Empresa",
    formEmailLabel: "Correo de trabajo",
    formMessageLabel: "Mensaje",
    submitButtonLabel: "Enviar mensaje",
    submittingButtonLabel: "Enviando...",
    mapPinLabel: "Oficina HQ Dried Fruits",
    infoEmailLabel: "Correo",
    infoPhoneLabel: "Teléfono",
    infoAddressLabel: "Oficina",
    infoHoursLabel: "Horario",
    socialSectionTitle: "Canales directos",
  },
  nl: {
    pageTitle: "Neem contact op met ons exportteam",
    introText:
      "Stuur productlijn, volume, bestemming en verpakkingsvraag. Wij reageren met de informatie die nodig is voor een serieuze vervolgstap.",
    directContactEyebrow: "Direct contact",
    responseLabelPrefix: "Reacties worden gevolgd via",
    contactFormTitle: "Aanvraag verzenden",
    formNameLabel: "Volledige naam",
    formCompanyLabel: "Bedrijf",
    formEmailLabel: "Zakelijk e-mailadres",
    formMessageLabel: "Bericht",
    submitButtonLabel: "Bericht verzenden",
    submittingButtonLabel: "Verzenden...",
    mapPinLabel: "HQ Dried Fruits kantoor",
    infoEmailLabel: "E-mail",
    infoPhoneLabel: "Telefoon",
    infoAddressLabel: "Kantoor",
    infoHoursLabel: "Openingstijden",
    socialSectionTitle: "Directe kanalen",
  },
  fr: {
    pageTitle: "Échanger avec notre équipe export",
    introText:
      "Indiquez la ligne produit, le volume, la destination et la question d'emballage. Nous répondrons avec les informations utiles pour avancer sérieusement.",
    directContactEyebrow: "Contact direct",
    responseLabelPrefix: "Réponses suivies à",
    contactFormTitle: "Envoyer une demande",
    formNameLabel: "Nom complet",
    formCompanyLabel: "Entreprise",
    formEmailLabel: "E-mail professionnel",
    formMessageLabel: "Message",
    submitButtonLabel: "Envoyer le message",
    submittingButtonLabel: "Envoi...",
    mapPinLabel: "Bureau HQ Dried Fruits",
    infoEmailLabel: "E-mail",
    infoPhoneLabel: "Téléphone",
    infoAddressLabel: "Bureau",
    infoHoursLabel: "Horaires",
    socialSectionTitle: "Canaux directs",
  },
};

const legalCopy = {
  en: {
    privacyTitle: "Privacy policy",
    privacyBody:
      "<p>We use submitted business contact details to answer product, pricing, sample, and logistics inquiries. We do not sell inquiry data.</p><p>Messages may be shared internally with sales and export staff so they can prepare an accurate reply. To request correction or removal of your details, contact our export team.</p>",
    termsTitle: "Terms of service",
    termsBody:
      "<p>This website provides general product and export information for business buyers. Specifications, availability, prices, packing formats, and shipment terms are confirmed only in direct commercial communication.</p><p>Using the website or sending an inquiry does not create a supply agreement. Any order is subject to mutually agreed terms, documentation, and product availability.</p>",
  },
  pt: {
    privacyTitle: "Política de privacidade",
    privacyBody:
      "<p>Usamos dados comerciais enviados pelo formulário para responder consultas sobre produtos, preços, amostras e logística. Não vendemos dados de contato.</p><p>As mensagens podem ser compartilhadas internamente com as equipes comercial e de exportação para preparar uma resposta precisa. Para corrigir ou remover seus dados, fale com nossa equipe.</p>",
    termsTitle: "Termos de serviço",
    termsBody:
      "<p>Este site apresenta informações gerais de produtos e exportação para compradores empresariais. Especificações, disponibilidade, preços, embalagens e condições de envio são confirmados apenas em comunicação comercial direta.</p><p>Usar o site ou enviar uma consulta não cria contrato de fornecimento. Qualquer pedido depende de termos acordados, documentação e disponibilidade do produto.</p>",
  },
  es: {
    privacyTitle: "Política de privacidad",
    privacyBody:
      "<p>Usamos los datos comerciales enviados para responder consultas sobre productos, precios, muestras y logística. No vendemos datos de contacto.</p><p>Los mensajes pueden compartirse internamente con ventas y exportación para preparar una respuesta precisa. Para corregir o eliminar sus datos, contacte a nuestro equipo.</p>",
    termsTitle: "Términos de servicio",
    termsBody:
      "<p>Este sitio ofrece información general de productos y exportación para compradores empresariales. Especificaciones, disponibilidad, precios, formatos de empaque y condiciones de envío se confirman solo en comunicación comercial directa.</p><p>Usar el sitio o enviar una consulta no crea un acuerdo de suministro. Todo pedido queda sujeto a términos acordados, documentación y disponibilidad del producto.</p>",
  },
  nl: {
    privacyTitle: "Privacybeleid",
    privacyBody:
      "<p>Wij gebruiken zakelijke contactgegevens uit aanvragen om te reageren op vragen over producten, prijzen, monsters en logistiek. Wij verkopen geen aanvraaggegevens.</p><p>Berichten kunnen intern worden gedeeld met verkoop- en exportmedewerkers om een nauwkeurig antwoord voor te bereiden. Neem contact op om gegevens te corrigeren of te verwijderen.</p>",
    termsTitle: "Servicevoorwaarden",
    termsBody:
      "<p>Deze website biedt algemene product- en exportinformatie voor zakelijke kopers. Specificaties, beschikbaarheid, prijzen, verpakkingen en verzendvoorwaarden worden alleen in directe commerciële communicatie bevestigd.</p><p>Gebruik van de website of het verzenden van een aanvraag vormt geen leveringsovereenkomst. Elke order is afhankelijk van overeengekomen voorwaarden, documentatie en productbeschikbaarheid.</p>",
  },
  fr: {
    privacyTitle: "Politique de confidentialité",
    privacyBody:
      "<p>Nous utilisons les coordonnées professionnelles envoyées pour répondre aux demandes concernant produits, prix, échantillons et logistique. Nous ne vendons pas les données de contact.</p><p>Les messages peuvent être partagés en interne avec les équipes commerciales et export afin de préparer une réponse précise. Pour corriger ou supprimer vos données, contactez notre équipe.</p>",
    termsTitle: "Conditions d'utilisation",
    termsBody:
      "<p>Ce site fournit des informations générales sur les produits et l'export pour acheteurs professionnels. Spécifications, disponibilité, prix, formats d'emballage et conditions d'expédition sont confirmés uniquement en échange commercial direct.</p><p>L'utilisation du site ou l'envoi d'une demande ne crée pas de contrat d'approvisionnement. Toute commande dépend de conditions convenues, de la documentation et de la disponibilité produit.</p>",
  },
};

const seoCopy = {
  en: {
    home: ["HQ Dried Fruits | Uzbek dried fruit exporter", "Export-ready raisins, apricots, prunes, and peanuts from Uzbekistan for importers, manufacturers, and wholesale buyers.", "", "HQ Dried Fruits", "Uzbek dried fruit export assortment"],
    about: ["About HQ Dried Fruits | Uzbek sourcing and export control", "Learn how HQ Dried Fruits prepares Uzbek dried fruit lots with sorting, documentation, and buyer-focused export discipline.", "about", "About HQ Dried Fruits", "Dried fruit production and export process"],
    products: ["Wholesale dried fruits from Uzbekistan | Product catalog", "Compare Uzbek raisins, dried apricots, prunes, and peanuts prepared for wholesale, retail, processing, and export programs.", "products", "Wholesale product catalog", "Assorted Uzbek dried fruits"],
    export: ["Export logistics for Uzbek dried fruits | HQ Dried Fruits", "Export planning, documentation, packing, and routing support for wholesale dried fruit shipments from Uzbekistan.", "export", "Export logistics", "Export documentation and routing"],
    contacts: ["Contact HQ Dried Fruits | Export inquiries", "Contact the HQ Dried Fruits export team for product availability, pricing, samples, packing, and logistics questions.", "contacts", "Contact HQ Dried Fruits", "HQ Dried Fruits contact office"],
    privacy: ["Privacy policy | HQ Dried Fruits", "How HQ Dried Fruits handles business inquiry data submitted through the website.", "privacy", "Privacy policy", "Privacy policy"],
    terms: ["Terms of service | HQ Dried Fruits", "Website terms for business buyers using HQ Dried Fruits product and export information.", "terms", "Terms of service", "Terms of service"],
  },
  pt: {
    home: ["HQ Dried Fruits | Exportador uzbeque de frutas secas", "Passas, damascos, ameixas secas e amendoim do Uzbequistão para importadores, indústrias e compradores atacadistas.", "", "HQ Dried Fruits", "Seleção uzbeque de frutas secas"],
    about: ["Sobre a HQ Dried Fruits | Origem e controle de exportação", "Veja como a HQ Dried Fruits prepara lotes uzbeques com seleção, documentação e disciplina de exportação.", "about", "Sobre a HQ Dried Fruits", "Produção e exportação de frutas secas"],
    products: ["Frutas secas do Uzbequistão no atacado | Catálogo", "Compare passas, damascos secos, ameixas secas e amendoim para atacado, varejo, processamento e exportação.", "products", "Catálogo atacadista", "Frutas secas uzbeques sortidas"],
    export: ["Logística de exportação de frutas secas | HQ Dried Fruits", "Planejamento de exportação, documentos, embalagem e rotas para embarques atacadistas do Uzbequistão.", "export", "Logística de exportação", "Documentação e rotas de exportação"],
    contacts: ["Contato HQ Dried Fruits | Consultas de exportação", "Fale com a equipe de exportação sobre disponibilidade, preços, amostras, embalagem e logística.", "contacts", "Contato HQ Dried Fruits", "Escritório de contato HQ Dried Fruits"],
    privacy: ["Política de privacidade | HQ Dried Fruits", "Como a HQ Dried Fruits trata dados comerciais enviados pelo site.", "privacy", "Política de privacidade", "Política de privacidade"],
    terms: ["Termos de serviço | HQ Dried Fruits", "Termos do site para compradores empresariais que usam informações de produto e exportação.", "terms", "Termos de serviço", "Termos de serviço"],
  },
  es: {
    home: ["HQ Dried Fruits | Exportador uzbeko de frutos secos", "Pasas, albaricoques, ciruelas pasas y maní de Uzbekistán para importadores, fabricantes y mayoristas.", "", "HQ Dried Fruits", "Surtido uzbeko de frutos secos"],
    about: ["Sobre HQ Dried Fruits | Origen y control de exportación", "Conozca cómo HQ Dried Fruits prepara lotes uzbekos con clasificación, documentación y disciplina exportadora.", "about", "Sobre HQ Dried Fruits", "Producción y exportación de frutos secos"],
    products: ["Frutos secos de Uzbekistán al por mayor | Catálogo", "Compare pasas, albaricoques secos, ciruelas pasas y maní para mayoristas, retail, procesamiento y exportación.", "products", "Catálogo mayorista", "Frutos secos uzbekos surtidos"],
    export: ["Logística de exportación de frutos secos | HQ Dried Fruits", "Planificación, documentos, empaque y rutas para embarques mayoristas de frutos secos desde Uzbekistán.", "export", "Logística de exportación", "Documentación y rutas de exportación"],
    contacts: ["Contacto HQ Dried Fruits | Consultas de exportación", "Contacte al equipo de exportación para disponibilidad, precios, muestras, empaque y logística.", "contacts", "Contacto HQ Dried Fruits", "Oficina de contacto HQ Dried Fruits"],
    privacy: ["Política de privacidad | HQ Dried Fruits", "Cómo HQ Dried Fruits maneja datos comerciales enviados a través del sitio.", "privacy", "Política de privacidad", "Política de privacidad"],
    terms: ["Términos de servicio | HQ Dried Fruits", "Términos del sitio para compradores empresariales que usan información de productos y exportación.", "terms", "Términos de servicio", "Términos de servicio"],
  },
  nl: {
    home: ["HQ Dried Fruits | Oezbeekse exporteur van gedroogde vruchten", "Rozijnen, abrikozen, gedroogde pruimen en pinda's uit Oezbekistan voor importeurs, producenten en groothandel.", "", "HQ Dried Fruits", "Oezbeekse gedroogde vruchten"],
    about: ["Over HQ Dried Fruits | Herkomst en exportcontrole", "Lees hoe HQ Dried Fruits Oezbeekse partijen voorbereidt met sortering, documentatie en exportdiscipline.", "about", "Over HQ Dried Fruits", "Productie en export van gedroogde vruchten"],
    products: ["Gedroogde vruchten uit Oezbekistan | Groothandelscatalogus", "Vergelijk rozijnen, gedroogde abrikozen, gedroogde pruimen en pinda's voor groothandel, retail, verwerking en export.", "products", "Groothandelscatalogus", "Assortiment Oezbeekse gedroogde vruchten"],
    export: ["Exportlogistiek voor gedroogde vruchten | HQ Dried Fruits", "Exportplanning, documenten, verpakking en routes voor groothandelszendingen uit Oezbekistan.", "export", "Exportlogistiek", "Exportdocumentatie en routes"],
    contacts: ["Contact HQ Dried Fruits | Exportaanvragen", "Neem contact op voor beschikbaarheid, prijzen, monsters, verpakking en logistiek.", "contacts", "Contact HQ Dried Fruits", "Contactkantoor HQ Dried Fruits"],
    privacy: ["Privacybeleid | HQ Dried Fruits", "Hoe HQ Dried Fruits zakelijke aanvraaggegevens via de website behandelt.", "privacy", "Privacybeleid", "Privacybeleid"],
    terms: ["Servicevoorwaarden | HQ Dried Fruits", "Websitevoorwaarden voor zakelijke kopers die product- en exportinformatie gebruiken.", "terms", "Servicevoorwaarden", "Servicevoorwaarden"],
  },
  fr: {
    home: ["HQ Dried Fruits | Exportateur ouzbek de fruits secs", "Raisins secs, abricots, pruneaux et cacahuètes d'Ouzbékistan pour importateurs, industriels et grossistes.", "", "HQ Dried Fruits", "Assortiment ouzbek de fruits secs"],
    about: ["À propos de HQ Dried Fruits | Origine et contrôle export", "Découvrez comment HQ Dried Fruits prépare les lots ouzbeks avec tri, documentation et discipline export.", "about", "À propos de HQ Dried Fruits", "Production et export de fruits secs"],
    products: ["Fruits secs d'Ouzbékistan en gros | Catalogue", "Comparez raisins secs, abricots secs, pruneaux et cacahuètes pour gros, retail, transformation et export.", "products", "Catalogue de gros", "Fruits secs ouzbeks assortis"],
    export: ["Logistique export de fruits secs | HQ Dried Fruits", "Planification export, documents, emballage et routage pour expéditions de fruits secs depuis l'Ouzbékistan.", "export", "Logistique export", "Documentation et routes export"],
    contacts: ["Contact HQ Dried Fruits | Demandes export", "Contactez l'équipe export pour disponibilités, prix, échantillons, emballage et logistique.", "contacts", "Contact HQ Dried Fruits", "Bureau de contact HQ Dried Fruits"],
    privacy: ["Politique de confidentialité | HQ Dried Fruits", "Comment HQ Dried Fruits traite les données professionnelles envoyées via le site.", "privacy", "Politique de confidentialité", "Politique de confidentialité"],
    terms: ["Conditions d'utilisation | HQ Dried Fruits", "Conditions du site pour acheteurs professionnels utilisant les informations produits et export.", "terms", "Conditions d'utilisation", "Conditions d'utilisation"],
  },
};

const products = {
  en: {
    soyaki: ["Soyaki", "Raisins", "A dark Uzbek raisin with strong visual identity, offered in calibrated lots for retail, bakery, and ingredient buyers.", "<p>Soyaki is one of Uzbekistan's recognizable black raisin lines. It is naturally dried, sorted by caliber, and suited to buyers who want a darker raisin with consistent presentation across repeat orders.</p>", ["Dark Uzbek raisin line", "Calibrated export lots", "Suitable for retail and ingredients"], "Buyer fit", "Best suited for importers, bakeries, cereal producers, and snack brands looking for a distinct black raisin rather than a generic mixed grade."],
    sultana: ["Sultana", "Raisins", "A dependable bakery raisin line, cleaned and calibrated for buyers who need consistency more than decoration.", "<p>Sultana raisins are the practical backbone of many bakery and ingredient programs. The line is prepared for buyers who care about cleanliness, moisture control, and predictable behavior in production.</p>", ["Cleaned before packing", "Bakery and cereal applications", "Stable wholesale supply"], "Processing role", "Used where uniform raisins need to perform inside dough, cereals, mixes, and industrial recipes without creating sorting problems downstream."],
    "black-red": ["Black-Red", "Raisins", "A darker raisin option for industrial programs where color, volume, and price discipline matter.", "<p>Black-Red raisins are positioned for ingredient and food-processing buyers who need reliable volume with a deep color profile. The line works well where visual uniformity is useful but retail-grade presentation is not the main cost driver.</p>", ["Industrial volume focus", "Deep natural color", "Cost-aware sourcing"], "Application", "Prepared for processors, bakery ingredient programs, confectionery bases, and wholesale buyers managing repeat bulk demand."],
    golden: ["Golden", "Raisins", "Bright golden raisins for snack mixes, retail packs, and confectionery where color matters on the shelf.", "<p>Golden raisins bring a bright color profile and mild sweetness to retail, confectionery, and snack applications. Lots are sorted for buyers who need cleaner presentation and a more visible finished product.</p>", ["Bright color profile", "Retail and snack use", "Sorted for presentation"], "Visual standard", "Useful when the raisin must add color contrast in mixes, bakery toppings, confectionery, or branded pouch formats."],
    subhana: ["Subhana", "Dried Apricots", "Soft Uzbek dried apricots with a clean golden look, suitable for retail, bulk, and mixed-container buyers.", "<p>Subhana dried apricots are selected for soft texture, natural sweetness, and a clear dried-fruit identity. They can be positioned for retail packs, wholesale cartons, or mixed loads with other Uzbek fruit lines.</p>", ["Soft texture", "Retail and bulk formats", "Uzbek apricot identity"], "Commercial use", "A flexible apricot line for importers, snack brands, and distributors that want a recognizable Uzbek dried apricot with practical packing options."],
    "subhana-confectioner": ["Subhana Confectioner", "Dried Apricots", "A confectionery-focused apricot line for fillings, jams, bakery prep, and food-service processing.", "<p>Subhana Confectioner is selected for buyers who process apricots rather than sell them whole as a visual retail piece. It is practical for chopping, cooking, fillings, bakery applications, and blends.</p>", ["Made for processing", "Good flavor concentration", "Confectionery and bakery use"], "Processing use", "Best for jam makers, bakery filling producers, confectionery plants, and buyers who care about flavor performance over perfect shape."],
    "hungarian-unpitted": ["Hungarian Unpitted", "Prunes", "Whole unpitted prunes with a traditional profile for buyers who want depth of flavor and natural presentation.", "<p>Hungarian Unpitted prunes keep the fruit whole, giving buyers a traditional prune format with deeper flavor and natural structure. The line is suited to markets where unpitted fruit is expected or preferred.</p>", ["Whole fruit format", "Traditional prune profile", "Natural presentation"], "Market fit", "Appropriate for wholesale channels, traditional retail, and food-service buyers that prefer unpitted prunes for flavor and presentation."],
    "spanish-prunes": ["Spanish Prunes", "Prunes", "Firm, meaty prunes for retail packs and gourmet applications where shape and bite are important.", "<p>Spanish Prunes are selected for a firm bite and clean visual presentation. They work well for retail pouches, deli-style assortments, and buyers who need prunes that hold their structure.</p>", ["Firm texture", "Retail pack ready", "Strong visual quality"], "Buyer fit", "Useful for brands and importers that need a prune line with shelf presence, not only ingredient value."],
    ashlock: ["Ashlock", "Prunes", "A practical prune line for processors and bulk buyers who need usable fruit at steady volume.", "<p>Ashlock prunes are positioned for commercial processing and ingredient buyers. The line is selected for practicality: volume, usability, and a profile that can support recipes, fillings, and further processing.</p>", ["Processing-friendly", "Bulk supply focus", "Practical grade"], "Application", "Prepared for food manufacturers, bakery fillings, industrial recipes, and buyers who measure value by usable output."],
    "in-shell-peanuts": ["In-shell Peanuts", "Peanuts", "Sorted peanuts in shell for roasting, retail, trading, and feed-related programs.", "<p>In-shell peanuts are cleaned and sorted for buyers who need a natural peanut format with the shell intact. The line can serve roasting, retail, trading, and selected feed-related demand.</p>", ["Natural shell format", "Sorted before dispatch", "Roasting and retail use"], "Use case", "A practical choice for buyers that need shell-on product for roasting lines, open displays, seasonal packs, or trading programs."],
    "shelled-peanuts": ["Shelled Peanuts", "Peanuts", "Kernel-focused peanut supply for snack manufacturing, roasting, and food processing.", "<p>Shelled peanuts remove the handling burden of the shell and give manufacturers a direct kernel line. They are suited to roasting, snack production, peanut-based foods, and ingredient buyers.</p>", ["Kernel supply", "Snack and roasting use", "Cleaner handling"], "Processing role", "Prepared for buyers who need kernels ready for the next production step, from roasting to butter, bars, mixes, and industrial recipes."],
    "bird-feed": ["Bird Feed Peanuts", "Peanuts", "Feed-grade peanut material for buyers serving wild bird, pet, and animal-feed related channels.", "<p>Bird Feed Peanuts are positioned for buyers who need peanut material for feed-related use rather than human retail presentation. The focus is practical supply, fat and protein value, and suitability for feed programs.</p>", ["Feed-grade use", "High energy ingredient", "Practical bulk supply"], "Market fit", "Intended for wild bird feed, pet-related programs, and buyers that need an economical peanut line for non-retail applications."],
  },
};

products.pt = {
  soyaki: ["Soyaki", "Passas", "Pasa preta uzbeque de forte identidade visual, oferecida em lotes calibrados para varejo, panificação e ingredientes.", "<p>Soyaki é uma das linhas de passa preta mais reconhecíveis do Uzbequistão. A fruta é seca naturalmente, separada por calibre e indicada para compradores que buscam uma passa escura com apresentação estável em pedidos recorrentes.</p>", ["Pasa preta uzbeque", "Lotes calibrados", "Varejo e ingredientes"], "Perfil de compra", "Indicada para importadores, padarias, produtores de cereais e marcas de snacks que procuram uma passa preta distinta, não um grau misto genérico."],
  sultana: ["Sultana", "Passas", "Linha confiável para panificação, limpa e calibrada para compradores que precisam de regularidade.", "<p>A Sultana é uma base prática para programas de panificação e ingredientes. A linha atende compradores que priorizam limpeza, controle de umidade e comportamento previsível em produção.</p>", ["Limpa antes da embalagem", "Panificação e cereais", "Fornecimento atacadista"], "Uso industrial", "Usada quando a passa precisa funcionar em massas, cereais, misturas e receitas industriais sem gerar problemas de seleção na fábrica."],
  "black-red": ["Black-Red", "Passas", "Opção de passa escura para programas industriais em que cor, volume e custo precisam estar equilibrados.", "<p>Black-Red é direcionada a compradores de ingredientes e processamento que precisam de volume confiável com perfil de cor mais profundo. Funciona bem quando a uniformidade visual ajuda, mas o acabamento de varejo não é o principal fator de custo.</p>", ["Foco em volume industrial", "Cor natural intensa", "Compra com custo controlado"], "Aplicação", "Preparada para processadores, ingredientes de panificação, bases de confeitaria e compradores atacadistas com demanda recorrente."],
  golden: ["Golden", "Passas", "Passa dourada para mixes, varejo e confeitaria quando a cor aparece no produto final.", "<p>Golden oferece cor clara e doçura suave para aplicações de varejo, confeitaria e snacks. Os lotes são selecionados para compradores que precisam de melhor apresentação visual.</p>", ["Cor dourada", "Varejo e snacks", "Selecionada para apresentação"], "Padrão visual", "Útil quando a passa deve trazer contraste em mixes, coberturas de panificação, confeitaria ou embalagens de marca."],
  subhana: ["Subhana", "Damascos secos", "Damasco seco uzbeque macio e dourado para varejo, caixas atacadistas e cargas mistas.", "<p>Subhana é selecionado por textura macia, doçura natural e identidade clara de damasco uzbeque. Pode ser trabalhado em embalagens de varejo, caixas de atacado ou cargas mistas.</p>", ["Textura macia", "Varejo e atacado", "Identidade uzbeque"], "Uso comercial", "Linha flexível para importadores, marcas de snacks e distribuidores que querem damasco uzbeque reconhecível com opções práticas de embalagem."],
  "subhana-confectioner": ["Subhana Confectioner", "Damascos secos", "Linha de damasco para recheios, geleias, panificação e processamento food service.", "<p>Subhana Confectioner atende compradores que processam o damasco em vez de vender a fruta inteira como peça visual. É prático para picar, cozinhar, rechear, assar e misturar.</p>", ["Voltado ao processamento", "Sabor concentrado", "Confeitaria e panificação"], "Uso de processamento", "Indicado para fabricantes de geleia, recheios, confeitarias industriais e compradores que valorizam desempenho de sabor acima da forma perfeita."],
  "hungarian-unpitted": ["Hungarian Unpitted", "Ameixas secas", "Ameixa seca inteira com caroço, de perfil tradicional e sabor profundo.", "<p>Hungarian Unpitted mantém a fruta inteira, oferecendo um formato tradicional com mais estrutura e profundidade de sabor. É adequado para mercados que esperam ou preferem ameixa com caroço.</p>", ["Fruta inteira", "Perfil tradicional", "Apresentação natural"], "Mercado", "Adequada para atacado, varejo tradicional e food service que prefere ameixa com caroço por sabor e apresentação."],
  "spanish-prunes": ["Spanish Prunes", "Ameixas secas", "Ameixa firme e carnuda para varejo e aplicações gourmet em que formato e mordida importam.", "<p>Spanish Prunes é selecionada pela mordida firme e apresentação limpa. Funciona bem em pouches de varejo, sortidos gourmet e canais que exigem ameixas com estrutura.</p>", ["Textura firme", "Pronta para varejo", "Boa apresentação"], "Perfil de compra", "Útil para marcas e importadores que precisam de ameixa com presença de prateleira, não apenas valor como ingrediente."],
  ashlock: ["Ashlock", "Ameixas secas", "Linha prática de ameixa seca para processadores e compradores a granel.", "<p>Ashlock é posicionada para processamento comercial e compradores de ingredientes. A linha privilegia volume, usabilidade e perfil adequado a receitas, recheios e transformação.</p>", ["Boa para processamento", "Foco em volume", "Grau prático"], "Aplicação", "Preparada para fabricantes de alimentos, recheios de panificação, receitas industriais e compradores que medem valor pelo rendimento útil."],
  "in-shell-peanuts": ["Amendoim com casca", "Amendoim", "Amendoim com casca selecionado para torrefação, varejo, trading e demandas de alimentação.", "<p>O amendoim com casca é limpo e selecionado para compradores que precisam do formato natural com a casca preservada. Pode atender torrefação, varejo, trading e demandas específicas de alimentação.</p>", ["Formato natural", "Selecionado antes do envio", "Torrefação e varejo"], "Uso", "Escolha prática para compradores que precisam de produto com casca para torrefação, displays, embalagens sazonais ou trading."],
  "shelled-peanuts": ["Amendoim descascado", "Amendoim", "Linha de kernels para snacks, torrefação e processamento de alimentos.", "<p>O amendoim descascado reduz o manuseio e entrega uma linha direta de kernel. É indicado para torrefação, snacks, alimentos à base de amendoim e compradores de ingredientes.</p>", ["Fornecimento de kernels", "Snacks e torrefação", "Manuseio mais limpo"], "Processamento", "Preparado para quem precisa de kernels prontos para a etapa seguinte: torra, pasta, barras, mixes e receitas industriais."],
  "bird-feed": ["Amendoim Bird Feed", "Amendoim", "Material de amendoim para canais de aves silvestres, pet e alimentação animal.", "<p>Bird Feed Peanuts é destinado a compradores que precisam de amendoim para alimentação, não para apresentação de varejo humano. O foco é fornecimento prático, valor energético e adequação a programas de feed.</p>", ["Uso feed grade", "Ingrediente energético", "Volume prático"], "Mercado", "Indicado para alimentação de aves silvestres, programas pet e compradores que precisam de uma linha econômica para aplicações não varejistas."],
};

products.es = {
  soyaki: ["Soyaki", "Pasas", "Pasa negra uzbeka con identidad visual fuerte, en lotes calibrados para retail, panificación e ingredientes.", "<p>Soyaki es una de las líneas de pasa negra más reconocibles de Uzbekistán. Se seca de forma natural, se separa por calibre y sirve a compradores que buscan una pasa oscura con presentación estable en pedidos repetidos.</p>", ["Pasa negra uzbeka", "Lotes calibrados", "Retail e ingredientes"], "Perfil de comprador", "Adecuada para importadores, panaderías, cerealeras y marcas de snacks que buscan una pasa negra definida, no un grado mixto genérico."],
  sultana: ["Sultana", "Pasas", "Línea confiable para panificación, limpia y calibrada para compradores que necesitan regularidad.", "<p>Sultana es una base práctica para programas de panificación e ingredientes. La línea está pensada para compradores que priorizan limpieza, humedad controlada y comportamiento previsible en producción.</p>", ["Limpia antes del empaque", "Panificación y cereales", "Suministro mayorista"], "Uso productivo", "Se utiliza cuando la pasa debe funcionar en masas, cereales, mezclas y recetas industriales sin crear problemas de selección."],
  "black-red": ["Black-Red", "Pasas", "Opción de pasa oscura para programas industriales donde color, volumen y costo deben equilibrarse.", "<p>Black-Red se orienta a compradores de ingredientes y procesamiento que necesitan volumen confiable con un color más profundo. Funciona cuando la uniformidad visual ayuda, pero la presentación de retail no domina el costo.</p>", ["Volumen industrial", "Color natural profundo", "Compra con costo controlado"], "Aplicación", "Preparada para procesadores, ingredientes de panificación, bases de confitería y compradores mayoristas con demanda repetida."],
  golden: ["Golden", "Pasas", "Pasa dorada para mixes, retail y confitería cuando el color se ve en el producto final.", "<p>Golden aporta color claro y dulzor suave a aplicaciones de retail, confitería y snacks. Los lotes se seleccionan para compradores que necesitan una presentación más limpia.</p>", ["Color dorado", "Retail y snacks", "Seleccionada para presentación"], "Estándar visual", "Útil cuando la pasa debe aportar contraste en mezclas, toppings de panadería, confitería o formatos de marca."],
  subhana: ["Subhana", "Albaricoques secos", "Albaricoque uzbeko suave y dorado para retail, cajas mayoristas y cargas mixtas.", "<p>Subhana se selecciona por textura suave, dulzor natural e identidad clara de albaricoque uzbeko. Puede trabajarse en retail, cajas de mayorista o cargas mixtas.</p>", ["Textura suave", "Retail y mayorista", "Identidad uzbeka"], "Uso comercial", "Línea flexible para importadores, marcas de snacks y distribuidores que quieren un albaricoque uzbeko reconocible con empaque práctico."],
  "subhana-confectioner": ["Subhana Confectioner", "Albaricoques secos", "Línea de albaricoque para rellenos, mermeladas, panificación y procesamiento.", "<p>Subhana Confectioner está pensada para compradores que procesan el albaricoque en lugar de venderlo entero como pieza visual. Es práctica para cortar, cocinar, rellenar, hornear y mezclar.</p>", ["Para procesamiento", "Sabor concentrado", "Confitería y panificación"], "Uso de proceso", "Indicada para mermeladas, rellenos, plantas de confitería y compradores que valoran rendimiento de sabor por encima de forma perfecta."],
  "hungarian-unpitted": ["Hungarian Unpitted", "Ciruelas pasas", "Ciruela pasa entera con carozo, de perfil tradicional y sabor profundo.", "<p>Hungarian Unpitted conserva la fruta entera, con un formato tradicional y más estructura. Es adecuada para mercados donde la ciruela con carozo se espera o se prefiere.</p>", ["Fruta entera", "Perfil tradicional", "Presentación natural"], "Mercado", "Apropiada para mayoristas, retail tradicional y food service que prefiere ciruela con carozo por sabor y presentación."],
  "spanish-prunes": ["Spanish Prunes", "Ciruelas pasas", "Ciruela firme y carnosa para retail y aplicaciones gourmet donde forma y mordida importan.", "<p>Spanish Prunes se selecciona por su mordida firme y presentación limpia. Funciona en pouches de retail, surtidos gourmet y canales que necesitan ciruelas con estructura.</p>", ["Textura firme", "Lista para retail", "Buena presentación"], "Perfil de compra", "Útil para marcas e importadores que necesitan presencia en anaquel, no solo valor como ingrediente."],
  ashlock: ["Ashlock", "Ciruelas pasas", "Línea práctica de ciruela pasa para procesadores y compradores a granel.", "<p>Ashlock se posiciona para procesamiento comercial y compradores de ingredientes. Prioriza volumen, usabilidad y un perfil que soporte recetas, rellenos y transformación.</p>", ["Apta para proceso", "Foco en volumen", "Grado práctico"], "Aplicación", "Preparada para fabricantes, rellenos de panadería, recetas industriales y compradores que miden valor por rendimiento útil."],
  "in-shell-peanuts": ["Maní con cáscara", "Maní", "Maní con cáscara seleccionado para tostado, retail, trading y demanda de alimentación.", "<p>El maní con cáscara se limpia y selecciona para compradores que necesitan el formato natural con la cáscara intacta. Puede servir a tostado, retail, trading y ciertas demandas de alimento.</p>", ["Formato natural", "Seleccionado antes del despacho", "Tostado y retail"], "Uso", "Opción práctica para compradores que necesitan producto con cáscara para tostado, exhibición, packs de temporada o trading."],
  "shelled-peanuts": ["Maní pelado", "Maní", "Línea de kernels para snacks, tostado y procesamiento de alimentos.", "<p>El maní pelado reduce manejo y entrega una línea directa de kernel. Es adecuado para tostado, snacks, alimentos a base de maní y compradores de ingredientes.</p>", ["Suministro de kernels", "Snacks y tostado", "Manejo más limpio"], "Proceso", "Preparado para compradores que necesitan kernels listos para la siguiente etapa: tostado, mantequilla, barras, mezclas y recetas industriales."],
  "bird-feed": ["Maní Bird Feed", "Maní", "Material de maní para canales de aves, pet food y alimentación animal.", "<p>Bird Feed Peanuts se orienta a compradores que necesitan maní para alimentación, no para presentación de retail humano. El foco es suministro práctico, valor energético y adecuación a programas feed.</p>", ["Uso feed grade", "Ingrediente energético", "Suministro práctico"], "Mercado", "Pensado para alimento de aves silvestres, programas pet y compradores que necesitan una línea económica para aplicaciones no retail."],
};

products.nl = {
  soyaki: ["Soyaki", "Rozijnen", "Donkere Oezbeekse rozijn met duidelijke identiteit, geleverd in gekalibreerde partijen voor retail, bakkerij en ingrediënten.", "<p>Soyaki is een herkenbare zwarte rozijnenlijn uit Oezbekistan. De rozijnen worden natuurlijk gedroogd, op kaliber gesorteerd en passen bij kopers die een donkere rozijn met stabiele presentatie zoeken.</p>", ["Donkere Oezbeekse rozijn", "Gekalibreerde partijen", "Retail en ingrediënten"], "Kopersprofiel", "Geschikt voor importeurs, bakkerijen, cerealproducenten en snackmerken die een duidelijke zwarte rozijn willen in plaats van een generieke mixkwaliteit."],
  sultana: ["Sultana", "Rozijnen", "Betrouwbare bakkerijrozijn, gereinigd en gekalibreerd voor kopers die regelmaat nodig hebben.", "<p>Sultana is een praktische basis voor bakkerij- en ingrediëntenprogramma's. De lijn is bedoeld voor kopers die netheid, vochtbeheersing en voorspelbaar gedrag in productie belangrijk vinden.</p>", ["Gereinigd voor verpakking", "Bakkerij en cereals", "Stabiele groothandelslijn"], "Productierol", "Gebruikt wanneer rozijnen goed moeten presteren in deeg, cereals, mengsels en industriële recepten zonder extra sorteerproblemen."],
  "black-red": ["Black-Red", "Rozijnen", "Donkere rozijnenoptie voor industriële programma's waar kleur, volume en kosten samen tellen.", "<p>Black-Red is gericht op ingrediënt- en verwerkingskopers die betrouwbaar volume met een dieper kleurprofiel nodig hebben. De lijn past waar visuele uniformiteit helpt, maar retailpresentatie niet de hoofdprijs bepaalt.</p>", ["Industrieel volume", "Diepe natuurlijke kleur", "Kostenbewuste inkoop"], "Toepassing", "Voor verwerkers, bakkerij-ingrediënten, confiseriebases en groothandelskopers met herhaalde bulkbehoefte."],
  golden: ["Golden", "Rozijnen", "Goudgele rozijn voor mixes, retail en confiserie wanneer kleur zichtbaar moet zijn.", "<p>Golden brengt een lichte kleur en milde zoetheid in retail-, confiserie- en snacktoepassingen. Partijen worden geselecteerd voor kopers die een schonere presentatie nodig hebben.</p>", ["Goudgele kleur", "Retail en snacks", "Geselecteerd op presentatie"], "Visuele standaard", "Nuttig wanneer de rozijn contrast moet geven in mixes, bakkerijtoppings, confiserie of merkverpakkingen."],
  subhana: ["Subhana", "Gedroogde abrikozen", "Zachte Oezbeekse abrikoos met goudkleurige uitstraling voor retail, groothandel en gemengde containers.", "<p>Subhana wordt geselecteerd op zachte textuur, natuurlijke zoetheid en herkenbare Oezbeekse abrikozenidentiteit. De lijn past in retailverpakking, groothandelskartons of gemengde ladingen.</p>", ["Zachte textuur", "Retail en bulk", "Oezbeekse identiteit"], "Commercieel gebruik", "Flexibele abrikozenlijn voor importeurs, snackmerken en distributeurs die een herkenbare Oezbeekse abrikoos met praktische verpakking zoeken."],
  "subhana-confectioner": ["Subhana Confectioner", "Gedroogde abrikozen", "Abrikozenlijn voor vullingen, jam, bakkerijvoorbereiding en foodserviceverwerking.", "<p>Subhana Confectioner is bedoeld voor kopers die abrikozen verwerken in plaats van als hele retailvrucht verkopen. Praktisch voor snijden, koken, vullingen, bakkerij en blends.</p>", ["Voor verwerking", "Geconcentreerde smaak", "Confiserie en bakkerij"], "Verwerkingsgebruik", "Voor jamproducenten, bakkerijvullingen, confiseriebedrijven en kopers die smaakprestatie belangrijker vinden dan perfecte vorm."],
  "hungarian-unpitted": ["Hungarian Unpitted", "Gedroogde pruimen", "Hele ongepitte pruimen met traditioneel profiel en diepe smaak.", "<p>Hungarian Unpitted houdt de vrucht heel en geeft een traditioneel formaat met meer structuur en smaakdiepte. Geschikt voor markten waar ongepitte pruimen verwacht of gewaardeerd worden.</p>", ["Hele vrucht", "Traditioneel profiel", "Natuurlijke presentatie"], "Marktfit", "Geschikt voor groothandel, traditionele retail en foodservice waar ongepitte pruimen gewenst zijn voor smaak en presentatie."],
  "spanish-prunes": ["Spanish Prunes", "Gedroogde pruimen", "Stevige, vlezige pruimen voor retail en gourmettoepassingen waar vorm en bite belangrijk zijn.", "<p>Spanish Prunes worden geselecteerd op stevige bite en nette presentatie. Ze passen in retailpouches, gourmetmixen en kanalen die pruimen met structuur nodig hebben.</p>", ["Stevige textuur", "Retail-ready", "Sterke presentatie"], "Kopersprofiel", "Voor merken en importeurs die een pruimenlijn met schapwaarde nodig hebben, niet alleen ingrediëntwaarde."],
  ashlock: ["Ashlock", "Gedroogde pruimen", "Praktische pruimenlijn voor verwerkers en bulkinkopers.", "<p>Ashlock is gericht op commerciële verwerking en ingrediëntkopers. De lijn draait om volume, bruikbaarheid en een profiel dat recepten, vullingen en verdere verwerking ondersteunt.</p>", ["Verwerkingsvriendelijk", "Bulkfocus", "Praktische kwaliteit"], "Toepassing", "Voor voedingsfabrikanten, bakkerijvullingen, industriële recepten en kopers die waarde meten aan bruikbare output."],
  "in-shell-peanuts": ["Pinda's in de dop", "Pinda's", "Gesorteerde pinda's in de dop voor roosteren, retail, handel en feed-gerelateerde programma's.", "<p>Pinda's in de dop worden gereinigd en gesorteerd voor kopers die een natuurlijk formaat met intacte dop nodig hebben. De lijn kan roosteren, retail, handel en geselecteerde feedvraag bedienen.</p>", ["Natuurlijk dopformaat", "Gesorteerd voor verzending", "Roosteren en retail"], "Gebruik", "Praktische keuze voor kopers die dopproduct nodig hebben voor roosteren, displays, seizoensverpakkingen of handelsprogramma's."],
  "shelled-peanuts": ["Gepelde pinda's", "Pinda's", "Kernelgerichte pindalijn voor snackproductie, roosteren en voedselverwerking.", "<p>Gepelde pinda's nemen de dop uit het proces en geven producenten direct een kernlijn. Geschikt voor roosteren, snackproductie, pindaproducten en ingrediëntkopers.</p>", ["Kernelsupply", "Snacks en roosteren", "Schoner in gebruik"], "Verwerkingsrol", "Voor kopers die kernels klaar voor de volgende stap nodig hebben: roosteren, pasta, repen, mixes en industriële recepten."],
  "bird-feed": ["Bird Feed pinda's", "Pinda's", "Feed-grade pindamateriaal voor wildvogel-, pet- en diervoederkanalen.", "<p>Bird Feed Peanuts zijn bedoeld voor kopers die pindamateriaal nodig hebben voor feedtoepassing, niet voor humane retailpresentatie. De focus ligt op praktische aanvoer, energie en eiwitwaarde.</p>", ["Feed-grade gebruik", "Energierijk ingrediënt", "Praktische bulk"], "Marktfit", "Voor wildvogelvoer, petprogramma's en kopers die een economische pindalijn nodig hebben voor niet-retail toepassingen."],
};

products.fr = {
  soyaki: ["Soyaki", "Raisins secs", "Raisin noir ouzbek à forte identité visuelle, proposé en lots calibrés pour retail, boulangerie et ingrédients.", "<p>Soyaki fait partie des lignes de raisins noirs les plus reconnaissables d'Ouzbékistan. Il est séché naturellement, trié par calibre et adapté aux acheteurs qui recherchent un raisin foncé avec présentation régulière.</p>", ["Raisin noir ouzbek", "Lots calibrés", "Retail et ingrédients"], "Profil acheteur", "Convient aux importateurs, boulangers, fabricants de céréales et marques de snacks qui veulent un raisin noir défini, pas une qualité mélangée générique."],
  sultana: ["Sultana", "Raisins secs", "Ligne fiable pour boulangerie, nettoyée et calibrée pour les acheteurs qui privilégient la régularité.", "<p>Sultana est une base pratique pour les programmes de boulangerie et d'ingrédients. La ligne répond aux acheteurs qui recherchent propreté, humidité maîtrisée et comportement prévisible en production.</p>", ["Nettoyé avant emballage", "Boulangerie et céréales", "Approvisionnement régulier"], "Rôle en production", "Utilisé lorsque le raisin doit bien se comporter dans pâtes, céréales, mélanges et recettes industrielles sans créer de problèmes de tri."],
  "black-red": ["Black-Red", "Raisins secs", "Option de raisin foncé pour programmes industriels où couleur, volume et coût doivent rester cohérents.", "<p>Black-Red s'adresse aux acheteurs ingrédients et transformation qui ont besoin de volume fiable avec un profil plus sombre. Il convient lorsque l'uniformité visuelle compte sans exiger une présentation retail haut de gamme.</p>", ["Volume industriel", "Couleur naturelle profonde", "Achat maîtrisé"], "Application", "Préparé pour transformateurs, ingrédients de boulangerie, bases de confiserie et acheteurs de gros à demande répétée."],
  golden: ["Golden", "Raisins secs", "Raisin doré pour mélanges, retail et confiserie lorsque la couleur compte dans le produit fini.", "<p>Golden apporte une couleur claire et une douceur modérée aux applications retail, confiserie et snacks. Les lots sont sélectionnés pour les acheteurs qui souhaitent une présentation plus nette.</p>", ["Couleur dorée", "Retail et snacks", "Trié pour la présentation"], "Standard visuel", "Utile lorsque le raisin doit apporter du contraste dans mélanges, toppings de boulangerie, confiserie ou emballages de marque."],
  subhana: ["Subhana", "Abricots secs", "Abricot ouzbek moelleux et doré pour retail, cartons de gros et chargements mixtes.", "<p>Subhana est sélectionné pour sa texture moelleuse, sa douceur naturelle et son identité claire d'abricot ouzbek. Il peut être utilisé en retail, cartons de gros ou chargements mixtes.</p>", ["Texture moelleuse", "Retail et gros", "Identité ouzbèke"], "Usage commercial", "Ligne flexible pour importateurs, marques de snacks et distributeurs recherchant un abricot ouzbek reconnaissable avec emballage pratique."],
  "subhana-confectioner": ["Subhana Confectioner", "Abricots secs", "Ligne d'abricots pour fourrages, confitures, boulangerie et transformation food service.", "<p>Subhana Confectioner est destiné aux acheteurs qui transforment l'abricot plutôt que de le vendre entier en pièce visuelle. Pratique pour découpe, cuisson, fourrages, boulangerie et mélanges.</p>", ["Pour transformation", "Saveur concentrée", "Confiserie et boulangerie"], "Usage transformation", "Pour confituriers, fabricants de fourrages, ateliers de confiserie et acheteurs qui privilégient le rendement de goût à la forme parfaite."],
  "hungarian-unpitted": ["Hungarian Unpitted", "Pruneaux", "Pruneau entier non dénoyauté, au profil traditionnel et à la saveur profonde.", "<p>Hungarian Unpitted conserve le fruit entier, avec un format traditionnel et plus de structure. Il convient aux marchés où le pruneau non dénoyauté est attendu ou préféré.</p>", ["Fruit entier", "Profil traditionnel", "Présentation naturelle"], "Marché", "Adapté au gros, au retail traditionnel et au food service qui préfère le pruneau non dénoyauté pour goût et présentation."],
  "spanish-prunes": ["Spanish Prunes", "Pruneaux", "Pruneau ferme et charnu pour retail et applications gourmet où forme et texture comptent.", "<p>Spanish Prunes est sélectionné pour sa texture ferme et sa présentation propre. Il convient aux sachets retail, assortiments gourmet et canaux qui demandent des pruneaux structurés.</p>", ["Texture ferme", "Prêt pour retail", "Bonne présentation"], "Profil acheteur", "Pour marques et importateurs qui recherchent un pruneau avec présence en rayon, pas seulement une valeur ingrédient."],
  ashlock: ["Ashlock", "Pruneaux", "Ligne pratique de pruneaux pour transformateurs et acheteurs vrac.", "<p>Ashlock est positionné pour la transformation commerciale et les acheteurs ingrédients. La ligne privilégie volume, utilisabilité et profil adapté aux recettes, fourrages et transformations.</p>", ["Adapté transformation", "Focalisé volume", "Qualité pratique"], "Application", "Préparé pour industriels alimentaires, fourrages de boulangerie, recettes industrielles et acheteurs qui mesurent la valeur au rendement utile."],
  "in-shell-peanuts": ["Cacahuètes en coque", "Cacahuètes", "Cacahuètes en coque triées pour torréfaction, retail, trading et programmes liés à l'alimentation.", "<p>Les cacahuètes en coque sont nettoyées et triées pour les acheteurs qui recherchent un format naturel avec coque intacte. La ligne peut servir torréfaction, retail, trading et certaines demandes feed.</p>", ["Format naturel en coque", "Tri avant expédition", "Torréfaction et retail"], "Usage", "Choix pratique pour acheteurs qui ont besoin de produit en coque pour torréfaction, présentoirs, packs saisonniers ou trading."],
  "shelled-peanuts": ["Cacahuètes décortiquées", "Cacahuètes", "Ligne de kernels pour snacks, torréfaction et transformation alimentaire.", "<p>Les cacahuètes décortiquées retirent la contrainte de la coque et donnent aux fabricants une ligne directe de kernels. Adapté à la torréfaction, aux snacks, produits à base de cacahuète et ingrédients.</p>", ["Kernels prêts", "Snacks et torréfaction", "Manipulation simplifiée"], "Rôle transformation", "Pour acheteurs qui ont besoin de kernels prêts pour l'étape suivante : torréfaction, pâte, barres, mélanges et recettes industrielles."],
  "bird-feed": ["Cacahuètes Bird Feed", "Cacahuètes", "Matière cacahuète feed grade pour oiseaux, pet food et canaux liés à l'alimentation animale.", "<p>Bird Feed Peanuts vise les acheteurs qui ont besoin de cacahuète pour usage alimentation, non pour présentation retail humaine. L'accent est mis sur l'approvisionnement pratique, l'énergie et la valeur protéique.</p>", ["Usage feed grade", "Ingrédient énergétique", "Vrac pratique"], "Marché", "Destiné aux aliments pour oiseaux sauvages, programmes pet et acheteurs qui recherchent une ligne économique pour applications non retail."],
};

function safeJson(value, fallback) {
  if (value === undefined || value === null || value === "") return fallback;
  try {
    return typeof value === "string" ? JSON.parse(value) : value;
  } catch {
    return fallback;
  }
}

function productCategoryObjects(locale, existingContent) {
  const byKey = new Map((existingContent.productCategories || []).map((item) => [item.categoryKey, item]));
  return homeCopy[locale].productCategories.map(([categoryKey, categoryName, shortDescription, variantSummary]) => {
    const existing = byKey.get(categoryKey) || {};
    return {
      ...existing,
      categoryKey,
      categoryName,
      shortDescription,
      variantSummary,
      image: existing.image || `/uploads/category-${categoryKey === "dried-apricot" ? "apricots" : categoryKey}.png`,
      url: existing.url || "/products",
    };
  });
}

function mergeImagesByKey(nextItems, existingItems, keyName) {
  const existingByKey = new Map((Array.isArray(existingItems) ? existingItems : []).map((item) => [item?.[keyName], item]));
  return nextItems.map((item, index) => {
    const existing = existingByKey.get(item?.[keyName]) || (Array.isArray(existingItems) ? existingItems[index] : null) || {};
    return {
      ...item,
      image: existing.image || item.image || "",
    };
  });
}

function ownProductionItems(locale, existingItems) {
  const sourceItems = Array.isArray(existingItems) ? existingItems : [];
  return ownProductionCopy[locale].map(([title, subtitle, description], index) => ({
    image: sourceItems[index]?.image || ownProductionDefaultImages[index],
    title,
    subtitle,
    description,
  }));
}

function htmlParagraph(value) {
  return `<p>${value}</p>`;
}

function productSeo(locale, id, product) {
  const titleSuffix = locale === "en" ? " | HQ Dried Fruits" : " | HQ Dried Fruits";
  return {
    metaTitle: `${product[0]} wholesale${titleSuffix}`,
    metaDescription: product[2],
    slug: id,
    ogTitle: product[0],
    imageAlt: product[0],
  };
}

function pageSeoRows(locale) {
  return Object.entries(seoCopy[locale]).map(([pageId, values]) => ({
    pageId,
    metaTitle: values[0],
    metaDescription: values[1],
    slug: values[2],
    ogTitle: values[3],
    imageAlt: values[4],
  }));
}

function createNavLinks(labels) {
  const urls = ["/", "/about", "/products", "/export", "/contacts"];
  return labels.map((label, index) => ({ label, url: urls[index] }));
}

function createQuickLinks(labels) {
  const urls = ["/about", "/export", "/contacts"];
  return labels.map((label, index) => ({ label, url: urls[index] }));
}

function diffPreview(label, before, after) {
  if (before === after) return null;
  return { label, before: String(before ?? "").slice(0, 90), after: String(after ?? "").slice(0, 90) };
}

async function main() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    charset: "utf8mb4",
  });

  const changes = [];
  const exec = async (sql, params) => {
    if (!execute) return;
    await connection.execute(sql, params);
  };

  if (execute) await connection.beginTransaction();

  try {
    for (const locale of activeLocales) {
      for (const table of singletonTables) {
        await exec(`INSERT IGNORE INTO ${table} (id, lang) VALUES (1, ?)`, [locale]);
      }

      const [globalRows] = await connection.execute("SELECT * FROM global_settings WHERE id = 1 AND lang = ?", [locale]);
      const currentGlobal = globalRows[0] || {};
      const global = globalCopy[locale];
      const uiLabels = { ...safeJson(currentGlobal.ui_labels, {}), ...global.ui };
      changes.push(diffPreview(`global_settings.${locale}.footer_description`, currentGlobal.footer_description, global.footerDescription));
      await exec(
        "UPDATE global_settings SET site_name = ?, nav_links = ?, cta_text = ?, footer_description = ?, footer_lead_text = ?, quick_links = ?, footer_cta_title = ?, footer_copyright_text = ?, ui_labels = ? WHERE id = 1 AND lang = ?",
        [
          "HQ Dried Fruits",
          JSON.stringify(createNavLinks(global.nav)),
          global.cta,
          global.footerDescription,
          global.footerLeadText,
          JSON.stringify(createQuickLinks(global.quickLinks)),
          global.footerCtaTitle,
          global.copyright,
          JSON.stringify(uiLabels),
          locale,
        ],
      );

      const [homeRows] = await connection.execute("SELECT content FROM home_page WHERE id = 1 AND lang = ?", [locale]);
      const existingHome = safeJson(homeRows[0]?.content, {});
      const nextHome = {
        ...existingHome,
        ...homeCopy[locale],
        productCategories: productCategoryObjects(locale, existingHome),
        exportMarkets: mergeImagesByKey(homeCopy[locale].exportMarkets, existingHome.exportMarkets, "countryName"),
      };
      delete nextHome.productCategoriesRaw;
      changes.push(diffPreview(`home_page.${locale}.heroTitle`, existingHome.heroTitle, nextHome.heroTitle));
      await exec("UPDATE home_page SET content = ? WHERE id = 1 AND lang = ?", [JSON.stringify(nextHome), locale]);

      const [aboutRows] = await connection.execute("SELECT content FROM about_page WHERE id = 1 AND lang = ?", [locale]);
      const existingAbout = safeJson(aboutRows[0]?.content, {});
      const nextAbout = {
        ...existingAbout,
        ...aboutCopy[locale],
        ownProductionItems: ownProductionItems(locale, existingAbout.ownProductionItems),
      };
      changes.push(diffPreview(`about_page.${locale}.whoWeAreContent`, existingAbout.whoWeAreContent, nextAbout.whoWeAreContent));
      changes.push(diffPreview(`about_page.${locale}.ownProductionItems[0].title`, existingAbout.ownProductionItems?.[0]?.title, nextAbout.ownProductionItems[0]?.title));
      await exec("UPDATE about_page SET content = ? WHERE id = 1 AND lang = ?", [JSON.stringify(nextAbout), locale]);

      const pp = productsPageCopy[locale];
      const [productPageRows] = await connection.execute("SELECT page_title FROM products_page WHERE id = 1 AND lang = ?", [locale]);
      changes.push(diffPreview(`products_page.${locale}.page_title`, productPageRows[0]?.page_title, pp.pageTitle));
      await exec(
        "UPDATE products_page SET page_title = ?, page_subtitle = ?, intro_eyebrow = ?, intro_title = ?, intro_content = ?, intro_facts = ?, catalog_eyebrow = ?, catalog_title = ?, view_specs_label = ?, quick_contact_title = ?, quick_contact_subtitle = ?, submit_button_label = ?, submitting_button_label = ?, detail_ui = ? WHERE id = 1 AND lang = ?",
        [
          pp.pageTitle,
          pp.pageSubtitle,
          pp.introEyebrow,
          pp.introTitle,
          pp.introContent,
          JSON.stringify(pp.introFacts.map(([title, description]) => ({ title, description }))),
          pp.catalogEyebrow,
          pp.catalogTitle,
          pp.viewSpecsLabel,
          pp.quickContactTitle,
          pp.quickContactSubtitle,
          pp.submitButtonLabel,
          pp.submittingButtonLabel,
          JSON.stringify({ ...safeJson((await connection.execute("SELECT detail_ui FROM products_page WHERE id = 1 AND lang = ?", [locale]))[0][0]?.detail_ui, {}), ...pp.detailUi }),
          locale,
        ],
      );

      const exp = exportCopy[locale];
      const [exportRows] = await connection.execute("SELECT supply_routes, certifications_gallery FROM export_page WHERE id = 1 AND lang = ?", [locale]);
      const existingSupplyRoutes = safeJson(exportRows[0]?.supply_routes, []);
      await exec(
        "UPDATE export_page SET hero_title = ?, hero_subtitle = ?, operations_eyebrow = ?, destination_eyebrow = ?, map_section_title = ?, supply_routes = ?, logistics_content = ?, packaging_title = ?, packaging_methods = ?, transportation_title = ?, transportation_methods = ?, documentation_title = ?, documentation_content = ?, quality_title = ?, technical_specs = ?, quality_checks = ? WHERE id = 1 AND lang = ?",
        [
          exp.heroTitle,
          exp.heroSubtitle,
          exp.operationsEyebrow,
          exp.destinationEyebrow,
          exp.mapSectionTitle,
          JSON.stringify(mergeImagesByKey(exp.supplyRoutes, existingSupplyRoutes, "mapCoordinatesId")),
          exp.logisticsContent,
          exp.packagingTitle,
          exp.packagingMethods,
          exp.transportationTitle,
          exp.transportationMethods,
          exp.documentationTitle,
          exp.documentationContent,
          exp.qualityTitle,
          exp.technicalSpecs,
          JSON.stringify(exp.qualityChecks.map(([title, description]) => ({ title, description }))),
          locale,
        ],
      );

      const contact = contactsCopy[locale];
      await exec(
        "UPDATE contacts_page SET page_title = ?, intro_text = ?, direct_contact_eyebrow = ?, response_label_prefix = ?, contact_form_title = ?, form_name_label = ?, form_company_label = ?, form_email_label = ?, form_message_label = ?, submit_button_label = ?, submitting_button_label = ?, map_pin_label = ?, info_email_label = ?, info_phone_label = ?, info_address_label = ?, info_hours_label = ?, social_section_title = ? WHERE id = 1 AND lang = ?",
        [
          contact.pageTitle,
          contact.introText,
          contact.directContactEyebrow,
          contact.responseLabelPrefix,
          contact.contactFormTitle,
          contact.formNameLabel,
          contact.formCompanyLabel,
          contact.formEmailLabel,
          contact.formMessageLabel,
          contact.submitButtonLabel,
          contact.submittingButtonLabel,
          contact.mapPinLabel,
          contact.infoEmailLabel,
          contact.infoPhoneLabel,
          contact.infoAddressLabel,
          contact.infoHoursLabel,
          contact.socialSectionTitle,
          locale,
        ],
      );

      await exec("UPDATE privacy_page SET content = ? WHERE id = 1 AND lang = ?", [JSON.stringify({ title: legalCopy[locale].privacyTitle, body: legalCopy[locale].privacyBody }), locale]);
      await exec("UPDATE terms_page SET content = ? WHERE id = 1 AND lang = ?", [JSON.stringify({ title: legalCopy[locale].termsTitle, body: legalCopy[locale].termsBody }), locale]);

      await exec("DELETE FROM page_seo WHERE lang = ?", [locale]);
      for (const row of pageSeoRows(locale)) {
        await exec(
          "INSERT INTO page_seo (page_id, meta_title, meta_description, slug, og_title, image_alt, lang) VALUES (?, ?, ?, ?, ?, ?, ?)",
          [row.pageId, row.metaTitle, row.metaDescription, row.slug, row.ogTitle, row.imageAlt, locale],
        );
      }

      for (const [id, copy] of Object.entries(products[locale])) {
        const [name, category, shortDescription, longDescription, highlights, sectionTitle, sectionBody] = copy;
        await exec(
          "UPDATE products SET name = ?, category = ?, short_description = ?, long_description = ?, highlights = ?, content_sections = ?, inquiry_subject_line = ?, seo = ? WHERE id = ? AND lang = ?",
          [
            name,
            category,
            shortDescription,
            longDescription,
            JSON.stringify(highlights),
            JSON.stringify([{ title: sectionTitle, body: htmlParagraph(sectionBody) }]),
            `${contact.contactFormTitle}: ${name}`,
            JSON.stringify(productSeo(locale, id, copy)),
            id,
            locale,
          ],
        );
      }
    }

    if (execute) await connection.commit();
  } catch (error) {
    if (execute) await connection.rollback();
    throw error;
  } finally {
    await connection.end();
  }

  const filtered = changes.filter(Boolean);
  console.log(execute ? "Native copy rewrite applied." : "Dry run only. Use --execute to write changes.");
  console.log(`Active locales: ${activeLocales.join(", ")}`);
  console.log(`Previewed changed surfaces: ${filtered.length}`);
  for (const change of filtered.slice(0, 20)) {
    console.log(`- ${change.label}`);
    console.log(`  before: ${change.before}`);
    console.log(`  after:  ${change.after}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
