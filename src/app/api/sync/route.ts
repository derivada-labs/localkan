import { NextRequest, NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'

// Initialize Redis client with environment variables
const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

interface WorkspaceData {
  boards: Board[]
  workspaceName: string
  lastSync: string
  settings?: {
    backgroundColor?: string
    [key: string]: string | number | boolean | undefined
  }
}

interface Board {
  id: string
  title: string
  color: string
  description?: string
  assignees?: string
}

// POST - Save data to cloud
export async function POST(request: NextRequest) {
  try {
    const { syncId, boards, workspaceName, settings } = await request.json()
    
    if (!syncId || !boards || !workspaceName) {
      return NextResponse.json(
        { error: 'Missing required fields: syncId, boards, workspaceName' },
        { status: 400 }
      )
    }

    const data: WorkspaceData = {
      boards,
      workspaceName,
      lastSync: new Date().toISOString(),
      settings: settings || {}
    }

    await redis.set(syncId, data)
    
    return NextResponse.json({ success: true, message: 'Data synced to cloud successfully' })
  } catch (error) {
    console.error('Failed to sync to cloud:', error)
    return NextResponse.json(
      { error: 'Failed to sync data to cloud' },
      { status: 500 }
    )
  }
}

// GET - Retrieve data from cloud
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const syncId = searchParams.get('syncId')
    
    if (!syncId) {
      return NextResponse.json(
        { error: 'Missing syncId parameter' },
        { status: 400 }
      )
    }

    const data = await redis.get<WorkspaceData>(syncId)
    
    if (!data) {
      return NextResponse.json(
        { error: 'No data found for this sync ID' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Failed to sync from cloud:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve data from cloud' },
      { status: 500 }
    )
  }
}

// DELETE - Disconnect from sync ID (remove from Redis)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const syncId = searchParams.get('syncId')
    
    if (!syncId) {
      return NextResponse.json(
        { error: 'Missing syncId parameter' },
        { status: 400 }
      )
    }

    await redis.del(syncId)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Sync ID disconnected and data removed from cloud' 
    })
  } catch (error) {
    console.error('Failed to disconnect sync ID:', error)
    return NextResponse.json(
      { error: 'Failed to disconnect sync ID' },
      { status: 500 }
    )
  }
}