/**
 * Two-Column Layout Component for The Nullary
 * Shared layout used by ninefy (products + teleported) and rhapsold (blog posts + teleported)
 */

import { createLoadingSpinner, createEmptyState } from '../utils/common-ui.js';
import { getAvailableBases } from '../utils/base-discovery.js';

/**
 * Create a two-column layout with main content on left and teleported content on right
 * @param {Object} config - Configuration object
 * @returns {Object} Two-column layout component
 */
export function createTwoColumnLayout(config = {}) {
  const {
    theme = {},
    leftColumn = {},
    rightColumn = {},
    teleportation = {},
    responsive = true,
    gap = '20px'
  } = config;

  // Main container
  const container = document.createElement('div');
  container.className = 'two-column-layout';
  container.style.cssText = `
    display: grid;
    grid-template-columns: 1fr 350px;
    gap: ${gap};
    height: 100%;
    padding: 20px;
    max-width: 1400px;
    margin: 0 auto;
    font-family: ${theme.typography?.fontFamily || 'system-ui'};
    ${responsive ? `
      @media (max-width: 1024px) {
        grid-template-columns: 1fr 300px;
        gap: 15px;
        padding: 15px;
      }
      @media (max-width: 768px) {
        grid-template-columns: 1fr;
        gap: 20px;
      }
    ` : ''}
  `;

  // Left column (main content)
  const leftColumnElement = document.createElement('div');
  leftColumnElement.className = 'left-column main-content';
  leftColumnElement.style.cssText = `
    background: ${leftColumn.backgroundColor || theme.colors?.surface || 'white'};
    border-radius: 12px;
    padding: 20px;
    overflow-y: auto;
    min-height: 0;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    border: 1px solid ${theme.colors?.border || '#e1e5e9'};
  `;

  // Right column (teleported content)
  const rightColumnElement = document.createElement('div');
  rightColumnElement.className = 'right-column teleported-content';
  rightColumnElement.style.cssText = `
    background: ${rightColumn.backgroundColor || theme.colors?.surface || 'white'};
    border-radius: 12px;
    padding: 20px;
    overflow-y: auto;
    min-height: 0;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    border: 1px solid ${theme.colors?.border || '#e1e5e9'};
    ${responsive ? `
      @media (max-width: 768px) {
        display: none;
      }
    ` : ''}
  `;

  // Add mobile toggle for right column
  let mobileToggle = null;
  if (responsive) {
    mobileToggle = document.createElement('button');
    mobileToggle.className = 'mobile-toggle';
    mobileToggle.innerHTML = '🔍 Discover';
    mobileToggle.style.cssText = `
      display: none;
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: ${theme.colors?.accent || '#3498db'};
      color: white;
      border: none;
      border-radius: 25px;
      padding: 12px 20px;
      font-size: 14px;
      font-weight: bold;
      cursor: pointer;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
      z-index: 1000;
      transition: all 0.3s ease;
      @media (max-width: 768px) {
        display: block;
      }
    `;

    mobileToggle.addEventListener('click', () => {
      const isVisible = rightColumnElement.style.display === 'block';
      if (isVisible) {
        rightColumnElement.style.display = 'none';
        mobileToggle.innerHTML = '🔍 Discover';
        container.style.gridTemplateColumns = '1fr';
      } else {
        rightColumnElement.style.display = 'block';
        mobileToggle.innerHTML = '✕ Close';
        container.style.gridTemplateColumns = '1fr 300px';
      }
    });

    container.appendChild(mobileToggle);
  }

  container.appendChild(leftColumnElement);
  container.appendChild(rightColumnElement);

  // Component state
  const state = {
    leftContentRenderer: null,
    teleportedContentCache: [],
    lastTeleportRefresh: 0,
    isLoading: false
  };

  // Component interface
  const twoColumnLayout = {
    element: container,
    leftColumn: leftColumnElement,
    rightColumn: rightColumnElement,

    /**
     * Set the content renderer for the left column
     * @param {Function} renderer - Function that renders content to the left column
     */
    setLeftColumnRenderer(renderer) {
      state.leftContentRenderer = renderer;
      if (renderer) {
        this.renderLeftColumn();
      }
    },

    /**
     * Render the left column content
     */
    async renderLeftColumn() {
      if (!state.leftContentRenderer) return;
      
      try {
        leftColumnElement.innerHTML = '';
        const spinner = createLoadingSpinner({ 
          text: 'Loading content...', 
          color: theme.colors?.accent 
        });
        leftColumnElement.appendChild(spinner);
        
        await state.leftContentRenderer(leftColumnElement);
        spinner.remove();
        
      } catch (error) {
        console.error('Failed to render left column:', error);
        leftColumnElement.innerHTML = '';
        const errorState = createEmptyState({
          icon: '❌',
          title: 'Content Error',
          description: 'Failed to load main content',
          theme
        });
        leftColumnElement.appendChild(errorState);
      }
    },

    /**
     * Initialize teleported content in the right column
     */
    async initializeTeleportedContent() {
      await this.renderTeleportedContent();
      
      // Auto-refresh every 10 minutes
      setInterval(() => {
        this.refreshTeleportedContent();
      }, 10 * 60 * 1000);
    },

    /**
     * Render teleported content in right column
     */
    async renderTeleportedContent() {
      try {
        // Show header
        const header = this.createTeleportedContentHeader();
        rightColumnElement.innerHTML = '';
        rightColumnElement.appendChild(header);

        // Show loading
        const spinner = createLoadingSpinner({ 
          text: 'Discovering content...', 
          color: theme.colors?.accent,
          size: '32px'
        });
        rightColumnElement.appendChild(spinner);

        // Get teleported content
        const teleportedContent = await this.fetchTeleportedContent();
        spinner.remove();

        if (teleportedContent.length === 0) {
          const emptyState = createEmptyState({
            icon: '🌐',
            title: 'No content discovered',
            description: 'No teleported content available from connected bases',
            theme
          });
          rightColumnElement.appendChild(emptyState);
          return;
        }

        // Create content list
        const contentList = this.createTeleportedContentList(teleportedContent);
        rightColumnElement.appendChild(contentList);

      } catch (error) {
        console.error('Failed to render teleported content:', error);
        rightColumnElement.innerHTML = '';
        const errorState = createEmptyState({
          icon: '📡',
          title: 'Discovery Error',
          description: 'Failed to discover content from network',
          theme
        });
        rightColumnElement.appendChild(errorState);
      }
    },

    /**
     * Create header for teleported content section
     */
    createTeleportedContentHeader() {
      const header = document.createElement('div');
      header.className = 'teleported-header';
      header.style.cssText = `
        margin-bottom: 20px;
        padding-bottom: 15px;
        border-bottom: 2px solid ${theme.colors?.background || '#f8f9fa'};
      `;

      header.innerHTML = `
        <h3 style="
          margin: 0 0 8px 0;
          color: ${theme.colors?.primary || '#2c3e50'};
          font-size: 18px;
          font-weight: bold;
          display: flex;
          align-items: center;
          gap: 8px;
        ">
          🌌 Network Discovery
        </h3>
        <p style="
          margin: 0;
          font-size: 14px;
          color: ${theme.colors?.secondary || '#7f8c8d'};
          line-height: 1.4;
        ">Content from connected Planet Nine bases</p>
      `;

      return header;
    },

    /**
     * Fetch teleported content from connected bases
     */
    async fetchTeleportedContent() {
      const now = Date.now();
      
      // Return cached content if fresh (5 minutes)
      if (state.teleportedContentCache.length > 0 && 
          (now - state.lastTeleportRefresh < 5 * 60 * 1000)) {
        return state.teleportedContentCache;
      }

      try {
        // Get available bases
        const bases = await getAvailableBases();
        const teleportedItems = [];

        // For demo purposes, create some sample teleported content
        // In real implementation, this would use BDO teleportation
        const sampleContent = [
          {
            id: 'teleported-1',
            type: 'product',
            title: 'Advanced React Course',
            description: 'Master React with this comprehensive course covering hooks, context, and performance optimization.',
            price: 9900,
            baseName: 'Dev Academy Base',
            baseId: 'dev-academy',
            category: 'course',
            image: null,
            author: 'Jane Developer'
          },
          {
            id: 'teleported-2',
            type: 'blog',
            title: 'Building Decentralized Apps',
            description: 'A deep dive into creating applications that work across the Planet Nine ecosystem.',
            author: 'Tech Blogger',
            baseName: 'Tech Base',
            baseId: 'tech-base',
            readTime: 12,
            category: 'blog'
          },
          {
            id: 'teleported-3',
            type: 'product',
            title: 'UI Design Templates Pack',
            description: 'Beautiful, responsive templates for modern web applications. Includes Figma source files.',
            price: 4900,
            baseName: 'Design Studio',
            baseId: 'design-studio',
            category: 'template',
            downloads: 245
          },
          {
            id: 'teleported-4',
            type: 'product',
            title: 'Planet Nine Conference 2025',
            description: 'Join developers, creators, and innovators for the annual Planet Nine ecosystem conference.',
            price: 12900,
            baseName: 'Event Organizers',
            baseId: 'events',
            category: 'ticket',
            venue: 'Virtual + SF'
          },
          {
            id: 'teleported-5',
            type: 'blog',
            title: 'The Future of Privacy',
            description: 'Exploring how cryptographic authentication is changing the way we think about online identity.',
            author: 'Privacy Advocate',
            baseName: 'Privacy Base',
            baseId: 'privacy-base',
            readTime: 8,
            category: 'blog'
          }
        ];

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));

        teleportedItems.push(...sampleContent);
        
        // Cache the results
        state.teleportedContentCache = teleportedItems;
        state.lastTeleportRefresh = now;

        return teleportedItems;

      } catch (error) {
        console.error('Failed to fetch teleported content:', error);
        return [];
      }
    },

    /**
     * Create list of teleported content items
     */
    createTeleportedContentList(items) {
      const list = document.createElement('div');
      list.className = 'teleported-content-list';
      list.style.cssText = `
        display: flex;
        flex-direction: column;
        gap: 15px;
      `;

      items.forEach(item => {
        const itemElement = this.createTeleportedContentItem(item);
        list.appendChild(itemElement);
      });

      return list;
    },

    /**
     * Create individual teleported content item
     */
    createTeleportedContentItem(item) {
      const itemElement = document.createElement('div');
      itemElement.className = 'teleported-item';
      itemElement.style.cssText = `
        background: ${theme.colors?.background || '#f8f9fa'};
        border-radius: 8px;
        padding: 15px;
        cursor: pointer;
        transition: all 0.2s ease;
        border: 1px solid transparent;
      `;

      // Content based on item type
      let contentHTML = '';
      
      if (item.type === 'product') {
        const price = item.price ? `$${(item.price / 100).toFixed(2)}` : 'Free';
        contentHTML = `
          <div style="display: flex; align-items: flex-start; gap: 10px; margin-bottom: 10px;">
            <span style="font-size: 24px;">${getCategoryIcon(item.category)}</span>
            <div style="flex: 1; min-width: 0;">
              <h4 style="
                margin: 0 0 5px 0; 
                font-size: 14px; 
                font-weight: bold; 
                color: ${theme.colors?.primary || '#2c3e50'};
                line-height: 1.3;
              ">${item.title}</h4>
              <p style="
                margin: 0 0 8px 0; 
                font-size: 12px; 
                color: ${theme.colors?.secondary || '#7f8c8d'};
                line-height: 1.3;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                overflow: hidden;
              ">${item.description}</p>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="
                  font-size: 14px; 
                  font-weight: bold; 
                  color: ${theme.colors?.accent || '#27ae60'};
                ">${price}</span>
                <span style="
                  font-size: 11px; 
                  color: ${theme.colors?.secondary || '#7f8c8d'};
                ">${item.baseName}</span>
              </div>
            </div>
          </div>
        `;
      } else if (item.type === 'blog') {
        contentHTML = `
          <div style="display: flex; align-items: flex-start; gap: 10px; margin-bottom: 10px;">
            <span style="font-size: 24px;">📝</span>
            <div style="flex: 1; min-width: 0;">
              <h4 style="
                margin: 0 0 5px 0; 
                font-size: 14px; 
                font-weight: bold; 
                color: ${theme.colors?.primary || '#2c3e50'};
                line-height: 1.3;
              ">${item.title}</h4>
              <p style="
                margin: 0 0 8px 0; 
                font-size: 12px; 
                color: ${theme.colors?.secondary || '#7f8c8d'};
                line-height: 1.3;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                overflow: hidden;
              ">${item.description}</p>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="
                  font-size: 11px; 
                  color: ${theme.colors?.secondary || '#7f8c8d'};
                ">by ${item.author} • ${item.readTime} min read</span>
                <span style="
                  font-size: 11px; 
                  color: ${theme.colors?.secondary || '#7f8c8d'};
                ">${item.baseName}</span>
              </div>
            </div>
          </div>
        `;
      }

      itemElement.innerHTML = contentHTML;

      // Hover effects
      itemElement.addEventListener('mouseenter', () => {
        itemElement.style.background = theme.colors?.backgroundHover || '#f0f0f0';
        itemElement.style.borderColor = theme.colors?.accent || '#3498db';
        itemElement.style.transform = 'translateY(-2px)';
        itemElement.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
      });

      itemElement.addEventListener('mouseleave', () => {
        itemElement.style.background = theme.colors?.background || '#f8f9fa';
        itemElement.style.borderColor = 'transparent';
        itemElement.style.transform = 'translateY(0)';
        itemElement.style.boxShadow = 'none';
      });

      // Click handling
      itemElement.addEventListener('click', () => {
        this.handleTeleportedItemClick(item);
      });

      return itemElement;
    },

    /**
     * Handle click on teleported content item
     */
    handleTeleportedItemClick(item) {
      console.log('Clicked teleported item:', item);
      
      // Emit custom event for parent app to handle
      const event = new CustomEvent('teleported-item-click', {
        detail: { item },
        bubbles: true
      });
      container.dispatchEvent(event);
      
      // Show toast notification
      import('../utils/common-ui.js').then(({ showToast }) => {
        showToast({
          message: `Opening "${item.title}" from ${item.baseName}`,
          type: 'info',
          duration: 2000
        });
      });
    },

    /**
     * Refresh teleported content
     */
    async refreshTeleportedContent() {
      if (state.isLoading) return;
      
      state.isLoading = true;
      state.teleportedContentCache = [];
      state.lastTeleportRefresh = 0;
      
      await this.renderTeleportedContent();
      state.isLoading = false;
    },

    /**
     * Add refresh button to header
     */
    addRefreshButton() {
      const header = rightColumnElement.querySelector('.teleported-header');
      if (!header) return;

      const refreshButton = document.createElement('button');
      refreshButton.innerHTML = '🔄';
      refreshButton.title = 'Refresh content';
      refreshButton.style.cssText = `
        background: none;
        border: none;
        font-size: 16px;
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        color: ${theme.colors?.secondary || '#7f8c8d'};
        float: right;
        margin-top: -30px;
      `;

      refreshButton.addEventListener('click', () => {
        this.refreshTeleportedContent();
      });

      header.appendChild(refreshButton);
    }
  };

  // Initialize teleported content
  twoColumnLayout.initializeTeleportedContent().then(() => {
    twoColumnLayout.addRefreshButton();
  });

  return twoColumnLayout;
}

/**
 * Get category icon for different content types
 */
function getCategoryIcon(category) {
  const icons = {
    ebook: '📚',
    course: '🎓',
    ticket: '🎫',
    template: '🎨',
    software: '💻',
    music: '🎵',
    video: '🎥',
    blog: '📝',
    default: '📄'
  };
  
  return icons[category?.toLowerCase()] || icons.default;
}

export { createTwoColumnLayout };