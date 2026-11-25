const state = { products: [], cart: { items: [], subtotal: 0, tax: 0, shipping: 0, total: 0 }, currentFilter: 'all' };
const elements = {};

document.addEventListener('DOMContentLoaded', async () => {
  cacheElements();
  await loadProducts();
  initEventListeners();
  updateCartUI();
  animateStats();
  handleUrlParams();
});

function cacheElements() {
  elements.productsGrid = document.getElementById('productsGrid');
  elements.cartToggle = document.getElementById('cartToggle');
  elements.cartSidebar = document.getElementById('cartSidebar');
  elements.cartOverlay = document.getElementById('cartOverlay');
  elements.cartClose = document.getElementById('cartClose');
  elements.cartItems = document.getElementById('cartItems');
  elements.cartFooter = document.getElementById('cartFooter');
  elements.cartCount = document.getElementById('cartCount');
  elements.cartSubtotal = document.getElementById('cartSubtotal');
  elements.cartTax = document.getElementById('cartTax');
  elements.cartShipping = document.getElementById('cartShipping');
  elements.cartTotal = document.getElementById('cartTotal');
  elements.checkoutBtn = document.getElementById('checkoutBtn');
  elements.continueShopping = document.getElementById('continueShopping');
  elements.filterBtns = document.querySelectorAll('.filter-btn');
  elements.mobileMenuBtn = document.getElementById('mobileMenuBtn');
  elements.nav = document.getElementById('nav');
  elements.header = document.getElementById('header');
  elements.contactForm = document.getElementById('contactForm');
  elements.successModal = document.getElementById('successModal');
  elements.orderDetails = document.getElementById('orderDetails');
  elements.continueShoppingModal = document.getElementById('continueShoppingModal');
  elements.toastContainer = document.getElementById('toastContainer');
}

async function loadProducts() {
  try {
    const response = await fetch('/api/products');
    const data = await response.json();
    state.products = data.products;
    renderProducts(state.products);
  } catch (error) {
    console.error('Failed to load products:', error);
    showToast('Failed to load products. Please refresh.', 'error');
  }
}

function renderProducts(products) {
  if (!elements.productsGrid) return;
  elements.productsGrid.innerHTML = products.map(product => `
    <article class="product-card" data-category="${product.category}" data-id="${product.id}">
      <div class="product-image"><img src="${product.image}" alt="${product.name}" loading="lazy"></div>
      <div class="product-content">
        <span class="product-category">${product.category}</span>
        <h3 class="product-name">${product.name}</h3>
        <p class="product-description">${product.description}</p>
        <div class="product-footer">
          <span class="product-price">${formatPrice(product.price)}</span>
          <button class="add-to-cart-btn" data-id="${product.id}" ${product.stock === 0 ? 'disabled' : ''} aria-label="Add ${product.name} to cart">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
          </button>
        </div>
      </div>
    </article>
  `).join('');

  document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
    btn.addEventListener('click', (e) => { e.stopPropagation(); addToCart(btn.dataset.id); });
  });
}

function filterProducts(category) {
  state.currentFilter = category;
  const filtered = category === 'all' ? state.products : state.products.filter(p => p.category === category);
  renderProducts(filtered);
  elements.filterBtns.forEach(btn => { const isActive = btn.dataset.category === category; btn.classList.toggle('active', isActive); btn.setAttribute('aria-pressed', isActive); });
}

function initEventListeners() {
  elements.cartToggle?.addEventListener('click', toggleCart);
  elements.cartClose?.addEventListener('click', closeCart);
  elements.cartOverlay?.addEventListener('click', closeCart);
  elements.continueShopping?.addEventListener('click', closeCart);
  elements.filterBtns.forEach(btn => btn.addEventListener('click', () => filterProducts(btn.dataset.category)));
  elements.mobileMenuBtn?.addEventListener('click', toggleMobileMenu);
  elements.checkoutBtn?.addEventListener('click', initiateCheckout);
  elements.contactForm?.addEventListener('submit', handleContactSubmit);
  elements.continueShoppingModal?.addEventListener('click', closeSuccessModal);
  window.addEventListener('scroll', handleHeaderScroll);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && elements.cartSidebar?.classList.contains('open')) closeCart();
    if (e.key === 'Escape' && elements.successModal?.style.display === 'flex') closeSuccessModal();
  });
}

