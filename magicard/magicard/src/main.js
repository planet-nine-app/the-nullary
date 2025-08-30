/**
 * MagiCard - Interactive SVG Card Stacks
 * Built on The Nullary ecosystem with Planet Nine integration
 */

// Global application state
let currentStack = null;
let currentCard = null;
let stacks = [];
let isEditMode = false;

// Initialize the application
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🪄 MagiCard initializing...');
    
    // ========================================
    // BDO Bridge for castSpell Integration
    // ========================================
    
    /**
     * Provides BDO card retrieval for castSpell.js
     * Handles message signing and BDO communication through Tauri backend
     */
    window.castSpellBridge = {
        async getCardFromBDO(bdoPubKey) {
            console.log(`🌉 MagiCard BDO Bridge: Fetching card ${bdoPubKey}`);
            
            try {
                // Check if Tauri is available
                if (!window.__TAURI__) {
                    throw new Error('Tauri API not available');
                }
                
                // Call Tauri backend for BDO card retrieval
                const response = await window.__TAURI__.core.invoke('get_card_from_bdo', {
                    bdoPubKey: bdoPubKey
                });
                
                console.log(`🌉 BDO Bridge response:`, response);
                
                if (response && response.success) {
                    // Extract data from nested structure - MagiCard backend returns response.card.data
                    const cardData = response.card?.data || response.data;
                    
                    if (!cardData) {
                        console.warn('⚠️ No card data found in response:', response);
                        return {
                            success: false,
                            error: 'Card data not found in BDO response'
                        };
                    }
                    
                    return {
                        success: true,
                        data: cardData
                    };
                } else {
                    return {
                        success: false,
                        error: response?.error || 'Failed to retrieve card from BDO'
                    };
                }
                
            } catch (error) {
                console.warn(`❌ BDO Bridge error:`, error);
                return {
                    success: false,
                    error: error.message || 'Bridge communication failed'
                };
            }
        }
    };
    
    console.log('🌉 BDO Bridge for castSpell registered');
    
    // ========================================
    // MagiCard Navigation Integration
    // ========================================
    
    /**
     * Listen for successful card navigation from castSpell and display the card in MagiCard
     */
    window.addEventListener('cardNavigationComplete', async (event) => {
        console.log('🃏 MagiCard received cardNavigationComplete event:', event.detail);
        
        const { bdoPubKey, cardData, navigationSource } = event.detail;
        
        if (cardData) {
            console.log('🃏 MagiCard displaying fetched card:', bdoPubKey);
            console.log('🔍 Navigation source:', navigationSource);
            
            try {
                // Display the card in MagiCard's preview area
                await displayFetchedCardInPreview(cardData, bdoPubKey, navigationSource);
                
            } catch (error) {
                console.warn('❌ MagiCard failed to display fetched card:', error);
            }
        }
    });
    
    /**
     * Listen for product lookup completion from lookup spell
     */
    window.addEventListener('productLookupComplete', async (event) => {
        console.log('🛍️ MagiCard received productLookupComplete event:', event.detail);
        
        const { product, selectionPath, productId, catalog } = event.detail;
        
        // This event is dispatched when lookup spell finds a product but doesn't navigate
        // (i.e., when no bdoPubKey is available for the product)
        console.log('🛍️ Product found without navigation:', {
            productName: product.name || product.product,
            productId: productId,
            selectionPath: selectionPath
        });
    });
    
    console.log('🃏 MagiCard cardNavigationComplete listener registered');
    
    try {
        // Initialize environment controls
        if (window.magicardEnv) {
            const config = getEnvironmentConfig();
            console.log(`🌐 Running in ${config.env} environment`);
        }
        
        // Hide loading screen after a brief delay
        setTimeout(() => {
            const loading = document.getElementById('loading');
            if (loading) {
                loading.style.opacity = '0';
                setTimeout(() => loading.style.display = 'none', 300);
            }
        }, 1000);
        
        // Override magicard spell handler after fount castSpell loads
        function initializeMagiCardSpellSystem() {
            if (window.castSpell) {
                console.log('🪄 Setting up MagiCard spell system integration...');
                
                // Store original fount castSpell function
                const originalCastSpell = window.castSpell;
                
                // Create MagiCard-enhanced castSpell function
                window.castSpell = async function(element) {
                    const spellType = element.getAttribute('spell');
                    const spellComponents = element.getAttribute('spell-components');
                    
                    console.log(`🪄 MagiCard enhanced spell cast: ${spellType}`);
                    
                    // Handle MagiCard-specific navigation
                    if (spellType === 'magicard' && spellComponents) {
                        await handleMagicardNavigation(element, spellComponents);
                    } 
                    // Handle MagiCard-specific transition spells
                    else if (spellType === 'fade-transition') {
                        handleFadeTransition(element);
                    } else if (spellType === 'slide-transition') {
                        handleSlideTransition(element);
                    } else if (spellType === 'master-transition') {
                        handleMasterTransition(element);
                    } else if (spellType === 'fadeTest' || spellType === 'slideTest' || spellType === 'finalTest') {
                        handleTransitionTest(spellType, element);
                    } else if (spellType === 'fade-demo' || spellType === 'slide-demo' || spellType === 'final-demo') {
                        handleTransitionDemo(spellType, element);
                    } else if (spellType.endsWith('-info')) {
                        handleInfoSpell(spellType, element);
                    }
                    // Fall back to fount's original castSpell for other spell types
                    else {
                        return originalCastSpell(element);
                    }
                };
                
                console.log('✅ MagiCard spell system integrated with fount castSpell');
            } else {
                console.warn('⚠️ fount castSpell not available, retrying...');
                setTimeout(initializeMagiCardSpellSystem, 100);
            }
        }
        
        // Initialize MagiCard spell system after a brief delay to ensure fount script loads
        setTimeout(initializeMagiCardSpellSystem, 500);
        
        console.log('📂 Loading stacks...');
        // Load saved stacks and initialize UI
        await loadStacks();
        
        console.log('🎨 Initializing main screen...');
        await initializeMainScreen();
        
        console.log('✅ MagiCard initialization complete!');
        
        // Add cleanup utility to window for browser console access
        window.cleanupMagiCardStorage = function() {
            console.log('🧹 Cleaning up all MagiCard localStorage...');
            const count = cleanupAllMenuLocalStorage();
            console.log(`✅ Cleaned up ${count} localStorage entries`);
            return count;
        };
        
        // Add delete test utility for debugging
        window.testDeleteFunction = function() {
            console.log('🧪 Testing delete function...');
            console.log('Current stacks:', stacks);
            console.log('Current stack:', currentStack);
            deleteCurrentStack();
        };
        
        console.log('💡 Browser console utilities available:');
        console.log('  - cleanupMagiCardStorage()');
        console.log('  - testDeleteFunction()');
        
    } catch (error) {
        console.error('❌ Error during initialization:', error);
        // Try to continue with basic functionality
        stacks = [];
        await initializeMainScreen();
    }
});

/**
 * Show a custom confirmation dialog (Tauri-compatible)
 * @param {string} title - Dialog title
 * @param {string} message - Dialog message
 * @param {string} confirmText - Confirm button text
 * @param {string} cancelText - Cancel button text
 * @returns {Promise<boolean>} - True if confirmed, false if cancelled
 */
function showCustomConfirm(title, message, confirmText = 'OK', cancelText = 'Cancel') {
    return new Promise((resolve) => {
        // Create modal overlay
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            backdrop-filter: blur(4px);
        `;

        // Create modal dialog
        const modal = document.createElement('div');
        modal.className = 'custom-modal';
        modal.style.cssText = `
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 12px;
            padding: 24px;
            min-width: 400px;
            max-width: 500px;
            text-align: center;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
            border: 1px solid rgba(255, 255, 255, 0.1);
        `;

        modal.innerHTML = `
            <div class="modal-title" style="
                color: white;
                font-size: 20px;
                font-weight: bold;
                margin-bottom: 16px;
            ">${title}</div>
            <div class="modal-message" style="
                color: #f8f9fa;
                font-size: 16px;
                line-height: 1.5;
                margin-bottom: 24px;
            ">${message}</div>
            <div class="modal-buttons" style="
                display: flex;
                gap: 12px;
                justify-content: center;
            ">
                <button class="modal-cancel-btn" style="
                    background: #95a5a6;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 6px;
                    font-size: 14px;
                    cursor: pointer;
                    font-weight: 500;
                    transition: background 0.2s;
                ">${cancelText}</button>
                <button class="modal-confirm-btn" style="
                    background: #e74c3c;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 6px;
                    font-size: 14px;
                    cursor: pointer;
                    font-weight: 500;
                    transition: background 0.2s;
                ">${confirmText}</button>
            </div>
        `;

        // Add hover effects
        const cancelBtn = modal.querySelector('.modal-cancel-btn');
        const confirmBtn = modal.querySelector('.modal-confirm-btn');
        
        cancelBtn.addEventListener('mouseenter', () => cancelBtn.style.background = '#7f8c8d');
        cancelBtn.addEventListener('mouseleave', () => cancelBtn.style.background = '#95a5a6');
        
        confirmBtn.addEventListener('mouseenter', () => confirmBtn.style.background = '#c0392b');
        confirmBtn.addEventListener('mouseleave', () => confirmBtn.style.background = '#e74c3c');

        // Handle button clicks
        const cleanup = () => {
            document.body.removeChild(overlay);
        };

        cancelBtn.addEventListener('click', () => {
            cleanup();
            resolve(false);
        });

        confirmBtn.addEventListener('click', () => {
            cleanup();
            resolve(true);
        });

        // Handle escape key
        const handleKeydown = (e) => {
            if (e.key === 'Escape') {
                cleanup();
                document.removeEventListener('keydown', handleKeydown);
                resolve(false);
            }
        };
        document.addEventListener('keydown', handleKeydown);

        // Handle overlay click
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                cleanup();
                resolve(false);
            }
        });

        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        
        // Focus the confirm button for keyboard navigation
        confirmBtn.focus();
    });
}

/**
 * Show a custom alert dialog (Tauri-compatible)
 * @param {string} title - Dialog title
 * @param {string} message - Dialog message
 * @param {string} buttonText - Button text
 * @returns {Promise<void>}
 */
function showCustomAlert(title, message, buttonText = 'OK') {
    return new Promise((resolve) => {
        // Create modal overlay
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            backdrop-filter: blur(4px);
        `;

        // Create modal dialog
        const modal = document.createElement('div');
        modal.className = 'custom-modal';
        modal.style.cssText = `
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 12px;
            padding: 24px;
            min-width: 300px;
            max-width: 400px;
            text-align: center;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
            border: 1px solid rgba(255, 255, 255, 0.1);
        `;

        modal.innerHTML = `
            <div class="modal-title" style="
                color: white;
                font-size: 20px;
                font-weight: bold;
                margin-bottom: 16px;
            ">${title}</div>
            <div class="modal-message" style="
                color: #f8f9fa;
                font-size: 16px;
                line-height: 1.5;
                margin-bottom: 24px;
            ">${message}</div>
            <div class="modal-buttons" style="
                display: flex;
                justify-content: center;
            ">
                <button class="modal-ok-btn" style="
                    background: #3498db;
                    color: white;
                    border: none;
                    padding: 10px 24px;
                    border-radius: 6px;
                    font-size: 14px;
                    cursor: pointer;
                    font-weight: 500;
                    transition: background 0.2s;
                ">${buttonText}</button>
            </div>
        `;

        // Add hover effect
        const okBtn = modal.querySelector('.modal-ok-btn');
        okBtn.addEventListener('mouseenter', () => okBtn.style.background = '#2980b9');
        okBtn.addEventListener('mouseleave', () => okBtn.style.background = '#3498db');

        // Handle button clicks
        const cleanup = () => {
            document.body.removeChild(overlay);
        };

        okBtn.addEventListener('click', () => {
            cleanup();
            resolve();
        });

        // Handle escape key and enter key
        const handleKeydown = (e) => {
            if (e.key === 'Escape' || e.key === 'Enter') {
                cleanup();
                document.removeEventListener('keydown', handleKeydown);
                resolve();
            }
        };
        document.addEventListener('keydown', handleKeydown);

        // Handle overlay click
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                cleanup();
                resolve();
            }
        });

        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        
        // Focus the OK button for keyboard navigation
        okBtn.focus();
    });
}

