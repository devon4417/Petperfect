import Image from "next/image";
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
  const h = size === "lg" ? "h-80" : "h-48";
  return (
    <div className={`relative ${h} w-full overflow-hidden bg-stone-100`}>
      <Image
        src={`/products/${slug}.jpg`}
        alt={name}
        fill
        className="object-cover"
        sizes={size === "lg" ? "(max-width: 768px) 100vw, 800px" : "(max-width: 768px) 100vw, 400px"}
      />
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