async function handleUrlParams() {
  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get('session_id');
  const orderId = urlParams.get('order_id');
  if (sessionId && orderId) {
    try {
      const response = await fetch(`/api/orders/session/${sessionId}`);
      const data = await response.json();
      if (data.order && data.order.status === 'paid') {
        showSuccessModal(data.order);
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } catch (error) { console.error('Failed to verify order:', error); }
  } else if (urlParams.get('canceled') && orderId) {
    showToast('Checkout was canceled. Your cart is saved.', 'warning');
    window.history.replaceState({}, document.title, window.location.pathname);
  }
}

async function addToCart(productId, quantity = 1) {
  try {
    const response = await fetch('/api/cart/add', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productId, quantity }) });
    const data = await response.json();
    if (data.cart) { state.cart = data.cart; updateCartUI(); showToast('Added to cart!', 'success'); openCart(); }
    else showToast(data.error || 'Failed to add to cart', 'error');
  } catch (error) { console.error('Add to cart error:', error); showToast('Failed to add to cart', 'error'); }
}

async function updateCartItem(productId, quantity) {
  try {
    const response = await fetch('/api/cart/update', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productId, quantity }) });
    const data = await response.json();
    if (data.cart) { state.cart = data.cart; updateCartUI(); }
  } catch (error) { console.error('Update cart error:', error); }
}

async function removeFromCart(productId) {
  try {
    const response = await fetch('/api/cart/remove', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productId }) });
    const data = await response.json();
    if (data.cart) { state.cart = data.cart; updateCartUI(); showToast('Removed from cart', 'success'); }
  } catch (error) { console.error('Remove from cart error:', error); }
}

async function loadCart() {
  try {
    const response = await fetch('/api/cart');
    const data = await response.json();
    if (data.cart) { state.cart = data.cart; updateCartUI(); }
  } catch (error) { console.error('Load cart error:', error); }
}

function updateCartUI() {
  const { items, subtotal, tax, shipping, total } = state.cart;
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  elements.cartCount.textContent = totalItems;

  if (items.length === 0) {
    elements.cartItems.innerHTML = `<div class="cart-empty"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg><p>Your cart is empty</p><a href="#products" class="btn btn-primary" id="continueShopping">Continue Shopping</a></div>`;
    elements.cartFooter.style.display = 'none';
    elements.checkoutBtn.disabled = true;
    document.getElementById('continueShopping')?.addEventListener('click', closeCart);
  } else {
    elements.cartItems.innerHTML = items.map(item => `
      <div class="cart-item" data-id="${item.productId}">
        <img src="${item.image}" alt="${item.name}" class="cart-item-image" loading="lazy">
        <div class="cart-item-details">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">${formatPrice(item.price)} each</div>
          <div class="cart-item-controls">
            <button class="quantity-btn" data-action="decrease" aria-label="Decrease quantity">−</button>
            <span class="quantity-value">${item.quantity}</span>
            <button class="quantity-btn" data-action="increase" aria-label="Increase quantity">+</button>
            <button class="cart-item-remove" aria-label="Remove ${item.name} from cart"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
          </div>
        </div>
      </div>
    `).join('');

    document.querySelectorAll('.quantity-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const itemEl = e.target.closest('.cart-item');
        const productId = itemEl.dataset.id;
        const action = btn.dataset.action;
        const currentQty = parseInt(itemEl.querySelector('.quantity-value').textContent);
        const newQty = action === 'increase' ? currentQty + 1 : currentQty - 1;
        updateCartItem(productId, newQty);
      });
    });

    document.querySelectorAll('.cart-item-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const itemEl = e.target.closest('.cart-item');
        removeFromCart(itemEl.dataset.id);
      });
    });

    elements.cartFooter.style.display = 'block';
    elements.checkoutBtn.disabled = false;
  }

  elements.cartSubtotal.textContent = formatPrice(subtotal);
  elements.cartTax.textContent = formatPrice(tax);
  elements.cartShipping.textContent = shipping === 0 ? 'Free' : formatPrice(shipping);
  elements.cartTotal.textContent = formatPrice(total);
}

function openCart() { elements.cartSidebar.classList.add('open'); elements.cartOverlay.classList.add('open'); elements.cartToggle.setAttribute('aria-expanded', 'true'); document.body.style.overflow = 'hidden'; }
function closeCart() { elements.cartSidebar.classList.remove('open'); elements.cartOverlay.classList.remove('open'); elements.cartToggle.setAttribute('aria-expanded', 'false'); document.body.style.overflow = ''; }
function toggleCart() { elements.cartSidebar.classList.contains('open') ? closeCart() : openCart(); }

function toggleMobileMenu() {
  const isOpen = elements.nav.classList.toggle('open');
  elements.mobileMenuBtn.setAttribute('aria-expanded', isOpen);
  elements.mobileMenuBtn.querySelector('svg').innerHTML = isOpen ? '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>' : '<line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>';
}

function handleHeaderScroll() {
  elements.header.classList.toggle('scrolled', window.scrollY > 20);
}

