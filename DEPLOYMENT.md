# 🚀 Quick Deployment Guide

## Deploy in 30 Seconds (Demo Mode)

```bash
npx vercel
```

**Done!** Your app is live. No configuration needed.

## Add Persistent Storage (2 minutes)

After deploying:

1. Open [Vercel Dashboard](https://vercel.com/dashboard)
2. Click your project → **Storage** tab
3. Click **Create Database** → Select **KV**
4. Name it (e.g., "kanban") → **Create**

**Done!** Your app now has persistent storage.

## How Your App Works

### 🎯 Two Modes - Zero Config

1. **Demo Mode** (Default)
   - Works immediately
   - No setup required
   - Data resets periodically
   - Perfect for testing

2. **Production Mode** (With Vercel KV)
   - Persistent storage
   - Data survives forever
   - Just create KV database
   - Automatic connection

### 🔑 Multi-User System

- Each user gets a unique **Sync ID**
- Share the ID to sync across devices
- Unlimited users supported
- Each ID = Separate workspace

### 💰 Completely Free

- **Vercel Free**: 100GB/month
- **KV Free**: 3000 requests/month
- **Total Cost**: $0

## Files Structure

```
api/              → Serverless functions (auto-deployed)
boards.html       → Main app
sync.js          → Smart sync (auto-detects environment)
vercel.json      → Config (already set up)
```

## Local Development

```bash
# Original Express server
npm run dev

# Or Vercel environment
npx vercel dev
```

## That's It!

Your app:
- ✅ Deploys instantly
- ✅ Works without config
- ✅ Scales automatically
- ✅ Costs nothing
- ✅ Supports unlimited users

**Deployment URL**: Check terminal after `npx vercel`