import fs from 'fs';

const ruUiLabels = {
    mobileNavigationTitle: "Навигация",
    mobileContactTitle: "Связаться с нами",
    homeMetaTitle: "HQ Dried Fruits | Высококачественный органический экспорт",
    productsMetaTitle: "Наша продукция | Оптовый каталог",
    exportMetaTitle: "Глобальный экспорт и логистика",
    contactsMetaTitle: "Контакты | Оптовые запросы",
    routeLoadingLabel: "Загрузка маршрута...",
    notFoundTitle: "Страница не найдена",
    notFoundBody: "Запрашиваемая страница не существует или ее адрес изменился.",
    notFoundButtonLabel: "Вернуться на главную",
    requestCatalogLabel: "Запросить оптовый каталог",
    exploreProductsLabel: "Изучить продукцию",
    heritageSloganLabel: "Десятилетия опыта в каждом урожае.",
    aboutCompanyLabel: "О компании",
    statYearsLabel: "Лет опыта",
    statTonsLabel: "Тонн экспортировано",
    productSelectionSublabel: "Собрано вручную и высушено на солнце.",
    viewFullCatalogLabel: "Весь каталог",
    requestSampleLabel: "Запросить образцы",
    learnMoreLabel: "О нашем процессе экспорта",
    getPricingLabel: "Цены и образцы",
    heritageStat1Title: "Первый урожай", heritageStat1Desc: "Началось как небольшой семейный сад в Ферганской долине.",
    heritageStat2Title: "Масштабирование", heritageStat2Desc: "Внедрение современных методов сушки на солнце.",
    heritageStat3Title: "Мировой рынок", heritageStat3Desc: "Получение международных органических сертификатов.",
    heritageStat4Title: "Современная логистика", heritageStat4Desc: "Высокотехнологичный логистический хаб в Ташкенте.",
    prodStep1Title: "Прием сырья", prodStep1Subtitle: "Отбор урожая", prodStep1Desc: "Поступающие фрукты сортируются по партиям, профилю влажности и требованиям назначения.",
    prodStep2Title: "Переработка", prodStep2Subtitle: "Лазерный и рентгеновский контроль", prodStep2Desc: "Каждая линия откалибрована для обеспечения чистоты и экспортного качества.",
    prodStep3Title: "Упаковка", prodStep3Subtitle: "Форматы под заказчика", prodStep3Desc: "Мы упаковываем для розницы, под собственными торговыми марками или для промышленности.",
    prodStep4Title: "Отправка", prodStep4Subtitle: "Передача на экспорт", prodStep4Desc: "Груз документируется, паллетируется и отправляется по оптимальному маршруту.",
    missionPurposeLabel: "Цель", missionHeritageLabel: "Наследие", missionPhilosophyLabel: "Философия", missionStandardsLabel: "Стандарты",
    orchardPhilosophyLabel: "Философия сада",
    whoWeAreFallback1: "Расположенная в сельскохозяйственном центре Центральной Азии, HQ Dried Fruits объединяет контроль садов и дисциплину переработки.",
    whoWeAreFallback2: "Это помогает оптовым покупателям получать стабильный продукт и четкую документацию.",
    missionNarrativeEyebrow: "Миссия", missionNarrativeTitle: "Что направляет нас в выращивании и переработке", missionNarrativeSublabel: "Взгляд на миссию компании, наследие, философию и стандарты.",
    insideFacilityEyebrow: "Внутри предприятия",
    haccpLabel: "Сертификат HACCP", isoLabel: "ISO 9001:2015", organicLabel: "100% Органика", globalGapLabel: "GlobalGap", fdaLabel: "Зарегистрировано FDA",
    exportOpsEyebrow: "Экспортные операции", exportOpsTitle: "Логистика, документация и упаковка под заказчика",
    logisticsDesc1: "Мы обеспечиваем полную мультимодальную транспортировку в соответствии с требованиями покупателя.",
    logisticsDesc2: "Каждая отгрузка структурирована для повторяемости и соответствия требованиям страны назначения.",
    packagingTitle: "Индивидуальная упаковка", packagingDesc: "Коробки, вакуумные пакеты или розничная упаковка под вашим брендом.",
    transportationTitle: "Морские и ж/д перевозки", transportationDesc: "Экономичные FCL и LCL перевозки через основные порты и ж/д сети.",
    documentationTitle: "Таможенное оформление", documentationDesc: "Полная документальная поддержка, включая фитосанитарные сертификаты и сертификаты происхождения.",
    destinationBreakdownEyebrow: "География экспорта", destinationBreakdownTitle: "Подготовка каждой линии к отправке", destinationBreakdownDesc: "Планирование экспорта меняется в зависимости от рынка.",
    qualityGuaranteeTitle: "Гарантия качества", qualityGuaranteeDesc: "Наши мощности используют лазерную сортировку для обеспечения чистоты 99.9%.",
    moistureControlLabel: "Контроль влажности", moistureControlDesc: "Поддерживается на уровне 18-22% для оптимального срока хранения.",
    sizeCalibrationLabel: "Калибровка размера", sizeCalibrationDesc: "Лазерная калибровка (Jumbo, Large, Medium).",
    microSafeLabel: "Микробиологическая безопасность", microSafeDesc: "Регулярные лабораторные тесты на афлатоксины.",
    qualitySealLabel: "Знак качества продукции",
    contactsTitle: "Давайте свяжемся",
    contactsIntroFallback: "Нужна ли вам цена, образцы или детали логистики, наша команда готова помочь.",
    sendInquiryTitle: "Отправить запрос",
    formNameLabel: "Полное имя", formEmailLabel: "Рабочая почта", formPhoneLabel: "Номер телефона", formMessageLabel: "Сообщение", formCompanyLabel: "Компания",
    submitBtnLabel: "Отправить запрос", submittingLabel: "Отправка...", sendMessageLabel: "Отправить сообщение",
    inquirySuccessMsg: "Запрос получен. Наша команда свяжется с вами в ближайшее время.",
    inquiryFailureMsg: "Ошибка отправки. Пожалуйста, попробуйте снова.",
    directContactEyebrow: "Прямой контакт", contactDetailsTitle: "Контактная информация", contactDetailsDesc: "Свяжитесь с отделом продаж по наиболее удобному для вас каналу.",
    emailLabel: "Email", phoneLabel: "Телефон", headquartersLabel: "Главный офис", workingHoursLabel: "Рабочее время",
    footerLinksTitle: "Компания",
    footerCompanyPlaceholder: "Название компании",
    footerEmailPlaceholder: "Email адрес",
    footerSubmitLabel: "Отправить",
    footerSubmittingLabel: "Отправка",
    footerSecondaryContactPrefix: "Предпочитаете прямой контакт?",
    footerTelegramLinkLabel: "напишите нам в Telegram",
    footerAdminLinkLabel: "Админ-панель",
    footerPrivacyLinkLabel: "Политика конфиденциальности",
    footerTermsLinkLabel: "Условия использования",
    footerCopyright: "HQ Dried Fruits. Все права защищены.",
    footerInquirySuccess: "Спасибо за обращение! Мы скоро свяжемся с вами.",
    productsTitle: "Оптовый каталог", productsSubtitle: "Изучите нашу коллекцию для экспорта.",
    overviewLabel: "Обзор", originLabel: "Происхождение", benefitsLabel: "Польза", exportLabel: "Экспорт",
    requestQuoteBtn: "Запросить оптовую цену", orderingFormStepLabel: "Шаг",
    privacyTitle: "Политика конфиденциальности", termsTitle: "Условия использования"
};

