"use strict";
(() => {
  const app = window.FogFern;
  const quantity = document.getElementById("product-quantity");
  const productId = document.querySelector("[data-product]")?.dataset.product;
  document.querySelectorAll("[data-quantity-change]").forEach((button) => {
    button.addEventListener("click", () => {
      quantity.value = Math.min(20, Math.max(1, (Number(quantity.value) || 1) + Number(button.dataset.quantityChange)));
    });
  });
  const add = document.getElementById("add-to-bag");
  add.disabled = true;
  app.ready.then((products) => {
    const product = products.find((p) => p.id === productId);
    if (!product) throw new Error("Product not found in database.");
    const price = document.querySelector(".detail-price");
    if (price) price.textContent = app.money(product.price);
    const heading = document.querySelector("h1"); if (heading) heading.textContent = product.name;
    const subtitle = document.querySelector(".detail-subtitle"); if (subtitle) subtitle.textContent = product.subtitle;
    const size = document.querySelector(".size-note"); if (size) size.textContent = product.size;
    const description = document.querySelector(".detail-subtitle + .detail-price + p"); if (description) description.textContent = product.description;
    const badge = document.querySelector(".detail-image .product-badge"); if (badge) badge.textContent = product.stock ? product.label : "Out of stock";
    const maxQty = Math.min(20, product.stock);
    quantity.max = String(Math.max(1, maxQty));
    add.disabled = maxQty < 1;
    quantity.value = "1";
    if (!maxQty) add.textContent = "Out of stock";
    document.querySelectorAll(".related-products .product-card").forEach((card) => {
      const related = products.find((p) => p.id === card.dataset.id);
      if (!related) { card.remove(); return; }
      const priceNode = card.querySelector(".product-heading span"); if (priceNode) priceNode.textContent = app.money(related.price);
      const badge = card.querySelector(".product-badge"); if (badge) badge.textContent = related.stock ? related.label : "Out of stock";
      const quick = card.querySelector("[data-add]"); if (quick) quick.disabled = !related.stock;
    });
    add.addEventListener("click", () => { if (quantity.reportValidity()) app.bag.add(productId, quantity.value); });
  }).catch(() => { add.disabled = true; app.notify("Unable to load this product from the database."); });
})();
