// AUDY COOK - shared TS types
export interface LocalizedText {
  fr: string;
  en: string;
}

export interface Product {
  id: string;
  slug: string;
  name: LocalizedText;
  description: LocalizedText;
  category: LocalizedText;
  price: number;
  image: string;
  badge?: "bestseller" | "new" | string | null;
  in_stock: boolean;
  sort_order: number;
  created_at?: string;
}

export interface MenuItem {
  id: string;
  name: LocalizedText;
  description: LocalizedText;
  price: number;
  min_quantity: number;
  image?: string | null;
  sort_order: number;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: LocalizedText;
  excerpt: LocalizedText;
  body: LocalizedText;
  cover_image: string;
  category: LocalizedText;
  read_time: number;
  published_at: string;
}

export interface ResellerStore {
  name: string;
  address: string;
  phone?: string;
  main?: boolean;
}

export interface ResellerCountry {
  country: LocalizedText;
  flag: string;
  stores: ResellerStore[];
}

export interface CartLine {
  product: Product;
  quantity: number;
}

export type Lang = "fr" | "en";
