"use client"

import { useState, useEffect } from "react"
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
  { id: "backlog", title: "Backlog", color: "bg-purple-100" },
  { id: "todo", title: "TO-DO", color: "bg-blue-100" },
  { id: "doing", title: "Doing", color: "bg-green-100" },
  { id: "done", title: "Done", color: "bg-gray-100" },
]

export default function BoardPage({ params }: { params: { id: string } }) {
  const router = useRouter()
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

  useEffect(() => {
    // Load board data from localStorage
    const boards = JSON.parse(localStorage.getItem("kanban-boards") || "[]")
    const currentBoard = boards.find((b: Board) => b.id === params.id)
    if (currentBoard) {
      setBoard(currentBoard)
    }

    // Load cards data from localStorage
    const savedCards = JSON.parse(localStorage.getItem(`kanban-cards-${params.id}`) || "[]")
    setCards(savedCards)

    setTimeout(() => setMounted(true), 100)
  }, [params.id])

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
    localStorage.setItem(`kanban-cards-${params.id}`, JSON.stringify(updatedCards))
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
    localStorage.setItem(`kanban-cards-${params.id}`, JSON.stringify(updatedCards))
    setShowEditCardModal(false)
    setSelectedCard(null)
  }

  const handleDeleteCard = () => {
    if (!selectedCard) return
    const updatedCards = cards.filter((card) => card.id !== selectedCard.id)
    setCards(updatedCards)
    localStorage.setItem(`kanban-cards-${params.id}`, JSON.stringify(updatedCards))
    setShowDeleteCardModal(false)
    setSelectedCard(null)
  }

  const handleEditBoard = (boardData: { title: string; description: string; color: string; assignees: string }) => {
    if (!board) return
    const updatedBoard = { ...board, ...boardData }
    setBoard(updatedBoard)

    // Update in localStorage
    const boards = JSON.parse(localStorage.getItem("kanban-boards") || "[]")
    const updatedBoards = boards.map((b: Board) => (b.id === board.id ? updatedBoard : b))
    localStorage.setItem("kanban-boards", JSON.stringify(updatedBoards))
    setShowEditBoardModal(false)
  }

  const handleDeleteBoard = () => {
    // Remove board from localStorage
    const boards = JSON.parse(localStorage.getItem("kanban-boards") || "[]")
    const updatedBoards = boards.filter((b: Board) => b.id !== params.id)
    localStorage.setItem("kanban-boards", JSON.stringify(updatedBoards))

    // Remove cards from localStorage
    localStorage.removeItem(`kanban-cards-${params.id}`)

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800">
      <header
        className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-6 border-b border-white/10 transition-all duration-800 ease-out gap-4 ${
          mounted ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
        }`}
      >
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/")}
            className="text-white/70 hover:text-white bg-white/20 hover:bg-white/30 border border-white/30 hover:border-white/40 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-white/10 backdrop-blur-md"
          >
            <ArrowLeft className="w-4 h-4 mr-2 transition-transform duration-300 hover:-translate-x-1" />
            <span className="hidden sm:inline">Boards</span>
          </Button>
        </div>

        <div className="flex items-center gap-2 flex-1 sm:flex-initial justify-center">
          <h1 className="text-lg sm:text-xl font-semibold text-white flex items-center gap-2 transition-all duration-300 hover:scale-105">
            {board.title}
            <span className="text-lg transition-transform duration-300 hover:scale-125">📋</span>
            <span className="text-lg transition-transform duration-300 hover:rotate-12">🔧</span>
          </h1>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="ghost"
            size="sm"
            className="text-white/70 hover:text-white bg-white/20 hover:bg-white/30 border border-white/30 hover:border-white/40 transition-all duration-300 hover:scale-105 backdrop-blur-md"
          >
            <span className="hidden sm:inline">Setup</span>
            <span className="sm:hidden">Setup</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-white/70 hover:text-white bg-white/20 hover:bg-white/30 border border-white/30 hover:border-white/40 transition-all duration-300 hover:scale-105 backdrop-blur-md"
          >
            <span className="hidden sm:inline">Sync</span>
            <span className="sm:hidden">Sync</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-white/70 hover:text-white bg-white/20 hover:bg-white/30 border border-white/30 hover:border-white/40 transition-all duration-300 hover:scale-105 backdrop-blur-md"
          >
            <span className="hidden sm:inline">Filter</span>
            <span className="sm:hidden">Filter</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowEditBoardModal(true)}
            className="text-white/70 hover:text-white bg-white/20 hover:bg-white/30 border border-white/30 hover:border-white/40 transition-all duration-300 hover:scale-105 backdrop-blur-md"
          >
            <span className="hidden sm:inline">Settings</span>
            <span className="sm:hidden">Settings</span>
          </Button>
        </div>
      </header>

      <div
        className={`p-4 sm:p-6 transition-all duration-1000 ease-out delay-200 ${
          mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        }`}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {columns.map((column, columnIndex) => (
            <div
              key={column.id}
              className={`bg-white/10 backdrop-blur-sm rounded-lg p-4 hover:bg-white/15 transition-all duration-500 hover:shadow-xl hover:shadow-white/10 group ${
                mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
              }`}
              style={{ transitionDelay: `${300 + columnIndex * 100}ms` }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-white transition-all duration-300 group-hover:text-white/90">
                  {column.title}
                </h3>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setCreateCardColumn(column.id)
                    setShowCreateCardModal(true)
                  }}
                  className="text-white/70 hover:text-white hover:bg-white/10 h-8 px-2 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-white/10"
                >
                  <Plus className="w-4 h-4 transition-transform duration-300 hover:rotate-90" />
                  Add Card
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {cards
                  .filter((card) => card.status === column.id)
                  .map((card, cardIndex) => (
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
                      />
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      <EditBoardModal
        open={showEditBoardModal}
        onOpenChange={setShowEditBoardModal}
        board={board}
        onEditBoard={handleEditBoard}
        onDeleteBoard={() => setShowDeleteBoardModal(true)}
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
