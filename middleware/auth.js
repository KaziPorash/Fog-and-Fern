"use strict";
function requireAuth(req, res, next) {
  if (!req.session?.userId) return res.status(401).json({ error: "Please sign in to continue." });
  next();
}
function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}
module.exports = { requireAuth, asyncHandler };