const uzUiLabels = {
    mobileNavigationTitle: "Navigatsiya",
    mobileContactTitle: "Biz bilan bog'lanish",
    homeMetaTitle: "HQ Dried Fruits | Yuqori sifatli organik eksport",
    productsMetaTitle: "Mahsulotlarimiz | Ulgurji katalog",
    exportMetaTitle: "Global eksport va logistika",
    contactsMetaTitle: "Kontaktlar | Ulgurji so'rovlar",
    routeLoadingLabel: "Yo'nalish yuklanmoqda...",
    notFoundTitle: "Sahifa topilmadi",
    notFoundBody: "Siz so'ragan sahifa mavjud emas yoki uning manzili o'zgargan.",
    notFoundButtonLabel: "Bosh sahifaga qaytish",
    requestCatalogLabel: "Ulgurji katalogni so'rash",
    exploreProductsLabel: "Mahsulotlarni ko'rish",
    heritageSloganLabel: "Har bir hosilda o'n yillik tajriba.",
    aboutCompanyLabel: "Kompaniya haqida",
    statYearsLabel: "Yillik tajriba",
    statTonsLabel: "Eksport qilingan tonna",
    productSelectionSublabel: "Qo'lda terilgan va quyoshda quritilgan.",
    viewFullCatalogLabel: "To'liq katalog",
    requestSampleLabel: "Namuna so'rash",
    learnMoreLabel: "Eksport jarayonimiz haqida",
    getPricingLabel: "Narxlar va namunalar",
    heritageStat1Title: "Birinchi hosil", heritageStat1Desc: "Farg'ona vodiysida kichik oilaviy bog' sifatida boshlangan.",
    heritageStat2Title: "Kengayish", heritageStat2Desc: "Zamonaviy quyoshda quritish usullarini joriy etish.",
    heritageStat3Title: "Global bozor", heritageStat3Desc: "Xalqaro organik sertifikatlarni olish.",
    heritageStat4Title: "Zamonaviy logistika", heritageStat4Desc: "Toshkentdagi yuqori texnologiyali logistika markazi.",
    prodStep1Title: "Xomashyo qabuli", prodStep1Subtitle: "Hosil tanlovi", prodStep1Desc: "Kelayotgan mevalar partiyalar, namlik darajasi va talablarga ko'ra saralanadi.",
    prodStep2Title: "Qayta ishlash", prodStep2Subtitle: "Lazer va rentgen nazorati", prodStep2Desc: "Har bir liniya tozalik va eksport sifatini ta'minlash uchun sozlangan.",
    prodStep3Title: "Qadoqlash", prodStep3Subtitle: "Buyurtmachi formatlari", prodStep3Desc: "Biz chakana savdo, xususiy brendlar yoki sanoat uchun qadoqlaymiz.",
    prodStep4Title: "Yuborish", prodStep4Subtitle: "Eksportga topshirish", prodStep4Desc: "Yuk hujjatlashtiriladi, palletlanadi va optimal yo'nalish bo'yicha yuboriladi.",
    missionPurposeLabel: "Maqsad", missionHeritageLabel: "Meros", missionPhilosophyLabel: "Falsafa", missionStandardsLabel: "Standartlar",
    orchardPhilosophyLabel: "Bog' falsafasi",
    whoWeAreFallback1: "Markaziy Osiyoning qishloq xo'jaligi markazida joylashgan HQ Dried Fruits bog' nazorati va qayta ishlash intizomini birlashtiradi.",
    whoWeAreFallback2: "Bu ulgurji xaridorlarga barqaror mahsulot va aniq hujjatlarni olishga yordam beradi.",
    missionNarrativeEyebrow: "Missiya", missionNarrativeTitle: "Yetishtirish va qayta ishlashda bizni nima boshqaradi", missionNarrativeSublabel: "Kompaniya missiyasi, merosi, falsafasi va standartlariga nazar.",
    insideFacilityEyebrow: "Korxona ichida",
    haccpLabel: "HACCP sertifikati", isoLabel: "ISO 9001:2015", organicLabel: "100% Organik", globalGapLabel: "GlobalGap", fdaLabel: "FDA ro'yxatidan o'tgan",
    exportOpsEyebrow: "Eksport operatsiyalari", exportOpsTitle: "Buyurtmachi talabiga ko'ra logistika, hujjatlar va qadoqlash",
    logisticsDesc1: "Biz xaridor talablariga muvofiq to'liq multimodal tashishni ta'minlaymiz.",
    logisticsDesc2: "Har bir yuk tashish takrorlanuvchanlik va boradigan mamlakat talablariga muvofiq tuzilgan.",
    packagingTitle: "Maxsus qadoqlash", packagingDesc: "Sizning brendingiz ostida qutilar, vakuumli paketlar yoki chakana qadoqlar.",
    transportationTitle: "Dengiz va t-yo'l tashuvlari", transportationDesc: "Asosiy portlar va t-yo'l tarmoqlari orqali tejamkor FCL va LCL tashuvlar.",
    documentationTitle: "Bojxona rasmiylashtiruvi", documentationDesc: "To'liq hujjatli qo'llab-quvvatlash, shu jumladan fitosanitariya va kelib chiqish sertifikatlari.",
    destinationBreakdownEyebrow: "Eksport geografiyasi", destinationBreakdownTitle: "Har bir liniyani yuborishga tayyorlash", destinationBreakdownDesc: "Eksportni rejalashtirish bozorga qarab o'zgaradi.",
    qualityGuaranteeTitle: "Sifat kafolati", qualityGuaranteeDesc: "Bizning quvvatlarimiz 99.9% tozalikni ta'minlash uchun lazerli saralashdan foydalanishimiz kerak.",
    moistureControlLabel: "Namlik nazorati", moistureControlDesc: "Optimal saqlash muddati uchun 18-22% darajasida saqlanadi.",
    sizeCalibrationLabel: "O'lcham kalibrlash", sizeCalibrationDesc: "Lazerli kalibrlash (Jumbo, Large, Medium).",
    microSafeLabel: "Mikrobiologik xavfsizlik", microSafeDesc: "Aflatoksinlar bo'yicha muntazam laboratoriya sinovlari.",
    qualitySealLabel: "Mahsulot sifat belgisi",
    contactsTitle: "Bog'lanish",
    contactsIntroFallback: "Sizga narx, namunalar yoki logistika tafsilotlari kerak bo'ladimi, jamoamiz yordamga tayyor.",
    sendInquiryTitle: "So'rov yuborish",
    formNameLabel: "To'liq ism", formEmailLabel: "Ish pochtasi", formPhoneLabel: "Telefon raqami", formMessageLabel: "Xabar", formCompanyLabel: "Kompaniya",
    submitBtnLabel: "So'rov yuborish", submittingLabel: "Yuborilmoqda...", sendMessageLabel: "Xabarni yuborish",
    inquirySuccessMsg: "So'rov qabul qilindi. Jamoamiz tez orada siz bilan bog'lanadi.",
    inquiryFailureMsg: "Yuborishda xato. Iltimos, qaytadan urinib ko'ring.",
    directContactEyebrow: "To'g'ridan-to'g'ri bog'lanish", contactDetailsTitle: "Kontakt ma'lumotlari", contactDetailsDesc: "Sotuv bo'limi bilan o'zingizga qulay kanal orqali bog'laning.",
    emailLabel: "Email", phoneLabel: "Telefon", headquartersLabel: "Bosh ofis", workingHoursLabel: "Ish vaqti",
    footerLinksTitle: "Kompaniya",
    footerCompanyPlaceholder: "Kompaniya nomi",
    footerEmailPlaceholder: "Email manzili",
    footerSubmitLabel: "Yuborish",
    footerSubmittingLabel: "Yuborilmoqda",
    footerSecondaryContactPrefix: "To'g'ridan-to'g'ri bog'lanishni afzal ko'rasizmi?",
    footerTelegramLinkLabel: "Telegram orqali yozing",
    footerAdminLinkLabel: "Admin paneli",
    footerPrivacyLinkLabel: "Maxfiylik siyosati",
    footerTermsLinkLabel: "Foydalanish shartlari",
    footerCopyright: "HQ Dried Fruits. Barcha huquqlar himoyalangan.",
    footerInquirySuccess: "Murojaat uchun rahmat! Tez orada bog'lanamiz.",
    productsTitle: "Ulgurji katalog", productsSubtitle: "Eksport uchun mo'ljallangan to'plamimizni ko'ring.",
    overviewLabel: "Sharh", originLabel: "Kelib chiqishi", benefitsLabel: "Foydasi", exportLabel: "Eksport",
    requestQuoteBtn: "Ulgurji narxni so'rash", orderingFormStepLabel: "Qadam",
    privacyTitle: "Maxfiylik siyosati", termsTitle: "Foydalanish shartlari"
};

