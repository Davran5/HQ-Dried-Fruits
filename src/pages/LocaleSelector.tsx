import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Globe2, Loader2, MapPin } from "lucide-react";
import { activeLocaleDefinitions, detectDeviceLocale, saveLocalePreference } from "@/src/i18n";
import { buildLocalePath } from "@/src/lib/routes";
import { usePages } from "@/src/contexts/PageContext";

const loadingCopy: Record<string, { title: string; body: string }> = {
  en: {
    title: "Detecting language",
    body: "We are preparing the right language version from your browser settings.",
  },
  pt: {
    title: "Detectando idioma",
    body: "Estamos preparando a versão correta do idioma a partir das configurações do seu navegador.",
  },
  es: {
    title: "Detectando idioma",
    body: "Estamos preparando la versión de idioma adecuada según la configuración de su navegador.",
  },
  nl: {
    title: "Taal detecteren",
    body: "We bereiden de juiste taalversie voor op basis van uw browserinstellingen.",
  },
  fr: {
    title: "Détection de la langue",
    body: "Nous préparons la bonne version linguistique à partir des paramètres de votre navigateur.",
  },
};

export function LocaleSelectorPage() {
  const navigate = useNavigate();
  const { globalSettings } = usePages();
  const detectedLocale = useMemo(() => detectDeviceLocale(), []);
  const detectedDefinition = activeLocaleDefinitions.find((entry) => entry.code === detectedLocale) ?? activeLocaleDefinitions[0];
  const logo = globalSettings.headerLogo || globalSettings.footerLogo || "";

  useEffect(() => {
    saveLocalePreference(detectedLocale);

    const redirectTimer = window.setTimeout(() => {
      navigate(buildLocalePath(detectedLocale), { replace: true });
    }, 900);

    return () => window.clearTimeout(redirectTimer);
  }, [detectedLocale, navigate]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f7f1e8] text-earth-950">
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(248,242,232,0.94)_0%,rgba(240,229,211,0.9)_45%,rgba(222,202,171,0.84)_100%)]" />
      <div className="absolute inset-0 opacity-[0.16] [background-image:linear-gradient(rgba(96,65,42,0.28)_1px,transparent_1px),linear-gradient(90deg,rgba(96,65,42,0.28)_1px,transparent_1px)] [background-size:44px_44px]" />
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-[linear-gradient(0deg,rgba(72,48,31,0.12),transparent)]" />

      <section className="relative mx-auto flex min-h-screen w-full max-w-5xl flex-col items-center justify-center px-5 py-12 text-center sm:px-8">
        <div className="mb-9 flex h-24 w-24 items-center justify-center rounded-[2rem] border border-white/70 bg-white/65 shadow-[0_24px_80px_rgba(82,52,31,0.14)] backdrop-blur-xl sm:h-28 sm:w-28">
          {logo ? (
            <img src={logo} alt="HQ Dried Fruits" className="h-16 w-16 object-contain sm:h-20 sm:w-20" />
          ) : (
            <Globe2 className="h-11 w-11 text-earth-700 sm:h-12 sm:w-12" />
          )}
        </div>

        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/55 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-earth-700 shadow-sm backdrop-blur">
          <MapPin size={14} />
          {detectedDefinition.label}
        </div>

        <h1 className="max-w-3xl font-display text-4xl font-bold leading-tight text-earth-950 sm:text-6xl">
          {(loadingCopy[detectedLocale] || loadingCopy.en).title}
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-earth-700 sm:text-lg">
          {(loadingCopy[detectedLocale] || loadingCopy.en).body}
        </p>

        <div className="mt-10 flex items-center gap-4 rounded-full border border-white/70 bg-white/60 px-5 py-3 shadow-[0_18px_60px_rgba(82,52,31,0.12)] backdrop-blur-xl">
          <Loader2 className="h-5 w-5 animate-spin text-earth-700" />
          <div className="flex gap-2">
            {activeLocaleDefinitions.map((entry) => (
              <span
                key={entry.code}
                className={`h-2.5 rounded-full transition-all duration-500 ${
                  entry.code === detectedLocale ? "w-9 bg-earth-700" : "w-2.5 bg-earth-300"
                }`}
              />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
