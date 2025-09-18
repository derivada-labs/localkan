"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Settings, Download, Upload } from "lucide-react"

interface WorkspaceSettingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const colorOptions = [
  { name: "Purple", value: "purple", class: "bg-purple-500" },
  { name: "Blue", value: "blue", class: "bg-blue-500" },
  { name: "Green", value: "green", class: "bg-green-500" },
  { name: "Orange", value: "orange", class: "bg-orange-500" },
  { name: "Red", value: "red", class: "bg-red-500" },
  { name: "Pink", value: "pink", class: "bg-pink-500" },
  { name: "Teal", value: "teal", class: "bg-teal-500" },
  { name: "Indigo", value: "indigo", class: "bg-indigo-500" },
  { name: "Gray", value: "gray", class: "bg-gray-500" },
]

export function WorkspaceSettingsModal({ open, onOpenChange }: WorkspaceSettingsModalProps) {
  const [workspaceName, setWorkspaceName] = useState("My workspace")
  const [selectedColor, setSelectedColor] = useState("purple")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md animate-in fade-in-0 zoom-in-95 duration-300">
        <DialogHeader className="animate-in slide-in-from-top-2 duration-500">
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-500 animate-in zoom-in duration-300 delay-200 transition-transform hover:rotate-90" />
            Workspace Settings
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2 animate-in slide-in-from-left duration-500 delay-100">
            <Label htmlFor="workspace-name">
              Workspace Name <span className="text-red-500 animate-pulse">*</span>
            </Label>
            <Input
              id="workspace-name"
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              className="transition-all duration-200 focus:scale-[1.02] focus:shadow-md"
            />
          </div>

          <div className="space-y-3 animate-in slide-in-from-right duration-500 delay-200">
            <Label>Background Color</Label>
            <div className="grid grid-cols-3 gap-3">
              {colorOptions.map((color, index) => (
                <button
                  key={color.value}
                  onClick={() => setSelectedColor(color.value)}
                  className={`w-full h-12 rounded-lg ${color.class} relative flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-${color.value}-500/25 animate-in zoom-in`}
                  style={{ animationDelay: `${300 + index * 50}ms` }}
                >
                  {selectedColor === color.value && (
                    <span className="text-white text-lg animate-in zoom-in duration-200 transition-transform hover:scale-125">
                      ✓
                    </span>
                  )}
                  <div
                    className={`absolute inset-0 rounded-lg ring-2 ring-transparent hover:ring-white/30 transition-all duration-200`}
                  ></div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 animate-in slide-in-from-bottom duration-500 delay-300">
            <Label>Workspace Management</Label>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 bg-transparent transition-all duration-300 hover:scale-105 hover:shadow-md hover:bg-blue-50 group"
              >
                <Download className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-0.5" />
                Export Boards
              </Button>
              <Button
                variant="outline"
                className="flex-1 bg-transparent transition-all duration-300 hover:scale-105 hover:shadow-md hover:bg-green-50 group"
              >
                <Upload className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-0.5" />
                Import Boards
              </Button>
            </div>
          </div>

          <div className="flex justify-end gap-3 animate-in fade-in duration-500 delay-400">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="transition-all duration-300 hover:scale-105 hover:shadow-md"
            >
              Cancel
            </Button>
            <Button className="transition-all duration-300 hover:scale-105 hover:shadow-lg">Update Workspace</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
