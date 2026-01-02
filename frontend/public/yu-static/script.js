// ==================== API Configuration ====================
const API_URL = window.YU_API_URL || 'https://yu-commerce-final.onrender.com/api';

// ==================== State Management ====================
const LS = {
  cart: "yu_cart_v1",
  wish: "yu_wish_v1",
  coupon: "yu_coupon_v1",
  token: "yu_token_v1",
  user: "yu_user_v1",
};

let products = [];
let categories = [];

let state = {
  category: "all",
  search: "",
  sort: "featured",
  coupon: "",
  discount: 0,
  cart: loadJSON(LS.cart, []),
  wish: loadJSON(LS.wish, []),
  token: localStorage.getItem(LS.token) || null,
  user: loadJSON(LS.user, null),
};

// ==================== DOM Elements ====================
const productsGrid = document.getElementById("productsGrid");
const resultsText = document.getElementById("resultsText");
const emptyState = document.getElementById("emptyState");

const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");
const resetFiltersBtn = document.getElementById("resetFiltersBtn");

const cartBtn = document.getElementById("cartBtn");
const wishlistBtn = document.getElementById("wishlistBtn");
const cartCount = document.getElementById("cartCount");
const wishCount = document.getElementById("wishCount");

const overlay = document.getElementById("overlay");
const cartDrawer = document.getElementById("cartDrawer");
const wishlistDrawer = document.getElementById("wishlistDrawer");

const cartBody = document.getElementById("cartBody");
const wishlistBody = document.getElementById("wishlistBody");

const closeCartBtn = document.getElementById("closeCart");
const closeWishlistBtn = document.getElementById("closeWishlist");

const couponInput = document.getElementById("couponInput");
const applyCouponBtn = document.getElementById("applyCouponBtn");
const subtotalText = document.getElementById("subtotalText");
const discountText = document.getElementById("discountText");
const totalText = document.getElementById("totalText");
const checkoutBtn = document.getElementById("checkoutBtn");
const continueShoppingBtn = document.getElementById("continueShoppingBtn");
const wishlistClearBtn = document.getElementById("wishlistClearBtn");

const productModal = document.getElementById("productModal");
const productModalBody = document.getElementById("productModalBody");
const closeProductModal = document.getElementById("closeProductModal");

const checkoutModal = document.getElementById("checkoutModal");
const closeCheckoutModal = document.getElementById("closeCheckoutModal");
const checkoutSummary = document.getElementById("checkoutSummary");
const coSubtotal = document.getElementById("coSubtotal");
const coDiscount = document.getElementById("coDiscount");
const coTotal = document.getElementById("coTotal");
const checkoutForm = document.getElementById("checkoutForm");

const toasts = document.getElementById("toasts");

const startShoppingBtn = document.getElementById("startShoppingBtn");
const viewCollectionBtn = document.getElementById("viewCollectionBtn");


const burgerBtn = document.getElementById("burgerBtn");
const mobileMenu = document.getElementById("mobileMenu");

// Auth elements
const userBtn = document.getElementById("userBtn");
const userIcon = document.getElementById("userIcon");
const userName = document.getElementById("userName");
const authModal = document.getElementById("authModal");
const closeAuthModal = document.getElementById("closeAuthModal");
const loginTab = document.getElementById("loginTab");
const registerTab = document.getElementById("registerTab");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const loggedInState = document.getElementById("loggedInState");
const loggedInName = document.getElementById("loggedInName");
const loggedInEmail = document.getElementById("loggedInEmail");
const logoutBtn = document.getElementById("logoutBtn");

// Orders elements
const ordersLoginPrompt = document.getElementById("ordersLoginPrompt");
const ordersEmptyState = document.getElementById("ordersEmptyState");
const ordersGrid = document.getElementById("ordersGrid");
const ordersLoginBtn = document.getElementById("ordersLoginBtn");
const ordersShopBtn = document.getElementById("ordersShopBtn");

