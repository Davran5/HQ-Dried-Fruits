import type { ActiveLocaleCode } from "@/src/i18n";
import type { PageData, GlobalSettings } from "@/src/types/page";
import type { Product, SEOData } from "@/src/types/product";

export interface PublicBootstrapPayload {
  locale: ActiveLocaleCode;
  globalSettings: GlobalSettings;
  pages: PageData[];
  pageSeo: Record<string, SEOData>;
  products: Product[];
}

declare global {
  interface Window {
    __HQ_PUBLIC_BOOTSTRAP__?: PublicBootstrapPayload;
  }
}
