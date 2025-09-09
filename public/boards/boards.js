// Global variables
let boards = JSON.parse(localStorage.getItem('kanbanBoards')) || [];
let currentEditBoardId = null;
let selectedBackgroundColor = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'; // Default purple
let selectedWorkspaceColor = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'; // Default workspace color
let dashboardAssigneeFilter = []; // array of selected names, includes 'UNASSIGNED'

// Modal helper functions
function showConfirmModal(title, message, onConfirm, confirmButtonText = 'Confirm', confirmButtonClass = 'btn-danger') {
    const modal = document.getElementById('confirmModal');
    const titleElement = document.getElementById('confirmModalLabel');
    const messageElement = document.getElementById('confirmModalMessage');
    const buttonElement = document.getElementById('confirmModalButton');
    
    titleElement.innerHTML = `<i class="bi bi-question-circle-fill text-warning me-2"></i>${title}`;
    messageElement.innerHTML = message;
    buttonElement.textContent = confirmButtonText;
    buttonElement.className = `btn ${confirmButtonClass}`;
    
    buttonElement.onclick = function() {
        const bootstrapModal = bootstrap.Modal.getInstance(modal);
        bootstrapModal.hide();
        onConfirm();
    };
    
    const bootstrapModal = new bootstrap.Modal(modal);
    bootstrapModal.show();
}

function showNotificationModal(title, message, type = 'info') {
    const modal = document.getElementById('notificationModal');
    const titleElement = document.getElementById('notificationModalLabel');
    const messageElement = document.getElementById('notificationModalMessage');
    
    const icons = {
        'info': 'bi-info-circle-fill text-primary',
        'success': 'bi-check-circle-fill text-success',
        'warning': 'bi-exclamation-triangle-fill text-warning',
        'error': 'bi-x-circle-fill text-danger'
    };
    
    titleElement.innerHTML = `<i class="bi ${icons[type] || icons.info} me-2"></i>${title}`;
    messageElement.innerHTML = message;
    
    const bootstrapModal = new bootstrap.Modal(modal);
    bootstrapModal.show();
}