async function initiateCheckout() {
  if (state.cart.items.length === 0) return;
  elements.checkoutBtn.disabled = true;
  elements.checkoutBtn.querySelector('.btn-text').style.display = 'none';
  elements.checkoutBtn.querySelector('.btn-loader').style.display = 'flex';

  try {
    const email = prompt('Please enter your email for the receipt:') || undefined;
    const response = await fetch('/api/create-checkout-session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
    const data = await response.json();
    if (data.url) window.location.href = data.url;
    else throw new Error(data.error || 'Failed to create checkout session');
  } catch (error) {
    console.error('Checkout error:', error);
    showToast(error.message || 'Checkout failed. Please try again.', 'error');
    elements.checkoutBtn.disabled = false;
    elements.checkoutBtn.querySelector('.btn-text').style.display = 'inline';
    elements.checkoutBtn.querySelector('.btn-loader').style.display = 'none';
  }
}

function showSuccessModal(order) {
  const { id, items, totals, createdAt } = order;
  const date = new Date(createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  elements.orderDetails.innerHTML = `<p><strong>Order Number:</strong> #${id.slice(0, 8).toUpperCase()}</p><p><strong>Date:</strong> ${date}</p><p><strong>Items:</strong> ${items.length} (${items.reduce((sum, i) => sum + i.quantity, 0)} total)</p><p><strong>Total Paid:</strong> ${formatPrice(totals.total)}</p>`;
  elements.successModal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeSuccessModal() { elements.successModal.style.display = 'none'; document.body.style.overflow = ''; }

async function handleContactSubmit(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData);
  const errors = validateContactForm(data);
  if (errors.length > 0) { showToast(errors[0], 'error'); return; }

  const submitBtn = e.target.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.disabled = true; submitBtn.textContent = 'Sending...';
  await new Promise(resolve => setTimeout(resolve, 1000));
  showToast('Message sent successfully! We\'ll get back to you soon.', 'success');
  e.target.reset();
  submitBtn.disabled = false; submitBtn.textContent = originalText;
}

function validateContactForm(data) {
  const errors = [];
  if (!data.name.trim()) errors.push('Name is required');
  if (!data.email.trim()) errors.push('Email is required');
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.push('Invalid email format');
  if (!data.subject) errors.push('Please select a subject');
  if (!data.message.trim()) errors.push('Message is required');
  return errors;
}

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icons = { success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>', error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>', warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>', info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>' };
  toast.innerHTML = `<span class="toast-icon">${icons[type] || icons.info}</span><span class="toast-message">${message}</span><button class="toast-close" aria-label="Dismiss"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>`;
  toast.querySelector('.toast-close').addEventListener('click', () => { toast.style.animation = 'slideIn 0.3s ease reverse'; setTimeout(() => toast.remove(), 300); });
  elements.toastContainer.appendChild(toast);
  setTimeout(() => { if (toast.parentNode) { toast.style.animation = 'slideIn 0.3s ease reverse'; setTimeout(() => toast.remove(), 300); } }, 5000);
}

function animateStats() {
  const statNumbers = document.querySelectorAll('.stat-number');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => { if (entry.isIntersecting) { animateNumber(entry.target, parseInt(entry.target.dataset.count)); observer.unobserve(entry.target); } });
  }, { threshold: 0.5 });
  statNumbers.forEach(el => observer.observe(el));
}

function animateNumber(element, target) {
  const duration = 2000; const startTime = performance.now();
  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 4);
    const current = Math.round(target * eased);
    element.textContent = current.toLocaleString();
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

function formatPrice(cents) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(cents / 100);
}

async function initiateCheckout() {
  if (state.cart.items.length === 0) return;

  elements.checkoutBtn.disabled = true;
  elements.checkoutBtn.querySelector('.btn-text').style.display = 'none';
  elements.checkoutBtn.querySelector('.btn-loader').style.display = 'flex';

  try {
    const email = prompt('Please enter your email for the receipt:') || undefined;

    const response = await fetch('/api/create-razorpay-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cartItems: state.cart.items })
    });

    const data = await response.json();

    if (data.orderId) {
      // Razorpay order created successfully
      // Open Razorpay checkout in new tab (razorpay checkout.js handles this)
      window.location.href = data.redirectUrl;
    } else {
      throw new Error(data.error || 'Failed to create order');
    }
  } catch (error) {
    console.error('Checkout error:', error);
    showToast(error.message || 'Checkout failed. Please try again.', 'error');
    elements.checkoutBtn.disabled = false;
    elements.checkoutBtn.querySelector('.btn-text').style.display = 'inline';
    elements.checkoutBtn.querySelector('.btn-loader').style.display = 'none';
  }
}

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;
    const target = document.querySelector(targetId);
    if (target) {
      e.preventDefault();
      const headerHeight = elements.header.offsetHeight;
      const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
      window.scrollTo({ top: targetPosition, behavior: 'smooth' });
      if (elements.nav.classList.contains('open')) toggleMobileMenu();
    }
  });
});

document.addEventListener('visibilitychange', () => { if (!document.hidden) loadCart(); });

window.TechStore = { addToCart, updateCartItem, removeFromCart, showToast };