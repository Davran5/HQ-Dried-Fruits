import { PageLayout } from "@/src/components/layout/PageLayout";
import { useSEO } from "@/src/hooks/useSEO";
import { usePages } from "@/src/contexts/PageContext";
import { useLanguage } from "@/src/contexts/LanguageContext";
import { SimplePageContent } from "@/src/types/page";

const PRIVACY_FALLBACK = `
<h2>1. Information We Collect</h2>
<p>We collect information you voluntarily provide when submitting a wholesale inquiry, requesting a quote, or contacting us through our website. This includes your name, company name, email address, phone number, and the nature of your inquiry.</p>

<h2>2. How We Use Your Information</h2>
<p>We use the information submitted through this website solely to:</p>
<ul>
  <li>Respond to your wholesale inquiry or quote request</li>
  <li>Prepare and send commercial proposals and pricing</li>
  <li>Manage ongoing business communication</li>
  <li>Improve our services and export offerings</li>
</ul>

<h2>3. Information Sharing</h2>
<p>We do not sell, rent, or share your personal information with third parties except where required by law or necessary to fulfil your request (e.g., freight and logistics partners for shipment coordination).</p>

<h2>4. Data Security</h2>
<p>We implement appropriate technical and organizational measures to protect the information you provide. However, no method of transmission over the internet is completely secure.</p>

<h2>5. Data Retention</h2>
<p>We retain your information for as long as necessary to fulfil the purposes for which it was collected, or as required by applicable law.</p>

<h2>6. Your Rights</h2>
<p>You may request access to, correction of, or deletion of your personal data by contacting us directly at the email address listed on our Contacts page.</p>

<h2>7. Cookies</h2>
<p>Our website uses only functional cookies necessary for the website to operate. We do not use tracking or advertising cookies.</p>

<h2>8. Changes to This Policy</h2>
<p>We may update this Privacy Policy from time to time. The updated version will be indicated by a revised date at the top of this page.</p>

<h2>9. Contact</h2>
<p>If you have questions about this Privacy Policy, please contact us through the details provided on our Contacts page.</p>
`;

export function Privacy() {
  const { pages, pageSeo, globalSettings } = usePages();
  const uiLabels = globalSettings.uiLabels || {};
  const { t } = useLanguage();
  const pageData = pages.find((page) => page.id === "privacy");
  const content = pageData?.content as SimplePageContent;
  const seo = pageSeo.privacy;

  useSEO({
    title: seo?.metaTitle || uiLabels.privacyTitle || `${t("privacyTitle")} | HQ Dried Fruits`,
    description: seo?.metaDescription || t("privacyDescription"),
    ogTitle: seo?.ogTitle || uiLabels.privacyTitle || `${t("privacyTitle")} | HQ Dried Fruits`,
  });

  return (
    <PageLayout>
      <section className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
        <h1 className="font-display text-4xl font-bold text-earth-900 sm:text-5xl">
          {content?.title || uiLabels.privacyTitle || t("privacyTitle")}
        </h1>
        <p className="mt-3 text-sm text-earth-400">{t("lastUpdatedLabel")}: {new Date().getFullYear()}</p>
        <div
          className="mt-10 space-y-6 text-earth-700 prosetext prose prose-earth max-w-none
            prose-h2:font-display prose-h2:text-2xl prose-h2:font-bold prose-h2:text-earth-900 prose-h2:mt-10 prose-h2:mb-3
            prose-p:leading-relaxed prose-li:leading-relaxed"
          dangerouslySetInnerHTML={{ __html: content?.body || PRIVACY_FALLBACK }}
        />
      </section>
    </PageLayout>
  );
}
