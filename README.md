# AMA Fashion - Luxury Heritage E-commerce Platform

A sophisticated, full-featured e-commerce platform for AMA Fashion, a luxury brand celebrating West African heritage through contemporary design. Built with Next.js 15, featuring comprehensive inventory management, dynamic pricing, secure payments, shipping tracking, and advanced admin controls.

## 🌟 Project Overview

AMA Fashion represents the intersection of heritage and modernity, offering carefully curated garments that honor West African textile traditions. This platform serves as a complete e-commerce solution with real-time inventory tracking, dynamic pricing, comprehensive shipping management, and advanced business management tools.

**Live Demo**: [amariahco.com](https://amariahco.com)

---

## ✨ Key Features

### 🛒 Advanced E-commerce System

- **Real-time Inventory Management**: Live stock tracking with automatic updates
- **Dynamic Product Catalog**: Comprehensive product display with filtering by material (Batik, Ankara, Aso Oke, Linen) and essence (Everyday, Sacred wear, Gatherings)
- **Smart Stock Display**: Stock level indicators (In Stock, Only X left, Pre-order available)
- **Quantity Selector**: Intelligent quantity selection with stock awareness
- **Mixed Order Support**: Handle in-stock and pre-order items in single orders
- **Pre-order Management**: Support for pre-order items with ready dates

### 💰 Dynamic Pricing System

- **Multi-currency Support**: AED and GBP pricing with automatic conversion
- **Database-driven Pricing**: Store and manage prices in database
- **Price History Tracking**: Complete audit trail of price changes
- **Admin Price Management**: Real-time price updates from admin dashboard
- **Regional Pricing**: Different pricing for UAE and UK markets

### 🛍️ Enhanced Shopping Experience

- **Responsive Product Gallery**: High-quality image displays with hover effects
- **Advanced Filtering System**: Dynamic product filtering with visual feedback
- **Stock Status Badges**: Clear indicators for availability and stock levels
- **Quantity-aware Cart**: Smart cart that handles stock limitations
- **Pre-order Integration**: Seamless pre-order experience with delivery dates

### 💳 Secure Payment Processing

- **Dual Payment Gateway**: Stripe and PayPal integration
- **Multi-currency Checkout**: Support for AED and GBP transactions
- **Enhanced Order Breakdown**: Detailed order summaries with stock/pre-order split
- **Payment Method Selection**: Improved UI for payment options
- **Secure Processing**: PCI-compliant payment handling
- **Automatic Order Recording**: Orders saved to database upon payment
- **Email Notifications**: Automatic customer and vendor notifications

### 🚚 Comprehensive Shipping & Delivery Tracking

- **Order Status Management**: Complete workflow from paid → shipped → delivered
- **Tracking Number Integration**: Support for multiple carriers (DHL, FedEx, Aramex, etc.)
- **Automatic Customer Notifications**: Email updates for shipping and delivery
- **Admin Shipping Controls**: Easy-to-use shipping management interface
- **Delivery Date Tracking**: Record and track actual delivery dates
- **Shipping Analytics**: Track shipping performance and delivery times
- **Carrier Management**: Support for multiple shipping carriers
- **Estimated Delivery Dates**: Automatic calculation based on shipping method

### 📱 Mobile-First Design

- **Responsive Navigation**: Hamburger menu with smooth transitions
- **Optimized Layouts**: Carefully crafted responsive grids for all screen sizes
- **Touch-Friendly Interface**: Mobile-optimized buttons, forms, and interactions
- **Performance Optimized**: Fast loading times and smooth animations
- **PWA Ready**: Progressive Web App capabilities

### 📊 Comprehensive Admin Dashboard

- **Inventory Management**: Complete stock control with quantity updates
- **Price Management**: Dynamic pricing controls for both currencies
- **Pre-order Management**: Set and manage pre-order ready dates
- **Order Management**: Complete order tracking and fulfillment
- **Shipping Management**: Track orders from payment to delivery
- **Analytics Dashboard**: Real-time business metrics and insights
- **Subscriber Management**: Newsletter subscriber tracking and export
- **Revenue Tracking**: Comprehensive financial analytics

### 📧 Advanced Email System

- **Newsletter Management**: Automated welcome emails with brand storytelling
- **Order Notifications**: Comprehensive order confirmations and updates
- **Shipping Notifications**: Automatic shipping and delivery updates
- **Admin Notifications**: Internal alerts for orders and subscriptions
- **Email Templates**: Beautiful, responsive HTML email designs
- **Multi-provider Support**: Flexible email service integration

---

## 🛠️ Technology Stack

### Frontend
- **Next.js 15**: React framework with App Router and latest features
- **React 19**: Modern React with server components and concurrent features
- **TypeScript**: Type-safe development for better code quality
- **Tailwind CSS**: Utility-first CSS framework for responsive design

### UI Components
- **Radix UI**: Accessible, unstyled UI primitives
- **shadcn/ui**: Pre-built, accessible component library
- **Lucide React**: Beautiful, customizable icons
- **Custom Components**: Specialized e-commerce components

### Backend & Database
- **Next.js API Routes**: Server-side functionality and API endpoints
- **Neon PostgreSQL**: Serverless PostgreSQL database
- **Prisma-like Queries**: Type-safe database operations
- **Real-time Updates**: Live inventory and pricing updates

### Payment & Services
- **Stripe**: Primary payment processor with advanced features
- **PayPal**: Alternative payment method
- **Nodemailer**: Email service integration
- **WhatsApp Business**: Post-purchase communication

### Development Tools
- **ESLint**: Code linting and quality assurance
- **TypeScript**: Static type checking
- **PostCSS**: CSS processing and optimization
- **Git**: Version control with GitHub integration

---

## 📁 Project Structure

```
ama-fashion/
├── app/                          # Next.js App Router
│   ├── admin/                    # Admin dashboard
│   │   ├── dashboard/            # Analytics dashboard
│   │   ├── inventory/            # Inventory management
│   │   ├── orders/               # Order and shipping management
│   │   └── login/                # Admin authentication
│   ├── api/                      # API routes
│   │   ├── admin/                # Admin API endpoints
│   │   │   ├── inventory/        # Inventory management APIs
│   │   │   ├── orders/           # Order management APIs
│   │   │   ├── login/            # Admin authentication
│   │   │   └── subscribers/      # Subscriber management
│   │   ├── inventory/            # Public inventory APIs
│   │   ├── newsletter/           # Newsletter subscription
│   │   ├── contact/              # Contact form handling
│   │   ├── paypal/               # PayPal integration
│   │   │   ├── create-order/     # PayPal order creation
│   │   │   └── capture-order/    # PayPal payment capture
│   │   └── stripe/               # Stripe integration
│   │       ├── create-checkout/  # Stripe checkout creation
│   │       └── webhook/          # Stripe webhook handling
│   ├── checkout/                 # Enhanced checkout flow
│   ├── contact/                  # Contact page
│   ├── payment-success/          # Payment confirmation
│   ├── shop/                     # Product catalog with inventory
│   ├── why-ama/                  # Brand story
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Homepage
├── components/                   # Reusable components
│   ├── ui/                       # shadcn/ui components
│   ├── admin-nav.tsx             # Admin navigation
│   ├── contact-form.tsx          # Contact form component
│   ├── header.tsx                # Navigation header
│   ├── mobile-nav.tsx            # Mobile navigation
│   ├── newsletter-form.tsx       # Newsletter subscription
│   └── quantity-selector.tsx     # Smart quantity selector
├── lib/                          # Utility functions
│   ├── database.ts               # Database connection and queries
│   ├── inventory.ts              # Inventory management functions
│   ├── paypal.ts                 # PayPal integration
│   ├── seo.ts                    # SEO utilities
│   └── utils.ts                  # Helper functions
├── scripts/                      # Database scripts
│   ├── create-product-inventory-table.sql
│   ├── create-orders-table.sql
│   ├── populate-initial-inventory.sql
│   ├── add-pricing-to-inventory.sql
│   ├── create-price-history-table.sql
│   ├── enhance-orders-table.sql
│   ├── add-preorder-date-column.sql
│   ├── add-shipping-tracking.sql # Shipping tracking columns
│   └── create-newsletter-table.sql
├── middleware.ts                 # Admin route protection
├── public/                       # Static assets
│   ├── images/                   # Product and brand images
│   ├── icon-192x192.png          # PWA icons
│   ├── icon-512x512.png
│   └── manifest.json             # PWA manifest
├── .env.local.example            # Environment variables template
├── next.config.ts                # Next.js configuration
├── tailwind.config.ts            # Tailwind CSS configuration
└── package.json                  # Dependencies and scripts
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js 18+**
- **npm or yarn**
- **Neon PostgreSQL Account** (for database)
- **Stripe Account** (for payments)
- **PayPal Business Account** (for alternative payments)
- **Email service credentials** (for notifications)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/ama-fashion.git
cd ama-fashion
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.local.example .env.local
```

Configure the following variables in `.env.local`:

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@host/database

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# PayPal Configuration
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-client-secret
PAYPAL_MODE=sandbox # or 'live' for production

# Email Configuration (cPanel/Custom)
EMAIL_HOST=mail.yourdomain.com
EMAIL_PORT=465
EMAIL_USER=your-email@yourdomain.com
EMAIL_PASS=your-email-password
EMAIL_FROM=noreply@yourdomain.com

# Admin Configuration
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-password

# Business Configuration
NEXT_PUBLIC_WHATSAPP_NUMBER=+971501234567
BUSINESS_EMAIL=contact@yourdomain.com
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

4. **Set up the database**
```bash
# Run database setup scripts in order
psql $DATABASE_URL -f scripts/create-product-inventory-table.sql
psql $DATABASE_URL -f scripts/create-orders-table.sql
psql $DATABASE_URL -f scripts/create-newsletter-table.sql
psql $DATABASE_URL -f scripts/populate-initial-inventory.sql
psql $DATABASE_URL -f scripts/add-pricing-to-inventory.sql
psql $DATABASE_URL -f scripts/create-price-history-table.sql
psql $DATABASE_URL -f scripts/enhance-orders-table.sql
psql $DATABASE_URL -f scripts/add-preorder-date-column.sql
psql $DATABASE_URL -f scripts/add-shipping-tracking.sql
```

5. **Run the development server**
```bash
npm run dev
```

6. **Open your browser**
Navigate to `http://localhost:3000`

---

## ⚙️ Configuration

### Database Setup (Neon PostgreSQL)

1. **Create Neon Account**
   - Sign up at [neon.tech](https://neon.tech)
   - Create a new project
   - Copy the connection string

2. **Run Database Scripts**
   ```bash
   # Execute scripts in the correct order
   npm run db:setup
   ```

3. **Verify Setup**
   - Check admin dashboard at `/admin`
   - Verify inventory at `/admin/inventory`
   - Check orders at `/admin/orders`

### Payment Gateway Setup

#### Stripe Configuration
1. Create Stripe account
2. Get API keys from Stripe Dashboard
3. Set up webhooks for order processing
4. Configure payment methods (cards, digital wallets)

#### PayPal Configuration
1. Create PayPal Business account
2. Generate API credentials in PayPal Developer Dashboard
3. Configure sandbox for testing
4. Set up production credentials for live site

### Email Service Setup

#### cPanel Email (Recommended)
1. Set up email account in cPanel
2. Configure SMTP settings
3. Test email delivery
4. Set up SPF/DKIM records

#### Alternative Email Services
- **Gmail**: Use App Passwords for SMTP
- **SendGrid**: API-based email delivery
- **Mailgun**: Transactional email service

---

## 🎯 Features in Detail

### Inventory Management System

#### Real-time Stock Tracking
- **Live Updates**: Stock levels update in real-time across all pages
- **Low Stock Alerts**: Automatic warnings when stock is low
- **Out of Stock Handling**: Graceful handling of out-of-stock items
- **Pre-order Support**: Seamless transition to pre-order when stock depletes

#### Admin Inventory Control
```typescript
// Example inventory update
const updateInventory = async (productId: string, quantity: number) => {
  const result = await fetch('/api/admin/inventory', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId, quantity })
  });
  return result.json();
};
```

### Dynamic Pricing System

#### Multi-currency Support
- **AED Pricing**: Primary currency for UAE market
- **GBP Pricing**: Secondary currency for UK market
- **Automatic Conversion**: Real-time currency display
- **Regional Detection**: Automatic currency selection based on location

#### Price Management
```typescript
// Example price update
const updatePrice = async (productId: string, priceAED: number, priceGBP: number) => {
  const result = await fetch('/api/admin/inventory', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      productId, 
      priceAED, 
      priceGBP, 
      updateType: 'prices' 
    })
  });
  return result.json();
};
```

### Enhanced Checkout System

#### Smart Order Processing
- **Stock Validation**: Real-time stock checking during checkout
- **Mixed Orders**: Handle in-stock and pre-order items together
- **Price Calculation**: Accurate decimal handling for all currencies
- **Order Breakdown**: Detailed summary of items and pricing

#### Payment Processing Flow
1. **Cart Validation**: Verify stock availability
2. **Price Calculation**: Calculate totals with taxes
3. **Payment Processing**: Secure payment via Stripe/PayPal
4. **Inventory Update**: Automatic stock deduction
5. **Order Recording**: Save order to database
6. **Email Notifications**: Send confirmations to customer and admin
7. **Order Confirmation**: Email and WhatsApp notifications

### Shipping & Delivery Management

#### Order Status Workflow
```
Paid → Ready to Ship → Shipped → Delivered
```

#### Shipping Features
- **Tracking Numbers**: Support for multiple carriers
- **Automatic Notifications**: Email updates at each stage
- **Delivery Estimates**: Calculate expected delivery dates
- **Carrier Integration**: Support for DHL, FedEx, Aramex, etc.
- **Admin Controls**: Easy shipping management interface

#### Shipping Status Updates
```typescript
// Example shipping update
const updateShippingStatus = async (orderId: number, status: string, trackingNumber?: string) => {
  const result = await fetch('/api/admin/orders', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      orderId, 
      shipping_status: status,
      tracking_number: trackingNumber,
      updateType: 'shipping'
    })
  });
  return result.json();
};
```

---

## 📊 Admin Dashboard

### Analytics Overview
```
┌─────────────────────────────────────────────────────────────┐
│                    AMA Fashion Dashboard                    │
├─────────────────────────────────────────────────────────────┤
│ Total Subscribers    │ 127    │ Total Inventory Value │ $45K │
│ This Month          │  23    │ Low Stock Items       │   3  │
│ This Week           │   8    │ Pre-order Items       │   5  │
│ Orders Today        │   4    │ Revenue This Month    │ $12K │
│ Orders Shipped      │  15    │ Orders Delivered      │  12  │
│ Pending Shipments   │   3    │ Average Delivery Time │ 3.2d │
└─────────────────────────────────────────────────────────────┘
```

### Order Management Features
- **Order Status Tracking**: Complete workflow management
- **Shipping Controls**: Easy-to-use shipping interface
- **Customer Communication**: Automatic email notifications
- **Tracking Integration**: Support for multiple carriers
- **Delivery Confirmation**: Track actual delivery dates
- **Analytics**: Shipping performance metrics

### Inventory Management Features
- **Stock Level Control**: Update quantities for all products
- **Price Management**: Set AED and GBP prices
- **Pre-order Dates**: Manage pre-order ready dates
- **Bulk Operations**: Update multiple products at once
- **Export Data**: CSV export for external analysis

### Subscriber Management
- **Search & Filter**: Find subscribers by email or date
- **Export Functionality**: CSV export for email campaigns
- **Analytics**: Growth tracking and engagement metrics
- **Bulk Actions**: Mass operations on subscriber data

---

## 🔌 API Documentation

### Inventory APIs

#### Get Product Inventory
```http
GET /api/inventory/product/[productId]


**Response:**
json
{
"success": true,
"product": {
"product_id": "AMA-001",
"quantity_available": 5,
"total_quantity": 10,
"status": "in_stock",
"price_aed": 450,
"price_gbp": 95,
"preorder_ready_date": null
}
}


#### Update Inventory (Admin)

PUT /api/admin/inventory
```

**Request Body:**
```json
{
"productId": "AMA-001",
"quantity": 8,
"priceAED": 450,
"priceGBP": 95,
"updateType": "stock" // or "prices" or "preorder"
}


**Order Management APIs** 

#### Get All Orders (Admin)
```http
GET /api/admin/orders
```

**Response:**

{
"success": true,
"orders": [
{
"id": 1,
"product_id": "AMA-001",
"customer_email": "[customer@example.com](mailto:customer@example.com)",
"customer_name": "John Doe",
"quantity_ordered": 2,
"payment_status": "completed",
"shipping_status": "shipped",
"tracking_number": "DHL123456789",
"amount_paid": 900,
"currency": "AED",
"created_at": "2024-01-15T10:30:00Z",
"shipped_date": "2024-01-16T14:20:00Z"
}
]
}


#### Update Order Shipping Status (Admin)

PUT /api/admin/orders


**Request Body:**
```json
{
"orderId": 1,
"shipping_status": "shipped",
"tracking_number": "DHL123456789",
"shipping_carrier": "DHL",
"updateType": "shipping"
}

```plaintext

### Payment Processing APIs

#### Create PayPal Order
```http
POST /api/paypal/create-order
```

**Request Body:**
```json
{
"productId": "AMA-001",
"amount": 450,
"customerInfo": {
"email": "[customer@example.com](mailto:customer@example.com)",
"name": "John Doe"
}
}

```plaintext

#### Capture PayPal Payment
```http
POST /api/paypal/capture-order
```

**Request Body:**
```json
{
"orderID": "paypal-order-id",
"productId": "AMA-001",
"customerInfo": {
"email": "[customer@example.com](mailto:customer@example.com)",
"name": "John Doe",
"phone": "+971501234567",
"address": "Dubai, UAE"
},
"orderDetails": {
"quantity": 2,
"notes": "Gift wrapping requested"
}
}

```plaintext

#### Create Stripe Checkout
```http
POST /api/stripe/create-checkout
```

**Request Body:**
```json
{
"productId": "AMA-001",
"amount": 450,
"currency": "aed",
"customerInfo": {
"email": "[customer@example.com](mailto:customer@example.com)"
}
}

```plaintext

### Newsletter APIs

#### Subscribe to Newsletter
```http
POST /api/newsletter
```

**Request Body:**
```json
{
"email": "[subscriber@example.com](mailto:subscriber@example.com)"
}

```plaintext

#### Get Subscribers (Admin)
```http
GET /api/admin/subscribers
```

**Response:**
```json
{
"success": true,
"subscribers": [
{
"id": 1,
"email": "[subscriber@example.com](mailto:subscriber@example.com)",
"created_at": "2024-01-15T10:30:00Z",
"status": "active"
}
]
}


---

## 🔒 Security Features

### Admin Authentication
- **Secure Login**: Username/password authentication
- **Session Management**: Cookie-based session handling
- **Route Protection**: Middleware-based admin route protection
- **Logout Functionality**: Secure session termination

### Payment Security
- **PCI Compliance**: Secure payment processing
- **Webhook Verification**: Stripe webhook signature verification
- **Data Encryption**: Sensitive data encryption
- **HTTPS Enforcement**: Secure data transmission

### Data Protection
- **Input Validation**: Server-side input validation
- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: Content sanitization
- **CSRF Protection**: Cross-site request forgery prevention

---

## 📈 Performance Optimization

### Frontend Optimization
- **Image Optimization**: Next.js Image component with lazy loading
- **Code Splitting**: Automatic code splitting for faster loading
- **Static Generation**: Pre-rendered pages for better performance
- **Caching**: Intelligent caching strategies

### Database Optimization
- **Indexed Queries**: Optimized database indexes
- **Connection Pooling**: Efficient database connections
- **Query Optimization**: Optimized SQL queries
- **Real-time Updates**: Efficient data synchronization

### SEO Optimization
- **Meta Tags**: Dynamic meta tag generation
- **Structured Data**: Rich snippets for better search visibility
- **Sitemap**: Automatic sitemap generation
- **Robots.txt**: Search engine crawling optimization

---

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. **Connect Repository**
   - Import project from GitHub
   - Configure build settings
   - Set environment variables

2. **Environment Variables**
   \`\`\`bash
   # Add all environment variables in Vercel dashboard
   DATABASE_URL=your-neon-database-url
   STRIPE_SECRET_KEY=your-stripe-secret-key
   # ... other variables
   \`\`\`

3. **Deploy**
   \`\`\`bash
   # Automatic deployment on git push
   git push origin main
   \`\`\`

### Alternative Deployment Options

#### Netlify
- Configure build command: `npm run build`
- Set publish directory: `.next`
- Add environment variables

#### Railway
- Connect GitHub repository
- Configure environment variables
- Deploy with automatic builds

#### Self-hosted
\`\`\`bash
# Build for production
npm run build

# Start production server
npm start
```

---

## 🧪 Testing

### Manual Testing Checklist

#### E-commerce Flow

- Browse products and filter by categories
- Add items to cart with quantity selection
- Complete checkout with Stripe payment
- Complete checkout with PayPal payment
- Verify order confirmation emails
- Test pre-order functionality


#### Admin Dashboard

- Login to admin dashboard
- Update inventory quantities
- Update product prices
- Manage pre-order dates
- Process shipping updates
- Export subscriber data


#### Shipping Management

- Mark orders as shipped
- Add tracking numbers
- Verify shipping notification emails
- Mark orders as delivered
- Check delivery confirmation emails


### Automated Testing

```bash

# Run tests (when implemented)

npm test

# Run linting

npm run lint

# Type checking

npm run type-check

```plaintext

---

## 🤝 Contributing

### Development Workflow

1. **Fork the repository**
2. **Create feature branch**
   \`\`\`bash
   git checkout -b feature/new-feature
   \`\`\`
3. **Make changes and commit**
   \`\`\`bash
   git commit -m "feat: add new feature"
   \`\`\`
4. **Push to branch**
   \`\`\`bash
   git push origin feature/new-feature
   \`\`\`
5. **Create Pull Request**

### Code Standards
- **TypeScript**: Use TypeScript for all new code
- **ESLint**: Follow ESLint configuration
- **Prettier**: Use Prettier for code formatting
- **Conventional Commits**: Use conventional commit messages

---

## 📞 Support

### Getting Help
- **Documentation**: Check this README and inline code comments
- **Issues**: Create GitHub issues for bugs and feature requests
- **Email**: Contact support@amariahco.com for urgent issues

### Business Inquiries
- **Email**: contact@amariahco.com
- **WhatsApp**: +44 7707 783963
- **Website**: [amariahco.com](https://amariahco.com)

---

## 📄 License

This project is proprietary software owned by AMA Fashion. All rights reserved.

---

## 🙏 Acknowledgments

- **Next.js Team**: For the amazing React framework
- **Vercel**: For hosting and deployment platform
- **Neon**: For serverless PostgreSQL database
- **Stripe & PayPal**: For secure payment processing
- **shadcn/ui**: For beautiful UI components
- **Tailwind CSS**: For utility-first CSS framework

---

**Built with ❤️ for AMA Fashion - Celebrating Heritage Through Contemporary Design**

*Last Updated: June 2025*

```