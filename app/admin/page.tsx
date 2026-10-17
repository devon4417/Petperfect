"use client";

import { useCallback, useEffect, useState } from "react";
import { formatCents, type Order } from "@/lib/types";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-stone-200 text-stone-700",
  authorized: "bg-amber-100 text-amber-800",
  captured: "bg-brand-100 text-brand-700",
  canceled: "bg-red-100 text-red-700",
  expired: "bg-stone-200 text-stone-500",
};

export default function AdminPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [capturing, setCapturing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/orders");
      const data = await res.json();
      setOrders(data.orders ?? []);
    } catch {
      setError("Could not load orders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const capture = async (orderId: string) => {
    if (
      !confirm(
        "Capture this payment? Only do this after the supplier order is confirmed shipping."
      )
    )
      return;
    setCapturing(orderId);
    setError(null);
    try {
      const res = await fetch("/api/admin/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: orderId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Capture failed");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Capture failed");
    } finally {
      setCapturing(null);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold">Orders</h1>
      <p className="mt-2 text-sm text-stone-500">
        MVP dashboard — add authentication before production use.
      </p>
      {error && (
        <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}
      {loading ? (
        <p className="mt-8 text-stone-500">Loading…</p>
      ) : orders.length === 0 ? (
        <p className="mt-8 text-stone-500">
          No orders yet. Place a test order through the storefront.
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-stone-200 bg-white">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="border-b border-stone-200 bg-stone-50">
              <tr>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Customer</th>
                <th className="px-4 py-3 font-semibold">Items</th>
                <th className="px-4 py-3 font-semibold">Amount</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Profit</th>
                <th className="px-4 py-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-stone-100">
                  <td className="px-4 py-3 text-stone-500">
                    {new Date(o.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium">
                      {o.customer_name ?? "—"}
                    </div>
                    <div className="text-stone-500">{o.customer_email}</div>
                  </td>
                  <td className="px-4 py-3">
                    {o.line_items
                      .map((li) => `${li.qty}× ${li.name}`)
                      .join(", ")}
                  </td>
                  <td className="px-4 py-3 font-semibold">
                    {formatCents(o.amount_cents)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        STATUS_STYLES[o.status] ?? STATUS_STYLES.pending
                      }`}
                    >
                      {o.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {o.profit_cents != null
                      ? formatCents(o.profit_cents)
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {o.status === "authorized" ? (
                      <button
                        onClick={() => capture(o.id)}
                        disabled={capturing === o.id}
                        className="rounded-full bg-brand-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
                      >
                        {capturing === o.id
                          ? "Capturing…"
                          : "Mark shipped & capture"}
                      </button>
                    ) : (
                      <span className="text-stone-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
