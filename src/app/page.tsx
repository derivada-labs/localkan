"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SyncIdModal } from "@/components/sync-id-modal"
import { SyncSuccessModal } from "@/components/sync-success-modal"
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

  const handleCreateBoard = (boardData: { title: string; description: string; color: string; assignees: string[]; icon?: string; dueDate?: string }) => {
    const newBoard = {
      id: Date.now().toString(),
      title: boardData.title,
      color: boardData.color,
      description: boardData.description,
      assignees: boardData.assignees,
      icon: boardData.icon || "LayoutGrid",
      createdAt: new Date().toISOString(),
      dueDate: boardData.dueDate,
    }
    const updatedBoards = [...boards, newBoard]
    setBoards(updatedBoards)
    localStorage.setItem("kanban-boards", JSON.stringify(updatedBoards))
    setShowCreateBoardModal(false)
  }

  const handleEditBoard = (boardData: { title: string; description: string; color: string; assignees: string[]; dueDate?: string }) => {
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
    <div className={`min-h-screen bg-gradient-to-br ${backgroundGradient} overflow-hidden`}>
      <header
        className={`flex items-center justify-center p-4 sm:p-6 lg:p-8 transition-all duration-1000 ease-out ${
          mounted ? "translate-y-0 opacity-100" : "-translate-y-8 opacity-0"
        }`}
      >
        <div className="w-full max-w-7xl xl:max-w-8xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-white/90">
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
        className={`px-4 sm:px-6 lg:px-8 transition-all duration-1000 ease-out delay-200 ${
          mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        }`}
      >
        <div className="max-w-7xl xl:max-w-8xl mx-auto">
          <div
            className={`flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 lg:mb-8 gap-4 transition-all duration-800 ease-out delay-300 ${
              mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
          >
            <div className="flex items-center gap-2">
              <LayoutGrid className="w-5 h-5 text-white/70" />
              <h2 className="text-lg lg:text-xl font-medium text-white/90">Your boards</h2>
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
                  <Cloud className="w-4 h-4 mr-2" />
                )}
                <span className="hidden sm:inline">{isSyncing ? "Syncing..." : "Sync"}</span>
                <span className="sm:hidden">{isSyncing ? "..." : "Sync"}</span>
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
              className={`mb-6 lg:mb-8 p-4 lg:p-6 bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 transition-all duration-500 ease-out ${
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6 lg:gap-8">
              {filteredBoards.map((board, index) => {
                const IconComponent = getIconComponent(board.icon || "LayoutGrid")
                return (
                  <div
                    key={board.id}
                    onClick={() => router.push(`/board/${board.id}`)}
                    className={`relative bg-white/5 backdrop-blur-sm border border-white/20 rounded-3xl p-6 sm:p-8 hover:bg-white/10 hover:border-white/30 hover:scale-[1.02] cursor-pointer group aspect-[4/3] flex flex-col transition-all duration-300 shadow-xl hover:shadow-2xl ${
                      mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                    }`}
                    style={{
                      transitionDelay: `${400 + index * 100}ms`,
                      animationDelay: `${400 + index * 100}ms`,
                    }}
                  >
                    {/* Priority Indicator */}
                    {board.priority && (
                      <div className={`absolute top-4 right-4 w-3 h-3 rounded-full ${getPriorityColor(board.priority)} shadow-lg`} />
                    )}

                    {/* Header Section */}
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className={`w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-br from-${board.color}-400 to-${board.color}-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300`}
                      >
                        <IconComponent className="w-8 h-8 sm:w-9 sm:h-9 text-white" />
                      </div>
                      
                      {/* Action Buttons - Top Right */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-x-2 group-hover:translate-x-0">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => handleEditClick(e, board)}
                          className="h-8 w-8 p-0 bg-white/20 hover:bg-white/40 text-white hover:text-white rounded-lg backdrop-blur-sm shadow-md hover:shadow-lg"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => handleDeleteClick(e, board)}
                          className="h-8 w-8 p-0 bg-white/20 hover:bg-red-500/70 text-white hover:text-white rounded-lg backdrop-blur-sm shadow-md hover:shadow-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 flex flex-col justify-center">
                      <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 drop-shadow-lg line-clamp-2 leading-tight">
                        {board.title}
                      </h3>
                      {board.description && (
                        <p className="text-white/80 text-sm sm:text-base font-medium line-clamp-2 drop-shadow-md leading-relaxed">
                          {board.description}
                        </p>
                      )}
                    </div>

                    {/* Footer Section */}
                    <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
                      {/* Assignees Row */}
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {board.assignees && board.assignees.length > 0 ? (
                          <>
                            <div className="flex -space-x-2">
                              {board.assignees.slice(0, 3).map((assignee, idx) => (
                                <div 
                                  key={idx}
                                  className="w-7 h-7 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md border-2 border-white/20"
                                  title={assignee}
                                >
                                  {assignee.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                                </div>
                              ))}
                              {board.assignees.length > 3 && (
                                <div className="w-7 h-7 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md border-2 border-white/20">
                                  +{board.assignees.length - 3}
                                </div>
                              )}
                            </div>
                            <span className="text-xs sm:text-sm text-white/90 font-medium drop-shadow-md truncate">
                              {board.assignees.length === 1 ? board.assignees[0] : `${board.assignees.length} assignees`}
                            </span>
                          </>
                        ) : (
                          <div className="flex items-center gap-2 text-white/60">
                            <Users className="w-4 h-4" />
                            <span className="text-xs">Unassigned</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Dates Row */}
                      <div className="flex items-center justify-between text-xs">
                        {/* Created Date */}
                        {board.createdAt && (
                          <div className="flex items-center gap-1 text-white/70 font-medium drop-shadow-md">
                            <Calendar className="w-3 h-3" />
                            <span>Created {formatUSDate(board.createdAt)}</span>
                          </div>
                        )}
                        
                        {/* Due Date */}
                         {board.dueDate && (
                           <div className={`flex items-center gap-1 font-medium drop-shadow-md ${
                             isDueDateOverdue(board.dueDate) 
                               ? 'text-red-300' 
                               : 'text-white/80'
                           }`}>
                             <Target className="w-3 h-3" />
                             <span className="text-xs">
                               {isDueDateOverdue(board.dueDate) ? '⚠️ ' : ''}
                               {formatRelativeDate(board.dueDate)}
                             </span>
                           </div>
                         )}
                      </div>
                    </div>

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl pointer-events-none" />
                  </div>
                )
              })}
              
              {/* Create New Board Card */}
              <div
                onClick={() => setShowCreateBoardModal(true)}
                className={`relative bg-white/5 backdrop-blur-sm border-2 border-dashed border-white/30 rounded-3xl p-6 sm:p-8 hover:bg-white/10 hover:border-white/50 hover:scale-[1.02] cursor-pointer group aspect-[4/3] flex flex-col transition-all duration-300 shadow-xl hover:shadow-2xl ${
                  mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                }`}
                style={{
                  transitionDelay: `${400 + filteredBoards.length * 100}ms`,
                  animationDelay: `${400 + filteredBoards.length * 100}ms`,
                }}
              >
                {/* Header Section */}
                <div className="flex items-start justify-between mb-4">
                  <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-br from-white/20 to-white/10 group-hover:from-white/30 group-hover:to-white/20 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                    <Plus className="w-8 h-8 sm:w-9 sm:h-9 text-white/80 group-hover:text-white" />
                  </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex flex-col justify-center">
                  <h3 className="text-xl sm:text-2xl font-bold text-white/90 mb-2 group-hover:text-white drop-shadow-lg line-clamp-2 leading-tight">
                    Create new board
                  </h3>
                  <p className="text-white/70 text-sm sm:text-base font-medium group-hover:text-white/80 drop-shadow-md leading-relaxed">
                    Add a new board to organize your tasks
                  </p>
                </div>

                {/* Footer Section - Placeholder to maintain consistent height */}
                <div className="mt-4 pt-4 border-t border-white/10 opacity-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-white/50">
                      <Plus className="w-4 h-4" />
                      <span className="text-xs">New workspace</span>
                    </div>
                    <div className="text-xs text-white/50">
                      Ready to start
                    </div>
                  </div>
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl pointer-events-none" />
              </div>
            </div>
          ) : (
            <div
              className={`max-w-4xl mx-auto transition-all duration-1000 ease-out delay-500 ${
                mounted ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
              }`}
            >
              <div className="border-2 border-dashed border-white/20 rounded-lg p-8 sm:p-16 text-center hover:border-white/30 hover:bg-white/5 group">
                <div className="w-16 h-16 mx-auto mb-6 bg-white/10 group-hover:bg-white/15 rounded-xl flex items-center justify-center">
                  <Plus className="w-8 h-8 text-white/60 group-hover:text-white/80" />
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold text-white/80 mb-4 group-hover:text-white">
                  No boards yet
                </h3>
                <p className="text-white/60 mb-8 group-hover:text-white/70 max-w-md mx-auto">
                  Create your first board to start organizing your tasks and projects
                </p>
                <Button
                  onClick={() => setShowCreateBoardModal(true)}
                  className="bg-white/20 hover:bg-white/30 text-white border border-white/30 hover:border-white/40"
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
