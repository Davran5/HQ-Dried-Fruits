export interface Nutrition {
  energy: string;
  protein: string;
  fat: string;
  carbs: string;
}

export interface ProductContentSection {
  title: string;
  body: string;
}

export interface SEOData {
  metaTitle: string;
  metaDescription: string;
  slug: string;
  ogTitle: string;
  imageAlt: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  status: "Active" | "Inactive";
  image: string;
  imageGallery: string[];
  shortDescription: string;
  longDescription: string;
  highlights: string[];
  contentSections: ProductContentSection[];
  nutrition: Nutrition;
  inquirySubjectLine: string;
  tonnageOptions: string[];
  seo?: SEOData;
}