// Color themes
const colorThemes = [
    { name: 'Purple', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { name: 'Blue', gradient: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)' },
    { name: 'Green', gradient: 'linear-gradient(135deg, #10b981 0%, #047857 100%)' },
    { name: 'Orange', gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' },
    { name: 'Red', gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' },
    { name: 'Pink', gradient: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)' },
    { name: 'Teal', gradient: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)' },
    { name: 'Indigo', gradient: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' },
    { name: 'Gray', gradient: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)' }
];

// Initialize workspace
function initializeWorkspace() {
    const workspaceSettings = JSON.parse(localStorage.getItem('workspaceSettings')) || {
        name: 'My workspace',
        backgroundColor: colorThemes[0].gradient
    };
    
    document.getElementById('workspaceName').textContent = workspaceSettings.name;
    document.body.style.background = workspaceSettings.backgroundColor;
    selectedWorkspaceColor = workspaceSettings.backgroundColor;
}

// Save workspace settings
function saveWorkspaceSettings(name, backgroundColor) {
    const workspaceSettings = {
        name: name,
    backgroundColor: backgroundColor,
    updatedAt: new Date().toISOString()
    };
    localStorage.setItem('workspaceSettings', JSON.stringify(workspaceSettings));
}

// Generate unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Save boards to localStorage
function saveBoards() {
    localStorage.setItem('kanbanBoards', JSON.stringify(boards));
}

// Format date
function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}

// Get card count for a board
function getBoardCardCount(boardId) {
    const cards = JSON.parse(localStorage.getItem(`kanbanCards_${boardId}`)) || [];
    return cards.length;
}

// Get cards by status for a board
function getBoardStats(boardId) {
    const cards = JSON.parse(localStorage.getItem(`kanbanCards_${boardId}`)) || [];
    const stats = {
        total: cards.length,
        backlog: cards.filter(c => c.column === 'backlog').length,
        todo: cards.filter(c => c.column === 'todo').length,
        doing: cards.filter(c => c.column === 'doing').length,
        done: cards.filter(c => c.column === 'done').length
    };
    return stats;
}

// Get unique assignees across all boards (case-insensitive, stored lowercased)
function getAllAssignees() {
    const names = new Set();
    boards.forEach(b => {
        const cards = JSON.parse(localStorage.getItem(`kanbanCards_${b.id}`)) || [];
        cards.forEach(c => {
            if (Array.isArray(c.assignees)) {
                c.assignees.forEach(a => {
                    if (typeof a === 'string' && a.trim()) names.add(a.trim().toLowerCase());
                });
            } else if (typeof c.assignee === 'string' && c.assignee.trim()) {
                names.add(c.assignee.trim().toLowerCase());
            }
        });
    });
    return Array.from(names).sort();
}

// Escape HTML for safe rendering
function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// Get unique assignees for a specific board (case-insensitive dedupe, keep first casing)
function getBoardAssignees(boardId) {
    const cards = JSON.parse(localStorage.getItem(`kanbanCards_${boardId}`)) || [];
    const seen = new Set();
    const result = [];
    for (const c of cards) {
        let list = [];
        if (Array.isArray(c.assignees)) {
            list = c.assignees.filter(x => typeof x === 'string' && x.trim());
        } else if (typeof c.assignee === 'string' && c.assignee.trim()) {
            list = [c.assignee];
        }
        for (const name of list) {
            const key = name.trim().toLowerCase();
            if (key && !seen.has(key)) {
                seen.add(key);
                result.push(name.trim());
            }
        }
    }
    // Also include board-level defaultAssignees (fallback if no cards yet)
    const board = boards.find(b => b.id === boardId);
    let defaults = [];
    if (board) {
        if (Array.isArray(board.defaultAssignees)) {
            defaults = board.defaultAssignees;
        } else if (typeof board.defaultAssignees === 'string') {
            defaults = board.defaultAssignees.split(',').map(s => s.trim()).filter(Boolean);
        }
        for (const name of defaults) {
            const key = name.trim().toLowerCase();
            if (key && !seen.has(key)) {
                seen.add(key);
                result.push(name.trim());
            }
        }
    }
    // sort alphabetically, case-insensitive
    result.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
    return result;
}

function renderAssigneeChips(names, max = 5) {
    if (!Array.isArray(names) || names.length === 0) return '';
    const shown = names.slice(0, max);
    const extra = names.length - shown.length;
    const chips = shown.map(n => `<span class="assignee-chip"><i class="bi bi-person"></i> ${escapeHtml(n)}</span>`).join('');
    const more = extra > 0 ? `<span class="assignee-chip more-chip">+${extra} more</span>` : '';
    return `<div class="board-assignees">${chips}${more}</div>`;
}

function boardMatchesAssigneeFilter(board) {
    if (!Array.isArray(dashboardAssigneeFilter) || dashboardAssigneeFilter.length === 0 || dashboardAssigneeFilter.includes('ALL')) return true; // no filters => show all
    const cards = JSON.parse(localStorage.getItem(`kanbanCards_${board.id}`)) || [];
    const hasUnassigned = dashboardAssigneeFilter.includes('UNASSIGNED');
    // If any card in the board matches any selected assignee, include the board
    return cards.some(c => {
        const list = Array.isArray(c.assignees)
            ? c.assignees.filter(x => typeof x === 'string' && x.trim()).map(x => x.trim().toLowerCase())
            : ((c.assignee && typeof c.assignee === 'string') ? [c.assignee.trim().toLowerCase()] : []);
        const isUnassigned = list.length === 0;
        const nameMatch = dashboardAssigneeFilter
            .filter(v => v !== 'UNASSIGNED')
            .some(sel => list.includes(sel.toLowerCase()));
        return (hasUnassigned && isUnassigned) || nameMatch;
    });
}

function buildDashboardAssigneeFilter() {
    const select = document.getElementById('dashboardAssigneeFilter');
    if (!select) return;
    const names = getAllAssignees();
    const prev = Array.isArray(dashboardAssigneeFilter) ? dashboardAssigneeFilter : [];
    select.innerHTML = '<option value="ALL">All</option><option value="UNASSIGNED">Unassigned</option>' +
        names.map(n => `<option value="${n}">${n}</option>`).join('');
    dashboardAssigneeFilter = prev.filter(v => v === 'ALL' || v === 'UNASSIGNED' || names.includes(v));
    for (const opt of select.options) {
        opt.selected = dashboardAssigneeFilter.includes(opt.value);
    }
}

// Create board card HTML
function createBoardCardHTML(board) {
    const stats = getBoardStats(board.id);
    const backgroundColor = board.backgroundColor || 'rgba(255, 255, 255, 0.15)';
    const assignees = getBoardAssignees(board.id);
    
    return `
        <div class="board-card" onclick="openBoard('${board.id}')" style="background: ${backgroundColor}">
            <div class="board-header">
                <div class="d-flex align-items-center gap-2">
                    <i class="bi bi-kanban"></i>
                    <div class="board-title mb-0" title="${board.title.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}">${board.title}</div>
                </div>
            </div>
            <div class="board-description">${board.description || 'No description provided'}</div>
            ${renderAssigneeChips(assignees)}
            <div class="board-stats">
                <div class="stat">
                    <i class="bi bi-card-list"></i>
                    <span>${stats.total} cards</span>
                </div>
                <div class="stat">
                    <i class="bi bi-check-circle-fill"></i>
                    <span>${stats.done} done</span>
                </div>
            </div>
            <div class="board-date">Created ${formatDate(board.createdAt)}</div>
            <div class="board-card-actions" onclick="event.stopPropagation()">
                <button type="button" class="board-card-action-btn edit" aria-label="Edit board" title="Edit board" onclick="editBoard('${board.id}')">
                    <i class="bi bi-pencil"></i>
                </button>
                <button type="button" class="board-card-action-btn delete" aria-label="Delete board" title="Delete board" onclick="deleteBoard('${board.id}')">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
        </div>
    `;
}

// Create new board card HTML
function createNewBoardCardHTML() {
    return `
        <div class="board-card create-new" onclick="openCreateBoardModal()">
            <div class="create-icon"><i class="bi bi-plus-lg"></i></div>
            <div class="create-text">Create new board</div>
        </div>
    `;
}

// Render color picker
function renderColorPicker(selectedColor = colorThemes[0].gradient) {
    const colorPicker = document.getElementById('colorPicker');
    
    colorPicker.innerHTML = colorThemes.map((theme, index) => `
        <div class="color-option ${theme.gradient === selectedColor ? 'selected' : ''}" 
             style="background: ${theme.gradient}" 
             onclick="selectColor(event, '${theme.gradient}')"
             title="${theme.name}">
        </div>
    `).join('');
}

// Render workspace color picker
function renderWorkspaceColorPicker(selectedColor = colorThemes[0].gradient) {
    const colorPicker = document.getElementById('workspaceColorPicker');
    
    colorPicker.innerHTML = colorThemes.map((theme, index) => `
        <div class="color-option ${theme.gradient === selectedColor ? 'selected' : ''}" 
             style="background: ${theme.gradient}" 
             onclick="selectWorkspaceColor(event, '${theme.gradient}')"
             title="${theme.name}">
        </div>
    `).join('');
}

// Select color theme
function selectColor(evt, gradient) {
    selectedBackgroundColor = gradient;
    
    // Update color picker UI
    document.querySelectorAll('#colorPicker .color-option').forEach(option => {
        option.classList.remove('selected');
    });
    const el = evt?.currentTarget || evt?.target;
    if (el && el.classList) el.classList.add('selected');
}

// Select workspace color theme
function selectWorkspaceColor(evt, gradient) {
    selectedWorkspaceColor = gradient;
    
    // Update background immediately
    document.body.style.background = gradient;
    
    // Update color picker UI
    document.querySelectorAll('#workspaceColorPicker .color-option').forEach(option => {
        option.classList.remove('selected');
    });
    const el = evt?.currentTarget || evt?.target;
    if (el && el.classList) el.classList.add('selected');
}

// Workspace modal functions
function openWorkspaceSettings() {
    const workspaceSettings = JSON.parse(localStorage.getItem('workspaceSettings')) || {
        name: 'My workspace',
        backgroundColor: colorThemes[0].gradient
    };
    
    document.getElementById('workspaceTitle').value = workspaceSettings.name;
    selectedWorkspaceColor = workspaceSettings.backgroundColor;
    renderWorkspaceColorPicker(selectedWorkspaceColor);
    
    const modal = new bootstrap.Modal(document.getElementById('workspaceModal'));
    modal.show();
}

function closeWorkspaceModal() {
    const modal = bootstrap.Modal.getInstance(document.getElementById('workspaceModal'));
    if (modal) {
        modal.hide();
    }
}

// Render all boards
function renderBoards() {
    const boardsGrid = document.getElementById('boardsGrid');
    
    const visibleBoards = boards.filter(boardMatchesAssigneeFilter);

    if (visibleBoards.length === 0) {
        boardsGrid.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">
                    <i class="bi bi-kanban"></i>
                </div>
                <h3>No boards yet</h3>
                <p>Create your first board to get started with organizing your tasks!</p>
                <button class="empty-state-button" onclick="openCreateBoardModal()">
                    <i class="bi bi-plus-circle-fill"></i>
                    Create new board
                </button>
            </div>
        `;
    } else {
        const boardsHTML = visibleBoards.map(createBoardCardHTML).join('');
        boardsGrid.innerHTML = boardsHTML + createNewBoardCardHTML();
    }
}

// Modal functions
function openCreateBoardModal() {
    currentEditBoardId = null;
    selectedBackgroundColor = colorThemes[0].gradient; // Reset to default
    document.getElementById('modalTitle').textContent = 'Create New Board';
    document.getElementById('boardTitle').value = '';
    document.getElementById('boardDescription').value = '';
    const defaultAssigneesInput = document.getElementById('boardDefaultAssignees');
    if (defaultAssigneesInput) defaultAssigneesInput.value = '';
    document.getElementById('deleteBoardBtn').style.display = 'none';
    document.getElementById('saveBoardBtn').textContent = 'Create Board';
    renderColorPicker(selectedBackgroundColor);
    
    const modal = new bootstrap.Modal(document.getElementById('boardModal'));
    modal.show();
}

function closeModal() {
    const modal = bootstrap.Modal.getInstance(document.getElementById('boardModal'));
    if (modal) {
        modal.hide();
    }
    currentEditBoardId = null;
}

// Open board (navigate to kanban board)
function openBoard(boardId) {
    // Store the current board ID in localStorage so the kanban page can pick it up
    localStorage.setItem('currentBoardId', boardId);
    
    // Navigate to the kanban board page
    window.location.href = '../board/board.html';
}

// Delete board
function deleteBoard(boardId) {
    const board = boards.find(b => b.id === boardId);
    if (!board) return;

    // Escape HTML characters in board title to avoid injection
    const safeTitle = (board.title || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    // Decide if we should visually truncate (for extremely long continuous strings >120 chars)
    const shouldTruncate = safeTitle.length > 160; // arbitrary cutoff for display
    const displayTitle = shouldTruncate ? safeTitle.slice(0, 160) : safeTitle;

    showConfirmModal(
        'Delete Board',
        `Are you sure you want to delete <span class="board-title-inline ${shouldTruncate ? 'truncated' : ''}" title="${safeTitle}">${displayTitle}</span>?<br><br>` +
        `This will also delete all cards in this board. This action cannot be undone.`,
        function() {
            // Remove board
            boards = boards.filter(b => b.id !== boardId);
            
            // Remove board's cards
            localStorage.removeItem(`kanbanCards_${boardId}`);
            
            saveBoards();
            renderBoards();
            // Nudge sync timestamp for change tracking
            if (typeof trackDataChange === 'function') trackDataChange();
        },
        'Delete Board'
    );
}

// Edit board (opens modal with existing data)
function editBoard(boardId) {
    const board = boards.find(b => b.id === boardId);
    if (!board) return;

    currentEditBoardId = boardId;
    selectedBackgroundColor = board.backgroundColor || colorThemes[0].gradient;
    document.getElementById('modalTitle').textContent = 'Edit Board';
    document.getElementById('boardTitle').value = board.title;
    document.getElementById('boardDescription').value = board.description || '';
    const defaultAssigneesInput = document.getElementById('boardDefaultAssignees');
    if (defaultAssigneesInput) defaultAssigneesInput.value = Array.isArray(board.defaultAssignees) ? board.defaultAssignees.join(', ') : (board.defaultAssignees || '');
    document.getElementById('deleteBoardBtn').style.display = 'inline-block';
    document.getElementById('saveBoardBtn').textContent = 'Update Board';
    renderColorPicker(selectedBackgroundColor);
    
    const modal = new bootstrap.Modal(document.getElementById('boardModal'));
    modal.show();
}

// Delete board from modal
function deleteBoardFromModal() {
    if (currentEditBoardId) {
        deleteBoard(currentEditBoardId);
        closeModal();
    }
}

// New form submission functions for Bootstrap modals
function submitBoardForm() {
    const title = document.getElementById('boardTitle').value.trim();
    const description = document.getElementById('boardDescription').value.trim();
    const defaultAssigneesRaw = (document.getElementById('boardDefaultAssignees')?.value || '');
    const defaultAssignees = defaultAssigneesRaw.split(',').map(s => s.trim()).filter(Boolean);
    
    if (!title) return;

    if (currentEditBoardId) {
        // Update existing board
        const boardIndex = boards.findIndex(board => board.id === currentEditBoardId);
        if (boardIndex !== -1) {
            boards[boardIndex].title = title;
            boards[boardIndex].description = description;
            boards[boardIndex].backgroundColor = selectedBackgroundColor;
            boards[boardIndex].defaultAssignees = defaultAssignees;
            boards[boardIndex].updatedAt = new Date().toISOString();
        }
    } else {
        // Create new board
        const newBoard = {
            id: generateId(),
            title: title,
            description: description,
            backgroundColor: selectedBackgroundColor,
            defaultAssignees: defaultAssignees,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        boards.push(newBoard);
    }

    saveBoards();
    renderBoards();
    closeModal();
}

function submitWorkspaceForm() {
    const name = document.getElementById('workspaceTitle').value.trim();
    
    if (!name) return;

    // Update workspace
    saveWorkspaceSettings(name, selectedWorkspaceColor);
    document.getElementById('workspaceName').textContent = name;
    
    closeWorkspaceModal();
}

// Import/Export functionality
function exportBoards() {
    // Prepare export data
    const exportData = {
        exportDate: new Date().toISOString(),
        version: "1.0",
        boards: boards,
        cards: {}
    };

    // Collect all cards for each board
    boards.forEach(board => {
        const boardCards = JSON.parse(localStorage.getItem(`kanbanCards_${board.id}`)) || [];
        exportData.cards[board.id] = boardCards;
    });

    // Create and download file
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `kanban-boards-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    // Cleanup
    URL.revokeObjectURL(link.href);
    
    showNotificationModal('Export Successful', `Successfully exported ${boards.length} boards with all their cards!`, 'success');
}

function triggerImport() {
    document.getElementById('importFile').click();
}

function importBoards(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importData = JSON.parse(e.target.result);
            
            // Validate file structure
            if (!importData.boards || !importData.cards || !importData.version) {
                throw new Error('Invalid file format');
            }

            // Ask user about merge vs replace
            showConfirmModal(
                'Import Boards',
                `Import ${importData.boards.length} boards?<br><br>` +
                `• This will ADD these boards to your existing ones<br>` +
                `• Your existing boards will not be affected<br><br>` +
                `Continue with import?`,
                function() {
                    // Proceed with import (move the import logic here)
                    proceedWithImport(importData, event);
                },
                'Import Boards',
                'btn-primary'
            );
            return; // Exit here, import logic will be called from modal

        } catch (error) {
            showNotificationModal('Import Error', 'Error importing file: ' + error.message + '<br><br>Please make sure you selected a valid Kanban export file.', 'error');
        } finally {
            // Reset file input
            event.target.value = '';
        }
    };

    reader.readAsText(file);
}

// Separate function to handle the actual import logic
function proceedWithImport(importData, event) {
    try {
        // Generate new IDs to avoid conflicts
        const idMapping = {};
        let importedBoardsCount = 0;
        let importedCardsCount = 0;

        importData.boards.forEach(board => {
            const newBoardId = generateId();
            idMapping[board.id] = newBoardId;

            // Create new board with new ID
            const newBoard = {
                ...board,
                id: newBoardId,
                title: board.title + ' (Imported)',
                updatedAt: new Date().toISOString()
            };

            boards.push(newBoard);
            importedBoardsCount++;

            // Import cards for this board
            const boardCards = importData.cards[board.id] || [];
            const newCards = boardCards.map(card => ({
                ...card,
                id: generateId(),
                updatedAt: new Date().toISOString()
            }));

            localStorage.setItem(`kanbanCards_${newBoardId}`, JSON.stringify(newCards));
            importedCardsCount += newCards.length;
        });

        // Save updated boards
        saveBoards();
        renderBoards();

        showNotificationModal('Import Successful', 
            `Successfully imported!<br><br>` +
            `• ${importedBoardsCount} boards<br>` +
            `• ${importedCardsCount} cards<br><br>` +
            `Imported boards have "(Imported)" suffix to avoid name conflicts.`, 'success');

    } catch (error) {
        showNotificationModal('Import Error', 'Error importing file: ' + error.message + '<br><br>Please make sure you selected a valid Kanban export file.', 'error');
    } finally {
        // Reset file input
        event.target.value = '';
    }
}

// Form submission (keeping for Enter key support)
document.getElementById('boardForm').addEventListener('submit', function(e) {
    e.preventDefault();
    submitBoardForm();
});

// Workspace form submission (keeping for Enter key support) 
document.getElementById('workspaceForm').addEventListener('submit', function(e) {
    e.preventDefault();
    submitWorkspaceForm();
});

// Bootstrap handles modal backdrop and ESC key automatically
// Keeping event listeners for cleanup when modals are closed
document.getElementById('boardModal').addEventListener('hidden.bs.modal', function() {
    currentEditBoardId = null;
});

// Hash Management Modal
function openHashModal() {
    const modal = document.getElementById('hashModal');
    const content = document.getElementById('hashModalContent');
    
    if (syncManager.hasHash()) {
        // User has a hash
        content.innerHTML = `
            <div class="alert alert-success border-0 shadow-sm mb-4" role="alert">
                <div class="d-flex align-items-center mb-2">
                    <i class="bi bi-check-circle-fill text-success me-2 fs-5"></i>
                    <h5 class="alert-heading mb-0 fw-semibold">Active Sync ID</h5>
                </div>
                <div class="d-flex align-items-center justify-content-between bg-white rounded p-3 mt-3">
                    <div>
                        <span class="badge bg-primary-subtle text-primary-emphasis fs-6 fw-bold font-monospace letter-spacing-wide px-3 py-2">
                            ${syncManager.getHash().toUpperCase()}
                        </span>
                    </div>
                    <button onclick="copyHashToClipboard()" class="btn btn-outline-primary btn-sm" 
                            data-bs-toggle="tooltip" data-bs-placement="top" title="Copy to clipboard">
                        <i class="bi bi-clipboard me-1"></i>Copy
                    </button>
                </div>
                <p class="text-muted small mt-2 mb-0">
                    <i class="bi bi-info-circle me-1"></i>
                    Use this ID on other devices to sync your boards
                </p>
            </div>
            
            <div class="card border-0 shadow-sm">
                <div class="card-header bg-light border-0">
                    <h6 class="card-title mb-0 fw-semibold">
                        <i class="bi bi-arrow-left-right text-warning me-2"></i>
                        Switch to Different Sync ID
                    </h6>
                </div>
                <div class="card-body">
                    <div class="alert alert-warning border-0 mb-3" role="alert">
                        <i class="bi bi-exclamation-triangle-fill me-2"></i>
                        <small>Warning: This will replace all your local data</small>
                    </div>
                    <div class="input-group">
                        <span class="input-group-text bg-light border-end-0">
                            <i class="bi bi-key text-muted"></i>
                        </span>
                        <input type="text" id="switchHashInput" class="form-control border-start-0" 
                               placeholder="Enter existing Sync ID" maxlength="20"
                               style="text-transform: uppercase; letter-spacing: 1px;">
                    </div>
                </div>
                <div class="card-footer bg-light border-0">
                    <div class="d-flex gap-2 justify-content-end">
                        <button class="btn btn-outline-secondary" onclick="closeHashModal()">
                            <i class="bi bi-x-lg me-1"></i>Close
                        </button>
                        <button class="btn btn-outline-danger" onclick="createNewHashWithWarning()">
                            <i class="bi bi-plus-circle me-1"></i>Create New ID
                        </button>
                        <button class="btn btn-primary" onclick="switchHash()">
                            <i class="bi bi-arrow-repeat me-1"></i>Switch ID
                        </button>
                    </div>
                </div>
            </div>
        `;
    } else {
        // User has no hash
        content.innerHTML = `
            <div class="text-center mb-4">
                <i class="bi bi-cloud-slash text-muted display-4 mb-3"></i>
                <h4 class="text-muted fw-semibold mb-2">No Sync ID Set</h4>
                <p class="text-muted small mb-0">
                    Create a new Sync ID or enter an existing one to enable cloud sync
                </p>
            </div>
            
            <div class="row g-3">
                <div class="col-12">
                    <div class="card border-0 shadow-sm bg-primary-subtle">
                        <div class="card-body text-center p-4">
                            <i class="bi bi-person-plus text-primary fs-2 mb-3"></i>
                            <h5 class="card-title text-primary fw-semibold mb-2">New User?</h5>
                            <p class="card-text text-primary-emphasis small mb-3">
                                Create a new Sync ID to start syncing your boards across devices
                            </p>
                            <button class="btn btn-primary btn-lg w-100" onclick="createNewHash()">
                                <i class="bi bi-plus-circle me-2"></i>Create New Sync ID
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="col-12">
                    <div class="card border-0 shadow-sm bg-warning-subtle">
                        <div class="card-body p-4">
                            <div class="d-flex align-items-center mb-3">
                                <i class="bi bi-key text-warning fs-4 me-2"></i>
                                <h5 class="card-title text-warning-emphasis fw-semibold mb-0">Have an existing ID?</h5>
                            </div>
                            <p class="card-text text-warning-emphasis small mb-3">
                                Enter your Sync ID to download your boards from the cloud
                            </p>
                            <div class="input-group mb-3">
                                <span class="input-group-text bg-light border-end-0">
                                    <i class="bi bi-hash text-muted"></i>
                                </span>
                                <input type="text" id="activateHashInput" class="form-control border-start-0" 
                                       placeholder="Enter your Sync ID" maxlength="20"
                                       style="text-transform: uppercase; letter-spacing: 1px;">
                            </div>
                            <button class="btn btn-warning btn-lg w-100" onclick="activateHash()">
                                <i class="bi bi-arrow-clockwise me-2"></i>Activate Existing ID
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="text-center mt-4">
                <button class="btn btn-outline-secondary" onclick="closeHashModal()">
                    <i class="bi bi-x-lg me-1"></i>Cancel
                </button>
            </div>
        `;
    }
    
    // Show modal using Bootstrap
    const bootstrapModal = new bootstrap.Modal(modal);
    bootstrapModal.show();
    
    // Initialize tooltips after modal content is rendered
    setTimeout(() => {
        const tooltipTriggerList = [].slice.call(modal.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.forEach(function (tooltipTriggerEl) {
            new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }, 100);
}

function closeHashModal() {
    const modal = bootstrap.Modal.getInstance(document.getElementById('hashModal'));
    if (modal) {
        modal.hide();
    }
}

async function copyHashToClipboard() {
    const hash = syncManager.getHash();
    const button = event.target.closest('button');
    const originalContent = button.innerHTML;
    
    try {
        await navigator.clipboard.writeText(hash);
        
        // Show success state
        button.innerHTML = '<i class="bi bi-check-lg me-1"></i>Copied!';
        button.classList.add('btn-success');
        button.classList.remove('btn-outline-primary');
        button.disabled = true;
        
        setTimeout(() => {
            button.innerHTML = originalContent;
            button.classList.remove('btn-success');
            button.classList.add('btn-outline-primary');
            button.disabled = false;
        }, 2000);
        
        // Show toast notification
        const toast = document.createElement('div');
        toast.className = 'toast align-items-center text-bg-success border-0 position-fixed';
        toast.style.top = '20px';
        toast.style.right = '20px';
        toast.style.zIndex = '9999';
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    <i class="bi bi-check-circle me-2"></i>Sync ID copied to clipboard!
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto"></button>
            </div>
        `;
        document.body.appendChild(toast);
        const bsToast = new bootstrap.Toast(toast, { delay: 3000 });
        bsToast.show();
        
        toast.addEventListener('hidden.bs.toast', () => {
            document.body.removeChild(toast);
        });
        
    } catch (error) {
        // Show error state
        button.innerHTML = '<i class="bi bi-x-lg me-1"></i>Error';
        button.classList.add('btn-danger');
        button.classList.remove('btn-outline-primary');
        
        setTimeout(() => {
            button.innerHTML = originalContent;
            button.classList.remove('btn-danger');
            button.classList.add('btn-outline-primary');
        }, 2000);
    }
}

async function createNewHash() {
    const button = event.target;
    const originalContent = button.innerHTML;
    
    // Show loading state
    button.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Creating...';
    button.disabled = true;
    
    try {
        const hash = await syncManager.createNewHash();
        if (hash) {
            button.innerHTML = '<i class="bi bi-check-lg me-2"></i>Created!';
            button.classList.add('btn-success');
            button.classList.remove('btn-primary');
            
            setTimeout(() => {
                closeHashModal();
                updateSyncUI();
            }, 1000);
        }
    } catch (error) {
        button.innerHTML = '<i class="bi bi-x-lg me-2"></i>Error';
        button.classList.add('btn-danger');
        button.classList.remove('btn-primary');
        
        setTimeout(() => {
            button.innerHTML = originalContent;
            button.classList.remove('btn-danger');
            button.classList.add('btn-primary');
            button.disabled = false;
        }, 2000);
    }
}

async function createNewHashWithWarning() {
    showConfirmModal(
        'Create New Sync ID',
        'Creating a new Sync ID will start a fresh sync workspace.<br><br>Your current data will remain under the existing ID.<br><br>Continue?',
        async function() {
            const hash = await syncManager.createNewHash();
            if (hash) {
                closeHashModal();
                updateSyncUI();
            }
        },
        'Create New ID',
        'btn-warning'
    );
}

async function activateHash() {
    const input = document.getElementById('activateHashInput');
    const hash = input.value.trim();
    const button = event.target;
    const originalContent = button.innerHTML;
    
    if (!hash) {
        input.classList.add('is-invalid');
        setTimeout(() => input.classList.remove('is-invalid'), 3000);
        return;
    }
    
    // Show loading state
    button.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Activating...';
    button.disabled = true;
    input.disabled = true;
    
    try {
        const success = await syncManager.activateExistingHash(hash);
        if (success) {
            button.innerHTML = '<i class="bi bi-check-lg me-2"></i>Activated!';
            button.classList.add('btn-success');
            button.classList.remove('btn-warning');
            
            setTimeout(() => {
                closeHashModal();
                updateSyncUI();
            }, 1000);
        }
    } catch (error) {
        button.innerHTML = '<i class="bi bi-x-lg me-2"></i>Error';
        button.classList.add('btn-danger');
        button.classList.remove('btn-warning');
        input.classList.add('is-invalid');
        
        setTimeout(() => {
            button.innerHTML = originalContent;
            button.classList.remove('btn-danger');
            button.classList.add('btn-warning');
            button.disabled = false;
            input.disabled = false;
            input.classList.remove('is-invalid');
        }, 2000);
    }
}

async function switchHash() {
    const input = document.getElementById('switchHashInput');
    const hash = input.value.trim();
    
    if (!hash) {
        syncManager.showSyncStatus('Please enter a Sync ID', 'warning');
        return;
    }
    
    const success = await syncManager.activateExistingHash(hash);
    if (success) {
        closeHashModal();
        updateSyncUI();
    }
}

// Sync functionality
async function handleSync() {
    if (!syncManager.hasHash()) {
        openHashModal();
        return;
    }
    
    const syncButton = document.getElementById('syncButton');
    const syncIcon = syncButton.querySelector('i');
    const syncText = syncButton.querySelector('span');
    
    // Show loading state
    syncButton.classList.add('syncing');
    syncButton.disabled = true;
    syncIcon.className = 'bi bi-arrow-clockwise';
    syncText.textContent = 'Syncing...';
    
    try {
        await syncManager.syncData(true);
        
        // Show success state briefly
        syncButton.classList.remove('syncing');
        syncButton.classList.add('success');
        syncIcon.className = 'bi bi-check-lg';
        syncText.textContent = 'Synced!';
        
        setTimeout(() => {
            // Reset to normal state
            syncButton.classList.remove('success');
            syncButton.disabled = false;
            syncIcon.className = 'bi bi-arrow-repeat';
            syncText.textContent = 'Sync Now';
            updateSyncUI();
        }, 1500);
        
    } catch (error) {
        // Show error state
        syncButton.classList.remove('syncing');
        syncButton.classList.add('error');
        syncButton.disabled = false;
        syncIcon.className = 'bi bi-exclamation-triangle-fill';
        syncText.textContent = 'Error';
        
        setTimeout(() => {
            syncButton.classList.remove('error');
            syncIcon.className = 'bi bi-arrow-repeat';
            syncText.textContent = 'Sync Now';
        }, 2000);
    }
}

// Update sync UI based on hash status
function updateSyncUI() {
    const syncButton = document.getElementById('syncButton');
    const hashButton = document.querySelector('.hash-button');
    const hashButtonText = document.getElementById('hashButtonText');
    const syncInfo = document.getElementById('syncInfo');
    const currentHashDisplay = document.getElementById('currentHashDisplay');
    const lastSyncTime = document.getElementById('lastSyncTime');
    
    if (syncManager.hasHash()) {
        syncButton.disabled = false;
        hashButton.classList.add('has-id');
        hashButtonText.textContent = 'Sync Ready';
        syncInfo.style.display = 'flex';
        currentHashDisplay.textContent = syncManager.getHash().toUpperCase();
        
        if (syncManager.lastSyncTimestamp) {
            lastSyncTime.textContent = syncManager.formatLastSyncTime();
        } else {
            lastSyncTime.textContent = 'Never';
        }
    } else {
        syncButton.disabled = true;
        hashButton.classList.remove('has-id');
        hashButtonText.textContent = 'Setup Sync';
        syncInfo.style.display = 'none';
    }
}

// Update sync info display
function updateSyncInfo() {
    updateSyncUI();
}

// Initialize the app
initializeWorkspace();
buildDashboardAssigneeFilter();
renderBoards();
updateSyncUI();

// Update sync info every minute
setInterval(updateSyncInfo, 60000);

// Auto-sync on page load if hash exists (without UI)
if (syncManager.hasHash()) {
    syncManager.syncData(false);
}

// Initialize tooltips and handle modal events
document.addEventListener('DOMContentLoaded', function() {
    // Initialize tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
});

// Wire up dashboard assignee filter changes
document.getElementById('dashboardAssigneeFilter')?.addEventListener('change', function() {
    let selected = Array.from(this.selectedOptions).map(o => o.value);
    if (selected.includes('ALL')) {
        selected = ['ALL'];
        for (const opt of this.options) opt.selected = (opt.value === 'ALL');
    }
    dashboardAssigneeFilter = selected;
    renderBoards();
});

// Rebuild filter when boards/cards change (simple hook: when we render/save/import)
const _saveBoards = saveBoards;
saveBoards = function() {
    _saveBoards.call(this);
    buildDashboardAssigneeFilter();
};

// Bootstrap handles dropdown open/close behavior for filters