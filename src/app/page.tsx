"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SyncIdModal } from "@/components/sync-id-modal"
import { SyncSuccessModal } from "@/components/sync-success-modal"
import { CreateSyncIdModal } from "@/components/create-sync-id-modal"
import { WorkspaceSettingsModal } from "@/components/workspace-settings-modal"
import { CreateBoardModal } from "@/components/create-board-modal"
import { EditBoardModal } from "@/components/edit-board-modal"
import { DeleteBoardModal } from "@/components/delete-board-modal-new"
import { 
  LayoutGrid, 
  Cloud, 
  RefreshCw, 
  Filter, 
  Settings, 
  Edit, 
  Trash2, 
  Plus, 
  Search, 
  X,
  Target,
  Calendar,
  Users,
  Briefcase,
  BookOpen,
  Zap,
  Heart,
  Star,
  Rocket,
  Trophy,
  Lightbulb,
  Upload
} from "lucide-react"

const getIconComponent = (iconName: string) => {
  const iconMap: { [key: string]: any } = {
    LayoutGrid,
    Target,
    Calendar,
    Users,
    Briefcase,
    BookOpen,
    Zap,
    Heart,
    Star,
    Rocket,
    Trophy,
    Lightbulb,
  }
  return iconMap[iconName] || LayoutGrid
}

