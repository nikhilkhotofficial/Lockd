# Discipline App

Track tasks. Build streaks. Challenge friends.

## Features
- Email login & signup
- Tasks with date, time, repeat (daily/weekly)
- GitHub-style 365-dot year progress graph
- Friend connections via email invite
- Streak challenges with friends (live progress bars)
- Desktop push notifications / reminders
- Real-time streak tracking

## Tech Stack
- **Frontend**: Next.js 14 (App Router) + Tailwind CSS
- **Backend/DB**: Supabase (Postgres + Auth + Realtime)
- **Deploy**: Vercel

## Getting started locally

```bash
# 1. Install dependencies
npm install

# 2. Copy env file
cp .env.local.example .env.local

# 3. Fill in your Supabase keys in .env.local

# 4. Run the SQL migration in your Supabase SQL Editor
#    (copy contents of supabase/migrations/001_schema.sql)

# 5. Start dev server
npm run dev
```

Open http://localhost:3000

## Deploy
See [DEPLOY.md](./DEPLOY.md) for the full step-by-step deployment guide.
