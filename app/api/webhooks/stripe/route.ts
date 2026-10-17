export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getProductBySlug } from "@/lib/products";
import type { OrderStatus } from "@/lib/types";

// POST /api/webhooks/stripe — Stripe event receiver.
// Verifies the webhook signature, then keeps the orders table in sync.
export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return NextResponse.json(
      { error: "Missing webhook signature or secret" },
      { status: 400 }
    );
  }

  const rawBody = await req.text();
  const stripe = getStripe();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    console.error("webhook signature verification failed", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const sb = getSupabaseAdmin();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const cartMeta = session.metadata?.cart;
        const cartItems: { slug: string; qty: number }[] = cartMeta
          ? JSON.parse(cartMeta)
          : [];

        // Build denormalized line items with names + prices from our catalog.
        const lineItems = [];
        for (const ci of cartItems) {
          const p = await getProductBySlug(ci.slug);
          if (p)
            lineItems.push({
              slug: p.slug,
              name: p.name,
              price_cents: p.price_cents,
              qty: ci.qty,
            });
        }

        await sb.from("orders").upsert(
          {
            stripe_session_id: session.id,
            stripe_payment_intent_id:
              typeof session.payment_intent === "string"
                ? session.payment_intent
                : session.payment_intent?.id ?? null,
            customer_email: session.customer_details?.email ?? null,
            customer_name: session.customer_details?.name ?? null,
            shipping_address: (session.shipping_details ??
              null) as unknown as Record<string, unknown> | null,
            line_items: lineItems,
            amount_cents: session.amount_total ?? 0,
            status: "authorized" as OrderStatus,
          },
          { onConflict: "stripe_session_id" }
        );
        break;
      }

      case "payment_intent.payment_failed": {
        const pi = event.data.object as Stripe.PaymentIntent;
        await sb
          .from("orders")
          .update({ status: "canceled" as OrderStatus })
          .eq("stripe_payment_intent_id", pi.id);
        break;
      }

      case "payment_intent.canceled": {
        // Authorization released/expired without capture.
        const pi = event.data.object as Stripe.PaymentIntent;
        await sb
          .from("orders")
          .update({ status: "expired" as OrderStatus })
          .eq("stripe_payment_intent_id", pi.id);
        break;
      }

      default:
        // Unhandled event types are acknowledged without action.
        break;
    }
  } catch (err) {
    console.error("webhook handler error", err);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
