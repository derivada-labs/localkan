"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  LayoutGrid, 
  Target, 
  Calendar, 
  Users, 
  Briefcase, 
  BookOpen, 
  Zap, 
  Heart, 
  Star, 
  Rocket, 
  Trophy, 
  Lightbulb 
} from "lucide-react"

interface CreateBoardModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateBoard: (boardData: { title: string; description: string; color: string; assignees: string; icon?: string }) => void
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

const iconOptions = [
  { name: "Grid", value: "LayoutGrid", component: LayoutGrid },
  { name: "Target", value: "Target", component: Target },
  { name: "Calendar", value: "Calendar", component: Calendar },
  { name: "Users", value: "Users", component: Users },
  { name: "Briefcase", value: "Briefcase", component: Briefcase },
  { name: "Book", value: "BookOpen", component: BookOpen },
  { name: "Lightning", value: "Zap", component: Zap },
  { name: "Heart", value: "Heart", component: Heart },
  { name: "Star", value: "Star", component: Star },
  { name: "Rocket", value: "Rocket", component: Rocket },
  { name: "Trophy", value: "Trophy", component: Trophy },
  { name: "Lightbulb", value: "Lightbulb", component: Lightbulb },
]

export function CreateBoardModal({ open, onOpenChange, onCreateBoard }: CreateBoardModalProps) {
  const [boardTitle, setBoardTitle] = useState("")
  const [description, setDescription] = useState("")
  const [defaultAssignees, setDefaultAssignees] = useState("")
  const [selectedColor, setSelectedColor] = useState("purple")
  const [selectedIcon, setSelectedIcon] = useState("LayoutGrid")

  const handleSubmit = () => {
    if (!boardTitle.trim()) return

    onCreateBoard({
      title: boardTitle,
      description,
      color: selectedColor,
      assignees: defaultAssignees,
      icon: selectedIcon,
    })

    // Reset form
    setBoardTitle("")
    setDescription("")
    setDefaultAssignees("")
    setSelectedColor("purple")
    setSelectedIcon("LayoutGrid")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Board</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="board-title">
              Board Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="board-title"
              placeholder="Enter board title..."
              value={boardTitle}
              onChange={(e) => setBoardTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="What is this board about? (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="assignees">Default Assignees</Label>
            <Input
              id="assignees"
              placeholder="Comma-separated names (e.g., Alice, Bob)"
              value={defaultAssignees}
              onChange={(e) => setDefaultAssignees(e.target.value)}
            />
            <p className="text-xs text-gray-500">
              Used to pre-fill assignees when creating new cards.
            </p>
          </div>



          <div className="space-y-3">
            <Label>Background Color</Label>
            <div className="grid grid-cols-3 gap-3">
              {colorOptions.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setSelectedColor(color.value)}
                  className={`w-full h-12 rounded-lg ${color.class} relative flex items-center justify-center`}
                >
                  {selectedColor === color.value && (
                    <span className="text-white text-lg">
                      ✓
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!boardTitle.trim()}
              className="disabled:opacity-50"
            >
              Create Board
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