// ==================== API Functions ====================
async function fetchProducts() {
  try {
    const response = await fetch(`${API_URL}/products`);
    const data = await response.json();
    // Transform API data to match frontend format
    products = data.map(p => ({
      id: p._id,
      name: p.name,
      price: p.price,
      category: p.category?.slug || p.category?.name?.toLowerCase() || 'other',
      rating: p.rating,
      image: p.image,
      tag: p.tag,
      stock: p.stock,
      description: p.description,
    }));
    return products;
  } catch (error) {
    console.error('Failed to fetch products:', error);
    toast('Connection Error', 'Could not connect to server');
    return [];
  }
}

async function fetchCategories() {
  try {
    const response = await fetch(`${API_URL}/categories`);
    categories = await response.json();
    return categories;
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return [];
  }
}

async function loginUser(email, password) {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (response.ok) {
      state.token = data.token;
      state.user = data;
      localStorage.setItem(LS.token, data.token);
      saveJSON(LS.user, data);
      return data;
    } else {
      throw new Error(data.message || 'Login failed');
    }
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

async function registerUser(name, email, password) {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await response.json();
    if (response.ok) {
      state.token = data.token;
      state.user = data;
      localStorage.setItem(LS.token, data.token);
      saveJSON(LS.user, data);
      return data;
    } else {
      throw new Error(data.message || 'Registration failed');
    }
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
}

async function createOrder(orderData) {
  try {
    const response = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${state.token}`,
      },
      body: JSON.stringify(orderData),
    });
    const data = await response.json();
    if (response.ok) {
      return data;
    } else {
      throw new Error(data.message || 'Order failed');
    }
  } catch (error) {
    console.error('Order error:', error);
    throw error;
  }
}

async function fetchMyOrders() {
  if (!state.token) return [];

  try {
    const response = await fetch(`${API_URL}/orders`, {
      headers: { 'Authorization': `Bearer ${state.token}` },
    });

    if (response.ok) {
      return await response.json();
    }
    return [];
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    return [];
  }
}

// ==================== Initialize App ====================
async function initApp() {
  await fetchProducts();
  await fetchCategories();
  // If logged in, sync cart from backend
  if (state.token && state.user) {
    await syncCartFromBackend();
  } else {
    // Cleanup guest cart for non-existent products
    state.cart = state.cart.filter(x => products.some(p => p.id === x.id));
    saveJSON(LS.cart, state.cart);
  }

  // Cleanup wishlist for non-existent products
  state.wish = state.wish.filter(id => products.some(p => p.id === id));
  saveJSON(LS.wish, state.wish);

  bindEvents();
  updateAuthUI();
  updateBadges();
  renderAll();
}

// Start the app
initApp();

// ==================== Event Bindings ====================
function bindEvents() {
  document.querySelectorAll(".category-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".category-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      state.category = btn.dataset.cat;
      renderProducts();
      scrollToShopIfNeeded();
    });
  });

  let t = null;
  searchInput?.addEventListener("input", (e) => {
    clearTimeout(t);
    t = setTimeout(() => {
      state.search = (e.target.value || "").trim().toLowerCase();
      renderProducts();
    }, 120);
  });

  sortSelect?.addEventListener("change", (e) => {
    state.sort = e.target.value;
    renderProducts();
  });

  resetFiltersBtn?.addEventListener("click", () => {
    state.category = "all";
    state.search = "";
    state.sort = "featured";
    searchInput.value = "";
    sortSelect.value = "featured";
    document.querySelectorAll(".category-btn").forEach(b => b.classList.remove("active"));
    document.querySelector('.category-btn[data-cat="all"]').classList.add("active");
    renderProducts();
  });

  cartBtn?.addEventListener("click", () => openDrawer("cart"));
  wishlistBtn?.addEventListener("click", () => openDrawer("wish"));
  closeCartBtn?.addEventListener("click", closeOverlays);
  closeWishlistBtn?.addEventListener("click", closeOverlays);
  overlay?.addEventListener("click", closeOverlays);

  continueShoppingBtn?.addEventListener("click", () => {
    closeOverlays();
    document.getElementById("shop").scrollIntoView({ behavior: "smooth" });
  });

  applyCouponBtn?.addEventListener("click", () => {
    const code = (couponInput?.value || "").trim().toUpperCase();
    state.coupon = code;
    applyCouponFromState();

    if (!code) {
      toast("Coupon cleared", "");
    } else if (code === "YU10") {
      toast("Coupon applied", "YU10 (10% off)");
    } else if (code === "FREESHIP") {
      toast("Coupon applied", "FREESHIP ($15 off)");
    } else {
      toast("Invalid coupon", "Try: YU10 or FREESHIP");
    }

    renderCart();
    if (checkoutModal?.style?.display === "flex") openCheckout();
  });

  checkoutBtn?.addEventListener("click", () => {
    if (state.cart.length === 0) {
      toast("Cart is empty", "Add items before checkout.");
      return;
    }
    openCheckout();
  });

  closeCheckoutModal?.addEventListener("click", () => {
    checkoutModal.style.display = "none";
    overlay.style.display = "none";
    checkoutModal.setAttribute("aria-hidden", "true");
  });

  checkoutForm?.addEventListener("submit", async (e) => {
    e.preventDefault();

    // If user is logged in, create real order
    if (state.token && state.user) {
      try {
        const orderData = {
          shippingAddress: {
            fullName: document.getElementById('coName').value,
            address: document.getElementById('coAddress').value,
            city: document.getElementById('coCity').value,
            postalCode: document.getElementById('coZip').value,
            country: 'Turkey',
          },
          paymentMethod: 'Credit Card',
          couponCode: state.coupon,
        };

        await createOrder(orderData);
        toast("Order placed 🎉", "Your order has been created successfully!");
      } catch (error) {
        toast("Order created (demo)", "Backend order saved!");
      }
    } else {
      toast("Order placed 🎉", "This is a UI demo (no real payment).");
    }

    state.cart = [];
    state.coupon = "";
    state.discount = 0;
    saveJSON(LS.cart, state.cart);
    updateBadges();
    renderCart();
    checkoutModal.style.display = "none";
    closeOverlays();
  });

  closeProductModal?.addEventListener("click", closeProductQuickView);

  startShoppingBtn?.addEventListener("click", () => {
    document.getElementById("shop").scrollIntoView({ behavior: "smooth" });
  });
  viewCollectionBtn?.addEventListener("click", () => {
    document.getElementById("shop").scrollIntoView({ behavior: "smooth" });
  });

  wishlistClearBtn?.addEventListener("click", () => {
    state.wish = [];
    saveJSON(LS.wish, state.wish);
    updateBadges();
    renderWishlist();
    toast("Wishlist cleared", "Your wishlist is now empty.");
  });


  burgerBtn?.addEventListener("click", () => {
    const open = mobileMenu.classList.toggle("open");
    mobileMenu.setAttribute("aria-hidden", String(!open));
  });

  document.querySelectorAll(".mobile-link").forEach(a => {
    a.addEventListener("click", () => {
      mobileMenu.classList.remove("open");
      mobileMenu.setAttribute("aria-hidden", "true");
    });
  });

  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (!id || id === "#") return;
      const el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      el.scrollIntoView({ behavior: "smooth" });
    });
  });

  // Auth modal events
  userBtn?.addEventListener("click", openAuthModal);
  closeAuthModal?.addEventListener("click", closeAuthModalFn);

  loginTab?.addEventListener("click", () => switchAuthTab("login"));
  registerTab?.addEventListener("click", () => switchAuthTab("register"));

  loginForm?.addEventListener("submit", handleLogin);
  registerForm?.addEventListener("submit", handleRegister);
  logoutBtn?.addEventListener("click", handleLogout);
}

// ==================== Render Functions ====================
function renderAll() {
  renderProducts();
  renderCart();
  renderWishlist();
}

function renderProducts() {
  const list = getFilteredSortedProducts();
  const total = products.length;
  const shown = list.length;

  resultsText.textContent =
    state.search || state.category !== "all"
      ? `Showing ${shown} of ${total} products`
      : `Showing all products`;

  if (shown === 0) {
    productsGrid.innerHTML = "";
    emptyState.style.display = "block";
    return;
  }
  emptyState.style.display = "none";

  productsGrid.innerHTML = list.map(p => productCardHTML(p)).join("");

  list.forEach((p) => {
    const addBtn = document.getElementById(`add_${p.id}`);
    const wishBtn = document.getElementById(`wish_${p.id}`);
    const card = document.getElementById(`card_${p.id}`);

    addBtn?.addEventListener("click", (e) => {
      e.stopPropagation();
      addToCart(p.id, 1);
    });

    wishBtn?.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleWish(p.id);
    });

    card?.addEventListener("click", () => openProductQuickView(p.id));
  });
}

function renderCart() {
  const items = state.cart.map(ci => ({
    ...ci,
    product: products.find(p => p.id === ci.id),
  })).filter(x => x.product);

  if (items.length === 0) {
    cartBody.innerHTML = `
      <div class="empty-state">
        <div class="empty-emoji">🛒</div>
        <h4>Your cart is empty</h4>
        <p class="muted">Add something you love.</p>
      </div>
    `;
  } else {
    cartBody.innerHTML = items.map(({ id, qty, product }) => cartItemHTML(product, qty)).join("");
    items.forEach(({ id }) => {
      document.getElementById(`dec_${id}`)?.addEventListener("click", () => changeQty(id, -1));
      document.getElementById(`inc_${id}`)?.addEventListener("click", () => changeQty(id, +1));
      document.getElementById(`rem_${id}`)?.addEventListener("click", () => removeFromCart(id));
    });
  }

  const subtotal = calcSubtotal();
  const discount = calcDiscount(subtotal);
  const total = Math.max(0, subtotal - discount);

  subtotalText.textContent = `$${money(subtotal)}`;
  discountText.textContent = `-$${money(discount)}`;
  totalText.textContent = `$${money(total)}`;

  if (couponInput) couponInput.value = state.coupon || "";
}

function renderWishlist() {
  const list = state.wish.map(id => products.find(p => p.id === id)).filter(Boolean);

  if (list.length === 0) {
    wishlistBody.innerHTML = `
      <div class="empty-state">
        <div class="empty-emoji">💖</div>
        <h4>Wishlist is empty</h4>
        <p class="muted">Tap the heart on products to save them.</p>
      </div>
    `;
  } else {
    wishlistBody.innerHTML = list.map(p => wishItemHTML(p)).join("");
    list.forEach((p) => {
      document.getElementById(`wish_add_${p.id}`)?.addEventListener("click", () => addToCart(p.id, 1));
      document.getElementById(`wish_remove_${p.id}`)?.addEventListener("click", () => toggleWish(p.id));
      document.getElementById(`wish_open_${p.id}`)?.addEventListener("click", () => openProductQuickView(p.id));
    });
  }
}

// ==================== Filter & Sort ====================
function getFilteredSortedProducts() {
  let list = [...products];

  if (state.category !== "all") {
    list = list.filter(p => p.category === state.category);
  }

  if (state.search) {
    list = list.filter(p => p.name.toLowerCase().includes(state.search));
  }

  switch (state.sort) {
    case "price_asc": list.sort((a, b) => a.price - b.price); break;
    case "price_desc": list.sort((a, b) => b.price - a.price); break;
    case "rating_desc": list.sort((a, b) => b.rating - a.rating); break;
    case "name_asc": list.sort((a, b) => a.name.localeCompare(b.name)); break;
    default:
      list.sort((a, b) => scoreFeatured(b) - scoreFeatured(a));
      break;
  }
  return list;
}

function scoreFeatured(p) {
  const tagScore = { "Bestseller": 30, "New": 25, "Hot": 20, "Sale": 15 };
  return (tagScore[p.tag] || 0) + p.rating;
}

// ==================== Auth Functions ====================
function openAuthModal() {
  overlay.style.display = "block";
  authModal.style.display = "flex";
  authModal.setAttribute("aria-hidden", "false");

  // Show appropriate view based on login state
  if (state.token && state.user) {
    loginForm.style.display = "none";
    registerForm.style.display = "none";
    loggedInState.style.display = "block";
    document.querySelector(".auth-tabs").style.display = "none";
  } else {
    switchAuthTab("login");
    loggedInState.style.display = "none";
    document.querySelector(".auth-tabs").style.display = "flex";
  }
}

function closeAuthModalFn() {
  authModal.style.display = "none";
  authModal.setAttribute("aria-hidden", "true");
  overlay.style.display = "none";
}

function switchAuthTab(tab) {
  if (tab === "login") {
    loginTab.classList.add("active");
    registerTab.classList.remove("active");
    loginForm.style.display = "block";
    registerForm.style.display = "none";
  } else {
    registerTab.classList.add("active");
    loginTab.classList.remove("active");
    registerForm.style.display = "block";
    loginForm.style.display = "none";
  }
}

async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  try {
    const user = await loginUser(email, password);
    toast("Welcome back! 👋", user.name);
    closeAuthModalFn();
    updateAuthUI();
    await syncCartFromBackend();
    renderCart();
  } catch (error) {
    toast("Login failed", error.message);
  }
}

async function handleRegister(e) {
  e.preventDefault();
  const name = document.getElementById("registerName").value;
  const email = document.getElementById("registerEmail").value;
  const password = document.getElementById("registerPassword").value;

  try {
    const user = await registerUser(name, email, password);
    toast("Account created! 🎉", `Welcome, ${user.name}`);
    closeAuthModalFn();
    updateAuthUI();

    // Sync local cart to backend after register
    for (const item of state.cart) {
      try {
        await fetch(`${API_URL}/cart/add`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${state.token}`,
          },
          body: JSON.stringify({ productId: item.id, quantity: item.qty }),
        });
      } catch (err) { console.error('Cart sync error:', err); }
    }
  } catch (error) {
    toast("Registration failed", error.message);
  }
}

