"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";

export default function Navbar() {
  const { count } = useCart();
  return (
    <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-xl font-extrabold tracking-tight">
          <span className="text-brand-600">Pet</span>Perfect
        </Link>
        <nav className="flex items-center gap-5 text-sm font-medium">
          <Link href="/products" className="hover:text-brand-600">
            Shop
          </Link>
          <Link
            href="/cart"
            className="relative rounded-full bg-stone-900 px-4 py-2 text-white hover:bg-stone-700"
          >
            Cart
            {count > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-xs font-bold">
                {count}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}
