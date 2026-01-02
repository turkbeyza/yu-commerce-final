// =====================================================
// YU Commerce - Admin Panel JavaScript
// Uses main page authentication (via localStorage)
// =====================================================

const API_URL = window.YU_API_URL || 'http://localhost:5000/api';

// LocalStorage keys - MUST match main page script.js
const LS = {
    token: "yu_token_v1",
    user: "yu_user_v1",
};

// State
let authToken = localStorage.getItem(LS.token);
let currentUser = null;
let products = [];
let categories = [];
let deleteProductId = null;

// Try to parse user from localStorage
try {
    currentUser = JSON.parse(localStorage.getItem(LS.user) || 'null');
} catch (e) {
    currentUser = null;
}

// DOM Elements
const accessDeniedSection = document.getElementById('accessDeniedSection');
const adminMain = document.getElementById('adminMain');
const adminRight = document.getElementById('adminRight');
const logoutBtn = document.getElementById('logoutBtn');
const adminUserName = document.getElementById('adminUserName');
const accessMessage = document.getElementById('accessMessage');

// =====================================================
// INITIALIZATION
// =====================================================

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setupEventListeners();
});

function checkAuth() {
    // Check if user is logged in AND is an admin
    if (authToken && currentUser) {
        if (currentUser.role === 'admin') {
            showAdminPanel();
            loadDashboard();
            loadCategories();
            loadProducts();
        } else {
            // Logged in but not admin
            showAccessDenied('Bu sayfa sadece admin kullanıcılar içindir. Şu an normal kullanıcı olarak giriş yaptınız.');
        }
    } else {
        // Not logged in at all
        showAccessDenied('Lütfen ana sayfadan admin@yucommerce.com ile giriş yapın.');
    }
}

function showAccessDenied(message) {
    accessDeniedSection.style.display = 'flex';
    adminMain.style.display = 'none';
    adminRight.style.display = 'none';
    if (accessMessage) accessMessage.textContent = message;
}

function showAdminPanel() {
    accessDeniedSection.style.display = 'none';
    adminMain.style.display = 'block';
    adminRight.style.display = 'flex';
    adminUserName.textContent = `👤 ${currentUser.name}`;
}

// =====================================================
// EVENT LISTENERS
// =====================================================

function setupEventListeners() {
    // Logout
    logoutBtn?.addEventListener('click', handleLogout);

    // Toggle add form
    document.getElementById('toggleAddForm')?.addEventListener('click', () => {
        const wrapper = document.getElementById('addFormWrapper');
        const icon = document.getElementById('toggleIcon');
        wrapper.classList.toggle('collapsed');
        icon.textContent = wrapper.classList.contains('collapsed') ? '▶' : '▼';
    });

    // Add product form
    document.getElementById('addProductForm')?.addEventListener('submit', handleAddProduct);

    // Edit product form
    document.getElementById('editProductForm')?.addEventListener('submit', handleEditProduct);

    // Stock form
    document.getElementById('stockForm')?.addEventListener('submit', handleUpdateStock);

    // Stock adjust buttons
    document.querySelectorAll('.btn-stock-adjust').forEach(btn => {
        btn.addEventListener('click', () => {
            const adjust = parseInt(btn.dataset.adjust);
            const newStockInput = document.getElementById('newStock');
            const currentValue = parseInt(newStockInput.value) || 0;
            newStockInput.value = Math.max(0, currentValue + adjust);
        });
    });

    // Search products
    document.getElementById('searchProducts')?.addEventListener('input', (e) => {
        filterProducts(e.target.value);
    });

    // Refresh button
    document.getElementById('refreshBtn')?.addEventListener('click', () => {
        loadProducts();
        loadDashboard();
    });

    // Modal close buttons
    document.getElementById('closeEditModal')?.addEventListener('click', closeEditModal);
    document.getElementById('cancelEdit')?.addEventListener('click', closeEditModal);
    document.getElementById('closeStockModal')?.addEventListener('click', closeStockModal);
    document.getElementById('cancelStock')?.addEventListener('click', closeStockModal);
    document.getElementById('cancelDelete')?.addEventListener('click', closeDeleteModal);
    document.getElementById('confirmDelete')?.addEventListener('click', handleDeleteProduct);

    // Overlay click to close modals
    document.getElementById('overlay')?.addEventListener('click', () => {
        closeEditModal();
        closeStockModal();
        closeDeleteModal();
    });
}

// =====================================================
// AUTHENTICATION
// =====================================================

function handleLogout() {
    // Clear auth from localStorage (same keys as main page)
    localStorage.removeItem(LS.token);
    localStorage.removeItem(LS.user);

    showToast('Çıkış yapıldı', 'success');

    // Redirect to main page after short delay
    setTimeout(() => {
        window.location.href = './index.html';
    }, 1000);
}

