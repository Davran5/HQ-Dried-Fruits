import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, CheckCircle2, Phone, Mail, Send } from "lucide-react";
import { PageLayout } from "@/src/components/layout/PageLayout";
import { Button } from "@/src/components/ui/Button";
import { useSEO } from "@/src/hooks/useSEO";

const products = [
  {
    id: "apricots",
    name: "Sun-Dried Apricots",
    type: "Jumbo / Industrial",
    desc: "Naturally sweet, vibrant color, rich in potassium. Perfect for snacking or industrial baking.",
    img: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?q=80&w=800&auto=format&fit=crop",
    color: "bg-amber-50",
  },
  {
    id: "raisins",
    name: "Black Raisins",
    type: "Shadow-Dried",
    desc: "Intense flavor, high antioxidant content. Carefully shadow-dried to preserve nutrients.",
    img: "https://images.unsplash.com/photo-1596591606975-97ee5cef3a1e?q=80&w=800&auto=format&fit=crop",
    color: "bg-purple-50",
  },
  {
    id: "prunes",
    name: "Pitted Prunes",
    type: "Moisture Balanced",
    desc: "Soft, fleshy texture. Processed with precise moisture control for extended shelf life.",
    img: "https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?q=80&w=800&auto=format&fit=crop",
    color: "bg-stone-50",
  },
];

export function Products() {
  useSEO({
    title: "Wholesale Dried Fruits Catalog | UzbekSun",
    description: "Explore our premium selection of hand-picked and naturally sun-dried apricots, raisins, and prunes.",
    ogTitle: "UzbekSun Products"
  });

  const [formStep, setFormStep] = useState(1);
  const [formData, setFormData] = useState({ product: "", volume: "", contact: "" });

  const nextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (formStep < 3) setFormStep(formStep + 1);
  };

  return (
    <PageLayout>
      {/* Header */}
      <section className="bg-earth-50 pt-20 pb-32 text-center">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h1 className="mb-6 font-display text-5xl font-bold text-earth-900 sm:text-6xl">
            Our Harvest
          </h1>
          <p className="text-xl text-earth-700">
            100% natural, sun-dried fruits processed to global export standards.
          </p>
        </div>
      </section>

      {/* Catalog Grid */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 -mt-24">
        <div className="grid gap-8 md:grid-cols-3">
          {products.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 + 0.2 }}
              className={`group relative overflow-hidden rounded-[3rem] p-8 shadow-lg transition-all hover:shadow-2xl ${product.color}`}
            >
              <div className="relative mb-8 h-72 w-full overflow-hidden rounded-[2rem]">
                <img
                  src={product.img}
                  alt={product.name}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="mb-2 text-sm font-bold uppercase tracking-wider text-earth-500">
                {product.type}
              </div>
              <h3 className="mb-4 font-display text-3xl font-bold text-earth-900">
                {product.name}
              </h3>
              <p className="mb-8 text-earth-700 leading-relaxed">{product.desc}</p>
              <Link to={`/products/${product.id}`}>
                <Button variant="outline" className="w-full bg-white/50 backdrop-blur-sm">
                  View Specifications
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Ordering Hub (Progressive Form) & Quick Contacts */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="grid gap-16 lg:grid-cols-2">
          {/* Progressive Form */}
          <div className="rounded-[3rem] bg-white p-10 shadow-xl border border-earth-100 sm:p-16">
            <h2 className="mb-2 font-display text-3xl font-bold text-earth-900">
              Wholesale Inquiry
            </h2>
            <p className="mb-10 text-earth-600">
              Let's build your order. Step {formStep} of 3.
            </p>

            <div className="relative min-h-[250px]">
              <AnimatePresence mode="wait">
                {formStep === 1 && (
                  <motion.form
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    onSubmit={nextStep}
                    className="flex flex-col gap-6"
                  >
                    <label className="text-lg font-medium text-earth-800">
                      Which product are you interested in?
                    </label>
                    <select
                      required
                      className="w-full rounded-xl bg-earth-50 p-4 text-earth-900 outline-none focus:ring-2 focus:ring-earth-500 border border-earth-200"
                      value={formData.product}
                      onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                    >
                      <option value="" disabled>Select a product...</option>
                      <option value="apricots">Sun-Dried Apricots</option>
                      <option value="raisins">Black Raisins</option>
                      <option value="prunes">Pitted Prunes</option>
                      <option value="mixed">Mixed Container</option>
                    </select>
                    <Button type="submit" className="mt-4 self-start">
                      Next Step <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </motion.form>
                )}

                {formStep === 2 && (
                  <motion.form
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    onSubmit={nextStep}
                    className="flex flex-col gap-6"
                  >
                    <label className="text-lg font-medium text-earth-800">
                      Estimated Monthly Volume?
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      {["1-5 Tons", "5-20 Tons", "1 FCL (20ft)", "Multiple FCLs"].map((vol) => (
                        <button
                          key={vol}
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, volume: vol });
                            setFormStep(3);
                          }}
                          className={`rounded-xl border p-4 text-center transition-all ${
                            formData.volume === vol
                              ? "border-earth-500 bg-earth-50 text-earth-900"
                              : "border-earth-200 hover:border-earth-400"
                          }`}
                        >
                          {vol}
                        </button>
                      ))}
                    </div>
                  </motion.form>
                )}

                {formStep === 3 && (
                  <motion.form
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    onSubmit={(e) => { e.preventDefault(); alert("Mock submission successful!"); }}
                    className="flex flex-col gap-6"
                  >
                    <label className="text-lg font-medium text-earth-800">
                      Where should we send the quote?
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="Work Email Address"
                      className="w-full rounded-xl bg-earth-50 p-4 text-earth-900 outline-none focus:ring-2 focus:ring-earth-500 border border-earth-200"
                      value={formData.contact}
                      onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                    />
                    <div className="flex gap-4 mt-4">
                      <Button type="button" variant="ghost" onClick={() => setFormStep(2)}>
                        Back
                      </Button>
                      <Button type="submit" className="flex-1">
                        Get Instant Quote
                      </Button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Quick Contacts */}
          <div className="flex flex-col justify-center gap-8">
            <div>
              <h2 className="mb-4 font-display text-4xl font-bold text-earth-900">
                Need it faster?
              </h2>
              <p className="text-xl text-earth-700">
                Skip the form. Connect with our export sales team directly for immediate assistance.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <a href="#telegram-bot-integration" className="group flex items-center gap-6 rounded-2xl bg-mint-50 p-6 transition-all hover:bg-mint-100 hover:shadow-md">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-mint-500 text-white transition-transform group-hover:scale-110 group-hover:animate-pulse">
                  <Send size={24} />
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold text-mint-900">Telegram Bot</h3>
                  <p className="text-mint-700">Instant quotes & catalog PDF</p>
                </div>
              </a>

              <a href="tel:+998901234567" className="group flex items-center gap-6 rounded-2xl bg-earth-50 p-6 transition-all hover:bg-earth-100 hover:shadow-md">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-earth-500 text-white transition-transform group-hover:scale-110">
                  <Phone size={24} />
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold text-earth-900">Call Sales</h3>
                  <p className="text-earth-700">+998 90 123 45 67</p>
                </div>
              </a>

              <a href="mailto:export@uzbeksun.com" className="group flex items-center gap-6 rounded-2xl bg-blue-50 p-6 transition-all hover:bg-blue-100 hover:shadow-md">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-500 text-white transition-transform group-hover:scale-110">
                  <Mail size={24} />
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold text-blue-900">Email Us</h3>
                  <p className="text-blue-700">export@uzbeksun.com</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
