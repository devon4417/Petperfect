import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { getProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function Home() {
  const products = await getProducts();
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-b from-brand-50 to-stone-50">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center sm:py-24">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl">
            Pet gear that <span className="text-brand-600">ships fast</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-stone-600">
            Quality accessories for dogs and cats, shipped from US warehouses.
            No waiting weeks for a package from overseas.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link
              href="/products"
              className="rounded-full bg-brand-600 px-7 py-3 font-semibold text-white hover:bg-brand-700"
            >
              Shop now
            </Link>
          </div>
          <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-stone-700 shadow-sm">
            <span className="text-brand-600">✓</span> You&apos;re only charged
            when your order ships
          </p>
        </div>
      </section>

      {/* Featured products */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-2xl font-bold">Featured products</h2>
          <Link
            href="/products"
            className="text-sm font-semibold text-brand-700 hover:underline"
          >
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </section>

      {/* Trust badges */}
      <section className="border-t border-stone-200 bg-white">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 py-12 sm:grid-cols-3">
          <div className="text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-2xl">
              💳
            </div>
            <h3 className="font-semibold">Charged only when it ships</h3>
            <p className="mt-1 text-sm text-stone-600">
              We place a temporary hold at checkout. Your card is charged only
              after your order leaves our supplier&apos;s warehouse.
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-2xl">
              📦
            </div>
            <h3 className="font-semibold">Fast US shipping</h3>
            <p className="mt-1 text-sm text-stone-600">
              Every product ships from a US warehouse — no 3-week overseas
              waits.
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-2xl">
              🐾
            </div>
            <h3 className="font-semibold">Pet-tested picks</h3>
            <p className="mt-1 text-sm text-stone-600">
              A small catalog of accessories we&apos;d buy for our own pets.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
