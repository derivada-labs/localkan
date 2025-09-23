"use client"

import { Button } from "@/components/ui/button"
import { Edit, Trash2 } from "lucide-react"

interface Card {
  id: string
  title: string
  description?: string
  assignee?: string
  priority: "P0" | "P1" | "P2" | "P3"
  status: "backlog" | "todo" | "doing" | "done"
  createdAt: string
}

interface KanbanCardProps {
  card: Card
  onEdit: () => void
  onDelete: () => void
  onDragStart?: (card: Card) => void
}

const priorityColors = {
  P0: "bg-red-50 text-red-700 border-red-200",
  P1: "bg-orange-50 text-orange-700 border-orange-200",
  P2: "bg-yellow-50 text-yellow-700 border-yellow-200",
  P3: "bg-green-50 text-green-700 border-green-200",
}

export function KanbanCard({ card, onEdit, onDelete, onDragStart }: KanbanCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div
      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 group cursor-pointer border border-gray-200 hover:border-gray-300 relative"
      draggable={!!onDragStart}
      onDragStart={(e) => {
        if (onDragStart) {
          onDragStart(card)
          e.dataTransfer.effectAllowed = "move"
        }
      }}
    >
      <div className="p-3 space-y-3">
        {/* Title */}
        <h4 className="font-medium text-gray-900 text-sm leading-tight line-clamp-3">
          {card.title}
        </h4>

        {/* Description */}
        {card.description && (
          <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
            {card.description}
          </p>
        )}

        {/* Tags and Metadata */}
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`px-2 py-1 rounded text-xs font-medium border ${priorityColors[card.priority]}`}
          >
            {card.priority}
          </span>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-1">
          {/* Assignee */}
          <div className="flex items-center gap-2">
            {card.assignee && (
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                {getInitials(card.assignee)}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation()
                onEdit()
              }}
              className="h-6 w-6 p-0 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600"
            >
              <Edit className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
              className="h-6 w-6 p-0 hover:bg-red-50 rounded text-gray-400 hover:text-red-500"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
