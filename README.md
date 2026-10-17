# PetPerfect

Dropshipping storefront for pet accessories with a **charge-on-shipment**
payment model: the customer's card is authorized at checkout and only
captured after the supplier order ships.

**Stack:** Next.js 14 (App Router) · Tailwind CSS · Stripe (test mode) ·
Supabase (Postgres) · Vercel

## How the money flow works

1. Customer checks out → Stripe Checkout Session is created with
   `payment_intent_data.capture_method = "manual"` → card is **authorized**
   (hold), not charged.
2. Stripe webhook `checkout.session.completed` → order row created in
   Supabase with status `authorized`.
3. You buy the item from the supplier (CJ Dropshipping / Alibaba /
   AliExpress) with the customer's shipping info. When it ships, click
   **"Mark shipped & capture"** in `/admin` → the PaymentIntent is
   captured, the order is marked `captured`, and profit is recorded
   (captured amount − cheapest in-stock supplier landed cost).
4. Authorizations expire after ~7 days if never captured — list only
   US-warehouse products that ship within that window.

## Setup

### 1. Supabase

1. Create a free project at supabase.com.
2. Open the SQL editor and run `supabase/schema.sql` (creates tables,
   seeds the 4 products + suppliers, enables basic RLS).
3. Copy the project URL, anon key, and service-role key.

### 2. Stripe (test mode)

1. Use the **Petperfect sandbox** (test mode) while simulating.
2. Copy the test secret key from the Stripe dashboard.
3. Forward webhooks locally:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
   Copy the printed `whsec_...` secret into `STRIPE_WEBHOOK_SECRET`.

### 3. Env

```bash
cp .env.example .env.local
# fill in the five values
```

### 4. Run

```bash
npm install
npm run dev
# open http://localhost:3000
```

Use Stripe test card `4242 4242 4242 4242` (any future expiry, any CVC).

### 5. Deploy (Vercel)

1. Push this repo to GitHub and import it in Vercel.
2. Add the same five env vars in the Vercel project settings.
3. In the live Stripe dashboard, add the webhook endpoint
   `https://<your-domain>/api/webhooks/stripe` for events
   `checkout.session.completed`, `payment_intent.payment_failed`,
   `payment_intent.canceled`, and use that signing secret.

## Project layout

- `app/` — storefront pages (`/`, `/products`, `/products/[slug]`,
  `/cart`, `/success`) and the `/admin` orders dashboard
- `app/api/checkout` — creates the manual-capture Checkout Session
- `app/api/webhooks/stripe` — signature-verified Stripe event receiver
- `app/api/admin/orders` + `app/api/admin/capture` — dashboard APIs
- `lib/` — Supabase/Stripe clients, cart state, product data layer
  (falls back to built-in product data when Supabase isn't configured)
- `supabase/schema.sql` — tables + seed data
- `components/` — Navbar, ProductCard, ProductImage placeholder

## Before going live

- [ ] Add authentication to `/admin` and `/api/admin/*` (currently open)
- [ ] Add real product photography (`/products/<slug>.jpg` replaces the
      placeholder)
- [ ] Switch Stripe to live keys + live webhook endpoint
- [ ] Confirm each product's supplier pricing/stock in the suppliers table
- [ ] Consider Stripe Radar / fraud review for first real orders
