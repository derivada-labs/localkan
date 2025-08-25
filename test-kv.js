// Test Vercel KV connection
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Load environment variables from .env.development.local
import fs from 'fs';
const envFile = fs.readFileSync('.env.development.local', 'utf-8');
envFile.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
        const value = valueParts.join('=').replace(/^["']|["']$/g, '');
        process.env[key] = value;
    }
});

import { kv } from '@vercel/kv';

async function testConnection() {
    try {
        console.log('Testing Vercel KV connection...');
        console.log('Using KV_REST_API_URL:', process.env.KV_REST_API_URL);
        
        // Test write
        const testKey = 'test:connection';
        const testValue = { message: 'Hello from Upstash!', timestamp: Date.now() };
        
        await kv.set(testKey, testValue);
        console.log('✅ Write successful:', testValue);
        
        // Test read
        const retrieved = await kv.get(testKey);
        console.log('✅ Read successful:', retrieved);
        
        // Clean up
        await kv.del(testKey);
        console.log('✅ Delete successful');
        
        console.log('\n🎉 Vercel KV (Upstash Redis) is working correctly!');
    } catch (error) {
        console.error('❌ Connection failed:', error.message);
        console.log('\nMake sure you have set the KV environment variables in Vercel.');
    }
}

testConnection();