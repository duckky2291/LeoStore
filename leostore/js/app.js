/**
 * Leo Fashion Store - Milan • Paris • New York • London
 * Main Application Logic: State, Cart, Wishlist, Quick View, Lookbook, Checkout & MySQL API Integration
 */

// Application State
const state = {
  products: JSON.parse(localStorage.getItem('leo_products') || JSON.stringify(PRODUCTS_DATA)),
  filteredProducts: [],
  currentCategory: 'all',
  currentSort: 'featured',
  currency: 'USD', // 'USD' (default) or 'VND'
  exchangeRate: 25000, // 1 USD = 25,000 VND
  cart: JSON.parse(localStorage.getItem('leo_cart') || '[]'),
  wishlist: JSON.parse(localStorage.getItem('leo_wishlist') || '[]'),
  orders: JSON.parse(localStorage.getItem('leo_orders') || JSON.stringify(INITIAL_ORDERS)),
  users: JSON.parse(localStorage.getItem('leo_users') || JSON.stringify(USERS_DATA)),
  currentUser: JSON.parse(localStorage.getItem('leo_current_user') || '{"role":"guest","name":"Guest Patron"}'),
  lookbook: (() => {
    try {
      const saved = localStorage.getItem('leo_lookbook');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.hotspots) && parsed.hotspots.length > 0) {
          if (parsed.hotspots[0] && parsed.hotspots[0].top === "35%") {
            return JSON.parse(JSON.stringify(LOOKBOOK_ITEMS[0]));
          }
          return parsed;
        }
      }
    } catch (e) {}
    return JSON.parse(JSON.stringify(LOOKBOOK_ITEMS[0]));
  })(),
  appliedPromo: null,
  freeShippingThreshold: 500, // $500 USD
  selectedQuickViewProduct: null,
  selectedQuickViewSize: null,
  selectedQuickViewColor: null,
  quickViewQty: 1,
  dbConnected: false,
  editingProductId: null
};

// DOM Helper utilities
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

// Initialize Store
document.addEventListener('DOMContentLoaded', () => {
  initHeaderScroll();
  initMobileNav();
  initAuthState();
  updateUserHeaderUI();
  renderProducts();
  renderLookbook();
  updateCartBadges();
  updateWishlistBadges();
  initEventListeners();
  initImageDragAndDrop();
  
  // Asynchronously synchronize with MySQL backend
  syncWithBackendDatabase();
});

/* ==========================================================================
   MySQL Database Synchronization Layer (phpMyAdmin / XAMPP)
   ========================================================================== */
async function syncWithBackendDatabase() {
  try {
    // 1. Fetch live products from MySQL
    const prodRes = await fetch('api/products.php?category=all');
    if (prodRes.ok) {
      const prodData = await prodRes.json();
      if (prodData.success && Array.isArray(prodData.products) && prodData.products.length > 0) {
        state.products = prodData.products;
        localStorage.setItem('leo_products', JSON.stringify(state.products));
        renderProducts();
        renderLookbook();
        state.dbConnected = true;
      }
    }

    // 2. Fetch live orders from MySQL
    const ordRes = await fetch('api/orders.php');
    if (ordRes.ok) {
      const ordData = await ordRes.json();
      if (ordData.success && Array.isArray(ordData.orders)) {
        state.orders = ordData.orders;
        localStorage.setItem('leo_orders', JSON.stringify(state.orders));
        updateDashboardKPIs();
      }
    }
  } catch (err) {
    // Graceful fallback to embedded local data if running statically
    console.info('Running with local storage seed data (API offline or static mode).');
  }
}

/* ==========================================================================
   Header & Navigation
   ========================================================================== */
function initHeaderScroll() {
  const header = $('.site-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
}

function initMobileNav() {
  const toggleBtn = $('.nav-toggle-btn');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', openMobileMenu);
  }
}

