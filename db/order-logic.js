"use strict";
function normalizeItems(input) {
  if (!Array.isArray(input) || input.length < 1 || input.length > 30) return null;
  const seen = new Set();
  const items = [];
  for (const item of input) {
    if (!item || typeof item.id !== "string" || !/^[a-z0-9-]{1,60}$/.test(item.id) || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 20 || seen.has(item.id)) return null;
    seen.add(item.id);
    items.push({ id: item.id, quantity: item.quantity });
  }
  return items;
}
function calculateTotals(items, byId) {
  const subtotal = items.reduce((sum, item) => sum + Number(byId.get(item.id).price_cents) * item.quantity, 0);
  const delivery = subtotal >= 7500 ? 0 : 800;
  return { subtotal, delivery, total: subtotal + delivery };
}
module.exports = { normalizeItems, calculateTotals };
