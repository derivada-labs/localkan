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
}

const priorityColors = {
  P0: "bg-red-100 text-red-800 border-red-200",
  P1: "bg-orange-100 text-orange-800 border-orange-200",
  P2: "bg-yellow-100 text-yellow-800 border-yellow-200",
  P3: "bg-green-100 text-green-800 border-green-200",
}

export function KanbanCard({ card, onEdit, onDelete }: KanbanCardProps) {
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
    <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer transform hover:scale-[1.02] hover:-translate-y-1 border border-gray-100 hover:border-gray-200 relative aspect-square flex flex-col">
      {/* Header with Title */}
      <div className="flex-1 mb-3">
        <h4 className="font-semibold text-gray-900 text-sm leading-tight transition-colors duration-200 group-hover:text-gray-700 line-clamp-2">
          {card.title}
        </h4>
        {card.description && (
          <p className="text-xs text-gray-600 mt-2 line-clamp-2 transition-colors duration-200 group-hover:text-gray-700">
            {card.description}
          </p>
        )}
      </div>

      {/* Priority and Assignee Section */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-1 rounded-lg text-xs font-bold border transition-all duration-200 hover:scale-105 ${priorityColors[card.priority]}`}
          >
            {card.priority}
          </span>
        </div>
        
        {card.assignee && (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
              {getInitials(card.assignee)}
            </div>
            <span className="text-xs text-gray-600 font-medium max-w-16 truncate">
              {card.assignee}
            </span>
          </div>
        )}
      </div>

      {/* Footer with Date and Actions */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400 transition-colors duration-200 group-hover:text-gray-500">
          {formatDate(card.createdAt)}
        </span>
        
        {/* Action Buttons - Bottom Right */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation()
              onEdit()
            }}
            className="h-7 w-7 p-0 hover:bg-blue-100 hover:scale-110 transition-all duration-200 delay-75 rounded-lg"
          >
            <Edit className="w-3.5 h-3.5 text-gray-500 hover:text-blue-600 transition-colors duration-200" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            className="h-7 w-7 p-0 hover:bg-red-100 hover:scale-110 transition-all duration-200 delay-100 rounded-lg"
          >
            <Trash2 className="w-3.5 h-3.5 text-gray-500 hover:text-red-600 transition-colors duration-200" />
          </Button>
        </div>
      </div>

      {/* Hover Gradient Effect */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 transition-all duration-300 pointer-events-none"></div>
    </div>
  )
}
