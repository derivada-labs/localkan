import { Redis } from '@upstash/redis';

// Initialize Redis client
const redis = new Redis({
    url: process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN,
});

// Health check endpoint for sync service
export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Only allow GET
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Test Redis connection
        const pingResult = await redis.ping();
        
        // Return status
        res.status(200).json({
            status: 'online',
            serverTime: Date.now(),
            version: '2.0.0',
            environment: 'vercel',
            storage: 'redis',
            redis: pingResult === 'PONG' ? 'connected' : 'disconnected'
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            serverTime: Date.now(),
            version: '2.0.0',
            environment: 'vercel',
            storage: 'redis',
            redis: 'disconnected',
            error: error.message
        });
    }
}