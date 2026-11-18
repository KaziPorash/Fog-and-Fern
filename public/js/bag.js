"use strict";

(() => {
  const app = window.FogFern;
  const container = document.getElementById("cart-content");

  function renderBag() {
    const { items, subtotal, delivery, total } = app.bag.summarize();
    if (!items.length) {
      container.innerHTML = `<div class="empty-state"><p class="eyebrow">ROOM FOR SOMETHING GREEN</p><h2>Your bag is a little quiet.</h2><p>Find a new companion in the greenhouse.</p><a class="button" href="/shop.html">Find your plant →</a></div>`;
      return;
    }
    // Product content comes only from the fixed local catalog; quantities are sanitized.
    const rows = items
      .map((item) => {
        const product = app.products.find((entry) => entry.id === item.id);
        return `<article class="bag-item">
        <a href="/products/${product.id}.html"><img src="/images/products/${product.image}" alt="${product.name}" width="100" height="120"></a>
        <div><h2><a href="/products/${product.id}.html">${product.name}</a></h2><p>${app.money(product.price)} each</p>
          <div class="quantity-control"><button type="button" data-step="-1" data-id="${product.id}" aria-label="Decrease ${product.name} quantity">−</button><label class="sr-only" for="qty-${product.id}">${product.name} quantity</label><input id="qty-${product.id}" type="number" min="1" max="20" value="${item.quantity}" data-quantity="${product.id}" inputmode="numeric"><button type="button" data-step="1" data-id="${product.id}" aria-label="Increase ${product.name} quantity">+</button></div>
          <button type="button" class="remove-item" data-remove="${product.id}" aria-label="Remove ${product.name}">Remove</button></div>
        <strong>${app.money(product.price * item.quantity)}</strong>
      </article>`;
      })
      .join("");
    container.innerHTML = `<div class="cart-columns"><div><div aria-label="Items in your bag">${rows}</div><a class="text-link bag-back" href="/shop.html">← Keep exploring</a></div>
      <aside class="order-summary"><h2>A little recap.</h2><div class="summary-row"><span>Subtotal</span><span>${app.money(subtotal)}</span></div><div class="summary-row"><span>Demo delivery</span><span>${delivery ? app.money(delivery) : "On us"}</span></div><div class="summary-row summary-total"><span>Estimated total</span><span>${app.money(total)}</span></div><p class="summary-note">${subtotal < 7500 ? `Add ${app.money(7500 - subtotal)} more for free demo delivery.` : "Your demo delivery is on us."}</p><a class="button full-width" href="/checkout.html">Continue to checkout →</a><p class="summary-note">Practice orders are saved in PostgreSQL.<br>No payments or shipments.</p></aside></div>`;
  }

  container.addEventListener("click", (event) => {
    const remove = event.target.closest("[data-remove]");
    if (remove) {
      app.bag.remove(remove.dataset.remove);
      container.querySelector("a")?.focus();
      return;
    }
    const step = event.target.closest("[data-step]");
    if (!step) return;
    const item = app.bag.get().find((entry) => entry.id === step.dataset.id);
    if (!item) return;
    const selector = `[data-step="${step.dataset.step}"][data-id="${step.dataset.id}"]`;
    app.bag.update(item.id, item.quantity + Number(step.dataset.step));
    container.querySelector(selector)?.focus();
  });
  container.addEventListener("change", (event) => {
    if (!event.target.matches("[data-quantity]")) return;
    const id = event.target.dataset.quantity;
    app.bag.update(id, event.target.value);
    document.getElementById(`qty-${id}`)?.focus();
  });
  window.addEventListener("bagchange", renderBag);
  app.ready.then(renderBag).catch(() => { container.textContent = "Could not load bag products from the database. Please check PostgreSQL and refresh."; });
})();
