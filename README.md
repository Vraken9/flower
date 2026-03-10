# 🌸 Bloom – Flower Marketplace

A full-stack flower marketplace with role-based access control. Available in **two deployment versions**:

1. **Supabase Version** - Using Supabase Cloud (simpler, managed)
2. **Self-Hosted Version** - Using your own PostgreSQL + Express backend (full control)

## 🏗️ Architecture Options

### Option A: Supabase (Managed)
```
┌──────────────────────────────────────────────────┐
│  Next.js 16  (web/)                              │
│  ┌──────────┐  ┌───────────┐  ┌───────────────┐  │
│  │  Pages   │  │ API Routes│  │ Contexts      │  │
│  │  (SSR)   │  │ /api/*    │  │ Auth,Favorites│  │
│  └──────────┘  └─────┬─────┘  └───────────────┘  │
└──────────────────────┼────────────────────────────┘
                       │ Supabase JS Client
                       ▼
          ┌────────────────────────┐
          │   Supabase Cloud       │
          │  ┌──────┐ ┌────────┐   │
          │  │ Auth │ │ Postgres│  │
          │  └──────┘ └────────┘   │
          └────────────────────────┘
```

### Option B: Self-Hosted (Full Control)
```
┌─────────────────────────────────────────────────────────┐
│                      Your VPS                            │
│  ┌───────────────────────────────────────────────────┐  │
│  │                    Nginx                           │  │
│  │                 (Port 80/443)                      │  │
│  └─────────────────────┬─────────────────────────────┘  │
│            ┌───────────┴───────────┐                    │
│            ▼                       ▼                    │
│  ┌─────────────────┐     ┌─────────────────┐           │
│  │   Frontend      │     │    Backend      │           │
│  │   Next.js       │────▶│    Express.js   │           │
│  │   Port 3000     │     │    Port 5000    │           │
│  └─────────────────┘     └────────┬────────┘           │
│                                   │                     │
│                          ┌────────▼────────┐           │
│                          │   PostgreSQL    │           │
│                          │   Port 5432     │           │
│                          └─────────────────┘           │
└─────────────────────────────────────────────────────────┘
```

## 🛠️ Tech Stack

| Component | Supabase Version | Self-Hosted Version |
|-----------|-----------------|---------------------|
| Frontend | Next.js 16, React, Tailwind | Same |
| Backend | Next.js API Routes | Express.js |
| Database | Supabase PostgreSQL | PostgreSQL 16 |
| Auth | Supabase Auth | JWT + bcrypt |
| Security | RLS Policies | Middleware |
| Hosting | 1 server | 1 server (all in one) |

## 👥 Roles & Permissions

| Role | Capabilities |
|------|-------------|
| `user` | Browse, cart, favorites, apply to become owner |
| `owner` | + Manage own shop & products |
| `admin` | + Manage all shops, review applications |

## 📁 Project Structure

```
├── web/                    # Next.js Frontend
│   ├── src/app/            # Pages (App Router)
│   ├── src/components/     # UI Components
│   ├── src/lib/            # Utils, contexts, types
│   └── Dockerfile
├── backend/                # Express.js Backend (self-hosted)
│   ├── routes/             # API endpoints
│   ├── controllers/        # Business logic
│   ├── middlewares/        # Auth, validation
│   └── Dockerfile
├── database/               # PostgreSQL schema (self-hosted)
├── nginx/                  # Reverse proxy config
├── supabase/               # Supabase migrations
├── docker-compose.supabase.yml     # Deploy with Supabase
└── docker-compose.selfhosted.yml   # Deploy self-hosted
```

---

## 🚀 Quick Start (Development)

### Prerequisites
- Node.js 18+
- npm or yarn

### 1. Clone & Install
```bash
git clone https://github.com/your-username/flower-marketplace.git
cd flower-marketplace/web
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env.local
# Edit .env.local with your Supabase credentials
```

### 3. Run Development Server
```bash
npm run dev
```
Open http://localhost:3000

---

## 🐳 Deploy: Supabase Version

Best for: Quick setup, managed infrastructure, auto-scaling.