function openMobileMenu() {
  const drawer = $('#mobileMenuDrawer');
  const backdrop = $('#mobileMenuBackdrop');
  if (drawer) drawer.classList.add('active');
  if (backdrop) backdrop.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeMobileMenu() {
  const drawer = $('#mobileMenuDrawer');
  const backdrop = $('#mobileMenuBackdrop');
  if (drawer) drawer.classList.remove('active');
  if (backdrop) backdrop.classList.remove('active');
  document.body.style.overflow = '';
}

function filterFromMobile(category) {
  closeMobileMenu();
  state.currentCategory = category;
  $$('.filter-tab').forEach(t => {
    t.classList.toggle('active', t.getAttribute('data-category') === category);
  });
  renderProducts();
  const shopEl = $('#shop');
  if (shopEl) {
    shopEl.scrollIntoView({ behavior: 'smooth' });
  }
}

/* ==========================================================================
   Currency & Formatting Helpers
   ========================================================================== */
function formatPrice(amountUSD) {
  if (state.currency === 'VND') {
    const vnd = amountUSD * state.exchangeRate;
    return `${Number(vnd).toLocaleString('vi-VN')}₫`;
  }
  return `$${Number(amountUSD).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

function toggleCurrency() {
  state.currency = state.currency === 'USD' ? 'VND' : 'USD';
  const currencyBtn = $('#currencyToggle');
  if (currencyBtn) {
    currencyBtn.textContent = state.currency === 'USD' ? '$ USD' : '₫ VND';
  }
  renderProducts();
  renderLookbook();
  renderCartDrawer();
  showToast(`Currency updated to ${state.currency}`);
}

/* ==========================================================================
   Catalog & Product Rendering
   ========================================================================== */
function renderProducts() {
  const grid = $('#productsGrid');
  const countEl = $('#productsCount');
  if (!grid) return;

  // Filter products
  let list = state.products.filter(p => {
    if (state.currentCategory === 'all') return true;
    if (state.currentCategory === 'men') return p.category === 'men';
    if (state.currentCategory === 'women') return p.category === 'women';
    if (state.currentCategory === 'accessories') return p.category === 'accessories';
    if (state.currentCategory === 'runway') return p.collection === 'runway';
    if (state.currentCategory === 'autumn') return p.collection === 'autumn-winter';
    return true;
  });

  // Sort products
  if (state.currentSort === 'price-asc') {
    list.sort((a, b) => a.price - b.price);
  } else if (state.currentSort === 'price-desc') {
    list.sort((a, b) => b.price - a.price);
  } else if (state.currentSort === 'rating') {
    list.sort((a, b) => b.rating - a.rating);
  } else {
    // Featured default
    list.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
  }

  state.filteredProducts = list;

  if (countEl) {
    countEl.textContent = `${list.length} Masterpiece${list.length === 1 ? '' : 's'}`;
  }

  if (list.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--text-muted);">
        <p style="font-family: var(--font-serif); font-size: 1.3rem;">No matching luxury creations found</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = list.map(product => {
    const isWishlisted = state.wishlist.includes(product.id);
    const primaryImg = product.images[0];
    const secondaryImg = product.images[1] || product.images[0];
    const collectionLabel = (product.collection || 'Bespoke').replace('-', ' ').toUpperCase();

    return `
      <div class="product-card" data-id="${product.id}">
        <div class="card-media" onclick="openQuickView('${product.id}')" style="cursor: pointer;">
          <img src="${primaryImg}" alt="${product.name}" class="card-img-primary" loading="lazy" />
          <img src="${secondaryImg}" alt="${product.name}" class="card-img-secondary" loading="lazy" />
          
          ${product.badge ? `<span class="card-badge">${product.badge}</span>` : ''}
          
          <button class="card-wishlist-btn ${isWishlisted ? 'active' : ''}" 
                  onclick="toggleWishlist('${product.id}', event)" 
                  title="Add to Wishlist"
                  aria-label="Wishlist">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="${isWishlisted ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </button>

          <div class="card-quick-actions">
            <button class="btn-card-action btn-quick-view" onclick="openQuickView('${product.id}')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
              </svg>
              Quick View
            </button>
            <button class="btn-card-action btn-quick-add" onclick="quickAddToCart('${product.id}')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              Add to Bag
            </button>
          </div>
        </div>

        <div class="card-body">
          <div class="card-rating">
            <div class="stars">
              ${'★'.repeat(Math.round(product.rating))}
            </div>
            <span>${Number(product.rating).toFixed(1)}</span>
            <span class="review-count">(${product.reviewCount || 0})</span>
          </div>

          <h4 class="card-title" title="${product.name}" onclick="openQuickView('${product.id}')" style="cursor: pointer;">${product.name}</h4>
          <p class="card-subtitle">${collectionLabel} • ${product.category.toUpperCase()}</p>

          <div class="card-swatches">
            ${product.colors.map(c => `
              <span class="swatch-dot" style="background-color: ${c.hex};" title="${c.name}"></span>
            `).join('')}
          </div>

          <div class="card-footer">
            <div class="price-box">
              <span class="price-current">${formatPrice(product.price)}</span>
              ${product.originalPrice ? `<span class="price-original">${formatPrice(product.originalPrice)}</span>` : ''}
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

/* ==========================================================================
   Lookbook / Shop The Look (Haute Couture Visuals & Hotspot Studio)
   ========================================================================== */
function renderLookbook() {
  const container = $('#lookbookContainer');
  if (!container) return;

  const item = state.lookbook || LOOKBOOK_ITEMS[0];
  const itemHotspots = item.hotspots || [];
  const products = itemHotspots.map(h => state.products.find(p => p.id === h.productId)).filter(Boolean);
  const isSellerOrAdmin = state.currentUser && (state.currentUser.role === 'seller' || state.currentUser.role === 'admin');

  container.innerHTML = `
    <div class="lookbook-interactive-media">
      <img src="${item.image}" alt="${item.title}" />
      ${isSellerOrAdmin ? `
        <button type="button" class="btn-calibrator-trigger" onclick="openLookbookEditorModal()" title="Calibrate Garment Hotspot Positions">
          <span>🎯</span> Calibrate Hotspots
        </button>
      ` : ''}
      ${itemHotspots.map((spot, idx) => `
        <div class="hotspot-pin" style="top: ${spot.top}; left: ${spot.left};" 
             onclick="highlightLookbookProduct('${spot.productId}')"
             title="${idx + 1}. ${spot.name || 'Garment Point'}">
          <div class="hotspot-outer"></div>
          <div class="hotspot-inner">${idx + 1}</div>
        </div>
      `).join('')}
    </div>

    <div class="lookbook-details">
      <div class="lookbook-header">
        <span class="gold-badge">Haute Couture Milan</span>
        <h3 style="font-family: var(--font-serif); font-size: 1.8rem; margin: 10px 0 6px;">${item.title}</h3>
        <p style="font-size: 0.85rem; color: var(--text-secondary);">${item.subtitle}</p>
      </div>

      <div class="lookbook-products-list">
        ${products.map(p => `
          <div class="lookbook-item-card" id="lookbook-card-${p.id}">
            <img src="${p.images[0]}" alt="${p.name}" class="lookbook-item-thumb" />
            <div class="lookbook-item-info">
              <h6>${p.name}</h6>
              <p>${formatPrice(p.price)}</p>
            </div>
            <button class="btn-card-action btn-quick-add" style="padding: 8px 14px;" onclick="quickAddToCart('${p.id}')">
              Acquire
            </button>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function highlightLookbookProduct(productId) {
  $$('.lookbook-item-card').forEach(el => el.classList.remove('highlighted'));
  const targetCard = $(`#lookbook-card-${productId}`);
  if (targetCard) {
    targetCard.classList.add('highlighted');
    targetCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

/* ==========================================================================
   LOOKBOOK VISUAL CALIBRATOR STUDIO (Seller & Admin)
   ========================================================================== */
let tempLookbook = null;
let activeCalibratorIndex = 0;
let calibratorEventsBound = false;

function openLookbookEditorModal() {
  const modal = $('#lookbookEditorModal');
  if (!modal) return;

  // Deep clone current lookbook
  tempLookbook = JSON.parse(JSON.stringify(state.lookbook || LOOKBOOK_ITEMS[0]));
  if (!tempLookbook.hotspots) tempLookbook.hotspots = [];
  activeCalibratorIndex = 0;

  // Populate metadata fields
  const titleInput = $('#lookbookEditTitle');
  const subInput = $('#lookbookEditSubtitle');
  const imgInput = $('#lookbookEditImage');
  const canvasImg = $('#calibratorImg');

  if (titleInput) titleInput.value = tempLookbook.title || '';
  if (subInput) subInput.value = tempLookbook.subtitle || '';
  if (imgInput) imgInput.value = tempLookbook.image || '';
  if (canvasImg) canvasImg.src = tempLookbook.image || '';

  renderCalibratorPins();
  renderHotspotControlsList();
  initCalibratorCanvasEvents();

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeLookbookEditorModal() {
  const modal = $('#lookbookEditorModal');
  if (modal) modal.classList.remove('active');
  document.body.style.overflow = '';
  tempLookbook = null;
}

function renderCalibratorPins() {
  const overlay = $('#calibratorPinsOverlay');
  if (!overlay || !tempLookbook) return;

  overlay.innerHTML = (tempLookbook.hotspots || []).map((spot, idx) => {
    const isActive = idx === activeCalibratorIndex;
    return `
      <div class="calibrator-pin ${isActive ? 'active' : ''}" 
           id="calibrator-pin-${idx}"
           data-index="${idx}"
           style="top: ${spot.top}; left: ${spot.left};"
           title="Pin #${idx + 1}: ${spot.name || 'Garment'}">
        <div class="calibrator-pin-ring"></div>
        <div class="calibrator-pin-dot">${idx + 1}</div>
      </div>
    `;
  }).join('');

  updateCalibratorStatusText();
}

function renderHotspotControlsList() {
  const listEl = $('#hotspotPinsList');
  if (!listEl || !tempLookbook) return;

  if (tempLookbook.hotspots.length === 0) {
    listEl.innerHTML = `
      <div style="text-align: center; padding: 18px; color: var(--text-muted); font-size: 0.78rem; border: 1px dashed var(--border-subtle); border-radius: 4px;">
        No hotspot pins yet. Click <strong>+ Add Another Pin</strong> to create one.
      </div>
    `;
    return;
  }

  listEl.innerHTML = tempLookbook.hotspots.map((spot, idx) => {
    const isActive = idx === activeCalibratorIndex;
    return `
      <div class="hotspot-control-card ${isActive ? 'active' : ''}" 
           id="hotspot-card-control-${idx}"
           onclick="selectCalibratorPin(${idx})">
        <div class="hotspot-card-header">
          <div class="hotspot-badge">
            <span class="hotspot-badge-num">${idx + 1}</span>
            <span>Hotspot #${idx + 1}</span>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span class="hotspot-coord-tags" id="hotspot-coord-tag-${idx}">T: ${spot.top} | L: ${spot.left}</span>
            <button type="button" class="btn-delete-action" style="padding: 3px 7px; font-size: 0.65rem;" 
                    onclick="event.stopPropagation(); removeHotspotPin(${idx});" title="Delete pin">
              ✕
            </button>
          </div>
        </div>
        <div class="form-field" style="margin-bottom: 0;">
          <label style="font-size: 0.68rem; margin-bottom: 3px; color: var(--text-secondary);">Target Garment / Product</label>
          <select style="padding: 6px 8px; font-size: 0.74rem;" 
                  onchange="updateHotspotProduct(${idx}, this.value)"
                  onclick="event.stopPropagation();">
            ${state.products.map(p => `
              <option value="${p.id}" ${p.id === spot.productId ? 'selected' : ''}>
                ${p.name} — ${formatPrice(p.price)}
              </option>
            `).join('')}
          </select>
        </div>
      </div>
    `;
  }).join('');
}

function selectCalibratorPin(index) {
  if (!tempLookbook || !tempLookbook.hotspots || !tempLookbook.hotspots[index]) return;
  activeCalibratorIndex = index;
  $$('.calibrator-pin').forEach(el => el.classList.remove('active'));
  $$('.hotspot-control-card').forEach(el => el.classList.remove('active'));

  const activePin = $(`#calibrator-pin-${index}`);
  if (activePin) activePin.classList.add('active');

  const activeCard = $(`#hotspot-card-control-${index}`);
  if (activeCard) {
    activeCard.classList.add('active');
    activeCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  updateCalibratorStatusText();
}

function updateCalibratorStatusText() {
  const label = $('#calibratorActivePinLabel');
  const coord = $('#calibratorActiveCoord');
  if (!tempLookbook || !tempLookbook.hotspots || tempLookbook.hotspots.length === 0) {
    if (label) label.textContent = 'None';
    if (coord) coord.textContent = 'No pins configured';
    return;
  }

  const spot = tempLookbook.hotspots[activeCalibratorIndex] || tempLookbook.hotspots[0];
  if (label) label.textContent = `Pin #${activeCalibratorIndex + 1} (${spot.name || 'Garment'})`;
  if (coord) coord.textContent = `Top: ${spot.top}, Left: ${spot.left}`;
}

function initCalibratorCanvasEvents() {
  const canvas = $('#calibratorCanvas');
  if (!canvas || calibratorEventsBound) return;
  calibratorEventsBound = true;

  let isDragging = false;
  let draggedIndex = null;

  function applyCoordUpdate(index, clientX, clientY) {
    if (!tempLookbook || !tempLookbook.hotspots || !tempLookbook.hotspots[index]) return;
    const rect = canvas.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    let xPercent = ((clientX - rect.left) / rect.width) * 100;
    let yPercent = ((clientY - rect.top) / rect.height) * 100;

    // Clamp coordinates safely within the photo boundaries
    xPercent = Math.max(3, Math.min(97, xPercent));
    yPercent = Math.max(3, Math.min(97, yPercent));

    const leftStr = `${xPercent.toFixed(1)}%`;
    const topStr = `${yPercent.toFixed(1)}%`;

    tempLookbook.hotspots[index].left = leftStr;
    tempLookbook.hotspots[index].top = topStr;

    // Instant DOM update for smooth feel
    const pinEl = $(`#calibrator-pin-${index}`);
    if (pinEl) {
      pinEl.style.left = leftStr;
      pinEl.style.top = topStr;
    }

    const tagEl = $(`#hotspot-coord-tag-${index}`);
    if (tagEl) {
      tagEl.textContent = `T: ${topStr} | L: ${leftStr}`;
    }

    updateCalibratorStatusText();
  }

  // Mouse Down: Start dragging pin or click on canvas to reposition active pin
  canvas.addEventListener('mousedown', (e) => {
    if (!tempLookbook || tempLookbook.hotspots.length === 0) return;

    const pinEl = e.target.closest('.calibrator-pin');
    if (pinEl) {
      const idx = parseInt(pinEl.getAttribute('data-index'), 10);
      selectCalibratorPin(idx);
      isDragging = true;
      draggedIndex = idx;
    } else {
      if (activeCalibratorIndex >= 0 && activeCalibratorIndex < tempLookbook.hotspots.length) {
        applyCoordUpdate(activeCalibratorIndex, e.clientX, e.clientY);
        isDragging = true;
        draggedIndex = activeCalibratorIndex;
      }
    }
    e.preventDefault();
  });

  window.addEventListener('mousemove', (e) => {
    if (isDragging && draggedIndex !== null) {
      applyCoordUpdate(draggedIndex, e.clientX, e.clientY);
    }
  });

  window.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      draggedIndex = null;
    }
  });

  // Mobile / Touch support
  canvas.addEventListener('touchstart', (e) => {
    if (!tempLookbook || tempLookbook.hotspots.length === 0) return;
    const touch = e.touches[0];
    const pinEl = e.target.closest('.calibrator-pin');
    if (pinEl) {
      const idx = parseInt(pinEl.getAttribute('data-index'), 10);
      selectCalibratorPin(idx);
      isDragging = true;
      draggedIndex = idx;
    } else {
      if (activeCalibratorIndex >= 0 && activeCalibratorIndex < tempLookbook.hotspots.length) {
        applyCoordUpdate(activeCalibratorIndex, touch.clientX, touch.clientY);
        isDragging = true;
        draggedIndex = activeCalibratorIndex;
      }
    }
  }, { passive: false });

  window.addEventListener('touchmove', (e) => {
    if (isDragging && draggedIndex !== null && e.touches[0]) {
      applyCoordUpdate(draggedIndex, e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: true });

  window.addEventListener('touchend', () => {
    isDragging = false;
    draggedIndex = null;
  });
}

function addNewHotspotPin() {
  if (!tempLookbook) return;
  const nextProd = state.products[tempLookbook.hotspots.length % state.products.length] || state.products[0];

  const newPin = {
    productId: nextProd ? nextProd.id : "LEO-001",
    name: nextProd ? nextProd.name : "Milan Sartorial Garment",
    price: nextProd ? nextProd.price : 600,
    top: `${Math.min(85, 48 + (tempLookbook.hotspots.length * 9))}%`,
    left: `${Math.min(85, 25 + (tempLookbook.hotspots.length * 18))}%`
  };

  tempLookbook.hotspots.push(newPin);
  activeCalibratorIndex = tempLookbook.hotspots.length - 1;
  renderCalibratorPins();
  renderHotspotControlsList();
  selectCalibratorPin(activeCalibratorIndex);
  showToast(`Added Hotspot #${activeCalibratorIndex + 1}. Drag or click on photo to place it.`, 'info');
}

function removeHotspotPin(index) {
  if (!tempLookbook || !tempLookbook.hotspots) return;
  tempLookbook.hotspots.splice(index, 1);
  if (activeCalibratorIndex >= tempLookbook.hotspots.length) {
    activeCalibratorIndex = Math.max(0, tempLookbook.hotspots.length - 1);
  }
  renderCalibratorPins();
  renderHotspotControlsList();
  selectCalibratorPin(activeCalibratorIndex);
}

function updateHotspotProduct(index, productId) {
  if (!tempLookbook || !tempLookbook.hotspots || !tempLookbook.hotspots[index]) return;
  const prod = state.products.find(p => p.id === productId);
  if (prod) {
    tempLookbook.hotspots[index].productId = prod.id;
    tempLookbook.hotspots[index].name = prod.name;
    tempLookbook.hotspots[index].price = prod.price;
  }
  updateCalibratorStatusText();
}

function updateCalibratorImage(url) {
  if (!url || !tempLookbook) return;
  tempLookbook.image = url;
  const canvasImg = $('#calibratorImg');
  if (canvasImg) canvasImg.src = url;
}

function saveLookbookHotspots() {
  if (!tempLookbook) return;

  const titleInput = $('#lookbookEditTitle');
  const subInput = $('#lookbookEditSubtitle');
  const imgInput = $('#lookbookEditImage');

  if (titleInput && titleInput.value.trim()) tempLookbook.title = titleInput.value.trim();
  if (subInput && subInput.value.trim()) tempLookbook.subtitle = subInput.value.trim();
  if (imgInput && imgInput.value.trim()) tempLookbook.image = imgInput.value.trim();

  state.lookbook = JSON.parse(JSON.stringify(tempLookbook));
  localStorage.setItem('leo_lookbook', JSON.stringify(state.lookbook));

  renderLookbook();
  closeLookbookEditorModal();
  showToast('Lookbook hotspots successfully calibrated & updated.', 'success');
}

function resetLookbookHotspotsToDefaults() {
  if (!confirm('Reset all Lookbook hotspot coordinates and settings to maison defaults?')) return;
  localStorage.removeItem('leo_lookbook');
  state.lookbook = JSON.parse(JSON.stringify(LOOKBOOK_ITEMS[0]));
  openLookbookEditorModal();
  renderLookbook();
  showToast('Lookbook restored to default calibrated positions.', 'info');
}

/* ==========================================================================
   Quick View Modal
   ========================================================================== */
function openQuickView(productId) {
  const product = state.products.find(p => p.id === productId);
  if (!product) return;

  state.selectedQuickViewProduct = product;
  state.selectedQuickViewSize = product.sizes[0] || 'Standard';
  state.selectedQuickViewColor = product.colors[0] ? product.colors[0].name : 'Default';
  state.quickViewQty = 1;

  const modal = $('#quickViewModal');
  const body = $('#quickViewBody');

  body.innerHTML = `
    <div class="quickview-gallery">
      <img src="${product.images[0]}" alt="${product.name}" id="quickViewMainImg" class="quickview-main-img" />
      <div class="quickview-thumbs">
        ${product.images.map((img, idx) => `
          <img src="${img}" class="quickview-thumb-item ${idx === 0 ? 'active' : ''}" 
               onclick="switchQuickViewImg('${img}', this)" alt="Thumbnail" />
        `).join('')}
      </div>
    </div>

    <div class="quickview-details">
      <div style="display: flex; justify-content: space-between; align-items: flex-start;">
        <div>
          ${product.badge ? `<span class="gold-badge" style="margin-bottom: 8px;">${product.badge}</span>` : ''}
          <h2 style="font-family: var(--font-serif); font-size: 1.6rem; margin-top: 6px;">${product.name}</h2>
          <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 12px;">Ref: ${product.id}</p>
        </div>
        <button class="drawer-close-btn" onclick="closeQuickView()" aria-label="Close">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <div style="display: flex; align-items: baseline; gap: 12px; margin-bottom: 16px;">
        <span style="font-family: var(--font-serif); font-size: 1.6rem; font-weight: 700; color: var(--gold-hover);">
          ${formatPrice(product.price)}
        </span>
        ${product.originalPrice ? `
          <span style="font-size: 1rem; color: var(--text-muted); text-decoration: line-through;">
            ${formatPrice(product.originalPrice)}
          </span>
        ` : ''}
      </div>

      <p style="font-size: 0.88rem; color: var(--text-secondary); line-height: 1.6; margin-bottom: 20px;">
        ${product.shortDesc}
      </p>

      <!-- Color Selector -->
      <div style="margin-bottom: 16px;">
        <label style="font-size: 0.75rem; letter-spacing: 1.5px; text-transform: uppercase; color: var(--text-secondary);">
          Color: <strong style="color: var(--gold-hover);" id="selectedColorLabel">${state.selectedQuickViewColor}</strong>
        </label>
        <div style="display: flex; gap: 10px; margin-top: 8px;">
          ${product.colors.map(c => `
            <div class="swatch-dot" style="background-color: ${c.hex}; width: 22px; height: 22px; ${c.name === state.selectedQuickViewColor ? 'border: 2px solid var(--gold-primary); transform: scale(1.1);' : ''}" 
                 onclick="selectQuickViewColor('${c.name}', this)" title="${c.name}"></div>
          `).join('')}
        </div>
      </div>

      <!-- Size Selector -->
      <div style="margin-bottom: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <label style="font-size: 0.75rem; letter-spacing: 1.5px; text-transform: uppercase; color: var(--text-secondary);">
            Bespoke Sizing
          </label>
          <span style="font-size: 0.75rem; color: var(--gold-primary); cursor: pointer;" onclick="showToast('Leo Maison client concierge will arrange private bespoke fitting if requested.')">
            📐 Size & Measurement Guide
          </span>
        </div>
        <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px;">
          ${product.sizes.map((size) => `
            <button class="size-pill ${size === state.selectedQuickViewSize ? 'active' : ''}" 
                    onclick="selectQuickViewSize('${size}', this)">
              ${size}
            </button>
          `).join('')}
        </div>
      </div>

      <!-- Fabric & Heritage Accordion -->
      <div style="margin-bottom: 24px; padding: 12px 14px; background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle); border-radius: 4px;">
        <span style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; color: var(--gold-hover); display: block; font-weight: 600; margin-bottom: 4px;">
          Artisanal Heritage & Textile Composition:
        </span>
        <p style="font-size: 0.8rem; color: var(--text-secondary); line-height: 1.5; margin: 0;">
          ${product.fabricDetail}
        </p>
      </div>

      <!-- Actions -->
      <div class="quickview-actions-wrap">
        <div class="cart-qty-control quickview-qty-control">
          <button type="button" class="qty-btn" onclick="adjustQuickViewQty(-1)" aria-label="Decrease quantity">−</button>
          <input type="number" 
                 class="qty-input" 
                 id="quickViewQtyVal" 
                 value="${state.quickViewQty}" 
                 min="1" 
                 max="${product.inStock || 99}" 
                 onfocus="this.select()"
                 oninput="onQuickViewQtyInput(this)" 
                 onblur="onQuickViewQtyBlur(this)" 
                 onkeydown="handleQtyInputKeyDown(event, this, adjustQuickViewQty)"
                 aria-label="Garment quantity" />
          <button type="button" class="qty-btn" onclick="adjustQuickViewQty(1)" aria-label="Increase quantity">+</button>
        </div>

        <button type="button" class="btn-luxury quickview-add-btn" onclick="addQuickViewToCart()">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink: 0; margin-right: 4px;">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 0 1-8 0"/>
          </svg>
          <span>Add to Shopping Bag</span>
        </button>
      </div>

      <div class="quickview-stock-indicator">
        <span class="stock-dot"></span>
        <span>In Stock (${product.inStock} garments remaining in European Flagships)</span>
      </div>
    </div>
  `;

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeQuickView() {
  const modal = $('#quickViewModal');
  if (modal) modal.classList.remove('active');
  document.body.style.overflow = '';
}

function switchQuickViewImg(src, thumbEl) {
  const mainImg = $('#quickViewMainImg');
  if (mainImg) mainImg.src = src;
  $$('.quickview-thumb-item').forEach(el => el.classList.remove('active'));
  if (thumbEl) thumbEl.classList.add('active');
}

function selectQuickViewColor(colorName, dotEl) {
  state.selectedQuickViewColor = colorName;
  const label = $('#selectedColorLabel');
  if (label) label.textContent = colorName;
  $$('.swatch-dot').forEach(el => {
    el.style.border = '';
    el.style.transform = '';
  });
  if (dotEl) {
    dotEl.style.border = '2px solid var(--gold-primary)';
    dotEl.style.transform = 'scale(1.1)';
  }
}

function selectQuickViewSize(size, btnEl) {
  state.selectedQuickViewSize = size;
  $$('.size-pill').forEach(el => el.classList.remove('active'));
  if (btnEl) btnEl.classList.add('active');
}

function adjustQuickViewQty(delta) {
  const maxStock = state.selectedQuickViewProduct ? (state.selectedQuickViewProduct.inStock || 99) : 99;
  state.quickViewQty = Math.max(1, Math.min(maxStock, state.quickViewQty + delta));
  const el = $('#quickViewQtyVal');
  if (el) {
    if (el.tagName === 'INPUT') el.value = state.quickViewQty;
    else el.textContent = state.quickViewQty;
  }
}

function onQuickViewQtyInput(inputEl) {
  if (!inputEl) return;
  let val = parseInt(inputEl.value, 10);
  const maxStock = state.selectedQuickViewProduct ? (state.selectedQuickViewProduct.inStock || 99) : 99;

  if (isNaN(val)) return; // Allow user to type freely
  if (val > maxStock) {
    val = maxStock;
    inputEl.value = val;
    showToast(`Maximum available bespoke stock is ${maxStock} garments.`, 'warning');
  }
  if (val >= 1) {
    state.quickViewQty = val;
  }
}

function onQuickViewQtyBlur(inputEl) {
  if (!inputEl) return;
  let val = parseInt(inputEl.value, 10);
  const maxStock = state.selectedQuickViewProduct ? (state.selectedQuickViewProduct.inStock || 99) : 99;

  if (isNaN(val) || val < 1) {
    val = 1;
  } else if (val > maxStock) {
    val = maxStock;
  }
  inputEl.value = val;
  state.quickViewQty = val;
}

function handleQtyInputKeyDown(e, inputEl, adjustFn) {
  if (e.key === 'ArrowUp') {
    e.preventDefault();
    adjustFn(1);
  } else if (e.key === 'ArrowDown') {
    e.preventDefault();
    adjustFn(-1);
  } else if (e.key === 'Enter') {
    e.preventDefault();
    inputEl.blur();
  }
}

function addQuickViewToCart() {
  if (!state.selectedQuickViewProduct) return;
  addToCart(
    state.selectedQuickViewProduct.id,
    state.selectedQuickViewSize,
    state.selectedQuickViewColor,
    state.quickViewQty
  );
  closeQuickView();
  openCartDrawer();
}

/* ==========================================================================
   Shopping Bag & Cart Management
   ========================================================================== */
function openCartDrawer() {
  renderCartDrawer();
  const drawer = $('#cartDrawer');
  const backdrop = $('#cartBackdrop');
  if (drawer) drawer.classList.add('active');
  if (backdrop) backdrop.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeCartDrawer() {
  const drawer = $('#cartDrawer');
  const backdrop = $('#cartBackdrop');
  if (drawer) drawer.classList.remove('active');
  if (backdrop) backdrop.classList.remove('active');
  document.body.style.overflow = '';
}

function quickAddToCart(productId) {
  const product = state.products.find(p => p.id === productId);
  if (!product) return;
  const size = product.sizes[0] || 'Standard';
  const color = product.colors[0] ? product.colors[0].name : 'Default';
  addToCart(productId, size, color, 1);
  openCartDrawer();
}

function addToCart(productId, size, color, qty = 1) {
  const product = state.products.find(p => p.id === productId);
  if (!product) return;

  const existingIndex = state.cart.findIndex(
    item => item.id === productId && item.size === size && item.color === color
  );

  if (existingIndex > -1) {
    state.cart[existingIndex].qty += qty;
  } else {
    state.cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      size: size,
      color: color,
      qty: qty
    });
  }

  saveCart();
  updateCartBadges();
  showToast(`Added "${product.name}" to shopping bag`);
}

function updateCartItemQty(index, delta) {
  if (state.cart[index]) {
    state.cart[index].qty += delta;
    if (state.cart[index].qty <= 0) {
      removeCartItem(index);
      return;
    }
    saveCart();
    renderCartDrawer();
    updateCartBadges();
  }
}

function removeCartItem(index) {
  state.cart.splice(index, 1);
  saveCart();
  renderCartDrawer();
  updateCartBadges();
  showToast(`Removed item from shopping bag`);
}

function handleCartItemQtyInput(index, inputEl) {
  if (!inputEl || !state.cart[index]) return;
  let val = parseInt(inputEl.value, 10);
  if (isNaN(val)) return;
  if (val > 99) {
    val = 99;
    inputEl.value = val;
  }
  if (val >= 1) {
    state.cart[index].qty = val;
    saveCart();
    updateCartBadges();
  }
}

function handleCartItemQtyChange(index, inputEl) {
  if (!inputEl || !state.cart[index]) return;
  let val = parseInt(inputEl.value, 10);
  if (isNaN(val) || val < 1) {
    val = 1;
  } else if (val > 99) {
    val = 99;
  }
  inputEl.value = val;
  state.cart[index].qty = val;
  saveCart();
  renderCartDrawer();
  updateCartBadges();
}

function handleCartItemQtyBlur(index, inputEl) {
  handleCartItemQtyChange(index, inputEl);
}

function handleCartQtyKeyDown(e, index, inputEl) {
  if (e.key === 'ArrowUp') {
    e.preventDefault();
    updateCartItemQty(index, 1);
  } else if (e.key === 'ArrowDown') {
    e.preventDefault();
    updateCartItemQty(index, -1);
  } else if (e.key === 'Enter') {
    e.preventDefault();
    inputEl.blur();
  }
}

function saveCart() {
  localStorage.setItem('leo_cart', JSON.stringify(state.cart));
}

function updateCartBadges() {
  const totalCount = state.cart.reduce((sum, item) => sum + item.qty, 0);
  const badge = $('#cartBadge');
  const mobileBadge = $('#mobileCartBadge');

  [badge, mobileBadge].forEach(b => {
    if (b) {
      b.textContent = totalCount;
      b.style.display = totalCount > 0 ? 'inline-flex' : 'none';
    }
  });
}

function renderCartDrawer() {
  const listEl = $('#cartItemsList');
  const subtotalEl = $('#cartSubtotal');
  const discountRow = $('#cartDiscountRow');
  const discountEl = $('#cartDiscount');
  const finalTotalEl = $('#cartFinalTotal');
  const progressText = $('#shippingProgressText');
  const progressBar = $('#shippingBarFill');

  if (!listEl) return;

  if (state.cart.length === 0) {
    listEl.innerHTML = `
      <div class="cart-empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color: var(--text-muted); margin-bottom: 14px;">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
        </svg>
        <p style="font-family: var(--font-serif); font-size: 1.15rem; margin-bottom: 6px;">Your Shopping Bag is Empty</p>
        <p style="font-size: 0.8rem; color: var(--text-muted); max-width: 240px; margin: 0 auto 20px;">Explore our Milanese and Parisian runway creations.</p>
        <button class="btn-outline" style="padding: 8px 18px;" onclick="closeCartDrawer()">Explore Catalog</button>
      </div>
    `;
    if (subtotalEl) subtotalEl.textContent = formatPrice(0);
    if (finalTotalEl) finalTotalEl.textContent = formatPrice(0);
    if (discountRow) discountRow.style.display = 'none';
    if (progressText) progressText.textContent = `Add ${formatPrice(state.freeShippingThreshold)} for complimentary white-glove shipping`;
    if (progressBar) progressBar.style.width = '0%';
    return;
  }

  // Calculate totals
  const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  let discount = 0;

  if (state.appliedPromo) {
    if (state.appliedPromo.discountPercent) {
      discount = (subtotal * state.appliedPromo.discountPercent) / 100;
    } else if (state.appliedPromo.discountAmount) {
      discount = state.appliedPromo.discountAmount;
    }
  }

  const finalTotal = Math.max(0, subtotal - discount);

  // Render items
  listEl.innerHTML = state.cart.map((item, idx) => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.name}" class="cart-item-img" />
      <div class="cart-item-info">
        <h5 class="cart-item-title">${item.name}</h5>
        <div class="cart-item-meta">
          <span>${item.size}</span> • <span>${item.color}</span>
        </div>
        <div class="cart-item-price">${formatPrice(item.price)}</div>
        <div class="cart-item-actions">
          <div class="cart-qty-control">
            <button type="button" class="qty-btn" onclick="updateCartItemQty(${idx}, -1)" aria-label="Decrease quantity">−</button>
            <input type="number" 
                   class="qty-input" 
                   value="${item.qty}" 
                   min="1" 
                   max="99" 
                   onfocus="this.select()"
                   oninput="handleCartItemQtyInput(${idx}, this)" 
                   onchange="handleCartItemQtyChange(${idx}, this)" 
                   onblur="handleCartItemQtyBlur(${idx}, this)"
                   onkeydown="handleCartQtyKeyDown(event, ${idx}, this)"
                   aria-label="Item quantity" />
            <button type="button" class="qty-btn" onclick="updateCartItemQty(${idx}, 1)" aria-label="Increase quantity">+</button>
          </div>
          <button class="btn-remove-item" onclick="removeCartItem(${idx})" aria-label="Remove item">Remove</button>
        </div>
      </div>
    </div>
  `).join('');

  if (subtotalEl) subtotalEl.textContent = formatPrice(subtotal);
  if (finalTotalEl) finalTotalEl.textContent = formatPrice(finalTotal);

  if (discount > 0 && discountRow && discountEl) {
    discountRow.style.display = 'flex';
    discountEl.textContent = `-${formatPrice(discount)}`;
  } else if (discountRow) {
    discountRow.style.display = 'none';
  }

  // Free shipping progress calculation
  const remaining = Math.max(0, state.freeShippingThreshold - subtotal);
  const percent = Math.min(100, Math.round((subtotal / state.freeShippingThreshold) * 100));

  if (progressBar) progressBar.style.width = `${percent}%`;
  if (progressText) {
    if (remaining === 0) {
      progressText.innerHTML = `✨ <strong>Complimentary White-Glove VIP Delivery Unlocked!</strong>`;
    } else {
      progressText.innerHTML = `Add <strong>${formatPrice(remaining)}</strong> more to receive complimentary white-glove shipping`;
    }
  }
}

function applyCouponCode() {
  const input = $('#couponInput');
  if (!input) return;
  const code = input.value.trim().toUpperCase();

  const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  if (PROMO_CODES[code]) {
    const promo = PROMO_CODES[code];
    if (subtotal < promo.minOrder) {
      showToast(`Promo ${code} requires order over ${formatPrice(promo.minOrder)}`, 'warning');
      return;
    }
    state.appliedPromo = promo;
    renderCartDrawer();
    showToast(`Promo code applied: ${promo.desc}`);
  } else {
    showToast(`Invalid promo code. Try: LEOVIP10 or PARIS2026`, 'error');
  }
}

/* ==========================================================================
   Instant Checkout Modal & Persistence to MySQL
   ========================================================================== */
function openCheckoutModal() {
  if (state.cart.length === 0) {
    showToast('Your shopping bag is empty. Please select a design first.', 'warning');
    return;
  }
  closeCartDrawer();
  renderCheckoutReview();
  const modal = $('#checkoutModal');
  if (modal) modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeCheckoutModal() {
  const modal = $('#checkoutModal');
  if (modal) modal.classList.remove('active');
  document.body.style.overflow = '';
}

function renderCheckoutReview() {
  const container = $('#checkoutReviewItems');
  const subtotalEl = $('#checkoutReviewSubtotal');
  const discountRow = $('#checkoutReviewDiscountRow');
  const discountEl = $('#checkoutReviewDiscount');
  const totalEl = $('#checkoutReviewTotal');

  if (!container) return;

  const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  let discount = 0;
  if (state.appliedPromo) {
    if (state.appliedPromo.discountPercent) {
      discount = (subtotal * state.appliedPromo.discountPercent) / 100;
    } else if (state.appliedPromo.discountAmount) {
      discount = state.appliedPromo.discountAmount;
    }
  }
  const finalTotal = Math.max(0, subtotal - discount);

  container.innerHTML = state.cart.map(item => `
    <div class="review-item-row" style="display: flex; gap: 12px; align-items: center; margin-bottom: 12px;">
      <img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;" />
      <div style="flex: 1;">
        <h6 style="font-size: 0.85rem; margin: 0;">${item.name}</h6>
        <span style="font-size: 0.75rem; color: var(--text-muted);">${item.size} • ${item.color} (x${item.qty})</span>
      </div>
      <span style="font-size: 0.85rem; font-weight: 600;">${formatPrice(item.price * item.qty)}</span>
    </div>
  `).join('');

  if (subtotalEl) subtotalEl.textContent = formatPrice(subtotal);
  if (totalEl) totalEl.textContent = formatPrice(finalTotal);

  if (discount > 0 && discountRow && discountEl) {
    discountRow.style.display = 'flex';
    discountEl.textContent = `-${formatPrice(discount)}`;
  } else if (discountRow) {
    discountRow.style.display = 'none';
  }
}

function switchPaymentMethod(method) {
  $$('.payment-method-card').forEach(el => el.classList.remove('active'));
  const card = $(`#methodCard_${method}`);
  if (card) {
    card.classList.add('active');
    const input = card.querySelector('input');
    if (input) input.checked = true;
  }

  // Toggle subviews
  const visaForm = $('#visaCardForm');
  const paypalForm = $('#paypalForm');
  const vietqrForm = $('#vietqrForm');
  const codForm = $('#codForm');

  if (visaForm) visaForm.style.display = method === 'visa' ? 'block' : 'none';
  if (paypalForm) paypalForm.style.display = method === 'paypal' ? 'block' : 'none';
  if (vietqrForm) vietqrForm.style.display = method === 'vietqr' ? 'block' : 'none';
  if (codForm) codForm.style.display = method === 'cod' ? 'block' : 'none';
}

function updateCardNumber(input) {
  let val = input.value.replace(/\D/g, '').substring(0, 16);
  val = val.replace(/(.{4})/g, '$1 ').trim();
  input.value = val;
  const display = $('#cardDisplayNumber');
  if (display) display.textContent = val || '4242 •••• •••• 4242';
}

function updateCardHolder(input) {
  const display = $('#cardDisplayHolder');
  if (display) display.textContent = input.value.toUpperCase() || 'ALEXANDER MONTGOMERY';
}

function updateCardExpiry(input) {
  let val = input.value.replace(/\D/g, '').substring(0, 4);
  if (val.length >= 2) val = val.substring(0, 2) + '/' + val.substring(2);
  input.value = val;
  const display = $('#cardDisplayExpiry');
  if (display) display.textContent = val || '12/28';
}

async function processOrderSubmit(e) {
  if (e) e.preventDefault();

  const name = $('#custName')?.value.trim();
  const phone = $('#custPhone')?.value.trim();
  const email = $('#custEmail')?.value.trim();
  const address = $('#custAddress')?.value.trim();
  const notes = $('#custNotes')?.value.trim();
  const paymentMethod = $('input[name="payment_method"]:checked')?.value || 'visa';

  if (!name || !phone || !address) {
    showToast('Please provide your Full Name, Phone Number, and Delivery Address.', 'warning');
    return;
  }

  const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  let discount = 0;
  if (state.appliedPromo) {
    if (state.appliedPromo.discountPercent) {
      discount = (subtotal * state.appliedPromo.discountPercent) / 100;
    } else if (state.appliedPromo.discountAmount) {
      discount = state.appliedPromo.discountAmount;
    }
  }
  const finalTotal = Math.max(0, subtotal - discount);

  const newOrder = {
    orderId: 'LEO-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000),
    customerId: state.currentUser?.id || 'GUEST',
    customer: {
      name: name,
      phone: phone,
      email: email,
      address: address,
      notes: notes
    },
    paymentMethod: paymentMethod,
    status: 'pending',
    items: [...state.cart],
    total: finalTotal,
    currency: state.currency,
    date: new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
  };

  // Submit directly to MySQL Database via PHP API
  try {
    const res = await fetch('api/orders.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newOrder)
    });
    if (res.ok) {
      const resData = await res.json();
      if (resData.orderId) {
        newOrder.orderId = resData.orderId;
      }
    }
  } catch (err) {
    console.warn('Persisting order locally:', err);
  }

  // Update local state and storage
  state.orders.unshift(newOrder);
  localStorage.setItem('leo_orders', JSON.stringify(state.orders));

  // Clear cart
  state.cart = [];
  saveCart();
  updateCartBadges();

  closeCheckoutModal();
  openSuccessModal(newOrder);
}

function processPayPalQuickPay() {
  showToast('Connecting securely to European PayPal VIP gateway...');
  setTimeout(() => {
    processOrderSubmit();
  }, 1200);
}

function openSuccessModal(order) {
  const modal = $('#successModal');
  const body = $('#successModalBody');

  body.innerHTML = `
    <div style="text-align: center; padding: 32px 20px;">
      <div style="width: 70px; height: 70px; margin: 0 auto 20px; background: rgba(197, 160, 89, 0.15); border: 2px solid var(--gold-primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2rem;">
        👑
      </div>
      <span class="gold-badge" style="margin-bottom: 8px;">Order Confirmed & Logged to Database</span>
      <h3 style="font-family: var(--font-serif); font-size: 1.8rem; margin: 12px 0 8px;">Acquisition Received</h3>
      <p style="font-size: 0.85rem; color: var(--text-secondary); max-width: 440px; margin: 0 auto 20px; line-height: 1.6;">
        Thank you, <strong>${order.customer.name}</strong>. Your bespoke order has been registered under reference 
        <strong style="color: var(--gold-hover);">${order.orderId}</strong>.
      </p>

      <div style="background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle); border-radius: 6px; padding: 18px; margin-bottom: 24px; text-align: left; font-size: 0.82rem;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span style="color: var(--text-muted);">Acquisition Total:</span>
          <strong>${formatPrice(order.total)}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span style="color: var(--text-muted);">Payment Method:</span>
          <span style="text-transform: uppercase;">${order.paymentMethod}</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span style="color: var(--text-muted);">White-Glove Delivery:</span>
          <span>${order.customer.address}</span>
        </div>
      </div>

      <div style="display: flex; gap: 12px; justify-content: center;">
        <button class="btn-luxury" onclick="closeSuccessModal()">Continue Browsing</button>
        <button class="btn-outline" onclick="closeSuccessModal(); openCustomerProfile();">View Portfolio</button>
      </div>
    </div>
  `;

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeSuccessModal() {
  const modal = $('#successModal');
  if (modal) modal.classList.remove('active');
  document.body.style.overflow = '';
}

/* ==========================================================================
   Curated Wishlist
   ========================================================================== */
function toggleWishlist(productId, e) {
  if (e) e.stopPropagation();
  const index = state.wishlist.indexOf(productId);
  if (index > -1) {
    state.wishlist.splice(index, 1);
    showToast('Removed design from your curated wishlist');
  } else {
    state.wishlist.push(productId);
    showToast('Added design to your curated wishlist');
  }

  localStorage.setItem('leo_wishlist', JSON.stringify(state.wishlist));
  updateWishlistBadges();
  renderProducts();
}

function updateWishlistBadges() {
  const count = state.wishlist.length;
  const badge = $('#wishlistBadge');
  const mobileBadge = $('#mobileWishlistBadge');
  [badge, mobileBadge].forEach(b => {
    if (b) {
      b.textContent = count;
      b.style.display = count > 0 ? 'inline-flex' : 'none';
    }
  });
}

function openWishlistModal() {
  renderWishlistModal();
  const modal = $('#wishlistModal');
  if (modal) modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeWishlistModal() {
  const modal = $('#wishlistModal');
  if (modal) modal.classList.remove('active');
  document.body.style.overflow = '';
}

function renderWishlistModal() {
  const container = $('#wishlistItems');
  if (!container) return;

  const items = state.products.filter(p => state.wishlist.includes(p.id));

  if (items.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px 10px; color: var(--text-muted);">
        <p style="font-family: var(--font-serif); font-size: 1.15rem; margin-bottom: 6px;">Your Wishlist is Empty</p>
        <p style="font-size: 0.8rem;">Tap the heart icon on any design to curate your personal runway selection.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = items.map(p => `
    <div style="display: flex; gap: 14px; align-items: center; padding-bottom: 14px; margin-bottom: 14px; border-bottom: 1px solid var(--border-subtle);">
      <img src="${p.images[0]}" alt="${p.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px;" />
      <div style="flex: 1;">
        <h6 style="font-size: 0.9rem; margin: 0 0 4px;">${p.name}</h6>
        <span style="font-size: 0.85rem; font-weight: 600; color: var(--gold-hover);">${formatPrice(p.price)}</span>
      </div>
      <div style="display: flex; gap: 8px;">
        <button class="btn-luxury" style="padding: 6px 12px; font-size: 0.75rem;" onclick="quickAddToCart('${p.id}'); closeWishlistModal();">
          Add to Bag
        </button>
        <button class="btn-remove-item" onclick="toggleWishlist('${p.id}'); renderWishlistModal();" aria-label="Remove">
          ✕
        </button>
      </div>
    </div>
  `).join('');
}

/* ==========================================================================
   Live Search
   ========================================================================== */
function openSearchOverlay() {
  const overlay = $('#searchOverlay');
  if (overlay) {
    overlay.classList.add('active');
    const input = $('#liveSearchInput');
    if (input) {
      input.value = '';
      input.focus();
    }
  }
}

function closeSearchOverlay() {
  const overlay = $('#searchOverlay');
  if (overlay) overlay.classList.remove('active');
}

function handleLiveSearch(e) {
  const query = e.target.value.toLowerCase().trim();
  const grid = $('#searchResultsGrid');
  if (!grid) return;

  if (!query) {
    grid.innerHTML = '';
    return;
  }

  const results = state.products.filter(p => 
    p.name.toLowerCase().includes(query) || 
    p.shortDesc.toLowerCase().includes(query) ||
    p.fabricDetail.toLowerCase().includes(query)
  );

  if (results.length === 0) {
    grid.innerHTML = `<p style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 30px;">No matching luxury designs found.</p>`;
    return;
  }

  grid.innerHTML = results.map(p => `
    <div class="product-card" onclick="closeSearchOverlay(); openQuickView('${p.id}')">
      <div class="card-media">
        <img src="${p.images[0]}" alt="${p.name}" class="card-img-primary" />
      </div>
      <div class="card-body">
        <h4 class="card-title">${p.name}</h4>
        <div class="price-current">${formatPrice(p.price)}</div>
      </div>
    </div>
  `).join('');
}

/* ==========================================================================
   Top-Center Luxury Alert & Notification Banner
   ========================================================================== */
function showToast(message, type = 'success') {
  let container = $('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const icons = {
    success: '✨',
    error: '⚠️',
    warning: '🔔',
    info: '💎'
  };

  const toast = document.createElement('div');
  toast.className = `toast-item toast-${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || '✨'}</span>
    <div class="toast-text">${message}</div>
    <span class="toast-close-btn" title="Dismiss">✕</span>
  `;

  // Dismiss immediately when clicked
  toast.addEventListener('click', () => {
    toast.classList.add('fade-out');
    setTimeout(() => toast.remove(), 300);
  });

  container.appendChild(toast);

  // Auto-dismiss after 3.2s
  setTimeout(() => {
    if (toast.parentElement) {
      toast.classList.add('fade-out');
      setTimeout(() => toast.remove(), 300);
    }
  }, 3200);
}

/* ==========================================================================
   VIP Club Newsletter
   ========================================================================== */
function initEventListeners() {
  const form = $('#vipClubForm');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const emailInput = $('#vipEmail');
      if (emailInput && emailInput.value) {
        const email = emailInput.value.trim();
        try {
          await fetch('api/subscribe.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
          });
        } catch (err) {
          console.warn('Local newsletter register:', err);
        }
        showToast(`Thank you! Leo Privé VIP privilege activated for ${email}`);
        emailInput.value = '';
      }
    });
  }

  // Filter tabs click
  $$('.filter-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      $$('.filter-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      state.currentCategory = tab.getAttribute('data-category');
      renderProducts();
    });
  });

  // Sort select change
  const sortSelect = $('#sortSelect');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      state.currentSort = e.target.value;
      renderProducts();
    });
  }
}

