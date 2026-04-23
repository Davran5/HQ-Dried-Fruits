import { Link } from "react-router-dom";
import { ArrowRight, Globe2, Leaf } from "lucide-react";
import { activeLocaleDefinitions, saveLocalePreference } from "@/src/i18n";
import { buildLocalePath } from "@/src/lib/routes";
import { useLanguage } from "@/src/contexts/LanguageContext";

const selectorCopy = {
  en: {
    eyebrow: "Global Access",
    title: "Choose your language",
    description: "Search engines and buyers need crawlable locale pages. Pick a language version to continue.",
    recommendation: "Recommended",
  },
  ru: {
    eyebrow: "Международный доступ",
    title: "Выберите язык",
    description: "Поисковым системам и покупателям нужны отдельные индексируемые версии. Выберите язык сайта.",
    recommendation: "Рекомендуется",
  },
  uz: {
    eyebrow: "Global kirish",
    title: "Tilni tanlang",
    description: "Qidiruv tizimlari va xaridorlar uchun har bir til alohida indekslanadigan sahifaga ega bo‘lishi kerak. Davom etish uchun tilni tanlang.",
    recommendation: "Tavsiya etiladi",
  },
} as const;

export function LocaleSelectorPage() {
  const { locale } = useLanguage();
  const copy = selectorCopy[locale] ?? selectorCopy.en;

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,rgba(251,239,229,0.9),transparent_40%),linear-gradient(135deg,#fffaf7_0%,#f7efe8_48%,#f3e3d5_100%)] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl flex-col justify-center">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(24rem,0.88fr)] lg:items-center">
          <section className="rounded-[3rem] border border-white/70 bg-white/70 p-8 shadow-[0_24px_80px_rgba(98,56,30,0.08)] backdrop-blur-xl sm:p-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-earth-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-earth-500">
              <Globe2 size={14} />
              {copy.eyebrow}
            </div>
            <h1 className="mt-6 max-w-[12ch] font-display text-5xl font-bold leading-[0.92] text-earth-950 sm:text-6xl">
              {copy.title}
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-earth-700">
              {copy.description}
            </p>
          </section>

          <section className="grid gap-4">
            {activeLocaleDefinitions.map((entry) => {
              const targetPath = buildLocalePath(entry.code);
              const isPreferred = entry.code === locale;

              return (
                <Link
                  key={entry.code}
                  to={targetPath}
                  onClick={() => saveLocalePreference(entry.code)}
                  className="group relative overflow-hidden rounded-[2.4rem] border border-earth-100 bg-white px-6 py-6 shadow-[0_18px_50px_rgba(98,56,30,0.08)] transition-all hover:-translate-y-1 hover:border-earth-200 hover:shadow-[0_26px_60px_rgba(98,56,30,0.12)] sm:px-8 sm:py-7"
                >
                  <div className="absolute inset-y-0 right-0 w-40 bg-[radial-gradient(circle_at_center,rgba(225,196,162,0.2),transparent_68%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="relative flex items-center justify-between gap-6">
                    <div>
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-earth-100 text-earth-700">
                          <Leaf size={20} />
                        </div>
                        <div>
                          <p className="font-display text-2xl font-bold text-earth-950">{entry.label}</p>
                          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-earth-400">{entry.shortLabel}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {isPreferred ? (
                        <span className="hidden rounded-full bg-earth-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-earth-600 sm:inline-flex">
                          {copy.recommendation}
                        </span>
                      ) : null}
                      <ArrowRight className="h-5 w-5 text-earth-500 transition-transform duration-300 group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </section>
        </div>
      </div>
    </main>
  );
}
