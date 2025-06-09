**AMA Fashion - Luxury Heritage E-commerce Website**

A sophisticated, mobile-first e-commerce platform for AMA Fashion, a luxury brand celebrating West African heritage through contemporary design. Built with Next.js 15, featuring responsive design, secure payments, and seamless user experience.

**Project Overview**
AMA Fashion represents the intersection of heritage and modernity, offering carefully curated garments that honor West African textile traditions. This website serves as the digital storefront, providing an elegant shopping experience that reflects the brand's values of quality, authenticity, and spiritual connection to fabric.

**Live Demo**: coming soon

**Key Features**

**E-commerce Functionality**
**Product Catalog**: Comprehensive product display with filtering by material (Batik, Ankara, Aso Oke, Linen) and essence (Everyday, Sacred wear, Gatherings)

**Responsive Product Gallery**: High-quality image displays with hover effects and detailed product information
**Smart Filtering System**: Dynamic product filtering with visual feedback and category-based organization
**Secure Checkout**: Integrated PayPal payment processing with order management

**Mobile-First Design**
**Responsive Navigation**: Hamburger menu for mobile with smooth transitions
**Optimized Layouts**: Carefully crafted responsive grids and typography for all screen sizes
**Touch-Friendly Interface**: Mobile-optimized buttons, forms, and interactive elements
**Performance Optimized**: Fast loading times and smooth animations across devices

**Secure Payment Integration**
**PayPal Business Integration**: Complete payment processing with order tracking
**Customer Data Protection**: Secure form handling and data validation
**Order Confirmation**: Automated email receipts and order status updates
**WhatsApp Integration**: Post-purchase communication for delivery coordination

**Email Marketing System**
**Newsletter Subscription**: Automated welcome emails with brand storytelling
**Email Notifications**: Order confirmations and customer communications
**Responsive Email Templates**: Beautiful HTML emails that work across all email clients

**Brand-Focused Design**
**Heritage-Inspired Aesthetics**: Color palette and typography reflecting West African culture
**Storytelling Integration**: Brand narrative woven throughout the user experience
**Premium Feel**: Luxury design elements that convey quality and authenticity

**Technology Stack**

**Frontend**
**Next.js 15**: React framework with App Router for optimal performance
**React 18**: Modern React with hooks and server components
**TypeScript**: Type-safe development for better code quality
**Tailwind CSS**: Utility-first CSS framework for responsive design

**UI Components**
**Radix UI**: Accessible, unstyled UI primitives
**Lucide React**: Beautiful, customizable icons
**shadcn/ui**: Pre-built, accessible component library

**Backend & Services**
**Next.js API Routes**: Server-side functionality for form handling
**Nodemailer**: Email service integration for notifications
**PayPal SDK**: Secure payment processing

**Development Tools**
**ESLint**: Code linting and quality assurance
**PostCSS**: CSS processing and optimization
**Git**: Version control with GitHub integration


**Project Structure**
ama-fashion/
├── app/                          # Next.js App Router
│   ├── about/                    # About page
│   ├── api/                      # API routes
│   │   └── newsletter/           # Newsletter subscription endpoint
│   ├── checkout/                 # Checkout flow
│   ├── contact/                  # Contact page
│   ├── payment-success/          # Payment confirmation
│   ├── shop/                     # Product catalog
│   ├── why-ama/                  # Brand story
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Homepage
├── components/                   # Reusable components
│   ├── ui/                       # shadcn/ui components
│   ├── footer.tsx                # Site footer
│   ├── header.tsx                # Navigation header
│   ├── mobile-nav.tsx            # Mobile navigation
│   └── newsletter-form.tsx       # Newsletter subscription
├── lib/                          # Utility functions
│   ├── paypal.ts                 # PayPal integration
│   └── utils.ts                  # Helper functions
├── public/                       # Static assets
│   └── images/                   # Product and brand images
├── .env.local.example            # Environment variables template
├── next.config.mjs               # Next.js configuration
├── tailwind.config.ts            # Tailwind CSS configuration
└── package.json                  # Dependencies and scripts


**Getting Started**
Prerequisites
Node.js 18+
npm or yarn
PayPal Business Account (for payments)
Email service credentials (for notifications)
Installation
Clone the repository

git clone https://github.com/yourusername/ama-fashion.git
cd ama-fashion
Install dependencies

