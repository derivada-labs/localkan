"use client"

import { BaseModal, StandardFooter } from "@/components/ui/base-modal"
import { Cloud, CheckCircle } from "lucide-react"

interface SyncSuccessModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  syncId: string
  boardCount: number
}

export function SyncSuccessModal({ open, onOpenChange, syncId, boardCount }: SyncSuccessModalProps) {
  const handleCopyId = () => {
    navigator.clipboard.writeText(syncId)
  }

  return (
    <BaseModal
      open={open}
      onOpenChange={onOpenChange}
      title="Sync Successful!"
      size="md"
      type="success"
      footer={
        <StandardFooter
          onCancel={() => onOpenChange(false)}
          onConfirm={() => onOpenChange(false)}
          cancelText="Close"
          confirmText="Got it"
          confirmVariant="default"
        />
      }
    >
      <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
        <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
        <div>
          <p className="font-medium text-green-800">
            Sync ID created and boards uploaded successfully!
          </p>
          <p className="text-sm text-green-700 mt-1">
            {boardCount} board{boardCount !== 1 ? 's' : ''} saved to cloud.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2">
            Your Sync ID:
          </label>
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border">
            <code className="flex-1 text-sm font-mono text-gray-800 bg-white px-2 py-1 rounded border">
              {syncId}
            </code>
            <button
              onClick={handleCopyId}
              className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Copy
            </button>
          </div>
        </div>

        <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <Cloud className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-blue-800">Use this ID on other devices</p>
            <p className="text-blue-700 mt-1">
              To access your boards on other devices, use this Sync ID in the sync settings.
            </p>
          </div>
        </div>
      </div>
    </BaseModal>
  )
}