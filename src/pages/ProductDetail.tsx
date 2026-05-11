import React, { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { CheckCircle2, ArrowRight, Loader2, Download } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { PageLayout } from "@/src/components/layout/PageLayout";
import { Button } from "@/src/components/ui/Button";
import { useSEO } from "@/src/hooks/useSEO";
import { usePages } from "@/src/contexts/PageContext";
import { useProducts } from "@/src/contexts/ProductContext";
import { useLanguage } from "@/src/contexts/LanguageContext";
import { submitLead } from "@/src/lib/leads";
import { findManagedProduct, getManagedPagePath, getManagedProductPath, normalizePath, resolveManagedProductPath } from "@/src/lib/routes";

function getUploadDownloadUrl(fileUrl: string) {
  return `/api/download-upload?url=${encodeURIComponent(fileUrl)}`;
}

function hasHtml(value: string) {
  return /<\/?[a-z][\s\S]*>/i.test(value);
}

export function ProductDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const { locale } = useLanguage();
  const { pages, pageSeo } = usePages();
  const { products, productsLoaded } = useProducts();
  const [selectedImage, setSelectedImage] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [inquiryMessage, setInquiryMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const productsPage = pages.find((page) => page.id === "products");
  const detailUi = productsPage?.content?.detailUi || {};

  const resolvedPath = useMemo(
    () => resolveManagedProductPath(location.pathname, pageSeo, locale),
    [location.pathname, locale, pageSeo],
  );
  const product = useMemo(
    () => (resolvedPath ? findManagedProduct(resolvedPath.productSlug, products) : null),
    [products, resolvedPath],
  );

  useEffect(() => {
    if (!product) {
      return;
    }

    const gallery = [product.image, ...(Array.isArray(product.imageGallery) ? product.imageGallery : [])].filter(Boolean);
    setSelectedImage((current) => (gallery.includes(current) ? current : gallery[0] || ""));
  }, [product]);

  useEffect(() => {
    if (!product) {
      return;
    }

    const canonicalPath = getManagedProductPath(product, pageSeo, locale);
    if (normalizePath(location.pathname) !== canonicalPath) {
      navigate(canonicalPath, { replace: true });
    }
  }, [location.pathname, locale, navigate, pageSeo, product]);

  useSEO({
    title: product?.seo?.metaTitle || (product ? `${product.name} | HQ Dried Fruits` : "Product Not Found"),
    description: product?.seo?.metaDescription || product?.shortDescription || "",
    ogTitle: product?.seo?.ogTitle || product?.name || "",
    ogImage: product?.image || "",
    canonicalUrl: product ? getManagedProductPath(product, pageSeo, locale) : undefined,
  });

  const galleryImages = product
    ? Array.from(new Set([product.image, ...(product.imageGallery || [])].filter(Boolean)))
    : [];
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    setSubmitMessage(null);
    setIsSubmitting(true);

    try {
      await submitLead({
        company,
        email,
        productInterest: product.name,
        estTonnage: "Not specified",
        message: product.inquirySubjectLine
          ? `${product.inquirySubjectLine}. Submitted from the product detail inquiry form.\nMessage: ${inquiryMessage}`
          : `Submitted from the product detail inquiry form.\nMessage: ${inquiryMessage}`,
      });
      setCompany("");
      setEmail("");
      setInquiryMessage("");
      setSubmitMessage("Inquiry received. The export team will follow up shortly.");
    } catch (error) {
      console.error("Failed to submit product inquiry:", error);
      setSubmitMessage("Submission failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!productsLoaded) {
    return (
      <PageLayout>
        <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
          <Loader2 className="mb-4 h-12 w-12 animate-spin text-earth-500" />
          <p className="font-medium text-earth-600">{detailUi.loadingLabel || "Loading Specifications..."}</p>
        </div>
      </PageLayout>
    );
  }

  if (!resolvedPath || !product) {
    return (
      <PageLayout>
        <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
          <h1 className="mb-4 font-display text-4xl font-bold text-earth-900">
            {detailUi.notFoundTitle || "Product Not Found"}
          </h1>
          <p className="mb-8 text-earth-600">{detailUi.notFoundBody || "The product you're looking for doesn't exist."}</p>
          <Link to={getManagedPagePath("products", pageSeo, locale)}>
            <Button>{detailUi.backToCatalogLabel || "Back to Catalog"}</Button>
          </Link>
        </div>
      </PageLayout>
    );
  }

  const productCustomFields = (product.customFields || [])
    .filter((field) => field.label?.trim() || field.value?.trim())
    .slice(0, 5);
  const detailDescription = product.longDescription?.trim();

  return (
    <PageLayout>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mx-auto max-w-7xl px-4 pb-12 pt-28 sm:px-6 sm:pt-32 lg:px-8"
      >
        <div className="grid gap-16 lg:grid-cols-2">
          <div className="relative flex flex-col gap-6 lg:sticky lg:top-32 lg:h-[calc(100vh-10rem)]">
            <div className="relative h-[24rem] overflow-hidden rounded-[3rem] bg-amber-50 group sm:h-[32rem] lg:h-auto lg:flex-1">
              <motion.img
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                src={selectedImage || product.image}
                alt={product.name}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex h-24 shrink-0 gap-4">
              {galleryImages.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => setSelectedImage(image)}
                  className={`h-full w-24 overflow-hidden rounded-2xl border-2 transition-colors ${
                    selectedImage === image ? "border-earth-500" : "border-transparent hover:border-earth-500"
                  }`}
                >
                  <img
                    src={image}
                    alt="Thumbnail"
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </button>
              ))}
            </div>

            {product.technicalPassport?.fileUrl && (
              <motion.a
                href={getUploadDownloadUrl(product.technicalPassport.fileUrl)}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="group flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-earth-200 bg-earth-50 px-6 py-4 text-sm font-bold text-earth-800 shadow-sm transition-all duration-200 hover:border-earth-400 hover:bg-earth-100 hover:shadow-md active:scale-[0.98]"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-earth-200 transition-colors group-hover:bg-earth-300">
                  <Download className="h-4 w-4 text-earth-700" />
                </span>
                <span className="flex-1 text-left">
                  {product.technicalPassport.buttonLabel || "Download Technical Passport"}
                </span>
                <span className="text-xs font-normal text-earth-500 uppercase tracking-wider">PDF</span>
              </motion.a>
            )}
          </div>
          <div className="flex flex-col py-8">
            <div className="mb-4 text-sm font-bold uppercase tracking-wider text-earth-500">
              {product.category}
            </div>
            <h1 className="mb-6 font-display text-4xl font-bold text-earth-900 sm:text-5xl">
              {product.name}
            </h1>
            {detailDescription ? (
              hasHtml(detailDescription) ? (
                <div
                  className="prose prose-earth prose-lg mb-10 text-earth-600"
                  dangerouslySetInnerHTML={{ __html: detailDescription }}
                />
              ) : (
                <p className="mb-10 whitespace-pre-line text-xl leading-relaxed text-earth-700">
                  {detailDescription}
                </p>
              )
            ) : (
              <p className="mb-10 text-xl leading-relaxed text-earth-700">
                {product.shortDescription}
              </p>
            )}
            <div className="mb-12 grid gap-4 sm:grid-cols-2">
              {(product.highlights || [
                "100% Natural & Organic",
                "No Added Sugars",
                "High in Potassium",
                "Laser Sorted Purity",
                "Moisture: 18-22%",
                "Shelf Life: 12 Months"
              ]).map((benefit, i) => (
                <div key={i} className="flex items-center gap-3 font-medium text-earth-800">
                  <CheckCircle2 className="h-5 w-5 text-mint-500" /> {benefit}
                </div>
              ))}
            </div>
            {productCustomFields.length > 0 && (
              <div className="mb-16 rounded-[2rem] bg-earth-50 p-8">
                <h3 className="mb-6 font-display text-2xl font-bold text-earth-900">
                  {detailUi.nutritionTitle || "Product Information"}{" "}
                  {detailUi.nutritionPerLabel && (
                    <span className="text-sm font-normal text-earth-500">{detailUi.nutritionPerLabel}</span>
                  )}
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {productCustomFields.map((field, fieldIndex) => (
                    <div key={`${field.label}-${fieldIndex}`} className="rounded-2xl bg-white px-5 py-4">
                      <div className="text-xs font-bold uppercase tracking-[0.18em] text-earth-400">{field.label}</div>
                      <div className="mt-2 font-display text-xl font-bold leading-tight text-earth-900">{field.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="rounded-[2rem] border border-earth-200 bg-white p-8 shadow-sm">
              <h3 className="mb-6 font-display text-2xl font-bold text-earth-900">
                {detailUi.inquiryTitle || "Request a Sample or Quote"}
              </h3>
              <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <input
                    type="text"
                    placeholder={detailUi.companyPlaceholder || "Company Name"}
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full rounded-xl border border-earth-100 bg-earth-50 px-4 py-3 text-earth-900 outline-none focus:ring-2 focus:ring-earth-500"
                  />
                  <input
                    type="email"
                    required
                    placeholder={detailUi.emailPlaceholder || "Work Email"}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-earth-100 bg-earth-50 px-4 py-3 text-earth-900 outline-none focus:ring-2 focus:ring-earth-500"
                  />
                </div>
                <textarea
                  required
                  rows={4}
                  placeholder={
                    detailUi.volumePlaceholder && !/select volume/i.test(detailUi.volumePlaceholder)
                      ? detailUi.volumePlaceholder
                      : "Leave a message..."
                  }
                  value={inquiryMessage}
                  onChange={(e) => setInquiryMessage(e.target.value)}
                  className="w-full resize-none rounded-xl border border-earth-100 bg-earth-50 px-4 py-3 text-earth-900 outline-none focus:ring-2 focus:ring-earth-500"
                />
                <Button type="submit" className="mt-2 h-12 w-full" disabled={isSubmitting || !email || !inquiryMessage}>
                  {isSubmitting
                    ? detailUi.inquirySubmittingLabel || "Sending Inquiry..."
                    : detailUi.inquiryButtonLabel || "Send Inquiry"}{" "}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                {submitMessage && (
                  <p className="text-sm text-earth-600">{submitMessage}</p>
                )}
              </form>
            </div>
          </div>
        </div>
      </motion.div>
    </PageLayout>
  );
}
