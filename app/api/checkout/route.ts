export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getProductBySlug } from "@/lib/products";

// POST /api/checkout — create a Stripe Checkout Session that AUTHORIZES
// (places a hold on) the card without capturing. Capture happens later via
// POST /api/admin/capture once the supplier order ships.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const items: { slug: string; qty: number }[] = body.items ?? [];

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // Re-price server-side from our catalog so clients can't tamper with prices.
    const line_items = [];
    for (const item of items) {
      const qty = Math.max(1, Math.min(99, Math.floor(Number(item.qty) || 1)));
      const product = await getProductBySlug(String(item.slug));
      if (!product) {
        return NextResponse.json(
          { error: `Unknown product: ${item.slug}` },
          { status: 400 }
        );
      }
      line_items.push({
        price_data: {
          currency: "usd",
          product_data: { name: product.name },
          unit_amount: product.price_cents,
        },
        quantity: qty,
      });
    }

    // Derive the public app URL from the request so Stripe redirects back
    // to this deployment (Vercel sets x-forwarded-* headers).
    const host =
      req.headers.get("x-forwarded-host") ??
      req.headers.get("host") ??
      "localhost:3000";
    const proto = req.headers.get("x-forwarded-proto") ?? "https";
    const appUrl = `${proto}://${host}`;
    const stripe = getStripe();

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      // THE core of the charge-on-shipment model: authorize now, capture later.
      payment_intent_data: { capture_method: "manual" },
      success_url: `${appUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/cart`,
      metadata: {
        cart: JSON.stringify(
          items.map((i) => ({ slug: String(i.slug), qty: Number(i.qty) || 1 }))
        ),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("checkout error", err);
    return NextResponse.json(
      { error: "Could not start checkout" },
      { status: 500 }
    );
  }
}
