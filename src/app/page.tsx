"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SyncIdModal } from "@/components/sync-id-modal"
import { WorkspaceSettingsModal } from "@/components/workspace-settings-modal"
import { CreateBoardModal } from "@/components/create-board-modal"
import { EditBoardModal } from "@/components/edit-board-modal"
import { DeleteBoardModal } from "@/components/delete-board-modal"
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
  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false)
  const [showCreateBoardModal, setShowCreateBoardModal] = useState(false)
  const [showEditBoardModal, setShowEditBoardModal] = useState(false)
  const [showDeleteBoardModal, setShowDeleteBoardModal] = useState(false)
  const [selectedBoard, setSelectedBoard] = useState<any>(null)
  const [boards, setBoards] = useState<
    Array<{ id: string; title: string; color: string; description?: string; assignees?: string; icon?: string; createdAt?: string }>
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
    const savedWorkspaceName = localStorage.getItem("workspace-name") || "My Workspace"
    const savedBackground = localStorage.getItem("workspace-background") || "purple"
    const syncId = localStorage.getItem("sync-id")
    
    setBoards(savedBoards)
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

  const handleCreateBoard = (boardData: { title: string; description: string; color: string; assignees: string; icon?: string }) => {
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

  // Filter boards based on assignee and priority
  const filteredBoards = boards.filter(board => {
    const matchesAssignee = !filterAssignee || 
      (board.assignees && board.assignees.toLowerCase().includes(filterAssignee.toLowerCase()))
    const matchesPriority = !filterPriority || 
      (board.description && board.description.toLowerCase().includes(filterPriority.toLowerCase()))
    return matchesAssignee && matchesPriority
  })

  const clearFilters = () => {
    setFilterAssignee("")
    setFilterPriority("")
    setShowFilters(false)
  }

  const handleSyncSetup = (syncId: string) => {
    setIsCloudSynced(true)
    // Refresh the page to show updated sync status
    window.location.reload()
  }

  const [isSyncing, setIsSyncing] = useState(false)

  const handleSyncNow = async () => {
    const syncId = localStorage.getItem("sync-id")
    if (!syncId) {
      alert("No Sync ID found. Please set up sync first.")
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
      
      alert(`✅ Upload successful! ${boards.length} boards saved to cloud.`)
    } catch (error) {
      console.error("Sync error:", error)
      alert("❌ Upload failed. Please check your connection and try again.")
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${backgroundGradient} overflow-hidden`}>
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
              <span className="hidden md:inline">{workspaceName}</span>
              <span className="ml-2 text-xs text-white/70 hidden lg:inline">
                {isCloudSynced ? "Cloud Storage" : "Local Storage"}
              </span>
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
              {(filterAssignee || filterPriority) && (
                <span className="text-xs text-white/60 bg-white/20 px-2 py-1 rounded-full">
                  {filteredBoards.length} of {boards.length}
                </span>
              )}
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
                disabled={!isCloudSynced || isSyncing}
                onClick={handleSyncNow}
              >
                {isSyncing ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4 mr-2" />
                )}
                <span className="hidden sm:inline">{isSyncing ? "Uploading..." : "Upload to Cloud"}</span>
                <span className="sm:hidden">{isSyncing ? "..." : "Upload"}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:text-white bg-white/30 hover:bg-white/40 border border-white/40 hover:border-white/50 backdrop-blur-lg shadow-lg"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Filter</span>
                <span className="sm:hidden">Filter</span>
              </Button>
            </div>
          </div>

          {/* Filter Section */}
          {showFilters && (
            <div
              className={`mb-6 p-4 bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 transition-all duration-500 ease-out ${
                mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
              }`}
            >
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
                <div className="flex-1 space-y-2">
                  <Label className="text-white/90 text-sm">Filter by Assignee</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
                    <Input
                      placeholder="Search assignee..."
                      value={filterAssignee}
                      onChange={(e) => setFilterAssignee(e.target.value)}
                      className="pl-10 bg-white/20 border-white/30 text-white placeholder:text-white/50"
                    />
                  </div>
                </div>
                <div className="flex-1 space-y-2">
                  <Label className="text-white/90 text-sm">Filter by Priority/Description</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
                    <Input
                      placeholder="Search description..."
                      value={filterPriority}
                      onChange={(e) => setFilterPriority(e.target.value)}
                      className="pl-10 bg-white/20 border-white/30 text-white placeholder:text-white/50"
                    />
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-white/70 hover:text-white bg-white/20 hover:bg-white/30"
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear
                </Button>
              </div>
            </div>
          )}

          {filteredBoards.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {filteredBoards.map((board, index) => (
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
                      {board.createdAt && (
                        <div className="text-xs text-white/50">
                          Created {new Date(board.createdAt).toLocaleDateString()}
                        </div>
                      )}
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
                  transitionDelay: `${400 + filteredBoards.length * 150}ms`,
                  animationDelay: `${400 + filteredBoards.length * 150}ms`,
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
      <SyncIdModal 
        open={showSyncModal} 
        onOpenChange={setShowSyncModal}
        onSyncSetup={handleSyncSetup}
      />
      <WorkspaceSettingsModal 
        open={showWorkspaceModal} 
        onOpenChange={setShowWorkspaceModal}
        onBackgroundChange={handleBackgroundChange}
        currentBackground={currentBackgroundColor}
      />
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
