import { PageLayout } from "@/src/components/layout/PageLayout";
import { useSEO } from "@/src/hooks/useSEO";
import { usePages } from "@/src/contexts/PageContext";
import { SimplePageContent } from "@/src/types/page";

export function Privacy() {
  const { pages, pageSeo } = usePages();
  const pageData = pages.find((page) => page.id === "privacy");
  const content = pageData?.content as SimplePageContent;
  const seo = pageSeo.privacy;

  useSEO({
    title: seo?.metaTitle || "Privacy Policy | HQ Dried Fruits",
    description: seo?.metaDescription || "Privacy policy for HQ Dried Fruits.",
    ogTitle: seo?.ogTitle || "Privacy Policy | HQ Dried Fruits",
  });

  return (
    <PageLayout>
      <section className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
        <h1 className="font-display text-4xl font-bold text-earth-900 sm:text-5xl">
          {content?.title || "Privacy Policy"}
        </h1>
        <div
          className="mt-8 space-y-6 text-earth-700 prosetext"
          dangerouslySetInnerHTML={{ __html: content?.body || "" }}
        />
      </section>
    </PageLayout>
  );
}
