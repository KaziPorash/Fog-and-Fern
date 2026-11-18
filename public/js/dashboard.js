"use strict";
(() => {
  const app = window.FogFern;
  const greeting = document.getElementById("dashboard-greeting");
  const orders = document.getElementById("account-orders");
  app.authReady.then(async ({ user }) => {
    if (!user) { location.replace("/account/login.html"); return; }
    greeting.textContent = `Hello, ${user.name}!`;
    document.getElementById("dashboard-email").textContent = user.email;
    try {
      const data = await app.api("/api/orders");
      orders.replaceChildren();
      if (!data.orders.length) { orders.textContent = "No practice orders yet. Visit the shop to get started."; return; }
      data.orders.forEach((order) => {
        const row = document.createElement("div"); row.className = "summary-row";
        const a = document.createElement("a"); a.href = `/confirmation.html?order=${encodeURIComponent(order.id)}`;
        a.textContent = `Order #${order.id} · ${new Date(order.created_at).toLocaleDateString()}`;
        const total = document.createElement("strong"); total.textContent = app.money(order.total_cents);
        row.append(a, total); orders.append(row);
      });
    } catch (error) { orders.textContent = error.message; }
  });
  document.getElementById("account-logout").addEventListener("click", async () => {
    try { await app.api("/api/auth/logout", { method: "POST", body: "{}" }); location.href = "/account/login.html"; }
    catch (error) { app.notify(error.message); }
  });
})();
