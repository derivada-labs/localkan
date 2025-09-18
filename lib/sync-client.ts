// Client-side sync utilities that call API routes
export interface Board {
  id: string
  title: string
  color: string
  description?: string
  assignees?: string
}

export interface WorkspaceData {
  boards: Board[]
  workspaceName: string
  lastSync: string
}

export const syncToCloud = async (syncId: string, boards: Board[], workspaceName: string): Promise<void> => {
  const response = await fetch('/api/sync', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      syncId,
      boards,
      workspaceName,
    }),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || 'Failed to sync to cloud')
  }
}

export const syncFromCloud = async (syncId: string): Promise<WorkspaceData | null> => {
  const response = await fetch(`/api/sync?syncId=${encodeURIComponent(syncId)}`)

  if (response.status === 404) {
    return null // No data found for this sync ID
  }

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || 'Failed to sync from cloud')
  }

  const result = await response.json()
  return result.data
}

export const generateSyncId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}