"use strict";

// Optional static preview export. The classroom project runs via server.js.
const fs = require("node:fs");
const path = require("node:path");
const root = path.join(__dirname, "..");
fs.rmSync(path.join(root, "dist"), { recursive: true, force: true });
fs.cpSync(path.join(root, "public"), path.join(root, "dist"), {
  recursive: true,
});
console.log("Static preview copied to dist/.");
