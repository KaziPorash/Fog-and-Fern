"use strict";
require("dotenv").config();
const express = require("express");
const session = require("express-session");
const PgSession = require("connect-pg-simple")(session);
const path = require("node:path");
const pool = require("./db/pool");

const app = express();
app.disable("x-powered-by");
if (process.env.NODE_ENV === "production") app.set("trust proxy", 1);
const portFlag = process.argv.indexOf("--port");
const previewPort = portFlag >= 0 ? process.argv[portFlag + 1] : undefined;
const port = Number(process.env.PORT || previewPort) || 3000;
if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32 || process.env.SESSION_SECRET.includes("replace_with")) {
  console.error("Set a random SESSION_SECRET (32+ characters) in .env before starting.");
  process.exit(1);
}
app.use(express.json({ limit: "32kb" }));
app.use("/api", (req, res, next) => {
  if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
    if (!req.is("application/json")) return res.status(415).json({ error: "Send JSON with Content-Type: application/json." });
    const origin = req.get("origin");
    if (origin) {
      let sameOrigin = false;
      try { sameOrigin = new URL(origin).host === req.get("host"); } catch (_) { /* invalid Origin */ }
      if (!sameOrigin) return res.status(403).json({ error: "Cross-origin updates are not allowed." });
    }
  }
  next();
});
app.use(session({
  store: new PgSession({ pool, tableName: "session", createTableIfMissing: false }),
  name: "fogfern.sid",
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 1000 * 60 * 60 * 24 * 7 },
}));
app.get("/api/health", async (_req, res) => {
  try { await pool.query("SELECT 1"); res.json({ status: "ok", database: "connected" }); }
  catch (_error) { res.status(503).json({ status: "error", database: "unavailable" }); }
});
app.use("/api/auth", require("./routes/auth"));
app.use("/api/products", require("./routes/products"));
app.use("/api", require("./routes/messages"));
app.use("/api/orders", require("./routes/orders"));
app.use("/api", (req, res) => res.status(404).json({ error: "API endpoint not found." }));
app.use(express.static(path.join(__dirname, "public")));
app.use((_req, res) => res.status(404).sendFile(path.join(__dirname, "public", "404.html")));
app.use((err, req, res, _next) => {
  console.error("Request failed:", err.message);
  const status = err.type === "entity.parse.failed" ? 400 : err.status || 500;
  if (req.path.startsWith("/api/")) return res.status(status).json({ error: status === 500 ? "Server error. Try again later." : "Invalid request." });
  res.status(500).send("Unexpected server error.");
});
if (require.main === module) {
  pool.query("SELECT 1 FROM products LIMIT 1")
    .then(() => app.listen(port, "0.0.0.0", () => console.log(`Fog & Fern: http://localhost:${port}`)))
    .catch((err) => { console.error("Database is not ready. Create/restore it before running npm start:", err.message); process.exitCode = 1; pool.end(); });
}
module.exports = app;
