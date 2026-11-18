"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { normalizeItems, calculateTotals } = require("../db/order-logic");
test("accepts only unique, valid product IDs and quantities", () => {
  assert.deepEqual(normalizeItems([{ id: "monstera", quantity: 2 }]), [{ id: "monstera", quantity: 2 }]);
  assert.equal(normalizeItems([{ id: "monstera", quantity: 1 }, { id: "monstera", quantity: 1 }]), null);
  assert.equal(normalizeItems([{ id: "monstera", quantity: -1 }]), null);
  assert.equal(normalizeItems([{ id: "x';DROP TABLE", quantity: 1 }]), null);
  assert.equal(normalizeItems([{ id: "monstera", quantity: 21 }]), null);
  assert.equal(normalizeItems([]), null);
});
test("totals use database prices and free delivery at $75", () => {
  const products = new Map([["monstera", { price_cents: 3800 }], ["fern", { price_cents: 2600 }]]);
  assert.deepEqual(calculateTotals([{ id: "monstera", quantity: 1 }], products), { subtotal: 3800, delivery: 800, total: 4600 });
  assert.deepEqual(calculateTotals([{ id: "monstera", quantity: 2 }, { id: "fern", quantity: 1 }], products), { subtotal: 10200, delivery: 0, total: 10200 });
});