npm install
Set up environment variables

cp .env.local.example .env.local
Configure the following variables in .env.local:

# PayPal Configuration
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-client-secret

# Email Configuration
EMAIL_USER=your-email@domain.com
EMAIL_PASSWORD=your-email-password

# Business Configuration
NEXT_PUBLIC_WHATSAPP_NUMBER=971501234567
BUSINESS_EMAIL=contact@yourdomain.com
Run the development server

npm run dev
Open your browser Navigate to http://localhost:3000

**Configuration**
PayPal Setup
Create a PayPal Business account
Generate API credentials in the PayPal Developer Dashboard
Add credentials to your environment variables
Test with PayPal sandbox before going live
Email Configuration
Set up email service (Gmail, custom domain, etc.)
Configure SMTP settings in environment variables
Test newsletter subscription functionality
WhatsApp Business
Set up WhatsApp Business account
Add your business number to environment variables
Configure automated messages for post-purchase communication

**Features in Detail**
Product Filtering System
Material-based filtering: Batik, Ankara, Aso Oke, Linen
Essence-based filtering: Everyday, Sacred wear, Gatherings
Visual feedback: Active filter states and smooth transitions
Responsive design: Works seamlessly on all devices

**Checkout Flow**
Product Selection: Add to cart from product pages
Customer Information: Secure form for shipping details
Payment Processing: PayPal integration with order tracking
Confirmation: Email receipt and WhatsApp coordination

**Newsletter System**
Subscription Form: Elegant signup with validation
Welcome Emails: Automated brand storytelling emails
Admin Notifications: Internal alerts for new subscribers

**Design Philosophy**

**Brand Identity**
**Color Palette**: Earth tones reflecting African heritage
**Typography**: Playfair Display for elegance, Inter for readability
**Imagery**: High-quality product photography with cultural context


**User Experience**
**Mobile-First**: Designed primarily for mobile users
**Accessibility**: WCAG compliant with proper ARIA labels
**Performance**: Optimized images and efficient code splitting

**Deployment**
Vercel Deployment (Recommended)
Connect to GitHub

# Push your code to GitHub
git add .
git commit -m "Initial commit"
git push origin main
Deploy to Vercel

Connect your GitHub repository to Vercel
Configure environment variables in Vercel dashboard
Deploy automatically on every push
Configure Custom Domain (Optional)

Add your custom domain in Vercel settings
Update DNS records as instructed
Alternative Deployment Options
Netlify: Static site deployment with form handling
Railway: Full-stack deployment with database support
DigitalOcean: VPS deployment for full control

**Testing**
Manual Testing Checklist
Responsive design on all devices
Product filtering functionality
Checkout flow completion
Newsletter subscription
Email notifications
PayPal payment processing
WhatsApp integration
Performance Testing
Page load speeds
Image optimization
Mobile performance
SEO optimization

**Security Features**
**Form Validation**: Client and server-side validation
**CSRF Protection**: Built-in Next.js security
**Environment Variables**: Secure credential management
**Payment Security**: PayPal's secure payment processing

**Analytics & Monitoring**
**Recommended Integrations**
**Google Analytics**: User behavior tracking
**Vercel Analytics**: Performance monitoring
**Sentry**: Error tracking and monitoring
**Hotjar**: User experience insights

**Contributing**
**Fork the repository**
Create a feature branch (git checkout -b feature/amazing-feature)
Commit your changes (git commit -m 'Add amazing feature')
Push to the branch (git push origin feature/amazing-feature)
Open a Pull Request

**License**
This project is licensed under the MIT License - see the LICENSE file for details.

**Developer**
Ajayi Adeboye Samuel

Email: ajayiadeboye2002@gmail.com
LinkedIn: https://www.linkedin.com/in/adeboye-melvin/
GitHub: www.github.com/officialmelvinp
Portfolio: www.elmelvinp.com

***Acknowledgments**
**AMA Fashion Brand**: For the opportunity to bring their vision to life
**Next.js Team**: For the excellent framework and documentation
**Vercel**: For seamless deployment and hosting
**shadcn/ui**: For beautiful, accessible components
**PayPal**: For secure payment processing

**Support**
For support, email ajayiadeboye2002@gmail.com or create an issue in this repository.

Built with ❤️ for AMA Fashion - Where heritage meets modernity