const dbFile = 'database.json';
const db = JSON.parse(fs.readFileSync(dbFile, 'utf8'));

// Update global_settings
db.global_settings.forEach(row => {
    if (row.lang === 'ru') {
        row.site_name = "HQ Dried Fruits";
        row.nav_links = JSON.stringify([{ label: "Главная", url: "/" }, { label: "О нас", url: "/about" }, { label: "Продукция", url: "/products" }, { label: "Экспорт", url: "/export" }, { label: "Контакты", url: "/contacts" }]);
        row.cta_text = "Получить расчет";
        row.footer_description = "Качественные сухофрукты из сердца Узбекистана. Экспорт природной сладости глобальным B2B партнерам с бескомпромиссным качеством.";
        row.footer_lead_text = "Получайте последние цены и условия экспорта прямо на почту или в Telegram.";
        row.ui_labels = ruUiLabels;
    } else if (row.lang === 'uz') {
        row.site_name = "HQ Dried Fruits";
        row.nav_links = JSON.stringify([{ label: "Asosiy", url: "/" }, { label: "Biz haqimizda", url: "/about" }, { label: "Mahsulotlar", url: "/products" }, { label: "Eksport", url: "/export" }, { label: "Kontaktlar", url: "/contacts" }]);
        row.cta_text = "Narxni olish";
        row.footer_description = "O'zbekiston markazidan sifatli quritilgan mevalar. Tabiiy shirinlikni global B2B hamkorlarga murosasiz sifat bilan eksport qilamiz.";
        row.footer_lead_text = "Oxirgi narxlar va eksport shartlarini to'g'ridan-to'g'ri elektron pochta yoki Telegram orqali oling.";
        row.ui_labels = uzUiLabels;
    }
});

