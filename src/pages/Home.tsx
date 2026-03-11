import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { ArrowRight, Globe2, ShieldCheck, Truck } from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { BentoCard } from "@/src/components/ui/BentoCard";
import { PageLayout } from "@/src/components/layout/PageLayout";
import { useSEO } from "@/src/hooks/useSEO";
import { usePages } from "@/src/contexts/PageContext";
import { HomeContent } from "@/src/types/page";

export function Home() {
  useSEO({
    title: "HQ Dried Fruits | High-Quality Organic Export",
    description: "High-quality sun-dried fruits from the heart of Uzbekistan. We export the finest apricots, raisins, and prunes to global B2B partners.",
    ogTitle: "HQ Dried Fruits"
  });

  const { pages } = usePages();
  const pageData = pages.find(p => p.id === "home");
  const content: HomeContent = pageData?.content;

  return (
    <PageLayout>
      <section className="relative h-[calc(90vh+8rem)] min-h-[760px] w-full overflow-hidden rounded-b-[4rem] md:h-[calc(90vh+4rem)] md:min-h-[664px] sm:rounded-b-[6rem]">
        <motion.div
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 10, ease: "easeOut" }}
          className="absolute inset-0 z-0"
        >
          <img
            src={content?.heroBgImage || "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?q=80&w=2000&auto=format&fit=crop"}
            alt="Sun-dried apricots"
            className="h-full w-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-earth-900/80 via-earth-900/40 to-transparent" />
        </motion.div>
        <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-end px-4 pb-24 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-3xl"
          >
            <h1 className="mb-6 font-display text-5xl font-bold leading-tight text-white sm:text-6xl md:text-7xl">
              {content?.heroTitle || (
                <>
                  Nature's Sweetness, <br />
                  <span className="text-earth-300">Sun-Dried</span> to Perfection.
                </>
              )}
            </h1>
            <p className="mb-8 max-w-xl text-lg text-earth-100 sm:text-xl">
              {content?.heroSubtitle || "Quality dried fruits from the heart of Uzbekistan. We export the finest apricots, raisins, and prunes to global B2B partners."}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/products">
                <Button size="lg" className="bg-earth-500 hover:bg-earth-400 text-earth-900">
                  Request Wholesale Catalog
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/products">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  Explore Products
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="font-display text-3xl font-bold text-earth-900 sm:text-4xl">
            {content?.introLabel || "A Heritage of Quality"}
          </h2>
          <p className="mt-4 text-earth-700">Decades of expertise in every harvest.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
          <BentoCard className="md:col-span-2 lg:col-span-2 lg:row-span-2 p-0 overflow-hidden relative group">
            <img
              src={content?.heroBgImage || "https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?q=80&w=1000&auto=format&fit=crop"}
              alt="Orchards in Uzbekistan"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-earth-900/90 via-earth-900/20 to-transparent p-8 flex flex-col justify-end">
              <h3 className="font-display text-2xl font-bold text-white mb-2">{content?.introLabel || "The HQ Dried Fruits Advantage"}</h3>
              <div
                className="text-earth-100 prosetext"
                dangerouslySetInnerHTML={{ __html: content?.introText || "Our unique climate and mineral-rich soil produce fruits with unparalleled natural sweetness and vibrant color, requiring zero artificial additives." }}
              />
            </div>
          </BentoCard>
          {(content?.statsGrid?.length > 0 ? content.statsGrid : [
            { value: "25+", label: "Years Experience" },
            { value: "10,000", label: "Tons Exported" }
          ]).slice(0, 2).map((stat, i) => (
            <div key={i}>
              <BentoCard delay={i * 0.1} className={i % 2 === 0 ? "bg-mint-50 border-mint-100 flex flex-col justify-center items-center text-center h-full" : "bg-earth-50 border-earth-100 flex flex-col justify-center items-center text-center h-full"}>
                {i % 2 === 0 ? <Globe2 className="h-10 w-10 text-mint-600 mb-4" /> : <ShieldCheck className="h-10 w-10 text-earth-600 mb-4" />}
                <p className="text-4xl font-bold text-earth-800 mb-2">{stat.value}</p>
                <p className={i % 2 === 0 ? "text-mint-700 font-medium" : "text-earth-700 font-medium"}>{stat.label}</p>
              </BentoCard>
            </div>
          ))}

          <BentoCard delay={0.3} className="md:col-span-2 lg:col-span-2 bg-earth-800 text-white flex flex-col justify-center">
            <Truck className="h-8 w-8 text-earth-300 mb-4" />
            <h4 className="font-display text-2xl font-bold mb-2">{content?.supplyReachTitle || "Seamless Global Export"}</h4>
            <div
              className="text-earth-200 prosetext"
              dangerouslySetInnerHTML={{ __html: content?.supplyReachOverview || "From our sun-drenched drying fields directly to your warehouse. We handle all customs, packaging, and freight forwarding." }}
            />
          </BentoCard>
        </div>
      </section>
      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div>
              <h2 className="font-display text-3xl font-bold text-earth-900 sm:text-4xl">
                {content?.productPreviewTitle || "Export Selection"}
              </h2>
              <p className="mt-4 text-earth-700">Hand-picked and naturally sun-dried.</p>
            </div>
            <Link to="/products">
              <Button variant="outline">View Full Catalog</Button>
            </Link>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {(content?.productCategories?.length > 0 ? content.productCategories : [
              { categoryName: "Golden Apricots", shortDescription: "Jumbo size, naturally sweet.", image: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?q=80&w=600", url: "/products" },
              { categoryName: "Black Raisins", shortDescription: "Shadow-dried, rich in iron.", image: "https://images.unsplash.com/photo-1596591606975-97ee5cef3a1e?q=80&w=600", url: "/products" },
              { categoryName: "Pitted Prunes", shortDescription: "Soft and fleshy texture.", image: "https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?q=80&w=600", url: "/products" }
            ]).map((product, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative overflow-hidden rounded-[3rem] bg-earth-50 p-6 transition-all hover:shadow-2xl"
              >
                <div className="relative mb-6 h-64 overflow-hidden rounded-[2rem]">
                  <img
                    src={product.image}
                    alt={product.categoryName}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <h3 className="font-display text-2xl font-bold text-earth-900">{product.categoryName}</h3>
                <p className="mt-2 text-earth-700">{product.shortDescription}</p>
                <Link to={product.url} className="mt-6 flex items-center text-earth-600 font-medium opacity-0 transition-all group-hover:opacity-100">
                  Request Sample <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <section className="relative overflow-hidden py-32 text-center text-white">
        <div className="absolute inset-0 z-0">
          <img
            src={content?.supplyReachBgImage || "https://images.unsplash.com/photo-1596591606975-97ee5cef3a1e?q=80&w=2000"}
            alt="Global logistics"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-mint-900/90 mix-blend-multiply" />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-8 font-display text-4xl font-bold leading-tight sm:text-5xl">
            {content?.supplyReachTitle || "From the heart of Central Asia to your warehouse shelves."}
          </h2>
          <div
            className="text-lg text-mint-100 mb-8 max-w-2xl mx-auto prosetext opacity-90"
            dangerouslySetInnerHTML={{ __html: content?.supplyReachOverview || "We bridge the gap between traditional farming and modern global supply chains, ensuring consistent quality, volume, and timely delivery for our B2B partners." }}
          />
          <Link to="/export">
            <Button className="bg-white text-mint-900 hover:bg-mint-50">
              Learn About Our Export Process
            </Button>
          </Link>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-earth-500 to-earth-700 p-10 sm:p-16">
          <img src={content?.ctaBgImage || ""} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-overlay" />
          <div className="absolute top-0 right-0 -mt-20 -mr-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" />

          <div className="relative z-10 grid items-center gap-12 lg:grid-cols-2">
            <div>
              <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
                {content?.ctaHeading || "Ready to elevate your product line?"}
              </h2>
              <div
                className="mt-4 text-lg text-earth-100 prosetext"
                dangerouslySetInnerHTML={{ __html: content?.ctaSubheading || "Get our latest wholesale pricing and a free sample box delivered to your office." }}
              />
            </div>

            <div className="rounded-3xl bg-white p-8 shadow-xl">
              <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
                <input
                  type="email"
                  placeholder="Enter your work email"
                  className="w-full rounded-xl bg-earth-50 px-4 py-4 text-earth-900 placeholder-earth-400 outline-none focus:ring-2 focus:ring-earth-500 transition-all border border-earth-100"
                />
                <Button className="w-full h-14 text-lg">
                  {content?.ctaButtonText || "Get Pricing & Samples"}
                </Button>
                <p className="text-center text-sm text-earth-500 mt-2">
                  Or message us directly on <a href="#telegram-bot-integration" className="text-earth-600 font-medium hover:underline">Telegram</a>
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
