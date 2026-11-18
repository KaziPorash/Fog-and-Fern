"use strict";
(() => {
  const app = window.FogFern;
  const id = new URLSearchParams(location.search).get("order");
  const message = document.getElementById("confirmation-message");
  const container = document.getElementById("receipt");
  if (!id || !/^\d+$/.test(id)) { message.textContent = "No practice order selected. View your orders from your account."; return; }
  app.api(`/api/orders/${encodeURIComponent(id)}`).then(({ order }) => {
    message.textContent = `Your practice order #${order.id} was saved on ${new Date(order.created_at).toLocaleString()}.`;
    container.replaceChildren();
    const heading = document.createElement("h2"); heading.textContent = "Your saved collection"; container.append(heading);
    order.items.forEach((item) => {
      const row = document.createElement("p"); row.className = "summary-row";
      row.textContent = `${item.name} × ${item.quantity} · ${app.money(item.unitPrice * item.quantity)}`;
      container.append(row);
    });
    const total = document.createElement("p"); total.className = "summary-row summary-total";
    total.textContent = `Practice total including delivery: ${app.money(order.total_cents)}`;
    container.append(total);
  }).catch((err) => { message.textContent = `${err.message} Sign in to view your own practice orders.`; });
})();