/**
 * Load all MagiStacks from storage
 */
async function loadStacks() {
    try {
        if (window.__TAURI__) {
            stacks = await window.__TAURI__.core.invoke('list_magistacks');
        } else {
            // Fallback to localStorage for web testing
            const saved = localStorage.getItem('magicard_stacks');
            stacks = saved ? JSON.parse(saved) : [];
        }
        console.log(`📚 Loaded ${stacks.length} MagiStacks`);
    } catch (error) {
        console.error('❌ Error loading stacks:', error);
        stacks = [];
    }
}

/**
 * Save stacks to storage
 */
async function saveStacks() {
    try {
        if (window.__TAURI__) {
            // Individual stack saves are handled by backend
            console.log('✅ Stacks managed by Tauri backend');
        } else {
            // Fallback to localStorage for web testing
            localStorage.setItem('magicard_stacks', JSON.stringify(stacks));
            console.log('✅ Stacks saved to localStorage');
        }
    } catch (error) {
        console.error('❌ Error saving stacks:', error);
    }
}

/**
 * Initialize the main screen UI
 */
async function initializeMainScreen() {
    const app = document.getElementById('app');
    
    // Create header
    const header = createHeader();
    
    // Create main content with two-column layout
    const mainContent = createMainContent();
    
    // Assemble UI
    app.innerHTML = '';
    app.appendChild(header);
    app.appendChild(mainContent);
    
    // Update stack list
    updateStackList();
    
    console.log('✅ Main screen initialized');
}

/**
 * Create application header
 */
function createHeader() {
    const header = document.createElement('div');
    header.className = 'app-header';
    
    header.innerHTML = `
        <div class="app-title">
            🪄 MagiCard
        </div>
        <div class="header-controls">
            <button class="btn btn-success" onclick="createNewStack()">
                ➕ New Stack
            </button>
            <button class="btn btn-tertiary" onclick="createSeedStack()">
                🌱 Seed Stack
            </button>
            <button class="btn btn-secondary" onclick="importFromBdoPubKey()">
                🍽️ Import Menu
            </button>
            <button class="btn btn-secondary" onclick="showBDOCardBrowser()">
                🌐 BDO Cards
            </button>
            <button class="btn btn-secondary" onclick="importStack()">
                📥 Import
            </button>
        </div>
    `;
    
    return header;
}

/**
 * Create main content area with two-column layout
 */
function createMainContent() {
    const mainContent = document.createElement('div');
    mainContent.className = 'main-content';
    
    // Create two-column layout
    const layout = document.createElement('div');
    layout.className = 'two-column-layout';
    
    // Left column - Stack list
    const leftColumn = document.createElement('div');
    leftColumn.className = 'left-column';
    leftColumn.innerHTML = `
        <div class="stack-list-header">
            <div class="stack-list-title">MagiStacks</div>
            <div class="stack-list-subtitle">Your card collections</div>
        </div>
        <div id="stack-list-content" class="stack-list-content">
            <!-- Stack items will be populated here -->
        </div>
    `;
    
    // Right column - Preview area
    const rightColumn = document.createElement('div');
    rightColumn.className = 'right-column';
    rightColumn.innerHTML = `
        <div class="preview-area">
            <div class="preview-header">
                <div class="preview-title">Stack Preview</div>
            </div>
            <div id="preview-content" class="preview-content">
                <div class="empty-preview">
                    <div class="empty-preview-icon">🃏</div>
                    <div class="empty-preview-text">Select a stack to preview</div>
                    <div class="empty-preview-subtext">Choose a MagiStack from the left to see its cards</div>
                </div>
            </div>
            <div id="bdo-pubkey-display" class="bdo-pubkey-display" style="display: none;">
                <div class="bdo-pubkey-label">🔑 BDO Import Key:</div>
                <div class="bdo-pubkey-value" id="bdo-pubkey-value">Loading...</div>
                <button class="btn btn-small btn-tertiary" onclick="copyBdoPubKey()" id="copy-bdo-key-btn">
                    📋 Copy Key
                </button>
            </div>
            <div id="action-buttons" class="action-buttons" style="display: none;">
                <button class="btn" onclick="editCurrentStack()">
                    ✏️ Edit Stack
                </button>
                <button class="btn btn-secondary" onclick="duplicateCurrentStack()">
                    📋 Duplicate
                </button>
                <button class="btn btn-danger" onclick="deleteCurrentStack()">
                    🗑️ Delete
                </button>
            </div>
        </div>
    `;
    
    layout.appendChild(leftColumn);
    layout.appendChild(rightColumn);
    mainContent.appendChild(layout);
    
    return mainContent;
}

/**
 * Update the stack list display
 */
function updateStackList() {
    const container = document.getElementById('stack-list-content');
    if (!container) return;
    
    if (stacks.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: #7f8c8d;">
                <div style="font-size: 2rem; margin-bottom: 1rem;">📦</div>
                <div>No stacks yet</div>
                <div style="font-size: 0.9rem; margin-top: 0.5rem;">Create your first MagiStack to get started</div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    
    stacks.forEach((stack, index) => {
        const stackItem = document.createElement('div');
        stackItem.className = 'stack-item';
        if (currentStack && currentStack.name === stack.name) {
            stackItem.classList.add('selected');
        }
        
        const cardCount = stack.cards ? stack.cards.length : 0;
        const updatedDate = stack.updated_at ? new Date(stack.updated_at).toLocaleDateString() : 'Unknown';
        
        stackItem.innerHTML = `
            <div class="stack-name">${stack.name}</div>
            <div class="stack-meta">
                <span>${cardCount} cards</span>
                <span>${updatedDate}</span>
            </div>
        `;
        
        stackItem.addEventListener('click', () => selectStack(stack));
        container.appendChild(stackItem);
    });
}

/**
 * Select a stack for preview
 */
async function selectStack(stack) {
    currentStack = stack;
    console.log(`🎯 Selected stack: ${stack.name}`);
    
    // Update visual selection
    updateStackList();
    
    // Update preview area
    await updatePreviewArea();
    
    // Show action buttons
    const actionButtons = document.getElementById('action-buttons');
    if (actionButtons) {
        actionButtons.style.display = 'flex';
        console.log('✅ Action buttons shown (delete button should be visible)');
    } else {
        console.log('❌ Action buttons element not found');
    }
    
    // Show and update BDO pubkey display
    await updateBdoPubKeyDisplay();
}

/**
 * Update the preview area with current stack
 */
async function updatePreviewArea() {
    const previewContent = document.getElementById('preview-content');
    if (!previewContent || !currentStack) return;
    
    const cards = currentStack.cards || [];
    
    if (cards.length === 0) {
        previewContent.innerHTML = `
            <div class="empty-preview">
                <div class="empty-preview-icon">🃏</div>
                <div class="empty-preview-text">Empty stack</div>
                <div class="empty-preview-subtext">Add cards to "${currentStack.name}" to see them here</div>
            </div>
        `;
        return;
    }
    
    // Show first card as preview
    const firstCard = cards[0];
    console.log('🖼️ updatePreviewArea - First card exists:', !!firstCard);
    console.log('🖼️ updatePreviewArea - First card has SVG:', !!firstCard?.svg);
    console.log('🖼️ updatePreviewArea - First card SVG length:', firstCard?.svg?.length || 0);
    
    if (firstCard && firstCard.svg) {
        console.log('🖼️ updatePreviewArea - Displaying card preview');
        await displayCardPreview(firstCard.svg);
    } else {
        console.log('🖼️ updatePreviewArea - No SVG content, showing empty preview');
        previewContent.innerHTML = `
            <div class="empty-preview">
                <div class="empty-preview-icon">🎨</div>
                <div class="empty-preview-text">No SVG content</div>
                <div class="empty-preview-subtext">Upload SVG files to see interactive cards</div>
            </div>
        `;
    }
}

/**
 * Update BDO pubkey display for current stack
 */
async function updateBdoPubKeyDisplay() {
    const bdoPubKeyDisplay = document.getElementById('bdo-pubkey-display');
    const bdoPubKeyValue = document.getElementById('bdo-pubkey-value');
    
    if (!bdoPubKeyDisplay || !bdoPubKeyValue || !currentStack) {
        if (bdoPubKeyDisplay) bdoPubKeyDisplay.style.display = 'none';
        return;
    }
    
    try {
        // Generate a BDO pubkey for this stack
        // For now, use the stack name to generate a consistent key
        let stackPubKey = '';
        
        if (window.__TAURI__) {
            // Get the real public key from sessionless (no fake keys!)
            stackPubKey = await window.__TAURI__.core.invoke('get_public_key');
        } else {
            // Web fallback - show error message instead of fake key
            bdoPubKeyValue.textContent = 'BDO integration requires Tauri backend';
            bdoPubKeyDisplay.style.display = 'block';
            return;
        }
        
        // Display the pubkey
        bdoPubKeyValue.textContent = stackPubKey;
        bdoPubKeyDisplay.style.display = 'block';
        
        console.log(`🔑 Generated BDO pubkey for stack "${currentStack.name}": ${stackPubKey}`);
        
    } catch (error) {
        console.error('❌ Error generating BDO pubkey:', error);
        bdoPubKeyValue.textContent = 'Error generating key';
        bdoPubKeyDisplay.style.display = 'block';
    }
}

/**
 * Copy BDO pubkey to clipboard
 */
async function copyBdoPubKey() {
    const bdoPubKeyValue = document.getElementById('bdo-pubkey-value');
    if (!bdoPubKeyValue) return;
    
    const pubKey = bdoPubKeyValue.textContent;
    
    try {
        if (navigator.clipboard) {
            await navigator.clipboard.writeText(pubKey);
            console.log('📋 Copied BDO pubkey to clipboard:', pubKey);
            
            // Visual feedback
            const copyBtn = document.getElementById('copy-bdo-key-btn');
            if (copyBtn) {
                const originalText = copyBtn.textContent;
                copyBtn.textContent = '✅ Copied!';
                copyBtn.style.background = '#27ae60';
                
                setTimeout(() => {
                    copyBtn.textContent = originalText;
                    copyBtn.style.background = '';
                }, 2000);
            }
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = pubKey;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            
            alert('📋 BDO pubkey copied to clipboard!');
        }
    } catch (error) {
        console.error('❌ Failed to copy to clipboard:', error);
        alert('Failed to copy to clipboard. Please manually copy the key.');
    }
}

/**
 * Update preview with new SVG content (for navigation)
 */
async function updatePreview(svgContent) {
    console.log('🖼️ Updating preview with new SVG content');
    await displayCardPreview(svgContent);
}

/**
 * Display a card's SVG content with spell handling
 */
async function displayCardPreview(svgContent) {
    const previewContent = document.getElementById('preview-content');
    if (!previewContent) return;
    
    previewContent.innerHTML = `
        <div class="card-preview">
            <div class="card-svg-container">
                ${svgContent}
            </div>
        </div>
    `;
    
    // Apply spell handlers to elements with spell attributes (using fount system)
    if (window.applySpellHandlers) {
        window.applySpellHandlers(previewContent);
    } else {
        console.warn('⚠️ fount spell system not yet loaded, handlers will be applied later');
    }
}

/**
 * Display a card fetched from BDO in the preview area
 * @param {string|Object} cardData - The card data (SVG string or object containing SVG)
 * @param {string} bdoPubKey - The BDO public key for the card
 * @param {string} navigationSource - The source of navigation (selection, magicard, lookup)
 */
async function displayFetchedCardInPreview(cardData, bdoPubKey, navigationSource = 'unknown') {
    console.log('🃏 Displaying fetched card in MagiCard preview:', { bdoPubKey, cardData });
    
    // Extract SVG content from card data
    let svgContent;
    if (typeof cardData === 'string') {
        // Check if it's already SVG content
        if (cardData.trim().startsWith('<svg')) {
            svgContent = cardData;
        } else {
            svgContent = `<svg><text x="50" y="50">${cardData}</text></svg>`;
        }
    } else if (cardData && typeof cardData === 'object') {
        console.log('🔍 Searching for SVG in card data fields:', Object.keys(cardData));
        
        // Try different possible locations for SVG content
        svgContent = cardData.svg || 
                    cardData.svgContent || 
                    cardData.content || 
                    cardData.data || 
                    cardData.cardSvg ||
                    cardData.body ||
                    cardData.html;
        
        console.log('🔍 Raw svgContent found:', svgContent ? `${typeof svgContent} (${svgContent.length} chars)` : 'null/undefined');
        console.log('🔍 svgContent preview:', svgContent ? svgContent.substring(0, 100) : 'N/A');
        
        // Debug each potential field individually  
        console.log('🔍 cardData.svg:', cardData.svg ? 'exists' : 'null/undefined');
        console.log('🔍 cardData.svgContent:', cardData.svgContent ? 'exists' : 'null/undefined'); 
        console.log('🔍 cardData.content:', cardData.content ? 'exists' : 'null/undefined');
                    
        // Unescape JSON-escaped SVG content if needed
        if (svgContent && typeof svgContent === 'string') {
            try {
                // Check if content is JSON-escaped (contains \" instead of ")
                if (svgContent.includes('\\"')) {
                    console.log('🔧 Unescaping JSON-escaped SVG content');
                    svgContent = JSON.parse(`"${svgContent}"`);
                    console.log('✅ Successfully unescaped SVG content');
                } else if (svgContent.startsWith('"') && svgContent.endsWith('"')) {
                    console.log('🔧 Removing extra quotes from SVG content');
                    svgContent = svgContent.slice(1, -1);
                    console.log('✅ Removed surrounding quotes');
                }
            } catch (unescapeError) {
                console.warn('⚠️ Failed to unescape SVG content:', unescapeError);
                // Keep original content if unescaping fails
            }
        }
        
        // If no SVG found, check for nested objects
        if (!svgContent) {
            console.log('🔍 No direct SVG field found, checking nested objects...');
            for (const [key, value] of Object.entries(cardData)) {
                if (typeof value === 'string' && value.trim().startsWith('<svg')) {
                    console.log(`✅ Found SVG content in field: ${key}`);
                    svgContent = value;
                    break;
                }
            }
        }
        
        // If still no SVG, create a debug display
        if (!svgContent || typeof svgContent !== 'string' || !svgContent.trim().startsWith('<svg')) {
            console.warn('⚠️ No SVG content found in card data, showing debug info');
            const debugInfo = JSON.stringify(cardData, null, 2);
            svgContent = `
                <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
                    <rect x="0" y="0" width="400" height="300" fill="#f8f9fa" stroke="#dee2e6"/>
                    <text x="200" y="30" text-anchor="middle" font-size="16" font-weight="bold" fill="#495057">
                        Card Data (No SVG Found)
                    </text>
                    <foreignObject x="10" y="50" width="380" height="240">
                        <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: monospace; font-size: 10px; overflow: auto; height: 100%; background: white; padding: 5px;">
                            <pre>${debugInfo}</pre>
                        </div>
                    </foreignObject>
                </svg>
            `;
        }
    } else {
        svgContent = '<svg><text x="50" y="50" fill="red">Invalid card data</text></svg>';
    }
    
    console.log('🃏 Extracted SVG content:', svgContent.substring(0, 200) + '...');
    
    const previewContent = document.getElementById('preview-content');
    if (!previewContent) {
        console.warn('⚠️ Preview content element not found');
        return;
    }
    
    // Determine card type and icon based on navigation source
    let cardTypeIcon = '🌐';
    let cardTypeTitle = 'Fetched Card';
    let cardTypeClass = 'fetched-card';
    
    if (navigationSource === 'lookup') {
        cardTypeIcon = '🛍️';
        cardTypeTitle = 'Product Card';
        cardTypeClass = 'product-card';
    } else if (navigationSource === 'selection') {
        cardTypeIcon = '📋';
        cardTypeTitle = 'Selected Card';
        cardTypeClass = 'selected-card';
    }
    
    // Show fetched card with special styling
    previewContent.innerHTML = `
        <div class="card-preview ${cardTypeClass}">
            <div class="fetched-card-header">
                <h3>${cardTypeIcon} ${cardTypeTitle}</h3>
                <p>BDO Key: ${bdoPubKey.substring(0, 20)}...</p>
                ${navigationSource === 'lookup' ? '<p class="source-info">🔍 Found via Lookup Spell</p>' : ''}
            </div>
            <div class="card-svg-container">
                ${svgContent}
            </div>
        </div>
    `;
    
    // Apply spell handlers to the new card content
    if (window.applySpellHandlers) {
        console.log('🪄 Applying spell handlers to fetched card');
        window.applySpellHandlers(previewContent);
    } else {
        console.warn('⚠️ Fount spell system not loaded yet');
    }
    
    // Add some CSS for fetched card styling
    if (!document.getElementById('fetched-card-styles')) {
        const style = document.createElement('style');
        style.id = 'fetched-card-styles';
        style.textContent = `
            .fetched-card {
                border: 2px solid #3498db;
                border-radius: 8px;
                background: linear-gradient(45deg, rgba(52, 152, 219, 0.1), rgba(155, 89, 182, 0.1));
            }
            
            .product-card {
                border: 2px solid #27ae60;
                border-radius: 8px;
                background: linear-gradient(45deg, rgba(39, 174, 96, 0.1), rgba(241, 196, 15, 0.1));
            }
            
            .selected-card {
                border: 2px solid #9b59b6;
                border-radius: 8px;
                background: linear-gradient(45deg, rgba(155, 89, 182, 0.1), rgba(52, 152, 219, 0.1));
            }
            
            .fetched-card-header {
                padding: 12px;
                background: rgba(52, 152, 219, 0.2);
                border-bottom: 1px solid #3498db;
                border-radius: 6px 6px 0 0;
            }
            
            .product-card .fetched-card-header {
                background: rgba(39, 174, 96, 0.2);
                border-bottom: 1px solid #27ae60;
            }
            
            .selected-card .fetched-card-header {
                background: rgba(155, 89, 182, 0.2);
                border-bottom: 1px solid #9b59b6;
            }
            
            .fetched-card-header h3 {
                margin: 0 0 4px 0;
                color: #3498db;
                font-size: 16px;
            }
            
            .product-card .fetched-card-header h3 {
                color: #27ae60;
            }
            
            .selected-card .fetched-card-header h3 {
                color: #9b59b6;
            }
            
            .fetched-card-header p {
                margin: 0;
                color: #7f8c8d;
                font-size: 12px;
                font-family: monospace;
            }
            
            .source-info {
                color: #27ae60 !important;
                font-weight: bold;
                margin-top: 4px !important;
            }
        `;
        document.head.appendChild(style);
    }
    
    console.log('✅ Fetched card displayed in MagiCard preview');
}

/**
 * Legacy spell handlers - now handled by fount castSpell.js
 * Keeping card-navigate functionality for MagiCard-specific navigation
 */
function applyLegacyCardNavigation(container) {
    // Handle MagiCard-specific card navigation attributes (not handled by fount)
    const navigateElements = container.querySelectorAll('[card-navigate]');
    navigateElements.forEach(element => {
        element.style.cursor = 'pointer';
        element.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            const cardKey = element.getAttribute('card-navigate');
            const baseUrl = element.getAttribute('base-url') || getServiceUrl('bdo');
            navigateToCardViaBDO(baseUrl, cardKey);
        });
    });
    
    console.log(`✨ Applied legacy card navigation to ${navigateElements.length} elements`);
}

