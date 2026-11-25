require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const crypto = require('crypto');
const Razorpay = require('razorpay');

const app = express();
const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

// Fail fast if keys are missing
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.error('ERROR: RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be set in .env');
  process.exit(1);
}

const razorpayClient = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// In-memory storage (use a database in production)
const orders = new Map();
const carts = new Map();

// Product catalog — prices are in paise (29900 = ₹299.00)
const products = [
  { id: 'prod_1', name: 'Premium Wireless Headphones', description: 'High-quality wireless headphones with noise cancellation and 30-hour battery life.', price: 29900, currency: 'inr', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop', category: 'Electronics', stock: 50 },
  { id: 'prod_2', name: 'Smart Watch Series 5', description: 'Advanced health monitoring, GPS, and cellular connectivity in a sleek design.', price: 39900, currency: 'inr', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop', category: 'Electronics', stock: 30 },
  { id: 'prod_3', name: 'Minimalist Leather Backpack', description: 'Handcrafted full-grain leather backpack with laptop compartment and water resistance.', price: 18900, currency: 'inr', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop', category: 'Accessories', stock: 25 },
  { id: 'prod_4', name: 'Mechanical Keyboard RGB', description: 'Customizable RGB mechanical keyboard with hot-swappable switches and aluminum frame.', price: 14900, currency: 'inr', image: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=400&h=400&fit=crop', category: 'Electronics', stock: 40 },
  { id: 'prod_5', name: 'Ultra-wide Curved Monitor', description: '34-inch ultrawide curved monitor with 144Hz refresh rate and HDR support.', price: 59900, currency: 'inr', image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&h=400&fit=crop', category: 'Electronics', stock: 15 },
  { id: 'prod_6', name: 'Wireless Charging Pad Set', description: 'Fast wireless charger with 3-in-1 charging for phone, watch, and earbuds.', price: 7900, currency: 'inr', image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=400&fit=crop', category: 'Accessories', stock: 60 }
];

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(PUBLIC_DIR));
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }
}));

function getCart(sessionId) {
  if (!carts.has(sessionId)) carts.set(sessionId, { items: [], createdAt: Date.now() });
  return carts.get(sessionId);
}

function calculateCartTotals(cart) {
  const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = Math.round(subtotal * 0.08);
  const shipping = subtotal > 100000 ? 0 : 9900; // free shipping above ₹1000
  return { subtotal, tax, shipping, total: subtotal + tax + shipping };
}

/* ---------------- Products ---------------- */
app.get('/api/products', (req, res) => res.json({ products }));

app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json({ product });
});

/* ---------------- Cart ---------------- */
app.get('/api/cart', (req, res) => {
  const cart = getCart(req.sessionID);
  res.json({ cart: { ...cart, ...calculateCartTotals(cart) } });
});

app.post('/api/cart/add', (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const product = products.find(p => p.id === productId);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  if (product.stock < quantity) return res.status(400).json({ error: 'Insufficient stock' });

  const cart = getCart(req.sessionID);
  const existing = cart.items.find(i => i.productId === productId);
  if (existing) existing.quantity += quantity;
  else cart.items.push({ productId: product.id, name: product.name, price: product.price, image: product.image, quantity });

  res.json({ cart: { ...cart, ...calculateCartTotals(cart) } });
});

app.post('/api/cart/update', (req, res) => {
  const { productId, quantity } = req.body;
  const cart = getCart(req.sessionID);
  const item = cart.items.find(i => i.productId === productId);
  if (!item) return res.status(404).json({ error: 'Item not in cart' });

  const product = products.find(p => p.id === productId);
  if (product && product.stock < quantity) return res.status(400).json({ error: 'Insufficient stock' });

  if (quantity <= 0) cart.items = cart.items.filter(i => i.productId !== productId);
  else item.quantity = quantity;

  res.json({ cart: { ...cart, ...calculateCartTotals(cart) } });
});

app.post('/api/cart/remove', (req, res) => {
  const { productId } = req.body;
  const cart = getCart(req.sessionID);
  cart.items = cart.items.filter(i => i.productId !== productId);
  res.json({ cart: { ...cart, ...calculateCartTotals(cart) } });
});

/* ---------------- Razorpay: create order ---------------- */
app.post('/api/create-razorpay-order', async (req, res) => {
  try {
    const cart = getCart(req.sessionID);
    if (cart.items.length === 0) return res.status(400).json({ error: 'Cart is empty' });

    // Re-validate stock server-side
    for (const item of cart.items) {
      const product = products.find(p => p.id === item.productId);
      if (!product) return res.status(404).json({ error: `Product ${item.name} not found` });
      if (product.stock < item.quantity) return res.status(400).json({ error: `Insufficient stock for ${item.name}` });
    }

    const totals = calculateCartTotals(cart);

    // amount is already in paise
    const rzpOrder = await razorpayClient.orders.create({
      amount: totals.total,
      currency: 'INR',
      receipt: `rcpt_${uuidv4().slice(0, 18)}`,
      notes: { sessionId: req.sessionID }
    });

    const orderId = uuidv4();
    orders.set(orderId, {
      id: orderId,
      razorpayOrderId: rzpOrder.id,
      sessionId: req.sessionID,
      items: cart.items,
      totals,
      status: 'created',
      createdAt: Date.now()
    });

    res.json({
      keyId: process.env.RAZORPAY_KEY_ID,
      razorpayOrderId: rzpOrder.id,
      orderId,
      amount: totals.total,
      currency: 'INR',
      name: 'TechStore',
      description: `Order ${orderId.slice(0, 8).toUpperCase()}`
    });
  } catch (error) {
    console.error('Create Razorpay order error:', error);
    res.status(500).json({ error: error.error?.description || 'Failed to create order' });
  }
});

/* ---------------- Razorpay: verify payment ---------------- */
app.post('/api/verify-payment', (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (expected !== razorpay_signature) {
    return res.status(400).json({ success: false, error: 'Payment verification failed' });
  }

  const order = orders.get(orderId);
  if (!order) return res.status(404).json({ success: false, error: 'Order not found' });

  order.status = 'paid';
  order.razorpayPaymentId = razorpay_payment_id;
  order.paidAt = Date.now();

  // Reduce inventory and clear cart
  for (const item of order.items) {
    const product = products.find(p => p.id === item.productId);
    if (product) product.stock -= item.quantity;
  }
  carts.delete(order.sessionId);

  res.json({ success: true, orderId: order.id });
});

/* ---------------- Razorpay webhook (optional) ---------------- */
app.post('/api/razorpay-webhook', bodyParser.raw({ type: 'application/json' }), (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return res.status(200).json({ received: true, note: 'no webhook secret configured' });

  const signature = req.headers['razorpay-signature'];
  const expected = crypto.createHmac('sha256', secret).update(req.body).digest('hex');
  if (expected !== signature) return res.status(400).send('Invalid signature');

  const event = JSON.parse(req.body);
  if (event.event === 'payment.captured' || event.event === 'payment.failed') {
    const rzpOrderId = event.payload?.payment?.entity?.order_id;
    for (const order of orders.values()) {
      if (order.razorpayOrderId === rzpOrderId) {
        order.status = event.event === 'payment.captured' ? 'paid' : 'failed';
        break;
      }
    }
  }
  res.json({ received: true });
});

/* ---------------- Orders ---------------- */
app.get('/api/orders/:id', (req, res) => {
  const order = orders.get(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json({ order });
});

app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: Date.now() }));

app.get('*', (req, res) => res.sendFile(path.join(PUBLIC_DIR, 'index.html')));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Razorpay key: ${process.env.RAZORPAY_KEY_ID}`);
});
