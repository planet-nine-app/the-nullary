/**
 * Layered UI Manager for The Nullary
 * Manages multiple UI layers including feeds, HUDs, and overlays
 */

import { createScrollableFeed } from '../components/feed.js';
import { createHUDOverlay } from '../components/hud.js';
import { generateSVGId } from './svg-utils.js';

/**
 * Default layered UI configuration
 */
const DEFAULT_LAYERED_CONFIG = {
  // Container
  className: 'nullary-layered-ui',
  
  // Layout
  width: '100%',
  height: '100vh',
  
  // Layers
  layers: [
    {
      id: 'background',
      type: 'div',
      zIndex: 1,
      config: {
        backgroundColor: '#f5f5f5'
      }
    },
    {
      id: 'feed',
      type: 'feed',
      zIndex: 100,
      config: {}
    },
    {
      id: 'hud',
      type: 'hud',
      zIndex: 1000,
      config: {}
    }
  ],
  
  // Responsive
  responsive: true,
  
  // Animation
  transitionDuration: 300
};

/**
 * Create a layered UI manager
 * @param {Object} config - Configuration object
 * @returns {Object} Layered UI component with methods
 */
export function createLayeredUI(config = {}) {
  const finalConfig = { ...DEFAULT_LAYERED_CONFIG, ...config };
  
  // Create main container
  const container = document.createElement('div');
  container.className = finalConfig.className;
  container.id = generateSVGId('layered-ui');
  
  // Apply container styles
  container.style.cssText = `
    position: relative;
    width: ${finalConfig.width};
    height: ${finalConfig.height};
    overflow: hidden;
    background: transparent;
  `;
  
  // State management
  const state = {
    layers: new Map(),
    layerConfigs: [...finalConfig.layers],
    isInitialized: false,
    activeLayer: null
  };
  
  // Create layer container
  function createLayerContainer(layerConfig) {
    const layerContainer = document.createElement('div');
    layerContainer.id = generateSVGId(`layer-${layerConfig.id}`);
    layerContainer.className = `layer layer-${layerConfig.type}`;
    
    layerContainer.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: ${layerConfig.zIndex};
      transition: opacity ${finalConfig.transitionDuration}ms ease;
    `;
    
    return layerContainer;
  }
  
  // Create layer component based on type
  function createLayerComponent(layerConfig) {
    const layerContainer = createLayerContainer(layerConfig);
    let component = null;
    
    switch (layerConfig.type) {
      case 'feed':
        component = createScrollableFeed(layerConfig.config);
        layerContainer.appendChild(component.element);
        break;
        
      case 'hud':
        component = createHUDOverlay(layerConfig.config);
        layerContainer.appendChild(component.element);
        break;
        
      case 'div':
        // Simple div layer
        Object.assign(layerContainer.style, layerConfig.config);
        component = {
          element: layerContainer,
          update: (styles) => Object.assign(layerContainer.style, styles)
        };
        break;
        
      case 'custom':
        if (layerConfig.factory && typeof layerConfig.factory === 'function') {
          component = layerConfig.factory(layerConfig.config);
          if (component && component.element) {
            layerContainer.appendChild(component.element);
          }
        }
        break;
        
      default:
        console.warn(`Unknown layer type: ${layerConfig.type}`);
        component = {
          element: layerContainer
        };
    }
    
    return {
      container: layerContainer,
      component: component,
      config: layerConfig
    };
  }
  
  // Initialize all layers
  function initializeLayers() {
    // Clear existing layers
    container.innerHTML = '';
    state.layers.clear();
    
    // Create layers in order
    state.layerConfigs
      .sort((a, b) => a.zIndex - b.zIndex)
      .forEach(layerConfig => {
        const layer = createLayerComponent(layerConfig);
        state.layers.set(layerConfig.id, layer);
        container.appendChild(layer.container);
      });
    
    state.isInitialized = true;
  }
  
  // Setup scroll pass-through for HUD layers
  function setupScrollPassThrough() {
    state.layers.forEach((layer, layerId) => {
      if (layer.config.type === 'hud' && layer.component) {
        // Find the feed layer
        const feedLayer = Array.from(state.layers.values())
          .find(l => l.config.type === 'feed');
        
        if (feedLayer && feedLayer.component) {
          // Setup scroll event forwarding
          layer.container.addEventListener('wheel', (e) => {
            // Check if scroll should pass through
            const hudComponent = layer.component;
            if (hudComponent.getTransparentZones) {
              const zones = hudComponent.getTransparentZones();
              const rect = layer.container.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const y = e.clientY - rect.top;
              
              const isOverTransparentZone = zones.some(zone => {
                return x >= zone.x && x <= zone.x + zone.width &&
                       y >= zone.y && y <= zone.y + zone.height;
              });
              
              if (isOverTransparentZone) {
                e.preventDefault();
                e.stopPropagation();
                
                // Forward scroll to feed
                const feedElement = feedLayer.component.element;
                if (feedElement) {
                  feedElement.scrollTop += e.deltaY;
                }
              }
            }
          }, { passive: false });
        }
      }
    });
  }
  
  // Component interface
  const layeredUIComponent = {
    element: container,
    
    // Layer management
    addLayer(layerConfig) {
      // Check if layer already exists
      if (state.layers.has(layerConfig.id)) {
        console.warn(`Layer ${layerConfig.id} already exists`);
        return false;
      }
      
      // Add to config
      state.layerConfigs.push(layerConfig);
      
      // Create and add layer
      const layer = createLayerComponent(layerConfig);
      state.layers.set(layerConfig.id, layer);
      
      // Insert at correct z-index position
      const siblings = Array.from(container.children);
      const insertIndex = siblings.findIndex(sibling => {
        const siblingZIndex = parseInt(sibling.style.zIndex || '0');
        return layerConfig.zIndex < siblingZIndex;
      });
      
      if (insertIndex === -1) {
        container.appendChild(layer.container);
      } else {
        container.insertBefore(layer.container, siblings[insertIndex]);
      }
      
      return true;
    },
    
    removeLayer(layerId) {
      const layer = state.layers.get(layerId);
      if (layer) {
        container.removeChild(layer.container);
        state.layers.delete(layerId);
        state.layerConfigs = state.layerConfigs.filter(config => config.id !== layerId);
        return true;
      }
      return false;
    },
    
    getLayer(layerId) {
      return state.layers.get(layerId);
    },
    
    updateLayerConfig(layerId, updates) {
      const configIndex = state.layerConfigs.findIndex(config => config.id === layerId);
      if (configIndex !== -1) {
        state.layerConfigs[configIndex] = { ...state.layerConfigs[configIndex], ...updates };
        
        // Recreate layer with new config
        this.removeLayer(layerId);
        this.addLayer(state.layerConfigs[configIndex]);
        
        return true;
      }
      return false;
    },
    
    // Layer visibility
    showLayer(layerId) {
      const layer = state.layers.get(layerId);
      if (layer) {
        layer.container.style.display = 'block';
        layer.container.style.opacity = '1';
      }
    },
    
    hideLayer(layerId) {
      const layer = state.layers.get(layerId);
      if (layer) {
        layer.container.style.opacity = '0';
        setTimeout(() => {
          if (layer.container.style.opacity === '0') {
            layer.container.style.display = 'none';
          }
        }, finalConfig.transitionDuration);
      }
    },
    
    toggleLayer(layerId) {
      const layer = state.layers.get(layerId);
      if (layer) {
        if (layer.container.style.display === 'none' || layer.container.style.opacity === '0') {
          this.showLayer(layerId);
        } else {
          this.hideLayer(layerId);
        }
      }
    },
    
    // Z-index management
    bringLayerToFront(layerId) {
      const layer = state.layers.get(layerId);
      if (layer) {
        const maxZIndex = Math.max(...state.layerConfigs.map(config => config.zIndex));
        layer.config.zIndex = maxZIndex + 1;
        layer.container.style.zIndex = layer.config.zIndex;
        
        // Update config
        const configIndex = state.layerConfigs.findIndex(config => config.id === layerId);
        if (configIndex !== -1) {
          state.layerConfigs[configIndex].zIndex = layer.config.zIndex;
        }
      }
    },
    
    sendLayerToBack(layerId) {
      const layer = state.layers.get(layerId);
      if (layer) {
        const minZIndex = Math.min(...state.layerConfigs.map(config => config.zIndex));
        layer.config.zIndex = minZIndex - 1;
        layer.container.style.zIndex = layer.config.zIndex;
        
        // Update config
        const configIndex = state.layerConfigs.findIndex(config => config.id === layerId);
        if (configIndex !== -1) {
          state.layerConfigs[configIndex].zIndex = layer.config.zIndex;
        }
      }
    },
    
    // Quick access to common layer types
    getFeedLayer() {
      return Array.from(state.layers.values())
        .find(layer => layer.config.type === 'feed');
    },
    
    getHUDLayer() {
      return Array.from(state.layers.values())
        .find(layer => layer.config.type === 'hud');
    },
    
    getAllLayers() {
      return Array.from(state.layers.values());
    },
    
    // Feed-specific methods (proxy to feed layer)
    addPost(post) {
      const feedLayer = this.getFeedLayer();
      if (feedLayer && feedLayer.component && feedLayer.component.addPost) {
        feedLayer.component.addPost(post);
      }
    },
    
    setPosts(posts) {
      const feedLayer = this.getFeedLayer();
      if (feedLayer && feedLayer.component && feedLayer.component.setPosts) {
        feedLayer.component.setPosts(posts);
      }
    },
    
    // HUD-specific methods (proxy to HUD layer)
    addHUDElement(element) {
      const hudLayer = this.getHUDLayer();
      if (hudLayer && hudLayer.component && hudLayer.component.addElement) {
        hudLayer.component.addElement(element);
      }
    },
    
    updateHUDElement(elementId, updates) {
      const hudLayer = this.getHUDLayer();
      if (hudLayer && hudLayer.component && hudLayer.component.updateElement) {
        hudLayer.component.updateElement(elementId, updates);
      }
    },
    
    // Event handling
    onFeedScroll(handler) {
      const feedLayer = this.getFeedLayer();
      if (feedLayer && feedLayer.component && feedLayer.component.onScroll) {
        feedLayer.component.onScroll(handler);
      }
    },
    
    onPostClick(handler) {
      const feedLayer = this.getFeedLayer();
      if (feedLayer && feedLayer.component && feedLayer.component.onPostClick) {
        feedLayer.component.onPostClick(handler);
      }
    },
    
    // Initialization
    initialize() {
      if (!state.isInitialized) {
        initializeLayers();
        setupScrollPassThrough();
      }
    },
    
    // State access
    getState() {
      return {
        isInitialized: state.isInitialized,
        layerCount: state.layers.size,
        layerIds: Array.from(state.layers.keys())
      };
    }
  };
  
  // Auto-initialize
  layeredUIComponent.initialize();
  
  return layeredUIComponent;
}

/**
 * Create a standard blog UI layout
 * @param {Object} config - Configuration object
 * @returns {Object} Layered UI component configured for blogging
 */
export function createBlogUI(config = {}) {
  const blogConfig = {
    ...config,
    layers: [
      {
        id: 'background',
        type: 'div',
        zIndex: 1,
        config: {
          backgroundColor: config.backgroundColor || '#fafafa'
        }
      },
      {
        id: 'feed',
        type: 'feed',
        zIndex: 100,
        config: {
          backgroundColor: 'transparent',
          responsive: true,
          ...config.feedConfig
        }
      },
      {
        id: 'navigation',
        type: 'hud',
        zIndex: 1000,
        config: {
          transparentZones: [
            {
              x: 20,
              y: 80,
              width: 'calc(100% - 40px)',
              height: 'calc(100% - 140px)',
              shape: 'rect'
            }
          ],
          elements: [
            {
              id: 'nav-title',
              type: 'text',
              x: 20,
              y: 30,
              content: config.title || 'Rhapsold',
              color: '#2c3e50',
              fontSize: 24,
              fontFamily: 'Georgia, serif'
            },
            {
              id: 'nav-compose',
              type: 'button',
              x: 'calc(100% - 120px)',
              y: 20,
              width: 100,
              height: 40,
              content: '✏️ Compose',
              backgroundColor: 'rgba(52, 152, 219, 0.9)',
              color: '#ffffff',
              onClick: config.onCompose || (() => console.log('Compose clicked'))
            }
          ],
          ...config.hudConfig
        }
      }
    ]
  };
  
  return createLayeredUI(blogConfig);
}

/**
 * Export default configuration
 */
export { DEFAULT_LAYERED_CONFIG as layeredUIDefaults };