/* ==========================================================================
   Authentication, Roles & Portals (Admin, Seller, VIP Customer)
   ========================================================================== */
function initAuthState() {
  const saved = localStorage.getItem('leo_current_user');
  if (saved) {
    state.currentUser = JSON.parse(saved);
  }
}

function updateUserHeaderUI() {
  const wrap = $('#userHeaderMenuWrap');
  const mobileSec = $('#mobileUserSection');
  const user = state.currentUser;
  const isGuest = !user || user.role === 'guest';

  const getRoleBadge = (role) => {
    if (role === 'admin') return '<span class="role-badge role-badge-admin">Admin</span>';
    if (role === 'seller') return '<span class="role-badge role-badge-seller">Partner</span>';
    if (role === 'customer') return '<span class="role-badge role-badge-customer">VIP Gold</span>';
    return '<span class="role-badge role-badge-guest">Guest</span>';
  };

  const getRoleAction = (role) => {
    if (role === 'admin') return `<div class="dropdown-item" onclick="openAdminDashboard(); closeUserDropdown();">👑 Admin Control Center</div>`;
    if (role === 'seller') return `<div class="dropdown-item" onclick="openSellerDashboard(); closeUserDropdown();">✂️ Atelier Partner Portal</div>`;
    if (role === 'customer') return `<div class="dropdown-item" onclick="openCustomerProfile(); closeUserDropdown();">💎 VIP Privé Profile</div>`;
    return `<div class="dropdown-item" onclick="openAuthModal(); closeUserDropdown();">🔐 Sign In / Register</div>`;
  };

  if (wrap) {
    if (isGuest) {
      wrap.innerHTML = `
        <button class="btn-header-auth" onclick="toggleUserDropdown(event)" aria-label="Sign In" title="Account Access">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
          </svg>
          <span>Sign In</span>
        </button>

        <div class="user-dropdown-menu" id="userHeaderDropdown">
          <div class="user-dropdown-header">
            <h5>Guest Patron</h5>
            <p>Welcome to Leo Maison</p>
          </div>
          <div class="dropdown-item" onclick="openAuthModal(); closeUserDropdown();">
            <span>🔐</span>
            <span>Sign In / Register</span>
          </div>
          <div class="dropdown-item" onclick="openAuthModal(); closeUserDropdown();">
            <span>⚡</span>
            <span>Switch Role (Demo)</span>
          </div>
        </div>
      `;
    } else {
      wrap.innerHTML = `
        <div class="btn-header-user" onclick="toggleUserDropdown(event)" role="button" aria-haspopup="true" title="${user.name}">
          <img src="${user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}" class="user-header-avatar" alt="${user.name}" />
          <div class="user-header-info">
            <span class="user-header-name">${user.name}</span>
            ${getRoleBadge(user.role)}
          </div>
        </div>

        <div class="user-dropdown-menu" id="userHeaderDropdown">
          <div class="user-dropdown-header">
            <h5>${user.name}</h5>
            <p>${user.title || user.email}</p>
          </div>
          ${getRoleAction(user.role)}
          <div class="dropdown-item" onclick="openAuthModal(); closeUserDropdown();">
            <span>⚡</span>
            <span>Switch Role (Demo)</span>
          </div>
          <div class="dropdown-divider"></div>
          <div class="dropdown-item" onclick="logoutUser(); closeUserDropdown();" style="color: #e74c3c;">
            <span>🚪</span>
            <span>Sign Out</span>
          </div>
        </div>
      `;
    }
  }

  if (mobileSec) {
    mobileSec.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px;">
        <img src="${user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}" 
             style="width: 42px; height: 42px; border-radius: 50%; object-fit: cover; border: 1px solid var(--gold-primary);" alt="${user?.name || 'Guest'}" />
        <div style="flex: 1;">
          <h6 style="margin: 0; font-size: 0.9rem;">${user?.name || 'Guest Patron'}</h6>
          <div style="margin-top: 3px;">${getRoleBadge(user?.role || 'guest')}</div>
        </div>
      </div>
      <div style="margin-top: 10px; display: flex; gap: 8px; flex-wrap: wrap;">
        ${user?.role === 'admin' ? `<button class="btn-luxury" style="padding: 6px 12px; font-size: 0.72rem;" onclick="closeMobileMenu(); openAdminDashboard();">Admin Control</button>` : ''}
        ${user?.role === 'seller' ? `<button class="btn-luxury" style="padding: 6px 12px; font-size: 0.72rem;" onclick="closeMobileMenu(); openSellerDashboard();">Atelier Portal</button>` : ''}
        ${user?.role === 'customer' ? `<button class="btn-luxury" style="padding: 6px 12px; font-size: 0.72rem;" onclick="closeMobileMenu(); openCustomerProfile();">Privé Hub</button>` : ''}
        <button class="btn-outline" style="padding: 6px 12px; font-size: 0.72rem;" onclick="closeMobileMenu(); openAuthModal();">Switch Role</button>
      </div>
    `;
  }

  // Refresh lookbook buttons (e.g. show/hide Edit Hotspots button for seller/admin)
  renderLookbook();
}

function toggleUserDropdown(e) {
  if (e) e.stopPropagation();
  const menu = $('#userHeaderDropdown');
  if (menu) menu.classList.toggle('active');
}

function closeUserDropdown() {
  const menu = $('#userHeaderDropdown');
  if (menu) menu.classList.remove('active');
}

document.addEventListener('click', (e) => {
  const wrap = $('#userHeaderMenuWrap');
  const menu = $('#userHeaderDropdown');
  if (menu && wrap && !wrap.contains(e.target)) {
    menu.classList.remove('active');
  }
});

function openAuthModal() {
  const modal = $('#authModal');
  if (modal) modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeAuthModal() {
  const modal = $('#authModal');
  if (modal) modal.classList.remove('active');
  document.body.style.overflow = '';
}

function switchAuthTab(tab) {
  const loginForm = $('#loginForm');
  const registerForm = $('#registerForm');
  const tabLogin = $('#tabAuthLogin');
  const tabRegister = $('#tabAuthRegister');

  if (tab === 'login') {
    if (loginForm) loginForm.style.display = 'block';
    if (registerForm) registerForm.style.display = 'none';
    if (tabLogin) tabLogin.classList.add('active');
    if (tabRegister) tabRegister.classList.remove('active');
  } else {
    if (loginForm) loginForm.style.display = 'none';
    if (registerForm) registerForm.style.display = 'block';
    if (tabLogin) tabLogin.classList.remove('active');
    if (tabRegister) tabRegister.classList.add('active');
  }
}

function loginAsRole(role) {
  if (role === 'guest') {
    state.currentUser = { role: 'guest', name: 'Guest Patron' };
  } else {
    const user = state.users.find(u => u.role === role);
    if (user) state.currentUser = { ...user };
  }

  localStorage.setItem('leo_current_user', JSON.stringify(state.currentUser));
  updateUserHeaderUI();
  closeAuthModal();

  let welcomeMsg = `Switched to ${role.toUpperCase()}: ${state.currentUser.name}`;
  showToast(welcomeMsg);

  if (role === 'admin') openAdminDashboard();
  if (role === 'seller') openSellerDashboard();
  if (role === 'customer') openCustomerProfile();
}

async function handleUserLogin(e) {
  e.preventDefault();
  const email = $('#loginEmail')?.value.trim();
  const password = $('#loginPassword')?.value.trim();

  // Try API login
  try {
    const res = await fetch('api/auth.php?action=login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.user) {
        state.currentUser = data.user;
        localStorage.setItem('leo_current_user', JSON.stringify(state.currentUser));
        updateUserHeaderUI();
        closeAuthModal();
        showToast(`Welcome back, ${data.user.name}`);
        return;
      }
    }
  } catch (err) {
    console.warn('API authentication unavailable, verifying with local data:', err);
  }

  const user = state.users.find(u => u.email === email && u.password === password);
  if (!user) {
    showToast('Invalid email or password. Please verify or use Instant Role Switcher.', 'error');
    return;
  }

  state.currentUser = { ...user };
  localStorage.setItem('leo_current_user', JSON.stringify(state.currentUser));
  updateUserHeaderUI();
  closeAuthModal();
  showToast(`Welcome back, ${user.name}`);
}

async function handleUserRegister(e) {
  e.preventDefault();
  const name = $('#regName')?.value.trim();
  const email = $('#regEmail')?.value.trim();
  const password = $('#regPassword')?.value.trim();
  const role = $('#regRole')?.value || 'customer';

  if (!name || !email || !password) {
    showToast('Please complete all registration fields.', 'warning');
    return;
  }

  try {
    const res = await fetch('api/auth.php?action=register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role })
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.user) {
        state.currentUser = data.user;
        state.users.push(data.user);
        localStorage.setItem('leo_current_user', JSON.stringify(state.currentUser));
        localStorage.setItem('leo_users', JSON.stringify(state.users));
        updateUserHeaderUI();
        closeAuthModal();
        showToast(`Registration complete. Welcome to Leo Privé, ${name}!`);
        return;
      }
    }
  } catch (err) {
    console.warn('API registration unavailable, registering locally:', err);
  }

  const newUser = {
    id: `USR-${role.toUpperCase()}-${Math.floor(10 + Math.random() * 90)}`,
    name,
    email,
    password,
    role,
    badgeLabel: role === 'customer' ? 'VIP Privé Member' : 'Atelier Partner',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
  };

  state.users.push(newUser);
  state.currentUser = newUser;
  localStorage.setItem('leo_users', JSON.stringify(state.users));
  localStorage.setItem('leo_current_user', JSON.stringify(state.currentUser));
  updateUserHeaderUI();
  closeAuthModal();
  showToast(`Registration complete. Welcome to Leo Privé, ${name}!`);
}

function logoutUser() {
  state.currentUser = { role: 'guest', name: 'Guest Patron' };
  localStorage.setItem('leo_current_user', JSON.stringify(state.currentUser));
  updateUserHeaderUI();
  showToast('Signed out to Guest Patron account.');
}

/* ==========================================================================
   ADMIN CONTROL CENTER
   ========================================================================== */
function openAdminDashboard() {
  if (state.currentUser.role !== 'admin') {
    showToast('Access restricted to System Administrators.', 'warning');
    loginAsRole('admin');
    return;
  }

  updateDashboardKPIs();
  renderAdminOrders();
  renderAdminProducts();

  const modal = $('#adminDashboardModal');
  if (modal) modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeAdminDashboard() {
  const modal = $('#adminDashboardModal');
  if (modal) modal.classList.remove('active');
  document.body.style.overflow = '';
}

function updateDashboardKPIs() {
  const totalRev = state.orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const revEl = $('#kpiTotalRevenue');
  const ordersEl = $('#kpiTotalOrders');
  const productsEl = $('#kpiTotalProducts');
  const sellerProductsEl = $('#kpiSellerProductsCount');

  if (revEl) revEl.textContent = formatPrice(totalRev);
  if (ordersEl) ordersEl.textContent = state.orders.length;
  if (productsEl) productsEl.textContent = state.products.length;
  if (sellerProductsEl) sellerProductsEl.textContent = state.products.length;
}

function switchAdminTab(tab) {
  const tabOrders = $('#adminTabOrders');
  const tabProducts = $('#adminTabProducts');
  const btnOrders = $('#adminTabOrdersBtn');
  const btnProducts = $('#adminTabProductsBtn');

  if (tab === 'orders') {
    if (tabOrders) tabOrders.style.display = 'block';
    if (tabProducts) tabProducts.style.display = 'none';
    if (btnOrders) btnOrders.classList.add('active');
    if (btnProducts) btnProducts.classList.remove('active');
  } else {
    if (tabOrders) tabOrders.style.display = 'none';
    if (tabProducts) tabProducts.style.display = 'block';
    if (btnOrders) btnOrders.classList.remove('active');
    if (btnProducts) btnProducts.classList.add('active');
  }
}

function renderAdminOrders() {
  const tbody = $('#adminOrdersTableBody');
  if (!tbody) return;

  const statusLabels = {
    pending: '<span class="status-badge status-pending">Awaiting Approval</span>',
    processing: '<span class="status-badge status-processing">In Atelier Tailoring</span>',
    shipping: '<span class="status-badge status-shipping">In White-Glove Transit</span>',
    delivered: '<span class="status-badge status-delivered">Delivered & Signed</span>',
    cancelled: '<span class="status-badge" style="background: rgba(231,76,60,0.15); color: #e74c3c;">Cancelled</span>'
  };

  tbody.innerHTML = state.orders.map(order => `
    <tr>
      <td><strong style="color: var(--gold-hover);">${order.orderId}</strong></td>
      <td>
        <strong>${order.customer?.name || 'Private Client'}</strong><br/>
        <span style="font-size: 0.72rem; color: var(--text-muted);">${order.customer?.phone || ''}</span>
      </td>
      <td>
        ${(order.items || []).map(i => `${i.name} (x${i.qty})`).join('<br/>')}
      </td>
      <td><span style="text-transform: uppercase;">${order.paymentMethod}</span></td>
      <td><strong>${formatPrice(order.total)}</strong></td>
      <td>${statusLabels[order.status] || order.status}</td>
      <td>
        <select onchange="updateOrderStatus('${order.orderId}', this.value)" style="padding: 4px 8px; font-size: 0.75rem; background: var(--bg-surface-elevated); border-radius: 4px;">
          <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
          <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Tailoring</option>
          <option value="shipping" ${order.status === 'shipping' ? 'selected' : ''}>Transit</option>
          <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
          <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
        </select>
      </td>
    </tr>
  `).join('');
}

async function updateOrderStatus(orderId, newStatus) {
  const order = state.orders.find(o => o.orderId === orderId);
  if (order) {
    order.status = newStatus;
    localStorage.setItem('leo_orders', JSON.stringify(state.orders));

    // Update in MySQL via API
    try {
      await fetch('api/orders.php', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: newStatus })
      });
    } catch (err) {
      console.warn('Updated order status locally:', err);
    }

    renderAdminOrders();
    showToast(`Updated order #${orderId} to [${newStatus.toUpperCase()}]`);
  }
}

