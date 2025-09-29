"use client"

import { useEffect, useMemo, useState } from "react"
import { BaseModal } from "@/components/ui/base-modal"
import { Button } from "@/components/ui/button"
import { Cloud, CheckCircle2, Copy, RefreshCw } from "lucide-react"
import { generateSyncId, syncToCloud } from "@/lib/sync-client"

interface CreateSyncIdModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated?: (syncId: string, boardCount: number) => void
}

export function CreateSyncIdModal({ open, onOpenChange, onCreated }: CreateSyncIdModalProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string>("")
  const [createdId, setCreatedId] = useState<string>("")
  const [copied, setCopied] = useState(false)

  const { boards, boardCount, workspaceName, settings } = useMemo(() => {
    const boards = JSON.parse(localStorage.getItem("kanban-boards") || "[]")
    const boardCount = Array.isArray(boards) ? boards.length : 0
    const workspaceName = localStorage.getItem("workspace-name") || "My Workspace"
    const settings = { backgroundColor: localStorage.getItem("workspace-background") || "purple" }
    return { boards, boardCount, workspaceName, settings }
  }, [open])

  useEffect(() => {
    if (!open) {
      // reset state when closing
      setIsUploading(false)
      setError("")
      setCreatedId("")
      setCopied(false)
    }
  }, [open])

  const handleCreateAndUpload = async () => {
    try {
      setIsUploading(true)
      setError("")
      const newSyncId = generateSyncId()
      await syncToCloud(newSyncId, boards, workspaceName, settings)
      localStorage.setItem("sync-id", newSyncId)
      setCreatedId(newSyncId)
      setCopied(false)
      onCreated?.(newSyncId, boardCount)
    } catch (e) {
      console.error(e)
      setError("Failed to create and upload. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(createdId)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch (e) {
      console.error("Copy failed", e)
    }
  }

  return (
    <BaseModal
      open={open}
      onOpenChange={onOpenChange}
      title={createdId ? "Sync ID Created" : "Create Sync ID"}
      size="md"
    >
      {/* State: error */}
      {error && (
        <div className="p-3 rounded-lg border border-red-200 bg-red-50 text-sm text-red-700">
          {error}
        </div>
      )}

      {!createdId ? (
        <div className="space-y-4">
          <div className="text-center">
            <Cloud className="w-10 h-10 mx-auto text-blue-500 mb-2" />
            <h3 className="text-base font-medium text-gray-900">Create a new Sync ID</h3>
            <p className="text-sm text-gray-600 mt-1">
              We’ll generate a unique ID and upload your boards to the cloud so you can access them on other devices.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="p-3 rounded-lg border bg-gray-50">
              <div className="text-gray-600">Workspace</div>
              <div className="font-medium text-gray-900 truncate" title={workspaceName}>{workspaceName}</div>
            </div>
            <div className="p-3 rounded-lg border bg-gray-50">
              <div className="text-gray-600">Boards</div>
              <div className="font-medium text-gray-900">{boardCount}</div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isUploading}>
              Cancel
            </Button>
            <Button onClick={handleCreateAndUpload} disabled={isUploading} className="min-w-44">
              {isUploading ? (
                <span className="inline-flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" /> Uploading...
                </span>
              ) : (
                <span className="inline-flex items-center gap-2">
                  <Cloud className="w-4 h-4" /> Create & Upload
                </span>
              )}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 p-3 rounded-lg">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-sm">Sync ID created and boards uploaded successfully!</span>
          </div>

          <div>
            <div className="text-sm text-gray-600 mb-1">Your Sync ID</div>
            <div className="flex items-center gap-2">
              <div className="font-mono text-sm px-3 py-2 rounded border bg-white flex-1 select-all">
                {createdId}
              </div>
              <Button variant="outline" onClick={handleCopy}>
                <Copy className="w-4 h-4 mr-2" /> {copied ? "Copied" : "Copy"}
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">Use this ID on other devices to access your boards.</p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
            <Button onClick={() => onOpenChange(false)}>Done</Button>
          </div>
        </div>
      )}
    </BaseModal>
  )
}
