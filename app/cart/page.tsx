"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart";
import { formatCents } from "@/lib/types";

export default function CartPage() {
  const { items, setQty, removeItem, subtotalCents } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkout = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout failed");
      window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Checkout failed");
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Your cart is empty</h1>
        <p className="mt-2 text-stone-600">
          Add some pet gear to get started.
        </p>
        <Link
          href="/products"
          className="mt-6 inline-block rounded-full bg-brand-600 px-6 py-3 font-semibold text-white hover:bg-brand-700"
        >
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-3xl font-bold">Your cart</h1>
      <div className="mt-6 space-y-4">
        {items.map((item) => (
          <div
            key={item.slug}
            className="flex items-center justify-between rounded-xl border border-stone-200 bg-white p-4"
          >
            <div>
              <p className="font-semibold">{item.name}</p>
              <p className="text-sm text-stone-500">
                {formatCents(item.price_cents)} each
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center rounded-full border border-stone-300">
                <button
                  className="px-3 py-1 font-bold"
                  onClick={() => setQty(item.slug, item.qty - 1)}
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="w-6 text-center text-sm font-semibold">
                  {item.qty}
                </span>
                <button
                  className="px-3 py-1 font-bold"
                  onClick={() => setQty(item.slug, item.qty + 1)}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
              <span className="w-20 text-right font-bold">
                {formatCents(item.price_cents * item.qty)}
              </span>
              <button
                className="text-sm text-stone-400 hover:text-red-600"
                onClick={() => removeItem(item.slug)}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-xl bg-white p-5 shadow-sm">
        <div className="flex justify-between text-lg font-bold">
          <span>Subtotal</span>
          <span>{formatCents(subtotalCents)}</span>
        </div>
        <p className="mt-2 text-sm text-stone-500">
          Remember: we only place a temporary hold now — your card is charged
          when your order ships.
        </p>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        <button
          onClick={checkout}
          disabled={loading}
          className="mt-4 w-full rounded-full bg-brand-600 py-3 font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {loading ? "Redirecting to secure checkout…" : "Checkout"}
        </button>
      </div>
    </div>
  );
}
