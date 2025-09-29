"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Settings, Download, Upload, Palette } from "lucide-react"

interface WorkspaceSettingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onBackgroundChange?: (color: string) => void
  currentBackground?: string
  onWorkspaceNameChange?: (name: string) => void
}

const colorOptions = [
  { name: "Purple", value: "purple", class: "bg-purple-500", gradient: "from-purple-600 via-purple-700 to-indigo-800" },
  { name: "Blue", value: "blue", class: "bg-blue-500", gradient: "from-blue-600 via-blue-700 to-cyan-800" },
  { name: "Green", value: "green", class: "bg-green-500", gradient: "from-green-600 via-green-700 to-emerald-800" },
  { name: "Orange", value: "orange", class: "bg-orange-500", gradient: "from-orange-600 via-orange-700 to-red-800" },
  { name: "Red", value: "red", class: "bg-red-500", gradient: "from-red-600 via-red-700 to-pink-800" },
  { name: "Pink", value: "pink", class: "bg-pink-500", gradient: "from-pink-600 via-pink-700 to-rose-800" },
  { name: "Teal", value: "teal", class: "bg-teal-500", gradient: "from-teal-600 via-teal-700 to-cyan-800" },
  { name: "Indigo", value: "indigo", class: "bg-indigo-500", gradient: "from-indigo-600 via-indigo-700 to-purple-800" },
  { name: "Gray", value: "gray", class: "bg-gray-500", gradient: "from-gray-600 via-gray-700 to-slate-800" },
]

export function WorkspaceSettingsModal({ open, onOpenChange, onBackgroundChange, currentBackground, onWorkspaceNameChange }: WorkspaceSettingsModalProps) {
  const [workspaceName, setWorkspaceName] = useState("My Workspace")
  const [selectedColor, setSelectedColor] = useState(currentBackground || "purple")

  useEffect(() => {
    if (currentBackground) {
      setSelectedColor(currentBackground)
    }
    // Load workspace name from localStorage
    const savedWorkspaceName = localStorage.getItem("workspace-name")
    if (savedWorkspaceName) {
      setWorkspaceName(savedWorkspaceName)
    }
  }, [currentBackground, open])

  const handleExport = () => {
    const boards = JSON.parse(localStorage.getItem("kanban-boards") || "[]")
    const workspaceData = {
      workspaceName,
      boards,
      exportDate: new Date().toISOString(),
      version: "1.0"
    }
    
    const dataStr = JSON.stringify(workspaceData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `kanban-workspace-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string)
        if (importedData.boards && Array.isArray(importedData.boards)) {
          localStorage.setItem("kanban-boards", JSON.stringify(importedData.boards))
          if (importedData.workspaceName) {
            setWorkspaceName(importedData.workspaceName)
          }
          alert("Workspace imported successfully! Please refresh the page to see your boards.")
        } else {
          alert("Invalid workspace file format.")
        }
      } catch (error) {
        alert("Error importing workspace file. Please check the file format.")
      }
    }
    reader.readAsText(file)
    event.target.value = '' // Reset file input
  }

  const handleUpdateWorkspace = () => {
    localStorage.setItem("workspace-name", workspaceName)
    localStorage.setItem("workspace-background", selectedColor)
    if (onBackgroundChange) {
      onBackgroundChange(selectedColor)
    }
    if (onWorkspaceNameChange) {
      onWorkspaceNameChange(workspaceName)
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-500" />
            Workspace Settings
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="workspace-name">
              Workspace Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="workspace-name"
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
            />
          </div>

          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Accent Color
            </Label>
            <div className="grid grid-cols-3 gap-3">
              {colorOptions.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setSelectedColor(color.value)}
                  className={`w-full h-12 rounded-lg ${color.class} relative flex items-center justify-center hover:scale-105 transition-transform`}
                  title={color.name}
                >
                  {selectedColor === color.value && (
                    <span className="text-white text-lg">
                      ✓
                    </span>
                  )}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500">Used for highlights and brand accents.</p>
          </div>

          <div className="space-y-3">
            <Label>Workspace Management</Label>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 bg-transparent hover:bg-blue-50"
                onClick={handleExport}
              >
                <Download className="w-4 h-4 mr-2" />
                Export Boards
              </Button>
              <Button
                variant="outline"
                className="flex-1 bg-transparent hover:bg-green-50"
                onClick={() => document.getElementById('import-file')?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                Import Boards
              </Button>
            </div>
            <input
              id="import-file"
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
            <p className="text-xs text-gray-500">
              Export your boards as JSON or import from a backup file
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateWorkspace}>Update Workspace</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
