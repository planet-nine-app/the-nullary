/**
 * Base Screen Component for The Nullary
 * Shows connected base servers with interactable SVG feed
 * Reusable across all Nullary apps
 */

import { createScrollableFeed } from '../components/feed.js';
import { createHUDOverlay } from '../components/hud.js';
import { createLayeredUI } from '../utils/layered-ui.js';
import { createSVGContainer, createSVGElement, generateSVGId } from '../utils/svg-utils.js';

/**
 * Default base screen configuration
 */
const DEFAULT_BASE_SCREEN_CONFIG = {
  // Screen metadata
  title: 'Base Servers',
  description: 'Manage your connected base servers',
  
  // Layout
  width: '100%',
  height: '100vh',
  
  // Theme
  theme: {
    colors: {
      background: '#1c1c20',
      surface: '#2a2a2e',
      surfaceVariant: '#252529',
      primary: '#3eda82',
      secondary: '#9c42f5',
      accent: '#00ffcc',
      text: '#ffffff',
      textSecondary: '#bbbbbb',
      textMuted: '#777777',
      border: '#444444',
      highlight: '#555555',
      success: '#3eda82',
      warning: '#f59e0b',
      error: '#ef4444',
      glow: '#9900ff'
    },
    typography: {
      fontFamily: 'Arial, sans-serif',
      fontSize: 14,
      titleSize: 16,
      headerSize: 20
    }
  },
  
  // Features
  features: {
    expandableRows: true,
    joinLeaveActions: true,
    connectionStatus: true,
    feedIntegration: true,
    realTimeUpdates: true
  },
  
  // Base server thresholds
  thresholds: {
    refreshInterval: 600000, // 10 minutes
    connectionTimeout: 5000
  }
};

/**
 * Create base server row SVG component
 * @param {Object} base - Base server data
 * @param {Object} config - Configuration object
 * @param {Function} onAction - Action callback (join/leave)
 * @param {Function} onExpand - Expand callback
 * @returns {SVGElement} Interactive base row SVG
 */
