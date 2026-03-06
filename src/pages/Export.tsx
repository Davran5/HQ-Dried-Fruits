import { motion } from "motion/react";
import { MapPin, Package, Ship, Plane, ShieldCheck, FileText, CheckCircle2 } from "lucide-react";
import { PageLayout } from "@/src/components/layout/PageLayout";
import { BentoCard } from "@/src/components/ui/BentoCard";
import { useSEO } from "@/src/hooks/useSEO";

export function Export() {
  useSEO({
    title: "Global Logistics & Export | UzbekSun",
    description: "Seamless global logistics from the heart of the Silk Road to your warehouse. We handle customs, packaging, and freight forwarding.",
    ogTitle: "UzbekSun Logistics"
  });

  return (
    <PageLayout>
      {/* Global Supply Map Hero */}
      <section className="relative overflow-hidden bg-earth-900 pt-32 pb-48 text-white">
        <div className="absolute inset-0 opacity-20">
          {/* Mock Vector Map using an SVG pattern */}
          <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dotGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1" fill="currentColor" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dotGrid)" />
            {/* Glowing Route Lines (Mock) */}
            <path d="M 500 300 Q 600 150 800 200" fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="5,5" className="animate-[dash_20s_linear_infinite]" />
            <path d="M 500 300 Q 400 400 200 350" fill="none" stroke="#10b981" strokeWidth="2" strokeDasharray="5,5" className="animate-[dash_20s_linear_infinite]" />
          </svg>
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 font-display text-5xl font-bold sm:text-7xl"
          >
            Seamless Global <span className="text-earth-500">Logistics</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mx-auto max-w-2xl text-xl text-earth-200"
          >
            From the heart of the Silk Road to your warehouse. We handle the complexities of international trade so you don't have to.
          </motion.p>
        </div>
      </section>

      {/* Operational Standards Bento */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-32 relative z-20">
        <div className="grid gap-6 md:grid-cols-3">
          <BentoCard className="flex flex-col items-start bg-white">
            <div className="mb-6 rounded-2xl bg-earth-100 p-4 text-earth-600">
              <Package size={32} />
            </div>
            <h3 className="mb-3 font-display text-2xl font-bold text-earth-900">Custom Packaging</h3>
            <p className="text-earth-700">
              Bulk cartons (5kg, 10kg), vacuum-sealed bags, or retail-ready packaging customized with your brand labels.
            </p>
          </BentoCard>

          <BentoCard delay={0.1} className="flex flex-col items-start bg-white">
            <div className="mb-6 rounded-2xl bg-mint-100 p-4 text-mint-600">
              <Ship size={32} />
            </div>
            <h3 className="mb-3 font-display text-2xl font-bold text-earth-900">Ocean & Rail Freight</h3>
            <p className="text-earth-700">
              Cost-effective FCL (Full Container Load) and LCL shipments via major ports and the new trans-Eurasian rail network.
            </p>
          </BentoCard>

          <BentoCard delay={0.2} className="flex flex-col items-start bg-white">
            <div className="mb-6 rounded-2xl bg-blue-100 p-4 text-blue-600">
              <FileText size={32} />
            </div>
            <h3 className="mb-3 font-display text-2xl font-bold text-earth-900">Customs Clearance</h3>
            <p className="text-earth-700">
              Full documentation support including Phytosanitary certificates, Certificates of Origin, and EUR.1.
            </p>
          </BentoCard>
        </div>
      </section>

      {/* Quality Guarantee & Tech Specs */}
      <section className="mx-auto max-w-7xl px-4 py-32 sm:px-6 lg:px-8">
        <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="mb-6 font-display text-4xl font-bold text-earth-900">
              The Quality Guarantee
            </h2>
            <p className="mb-8 text-xl text-earth-700">
              Our processing facilities utilize advanced laser sorting and X-ray inspection to guarantee 99.9% purity, free from foreign materials and defects.
            </p>
            
            <div className="flex flex-col gap-6">
              {[
                { title: "Moisture Control", desc: "Strictly maintained at 18-22% for optimal shelf life." },
                { title: "Size Calibration", desc: "Laser-graded for uniform sizing (Jumbo, Large, Medium)." },
                { title: "Microbiological Safety", desc: "Regular lab testing for aflatoxins and heavy metals." }
              ].map((spec, i) => (
                <div key={i} className="flex items-start gap-4 border-l-2 border-earth-200 pl-6 transition-colors hover:border-earth-500">
                  <ShieldCheck className="mt-1 shrink-0 text-earth-500" size={24} />
                  <div>
                    <h4 className="font-bold text-earth-900">{spec.title}</h4>
                    <p className="text-earth-600">{spec.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative h-[500px] overflow-hidden rounded-[3rem]">
            <img
              src="https://images.unsplash.com/photo-1596591606975-97ee5cef3a1e?q=80&w=1000&auto=format&fit=crop"
              alt="Quality Control"
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-earth-900/80 to-transparent p-10 flex flex-col justify-end">
              <div className="inline-flex items-center gap-2 rounded-full bg-mint-500/20 px-4 py-2 text-sm font-bold text-mint-100 backdrop-blur-md w-max mb-4">
                <CheckCircle2 size={16} /> ISO 22000 Certified Facility
              </div>
              <p className="text-white text-lg">Every batch is fully traceable from the orchard to your warehouse.</p>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
