import { getSupabaseBrowser } from "./supabase";
import type { Product } from "./types";

// Static fallback so pages render (and `next build` passes) before
// Supabase credentials are configured. Matches supabase/schema.sql seed.
const FALLBACK_PRODUCTS: Product[] = [
  {
    id: "fallback-grooming-gloves",
    slug: "grooming-gloves",
    name: "Silicone Deshedding Grooming Gloves (Pair)",
    description:
      "Gently remove loose fur while you pet — soft silicone tips lift shedding hair without scratching. Great for shedding season, works on dogs and cats, and the collected fur peels right off for easy cleanup.",
    price_cents: 999,
    compare_at_cents: 1499,
    image_url: null,
    active: true,
  },
  {
    id: "fallback-led-safety-collar",
    slug: "led-safety-collar",
    name: "USB-Rechargeable LED Safety Collar",
    description:
      'Keep your dog visible on dark walks. Bright LED with 3 light modes (steady, fast flash, slow flash), USB rechargeable — no batteries to replace. Cut-to-fit design adjusts from 12" to 22".',
    price_cents: 1199,
    compare_at_cents: 1799,
    image_url: null,
    active: true,
  },
  {
    id: "fallback-travel-bowls-2pack",
    slug: "travel-bowls-2pack",
    name: "Collapsible Silicone Travel Bowls (2-Pack)",
    description:
      "Food and water on the go. These food-grade silicone bowls pop open for mealtime and collapse flat for your bag or glovebox. Includes carabiner clips — one for food, one for water.",
    price_cents: 999,
    compare_at_cents: 1449,
    image_url: null,
    active: true,
  },
  {
    id: "fallback-cat-teaser-wand-2pack",
    slug: "cat-teaser-wand-2pack",
    name: "Feather Cat Teaser Wand (2-Pack)",
    description:
      "Interactive play your cat can't resist — natural feathers plus a bell on a flexible wand. Two wands per pack so there's always a backup when one gets loved to pieces.",
    price_cents: 1199,
    compare_at_cents: 1649,
    image_url: null,
    active: true,
  },
];

function supabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export async function getProducts(): Promise<Product[]> {
  if (!supabaseConfigured()) return FALLBACK_PRODUCTS;
  try {
    const sb = getSupabaseBrowser();
    const { data, error } = await sb
      .from("products")
      .select("*")
      .eq("active", true)
      .order("created_at");
    if (error || !data || data.length === 0) return FALLBACK_PRODUCTS;
    return data as Product[];
  } catch {
    return FALLBACK_PRODUCTS;
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const products = await getProducts();
  return products.find((p) => p.slug === slug) ?? null;
}
