export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

// GET /api/admin/orders — list orders newest first.
// MVP: no auth. Add authentication before any production use.
export async function GET() {
  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    return NextResponse.json({ error: "Could not load orders" }, { status: 500 });
  }
  return NextResponse.json({ orders: data });
}
