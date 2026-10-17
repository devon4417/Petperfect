export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { isAdminRequest } from "@/lib/adminAuth";

// GET /api/admin/orders — list orders newest first. Requires admin session.
export async function GET(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const ref = url.replace("https://", "").split(".")[0];
    return NextResponse.json(
      {
        error: "Could not load orders",
        detail: JSON.stringify(error).slice(0, 200),
        dbRef: ref,
      },
      { status: 500 }
    );
  }
  return NextResponse.json({ orders: data });
}
