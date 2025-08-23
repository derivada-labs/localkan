# Deploying to Vercel

This guide explains how to deploy the Kanban Todo App to Vercel with optional persistent storage.

## Quick Start (Demo Mode - No Setup Required!)

1. **Deploy with one click:**
   ```bash
   npx vercel
   ```

2. **That's it!** Your app is deployed and working.
   - Data is stored temporarily in memory
   - Perfect for testing and demos
   - No configuration needed

## Production Mode (With Persistent Storage)

To enable persistent storage that survives between deployments:

### Step 1: Deploy to Vercel

#### Option A: Deploy with CLI
```bash
npx vercel
```

#### Option B: Deploy with Git
1. Push your code to GitHub/GitLab/Bitbucket
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your repository
4. Click "Deploy"

### Step 2: Add Vercel KV Storage (Simple!)

1. **Go to your project** in Vercel dashboard
2. **Click "Storage" tab**
3. **Click "Create Database"**
4. **Select "KV"** (Redis compatible)
5. **Choose a name** (e.g., "kanban-storage")
6. **Select region** (choose closest to your users)
7. **Click "Create"**

**That's it!** Vercel automatically connects the database to your project. No manual configuration needed!

### Step 3: Redeploy (Automatic)

Vercel will automatically redeploy your app with the KV storage connected. Your app now has persistent storage!

## How It Works

The app intelligently detects its environment:

```javascript
// In sync.js
this.serverUrl = window.location.hostname === 'localhost' 
    ? 'http://localhost:3001'  // Local development
    : '/api';                   // Production (Vercel)
```

### Storage Modes

1. **Demo Mode** (Default)
   - No configuration required
   - Data stored in memory
   - Resets when function restarts
   - Good for testing

2. **Production Mode** (With Vercel KV)
   - Persistent Redis storage
   - Data survives deployments
   - 30-day data retention
   - Automatic failover to demo mode if KV fails

## File Structure

```
todo-app/
├── api/                    # Vercel Serverless Functions
│   └── sync/
│       ├── status.js       # Health check
│       ├── check/
│       │   └── [hash].js   # Check if Sync ID exists
│       └── data/
│           └── [hash].js   # Sync data (GET/POST)
├── boards.html             # Main dashboard
├── board.html              # Kanban board
├── sync.js                 # Auto-detects environment
├── vercel.json            # Vercel configuration
└── package.json           # Dependencies
```

## API Endpoints

Once deployed, your API is available at:

- `GET /api/sync/status` - Health check
- `GET /api/sync/check/[hash]` - Check if Sync ID exists
- `GET /api/sync/data/[hash]` - Get sync data
- `POST /api/sync/data/[hash]` - Update sync data

## Local Development

### With Express Server (Original)
```bash
npm run dev
```
Runs on `http://localhost:3001`

### With Vercel CLI (Simulates Production)
```bash
npx vercel dev
```
Runs on `http://localhost:3000`

### With Vercel KV Locally
```bash
# Pull environment variables from Vercel
vercel env pull .env.local

# Run with Vercel CLI
npx vercel dev
```

## Features

✅ **Multi-user Support**: Each user gets a unique Sync ID  
✅ **Zero Config Deploy**: Works immediately without setup  
✅ **Automatic Failover**: Falls back to demo mode if KV unavailable  
✅ **Smart Detection**: Auto-detects local vs production environment  
✅ **CORS Enabled**: Can be embedded in other sites  
✅ **Serverless**: Scales automatically  

## Costs

### Vercel (Free Tier)
- 100GB bandwidth/month
- Unlimited deployments
- Serverless functions included
- SSL certificates included

### Vercel KV (Free Tier)
- 3000 requests/month
- 256MB storage
- 30-day data retention
- Perfect for personal use

**Total Cost: $0** for typical personal use!

## Troubleshooting

### "KV storage not configured"
- This is normal! App works in demo mode
- To enable persistence, create KV database in Vercel dashboard

### Data not persisting
1. Check if KV database is created in Vercel dashboard
2. Verify it's connected to your project
3. Check function logs in Vercel dashboard

### CORS errors
- API automatically handles CORS
- Make sure you're using the deployed URL

### Local development issues
- Use `npm run dev` for Express server
- Use `npx vercel dev` for Vercel environment

## FAQ

**Q: Do I need to configure environment variables?**  
A: No! Vercel KV automatically injects them when you create the database.

**Q: Can I use this without Vercel KV?**  
A: Yes! The app works perfectly in demo mode without any database.

**Q: How long is data stored?**  
A: 30 days in production mode, until function restart in demo mode.

**Q: Is my data secure?**  
A: Each Sync ID is isolated. The ID acts as your access key.

**Q: Can I self-host the backend?**  
A: Yes! The original Express server (`server.js`) still works for self-hosting.

## Support

1. Check Vercel function logs for errors
2. Verify KV database is connected in Storage tab
3. Test in demo mode first
4. Check browser console for client-side errors

## Summary

- **Fastest Start**: Just run `npx vercel` - works immediately!
- **Add Persistence**: Create KV database in Vercel dashboard (2 clicks)
- **Zero Config**: Everything is automatic
- **Free Forever**: Both Vercel and KV have generous free tiers