// Alias for backward compatibility - will use fount system when available
function applySpellHandlers(container) {
    if (window.applySpellHandlers && window.applySpellHandlers !== applySpellHandlers) {
        // Use fount's applySpellHandlers if available
        window.applySpellHandlers(container);
    } else {
        console.warn('⚠️ fount spell system not available, using fallback');
    }
    
    // Always apply MagiCard-specific navigation
    applyLegacyCardNavigation(container);
}


/**
 * Get the BDO public key for the current user
 */
async function getBDOPublicKey() {
    try {
        if (window.__TAURI__) {
            const pubKey = await window.__TAURI__.core.invoke('get_public_key');
            console.log('🔑 Got BDO public key:', pubKey);
            return pubKey;
        } else {
            // Fallback for web testing - generate a mock key
            const mockKey = 'mock_' + Math.random().toString(36).substring(2, 15);
            console.log('🔑 Using mock public key for web testing:', mockKey);
            return mockKey;
        }
    } catch (error) {
        console.error('❌ Error getting BDO public key:', error);
        return null;
    }
}

/**
 * Extract card name from SVG card-name attribute
 */
function extractCardNameFromSVG(svgContent) {
    try {
        // Parse the SVG content to find the card-name attribute
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml');
        const svgElement = svgDoc.querySelector('svg');
        
        if (svgElement) {
            const cardName = svgElement.getAttribute('card-name');
            if (cardName && cardName.trim()) {
                return cardName.trim();
            }
        }
        
        return null;
    } catch (error) {
        console.error('❌ Error extracting card name from SVG:', error);
        return null;
    }
}

/**
 * Handle MagiCard navigation between cards using BDO
 */
async function handleMagicardNavigation(element, spellComponentsStr) {
    try {
        console.log('🔮 Parsing spell components...');
        const spellComponents = JSON.parse(spellComponentsStr);
        console.log('📋 Spell components:', spellComponents);
        
        if (!spellComponents.bdoPubKey) {
            console.error('❌ No bdoPubKey found in spell components');
            alert('⚠️ Invalid navigation spell - missing bdoPubKey');
            return;
        }
        
        const bdoPubKey = spellComponents.bdoPubKey;
        console.log(`🔑 Navigating to card with bdoPubKey: ${bdoPubKey}`);
        
        // For demo purposes, navigate within the current stack
        await navigateToCardInCurrentStack(bdoPubKey);
        
    } catch (error) {
        console.error('❌ Error parsing spell components:', error);
        alert('⚠️ Invalid navigation spell - malformed spell-components JSON');
    }
}

/**
 * Navigate to a card within the current stack (demo implementation)
 */
async function navigateToCardInCurrentStack(bdoPubKey) {
    if (!currentStack || !currentStack.cards) {
        alert('⚠️ No current stack loaded');
        return;
    }
    
    console.log(`🎯 Looking for card with bdoPubKey: ${bdoPubKey}`);
    
    // First, try to find the card locally by bdoPubKey
    const targetCard = currentStack.cards.find(card => {
        return card.metadata?.cardBdoPubKey === bdoPubKey || 
               card.bdoPubKey === bdoPubKey ||
               card.metadata?.bdoPubKey === bdoPubKey;
    });
    
    if (targetCard) {
        console.log(`✨ Found target card locally: ${targetCard.name}`);
        // Update the preview to show the target card
        updatePreview(targetCard.svg);
        
        // Show success message
        alert(`🪄 Navigated to ${targetCard.name}! Check the preview area.`);
    } else {
        console.log(`🌐 Card not found locally, fetching from BDO: ${bdoPubKey.substring(0, 12)}...`);
        
        // Try to fetch the card from BDO
        await fetchAndDisplayCardFromBDO(bdoPubKey);
    }
}

/**
 * Fetch and display a card from BDO by pubKey
 * @param {string} bdoPubKey - The BDO public key to fetch
 */
