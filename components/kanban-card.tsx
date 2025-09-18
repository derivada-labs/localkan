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
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer transform hover:scale-[1.02] hover:-translate-y-1 border border-gray-100 hover:border-gray-200">
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-gray-900 text-sm leading-tight transition-colors duration-200 group-hover:text-gray-700">
          {card.title}
        </h4>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation()
              onEdit()
            }}
            className="h-6 w-6 p-0 hover:bg-blue-100 hover:scale-110 transition-all duration-200 delay-75"
          >
            <Edit className="w-3 h-3 text-gray-500 hover:text-blue-600 transition-colors duration-200" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            className="h-6 w-6 p-0 hover:bg-red-100 hover:scale-110 transition-all duration-200 delay-100"
          >
            <Trash2 className="w-3 h-3 text-gray-500 hover:text-red-600 transition-colors duration-200" />
          </Button>
        </div>
      </div>

      {card.description && (
        <p className="text-xs text-gray-600 mb-3 line-clamp-2 transition-colors duration-200 group-hover:text-gray-700">
          {card.description}
        </p>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium border transition-all duration-200 hover:scale-105 ${priorityColors[card.priority]}`}
          >
            {card.priority}
          </span>
          {card.assignee && (
            <span className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded-full transition-all duration-200 hover:bg-blue-100 hover:scale-105">
              {card.assignee}
            </span>
          )}
        </div>
      </div>

      <div className="mt-3 pt-2 border-t border-gray-100 group-hover:border-gray-200 transition-colors duration-200">
        <span className="text-xs text-gray-400 transition-colors duration-200 group-hover:text-gray-500">
          {formatDate(card.createdAt)}
        </span>
      </div>

      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 transition-all duration-300 pointer-events-none"></div>
    </div>
  )
}
