import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { PageLayout } from "@/src/components/layout/PageLayout";
import { Marquee } from "@/src/components/ui/Marquee";
import { Award, ShieldCheck, CheckCircle2 } from "lucide-react";
import { useSEO } from "@/src/hooks/useSEO";

export function About() {
  useSEO({
    title: "About UzbekSun | Our Heritage & Mission",
    description: "Decades of expertise in every harvest. Learn about our mission to deliver the uncompromised, natural sweetness of Uzbekistan's harvest to the world.",
    ogTitle: "About UzbekSun"
  });

  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
  });

  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-75%"]);

  return (
    <PageLayout>
      {/* Marquee Hero */}
      <section className="relative overflow-hidden pt-20 pb-32">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 font-display text-5xl font-bold tracking-tight text-earth-900 sm:text-7xl lg:text-8xl"
          >
            Rooted in <span className="text-earth-500 italic">Tradition</span>.
          </motion.h1>
        </div>
        
        <Marquee speed={40} className="mt-12">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-64 w-[400px] overflow-hidden rounded-[2rem] sm:h-80 sm:w-[500px]">
              <img
                src={`https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?q=80&w=800&auto=format&fit=crop&sig=${i}`}
                alt="Orchard view"
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          ))}
        </Marquee>
      </section>

      {/* Horizontal Scrolling Timeline */}
      <section ref={targetRef} className="relative h-[300vh] bg-earth-900 text-earth-50">
        <div className="sticky top-0 flex h-screen items-center overflow-hidden">
          <div className="absolute top-24 left-8 z-10">
            <h2 className="font-display text-4xl font-bold text-white sm:text-5xl">Our Heritage</h2>
            <p className="mt-2 text-earth-300">A journey of growth and quality.</p>
          </div>
          
          <motion.div style={{ x }} className="flex gap-16 px-[10vw] pt-32">
            {[
              { year: "1994", title: "The First Harvest", desc: "Started as a small family orchard in the Fergana Valley, focusing on local markets." },
              { year: "2005", title: "Scaling Operations", desc: "Introduced modern sun-drying techniques and built our first dedicated processing facility." },
              { year: "2012", title: "Going Global", desc: "Achieved international organic certifications and began exporting to Europe and Asia." },
              { year: "2023", title: "Modern Logistics", desc: "Opened a state-of-the-art logistics hub in Tashkent, ensuring year-round supply for B2B partners." }
            ].map((item, i) => (
              <div key={i} className="flex w-[400px] shrink-0 flex-col justify-center">
                <div className="mb-6 text-6xl font-black text-earth-700/50">{item.year}</div>
                <div className="h-1 w-full bg-earth-800 mb-8 relative">
                  <div className="absolute top-1/2 left-0 h-4 w-4 -translate-y-1/2 rounded-full bg-earth-500" />
                </div>
                <h3 className="mb-4 font-display text-3xl font-bold text-white">{item.title}</h3>
                <p className="text-lg text-earth-200 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Partner/Trust Marquee */}
      <section className="bg-white py-24 border-b border-earth-100">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8 mb-12">
          <p className="text-sm font-bold uppercase tracking-widest text-earth-400">Certified Quality & Trusted Partners</p>
        </div>
        <Marquee speed={30} direction="right" className="opacity-60">
          <div className="flex items-center gap-16 px-8">
            <div className="flex items-center gap-3 font-display text-2xl font-bold text-earth-800"><ShieldCheck className="h-8 w-8 text-earth-500"/> HACCP Certified</div>
            <div className="flex items-center gap-3 font-display text-2xl font-bold text-earth-800"><Award className="h-8 w-8 text-earth-500"/> ISO 9001:2015</div>
            <div className="flex items-center gap-3 font-display text-2xl font-bold text-earth-800"><CheckCircle2 className="h-8 w-8 text-earth-500"/> 100% Organic</div>
            <div className="flex items-center gap-3 font-display text-2xl font-bold text-earth-800">GlobalGap</div>
            <div className="flex items-center gap-3 font-display text-2xl font-bold text-earth-800">FDA Registered</div>
          </div>
        </Marquee>
      </section>

      {/* Split-Screen Mission & Logistics */}
      <section className="mx-auto max-w-7xl px-4 py-32 sm:px-6 lg:px-8">
        <div className="grid gap-16 lg:grid-cols-2">
          {/* Sticky Image */}
          <div className="relative h-[60vh] lg:sticky lg:top-32 lg:h-[80vh]">
            <div className="h-full w-full overflow-hidden rounded-[3rem]">
              <img
                src="https://images.unsplash.com/photo-1596591606975-97ee5cef3a1e?q=80&w=1000&auto=format&fit=crop"
                alt="Sorting facility"
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-10 -right-10 h-64 w-64 rounded-full bg-mint-100 -z-10 blur-3xl" />
          </div>

          {/* Scrolling Text */}
          <div className="flex flex-col justify-center py-12">
            <div className="mb-24">
              <h2 className="mb-6 font-display text-4xl font-bold text-earth-900">Our Mission</h2>
              <p className="text-xl leading-relaxed text-earth-700">
                To deliver the uncompromised, natural sweetness of Uzbekistan's harvest to the world, while empowering local farmers and maintaining the highest standards of ecological sustainability.
              </p>
            </div>

            <div className="mb-24">
              <h2 className="mb-6 font-display text-4xl font-bold text-earth-900">Uncompromising Quality</h2>
              <p className="text-xl leading-relaxed text-earth-700">
                Every piece of fruit is hand-selected, naturally sun-dried, and rigorously sorted in our modern facilities. We utilize laser sorting technology alongside traditional methods to ensure zero defects.
              </p>
            </div>

            <div>
              <h2 className="mb-6 font-display text-4xl font-bold text-earth-900">Global Logistics</h2>
              <p className="text-xl leading-relaxed text-earth-700">
                We understand that B2B partners require reliability. Our dedicated logistics team manages everything from custom packaging (bulk cartons to retail-ready) to freight forwarding, ensuring your supply chain never breaks.
              </p>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
