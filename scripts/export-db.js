"use strict";
// Creates the actual PostgreSQL dump after you set up .env and run the app.
require("dotenv").config();
const { spawnSync } = require("node:child_process");
const { openSync, closeSync } = require("node:fs");
const { resolve } = require("node:path");
const required = ["DB_USER", "DB_PASS", "DB_NAME", "DB_HOST", "DB_PORT"];
if (required.some((key) => !process.env[key])) {
  console.error("Set all DB_* variables in .env before exporting."); process.exit(1);
}
const out = resolve(__dirname, "..", "backup.sql");
const fd = openSync(out, "w");
const child = spawnSync("pg_dump", ["--host", process.env.DB_HOST, "--port", process.env.DB_PORT, "--username", process.env.DB_USER, "--format=p", "--no-owner", "--no-privileges", process.env.DB_NAME], {
  stdio: ["ignore", fd, "inherit"], env: { ...process.env, PGPASSWORD: process.env.DB_PASS }
});
closeSync(fd);
if (child.error || child.status !== 0) {
  require("node:fs").rmSync(out, { force: true });
  console.error("Export failed. Ensure pg_dump is installed and PostgreSQL is running."); process.exit(1);
}
console.log(`Wrote current PostgreSQL database dump: ${out}`);