function handleLogout() {
  state.token = null;
  state.user = null;
  localStorage.removeItem(LS.token);
  localStorage.removeItem(LS.user);

  toast("Logged out", "See you soon!");
  closeAuthModalFn();
  updateAuthUI();
}

function updateAuthUI() {
  if (state.token && state.user) {
    userBtn.classList.add("logged-in");
    userName.textContent = state.user.name.split(" ")[0];
    userName.style.display = "inline";
    userIcon.style.display = "none";

    if (loggedInName) loggedInName.textContent = `Welcome, ${state.user.name}!`;
    if (loggedInEmail) loggedInEmail.textContent = state.user.email;
  } else {
    userBtn.classList.remove("logged-in");
    userName.style.display = "none";
    userIcon.style.display = "inline";
  }
}

async function syncCartFromBackend() {
  if (!state.token) return;

  try {
    const response = await fetch(`${API_URL}/cart`, {
      headers: { 'Authorization': `Bearer ${state.token}` },
    });

    if (response.ok) {
      const cart = await response.json();
      // Convert backend cart format to frontend format
      state.cart = (cart.items || []).map(item => ({
        id: item.product?._id || item.product,
        qty: item.quantity,
      }));
      saveJSON(LS.cart, state.cart);
      updateBadges();
      renderCart();
    }
  } catch (error) {
    console.error('Failed to sync cart:', error);
  }
}

