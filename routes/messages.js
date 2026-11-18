"use strict";
const router = require("express").Router();
const pool = require("../db/pool");
const { asyncHandler } = require("../middleware/auth");
const topics = new Set(["Choosing a plant", "Plant care", "Delivery question", "Something else"]);
const validEmail = (value) => typeof value === "string" && value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
router.post("/contact", asyncHandler(async (req, res) => {
  const { name, topic, message } = req.body || {};
  const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
  if (typeof name !== "string" || name.trim().length < 1 || name.trim().length > 100 || !validEmail(email) || !topics.has(topic) || typeof message !== "string" || message.trim().length < 10 || message.trim().length > 2000)
    return res.status(400).json({ error: "Complete all contact fields with valid information." });
  const { rows } = await pool.query("INSERT INTO contact_messages (user_id, name, email, topic, message) VALUES ($1,$2,$3,$4,$5) RETURNING id", [req.session?.userId || null, name.trim(), email, topic, message.trim()]);
  res.status(201).json({ message: "Your note has been saved for the shop team.", id: rows[0].id });
}));
router.post("/newsletter", asyncHandler(async (req, res) => {
  const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
  if (!validEmail(email)) return res.status(400).json({ error: "Enter a valid email address." });
  await pool.query("INSERT INTO newsletter_subscribers (email) VALUES ($1) ON CONFLICT (email) DO NOTHING", [email]);
  res.status(201).json({ message: "You're on the list! Thanks for joining." });
}));
module.exports = router;
