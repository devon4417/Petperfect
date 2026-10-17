export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabase";
import { isAdminRequest } from "@/lib/adminAuth";

// POST /api/admin/capture — capture an authorized payment when the supplier
// order ships. Body: { order_id: string }. Requires admin session.
export async function POST(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { order_id } = await req.json();
    if (!order_id) {
      return NextResponse.json({ error: "order_id required" }, { status: 400 });
    }

    const sb = getSupabaseAdmin();
    const { data: order, error: fetchError } = await sb
      .from("orders")
      .select("*")
      .eq("id", order_id)
      .single();

    if (fetchError || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    if (order.status !== "authorized") {
      return NextResponse.json(
        { error: `Order is ${order.status}, not authorized` },
        { status: 400 }
      );
    }
    if (!order.stripe_payment_intent_id) {
      return NextResponse.json(
        { error: "Order has no payment intent" },
        { status: 400 }
      );
    }

    const stripe = getStripe();
    const pi = await stripe.paymentIntents.capture(
      order.stripe_payment_intent_id
    );

    if (pi.status !== "succeeded") {
      return NextResponse.json(
        { error: `Capture did not succeed (status: ${pi.status})` },
        { status: 502 }
      );
    }

    // Profit = captured amount minus cheapest supplier landed cost per line item.
    let costCents = 0;
    const lineItems: { slug: string; qty: number }[] = order.line_items ?? [];
    for (const li of lineItems) {
      const { data: product } = await sb
        .from("products")
        .select("id")
        .eq("slug", li.slug)
        .single();
      if (!product) continue;
      const { data: sups } = await sb
        .from("suppliers")
        .select("unit_cost_cents, shipping_cost_cents")
        .eq("product_id", product.id)
        .eq("in_stock", true)
        .order("priority", { ascending: true })
        .limit(1);
      const landed =
        sups && sups.length > 0
          ? sups[0].unit_cost_cents + sups[0].shipping_cost_cents
          : 0;
      costCents += landed * (li.qty || 1);
    }

    const profitCents = order.amount_cents - costCents;

    await sb
      .from("orders")
      .update({ status: "captured", profit_cents: profitCents })
      .eq("id", order_id);

    return NextResponse.json({
      ok: true,
      amount_captured_cents: pi.amount_received,
      profit_cents: profitCents,
    });
  } catch (err) {
    console.error("capture error", err);
    return NextResponse.json(
      { error: "Capture failed" },
      { status: 500 }
    );
  }
}