async function fetchAndDisplayCardFromBDO(bdoPubKey) {
    console.log(`🌐 Fetching card from BDO with pubKey: ${bdoPubKey.substring(0, 12)}...`);
    
    try {
        // Show loading state in preview
        const previewContainer = document.getElementById('card-preview');
        if (previewContainer) {
            previewContainer.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #666;">
                    <div style="text-align: center;">
                        <div style="font-size: 24px; margin-bottom: 10px;">🌐</div>
                        <div>Loading card from BDO...</div>
                    </div>
                </div>
            `;
        }
        
        // Call Tauri backend to fetch card from BDO
        const result = await window.__TAURI__.core.invoke('get_card_from_bdo', { 
            bdoPubKey: bdoPubKey 
        });
        
        console.log(`📦 BDO fetch result:`, result);
        
        if (result.success && result.card && result.card.data) {
            // Extract SVG content from the BDO response
            let svgContent = result.card.data.svg || result.card.data.svgContent;
            
            if (svgContent) {
                console.log(`✅ Successfully fetched card SVG from BDO`);
                console.log(`📏 SVG content length: ${svgContent.length} characters`);
                
                // Display the SVG in the preview area
                updatePreview(svgContent);
                
                // Optionally add the card to current stack for future navigation
                if (currentStack) {
                    const cardName = extractCardNameFromSVG(svgContent) || `Card_${bdoPubKey.substring(0, 8)}`;
                    const newCard = {
                        name: cardName,
                        svg: svgContent,
                        created_at: new Date().toISOString(),
                        metadata: {
                            cardBdoPubKey: bdoPubKey,
                            source: 'BDO_FETCH',
                            fetchedAt: new Date().toISOString()
                        }
                    };
                    
                    // Add to current stack if not already present
                    const existingCard = currentStack.cards.find(card => 
                        card.metadata?.cardBdoPubKey === bdoPubKey
                    );
                    
                    if (!existingCard) {
                        currentStack.cards.push(newCard);
                        console.log(`📚 Added fetched card to current stack: ${cardName}`);
                        
                        // Update the stack in storage
                        await window.__TAURI__.core.invoke('save_magistack', {
                            name: currentStack.name,
                            cards: currentStack.cards
                        });
                        
                        // Refresh the UI if we're in edit mode
                        if (isEditMode) {
                            displayCardsInList();
                        }
                    } else {
                        console.log(`📚 Card already exists in current stack: ${cardName}`);
                    }
                }
                
                // Show success message
                alert(`🪄 Navigated to card from BDO! Check the preview area.`);
            } else {
                throw new Error('No SVG content found in BDO response');
            }
        } else {
            throw new Error(result.error || 'Failed to fetch card from BDO');
        }
        
    } catch (error) {
        console.error(`❌ Failed to fetch card from BDO:`, error);
        
        // Show error state in preview
        const previewContainer = document.getElementById('card-preview');
        if (previewContainer) {
            previewContainer.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #e74c3c;">
                    <div style="text-align: center;">
                        <div style="font-size: 24px; margin-bottom: 10px;">❌</div>
                        <div style="font-weight: bold; margin-bottom: 5px;">Card Not Found</div>
                        <div style="font-size: 12px; color: #666;">Could not fetch card with pubKey: ${bdoPubKey.substring(0, 12)}...</div>
                        <div style="font-size: 11px; color: #999; margin-top: 10px;">${error.message}</div>
                    </div>
                </div>
            `;
        }
        
        // Show error alert
        alert(`❌ Failed to fetch card from BDO: ${error.message}`);
    }
}

/**
 * Show a modal dialog for name input (Tauri-compatible)
 */