export default function KanbanDashboard() {
  const router = useRouter()
  const [showSyncModal, setShowSyncModal] = useState(false)
  const [showCreateSyncModal, setShowCreateSyncModal] = useState(false)
  const [showSyncSuccessModal, setShowSyncSuccessModal] = useState(false)
  const [syncSuccessData, setSyncSuccessData] = useState({ syncId: "", boardCount: 0 })
  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false)
  const [showCreateBoardModal, setShowCreateBoardModal] = useState(false)
  const [showEditBoardModal, setShowEditBoardModal] = useState(false)
  const [showDeleteBoardModal, setShowDeleteBoardModal] = useState(false)
  const [selectedBoard, setSelectedBoard] = useState<any>(null)
  const [boards, setBoards] = useState<
    Array<{ 
      id: string; 
      title: string; 
      color: string; 
      description?: string; 
      assignees?: string[]; 
      icon?: string; 
      createdAt?: string; 
      dueDate?: string;
      priority?: string 
    }>
  >([])
  const [mounted, setMounted] = useState(false)
  const [backgroundGradient, setBackgroundGradient] = useState("from-purple-600 via-purple-700 to-indigo-800")
  const [currentBackgroundColor, setCurrentBackgroundColor] = useState("purple")
  const [workspaceName, setWorkspaceName] = useState("My Workspace")
  const [isCloudSynced, setIsCloudSynced] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [filterAssignee, setFilterAssignee] = useState("")
  const [filterPriority, setFilterPriority] = useState("")

  useEffect(() => {
    const savedBoards = JSON.parse(localStorage.getItem("kanban-boards") || "[]")
    
    // Migrate old board format to new format (string assignees to array)
    const migratedBoards = savedBoards.map((board: any) => ({
      ...board,
      assignees: typeof board.assignees === 'string' 
        ? board.assignees.split(',').map((name: string) => name.trim()).filter((name: string) => name.length > 0)
        : board.assignees || []
    }))
    
    const savedWorkspaceName = localStorage.getItem("workspace-name") || "My Workspace"
    const savedBackground = localStorage.getItem("workspace-background") || "purple"
    const syncId = localStorage.getItem("sync-id")
    
    setBoards(migratedBoards)
    setWorkspaceName(savedWorkspaceName)
    setIsCloudSynced(!!syncId)
    setCurrentBackgroundColor(savedBackground)
    
    // Set background gradient based on saved color
    const colorOptions = {
      purple: "from-purple-600 via-purple-700 to-indigo-800",
      blue: "from-blue-600 via-blue-700 to-cyan-800",
      green: "from-green-600 via-green-700 to-emerald-800",
      orange: "from-orange-600 via-orange-700 to-red-800",
      red: "from-red-600 via-red-700 to-pink-800",
      pink: "from-pink-600 via-pink-700 to-rose-800",
      teal: "from-teal-600 via-teal-700 to-cyan-800",
      indigo: "from-indigo-600 via-indigo-700 to-purple-800",
      gray: "from-gray-600 via-gray-700 to-slate-800",
    }
    setBackgroundGradient(colorOptions[savedBackground as keyof typeof colorOptions] || colorOptions.purple)
    
    setTimeout(() => setMounted(true), 100)
  }, [])

  const handleBackgroundChange = (color: string) => {
    const colorOptions = {
      purple: "from-purple-600 via-purple-700 to-indigo-800",
      blue: "from-blue-600 via-blue-700 to-cyan-800",
      green: "from-green-600 via-green-700 to-emerald-800",
      orange: "from-orange-600 via-orange-700 to-red-800",
      red: "from-red-600 via-red-700 to-pink-800",
      pink: "from-pink-600 via-pink-700 to-rose-800",
      teal: "from-teal-600 via-teal-700 to-cyan-800",
      indigo: "from-indigo-600 via-indigo-700 to-purple-800",
      gray: "from-gray-600 via-gray-700 to-slate-800",
    }
    setBackgroundGradient(colorOptions[color as keyof typeof colorOptions] || colorOptions.purple)
    setCurrentBackgroundColor(color)
  }

  const handleCreateBoard = (boardData: { title: string; description: string; color: string; assignees: string[]; icon?: string }) => {
    const newBoard = {
      id: Date.now().toString(),
      title: boardData.title,
      color: boardData.color,
      description: boardData.description,
      assignees: boardData.assignees,
      icon: boardData.icon || "LayoutGrid",
      createdAt: new Date().toISOString(),
    }
    const updatedBoards = [...boards, newBoard]
    setBoards(updatedBoards)
    localStorage.setItem("kanban-boards", JSON.stringify(updatedBoards))
    setShowCreateBoardModal(false)
  }

  const handleEditBoard = (boardData: { title: string; description: string; color: string; assignees: string | string[]; icon: string }) => {
    const normalizedAssignees = Array.isArray(boardData.assignees)
      ? boardData.assignees
      : boardData.assignees.split(',').map((n) => n.trim()).filter(Boolean)
    const updatedBoards = boards.map((board) => (
      board.id === selectedBoard.id 
        ? { ...board, ...boardData, assignees: normalizedAssignees }
        : board
    ))
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

  // Filter boards based on assignee only
  const filteredBoards = boards.filter(board => {
    const matchesAssignee = !filterAssignee || 
      (board.assignees && board.assignees.some(assignee => 
        assignee.toLowerCase().includes(filterAssignee.toLowerCase())
      ))
    return matchesAssignee
  })

  const clearFilters = () => {
    setFilterAssignee("")
    setShowFilters(false)
  }

  const handleSyncSetup = (syncId: string) => {
    setIsCloudSynced(true)
    setSyncSuccessData({ syncId, boardCount: boards.length })
    setShowSyncSuccessModal(true)
  }

  const [isSyncing, setIsSyncing] = useState(false)

  const handleSyncNow = async () => {
    const syncId = localStorage.getItem("sync-id")
    if (!syncId) {
      setShowSyncModal(true)
      return
    }

    try {
      setIsSyncing(true)
      const { syncToCloud } = await import("@/lib/sync-client")
      const boards = JSON.parse(localStorage.getItem("kanban-boards") || "[]")
      const workspaceName = localStorage.getItem("workspace-name") || "My Workspace"
      
      await syncToCloud(syncId, boards, workspaceName)
      
      // Update last sync time
      localStorage.setItem("last-sync", new Date().toISOString())
      
      setSyncSuccessData({ syncId, boardCount: boards.length })
      setShowSyncSuccessModal(true)
    } catch (error) {
      console.error("Sync error:", error)
      alert("❌ Sync failed. Please check your connection and try again.")
    } finally {
      setIsSyncing(false)
    }
  }

  // Format date in US format (MM/DD/YYYY)
  const formatUSDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    })
  }

  // Format relative date (e.g., "2 days ago", "in 3 days")
  const formatRelativeDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = date.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return "Today"
    if (diffDays === 1) return "Tomorrow"
    if (diffDays === -1) return "Yesterday"
    if (diffDays > 0) return `In ${diffDays} days`
    return `${Math.abs(diffDays)} days ago`
  }

  // Check if due date is overdue
  const isDueDateOverdue = (dueDateString: string) => {
    const dueDate = new Date(dueDateString)
    const now = new Date()
    return dueDate < now
  }

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'bg-red-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="w-full max-w-7xl xl:max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
              {workspaceName}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="text-gray-600 hover:text-gray-900 border-gray-300 hover:bg-gray-50"
              onClick={() => setShowSyncModal(true)}
            >
              <Cloud className="w-4 h-4 mr-2" />
              {isCloudSynced ? "Sync" : "Setup Sync"}
            </Button>
            {!isCloudSynced && (
              <Button
                variant="default"
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => setShowCreateSyncModal(true)}
              >
                <Cloud className="w-4 h-4 mr-2" /> Create Sync ID
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              className="text-gray-600 hover:text-gray-900 border-gray-300 hover:bg-gray-50"
              onClick={() => setShowWorkspaceModal(true)}
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </header>

      <main className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-7xl xl:max-w-8xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-medium text-gray-900">Your boards</h2>
              {(filterAssignee || filterPriority) && (
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                  {filteredBoards.length} of {boards.length}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-gray-600 hover:text-gray-900 border-gray-300 hover:bg-gray-50"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => setShowCreateBoardModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Board
              </Button>
            </div>
          </div>

          {/* Filter Section */}
          {showFilters && (
            <div className="mb-6 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
                <div className="flex-1 space-y-2">
                  <Label className="text-gray-700 text-sm font-medium">Filter by Assignee</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search assignee..."
                      value={filterAssignee}
                      onChange={(e) => setFilterAssignee(e.target.value)}
                      className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="text-gray-600 hover:text-gray-900 border-gray-300 hover:bg-gray-50"
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear
                </Button>
              </div>
            </div>
          )}

          {filteredBoards.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredBoards.map((board, index) => {
                const IconComponent = getIconComponent(board.icon || "LayoutGrid")
                return (
                  <div
                    key={board.id}
                    onClick={() => router.push(`/board/${board.id}`)}
                    className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group border border-gray-200 hover:border-gray-300 relative"
                    style={{
                      background: `linear-gradient(135deg, ${board.color}20 0%, ${board.color}10 100%)`,
                    }}
                  >
                    <div className="p-4">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-sm"
                            style={{ backgroundColor: board.color }}
                          >
                            <IconComponent className="w-5 h-5" />
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => handleEditClick(e, board)}
                            className="h-7 w-7 p-0 hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => handleDeleteClick(e, board)}
                            className="h-7 w-7 p-0 hover:bg-red-50 text-gray-400 hover:text-red-500"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 leading-tight">
                          {board.title}
                        </h3>
                        {board.description && (
                          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                            {board.description}
                          </p>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="mt-4 pt-3 border-t border-gray-100 space-y-2">
                        {/* Assignees */}
                        {board.assignees && board.assignees.length > 0 && (
                          <div className="flex items-center gap-2">
                            <div className="flex -space-x-1">
                              {board.assignees.slice(0, 3).map((assignee, idx) => (
                                <div
                                  key={idx}
                                  className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white"
                                  title={assignee}
                                >
                                  {assignee.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                                </div>
                              ))}
                              {board.assignees.length > 3 && (
                                <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white">
                                  +{board.assignees.length - 3}
                                </div>
                              )}
                            </div>
                            <span className="text-xs text-gray-600 font-medium">
                              {board.assignees.length === 1 ? board.assignees[0] : `${board.assignees.length} members`}
                            </span>
                          </div>
                        )}

                        {/* Dates */}
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          {board.createdAt && (
                            <span>Created {formatUSDate(board.createdAt)}</span>
                          )}
                          {board.dueDate && (
                            <span className={isDueDateOverdue(board.dueDate) ? 'text-red-500 font-medium' : ''}>
                              {isDueDateOverdue(board.dueDate) ? '⚠️ ' : ''}
                              Due {formatRelativeDate(board.dueDate)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}

              {/* Create New Board Card */}
              <div
                onClick={() => setShowCreateBoardModal(true)}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group border-2 border-dashed border-gray-300 hover:border-gray-400 relative"
              >
                <div className="p-4 flex flex-col items-center justify-center h-full min-h-[160px]">
                  <div className="w-12 h-12 rounded-lg bg-gray-100 group-hover:bg-gray-200 flex items-center justify-center mb-3 transition-colors duration-200">
                    <Plus className="w-6 h-6 text-gray-400 group-hover:text-gray-600" />
                  </div>
                  <h3 className="text-sm font-medium text-gray-600 group-hover:text-gray-900 text-center transition-colors duration-200">
                    Create new board
                  </h3>
                  <p className="text-xs text-gray-500 text-center mt-1">
                    Organize your tasks
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-md mx-auto text-center py-12">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                <div className="w-16 h-16 mx-auto mb-6 bg-gray-100 rounded-lg flex items-center justify-center">
                  <LayoutGrid className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No boards yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Create your first board to start organizing your tasks and projects
                </p>
                <Button
                  onClick={() => setShowCreateBoardModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create your first board
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      <SyncIdModal
        open={showSyncModal}
        onOpenChange={setShowSyncModal}
        onSyncSetup={handleSyncSetup}
      />

      <CreateSyncIdModal
        open={showCreateSyncModal}
        onOpenChange={setShowCreateSyncModal}
        onCreated={(id, count) => {
          setIsCloudSynced(true)
          setSyncSuccessData({ syncId: id, boardCount: count })
          setShowSyncSuccessModal(true)
        }}
      />

      <SyncSuccessModal
        open={showSyncSuccessModal}
        onOpenChange={setShowSyncSuccessModal}
        syncId={syncSuccessData.syncId}
        boardCount={syncSuccessData.boardCount}
      />

      <WorkspaceSettingsModal
        open={showWorkspaceModal}
        onOpenChange={setShowWorkspaceModal}
        currentBackground={currentBackgroundColor}
        onBackgroundChange={handleBackgroundChange}
        onWorkspaceNameChange={setWorkspaceName}
      />

      <CreateBoardModal
        open={showCreateBoardModal}
        onOpenChange={setShowCreateBoardModal}
        onCreateBoard={handleCreateBoard}
      />

      <EditBoardModal
        open={showEditBoardModal}
        onOpenChange={setShowEditBoardModal}
        board={selectedBoard}
        onEditBoard={handleEditBoard}
      />

      <DeleteBoardModal
        open={showDeleteBoardModal}
        onOpenChange={setShowDeleteBoardModal}
        boardTitle={selectedBoard?.title || ""}
        onConfirmDelete={handleDeleteBoard}
      />
    </div>
  )
}