function createBaseRowSVG(base, config, onAction, onExpand) {
  const { theme } = config;
  
  // Prepare base data
  const title = base.name || 'Unknown Base';
  const description = base.description || 'No description available';
  const isJoined = base.joined || false;
  const isConnected = base.connected !== false;
  
  // Prepare soma information
  const lexaryTags = base.soma?.lexary ? base.soma.lexary.join(', ') : 'N/A';
  const photaryTags = base.soma?.photary ? base.soma.photary.join(', ') : 'N/A';
  const viewaryTags = base.soma?.viewary ? base.soma.viewary.join(', ') : 'N/A';
  
  const line1 = `lexary: ${lexaryTags}`;
  const line2 = `photary: ${photaryTags}`;
  const line3 = `viewary: ${viewaryTags}`;
  
  // Create SVG container
  const svg = createSVGContainer({
    width: '100%',
    height: '300',
    viewBox: '0 0 500 300',
    className: 'base-row-svg'
  });
  
  // Add gradient definitions
  const defs = createSVGElement('defs');
  
  // Metallic background gradient
  const metallicGradient = createSVGElement('linearGradient', {
    id: generateSVGId('metallic-bg'),
    x1: '0%', y1: '0%', x2: '100%', y2: '100%'
  });
  metallicGradient.innerHTML = `
    <stop offset="0%" stop-color="${theme.colors.surface}"/>
    <stop offset="50%" stop-color="${theme.colors.surfaceVariant}"/>
    <stop offset="100%" stop-color="${theme.colors.surface}"/>
  `;
  
  // Expanded background gradient
  const expandedGradient = createSVGElement('linearGradient', {
    id: generateSVGId('expanded-bg'),
    x1: '0%', y1: '0%', x2: '100%', y2: '100%'
  });
  expandedGradient.innerHTML = `
    <stop offset="0%" stop-color="${theme.colors.surfaceVariant}"/>
    <stop offset="50%" stop-color="${theme.colors.surface}"/>
    <stop offset="100%" stop-color="${theme.colors.surfaceVariant}"/>
  `;
  
  // Button gradient
  const buttonGradient = createSVGElement('linearGradient', {
    id: generateSVGId('button-gradient'),
    x1: '0%', y1: '0%', x2: '100%', y2: '0%'
  });
  buttonGradient.innerHTML = `
    <stop offset="0%" stop-color="${theme.colors.primary}"/>
    <stop offset="100%" stop-color="${theme.colors.secondary}"/>
  `;
  
  // Connection status glow
  const glowFilter = createSVGElement('filter', {
    id: generateSVGId('glow-filter'),
    x: '-50%', y: '-50%', width: '200%', height: '200%'
  });
  glowFilter.innerHTML = `
    <feGaussianBlur stdDeviation="3" result="blur"/>
    <feComposite in="SourceGraphic" in2="blur" operator="over"/>
  `;
  
  defs.appendChild(metallicGradient);
  defs.appendChild(expandedGradient);
  defs.appendChild(buttonGradient);
  defs.appendChild(glowFilter);
  svg.appendChild(defs);
  
  // Dark background
  const background = createSVGElement('rect', {
    width: '500',
    height: '300',
    fill: theme.colors.background
  });
  svg.appendChild(background);
  
  // Main row container
  const mainRow = createSVGElement('g', { id: 'main-row' });
  
  // Row background
  const rowBg = createSVGElement('rect', {
    x: '10', y: '10',
    width: '480', height: '60',
    rx: '8',
    fill: `url(#${metallicGradient.id})`,
    stroke: theme.colors.border,
    'stroke-width': '1'
  });
  
  // Highlight line
  const highlight = createSVGElement('line', {
    x1: '10', y1: '12',
    x2: '490', y2: '12',
    stroke: theme.colors.highlight,
    'stroke-width': '1',
    opacity: '0.5'
  });
  
  // Connection status indicator
  const statusIndicator = createSVGElement('circle', {
    cx: '25', cy: '25',
    r: '4',
    fill: isConnected ? theme.colors.success : theme.colors.error,
    filter: `url(#${glowFilter.id})`
  });
  
  // Title
  const titleText = createSVGElement('text', {
    x: '40', y: '35',
    'font-family': theme.typography.fontFamily,
    'font-size': theme.typography.titleSize,
    'font-weight': 'bold',
    fill: theme.colors.text
  }, title);
  
  // Description
  const descText = createSVGElement('text', {
    x: '40', y: '55',
    'font-family': theme.typography.fontFamily,
    'font-size': theme.typography.fontSize,
    fill: theme.colors.textSecondary
  }, description);
  
  // Action button
  const actionButton = createSVGElement('rect', {
    id: 'action-button',
    x: '380', y: '25',
    width: '80', height: '30',
    rx: '15',
    fill: `url(#${buttonGradient.id})`,
    style: 'cursor: pointer;'
  });
  
  const actionButtonText = createSVGElement('text', {
    id: 'action-button-text',
    x: '420', y: '45',
    'font-family': theme.typography.fontFamily,
    'font-size': theme.typography.fontSize,
    'font-weight': 'bold',
    fill: 'white',
    'text-anchor': 'middle',
    style: 'pointer-events: none;'
  }, isJoined ? 'LEAVE' : 'JOIN');
  
  // Expand/collapse icon
  const expandIcon = createSVGElement('path', {
    id: 'expand-icon',
    d: 'M450,35 L460,45 L470,35',
    stroke: theme.colors.textMuted,
    'stroke-width': '2',
    fill: 'none',
    style: 'cursor: pointer;'
  });
  
  mainRow.appendChild(rowBg);
  mainRow.appendChild(highlight);
  mainRow.appendChild(statusIndicator);
  mainRow.appendChild(titleText);
  mainRow.appendChild(descText);
  mainRow.appendChild(actionButton);
  mainRow.appendChild(actionButtonText);
  if (config.features.expandableRows) {\n    mainRow.appendChild(expandIcon);\n  }\n  svg.appendChild(mainRow);\n  \n  // Expanded content\n  const expandedContent = createSVGElement('g', {\n    id: 'expanded-content',\n    opacity: '0',\n    transform: 'translateY(-20px)'\n  });\n  \n  // Expanded background\n  const expandedBg = createSVGElement('rect', {\n    id: 'expanded-bg',\n    x: '10', y: '80',\n    width: '480', height: '0',\n    rx: '8',\n    fill: `url(#${expandedGradient.id})`,\n    stroke: theme.colors.border,\n    'stroke-width': '1'\n  });\n  \n  // Expanded highlight\n  const expandedHighlight = createSVGElement('line', {\n    x1: '12', y1: '82',\n    x2: '488', y2: '82',\n    stroke: theme.colors.highlight,\n    'stroke-width': '1',\n    opacity: '0.3'\n  });\n  \n  // Soma information\n  const line1Text = createSVGElement('text', {\n    x: '30', y: '110',\n    'font-family': theme.typography.fontFamily,\n    'font-size': theme.typography.fontSize,\n    fill: theme.colors.text\n  }, line1);\n  \n  const line2Text = createSVGElement('text', {\n    x: '30', y: '140',\n    'font-family': theme.typography.fontFamily,\n    'font-size': theme.typography.fontSize,\n    fill: theme.colors.text\n  }, line2);\n  \n  const line3Text = createSVGElement('text', {\n    x: '30', y: '170',\n    'font-family': theme.typography.fontFamily,\n    'font-size': theme.typography.fontSize,\n    fill: theme.colors.text\n  }, line3);\n  \n  // Connection details\n  const connectionText = createSVGElement('text', {\n    x: '30', y: '200',\n    'font-family': theme.typography.fontFamily,\n    'font-size': theme.typography.fontSize - 1,\n    fill: theme.colors.textMuted\n  }, `Status: ${isConnected ? 'Connected' : 'Disconnected'} • DNS: ${Object.keys(base.dns || {}).join(', ')}`);\n  \n  expandedContent.appendChild(expandedBg);\n  expandedContent.appendChild(expandedHighlight);\n  expandedContent.appendChild(line1Text);\n  expandedContent.appendChild(line2Text);\n  expandedContent.appendChild(line3Text);\n  expandedContent.appendChild(connectionText);\n  svg.appendChild(expandedContent);\n  \n  // Divider line\n  const divider = createSVGElement('line', {\n    x1: '10', y1: '80',\n    x2: '490', y2: '80',\n    stroke: theme.colors.highlight,\n    'stroke-width': '1',\n    'stroke-dasharray': '5,3'\n  });\n  svg.appendChild(divider);\n  \n  // State management\n  let isExpanded = false;\n  \n  // Animation helper\n  function animateExpansion(expand) {\n    isExpanded = expand;\n    \n    // Animate expanded background height\n    const heightAnim = createSVGElement('animate', {\n      attributeName: 'height',\n      from: expand ? '0' : '140',\n      to: expand ? '140' : '0',\n      dur: '300ms',\n      fill: 'freeze'\n    });\n    expandedBg.appendChild(heightAnim);\n    \n    // Animate content opacity\n    const opacityAnim = createSVGElement('animate', {\n      attributeName: 'opacity',\n      from: expand ? '0' : '1',\n      to: expand ? '1' : '0',\n      dur: '300ms',\n      fill: 'freeze'\n    });\n    expandedContent.appendChild(opacityAnim);\n    \n    // Animate transform\n    const transformAnim = createSVGElement('animateTransform', {\n      attributeName: 'transform',\n      type: 'translate',\n      from: expand ? '0,-20' : '0,0',\n      to: expand ? '0,0' : '0,-20',\n      dur: '300ms',\n      fill: 'freeze'\n    });\n    expandedContent.appendChild(transformAnim);\n    \n    // Update expand icon\n    expandIcon.setAttribute('d', expand ? 'M450,45 L460,35 L470,45' : 'M450,35 L460,45 L470,35');\n    \n    // Start animations\n    heightAnim.beginElement();\n    opacityAnim.beginElement();\n    transformAnim.beginElement();\n  }\n  \n  // Event handlers\n  actionButton.addEventListener('click', (e) => {\n    e.stopPropagation();\n    const newJoinedState = !isJoined;\n    actionButtonText.textContent = newJoinedState ? 'LEAVE' : 'JOIN';\n    \n    if (onAction) {\n      onAction(base, newJoinedState ? 'join' : 'leave');\n    }\n  });\n  \n  if (config.features.expandableRows) {\n    expandIcon.addEventListener('click', (e) => {\n      e.stopPropagation();\n      animateExpansion(!isExpanded);\n      \n      if (onExpand) {\n        onExpand(base, !isExpanded);\n      }\n    });\n    \n    mainRow.addEventListener('click', () => {\n      animateExpansion(!isExpanded);\n      \n      if (onExpand) {\n        onExpand(base, !isExpanded);\n      }\n    });\n  }\n  \n  return svg;\n}\n\n/**\n * Create base screen component\n * @param {Object} config - Configuration object\n * @returns {Object} Base screen component with methods\n */\nexport function createBaseScreen(config = {}) {\n  const finalConfig = { ...DEFAULT_BASE_SCREEN_CONFIG, ...config };\n  \n  // Screen state\n  const screenState = {\n    bases: new Map(),\n    isLoading: false,\n    lastRefresh: 0,\n    layeredUI: null,\n    baseCommand: null\n  };\n  \n  // Create layered UI for the base screen\n  function createUI() {\n    screenState.layeredUI = createLayeredUI({\n      className: 'base-screen-ui',\n      width: finalConfig.width,\n      height: finalConfig.height,\n      layers: [\n        {\n          id: 'background',\n          type: 'div',\n          zIndex: 1,\n          config: {\n            backgroundColor: finalConfig.theme.colors.background\n          }\n        },\n        {\n          id: 'base-feed',\n          type: 'feed',\n          zIndex: 100,\n          config: {\n            backgroundColor: 'transparent',\n            responsive: true,\n            showTimestamps: false,\n            showActions: false,\n            emptyText: 'No base servers found. Connect to get started!',\n            loadingText: 'Loading base servers...'\n          }\n        },\n        {\n          id: 'header-hud',\n          type: 'hud',\n          zIndex: 1000,\n          config: {\n            background: 'rgba(28, 28, 32, 0.95)',\n            transparentZones: [\n              {\n                x: 20,\n                y: 80,\n                width: 'calc(100% - 40px)',\n                height: 'calc(100% - 120px)',\n                shape: 'rect'\n              }\n            ],\n            elements: [\n              {\n                id: 'screen-title',\n                type: 'text',\n                x: 30,\n                y: 35,\n                content: finalConfig.title,\n                color: finalConfig.theme.colors.text,\n                fontSize: finalConfig.theme.typography.headerSize,\n                fontFamily: finalConfig.theme.typography.fontFamily\n              },\n              {\n                id: 'refresh-button',\n                type: 'button',\n                x: 'calc(100% - 120px)',\n                y: 20,\n                width: 100,\n                height: 40,\n                content: '🔄 Refresh',\n                backgroundColor: 'rgba(62, 218, 130, 0.8)',\n                color: '#ffffff',\n                onClick: () => refreshBases()\n              },\n              {\n                id: 'status-text',\n                type: 'text',\n                x: 30,\n                y: 'calc(100% - 20px)',\n                content: 'Ready',\n                color: finalConfig.theme.colors.textMuted,\n                fontSize: 12\n              }\n            ]\n          }\n        }\n      ]\n    });\n    \n    return screenState.layeredUI;\n  }\n  \n  // Load bases from storage or API\n  async function loadBases() {\n    if (screenState.isLoading) return;\n    \n    screenState.isLoading = true;\n    updateStatus('Loading base servers...');\n    \n    const feedLayer = screenState.layeredUI.getFeedLayer();\n    if (feedLayer && feedLayer.component) {\n      feedLayer.component.setLoading(true);\n    }\n    \n    try {\n      // Try to get bases from baseCommand if available\n      let bases = {};\n      \n      if (screenState.baseCommand && screenState.baseCommand.getBases) {\n        bases = await screenState.baseCommand.getBases();\n      } else {\n        // Fallback to localStorage or mock data\n        const stored = localStorage.getItem('nullary-bases');\n        if (stored) {\n          bases = JSON.parse(stored);\n        } else {\n          // Create some mock bases for demonstration\n          bases = createMockBases();\n        }\n      }\n      \n      // Convert bases to feed posts\n      const basePosts = Object.entries(bases).map(([id, base]) => {\n        const baseWithId = { ...base, id };\n        \n        return {\n          id: `base-${id}`,\n          element: createBaseRowSVG(\n            baseWithId,\n            finalConfig,\n            handleBaseAction,\n            handleBaseExpand\n          ),\n          timestamp: new Date().toISOString(),\n          type: 'base-server',\n          data: baseWithId\n        };\n      });\n      \n      // Update feed\n      if (feedLayer && feedLayer.component) {\n        feedLayer.component.setPosts(basePosts);\n        feedLayer.component.setLoading(false);\n      }\n      \n      // Update state\n      screenState.bases.clear();\n      Object.entries(bases).forEach(([id, base]) => {\n        screenState.bases.set(id, base);\n      });\n      \n      screenState.lastRefresh = Date.now();\n      updateStatus(`Loaded ${Object.keys(bases).length} base servers`);\n      \n    } catch (error) {\n      console.error('❌ Error loading bases:', error);\n      updateStatus(`Error loading bases: ${error.message}`);\n      \n      if (feedLayer && feedLayer.component) {\n        feedLayer.component.setLoading(false);\n      }\n    }\n    \n    screenState.isLoading = false;\n  }\n  \n  // Create mock bases for demonstration\n  function createMockBases() {\n    return {\n      'dev-base': {\n        name: 'Development Base',\n        description: 'Primary development server for testing and experimentation',\n        location: {\n          latitude: 37.7749,\n          longitude: -122.4194,\n          postalCode: '94102'\n        },\n        soma: {\n          lexary: ['development', 'testing', 'code'],\n          photary: ['screenshots', 'diagrams'],\n          viewary: ['demos', 'tutorials']\n        },\n        dns: {\n          bdo: 'https://dev.bdo.allyabase.com/',\n          dolores: 'https://dev.dolores.allyabase.com/',\n          pref: 'https://dev.pref.allyabase.com/'\n        },\n        joined: true,\n        connected: true\n      },\n      'community-base': {\n        name: 'Community Hub',\n        description: 'Main community server for discussions and collaboration',\n        location: {\n          latitude: 40.7128,\n          longitude: -74.0060,\n          postalCode: '10001'\n        },\n        soma: {\n          lexary: ['community', 'discussion', 'collaboration'],\n          photary: ['events', 'meetups'],\n          viewary: ['talks', 'presentations']\n        },\n        dns: {\n          bdo: 'https://community.bdo.allyabase.com/',\n          dolores: 'https://community.dolores.allyabase.com/'\n        },\n        joined: false,\n        connected: true\n      },\n      'research-base': {\n        name: 'Research Station',\n        description: 'Advanced research and experimental features',\n        location: {\n          latitude: 51.5074,\n          longitude: -0.1278,\n          postalCode: 'SW1A 1AA'\n        },\n        soma: {\n          lexary: ['research', 'science', 'innovation'],\n          photary: ['experiments', 'data-viz'],\n          viewary: ['research-talks', 'findings']\n        },\n        dns: {\n          bdo: 'https://research.bdo.allyabase.com/',\n          dolores: 'https://research.dolores.allyabase.com/'\n        },\n        joined: true,\n        connected: false\n      }\n    };\n  }\n  \n  // Handle base actions (join/leave)\n  async function handleBaseAction(base, action) {\n    console.log(`🎯 Base ${action}:`, base.name);\n    updateStatus(`${action === 'join' ? 'Joining' : 'Leaving'} ${base.name}...`);\n    \n    try {\n      if (screenState.baseCommand) {\n        if (action === 'join' && screenState.baseCommand.joinBase) {\n          await screenState.baseCommand.joinBase(base);\n        } else if (action === 'leave' && screenState.baseCommand.leaveBase) {\n          await screenState.baseCommand.leaveBase(base);\n        }\n      }\n      \n      // Update local state\n      base.joined = action === 'join';\n      screenState.bases.set(base.id, base);\n      \n      // Save to localStorage\n      const basesObj = Object.fromEntries(screenState.bases);\n      localStorage.setItem('nullary-bases', JSON.stringify(basesObj));\n      \n      updateStatus(`${action === 'join' ? 'Joined' : 'Left'} ${base.name}`);\n      \n    } catch (error) {\n      console.error(`❌ Error ${action}ing base:`, error);\n      updateStatus(`Error ${action}ing ${base.name}: ${error.message}`);\n    }\n  }\n  \n  // Handle base expansion\n  function handleBaseExpand(base, isExpanded) {\n    console.log(`📖 Base ${isExpanded ? 'expanded' : 'collapsed'}:`, base.name);\n  }\n  \n  // Refresh bases\n  async function refreshBases() {\n    console.log('🔄 Refreshing bases...');\n    screenState.lastRefresh = 0; // Force refresh\n    await loadBases();\n  }\n  \n  // Update status text\n  function updateStatus(text) {\n    if (screenState.layeredUI) {\n      screenState.layeredUI.updateHUDElement('status-text', {\n        content: text\n      });\n    }\n  }\n  \n  // Screen interface\n  const baseScreen = {\n    element: null,\n    \n    // Initialization\n    async initialize(baseCommand = null) {\n      console.log('🏗️ Initializing base screen...');\n      \n      screenState.baseCommand = baseCommand;\n      \n      // Create UI\n      const ui = createUI();\n      this.element = ui.element;\n      \n      // Load initial data\n      await loadBases();\n      \n      console.log('✅ Base screen initialized');\n      return this;\n    },\n    \n    // Data management\n    async refresh() {\n      await refreshBases();\n    },\n    \n    getBases() {\n      return Array.from(screenState.bases.values());\n    },\n    \n    getConnectedBases() {\n      return this.getBases().filter(base => base.joined && base.connected);\n    },\n    \n    // Base command integration\n    setBaseCommand(baseCommand) {\n      screenState.baseCommand = baseCommand;\n    },\n    \n    // Event handlers\n    onBaseAction(handler) {\n      // Could add custom event handling here\n    },\n    \n    // State access\n    getState() {\n      return {\n        basesCount: screenState.bases.size,\n        isLoading: screenState.isLoading,\n        lastRefresh: screenState.lastRefresh\n      };\n    },\n    \n    // Cleanup\n    destroy() {\n      if (this.element && this.element.parentNode) {\n        this.element.parentNode.removeChild(this.element);\n      }\n    }\n  };\n  \n  return baseScreen;\n}\n\n/**\n * Export default configuration\n */\nexport { DEFAULT_BASE_SCREEN_CONFIG as baseScreenDefaults };