// =====================================================
// API CALLS
// =====================================================

async function loadDashboard() {
    try {
        const [statsRes, productsRes] = await Promise.all([
            fetch(`${API_URL}/admin/dashboard`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            }),
            fetch(`${API_URL}/products`)
        ]);

        const stats = await statsRes.json();
        const allProducts = await productsRes.json();

        // Update stats
        document.getElementById('totalProducts').textContent = stats.totalProducts || allProducts.length;
        document.getElementById('totalRevenue').textContent = `$${(stats.totalRevenue || 0).toLocaleString()}`;

        // Count low stock items
        const lowStock = allProducts.filter(p => p.stock <= 5).length;
        document.getElementById('lowStockCount').textContent = lowStock;

    } catch (error) {
        console.error('Failed to load dashboard:', error);
    }
}

async function loadCategories() {
    try {
        const res = await fetch(`${API_URL}/categories`);
        categories = await res.json();

        document.getElementById('totalCategories').textContent = categories.length;

        // Populate category dropdowns
        const categoryOptions = categories.map(c =>
            `<option value="${c._id}">${c.name}</option>`
        ).join('');

        document.getElementById('productCategory').innerHTML =
            '<option value="">Select category...</option>' + categoryOptions;
        document.getElementById('editCategory').innerHTML =
            '<option value="">Select category...</option>' + categoryOptions;

    } catch (error) {
        console.error('Failed to load categories:', error);
    }
}

async function loadProducts() {
    const tableBody = document.getElementById('productsTableBody');
    const tableLoading = document.getElementById('tableLoading');
    const tableEmpty = document.getElementById('tableEmpty');

    tableLoading.style.display = 'flex';
    tableBody.innerHTML = '';
    tableEmpty.style.display = 'none';

    try {
        const res = await fetch(`${API_URL}/products`);
        products = await res.json();

        tableLoading.style.display = 'none';

        if (products.length === 0) {
            tableEmpty.style.display = 'flex';
            return;
        }

        renderProducts(products);

    } catch (error) {
        tableLoading.style.display = 'none';
        showToast('Failed to load products', 'error');
    }
}

function renderProducts(productsToRender) {
    const tableBody = document.getElementById('productsTableBody');
    const tableEmpty = document.getElementById('tableEmpty');

    if (productsToRender.length === 0) {
        tableBody.innerHTML = '';
        tableEmpty.style.display = 'flex';
        return;
    }

    tableEmpty.style.display = 'none';

    tableBody.innerHTML = productsToRender.map(product => {
        const stockClass = product.stock <= 5 ? 'stock-low' : (product.stock <= 20 ? 'stock-medium' : 'stock-good');
        const categoryName = product.category?.name || 'Uncategorized';
        const imageDisplay = product.image?.startsWith('http')
            ? `<img src="${product.image}" alt="${product.name}" class="product-thumb" />`
            : `<span class="product-emoji">${product.image || '📦'}</span>`;

        return `
            <tr data-id="${product._id}">
                <td>${imageDisplay}</td>
                <td class="product-name-cell">${product.name}</td>
                <td><span class="category-pill">${categoryName}</span></td>
                <td class="price-cell">$${product.price.toFixed(2)}</td>
                <td>
                    <span class="stock-badge ${stockClass}" onclick="openStockModal('${product._id}')">
                        ${product.stock}
                    </span>
                </td>
                <td>
                    <span class="rating-display">⭐ ${product.rating?.toFixed(1) || '0.0'}</span>
                </td>
                <td>
                    ${product.tag ? `<span class="tag-badge tag-${product.tag.toLowerCase()}">${product.tag}</span>` : '-'}
                </td>
                <td class="actions-cell">
                    <button class="btn-action btn-edit" onclick="openEditModal('${product._id}')" title="Edit">✏️</button>
                    <button class="btn-action btn-stock" onclick="openStockModal('${product._id}')" title="Stock">📊</button>
                    <button class="btn-action btn-delete" onclick="openDeleteModal('${product._id}')" title="Delete">🗑️</button>
                </td>
            </tr>
        `;
    }).join('');
}

function filterProducts(query) {
    const filtered = products.filter(p =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        (p.category?.name || '').toLowerCase().includes(query.toLowerCase())
    );
    renderProducts(filtered);
}

// =====================================================
// PRODUCT CRUD OPERATIONS
// =====================================================

