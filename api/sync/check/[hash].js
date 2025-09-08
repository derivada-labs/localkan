import { Redis } from '@upstash/redis';

// Initialize Redis client
const redis = new Redis({
    url: process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN,
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
        const { hash } = req.query;
        const sanitizedHash = sanitizeHash(hash);

        if (!sanitizedHash) {
            return res.status(400).json({
                exists: false,
                error: 'Invalid hash format'
            });
        }

        // Check if hash exists in Redis
        const exists = await redis.exists(`sync:${sanitizedHash}`);
        
        res.status(200).json({
            exists: exists === 1,
            hash: sanitizedHash,
            mode: 'production'
        });
    } catch (error) {
        console.error('Error checking hash:', error);
        
        // If Redis is not configured, always return true in demo mode
        if (error.message && (error.message.includes('Redis') || error.message.includes('connection'))) {
            return res.status(200).json({
                exists: true, // Always true in demo mode to allow testing
                hash: req.query.hash,
                mode: 'demo',
                warning: 'Demo mode - Redis connection failed'
            });
        }
        
        res.status(500).json({ error: 'Failed to check hash' });
    }
}