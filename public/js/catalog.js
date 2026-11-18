"use strict";
// All product records and prices come from PostgreSQL through the Express API.
window.FogFern = window.FogFern || {};
window.FogFern.products = [];
window.FogFern.ready = fetch("/api/products", { credentials: "same-origin" })
  .then(async (response) => {
    if (!response.ok) throw new Error("Unable to load products from PostgreSQL.");
    const data = await response.json();
    if (!Array.isArray(data.products)) throw new Error("Invalid catalog data.");
    window.FogFern.products = data.products.map((p) => ({
      ...p,
      price: p.price_cents,
      // Image files remain local; all listing, description, price and stock data are server-owned.
      image: /^[a-z0-9-]+\.jpg$/.test(p.image) ? p.image : "monstera.jpg",
    }));
    window.dispatchEvent(new Event("catalogready"));
    return window.FogFern.products;
  });
