import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonicalUrl?: string;
  robots?: string;
  ogType?: string;
  googleSiteVerificationId?: string;
}

function upsertMetaTag(attribute: "name" | "property", key: string, value: string) {
  let tag = document.querySelector(`meta[${attribute}="${key}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attribute, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", value);
}

function upsertCanonicalLink(url: string) {
  let link = document.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    document.head.appendChild(link);
  }
  link.setAttribute("href", url);
}

export function useSEO({
  title,
  description,
  ogTitle,
  ogDescription,
  ogImage,
  canonicalUrl,
  robots = "index,follow",
  ogType = "website",
  googleSiteVerificationId,
}: SEOProps) {
  useEffect(() => {
    if (title) {
      document.title = title;
    }

    if (description) {
      upsertMetaTag("name", "description", description);
    }

    if (ogTitle) {
      upsertMetaTag("property", "og:title", ogTitle);
    }

    if (ogImage) {
      upsertMetaTag("property", "og:image", ogImage);
      upsertMetaTag("name", "twitter:image", ogImage);
    }

    if (description || ogDescription) {
      upsertMetaTag("property", "og:description", ogDescription || description || "");
      upsertMetaTag("name", "twitter:description", ogDescription || description || "");
    }

    if (title || ogTitle) {
      upsertMetaTag("name", "twitter:title", ogTitle || title || "");
    }

    upsertMetaTag("property", "og:type", ogType);
    upsertMetaTag("name", "twitter:card", "summary_large_image");
    upsertMetaTag("name", "robots", robots);

    if (typeof window !== "undefined") {
      const canonical = canonicalUrl || window.location.href;
      upsertCanonicalLink(canonical);
      upsertMetaTag("property", "og:url", canonical);
    }

    if (googleSiteVerificationId) {
      upsertMetaTag("name", "google-site-verification", googleSiteVerificationId);
    }
  }, [title, description, ogTitle, ogDescription, ogImage, canonicalUrl, robots, ogType, googleSiteVerificationId]);
}
