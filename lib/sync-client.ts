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
  settings?: {
    backgroundColor?: string
    [key: string]: any
  }
}

export const syncToCloud = async (syncId: string, boards: Board[], workspaceName: string, settings?: any): Promise<void> => {
  const response = await fetch('/api/sync', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      syncId,
      boards,
      workspaceName,
      settings: settings || {
        backgroundColor: localStorage.getItem('workspace-background') || 'purple'
      }
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
  // Generate a 5-letter sync ID using uppercase letters and numbers
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export const disconnectSync = async (syncId: string): Promise<void> => {
  const response = await fetch(`/api/sync?syncId=${encodeURIComponent(syncId)}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || 'Failed to disconnect sync ID')
  }

  // Clear local storage
  localStorage.removeItem('sync-id')
}