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
        className={`flex items-center justify-center p-4 sm:p-6 transition-all duration-1000 ease-out ${
          mounted ? "translate-y-0 opacity-100" : "-translate-y-8 opacity-0"
        }`}
      >
        <div className="w-full max-w-6xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl sm:text-2xl font-semibold text-white/90">
              Kanban Boards
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:text-white bg-white/30 hover:bg-white/40 border border-white/40 hover:border-white/50 backdrop-blur-lg shadow-lg hidden sm:flex"
              onClick={() => setShowWorkspaceModal(true)}
            >
              <Settings className="w-4 h-4 mr-2" />
              <span className="hidden md:inline">My workspace</span>
              <span className="ml-2 text-xs text-white/70 hidden lg:inline">Local Storage</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:text-white bg-white/30 hover:bg-white/40 border border-white/40 hover:border-white/50 backdrop-blur-lg shadow-lg sm:hidden"
              onClick={() => setShowWorkspaceModal(true)}
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main
        className={`px-4 sm:px-6 transition-all duration-1000 ease-out delay-200 ${
          mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        }`}
      >
        <div className="max-w-6xl mx-auto">
          <div
            className={`flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4 transition-all duration-800 ease-out delay-300 ${
              mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
          >
            <div className="flex items-center gap-2">
              <LayoutGrid className="w-5 h-5 text-white/70" />
              <h2 className="text-lg font-medium text-white/90">Your boards</h2>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:text-white bg-white/30 hover:bg-white/40 border border-white/40 hover:border-white/50 backdrop-blur-lg shadow-lg"
                onClick={() => setShowSyncModal(true)}
              >
                <Cloud className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Setup Sync</span>
                <span className="sm:hidden">Setup</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:text-white bg-white/30 hover:bg-white/40 border border-white/40 hover:border-white/50 backdrop-blur-lg shadow-lg"
              >
                <Cloud className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Sync Now</span>
                <span className="sm:hidden">Sync</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:text-white bg-white/30 hover:bg-white/40 border border-white/40 hover:border-white/50 backdrop-blur-lg shadow-lg"
              >
                <Filter className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Filter</span>
                <span className="sm:hidden">Filter</span>
              </Button>
            </div>
          </div>

          {boards.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {boards.map((board, index) => (
                <div
                  key={board.id}
                  onClick={() => router.push(`/board/${board.id}`)}
                  className={`border-2 border-dashed border-white/30 rounded-xl p-6 sm:p-8 hover:border-white/40 hover:bg-white/5 cursor-pointer group relative aspect-square flex flex-col ${
                    mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                  }`}
                  style={{
                    transitionDelay: `${400 + index * 150}ms`,
                    animationDelay: `${400 + index * 150}ms`,
                  }}
                >
                  {/* Main Content - Centered */}
                  <div className="flex-1 flex flex-col justify-center items-center text-center">
                    <div
                      className={`w-16 h-16 rounded-xl mb-4 bg-${board.color}-500 flex items-center justify-center`}
                    >
                      <LayoutGrid className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">
                      {board.title}
                    </h3>
                    {board.description && (
                      <p className="text-white/70 text-sm line-clamp-2 max-w-full">
                        {board.description}
                      </p>
                    )}
                  </div>

                  {/* Bottom Section with Info and Actions */}
                  <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                    <div className="flex flex-col gap-1">
                      {board.assignees && (
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {board.assignees.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                          </div>
                          <span className="text-xs text-white/80 font-medium truncate max-w-20">
                            {board.assignees}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className="text-xs text-white/60">Active</span>
                      </div>
                    </div>
                    
                    {/* Action Buttons - Bottom Right */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => handleEditClick(e, board)}
                        className="h-7 w-7 p-0 bg-white/20 hover:bg-white/30 text-white/70 hover:text-white rounded-lg backdrop-blur-sm"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => handleDeleteClick(e, board)}
                        className="h-7 w-7 p-0 bg-white/20 hover:bg-red-500/80 text-white/70 hover:text-white rounded-lg backdrop-blur-sm"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Create New Board Card */}
              <div
                onClick={() => setShowCreateBoardModal(true)}
                className={`border-2 border-dashed border-white/30 rounded-xl p-6 sm:p-8 hover:border-white/40 hover:bg-white/5 cursor-pointer group relative aspect-square flex flex-col ${
                  mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                }`}
                style={{
                  transitionDelay: `${400 + boards.length * 150}ms`,
                  animationDelay: `${400 + boards.length * 150}ms`,
                }}
              >
                <div className="flex-1 flex flex-col justify-center items-center text-center">
                  <div className="w-16 h-16 rounded-xl mb-4 bg-white/10 group-hover:bg-white/15 flex items-center justify-center">
                    <LayoutGrid className="w-8 h-8 text-white/60 group-hover:text-white/80" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-white/80 mb-2 group-hover:text-white">
                    Create new board
                  </h3>
                  <p className="text-white/60 text-sm group-hover:text-white/70">
                    Add a new board to organize your tasks
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div
              className={`max-w-4xl mx-auto transition-all duration-1000 ease-out delay-500 ${
                mounted ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
              }`}
            >
              <div className="border-2 border-dashed border-white/20 rounded-lg p-8 sm:p-16 text-center hover:border-white/30 hover:bg-white/5 group">
                <div
                  className={`w-16 h-16 mx-auto mb-6 bg-white/10 rounded-lg flex items-center justify-center transition-all duration-700 ease-out delay-600 group-hover:bg-white/15 ${
                    mounted ? "translate-y-0 opacity-100 rotate-0" : "translate-y-4 opacity-0 rotate-12"
                  }`}
                >
                  <LayoutGrid className="w-8 h-8 text-white/60 group-hover:text-white/80" />
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
                  className={`bg-white/20 hover:bg-white/30 text-white border border-white/30 hover:border-white/40 backdrop-blur-sm ${
                    mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                  }`}
                  style={{ transitionDelay: "900ms" }}
                >
                  <LayoutGrid className="w-4 h-4 mr-2" />
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