function showNameInputModal(message, confirmText = 'OK') {
    return new Promise((resolve) => {
        // Create modal overlay
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>🪄 ${message}</h3>
                <input type="text" id="modal-input" class="modal-input" placeholder="Enter stack name..." autofocus>
                <div class="modal-buttons">
                    <button class="btn btn-secondary" id="modal-cancel">Cancel</button>
                    <button class="btn btn-success" id="modal-confirm">${confirmText}</button>
                </div>
            </div>
        `;
        
        // Add modal to page
        document.body.appendChild(modal);
        
        // Focus input
        const input = modal.querySelector('#modal-input');
        setTimeout(() => input.focus(), 100);
        
        // Handle confirm
        const handleConfirm = () => {
            const value = input.value.trim();
            modal.remove();
            resolve(value);
        };
        
        // Handle cancel
        const handleCancel = () => {
            modal.remove();
            resolve(null);
        };
        
        // Event listeners
        modal.querySelector('#modal-confirm').addEventListener('click', handleConfirm);
        modal.querySelector('#modal-cancel').addEventListener('click', handleCancel);
        
        // Enter key submits
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                handleConfirm();
            } else if (e.key === 'Escape') {
                handleCancel();
            }
        });
        
        // Click outside to cancel
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                handleCancel();
            }
        });
    });
}

/**
 * Create a new stack
 */
async function createNewStack() {
    console.log('🪄 Creating new stack - function called!');
    
    const name = await showNameInputModal('Enter name for new MagiStack:', 'Create Stack');
    if (!name || name.trim() === '') {
        console.log('📝 Stack creation cancelled - no name provided');
        return;
    }
    
    const newStack = {
        name: name.trim(),
        cards: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };
    
    try {
        if (window.__TAURI__) {
            await window.__TAURI__.core.invoke('save_magistack', {
                name: newStack.name,
                cards: []
            });
        }
        
        stacks.push(newStack);
        await saveStacks();
        updateStackList();
        
        console.log(`✅ Created new stack: ${name}`);
        
        // Auto-select the new stack
        await selectStack(newStack);
    } catch (error) {
        console.error('❌ Error creating stack:', error);
        alert('Failed to create stack. Please try again.');
    }
}

/**
 * Create a seed MagiStack for testing
 */
async function createSeedStack() {
    console.log('🌱 Creating seed stack - function called!');
    
    try {
        if (window.__TAURI__) {
            const result = await window.__TAURI__.core.invoke('create_seed_magistack');
            console.log('✅ Seed stack created:', result);
        } else {
            console.log('⚠️ Tauri not available, creating seed stack locally');
            
            // Simplified spell cards for fallback (when Tauri isn't available)
            const seedStack = {
                name: 'spell_test_stack',
                cards: [
                    {
                        name: 'Fire Spell',
                        type: 'spell',
                        content: 'Cast a powerful fireball spell with interactive navigation to other spells.',
                        svg: '<svg width="300" height="400" xmlns="http://www.w3.org/2000/svg"><rect x="0" y="0" width="300" height="400" fill="#2c1810" stroke="#8B4513" stroke-width="3" rx="15"/><text x="150" y="50" text-anchor="middle" fill="#FFD700" font-family="serif" font-size="20" font-weight="bold">🔥 FIRE SPELL 🔥</text><circle spell="fireball" cx="150" cy="150" r="40" fill="#FF4500" stroke="#FFD700" stroke-width="3"/><text spell="fireball" x="150" y="160" text-anchor="middle" fill="#FFD700" font-size="30">🔥</text></svg>'
                    },
                    {
                        name: 'Ice Spell',
                        type: 'spell', 
                        content: 'Freeze enemies with ice magic and spell component interactions.',
                        svg: '<svg width="300" height="400" xmlns="http://www.w3.org/2000/svg"><rect x="0" y="0" width="300" height="400" fill="#1e3a5f" stroke="#4682B4" stroke-width="3" rx="15"/><text x="150" y="50" text-anchor="middle" fill="#E0E6FF" font-family="serif" font-size="20" font-weight="bold">❄️ ICE SPELL ❄️</text><polygon spell="ice-shard" points="150,110 170,140 150,190 130,140" fill="#00CED1" stroke="#E0E6FF" stroke-width="3"/><text spell="ice-shard" x="150" y="160" text-anchor="middle" fill="#E0E6FF" font-size="30">❄️</text></svg>'
                    },
                    {
                        name: 'Lightning Spell',
                        type: 'spell',
                        content: 'Strike with lightning speed and power, featuring chain lightning effects.',
                        svg: '<svg width="300" height="400" xmlns="http://www.w3.org/2000/svg"><rect x="0" y="0" width="300" height="400" fill="#2e2e40" stroke="#FFD700" stroke-width="3" rx="15"/><text x="150" y="50" text-anchor="middle" fill="#FFFF00" font-family="serif" font-size="18" font-weight="bold">⚡ LIGHTNING SPELL ⚡</text><path spell="lightning-bolt" d="M150,100 L160,130 L145,130 L155,170 L135,140 L150,140 Z" fill="#FFFF00" stroke="#FFD700" stroke-width="2"/><text spell="lightning-bolt" x="150" y="160" text-anchor="middle" fill="#FFFFFF" font-size="30">⚡</text></svg>'
                    }
                ],
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            
            stacks.push(seedStack);
            await saveStacks();
        }
        
        await loadStacks();
        updateStackList();
        
        console.log('✅ Seed stack created successfully');
        alert('🌱 Spell test stack created! Look for "spell_test_stack" with Fire, Ice, and Lightning spells in your stack list.');
        
    } catch (error) {
        console.error('❌ Error creating seed stack:', error);
        alert('Failed to create seed stack. Please try again.');
    }
}

/**
 * Import a menu from Ninefy using bdoPubKey
 */
async function importFromBdoPubKey() {
    console.log('🍽️ Import from bdoPubKey - function called!');
    
    const bdoPubKey = await showNameInputModal('Enter MagiCard ID from Ninefy menu:', 'Import Menu');
    if (!bdoPubKey || bdoPubKey.trim() === '') {
        console.log('📝 Import cancelled - no bdoPubKey provided');
        return;
    }
    
    try {
        console.log('🔍 Looking up menu with bdoPubKey:', bdoPubKey.substring(0, 10) + '...');
        
        // For now, create a demo conversion since we don't have BDO integration yet
        // In a real implementation, this would fetch from BDO using the bdoPubKey
        const menuData = await fetchMenuFromBDO(bdoPubKey);
        
        if (!menuData) {
            alert('Menu not found for the provided MagiCard ID. Please check the ID and try again.');
            return;
        }
        
        // Convert menu to MagiStack
        const magistack = await convertMenuToMagiStack(menuData);
        
        if (magistack) {
            // Add to stacks
            stacks.push(magistack);
            await saveStacks();
            updateStackList();
            
            console.log(`✅ Imported menu as MagiStack: ${magistack.name}`);
            alert(`Successfully imported "${magistack.name}" with ${magistack.cards.length} cards!`);
            
            // Auto-select the imported stack
            await selectStack(magistack);
        } else {
            alert('Failed to convert menu to MagiStack. Please try again.');
        }
        
    } catch (error) {
        console.error('❌ Error importing from bdoPubKey:', error);
        alert('Failed to import menu. Please check the MagiCard ID and try again.');
    }
}

// Export global functions immediately for HTML onclick handlers
window.createNewStack = createNewStack;
window.createSeedStack = createSeedStack;
window.importFromBdoPubKey = importFromBdoPubKey;
window.copyBdoPubKey = copyBdoPubKey;
console.log('🔗 Global functions exported:', { 
    createNewStack: typeof window.createNewStack,
    createSeedStack: typeof window.createSeedStack,
    importFromBdoPubKey: typeof window.importFromBdoPubKey,
    copyBdoPubKey: typeof window.copyBdoPubKey
});

/**
 * Edit the current stack
 */
async function editCurrentStack() {
    if (!currentStack) {
        alert('Please select a stack first.');
        return;
    }
    
    console.log(`✏️ Editing stack: ${currentStack.name}`);
    await switchToEditMode(currentStack);
}

/**
 * Switch to edit mode for a stack
 */
async function switchToEditMode(stack) {
    isEditMode = true;
    currentStack = stack;
    
    // Create edit screen
    const app = document.getElementById('app');
    app.innerHTML = '';
    
    // Create edit UI
    const editUI = createEditModeUI(stack);
    app.appendChild(editUI);
    
    console.log(`🎨 Entered edit mode for: ${stack.name}`);
}

/**
 * Create edit mode UI
 */
function createEditModeUI(stack) {
    const editContainer = document.createElement('div');
    editContainer.className = 'edit-mode-container';
    editContainer.style.cssText = `
        width: 100%;
        height: 100vh;
        display: flex;
        flex-direction: column;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    `;
    
    // Edit header
    const editHeader = document.createElement('div');
    editHeader.className = 'edit-header';
    editHeader.style.cssText = `
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
        border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        padding: 1rem 2rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
    `;
    
    editHeader.innerHTML = `
        <div style="display: flex; align-items: center; gap: 1rem;">
            <button class="btn btn-secondary" onclick="exitEditMode()">
                ← Back to Main
            </button>
            <div>
                <div style="font-size: 1.5rem; font-weight: bold; color: #2c3e50;">
                    🎨 Editing: ${stack.name}
                </div>
                <div style="color: #7f8c8d; font-size: 0.9rem;">
                    ${stack.cards ? stack.cards.length : 0} cards
                </div>
            </div>
        </div>
        <div>
            <button class="btn btn-success" onclick="addNewCard()">
                ➕ Add Card
            </button>
        </div>
    `;
    
    // Edit content
    const editContent = document.createElement('div');
    editContent.className = 'edit-content';
    editContent.style.cssText = `
        flex: 1;
        display: flex;
        overflow: hidden;
    `;
    
    // Card list (left side)
    const cardList = document.createElement('div');
    cardList.className = 'card-list';
    cardList.style.cssText = `
        width: 300px;
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
        border-right: 1px solid rgba(0, 0, 0, 0.1);
        display: flex;
        flex-direction: column;
    `;
    
    cardList.innerHTML = `
        <div style="padding: 1.5rem; border-bottom: 1px solid rgba(0, 0, 0, 0.1);">
            <div style="font-size: 1.2rem; font-weight: bold; color: #2c3e50;">Cards in Stack</div>
        </div>
        <div id="edit-card-list" style="flex: 1; overflow-y: auto; padding: 1rem;">
            <!-- Cards will be populated here -->
        </div>
    `;
    
    // Card editor (right side)
    const cardEditor = document.createElement('div');
    cardEditor.className = 'card-editor';
    cardEditor.style.cssText = `
        flex: 1;
        background: rgba(255, 255, 255, 0.9);
        backdrop-filter: blur(10px);
        display: flex;
        flex-direction: column;
        padding: 2rem;
    `;
    
    cardEditor.innerHTML = `
        <div id="card-editor-content">
            <div style="text-align: center; color: #7f8c8d; margin-top: 2rem;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">🃏</div>
                <div style="font-size: 1.2rem;">Select a card to edit</div>
                <div style="font-size: 0.9rem; margin-top: 0.5rem;">or add a new card to get started</div>
            </div>
        </div>
    `;
    
    editContent.appendChild(cardList);
    editContent.appendChild(cardEditor);
    
    editContainer.appendChild(editHeader);
    editContainer.appendChild(editContent);
    
    // Update card list
    updateEditCardList();
    
    return editContainer;
}

/**
 * Update the card list in edit mode
 */
function updateEditCardList() {
    const cardListContainer = document.getElementById('edit-card-list');
    if (!cardListContainer || !currentStack) return;
    
    const cards = currentStack.cards || [];
    
    if (cards.length === 0) {
        cardListContainer.innerHTML = `
            <div style="text-align: center; color: #7f8c8d; padding: 2rem;">
                <div style="font-size: 2rem; margin-bottom: 1rem;">📦</div>
                <div>No cards yet</div>
                <div style="font-size: 0.9rem; margin-top: 0.5rem;">Add your first card</div>
            </div>
        `;
        return;
    }
    
    cardListContainer.innerHTML = '';
    
    cards.forEach((card, index) => {
        const cardItem = document.createElement('div');
        cardItem.className = 'card-item';
        cardItem.style.cssText = `
            background: white;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            padding: 1rem;
            margin-bottom: 0.5rem;
            cursor: pointer;
            transition: all 0.2s ease;
        `;
        
        if (currentCard && currentCard === card) {
            cardItem.style.borderColor = '#9b59b6';
            cardItem.style.background = 'rgba(155, 89, 182, 0.05)';
        }
        
        cardItem.innerHTML = `
            <div style="font-weight: bold; color: #2c3e50; margin-bottom: 0.3rem;">
                ${card.name || `Card ${index + 1}`}
            </div>
            <div style="font-size: 0.8rem; color: #7f8c8d;">
                ${card.svg ? 'SVG loaded' : 'No SVG content'}
            </div>
        `;
        
        cardItem.addEventListener('click', () => selectCardForEdit(card, index));
        cardListContainer.appendChild(cardItem);
    });
}

/**
 * Select a card for editing
 */
function selectCardForEdit(card, index) {
    currentCard = card;
    console.log(`🎯 Selected card for edit: ${card.name || 'Card ' + (index + 1)}`);
    
    updateEditCardList();
    updateCardEditor(card, index);
}

/**
 * Update the card editor area
 */
function updateCardEditor(card, index) {
    const editorContent = document.getElementById('card-editor-content');
    if (!editorContent) return;
    
    editorContent.innerHTML = `
        <div style="display: flex; justify-content: between; align-items: center; margin-bottom: 2rem;">
            <div>
                <div style="font-size: 1.5rem; font-weight: bold; color: #2c3e50;">
                    ${card.name || `Card ${index + 1}`}
                </div>
                <div style="color: #7f8c8d; font-size: 0.9rem;">
                    Click to upload new SVG file
                </div>
            </div>
        </div>
        
        <div style="flex: 1; display: flex; flex-direction: column; gap: 1.5rem;">
            <!-- SVG Upload Area -->
            <div class="file-drop-zone" onclick="uploadSVGForCard(${index})" id="svg-drop-zone-${index}">
                <div style="font-size: 2rem; margin-bottom: 1rem;">🎨</div>
                <div style="font-size: 1.1rem; margin-bottom: 0.5rem;">Upload SVG File</div>
                <div style="font-size: 0.9rem; color: #7f8c8d;">
                    Click to browse or drag and drop an SVG file
                </div>
                <input type="file" id="svg-file-input-${index}" class="file-input" accept=".svg" onchange="handleSVGUpload(event, ${index})">
            </div>
            
            <!-- SVG Preview -->
            <div id="svg-preview-${index}" style="flex: 1; background: white; border: 1px solid #e0e0e0; border-radius: 8px; padding: 1rem; min-height: 300px; display: flex; align-items: center; justify-content: center;">
                ${card.svg ? `<div style="width: 100%; height: 100%; overflow: auto;">${card.svg}</div>` : 
                    `<div style="text-align: center; color: #7f8c8d;">
                        <div style="font-size: 2rem; margin-bottom: 1rem;">📄</div>
                        <div>No SVG content</div>
                        <div style="font-size: 0.9rem; margin-top: 0.5rem;">Upload an SVG file to see preview</div>
                    </div>`}
            </div>
            
            <!-- Card Actions -->
            <div style="display: flex; gap: 1rem; justify-content: center;">
                <button class="btn btn-secondary" onclick="renameCard(${index})">
                    ✏️ Rename
                </button>
                <button class="btn btn-danger" onclick="deleteCard(${index})">
                    🗑️ Delete Card
                </button>
            </div>
        </div>
    `;
    
    // Apply spell handlers if SVG content exists
    if (card.svg) {
        setTimeout(() => {
            const preview = document.getElementById(`svg-preview-${index}`);
            if (preview) {
                if (window.applySpellHandlers) {
                    window.applySpellHandlers(preview);
                }
            }
        }, 100);
    }
}

/**
 * Upload SVG for a card
 */
function uploadSVGForCard(cardIndex) {
    const fileInput = document.getElementById(`svg-file-input-${cardIndex}`);
    if (fileInput) {
        fileInput.click();
    }
}

/**
 * Handle SVG file upload
 */
async function handleSVGUpload(event, cardIndex) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (!file.type.includes('svg') && !file.name.endsWith('.svg')) {
        alert('Please select an SVG file.');
        return;
    }
    
    try {
        const svgContent = await file.text();
        
        // Extract card name from SVG card-name attribute
        const cardName = extractCardNameFromSVG(svgContent);
        console.log(`📇 Extracted card name: "${cardName}" from SVG`);
        
        // Update the card in current stack
        if (!currentStack.cards) currentStack.cards = [];
        if (!currentStack.cards[cardIndex]) {
            currentStack.cards[cardIndex] = { name: cardName || `Card ${cardIndex + 1}` };
        } else {
            // Update name if we found one in the SVG
            if (cardName) {
                currentStack.cards[cardIndex].name = cardName;
            }
        }
        
        currentStack.cards[cardIndex].svg = svgContent;
        currentStack.updated_at = new Date().toISOString();
        
        // Save to backend and post to BDO
        if (window.__TAURI__) {
            await window.__TAURI__.core.invoke('save_magistack', {
                name: currentStack.name,
                cards: currentStack.cards
            });
            
            // Save individual SVG file and post to BDO
            try {
                await window.__TAURI__.core.invoke('save_card_svg', {
                    stackName: currentStack.name,
                    cardName: currentStack.cards[cardIndex].name,
                    svgContent: svgContent
                });
                
                // Store BDO key for this card
                const cardKey = `${currentStack.name}_${currentStack.cards[cardIndex].name}`
                    .replace(/ /g, '_')
                    .replace(/[/\\]/g, '_');
                currentStack.cards[cardIndex].bdoKey = cardKey;
                
                console.log(`✅ Card posted to BDO with key: ${cardKey}`);
                
            } catch (bdoError) {
                console.warn('⚠️ Failed to post to BDO:', bdoError);
                // Continue anyway - local save succeeded
            }
        }
        
        await saveStacks();
        
        // Update UI
        updateEditCardList();
        updateCardEditor(currentStack.cards[cardIndex], cardIndex);
        
        console.log(`✅ SVG uploaded for card ${cardIndex + 1} and posted to BDO`);
        
    } catch (error) {
        console.error('❌ Error uploading SVG:', error);
        alert('Failed to upload SVG file. Please try again.');
    }
}

/**
 * Add a new card to the current stack
 */
async function addNewCard() {
    if (!currentStack) return;
    
    const name = prompt('Enter name for new card:') || `Card ${(currentStack.cards || []).length + 1}`;
    
    const newCard = {
        name: name.trim(),
        svg: null,
        created_at: new Date().toISOString()
    };
    
    if (!currentStack.cards) currentStack.cards = [];
    currentStack.cards.push(newCard);
    currentStack.updated_at = new Date().toISOString();
    
    try {
        if (window.__TAURI__) {
            await window.__TAURI__.core.invoke('save_magistack', {
                name: currentStack.name,
                cards: currentStack.cards
            });
        }
        
        await saveStacks();
        updateEditCardList();
        
        // Auto-select the new card
        selectCardForEdit(newCard, currentStack.cards.length - 1);
        
        console.log(`✅ Added new card: ${name}`);
        
    } catch (error) {
        console.error('❌ Error adding card:', error);
        alert('Failed to add card. Please try again.');
    }
}

/**
 * Rename a card
 */
async function renameCard(cardIndex) {
    if (!currentStack || !currentStack.cards || !currentStack.cards[cardIndex]) return;
    
    const card = currentStack.cards[cardIndex];
    const newName = prompt('Enter new name for card:', card.name);
    if (!newName || newName.trim() === '') return;
    
    card.name = newName.trim();
    currentStack.updated_at = new Date().toISOString();
    
    try {
        if (window.__TAURI__) {
            await window.__TAURI__.core.invoke('save_magistack', {
                name: currentStack.name,
                cards: currentStack.cards
            });
        }
        
        await saveStacks();
        updateEditCardList();
        updateCardEditor(card, cardIndex);
        
        console.log(`✅ Renamed card to: ${newName}`);
        
    } catch (error) {
        console.error('❌ Error renaming card:', error);
        alert('Failed to rename card. Please try again.');
    }
}

/**
 * Delete a card
 */
async function deleteCard(cardIndex) {
    if (!currentStack || !currentStack.cards || !currentStack.cards[cardIndex]) return;
    
    const card = currentStack.cards[cardIndex];
    if (!confirm(`Are you sure you want to delete "${card.name}"?`)) return;
    
    currentStack.cards.splice(cardIndex, 1);
    currentStack.updated_at = new Date().toISOString();
    
    try {
        if (window.__TAURI__) {
            await window.__TAURI__.core.invoke('save_magistack', {
                name: currentStack.name,
                cards: currentStack.cards
            });
        }
        
        await saveStacks();
        updateEditCardList();
        
        // Clear editor if this was the selected card
        if (currentCard === card) {
            currentCard = null;
            document.getElementById('card-editor-content').innerHTML = `
                <div style="text-align: center; color: #7f8c8d; margin-top: 2rem;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">🃏</div>
                    <div style="font-size: 1.2rem;">Select a card to edit</div>
                </div>
            `;
        }
        
        console.log(`✅ Deleted card: ${card.name}`);
        
    } catch (error) {
        console.error('❌ Error deleting card:', error);
        alert('Failed to delete card. Please try again.');
    }
}

/**
 * Exit edit mode and return to main screen
 */
async function exitEditMode() {
    isEditMode = false;
    currentCard = null;
    
    // Reload stacks to get latest data
    await loadStacks();
    
    // Return to main screen
    await initializeMainScreen();
    
    // Re-select current stack if it still exists
    if (currentStack) {
        const existingStack = stacks.find(s => s.name === currentStack.name);
        if (existingStack) {
            await selectStack(existingStack);
        }
    }
    
    console.log('🏠 Returned to main screen');
}

/**
 * Duplicate the current stack
 */
async function duplicateCurrentStack() {
    if (!currentStack) return;
    
    const newName = prompt('Enter name for duplicated stack:', currentStack.name + ' Copy');
    if (!newName || newName.trim() === '') return;
    
    const duplicatedStack = {
        name: newName.trim(),
        cards: JSON.parse(JSON.stringify(currentStack.cards || [])), // Deep copy
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };
    
    try {
        if (window.__TAURI__) {
            await window.__TAURI__.core.invoke('save_magistack', {
                name: duplicatedStack.name,
                cards: duplicatedStack.cards
            });
        }
        
        stacks.push(duplicatedStack);
        await saveStacks();
        updateStackList();
        
        console.log(`✅ Duplicated stack: ${newName}`);
        
    } catch (error) {
        console.error('❌ Error duplicating stack:', error);
        alert('Failed to duplicate stack. Please try again.');
    }
}

/**
 * Delete the current stack
 */
async function deleteCurrentStack() {
    console.log('🎯 DELETE: Function called');
    console.log('🎯 DELETE: Current stack:', currentStack);
    
    if (!currentStack) {
        console.log('❌ DELETE: No current stack selected');
        await showCustomAlert('No Stack Selected', 'Please select a stack to delete first.');
        return;
    }
    
    console.log(`🎯 DELETE: Confirming deletion of stack: "${currentStack.name}"`);
    
    // Use custom modal instead of confirm() for Tauri compatibility
    const confirmed = await showCustomConfirm(
        'Delete Stack', 
        `Are you sure you want to delete "${currentStack.name}"? This action cannot be undone.`,
        'Delete',
        'Cancel'
    );
    
    if (!confirmed) {
        console.log('🎯 DELETE: User cancelled deletion');
        return;
    }
    
    console.log('🎯 DELETE: User confirmed deletion, proceeding...');
    
    try {
        if (window.__TAURI__) {
            console.log(`🗑️ Attempting to delete stack: "${currentStack.name}"`);
            const result = await window.__TAURI__.core.invoke('delete_magistack', { name: currentStack.name });
            console.log('✅ Delete result:', result);
        }
        
        // Clean up localStorage entries related to this stack
        console.log(`🧹 Cleaning up localStorage for stack: "${currentStack.name}"`);
        cleanupLocalStorageForStack(currentStack.name);
        
        // Remove from local array
        const index = stacks.findIndex(s => s.name === currentStack.name);
        if (index > -1) {
            stacks.splice(index, 1);
        }
        
        await saveStacks();
        
        // Clear current selection
        currentStack = null;
        
        // Update UI
        updateStackList();
        
        // Also clear the stack list selection styling
        const stackItems = document.querySelectorAll('.stack-item');
        stackItems.forEach(item => item.classList.remove('selected'));
        
        // Clear preview
        const previewContent = document.getElementById('preview-content');
        if (previewContent) {
            previewContent.innerHTML = `
                <div class="empty-preview">
                    <div class="empty-preview-icon">🃏</div>
                    <div class="empty-preview-text">Select a stack to preview</div>
                    <div class="empty-preview-subtext">Choose a MagiStack from the left to see its cards</div>
                </div>
            `;
        }
        
        // Hide action buttons and BDO pubkey display
        const actionButtons = document.getElementById('action-buttons');
        const bdoPubKeyDisplay = document.getElementById('bdo-pubkey-display');
        if (actionButtons) {
            actionButtons.style.display = 'none';
        }
        if (bdoPubKeyDisplay) {
            bdoPubKeyDisplay.style.display = 'none';
        }
        
        console.log(`✅ Deleted stack`);
        
    } catch (error) {
        console.error('❌ Error deleting stack:', error);
        alert('Failed to delete stack. Please try again.');
    }
}

/**
 * Clean up localStorage entries related to a specific stack
 * @param {string} stackName - The name of the stack being deleted
 */
function cleanupLocalStorageForStack(stackName) {
    const keysToDelete = [];
    
    // Find all localStorage keys related to this stack
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        
        // Check for various patterns that might be related to this stack
        if (key && (
            // Menu catalog data
            key.startsWith('menu-catalog-') ||
            // Menu card data  
            key.startsWith('menu-card-') ||
            // Stack name references
            key.includes(stackName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()) ||
            // Any key containing the stack name
            key.includes(stackName)
        )) {
            // Verify this key is actually related to our stack
            try {
                const data = localStorage.getItem(key);
                if (data) {
                    const parsedData = JSON.parse(data);
                    
                    // Check if the data references this stack
                    if (parsedData.stackName === stackName ||
                        parsedData.metadata?.stackName === stackName ||
                        parsedData.title === stackName) {
                        keysToDelete.push(key);
                        console.log(`🗑️ Marking localStorage key for deletion: ${key}`);
                    }
                }
            } catch (e) {
                // If it's not JSON, check if the key pattern strongly suggests it's related
                if (key.includes(stackName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase())) {
                    keysToDelete.push(key);
                    console.log(`🗑️ Marking non-JSON localStorage key for deletion: ${key}`);
                }
            }
        }
    }
    
    // Delete all identified keys
    keysToDelete.forEach(key => {
        localStorage.removeItem(key);
        console.log(`✅ Deleted localStorage key: ${key}`);
    });
    
    console.log(`🧹 Cleaned up ${keysToDelete.length} localStorage entries for stack: "${stackName}"`);
}

/**
 * Clean up all menu-related localStorage entries (utility function)
 */
function cleanupAllMenuLocalStorage() {
    const keysToDelete = [];
    
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        
        if (key && (
            key.startsWith('menu-catalog-') ||
            key.startsWith('menu-card-')
        )) {
            keysToDelete.push(key);
        }
    }
    
    keysToDelete.forEach(key => {
        localStorage.removeItem(key);
        console.log(`✅ Deleted menu localStorage key: ${key}`);
    });
    
    console.log(`🧹 Cleaned up ${keysToDelete.length} menu localStorage entries`);
    return keysToDelete.length;
}

/**
 * Import a stack (placeholder)
 */
async function importStack() {
    alert('📥 Import functionality coming soon!\n\nThis will allow you to import MagiStacks from files or other users.');
}

/**
 * Navigate to a card via BDO
 */
async function navigateToCardViaBDO(baseUrl, cardKey) {
    console.log(`🧭 Navigating to card: ${cardKey} via ${baseUrl}`);
    
    try {
        if (!window.__TAURI__) {
            alert(`🧭 Navigation: ${cardKey}\n\nWould navigate to card via BDO at ${baseUrl}`);
            return;
        }
        
        const cardData = await window.__TAURI__.core.invoke('navigate_to_card', {
            baseUrl: baseUrl,
            cardKey: cardKey
        });
        
        if (cardData && cardData.svg) {
            // Display the navigated card in a new window/modal
            await displayNavigatedCard(cardKey, cardData.svg, baseUrl);
        } else {
            alert(`❌ Card not found: ${cardKey}`);
        }
        
    } catch (error) {
        console.error('❌ Navigation error:', error);
        alert(`❌ Failed to navigate to card: ${cardKey}\n\nError: ${error}`);
    }
}

/**
 * Display a card retrieved via BDO navigation
 */
async function displayNavigatedCard(cardKey, svgContent, baseUrl) {
    console.log(`🎴 Displaying navigated card: ${cardKey}`);
    
    // Create modal for displaying the navigated card
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;
    
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    modalContent.style.cssText = `
        background: white;
        border-radius: 12px;
        padding: 2rem;
        max-width: 80vw;
        max-height: 80vh;
        overflow: auto;
        position: relative;
    `;
    
    modalContent.innerHTML = `
        <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
            <div>
                <div class="modal-title" style="font-size: 1.3rem; font-weight: bold; color: #2c3e50;">
                    🧭 Navigated Card: ${cardKey}
                </div>
                <div style="font-size: 0.9rem; color: #7f8c8d; margin-top: 0.3rem;">
                    Retrieved from: ${baseUrl}
                </div>
            </div>
            <button class="modal-close" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #7f8c8d; padding: 0.5rem;" onclick="this.closest('.modal-overlay').remove()">
                ✕
            </button>
        </div>
        <div class="navigated-card-content" style="border: 1px solid #e0e0e0; border-radius: 8px; padding: 1rem; background: #fafafa; min-height: 300px; display: flex; align-items: center; justify-content: center;">
            ${svgContent}
        </div>
        <div style="margin-top: 1rem; text-align: center; color: #7f8c8d; font-size: 0.9rem;">
            💡 This card was retrieved via BDO navigation from another base
        </div>
    `;
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // Apply spell handlers to the navigated card (using fount system)
    setTimeout(() => {
        if (window.applySpellHandlers) {
            window.applySpellHandlers(modalContent);
        }
    }, 100);
    
    // Close on click outside
    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.remove();
        }
    });
}

/**
 * Get a card from current base's BDO using cardKey (legacy function)
 */
async function getCardFromBDO(cardKey) {
    console.log(`🌐 Getting card from BDO: ${cardKey}`);
    
    try {
        if (!window.__TAURI__) {
            console.warn('Tauri not available - using mock data');
            return { svg: '<svg><text x="50" y="50">Mock Card</text></svg>' };
        }
        
        const cardData = await window.__TAURI__.core.invoke('get_card_from_bdo', {
            cardKey: cardKey
        });
        
        console.log(`✅ Retrieved card from BDO: ${cardKey}`);
        return cardData;
        
    } catch (error) {
        console.error('❌ Failed to get card from BDO:', error);
        throw new Error(`Failed to get card: ${error}`);
    }
}

/**
 * Fetch a card from BDO using bdoPubKey (used for menu card import)
 */
async function fetchCardFromBDO(bdoPubKey) {
    console.log(`🌐 Fetching card from BDO with bdoPubKey: ${bdoPubKey?.substring(0, 12)}...`);
    
    try {
        if (!window.__TAURI__) {
            console.warn('⚠️ Tauri not available - cannot fetch from BDO');
            return null;
        }
        
        if (!bdoPubKey) {
            console.warn('⚠️ No bdoPubKey provided');
            return null;
        }
        
        const cardData = await window.__TAURI__.core.invoke('get_card_from_bdo', {
            bdoPubKey: bdoPubKey
        });
        
        console.log(`✅ Fetched card from BDO using bdoPubKey: ${bdoPubKey.substring(0, 12)}...`);
        console.log('🎯 BDO Response:', cardData);
        
        return cardData;
        
    } catch (error) {
        console.error(`❌ Failed to fetch card from BDO using bdoPubKey ${bdoPubKey?.substring(0, 12)}:`, error);
        return null;
    }
}

/**
 * List all cards available in BDO
 */
async function listCardsInBDO() {
    console.log(`📚 Listing cards in BDO`);
    
    try {
        if (!window.__TAURI__) {
            console.warn('Tauri not available - returning empty list');
            return [];
        }
        
        const cardKeys = await window.__TAURI__.core.invoke('list_cards_in_bdo');
        
        console.log(`✅ Found ${cardKeys.length} cards in BDO:`, cardKeys);
        return cardKeys;
        
    } catch (error) {
        console.error('❌ Failed to list cards in BDO:', error);
        return [];
    }
}

/**
 * Show BDO card browser
 */
async function showBDOCardBrowser() {
    console.log(`🗂️ Opening BDO card browser`);
    
    try {
        const cardKeys = await listCardsInBDO();
        
        if (cardKeys.length === 0) {
            alert('📦 No cards found in BDO\n\nUpload some cards first to see them here.');
            return;
        }
        
        // Create browser modal
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 600px; width: 90%;">
                <div class="modal-header">
                    <div class="modal-title">🗂️ BDO Card Browser</div>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">✕</button>
                </div>
                <div style="margin-bottom: 1rem; color: #7f8c8d;">
                    ${cardKeys.length} cards available via BDO navigation
                </div>
                <div id="bdo-card-list" style="max-height: 400px; overflow-y: auto;">
                    ${cardKeys.map(key => `
                        <div style="background: white; border: 1px solid #e0e0e0; border-radius: 6px; padding: 1rem; margin-bottom: 0.5rem; cursor: pointer; transition: all 0.2s ease;"
                             onmouseover="this.style.borderColor='#9b59b6'; this.style.transform='translateY(-1px)'"
                             onmouseout="this.style.borderColor='#e0e0e0'; this.style.transform='translateY(0)'"
                             onclick="navigateToCardViaBDO('${getServiceUrl('bdo')}', '${key}'); this.closest('.modal-overlay').remove();">
                            <div style="font-weight: bold; color: #2c3e50;">${key}</div>
                            <div style="font-size: 0.8rem; color: #7f8c8d; margin-top: 0.3rem;">Click to navigate via BDO</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Close on click outside
        modal.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.remove();
            }
        });
        
    } catch (error) {
        console.error('❌ Error showing BDO browser:', error);
        alert('❌ Failed to load BDO card browser');
    }
}

