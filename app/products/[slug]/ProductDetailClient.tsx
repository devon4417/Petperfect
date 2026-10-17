"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ProductImage } from "@/components/ProductCard";
import { useCart } from "@/lib/cart";
import { formatCents, type Product } from "@/lib/types";

export default function ProductDetailClient({ product }: { product: Product }) {
  const [qty, setQty] = useState(1);
  const { addItem } = useCart();
  const router = useRouter();

  const handleAdd = () => {
    addItem(
      { slug: product.slug, name: product.name, price_cents: product.price_cents },
      qty
    );
    router.push("/cart");
  };

  return (
    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 py-10 md:grid-cols-2">
      <div className="overflow-hidden rounded-2xl border border-stone-200">
        <ProductImage slug={product.slug} name={product.name} size="lg" />
      </div>
      <div>
        <h1 className="text-3xl font-bold">{product.name}</h1>
        <div className="mt-3 flex items-baseline gap-3">
          <span className="text-2xl font-bold">
            {formatCents(product.price_cents)}
          </span>
          {product.compare_at_cents && (
            <span className="text-lg text-stone-400 line-through">
              {formatCents(product.compare_at_cents)}
            </span>
          )}
        </div>
        <p className="mt-4 leading-relaxed text-stone-600">
          {product.description}
        </p>

        <div className="mt-6 rounded-xl bg-brand-50 p-4 text-sm text-brand-700">
          <span className="font-semibold">Our promise:</span> you&apos;re only
          charged when your order ships — we place a temporary hold at
          checkout.
        </div>

        <div className="mt-6 flex items-center gap-4">
          <div className="flex items-center rounded-full border border-stone-300">
            <button
              className="px-4 py-2 text-lg font-bold"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="w-8 text-center font-semibold">{qty}</span>
            <button
              className="px-4 py-2 text-lg font-bold"
              onClick={() => setQty((q) => Math.min(99, q + 1))}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
          <button
            onClick={handleAdd}
            className="flex-1 rounded-full bg-stone-900 px-6 py-3 font-semibold text-white hover:bg-stone-700"
          >
            Add to Cart
          </button>
        </div>

        <div className="mt-6 space-y-2 text-sm text-stone-600">
          <p>✓ Ships from a US warehouse</p>
          <p>✓ Temporary hold only — charged on shipment</p>
        </div>
      </div>
    </div>
  );
}
