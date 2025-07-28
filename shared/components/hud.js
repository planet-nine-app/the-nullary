/**
 * SVG HUD Overlay Component for The Nullary
 * Creates overlays with transparent areas for scrollable content underneath
 */

import { 
  createSVGContainer, 
  createSVGElement, 
  addSVGStyles, 
  generateSVGId 
} from '../utils/svg-utils.js';

/**
 * Default HUD configuration
 */
const DEFAULT_HUD_CONFIG = {
  // Container
  className: 'nullary-hud',
  
  // Layout
  width: '100%',
  height: '100%',
  
  // Positioning
  position: 'absolute',
  top: 0,
  left: 0,
  zIndex: 1000,
  
  // Styling
  background: 'rgba(0, 0, 0, 0.8)',
  
  // Transparency zones for scrolling
  transparentZones: [
    {
      x: 50,
      y: 100,
      width: 'calc(100% - 100px)',
      height: 'calc(100% - 200px)',
      shape: 'rect'
    }
  ],
  
  // HUD elements
  elements: [],
  
  // Interactivity
  allowPointerEvents: true,
  scrollPassThrough: true,
  
  // Responsive
  responsive: true
};

/**
 * Create an SVG HUD overlay component
 * @param {Object} config - Configuration object
 * @returns {Object} HUD component with methods
 */