### 1. Setup Supabase
- Create project at [supabase.com](https://supabase.com)
- Run migrations in `supabase/migrations/` via SQL Editor

### 2. Configure & Deploy
```bash
cp .env.example .env
# Edit .env with Supabase credentials

docker-compose -f docker-compose.supabase.yml up -d --build
```

### 3. Access
Open http://your-server-ip:3000

---

## 🖥️ Deploy: Self-Hosted Version

Best for: Full control, no vendor lock-in, predictable costs.

### 1. Configure Environment
```bash
cp .env.selfhosted.example .env
nano .env  # Edit with secure passwords
```

### 2. Build & Run
```bash
docker-compose -f docker-compose.selfhosted.yml up -d --build
```

### 3. Access
- Frontend: http://your-server-ip (via Nginx)
- Backend API: http://your-server-ip/api
- Direct ports: Frontend :3000, Backend :5000, DB :5432

### 4. Database Management
```bash
# Connect to PostgreSQL
docker exec -it flower_db psql -U flower_user -d flower_marketplace

# View tables
\dt

# View users
SELECT id, email, role FROM users;
```

---

## 📋 Common Docker Commands

```bash
# Start in background
docker-compose -f docker-compose.selfhosted.yml up -d

# View logs
docker-compose -f docker-compose.selfhosted.yml logs -f

# View specific service logs
docker-compose -f docker-compose.selfhosted.yml logs -f backend

# Restart services
docker-compose -f docker-compose.selfhosted.yml restart

# Stop all
docker-compose -f docker-compose.selfhosted.yml down

# Rebuild after code changes
docker-compose -f docker-compose.selfhosted.yml up -d --build

# Remove everything including volumes (⚠️ deletes data!)
docker-compose -f docker-compose.selfhosted.yml down -v
```

---

## 🔐 Test Accounts

| Email | Password | Role |
|-------|----------|------|
| admin@flowermarket.com | admin123456 | admin |
| owner.edelweis@gmail.com | owner123456 | owner |
| buyer@gmail.com | buyer123456 | user |

---

## 🌐 Production Checklist

### Security
- [ ] Change default passwords in `.env`
- [ ] Generate secure JWT_SECRET (min 32 chars)
- [ ] Enable HTTPS with SSL certificate
- [ ] Configure firewall (only expose 80, 443)

### Performance
- [ ] Enable Nginx gzip compression
- [ ] Set up CDN for static assets
- [ ] Configure PostgreSQL connection pooling

### Monitoring
- [ ] Set up health check endpoint monitoring
- [ ] Configure log rotation
- [ ] Set up database backups

---

## 🔀 Switching Between Versions

### From Supabase to Self-Hosted
1. Export data from Supabase
2. Import to self-hosted PostgreSQL
3. Update frontend to call `/api` instead of Supabase client
4. Deploy with `docker-compose.selfhosted.yml`

### From Self-Hosted to Supabase
1. Set up Supabase project
2. Run migrations
3. Migrate data
4. Update environment variables
5. Deploy with `docker-compose.supabase.yml`

---

## 📝 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | — | Register new user |
| POST | `/api/auth/login` | — | Login |
| GET | `/api/products` | — | List products |
| GET | `/api/products/:id` | — | Product detail |
| GET | `/api/shops` | — | List shops |
| GET | `/api/cart` | ✓ | Get user cart |
| POST | `/api/cart` | ✓ | Add to cart |
| DELETE | `/api/cart/:id` | ✓ | Remove from cart |
| GET | `/api/favorites` | ✓ | Get favorites |
| POST | `/api/favorites` | ✓ | Toggle favorite |
| GET | `/api/owner/products` | owner | List own products |
| POST | `/api/owner/products` | owner | Create product |
| PUT | `/api/owner/products/:id` | owner | Update product |
| DELETE | `/api/owner/products/:id` | owner | Delete product |
| GET | `/api/admin/stats` | admin | Dashboard stats |
| POST | `/api/applications` | user | Apply for owner |
| POST | `/api/applications/:id/review` | admin | Review application |

---

## 🧪 Testing

```bash
cd web
npm test                    # Unit tests
npm run test:integration    # Integration tests
```

---

## ⚡ Performance Comparison

| Aspect | Supabase | Self-Hosted |
|--------|----------|-------------|
| Setup Time | ~30 min | ~2 hours |
| Monthly Cost* | $0-25 | $5-20 (VPS) |
| Scaling | Auto | Manual |
| Control | Limited | Full |
| Vendor Lock-in | Yes | No |
| Maintenance | Managed | Self |

*Estimated for small-medium traffic

---

## 📄 License

MIT

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open a Pull Request