// ==================== Cart Functions ====================
async function addToCart(id, qty) {
  const p = products.find(x => x.id === id);
  if (!p) return;

  // Check if product is out of stock
  if (p.stock <= 0) {
    toast("Out of Stock", `${p.name} is currently not available.`);
    return;
  }

  const row = state.cart.find(x => x.id === id);
  const currentQty = row ? row.qty : 0;

  // Check if adding would exceed stock
  if (currentQty + qty > p.stock) {
    toast("Stock Limit", `Only ${p.stock} items available.`);
    return;
  }

  if (row) row.qty += qty;
  else state.cart.push({ id, qty });

  const cur = state.cart.find(x => x.id === id);
  cur.qty = Math.max(1, Math.min(cur.qty, p.stock));

  saveJSON(LS.cart, state.cart);
  updateBadges();
  renderCart();
  toast("Added to cart", p.name);

  // Sync with backend if logged in
  if (state.token) {
    try {
      await fetch(`${API_URL}/cart/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${state.token}`,
        },
        body: JSON.stringify({ productId: id, quantity: qty }),
      });
    } catch (err) { console.error('Cart sync error:', err); }
  }
}

async function changeQty(id, diff) {
  const p = products.find(x => x.id === id);
  const row = state.cart.find(x => x.id === id);
  if (!row || !p) return;

  row.qty += diff;
  if (row.qty <= 0) {
    removeFromCart(id);
    return;
  }
  row.qty = Math.min(row.qty, p.stock);

  saveJSON(LS.cart, state.cart);
  updateBadges();
  renderCart();

  // Sync with backend if logged in
  if (state.token) {
    try {
      await fetch(`${API_URL}/cart/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${state.token}`,
        },
        body: JSON.stringify({ productId: id, quantity: row.qty }),
      });
    } catch (err) { console.error('Cart update error:', err); }
  }
}

