# Bloom – Flower Marketplace

A full-stack flower marketplace with role-based access control, built with **Next.js 16** (App Router) and **Supabase** (PostgreSQL + Auth).

## Architecture

```
┌──────────────────────────────────────────────────┐
│  Next.js 16  (web/)                              │
│  ┌──────────┐  ┌───────────┐  ┌───────────────┐  │
│  │  Pages    │  │ API Routes│  │ Contexts      │  │
│  │  (SSR)    │  │ /api/*    │  │ Auth,Favorites│  │
│  └──────────┘  └─────┬─────┘  └───────────────┘  │
│                      │                            │
└──────────────────────┼────────────────────────────┘
                       │  Supabase JS Client
                       ▼
          ┌────────────────────────┐
          │   Supabase Cloud       │
          │  ┌──────┐ ┌────────┐   │
          │  │ Auth │ │ Postgres│   │
          │  └──────┘ └────────┘   │
          │   RLS policies active  │
          └────────────────────────┘
```

## Tech Stack

| Layer     | Technology                  |
| --------- | --------------------------- |
| Frontend  | Next.js 16, React, Tailwind CSS |
| Auth      | Supabase Auth (JWT)         |
| Database  | Supabase PostgreSQL + RLS   |
| State     | Zustand (cart), React Context (auth, favorites) |
| Testing   | Vitest (unit + integration) |
| CI        | GitHub Actions              |

## Roles & Permissions

| Role    | Can do                                              |
| ------- | --------------------------------------------------- |
| `user`  | Browse, purchase, manage cart/favorites, apply to become owner |
| `owner` | Everything user can + manage own shop & products    |
| `admin` | Everything + manage all shops, review owner applications |

## Project Structure

```
├── web/                        # Next.js frontend
│   ├── src/app/                # App Router pages
│   │   ├── page.tsx            # Home
│   │   ├── products/           # Product listing & detail
│   │   ├── shops/              # Shop listing & detail
│   │   ├── cart/               # Shopping cart
│   │   ├── favorites/          # Favorites list
│   │   ├── auth/               # Login & Register
│   │   ├── profile/            # User profile
│   │   ├── dashboard/          # Owner dashboard (shop, products)
│   │   ├── apply-owner/        # Owner application form
│   │   ├── admin/              # Admin dashboard & applications
│   │   └── api/                # API Routes
│   │       ├── profile/ensure/ # POST – ensure profile row
│   │       ├── owner/products/ # GET/POST/PUT/DELETE owner CRUD
│   │       ├── admin/shops/    # POST toggle shop active
│   │       ├── cart/           # GET/POST/DELETE cart items
│   │       ├── favorites/      # GET/POST/DELETE favorites (toggle)
│   │       └── applications/   # GET/POST + [id]/review
│   ├── src/lib/
│   │   ├── contexts/           # AuthProvider, FavoritesProvider
│   │   ├── supabase/           # Browser & server Supabase clients
│   │   ├── store/              # Zustand cart store
│   │   └── types/              # TypeScript type definitions
│   └── src/components/         # Shared UI components
├── supabase/migrations/        # SQL migrations & rollback
│   ├── 001_create_roles_profiles_shops_products.sql
│   ├── 002_enable_rls_and_policies.sql
│   ├── 003_owner_onboarding_applications.sql
│   └── rollback_001_002.sql
├── scripts/dummy-photos.mjs    # Seed product/shop images
├── .github/workflows/ci.yml    # CI pipeline
└── backend/                    # Legacy Express server (deprecated)
```

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project

### 1. Clone & install

```bash
git clone <repo-url>
cd Flower_Marketplace
cd web && npm install
```

### 2. Configure environment

Create `web/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Run migrations

Execute the SQL files in `supabase/migrations/` against your Supabase project in order (001, 002, 003) via the Supabase SQL Editor or CLI.

### 4. Seed images (optional)

```bash
node scripts/dummy-photos.mjs --dry-run   # preview
node scripts/dummy-photos.mjs             # apply
```

### 5. Start dev server

```bash
cd web
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Test Accounts

| Email                        | Password       | Role  |
| ---------------------------- | -------------- | ----- |
| admin@flowermarket.com       | admin123456    | admin |
| owner.edelweis@gmail.com     | owner123456    | owner |
| buyer@gmail.com              | buyer123456    | user  |

## API Routes

| Method   | Endpoint                        | Auth    | Description                     |
| -------- | ------------------------------- | ------- | ------------------------------- |
| POST     | `/api/profile/ensure`           | —       | Upsert profile after signup     |
| GET      | `/api/owner/products`           | owner   | List owner's products           |
| POST     | `/api/owner/products`           | owner   | Create product                  |
| PUT      | `/api/owner/products/[id]`      | owner   | Update product                  |
| DELETE   | `/api/owner/products/[id]`      | owner   | Delete product                  |
| POST     | `/api/admin/shops/[id]/disable` | admin   | Toggle shop is_active           |
| GET      | `/api/cart`                     | any     | List cart items                 |
| POST     | `/api/cart`                     | any     | Add / increment cart item       |
| DELETE   | `/api/cart?product_id=x`        | any     | Remove cart item                |
| GET      | `/api/favorites`                | any     | List favorites                  |
| POST     | `/api/favorites`                | any     | Toggle favorite (add/remove)    |
| DELETE   | `/api/favorites?product_id=x`   | any     | Remove favorite                 |
| GET      | `/api/applications`             | any     | List applications (own/all)     |
| POST     | `/api/applications`             | user    | Submit owner application        |
| POST     | `/api/applications/[id]/review` | admin   | Approve / reject application    |

## Running Tests

```bash
cd web
npm test              # unit tests (mocked)
npm run test:integration  # integration tests (needs live Supabase)
```

## CI Pipeline

GitHub Actions (`.github/workflows/ci.yml`) runs on push/PR:

1. **Lint & Typecheck** – `next lint` + `tsc --noEmit`
2. **Unit Tests** – Vitest with mocked Supabase
3. **Build** – `next build`
4. **Integration Tests** – against staging Supabase (main branch only)

## License

MIT