function renderAdminProducts() {
  const tbody = $('#adminProductsTableBody');
  if (!tbody) return;

  tbody.innerHTML = state.products.map(p => `
    <tr>
      <td><img src="${p.images[0]}" alt="${p.name}" style="width: 44px; height: 44px; object-fit: cover; border-radius: 4px;" /></td>
      <td><strong>${p.name}</strong><br/><span style="font-size: 0.7rem; color: var(--text-muted);">${p.id}</span></td>
      <td><span style="text-transform: uppercase; font-size: 0.75rem;">${p.category}</span></td>
      <td><strong>${formatPrice(p.price)}</strong></td>
      <td>${p.inStock}</td>
      <td>
        <div class="dash-actions-cell">
          <button class="btn-table-action btn-edit-action" onclick="openEditProductModal('${p.id}')">✏️ Edit</button>
          <button class="btn-table-action btn-delete-action" onclick="deleteProduct('${p.id}')">🗑️ Delete</button>
        </div>
      </td>
    </tr>
  `).join('');
}

/* ==========================================================================
   SELLER ATELIER PORTAL
   ========================================================================== */
function openSellerDashboard() {
  if (state.currentUser.role !== 'seller') {
    showToast('Access restricted to Partner Atelier Designers.', 'warning');
    loginAsRole('seller');
    return;
  }

  updateDashboardKPIs();
  renderSellerProducts();

  const modal = $('#sellerDashboardModal');
  if (modal) modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeSellerDashboard() {
  const modal = $('#sellerDashboardModal');
  if (modal) modal.classList.remove('active');
  document.body.style.overflow = '';
}

function renderSellerProducts() {
  const tbody = $('#sellerProductsTableBody');
  if (!tbody) return;

  tbody.innerHTML = state.products.map(p => `
    <tr>
      <td><img src="${p.images[0]}" alt="${p.name}" style="width: 44px; height: 44px; object-fit: cover; border-radius: 4px;" /></td>
      <td><strong>${p.name}</strong><br/><span style="font-size: 0.7rem; color: var(--text-muted);">${p.id}</span></td>
      <td><span style="font-size: 0.78rem; color: var(--text-secondary);">${p.fabricDetail ? p.fabricDetail.substring(0, 42) + '...' : 'Bespoke fabric'}</span></td>
      <td><strong>${formatPrice(p.price)}</strong></td>
      <td><span class="status-badge status-delivered">Available (${p.inStock || 0})</span></td>
      <td>
        <div class="dash-actions-cell">
          <button class="btn-table-action btn-edit-action" onclick="openEditProductModal('${p.id}')">✏️ Edit</button>
          <button class="btn-table-action btn-delete-action" onclick="deleteProduct('${p.id}')">🗑️ Delete</button>
        </div>
      </td>
    </tr>
  `).join('');
}

/* ==========================================================================
   CUSTOMER VIP HUB (Leo Privé Hub)
   ========================================================================== */
function openCustomerProfile() {
  if (state.currentUser.role !== 'customer') {
    loginAsRole('customer');
    return;
  }

  const nameEl = $('#vipCardCustName');
  const pointsEl = $('#vipCardPoints');
  if (nameEl) nameEl.textContent = (state.currentUser.name || 'Alexander Montgomery').toUpperCase();
  if (pointsEl) pointsEl.textContent = `${(state.currentUser.points || 12500).toLocaleString('en-US')} pts`;

  // Populate measurements if present
  if (state.currentUser.measurements) {
    const m = state.currentUser.measurements;
    if ($('#measChest')) $('#measChest').value = m.chest || '';
    if ($('#measWaist')) $('#measWaist').value = m.waist || '';
    if ($('#measShoulder')) $('#measShoulder').value = m.shoulder || '';
    if ($('#measSleeve')) $('#measSleeve').value = m.sleeve || '';
    if ($('#measHeight')) $('#measHeight').value = m.height || '';
    if ($('#measWeight')) $('#measWeight').value = m.weight || '';
  }

  renderCustomerOrders();

  const modal = $('#customerProfileModal');
  if (modal) modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeCustomerProfile() {
  const modal = $('#customerProfileModal');
  if (modal) modal.classList.remove('active');
  document.body.style.overflow = '';
}

function renderCustomerOrders() {
  const container = $('#customerOrdersContainer');
  if (!container) return;

  const orders = state.orders.filter(o => o.customerId === state.currentUser.id || o.customerId === 'USR-CUST-01');

  if (orders.length === 0) {
    container.innerHTML = `<p style="color: var(--text-muted); font-size: 0.85rem;">No recorded acquisitions in this account yet.</p>`;
    return;
  }

  container.innerHTML = orders.map(order => `
    <div style="background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle); border-radius: 6px; padding: 14px 18px; margin-bottom: 12px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
        <div>
          <strong style="color: var(--gold-hover);">${order.orderId}</strong>
          <span style="font-size: 0.75rem; color: var(--text-muted); margin-left: 10px;">${order.date || 'Recent'}</span>
        </div>
        <span class="status-badge status-${order.status}">${order.status.toUpperCase()}</span>
      </div>
      <div style="font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 8px;">
        ${(order.items || []).map(i => `${i.name} (x${i.qty})`).join(' • ')}
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.82rem;">
        <span style="color: var(--text-muted);">Payment: <strong style="text-transform: uppercase;">${order.paymentMethod}</strong></span>
        <span>Total: <strong>${formatPrice(order.total)}</strong></span>
      </div>
    </div>
  `).join('');
}

async function editMeasurements() {
  const measurements = {
    chest: $('#measChest')?.value || '',
    waist: $('#measWaist')?.value || '',
    shoulder: $('#measShoulder')?.value || '',
    sleeve: $('#measSleeve')?.value || '',
    height: $('#measHeight')?.value || '',
    weight: $('#measWeight')?.value || ''
  };

  state.currentUser.measurements = measurements;
  localStorage.setItem('leo_current_user', JSON.stringify(state.currentUser));

  // Sync measurements to MySQL
  try {
    await fetch('api/auth.php?action=measurements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: state.currentUser.id,
        measurements: measurements
      })
    });
  } catch (err) {
    console.warn('Measurements saved locally:', err);
  }

  showToast('Bespoke client dimensions recorded successfully!');
}

