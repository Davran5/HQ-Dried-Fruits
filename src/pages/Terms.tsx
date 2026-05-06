import { PageLayout } from "@/src/components/layout/PageLayout";
import { useSEO } from "@/src/hooks/useSEO";
import { usePages } from "@/src/contexts/PageContext";
import { useLanguage } from "@/src/contexts/LanguageContext";
import { SimplePageContent } from "@/src/types/page";

const TERMS_FALLBACK = `
<h2>1. Scope of These Terms</h2>
<p>These Terms of Service govern your use of the HQ Dried Fruits website and any wholesale inquiry or commercial communication submitted through it. By using this website, you agree to these terms.</p>

<h2>2. Website Purpose</h2>
<p>This website is operated for business-to-business (B2B) wholesale purposes. All information, pricing indications, and product specifications are provided exclusively for wholesale and export inquiry purposes and do not constitute a binding commercial offer unless confirmed in writing by HQ Dried Fruits.</p>

<h2>3. Accuracy of Information</h2>
<p>We make every effort to ensure the information on this website is accurate and up to date. However, product specifications, availability, and pricing are subject to change without notice. Final prices are confirmed at the point of a formal written quotation.</p>

<h2>4. Intellectual Property</h2>
<p>All content on this website, including text, images, logos, and design elements, is the property of HQ Dried Fruits or its licensors. You may not reproduce, distribute, or use any content from this website without prior written permission.</p>

<h2>5. Inquiry Submissions</h2>
<p>By submitting a wholesale inquiry through this website, you confirm that you are acting on behalf of a registered business entity and that the information you provide is accurate. Submitting an inquiry does not create a binding contract between you and HQ Dried Fruits.</p>

<h2>6. Limitation of Liability</h2>
<p>HQ Dried Fruits shall not be liable for any indirect, incidental, or consequential damages arising from the use of this website or reliance on the information provided herein.</p>

<h2>7. External Links</h2>
<p>This website may contain links to third-party websites. We are not responsible for the content or privacy practices of those sites.</p>

<h2>8. Governing Law</h2>
<p>These Terms of Service are governed by the laws of the Republic of Uzbekistan. Any disputes shall be resolved in the competent courts of Tashkent, Uzbekistan.</p>

<h2>9. Changes to These Terms</h2>
<p>We reserve the right to update these Terms at any time. Continued use of the website after changes constitutes acceptance of the updated terms.</p>

<h2>10. Contact</h2>
<p>For questions about these Terms of Service, please contact us through our Contacts page.</p>
`;

export function Terms() {
  const { pages, pageSeo } = usePages();
  const { t } = useLanguage();
  const pageData = pages.find((page) => page.id === "terms");
  const content = pageData?.content as SimplePageContent;
  const seo = pageSeo.terms;

  useSEO({
    title: seo?.metaTitle || `${t("termsTitle")} | HQ Dried Fruits`,
    description: seo?.metaDescription || t("termsDescription"),
    ogTitle: seo?.ogTitle || `${t("termsTitle")} | HQ Dried Fruits`,
  });

  return (
    <PageLayout>
      <section className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
        <h1 className="font-display text-4xl font-bold text-earth-900 sm:text-5xl">
          {content?.title || t("termsTitle")}
        </h1>
        <p className="mt-3 text-sm text-earth-400">{t("lastUpdatedLabel")}: {new Date().getFullYear()}</p>
        <div
          className="mt-10 space-y-6 text-earth-700 prosetext prose prose-earth max-w-none
            prose-h2:font-display prose-h2:text-2xl prose-h2:font-bold prose-h2:text-earth-900 prose-h2:mt-10 prose-h2:mb-3
            prose-p:leading-relaxed prose-li:leading-relaxed"
          dangerouslySetInnerHTML={{ __html: content?.body || TERMS_FALLBACK }}
        />
      </section>
    </PageLayout>
  );
}
