# Discipline App — Complete Deployment Guide

## What you're deploying
A Next.js 14 app with Supabase (database + auth) deployed on Vercel (free).
Total cost: $0/month on free tiers.

---

## PART 1 — Set up Supabase (your database & auth)

### Step 1: Create Supabase account
1. Go to https://supabase.com and click "Start your project"
2. Sign up with GitHub (recommended) or email
3. Click "New project"
4. Fill in:
   - Project name: `discipline-app`
   - Database password: create a strong one (save it!)
   - Region: pick closest to you (e.g. Southeast Asia for India)
5. Click "Create new project" — wait ~2 minutes for it to spin up

### Step 2: Run the database schema
1. In your Supabase project, click "SQL Editor" in the left sidebar
2. Click "New query"
3. Open the file `supabase/migrations/001_schema.sql` from this project
4. Copy ALL the contents and paste into the SQL editor
5. Click "Run" (green button)
6. You should see "Success. No rows returned"

### Step 3: Get your API keys
1. In Supabase, go to "Project Settings" (gear icon) → "API"
2. Copy these two values — you'll need them soon:
   - "Project URL" → this is your NEXT_PUBLIC_SUPABASE_URL
   - "anon public" key → this is your NEXT_PUBLIC_SUPABASE_ANON_KEY

### Step 4: Configure auth
1. In Supabase, go to "Authentication" → "URL Configuration"
2. Under "Site URL", enter: https://YOUR-APP-NAME.vercel.app
   (You can update this after deploying to Vercel)
3. Under "Redirect URLs", add: https://YOUR-APP-NAME.vercel.app/auth/callback

---

## PART 2 — Deploy to GitHub

### Step 5: Create a GitHub account
1. Go to https://github.com and sign up (free)

### Step 6: Create a new repository
1. Click the "+" icon → "New repository"
2. Repository name: `discipline-app`
3. Set to "Public" (required for free Vercel)
4. Click "Create repository"

### Step 7: Push your code
Open your terminal/command prompt in the `discipline-app` folder and run:

```bash
# Install dependencies first
npm install

# Initialize git
git init
git add .
git commit -m "Initial commit"

# Connect to GitHub (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/discipline-app.git
git branch -M main
git push -u origin main
```

---

## PART 3 — Deploy to Vercel (live on the internet)

### Step 8: Create Vercel account
1. Go to https://vercel.com
2. Click "Sign up" → choose "Continue with GitHub"
3. Authorize Vercel to access your GitHub

### Step 9: Import your project
1. In Vercel dashboard, click "Add New..." → "Project"
2. Find `discipline-app` in your GitHub repos and click "Import"
3. Framework Preset will auto-detect as "Next.js" ✓
4. Click "Environment Variables" to expand it
5. Add these two variables:
   - Name: `NEXT_PUBLIC_SUPABASE_URL`  Value: (paste your Supabase Project URL)
   - Name: `NEXT_PUBLIC_SUPABASE_ANON_KEY`  Value: (paste your anon key)
6. Click "Deploy"
7. Wait ~2 minutes. You'll get a live URL like: https://discipline-app-xyz.vercel.app

### Step 10: Update Supabase with your real URL
1. Go back to Supabase → Authentication → URL Configuration
2. Update "Site URL" to your actual Vercel URL (e.g. https://discipline-app-xyz.vercel.app)
3. Update "Redirect URLs" too: https://discipline-app-xyz.vercel.app/auth/callback
4. Click "Save"

---

## PART 4 — Custom domain (optional, looks professional)

### Step 11: Add a custom domain
1. Buy a domain from Namecheap or GoDaddy (~$10/year, e.g. mydisciplineapp.com)
2. In Vercel → your project → "Settings" → "Domains"
3. Click "Add" and type your domain
4. Vercel shows you DNS records to add
5. Go to your domain registrar → DNS settings → add those records
6. Wait 10–30 minutes for DNS to propagate
7. Your app is now live at your custom domain with HTTPS automatically

---

## PART 5 — Desktop notifications (popup reminders)

### Option A: Browser notification (simplest)
Already built in. When user clicks "Enable notifications" in the Reminders page,
the browser will show popups. Works on desktop Chrome, Firefox, Edge.

To make it work even when browser is closed, add this service worker:

Create file `public/sw.js`:
```javascript
self.addEventListener('push', function(e) {
  const data = e.data.json()
  self.registration.showNotification(data.title, {
    body: data.body,
    icon: '/icon.png'
  })
})
```

Then in your reminders page, register it:
```javascript
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
}
```

### Option B: Email reminders via Supabase Edge Functions
For reliable daily reminders, create a Supabase Edge Function that:
1. Runs on a schedule (cron)
2. Queries all reminders for the current time
3. Sends emails via Resend.com (free tier: 3000 emails/month)

---

## PART 6 — Keep it running / updates

### Deploying updates
Every time you push to GitHub, Vercel auto-deploys:
```bash
git add .
git commit -m "Your change description"
git push
```
Vercel detects the push and re-deploys in ~1 minute.

### Monitor your app
- Vercel dashboard shows deployments, errors, traffic
- Supabase dashboard shows database rows, auth users, API usage

---

## Quick reference — all URLs you'll have

| Thing | URL |
|-------|-----|
| Your live app | https://YOUR-APP.vercel.app |
| Supabase dashboard | https://app.supabase.com |
| Vercel dashboard | https://vercel.com/dashboard |
| GitHub repo | https://github.com/YOU/discipline-app |

---

## Troubleshooting

**"Invalid API key" error** → double-check your env variables in Vercel match exactly from Supabase

**Login not working** → make sure your Redirect URL in Supabase includes /auth/callback

**Database error on signup** → re-run the SQL migration in Supabase SQL Editor

**Build fails on Vercel** → check the build logs, usually a TypeScript error — run `npm run build` locally first

---

## Free tier limits (you won't hit these for a long time)

| Service | Free limit |
|---------|-----------|
| Vercel | 100GB bandwidth/month, unlimited deploys |
| Supabase | 500MB database, 50,000 monthly active users |
| Both | More than enough for personal + friends use |
