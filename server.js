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

// Configuration constants
const CONFIG = {
    PORT: process.env.PORT || 3001,
    DATA_DIR: path.join(__dirname, 'data'),
    JSON_LIMIT: '10mb',
    HASH_MIN_LENGTH: 6,
    HASH_MAX_LENGTH: 20,
    VERSION: '2.0.0',
    REDIS: {
        URL: process.env.KV_REST_API_URL,
        TOKEN: process.env.KV_REST_API_TOKEN
    }
};

// Redis client with connection management
class RedisManager {
    constructor() {
        this.client = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectInterval = 5000;
    }
    
    async connect() {
        try {
            this.client = new Redis({
                url: CONFIG.REDIS.URL,
                token: CONFIG.REDIS.TOKEN,
                retry: {
                    retries: this.maxReconnectAttempts,
                    delay: (attempt) => Math.min(attempt * 50, 500)
                }
            });
            
            // Test connection
            await this.client.ping();
            this.isConnected = true;
            this.reconnectAttempts = 0;
            console.log('🟢 Redis connected successfully');
            
            return this.client;
        } catch (error) {
            this.isConnected = false;
            console.error('🔴 Redis connection failed:', error.message);
            throw error;
        }
    }
    
    async ensureConnection() {
        if (!this.isConnected) {
            await this.connect();
        }
        return this.client;
    }
    
    disconnect() {
        if (this.client && typeof this.client.disconnect === 'function') {
            this.client.disconnect();
            this.isConnected = false;
        }
    }
}

const redisManager = new RedisManager();
let redis;

// Initialize Redis connection
try {
    redis = await redisManager.connect();
} catch (error) {
    console.error('🔴 Failed to initialize Redis client:', error.message);
    process.exit(1);
}

// Ensure data directory exists
fs.ensureDirSync(CONFIG.DATA_DIR);

const app = express();

