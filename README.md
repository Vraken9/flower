# 🌸 Bloom — Flower Marketplace

Online flower marketplace with role-based access control (buyer, shop owner, admin).

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4
- **Backend**: Supabase (Auth, PostgreSQL, Row Level Security)
- **State**: Zustand (cart), React Context (auth, favorites)
- **Testing**: Vitest

## Getting Started

```bash
cd web
cp .env.example .env.local   # then fill in your Supabase keys
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only) |

## Available Scripts

```bash
npm run dev       # Start development server
npm run build     # Production build
npm run start     # Start production server
npm run lint      # Run ESLint
npm test          # Run unit tests
```

## Project Structure

```
web/
├── src/
│   ├── app/          # Next.js App Router pages & API routes
│   ├── components/   # React components
│   └── lib/          # Utilities, stores, types
├── public/           # Static assets
└── supabase-migrations/  # Database migrations
```

## License

MIT