// Global function exports for HTML onclick handlers
window.createNewStack = createNewStack;
window.createSeedStack = createSeedStack;
window.copyBdoPubKey = copyBdoPubKey;
console.log('🔗 Global functions exported to window:', { 
    createNewStack: typeof window.createNewStack,
    createSeedStack: typeof window.createSeedStack,
    copyBdoPubKey: typeof window.copyBdoPubKey,
    editCurrentStack: typeof window.editCurrentStack 
});
window.importStack = importStack;
window.editCurrentStack = editCurrentStack;
window.duplicateCurrentStack = duplicateCurrentStack;
window.deleteCurrentStack = deleteCurrentStack;
window.exitEditMode = exitEditMode;
window.addNewCard = addNewCard;
window.uploadSVGForCard = uploadSVGForCard;
window.handleSVGUpload = handleSVGUpload;
window.renameCard = renameCard;
window.deleteCard = deleteCard;
window.showBDOCardBrowser = showBDOCardBrowser;
window.navigateToCardViaBDO = navigateToCardViaBDO;
window.getCardFromBDO = getCardFromBDO;
window.listCardsInBDO = listCardsInBDO;

/**
 * Fetch menu data from BDO using bdoPubKey
 */
async function fetchMenuFromBDO(bdoPubKey) {
    console.log('📡 Fetching menu from BDO with bdoPubKey:', bdoPubKey.substring(0, 10) + '...');
    
    try {
        // For demo purposes, create a sample menu if it's a demo key
        if (bdoPubKey.startsWith('demo_menu_')) {
            console.log('🎭 Creating demo menu for testing');
            return createDemoMenuData(bdoPubKey);
        }
        
        // Try to fetch card data from BDO using bdoPubKey
        console.log('🎯 MAGICARD_WORKFLOW: 🌐 Attempting BDO API call...');
        if (window.__TAURI__ && window.__TAURI__.core && window.__TAURI__.core.invoke) {
            try {
                // Try to fetch the card from BDO using the bdoPubKey
                console.log('🔍 Calling get_card_from_bdo with pubKey:', bdoPubKey.substring(0, 12) + '...');
                
                const cardResult = await window.__TAURI__.core.invoke('get_card_from_bdo', {
                    bdoPubKey: bdoPubKey
                });
                
                if (cardResult && cardResult.success && cardResult.card) {
                    console.log('✅ Successfully fetched data from BDO');
                    console.log('🔍 Full BDO cardResult structure:', JSON.stringify(cardResult, null, 2));
                    
                    // Extract the data from BDO response
                    const bdoData = cardResult.card.data || cardResult.card;
                    console.log('🔍 Extracted BDO data:', JSON.stringify(bdoData, null, 2));
                    
                    // Check if this is a menu catalog (has cards array) or individual card
                    if (bdoData.cards && Array.isArray(bdoData.cards)) {
                        console.log('🍽️ Found menu catalog with cards array:', bdoData.cards.length);
                        
                        // This is a complete menu catalog - return it directly
                        const menuCatalogData = {
                            title: bdoData.title || 'Imported Menu',
                            description: bdoData.description,
                            bdoPubKey: cardResult.card.pubKey || bdoPubKey,
                            source: 'BDO_MENU_CATALOG',
                            cards: bdoData.cards,
                            products: bdoData.products,
                            menus: bdoData.menus,
                            metadata: bdoData.metadata
                        };
                        
                        console.log('🔄 Returning complete menu catalog data:', {
                            title: menuCatalogData.title,
                            cardCount: menuCatalogData.cards?.length || 0,
                            productCount: menuCatalogData.products?.length || 0,
                            hasMenus: !!menuCatalogData.menus
                        });
                        return menuCatalogData;
                        
                    } else {
                        console.log('🎴 Found individual card, not menu catalog');
                        
                        // This is an individual card - extract SVG content
                        const svgContent = bdoData.svgContent || bdoData.svg;
                        console.log('🎨 Individual card SVG:', !!svgContent, svgContent ? svgContent.length + ' chars' : 'No SVG');
                        
                        const individualCardData = {
                            title: bdoData.cardName || 'Imported Card',
                            bdoPubKey: cardResult.card.pubKey || bdoPubKey,
                            svgContent: svgContent,
                            source: 'BDO_INDIVIDUAL_CARD',
                            cards: [{
                                name: bdoData.cardName || 'Card',
                                svg: svgContent,
                                cardBdoPubKey: cardResult.card.pubKey || bdoPubKey,
                                type: bdoData.cardType || 'unknown'
                            }]
                        };
                        
                        console.log('🔄 Returning individual card data:', individualCardData.title);
                        return individualCardData;
                    }
                } else {
                    console.log('⚠️ BDO call succeeded but no card found:', cardResult?.error || 'Unknown error');
                }
            } catch (error) {
                console.log('❌ Error calling BDO API:', error);
            }
        } else {
            console.log('⚠️ Tauri API not available, skipping BDO call');
        }

        // Fallback: Check localStorage for development
        console.log('🎯 MAGICARD_WORKFLOW: 📦 Checking localStorage as fallback...');
        const keys = Object.keys(localStorage);
        for (const key of keys) {
            if (key.startsWith('menu-catalog-') || key.startsWith('menu-card-')) {
                try {
                    const catalogData = JSON.parse(localStorage.getItem(key));
                    // Check if this is card data with the matching bdoPubKey
                    if (catalogData.bdoPubKey === bdoPubKey || 
                        catalogData.metadata?.bdoPubKey === bdoPubKey ||
                        key.includes(bdoPubKey.substring(0, 12))) {
                        console.log('✅ Found card in localStorage:', key);
                        return catalogData;
                    }
                } catch (e) {
                    console.warn('⚠️ Error parsing localStorage item:', key);
                }
            }
        }
        
        console.log('❌ Card not found in BDO or localStorage');
        return null;
        
    } catch (error) {
        console.error('❌ Error fetching from BDO:', error);
        return null;
    }
}

