"use strict";
const router = require("express").Router();
const pool = require("../db/pool");
const { asyncHandler } = require("../middleware/auth");
const columns = "id, name, subtitle, price_cents, category, label, image, light, water, size, description, stock";
router.get("/", asyncHandler(async (_req, res) => {
  const result = await pool.query(`SELECT ${columns} FROM products WHERE active = true ORDER BY display_order, name`);
  res.json({ products: result.rows });
}));
router.get("/:id", asyncHandler(async (req, res) => {
  if (!/^[a-z0-9-]{1,60}$/.test(req.params.id)) return res.status(404).json({ error: "Product not found." });
  const result = await pool.query(`SELECT ${columns} FROM products WHERE id = $1 AND active = true`, [req.params.id]);
  if (!result.rows[0]) return res.status(404).json({ error: "Product not found." });
  res.json({ product: result.rows[0] });
}));
module.exports = router;
