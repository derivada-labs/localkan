"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Cloud, Users, Hash, AlertCircle } from "lucide-react"
import { generateSyncId, syncToCloud, syncFromCloud } from "@/lib/sync-client"

interface SyncIdModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSyncSetup?: (syncId: string) => void
}

export function SyncIdModal({ open, onOpenChange, onSyncSetup }: SyncIdModalProps) {
  const [syncId, setSyncId] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")



  const handleCreateNewSync = async () => {
    try {
      setIsLoading(true)
      setError("")
      
      const newSyncId = generateSyncId()
      const boards = JSON.parse(localStorage.getItem("kanban-boards") || "[]")
      const workspaceName = localStorage.getItem("workspace-name") || "My Workspace"
      
      await syncToCloud(newSyncId, boards, workspaceName)
      
      localStorage.setItem("sync-id", newSyncId)
      
      if (onSyncSetup) {
        onSyncSetup(newSyncId)
      }
      
      onOpenChange(false)
      alert(`Sync ID created successfully: ${newSyncId}`)
    } catch (err) {
      setError("Failed to create sync ID")
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
        
        if (onSyncSetup) {
          onSyncSetup(syncId)
        }
        
        onOpenChange(false)
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
            Setup Cloud Sync
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

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
              Create a new Sync ID to start syncing your boards across devices
            </p>
            <Button 
              onClick={handleCreateNewSync}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <span className="mr-2">⏱</span>
              {isLoading ? "Creating..." : "Create New Sync ID"}
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
