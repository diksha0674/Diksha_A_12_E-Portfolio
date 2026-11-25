# TechStore - Professional E-commerce with Razorpay

A fully functional, production-ready e-commerce website with Razorpay payment integration. Built with Node.js/Express and vanilla JavaScript. Optimized for India payments (UPI, cards, net banking, wallets).

## Features

- **Complete Shopping Experience**: Product catalog, filtering, cart management
- **Secure Razorpay Checkout**: PCI-compliant payments via Razorpay
- **Real-time Cart**: Persistent cart with quantity controls
- **Order Management**: Order tracking, webhooks for payment confirmation
- **Responsive Design**: Mobile-first, accessible, professional UI
- **Production Ready**: Error handling, validation, security best practices

## Quick Start

### 1. Prerequisites

- Node.js 18+ installed
- A Razorpay account (free at [razorpay.com](https://razorpay.com))

### 2. Installation

```bash
# Navigate to project directory
cd techstore

# Install dependencies
npm install

# Copy environment template
cp .env.example .env
```

### 3. Razorpay Setup (Required)

#### Create a Razorpay Account
1. Go to [razorpay.com](https://razorpay.com) and sign up
2. Complete KYC verification (required for live mode)
3. Get your API keys from [Razorpay Dashboard > Settings > API Keys](https://dashboard.razorpay.com/app/keys)

#### Configure Environment Variables
Edit `.env` with your Razorpay keys:

```env
# Test mode keys (start with these)
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=rzp_test_xxxxxxxxxxxxxx

# Session secret (generate a random string)
SESSION_SECRET=your-random-32-char-string-here

# Webhook secret (set up after starting server)
RAZORPAY_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxx
```

#### Set Up Webhooks (Critical for Production)

**For local development:**
1. Use [ngrok](https://ngrok.com) to expose your local server:
   ```bash
   ngrok http 3000
   ```
2. Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)
3. In Razorpay Dashboard, go to **Settings > Webhooks**
4. Add webhook URL: `https://abc123.ngrok.io/api/razorpay-webhook`
5. Select events: `order.updated`, `payment.captured`, `payment.refunded`
6. Copy the webhook secret to your `.env` file

**For production:**
1. In Razorpay Dashboard, go to **Settings > Webhooks**
2. Add webhook URL: `https://yourdomain.com/api/razorpay-webhook`
3. Select events: `order.updated`, `payment.captured`, `payment.refunded`
4. Copy the webhook secret to `RAZORPAY_WEBHOOK_SECRET` in `.env`

### 4. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

### 5. Test Payments

Use Razorpay test cards:
- **Success**: `4111 1111 1111 1111` (any future date, any CVC)
- **Failure**: `4000 0000 0000 0002`
- **UPI**: `success@razorpay`

## Project Structure

```
techstore/
├── server.js           # Express server with Razorpay integration
├── package.json        # Dependencies and scripts
├── .env                # Environment variables (create from .env.example)
├── .env.example        # Template for environment variables
├── README.md           # This file
├── start.bat           # Windows startup script
├── start.sh            # Mac/Linux startup script
└── public/
    ├── index.html      # Main HTML file
    ├── styles.css      # Complete styling
    └── app.js          # Frontend application logic
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List all products |
| GET | `/api/products/:id` | Get single product |
| GET | `/api/cart` | Get current cart |
| POST | `/api/cart/add` | Add item to cart |
| POST | `/api/cart/update` | Update item quantity |
| POST | `/api/cart/remove` | Remove item from cart |
| POST | `/api/create-razorpay-order` | Create Razorpay order |
| POST | `/api/razorpay-webhook` | Razorpay webhook endpoint |
| GET | `/api/orders/:id` | Get order details |
| GET | `/api/health` | Health check |

## Customization

### Adding Products
Edit the `products` array in `server.js`:

```javascript
const products = [
  {
    id: 'prod_unique_id',
    name: 'Product Name',
    description: 'Product description',
    price: 29900, // Price in INR (₹299.00)
    currency: 'inr',
    image: 'https://example.com/image.jpg',
    category: 'Electronics',
    stock: 50
  }
];
```

### Styling
Modify CSS custom properties in `public/styles.css`:

```css
:root {
  --color-primary: #2563eb;      // Main brand color
  --color-secondary: #0f172a;    // Dark text/headers
  --font-family: 'Inter', ...;   // Typography
  --container-max: 1280px;       // Max content width
}
```

### Tax & Shipping
Update in `server.js` calculateCartTotals function:

```javascript
const tax = Math.round(subtotal * 0.08); // 8% tax
const shipping = subtotal > 10000 ? 0 : 999; // Free over ₹100
```

## Production Deployment

### Environment Variables for Production
```env
NODE_ENV=production
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=rzp_live_xxxxxxxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxx
SESSION_SECRET=very-long-random-string-min-32-chars
PORT=3000
FRONTEND_URL=https://yourdomain.com
```

### Security Checklist
- [ ] Use strong `SESSION_SECRET` (32+ random characters)
- [ ] Enable HTTPS (required for Razorpay)
- [ ] Set up proper webhook endpoint in Razorpay Dashboard
- [ ] Configure CORS for your domain only
- [ ] Use a process manager (PM2, systemd)
- [ ] Set up reverse proxy (nginx)
- [ ] Enable rate limiting
- [ ] Add logging and monitoring
- [ ] Replace in-memory storage with database (PostgreSQL, MongoDB)
- [ ] Add user authentication
- [ ] Implement inventory management

### Deploy with PM2
```bash
npm install -g pm2
pm2 start server.js --name techstore
pm2 startup
pm2 save
```

### Deploy with Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
```

```bash
docker build -t techstore .
docker run -d -p 3000:3000 --env-file .env techstore
```

## Razorpay Testing Checklist

Before going live:
- [ ] Test successful payment flow
- [ ] Test failed payment handling
- [ ] Test webhook delivery (use ngrok for local)
- [ ] Test cart persistence across sessions
- [ ] Test mobile checkout experience
- [ ] Verify order confirmation emails (add email service)
- [ ] Test refunds in Razorpay Dashboard
- [ ] Verify inventory updates on payment

## Common Issues

### "Razorpay key not set"
Make sure `.env` file exists and has `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`

### Webhook signature verification failed
- Ensure `RAZORPAY_WEBHOOK_SECRET` matches Razorpay Dashboard
- Use ngrok for local development
- Check raw body parsing in server.js

### CORS errors
- Set `FRONTEND_URL` in `.env`
- Update CORS config in server.js for production

### Cart not persisting
- Check session configuration
- Ensure cookies are enabled
- Verify same-site settings for production

## Support

- **Razorpay Docs**: https://razorpay.com/docs/
- **Razorpay Support**: https://razorpay.com/support/
- **Node.js Docs**: https://nodejs.org/docs

## License

MIT License - Feel free to use for commercial projects.

---

**Built with ❤️ using Node.js, Express, and Razorpay**