/* ==========================================================================
   ADD & EDIT PRODUCT MODAL (Admin & Seller)
   ========================================================================== */
function openAddProductModal() {
  state.editingProductId = null;
  const modal = $('#addProductModal');
  const title = $('#productModalTitle');
  const submitBtn = $('#productModalSubmitBtn');

  if (title) title.textContent = 'Publish New Design to Catalog';
  if (submitBtn) submitBtn.textContent = 'Publish Design to MySQL Database & Storefront';

  // Reset inputs to blank / defaults
  if ($('#newProdName')) $('#newProdName').value = '';
  if ($('#newProdBadge')) $('#newProdBadge').value = 'New Arrival';
  if ($('#newProdCategory')) $('#newProdCategory').value = 'men';
  if ($('#newProdCollection')) $('#newProdCollection').value = 'runway';
  if ($('#newProdPrice')) $('#newProdPrice').value = '';
  if ($('#newProdStock')) $('#newProdStock').value = '8';
  if ($('#newProdDesc')) $('#newProdDesc').value = '';

  // Reset image input rows
  const list = $('#productImagesList');
  if (list) {
    list.innerHTML = `
      <div class="image-input-row">
        <span class="img-row-tag cover-tag">Cover *</span>
        <input type="text" class="prod-img-input" placeholder="Image URL or uploaded file path..."
               value="" oninput="updateImagePreviews()" />
      </div>
    `;
  }

  if (modal) {
    modal.classList.add('active');
    updateImagePreviews();
  }
}

