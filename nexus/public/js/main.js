/**
 * Nexus - Planet Nine Ecosystem Portal
 * Main application logic and portal navigation
 */

// Application state
const nexusState = {
    currentPortal: 'main',
    connectedBases: [],
    connectionStatus: 'connected',
    userProfile: null
};

// Portal routes
const PORTALS = {
    content: 'content.html',
    communications: 'communications.html', 
    shopping: 'shopping.html',
    bases: 'bases.html'
};

// Initialize Nexus on page load
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🌍 Nexus Portal - Planet Nine Ecosystem');
    
    // Initialize components
    await initializePortals();
    await loadConnectionStatus();
    
    // Set up event listeners
    setupPortalNavigation();
    setupConnectionMonitoring();
    
    console.log('✅ Nexus initialized successfully');
});

/**
 * Initialize portal cards with click handlers
 */
function initializePortals() {
    const portalCards = document.querySelectorAll('.portal-card');
    
    portalCards.forEach(card => {
        // Add keyboard navigation support
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'button');
        
        // Set ARIA labels for accessibility
        const portalType = card.dataset.portal;
        card.setAttribute('aria-label', `Navigate to ${getPortalDisplayName(portalType)} portal`);
        
        // Add hover effects and interactions
        card.addEventListener('mouseenter', () => {
            handlePortalHover(card, portalType);
        });
        
        card.addEventListener('mouseleave', () => {
            handlePortalLeave(card, portalType);
        });
    });
}

/**
 * Set up portal navigation (click and keyboard)
 */
function setupPortalNavigation() {
    const portalCards = document.querySelectorAll('.portal-card');
    
    portalCards.forEach(card => {
        // Mouse click navigation
        card.addEventListener('click', (e) => {
            e.preventDefault();
            const portalType = card.dataset.portal;
            navigateToPortal(portalType, card);
        });
        
        // Keyboard navigation
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const portalType = card.dataset.portal;
                navigateToPortal(portalType, card);
            }
        });
    });
}

/**
 * Navigate to a specific portal
 */
async function navigateToPortal(portalType, cardElement) {
    console.log(`🚀 Navigating to ${portalType} portal`);
    
    // Add loading state
    cardElement.classList.add('loading');
    
    try {
        // Validate portal type
        if (!PORTALS[portalType]) {
            throw new Error(`Unknown portal type: ${portalType}`);
        }
        
        // Check if services are available for this portal
        const servicesAvailable = await checkPortalServices(portalType);
        if (!servicesAvailable) {
            showPortalUnavailable(portalType);
            return;
        }
        
        // Navigate to portal page
        const portalUrl = PORTALS[portalType];
        window.location.href = portalUrl;
        
    } catch (error) {
        console.error(`❌ Failed to navigate to ${portalType} portal:`, error);
        showNavigationError(portalType, error.message);
    } finally {
        // Remove loading state after a delay
        setTimeout(() => {
            cardElement.classList.remove('loading');
        }, 1000);
    }
}

/**
 * Check if required services are available for a portal
 */
async function checkPortalServices(portalType) {
    const requiredServices = getRequiredServices(portalType);
    
    try {
        // Check service availability via API
        const response = await fetch('/api/services/status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ services: requiredServices })
        });
        
        if (response.ok) {
            const status = await response.json();
            return status.allAvailable;
        }
        
        // Fallback: assume services are available
        return true;
        
    } catch (error) {
        console.warn(`⚠️ Could not check service status for ${portalType}:`, error);
        // Graceful degradation: allow navigation anyway
        return true;
    }
}

/**
 * Get required services for each portal type
 */
function getRequiredServices(portalType) {
    const serviceMap = {
        content: ['dolores', 'bdo', 'julia'],
        communications: ['julia', 'continuebee'],
        shopping: ['sanora', 'addie', 'bdo'],
        bases: ['julia', 'continuebee', 'fount']
    };
    
    return serviceMap[portalType] || [];
}

