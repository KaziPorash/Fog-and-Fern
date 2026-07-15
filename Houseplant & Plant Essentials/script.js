"use strict";

/* =========================
   Element References
========================= */

const header = document.getElementById("header");
const menuButton = document.getElementById("menuButton");
const navMenu = document.getElementById("navMenu");
const navLinks = document.querySelectorAll(".nav-link");

const searchButton = document.getElementById("searchButton");
const searchOverlay = document.getElementById("searchOverlay");
const closeSearch = document.getElementById("closeSearch");
const searchInput = document.getElementById("searchInput");

const cartButton = document.getElementById("cartButton");
const cartSidebar = document.getElementById("cartSidebar");
const closeCart = document.getElementById("closeCart");
const pageOverlay = document.getElementById("pageOverlay");

const cartItemsContainer = document.getElementById("cartItems");
const emptyCart = document.getElementById("emptyCart");
const cartCount = document.getElementById("cartCount");
const cartTotal = document.getElementById("cartTotal");

const quickAddButtons = document.querySelectorAll(".quick-add-button");
const favoriteButtons = document.querySelectorAll(".favorite-button");

const toastNotification = document.getElementById("toastNotification");
const toastMessage = document.getElementById("toastMessage");

const newsletterForm = document.getElementById("newsletterForm");
const newsletterEmail = document.getElementById("newsletterEmail");
const newsletterMessage = document.getElementById("newsletterMessage");

const backToTop = document.getElementById("backToTop");
const currentYear = document.getElementById("currentYear");

let cart = [];

/* =========================
   Header Scroll Effect
========================= */

function handleHeaderScroll() {
    if (window.scrollY > 20) {
        header.classList.add("scrolled");
    } else {
        header.classList.remove("scrolled");
    }

    if (window.scrollY > 500) {
        backToTop.classList.add("show");
    } else {
        backToTop.classList.remove("show");
    }
}

window.addEventListener("scroll", handleHeaderScroll);

/* =========================
   Mobile Navigation
========================= */

function closeMobileMenu() {
    navMenu.classList.remove("active");

    menuButton.innerHTML = `
        <i class="fa-solid fa-bars"></i>
    `;
}

menuButton.addEventListener("click", () => {
    navMenu.classList.toggle("active");

    const menuIsOpen = navMenu.classList.contains("active");

    menuButton.innerHTML = menuIsOpen
        ? `<i class="fa-solid fa-xmark"></i>`
        : `<i class="fa-solid fa-bars"></i>`;
});

navLinks.forEach((link) => {
    link.addEventListener("click", () => {
        closeMobileMenu();
    });
});

/* =========================
   Active Navigation Link
========================= */

const sections = document.querySelectorAll("main section[id], footer[id]");

function updateActiveNavigation() {
    let currentSection = "home";

    sections.forEach((section) => {
        const sectionTop = section.offsetTop - 160;
        const sectionHeight = section.offsetHeight;

        if (
            window.scrollY >= sectionTop &&
            window.scrollY < sectionTop + sectionHeight
        ) {
            currentSection = section.id;
        }
    });

    navLinks.forEach((link) => {
        link.classList.remove("active");

        if (link.getAttribute("href") === `#${currentSection}`) {
            link.classList.add("active");
        }
    });
}

window.addEventListener("scroll", updateActiveNavigation);

/* =========================
   Search Modal
========================= */

function openSearchOverlay() {
    searchOverlay.classList.add("active");
    document.body.classList.add("no-scroll");

    setTimeout(() => {
        searchInput.focus();
    }, 200);
}

function closeSearchOverlay() {
    searchOverlay.classList.remove("active");
    document.body.classList.remove("no-scroll");
}

searchButton.addEventListener("click", openSearchOverlay);
closeSearch.addEventListener("click", closeSearchOverlay);

searchOverlay.addEventListener("click", (event) => {
    if (event.target === searchOverlay) {
        closeSearchOverlay();
    }
});

/* =========================
   Cart Sidebar
========================= */

function openCartSidebar() {
    cartSidebar.classList.add("active");
    pageOverlay.classList.add("active");
    document.body.classList.add("no-scroll");
}

