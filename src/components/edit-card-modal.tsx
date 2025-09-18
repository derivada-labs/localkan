"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Card {
  id: string
  title: string
  description?: string
  assignee?: string
  priority: "P0" | "P1" | "P2" | "P3"
  status: "backlog" | "todo" | "doing" | "done"
  createdAt: string
}

interface EditCardModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  card: Card
  onEditCard: (cardData: {
    title: string
    description: string
    assignee: string
    priority: "P0" | "P1" | "P2" | "P3"
  }) => void
}

export function EditCardModal({ open, onOpenChange, card, onEditCard }: EditCardModalProps) {
  const [cardTitle, setCardTitle] = useState("")
  const [description, setDescription] = useState("")
  const [assignee, setAssignee] = useState("")
  const [priority, setPriority] = useState<"P0" | "P1" | "P2" | "P3">("P3")

  useEffect(() => {
    if (card) {
      setCardTitle(card.title)
      setDescription(card.description || "")
      setAssignee(card.assignee || "")
      setPriority(card.priority)
    }
  }, [card])

  const handleSubmit = () => {
    if (!cardTitle.trim()) return

    onEditCard({
      title: cardTitle,
      description,
      assignee,
      priority,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Card</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Card Title */}
          <div className="space-y-2">
            <Label htmlFor="card-title">
              Card Title <span className="text-red-500">*</span>
            </Label>
            <Input id="card-title" value={cardTitle} onChange={(e) => setCardTitle(e.target.value)} />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="What needs to be done? (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* Assignee */}
          <div className="space-y-2">
            <Label htmlFor="assignee">Assignee</Label>
            <Input
              id="assignee"
              placeholder="Enter assignee name..."
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
            />
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label>Priority Level</Label>
            <Select value={priority} onValueChange={(value: "P0" | "P1" | "P2" | "P3") => setPriority(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="P0">P0 - Critical</SelectItem>
                <SelectItem value="P1">P1 - High</SelectItem>
                <SelectItem value="P2">P2 - Medium</SelectItem>
                <SelectItem value="P3">P3 - Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!cardTitle.trim()}>
              Update Card
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
