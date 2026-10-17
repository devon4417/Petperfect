export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price_cents: number;
  compare_at_cents: number | null;
  image_url: string | null;
  active: boolean;
};

export type Supplier = {
  id: string;
  product_id: string;
  name: string;
  unit_cost_cents: number;
  shipping_cost_cents: number;
  shipping_days: number;
  us_warehouse: boolean;
  in_stock: boolean;
  priority: number;
};

export type OrderStatus =
  | "pending"
  | "authorized"
  | "captured"
  | "canceled"
  | "expired";

export type Order = {
  id: string;
  stripe_session_id: string;
  stripe_payment_intent_id: string | null;
  customer_email: string | null;
  customer_name: string | null;
  shipping_address: Record<string, unknown> | null;
  line_items: { slug: string; name: string; price_cents: number; qty: number }[];
  amount_cents: number;
  status: OrderStatus;
  supplier_id: string | null;
  supplier_order_id: string | null;
  tracking_number: string | null;
  profit_cents: number | null;
  created_at: string;
};

export type CartItem = {
  slug: string;
  name: string;
  price_cents: number;
  qty: number;
};

export function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}
