import type { Metadata } from "next";
import { CartProvider } from "@/lib/cart";
import Navbar from "@/components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "PetPerfect — pet gear that ships fast",
  description:
    "Quality pet accessories with fast US shipping. You're only charged when your order ships.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-stone-50 text-stone-900 antialiased">
        <CartProvider>
          <Navbar />
          <main>{children}</main>
          <footer className="mt-16 border-t border-stone-200 bg-white">
            <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-stone-500">
              <p className="font-semibold text-stone-700">PetPerfect</p>
              <p className="mt-1">
                Pet gear that ships fast. You&apos;re only charged when your
                order ships — we place a temporary hold at checkout.
              </p>
            </div>
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}
