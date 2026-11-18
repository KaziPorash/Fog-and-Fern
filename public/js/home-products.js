"use strict";
(() => {
  const grid = document.querySelector(".home-products");
  if (!grid) return;
  const app = window.FogFern;
  app.ready.then((products) => {
    grid.replaceChildren();
    products.slice(0, 4).forEach((p) => {
      const card = document.createElement("article");
      card.className = "product-card";
      const photo = document.createElement("div");
      photo.className = "product-photo";
      const a = document.createElement("a");
      a.href = `/products/${encodeURIComponent(p.id)}.html`;
      const img = document.createElement("img");
      img.src = `/images/products/${p.image}`; img.alt = p.name; img.loading = "lazy";
      a.append(img);
      const badge = document.createElement("span"); badge.className = "product-badge"; badge.textContent = p.stock ? p.label : "Out of stock";
      const add = document.createElement("button"); add.type = "button"; add.className = "quick-add"; add.textContent = "+"; add.dataset.add = p.id; add.disabled = !p.stock; add.setAttribute("aria-label", `Add ${p.name} to bag`);
      photo.append(a, badge, add);
      const head = document.createElement("div"); head.className = "product-heading";
      const h = document.createElement("h3"); const link = document.createElement("a"); link.href = a.href; link.textContent = p.name; h.append(link);
      const price = document.createElement("span"); price.textContent = app.money(p.price); head.append(h, price);
      const subtitle = document.createElement("p"); subtitle.textContent = p.subtitle;
      card.append(photo, head, subtitle); grid.append(card);
    });
  }).catch(() => { grid.replaceChildren(); grid.textContent = "Products are temporarily unavailable. Check the database connection."; });
})();