export function createHUDOverlay(config = {}) {
  const finalConfig = { ...DEFAULT_HUD_CONFIG, ...config };
  
  // Create main container
  const container = document.createElement('div');
  container.className = finalConfig.className;
  container.id = generateSVGId('hud');
  
  // Apply container styles
  container.style.cssText = `
    position: ${finalConfig.position};
    top: ${finalConfig.top}px;
    left: ${finalConfig.left}px;
    width: ${finalConfig.width};
    height: ${finalConfig.height};
    z-index: ${finalConfig.zIndex};
    pointer-events: ${finalConfig.allowPointerEvents ? 'auto' : 'none'};
    user-select: none;
  `;
  
  // Create SVG overlay
  const svg = createSVGContainer({
    width: '100%',
    height: '100%',
    className: 'hud-overlay-svg'
  });
  
  // Create mask for transparent zones
  const maskId = generateSVGId('hud-mask');
  const mask = createSVGElement('mask', { id: maskId });
  
  // White background for the mask (visible areas)
  const maskBackground = createSVGElement('rect', {
    width: '100%',
    height: '100%',
    fill: 'white'
  });
  mask.appendChild(maskBackground);
  
  // Add transparent zones (black areas in mask = transparent in result)
  finalConfig.transparentZones.forEach((zone, index) => {
    const transparentArea = createTransparentZone(zone, index);
    mask.appendChild(transparentArea);
  });
  
  // Add mask to SVG defs
  let defs = svg.querySelector('defs');
  if (!defs) {
    defs = createSVGElement('defs');
    svg.appendChild(defs);
  }
  defs.appendChild(mask);
  
  // Create background with mask applied
  const background = createSVGElement('rect', {
    width: '100%',
    height: '100%',
    fill: finalConfig.background,
    mask: `url(#${maskId})`
  });
  svg.appendChild(background);
  
  // Add to container
  container.appendChild(svg);
  
  // State management
  const state = {
    elements: [...finalConfig.elements],
    transparentZones: [...finalConfig.transparentZones],
    isVisible: true,
    zIndex: finalConfig.zIndex
  };
  
  // Create transparent zone element
  function createTransparentZone(zone, index) {
    const zoneId = generateSVGId(`transparent-zone-${index}`);
    
    switch (zone.shape) {
      case 'circle':
        return createSVGElement('circle', {
          id: zoneId,
          cx: zone.x + (zone.width / 2),
          cy: zone.y + (zone.height / 2),
          r: Math.min(zone.width, zone.height) / 2,
          fill: 'black'
        });
        
      case 'ellipse':
        return createSVGElement('ellipse', {
          id: zoneId,
          cx: zone.x + (zone.width / 2),
          cy: zone.y + (zone.height / 2),
          rx: zone.width / 2,
          ry: zone.height / 2,
          fill: 'black'
        });
        
      case 'rect':
      default:
        return createSVGElement('rect', {
          id: zoneId,
          x: zone.x,
          y: zone.y,
          width: zone.width,
          height: zone.height,
          fill: 'black'
        });
    }
  }
  
  // Create HUD element
  function createHUDElement(element) {
    const group = createSVGElement('g', {
      id: generateSVGId(`hud-element-${element.id || 'element'}`),
      transform: `translate(${element.x || 0}, ${element.y || 0})`
    });
    
    switch (element.type) {
      case 'text':
        const text = createSVGElement('text', {
          x: 0,
          y: 0,
          fill: element.color || '#ffffff',
          'font-size': element.fontSize || 16,
          'font-family': element.fontFamily || 'Arial, sans-serif',
          'text-anchor': element.textAnchor || 'start',
          'dominant-baseline': element.baseline || 'hanging'
        }, element.content || '');
        group.appendChild(text);
        break;
        
      case 'button':
        const buttonBg = createSVGElement('rect', {
          x: 0,
          y: 0,
          width: element.width || 100,
          height: element.height || 40,
          fill: element.backgroundColor || 'rgba(255, 255, 255, 0.2)',
          stroke: element.borderColor || '#ffffff',
          'stroke-width': element.borderWidth || 1,
          rx: element.borderRadius || 4
        });
        
        const buttonText = createSVGElement('text', {
          x: (element.width || 100) / 2,
          y: (element.height || 40) / 2,
          fill: element.color || '#ffffff',
          'font-size': element.fontSize || 14,
          'text-anchor': 'middle',
          'dominant-baseline': 'central'
        }, element.content || 'Button');
        
        group.appendChild(buttonBg);
        group.appendChild(buttonText);
        
        // Add click handler
        group.style.cursor = 'pointer';
        group.addEventListener('click', (e) => {
          if (element.onClick) {
            element.onClick(e, element);
          }
        });
        break;
        
      case 'icon':
        const icon = createSVGElement('text', {
          x: 0,
          y: 0,
          fill: element.color || '#ffffff',
          'font-size': element.size || 24,
          'text-anchor': 'middle',
          'dominant-baseline': 'central'
        }, element.content || '🔷');
        group.appendChild(icon);
        break;
        
      case 'progress':
        const progressBg = createSVGElement('rect', {
          x: 0,
          y: 0,
          width: element.width || 200,
          height: element.height || 8,
          fill: element.backgroundColor || 'rgba(255, 255, 255, 0.2)',
          rx: (element.height || 8) / 2
        });
        
        const progressFill = createSVGElement('rect', {
          x: 0,
          y: 0,
          width: (element.width || 200) * (element.progress || 0),
          height: element.height || 8,
          fill: element.color || '#00ff00',
          rx: (element.height || 8) / 2
        });
        
        group.appendChild(progressBg);
        group.appendChild(progressFill);
        break;
        
      case 'custom':
        if (element.render && typeof element.render === 'function') {
          const customElement = element.render(createSVGElement);
          if (customElement) {
            group.appendChild(customElement);
          }
        }
        break;
    }
    
    return group;
  }
  
  // Render HUD elements
  function renderElements() {
    // Remove existing elements
    const existingElements = svg.querySelectorAll('[id^="hud-element-"]');
    existingElements.forEach(el => el.remove());
    
    // Add current elements
    state.elements.forEach(element => {
      const hudElement = createHUDElement(element);
      svg.appendChild(hudElement);
    });
  }
  
  // Update transparent zones
  function updateTransparentZones() {
    const mask = svg.querySelector(`#${maskId}`);
    if (!mask) return;
    
    // Remove existing transparent zones
    const existingZones = mask.querySelectorAll('[id^="transparent-zone-"]');
    existingZones.forEach(zone => zone.remove());
    
    // Add current zones
    state.transparentZones.forEach((zone, index) => {
      const transparentArea = createTransparentZone(zone, index);
      mask.appendChild(transparentArea);
    });
  }
  
  // Handle scroll pass-through
  if (finalConfig.scrollPassThrough) {
    container.addEventListener('wheel', (e) => {
      // Check if the event is over a transparent zone
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const isOverTransparentZone = state.transparentZones.some(zone => {
        return x >= zone.x && x <= zone.x + zone.width &&
               y >= zone.y && y <= zone.y + zone.height;
      });
      
      if (isOverTransparentZone) {
        // Allow the wheel event to pass through to underlying elements
        e.stopPropagation();
        const underlyingElement = document.elementFromPoint(e.clientX, e.clientY);
        if (underlyingElement && underlyingElement !== container) {
          const wheelEvent = new WheelEvent('wheel', {
            deltaX: e.deltaX,
            deltaY: e.deltaY,
            deltaZ: e.deltaZ,
            bubbles: true,
            cancelable: true
          });
          underlyingElement.dispatchEvent(wheelEvent);
        }
      }
    });
  }
  
  // Component interface
  const hudComponent = {
    element: container,
    
    // Element management
    addElement(element) {
      state.elements.push({ ...element, id: element.id || generateSVGId('element') });
      renderElements();
    },
    
    removeElement(elementId) {
      state.elements = state.elements.filter(el => el.id !== elementId);
      renderElements();
    },
    
    updateElement(elementId, updates) {
      const index = state.elements.findIndex(el => el.id === elementId);
      if (index !== -1) {
        state.elements[index] = { ...state.elements[index], ...updates };
        renderElements();
      }
    },
    
    clearElements() {
      state.elements = [];
      renderElements();
    },
    
    // Transparent zone management
    addTransparentZone(zone) {
      state.transparentZones.push(zone);
      updateTransparentZones();
    },
    
    removeTransparentZone(index) {
      if (index >= 0 && index < state.transparentZones.length) {
        state.transparentZones.splice(index, 1);
        updateTransparentZones();
      }
    },
    
    updateTransparentZone(index, updates) {
      if (index >= 0 && index < state.transparentZones.length) {
        state.transparentZones[index] = { ...state.transparentZones[index], ...updates };
        updateTransparentZones();
      }
    },
    
    setTransparentZones(zones) {
      state.transparentZones = [...zones];
      updateTransparentZones();
    },
    
    // Visibility
    show() {
      state.isVisible = true;
      container.style.display = 'block';
    },
    
    hide() {
      state.isVisible = false;
      container.style.display = 'none';
    },
    
    toggle() {
      if (state.isVisible) {
        this.hide();
      } else {
        this.show();
      }
    },
    
    // Z-index management
    bringToFront() {
      state.zIndex += 1000;
      container.style.zIndex = state.zIndex;
    },
    
    sendToBack() {
      state.zIndex = Math.max(1, state.zIndex - 1000);
      container.style.zIndex = state.zIndex;
    },
    
    setZIndex(zIndex) {
      state.zIndex = zIndex;
      container.style.zIndex = zIndex;
    },
    
    // State access
    getState() {
      return { ...state };
    },
    
    getElements() {
      return [...state.elements];
    },
    
    getTransparentZones() {
      return [...state.transparentZones];
    }
  };
  
  // Initial render
  renderElements();
  
  return hudComponent;
}

