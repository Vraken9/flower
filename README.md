# Bloom — Flower Marketplace

An online flower marketplace connecting buyers with trusted local florists. Built with **Next.js 16**, **Supabase**, and **TypeScript**.

Bloom provides a multi-role platform where buyers can discover and purchase flower arrangements, shop owners can manage their storefront and products, and administrators oversee the entire marketplace — all secured with Row Level Security at the database level.

## Features

**For Buyers**
- Browse and search flower products across multiple shops
- Add items to cart with real-time total calculation
- Save favorite products for later
- Leave reviews and ratings on purchased items
- Track order status via WhatsApp integration

**For Shop Owners**
- Full dashboard to manage products, inventory, and pricing
- Shop profile customization with categories and branch locations
- Sales analytics and order management
- Apply for owner status through a streamlined onboarding flow

**For Admins**
- Centralized admin panel with marketplace-wide analytics
- User management and role assignment
- Review and approve shop owner applications
- Category and product moderation

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| UI | React 19, Tailwind CSS 4, Framer Motion |
| Icons | Lucide React |
| Auth & DB | Supabase (Auth, PostgreSQL, RLS, Storage) |
| State | Zustand (cart), React Context (auth, favorites) |
| Validation | Zod |
| Charts | Recharts |
| Testing | Vitest |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v20 or later
- A [Supabase](https://supabase.com/) project (free tier works)

### Setup

```bash
git clone https://github.com/Vraken9/flower.git
cd flower/web
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

> [!IMPORTANT]
> You must fill in your Supabase credentials in `.env.local` before running the app. See [Environment Variables](#environment-variables) below.

## Environment Variables

Create a `.env.local` file inside the `web/` directory:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only) |

> [!WARNING]
> Never commit `.env.local` or expose your `SUPABASE_SERVICE_ROLE_KEY` in client-side code.

## Project Structure

```
web/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── admin/           # Admin dashboard & management
│   │   ├── api/             # API routes (auth, cart, reviews, etc.)
│   │   ├── auth/            # Authentication pages
│   │   ├── cart/            # Shopping cart page
│   │   ├── dashboard/       # Shop owner dashboard
│   │   ├── favorites/       # Saved products
│   │   ├── products/        # Product catalog & detail
│   │   ├── shops/           # Shop listing & profiles
│   │   └── page.tsx         # Homepage
│   ├── components/          # Reusable React components
│   │   ├── ui/              # Base UI primitives
│   │   ├── layout/          # Navbar, Footer
│   │   ├── home/            # Hero, featured sections
│   │   ├── product/         # Product cards, grids
│   │   ├── shop/            # Shop cards, details
│   │   ├── cart/            # Cart components
│   │   └── dashboard/       # Owner dashboard widgets
│   └── lib/                 # Utilities & shared logic
│       ├── api/             # Server-side API helpers
│       ├── contexts/        # React Context providers
│       ├── store/           # Zustand stores
│       ├── supabase/        # Supabase client (server & browser)
│       └── types/           # TypeScript type definitions
├── supabase-migrations/     # SQL migration files
├── public/                  # Static assets
└── Dockerfile               # Multi-stage Docker build
```

## Available Scripts

Run these from the `web/` directory:

```bash
npm run dev                  # Start dev server
npm run build                # Production build
npm run start                # Start production server
npm run lint                 # Run ESLint
npm test                     # Run unit tests
npm run test:integration     # Run integration tests
```

## Deployment

A multi-stage `Dockerfile` is included for containerized deployments:

```bash
cd web
docker build \
  --build-arg NEXT_PUBLIC_SUPABASE_URL=<your-url> \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-key> \
  -t bloom .
docker run -p 3000:3000 bloom
```

> [!NOTE]
> The Docker image uses `node:20-alpine` and runs as a non-root user for security. See `web/Dockerfile` for full configuration.
