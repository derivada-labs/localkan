# LocalKan - Multi-User Kanban Todo App

A beautiful, responsive Kanban board application with multi-user cloud sync capabilities. Built with vanilla JavaScript and designed for both personal use and team collaboration.

![LocalKan Dashboard](https://img.shields.io/badge/LocalKan-Kanban%20Boards-blue?style=for-the-badge)

## ✨ Features

### 🎯 Core Functionality
- **Kanban Board Management**: Create unlimited boards with custom titles and descriptions
- **Drag & Drop Cards**: Intuitive card management across columns (Backlog, To-Do, Doing, Done)
- **Rich Card Content**: Add titles, descriptions, and timestamps to cards
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

### 🎨 Customization
- **Theme System**: 9 beautiful gradient themes for boards and workspace
- **Custom Backgrounds**: Personalize each board with unique color schemes
- **Workspace Settings**: Customize workspace name and appearance

### ☁️ Cloud Sync & Multi-User Support
- **Multi-User Sync**: Each user gets a unique Sync ID for data isolation
- **Cross-Device Sync**: Access your boards from anywhere
- **Real-Time Updates**: Automatic sync with conflict resolution
- **Offline Support**: Works offline, syncs when connection is restored

### 📊 Data Management
- **Import/Export**: Backup and restore boards with JSON export/import
- **Local Storage**: Data persists locally even without sync
- **Bulk Operations**: Mass delete cards by column
- **Data Validation**: Robust error handling and data integrity

## 🚀 Quick Start

### Option 1: Instant Deployment (Recommended)

Deploy to Vercel in 30 seconds:

```bash
npx vercel
```

Your app is now live! Works immediately with demo mode (data resets periodically).

### Option 2: Local Development

```bash
# Clone the repository
git clone <your-repo-url>
cd localkan

# Install dependencies
npm install

# Start local server
npm run dev
```

Open `http://localhost:3001` in your browser.

## 📁 Project Structure

```
localkan/
├── public/                     # Frontend assets
│   ├── boards/                 # Dashboard page
│   │   ├── boards.html         # Main dashboard
│   │   ├── boards.css          # Dashboard styles
│   │   └── boards.js           # Dashboard logic
│   ├── board/                  # Kanban board page
│   │   ├── board.html          # Kanban board view
│   │   ├── board.css           # Board styles
│   │   └── board.js            # Board logic
│   └── shared/                 # Shared components
│       └── sync.js             # Sync manager
├── api/                        # Serverless functions
│   └── sync/                   # Sync API endpoints
│       ├── status.js           # Health check
│       ├── check/[hash].js     # Sync ID validation
│       └── data/[hash].js      # Data sync endpoint
├── test/                       # Test files
│   ├── test-multiuser.html     # Multi-user testing
│   ├── test-sync.html          # Sync testing
│   └── test-kv.js              # KV storage testing
├── server.js                   # Express server (local dev)
├── package.json                # Dependencies & scripts
├── vercel.json                 # Vercel configuration
└── README.md                   # This file
```

## 🔧 Configuration

### Environment Setup

The app automatically detects its environment:

- **Local Development**: Uses Express server on `localhost:3001`
- **Production (Vercel)**: Uses serverless functions at `/api`

### Adding Persistent Storage

For production deployments with persistent data:

1. **Deploy to Vercel** (if not done already)
2. **Go to Vercel Dashboard** → Your Project → **Storage** tab
3. **Create Database** → Select **KV** (Redis)
4. **Choose name** (e.g., "kanban-storage") → **Create**

That's it! Vercel automatically connects the database. Your app now has persistent storage.

## 🌐 API Documentation

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/sync/status` | Health check |
| `GET` | `/api/sync/check/[hash]` | Validate Sync ID |
| `GET` | `/api/sync/data/[hash]` | Retrieve sync data |
| `POST` | `/api/sync/data/[hash]` | Update sync data |

### Data Format

#### Sync Data Structure
```json
{
  "timestamp": 1672531200000,
  "data": {
    "workspaceSettings": {
      "name": "My Workspace",
      "backgroundColor": "linear-gradient(...)"
    },
    "boards": [
      {
        "id": "board123",
        "title": "Project Board",
        "description": "Main project tasks",
        "backgroundColor": "linear-gradient(...)",
        "createdAt": "2023-01-01T00:00:00.000Z",
        "updatedAt": "2023-01-01T00:00:00.000Z"
      }
    ],
    "cards": {
      "board123": [
        {
          "id": "card456",
          "title": "Task Title",
          "description": "Task description",
          "column": "todo",
          "createdAt": "2023-01-01T00:00:00.000Z",
          "updatedAt": "2023-01-01T00:00:00.000Z"
        }
      ]
    }
  }
}
```

## 💻 Development

### Available Scripts

```bash
# Local development with Express
npm run dev

# Start Express server
npm start

# Vercel development environment
npm run vercel-dev

# Deploy to production
npm run deploy
```

### Environment Variables

For local development with Vercel KV:

```bash
# Pull environment variables from Vercel
vercel env pull .env.local

# Run with Vercel CLI
npx vercel dev
```

### Testing

The `test/` directory contains testing utilities:

- **test-multiuser.html**: Multi-user sync testing interface
- **test-sync.html**: Sync functionality testing
- **test-kv.js**: KV storage testing utilities

## 🎨 Customization

### Adding New Themes

Edit the `colorThemes` array in both `boards.js` and `board.js`:

```javascript
const colorThemes = [
    { name: 'Custom', gradient: 'linear-gradient(135deg, #your-colors)' },
    // ... existing themes
];
```

### Modifying Sync Behavior

The sync manager in `public/shared/sync.js` handles all sync operations:

- **Conflict Resolution**: Latest timestamp wins
- **Automatic Sync**: Configurable intervals
- **Error Handling**: Graceful fallback to local storage

## 🌟 Deployment Options

### Vercel (Recommended)

1. **One-Click Deploy**: `npx vercel`
2. **GitHub Integration**: Connect repository for automatic deployments
3. **Custom Domain**: Configure in Vercel dashboard
4. **Environment Variables**: Automatically managed

### Self-Hosting

```bash
# Using the Express server
npm start

# Or with PM2
pm2 start server.js --name "localkan"
```

### Docker (Optional)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

## 🔄 Sync ID Management

### For Users

1. **New User**: Click "Create New Sync ID" to get started
2. **Existing User**: Enter your Sync ID to access your data
3. **Multi-Device**: Use the same Sync ID on all devices
4. **Sharing**: Share Sync ID with team members for collaboration

### Technical Details

- **Format**: 8-character alphanumeric string
- **Security**: Each ID is isolated - no cross-ID access
- **Validation**: Client and server-side validation
- **Backup**: Export data before switching IDs

## 💡 Usage Tips

### Best Practices

1. **Regular Exports**: Backup your data with the export feature
2. **Sync Regularly**: Use "Sync Now" button for immediate sync
3. **Unique Titles**: Use descriptive board and card titles
4. **Column Organization**: Use all four columns for better workflow

### Keyboard Shortcuts

- **Escape**: Close any open modal
- **Enter**: Submit forms
- **Drag & Drop**: Move cards between columns

## 📊 Performance & Limits

### Vercel Free Tier

- **Bandwidth**: 100GB/month
- **Functions**: Unlimited invocations
- **KV Storage**: 256MB, 3000 requests/month
- **Perfect for**: Personal use and small teams

### Recommended Limits

- **Boards**: Up to 50 boards per workspace
- **Cards**: Up to 1000 cards per board
- **Sync Frequency**: Every 5 minutes (configurable)

## 🛠️ Troubleshooting

### Common Issues

#### "Sync ID not found"
- Verify the Sync ID is correct
- Check internet connection
- Try creating a new Sync ID

#### Data not syncing
- Check if KV database is connected in Vercel dashboard
- Verify browser console for errors
- Try manual sync with "Sync Now" button

#### Performance issues
- Clear browser cache
- Reduce number of cards per board
- Export and reimport data to clean up

### Debug Mode

Add `?debug=true` to URL for verbose console logging:
```
https://yourapp.vercel.app?debug=true
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a Pull Request

### Development Guidelines

- Follow existing code style
- Test on multiple devices/browsers
- Update documentation for new features
- Ensure backward compatibility

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Bootstrap Icons](https://icons.getbootstrap.com/) for the icon system
- [Inter Font](https://rsms.me/inter/) for typography
- [Vercel](https://vercel.com) for hosting and infrastructure
- [Upstash Redis](https://upstash.com) for KV storage

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/your-username/localkan/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/localkan/discussions)
- **Email**: your-email@domain.com

---

**LocalKan** - Making project management simple, beautiful, and collaborative. ✨