// Global variables
let cards = [];
let currentCardId = null;
let currentColumn = null;
let draggedCard = null;
let currentBoardId = null;
let selectedBackgroundColor = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'; // Default purple
const COLUMNS = ['backlog', 'todo', 'doing', 'done'];
const IS_TOUCH = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;

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

// Initialize board
function initializeBoard() {
    // Get board ID from localStorage (set by dashboard)
    currentBoardId = localStorage.getItem('currentBoardId');
    
    if (!currentBoardId) {
        // If no board ID, redirect to dashboard or show error
        document.body.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; color: white; text-align: center;">
                <h2>No Board Selected</h2>
                <p>Please select a board from the dashboard.</p>
                <button onclick="window.location.href='../boards/boards.html'" style="margin-top: 20px; padding: 10px 20px; background: rgba(255,255,255,0.2); border: none; color: white; border-radius: 5px; cursor: pointer;">Go to Dashboard</button>
            </div>
        `;
        return;
    }

    // Load board data
    const boards = JSON.parse(localStorage.getItem('kanbanBoards')) || [];
    const currentBoard = boards.find(board => board.id === currentBoardId);
    
    if (currentBoard) {
        document.getElementById('boardTitle').textContent = currentBoard.title;
        document.title = `${currentBoard.title} - Kanban Board`;
        
        // Apply saved background color
        if (currentBoard.backgroundColor) {
            document.body.style.background = currentBoard.backgroundColor;
        }
    }

    // Load cards for this specific board
    cards = JSON.parse(localStorage.getItem(`kanbanCards_${currentBoardId}`)) || [];
    renderCards();
    renderColorPicker();
}

// Go back to boards dashboard
function goBackToBoards() {
    localStorage.removeItem('currentBoardId');
    window.location.href = '../boards/boards.html';
}

// Generate unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Save cards to localStorage
function saveCards() {
    if (currentBoardId) {
        localStorage.setItem(`kanbanCards_${currentBoardId}`, JSON.stringify(cards));
    }
}

// Save board background color
function saveBoardColor(backgroundColor) {
    const boards = JSON.parse(localStorage.getItem('kanbanBoards')) || [];
    const boardIndex = boards.findIndex(board => board.id === currentBoardId);
    
    if (boardIndex !== -1) {
        boards[boardIndex].backgroundColor = backgroundColor;
        boards[boardIndex].updatedAt = new Date().toISOString();
        localStorage.setItem('kanbanBoards', JSON.stringify(boards));
    }
}

// Format date
function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Truncate text to specified length
function truncateText(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

// Create card HTML
function createCardHTML(card) {
    const truncatedDescription = truncateText(card.description || '', 150);
    const moveButtons = IS_TOUCH
        ? `
            <button class="card-action-btn" onclick="moveCardLeft('${card.id}')" title="Move left" aria-label="Move left">
                <i class="bi bi-arrow-left-circle"></i>
            </button>
            <button class="card-action-btn" onclick="moveCardRight('${card.id}')" title="Move right" aria-label="Move right">
                <i class="bi bi-arrow-right-circle"></i>
            </button>
          `
        : '';
    
    return `
        <div class="card" draggable="true" data-card-id="${card.id}">
            <div class="card-content">
                <div class="card-title">${card.title}</div>
                <div class="card-description">${truncatedDescription}</div>
            </div>
            <div class="card-actions">
                ${moveButtons}
                <button class="card-action-btn" onclick="editCard('${card.id}')" title="Edit" aria-label="Edit">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="card-action-btn" onclick="deleteCardConfirm('${card.id}')" title="Delete" aria-label="Delete">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
            <div class="card-timestamp">${formatDate(card.createdAt)}</div>
        </div>
    `;
}

// Render all cards
function renderCards() {
    COLUMNS.forEach(column => {
        const container = document.getElementById(`${column}-cards`);
        const columnCards = cards.filter(card => card.column === column);
        container.innerHTML = columnCards.map(createCardHTML).join('');
    });

    // Add drag event listeners to all cards
    document.querySelectorAll('.card').forEach(card => {
        card.addEventListener('dragstart', handleDragStart);
        card.addEventListener('dragend', handleDragEnd);
    });

    // Add mass delete buttons
    updateMassDeleteButtons();
}

// Show or don't show buttons
function updateMassDeleteButtons() {
    COLUMNS.forEach(column => {
        const columnCards = cards.filter(card => card.column === column);
        const massDeleteBtn = document.getElementById(`${column}-mass-delete`);
        
        if (columnCards.length > 0) {
            massDeleteBtn.style.display = 'block';
        } else {
            massDeleteBtn.style.display = 'none';
        }
    });
}

// Move card helpers (mobile-friendly)
function getColumnIndex(column) {
    return COLUMNS.indexOf(column);
}

function moveCard(cardId, direction) {
    const idx = cards.findIndex(c => c.id === cardId);
    if (idx === -1) return;
    const current = cards[idx];
    const colIndex = getColumnIndex(current.column);
    const newIndex = colIndex + direction;
    if (newIndex < 0 || newIndex >= COLUMNS.length) return;
    current.column = COLUMNS[newIndex];
    current.updatedAt = new Date().toISOString();
    saveCards();
    renderCards();
}

function moveCardLeft(cardId) { moveCard(cardId, -1); }
function moveCardRight(cardId) { moveCard(cardId, 1); }

// Mass delete all cards in a specific column
function massDeleteCards(column) {
    const columnCards = cards.filter(card => card.column === column);
    
    if (columnCards.length === 0) return;
    
    const confirmMessage = `Are you sure you want to delete ALL ${columnCards.length} card(s) in the ${column.toUpperCase()} column?\n\nThis action cannot be undone.`;
    
    if (confirm(confirmMessage)) {
        cards = cards.filter(card => card.column !== column);
        saveCards();
        renderCards();
    }
}

// Render color picker
function renderColorPicker() {
    const colorPicker = document.getElementById('colorPicker');
    
    colorPicker.innerHTML = colorThemes.map((theme, index) => `
        <div class="color-option ${theme.gradient === selectedBackgroundColor ? 'selected' : ''}" 
             style="background: ${theme.gradient}" 
             onclick="selectColor('${theme.gradient}')"
             title="${theme.name}">
        </div>
    `).join('');
}

// Select color theme
function selectColor(gradient) {
    selectedBackgroundColor = gradient;
    
    // Update background immediately
    document.body.style.background = gradient;
    
    // Update color picker UI
    document.querySelectorAll('.color-option').forEach(option => {
        option.classList.remove('selected');
    });
    event.target.classList.add('selected');
}

// Settings modal functions
function openSettingsModal() {
    // Load current board data
    const boards = JSON.parse(localStorage.getItem('kanbanBoards')) || [];
    const currentBoard = boards.find(board => board.id === currentBoardId);
    
    if (currentBoard) {
        document.getElementById('settingsBoardTitle').value = currentBoard.title;
        document.getElementById('settingsBoardDescription').value = currentBoard.description || '';
        selectedBackgroundColor = currentBoard.backgroundColor || colorThemes[0].gradient;
        renderColorPicker();
    }
    
    const modal = new bootstrap.Modal(document.getElementById('settingsModal'));
    modal.show();
}

function closeSettingsModal() {
    const modal = bootstrap.Modal.getInstance(document.getElementById('settingsModal'));
    if (modal) {
        modal.hide();
    }
}

function deleteBoardFromSettings() {
    if (confirm('Are you sure you want to delete this board?\n\nThis will also delete all cards in this board. This action cannot be undone.')) {
        // Remove board
        const boards = JSON.parse(localStorage.getItem('kanbanBoards')) || [];
        const updatedBoards = boards.filter(b => b.id !== currentBoardId);
        localStorage.setItem('kanbanBoards', JSON.stringify(updatedBoards));
        
        // Remove board's cards
        localStorage.removeItem(`kanbanCards_${currentBoardId}`);
        
        // Navigate back to dashboard
        localStorage.removeItem('currentBoardId');
        window.location.href = '../boards/boards.html';
    }
}

// Card modal functions
function openAddCardModal(column) {
    currentColumn = column;
    currentCardId = null;
    document.getElementById('modalTitle').textContent = 'Add New Card';
    document.getElementById('cardTitle').value = '';
    document.getElementById('cardDescription').value = '';
    document.getElementById('deleteBtn').style.display = 'none';
    document.getElementById('saveBtn').textContent = 'Save Card';
    
    const modal = new bootstrap.Modal(document.getElementById('cardModal'));
    modal.show();
}

function editCard(cardId) {
    const card = cards.find(c => c.id === cardId);
    if (!card) return;

    currentCardId = cardId;
    currentColumn = card.column;
    document.getElementById('modalTitle').textContent = 'Edit Card';
    document.getElementById('cardTitle').value = card.title;
    document.getElementById('cardDescription').value = card.description || '';
    document.getElementById('deleteBtn').style.display = 'inline-block';
    document.getElementById('saveBtn').textContent = 'Update Card';
    
    const modal = new bootstrap.Modal(document.getElementById('cardModal'));
    modal.show();
}

function closeModal() {
    const modal = bootstrap.Modal.getInstance(document.getElementById('cardModal'));
    if (modal) {
        modal.hide();
    }
    currentCardId = null;
    currentColumn = null;
}

function deleteCard() {
    if (currentCardId) {
        cards = cards.filter(card => card.id !== currentCardId);
        saveCards();
        renderCards();
        closeModal();
    }
}

function deleteCardConfirm(cardId) {
    if (confirm('Are you sure you want to delete this card?')) {
        cards = cards.filter(card => card.id !== cardId);
        saveCards();
        renderCards();
    }
}

// Form submission for cards
document.getElementById('cardForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const title = document.getElementById('cardTitle').value.trim();
    const description = document.getElementById('cardDescription').value.trim();
    
    if (!title) return;

    if (currentCardId) {
        // Update existing card
        const cardIndex = cards.findIndex(card => card.id === currentCardId);
        if (cardIndex !== -1) {
            cards[cardIndex].title = title;
            cards[cardIndex].description = description;
            cards[cardIndex].updatedAt = new Date().toISOString();
        }
    } else {
        // Create new card
        const newCard = {
            id: generateId(),
            title: title,
            description: description,
            column: currentColumn,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        cards.push(newCard);
    }

    saveCards();
    renderCards();
    closeModal();
});

// Form submission for board settings
document.getElementById('boardSettingsForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const title = document.getElementById('settingsBoardTitle').value.trim();
    const description = document.getElementById('settingsBoardDescription').value.trim();
    
    if (!title) return;

    // Update board data
    const boards = JSON.parse(localStorage.getItem('kanbanBoards')) || [];
    const boardIndex = boards.findIndex(board => board.id === currentBoardId);
    
    if (boardIndex !== -1) {
        boards[boardIndex].title = title;
        boards[boardIndex].description = description;
        boards[boardIndex].backgroundColor = selectedBackgroundColor;
        boards[boardIndex].updatedAt = new Date().toISOString();
        localStorage.setItem('kanbanBoards', JSON.stringify(boards));
        
        // Update page title and board title
        document.getElementById('boardTitle').textContent = title;
        document.title = `${title} - Kanban Board`;
    }

    closeSettingsModal();
});

// Drag and drop functionality
function handleDragStart(e) {
    draggedCard = this;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.outerHTML);
}

function handleDragEnd(e) {
    this.classList.remove('dragging');
    draggedCard = null;
}

// Add drag and drop listeners to columns (desktop primarily)
document.querySelectorAll('.column').forEach(column => {
    column.addEventListener('dragover', handleDragOver);
    column.addEventListener('drop', handleDrop);
    column.addEventListener('dragenter', handleDragEnter);
    column.addEventListener('dragleave', handleDragLeave);
});

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
}

function handleDragEnter(e) {
    e.preventDefault();
    this.classList.add('drag-over');
}

function handleDragLeave(e) {
    if (!this.contains(e.relatedTarget)) {
        this.classList.remove('drag-over');
    }
}

function handleDrop(e) {
    e.preventDefault();
    this.classList.remove('drag-over');
    
    if (!draggedCard) return;

    const newColumn = this.dataset.column;
    const cardId = draggedCard.dataset.cardId;
    
    // Update card column
    const cardIndex = cards.findIndex(card => card.id === cardId);
    if (cardIndex !== -1) {
        cards[cardIndex].column = newColumn;
        cards[cardIndex].updatedAt = new Date().toISOString();
        saveCards();
        renderCards();
    }
}

// Bootstrap modals handle backdrop clicks and Escape key automatically

// Hash Management Modal (same as in boards.html)
function openHashModal() {
    const modalElement = document.getElementById('hashModal');
    const content = document.getElementById('hashModalContent');
    
    if (syncManager.hasHash()) {
        // User has a hash
        content.innerHTML = `
            <div style="text-align: center; margin-bottom: 20px;">
                <h3 style="color: #10b981; margin-bottom: 10px;">Active Sync ID</h3>
                <div style="display: flex; align-items: center; justify-content: center; gap: 10px;">
                    <span style="font-size: 1.5rem; font-weight: bold; color: #333; letter-spacing: 2px;">
                        ${syncManager.getHash().toUpperCase()}
                    </span>
                    <button onclick="copyHashToClipboard()" class="btn btn-secondary" style="padding: 5px 10px;">
                        📋 Copy
                    </button>
                </div>
                <p style="color: #666; margin-top: 10px; font-size: 0.9rem;">
                    Use this ID on other devices to sync your boards
                </p>
            </div>
            
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
            
            <div class="form-group">
                <label><strong>Switch to Different Sync ID</strong></label>
                <p style="color: #666; font-size: 0.9rem; margin-bottom: 10px;">
                    Warning: This will replace all your local data
                </p>
                <input type="text" id="switchHashInput" placeholder="Enter existing Sync ID" 
                       style="text-transform: uppercase;" maxlength="20">
            </div>
            
            <div class="kb-modal-actions">
                <button class="btn btn-secondary" onclick="closeHashModal()">Close</button>
                <button class="btn btn-danger" onclick="createNewHashWithWarning()">
                    Create New ID
                </button>
                <button class="btn btn-primary" onclick="switchHash()">
                    Switch ID
                </button>
            </div>
        `;
    } else {
        // User has no hash
        content.innerHTML = `
            <div style="text-align: center; margin-bottom: 20px;">
                <h3 style="color: #666;">No Sync ID Set</h3>
                <p style="color: #666; margin-top: 10px;">
                    Create a new Sync ID or enter an existing one to enable cloud sync
                </p>
            </div>
            
            <div style="display: flex; flex-direction: column; gap: 20px;">
                <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; text-align: center;">
                    <h4 style="color: #0369a1; margin-bottom: 10px;">New User?</h4>
                    <p style="color: #666; margin-bottom: 15px; font-size: 0.9rem;">
                        Create a new Sync ID to start syncing your boards
                    </p>
                    <button class="btn btn-primary" onclick="createNewHash()" style="width: 100%;">
                        🆕 Create New Sync ID
                    </button>
                </div>
                
                <div style="background: #fef3c7; padding: 20px; border-radius: 8px;">
                    <h4 style="color: #92400e; margin-bottom: 10px;">Have an existing ID?</h4>
                    <p style="color: #666; margin-bottom: 10px; font-size: 0.9rem;">
                        Enter your Sync ID to download your boards from the cloud
                    </p>
                    <input type="text" id="activateHashInput" placeholder="Enter your Sync ID" 
                           style="text-transform: uppercase; margin-bottom: 10px;" maxlength="20">
                    <button class="btn btn-primary" onclick="activateHash()" style="width: 100%;">
                        🔄 Activate Existing ID
                    </button>
                </div>
            </div>
            
            <div class="kb-modal-actions" style="margin-top: 20px;">
                <button class="btn btn-secondary" onclick="closeHashModal()" style="width: 100%;">Cancel</button>
            </div>
        `;
    }
    
    const modal = new bootstrap.Modal(document.getElementById('hashModal'));
    modal.show();
}

function closeHashModal() {
    const modal = bootstrap.Modal.getInstance(document.getElementById('hashModal'));
    if (modal) {
        modal.hide();
    }
}

function copyHashToClipboard() {
    const hash = syncManager.getHash();
    navigator.clipboard.writeText(hash).then(() => {
        syncManager.showSyncStatus('Sync ID copied to clipboard', 'success');
    });
}

async function createNewHash() {
    const hash = await syncManager.createNewHash();
    if (hash) {
        closeHashModal();
        updateSyncUI();
    }
}

async function createNewHashWithWarning() {
    if (confirm('Creating a new Sync ID will start a fresh sync workspace.\n\nYour current data will remain under the existing ID.\n\nContinue?')) {
        const hash = await syncManager.createNewHash();
        if (hash) {
            closeHashModal();
            updateSyncUI();
        }
    }
}

async function activateHash() {
    const input = document.getElementById('activateHashInput');
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
function handleSync() {
    if (!syncManager.hasHash()) {
        openHashModal();
        return;
    }
    syncManager.syncData(true);
}

// Update sync UI based on hash status
function updateSyncUI() {
    const syncButton = document.getElementById('syncButton');
    const hashButtonText = document.getElementById('hashButtonText');
    
    if (syncManager.hasHash()) {
        syncButton.disabled = false;
        hashButtonText.textContent = syncManager.getHash().toUpperCase().substring(0, 6);
    } else {
        syncButton.disabled = true;
        hashButtonText.textContent = 'Setup';
    }
}

// Initialize the app
initializeBoard();
updateSyncUI();

// Auto-sync on page load if hash exists (without UI)
if (syncManager.hasHash()) {
    syncManager.syncData(false);
}

// Bootstrap modals handle backdrop clicks automatically