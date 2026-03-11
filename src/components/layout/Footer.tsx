import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Leaf, MapPin, Phone, Mail, Send } from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { usePages } from "@/src/contexts/PageContext";
import { useProducts } from "@/src/contexts/ProductContext";
import { submitLead } from "@/src/lib/leads";
import { canonicalizeManagedUrl, getManagedPagePath } from "@/src/lib/routes";

export function Footer() {
  const { globalSettings, pageSeo } = usePages();
  const { products } = useProducts();
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  const siteName = globalSettings.siteName || "HQ Dried Fruits";
  const uiLabels = globalSettings.uiLabels || {};
  const footerDescription =
    globalSettings.footerDescription ||
    "Quality sun-dried fruits from the heart of Uzbekistan. Exporting nature's sweetness to global B2B partners with uncompromising quality.";
  const footerLeadText =
    globalSettings.footerLeadText || "Get our latest pricing and export terms directly to your inbox or Telegram.";
  const footerCtaEmail = globalSettings.footerCtaEmail || globalSettings.emailAddress || "export@hqdriedfruits.com";
  const telegramUrl = globalSettings.telegramUrl?.trim();
  const footerCopyrightText = globalSettings.footerCopyrightText || `${siteName}. All rights reserved.`;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitMessage(null);
    setIsSubmitting(true);

    try {
      await submitLead({
        company,
        email,
        productInterest: "Footer wholesale catalog request",
        message: `Submitted from the footer lead capture form. Preferred internal routing: ${footerCtaEmail}.`,
      });
      setCompany("");
      setEmail("");
      setSubmitMessage("Request received. The sales team will contact you shortly.");
    } catch (error) {
      console.error("Failed to submit footer inquiry:", error);
      setSubmitMessage("Submission failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="relative -mt-px overflow-hidden bg-earth-900 pt-16 pb-12 text-earth-50 sm:mt-0 sm:pt-32">
      <div className="absolute inset-x-0 top-0 h-px bg-earth-900 sm:hidden" />
      <div className="absolute inset-x-0 top-[-1px] hidden w-full overflow-hidden leading-none sm:block">
        <svg
          className="relative block h-[100px] w-full"
          data-name="Layer 1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
            className="fill-bg-primary"
          />
        </svg>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Link to={getManagedPagePath("home", pageSeo)} className="group mb-6 flex items-center gap-2">
              <div className="flex items-center gap-3">
                {globalSettings.footerLogo ? (
                  <img
                    src={globalSettings.footerLogo}
                    alt={`${siteName} logo`}
                    className="h-12 w-auto brightness-0 invert contrast-125"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-earth-600 text-white transition-transform group-hover:rotate-12">
                    <Leaf size={24} />
                  </div>
                )}
                <span className="font-display text-2xl font-bold tracking-tight text-white">{siteName}</span>
              </div>
            </Link>
            <p className="mb-8 max-w-sm leading-relaxed text-earth-200">{footerDescription}</p>
            <div className="flex flex-col gap-4 text-earth-200">
              <div className="flex items-center gap-3">
                <MapPin size={20} className="text-earth-500" />
                <span>{globalSettings.officeAddress || "123 Silk Road Ave, Tashkent, Uzbekistan"}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={20} className="text-earth-500" />
                <span>{globalSettings.phoneNumber || "+998 90 123 45 67"}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={20} className="text-earth-500" />
                <span>{globalSettings.emailAddress || "export@hqdriedfruits.com"}</span>
              </div>
            </div>
          </div>

          <div className="hidden md:block lg:col-span-2 lg:col-start-6">
            <h3 className="mb-6 font-display text-lg font-semibold text-white">
              {uiLabels.footerLinksTitle || "Company"}
            </h3>
            <ul className="flex flex-col gap-3">
              {globalSettings.quickLinks?.map((link) => (
                <li key={link.label}>
                  <Link
                    to={canonicalizeManagedUrl(link.url, pageSeo, products)}
                    className="text-earth-200 transition-colors hover:text-earth-500"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-3xl border border-earth-700/50 bg-earth-800/50 p-8 backdrop-blur-sm">
              <h3 className="mb-2 font-display text-xl font-semibold text-white">
                {globalSettings.footerCtaTitle || "Request Wholesale Catalog"}
              </h3>
              <p className="mb-6 text-sm text-earth-300">{footerLeadText}</p>

              <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                <input
                  type="text"
                  placeholder={uiLabels.footerCompanyPlaceholder || "Company Name"}
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full rounded-xl border border-earth-700 bg-earth-900/50 px-4 py-3 text-white outline-none transition-all placeholder-earth-400 focus:ring-2 focus:ring-earth-500"
                />
                <div className="flex gap-4">
                  <input
                    type="email"
                    required
                    placeholder={uiLabels.footerEmailPlaceholder || "Email Address"}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-earth-700 bg-earth-900/50 px-4 py-3 text-white outline-none transition-all placeholder-earth-400 focus:ring-2 focus:ring-earth-500"
                  />
                  <Button type="submit" className="shrink-0 px-8" disabled={isSubmitting}>
                    <Send size={18} className="mr-2" />
                    {isSubmitting
                      ? uiLabels.footerSubmittingLabel || "Sending"
                      : uiLabels.footerSubmitLabel || "Send"}
                  </Button>
                </div>
                {submitMessage && <p className="text-xs text-earth-300">{submitMessage}</p>}
                <p className="mt-2 text-xs text-earth-400">
                  {uiLabels.footerSecondaryContactPrefix || "Prefer direct contact?"}{" "}
                  <a href={`mailto:${footerCtaEmail}`} className="text-earth-500 hover:underline">
                    {footerCtaEmail}
                  </a>
                  {telegramUrl ? (
                    <>
                      {" "}or{" "}
                      <a href={telegramUrl} target="_blank" rel="noreferrer" className="text-earth-500 hover:underline">
                        {uiLabels.footerTelegramLinkLabel || "contact us on Telegram"}
                      </a>
                    </>
                  ) : null}
                  .
                </p>
              </form>
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between border-t border-earth-800 pt-8 sm:flex-row">
          <p className="text-sm text-earth-400">
            &copy; {new Date().getFullYear()} {footerCopyrightText}
          </p>
          <div className="mt-4 flex gap-4 sm:mt-0">
            <Link to="/admin" className="text-sm text-earth-400 hover:text-earth-200">
              {uiLabels.footerAdminLinkLabel || "Admin Panel"}
            </Link>
            <Link to={getManagedPagePath("privacy", pageSeo)} className="text-sm text-earth-400 hover:text-earth-200">
              {uiLabels.footerPrivacyLinkLabel || "Privacy Policy"}
            </Link>
            <Link to={getManagedPagePath("terms", pageSeo)} className="text-sm text-earth-400 hover:text-earth-200">
              {uiLabels.footerTermsLinkLabel || "Terms of Service"}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
