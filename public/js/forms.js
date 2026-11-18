"use strict";

(() => {
  document.querySelectorAll("[data-password-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      const input = document.getElementById(button.dataset.passwordToggle);
      const show = input.type === "password";
      input.type = show ? "text" : "password";
      input.toggleAttribute("data-password-visible", show);
      button.textContent = show ? "Hide password" : "Show password";
      button.setAttribute("aria-pressed", String(show));
    });
  });
  const password = document.getElementById("register-password");
  const confirmation = document.getElementById("confirm-password");
  if (password && confirmation) {
    const comparePasswords = () => {
      confirmation.setCustomValidity(
        confirmation.value && confirmation.value !== password.value
          ? "The passwords must match."
          : "",
      );
    };
    password.addEventListener("input", comparePasswords);
    confirmation.addEventListener("input", comparePasswords);
  }
})();
