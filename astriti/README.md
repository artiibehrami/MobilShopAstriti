# Mobil Shop Astriti

React + Vite storefront with an Express API backed by MySQL. Products, stock, price update dates, store details, opening hours, delivery and warranty policies, FAQs, published customer reviews, guest carts, orders, repair prices, and repair bookings are served from MySQL.

## MySQL setup

1. Install and start MySQL. The existing local database is named `mobilshop_db`; if you create a different database, use that name in `.env`:

   ```sql
   CREATE DATABASE IF NOT EXISTS mobilshop_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

2. Copy `.env.example` to `.env` and set your MySQL host, database name, username, and password. Never commit `.env`.

   ```powershell
   Copy-Item .env.example .env
   ```

3. Install dependencies and create the tables and initial store/FAQ content:

   ```powershell
   npm install
   npm run db:setup
   ```

4. Start the website and API:

   ```powershell
   npm run dev
   ```

   Vite runs on `http://localhost:5173` and proxies `/api` requests to the Express API on port `4000`. The API returns an error instead of silently substituting static catalog data if MySQL is unavailable.

## Admin panel

The admin page is available at `http://localhost:5173/admin`. Copy `.env.example` to `.env`, then set:

- `ADMIN_PASSWORD` to a private password with at least 12 characters.
- `ADMIN_SESSION_SECRET` to a random secret with at least 32 bytes. To generate a 64-character hexadecimal value in PowerShell:

  ```powershell
  $bytes = New-Object byte[] 32
  $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
  $rng.GetBytes($bytes)
  [BitConverter]::ToString($bytes).Replace('-', '').ToLowerInvariant()
  $rng.Dispose()
  ```

Restart the API after changing `.env`. `ADMIN_ORIGIN` is optional for local development; behind an HTTPS reverse proxy, set it to the site's exact origin (for example `https://shop.example.com`). Run `npm run db:setup` when upgrading an existing database so order statuses can be managed; existing order data is preserved. The admin login uses an HttpOnly, SameSite cookie that expires after eight hours. The dashboard reads recent orders, updates order statuses, and can add products to MySQL. Keep `.env` private and never commit it.

## Add products and repair prices

The storefront reads the existing `products` table. Product rows already in MySQL are preserved. Add repair prices in the new `repair_services` table with phpMyAdmin or another database client; the service page reads directly from it.

Example product:

```sql
INSERT INTO products
  (title, brand, category, description, details, image_url, tag, price, stock_quantity, popularity, price_updated_at)
VALUES
  ('iPhone model', 'Apple', 'Smartphones', 'Storage and display details',
   'Product details', 'https://example.com/product.jpg', 'New', 499.00, 3, 10, CURRENT_TIMESTAMP);
```

Set `stock_quantity` to `NULL` when stock is not known (the site asks customers to contact the shop), `0` when out of stock, or a positive number when available. Orders validate and decrement known stock in a MySQL transaction.

Repair prices start empty; add the services and quotes the shop actually offers. Example:

```sql
INSERT INTO repair_services
  (brand, model, issue_key, issue_label, issue_note, estimated_time, quote)
VALUES
  ('Apple', 'iPhone model', 'battery', 'Bateria', 'Ndërrim i baterisë', '30–45 min', 49.00);
```

Edit `products` and `repair_services` to keep prices and availability current. When changing a product price, update `price_updated_at` too:

```sql
UPDATE products
SET price = 479.00, price_updated_at = CURRENT_TIMESTAMP, stock_quantity = 2
WHERE id = 1;
```

## Site content and reviews

- `site_settings` stores the address, phone, WhatsApp number, map link, hours, delivery coverage/policy, warranty and returns text, payment details, and repair appointment slots. `npm run db:setup` inserts starter values only when a setting is missing.
- `faqs` drives the FAQ section. Add, edit, publish, or unpublish entries in this table.
- Reviews submitted on the site are stored as `pending` and are not displayed publicly until approved. Review them before publishing:

  ```sql
  UPDATE reviews SET status = 'approved' WHERE id = 1;
  ```

- The existing `orders` and `order_items` tables store checkout records; `repair_requests` stores service appointments. New orders verify current DB prices and stock and decrement known inventory atomically.
- `carts` and `cart_items` store each guest's cart in MySQL. An HttpOnly browser cookie identifies the cart for 30 days; carts are not shared across devices. A cart from the previous localStorage-based version is imported once when possible.

Existing `server/data/orders.json` and `server/data/repairs.json` are not deleted. After setting up the schema, optionally import them once:

```powershell
npm run db:migrate-json
```

The migration is idempotent by reference and leaves the JSON files unchanged.

## Production

Build and run the Express server with `NODE_ENV=production`, `PORT`, and the `DB_*` environment variables configured by the host. Create the database and run `npm run db:setup` before starting the application.
