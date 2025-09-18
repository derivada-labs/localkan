import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';

// Lazy initialization to avoid build-time warnings
const getRedis = () => {
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });
};

export const POST = async () => {
  // Fetch data from Redis
  const redis = getRedis();
  const result = await redis.get("item");
  
  // Return the result in the response
  return new NextResponse(JSON.stringify({ result }), { status: 200 });
};

// Additional endpoint to set test data
export const PUT = async () => {
  try {
    // Set test data in Redis
    const redis = getRedis();
    await redis.set("item", { message: "Hello from Upstash Redis!", timestamp: new Date().toISOString() });
    
    return new NextResponse(JSON.stringify({ success: true, message: "Test data set successfully" }), { status: 200 });
  } catch (err) {
    console.error("Redis error:", err);
    return new NextResponse(JSON.stringify({ error: "Failed to set test data" }), { status: 500 });
  }
};