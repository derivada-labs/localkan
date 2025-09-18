// Redis utility for cloud sync functionality using Upstash Redis
import { Redis } from '@upstash/redis'

interface WorkspaceData {
  boards: Board[]
  workspaceName: string
  lastSync: string
  settings?: {
    backgroundColor?: string
    [key: string]: any
  }
}

interface Board {
  id: string
  title: string
  color: string
  description?: string
  assignees?: string
}

// Initialize Redis client with environment variables
const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

class RedisClient {
  async set(key: string, value: WorkspaceData): Promise<void> {
    try {
      await redis.set(key, value)
    } catch (error) {
      console.error('Failed to set data in Redis:', error)
      throw error
    }
  }

  async get(key: string): Promise<WorkspaceData | null> {
    try {
      const result = await redis.get<WorkspaceData>(key)
      return result
    } catch (error) {
      console.error('Failed to get data from Redis:', error)
      throw error
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await redis.del(key)
    } catch (error) {
      console.error('Failed to delete data from Redis:', error)
      throw error
    }
  }

  isConfigured(): boolean {
    return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN)
  }
}

export const redisClient = new RedisClient()

export const syncToCloud = async (syncId: string, boards: Board[], workspaceName: string, settings?: any): Promise<void> => {
  try {
    const data: WorkspaceData = {
      boards,
      workspaceName,
      lastSync: new Date().toISOString(),
      settings: settings || {
        backgroundColor: localStorage.getItem('workspace-background') || 'purple'
      }
    }
    await redisClient.set(syncId, data)
  } catch (error) {
    console.error("Failed to sync to cloud:", error)
    throw error
  }
}

export const syncFromCloud = async (syncId: string): Promise<WorkspaceData | null> => {
  try {
    return await redisClient.get(syncId)
  } catch (error) {
    console.error("Failed to sync from cloud:", error)
    throw error
  }
}

export const generateSyncId = (): string => {
  // Generate a 5-letter sync ID using uppercase letters and numbers
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Export types for use in components
export type { WorkspaceData, Board }