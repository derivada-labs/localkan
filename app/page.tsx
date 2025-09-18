"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { SyncIdModal } from "@/components/sync-id-modal"
import { WorkspaceSettingsModal } from "@/components/workspace-settings-modal"
import { CreateBoardModal } from "@/components/create-board-modal"
import { EditBoardModal } from "@/components/edit-board-modal"
import { DeleteBoardModal } from "@/components/delete-board-modal"
import { LayoutGrid, Cloud, Filter, Settings, Edit, Trash2, Plus } from "lucide-react"

export default function KanbanDashboard() {
  const router = useRouter()
  const [showSyncModal, setShowSyncModal] = useState(false)
  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false)
  const [showCreateBoardModal, setShowCreateBoardModal] = useState(false)
  const [showEditBoardModal, setShowEditBoardModal] = useState(false)
  const [showDeleteBoardModal, setShowDeleteBoardModal] = useState(false)
  const [selectedBoard, setSelectedBoard] = useState<any>(null)
  const [boards, setBoards] = useState<
    Array<{ id: string; title: string; color: string; description?: string; assignees?: string }>
  >([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const savedBoards = JSON.parse(localStorage.getItem("kanban-boards") || "[]")
    setBoards(savedBoards)
    setTimeout(() => setMounted(true), 100)
  }, [])

  const handleCreateBoard = (boardData: { title: string; description: string; color: string; assignees: string }) => {
    const newBoard = {
      id: Date.now().toString(),
      title: boardData.title,
      color: boardData.color,
      description: boardData.description,
      assignees: boardData.assignees,
    }
    const updatedBoards = [...boards, newBoard]
    setBoards(updatedBoards)
    localStorage.setItem("kanban-boards", JSON.stringify(updatedBoards))
    setShowCreateBoardModal(false)
  }

  const handleEditBoard = (boardData: { title: string; description: string; color: string; assignees: string }) => {
    const updatedBoards = boards.map((board) => (board.id === selectedBoard.id ? { ...board, ...boardData } : board))
    setBoards(updatedBoards)
    localStorage.setItem("kanban-boards", JSON.stringify(updatedBoards))
    setShowEditBoardModal(false)
    setSelectedBoard(null)
  }

  const handleDeleteBoard = () => {
    const updatedBoards = boards.filter((board) => board.id !== selectedBoard.id)
    setBoards(updatedBoards)
    localStorage.setItem("kanban-boards", JSON.stringify(updatedBoards))
    // Also delete board data from localStorage
    localStorage.removeItem(`kanban-board-${selectedBoard.id}`)
    setShowDeleteBoardModal(false)
    setSelectedBoard(null)
  }

  const handleEditClick = (e: React.MouseEvent, board: any) => {
    e.stopPropagation()
    setSelectedBoard(board)
    setShowEditBoardModal(true)
  }

  const handleDeleteClick = (e: React.MouseEvent, board: any) => {
    e.stopPropagation()
    setSelectedBoard(board)
    setShowDeleteBoardModal(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 overflow-hidden">
      <header
        className={`flex items-center justify-center p-6 transition-all duration-1000 ease-out ${
          mounted ? "translate-y-0 opacity-100" : "-translate-y-8 opacity-0"
        }`}
      >
        <div className="w-full max-w-6xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-semibold text-white/90 transition-all duration-300 hover:text-white">
              Kanban Boards
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:text-white bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-white/20 backdrop-blur-sm"
              onClick={() => setShowWorkspaceModal(true)}
            >
              <Settings className="w-4 h-4 mr-2 transition-transform duration-300 hover:rotate-90" />
              My workspace
              <span className="ml-2 text-xs text-white/70">Local Storage</span>
            </Button>
          </div>
        </div>
      </header>

      <main
        className={`px-6 transition-all duration-1000 ease-out delay-200 ${
          mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        }`}
      >
        <div className="max-w-6xl mx-auto">
          <div
            className={`flex items-center justify-center mb-6 transition-all duration-800 ease-out delay-300 ${
              mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
          >
            <div className="w-full flex items-center justify-between">
              <div className="flex items-center gap-2">
                <LayoutGrid className="w-5 h-5 text-white/70 transition-all duration-300 hover:text-white hover:scale-110" />
                <h2 className="text-lg font-medium text-white/90">Your boards</h2>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:text-white bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-white/20 backdrop-blur-sm"
                  onClick={() => setShowSyncModal(true)}
                >
                  <Cloud className="w-4 h-4 mr-2 transition-transform duration-300 hover:scale-110" />
                  Setup Sync
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:text-white bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-white/20 backdrop-blur-sm"
                >
                  <Cloud className="w-4 h-4 mr-2 transition-transform duration-300 hover:scale-110 hover:rotate-12" />
                  Sync Now
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:text-white bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-white/20 backdrop-blur-sm"
                >
                  <Filter className="w-4 h-4 mr-2 transition-transform duration-300 hover:scale-110" />
                  Filter
                </Button>
                <Button
                  onClick={() => setShowCreateBoardModal(true)}
                  className="bg-white/15 hover:bg-white/25 text-white border border-white/30 hover:border-white/40 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-white/20 backdrop-blur-sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Board
                </Button>
              </div>
            </div>
          </div>

          {boards.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {boards.map((board, index) => (
                <div
                  key={board.id}
                  onClick={() => router.push(`/board/${board.id}`)}
                  className={`bg-white/10 backdrop-blur-sm rounded-lg p-6 hover:bg-white/15 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-white/10 cursor-pointer group transform relative ${
                    mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                  }`}
                  style={{
                    transitionDelay: `${400 + index * 150}ms`,
                    animationDelay: `${400 + index * 150}ms`,
                  }}
                >
                  <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => handleEditClick(e, board)}
                      className="h-8 w-8 p-0 bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all duration-200 hover:scale-110"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => handleDeleteClick(e, board)}
                      className="h-8 w-8 p-0 bg-white/10 hover:bg-red-500/80 text-white/70 hover:text-white transition-all duration-200 hover:scale-110"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div
                    className={`w-full h-2 rounded-full mb-4 bg-${board.color}-500 transition-all duration-300 group-hover:h-3 group-hover:shadow-lg`}
                  ></div>
                  <h3 className="text-lg font-medium text-white mb-2 transition-all duration-300 group-hover:text-white/90 group-hover:translate-x-1 pr-16">
                    {board.title}
                  </h3>
                  {board.description && (
                    <p className="text-white/70 text-sm transition-all duration-300 group-hover:text-white/80">
                      {board.description}
                    </p>
                  )}
                  <div className="absolute inset-0 rounded-lg border border-white/0 group-hover:border-white/20 transition-all duration-300"></div>
                </div>
              ))}
            </div>
          ) : (
            <div
              className={`max-w-4xl mx-auto transition-all duration-1000 ease-out delay-500 ${
                mounted ? "translate-y-0 opacity-100 scale-100" : "translate-y-12 opacity-0 scale-95"
              }`}
            >
              <div className="border-2 border-dashed border-white/20 rounded-lg p-16 text-center hover:border-white/30 transition-all duration-500 hover:bg-white/5 group">
                <div
                  className={`w-16 h-16 mx-auto mb-6 bg-white/10 rounded-lg flex items-center justify-center transition-all duration-700 ease-out delay-600 group-hover:scale-110 group-hover:bg-white/15 ${
                    mounted ? "translate-y-0 opacity-100 rotate-0" : "translate-y-4 opacity-0 rotate-12"
                  }`}
                >
                  <LayoutGrid className="w-8 h-8 text-white/60 transition-all duration-300 group-hover:text-white/80" />
                </div>
                <h3
                  className={`text-xl font-medium text-white mb-2 transition-all duration-700 ease-out delay-700 ${
                    mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                  }`}
                >
                  No boards yet
                </h3>
                <p
                  className={`text-white/70 mb-8 max-w-md mx-auto transition-all duration-700 ease-out delay-800 ${
                    mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                  }`}
                >
                  Create your first board to get started with organizing your tasks!
                </p>
                <Button
                  onClick={() => setShowCreateBoardModal(true)}
                  className={`bg-white/20 hover:bg-white/30 text-white border border-white/30 hover:border-white/40 transition-all duration-500 hover:scale-110 hover:shadow-xl hover:shadow-white/20 group-hover:translate-y-[-2px] backdrop-blur-sm ${
                    mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                  }`}
                  style={{ transitionDelay: "900ms" }}
                >
                  <Plus className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:scale-125" />
                  Create new board
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      <SyncIdModal open={showSyncModal} onOpenChange={setShowSyncModal} />
      <WorkspaceSettingsModal open={showWorkspaceModal} onOpenChange={setShowWorkspaceModal} />
      <CreateBoardModal
        open={showCreateBoardModal}
        onOpenChange={setShowCreateBoardModal}
        onCreateBoard={handleCreateBoard}
      />
      {selectedBoard && (
        <EditBoardModal
          open={showEditBoardModal}
          onOpenChange={setShowEditBoardModal}
          board={selectedBoard}
          onEditBoard={handleEditBoard}
          onDeleteBoard={() => {
            setShowEditBoardModal(false)
            setShowDeleteBoardModal(true)
          }}
        />
      )}
      {selectedBoard && (
        <DeleteBoardModal
          open={showDeleteBoardModal}
          onOpenChange={setShowDeleteBoardModal}
          boardTitle={selectedBoard.title}
          onConfirmDelete={handleDeleteBoard}
        />
      )}
    </div>
  )
}