// Update home_page
db.home_page.forEach(row => {
    if (row.lang === 'ru') {
        row.content = {
            heroTitle: "Сладость природы, высушенная на солнце до совершенства.",
            heroSubtitle: "Качественные сухофрукты из сердца Узбекистана. Мы экспортируем лучшие абрикосы, изюм и чернослив глобальным B2B партнерам.",
            introLabel: "Наследие качества",
            introText: "Наш уникальный климат и богатая минералами почва позволяют выращивать фрукты с непревзойденной естественной сладостью и ярким цветом, не требующие искусственных добавок.",
            supplyReachTitle: "Бесшовный глобальный экспорт",
            supplyReachOverview: "От наших залитых солнцем полей сушки прямо до вашего склада. Мы берем на себя все таможенные вопросы, упаковку и экспедирование грузов.",
            productPreviewTitle: "Экспортный выбор",
            ctaHeading: "Готовы расширить свою линейку продуктов?",
            ctaSubheading: "Получите наш последний оптовый прайс-лист и бесплатную коробку с образцами с доставкой в ваш офис.",
            ctaButtonText: "Получить цены и образцы"
        };
    } else if (row.lang === 'uz') {
        row.content = {
            heroTitle: "Tabiat shirinligi, quyoshda mukammal darajada quritilgan.",
            heroSubtitle: "O'zbekiston markazidan sifatli quritilgan mevalar. Biz eng sara o'rik, mayiz va olxo'rini global B2B hamkorlarga eksport qilamiz.",
            introLabel: "Sifat merosi",
            introText: "Bizning noyob iqlimimiz va minerallarga boy tuprog'imiz hech qanday sun'iy qo'shimchalarsiz tengsiz tabiiy shirinlik va yorqin rangga ega mevalarni yetishtirish imkonini beradi.",
            supplyReachTitle: "Uzluksiz global eksport",
            supplyReachOverview: "Bizning quyoshli quritish maydonlarimizdan to'g'ridan-to'g'ri omboringizgacha. Biz barcha bojxona masalalari, qadoqlash va yuk tashishni o'z zimmamizga olamiz.",
            productPreviewTitle: "Eksport tanlovi",
            ctaHeading: "Mahsulot qatoringizni kengaytirishga tayyormisiz?",
            ctaSubheading: "Oxirgi ulgurji narxlarimiz va ofisingizga yetkazib beriladigan bepul namunalar qutisini oling.",
            ctaButtonText: "Narxlar va namunalarni olish"
        };
    }
});

