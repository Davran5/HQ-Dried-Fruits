import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { ArrowRight, Globe2, ShieldCheck, Truck } from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { BentoCard } from "@/src/components/ui/BentoCard";
import { PageLayout } from "@/src/components/layout/PageLayout";
import { useSEO } from "@/src/hooks/useSEO";

export function Home() {
  useSEO({
    title: "UzbekSun Dried Fruits | Premium Organic Export",
    description: "Premium sun-dried fruits from the heart of Uzbekistan. We export the finest apricots, raisins, and prunes to global B2B partners.",
    ogTitle: "UzbekSun Dried Fruits"
  });

  return (
    <PageLayout>
      {/* Hero Section */}
      <section className="relative h-[90vh] min-h-[600px] w-full overflow-hidden rounded-b-[4rem] sm:rounded-b-[6rem]">
        {/* Cinematic Zoom Background */}
        <motion.div
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 10, ease: "easeOut" }}
          className="absolute inset-0 z-0"
        >
          <img
            src="https://images.unsplash.com/photo-1596422846543-75c6fc197f07?q=80&w=2000&auto=format&fit=crop"
            alt="Sun-dried apricots"
            className="h-full w-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-earth-900/80 via-earth-900/40 to-transparent" />
        </motion.div>

        {/* Hero Content */}
        <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-end px-4 pb-24 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-3xl"
          >
            <h1 className="mb-6 font-display text-5xl font-bold leading-tight text-white sm:text-6xl md:text-7xl">
              Nature's Sweetness, <br />
              <span className="text-earth-300">Sun-Dried</span> to Perfection.
            </h1>
            <p className="mb-8 max-w-xl text-lg text-earth-100 sm:text-xl">
              Premium quality dried fruits from the heart of Uzbekistan. We export the finest apricots, raisins, and prunes to global B2B partners.
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

      {/* Introduction Bento Grid */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="font-display text-3xl font-bold text-earth-900 sm:text-4xl">
            A Heritage of Quality
          </h2>
          <p className="mt-4 text-earth-700">Decades of expertise in every harvest.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
          {/* Large Card */}
          <BentoCard className="md:col-span-2 lg:col-span-2 lg:row-span-2 p-0 overflow-hidden relative group">
            <img
              src="https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?q=80&w=1000&auto=format&fit=crop"
              alt="Orchards in Uzbekistan"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-earth-900/90 via-earth-900/20 to-transparent p-8 flex flex-col justify-end">
              <h3 className="font-display text-2xl font-bold text-white mb-2">The Uzbek Advantage</h3>
              <p className="text-earth-100">Our unique climate and mineral-rich soil produce fruits with unparalleled natural sweetness and vibrant color, requiring zero artificial additives.</p>
            </div>
          </BentoCard>

          {/* Stat Cards */}
          <BentoCard delay={0.1} className="bg-mint-50 border-mint-100 flex flex-col justify-center items-center text-center">
            <Globe2 className="h-10 w-10 text-mint-600 mb-4" />
            <h4 className="font-display text-4xl font-bold text-mint-900 mb-2">45+</h4>
            <p className="text-mint-700 font-medium">Countries Exported To</p>
          </BentoCard>

          <BentoCard delay={0.2} className="bg-earth-50 border-earth-100 flex flex-col justify-center items-center text-center">
            <ShieldCheck className="h-10 w-10 text-earth-600 mb-4" />
            <h4 className="font-display text-4xl font-bold text-earth-900 mb-2">100%</h4>
            <p className="text-earth-700 font-medium">Certified Organic</p>
          </BentoCard>

          <BentoCard delay={0.3} className="md:col-span-2 lg:col-span-2 bg-earth-800 text-white flex flex-col justify-center">
            <Truck className="h-8 w-8 text-earth-300 mb-4" />
            <h4 className="font-display text-2xl font-bold mb-2">Seamless Global Logistics</h4>
            <p className="text-earth-200">From our sun-drenched drying fields directly to your warehouse. We handle all customs, packaging, and freight forwarding.</p>
          </BentoCard>
        </div>
      </section>

      {/* Product Preview */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div>
              <h2 className="font-display text-3xl font-bold text-earth-900 sm:text-4xl">
                Premium Selection
              </h2>
              <p className="mt-4 text-earth-700">Hand-picked and naturally sun-dried.</p>
            </div>
            <Link to="/products">
              <Button variant="outline">View Full Catalog</Button>
            </Link>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                name: "Golden Apricots",
                desc: "Jumbo size, naturally sweet, vibrant color.",
                img: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?q=80&w=600&auto=format&fit=crop",
                color: "bg-amber-50"
              },
              {
                name: "Black Raisins",
                desc: "Shadow-dried, rich in iron and antioxidants.",
                img: "https://images.unsplash.com/photo-1596591606975-97ee5cef3a1e?q=80&w=600&auto=format&fit=crop",
                color: "bg-purple-50"
              },
              {
                name: "Pitted Prunes",
                desc: "Soft, fleshy, and perfectly moisture-balanced.",
                img: "https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?q=80&w=600&auto=format&fit=crop",
                color: "bg-stone-50"
              }
            ].map((product, i) => (
              <motion.div
                key={product.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -10 }}
                className={`group relative overflow-hidden rounded-[3rem] p-6 transition-all hover:shadow-2xl ${product.color}`}
              >
                <div className="relative mb-6 h-64 overflow-hidden rounded-[2rem]">
                  <img
                    src={product.img}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <h3 className="font-display text-2xl font-bold text-earth-900">{product.name}</h3>
                <p className="mt-2 text-earth-700">{product.desc}</p>
                <div className="mt-6 flex items-center text-earth-600 font-medium opacity-0 transform translate-y-4 transition-all group-hover:opacity-100 group-hover:translate-y-0">
                  Request Sample <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Supply Reach (Fluid Background) */}
      <section className="relative overflow-hidden bg-mint-900 py-32 text-center text-white">
        {/* Abstract fluid shapes */}
        <div className="absolute -top-[20%] -left-[10%] h-[500px] w-[500px] rounded-full bg-mint-800/50 blur-3xl" />
        <div className="absolute -bottom-[20%] -right-[10%] h-[600px] w-[600px] rounded-full bg-mint-700/30 blur-3xl" />
        
        <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-8 font-display text-4xl font-bold leading-tight sm:text-5xl">
            From the heart of Central Asia to your warehouse shelves.
          </h2>
          <p className="mb-10 text-xl text-mint-100">
            We bridge the gap between traditional farming and modern global supply chains, ensuring consistent quality, volume, and timely delivery for our B2B partners.
          </p>
          <Link to="/export">
            <Button className="bg-white text-mint-900 hover:bg-mint-50">
              Learn About Our Logistics
            </Button>
          </Link>
        </div>
      </section>

      {/* Final CTA Banner */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-earth-500 to-earth-700 p-10 sm:p-16">
          <div className="absolute top-0 right-0 -mt-20 -mr-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
          
          <div className="relative z-10 grid items-center gap-12 lg:grid-cols-2">
            <div>
              <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
                Ready to elevate your product line?
              </h2>
              <p className="mt-4 text-lg text-earth-100">
                Get our latest wholesale pricing and a free sample box delivered to your office.
              </p>
            </div>
            
            <div className="rounded-3xl bg-white p-8 shadow-xl">
              <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
                <input
                  type="email"
                  placeholder="Enter your work email"
                  className="w-full rounded-xl bg-earth-50 px-4 py-4 text-earth-900 placeholder-earth-400 outline-none focus:ring-2 focus:ring-earth-500 transition-all border border-earth-100"
                />
                <Button className="w-full h-14 text-lg">
                  Get Pricing & Samples
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
