import Link from "next/link";
import { formatCents, type Product } from "@/lib/types";

export function ProductImage({
  slug,
  name,
  size = "md",
}: {
  slug: string;
  name: string;
  size?: "md" | "lg";
}) {
  // Placeholder until real product photography is added at /products/<slug>.jpg
  const h = size === "lg" ? "h-80" : "h-48";
  return (
    <div
      className={`flex ${h} w-full items-center justify-center bg-gradient-to-br from-brand-100 to-stone-200 text-brand-700`}
      role="img"
      aria-label={name}
    >
      <svg
        viewBox="0 0 24 24"
        className="h-16 w-16 opacity-60"
        fill="currentColor"
        aria-hidden
      >
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
    </div>
  );
}

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group overflow-hidden rounded-2xl border border-stone-200 bg-white transition hover:shadow-lg"
    >
      <ProductImage slug={product.slug} name={product.name} />
      <div className="p-4">
        <h3 className="font-semibold leading-snug group-hover:text-brand-700">
          {product.name}
        </h3>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-lg font-bold">
            {formatCents(product.price_cents)}
          </span>
          {product.compare_at_cents && (
            <span className="text-sm text-stone-400 line-through">
              {formatCents(product.compare_at_cents)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