// Update about_page
db.about_page.forEach(row => {
    if (row.lang === 'ru') {
        row.content = {
            marqueeTitle: "Мировые партнеры и производственные мощности",
            heritageSubtitle: "Взгляд на сады, стандарты производства и операционную инфраструктуру.",
            missionTitle: "Наша миссия",
            missionStatement: "<p>Наша миссия — соединить традиционные методы сушки на солнце с современными правилами безопасности пищевых продуктов.</p>",
            philosophyTitle: "Наследие и философия",
            whoWeAreContent: "<p>Находясь в сельскохозяйственном центре Центральной Азии, мы выращиваем, перерабатываем и экспортируем сухофрукты с долгосрочной стабильностью для оптовых покупателей.</p>",
            orchardPhilosophy: "Мы верим в устойчивое сельское хозяйство без ущерба для эффективности оптовых поставок.",
            productionStandardsTitle: "Стандарты производства",
            productionStandards: "Линии сортировки сертифицированы по ISO 22000, HACCP и Organic."
        };
    } else if (row.lang === 'uz') {
        row.content = {
            marqueeTitle: "Global hamkorlar va ishlab chiqarish quvvatlari",
            heritageSubtitle: "Bog'lar, ishlab chiqarish standartlari va operatsion infratuzilmamizga nazar.",
            missionTitle: "Bizning missiyamiz",
            missionStatement: "<p>Bizning missiyamiz — an'anaviy quyoshda quritish usullarini zamonaviy oziq-ovqat xavfsizligi qoidalari bilan birlashtirish.</p>",
            philosophyTitle: "Meros va falsafa",
            whoWeAreContent: "<p>Markaziy Osiyoning qishloq xo'jaligi markazida joylashgan holda, biz ulgurji xaridorlar uchun uzoq muddatli barqarorlik bilan quritilgan mevalarni yetishtiramiz, qayta ishlaymiz va eksport qilamiz.</p>",
            orchardPhilosophy: "Biz ulgurji samaradorlikka zarar yetkazmagan holda barqaror qishloq xo'jaligiga ishonamiz.",
            productionStandardsTitle: "Ishlab chiqarish standartlari",
            productionStandards: "ISO 22000, HACCP va Organik sertifikatlangan saralash liniyalari."
        };
    }
});

// Update export_page
db.export_page.forEach(row => {
    if (row.lang === 'ru') {
        row.content = {
            heroTitle: "Глобальная логистика и экспорт",
            heroDescription: "Бесшовная глобальная логистика из сердца Шелкового пути прямо на ваш склад. Мы берем на себя таможню, упаковку и экспедирование грузов.",
            qualityCommitmentTitle: "Обязательства по качеству",
            qualityCommitmentDesc: "Каждая партия проходит строгий контроль качества перед отправкой."
        };
    } else if (row.lang === 'uz') {
        row.content = {
            heroTitle: "Global logistika va eksport",
            heroDescription: "Ipak yo'li markazidan to'g'ridan-to'g'ri omboringizgacha uzluksiz global logistika. Biz bojxona, qadoqlash va yuk tashishni hal qilamiz.",
            qualityCommitmentTitle: "Sifat majburiyati",
            qualityCommitmentDesc: "Har bir partiya jo'natishdan oldin qat'iy sifat nazoratidan o'tadi."
        };
    }
});

fs.writeFileSync(dbFile, JSON.stringify(db, null, 2));
console.log('Successfully forced population of database.json with all page contents');
