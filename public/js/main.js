"use strict";
(() => {
  const app = window.FogFern;
  let toastTimer;
  app.notify = (message) => {
    const toast = document.getElementById("toast");
    if (!toast) return;
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add("is-visible");
    toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 3500);
  };
  app.api = async (url, options = {}) => {
    const response = await fetch(url, {
      credentials: "same-origin",
      ...options,
      headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || `Request failed (${response.status}).`);
    return result;
  };

  const menuButton = document.querySelector(".menu-toggle");
  const navigation = document.querySelector(".main-nav");
  if (menuButton && navigation) {
    const closeMenu = () => {
      navigation.classList.remove("is-open");
      menuButton.setAttribute("aria-expanded", "false");
      menuButton.setAttribute("aria-label", "Open navigation");
    };
    menuButton.addEventListener("click", () => {
      const opened = menuButton.getAttribute("aria-expanded") !== "true";
      menuButton.setAttribute("aria-expanded", String(opened));
      menuButton.setAttribute("aria-label", opened ? "Close navigation" : "Open navigation");
      navigation.classList.toggle("is-open", opened);
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && menuButton.getAttribute("aria-expanded") === "true") { closeMenu(); menuButton.focus(); }
    });
    document.addEventListener("click", (event) => { if (!event.target.closest(".site-header")) closeMenu(); });
  }

  app.authReady = app.api("/api/auth/me").catch(() => ({ user: null }));
  app.authReady.then(({ user }) => {
    if (!user) return;
    document.querySelectorAll('a[href="/account/login.html"]').forEach((a) => {
      a.href = "/account/dashboard.html";
      if (a.textContent.trim() === "Your account") a.textContent = "My account";
      if (a.getAttribute("aria-label") === "Sign in") a.setAttribute("aria-label", "My account");
    });
    const actions = document.querySelector(".header-actions");
    if (actions) {
      const logout = document.createElement("button");
      logout.type = "button";
      logout.className = "header-logout";
      logout.textContent = "Sign out";
      logout.addEventListener("click", async () => {
        try { await app.api("/api/auth/logout", { method: "POST", body: "{}" }); location.href = "/account/login.html"; }
        catch (error) { app.notify(error.message); }
      });
      actions.append(logout);
    }
  });

  document.querySelectorAll('form[data-form-kind="contact"], form[data-form-kind="newsletter"]').forEach((form) => {
    const kind = form.dataset.formKind;
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const status = form.querySelector(".form-status");
      const button = form.querySelector('[type="submit"]');
      status.textContent = "Saving...";
      button.disabled = true;
      try {
        const payload = Object.fromEntries(new FormData(form).entries());
        const response = await app.api(`/api/${kind === "contact" ? "contact" : "newsletter"}`, { method: "POST", body: JSON.stringify(payload) });
        status.textContent = response.message;
        form.reset();
      } catch (error) { status.textContent = error.message; }
      finally { button.disabled = false; }
    });
    form.querySelector("fieldset[data-demo-fields]")?.removeAttribute("disabled");
  });
})();
