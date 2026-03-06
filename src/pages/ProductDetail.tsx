import { motion } from "motion/react";
import { CheckCircle2, Flame, Droplets, Dumbbell, Wheat, ArrowRight } from "lucide-react";
import { PageLayout } from "@/src/components/layout/PageLayout";
import { Button } from "@/src/components/ui/Button";
import { useSEO } from "@/src/hooks/useSEO";

export function ProductDetail() {
  useSEO({
    title: "Golden Sun-Dried Apricots | UzbekSun",
    description: "Premium sun-dried apricots from the Fergana Valley. Naturally sweet, vibrant color, rich in potassium.",
    ogTitle: "Golden Sun-Dried Apricots"
  });

  return (
    <PageLayout>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-16 lg:grid-cols-2">
          
          {/* Sticky Image Gallery */}
          <div className="relative flex flex-col gap-6 lg:sticky lg:top-32 lg:h-[calc(100vh-10rem)]">
            <div className="flex-1 overflow-hidden rounded-[3rem] bg-amber-50 relative group">
              <motion.img
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                src="https://images.unsplash.com/photo-1596422846543-75c6fc197f07?q=80&w=1000&auto=format&fit=crop"
                alt="Sun-Dried Apricots"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
            </div>
            {/* Thumbnails */}
            <div className="flex gap-4 h-24 shrink-0">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-full w-24 overflow-hidden rounded-2xl border-2 border-transparent hover:border-earth-500 cursor-pointer transition-colors">
                  <img
                    src={`https://images.unsplash.com/photo-1596422846543-75c6fc197f07?q=80&w=200&auto=format&fit=crop&sig=${i}`}
                    alt="Thumbnail"
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Detail Column */}
          <div className="flex flex-col py-8">
            <div className="mb-4 text-sm font-bold uppercase tracking-wider text-earth-500">
              Jumbo / Industrial Grade
            </div>
            <h1 className="mb-6 font-display text-4xl font-bold text-earth-900 sm:text-5xl">
              Golden Sun-Dried Apricots
            </h1>
            <p className="mb-10 text-xl leading-relaxed text-earth-700">
              Our signature product. Grown in the mineral-rich soils of the Fergana Valley, these apricots are naturally sun-dried to preserve their vibrant color, intense sweetness, and soft texture. Perfect for premium snacking brands or industrial baking.
            </p>

            {/* Benefits */}
            <div className="mb-12 grid gap-4 sm:grid-cols-2">
              {[
                "100% Natural & Organic",
                "No Added Sugars",
                "High in Potassium",
                "Laser Sorted Purity",
                "Moisture: 18-22%",
                "Shelf Life: 12 Months"
              ].map((benefit, i) => (
                <div key={i} className="flex items-center gap-3 text-earth-800 font-medium">
                  <CheckCircle2 className="text-mint-500 h-5 w-5" /> {benefit}
                </div>
              ))}
            </div>

            {/* Visual Nutrition Facts */}
            <div className="mb-16 rounded-[2rem] bg-earth-50 p-8">
              <h3 className="mb-6 font-display text-2xl font-bold text-earth-900">Nutritional Profile <span className="text-sm font-normal text-earth-500">(per 100g)</span></h3>
              <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
                <div className="flex flex-col items-center text-center">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                    <Flame size={24} />
                  </div>
                  <div className="font-display text-xl font-bold text-earth-900">241</div>
                  <div className="text-sm text-earth-600">Calories</div>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                    <Dumbbell size={24} />
                  </div>
                  <div className="font-display text-xl font-bold text-earth-900">3.4g</div>
                  <div className="text-sm text-earth-600">Protein</div>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 text-yellow-600">
                    <Droplets size={24} />
                  </div>
                  <div className="font-display text-xl font-bold text-earth-900">0.5g</div>
                  <div className="text-sm text-earth-600">Fat</div>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
                    <Wheat size={24} />
                  </div>
                  <div className="font-display text-xl font-bold text-earth-900">63g</div>
                  <div className="text-sm text-earth-600">Carbs</div>
                </div>
              </div>
            </div>

            {/* Direct Inquiry Form */}
            <div className="rounded-[2rem] border border-earth-200 bg-white p-8 shadow-sm">
              <h3 className="mb-6 font-display text-2xl font-bold text-earth-900">Request a Sample or Quote</h3>
              <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <input
                    type="text"
                    placeholder="Company Name"
                    className="w-full rounded-xl bg-earth-50 px-4 py-3 text-earth-900 outline-none focus:ring-2 focus:ring-earth-500 border border-earth-100"
                  />
                  <input
                    type="email"
                    placeholder="Work Email"
                    className="w-full rounded-xl bg-earth-50 px-4 py-3 text-earth-900 outline-none focus:ring-2 focus:ring-earth-500 border border-earth-100"
                  />
                </div>
                <select className="w-full rounded-xl bg-earth-50 px-4 py-3 text-earth-900 outline-none focus:ring-2 focus:ring-earth-500 border border-earth-100">
                  <option value="">Select Volume...</option>
                  <option value="sample">Request Sample Box</option>
                  <option value="1-5t">1 - 5 Tons</option>
                  <option value="fcl">Full Container Load (FCL)</option>
                </select>
                <Button type="submit" className="mt-2 w-full h-12">
                  Send Inquiry <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
