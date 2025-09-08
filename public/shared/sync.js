// Sync Manager for Kanban Todo App with Multi-User Support
class SyncManager {
    constructor() {
        // Dynamic server URL - uses empty string for production (Vercel), localhost for development
        this.serverUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
            ? 'http://localhost:3001'
            : '';  // Empty string for production - URLs will be /api/sync/...
        this.isOnline = false;
        this.isSyncing = false;
        this.userHash = localStorage.getItem('userSyncHash') || null;
        this.lastSyncTimestamp = parseInt(localStorage.getItem('lastSyncTimestamp') || '0');
    }

    // Merge helper: arrays of objects with id and updatedAt (string ISO or number)
    mergeArrayById(localArr = [], cloudArr = []) {
        const byId = new Map();
        const addOrUpdate = (item, source) => {
            if (!item || !item.id) return;
            const existing = byId.get(item.id);
            const ts = this.parseUpdateTs(item.updatedAt);
            if (!existing) {
                byId.set(item.id, { item, ts, source });
                return;
            }
            // Keep the most recently updated
            if (ts >= existing.ts) {
                byId.set(item.id, { item, ts, source });
            }
        };
        localArr.forEach(i => addOrUpdate(i, 'local'));
        cloudArr.forEach(i => addOrUpdate(i, 'cloud'));
        return Array.from(byId.values()).map(v => v.item);
    }

    parseUpdateTs(value) {
        if (!value) return 0;
        if (typeof value === 'number') return value;
        const t = Date.parse(value);
        return isNaN(t) ? 0 : t;
    }

    // Merge cards map { boardId: card[] }
    mergeCardsMap(localCards = {}, cloudCards = {}) {
        const merged = {};
        const boardIds = new Set([...Object.keys(localCards), ...Object.keys(cloudCards)]);
        boardIds.forEach(id => {
            merged[id] = this.mergeArrayById(localCards[id] || [], cloudCards[id] || []);
        });
        return merged;
    }

    // Merge workspace settings (prefer newer updatedAt, fallback to local when equal)
    mergeWorkspaceSettings(localWs, cloudWs) {
        if (!localWs) return cloudWs || null;
        if (!cloudWs) return localWs || null;
        const lts = this.parseUpdateTs(localWs.updatedAt);
        const cts = this.parseUpdateTs(cloudWs.updatedAt);
        return cts > lts ? cloudWs : localWs;
    }

    // Check if user has a hash
    hasHash() {
        return this.userHash !== null && this.userHash !== '';
    }

    // Get current hash
    getHash() {
        return this.userHash;
    }