/**
 * Convert menu data to MagiStack format
 */
async function convertMenuToMagiStack(menuData) {
    console.log('🔄 Converting menu catalog to MagiStack:', menuData.title);
    console.log('🎯 MAGICARD_WORKFLOW: 📋 Full menuData structure received:', JSON.stringify(menuData, null, 2));
    console.log('🎯 MAGICARD_WORKFLOW: 📋 Menu catalog structure summary:', {
        hasCards: !!menuData.cards,
        cardCount: menuData.cards?.length || 0,
        hasProducts: !!menuData.products,
        productCount: menuData.products?.length || 0,
        source: menuData.source,
        allKeys: Object.keys(menuData)
    });
    
    try {
        const stackName = `${menuData.title} (Menu Cards)`;
        const cards = [];
        
        // Load the individual SVG cards created by Ninefy
        if (menuData.cards && menuData.cards.length > 0) {
            console.log('🎯 MAGICARD_WORKFLOW: 🎴 Loading individual SVG cards...');
            
            for (let i = 0; i < menuData.cards.length; i++) {
                const cardInfo = menuData.cards[i];
                console.log(`🎯 MAGICARD_WORKFLOW: Loading card ${i + 1}: ${cardInfo.name} with bdoPubKey: ${cardInfo.cardBdoPubKey?.substring(0, 12)}...`);
                
                try {
                    // Load the SVG content from the card data (first try direct content)
                    let svgContent = cardInfo.svg || cardInfo.svgContent;
                    
                    if (svgContent) {
                        console.log(`📋 Found SVG content directly in card info: ${svgContent.length} chars`);
                    } else {
                        console.log(`🔍 No direct SVG content in card info. Available fields:`, Object.keys(cardInfo));
                    }
                    
                    // If SVG content is not in the card info, fetch from BDO using the card's bdoPubKey
                    if (!svgContent && cardInfo.cardBdoPubKey) {
                        console.log(`🌐 Fetching SVG from BDO for card: ${cardInfo.name}`);
                        
                        // Fetch the individual card from BDO using its unique pubkey
                        const cardFromBDO = await fetchCardFromBDO(cardInfo.cardBdoPubKey);
                        
                        if (cardFromBDO && cardFromBDO.card && cardFromBDO.card.data) {
                            // Extract SVG content from the BDO card data structure
                            const bdoData = cardFromBDO.card.data;
                            svgContent = bdoData.svgContent || bdoData.svg || bdoData.cardSvg;
                            console.log(`🌐 Successfully fetched card SVG from BDO: ${svgContent ? svgContent.length + ' chars' : 'no content'}`);
                            console.log(`🔍 BDO card data keys:`, Object.keys(bdoData));
                        } else if (cardFromBDO && cardFromBDO.data) {
                            // Alternative structure - data directly
                            svgContent = cardFromBDO.data.svgContent || cardFromBDO.data.svg || cardFromBDO.data.cardSvg;
                            console.log(`🌐 Successfully fetched card SVG from BDO (alt structure): ${svgContent ? svgContent.length + ' chars' : 'no content'}`);
                            console.log(`🔍 BDO data keys:`, Object.keys(cardFromBDO.data));
                        } else {
                            console.warn(`⚠️ Unexpected BDO response structure for card: ${cardInfo.name}`);
                            console.log(`🔍 Full BDO response:`, cardFromBDO);
                        }
                    }
                    
                    // Fallback: try localStorage
                    if (!svgContent) {
                        svgContent = localStorage.getItem(`menu-card-${cardInfo.cardBdoPubKey}`);
                        if (svgContent) {
                            console.log(`📱 Loaded card SVG from localStorage: ${svgContent.length} chars`);
                        }
                    }
                    
                    if (svgContent) {
                        const card = {
                            name: cardInfo.name,
                            svg: svgContent,
                            created_at: new Date().toISOString(),
                            metadata: {
                                cardBdoPubKey: cardInfo.cardBdoPubKey,
                                price: cardInfo.price,
                                originalProductId: cardInfo.localId,
                                importedFrom: 'ninefy-menu-card'
                            }
                        };
                        
                        cards.push(card);
                        console.log(`✅ Loaded card: ${cardInfo.name} (SVG: ${svgContent.length} chars)`);
                        console.log(`🎨 Card SVG preview: ${svgContent.substring(0, 100)}...`);
                    } else {
                        console.warn(`⚠️ Could not load SVG for card: ${cardInfo.name} - no content found in BDO, localStorage, or card data`);
                    }
                } catch (cardError) {
                    console.error(`❌ Failed to load card ${cardInfo.name}:`, cardError);
                }
            }
        } else if (menuData.products && menuData.products.length > 0) {
            // Fallback: if no cards array, try to load from products with cardBdoPubKey
            console.log('🎯 MAGICARD_WORKFLOW: 🔄 Fallback: Loading from products...');
            
            for (let i = 0; i < menuData.products.length; i++) {
                const product = menuData.products[i];
                
                if (product.cardBdoPubKey) {
                    try {
                        const svgContent = localStorage.getItem(`menu-card-${product.cardBdoPubKey}`);
                        
                        if (svgContent) {
                            const card = {
                                name: product.name,
                                svg: svgContent,
                                created_at: new Date().toISOString(),
                                metadata: {
                                    cardBdoPubKey: product.cardBdoPubKey,
                                    price: product.price,
                                    originalProductId: product.id,
                                    importedFrom: 'ninefy-menu-card-fallback'
                                }
                            };
                            
                            cards.push(card);
                            console.log(`✅ Loaded card from product: ${product.name}`);
                        }
                    } catch (error) {
                        console.warn(`⚠️ Failed to load card for product ${product.name}:`, error);
                    }
                }
            }
        }
        
        if (cards.length === 0) {
            throw new Error('No cards could be loaded from the menu catalog');
        }
        
        // Create the MagiStack
        const magistack = {
            name: stackName,
            cards: cards,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            metadata: {
                importedFrom: 'ninefy-menu-catalog',
                originalBdoPubKey: menuData.bdoPubKey || menuData.metadata?.bdoPubKey,
                originalTitle: menuData.title,
                cardCount: cards.length,
                firstCardBdoPubKey: menuData.metadata?.firstCardBdoPubKey,
                hasSpellNavigation: true
            }
        };
        
        // Save the stack
        if (window.__TAURI__) {
            await window.__TAURI__.core.invoke('save_magistack', {
                name: magistack.name,
                cards: magistack.cards
            });
        }
        
        console.log('✅ MagiStack created successfully:', magistack.name);
        console.log('📊 MagiStack card count:', magistack.cards.length);
        console.log('🎨 First card SVG exists:', !!magistack.cards[0]?.svg);
        console.log('🎨 First card SVG length:', magistack.cards[0]?.svg?.length || 0);
        console.log('🎯 MAGICARD_WORKFLOW: 🎉 Cards loaded with spell navigation enabled');
        
        return magistack;
        
    } catch (error) {
        console.error('❌ Error converting menu to MagiStack:', error);
        return null;
    }
}

