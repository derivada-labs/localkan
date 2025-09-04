import express from 'express';
import cors from 'cors';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { Redis } from '@upstash/redis';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Redis client
const redis = new Redis({
    url: process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN,
});

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_DIR = path.join(__dirname, 'data');

// Ensure data directory exists
fs.ensureDirSync(DATA_DIR);

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Serve static files from the root directory
app.use(express.static(__dirname));

// Root route - serve the main boards page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'boards.html'));
});

// Validate and sanitize hash
function sanitizeHash(hash) {
    if (!hash || typeof hash !== 'string') {
        return null;
    }
    // Allow only alphanumeric characters, convert to lowercase
    const sanitized = hash.toLowerCase().replace(/[^a-z0-9]/g, '');
    // Ensure hash is between 6 and 20 characters
    if (sanitized.length < 6 || sanitized.length > 20) {
        return null;
    }
    return sanitized;
}

// Health check endpoint
app.get('/api/sync/status', async (req, res) => {
    try {
        // Test Redis connection
        const pingResult = await redis.ping();
        
        res.json({ 
            status: 'online', 
            serverTime: Date.now(),
            version: '2.0.0', // Updated version for multi-user support
            storage: 'redis',
            redis: pingResult === 'PONG' ? 'connected' : 'disconnected'
        });
    } catch (error) {
        res.status(500).json({ 
            status: 'error', 
            serverTime: Date.now(),
            version: '2.0.0',
            storage: 'redis',
            redis: 'disconnected',
            error: error.message
        });
    }
});

// Check if hash exists
app.get('/api/sync/check/:hash', async (req, res) => {
    try {
        const hash = sanitizeHash(req.params.hash);
        
        if (!hash) {
            return res.status(400).json({ 
                exists: false, 
                error: 'Invalid hash format' 
            });
        }
        
        // Check if data exists in Redis
        const exists = await redis.exists(`sync:${hash}`);
        
        res.json({ 
            exists: exists === 1,
            hash 
        });
    } catch (error) {
        console.error('Error checking hash:', error);
        res.status(500).json({ error: 'Failed to check hash' });
    }
});

// Get sync data for specific hash
app.get('/api/sync/data/:hash', async (req, res) => {
    try {
        const hash = sanitizeHash(req.params.hash);
        
        if (!hash) {
            return res.status(400).json({ error: 'Invalid hash format' });
        }
        
        // Get data from Redis
        const syncData = await redis.get(`sync:${hash}`);
        
        if (!syncData) {
            // Return empty data with zero timestamp
            return res.json({
                timestamp: 0,
                hash,
                data: {
                    workspaceSettings: null,
                    boards: [],
                    cards: {}
                }
            });
        }
        
        // Return existing data
        const data = typeof syncData === 'string' ? JSON.parse(syncData) : syncData;
        data.hash = hash; // Include hash in response
        res.json(data);
    } catch (error) {
        console.error('Error reading sync data:', error);
        res.status(500).json({ error: 'Failed to read sync data' });
    }
});

// Update sync data for specific hash
app.post('/api/sync/data/:hash', async (req, res) => {
    try {
        const hash = sanitizeHash(req.params.hash);
        
        if (!hash) {
            return res.status(400).json({ error: 'Invalid hash format' });
        }
        
        const { timestamp, data } = req.body;
        
        // Validate request
        if (!timestamp || !data) {
            return res.status(400).json({ error: 'Missing timestamp or data' });
        }
        
        // Check if existing data is newer
        const existingData = await redis.get(`sync:${hash}`);
        
        if (existingData) {
            const parsed = typeof existingData === 'string' ? JSON.parse(existingData) : existingData;
            
            if (parsed.timestamp > timestamp) {
                // Server data is newer, don't update
                return res.json({
                    success: false,
                    message: 'Server data is newer',
                    serverTimestamp: parsed.timestamp,
                    clientTimestamp: timestamp
                });
            }
        }
        
        // Save new data to Redis
        const syncData = {
            timestamp,
            data,
            hash,
            lastUpdated: new Date().toISOString()
        };
        
        await redis.set(`sync:${hash}`, JSON.stringify(syncData));
        
        res.json({
            success: true,
            message: 'Data synced successfully',
            timestamp,
            hash
        });
    } catch (error) {
        console.error('Error saving sync data:', error);
        res.status(500).json({ error: 'Failed to save sync data' });
    }
});

// Legacy endpoints for backward compatibility (redirect to default hash)
app.get('/api/sync/data', async (req, res) => {
    res.status(400).json({ 
        error: 'Hash required. Please update your client to version 2.0' 
    });
});

app.post('/api/sync/data', async (req, res) => {
    res.status(400).json({ 
        error: 'Hash required. Please update your client to version 2.0' 
    });
});

// Start server
app.listen(PORT, async () => {
    console.log(`✅ Sync server running on http://localhost:${PORT}`);
    console.log(`☁️  Using Upstash Redis for data storage`);
    console.log(`🔐 Multi-user mode enabled with hash-based isolation`);
    
    // Test Redis connection
    try {
        await redis.ping();
        console.log(`🟢 Redis connection successful`);
    } catch (error) {
        console.error(`🔴 Redis connection failed:`, error.message);
    }
});