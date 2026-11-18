"use strict";
(() => {
  const app = window.FogFern;
  const content = document.getElementById("checkout-content");
  const form = document.getElementById("checkout-form");
  const fieldset = form.querySelector("fieldset[data-demo-fields]");
  const error = document.getElementById("checkout-error");
  const button = form.querySelector('[type="submit"]');

  function renderSummary() {
    const { items, subtotal, delivery, total } = app.bag.summarize();
    if (!items.length) {
      content.innerHTML = '<div class="empty-state"><h2>Let’s find your green first.</h2><p>Add a plant to your bag before checkout.</p><a class="button" href="/shop.html">Browse plants →</a></div>';
      return;
    }
    const summary = document.getElementById("checkout-summary");
    if (!summary) return;
    summary.replaceChildren();
    const heading = document.createElement("h2"); heading.textContent = "Your growing collection."; summary.append(heading);
    for (const item of items) {
      const p = app.products.find((entry) => entry.id === item.id);
      const row = document.createElement("div"); row.className = "summary-row";
      const name = document.createElement("span"); name.textContent = `${p.name} × ${item.quantity}`;
      const cost = document.createElement("span"); cost.textContent = app.money(p.price * item.quantity);
      row.append(name, cost); summary.append(row);
    }
    for (const [label, cost] of [["Subtotal", subtotal], ["Practice delivery", delivery], ["Estimated total", total]]) {
      const row = document.createElement("div"); row.className = `summary-row${label === "Estimated total" ? " summary-total" : ""}`;
      const a = document.createElement("span"); a.textContent = label;
      const b = document.createElement("span"); b.textContent = cost === 0 && label !== "Subtotal" ? "On us" : app.money(cost);
      row.append(a, b); summary.append(row);
    }
    const note = document.createElement("p"); note.className = "summary-note"; note.textContent = "Practice orders are saved in PostgreSQL. No payment or physical delivery is performed."; summary.append(note);
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const { items } = app.bag.summarize();
    if (!items.length) { renderSummary(); return; }
    button.disabled = true;
    error.textContent = "Saving your practice order...";
    try {
      const body = { ...Object.fromEntries(new FormData(form).entries()), items };
      const result = await app.api("/api/orders", { method: "POST", body: JSON.stringify(body) });
      // Order has already been committed; browser storage is just the temporary bag.
      app.bag.save([]);
      location.href = `/confirmation.html?order=${encodeURIComponent(result.order.id)}`;
    } catch (err) {
      error.textContent = err.message === "Please sign in to continue." ? "Please sign in before placing a practice order." : err.message;
    } finally { button.disabled = false; }
  });
  Promise.all([app.ready, app.authReady]).then(([, { user }]) => {
    renderSummary();
    if (!user) {
      error.innerHTML = 'Sign in first to save an order. <a href="/account/login.html?next=%2Fcheckout.html">Sign in</a> or <a href="/account/register.html?next=%2Fcheckout.html">create an account</a>.';
      fieldset.disabled = true;
    } else {
      document.getElementById("checkout-email").value = user.email;
      fieldset.disabled = false;
    }
  }).catch(() => { error.textContent = "The catalog is unavailable. Check the database connection."; });
  window.addEventListener("bagchange", () => { if (app.products.length) renderSummary(); });
})();