function closeCartSidebar() {
    cartSidebar.classList.remove("active");
    pageOverlay.classList.remove("active");
    document.body.classList.remove("no-scroll");
}

cartButton.addEventListener("click", openCartSidebar);
closeCart.addEventListener("click", closeCartSidebar);
pageOverlay.addEventListener("click", closeCartSidebar);

/* =========================
   Add Products to Cart
========================= */

quickAddButtons.forEach((button) => {
    button.addEventListener("click", () => {
        const productCard = button.closest(".product-card");

        const product = {
            name: productCard.dataset.name,
            price: Number(productCard.dataset.price),
            image: productCard.dataset.image,
            quantity: 1
        };

        addToCart(product);
    });
});

function addToCart(product) {
    const existingProduct = cart.find(
        (item) => item.name === product.name
    );

    if (existingProduct) {
        existingProduct.quantity += 1;
    } else {
        cart.push(product);
    }

    updateCart();
    showToast(`${product.name} added to your cart.`);
}

/* =========================
   Update Cart Display
========================= */

function updateCart() {
    cartItemsContainer.innerHTML = "";

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart" id="emptyCart">
                <i class="fa-solid fa-seedling"></i>
                <h3>Your cart is empty</h3>
                <p>Add a few beautiful plants to your space.</p>
            </div>
        `;
    } else {
        cart.forEach((item, index) => {
            const cartItem = document.createElement("article");

            cartItem.className = "cart-item";

            cartItem.innerHTML = `
                <img
                    src="${item.image}"
                    alt="${item.name}"
                >

                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p>$${item.price.toFixed(2)}</p>

                    <div class="quantity-controls">
                        <button
                            type="button"
                            class="decrease-quantity"
                            data-index="${index}"
                            aria-label="Decrease quantity"
                        >
                            <i class="fa-solid fa-minus"></i>
                        </button>

                        <span>${item.quantity}</span>

                        <button
                            type="button"
                            class="increase-quantity"
                            data-index="${index}"
                            aria-label="Increase quantity"
                        >
                            <i class="fa-solid fa-plus"></i>
                        </button>
                    </div>
                </div>

                <button
                    type="button"
                    class="remove-item"
                    data-index="${index}"
                    aria-label="Remove ${item.name}"
                >
                    <i class="fa-solid fa-trash"></i>
                </button>
            `;

            cartItemsContainer.appendChild(cartItem);
        });
    }

    const totalQuantity = cart.reduce(
        (total, item) => total + item.quantity,
        0
    );

    const totalPrice = cart.reduce(
        (total, item) => total + item.price * item.quantity,
        0
    );

    cartCount.textContent = totalQuantity;
    cartTotal.textContent = `$${totalPrice.toFixed(2)}`;

    attachCartButtonEvents();
}

/* =========================
   Cart Quantity Controls
========================= */

function attachCartButtonEvents() {
    const increaseButtons =
        document.querySelectorAll(".increase-quantity");

    const decreaseButtons =
        document.querySelectorAll(".decrease-quantity");

    const removeButtons =
        document.querySelectorAll(".remove-item");

    increaseButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const index = Number(button.dataset.index);

            cart[index].quantity += 1;
            updateCart();
        });
    });

    decreaseButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const index = Number(button.dataset.index);

            if (cart[index].quantity > 1) {
                cart[index].quantity -= 1;
            } else {
                cart.splice(index, 1);
            }

            updateCart();
        });
    });

    removeButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const index = Number(button.dataset.index);
            const removedProduct = cart[index].name;

            cart.splice(index, 1);
            updateCart();

            showToast(`${removedProduct} removed from your cart.`);
        });
    });
}

/* =========================
   Favorite Buttons
========================= */

favoriteButtons.forEach((button) => {
    button.addEventListener("click", () => {
        button.classList.toggle("active");

        const icon = button.querySelector("i");
        const isActive = button.classList.contains("active");

        if (isActive) {
            icon.classList.remove("fa-regular");
            icon.classList.add("fa-solid");

            showToast("Plant added to your favorites.");
        } else {
            icon.classList.remove("fa-solid");
            icon.classList.add("fa-regular");

            showToast("Plant removed from your favorites.");
        }
    });
});

/* =========================
   Toast Notification
========================= */

let toastTimer;

function showToast(message) {
    clearTimeout(toastTimer);

    toastMessage.textContent = message;
    toastNotification.classList.add("show");

    toastTimer = setTimeout(() => {
        toastNotification.classList.remove("show");
    }, 2800);
}

/* =========================
   Testimonials
========================= */

const testimonials = [
    {
        text:
            "My monstera arrived in perfect condition and was even more beautiful than the photos. The care card made everything easy.",
        name: "Emily Martinez",
        location: "San Francisco, CA",
        initials: "EM"
    },
    {
        text:
            "Plant House helped me choose plants that work in my low-light apartment. Every plant is still growing beautifully months later.",
        name: "Daniel Kim",
        location: "Oakland, CA",
        initials: "DK"
    },
    {
        text:
            "The local delivery was fast, the packaging was thoughtful, and the snake plant looked incredibly healthy when it arrived.",
        name: "Sophia Williams",
        location: "Daly City, CA",
        initials: "SW"
    }
];

const testimonialText =
    document.getElementById("testimonialText");

const testimonialName =
    document.getElementById("testimonialName");

const testimonialLocation =
    document.getElementById("testimonialLocation");

const authorAvatar =
    document.getElementById("authorAvatar");

const previousTestimonial =
    document.getElementById("previousTestimonial");

const nextTestimonial =
    document.getElementById("nextTestimonial");

const testimonialDots =
    document.getElementById("testimonialDots");

let currentTestimonial = 0;

function createTestimonialDots() {
    testimonialDots.innerHTML = "";

    testimonials.forEach((testimonial, index) => {
        const dot = document.createElement("button");

        dot.className = "testimonial-dot";
        dot.setAttribute(
            "aria-label",
            `Show testimonial ${index + 1}`
        );

        if (index === currentTestimonial) {
            dot.classList.add("active");
        }

        dot.addEventListener("click", () => {
            currentTestimonial = index;
            updateTestimonial();
        });

        testimonialDots.appendChild(dot);
    });
}

function updateTestimonial() {
    const testimonial = testimonials[currentTestimonial];

    testimonialText.style.opacity = "0";

    setTimeout(() => {
        testimonialText.textContent = testimonial.text;
        testimonialName.textContent = testimonial.name;
        testimonialLocation.textContent = testimonial.location;
        authorAvatar.textContent = testimonial.initials;

        testimonialText.style.opacity = "1";
    }, 180);

    createTestimonialDots();
}

previousTestimonial.addEventListener("click", () => {
    currentTestimonial =
        (currentTestimonial - 1 + testimonials.length) %
        testimonials.length;

    updateTestimonial();
});

nextTestimonial.addEventListener("click", () => {
    currentTestimonial =
        (currentTestimonial + 1) % testimonials.length;

    updateTestimonial();
});

createTestimonialDots();

/* Automatically change testimonial every 6 seconds */

setInterval(() => {
    currentTestimonial =
        (currentTestimonial + 1) % testimonials.length;

    updateTestimonial();
}, 6000);

/* =========================
   Newsletter Form
========================= */

newsletterForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const email = newsletterEmail.value.trim();

    if (!isValidEmail(email)) {
        newsletterMessage.textContent =
            "Please enter a valid email address.";

        return;
    }

    newsletterMessage.textContent =
        "Thank you! You are now part of the Plant House community.";

    newsletterEmail.value = "";

    showToast("Newsletter subscription successful.");
});

function isValidEmail(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailPattern.test(email);
}

/* =========================
   Scroll Reveal Animation
========================= */

const revealElements = document.querySelectorAll(".reveal");

const revealObserver = new IntersectionObserver(
    (entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                observer.unobserve(entry.target);
            }
        });
    },
    {
        threshold: 0.12
    }
);

revealElements.forEach((element) => {
    revealObserver.observe(element);
});

/* =========================
   Back to Top
========================= */

backToTop.addEventListener("click", () => {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
});

/* =========================
   Keyboard Controls
========================= */

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        closeSearchOverlay();
        closeCartSidebar();
        closeMobileMenu();
    }
});

/* =========================
   Current Year
========================= */

currentYear.textContent = new Date().getFullYear();

/* Initial page state */

handleHeaderScroll();
updateActiveNavigation();
updateCart();