function openEditProductModal(productId) {
  const product = state.products.find(p => p.id === productId);
  if (!product) {
    showToast('Product not found for editing.', 'error');
    return;
  }

  state.editingProductId = productId;
  const modal = $('#addProductModal');
  const title = $('#productModalTitle');
  const submitBtn = $('#productModalSubmitBtn');

  if (title) title.textContent = `Edit Masterpiece: ${product.name}`;
  if (submitBtn) submitBtn.textContent = 'Save Changes & Update Catalog';

  // Populate form with existing product details
  if ($('#newProdName')) $('#newProdName').value = product.name || '';
  if ($('#newProdBadge')) $('#newProdBadge').value = product.badge || '';
  if ($('#newProdCategory')) $('#newProdCategory').value = product.category || 'men';
  if ($('#newProdCollection')) $('#newProdCollection').value = product.collection || 'runway';
  if ($('#newProdPrice')) $('#newProdPrice').value = product.price || '';
  if ($('#newProdStock')) $('#newProdStock').value = product.inStock !== undefined ? product.inStock : 8;
  if ($('#newProdDesc')) $('#newProdDesc').value = product.fabricDetail || product.shortDesc || '';

  // Populate image rows with existing images
  const list = $('#productImagesList');
  if (list) {
    list.innerHTML = '';
    const images = Array.isArray(product.images) && product.images.length > 0 
      ? product.images 
      : [''];

    images.forEach((imgUrl, idx) => {
      const row = document.createElement('div');
      row.className = 'image-input-row';
      const isCover = idx === 0;
      row.innerHTML = `
        <span class="img-row-tag ${isCover ? 'cover-tag' : ''}">${isCover ? 'Cover *' : `Angle ${idx + 1}`}</span>
        <input type="text" class="prod-img-input" placeholder="Image URL or uploaded file path..."
               value="${imgUrl}" oninput="updateImagePreviews()" />
        ${images.length > 1 ? `<button type="button" class="btn-remove-img-row" onclick="removeImageUrlRow(this)" title="Remove image">✕</button>` : ''}
      `;
      list.appendChild(row);
    });
  }

  if (modal) {
    modal.classList.add('active');
    updateImagePreviews();
  }
}

