export const en = {
  // Navigation
  navHome: "Home",
  navAbout: "About",
  navProducts: "Products",
  navExport: "Export",
  navContacts: "Contacts",
  navCta: "Get Quote",

  // Header / Mobile menu
  mobileNavigationTitle: "Navigation",
  mobileContactTitle: "Contact Us",

  // Language switcher
  langSwitcherLabel: "Language",

  // Footer
  footerLinksTitle: "Company",
  footerCompanyPlaceholder: "Company Name",
  footerEmailPlaceholder: "Email Address",
  footerSubmitLabel: "Send",
  footerSubmittingLabel: "Sending",
  footerSecondaryContactPrefix: "Prefer direct contact?",
  footerTelegramLinkLabel: "contact us on Telegram",
  footerPrivacyLinkLabel: "Privacy Policy",
  footerTermsLinkLabel: "Terms of Service",

  // 404 / Not found
  notFoundTitle: "Page Not Found",
  notFoundBody: "The page you requested does not exist or its address has changed.",
  notFoundButtonLabel: "Back to Homepage",

  // Loading
  routeLoadingLabel: "Loading route...",

  // Products page form
  stepOneLabel: "Which products are you interested in?",
  stepTwoLabel: "Set tonnage for each selected product",
  stepThreeLabel: "Who should receive the quote?",
  nextStepButtonLabel: "Next Step",
  backButtonLabel: "Back",
  submitButtonLabel: "Get Instant Quote",
  submittingButtonLabel: "Sending...",
  stepThreePlaceholder: "Work Email Address",

  // Contacts page
  contactsFormName: "Full Name",
  contactsFormEmail: "Email Address",
  contactsFormPhone: "Phone Number",
  contactsFormMessage: "Message",
  contactsFormSubmit: "Send Message",
  contactsFormSubmitting: "Sending...",
  contactsFormSuccess: "Message sent! We will get back to you shortly.",
  contactsFormError: "Failed to send. Please try again.",

  // Privacy & Terms
  privacyTitle: "Privacy Policy",
  termsTitle: "Terms of Service",

  // Admin login
  adminLoginTitle: "Control Room",
  adminLoginSubtitle: "Sign in to manage your website",
  adminLoginUsername: "Username",
  adminLoginPassword: "Password",
  adminLoginButton: "Sign In",
  adminLoginError: "Invalid username or password.",
  adminLoginLoading: "Signing in...",
};

export type TranslationKey = keyof typeof en;
