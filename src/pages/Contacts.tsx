import React, { useState } from "react";
import { motion } from "motion/react";
import { Mail, Phone, MapPin, Clock, CheckCircle2 } from "lucide-react";
import { PageLayout } from "@/src/components/layout/PageLayout";
import { BentoCard } from "@/src/components/ui/BentoCard";
import { Button } from "@/src/components/ui/Button";
import { useSEO } from "@/src/hooks/useSEO";

export function Contacts() {
  useSEO({
    title: "Contact UzbekSun | Wholesale Inquiries",
    description: "Get our latest wholesale pricing, request a sample box, or discuss logistics with our export team.",
    ogTitle: "Contact UzbekSun"
  });

  const [email, setEmail] = useState("");
  const [isValid, setIsValid] = useState<boolean | null>(null);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEmail(val);
    if (val.length > 0) {
      setIsValid(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val));
    } else {
      setIsValid(null);
    }
  };

  return (
    <PageLayout>
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 font-display text-5xl font-bold text-earth-900 sm:text-6xl"
          >
            Let's Talk <span className="text-earth-500">Business</span>.
          </motion.h1>
          <p className="mx-auto max-w-2xl text-xl text-earth-700">
            Whether you need a custom quote, a sample box, or logistics details, our export team is ready to assist you.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-12">
          {/* Communication Hub (Form) */}
          <div className="lg:col-span-7">
            <div className="h-full rounded-[3rem] bg-white p-8 shadow-xl border border-earth-100 sm:p-12">
              <h2 className="mb-8 font-display text-3xl font-bold text-earth-900">Send an Inquiry</h2>
              <form className="flex flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-earth-700">Full Name</label>
                    <input
                      type="text"
                      className="w-full rounded-xl bg-earth-50 px-4 py-3 text-earth-900 outline-none focus:ring-2 focus:ring-earth-500 border border-earth-200 transition-all"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-earth-700">Company</label>
                    <input
                      type="text"
                      className="w-full rounded-xl bg-earth-50 px-4 py-3 text-earth-900 outline-none focus:ring-2 focus:ring-earth-500 border border-earth-200 transition-all"
                    />
                  </div>
                </div>
                
                <div className="relative">
                  <label className="mb-2 block text-sm font-medium text-earth-700">Work Email</label>
                  <div className="relative flex items-center">
                    <input
                      type="email"
                      value={email}
                      onChange={handleEmailChange}
                      className={`w-full rounded-xl bg-earth-50 px-4 py-3 text-earth-900 outline-none focus:ring-2 transition-all border ${
                        isValid === true ? "border-mint-500 focus:ring-mint-500" : 
                        isValid === false ? "border-red-400 focus:ring-red-400" : 
                        "border-earth-200 focus:ring-earth-500"
                      }`}
                    />
                    {isValid && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute right-4 text-mint-500">
                        <CheckCircle2 size={20} />
                      </motion.div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-earth-700">Message</label>
                  <textarea
                    rows={4}
                    className="w-full rounded-xl bg-earth-50 px-4 py-3 text-earth-900 outline-none focus:ring-2 focus:ring-earth-500 border border-earth-200 transition-all resize-none"
                  ></textarea>
                </div>

                <Button type="submit" className="mt-4 h-14 text-lg">
                  Send Message
                </Button>
              </form>
            </div>
          </div>

          {/* Info Blocks (2x2 Bento) */}
          <div className="grid gap-6 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-2">
            <BentoCard className="flex flex-col items-center justify-center text-center p-6 bg-mint-50 border-mint-100">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-mint-500 text-white">
                <Mail size={24} />
              </div>
              <h3 className="mb-1 font-display text-lg font-bold text-mint-900">Email</h3>
              <p className="text-mint-700">export@uzbeksun.com</p>
            </BentoCard>

            <BentoCard className="flex flex-col items-center justify-center text-center p-6 bg-blue-50 border-blue-100">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-500 text-white">
                <Phone size={24} />
              </div>
              <h3 className="mb-1 font-display text-lg font-bold text-blue-900">Phone</h3>
              <p className="text-blue-700">+998 90 123 45 67</p>
            </BentoCard>

            <BentoCard className="flex flex-col items-center justify-center text-center p-6 bg-amber-50 border-amber-100 sm:col-span-2">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-500 text-white">
                <MapPin size={24} />
              </div>
              <h3 className="mb-1 font-display text-lg font-bold text-amber-900">Headquarters</h3>
              <p className="text-amber-800">123 Silk Road Ave, Tashkent, Uzbekistan</p>
            </BentoCard>

            <BentoCard className="flex flex-col items-center justify-center text-center p-6 bg-earth-800 text-white sm:col-span-2">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-earth-700 text-earth-300">
                <Clock size={24} />
              </div>
              <h3 className="mb-1 font-display text-lg font-bold">Working Hours</h3>
              <p className="text-earth-300">Mon - Fri: 9:00 AM - 6:00 PM (GMT+5)</p>
            </BentoCard>
          </div>
        </div>
      </div>

      {/* Full-width Map */}
      <section className="h-[500px] w-full bg-earth-200 relative overflow-hidden">
        {/* We use a styled iframe for the map to fit the warm palette, or a placeholder if actual maps are restricted. 
            Here we use a highly stylized placeholder that looks like a custom map to avoid generic iframes. */}
        <div className="absolute inset-0 bg-[#e5e3df]">
          <img 
            src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2000&auto=format&fit=crop" 
            alt="Map view" 
            className="h-full w-full object-cover opacity-40 mix-blend-luminosity"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-earth-500/20 mix-blend-multiply" />
        </div>
        
        {/* Map Pin */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-earth-600 text-white shadow-2xl">
            <div className="absolute inset-0 rounded-full bg-earth-600 animate-ping opacity-50" />
            <MapPin size={32} />
          </div>
          <div className="mt-4 rounded-xl bg-white px-6 py-3 shadow-xl font-bold text-earth-900">
            UzbekSun HQ
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