    // Generate a new random hash
    generateHash() {
        const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let hash = '';
        for (let i = 0; i < 8; i++) {
            hash += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return hash;
    }

    // Validate hash format
    validateHash(hash) {
        if (!hash || typeof hash !== 'string') {
            return false;
        }
        const cleaned = hash.toLowerCase().replace(/[^a-z0-9]/g, '');
        return cleaned.length >= 6 && cleaned.length <= 20;
    }

    // Set the user's hash
    setHash(hash) {
        if (!this.validateHash(hash)) {
            throw new Error('Invalid hash format. Use 6-20 alphanumeric characters.');
        }
        this.userHash = hash.toLowerCase().replace(/[^a-z0-9]/g, '');
        localStorage.setItem('userSyncHash', this.userHash);
        return this.userHash;
    }

    // Clear the user's hash
    clearHash() {
        this.userHash = null;
        localStorage.removeItem('userSyncHash');
        localStorage.removeItem('lastSyncTimestamp');
        this.lastSyncTimestamp = 0;
    }

    // Check if a hash exists on the server
    async checkHashExists(hash) {
        try {
            const url = this.serverUrl 
                ? `${this.serverUrl}/api/sync/check/${hash}`
                : `/api/sync/check/${hash}`;
            const response = await fetch(url, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            
            if (response.ok) {
                const data = await response.json();
                return data.exists;
            }
        } catch (error) {
            console.error('Failed to check hash:', error);
        }
        return false;
    }

    // Create a new hash with current data
    async createNewHash() {
        const newHash = this.generateHash();
        this.setHash(newHash);
        
        // Upload current data to the new hash
        const localData = this.getLocalData();
        const success = await this.uploadToCloud(localData);
        
        if (success) {
            this.showSyncStatus(`Created new Sync ID: ${newHash.toUpperCase()}`, 'success');
            return newHash;
        } else {
            // Rollback on failure
            this.clearHash();
            this.showSyncStatus('Failed to create new Sync ID', 'error');
            return null;
        }
    }

    // Activate an existing hash (download and replace local data)
    async activateExistingHash(hash, skipConfirm = false) {
        if (!this.validateHash(hash)) {
            this.showSyncStatus('Invalid Sync ID format', 'error');
            return false;
        }

        const cleanHash = hash.toLowerCase().replace(/[^a-z0-9]/g, '');
        
        // Check if hash exists on server
        const checkResult = await this.checkHashExists(cleanHash);
        
        // In demo mode, we always proceed since data doesn't persist
        // The checkHashExists now returns true in demo mode to prevent errors
        if (!checkResult) {
            this.showSyncStatus('Sync ID not found', 'error');
            return false;
        }

        if (!skipConfirm) {
            const confirmed = confirm(
                'Activating this Sync ID will REPLACE all your local data with data from the cloud.\n\n' +
                'Your current boards and cards will be lost unless they are already synced.\n\n' +
                'Continue?'
            );
            if (!confirmed) {
                return false;
            }
        }

        // Set the hash
        this.setHash(cleanHash);
        
        // Download and replace local data
        const cloudData = await this.getCloudData();
        if (cloudData && cloudData.timestamp > 0) {
            this.updateLocalData(cloudData);
            this.lastSyncTimestamp = Date.now();
            localStorage.setItem('lastSyncTimestamp', this.lastSyncTimestamp.toString());
            this.showSyncStatus(`Activated Sync ID: ${cleanHash.toUpperCase()}`, 'success');
            
            // Reload to show new data
            setTimeout(() => window.location.reload(), 1500);
            return true;
        } else {
            // No data found, but hash is valid - initialize empty
            this.showSyncStatus(`Activated empty Sync ID: ${cleanHash.toUpperCase()}`, 'success');
            return true;
        }
    }

    // Check server connectivity
    async checkServerConnection() {
        try {
            const url = this.serverUrl 
                ? `${this.serverUrl}/api/sync/status`
                : '/api/sync/status';
            const response = await fetch(url, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            
            if (response.ok) {
                const data = await response.json();
                this.isOnline = data.status === 'online';
                return this.isOnline;
            }
        } catch (error) {
            console.log('Server offline or unreachable');
            this.isOnline = false;
        }
        return false;
    }

    // Gather all local data with timestamp
    getLocalData() {
        const timestamp = Date.now();
        
        // Get all localStorage data
        const workspaceSettings = JSON.parse(localStorage.getItem('workspaceSettings') || 'null');
        const boards = JSON.parse(localStorage.getItem('kanbanBoards') || '[]');
        const cards = {};
        
        // Collect cards for each board
        boards.forEach(board => {
            const boardCards = JSON.parse(localStorage.getItem(`kanbanCards_${board.id}`) || '[]');
            cards[board.id] = boardCards;
        });
        
        // Add timestamp to track last update
        const localTimestamp = parseInt(localStorage.getItem('dataTimestamp') || '0');
        
        return {
            timestamp: localTimestamp || timestamp,
            data: {
                workspaceSettings,
                boards,
                cards
            }
        };
    }

    // Fetch cloud data from server
    async getCloudData() {
        if (!this.hasHash()) {
            console.error('No hash set for cloud sync');
            return null;
        }

        try {
            const url = this.serverUrl 
                ? `${this.serverUrl}/api/sync/data/${this.userHash}`
                : `/api/sync/data/${this.userHash}`;
            const response = await fetch(url, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            
            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.error('Failed to fetch cloud data:', error);
        }
        return null;
    }

    // Update local storage with cloud data
    updateLocalData(cloudData) {
        const { workspaceSettings, boards, cards } = cloudData.data;
        
        // Clear ALL existing data first
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.startsWith('kanban') || key === 'workspaceSettings')) {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
        
        // Update workspace settings
        if (workspaceSettings) {
            localStorage.setItem('workspaceSettings', JSON.stringify(workspaceSettings));
        }
        
        // Update boards
        if (boards) {
            localStorage.setItem('kanbanBoards', JSON.stringify(boards));
        }
        
        // Add new card data
        if (cards) {
            Object.keys(cards).forEach(boardId => {
                if (cards[boardId]) {
                    localStorage.setItem(`kanbanCards_${boardId}`, JSON.stringify(cards[boardId]));
                }
            });
        }
        
        // Update timestamp
        localStorage.setItem('dataTimestamp', cloudData.timestamp.toString());
        this.updateDataTimestamp();
    }

    // Upload local data to cloud
    async uploadToCloud(localData) {
        if (!this.hasHash()) {
            console.error('No hash set for cloud sync');
            return false;
        }

        try {
            const url = this.serverUrl 
                ? `${this.serverUrl}/api/sync/data/${this.userHash}`
                : `/api/sync/data/${this.userHash}`;
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(localData)
            });
            
            if (response.ok) {
                const result = await response.json();
                
                // Show warning if in demo mode
                if (result.mode === 'demo' && result.warning) {
                    console.warn('Demo mode:', result.warning);
                    // Show abbreviated warning to user
                    this.showSyncStatus('Demo mode - Set up Vercel KV for persistence', 'warning');
                }
                
                return result.success;
            }
        } catch (error) {
            console.error('Failed to upload to cloud:', error);
        }
        return false;
    }

    // Update data timestamp whenever data changes
    updateDataTimestamp() {
        const timestamp = Date.now();
        localStorage.setItem('dataTimestamp', timestamp.toString());
        return timestamp;
    }

    // Main sync function
    async syncData(showUI = true) {
        // Check if user has a hash
        if (!this.hasHash()) {
            if (showUI) {
                this.showSyncStatus('No Sync ID set. Create or activate one first.', 'warning');
            }
            return false;
        }

        if (this.isSyncing) {
            if (showUI) this.showSyncStatus('Already syncing...', 'warning');
            return;
        }

        this.isSyncing = true;
        if (showUI) this.showSyncStatus('Checking connection...', 'syncing');

        // Check server connection
        const isConnected = await this.checkServerConnection();
        if (!isConnected) {
            this.isSyncing = false;
            if (showUI) this.showSyncStatus('Server offline', 'error');
            return false;
        }

        if (showUI) this.showSyncStatus(`Syncing with ID: ${this.userHash.toUpperCase()}`, 'syncing');

        try {
            // Get local and cloud data
            const localData = this.getLocalData();
            const cloudData = await this.getCloudData();

            if (!cloudData || cloudData.timestamp === 0) {
                // No cloud data, upload local
                const success = await this.uploadToCloud(localData);
                this.isSyncing = false;
                if (success) {
                    this.lastSyncTimestamp = Date.now();
                    localStorage.setItem('lastSyncTimestamp', this.lastSyncTimestamp.toString());
                    if (showUI) this.showSyncStatus('Synced to cloud', 'success');
                    return true;
                } else {
                    if (showUI) this.showSyncStatus('Sync failed', 'error');
                    return false;
                }
            }

            // Merge per-entity for multi-user collaboration
            const merged = {
                timestamp: Date.now(),
                data: {
                    workspaceSettings: this.mergeWorkspaceSettings(localData.data.workspaceSettings, cloudData.data.workspaceSettings),
                    boards: this.mergeArrayById(localData.data.boards, cloudData.data.boards),
                    cards: this.mergeCardsMap(localData.data.cards, cloudData.data.cards)
                }
            };

            // If merged equals cloud, just update local; otherwise upload merged
            const uploadMerged = true; // keep simple and authoritative
            if (uploadMerged) {
                const success = await this.uploadToCloud(merged);
                if (!success) {
                    this.isSyncing = false;
                    if (showUI) this.showSyncStatus('Merge upload failed', 'error');
                    return false;
                }
            }

            // Update local to merged
            this.updateLocalData(merged);
            this.lastSyncTimestamp = Date.now();
            localStorage.setItem('lastSyncTimestamp', this.lastSyncTimestamp.toString());
            if (showUI) this.showSyncStatus('Merged changes', 'success');

            this.isSyncing = false;
            return true;
        } catch (error) {
            console.error('Sync error:', error);
            this.isSyncing = false;
            if (showUI) this.showSyncStatus('Sync error', 'error');
            return false;
        }
    }

    // Show sync status UI
    showSyncStatus(message, type) {
        // Remove existing status
        const existingStatus = document.querySelector('.sync-status-popup');
        if (existingStatus) {
            existingStatus.remove();
        }

        // Create status popup
        const statusDiv = document.createElement('div');
        statusDiv.className = 'sync-status-popup';
        statusDiv.innerHTML = `
            <div class="sync-status-content ${type}">
                ${this.getStatusIcon(type)}
                <span>${message}</span>
            </div>
        `;

        // Add styles if not already present
        if (!document.querySelector('#sync-status-styles')) {
            const styles = document.createElement('style');
            styles.id = 'sync-status-styles';
            styles.innerHTML = `
                .sync-status-popup {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    z-index: 10000;
                    animation: slideIn 0.3s ease;
                }
                
                .sync-status-content {
                    background: white;
                    padding: 12px 20px;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 14px;
                    font-weight: 500;
                }
                
                .sync-status-content.success {
                    background: #10b981;
                    color: white;
                }
                
                .sync-status-content.error {
                    background: #ef4444;
                    color: white;
                }
                
                .sync-status-content.warning {
                    background: #f59e0b;
                    color: white;
                }
                
                .sync-status-content.syncing {
                    background: #3b82f6;
                    color: white;
                }
                
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                
                .sync-icon-spinning {
                    animation: spin 1s linear infinite;
                }
            `;
            document.head.appendChild(styles);
        }

        document.body.appendChild(statusDiv);

        // Auto remove after 3 seconds (except for syncing status)
        if (type !== 'syncing') {
            setTimeout(() => {
                statusDiv.remove();
            }, 3000);
        }
    }

    // Get status icon based on type
    getStatusIcon(type) {
        switch(type) {
            case 'success':
                return '✅';
            case 'error':
                return '❌';
            case 'warning':
                return '⚠️';
            case 'syncing':
                return '<span class="sync-icon-spinning">🔄</span>';
            default:
                return '📱';
        }
    }

    // Format last sync time
    formatLastSyncTime() {
        if (!this.lastSyncTimestamp) {
            return 'Never synced';
        }
        
        const now = Date.now();
        const diff = now - this.lastSyncTimestamp;
        
        if (diff < 60000) {
            return 'Just now';
        } else if (diff < 3600000) {
            const minutes = Math.floor(diff / 60000);
            return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        } else if (diff < 86400000) {
            const hours = Math.floor(diff / 3600000);
            return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        } else {
            const days = Math.floor(diff / 86400000);
            return `${days} day${days > 1 ? 's' : ''} ago`;
        }
    }
}

// Create global sync manager instance
const syncManager = new SyncManager();

// Track data changes and update timestamp
function trackDataChange() {
    syncManager.updateDataTimestamp();
}

// Override localStorage.setItem to track changes
const originalSetItem = localStorage.setItem;
localStorage.setItem = function(key, value) {
    originalSetItem.apply(this, arguments);
    
    // Track changes to relevant keys (but not the hash or sync metadata)
    if ((key.startsWith('kanban') || key === 'workspaceSettings') && 
        key !== 'userSyncHash' && key !== 'lastSyncTimestamp' && key !== 'dataTimestamp') {
        trackDataChange();
    }
};