function closeAddProductModal() {
  const modal = $('#addProductModal');
  if (modal) modal.classList.remove('active');
  state.editingProductId = null;
}

/* ==========================================================================
   Drag & Drop and Computer File Upload for Product Images
   ========================================================================== */
function initImageDragAndDrop() {
  const dropzone = $('#imageDropzone');
  const modal = $('#addProductModal');
  if (!dropzone) return;

  // Prevent default window drag behaviors when modal is active
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    window.addEventListener(eventName, (e) => {
      if (modal && modal.classList.contains('active')) {
        e.preventDefault();
      }
    }, false);
  });

  // Dropzone drag-over visual feedback
  ['dragenter', 'dragover'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.add('drag-over');
    });
  });

  ['dragleave', 'dragend'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.remove('drag-over');
    });
  });

  // Drop event on dropzone
  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropzone.classList.remove('drag-over');

    const dt = e.dataTransfer;
    if (dt && dt.files && dt.files.length > 0) {
      handleDroppedImageFiles(dt.files);
    }
  });

  // Also support dragging & dropping directly onto the image rows container
  const imagesList = $('#productImagesList');
  if (imagesList) {
    imagesList.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('drag-over');
    });
    imagesList.addEventListener('dragleave', () => {
      dropzone.classList.remove('drag-over');
    });
    imagesList.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('drag-over');
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleDroppedImageFiles(e.dataTransfer.files);
      }
    });
  }
}

