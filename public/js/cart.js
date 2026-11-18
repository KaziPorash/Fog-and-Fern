"use strict";

// Browser bag stores only product IDs and counts; prices come from the live PostgreSQL catalog.
(() => {
  const app = window.FogFern;
  const storageKey = "fog-fern-cart-v1";
  let memoryBag = [];

  function sanitize(items) {
    if (!Array.isArray(items)) return [];
    const quantities = new Map();
    for (const item of items) {
      if (!item || !app.products.some((product) => product.id === item.id))
        continue;
      const quantity = Number(item.quantity);
      if (!Number.isInteger(quantity) || quantity < 1) continue;
      quantities.set(
        item.id,
        Math.min(20, (quantities.get(item.id) || 0) + quantity),
      );
    }
    return Array.from(quantities, ([id, quantity]) => ({ id, quantity }));
  }

  function getBag() {
    try {
      const saved = window.localStorage.getItem(storageKey);
      if (saved !== null) return sanitize(JSON.parse(saved));
    } catch (_error) {
      // A blocked browser store or damaged JSON must not break the storefront.
    }
    return sanitize(memoryBag);
  }

  function saveBag(items) {
    const clean = sanitize(items);
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(clean));
      memoryBag = clean;
      window.dispatchEvent(new Event("bagchange"));
      return true;
    } catch (_error) {
      app.notify(
        "Browser storage is unavailable. Please allow local storage to use the bag.",
      );
      return false;
    }
  }

  function addToBag(id, quantity = 1) {
    const product = app.products.find((entry) => entry.id === id);
    if (!product || product.stock < 1) { app.notify("This product is currently unavailable."); return; }
    const bag = getBag();
    const current = bag.find((item) => item.id === id);
    const nextQuantity = Math.min(
      product.stock, 20,
      Math.max(1, Math.floor(Number(quantity) || 1)),
    );
    if (current && current.quantity >= Math.min(20, product.stock)) {
      app.notify("You have reached the available quantity for this item.");
      return;
    }
    if (current)
      current.quantity = Math.min(20, product.stock, current.quantity + nextQuantity);
    else bag.push({ id, quantity: nextQuantity });
    if (saveBag(bag)) app.notify(`${product.name} added to your bag.`);
  }

  function updateQuantity(id, quantity) {
    const bag = getBag();
    const item = bag.find((entry) => entry.id === id);
    if (!item) return;
    item.quantity = Math.max(
      1,
      Math.min(20, Math.floor(Number(quantity) || 1)),
    );
    saveBag(bag);
  }

  function removeFromBag(id) {
    if (saveBag(getBag().filter((item) => item.id !== id)))
      app.notify("Item removed from your bag.");
  }

  function summarize(items = getBag()) {
    const clean = sanitize(items);
    const subtotal = clean.reduce((sum, item) => {
      const product = app.products.find((entry) => entry.id === item.id);
      return sum + product.price * item.quantity;
    }, 0);
    const delivery = subtotal === 0 || subtotal >= 7500 ? 0 : 800;
    return { items: clean, subtotal, delivery, total: subtotal + delivery };
  }

  function updateBadge() {
    const count = getBag().reduce((sum, item) => sum + item.quantity, 0);
    document.querySelectorAll("[data-cart-count]").forEach((badge) => {
      badge.textContent = count;
      badge
        .closest("a")
        .setAttribute(
          "aria-label",
          `Shopping bag, ${count} ${count === 1 ? "item" : "items"}`,
        );
    });
  }

  app.money = (cents) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100);
  app.bag = {
    get: getBag,
    save: saveBag,
    add: addToBag,
    update: updateQuantity,
    remove: removeFromBag,
    summarize,
    sanitize,
  };
  window.addEventListener("bagchange", updateBadge);
  window.addEventListener("storage", (event) => {
    if (event.key === storageKey || event.key === null)
      window.dispatchEvent(new Event("bagchange"));
  });
  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-add]");
    if (button) addToBag(button.dataset.add);
  });
  app.ready.then(() => { updateBadge(); window.dispatchEvent(new Event("bagchange")); }).catch(() => app.notify("The product database is unavailable."));
})();
