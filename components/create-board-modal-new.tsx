"use client"

import { useState } from "react"
import { FormModal } from "@/components/ui/base-modal"
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
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!boardTitle.trim()) return

    setIsSubmitting(true)
    
    try {
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
      
      onOpenChange(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const isValid = boardTitle.trim().length > 0

  return (
    <FormModal
      open={open}
      onOpenChange={onOpenChange}
      title="Create New Board"
      size="md"
      onSubmit={handleSubmit}
      onCancel={() => onOpenChange(false)}
      submitText="Create Board"
      isSubmitting={isSubmitting}
      isValid={isValid}
    >
      <div className="space-y-2">
        <Label htmlFor="board-title">
          Board Title <span className="text-destructive">*</span>
        </Label>
        <Input
          id="board-title"
          placeholder="Enter board title..."
          value={boardTitle}
          onChange={(e) => setBoardTitle(e.target.value)}
          required
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
        <p className="text-xs text-muted-foreground">
          Used to pre-fill assignees when creating new cards.
        </p>
      </div>

      <div className="space-y-3">
        <Label>Background Color</Label>
        <div className="grid grid-cols-3 gap-3">
          {colorOptions.map((color) => (
            <button
              key={color.value}
              type="button"
              onClick={() => setSelectedColor(color.value)}
              className={`w-full h-12 rounded-lg ${color.class} relative flex items-center justify-center hover:opacity-80`}
            >
              {selectedColor === color.value && (
                <span className="text-white text-lg">✓</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </FormModal>
  )
}