import { Button } from "@/src/components/ui/Button";
import { cn } from "@/src/lib/utils";
import type { ActiveLocaleCode } from "@/src/i18n";

interface LocaleDraftStatusProps {
  activeLocale: ActiveLocaleCode;
  unsavedLocales: ActiveLocaleCode[];
  onDiscardActive?: () => void;
  className?: string;
}

export function LocaleDraftStatus({ activeLocale, unsavedLocales, onDiscardActive, className }: LocaleDraftStatusProps) {
  const uniqueLocales = Array.from(new Set(unsavedLocales));
  const hasActiveDraft = uniqueLocales.includes(activeLocale);

  if (uniqueLocales.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900", className)}>
      <span className="font-bold">Unsaved drafts:</span>
      {uniqueLocales.map((locale) => (
        <span
          key={locale}
          className={cn(
            "rounded-full px-2 py-0.5 font-bold uppercase",
            locale === activeLocale ? "bg-amber-200 text-amber-950" : "bg-white/80 text-amber-800",
          )}
        >
          {locale} unsaved
        </span>
      ))}
      {hasActiveDraft && onDiscardActive ? (
        <Button
          type="button"
          variant="ghost"
          onClick={onDiscardActive}
          className="ml-auto h-7 px-2 text-xs font-bold text-amber-900 hover:bg-amber-100"
        >
          Discard {activeLocale.toUpperCase()} draft
        </Button>
      ) : null}
    </div>
  );
}
