"use strict";
const router = require("express").Router();
const pool = require("../db/pool");
const { requireAuth, asyncHandler } = require("../middleware/auth");
const { normalizeItems, calculateTotals } = require("../db/order-logic");
router.use(requireAuth);
router.post("/", asyncHandler(async (req, res) => {
  const { firstName, lastName, email, street, city, state, zip } = req.body || {};
  const nameValid = (s, max) => typeof s === "string" && s.trim().length >= 1 && s.trim().length <= max;
  if (!nameValid(firstName, 60) || !nameValid(lastName, 60) || !nameValid(email, 254) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !nameValid(street, 160) || !nameValid(city, 80) || state !== "CA" || typeof zip !== "string" || !/^\d{5}(-\d{4})?$/.test(zip))
    return res.status(400).json({ error: "Complete all California delivery fields." });
  const items = normalizeItems(req.body.items);
  if (!items) return res.status(400).json({ error: "Add 1–20 of each valid product, up to 30 product lines." });

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await client.query("SELECT id, price_cents, stock FROM products WHERE id = ANY($1::text[]) AND active = true ORDER BY id FOR UPDATE", [items.map((item) => item.id)]);
    const byId = new Map(result.rows.map((product) => [product.id, product]));
    if (result.rows.length !== items.length || items.some((item) => byId.get(item.id).stock < item.quantity)) {
      await client.query("ROLLBACK");
      return res.status(409).json({ error: "One or more products are unavailable in that quantity. Refresh the shop and try again." });
    }
    const { subtotal, delivery, total } = calculateTotals(items, byId);
    const inserted = await client.query(`INSERT INTO orders (user_id,first_name,last_name,email,street,city,state,zip,subtotal_cents,delivery_cents,total_cents)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING id,created_at`,
      [req.session.userId, firstName.trim(), lastName.trim(), email.trim().toLowerCase(), street.trim(), city.trim(), state, zip, subtotal, delivery, total]);
    const order = inserted.rows[0];
    for (const item of items) {
      await client.query("INSERT INTO order_items (order_id, product_id, quantity, unit_price_cents) VALUES ($1,$2,$3,$4)", [order.id, item.id, item.quantity, byId.get(item.id).price_cents]);
      await client.query("UPDATE products SET stock = stock - $1 WHERE id = $2", [item.quantity, item.id]);
    }
    await client.query("COMMIT");
    res.status(201).json({ order: { id: order.id, createdAt: order.created_at, subtotal, delivery, total } });
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}));
router.get("/", asyncHandler(async (req, res) => {
  const { rows } = await pool.query("SELECT id,created_at,total_cents,status FROM orders WHERE user_id = $1 ORDER BY created_at DESC LIMIT 30", [req.session.userId]);
  res.json({ orders: rows });
}));
router.get("/:id", asyncHandler(async (req, res) => {
  if (!/^\d+$/.test(req.params.id)) return res.status(404).json({ error: "Order not found." });
  const { rows } = await pool.query(`SELECT o.id,o.created_at,o.subtotal_cents,o.delivery_cents,o.total_cents,o.status,
      COALESCE(json_agg(json_build_object('name',p.name,'quantity',i.quantity,'unitPrice',i.unit_price_cents)) FILTER (WHERE i.id IS NOT NULL),'[]') AS items
      FROM orders o LEFT JOIN order_items i ON i.order_id = o.id LEFT JOIN products p ON p.id = i.product_id
      WHERE o.id = $1 AND o.user_id = $2 GROUP BY o.id`, [req.params.id, req.session.userId]);
  if (!rows[0]) return res.status(404).json({ error: "Order not found." });
  res.json({ order: rows[0] });
}));
module.exports = router;
