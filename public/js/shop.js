"use strict";
(() => {
  const app = window.FogFern;
  const grid = document.getElementById("product-grid");
  const search = document.getElementById("plant-search");
  const sort = document.getElementById("sort");
  const filters = Array.from(document.querySelectorAll("[data-filter]"));
  const parameters = new URLSearchParams(window.location.search);
  let selected = parameters.get("collection") || "all";
  if (!filters.some((b) => b.dataset.filter === selected)) selected = "all";
  search.value = parameters.get("q") || "";
  let cards = [];

  function makeCard(product) {
    const card = document.createElement("article");
    card.className = "product-card";
    card.dataset.category = product.category;
    card.dataset.easy = String(product.label === "Easy care");
    card.dataset.id = product.id;
    card.dataset.name = product.name;
    card.dataset.price = product.price;
    const photo = document.createElement("div");
    photo.className = "product-photo";
    const link = document.createElement("a");
    link.href = `/products/${encodeURIComponent(product.id)}.html`;
    link.setAttribute("aria-label", `View ${product.name}`);
    const img = document.createElement("img");
    img.src = `/images/products/${product.image}`;
    img.alt = `${product.name} botanical product photograph`;
    img.width = 600;
    img.height = 700;
    img.loading = "lazy";
    link.appendChild(img);
    const badge = document.createElement("span");
    badge.className = "product-badge";
    badge.textContent = product.stock ? product.label : "Out of stock";
    const add = document.createElement("button");
    add.className = "quick-add";
    add.type = "button";
    add.dataset.add = product.id;
    add.textContent = "+";
    add.disabled = product.stock < 1;
    add.setAttribute("aria-label", `Add ${product.name} to bag`);
    photo.append(link, badge, add);
    const heading = document.createElement("div");
    heading.className = "product-heading";
    const h3 = document.createElement("h3");
    const textLink = document.createElement("a");
    textLink.href = link.href;
    textLink.textContent = product.name;
    h3.appendChild(textLink);
    const price = document.createElement("span");
    price.textContent = app.money(product.price);
    heading.append(h3, price);
    const desc = document.createElement("p");
    desc.textContent = product.subtitle;
    card.append(photo, heading, desc);
    return card;
  }

  function refreshCollection() {
    const query = search.value.trim().toLocaleLowerCase();
    const sorted = [...cards].sort((a, b) => {
      if (sort.value === "price-low") return Number(a.dataset.price) - Number(b.dataset.price);
      if (sort.value === "price-high") return Number(b.dataset.price) - Number(a.dataset.price);
      if (sort.value === "name") return a.dataset.name.localeCompare(b.dataset.name);
      return cards.indexOf(a) - cards.indexOf(b);
    });
    let visible = 0;
    sorted.forEach((card) => {
      const match = selected === "all" || card.dataset.category === selected || (selected === "easy-care" && card.dataset.easy === "true");
      card.hidden = !match || !card.dataset.name.toLocaleLowerCase().includes(query);
      if (!card.hidden) visible++;
      grid.appendChild(card);
    });
    filters.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.filter === selected)));
    document.getElementById("result-count").textContent = `${visible} ${visible === 1 ? "good thing" : "good things"} to grow with`;
    document.getElementById("no-results").hidden = visible > 0;
  }
  filters.forEach((button) => button.addEventListener("click", () => { selected = button.dataset.filter; refreshCollection(); }));
  search.addEventListener("input", refreshCollection);
  sort.addEventListener("change", refreshCollection);
  document.getElementById("reset-filters").addEventListener("click", () => {
    selected = "all"; search.value = ""; sort.value = "featured"; refreshCollection(); search.focus();
  });

  app.ready.then((products) => {
    grid.replaceChildren();
    cards = products.map(makeCard);
    refreshCollection();
  }).catch(() => {
    grid.replaceChildren();
    document.getElementById("result-count").textContent = "Catalog temporarily unavailable";
    document.getElementById("no-results").hidden = true;
    const p = document.createElement("p");
    p.setAttribute("role", "alert");
    p.textContent = "Couldn't load the products. Check the PostgreSQL connection and refresh.";
    grid.append(p);
  });
})();
