# AMA Fashion - Luxury Heritage E-commerce Platform

A sophisticated, full-featured e-commerce platform for AMA Fashion, a luxury brand celebrating West African heritage through contemporary design. Built with Next.js 15, featuring comprehensive inventory management, dynamic pricing, secure payments, and advanced admin controls.

## 🌟 Project Overview

AMA Fashion represents the intersection of heritage and modernity, offering carefully curated garments that honor West African textile traditions. This platform serves as a complete e-commerce solution with real-time inventory tracking, dynamic pricing, and comprehensive business management tools.

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
- **Analytics Dashboard**: Real-time business metrics and insights
- **Subscriber Management**: Newsletter subscriber tracking and export
- **Order Management**: Complete order tracking and fulfillment

### 📧 Advanced Email System

- **Newsletter Management**: Automated welcome emails with brand storytelling
- **Order Notifications**: Comprehensive order confirmations and updates
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

\`\`\`
ama-fashion/
├── app/                          # Next.js App Router
│   ├── admin/                    # Admin dashboard
│   │   ├── dashboard/            # Analytics dashboard
│   │   └── inventory/            # Inventory management
│   ├── api/                      # API routes
│   │   ├── admin/                # Admin API endpoints
│   │   ├── inventory/            # Inventory management APIs
│   │   ├── newsletter/           # Newsletter subscription
│   │   ├── paypal/               # PayPal integration
│   │   └── stripe/               # Stripe integration
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
│   └── add-preorder-date-column.sql
├── public/                       # Static assets
│   └── images/                   # Product and brand images
├── .env.local.example            # Environment variables template
├── next.config.ts                # Next.js configuration
├── tailwind.config.ts            # Tailwind CSS configuration
└── package.json                  # Dependencies and scripts
\`\`\`

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
\`\`\`bash
git clone https://github.com/yourusername/ama-fashion.git
cd ama-fashion
\`\`\`

2. **Install dependencies**
\`\`\`bash
npm install
\`\`\`

3. **Set up environment variables**
\`\`\`bash
cp .env.local.example .env.local
\`\`\`

Configure the following variables in `.env.local`:

\`\`\`env
# Database Configuration
DATABASE_URL=postgresql://username:password@host/database

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# PayPal Configuration
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-client-secret

# Email Configuration (cPanel/Custom)
EMAIL_HOST=mail.yourdomain.com
EMAIL_PORT=465
EMAIL_USER=your-email@yourdomain.com
EMAIL_PASSWORD=your-email-password
EMAIL_FROM=noreply@yourdomain.com

# Admin Configuration
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-password

# Business Configuration
NEXT_PUBLIC_WHATSAPP_NUMBER=+971501234567
BUSINESS_EMAIL=contact@yourdomain.com
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
\`\`\`

4. **Set up the database**
\`\`\`bash
# Run database setup scripts in order
psql $DATABASE_URL -f scripts/create-product-inventory-table.sql
psql $DATABASE_URL -f scripts/create-orders-table.sql
psql $DATABASE_URL -f scripts/populate-initial-inventory.sql
psql $DATABASE_URL -f scripts/add-pricing-to-inventory.sql
psql $DATABASE_URL -f scripts/create-price-history-table.sql
psql $DATABASE_URL -f scripts/enhance-orders-table.sql
psql $DATABASE_URL -f scripts/add-preorder-date-column.sql
\`\`\`

5. **Run the development server**
\`\`\`bash
npm run dev
\`\`\`

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
   \`\`\`bash
   # Execute scripts in the correct order
   npm run db:setup
   \`\`\`

3. **Verify Setup**
   - Check admin dashboard at `/admin/dashboard`
   - Verify inventory at `/admin/inventory`

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
\`\`\`typescript
// Example inventory update
const updateInventory = async (productId: string, quantity: number) => {
  const result = await fetch('/api/admin/inventory', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId, quantity })
  });
  return result.json();
};
\`\`\`

### Dynamic Pricing System

#### Multi-currency Support
- **AED Pricing**: Primary currency for UAE market
- **GBP Pricing**: Secondary currency for UK market
- **Automatic Conversion**: Real-time currency display
- **Regional Detection**: Automatic currency selection based on location

#### Price Management
\`\`\`typescript
// Example price update
const updatePrice = async (productId: string, priceAED: number, priceGBP: number) => {
  const result = await fetch('/api/admin/inventory', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId, priceAED, priceGBP })
  });
  return result.json();
};
\`\`\`

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
5. **Order Confirmation**: Email and WhatsApp notifications

---

## 📊 Admin Dashboard

### Analytics Overview
\`\`\`
┌─────────────────────────────────────────────────────────────┐
│                    AMA Fashion Dashboard                    │
├─────────────────────────────────────────────────────────────┤
│ Total Subscribers    │ 127    │ Total Inventory Value │ $45K │
│ This Month          │  23    │ Low Stock Items       │   3  │
│ This Week           │   8    │ Pre-order Items       │   5  │
│ Orders Today        │   4    │ Revenue This Month    │ $12K │
└─────────────────────────────────────────────────────────────┘
\`\`\`

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
