# Mobil Shop Astriti — Obsidian & Titanium storefront

React 18 + Vite 5 + Tailwind 3, with a small Express API that stores orders and repair bookings.

## Run
    npm install
    npm run dev        # web on :5173, API on :4000 (proxied at /api)

## Production
    npm run build && npm start     # Express serves dist/ and the API on :4000

## Before you hand it to the client
1. `src/data.js` → set the real phone, WhatsApp number (digits only) and street address.
2. `src/data.js` → review product prices and the `REPAIR` price table. Quotes are indicative.
3. Orders → `server/data/orders.json`, repair bookings → `server/data/repairs.json`.
   For real use, add notifications (email/WhatsApp Business API) or swap the JSON files for a database.
4. Products are rendered as SVG mockups so the site has zero image dependencies.
   To use real photos, add an `image` field to each product and render an <img> in ProductCard/QuickView/CartDrawer.