function handleProductFilesSelect(event) {
  if (event.target && event.target.files && event.target.files.length > 0) {
    handleDroppedImageFiles(event.target.files);
    event.target.value = ''; // Reset input to allow selecting same file again
  }
}

async function handleDroppedImageFiles(filesList) {
  const files = Array.from(filesList).filter(file => file.type.startsWith('image/'));

  if (files.length === 0) {
    showToast('Please drop valid image files (JPG, PNG, WEBP, AVIF).', 'warning');
    return;
  }

  const dropzonePrompt = $('#dropzonePrompt');
  const dropzoneLoading = $('#dropzoneLoading');

  if (dropzonePrompt && dropzoneLoading) {
    dropzonePrompt.style.display = 'none';
    dropzoneLoading.style.display = 'flex';
  }

  const formData = new FormData();
  files.forEach(f => formData.append('files[]', f));

  try {
    const res = await fetch('api/upload.php', {
      method: 'POST',
      body: formData
    });

    if (!res.ok) throw new Error(`Server returned HTTP ${res.status}`);

    const data = await res.json();

    if (data.success && Array.isArray(data.urls) && data.urls.length > 0) {
      applyUploadedImageUrls(data.urls);
      showToast(`Added ${data.urls.length} image(s) from computer!`, 'success');
    } else {
      throw new Error(data.message || 'Upload failed');
    }
  } catch (err) {
    console.warn('Server upload failed; switching to local Data URL fallback:', err);
    // Offline / Local fallback: Read file as base64 Data URL
    const localUrls = await Promise.all(files.map(readFileAsDataUrl));
    applyUploadedImageUrls(localUrls);
    showToast(`Added ${localUrls.length} image(s) from computer!`, 'success');
  } finally {
    if (dropzonePrompt && dropzoneLoading) {
      dropzonePrompt.style.display = 'flex';
      dropzoneLoading.style.display = 'none';
    }
  }
}

function readFileAsDataUrl(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
}

function applyUploadedImageUrls(urls) {
  const list = $('#productImagesList');
  if (!list || !urls.length) return;

  const existingInputs = Array.from(list.querySelectorAll('.prod-img-input'));
  let urlIdx = 0;

  // 1. Only fill inputs that are currently BLANK / EMPTY (e.g. initial empty cover or an empty newly added row)
  // NEVER overwrite an existing image!
  for (const input of existingInputs) {
    if (urlIdx >= urls.length) break;
    if (!input.value.trim()) {
      input.value = urls[urlIdx];
      urlIdx++;
    }
  }

  // 2. For all remaining uploaded images, ALWAYS append them as new rows
  // This guarantees that any existing photos are preserved and never replaced!
  while (urlIdx < urls.length) {
    addImageUrlRow(urls[urlIdx]);
    urlIdx++;
  }

  updateImagePreviews();
}

function addImageUrlRow(defaultUrl = '') {
  const list = $('#productImagesList');
  if (!list) return;

  const rowCount = list.children.length + 1;
  const row = document.createElement('div');
  row.className = 'image-input-row';
  row.innerHTML = `
    <span class="img-row-tag">Angle ${rowCount}</span>
    <input type="text" class="prod-img-input" placeholder="Image URL or uploaded file path..." 
           value="${defaultUrl}" oninput="updateImagePreviews()" />
    <button type="button" class="btn-remove-img-row" onclick="removeImageUrlRow(this)" title="Remove image">✕</button>
  `;

  list.appendChild(row);
  list.scrollTop = list.scrollHeight;
  const newInput = row.querySelector('input');
  if (newInput && !defaultUrl) newInput.focus();
  updateImagePreviews();
}

function removeImageUrlRow(btn) {
  const row = btn.closest('.image-input-row');
  const list = $('#productImagesList');
  if (row && list) {
    row.remove();
    // Re-index tags
    const rows = list.querySelectorAll('.image-input-row');
    if (rows.length === 0) {
      list.innerHTML = `
        <div class="image-input-row">
          <span class="img-row-tag cover-tag">Cover *</span>
          <input type="text" class="prod-img-input" placeholder="Image URL or uploaded file path..."
                 value="" oninput="updateImagePreviews()" />
        </div>
      `;
    } else {
      rows.forEach((r, idx) => {
        const tag = r.querySelector('.img-row-tag');
        if (tag) {
          if (idx === 0) {
            tag.className = 'img-row-tag cover-tag';
            tag.textContent = 'Cover *';
          } else {
            tag.className = 'img-row-tag';
            tag.textContent = `Angle ${idx + 1}`;
          }
        }
      });
    }
    updateImagePreviews();
  }
}

function updateImagePreviews() {
  const container = $('#newProductImagePreviews');
  if (!container) return;

  const inputs = $$('.prod-img-input');
  const validImages = [];

  inputs.forEach((input, idx) => {
    const val = input.value.trim();
    if (val) {
      validImages.push({
        url: val,
        label: idx === 0 ? 'Cover' : `Angle ${idx + 1}`
      });
    }
  });

  if (validImages.length === 0) {
    container.innerHTML = `<span style="font-size: 0.72rem; color: var(--text-muted); font-style: italic;">No image previews available yet. Enter valid URLs above.</span>`;
    return;
  }

  container.innerHTML = validImages.map((img) => `
    <div class="preview-thumb-card">
      <img src="${img.url}" alt="${img.label}" onerror="this.src='https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=200&q=70'; this.title='Image URL load failed';" />
      <span class="preview-thumb-badge">${img.label}</span>
    </div>
  `).join('');
}

async function handleAddNewProductSubmit(e) {
  e.preventDefault();

  const name = $('#newProdName')?.value.trim();
  const category = $('#newProdCategory')?.value || 'men';
  const collection = $('#newProdCollection')?.value || 'runway';
  const price = parseFloat($('#newProdPrice')?.value || 0);
  const badge = $('#newProdBadge')?.value.trim() || 'New Arrival';
  const desc = $('#newProdDesc')?.value.trim();
  const stock = parseInt($('#newProdStock')?.value || 8);

  // Collect all gallery images from dynamic input rows
  const imgInputs = $$('.prod-img-input');
  const images = [];
  imgInputs.forEach(input => {
    const val = input.value.trim();
    if (val && !images.includes(val)) {
      images.push(val);
    }
  });

  if (!name || !price) {
    showToast('Please provide Masterpiece Name and Price ($).', 'warning');
    return;
  }

  if (images.length === 0) {
    showToast('Please provide at least one product image.', 'warning');
    return;
  }

  // If only 1 image provided, duplicate it for secondary hover effect
  const finalImages = images.length === 1 ? [images[0], images[0]] : images;

  // Handle Edit / Update Mode
  if (state.editingProductId) {
    const existing = state.products.find(p => p.id === state.editingProductId);
    if (!existing) return;

    const updatedData = {
      id: state.editingProductId,
      name,
      category,
      collection,
      price,
      originalPrice: Math.round(price * 1.15),
      badge,
      inStock: stock,
      shortDesc: desc || `${name} crafted from fine European natural textiles.`,
      fabricDetail: desc || `100% pure luxury natural textiles hand-stitched by European master ateliers.`,
      images: finalImages
    };

    // Update in MySQL via PUT API
    try {
      await fetch('api/products.php', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });
    } catch (err) {
      console.warn('Updating product locally:', err);
    }

    Object.assign(existing, updatedData);
    localStorage.setItem('leo_products', JSON.stringify(state.products));

    renderProducts();
    renderLookbook();
    renderAdminProducts();
    renderSellerProducts();
    updateDashboardKPIs();

    const updatedName = name;
    closeAddProductModal();
    showToast(`Masterpiece "${updatedName}" updated successfully!`);
    state.editingProductId = null;
    return;
  }

  const newProduct = {
    id: `LEO-${Math.floor(100 + Math.random() * 900)}`,
    name,
    category,
    collection,
    price,
    originalPrice: Math.round(price * 1.15),
    badge,
    rating: 5.0,
    reviewCount: 1,
    isFeatured: true,
    isLookbook: false,
    images: finalImages,
    sizes: category === 'accessories' ? ['One Size'] : ['38R / S', '40R / M', '42R / L', '44R / XL'],
    colors: [
      { name: 'Onyx Black', hex: '#111111' },
      { name: 'Classic Camel', hex: '#c19a6b' }
    ],
    shortDesc: desc || `${name} crafted from fine European natural textiles.`,
    fabricDetail: desc || `100% pure luxury natural textiles hand-stitched by European master ateliers.`,
    inStock: stock
  };

  // Persist directly to MySQL database via API
  try {
    const res = await fetch('api/products.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProduct)
    });
    if (res.ok) {
      const resData = await res.json();
      if (resData.id) newProduct.id = resData.id;
    }
  } catch (err) {
    console.warn('Persisting product locally:', err);
  }

  state.products.unshift(newProduct);
  localStorage.setItem('leo_products', JSON.stringify(state.products));

  renderProducts();
  renderLookbook();
  renderAdminProducts();
  renderSellerProducts();
  updateDashboardKPIs();

  closeAddProductModal();
  showToast(`Published "${name}" with ${finalImages.length} gallery images to database!`);
}

async function deleteProduct(productId) {
  const prod = state.products.find(p => p.id === productId);
  if (!prod) return;

  const confirmed = confirm(`Are you sure you want to permanently delete "${prod.name}" (${productId}) from the catalog?`);
  if (!confirmed) return;

  const deletedName = prod.name;
  state.products = state.products.filter(p => p.id !== productId);
  localStorage.setItem('leo_products', JSON.stringify(state.products));

  // Remove from MySQL via API
  try {
    await fetch(`api/products.php?id=${productId}`, {
      method: 'DELETE'
    });
  } catch (err) {
    console.warn('Deleted product locally:', err);
  }

  renderProducts();
  renderLookbook();
  renderAdminProducts();
  renderSellerProducts();
  updateDashboardKPIs();

  showToast(`Deleted "${deletedName}" from database.`);
}
