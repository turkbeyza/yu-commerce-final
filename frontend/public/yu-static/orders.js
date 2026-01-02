// ==================== API Configuration ====================
const API_URL = window.YU_API_URL || 'https://yu-commerce-final.onrender.com/api';

// ==================== State Management ====================
const LS = {
    cart: "yu_cart_v1",
    wish: "yu_wish_v1",
    token: "yu_token_v1",
    user: "yu_user_v1",
};

let products = [];
let orders = [];
let state = {
    cart: loadJSON(LS.cart, []),
    wish: loadJSON(LS.wish, []),
    token: localStorage.getItem(LS.token) || null,
    user: loadJSON(LS.user, null),
};

// ==================== DOM Elements ====================
const ordersLoginPrompt = document.getElementById("ordersLoginPrompt");
const ordersEmptyState = document.getElementById("ordersEmptyState");
const ordersGrid = document.getElementById("ordersGrid");
const toasts = document.getElementById("toasts");

const userBtn = document.getElementById("userBtn");
const userName = document.getElementById("userName");
const userIcon = document.getElementById("userIcon");
const cartCount = document.getElementById("cartCount");
const wishCount = document.getElementById("wishCount");

// Auth modal elements
const authModal = document.getElementById("authModal");
const closeAuthModal = document.getElementById("closeAuthModal");
const overlay = document.getElementById("overlay");
const loginTab = document.getElementById("loginTab");
const registerTab = document.getElementById("registerTab");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const loggedInState = document.getElementById("loggedInState");
const loggedInName = document.getElementById("loggedInName");
const loggedInEmail = document.getElementById("loggedInEmail");
const logoutBtn = document.getElementById("logoutBtn");

// ==================== Event Bindings ====================
function bindEvents() {
    userBtn?.addEventListener("click", openAuthModal);
    closeAuthModal?.addEventListener("click", closeAuthModalFn);
    overlay?.addEventListener("click", closeAuthModalFn);

    loginTab?.addEventListener("click", () => switchAuthTab("login"));
    registerTab?.addEventListener("click", () => switchAuthTab("register"));

    loginForm?.addEventListener("submit", handleLogin);
    registerForm?.addEventListener("submit", handleRegister);
    logoutBtn?.addEventListener("click", handleLogout);
}

// ==================== Auth Functions ====================
function openAuthModal() {
    overlay.style.display = "block";
    authModal.style.display = "flex";
    authModal.setAttribute("aria-hidden", "false");

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
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        if (response.ok) {
            const data = await response.json();
            state.token = data.token;
            state.user = data;
            localStorage.setItem(LS.token, data.token);
            localStorage.setItem(LS.user, JSON.stringify(data));

            toast("Welcome back! 👋", data.name);
            closeAuthModalFn();
            updateAuthUI();

            // Reload orders
            window.location.reload();
        } else {
            toast("Login failed", "Invalid credentials");
        }
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
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password }),
        });

        if (response.ok) {
            const data = await response.json();
            state.token = data.token;
            state.user = data;
            localStorage.setItem(LS.token, data.token);
            localStorage.setItem(LS.user, JSON.stringify(data));

            toast("Account created! 🎉", `Welcome, ${data.name}`);
            closeAuthModalFn();
            updateAuthUI();

            // Reload orders
            window.location.reload();
        } else {
            toast("Registration failed", "Please try again");
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

    // Redirect to home
    window.location.href = "index.html";
}

// ==================== API Functions ====================
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

async function fetchProducts() {
    try {
        const response = await fetch(`${API_URL}/products`);
        products = await response.json();
    } catch (err) {
        console.error("Failed to fetch products:", err);
    }
}

// ==================== Initialize ====================
async function initOrders() {
    await fetchProducts();
    bindEvents();
    updateAuthUI();
    updateBadges();

    if (!state.token || !state.user) {
        // Show login prompt
        ordersLoginPrompt.style.display = "block";
        ordersEmptyState.style.display = "none";
        ordersGrid.style.display = "none";
        return;
    }

    // Fetch orders
    orders = await fetchMyOrders();

    if (orders.length === 0) {
        // Show empty state
        ordersLoginPrompt.style.display = "none";
        ordersEmptyState.style.display = "block";
        ordersGrid.style.display = "none";
    } else {
        // Show orders
        ordersLoginPrompt.style.display = "none";
        ordersEmptyState.style.display = "none";
        ordersGrid.style.display = "block";
        renderOrders();
    }
}

// ==================== Render Functions ====================
function renderOrders() {
    ordersGrid.innerHTML = orders.map(order => orderCardHTML(order)).join("");
}

function orderCardHTML(order) {
    const date = new Date(order.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });

    return `
    <div class="order-card">
      <div class="order-header">
        <div class="order-info">
          <div class="order-number">Order #${order._id.slice(-8).toUpperCase()}</div>
          <div class="order-date">${date}</div>
        </div>
      </div>
      
      <div class="order-items">
        ${order.items.map(item => `
          <div class="order-item">
            <img src="${item.image}" alt="${escapeHtml(item.name)}" class="order-item-image" onerror="this.style.display='none'" />
            <div class="order-item-info">
              <div class="order-item-name">${escapeHtml(item.name)}</div>
              <div class="order-item-qty">Quantity: ${item.quantity}</div>
            </div>
            <div class="order-item-price">$${money(item.price * item.quantity)}</div>
          </div>
        `).join('')}
      </div>
      
      <div class="order-footer">
        <div class="order-total-label">Total Amount</div>
        <div class="order-total-amount">$${money(order.total)}</div>
      </div>
    </div>
  `;
}

// ==================== Update UI ====================
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

function updateBadges() {
    const c = state.cart.reduce((sum, x) => {
        const exists = products.some(p => (p._id || p.id) === x.id);
        return exists ? sum + x.qty : sum;
    }, 0);
    if (cartCount) {
        cartCount.textContent = c;
        cartCount.style.display = c > 0 ? "flex" : "none";
    }

    const w = state.wish.filter(id => products.some(p => (p._id || p.id) === id)).length;
    if (wishCount) {
        wishCount.textContent = w;
        wishCount.style.display = w > 0 ? "flex" : "none";
    }
}

// ==================== Utility Functions ====================
function money(n) {
    return Number(n || 0).toFixed(0);
}

function loadJSON(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch { return fallback; }
}

function escapeHtml(str) {
    return String(str)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

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

// Start the app
initOrders();
