# H8 Exchange - Crypto Trading Platform

A professional, production-ready C2C crypto exchange platform for buying and selling USDT against EGP with manual admin approval workflow.

## 🚀 Features

### User Features
- **Buy USDT**: Users can create orders to buy USDT by transferring EGP
- **Sell USDT**: Users can create orders to sell USDT and receive EGP
- **Order Tracking**: Real-time order status tracking
- **Reviews System**: Leave ratings and reviews after order completion
- **Real-time Notifications**: Get notified about order updates

### Admin Features
- **Order Management**: Review, approve, or reject pending orders
- **Exchange Rate Management**: Update buy/sell rates and order limits
- **Audit Logging**: Complete activity tracking and audit trail
- **Dashboard**: Real-time statistics and analytics
- **Order Filtering**: Search and filter orders by status, type, date

### Security & Design
- 🔐 NextAuth authentication with JWT
- 🎨 Modern dark theme with gold accents (Binance-inspired)
- 📱 Fully responsive design (Desktop, Tablet, Mobile)
- 🌍 Arabic RTL support by default
- ✨ Smooth animations with Framer Motion
- 🛡️ Secure password hashing with bcryptjs

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **TailwindCSS** - Utility-first CSS framework
- **Framer Motion** - Animations and transitions
- **Lucide Icons** - Beautiful SVG icons
- **ShadcnUI** - Reusable UI components

### Backend
- **Next.js API Routes** - Serverless backend
- **NextAuth** - Authentication & Authorization
- **Prisma ORM** - Type-safe database access

### Database
- **PostgreSQL** - Production database
- **Prisma** - ORM for database management

### Storage
- **Cloudinary** - Image hosting (optional for proof uploads)

## 📋 Database Schema

### Core Tables
- **Users**: User accounts and profiles
- **Orders**: Buy/Sell orders with status tracking
- **Reviews**: User ratings and comments
- **Notifications**: Order and system notifications
- **AuditLogs**: Complete activity logging
- **ExchangeRates**: Current buy/sell rates
- **RateHistory**: Rate change history

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Git

### Installation

1. **Clone and navigate to project**
```bash
cd H8_Exchange
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup environment variables**
```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/h8_exchange"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
```

4. **Setup database**
```bash
npx prisma db push
npx prisma db seed  # Optional: seed sample data
```

5. **Run development server**
```bash
npm run dev
```

Visit `http://localhost:3000`

## 📄 Pages & Routes

### Public Pages
- `/` - Home page
- `/buy` - Buy USDT page
- `/sell` - Sell USDT page
- `/track` - Order tracking
- `/reviews` - Customer reviews
- `/contact` - Contact & support
- `/auth/login` - Login
- `/auth/register` - Register

### Admin Pages (Protected)
- `/admin` - Dashboard with statistics
- `/admin/orders` - Order management
- `/admin/audit-logs` - Activity logs
- `/admin/settings` - Exchange rates & settings

## 🔐 Authentication

The platform uses NextAuth with credentials provider:

**Admin Login**
- Email: `admin@h8exchange.com`
- Password: Set during first setup

**User Registration**
- Self-registration available
- Email verification (optional)
- Password hashing with bcryptjs

## 💾 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/[...nextauth]` - NextAuth endpoints

### Orders
- `GET /api/orders` - Get user's orders
- `POST /api/orders` - Create new order
- `GET /api/orders/[id]` - Get order details
- `PATCH /api/orders/[id]` - Update order
- `GET /api/track` - Track order by ID

### Admin
- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/orders` - Get all orders (filtered)
- `PATCH /api/admin/orders/[id]` - Approve/Reject/Complete order
- `GET /api/admin/exchange-rates` - Get current rates
- `PUT /api/admin/exchange-rates` - Update rates
- `GET /api/admin/audit-logs` - Get activity logs

### Public
- `GET /api/reviews` - Get all reviews
- `POST /api/reviews` - Create review
- `GET /api/notifications` - Get user notifications

## 🎨 Design System

### Colors
- **Primary**: `#0A0A0A` (Dark Black)
- **Secondary**: `#1A1A1A` (Dark Gray)
- **Accent**: `#F5B942` (Gold)
- **Accent Dark**: `#E6A430` (Dark Gold)

### Components
- Cards with hover effects
- Gradient buttons (Primary/Secondary)
- Form inputs with validation
- Loading states
- Responsive grids

## 📱 Responsive Breakpoints
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

## 🚀 Deployment

### Vercel (Recommended)
```bash
git push origin main
```
Vercel will auto-deploy on push.

### Manual Deployment
```bash
npm run build
npm start
```

### Environment Variables (Production)
Set these in your hosting platform:
```env
DATABASE_URL=your_production_db_url
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your_production_secret
```

## 📞 Support

For support, contact via Telegram:
- [@HELAL_SHADY](https://t.me/HELAL_SHADY)

## 📄 License

Proprietary - All rights reserved

## 🤝 Contributing

Internal project - Contact admin for contributions

---

Built with ❤️ by H8 Exchange Team
