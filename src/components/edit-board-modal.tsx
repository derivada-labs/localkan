"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface Board {
  id: string
  title: string
  color: string
  description?: string
  assignees?: string
}

interface EditBoardModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  board: Board
  onEditBoard: (boardData: { title: string; description: string; color: string; assignees: string }) => void
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

export function EditBoardModal({ open, onOpenChange, board, onEditBoard }: EditBoardModalProps) {
  const [boardTitle, setBoardTitle] = useState("")
  const [description, setDescription] = useState("")
  const [defaultAssignees, setDefaultAssignees] = useState("")
  const [selectedColor, setSelectedColor] = useState("purple")

  useEffect(() => {
    if (board) {
      setBoardTitle(board.title)
      setDescription(board.description || "")
      setDefaultAssignees(board.assignees || "")
      setSelectedColor(board.color)
    }
  }, [board])

  const handleSubmit = () => {
    if (!boardTitle.trim()) return

    onEditBoard({
      title: boardTitle,
      description,
      color: selectedColor,
      assignees: defaultAssignees,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Board</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Board Title */}
          <div className="space-y-2">
            <Label htmlFor="board-title">
              Board Title <span className="text-red-500">*</span>
            </Label>
            <Input id="board-title" value={boardTitle} onChange={(e) => setBoardTitle(e.target.value)} />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="What is this board about? (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* Default Assignees */}
          <div className="space-y-2">
            <Label htmlFor="assignees">Default Assignees</Label>
            <Input id="assignees" value={defaultAssignees} onChange={(e) => setDefaultAssignees(e.target.value)} />
            <p className="text-xs text-gray-500">Used to pre-fill assignees when creating new cards.</p>
          </div>

          {/* Background Color */}
          <div className="space-y-3">
            <Label>Background Color</Label>
            <div className="grid grid-cols-3 gap-3">
              {colorOptions.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setSelectedColor(color.value)}
                  className={`w-full h-12 rounded-lg ${color.class} relative flex items-center justify-center`}
                >
                  {selectedColor === color.value && <span className="text-white text-lg">✓</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!boardTitle.trim()}>
              Update Board
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
