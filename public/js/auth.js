"use strict";
(() => {
  const app = window.FogFern;
  const form = document.querySelector('form[data-form-kind="login"], form[data-form-kind="register"]');
  if (!form) return;
  const kind = form.dataset.formKind;
  form.querySelector("fieldset[data-demo-fields]").disabled = false;
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const status = form.querySelector(".form-status");
    const button = form.querySelector('[type="submit"]');
    button.disabled = true;
    status.textContent = "Checking your details...";
    try {
      const payload = Object.fromEntries(new FormData(form));
      await app.api(`/api/auth/${kind}`, { method: "POST", body: JSON.stringify(payload) });
      const query = new URLSearchParams(location.search);
      const next = query.get("next");
      location.href = next === "/checkout.html" ? next : "/account/dashboard.html";
    } catch (error) {
      status.textContent = error.message;
      form.querySelectorAll('input[type="password"]').forEach((input) => { input.value = ""; });
    } finally { button.disabled = false; }
  });
})();
