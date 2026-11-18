"use strict";
const router = require("express").Router();
const bcrypt = require("bcryptjs");
const pool = require("../db/pool");
const { requireAuth, asyncHandler } = require("../middleware/auth");
const emailValid = (email) => typeof email === "string" && email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const publicUser = (row) => ({ id: row.id, name: row.name, email: row.email });

function createSession(req, user) {
  return new Promise((resolve, reject) => {
    req.session.regenerate((err) => {
      if (err) return reject(err);
      req.session.userId = user.id;
      req.session.save((saveErr) => saveErr ? reject(saveErr) : resolve());
    });
  });
}

router.post("/register", asyncHandler(async (req, res) => {
  const { name, password } = req.body || {};
  const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
  if (typeof name !== "string" || !name.trim() || name.trim().length > 100 || !emailValid(email) || typeof password !== "string" || password.length < 8 || Buffer.byteLength(password, "utf8") > 72 || password !== req.body.confirmPassword)
    return res.status(400).json({ error: "Provide a name, valid email, and matching password (8–72 characters)." });
  const hash = await bcrypt.hash(password, 12);
  let user;
  try {
    const result = await pool.query("INSERT INTO users (name,email,password_hash) VALUES ($1,$2,$3) RETURNING id,name,email", [name.trim(), email, hash]);
    user = result.rows[0];
  } catch (err) {
    if (err.code === "23505") return res.status(409).json({ error: "An account with that email already exists." });
    throw err;
  }
  await createSession(req, user);
  res.status(201).json({ user: publicUser(user) });
}));

router.post("/login", asyncHandler(async (req, res) => {
  const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
  const password = req.body?.password;
  if (!emailValid(email) || typeof password !== "string") return res.status(400).json({ error: "Enter your email and password." });
  const found = await pool.query("SELECT id, name, email, password_hash FROM users WHERE email = $1", [email]);
  const user = found.rows[0];
  if (!user || !(await bcrypt.compare(password, user.password_hash))) return res.status(401).json({ error: "Incorrect email or password." });
  await createSession(req, user);
  res.json({ user: publicUser(user) });
}));

router.get("/me", asyncHandler(async (req, res) => {
  if (!req.session?.userId) return res.json({ user: null });
  const result = await pool.query("SELECT id,name,email FROM users WHERE id = $1", [req.session.userId]);
  res.json({ user: result.rows[0] ? publicUser(result.rows[0]) : null });
}));

router.post("/logout", requireAuth, (req, res, next) => {
  req.session.destroy((err) => {
    if (err) return next(err);
    res.clearCookie("fogfern.sid", { path: "/" });
    res.json({ success: true });
  });
});
module.exports = router;
