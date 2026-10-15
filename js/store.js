/**
 * DEV CYCLE - Central E-Commerce Store & State Management
 * Persistent Cart, Wishlist, Compare, and UI Notification Dispatcher
 */

class DevStore {
  constructor() {
    this.cartKey = 'devcycle_cart_v1';
    this.wishlistKey = 'devcycle_wishlist_v1';
    this.compareKey = 'devcycle_compare_v1';
    this.couponKey = 'devcycle_coupon_v1';

    this.cart = this.load(this.cartKey, []);
    this.wishlist = this.load(this.wishlistKey, []);
    this.compare = this.load(this.compareKey, []);
    this.appliedCoupon = this.load(this.couponKey, null);

    this.listeners = [];
  }

  load(key, defaultValue) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
      return defaultValue;
    }
  }

  save(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn("Storage quota exceeded", e);
    }
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify(eventType, payload) {
    this.listeners.forEach(fn => fn(eventType, payload));
    this.updateBadges();
  }

  formatINR(num) {
    if (typeof num !== 'number') return '₹0';
    return '₹' + num.toLocaleString('en-IN');
  }

  // ================= CART OPERATIONS =================
  addToCart(product, options = {}) {
    const selectedColor = options.color || (product.colors && product.colors[0]?.name) || "Standard";
    const cartItemId = `${product.id}_${selectedColor.replace(/\s+/g, '_')}`;

    const existingIndex = this.cart.findIndex(item => item.cartItemId === cartItemId);

    if (existingIndex > -1) {
      this.cart[existingIndex].quantity += 1;
    } else {
      this.cart.push({
        cartItemId,
        id: product.id,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice,
        image: product.image,
        brand: product.brand,
        color: selectedColor,
        quantity: 1,
        category: product.category
      });
    }

    this.save(this.cartKey, this.cart);
    this.notify('cart_updated', this.cart);
    this.showToast(`Added "${product.name}" to your cart!`, 'success');
  }

  updateCartQuantity(cartItemId, delta) {
    const item = this.cart.find(i => i.cartItemId === cartItemId);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
      this.removeFromCart(cartItemId, false);
      return;
    }

    this.save(this.cartKey, this.cart);
    this.notify('cart_updated', this.cart);
  }

  removeFromCart(cartItemId, notifyUser = true) {
    const item = this.cart.find(i => i.cartItemId === cartItemId);
    this.cart = this.cart.filter(i => i.cartItemId !== cartItemId);
    this.save(this.cartKey, this.cart);
    this.notify('cart_updated', this.cart);

    if (notifyUser && item) {
      this.showToast(`Removed "${item.name}" from cart`, 'info');
    }
  }

  clearCart() {
    this.cart = [];
    this.save(this.cartKey, this.cart);
    this.notify('cart_updated', this.cart);
    this.showToast("Shopping cart cleared", "info");
  }

  getCartCount() {
    return this.cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  getCartSubtotal() {
    return this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  getCartDiscount() {
    const subtotal = this.getCartSubtotal();
    if (this.appliedCoupon && this.appliedCoupon.code === 'DEVVIP10') {
      return Math.round(subtotal * 0.10);
    }
    return 0;
  }

  getCartTotal() {
    return Math.max(0, this.getCartSubtotal() - this.getCartDiscount());
  }

  applyCoupon(code) {
    const trimmed = (code || '').trim().toUpperCase();
    if (trimmed === 'DEVVIP10') {
      this.appliedCoupon = { code: 'DEVVIP10', discountPct: 10, name: 'VIP Launch Offer (10% Off)' };
      this.save(this.couponKey, this.appliedCoupon);
      this.notify('cart_updated', this.cart);
      this.showToast("Coupon 'DEVVIP10' applied! 10% discount added.", "success");
      return true;
    } else {
      this.showToast("Invalid promo code. Try 'DEVVIP10' for 10% off.", "error");
      return false;
    }
  }

  removeCoupon() {
    this.appliedCoupon = null;
    this.save(this.couponKey, null);
    this.notify('cart_updated', this.cart);
    this.showToast("Coupon removed", "info");
  }

  // ================= WISHLIST OPERATIONS =================
  toggleWishlist(product) {
    const exists = this.wishlist.some(item => item.id === product.id);

    if (exists) {
      this.wishlist = this.wishlist.filter(item => item.id !== product.id);
      this.save(this.wishlistKey, this.wishlist);
      this.notify('wishlist_updated', this.wishlist);
      this.showToast(`Removed "${product.name}" from wishlist`, 'info');
    } else {
      this.wishlist.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        brand: product.brand,
        category: product.category,
        badge: product.badge
      });
      this.save(this.wishlistKey, this.wishlist);
      this.notify('wishlist_updated', this.wishlist);
      this.showToast(`Saved "${product.name}" to wishlist!`, 'success');
    }
  }

  isInWishlist(productId) {
    return this.wishlist.some(item => item.id === productId);
  }

  getWishlistCount() {
    return this.wishlist.length;
  }

  // ================= PRODUCT COMPARISON =================
  toggleCompare(product) {
    const existsIndex = this.compare.findIndex(item => item.id === product.id);

    if (existsIndex > -1) {
      this.compare.splice(existsIndex, 1);
      this.save(this.compareKey, this.compare);
      this.notify('compare_updated', this.compare);
      this.showToast(`Removed "${product.name}" from comparison`, 'info');
    } else {
      if (this.compare.length >= 3) {
        this.showToast("You can compare up to 3 models simultaneously", "warning");
        return;
      }
      this.compare.push(product);
      this.save(this.compareKey, this.compare);
      this.notify('compare_updated', this.compare);
      this.showToast(`Added "${product.name}" to comparison matrix`, 'success');
    }
  }

  isInCompare(productId) {
    return this.compare.some(item => item.id === productId);
  }

  clearCompare() {
    this.compare = [];
    this.save(this.compareKey, this.compare);
    this.notify('compare_updated', this.compare);
    this.showToast("Comparison cleared", "info");
  }

  // ================= BADGE & UI SYNC =================
  updateBadges() {
    const cartCountEl = document.getElementById('cart-badge-count');
    const wishlistCountEl = document.getElementById('wishlist-badge-count');
    const compareFloatingEl = document.getElementById('compare-floating-bar');
    const compareCountEl = document.getElementById('compare-count-num');

    const cartCount = this.getCartCount();
    const wishlistCount = this.getWishlistCount();

    if (cartCountEl) {
      cartCountEl.textContent = cartCount;
      cartCountEl.style.display = cartCount > 0 ? 'inline-flex' : 'none';
    }

    if (wishlistCountEl) {
      wishlistCountEl.textContent = wishlistCount;
      wishlistCountEl.style.display = wishlistCount > 0 ? 'inline-flex' : 'none';
    }

    if (compareFloatingEl && compareCountEl) {
      compareCountEl.textContent = this.compare.length;
      if (this.compare.length > 0) {
        compareFloatingEl.classList.add('visible');
      } else {
        compareFloatingEl.classList.remove('visible');
      }
    }

    // Update wishlist heart buttons across current DOM
    document.querySelectorAll('[data-wishlist-id]').forEach(btn => {
      const pid = btn.getAttribute('data-wishlist-id');
      if (this.isInWishlist(pid)) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  // Toast Notification Engine
  showToast(message, type = 'info', duration = 3400) {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast-item toast-${type}`;

    let iconSvg = '';
    if (type === 'success') {
      iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`;
    } else if (type === 'warning') {
      iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;
    } else if (type === 'error') {
      iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;
    } else {
      iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;
    }

    toast.innerHTML = `
      <div class="toast-icon">${iconSvg}</div>
      <div class="toast-msg">${message}</div>
      <button class="toast-close">&times;</button>
    `;

    toast.querySelector('.toast-close').onclick = () => {
      toast.classList.add('hide');
      setTimeout(() => toast.remove(), 250);
    };

    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('show');
    }, 10);

    setTimeout(() => {
      if (toast.parentNode) {
        toast.classList.remove('show');
        toast.classList.add('hide');
        setTimeout(() => toast.remove(), 280);
      }
    }, duration);
  }
}

// Global instance
window.store = new DevStore();
