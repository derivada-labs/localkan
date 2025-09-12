# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

LocalKan is a multi-user Kanban board application built with vanilla JavaScript, Express.js, and Upstash Redis for cloud sync. It supports both local development and Vercel deployment with serverless functions.

## Development Commands

### Local Development
```bash
# Start local Express server (port 3001)
npm run start
npm run dev

# Serve static files only (port 8080)
npm run serve
```

### Vercel Development & Deployment
```bash
# Start Vercel development server
npm run vercel-dev

# Deploy to production
npm run deploy
```

### Testing
```bash
# Run KV storage tests
npm run test:kv

# Open browser-based tests
npm run test          # Opens test/test-sync.html
npm run test:multiuser # Opens test/test-multiuser.html
```

## Architecture

### Dual Runtime Environment
The app runs in two modes with automatic detection:
- **Local Development**: Express server on localhost:3001
- **Production**: Vercel serverless functions at `/api`

### Frontend Structure
```
public/
├── boards/          # Dashboard page (boards.html, boards.js, boards.css)
├── board/           # Individual board view (board.html, board.js, board.css)
└── shared/          # Shared utilities (sync.js - main sync manager)
```

### Backend Structure
```
api/sync/            # Vercel serverless functions
├── status.js        # Health check endpoint
├── check/[hash].js  # Sync ID validation
└── data/[hash].js   # Data sync CRUD operations

server.js            # Express server for local development
```

### Data Sync Architecture
- **SyncManager class** (public/shared/sync.js): Handles client-side sync logic
- **Redis/KV Storage**: Upstash Redis for persistence
- **Multi-user isolation**: Each user has a unique sync ID (6-20 chars)
- **Conflict resolution**: Latest timestamp wins for merging data

## Key Technologies

- **Frontend**: Vanilla JavaScript, Bootstrap 5, drag-and-drop API
- **Backend**: Express.js (local), Vercel serverless functions (production)
- **Storage**: Local Storage + Upstash Redis/Vercel KV
- **Deployment**: Vercel with automatic environment detection

## Environment Configuration

### Required Environment Variables (Production)
```
KV_REST_API_URL=     # Upstash Redis URL
KV_REST_API_TOKEN=   # Upstash Redis token
```

### Local Development Setup
1. Copy `.env.example` to `.env` and add Upstash credentials
2. Or use `vercel env pull .env` to sync from Vercel

## Data Models

### Board Structure
```javascript
{
  id: string,
  title: string,
  description: string,
  backgroundColor: string (CSS gradient),
  createdAt: ISO string,
  updatedAt: ISO string
}
```

### Card Structure
```javascript
{
  id: string,
  title: string,
  description: string,
  column: 'backlog' | 'todo' | 'doing' | 'done',
  assignee?: string,
  priority?: 'low' | 'medium' | 'high',
  createdAt: ISO string,
  updatedAt: ISO string
}
```

### Sync Data Structure
```javascript
{
  timestamp: number,
  data: {
    workspaceSettings: { name: string, backgroundColor: string },
    boards: Board[],
    cards: { [boardId]: Card[] }
  }
}
```

## Common Development Tasks

### Adding New Features
1. Frontend changes go in `public/board/` or `public/boards/`
2. Backend API changes in `api/sync/` (ensure dual compatibility)
3. Sync logic updates in `public/shared/sync.js`

### Testing Sync Functionality
- Use `test/test-sync.html` for basic sync testing
- Use `test/test-multiuser.html` for multi-user scenarios
- Run `npm run test:kv` for server-side KV storage tests

### Deployment Flow
- Local: `npm start` → Express server
- Production: `npm run deploy` → Vercel serverless
- Auto-detection handles API endpoint routing

## Important Implementation Details

### URL Routing
- Vercel rewrites root `/` to `/public/boards/boards.html`
- API endpoints work at both `/api/sync/*` (production) and `localhost:3001/api/sync/*` (local)

### Security Headers
- X-Content-Type-Options, X-Frame-Options, X-XSS-Protection configured in vercel.json

### Error Handling
- Graceful fallback to local storage when sync fails
- Client-side validation for sync IDs (6-20 alphanumeric chars)
- Automatic retry logic with exponential backoff

## No Build Process
This project uses vanilla JavaScript with no bundling or compilation steps. Changes are immediately reflected without build commands.