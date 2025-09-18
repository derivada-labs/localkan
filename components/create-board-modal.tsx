"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface CreateBoardModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateBoard: (boardData: { title: string; description: string; color: string; assignees: string }) => void
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

export function CreateBoardModal({ open, onOpenChange, onCreateBoard }: CreateBoardModalProps) {
  const [boardTitle, setBoardTitle] = useState("")
  const [description, setDescription] = useState("")
  const [defaultAssignees, setDefaultAssignees] = useState("")
  const [selectedColor, setSelectedColor] = useState("purple")

  const handleSubmit = () => {
    if (!boardTitle.trim()) return

    onCreateBoard({
      title: boardTitle,
      description,
      color: selectedColor,
      assignees: defaultAssignees,
    })

    // Reset form
    setBoardTitle("")
    setDescription("")
    setDefaultAssignees("")
    setSelectedColor("purple")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md animate-in fade-in-0 zoom-in-95 duration-300">
        <DialogHeader className="animate-in slide-in-from-top-2 duration-500">
          <DialogTitle className="transition-colors duration-200 hover:text-blue-600">Create New Board</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2 animate-in slide-in-from-left duration-500 delay-100">
            <Label htmlFor="board-title">
              Board Title <span className="text-red-500 animate-pulse">*</span>
            </Label>
            <Input
              id="board-title"
              placeholder="Enter board title..."
              value={boardTitle}
              onChange={(e) => setBoardTitle(e.target.value)}
              className="transition-all duration-200 focus:scale-[1.02] focus:shadow-md"
            />
          </div>

          <div className="space-y-2 animate-in slide-in-from-right duration-500 delay-150">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="What is this board about? (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="transition-all duration-200 focus:scale-[1.01] focus:shadow-md resize-none"
            />
          </div>

          <div className="space-y-2 animate-in slide-in-from-left duration-500 delay-200">
            <Label htmlFor="assignees">Default Assignees</Label>
            <Input
              id="assignees"
              placeholder="Comma-separated names (e.g., Alice, Bob)"
              value={defaultAssignees}
              onChange={(e) => setDefaultAssignees(e.target.value)}
              className="transition-all duration-200 focus:scale-[1.02] focus:shadow-md"
            />
            <p className="text-xs text-gray-500 transition-colors duration-200 hover:text-gray-700">
              Used to pre-fill assignees when creating new cards.
            </p>
          </div>

          <div className="space-y-3 animate-in slide-in-from-bottom duration-500 delay-250">
            <Label>Background Color</Label>
            <div className="grid grid-cols-3 gap-3">
              {colorOptions.map((color, index) => (
                <button
                  key={color.value}
                  onClick={() => setSelectedColor(color.value)}
                  className={`w-full h-12 rounded-lg ${color.class} relative flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-${color.value}-500/25 animate-in zoom-in group`}
                  style={{ animationDelay: `${300 + index * 50}ms` }}
                >
                  {selectedColor === color.value && (
                    <span className="text-white text-lg animate-in zoom-in duration-200 transition-transform group-hover:scale-125">
                      ✓
                    </span>
                  )}
                  <div className="absolute inset-0 rounded-lg ring-2 ring-transparent group-hover:ring-white/30 transition-all duration-200"></div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 animate-in fade-in duration-500 delay-400">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="transition-all duration-300 hover:scale-105 hover:shadow-md"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!boardTitle.trim()}
              className="disabled:opacity-50 transition-all duration-300 hover:scale-105 hover:shadow-lg disabled:hover:scale-100"
            >
              Create Board
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