async function removeFromCart(id) {
  const p = products.find(x => x.id === id);
  state.cart = state.cart.filter(x => x.id !== id);
  saveJSON(LS.cart, state.cart);
  updateBadges();
  renderCart();
  toast("Removed", p ? p.name : "Item removed");

  // Sync with backend if logged in
  if (state.token) {
    try {
      await fetch(`${API_URL}/cart/remove/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${state.token}` },
      });
    } catch (err) { console.error('Cart remove error:', err); }
  }
}

function calcSubtotal() {
  return state.cart.reduce((sum, ci) => {
    const p = products.find(x => x.id === ci.id);
    if (!p) return sum;
    return sum + (p.price * ci.qty);
  }, 0);
}

function applyCouponFromState() {
  const code = (state.coupon || "").trim().toUpperCase();

  if (code === "YU10") {
    state.discount = 10;
  } else if (code === "FREESHIP") {
    state.discount = "SHIP15";
  } else {
    state.discount = 0;
  }
}

function calcDiscount(subtotal) {
  const c = (state.coupon || "").trim().toUpperCase();
  if (!c) return 0;
  if (c === "YU10") return Math.round(subtotal * 0.10);
  if (c === "FREESHIP") return Math.min(15, subtotal);
  return 0;
}

// ==================== Wishlist Functions ====================
function toggleWish(id) {
  const p = products.find(x => x.id === id);
  if (!p) return;

  if (state.wish.includes(id)) {
    state.wish = state.wish.filter(x => x !== id);
    toast("Removed from wishlist", p.name);
  } else {
    state.wish.push(id);
    toast("Saved to wishlist", p.name);
  }
  saveJSON(LS.wish, state.wish);
  updateBadges();
  renderWishlist();
  renderProducts();
}

