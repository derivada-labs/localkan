"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Cloud, Users, Hash } from "lucide-react"

interface SyncIdModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SyncIdModal({ open, onOpenChange }: SyncIdModalProps) {
  const [syncId, setSyncId] = useState("")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md animate-in fade-in-0 zoom-in-95 duration-300">
        <DialogHeader className="animate-in slide-in-from-top-2 duration-500">
          <DialogTitle className="flex items-center gap-2">
            <Cloud className="w-5 h-5 text-blue-500 animate-in zoom-in duration-300 delay-200" />
            Sync ID Management
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="text-center py-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
            <Cloud className="w-12 h-12 mx-auto mb-3 text-gray-400 animate-pulse" />
            <h3 className="font-medium text-gray-900 mb-2">No Sync ID Set</h3>
            <p className="text-sm text-gray-600">Create a new Sync ID or enter an existing one to enable cloud sync</p>
          </div>

          <div className="bg-blue-50 rounded-lg p-4 hover:bg-blue-100 transition-all duration-300 hover:shadow-md animate-in slide-in-from-left duration-500 delay-200">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-blue-600 transition-transform duration-300 hover:scale-110" />
              <span className="font-medium text-blue-900">New User?</span>
            </div>
            <p className="text-sm text-blue-700 mb-4 transition-colors duration-200">
              Create a new Sync ID to start syncing your boards across devices
            </p>
            <Button className="w-full bg-blue-600 hover:bg-blue-700 transition-all duration-300 hover:scale-105 hover:shadow-lg">
              <span className="mr-2 transition-transform duration-300 hover:rotate-12">⏱</span>
              Create New Sync ID
            </Button>
          </div>

          <div className="bg-yellow-50 rounded-lg p-4 hover:bg-yellow-100 transition-all duration-300 hover:shadow-md animate-in slide-in-from-right duration-500 delay-300">
            <div className="flex items-center gap-2 mb-2">
              <Hash className="w-4 h-4 text-yellow-600 transition-transform duration-300 hover:scale-110" />
              <span className="font-medium text-yellow-900">Have an existing ID?</span>
            </div>
            <p className="text-sm text-yellow-700 mb-4">Enter your Sync ID to download your boards from the cloud</p>
            <div className="space-y-3">
              <Input
                placeholder="ENTER YOUR SYNC ID"
                value={syncId}
                onChange={(e) => setSyncId(e.target.value)}
                className="bg-white transition-all duration-200 focus:scale-[1.02] focus:shadow-md"
              />
              <Button className="w-full bg-yellow-500 hover:bg-yellow-600 text-white transition-all duration-300 hover:scale-105 hover:shadow-lg">
                <span className="mr-2 transition-transform duration-300 hover:scale-125">⚡</span>
                Activate Existing ID
              </Button>
            </div>
          </div>

          <div className="flex justify-center animate-in fade-in duration-500 delay-400">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="transition-all duration-300 hover:scale-105 hover:shadow-md"
            >
              <span className="mr-2 transition-transform duration-300 hover:rotate-90">✕</span>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
