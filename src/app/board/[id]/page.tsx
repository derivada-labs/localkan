"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Plus } from "lucide-react"
import { EditBoardModal } from "@/components/edit-board-modal"
import { DeleteBoardModal } from "@/components/delete-board-modal"
import { CreateCardModal } from "@/components/create-card-modal"
import { EditCardModal } from "@/components/edit-card-modal"
import { DeleteCardModal } from "@/components/delete-card-modal"
import { KanbanCard } from "@/components/kanban-card"

interface Card {
  id: string
  title: string
  description?: string
  assignee?: string
  priority: "P0" | "P1" | "P2" | "P3"
  status: "backlog" | "todo" | "doing" | "done"
  createdAt: string
}

interface Board {
  id: string
  title: string
  color: string
  description?: string
  assignees?: string
}

const columns = [
  { id: "backlog", title: "Backlog", color: "#E2E8F0", headerColor: "#64748B" },
  { id: "todo", title: "To Do", color: "#DBEAFE", headerColor: "#2563EB" },
  { id: "doing", title: "In Progress", color: "#FBBF24", headerColor: "#F59E0B" },
  { id: "done", title: "Done", color: "#D1FAE5", headerColor: "#059669" },
]

export default function BoardPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const resolvedParams = use(params)
  const [board, setBoard] = useState<Board | null>(null)
  const [cards, setCards] = useState<Card[]>([])
  const [showEditBoardModal, setShowEditBoardModal] = useState(false)
  const [showDeleteBoardModal, setShowDeleteBoardModal] = useState(false)
  const [showCreateCardModal, setShowCreateCardModal] = useState(false)
  const [showEditCardModal, setShowEditCardModal] = useState(false)
  const [showDeleteCardModal, setShowDeleteCardModal] = useState(false)
  const [selectedCard, setSelectedCard] = useState<Card | null>(null)
  const [createCardColumn, setCreateCardColumn] = useState<string>("")
  const [mounted, setMounted] = useState(false)
  const [draggedCard, setDraggedCard] = useState<Card | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null)

  useEffect(() => {
    // Load board data from localStorage
    const boards = JSON.parse(localStorage.getItem("kanban-boards") || "[]")
    const currentBoard = boards.find((b: Board) => b.id === resolvedParams.id)
    if (currentBoard) {
      setBoard(currentBoard)
    }

    // Load cards data from localStorage
    const savedCards = JSON.parse(localStorage.getItem(`kanban-cards-${resolvedParams.id}`) || "[]")
    setCards(savedCards)

    setTimeout(() => setMounted(true), 100)
  }, [resolvedParams.id])

  const handleCreateCard = (cardData: {
    title: string
    description: string
    assignee: string
    priority: "P0" | "P1" | "P2" | "P3"
  }) => {
    const newCard: Card = {
      id: Date.now().toString(),
      title: cardData.title,
      description: cardData.description,
      assignee: cardData.assignee,
      priority: cardData.priority,
      status: createCardColumn as any,
      createdAt: new Date().toISOString(),
    }
    const updatedCards = [...cards, newCard]
    setCards(updatedCards)
    localStorage.setItem(`kanban-cards-${resolvedParams.id}`, JSON.stringify(updatedCards))
    setShowCreateCardModal(false)
  }

  const handleEditCard = (cardData: {
    title: string
    description: string
    assignee: string
    priority: "P0" | "P1" | "P2" | "P3"
  }) => {
    if (!selectedCard) return
    const updatedCards = cards.map((card) => (card.id === selectedCard.id ? { ...card, ...cardData } : card))
    setCards(updatedCards)
    localStorage.setItem(`kanban-cards-${resolvedParams.id}`, JSON.stringify(updatedCards))
    setShowEditCardModal(false)
    setSelectedCard(null)
  }

  const handleDeleteCard = () => {
    if (!selectedCard) return
    const updatedCards = cards.filter((card) => card.id !== selectedCard.id)
    setCards(updatedCards)
    localStorage.setItem(`kanban-cards-${resolvedParams.id}`, JSON.stringify(updatedCards))
    setShowDeleteCardModal(false)
    setSelectedCard(null)
  }

  const handleEditBoard = (boardData: { title: string; description: string; color: string; assignees: string | string[]; icon: string }) => {
    if (!board) return
    const updatedBoard = { 
      ...board, 
      ...boardData, 
      // Keep this page's Board type (assignees as string) for local state
      assignees: Array.isArray(boardData.assignees) ? boardData.assignees.join(", ") : boardData.assignees,
    }
    setBoard(updatedBoard)

    // Update in localStorage
    const boards = JSON.parse(localStorage.getItem("kanban-boards") || "[]")
    const updatedBoards = boards.map((b: any) => (b.id === board.id ? { ...b, ...boardData } : b))
    localStorage.setItem("kanban-boards", JSON.stringify(updatedBoards))
    setShowEditBoardModal(false)
  }

  const handleDeleteBoard = () => {
    // Remove board from localStorage
    const boards = JSON.parse(localStorage.getItem("kanban-boards") || "[]")
    const updatedBoards = boards.filter((b: Board) => b.id !== resolvedParams.id)
    localStorage.setItem("kanban-boards", JSON.stringify(updatedBoards))

    // Remove cards from localStorage
    localStorage.removeItem(`kanban-cards-${resolvedParams.id}`)

    setShowDeleteBoardModal(false)
    router.push("/")
  }

  if (!board) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 flex items-center justify-center">
        <div className="text-white flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          <span className="animate-pulse">Loading board...</span>
        </div>
      </div>
    )
  }

  const handleDragStart = (card: Card) => {
    setDraggedCard(card)
  }

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault()
    setDragOverColumn(columnId)
  }

  const handleDragLeave = () => {
    setDragOverColumn(null)
  }

  const handleDrop = (e: React.DragEvent, columnId: string) => {
    e.preventDefault()
    if (!draggedCard) return

    const updatedCards = cards.map(card =>
      card.id === draggedCard.id
        ? { ...card, status: columnId as any }
        : card
    )
    setCards(updatedCards)
    localStorage.setItem(`kanban-cards-${resolvedParams.id}`, JSON.stringify(updatedCards))
    setDraggedCard(null)
    setDragOverColumn(null)
  }

  return (
  <div className="min-h-screen bg-white">
      <header
        className={`bg-white border-b border-gray-200 shadow-sm transition-all duration-800 ease-out ${
          mounted ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
        }`}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-6 gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/")}
              className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Back to Boards</span>
            </Button>
          </div>

          <div className="flex items-center gap-2 flex-1 sm:flex-initial justify-center">
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
              {board.title}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowEditBoardModal(true)}
              className="text-gray-600 hover:text-gray-900 border-gray-300 hover:bg-gray-50"
            >
              Board Settings
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6 bg-white min-h-screen">
        {/* Scroll container */}
        <div className="w-full overflow-x-auto pb-6">
          {/* Inner content: min-w-max ensures width equals content so mx-auto can center when not overflowing */}
          <div className="flex gap-6 justify-center min-w-max mx-auto">
          {columns.map((column, columnIndex) => {
            const columnCards = cards.filter((card) => card.status === column.id)
            const isDragOver = dragOverColumn === column.id

            return (
              <div
                key={column.id}
                className={`flex-shrink-0 w-80 bg-gray-100 rounded-lg transition-all duration-200 ${
                  isDragOver ? "bg-blue-50 ring-2 ring-blue-200" : ""
                } ${
                  mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                }`}
                style={{ transitionDelay: `${300 + columnIndex * 100}ms` }}
                onDragOver={(e) => handleDragOver(e, column.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, column.id)}
              >
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: column.headerColor }}
                      ></div>
                      <h3
                        className="font-semibold text-sm"
                        style={{ color: column.headerColor }}
                      >
                        {column.title.toUpperCase()}
                      </h3>
                      <span className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full font-medium">
                        {columnCards.length}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setCreateCardColumn(column.id)
                        setShowCreateCardModal(true)
                      }}
                      className="text-gray-500 hover:text-gray-700 hover:bg-gray-200 h-8 w-8 p-0 rounded-md"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="space-y-3 min-h-[400px]">
                    {columnCards.map((card, cardIndex) => (
                      <div
                        key={card.id}
                        className={`transition-all duration-500 ease-out ${
                          mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                        }`}
                        style={{ transitionDelay: `${500 + columnIndex * 100 + cardIndex * 50}ms` }}
                      >
                        <KanbanCard
                          card={card}
                          onEdit={() => {
                            setSelectedCard(card)
                            setShowEditCardModal(true)
                          }}
                          onDelete={() => {
                            setSelectedCard(card)
                            setShowDeleteCardModal(true)
                          }}
                          onDragStart={handleDragStart}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
          </div>
        </div>
      </div>

      {/* Modals */}
      <EditBoardModal
        open={showEditBoardModal}
        onOpenChange={setShowEditBoardModal}
        board={board}
        onEditBoard={handleEditBoard}
      />

      <DeleteBoardModal
        open={showDeleteBoardModal}
        onOpenChange={setShowDeleteBoardModal}
        boardTitle={board.title}
        onConfirmDelete={handleDeleteBoard}
      />

      <CreateCardModal
        open={showCreateCardModal}
        onOpenChange={setShowCreateCardModal}
        onCreateCard={handleCreateCard}
        defaultAssignees={board.assignees || ""}
      />

      {selectedCard && (
        <EditCardModal
          open={showEditCardModal}
          onOpenChange={setShowEditCardModal}
          card={selectedCard}
          onEditCard={handleEditCard}
        />
      )}

      <DeleteCardModal
        open={showDeleteCardModal}
        onOpenChange={setShowDeleteCardModal}
        onConfirmDelete={handleDeleteCard}
      />
    </div>
  )
}