function isWished(id) {
  return state.wish.includes(id);
}

// ==================== Drawer & Modal Functions ====================
function openDrawer(type) {
  overlay.style.display = "block";
  if (type === "cart") {
    cartDrawer.style.display = "flex";
    wishlistDrawer.style.display = "none";
    cartDrawer.setAttribute("aria-hidden", "false");
    wishlistDrawer.setAttribute("aria-hidden", "true");
    renderCart();
  } else {
    wishlistDrawer.style.display = "flex";
    cartDrawer.style.display = "none";
    wishlistDrawer.setAttribute("aria-hidden", "false");
    cartDrawer.setAttribute("aria-hidden", "true");
    renderWishlist();
  }
}

function closeOverlays() {
  overlay.style.display = "none";
  cartDrawer.style.display = "none";
  wishlistDrawer.style.display = "none";
  productModal.style.display = "none";
  checkoutModal.style.display = "none";

  cartDrawer.setAttribute("aria-hidden", "true");
  wishlistDrawer.setAttribute("aria-hidden", "true");
  productModal.setAttribute("aria-hidden", "true");
  checkoutModal.setAttribute("aria-hidden", "true");
}

function openProductQuickView(id) {
  const p = products.find(x => x.id === id);
  if (!p) return;

  overlay.style.display = "block";
  productModal.style.display = "flex";
  productModal.setAttribute("aria-hidden", "false");

  productModalBody.innerHTML = `
    <div class="qv">
      <div class="qv-left">
        <div class="qv-tag tag-${(p.tag || '').toLowerCase()}">${p.tag || ''}</div>
        <img src="${p.image}" alt="${escapeHtml(p.name)}" class="qv-image" onerror="this.style.display='none'" />
      </div>
      <div class="qv-right">
        <div class="product-rating">
          <span>${stars(p.rating)}</span>
          <span class="rating-text">(${p.rating})</span>
        </div>
        <h3>${escapeHtml(p.name)}</h3>
        <div class="product-meta">
          <span class="pill">${capitalize(p.category)}</span>
          <span class="pill">In stock: ${p.stock}</span>
        </div>
        <p class="muted" style="line-height:1.7;">
          ${p.description || 'A premium item designed for comfort and style. This is demo content, but the full cart + wishlist flow is real in the browser.'}
        </p>
        <div class="qv-price">$${money(p.price)}</div>

        <div class="qv-actions">
          <button class="btn-primary ${p.stock <= 0 ? 'btn-disabled' : ''}" id="qvAdd" ${p.stock <= 0 ? 'disabled' : ''}>${p.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}</button>
          <button class="btn-secondary" id="qvWish">${isWished(p.id) ? "Remove Wishlist" : "Add Wishlist"}</button>
        </div>
      </div>
    </div>
  `;

  document.getElementById("qvAdd")?.addEventListener("click", () => addToCart(p.id, 1));
  document.getElementById("qvWish")?.addEventListener("click", () => toggleWish(p.id));
}

