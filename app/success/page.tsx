import Link from "next/link";

export default function SuccessPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-3xl">
        ✓
      </div>
      <h1 className="text-3xl font-bold">Order confirmed!</h1>
      <p className="mt-4 text-lg text-stone-600">
        We&apos;ve placed a temporary hold on your card. You&apos;ll only be
        charged when your order ships from our supplier&apos;s US warehouse —
        usually within a few days.
      </p>
      <p className="mt-2 text-sm text-stone-500">
        A confirmation email with your order details is on its way.
      </p>
      <Link
        href="/products"
        className="mt-8 inline-block rounded-full bg-stone-900 px-6 py-3 font-semibold text-white hover:bg-stone-700"
      >
        Keep shopping
      </Link>
    </div>
  );
}
