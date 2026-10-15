/**
 * DEV CYCLE - Core Application Logic & UI Interactions
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize 3D Showroom WebGL Engine
  init3DStudio();

  // 2. Render Products into sections
  renderBicyclesSection();
  renderEBikesSection();
  renderGymSection();
  renderAccessoriesSection();
  renderBrandsGrid();
  renderTestimonials();
  renderFAQ();

  // 3. Initialize Global Navigation & Scroll Effects
  initNavbarScroll();
  initMegaMenu();
  initMobileMenu();

  // 4. Initialize Modals, Drawers & Forms
  initCartDrawer();
  initWishlistDrawer();
  initSearchModal();
  initQuickViewModal();
  initCompareModal();
  initTestRideModal();
  initCheckoutModal();
  initNewsletter();
  initWhatsAppWidget();

  // 5. Initial badge sync
  window.store.updateBadges();

  // 6. Refresh icons if Lucide is available
  if (window.lucide) {
    window.lucide.createIcons();
  }
});

// ================= 1. 3D STUDIO INITIALIZATION =================
function init3DStudio() {
  // Hero 3D Background Canvas
  const heroContainer = document.getElementById('hero-3d-canvas');
  if (heroContainer) {
    window.hero3D = new BicycleShowroom3D('hero-3d-canvas', {
      autoRotate: true,
      enableZoom: false,
      showGrid: true,
      initialColor: '#111315',
      accentColor: '#10b981'
    });
  }

  // Studio 3D Configurator Canvas
  const studioContainer = document.getElementById('studio-3d-canvas');
  if (studioContainer) {
    window.studio3D = new BicycleShowroom3D('studio-3d-canvas', {
      autoRotate: true,
      enableZoom: true,
      showGrid: true,
      initialColor: '#111315',
      accentColor: '#10b981'
    });
  }

  // Setup color customizer buttons in the 3D spotlight section
  const swatches = document.querySelectorAll('.color-swatch-btn');
  swatches.forEach(btn => {
    btn.addEventListener('click', () => {
      swatches.forEach(s => s.classList.remove('active'));
      btn.classList.add('active');

      const hex = btn.getAttribute('data-color');
      const name = btn.getAttribute('data-name');
      if (window.studio3D) {
        window.studio3D.setBicycleColor(hex, name);
      }
      if (window.hero3D) {
        window.hero3D.setBicycleColor(hex, name);
      }
    });
  });

  // Setup camera angle presets
  const angleBtns = document.querySelectorAll('.angle-preset-btn');
  angleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      angleBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const preset = btn.getAttribute('data-preset');
      if (window.studio3D) {
        window.studio3D.setCameraPreset(preset);
      }
    });
  });

  // Setup Hero 360 Spin toggle button
  const heroSpinBtn = document.getElementById('btn-toggle-spin');
  if (heroSpinBtn) {
    heroSpinBtn.addEventListener('click', () => {
      if (window.hero3D) {
        const rotating = window.hero3D.toggleRotation();
        heroSpinBtn.classList.toggle('active', rotating);
        heroSpinBtn.innerHTML = rotating ? `
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
          Pause 360°
        ` : `
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          Auto Rotate 360°
        `;
      }
    });
  }

  // Setup Studio 360 Spin toggle button
  const studioSpinBtn = document.getElementById('btn-studio-spin');
  if (studioSpinBtn) {
    studioSpinBtn.addEventListener('click', () => {
      if (window.studio3D) {
        const rotating = window.studio3D.toggleRotation();
        studioSpinBtn.classList.toggle('active', rotating);
        studioSpinBtn.innerHTML = rotating ? `
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
          360° Studio Orbit
        ` : `
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          Resume 360° Orbit
        `;
      }
    });
  }

  // Add Configured 3D Bike directly to cart
  const addConfiguredBtn = document.getElementById('btn-add-configured-bike');
  if (addConfiguredBtn) {
    addConfiguredBtn.addEventListener('click', () => {
      const activeColor = document.getElementById('active-color-name')?.textContent || "Stealth Onyx";
      const flagshipBike = window.PRODUCTS_DATA.find(p => p.id === 'bike-01');
      if (flagshipBike) {
        window.store.addToCart(flagshipBike, { color: activeColor });
        openCartDrawer();
      }
    });
  }
}

// ================= 2. PRODUCT CARDS & RENDERING =================
function createProductCardHTML(p) {
  const isWishlisted = window.store.isInWishlist(p.id);
  const isCompared = window.store.isInCompare(p.id);

  // Generate color circles
  const colorsHtml = (p.colors || []).map(c => 
    `<span class="card-color-dot" style="background-color: ${c.hex};" title="${c.name}"></span>`
  ).join('');

  // Primary spec highlight
  let specHighlight = '';
  if (p.specs.weight) {
    specHighlight = `<span class="spec-pill">⚖️ ${p.specs.weight}</span>`;
  }
  if (p.specs.groupset) {
    specHighlight += `<span class="spec-pill">⚙️ ${p.specs.groupset.split(' ')[0]}</span>`;
  }
  if (p.specs.motorPower) {
    specHighlight = `<span class="spec-pill">⚡ ${p.specs.motorPower.split(' ')[0]}</span><span class="spec-pill">🔋 ${p.specs.range.split(' ')[0]} km</span>`;
  }
  if (p.specs.beltSurface) {
    specHighlight = `<span class="spec-pill">🏃 Non-Motorized</span>`;
  }

  return `
    <article class="product-card" data-product-id="${p.id}">
      <div class="card-media-wrap">
        ${p.badge ? `<span class="card-badge">${p.badge}</span>` : ''}
        <button class="card-action-btn btn-wishlist ${isWishlisted ? 'active' : ''}" data-wishlist-id="${p.id}" title="Save to Wishlist">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="${isWishlisted ? '#10b981' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
        </button>
        <button class="card-action-btn btn-quickview" data-quickview-id="${p.id}" title="Quick View Specs">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
        </button>
        <img src="${p.image}" alt="${p.name}" class="product-img" loading="lazy">
        <div class="card-overlay-actions">
          <button class="btn-quick-add" data-add-cart-id="${p.id}">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            ADD TO CART
          </button>
        </div>
      </div>
      <div class="card-body">
        <div class="card-meta">
          <span class="card-brand">${p.brand}</span>
          <div class="card-rating">
            <span class="star-icon">★</span>
            <span class="rating-val">${p.rating}</span>
            <span class="reviews-count">(${p.reviewsCount})</span>
          </div>
        </div>
        <h3 class="card-title" data-quickview-id="${p.id}">${p.name}</h3>
        <div class="card-specs-row">${specHighlight}</div>
        <div class="card-colors-row">${colorsHtml}</div>
        <div class="card-pricing-row">
          <div class="price-wrap">
            <span class="current-price">${window.store.formatINR(p.price)}</span>
            ${p.originalPrice ? `<span class="orig-price">${window.store.formatINR(p.originalPrice)}</span>` : ''}
          </div>
          <button class="btn-compare-toggle ${isCompared ? 'active' : ''}" data-compare-id="${p.id}" title="Compare specifications">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
            ${isCompared ? 'Comparing' : 'Compare'}
          </button>
        </div>
      </div>
    </article>
  `;
}

function attachCardListeners(parentEl) {
  // Add to cart
  parentEl.querySelectorAll('[data-add-cart-id]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const pid = btn.getAttribute('data-add-cart-id');
      const product = window.PRODUCTS_DATA.find(p => p.id === pid);
      if (product) {
        window.store.addToCart(product);
        openCartDrawer();
      }
    });
  });

  // Toggle wishlist
  parentEl.querySelectorAll('[data-wishlist-id]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const pid = btn.getAttribute('data-wishlist-id');
      const product = window.PRODUCTS_DATA.find(p => p.id === pid);
      if (product) {
        window.store.toggleWishlist(product);
      }
    });
  });

  // Quick View
  parentEl.querySelectorAll('[data-quickview-id]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const pid = el.getAttribute('data-quickview-id');
      openQuickView(pid);
    });
  });

  // Compare toggle
  parentEl.querySelectorAll('[data-compare-id]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const pid = btn.getAttribute('data-compare-id');
      const product = window.PRODUCTS_DATA.find(p => p.id === pid);
      if (product) {
        window.store.toggleCompare(product);
        btn.classList.toggle('active', window.store.isInCompare(pid));
        btn.innerHTML = `
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
          ${window.store.isInCompare(pid) ? 'Comparing' : 'Compare'}
        `;
      }
    });
  });
}

function renderBicyclesSection(filterCategory = 'all') {
  const container = document.getElementById('bicycles-grid');
  if (!container) return;

  const cycles = window.PRODUCTS_DATA.filter(p => p.category === 'cycles');
  const filtered = filterCategory === 'all' 
    ? cycles 
    : cycles.filter(p => p.subCategory.toLowerCase().includes(filterCategory.toLowerCase()));

  container.innerHTML = filtered.map(createProductCardHTML).join('');
  attachCardListeners(container);

  // Filter tabs
  const tabBtns = document.querySelectorAll('.filter-tab-cycle');
  tabBtns.forEach(tab => {
    tab.onclick = () => {
      tabBtns.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderBicyclesSection(tab.getAttribute('data-filter'));
    };
  });
}

function renderEBikesSection() {
  const container = document.getElementById('ebikes-grid');
  if (!container) return;

  const ebikes = window.PRODUCTS_DATA.filter(p => p.category === 'electric-cycles');
  container.innerHTML = ebikes.map(createProductCardHTML).join('');
  attachCardListeners(container);
}

function renderGymSection(filter = 'all') {
  const container = document.getElementById('gym-grid');
  if (!container) return;

  const gym = window.PRODUCTS_DATA.filter(p => p.category === 'gym');
  const filtered = filter === 'all' 
    ? gym 
    : (filter === 'cardio' ? gym.filter(p => p.subCategory.includes('Treadmill') || p.subCategory.includes('Exercise'))
    : gym.filter(p => p.subCategory.includes('Rack') || p.subCategory.includes('Packages')));

  container.innerHTML = filtered.map(createProductCardHTML).join('');
  attachCardListeners(container);

  const gymTabs = document.querySelectorAll('.filter-tab-gym');
  gymTabs.forEach(tab => {
    tab.onclick = () => {
      gymTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderGymSection(tab.getAttribute('data-filter'));
    };
  });
}

function renderAccessoriesSection() {
  const container = document.getElementById('accessories-grid');
  if (!container) return;

  const accessories = window.PRODUCTS_DATA.filter(p => p.category === 'accessories');
  container.innerHTML = accessories.map(createProductCardHTML).join('');
  attachCardListeners(container);
}

function renderBrandsGrid() {
  const container = document.getElementById('brands-grid');
  if (!container) return;

  container.innerHTML = window.FEATURED_BRANDS.map(b => `
    <div class="brand-badge-card">
      <span class="brand-title">${b.name}</span>
      <span class="brand-tagline">${b.tagline}</span>
      <span class="brand-country">${b.country} • ${b.category}</span>
    </div>
  `).join('');
}

function renderTestimonials() {
  const container = document.getElementById('testimonials-grid');
  if (!container) return;

  container.innerHTML = window.TESTIMONIALS_DATA.map(t => `
    <div class="testimonial-card">
      <div class="testi-header">
        <div class="testi-stars">★★★★★</div>
        <span class="verified-tag">✓ Verified Purchase</span>
      </div>
      <p class="testi-quote">"${t.quote}"</p>
      <div class="testi-author">
        <div class="author-avatar">${t.name.split(' ').map(n=>n[0]).join('')}</div>
        <div class="author-info">
          <div class="author-name">${t.name}</div>
          <div class="author-role">${t.role}</div>
          <div class="author-bike">Product: ${t.bike}</div>
        </div>
      </div>
    </div>
  `).join('');
}

function renderFAQ() {
  const container = document.getElementById('faq-accordion');
  if (!container) return;

  container.innerHTML = window.FAQ_DATA.map((item, idx) => `
    <div class="faq-item ${idx === 0 ? 'active' : ''}">
      <button class="faq-question">
        <span>${item.q}</span>
        <span class="faq-toggle-icon">+</span>
      </button>
      <div class="faq-answer">
        <p>${item.a}</p>
      </div>
    </div>
  `).join('');

  container.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const parent = btn.closest('.faq-item');
      const wasActive = parent.classList.contains('active');
      container.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
      if (!wasActive) parent.classList.add('active');
    });
  });
}

// ================= 3. NAVIGATION & SCROLL =================
function initNavbarScroll() {
  const nav = document.getElementById('main-navbar');
  if (!nav) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }, { passive: true });
}

function initMegaMenu() {
  const megaLinks = document.querySelectorAll('.nav-has-mega');
  megaLinks.forEach(link => {
    const dropdown = link.querySelector('.mega-menu-container');
    if (!dropdown) return;

    link.addEventListener('mouseenter', () => dropdown.classList.add('active'));
    link.addEventListener('mouseleave', () => dropdown.classList.remove('active'));
  });
}

function initMobileMenu() {
  const toggleBtn = document.getElementById('btn-mobile-nav-toggle');
  const drawer = document.getElementById('mobile-nav-drawer');
  const overlay = document.getElementById('mobile-nav-overlay');
  const closeBtn = document.getElementById('btn-close-mobile-nav');

  if (!toggleBtn || !drawer) return;

  const openNav = () => {
    drawer.classList.add('open');
    if (overlay) overlay.classList.add('visible');
    document.body.style.overflow = 'hidden';
  };

  const closeNav = () => {
    drawer.classList.remove('open');
    if (overlay) overlay.classList.remove('visible');
    document.body.style.overflow = '';
  };

  toggleBtn.addEventListener('click', openNav);
  if (closeBtn) closeBtn.addEventListener('click', closeNav);
  if (overlay) overlay.addEventListener('click', closeNav);

  drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', closeNav));
}

// ================= 4. SHOPPING CART DRAWER =================
function initCartDrawer() {
  const cartTrigger = document.getElementById('btn-open-cart');
  const mobileCartTrigger = document.getElementById('btn-mobile-open-cart');
  const closeBtn = document.getElementById('btn-close-cart');
  const drawer = document.getElementById('cart-drawer');
  const overlay = document.getElementById('cart-overlay');
  const clearBtn = document.getElementById('btn-clear-cart');
  const couponInput = document.getElementById('cart-coupon-input');
  const applyCouponBtn = document.getElementById('btn-apply-coupon');
  const checkoutBtn = document.getElementById('btn-proceed-checkout');

  if (cartTrigger) cartTrigger.onclick = openCartDrawer;
  if (mobileCartTrigger) mobileCartTrigger.onclick = openCartDrawer;
  if (closeBtn) closeBtn.onclick = closeCartDrawer;
  if (overlay) overlay.onclick = closeCartDrawer;

  if (clearBtn) clearBtn.onclick = () => window.store.clearCart();

  if (applyCouponBtn && couponInput) {
    applyCouponBtn.onclick = () => {
      window.store.applyCoupon(couponInput.value);
    };
  }

  if (checkoutBtn) {
    checkoutBtn.onclick = () => {
      if (window.store.getCartCount() === 0) {
        window.store.showToast("Your cart is empty!", "warning");
        return;
      }
      closeCartDrawer();
      openCheckoutModal();
    };
  }

  // Subscribe to store updates
  window.store.subscribe((event) => {
    if (event === 'cart_updated') {
      renderCartItems();
    }
  });

  renderCartItems();
}

function openCartDrawer() {
  const drawer = document.getElementById('cart-drawer');
  const overlay = document.getElementById('cart-overlay');
  if (drawer) drawer.classList.add('open');
  if (overlay) overlay.classList.add('visible');
  document.body.style.overflow = 'hidden';
  renderCartItems();
}

function closeCartDrawer() {
  const drawer = document.getElementById('cart-drawer');
  const overlay = document.getElementById('cart-overlay');
  if (drawer) drawer.classList.remove('open');
  if (overlay) overlay.classList.remove('visible');
  document.body.style.overflow = '';
}

function renderCartItems() {
  const listEl = document.getElementById('cart-items-list');
  const emptyEl = document.getElementById('cart-empty-state');
  const footerEl = document.getElementById('cart-footer-summary');
  const subtotalEl = document.getElementById('cart-subtotal-val');
  const discountEl = document.getElementById('cart-discount-val');
  const totalEl = document.getElementById('cart-total-val');
  const couponRow = document.getElementById('cart-discount-row');

  if (!listEl) return;

  const cart = window.store.cart;
  if (cart.length === 0) {
    listEl.innerHTML = '';
    if (emptyEl) emptyEl.style.display = 'block';
    if (footerEl) footerEl.style.display = 'none';
    return;
  }

  if (emptyEl) emptyEl.style.display = 'none';
  if (footerEl) footerEl.style.display = 'block';

  listEl.innerHTML = cart.map(item => `
    <div class="cart-item-row" data-cart-id="${item.cartItemId}">
      <img src="${item.image}" alt="${item.name}" class="cart-item-thumb">
      <div class="cart-item-details">
        <h4 class="cart-item-name">${item.name}</h4>
        <div class="cart-item-meta">${item.brand} • Color: ${item.color}</div>
        <div class="cart-item-price">${window.store.formatINR(item.price)}</div>
        <div class="cart-qty-controls">
          <button class="qty-btn" onclick="window.store.updateCartQuantity('${item.cartItemId}', -1)">−</button>
          <span class="qty-num">${item.quantity}</span>
          <button class="qty-btn" onclick="window.store.updateCartQuantity('${item.cartItemId}', 1)">+</button>
          <button class="cart-remove-btn" onclick="window.store.removeFromCart('${item.cartItemId}')" title="Remove item">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </div>
      </div>
    </div>
  `).join('');

  const subtotal = window.store.getCartSubtotal();
  const discount = window.store.getCartDiscount();
  const total = window.store.getCartTotal();

  if (subtotalEl) subtotalEl.textContent = window.store.formatINR(subtotal);
  if (totalEl) totalEl.textContent = window.store.formatINR(total);

  if (couponRow && discountEl) {
    if (discount > 0) {
      couponRow.style.display = 'flex';
      discountEl.textContent = `- ${window.store.formatINR(discount)}`;
    } else {
      couponRow.style.display = 'none';
    }
  }
}

// ================= 5. WISHLIST DRAWER =================
function initWishlistDrawer() {
  const trigger = document.getElementById('btn-open-wishlist');
  const closeBtn = document.getElementById('btn-close-wishlist');
  const drawer = document.getElementById('wishlist-drawer');
  const overlay = document.getElementById('wishlist-overlay');

  if (trigger) trigger.onclick = openWishlistDrawer;
  if (closeBtn) closeBtn.onclick = closeWishlistDrawer;
  if (overlay) overlay.onclick = closeWishlistDrawer;

  window.store.subscribe((event) => {
    if (event === 'wishlist_updated') {
      renderWishlistItems();
    }
  });

  renderWishlistItems();
}

function openWishlistDrawer() {
  const drawer = document.getElementById('wishlist-drawer');
  const overlay = document.getElementById('wishlist-overlay');
  if (drawer) drawer.classList.add('open');
  if (overlay) overlay.classList.add('visible');
  document.body.style.overflow = 'hidden';
  renderWishlistItems();
}

function closeWishlistDrawer() {
  const drawer = document.getElementById('wishlist-drawer');
  const overlay = document.getElementById('wishlist-overlay');
  if (drawer) drawer.classList.remove('open');
  if (overlay) overlay.classList.remove('visible');
  document.body.style.overflow = '';
}

function renderWishlistItems() {
  const listEl = document.getElementById('wishlist-items-list');
  const emptyEl = document.getElementById('wishlist-empty-state');
  if (!listEl) return;

  const wishlist = window.store.wishlist;
  if (wishlist.length === 0) {
    listEl.innerHTML = '';
    if (emptyEl) emptyEl.style.display = 'block';
    return;
  }

  if (emptyEl) emptyEl.style.display = 'none';

  listEl.innerHTML = wishlist.map(item => `
    <div class="wishlist-item-row">
      <img src="${item.image}" alt="${item.name}" class="wishlist-thumb">
      <div class="wishlist-details">
        <h4 class="wishlist-name">${item.name}</h4>
        <div class="wishlist-brand">${item.brand}</div>
        <div class="wishlist-price">${window.store.formatINR(item.price)}</div>
        <div class="wishlist-actions">
          <button class="btn-move-to-cart" onclick="moveWishlistToCart('${item.id}')">
            Move to Cart
          </button>
          <button class="btn-remove-wishlist" onclick="removeWishlistItem('${item.id}')" title="Remove">
            ✕
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

window.moveWishlistToCart = (productId) => {
  const product = window.PRODUCTS_DATA.find(p => p.id === productId);
  if (product) {
    window.store.addToCart(product);
    window.store.toggleWishlist(product);
    closeWishlistDrawer();
    openCartDrawer();
  }
};

window.removeWishlistItem = (productId) => {
  const product = window.PRODUCTS_DATA.find(p => p.id === productId);
  if (product) {
    window.store.toggleWishlist(product);
  }
};

// ================= 6. LIVE SEARCH MODAL =================
function initSearchModal() {
  const openBtn = document.getElementById('btn-open-search');
  const modal = document.getElementById('search-modal');
  const closeBtn = document.getElementById('btn-close-search');
  const searchInput = document.getElementById('search-query-input');
  const resultsContainer = document.getElementById('search-results-list');

  if (!modal) return;

  const openSearch = () => {
    modal.classList.add('visible');
    if (searchInput) {
      searchInput.value = '';
      setTimeout(() => searchInput.focus(), 100);
      handleSearchQuery('');
    }
    document.body.style.overflow = 'hidden';
  };

  const closeSearch = () => {
    modal.classList.remove('visible');
    document.body.style.overflow = '';
  };

  if (openBtn) openBtn.onclick = openSearch;
  if (closeBtn) closeBtn.onclick = closeSearch;
  modal.onclick = (e) => {
    if (e.target === modal) closeSearch();
  };

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      handleSearchQuery(e.target.value);
    });
  }

  function handleSearchQuery(query) {
    if (!resultsContainer) return;
    const q = query.trim().toLowerCase();

    const matches = q === '' 
      ? window.PRODUCTS_DATA.slice(0, 5) 
      : window.PRODUCTS_DATA.filter(p => 
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.subCategory.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
        );

    if (matches.length === 0) {
      resultsContainer.innerHTML = `
        <div class="search-no-results">
          <p>No products found matching "<strong>${query}</strong>"</p>
          <span class="search-hint">Try searching for "road", "ebike", "treadmill", "helmet", or "specialized"</span>
        </div>
      `;
      return;
    }

    resultsContainer.innerHTML = matches.map(p => `
      <div class="search-result-item" onclick="openQuickView('${p.id}'); document.getElementById('search-modal').classList.remove('visible'); document.body.style.overflow='';">
        <img src="${p.image}" alt="${p.name}" class="search-thumb">
        <div class="search-item-info">
          <div class="search-title">${p.name}</div>
          <div class="search-meta">${p.brand} • ${p.subCategory}</div>
        </div>
        <div class="search-price">${window.store.formatINR(p.price)}</div>
      </div>
    `).join('');
  }
}

// ================= 7. PRODUCT QUICK VIEW MODAL =================
function initQuickViewModal() {
  const modal = document.getElementById('quickview-modal');
  const closeBtn = document.getElementById('btn-close-quickview');
  if (!modal) return;

  const close = () => {
    modal.classList.remove('visible');
    document.body.style.overflow = '';
  };

  if (closeBtn) closeBtn.onclick = close;
  modal.onclick = (e) => {
    if (e.target === modal) close();
  };
}

function openQuickView(productId) {
  const product = window.PRODUCTS_DATA.find(p => p.id === productId);
  const modal = document.getElementById('quickview-modal');
  const content = document.getElementById('quickview-content-body');
  if (!product || !modal || !content) return;

  // Specs table rows
  const specRows = Object.entries(product.specs).map(([key, val]) => `
    <tr>
      <td class="spec-label">${key.replace(/([A-Z])/g, ' $1').toUpperCase()}</td>
      <td class="spec-val">${val}</td>
    </tr>
  `).join('');

  // Colors
  const colorsHtml = (product.colors || []).map((c, i) => `
    <button class="modal-color-pill ${i === 0 ? 'active' : ''}" data-color-name="${c.name}">
      <span class="dot" style="background:${c.hex}"></span>
      ${c.name}
    </button>
  `).join('');

  content.innerHTML = `
    <div class="quickview-grid">
      <div class="qv-image-col">
        <div class="qv-main-img-wrap">
          <img src="${product.image}" alt="${product.name}" class="qv-main-img" id="qv-target-img">
        </div>
        <div class="qv-guarantee-box">
          <div class="g-item">🛡️ Lifetime Frame Guarantee</div>
          <div class="g-item">🚚 Free Metro Doorstep Assembly</div>
          <div class="g-item">💳 0% Interest EMI Available</div>
        </div>
      </div>
      <div class="qv-details-col">
        <div class="qv-brand-badge">${product.brand} • ${product.subCategory}</div>
        <h2 class="qv-title">${product.name}</h2>
        <div class="qv-rating-row">
          <span class="stars">★★★★★</span>
          <span class="val">${product.rating} / 5.0 (${product.reviewsCount} verified owner reviews)</span>
        </div>
        <div class="qv-price-row">
          <span class="qv-price">${window.store.formatINR(product.price)}</span>
          ${product.originalPrice ? `<span class="qv-orig-price">${window.store.formatINR(product.originalPrice)}</span>` : ''}
          ${product.discount ? `<span class="qv-discount-pill">${product.discount}</span>` : ''}
        </div>
        <p class="qv-desc">${product.description}</p>
        
        <div class="qv-section-label">Select Color Edition</div>
        <div class="qv-colors-row" id="qv-colors-group">
          ${colorsHtml}
        </div>

        <div class="qv-actions-row">
          <button class="btn-primary qv-add-cart-btn" id="qv-btn-add">
            ADD TO SHOPPING CART
          </button>
          <button class="btn-secondary qv-book-ride-btn" id="qv-btn-test-ride">
            BOOK SHOWROOM TEST RIDE
          </button>
        </div>

        <div class="qv-section-label">Technical Specifications</div>
        <table class="qv-specs-table">
          <tbody>${specRows}</tbody>
        </table>
      </div>
    </div>
  `;

  // Color selection handling
  let selectedColor = product.colors && product.colors[0]?.name;
  content.querySelectorAll('.modal-color-pill').forEach(btn => {
    btn.onclick = () => {
      content.querySelectorAll('.modal-color-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedColor = btn.getAttribute('data-color-name');
    };
  });

  // Add to cart from QuickView
  content.querySelector('#qv-btn-add').onclick = () => {
    window.store.addToCart(product, { color: selectedColor });
    modal.classList.remove('visible');
    openCartDrawer();
  };

  // Test ride booking from QuickView
  content.querySelector('#qv-btn-test-ride').onclick = () => {
    modal.classList.remove('visible');
    openTestRideModal(product.name);
  };

  modal.classList.add('visible');
  document.body.style.overflow = 'hidden';
}

// ================= 8. PRODUCT COMPARISON MATRIX =================
function initCompareModal() {
  const floatingBar = document.getElementById('compare-floating-bar');
  const openModalBtn = document.getElementById('btn-open-compare-modal');
  const clearBtn = document.getElementById('btn-clear-compare');
  const modal = document.getElementById('compare-modal');
  const closeBtn = document.getElementById('btn-close-compare');

  if (openModalBtn) openModalBtn.onclick = openCompareModal;
  if (clearBtn) clearBtn.onclick = () => window.store.clearCompare();
  if (closeBtn) closeBtn.onclick = closeCompareModal;

  if (modal) {
    modal.onclick = (e) => {
      if (e.target === modal) closeCompareModal();
    };
  }

  window.store.subscribe((event) => {
    if (event === 'compare_updated') {
      renderCompareTable();
    }
  });
}

function openCompareModal() {
  const modal = document.getElementById('compare-modal');
  if (!modal) return;
  modal.classList.add('visible');
  document.body.style.overflow = 'hidden';
  renderCompareTable();
}

function closeCompareModal() {
  const modal = document.getElementById('compare-modal');
  if (!modal) return;
  modal.classList.remove('visible');
  document.body.style.overflow = '';
}

function renderCompareTable() {
  const container = document.getElementById('compare-table-container');
  if (!container) return;

  const items = window.store.compare;
  if (items.length === 0) {
    container.innerHTML = `
      <div class="compare-empty">
        <p>No products currently added for comparison.</p>
        <p class="sub">Click the "Compare" button on any bicycle or gym machine card to compare side-by-side.</p>
      </div>
    `;
    return;
  }

  // Spec keys union
  const allSpecKeys = ['frame', 'groupset', 'brakes', 'wheelset', 'weight', 'motorPower', 'battery', 'range', 'speed', 'warranty'];

  const headersHtml = items.map(item => `
    <th class="compare-col-header">
      <img src="${item.image}" alt="${item.name}" class="compare-header-thumb">
      <div class="compare-header-title">${item.name}</div>
      <div class="compare-header-price">${window.store.formatINR(item.price)}</div>
      <button class="btn-primary-sm" onclick="window.store.addToCart(window.PRODUCTS_DATA.find(p=>p.id==='${item.id}')); closeCompareModal(); openCartDrawer();">
        Add to Cart
      </button>
      <button class="compare-remove-item" onclick="window.store.toggleCompare(window.PRODUCTS_DATA.find(p=>p.id==='${item.id}'))">
        Remove
      </button>
    </th>
  `).join('');

  const rowsHtml = allSpecKeys.map(key => {
    const cells = items.map(item => `
      <td>${item.specs[key] || '—'}</td>
    `).join('');
    return `
      <tr>
        <td class="compare-row-name">${key.replace(/([A-Z])/g, ' $1').toUpperCase()}</td>
        ${cells}
      </tr>
    `;
  }).join('');

  container.innerHTML = `
    <table class="compare-matrix-table">
      <thead>
        <tr>
          <th>Metric / Component</th>
          ${headersHtml}
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
    </table>
  `;
}

// ================= 9. TEST RIDE & SHOWROOM APPOINTMENT =================
function initTestRideModal() {
  const trigger = document.getElementById('btn-hero-test-ride');
  const trigger2 = document.getElementById('btn-nav-visit');
  const modal = document.getElementById('test-ride-modal');
  const closeBtn = document.getElementById('btn-close-test-ride');
  const form = document.getElementById('test-ride-form');

  const open = () => openTestRideModal();
  const close = () => {
    if (modal) modal.classList.remove('visible');
    document.body.style.overflow = '';
  };

  if (trigger) trigger.onclick = open;
  if (trigger2) trigger2.onclick = open;
  if (closeBtn) closeBtn.onclick = close;
  if (modal) {
    modal.onclick = (e) => {
      if (e.target === modal) close();
    };
  }

  if (form) {
    form.onsubmit = (e) => {
      e.preventDefault();
      const name = document.getElementById('ride-name')?.value || 'Guest';
      const bike = document.getElementById('ride-bike-select')?.value || 'Flagship';
      const date = document.getElementById('ride-date')?.value || 'Today';

      close();
      window.store.showToast(`Thank you ${name}! Test ride confirmed for "${bike}" on ${date}. Our concierge will WhatsApp you the gate pass.`, 'success', 5000);
      form.reset();
    };
  }
}

function openTestRideModal(preselectedBike = "") {
  const modal = document.getElementById('test-ride-modal');
  const bikeSelect = document.getElementById('ride-bike-select');
  if (!modal) return;

  if (bikeSelect) {
    bikeSelect.innerHTML = window.PRODUCTS_DATA.map(p => `
      <option value="${p.name}" ${p.name === preselectedBike ? 'selected' : ''}>
        ${p.name} (${window.store.formatINR(p.price)})
      </option>
    `).join('');
  }

  // Set minimum date to tomorrow
  const dateInput = document.getElementById('ride-date');
  if (dateInput) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    dateInput.min = tomorrow.toISOString().split('T')[0];
    dateInput.value = tomorrow.toISOString().split('T')[0];
  }

  // If user is authenticated, prefill test ride name
  if (window.devAuth && window.devAuth.currentUser) {
    const meta = window.devAuth.currentUser.user_metadata || {};
    const name = meta.full_name || meta.display_name;
    const nameInput = document.getElementById('ride-name');
    if (nameInput && name && !nameInput.value) {
      nameInput.value = name;
    }
  }

  modal.classList.add('visible');
  document.body.style.overflow = 'hidden';
}

// ================= 10. CHECKOUT MODAL FLOW =================
function initCheckoutModal() {
  const modal = document.getElementById('checkout-modal');
  const closeBtn = document.getElementById('btn-close-checkout');
  const form = document.getElementById('checkout-form');

  if (!modal) return;

  const close = () => {
    modal.classList.remove('visible');
    document.body.style.overflow = '';
  };

  if (closeBtn) closeBtn.onclick = close;
  modal.onclick = (e) => {
    if (e.target === modal) close();
  };

  if (form) {
    form.onsubmit = (e) => {
      e.preventDefault();
      const orderId = 'DEV-' + Math.floor(100000 + Math.random() * 900000);
      const totalAmount = window.store.formatINR(window.store.getCartTotal());

      close();
      window.store.clearCart();
      window.store.showToast(`🎉 Order ${orderId} Confirmed! Total: ${totalAmount}. Confirmation sent via SMS & Email.`, 'success', 6000);
    };
  }
}

function openCheckoutModal() {
  const modal = document.getElementById('checkout-modal');
  const totalDisplay = document.getElementById('checkout-order-total');
  const itemsCountDisplay = document.getElementById('checkout-items-count');
  if (!modal) return;

  if (totalDisplay) totalDisplay.textContent = window.store.formatINR(window.store.getCartTotal());
  if (itemsCountDisplay) itemsCountDisplay.textContent = `${window.store.getCartCount()} items`;

  // Auto-fill authenticated customer details
  if (window.devAuth && window.devAuth.currentUser) {
    const u = window.devAuth.currentUser;
    const meta = u.user_metadata || {};
    const fullName = meta.full_name || meta.display_name || '';
    const nameParts = fullName.split(' ');
    const emailField = modal.querySelector('input[type="email"]');
    const firstField = modal.querySelector('input[placeholder="Aakash"]');
    const lastField = modal.querySelector('input[placeholder="Sharma"]');
    if (emailField && !emailField.value) emailField.value = u.email || '';
    if (firstField && !firstField.value && nameParts[0]) firstField.value = nameParts[0];
    if (lastField && !lastField.value && nameParts.length > 1) lastField.value = nameParts.slice(1).join(' ');
  }

  modal.classList.add('visible');
  document.body.style.overflow = 'hidden';
}

// ================= 11. NEWSLETTER & WHATSAPP =================
function initNewsletter() {
  const form = document.getElementById('newsletter-form');
  if (!form) return;

  form.onsubmit = (e) => {
    e.preventDefault();
    const email = document.getElementById('newsletter-email')?.value;
    window.store.showToast(`Welcome to the Dev Cycle VIP Collective (${email})! Check your inbox for the launch voucher.`, 'success');
    form.reset();
  };
}

function initWhatsAppWidget() {
  const floatingBtn = document.getElementById('whatsapp-floating-btn');
  const directBtns = document.querySelectorAll('.btn-whatsapp-direct');

  const triggerChat = () => {
    const phone = window.DEV_CONFIG.whatsappNumber;
    const msg = encodeURIComponent(window.DEV_CONFIG.whatsappMessage);
    const url = `https://wa.me/${phone}?text=${msg}`;
    window.open(url, '_blank');
  };

  if (floatingBtn) floatingBtn.onclick = triggerChat;
  directBtns.forEach(b => b.onclick = triggerChat);
}