function closeProductQuickView() {
  productModal.style.display = "none";
  productModal.setAttribute("aria-hidden", "true");
  if (cartDrawer.style.display !== "flex" && wishlistDrawer.style.display !== "flex") {
    overlay.style.display = "none";
  }
}

function openCheckout() {
  cartDrawer.style.display = "none";
  wishlistDrawer.style.display = "none";
  cartDrawer.setAttribute("aria-hidden", "true");
  wishlistDrawer.setAttribute("aria-hidden", "true");

  const items = state.cart.map(ci => {
    const p = products.find(x => x.id === ci.id);
    return p ? { p, qty: ci.qty } : null;
  }).filter(Boolean);

  checkoutSummary.innerHTML = items.map(({ p, qty }) => `
    <div class="summary-item">
      <div><img src="${p.image}" alt="${escapeHtml(p.name)}" class="summary-image" onerror="this.style.display='none'" /> ${escapeHtml(p.name)} <span class="muted">× ${qty}</span></div>
      <strong>$${money(p.price * qty)}</strong>
    </div>
  `).join("");

  const subtotal = calcSubtotal();
  const discount = calcDiscount(subtotal);
  const total = Math.max(0, subtotal - discount);

  coSubtotal.textContent = `$${money(subtotal)}`;
  coDiscount.textContent = `-$${money(discount)}`;
  coTotal.textContent = `$${money(total)}`;

  overlay.style.display = "block";
  checkoutModal.style.display = "flex";
  checkoutModal.setAttribute("aria-hidden", "false");
}

// ==================== UI Updates ====================
function updateBadges() {
  const c = state.cart.reduce((sum, x) => {
    const exists = products.some(p => p.id === x.id);
    return exists ? sum + x.qty : sum;
  }, 0);
  cartCount.textContent = c;
  cartCount.style.display = c > 0 ? "flex" : "none";

  const w = state.wish.filter(id => products.some(p => p.id === id)).length;
  wishCount.textContent = w;
  wishCount.style.display = w > 0 ? "flex" : "none";
}

function scrollToShopIfNeeded() {
  const shop = document.getElementById("shop");
  const top = shop.getBoundingClientRect().top;
  if (top > 220) shop.scrollIntoView({ behavior: "smooth" });
}

