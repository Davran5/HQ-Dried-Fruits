import { motion } from "motion/react";
import { CheckCircle2, Flame, Droplets, Dumbbell, Wheat, ArrowRight, Loader2 } from "lucide-react";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { PageLayout } from "@/src/components/layout/PageLayout";
import { Button } from "@/src/components/ui/Button";
import { Select } from "@/src/components/ui/Select";
import { useSEO } from "@/src/hooks/useSEO";
import { usePages } from "@/src/contexts/PageContext";
import { Product } from "@/src/types/product";
import { submitLead } from "@/src/lib/leads";
import { getManagedPagePath, getManagedProductPath, normalizePath } from "@/src/lib/routes";

export function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { pages, pageSeo } = usePages();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState("");
  const [selectedVolume, setSelectedVolume] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const productsPage = pages.find((page) => page.id === "products");
  const detailUi = productsPage?.content?.detailUi || {};

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then(res => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then(data => {
        setProduct(data);
        const gallery = [data?.image, ...(Array.isArray(data?.imageGallery) ? data.imageGallery : [])].filter(Boolean);
        setSelectedImage(gallery[0] || "");
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch product", err);
        setIsLoading(false);
      });
  }, [id]);

  useEffect(() => {
    if (!product) {
      return;
    }

    const canonicalPath = getManagedProductPath(product, pageSeo);
    if (normalizePath(location.pathname) !== canonicalPath) {
      navigate(canonicalPath, { replace: true });
    }
  }, [location.pathname, navigate, pageSeo, product]);

  useSEO({
    title: product?.seo?.metaTitle || (product ? `${product.name} | HQ Dried Fruits` : "Product Not Found"),
    description: product?.seo?.metaDescription || product?.shortDescription || "",
    ogTitle: product?.seo?.ogTitle || product?.name || "",
    ogImage: product?.image || "",
  });

  const galleryImages = product
    ? Array.from(new Set([product.image, ...(product.imageGallery || [])].filter(Boolean)))
    : [];
  const inquiryOptions =
    product?.tonnageOptions?.length && product.tonnageOptions.length > 0
      ? product.tonnageOptions
      : ["Request Sample Box", "1 - 5 Tons", "Full Container Load (FCL)"];

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
        estTonnage: selectedVolume,
        message: product.inquirySubjectLine
          ? `${product.inquirySubjectLine}. Submitted from the product detail inquiry form.`
          : "Submitted from the product detail inquiry form.",
      });
      setCompany("");
      setEmail("");
      setSelectedVolume("");
      setSubmitMessage("Inquiry received. The export team will follow up shortly.");
    } catch (error) {
      console.error("Failed to submit product inquiry:", error);
      setSubmitMessage("Submission failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <PageLayout>
        <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
          <Loader2 className="h-12 w-12 animate-spin text-earth-500 mb-4" />
          <p className="text-earth-600 font-medium">{detailUi.loadingLabel || "Loading Specifications..."}</p>
        </div>
      </PageLayout>
    );
  }

  if (!product) {
    return (
      <PageLayout>
        <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
          <h1 className="mb-4 font-display text-4xl font-bold text-earth-900">
            {detailUi.notFoundTitle || "Product Not Found"}
          </h1>
          <p className="mb-8 text-earth-600">{detailUi.notFoundBody || "The product you're looking for doesn't exist."}</p>
          <Link to={getManagedPagePath("products", pageSeo)}>
            <Button>{detailUi.backToCatalogLabel || "Back to Catalog"}</Button>
          </Link>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8"
      >
        <div className="grid gap-16 lg:grid-cols-2">
          <div className="relative flex flex-col gap-6 lg:sticky lg:top-32 lg:h-[calc(100vh-10rem)]">
            <div className="flex-1 overflow-hidden rounded-[3rem] bg-amber-50 relative group">
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
            <div className="flex gap-4 h-24 shrink-0">
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
          </div>
          <div className="flex flex-col py-8">
            <div className="mb-4 text-sm font-bold uppercase tracking-wider text-earth-500">
              {product.category}
            </div>
            <h1 className="mb-6 font-display text-4xl font-bold text-earth-900 sm:text-5xl">
              {product.name}
            </h1>
            <p className="mb-6 text-xl leading-relaxed text-earth-700">
              {product.shortDescription}
            </p>
            {product.longDescription && (
              <div
                className="mb-10 prose prose-earth prose-lg text-earth-600"
                dangerouslySetInnerHTML={{ __html: product.longDescription }}
              />
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
                <div key={i} className="flex items-center gap-3 text-earth-800 font-medium">
                  <CheckCircle2 className="text-mint-500 h-5 w-5" /> {benefit}
                </div>
              ))}
            </div>
            <div className="mb-16 rounded-[2rem] bg-earth-50 p-8">
              <h3 className="mb-6 font-display text-2xl font-bold text-earth-900">
                {detailUi.nutritionTitle || "Nutritional Profile"}{" "}
                <span className="text-sm font-normal text-earth-500">{detailUi.nutritionPerLabel || "(per 100g)"}</span>
              </h3>
              <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
                <div className="flex flex-col items-center text-center">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                    <Flame size={24} />
                  </div>
                  <div className="font-display text-xl font-bold text-earth-900">{product.nutrition.energy}</div>
                  <div className="text-sm text-earth-600">{detailUi.caloriesLabel || "Calories"}</div>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                    <Dumbbell size={24} />
                  </div>
                  <div className="font-display text-xl font-bold text-earth-900">{product.nutrition.protein}</div>
                  <div className="text-sm text-earth-600">{detailUi.proteinLabel || "Protein"}</div>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 text-yellow-600">
                    <Droplets size={24} />
                  </div>
                  <div className="font-display text-xl font-bold text-earth-900">{product.nutrition.fat}</div>
                  <div className="text-sm text-earth-600">{detailUi.fatLabel || "Fat"}</div>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
                    <Wheat size={24} />
                  </div>
                  <div className="font-display text-xl font-bold text-earth-900">{product.nutrition.carbs}</div>
                  <div className="text-sm text-earth-600">{detailUi.carbsLabel || "Carbs"}</div>
                </div>
              </div>
            </div>
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
                    className="w-full rounded-xl bg-earth-50 px-4 py-3 text-earth-900 outline-none focus:ring-2 focus:ring-earth-500 border border-earth-100"
                  />
                  <input
                    type="email"
                    required
                    placeholder={detailUi.emailPlaceholder || "Work Email"}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl bg-earth-50 px-4 py-3 text-earth-900 outline-none focus:ring-2 focus:ring-earth-500 border border-earth-100"
                  />
                </div>
                <Select
                  value={selectedVolume}
                  onChange={(val) => setSelectedVolume(val)}
                  placeholder={detailUi.volumePlaceholder || "Select Volume..."}
                  options={inquiryOptions.map((option) => ({ value: option, label: option }))}
                />
                <Button type="submit" className="mt-2 w-full h-12" disabled={isSubmitting}>
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
