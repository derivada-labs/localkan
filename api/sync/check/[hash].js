import { kv } from '@vercel/kv';

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

        // Check if hash exists in Vercel KV
        // If KV is not configured, this will throw an error and we'll use fallback
        const data = await kv.get(`sync:${sanitizedHash}`);
        
        res.status(200).json({
            exists: data !== null,
            hash: sanitizedHash
        });
    } catch (error) {
        console.error('Error checking hash:', error);
        
        // If KV is not configured, use fallback response
        if (error.message && (error.message.includes('KV_') || error.message.includes('No KV'))) {
            return res.status(200).json({
                exists: false,
                hash: req.query.hash,
                warning: 'KV storage not configured - using demo mode'
            });
        }
        
        res.status(500).json({ error: 'Failed to check hash' });
    }
}