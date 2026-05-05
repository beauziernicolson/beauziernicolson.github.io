// YANEX SHOP — Cart System
const CART_STORAGE_KEY = 'yanex_cart';

class CartManager {
  constructor() {
    this.items = this.loadCart();
    this.updateUI();
  }

  loadCart() {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load cart:', error);
      return [];
    }
  }

  saveCart() {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(this.items));
    } catch (error) {
      console.error('Failed to save cart:', error);
    }
  }

  addItem(product, quantity = 1, variant = null) {
    if (!product || !product.slug) return false;

    // For now, no variants, but structure for future
    const itemKey = variant ? `${product.slug}-${variant}` : product.slug;
    const existing = this.items.find(item => item.key === itemKey);

    if (existing) {
      existing.quantity += quantity;
    } else {
      this.items.push({
        key: itemKey,
        slug: product.slug,
        name: product.name,
        price: product.price,
        currency: product.currency || 'USD',
        image: product.image,
        variant: variant,
        quantity: quantity
      });
    }

    this.saveCart();
    this.updateUI();
    this.showToast('Item added to cart');
    this.animateAddToCart();
    return true;
  }

  removeItem(key) {
    this.items = this.items.filter(item => item.key !== key);
    this.saveCart();
    this.updateUI();
  }

  updateQuantity(key, quantity) {
    const item = this.items.find(item => item.key === key);
    if (item) {
      item.quantity = Math.max(1, quantity);
      this.saveCart();
      this.updateUI();
    }
  }

  getTotalItems() {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  getSubtotal() {
    return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  clearCart() {
    this.items = [];
    this.saveCart();
    this.updateUI();
  }

  getRelatedProductsHtml() {
    // Simple related products - get random products not in cart
    const cartSlugs = this.items.map(item => item.slug);
    const available = window.PRODUCTS ? window.PRODUCTS.filter(p => !cartSlugs.includes(p.slug)) : [];
    const related = available.sort(() => 0.5 - Math.random()).slice(0, 3);

    if (related.length === 0) return '';

    return `
      <div class="cart-related">
        <h4>You may also like</h4>
        <div class="cart-related-grid">
          ${related.map(p => `
            <div class="cart-related-item" onclick="addToCart('${p.slug}')">
              <img src="${p.image}" alt="${p.name}" loading="lazy">
              <div class="cart-related-info">
                <div class="cart-related-name">${p.name}</div>
                <div class="cart-related-price">${formatPrice(p.price, p.currency)}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  updateUI() {
    this.updateBadge();
    this.renderCart();
  }

  updateBadge() {
    const badge = document.getElementById('cart-badge');
    const count = this.getTotalItems();
    if (badge) {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'inline-block' : 'none';
    }
  }

  renderCart() {
    const content = document.getElementById('cart-content');
    const footer = document.getElementById('cart-footer');
    const subtotalEl = document.getElementById('cart-subtotal');

    if (!content) return;

    if (this.items.length === 0) {
      content.innerHTML = `
        <div class="cart-empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="m1 1 4 4h15l-1 5H6"></path>
          </svg>
          <p>Your cart is empty</p>
          <button class="btn btn-ghost" onclick="closeCart('categories')">Start shopping</button>
        </div>
      `;
      if (footer) footer.style.display = 'none';
      return;
    }

    content.innerHTML = this.items.map(item => `
      <div class="cart-item" data-key="${item.key}">
        <div class="cart-item-img">
          <img src="${item.image}" alt="${item.name}" loading="lazy">
        </div>
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          ${item.variant ? `<div class="cart-item-variant">${item.variant}</div>` : ''}
          <div class="cart-item-price">${formatPrice(item.price, item.currency)}</div>
          <div class="cart-item-controls">
            <div class="cart-quantity">
              <button class="cart-quantity-btn" onclick="cartManager.updateQuantity('${item.key}', ${item.quantity - 1})">-</button>
              <input type="number" class="cart-quantity-input" value="${item.quantity}" min="1"
                     onchange="cartManager.updateQuantity('${item.key}', parseInt(this.value) || 1)">
              <button class="cart-quantity-btn" onclick="cartManager.updateQuantity('${item.key}', ${item.quantity + 1})">+</button>
            </div>
            <button class="cart-remove" onclick="cartManager.removeItem('${item.key}')" title="Remove">×</button>
          </div>
        </div>
      </div>
    `).join('') + this.getRelatedProductsHtml();

    if (footer) {
      footer.style.display = 'block';
      if (subtotalEl) {
        subtotalEl.textContent = formatPrice(this.getSubtotal(), 'USD'); // Assuming USD for now
      }
    }
  }

  showToast(message) {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      top: 100px;
      right: 20px;
      background: var(--gold);
      color: #0b0b0d;
      padding: 12px 20px;
      border-radius: 8px;
      font-weight: 500;
      z-index: 300;
      transform: translateX(100%);
      transition: transform 0.3s ease;
    `;
    document.body.appendChild(toast);

    // Animate in
    setTimeout(() => toast.style.transform = 'translateX(0)', 10);

    // Remove after 3 seconds
    setTimeout(() => {
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  animateAddToCart() {
    // Simple animation - could be enhanced with flying animation
    const cartBtn = document.getElementById('cart-btn');
    if (cartBtn) {
      cartBtn.style.transform = 'scale(1.1)';
      setTimeout(() => cartBtn.style.transform = '', 200);
    }
  }
}

// Global cart instance
let cartManager;

// Cart UI functions
function openCart() {
  const drawer = document.getElementById('cart-drawer');
  const overlay = document.getElementById('cart-overlay');
  if (drawer) drawer.classList.add('open');
  if (overlay) overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCart(targetId) {
  const drawer = document.getElementById('cart-drawer');
  const overlay = document.getElementById('cart-overlay');
  if (drawer) drawer.classList.remove('open');
  if (overlay) overlay.classList.remove('open');
  document.body.style.overflow = '';

  if (targetId) {
    const target = document.getElementById(targetId);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      const currentPath = window.location.pathname.split('/').pop();
      if (currentPath === 'index.html' || currentPath === '') {
        location.hash = `#${targetId}`;
      } else {
        window.location.href = `index.html#${targetId}`;
      }
    }
  }
}

// Initialize cart when DOM ready
document.addEventListener('DOMContentLoaded', () => {
  cartManager = new CartManager();

  // Cart button
  const cartBtn = document.getElementById('cart-btn');
  if (cartBtn) cartBtn.addEventListener('click', openCart);

  // Close cart
  const closeBtn = document.getElementById('cart-close');
  const overlay = document.getElementById('cart-overlay');
  if (closeBtn) closeBtn.addEventListener('click', closeCart);
  if (overlay) overlay.addEventListener('click', closeCart);

  // Checkout
  const checkoutBtn = document.getElementById('checkout-btn');
  if (checkoutBtn) checkoutBtn.addEventListener('click', () => {
    // For now, show a message. In real app, this would redirect to checkout
    alert('Checkout functionality would be implemented here. For now, please contact us via WhatsApp for orders.');
  });

  // Close on escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeCart();
  });
});