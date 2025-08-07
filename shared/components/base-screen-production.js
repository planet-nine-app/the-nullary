/**
 * Production Base Screen Component for The Nullary
 * Uses real BDO data instead of demo data
 * Reusable across all Nullary apps
 */

/**
 * Create SVG base row for production use
 */
function createProductionBaseRow(base, config = {}) {
  const defaults = {
    width: 500,
    height: 80,
    expandable: true,
    theme: {
      colors: {
        background: '#1c1c20',
        surface: '#2a2a2e',
        primary: '#3eda82',
        secondary: '#9c42f5',
        text: '#ffffff',
        textMuted: '#777777',
        border: '#444444',
        highlight: '#555555'
      },
      typography: {
        fontFamily: 'Arial, sans-serif',
        fontSize: 14
      }
    }
  };
  
  const finalConfig = { ...defaults, ...config };
  const { theme } = finalConfig;
  
  // Create SVG container
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', finalConfig.width);
  svg.setAttribute('height', finalConfig.height);
  svg.setAttribute('viewBox', `0 0 ${finalConfig.width} ${finalConfig.height}`);
  svg.style.cursor = 'pointer';
  svg.style.marginBottom = '10px';
  
  // Create gradients
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  
  // Main gradient
  const mainGradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
  mainGradient.setAttribute('id', `base-gradient-${base.id || 'default'}`);
  mainGradient.setAttribute('x1', '0%');
  mainGradient.setAttribute('y1', '0%');
  mainGradient.setAttribute('x2', '100%');
  mainGradient.setAttribute('y2', '100%');
  
  const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
  stop1.setAttribute('offset', '0%');
  stop1.setAttribute('stop-color', theme.colors.surface);
  
  const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
  stop2.setAttribute('offset', '100%');
  stop2.setAttribute('stop-color', theme.colors.background);
  
  mainGradient.appendChild(stop1);
  mainGradient.appendChild(stop2);
  defs.appendChild(mainGradient);
  svg.appendChild(defs);
  
  // Background rectangle
  const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  bgRect.setAttribute('x', '10');
  bgRect.setAttribute('y', '10');
  bgRect.setAttribute('width', finalConfig.width - 20);
  bgRect.setAttribute('height', '60');
  bgRect.setAttribute('rx', '8');
  bgRect.setAttribute('fill', `url(#base-gradient-${base.id || 'default'})`);
  bgRect.setAttribute('stroke', base.connected ? theme.colors.primary : theme.colors.border);
  bgRect.setAttribute('stroke-width', base.connected ? '2' : '1');
  
  if (base.connected) {
    bgRect.style.filter = 'drop-shadow(0 0 8px rgba(62, 218, 130, 0.3))';
  }
  
  svg.appendChild(bgRect);
  
  // Status indicator
  const statusCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  statusCircle.setAttribute('cx', '35');
  statusCircle.setAttribute('cy', '40');
  statusCircle.setAttribute('r', '6');
  statusCircle.setAttribute('fill', base.connected ? theme.colors.primary : theme.colors.textMuted);
  
  if (base.connected) {
    statusCircle.style.filter = 'drop-shadow(0 0 6px rgba(62, 218, 130, 0.6))';
  }
  
  svg.appendChild(statusCircle);
  
  // Base name
  const nameText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  nameText.setAttribute('x', '55');
  nameText.setAttribute('y', '35');
  nameText.setAttribute('font-family', theme.typography.fontFamily);
  nameText.setAttribute('font-size', theme.typography.fontSize + 2);
  nameText.setAttribute('font-weight', 'bold');
  nameText.setAttribute('fill', theme.colors.text);
  nameText.textContent = base.name || 'Unknown Base';
  svg.appendChild(nameText);
  
  // Connection status
  const statusText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  statusText.setAttribute('x', '55');
  statusText.setAttribute('y', '52');
  statusText.setAttribute('font-family', theme.typography.fontFamily);
  statusText.setAttribute('font-size', theme.typography.fontSize - 1);
  statusText.setAttribute('fill', theme.colors.textMuted);
  
  let statusMessage = '';
  if (base.connected && base.joined) {
    statusMessage = '🟢 Connected & Joined';
  } else if (base.connected) {
    statusMessage = '🟡 Connected';
  } else {
    statusMessage = '🔴 Disconnected';
  }
  
  const serviceCount = Object.keys(base.dns || {}).length;
  statusMessage += ` • ${serviceCount} services`;
  
  statusText.textContent = statusMessage;
  svg.appendChild(statusText);
  
  // Action button
  const actionButton = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  actionButton.setAttribute('x', finalConfig.width - 100);
  actionButton.setAttribute('y', '25');
  actionButton.setAttribute('width', '80');
  actionButton.setAttribute('height', '30');
  actionButton.setAttribute('rx', '6');
  actionButton.setAttribute('fill', base.joined ? theme.colors.secondary : theme.colors.primary);
  actionButton.setAttribute('stroke', base.joined ? theme.colors.secondary : theme.colors.primary);
  actionButton.setAttribute('stroke-width', '1');
  actionButton.style.cursor = 'pointer';
  svg.appendChild(actionButton);
  
  const actionText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  actionText.setAttribute('x', finalConfig.width - 60);
  actionText.setAttribute('y', '44');
  actionText.setAttribute('font-family', theme.typography.fontFamily);
  actionText.setAttribute('font-size', theme.typography.fontSize - 1);
  actionText.setAttribute('font-weight', 'bold');
  actionText.setAttribute('fill', '#ffffff');
  actionText.setAttribute('text-anchor', 'middle');
  actionText.textContent = base.joined ? 'LEAVE' : 'JOIN';
  svg.appendChild(actionText);
  
  // Expandable content (if enabled)
  let expandedContent = null;
  let isExpanded = false;
  
  if (finalConfig.expandable) {
    // Expand icon
    const expandIcon = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    expandIcon.setAttribute('d', 'M460,35 L470,45 L480,35');
    expandIcon.setAttribute('stroke', theme.colors.text);
    expandIcon.setAttribute('stroke-width', '2');
    expandIcon.setAttribute('fill', 'none');
    expandIcon.style.cursor = 'pointer';
    svg.appendChild(expandIcon);
    
    // Create expanded content
    expandedContent = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    expandedContent.setAttribute('opacity', '0');
    expandedContent.setAttribute('transform', 'translateY(-20px)');
    expandedContent.style.transition = 'all 0.3s ease';
    
    // Expanded background
    const expandedBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    expandedBg.setAttribute('x', '10');
    expandedBg.setAttribute('y', '80');
    expandedBg.setAttribute('width', finalConfig.width - 20);
    expandedBg.setAttribute('height', '120');
    expandedBg.setAttribute('rx', '8');
    expandedBg.setAttribute('fill', theme.colors.surface);
    expandedBg.setAttribute('stroke', theme.colors.border);
    expandedBg.setAttribute('stroke-width', '1');
    expandedContent.appendChild(expandedBg);
    
    // Base description
    const descText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    descText.setAttribute('x', '25');
    descText.setAttribute('y', '105');
    descText.setAttribute('font-family', theme.typography.fontFamily);
    descText.setAttribute('font-size', theme.typography.fontSize);
    descText.setAttribute('fill', theme.colors.text);
    descText.textContent = base.description || 'No description available';
    expandedContent.appendChild(descText);
    
    // Services list
    const servicesTitle = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    servicesTitle.setAttribute('x', '25');
    servicesTitle.setAttribute('y', '130');
    servicesTitle.setAttribute('font-family', theme.typography.fontFamily);
    servicesTitle.setAttribute('font-size', theme.typography.fontSize);
    servicesTitle.setAttribute('font-weight', 'bold');
    servicesTitle.setAttribute('fill', theme.colors.text);
    servicesTitle.textContent = 'Available Services:';
    expandedContent.appendChild(servicesTitle);
    
    const servicesList = Object.keys(base.dns || {}).join(', ') || 'None';
    const servicesText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    servicesText.setAttribute('x', '25');
    servicesText.setAttribute('y', '150');
    servicesText.setAttribute('font-family', theme.typography.fontFamily);
    servicesText.setAttribute('font-size', theme.typography.fontSize - 1);
    servicesText.setAttribute('fill', theme.colors.textMuted);
    servicesText.textContent = servicesList;
    expandedContent.appendChild(servicesText);
    
    // Content tags (soma)
    if (base.soma) {
      const tagsTitle = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      tagsTitle.setAttribute('x', '25');
      tagsTitle.setAttribute('y', '175');
      tagsTitle.setAttribute('font-family', theme.typography.fontFamily);
      tagsTitle.setAttribute('font-size', theme.typography.fontSize);
      tagsTitle.setAttribute('font-weight', 'bold');
      tagsTitle.setAttribute('fill', theme.colors.text);
      tagsTitle.textContent = 'Content Types:';
      expandedContent.appendChild(tagsTitle);
      
      const tagsText = Object.entries(base.soma).map(([type, tags]) => 
        `${type}: ${Array.isArray(tags) ? tags.join(', ') : tags}`
      ).join(' • ');
      
      const tagsDisplay = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      tagsDisplay.setAttribute('x', '25');
      tagsDisplay.setAttribute('y', '190');
      tagsDisplay.setAttribute('font-family', theme.typography.fontFamily);
      tagsDisplay.setAttribute('font-size', theme.typography.fontSize - 1);
      tagsDisplay.setAttribute('fill', theme.colors.textMuted);
      tagsDisplay.textContent = tagsText || 'No content tags';
      expandedContent.appendChild(tagsDisplay);
    }
    
    svg.appendChild(expandedContent);
    
    // Toggle function
    const toggleExpand = () => {
      isExpanded = !isExpanded;
      
      if (isExpanded) {
        svg.setAttribute('height', '210');
        expandedContent.setAttribute('opacity', '1');
        expandedContent.setAttribute('transform', 'translateY(0)');
        expandIcon.setAttribute('d', 'M460,45 L470,35 L480,45');
      } else {
        svg.setAttribute('height', '80');
        expandedContent.setAttribute('opacity', '0');
        expandedContent.setAttribute('transform', 'translateY(-20px)');
        expandIcon.setAttribute('d', 'M460,35 L470,45 L480,35');
      }
    };
    
    // Click handlers
    expandIcon.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleExpand();
    });
    
    bgRect.addEventListener('click', toggleExpand);
  }
  
  // Action button click handler
  let onActionClick = null;
  actionButton.addEventListener('click', (e) => {
    e.stopPropagation();
    if (onActionClick) {
      onActionClick(base, base.joined ? 'leave' : 'join');
    }
  });
  
  // Return SVG with methods
  svg.setActionHandler = (handler) => {
    onActionClick = handler;
  };
  
  svg.updateBase = (updatedBase) => {
    // Update the base data and refresh display
    Object.assign(base, updatedBase);
    
    // Update status
    statusCircle.setAttribute('fill', base.connected ? theme.colors.primary : theme.colors.textMuted);
    bgRect.setAttribute('stroke', base.connected ? theme.colors.primary : theme.colors.border);
    
    // Update status text
    let newStatusMessage = '';
    if (base.connected && base.joined) {
      newStatusMessage = '🟢 Connected & Joined';
    } else if (base.connected) {
      newStatusMessage = '🟡 Connected';
    } else {
      newStatusMessage = '🔴 Disconnected';
    }
    
    const serviceCount = Object.keys(base.dns || {}).length;
    newStatusMessage += ` • ${serviceCount} services`;
    statusText.textContent = newStatusMessage;
    
    // Update button
    actionButton.setAttribute('fill', base.joined ? theme.colors.secondary : theme.colors.primary);
    actionText.textContent = base.joined ? 'LEAVE' : 'JOIN';
  };
  
  return svg;
}