/**
 * Create a card from a menu product
 */
async function createCardFromMenuProduct(product, index, menuData) {
    console.log('🃏 Creating card from product:', product.name);
    
    try {
        // Format price for display
        const priceDisplay = product.price ? `$${(product.price / 100).toFixed(2)}` : 'Free';
        
        // Create SVG card
        const cardSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="300" height="400" viewBox="0 0 300 400" card-name="${product.name}">
  <!-- Card Background -->
  <rect x="0" y="0" width="300" height="400" fill="#f8f9fa" stroke="#27ae60" stroke-width="3" rx="15"/>
  
  <!-- Card Border Decoration -->
  <rect x="10" y="10" width="280" height="380" fill="none" stroke="#2ecc71" stroke-width="2" rx="10"/>
  
  <!-- Menu Item Header -->
  <rect x="20" y="20" width="260" height="50" fill="#27ae60" rx="8"/>
  
  <!-- Menu Item Title -->
  <text x="150" y="50" text-anchor="middle" fill="white" font-family="serif" font-size="16" font-weight="bold">
    🍽️ MENU ITEM
  </text>
  
  <!-- Product Name -->
  <text x="150" y="100" text-anchor="middle" fill="#2c3e50" font-family="serif" font-size="18" font-weight="bold">
    ${product.name}
  </text>
  
  <!-- Price Display -->
  <circle cx="150" cy="140" r="25" fill="#f39c12" stroke="#e67e22" stroke-width="2"/>
  <text x="150" y="148" text-anchor="middle" fill="white" font-size="16" font-weight="bold">${priceDisplay}</text>
  
  <!-- Category/Menu Info -->
  <text x="150" y="180" text-anchor="middle" fill="#7f8c8d" font-size="12">
    From: ${menuData.title}
  </text>
  
  <!-- Interactive Elements -->
  <rect spell="order" x="50" y="220" width="200" height="40" fill="#3498db" stroke="#2980b9" stroke-width="2" rx="5"/>
  <text spell="order" x="150" y="245" text-anchor="middle" fill="white" font-size="14" font-weight="bold">Order This Item</text>
  
  <!-- Menu Details -->
  <g spell="details">
    <rect x="20" y="280" width="260" height="60" fill="rgba(52, 152, 219, 0.1)" stroke="#3498db" stroke-width="1" rx="5"/>
    <text x="30" y="300" fill="#2c3e50" font-size="12" font-weight="bold">Menu Item Details:</text>
    <text x="30" y="320" fill="#34495e" font-size="10">Category: ${product.category || 'menu-item'}</text>
    <text x="30" y="335" fill="#34495e" font-size="10">ID: ${product.id}</text>
  </g>
  
  <!-- Navigation to other menu items -->
  ${index > 0 ? `
  <rect spell="magicard" spell-components='{"bdoPubKey":"menu_prev_${index}"}' x="20" y="350" width="60" height="30" fill="#9b59b6" stroke="#8e44ad" stroke-width="2" rx="5"/>
  <text spell="magicard" spell-components='{"bdoPubKey":"menu_prev_${index}"}' x="50" y="370" text-anchor="middle" fill="white" font-size="10">← Prev</text>
  ` : ''}
  
  ${index < menuData.products.length - 1 ? `
  <rect spell="magicard" spell-components='{"bdoPubKey":"menu_next_${index}"}' x="220" y="350" width="60" height="30" fill="#9b59b6" stroke="#8e44ad" stroke-width="2" rx="5"/>
  <text spell="magicard" spell-components='{"bdoPubKey":"menu_next_${index}"}' x="250" y="370" text-anchor="middle" fill="white" font-size="10">Next →</text>
  ` : ''}
</svg>`;

        const card = {
            name: product.name,
            svg: cardSvg,
            created_at: new Date().toISOString(),
            metadata: {
                originalProduct: product,
                menuTitle: menuData.title,
                price: product.price,
                index: index
            }
        };
        
        // Save card SVG if using Tauri
        if (window.__TAURI__) {
            await window.__TAURI__.core.invoke('save_card_svg', {
                stackName: `${menuData.title} (Menu)`,
                cardName: card.name,
                svgContent: card.svg
            });
        }
        
        return card;
        
    } catch (error) {
        console.error('❌ Error creating card from product:', error);
        return null;
    }
}

/**
 * Create demo menu data for testing
 */
function createDemoMenuData(bdoPubKey) {
    return {
        title: 'Demo Restaurant Menu',
        description: 'A sample restaurant menu for testing MagiCard import',
        bdoPubKey: bdoPubKey,
        products: [
            {
                id: 'demo_item_1',
                name: 'Margherita Pizza',
                price: 1250, // $12.50
                category: 'pizza',
                metadata: { category: 'main', cuisine: 'italian' }
            },
            {
                id: 'demo_item_2', 
                name: 'Caesar Salad',
                price: 850, // $8.50
                category: 'salad',
                metadata: { category: 'appetizer', cuisine: 'american' }
            },
            {
                id: 'demo_item_3',
                name: 'Chocolate Cake',
                price: 650, // $6.50
                category: 'dessert',
                metadata: { category: 'dessert', cuisine: 'american' }
            }
        ],
        metadata: {
            totalProducts: 3,
            menuCount: 1,
            createdAt: new Date().toISOString(),
            bdoPubKey: bdoPubKey
        }
    };
}

/**
 * Transition Spell Handlers
 * These functions handle the interactive transition animations
 */

/**
 * Handle fade transition spell
 */
function handleFadeTransition(element) {
    console.log('✨ Casting fade transition spell');
    
    // Find the SVG container
    const svg = element.closest('svg');
    if (!svg) return;
    
    // Find all fade demo elements
    const fadeOrbs = svg.querySelectorAll('#fadeDemo circle');
    
    // Trigger fade animations on each orb with staggered timing
    fadeOrbs.forEach((orb, index) => {
        const animations = orb.querySelectorAll('animate[attributeName="opacity"]');
        if (animations.length >= 2) {
            // Trigger fade out, then fade in after delay
            setTimeout(() => {
                animations[0].beginElement(); // Fade out
                setTimeout(() => {
                    animations[1].beginElement(); // Fade in
                }, 500);
            }, index * 200); // Stagger by 200ms
        }
    });
}

/**
 * Handle slide transition spell
 */
function handleSlideTransition(element) {
    console.log('➡️ Casting slide transition spell');
    
    // Find the SVG container
    const svg = element.closest('svg');
    if (!svg) return;
    
    // Find all slide demo elements
    const slideOrbs = svg.querySelectorAll('#slideDemo circle');
    
    // Trigger slide animations on each orb with staggered timing
    slideOrbs.forEach((orb, index) => {
        const animation = orb.querySelector('animateTransform[attributeName="transform"]');
        if (animation) {
            setTimeout(() => {
                animation.beginElement();
            }, index * 100); // Stagger by 100ms
        }
    });
}

/**
 * Handle master transition spell (combines multiple effects)
 */
function handleMasterTransition(element) {
    console.log('🎭 Casting master transition spell');
    
    // Find the SVG container
    const svg = element.closest('svg');
    if (!svg) return;
    
    // Find all master demo elements
    const masterOrbs = svg.querySelectorAll('#masterDemo circle');
    
    // Trigger all animations on each orb with staggered timing
    masterOrbs.forEach((orb, index) => {
        const rotateAnimation = orb.querySelector('animateTransform[attributeName="transform"]');
        const fadeAnimation = orb.querySelector('animate[attributeName="opacity"]');
        
        setTimeout(() => {
            if (rotateAnimation) rotateAnimation.beginElement();
            if (fadeAnimation) fadeAnimation.beginElement();
        }, index * 250); // Stagger by 250ms
    });
}

/**
 * Handle transition test spells (the flashy test buttons)
 */
function handleTransitionTest(spellType, element) {
    console.log(`🧪 Testing ${spellType} transition`);
    
    switch (spellType) {
        case 'fadeTest':
            // Trigger the main fade transition
            const fadeElement = element.closest('svg').querySelector('[spell="fade-transition"]');
            if (fadeElement) handleFadeTransition(fadeElement);
            break;
        case 'slideTest':
            // Trigger the main slide transition
            const slideElement = element.closest('svg').querySelector('[spell="slide-transition"]');
            if (slideElement) handleSlideTransition(slideElement);
            break;
        case 'finalTest':
            // Trigger the main master transition
            const masterElement = element.closest('svg').querySelector('[spell="master-transition"]');
            if (masterElement) handleMasterTransition(masterElement);
            break;
    }
}

/**
 * Handle transition demo spells (clicking on demo elements directly)
 */
function handleTransitionDemo(spellType, element) {
    console.log(`🎨 Demo ${spellType} transition`);
    
    // Find the SVG container
    const svg = element.closest('svg');
    if (!svg) return;
    
    switch (spellType) {
        case 'fade-demo':
            // Trigger fade on this specific element
            const fadeAnimation = element.querySelector('animate[attributeName="opacity"]');
            if (fadeAnimation) {
                fadeAnimation.beginElement();
            }
            break;
        case 'slide-demo':
            // Trigger slide on this specific element
            const slideAnimation = element.querySelector('animateTransform[attributeName="transform"]');
            if (slideAnimation) {
                slideAnimation.beginElement();
            }
            break;
        case 'final-demo':
            // Trigger all animations on this specific element
            const rotateAnim = element.querySelector('animateTransform[attributeName="transform"]');
            const fadeAnim = element.querySelector('animate[attributeName="opacity"]');
            if (rotateAnim) rotateAnim.beginElement();
            if (fadeAnim) fadeAnim.beginElement();
            break;
    }
}

/**
 * Handle info spells (informational buttons)
 */
function handleInfoSpell(spellType, element) {
    console.log(`ℹ️ Info spell: ${spellType}`);
    
    const infoMessages = {
        'fade-info': 'This demonstrates fade in/out transition effects using SVG animations.',
        'chain-info': 'Transition cards can be chained together for complex animation sequences.',
        'slide-info': 'This demonstrates sliding transition effects using transform animations.',
        'motion-info': 'Motion effects combine translation, scaling, and rotation transforms.',
        'master-info': 'Master transitions combine multiple animation types simultaneously.',
        'complete-info': 'Complete demo showcasing all transition capabilities in MagiCard.'
    };
    
    const message = infoMessages[spellType] || 'Informational element about transition effects.';
    alert(`ℹ️ ${message}`);
}