/**
 * Load and update connection status
 */
async function loadConnectionStatus() {
    try {
        // Fetch connection status from API
        const response = await fetch('/api/bases/status');
        
        if (response.ok) {
            const data = await response.json();
            updateConnectionStatus(data);
        } else {
            // Fallback to mock data
            updateConnectionStatus({
                connected: true,
                bases: ['dev', 'test', 'prod'],
                total: 3
            });
        }
        
    } catch (error) {
        console.warn('⚠️ Could not load connection status:', error);
        // Show offline status
        updateConnectionStatus({
            connected: false,
            bases: [],
            total: 0
        });
    }
}

/**
 * Update connection status display
 */
function updateConnectionStatus(statusData) {
    const statusElement = document.getElementById('connectionStatus');
    const statusText = statusElement.querySelector('.status-text');
    
    // Update nexus state
    nexusState.connectedBases = statusData.bases || [];
    nexusState.connectionStatus = statusData.connected ? 'connected' : 'disconnected';
    
    // Update UI
    if (statusData.connected && statusData.total > 0) {
        statusElement.className = 'connection-status connected';
        statusText.textContent = `Connected to ${statusData.total} base${statusData.total === 1 ? '' : 's'}`;
    } else {
        statusElement.className = 'connection-status disconnected';
        statusText.textContent = 'Offline - No bases connected';
    }
}

/**
 * Set up connection monitoring (periodic checks)
 */
function setupConnectionMonitoring() {
    // Check connection status every 30 seconds
    setInterval(async () => {
        await loadConnectionStatus();
    }, 30000);
    
    // Monitor online/offline events
    window.addEventListener('online', () => {
        console.log('🌐 Network connection restored');
        loadConnectionStatus();
    });
    
    window.addEventListener('offline', () => {
        console.log('📴 Network connection lost');
        updateConnectionStatus({
            connected: false,
            bases: [],
            total: 0
        });
    });
}

/**
 * Handle portal hover effects
 */
function handlePortalHover(cardElement, portalType) {
    // Add any custom hover animations here
    console.log(`👆 Hovering over ${portalType} portal`);
}

/**
 * Handle portal leave effects
 */
function handlePortalLeave(cardElement, portalType) {
    // Clean up hover effects
    console.log(`👋 Left ${portalType} portal`);
}

/**
 * Show portal unavailable message
 */
function showPortalUnavailable(portalType) {
    const message = `The ${getPortalDisplayName(portalType)} portal is currently unavailable. Please check your base connections and try again.`;
    
    // Simple alert for now - could be enhanced with a modal
    alert(`🚫 Portal Unavailable\n\n${message}`);
}

/**
 * Show navigation error message
 */
function showNavigationError(portalType, errorMessage) {
    const message = `Failed to navigate to ${getPortalDisplayName(portalType)} portal.\n\nError: ${errorMessage}`;
    
    // Simple alert for now - could be enhanced with a modal
    alert(`❌ Navigation Error\n\n${message}`);
}

/**
 * Get human-readable portal display name
 */
function getPortalDisplayName(portalType) {
    const displayNames = {
        content: 'Content & Social',
        communications: 'Communications',
        shopping: 'Shopping',
        bases: 'Base Discovery'
    };
    
    return displayNames[portalType] || portalType;
}

/**
 * Utility function to handle escape key for modals/overlays
 */
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        // Close any open modals or overlays
        console.log('🔙 Escape key pressed');
    }
});

/**
 * Utility function for smooth scrolling
 */
function smoothScrollTo(element) {
    element.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
    });
}

/**
 * Debug function to expose state for development
 */
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.nexusDebug = {
        state: nexusState,
        navigateToPortal,
        checkPortalServices,
        loadConnectionStatus
    };
    
    console.log('🔧 Debug utilities available at window.nexusDebug');
}