// Middleware setup
function setupMiddleware(app) {
    // CORS middleware
    app.use(cors({
        origin: process.env.NODE_ENV === 'production' ? process.env.ALLOWED_ORIGINS?.split(',') : true,
        credentials: true
    }));
    
    // JSON parsing middleware
    app.use(express.json({ 
        limit: CONFIG.JSON_LIMIT,
        verify: (req, res, buf) => {
            req.rawBody = buf;
        }
    }));
    
    // Request logging middleware
    app.use((req, res, next) => {
        const start = Date.now();
        res.on('finish', () => {
            const duration = Date.now() - start;
            console.log(`${new Date().toISOString()} ${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
        });
        next();
    });
    
    // Static file serving
    app.use(express.static(path.join(__dirname, 'public')));
    app.use('/boards', express.static(path.join(__dirname, 'public', 'boards')));
    app.use('/board', express.static(path.join(__dirname, 'public', 'board')));
}

// Error handling middleware
function setupErrorHandling(app) {
    // Global error handler
    app.use((err, req, res, next) => {
        console.error(`${new Date().toISOString()} ERROR:`, err.stack);
        
        if (res.headersSent) {
            return next(err);
        }
        
        const statusCode = err.statusCode || err.status || 500;
        const message = process.env.NODE_ENV === 'production' && statusCode === 500 
            ? 'Internal Server Error' 
            : err.message;
            
        res.status(statusCode).json({
            error: message,
            timestamp: new Date().toISOString()
        });
    });
    
    // 404 handler
    app.use((req, res) => {
        res.status(404).json({
            error: 'Not Found',
            path: req.path,
            timestamp: new Date().toISOString()
        });
    });
}

setupMiddleware(app);

// Route handlers
const routeHandlers = {
    // Static page routes
    serveBoardsPage: (req, res) => {
        res.sendFile(path.join(__dirname, 'public', 'boards', 'boards.html'));
    },
    
    serveBoardPage: (req, res) => {
        res.sendFile(path.join(__dirname, 'public', 'board', 'board.html'));
    },
    
    // API routes
    getStatus: asyncHandler(async (req, res) => {
        const pingResult = await redis.ping();
        
        res.json({ 
            status: 'online', 
            serverTime: Date.now(),
            version: CONFIG.VERSION,
            storage: 'redis',
            redis: pingResult === 'PONG' ? 'connected' : 'disconnected'
        });
    }),
    
    checkHash: asyncHandler(async (req, res) => {
        const hash = sanitizeHash(req.params.hash);
        
        if (!hash) {
            throw createError('Invalid hash format');
        }
        
        const exists = await redis.exists(`sync:${hash}`);
        
        res.json({ 
            exists: exists === 1,
            hash 
        });
    }),
    
    getSyncData: asyncHandler(async (req, res) => {
        const hash = sanitizeHash(req.params.hash);
        
        if (!hash) {
            throw createError('Invalid hash format');
        }
        
        const syncData = await redis.get(`sync:${hash}`);
        
        if (!syncData) {
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
        
        const data = typeof syncData === 'string' ? JSON.parse(syncData) : syncData;
        data.hash = hash;
        res.json(data);
    }),
    
    updateSyncData: asyncHandler(async (req, res) => {
        const hash = sanitizeHash(req.params.hash);
        
        if (!hash) {
            throw createError('Invalid hash format');
        }
        
        const { timestamp, data } = req.body;
        
        if (!timestamp || !data) {
            throw createError('Missing timestamp or data');
        }
        
        const existingData = await redis.get(`sync:${hash}`);
        
        if (existingData) {
            const parsed = typeof existingData === 'string' ? JSON.parse(existingData) : existingData;
            
            if (parsed.timestamp > timestamp) {
                return res.json({
                    success: false,
                    message: 'Server data is newer',
                    serverTimestamp: parsed.timestamp,
                    clientTimestamp: timestamp
                });
            }
        }
        
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
    }),
    
    legacyEndpoint: (req, res) => {
        res.status(400).json({ 
            error: 'Hash required. Please update your client to version 2.0' 
        });
    }
};

// Define routes
app.get('/', routeHandlers.serveBoardsPage);
app.get('/boards', routeHandlers.serveBoardsPage);
app.get('/board', routeHandlers.serveBoardPage);

// Utility functions
function sanitizeHash(hash) {
    if (!hash || typeof hash !== 'string') {
        return null;
    }
    const sanitized = hash.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (sanitized.length < CONFIG.HASH_MIN_LENGTH || sanitized.length > CONFIG.HASH_MAX_LENGTH) {
        return null;
    }
    return sanitized;
}

function createError(message, statusCode = 400) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

function asyncHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}

// API routes
app.get('/api/sync/status', routeHandlers.getStatus);

app.get('/api/sync/check/:hash', routeHandlers.checkHash);

app.get('/api/sync/data/:hash', routeHandlers.getSyncData);

app.post('/api/sync/data/:hash', routeHandlers.updateSyncData);

// Legacy endpoints for backward compatibility
app.get('/api/sync/data', routeHandlers.legacyEndpoint);
app.post('/api/sync/data', routeHandlers.legacyEndpoint);

// Setup error handling after all routes
setupErrorHandling(app);

// Graceful shutdown handling
let server;
const gracefulShutdown = (signal) => {
    console.log(`\n📡 Received ${signal}. Starting graceful shutdown...`);
    
    if (server) {
        server.close((err) => {
            if (err) {
                console.error('🔴 Error during server shutdown:', err);
                process.exit(1);
            }
            
            console.log('✅ Server closed successfully');
            
            // Close Redis connection
            redisManager.disconnect();
            console.log('✅ Redis connection closed');
            
            process.exit(0);
        });
        
        // Force close after 10 seconds
        setTimeout(() => {
            console.error('🔴 Forced shutdown after timeout');
            process.exit(1);
        }, 10000);
    } else {
        process.exit(0);
    }
};

// Register shutdown handlers
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('uncaughtException', (err) => {
    console.error('🔴 Uncaught Exception:', err);
    gracefulShutdown('uncaughtException');
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('🔴 Unhandled Rejection at:', promise, 'reason:', reason);
    gracefulShutdown('unhandledRejection');
});

// Start server
server = app.listen(CONFIG.PORT, async () => {
    console.log(`✅ Sync server running on http://localhost:${CONFIG.PORT}`);
    console.log(`☁️  Using Upstash Redis for data storage`);
    console.log(`🔐 Multi-user mode enabled with hash-based isolation`);
    console.log(`📦 Version: ${CONFIG.VERSION}`);
    
    // Test Redis connection
    try {
        await redis.ping();
        console.log(`🟢 Redis connection successful`);
    } catch (error) {
        console.error(`🔴 Redis connection failed:`, error.message);
        gracefulShutdown('Redis connection failed');
    }
});