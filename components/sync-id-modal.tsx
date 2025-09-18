"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Cloud, Users, Hash, AlertCircle, Copy, LogOut } from "lucide-react"
import { generateSyncId, syncToCloud, syncFromCloud, disconnectSync } from "@/lib/sync-client"

interface SyncIdModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSyncSetup?: (syncId: string) => void
}

export function SyncIdModal({ open, onOpenChange, onSyncSetup }: SyncIdModalProps) {
  const [syncId, setSyncId] = useState("")
  const [activeSyncId, setActiveSyncId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    // Check for existing sync ID when modal opens
    if (open) {
      const existingSyncId = localStorage.getItem("sync-id")
      setActiveSyncId(existingSyncId)
    }
  }, [open])

  const handleCopyId = async () => {
    if (activeSyncId) {
      try {
        await navigator.clipboard.writeText(activeSyncId)
        alert("Sync ID copied to clipboard!")
      } catch (err) {
        console.error("Failed to copy:", err)
      }
    }
  }

  const handleDisconnect = async () => {
    if (!activeSyncId) return
    
    const confirmDisconnect = confirm(
      "Are you sure you want to disconnect from this Sync ID?\n\nThis will:\n• Remove the sync ID from this device\n• Delete all data from the cloud\n• This action cannot be undone"
    )
    
    if (!confirmDisconnect) return

    try {
      setIsLoading(true)
      setError("")
      
      await disconnectSync(activeSyncId)
      setActiveSyncId(null)
      
      alert("Successfully disconnected from Sync ID!")
      onOpenChange(false)
      
      // Refresh the page to reset the local state
      window.location.reload()
    } catch (err) {
      console.error("Disconnect error:", err)
      setError("Failed to disconnect from sync ID")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateNewSync = async () => {
    try {
      setIsLoading(true)
      setError("")
      
      const newSyncId = generateSyncId()
      const boards = JSON.parse(localStorage.getItem("kanban-boards") || "[]")
      const workspaceName = localStorage.getItem("workspace-name") || "My Workspace"
      const settings = {
        backgroundColor: localStorage.getItem("workspace-background") || "purple"
      }
      
      await syncToCloud(newSyncId, boards, workspaceName, settings)
      
      localStorage.setItem("sync-id", newSyncId)
      
      if (onSyncSetup) {
        onSyncSetup(newSyncId)
      }
      
      setActiveSyncId(newSyncId)
      alert(`✅ Sync ID created and boards uploaded successfully!\n\nSync ID: ${newSyncId}\n\nUse this ID on other devices to access your boards.`)
    } catch (err) {
      console.error("Sync creation error:", err)
      setError("Failed to create sync ID and upload boards")
    } finally {
      setIsLoading(false)
    }
  }

  const handleActivateExisting = async () => {
    if (!syncId.trim()) {
      setError("Please enter a sync ID")
      return
    }

    try {
      setIsLoading(true)
      setError("")
      
      const cloudData = await syncFromCloud(syncId)
      
      if (cloudData) {
        localStorage.setItem("kanban-boards", JSON.stringify(cloudData.boards))
        localStorage.setItem("workspace-name", cloudData.workspaceName)
        localStorage.setItem("sync-id", syncId)
        
        // Restore settings if available
        if (cloudData.settings) {
          if (cloudData.settings.backgroundColor) {
            localStorage.setItem("workspace-background", cloudData.settings.backgroundColor)
          }
        }
        
        if (onSyncSetup) {
          onSyncSetup(syncId)
        }
        
        setActiveSyncId(syncId)
        alert("Sync activated successfully! Please refresh the page to see your synced boards.")
      } else {
        setError("Sync ID not found or invalid")
      }
    } catch (err) {
      setError("Failed to activate sync ID")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Cloud className="w-5 h-5 text-blue-500" />
            Sync ID Management
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

          {activeSyncId && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="font-medium text-green-900">Active Sync ID</span>
              </div>
              
              <div className="flex items-center gap-2 mb-3">
                <div className="bg-blue-100 px-3 py-2 rounded font-mono text-blue-900 flex-1">
                  {activeSyncId}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyId}
                  className="flex items-center gap-1"
                >
                  <Copy className="w-4 h-4" />
                  Copy
                </Button>
              </div>
              
              <p className="text-sm text-green-700 mb-4">
                Use this ID on other devices to sync your boards
              </p>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <LogOut className="w-4 h-4 text-yellow-600" />
                  <span className="font-medium text-yellow-900">Switch to Different Sync ID</span>
                </div>
                <p className="text-sm text-yellow-700 mb-3">
                  ⚠️ Warning: This will replace all your local data
                </p>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDisconnect}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? "Disconnecting..." : "🔗 Disconnect & Clear Data"}
                </Button>
              </div>
            </div>
          )}

          {!activeSyncId && (
            <>
              <div className="text-center py-4">
                <Cloud className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <h3 className="font-medium text-gray-900 mb-2">Redis Configured</h3>
                <p className="text-sm text-gray-600">Create a new Sync ID or enter an existing one to enable cloud sync</p>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 hover:bg-blue-100">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-900">New User?</span>
                </div>
                <p className="text-sm text-blue-700 mb-4">
                  Create a new Sync ID and upload your current boards to the cloud
                </p>
                <Button 
                  onClick={handleCreateNewSync}
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <span className="mr-2">☁️</span>
                  {isLoading ? "Creating & Uploading..." : "Create ID & Upload Boards"}
                </Button>
              </div>

              <div className="bg-yellow-50 rounded-lg p-4 hover:bg-yellow-100">
                <div className="flex items-center gap-2 mb-2">
                  <Hash className="w-4 h-4 text-yellow-600" />
                  <span className="font-medium text-yellow-900">Have an existing ID?</span>
                </div>
                <p className="text-sm text-yellow-700 mb-4">Enter your Sync ID to download your boards from the cloud</p>
                <div className="space-y-3">
                  <Input
                    placeholder="ENTER YOUR SYNC ID"
                    value={syncId}
                    onChange={(e) => setSyncId(e.target.value)}
                    className="bg-white"
                  />
                  <Button 
                    onClick={handleActivateExisting}
                    disabled={isLoading}
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
                  >
                    <span className="mr-2">⚡</span>
                    {isLoading ? "Activating..." : "Activate Existing ID"}
                  </Button>
                </div>
              </div>
            </>
          )}

          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              <span className="mr-2">✕</span>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
