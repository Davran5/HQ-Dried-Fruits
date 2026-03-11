import React, { useState } from "react";
import { motion } from "motion/react";
import { Mail, Phone, MapPin, Clock, CheckCircle2, Send, Instagram, MessageCircle, Facebook } from "lucide-react";
import { PageLayout } from "@/src/components/layout/PageLayout";
import { Button } from "@/src/components/ui/Button";
import { useSEO } from "@/src/hooks/useSEO";
import { usePages } from "@/src/contexts/PageContext";
import { ContactsContent } from "@/src/types/page";
import { submitLead } from "@/src/lib/leads";

export function Contacts() {
  const { pages, pageSeo, globalSettings } = usePages();
  const seo = pageSeo.contacts;

  useSEO({
    title: seo?.metaTitle || "Contact HQ Dried Fruits | Wholesale Inquiries",
    description: seo?.metaDescription || "Get our latest wholesale pricing, request a sample box, or discuss logistics with our export team.",
    ogTitle: seo?.ogTitle || "Contact HQ Dried Fruits"
  });
  const pageData = pages.find(p => p.id === "contacts");
  const content: ContactsContent = pageData?.content;
  const springEasing = [0.25, 1, 0.5, 1];
  const contactHeroImage =
    content?.headquartersImage ||
    "https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1800&auto=format&fit=crop";

  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const socialLinks = [
    { label: "Telegram", url: content?.telegramUrl, icon: Send },
    { label: "Instagram", url: content?.instagramUrl, icon: Instagram },
    { label: "WhatsApp", url: content?.whatsappUrl, icon: MessageCircle },
    { label: "Facebook", url: content?.facebookUrl, icon: Facebook },
  ];
  const infoCards = [
    {
      label: content?.infoEmailLabel || "Email",
      value: content?.emailAddress || "sales@hqdriedfruits.com",
      href: `mailto:${content?.emailAddress || "sales@hqdriedfruits.com"}`,
      icon: Mail,
    },
    {
      label: content?.infoPhoneLabel || "Phone",
      value: content?.phoneNumber || "+998 90 123 45 67",
      href: `tel:${(content?.phoneNumber || "+998 90 123 45 67").replace(/\s/g, "")}`,
      icon: Phone,
    },
    {
      label: content?.infoAddressLabel || "Headquarters",
      value: content?.officeAddress || "123 Silk Road Ave, Tashkent, Uzbekistan",
      href: content?.googleMapsUrl || "#map",
      icon: MapPin,
    },
    {
      label: content?.infoHoursLabel || "Working Hours",
      value: content?.workingHours || "Mon - Fri: 9:00 AM - 6:00 PM (GMT+5)",
      href: undefined,
      icon: Clock,
    },
  ];

  const normalizeSocialUrl = (label: string, rawUrl?: string) => {
    const value = rawUrl?.trim();

    if (!value) {
      return "#";
    }

    if (/^https?:\/\//i.test(value)) {
      return value;
    }

    if (label === "Telegram") {
      return value.startsWith("@")
        ? `https://t.me/${value.slice(1)}`
        : `https://t.me/${value.replace(/^t\.me\//i, "").replace(/^https?:\/\//i, "")}`;
    }

    if (label === "Instagram") {
      return `https://instagram.com/${value.replace(/^@/, "").replace(/^instagram\.com\//i, "").replace(/^https?:\/\//i, "")}`;
    }

    if (label === "WhatsApp") {
      const phone = value.replace(/[^\d]/g, "");
      return phone ? `https://wa.me/${phone}` : "#";
    }

    if (label === "Facebook") {
      return `https://facebook.com/${value.replace(/^@/, "").replace(/^facebook\.com\//i, "").replace(/^https?:\/\//i, "")}`;
    }

    return `https://${value}`;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEmail(val);
    if (val.length > 0) {
      setIsValid(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val));
    } else {
      setIsValid(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitMessage(null);
    setIsSubmitting(true);

    try {
      await submitLead({
        name,
        company,
        email,
        productInterest: "General Inquiry",
        message,
      });
      setName("");
      setCompany("");
      setEmail("");
      setMessage("");
      setIsValid(null);
      setSubmitMessage("Inquiry received. The export team will contact you shortly.");
    } catch (error) {
      console.error("Failed to submit contact form:", error);
      setSubmitMessage("Submission failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageLayout>
      <section className="relative h-[27rem] overflow-hidden rounded-b-[4rem] md:h-[25rem] sm:rounded-b-[6rem]">
        <motion.div
          initial={{ scale: 1.0 }}
          animate={{ scale: 1.12 }}
          transition={{ duration: 22, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
          className="absolute inset-0 z-0 origin-center"
        >
          <img
            src={contactHeroImage}
            alt={content?.pageTitle || "Contacts hero background"}
            className="h-full w-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-earth-900/84 via-earth-900/52 to-transparent" />
        </motion.div>

        <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-end px-4 pb-10 sm:px-6 sm:pb-12 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 overflow-hidden">
              <motion.h1
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: springEasing }}
                className="font-display text-[3.9rem] font-bold leading-[0.92] text-white sm:text-[7rem] md:text-[8rem]"
              >
                {content?.pageTitle || "Let's Connect"}
              </motion.h1>
            </div>

            <div className="mx-auto max-w-3xl overflow-hidden">
              <motion.p
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.15, ease: springEasing }}
                className="text-base text-earth-100 sm:text-xl"
              >
                {content?.introText || "Whether you need a custom quote, a sample box, or logistics details, our export team is ready to assist you."}
              </motion.p>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-7">
            <div className="h-full rounded-[3rem] bg-white p-8 shadow-xl border border-earth-100 sm:p-12">
              <h2 className="mb-8 font-display text-3xl font-bold text-earth-900">
                {content?.contactFormTitle || "Send an Inquiry"}
              </h2>
              <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-earth-700">
                      {content?.formNameLabel || "Full Name"}
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-xl bg-earth-50 px-4 py-3 text-earth-900 outline-none focus:ring-2 focus:ring-earth-500 border border-earth-200 transition-all"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-earth-700">
                      {content?.formCompanyLabel || "Company"}
                    </label>
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="w-full rounded-xl bg-earth-50 px-4 py-3 text-earth-900 outline-none focus:ring-2 focus:ring-earth-500 border border-earth-200 transition-all"
                    />
                  </div>
                </div>

                <div className="relative">
                  <label className="mb-2 block text-sm font-medium text-earth-700">
                    {content?.formEmailLabel || "Work Email"}
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="email"
                      value={email}
                      onChange={handleEmailChange}
                      className={`w-full rounded-xl bg-earth-50 px-4 py-3 text-earth-900 outline-none focus:ring-2 transition-all border ${isValid === true ? "border-mint-500 focus:ring-mint-500" :
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
                  <label className="mb-2 block text-sm font-medium text-earth-700">
                    {content?.formMessageLabel || "Message"}
                  </label>
                  <textarea
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full rounded-xl bg-earth-50 px-4 py-3 text-earth-900 outline-none focus:ring-2 focus:ring-earth-500 border border-earth-200 transition-all resize-none"
                  ></textarea>
                </div>

                <Button type="submit" className="mt-4 h-14 text-lg" disabled={isSubmitting}>
                  {isSubmitting
                    ? content?.submittingButtonLabel || "Sending..."
                    : content?.submitButtonLabel || "Send Message"}
                </Button>
                {submitMessage && (
                  <p className="text-sm text-earth-600">{submitMessage}</p>
                )}
              </form>
            </div>
          </div>
          <div className="lg:col-span-5">
            <div className="flex flex-col gap-6 p-1">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-earth-400">Direct Contact</p>
                <h2 className="mt-3 font-display text-3xl font-bold text-earth-900">
                  Contact Details
                </h2>
                <p className="mt-3 text-base leading-7 text-earth-700">
                  Reach our sales and export coordination team through the fastest channel for your request.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                {infoCards.map((item) => {
                  const Icon = item.icon;
                  const cardContent = (
                    <>
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-earth-600 shadow-sm">
                        <Icon size={20} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-display text-xl font-bold text-earth-900">{item.label}</h3>
                        <p className="text-sm leading-relaxed text-earth-600">{item.value}</p>
                      </div>
                    </>
                  );

                  if (item.href) {
                    return (
                      <a
                        key={item.label}
                        href={item.href}
                        target={item.label === (content?.infoAddressLabel || "Headquarters") ? "_blank" : undefined}
                        rel={item.label === (content?.infoAddressLabel || "Headquarters") ? "noreferrer" : undefined}
                        className="group flex items-center gap-4 rounded-[1.8rem] bg-transparent px-5 py-4 transition-all hover:bg-white/70 hover:shadow-sm"
                      >
                        {cardContent}
                      </a>
                    );
                  }

                  return (
                    <div
                      key={item.label}
                      className="group flex items-center gap-4 rounded-[1.8rem] bg-transparent px-5 py-4"
                    >
                      {cardContent}
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 pl-[3.75rem]">
                <div className="flex flex-wrap items-center gap-1.5">
                {socialLinks.map((item) => {
                  const Icon = item.icon;
                  const href = normalizeSocialUrl(item.label, item.url);
                  const isActive = href !== "#";

                  return (
                    <a
                      key={item.label}
                      href={href}
                      target={isActive ? "_blank" : undefined}
                      rel={isActive ? "noreferrer" : undefined}
                      aria-label={item.label}
                      aria-disabled={!isActive}
                      className={`group flex h-10 w-10 items-center justify-center rounded-[1.35rem] bg-transparent transition-all ${isActive ? "cursor-pointer hover:shadow-sm" : "cursor-default opacity-50"}`}
                    >
                      <Icon size={24} className="text-earth-600" />
                    </a>
                  );
                })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="mx-auto mb-10 max-w-7xl px-4 sm:mb-14 sm:px-6 lg:px-8">
        <div className="relative h-[500px] overflow-hidden rounded-[3rem] border border-earth-100 bg-earth-200 shadow-xl shadow-earth-100/60">
          {content?.googleMapsUrl ? (
            <iframe
              src={content.googleMapsUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="grayscale contrast-125 opacity-80"
            ></iframe>
          ) : (
            <>
              <div className="absolute inset-0 bg-[#e5e3df]">
                <img
                  src={content?.headquartersImage || "https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1500"}
                  alt="Headquarters map"
                  className="h-full w-full object-cover mix-blend-luminosity opacity-40"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-earth-500/20 mix-blend-multiply" />
              </div>

              <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
                <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-earth-600 text-white shadow-2xl">
                  <div className="absolute inset-0 rounded-full bg-earth-600 animate-ping opacity-50" />
                  <MapPin size={32} />
                </div>
                <div className="mt-4 rounded-xl bg-white px-6 py-3 shadow-xl font-bold text-earth-900">
                  {content?.mapPinLabel || globalSettings.siteName || "HQ Dried Fruits HQ"}
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </PageLayout>
  );
}