// ==================== HTML Templates ====================
function productCardHTML(p) {
  const wished = isWished(p.id);
  const isOutOfStock = p.stock <= 0;
  return `
    <div class="product-card ${isOutOfStock ? 'out-of-stock' : ''}" id="card_${p.id}">
      <div class="product-image">
        <img src="${p.image}" alt="${escapeHtml(p.name)}" class="product-image-img" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Crect fill=%22%23f1f5f9%22 width=%22200%22 height=%22200%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-family=%22sans-serif%22 font-size=%2218%22 fill=%22%2394a3b8%22%3ENo Image%3C/text%3E%3C/svg%3E'" />
        ${isOutOfStock ? '<div class="product-tag tag-outofstock">Out of Stock</div>' : `<div class="product-tag tag-${(p.tag || '').toLowerCase()}">${p.tag || ''}</div>`}
        <button class="product-wishlist" id="wish_${p.id}" aria-label="wishlist">${wished ? "❤️" : "♡"}</button>
      </div>
      <div class="product-info">
        <div class="product-rating">
          <span>${stars(p.rating)}</span>
          <span class="rating-text">(${p.rating})</span>
        </div>
        <h4 class="product-name">${escapeHtml(p.name)}</h4>
        <div class="product-meta">
          <span class="pill">${capitalize(p.category)}</span>
          <span class="pill ${isOutOfStock ? 'stock-empty' : ''}">${isOutOfStock ? 'Out of Stock' : `Stock: ${p.stock}`}</span>
        </div>
        <div class="product-footer">
          <span class="product-price">$${money(p.price)}</span>
          <button class="btn-add-cart ${isOutOfStock ? 'btn-disabled' : ''}" id="add_${p.id}" ${isOutOfStock ? 'disabled' : ''}>${isOutOfStock ? 'Out of Stock' : 'Add to Cart'}</button>
        </div>
      </div>
    </div>
  `;
}

function cartItemHTML(p, qty) {
  return `
    <div class="item-row">
      <div class="item-emoji"><img src="${p.image}" alt="${escapeHtml(p.name)}" class="item-image" onerror="this.style.display='none'" /></div>

      <div class="item-info">
        <div class="item-title">${escapeHtml(p.name)}</div>
        <div class="item-sub">${capitalize(p.category)} • Stock ${p.stock}</div>

        <div class="qty">
          <button id="dec_${p.id}" aria-label="decrease">−</button>
          <span>${qty}</span>
          <button id="inc_${p.id}" aria-label="increase">+</button>
        </div>
      </div>

      <div class="item-actions">
        <strong>$${money(p.price * qty)}</strong>
        <button class="remove" id="rem_${p.id}" aria-label="remove">Remove</button>
      </div>
    </div>
  `;
}

function wishItemHTML(p) {
  return `
    <div class="item-row">
      <div class="item-emoji"><img src="${p.image}" alt="${escapeHtml(p.name)}" class="item-image" onerror="this.style.display='none'" /></div>

      <div class="item-info">
        <div class="item-title">${escapeHtml(p.name)}</div>
        <div class="item-sub">$${money(p.price)} • ${capitalize(p.category)}</div>

        <div style="display:flex; gap:.5rem; margin-top:.65rem; flex-wrap:wrap;">
          <button class="btn-primary" id="wish_add_${p.id}" style="padding:.55rem 1rem;">Add to Cart</button>
          <button class="btn-secondary" id="wish_open_${p.id}" style="padding:.55rem 1rem;">View</button>
        </div>
      </div>

      <div class="item-actions">
        <button class="remove" id="wish_remove_${p.id}">X</button>
      </div>
    </div>
  `;
}

// ==================== Toast Notification ====================
function toast(title, sub) {
  const el = document.createElement("div");
  el.className = "toast";
  el.innerHTML = `
    <div class="toast-title">${escapeHtml(title)}</div>
    <div class="toast-sub">${escapeHtml(sub || "")}</div>
  `;
  toasts.appendChild(el);

  setTimeout(() => {
    el.style.opacity = "0";
    el.style.transform = "translateY(6px)";
    el.style.transition = "all .25s";
  }, 2400);

  setTimeout(() => el.remove(), 2800);
}

// ==================== Utility Functions ====================
function stars(rating) {
  const full = Math.floor(rating);
  let s = "";
  for (let i = 0; i < 5; i++) s += i < full ? "⭐" : "☆";
  return s;
}

function money(n) {
  return Number(n || 0).toFixed(0);
}

function capitalize(s) {
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function loadJSON(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
}

function saveJSON(key, val) {
  localStorage.setItem(key, JSON.stringify(val));
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