/**
 * Create a simple navigation HUD
 * @param {Object} config - Configuration object
 * @returns {Object} Navigation HUD component
 */
export function createNavigationHUD(config = {}) {
  const navConfig = {
    ...config,
    elements: [
      {
        id: 'nav-back',
        type: 'button',
        x: 20,
        y: 20,
        width: 80,
        height: 40,
        content: '← Back',
        onClick: config.onBack || (() => console.log('Back clicked'))
      },
      {
        id: 'nav-menu',
        type: 'button',
        x: 'calc(100% - 100px)',
        y: 20,
        width: 80,
        height: 40,
        content: '☰ Menu',
        onClick: config.onMenu || (() => console.log('Menu clicked'))
      }
    ],
    transparentZones: [
      {
        x: 20,
        y: 80,
        width: 'calc(100% - 40px)',
        height: 'calc(100% - 100px)',
        shape: 'rect'
      }
    ]
  };
  
  return createHUDOverlay(navConfig);
}

/**
 * Create a status HUD
 * @param {Object} config - Configuration object
 * @returns {Object} Status HUD component
 */
export function createStatusHUD(config = {}) {
  const statusConfig = {
    ...config,
    elements: [
      {
        id: 'status-text',
        type: 'text',
        x: 20,
        y: 'calc(100% - 30px)',
        content: config.statusText || 'Ready',
        color: '#ffffff',
        fontSize: 14
      }
    ],
    transparentZones: [
      {
        x: 0,
        y: 0,
        width: '100%',
        height: 'calc(100% - 60px)',
        shape: 'rect'
      }
    ]
  };
  
  return createHUDOverlay(statusConfig);
}

/**
 * Export default configuration
 */
export { DEFAULT_HUD_CONFIG as hudComponentDefaults };