async function handleAddProduct(e) {
    e.preventDefault();

    const productData = {
        name: document.getElementById('productName').value,
        price: parseFloat(document.getElementById('productPrice').value),
        category: document.getElementById('productCategory').value,
        stock: parseInt(document.getElementById('productStock').value),
        rating: parseFloat(document.getElementById('productRating').value) || 0,
        image: document.getElementById('productImage').value || '📦',
        tag: document.getElementById('productTag').value,
        description: document.getElementById('productDescription').value
    };

    try {
        const res = await fetch(`${API_URL}/products`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(productData)
        });

        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.message || 'Failed to add product');
        }

        showToast('Ürün başarıyla eklendi!', 'success');
        document.getElementById('addProductForm').reset();
        loadProducts();
        loadDashboard();

    } catch (error) {
        showToast(error.message, 'error');
    }
}

async function handleEditProduct(e) {
    e.preventDefault();

    const productId = document.getElementById('editProductId').value;

    const productData = {
        name: document.getElementById('editName').value,
        price: parseFloat(document.getElementById('editPrice').value),
        category: document.getElementById('editCategory').value,
        stock: parseInt(document.getElementById('editStock').value),
        rating: parseFloat(document.getElementById('editRating').value) || 0,
        image: document.getElementById('editImage').value,
        tag: document.getElementById('editTag').value,
        description: document.getElementById('editDescription').value
    };

    try {
        const res = await fetch(`${API_URL}/products/${productId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(productData)
        });

        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.message || 'Failed to update product');
        }

        showToast('Ürün güncellendi!', 'success');
        closeEditModal();
        loadProducts();
        loadDashboard();

    } catch (error) {
        showToast(error.message, 'error');
    }
}

async function handleUpdateStock(e) {
    e.preventDefault();

    const productId = document.getElementById('stockProductId').value;
    const newStock = parseInt(document.getElementById('newStock').value);

    try {
        const res = await fetch(`${API_URL}/products/${productId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ stock: newStock })
        });

        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.message || 'Failed to update stock');
        }

        showToast('Stok güncellendi!', 'success');
        closeStockModal();
        loadProducts();
        loadDashboard();

    } catch (error) {
        showToast(error.message, 'error');
    }
}

async function handleDeleteProduct() {
    if (!deleteProductId) return;

    try {
        const res = await fetch(`${API_URL}/products/${deleteProductId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.message || 'Failed to delete product');
        }

        showToast('Ürün silindi!', 'success');
        closeDeleteModal();
        loadProducts();
        loadDashboard();

    } catch (error) {
        showToast(error.message, 'error');
    }
}

// =====================================================
// MODALS
// =====================================================

window.openEditModal = function (productId) {
    const product = products.find(p => p._id === productId);
    if (!product) return;

    document.getElementById('editProductId').value = product._id;
    document.getElementById('editName').value = product.name;
    document.getElementById('editPrice').value = product.price;
    document.getElementById('editCategory').value = product.category?._id || '';
    document.getElementById('editStock').value = product.stock;
    document.getElementById('editRating').value = product.rating || 0;
    document.getElementById('editImage').value = product.image || '';
    document.getElementById('editTag').value = product.tag || '';
    document.getElementById('editDescription').value = product.description || '';

    document.getElementById('editModal').classList.add('active');
    document.getElementById('overlay').style.display = 'block';
};

function closeEditModal() {
    document.getElementById('editModal').classList.remove('active');
    document.getElementById('overlay').style.display = 'none';
}

window.openStockModal = function (productId) {
    const product = products.find(p => p._id === productId);
    if (!product) return;

    document.getElementById('stockProductId').value = product._id;
    document.getElementById('stockProductName').textContent = product.name;
    document.getElementById('currentStock').value = product.stock;
    document.getElementById('newStock').value = product.stock;

    document.getElementById('stockModal').classList.add('active');
    document.getElementById('overlay').style.display = 'block';
};

function closeStockModal() {
    document.getElementById('stockModal').classList.remove('active');
    document.getElementById('overlay').style.display = 'none';
}

window.openDeleteModal = function (productId) {
    const product = products.find(p => p._id === productId);
    if (!product) return;

    deleteProductId = productId;
    document.getElementById('deleteProductName').textContent =
        `"${product.name}" ürününü silmek istediğinize emin misiniz?`;

    document.getElementById('deleteModal').classList.add('active');
    document.getElementById('overlay').style.display = 'block';
};

function closeDeleteModal() {
    document.getElementById('deleteModal').classList.remove('active');
    document.getElementById('overlay').style.display = 'none';
    deleteProductId = null;
}

// =====================================================
// TOAST NOTIFICATIONS
// =====================================================

function showToast(message, type = 'info') {
    const toasts = document.getElementById('toasts');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
    toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;

    toasts.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