/**
 * Create production base screen
 */
function createProductionBaseScreen(config = {}) {
  const defaults = {
    title: 'Base Servers',
    width: '100%',
    height: '100vh',
    showRefreshButton: true,
    theme: {
      colors: {
        background: '#1c1c20',
        surface: '#2a2a2e',
        primary: '#3eda82',
        secondary: '#9c42f5',
        text: '#ffffff',
        textMuted: '#777777',
        border: '#444444'
      },
      typography: {
        fontFamily: 'Arial, sans-serif',
        fontSize: 14,
        headerSize: 24
      }
    }
  };
  
  const finalConfig = { ...defaults, ...config };
  
  // Main container
  const container = document.createElement('div');
  container.style.cssText = `
    width: ${finalConfig.width};
    height: ${finalConfig.height};
    background: ${finalConfig.theme.colors.background};
    color: ${finalConfig.theme.colors.text};
    font-family: ${finalConfig.theme.typography.fontFamily};
    overflow-y: auto;
    position: relative;
    padding: 20px;
    box-sizing: border-box;
  `;
  
  // Header
  const header = document.createElement('div');
  header.style.cssText = `
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    position: sticky;
    top: 0;
    background: ${finalConfig.theme.colors.background};
    padding: 10px 0;
    z-index: 100;
  `;
  
  const title = document.createElement('h1');
  title.textContent = finalConfig.title;
  title.style.cssText = `
    margin: 0;
    font-size: ${finalConfig.theme.typography.headerSize}px;
    font-weight: bold;
    color: ${finalConfig.theme.colors.text};
  `;
  
  const refreshButton = document.createElement('button');
  refreshButton.textContent = '🔄 Refresh';
  refreshButton.style.cssText = `
    background: ${finalConfig.theme.colors.primary};
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 6px;
    font-family: ${finalConfig.theme.typography.fontFamily};
    font-size: ${finalConfig.theme.typography.fontSize}px;
    cursor: pointer;
    transition: background-color 0.2s;
  `;
  
  header.appendChild(title);
  if (finalConfig.showRefreshButton) {
    header.appendChild(refreshButton);
  }
  
  // Status area
  const statusArea = document.createElement('div');
  statusArea.style.cssText = `
    margin-bottom: 20px;
    padding: 10px 15px;
    background: ${finalConfig.theme.colors.surface};
    border-radius: 8px;
    font-size: ${finalConfig.theme.typography.fontSize - 1}px;
    color: ${finalConfig.theme.colors.textMuted};
  `;
  statusArea.textContent = 'Loading base servers...';
  
  // Bases container
  const basesContainer = document.createElement('div');
  basesContainer.style.cssText = `
    display: flex;
    flex-direction: column;
    gap: 10px;
  `;
  
  // Loading indicator
  const loadingIndicator = document.createElement('div');
  loadingIndicator.style.cssText = `
    text-align: center;
    padding: 40px;
    color: ${finalConfig.theme.colors.textMuted};
    font-size: ${finalConfig.theme.typography.fontSize}px;
  `;
  loadingIndicator.innerHTML = '🔄 Loading bases from BDO...';
  
  container.appendChild(header);
  container.appendChild(statusArea);
  container.appendChild(basesContainer);
  container.appendChild(loadingIndicator);
  
  // State
  let isLoading = false;
  let currentBases = {};
  
  // Methods
  const methods = {
    async loadBases(forceRefresh = false) {
      if (isLoading) return;
      
      isLoading = true;
      loadingIndicator.style.display = 'block';
      basesContainer.style.display = 'none';
      statusArea.textContent = 'Loading base servers from BDO...';
      
      try {
        // Import the base discovery service (assumes it's available globally)
        if (!window.baseDiscovery) {
          throw new Error('Base discovery service not available');
        }
        
        console.log('📡 Loading bases...');
        const basesData = await window.baseDiscovery.getBases(forceRefresh);
        currentBases = basesData;
        
        // Clear existing bases
        basesContainer.innerHTML = '';
        
        const baseCount = Object.keys(basesData).length;
        const connectedCount = Object.values(basesData).filter(b => b.connected).length;
        
        if (baseCount === 0) {
          statusArea.textContent = '📦 No base servers found. Connect to get started!';
          basesContainer.appendChild(this.createEmptyState());
        } else {
          statusArea.textContent = `📡 ${baseCount} base servers found • ${connectedCount} connected`;
          
          // Create base rows
          Object.entries(basesData).forEach(([id, base]) => {
            const baseData = { ...base, id };
            const baseRow = createProductionBaseRow(baseData, {
              ...finalConfig,
              expandable: true
            });
            
            baseRow.setActionHandler(async (base, action) => {
              await this.handleBaseAction(base, action);
            });
            
            basesContainer.appendChild(baseRow);
          });
        }
        
        loadingIndicator.style.display = 'none';
        basesContainer.style.display = 'flex';
        
        console.log('✅ Bases loaded successfully');
        
      } catch (error) {
        console.error('❌ Failed to load bases:', error);
        statusArea.textContent = `❌ Error loading bases: ${error.message}`;
        
        loadingIndicator.style.display = 'none';
        basesContainer.style.display = 'block';
        basesContainer.appendChild(this.createErrorState(error.message));
      }
      
      isLoading = false;
    },
    
    async handleBaseAction(base, action) {
      console.log(`🎯 Base ${action}:`, base.name);
      statusArea.textContent = `${action === 'join' ? 'Joining' : 'Leaving'} ${base.name}...`;
      
      try {
        if (!window.baseDiscovery) {
          throw new Error('Base discovery service not available');
        }
        
        if (action === 'join') {
          await window.baseDiscovery.joinBase(base);
        } else {
          await window.baseDiscovery.leaveBase(base);
        }
        
        // Refresh the display
        await this.loadBases(true);
        
        statusArea.textContent = `✅ Successfully ${action === 'join' ? 'joined' : 'left'} ${base.name}`;
        
      } catch (error) {
        console.error(`❌ Failed to ${action} base:`, error);
        statusArea.textContent = `❌ Failed to ${action} ${base.name}: ${error.message}`;
      }
    },
    
    createEmptyState() {
      const emptyState = document.createElement('div');
      emptyState.style.cssText = `
        text-align: center;
        padding: 60px 20px;
        color: ${finalConfig.theme.colors.textMuted};
        font-size: ${finalConfig.theme.typography.fontSize + 2}px;
      `;
      emptyState.innerHTML = `
        <div style="font-size: 48px; margin-bottom: 20px;">📦</div>
        <div style="font-weight: bold; margin-bottom: 10px;">No base servers yet</div>
        <div>Base servers will appear here when they're discovered from your home BDO</div>
      `;
      return emptyState;
    },
    
    createErrorState(errorMessage) {
      const errorState = document.createElement('div');
      errorState.style.cssText = `
        text-align: center;
        padding: 60px 20px;
        color: ${finalConfig.theme.colors.textMuted};
        font-size: ${finalConfig.theme.typography.fontSize + 1}px;
        background: rgba(239, 68, 68, 0.1);
        border: 1px solid rgba(239, 68, 68, 0.3);
        border-radius: 8px;
      `;
      errorState.innerHTML = `
        <div style="font-size: 48px; margin-bottom: 20px;">⚠️</div>
        <div style="font-weight: bold; margin-bottom: 10px;">Connection Error</div>
        <div style="margin-bottom: 10px;">${errorMessage}</div>
        <div style="font-size: ${finalConfig.theme.typography.fontSize}px;">
          Check your connection and try refreshing
        </div>
      `;
      return errorState;
    },
    
    refresh() {
      return this.loadBases(true);
    },
    
    getBases() {
      return Object.values(currentBases);
    }
  };
  
  // Event handlers
  refreshButton.addEventListener('click', () => methods.refresh());
  
  // Return the screen component
  return {
    element: container,
    ...methods
  };
}

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.createProductionBaseScreen = createProductionBaseScreen;
}