const products = [
  {
    id: "btf-plus",
    name: "BTF+",
    subtitle: "The Best Deal in BTF!",
    description: "Unlock the full BTF+ experience and dominate the leaderboards.",
    priceLabel: "$14.99",
    status: "Available",
    badge: "Premium Value",
    features: [
      "Free custom pet",
      "Themes & backgrounds",
      "50 pet inventory",
      "VIP badge",
      "Monthly Luck Potions",
      "Beta testing access",
    ],
  },
  {
    id: "celestial-archon",
    name: "Celestial Archon",
    subtitle: "The Rarest Pet in BTF",
    description: "Unlock the ultimate pet and showcase your legendary status!",
    priceLabel: "$9.99 USD",
    status: "Available",
    badge: "Godly Rarity",
    features: ["One-time purchase", "Ultra-rare flex"],
  },
  {
    id: "unique-pet",
    name: "Unique Pet",
    subtitle: "1 in 22,222! Imagine that",
    description: "Flex on your friends with one of the rarest pets in the game!",
    priceLabel: "$4.99 USD",
    status: "Available",
    badge: "Unique Rarity",
    features: ["One-time purchase", "Head-turning rarity"],
  },
  {
    id: "chromatic-pet",
    name: "Chromatic Pet",
    subtitle: "Crazy rare, and gives you TONS of coins",
    description: "Obtain a chromatic pet - the most dazzling in the game!",
    priceLabel: "$0.99 USD",
    status: "Available",
    badge: "Chromatic Rarity",
    features: ["One-time purchase", "Coin monster"],
  },
  {
    id: "legendary-pet",
    name: "Legendary Pet",
    subtitle: "Infinity Golem - Ridiculously Rare",
    description: "Claim an Infinity Golem and prove your power!",
    priceLabel: "$0.49 USD",
    status: "Available",
    badge: "Legendary Rarity",
    features: ["One-time purchase", "Legendary aura"],
  },

];

const cart = [];

const gridEl = document.getElementById("product-grid");
const filtersEl = document.getElementById("filters");
const searchEl = document.getElementById("search");
const cartItemsEl = document.getElementById("cart-items");
const cartTotalsEl = document.getElementById("cart-totals");
const checkoutEl = document.getElementById("checkout");
const clearCartEl = document.getElementById("clear-cart");

function matchesSearch(product) {
  const term = searchEl.value.trim().toLowerCase();
  if (!term) return true;
  return (
    product.name.toLowerCase().includes(term) ||
    product.subtitle.toLowerCase().includes(term) ||
    (product.description || "").toLowerCase().includes(term)
  );
}

function filteredProducts() {
  return products.filter((p) => matchesSearch(p));
}

function renderProducts() {
  gridEl.innerHTML = "";
  const list = filteredProducts();
  if (!list.length) {
    const div = document.createElement("div");
    div.className = "empty";
    div.textContent = "No items match your filters.";
    gridEl.appendChild(div);
    return;
  }

  list.forEach((product) => {
    const tpl = document.getElementById("product-card-template");
    const node = tpl.content.cloneNode(true);
    const card = node.querySelector(".card");
    card.dataset.id = product.id;



    node.querySelector(".badge").textContent = product.badge || "";
    node.querySelector(".card__title").textContent = product.name;
    node.querySelector(".card__subtitle").textContent = product.subtitle;
    node.querySelector(".card__desc").textContent = product.description || "";

    const featList = node.querySelector(".features");
    featList.innerHTML = "";
    (product.features || []).forEach((f) => {
      const li = document.createElement("li");
      li.textContent = f;
      featList.appendChild(li);
    });

    node.querySelector(".price").textContent = product.priceLabel || "";
    node.querySelector(".status").textContent = product.status || "";

    const addBtn = node.querySelector(".add-btn");
    const disabled = product.comingSoon || product.locked;
    addBtn.textContent = disabled ? "Coming Soon" : "Add to cart";
    addBtn.disabled = disabled;
    addBtn.addEventListener("click", () => addToCart(product));

    gridEl.appendChild(node);
  });
}

function renderCart() {
  cartItemsEl.innerHTML = "";
  if (!cart.length) {
    cartItemsEl.innerHTML = '<p class="empty">Your cart is empty.</p>';
  } else {
    cart.forEach((item) => {
      const tpl = document.getElementById("cart-item-template");
      const node = tpl.content.cloneNode(true);
      node.querySelector(".cart-item__title").textContent = item.name;
      node.querySelector(".cart-item__meta").textContent = item.priceLabel;
      node.querySelector(".remove-btn").addEventListener("click", () => removeFromCart(item.id));
      cartItemsEl.appendChild(node);
    });
  }

  cartTotalsEl.innerHTML = `
    <span>Items</span>
    <strong>${cart.length}</strong>
  `;

  checkoutEl.textContent = "Checkout";
  checkoutEl.disabled = !cart.length;
}

function addToCart(product) {
  cart.push(product);
  renderCart();
  showToast(`${product.name} added`);
}

function removeFromCart(id) {
  const idx = cart.findIndex((c) => c.id === id);
  if (idx >= 0) cart.splice(idx, 1);
  renderCart();
}

function clearCart() {
  cart.length = 0;
  renderCart();
}

function showToast(message) {
  let toast = document.querySelector(".toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add("is-visible");
  setTimeout(() => toast.classList.remove("is-visible"), 1800);
}

const modal = document.getElementById("checkout-modal");
const modalClose = document.getElementById("modal-close");
const checkoutForm = document.getElementById("checkout-form");
const purchaseMessageField = document.getElementById("purchase-message");

function openCheckout() {
  if (!cart.length) {
    showToast("Your cart is empty");
    return;
  }
  const itemsList = cart.map((item) => `${item.name} (${item.priceLabel})`).join(", ");
  purchaseMessageField.value = `Items: ${itemsList}`;
  modal.classList.add("is-visible");
}

function closeCheckout() {
  modal.classList.remove("is-visible");
}

checkoutEl.addEventListener("click", openCheckout);
modalClose.addEventListener("click", closeCheckout);
modal.addEventListener("click", (e) => {
  if (e.target === modal) closeCheckout();
});

checkoutForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const formData = new FormData(checkoutForm);
  fetch("/", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(formData),
  })
    .then(() => {
      showToast("Purchase submitted! Check your email for a code.");
      clearCart();
      closeCheckout();
      checkoutForm.reset();
    })
    .catch(() => {
      showToast("Error submitting purchase. Try again.");
    });
});

searchEl.addEventListener("input", renderProducts);
clearCartEl.addEventListener("click", () => {
  clearCart();
  showToast("Cart cleared");
});

renderProducts();
renderCart();
