/**
 * Scrollable Feed Component for The Nullary
 * Manages post display with virtual scrolling and responsive layout
 */

import { 
  createSVGContainer, 
  createSVGElement, 
  addSVGStyles, 
  generateSVGId 
} from '../utils/svg-utils.js';

/**
 * Default feed configuration
 */
const DEFAULT_FEED_CONFIG = {
  // Container
  className: 'nullary-feed',
  
  // Layout
  width: '100%',
  maxWidth: 800,
  padding: 20,
  gap: 30,
  
  // Scrolling
  virtualScrolling: false,
  itemHeight: 'auto',
  overscan: 3,
  
  // Styling
  backgroundColor: 'transparent',
  
  // Posts
  postSpacing: 30,
  showTimestamps: true,
  showActions: true,
  
  // Loading
  loadingText: 'Loading posts...',
  emptyText: 'No posts yet. Create your first post!',
  
  // Responsive
  responsive: true
};

/**
 * Create a scrollable feed component
 * @param {Object} config - Configuration object
 * @returns {Object} Feed component with methods
 */
export function createScrollableFeed(config = {}) {
  const finalConfig = { ...DEFAULT_FEED_CONFIG, ...config };
  
  // Create main container
  const container = document.createElement('div');
  container.className = finalConfig.className;
  container.id = generateSVGId('feed');
  
  // Apply container styles
  container.style.cssText = `
    position: relative;
    width: ${finalConfig.width};
    max-width: ${finalConfig.maxWidth}px;
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
    background: ${finalConfig.backgroundColor};
    padding: ${finalConfig.padding}px;
    margin: 0 auto;
    box-sizing: border-box;
    scroll-behavior: smooth;
    
    /* Custom scrollbar */
    scrollbar-width: thin;
    scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
  `;
  
  // Add custom scrollbar styles
  const scrollbarCSS = `
    .${finalConfig.className}::-webkit-scrollbar {
      width: 6px;
    }
    
    .${finalConfig.className}::-webkit-scrollbar-track {
      background: transparent;
    }
    
    .${finalConfig.className}::-webkit-scrollbar-thumb {
      background: rgba(0, 0, 0, 0.2);
      border-radius: 3px;
      transition: background 0.2s ease;
    }
    
    .${finalConfig.className}::-webkit-scrollbar-thumb:hover {
      background: rgba(0, 0, 0, 0.4);
    }
    
    /* Hide scrollbar on mobile when not scrolling */
    @media (hover: none) and (pointer: coarse) {
      .${finalConfig.className}::-webkit-scrollbar {
        display: none;
      }
      .${finalConfig.className} {
        scrollbar-width: none;
        -ms-overflow-style: none;
      }
    }
  `;
  
  // Create style element and add to head
  const styleElement = document.createElement('style');
  styleElement.textContent = scrollbarCSS;
  document.head.appendChild(styleElement);
  
  // Create posts container
  const postsContainer = document.createElement('div');
  postsContainer.className = 'feed-posts-container';
  postsContainer.style.cssText = `
    display: flex;
    flex-direction: column;
    gap: ${finalConfig.gap}px;
    min-height: 100%;
    position: relative;
  `;
  
  container.appendChild(postsContainer);
  
  // State management
  const state = {
    posts: [],
    filteredPosts: [],
    isLoading: false,
    isEmpty: true,
    scrollPosition: 0,
    filters: {},
    sortBy: 'timestamp',
    sortOrder: 'desc'
  };
  
  // Event handlers
  const eventHandlers = {
    onPostClick: null,
    onPostAction: null,
    onScroll: null,
    onLoadMore: null
  };
  
  // Create loading indicator
  function createLoadingIndicator() {
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'feed-loading';
    loadingDiv.style.cssText = `
      display: flex;
      justify-content: center;
      align-items: center;
      height: 200px;
      color: #666;
      font-style: italic;
    `;
    loadingDiv.textContent = finalConfig.loadingText;
    return loadingDiv;
  }
  
  // Create empty state
  function createEmptyState() {
    const emptyDiv = document.createElement('div');
    emptyDiv.className = 'feed-empty';
    emptyDiv.style.cssText = `
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      height: 300px;
      color: #999;
      text-align: center;
      font-style: italic;
    `;
    
    const icon = document.createElement('div');
    icon.style.cssText = 'font-size: 48px; margin-bottom: 16px; opacity: 0.5;';
    icon.textContent = '📝';
    
    const text = document.createElement('div');
    text.textContent = finalConfig.emptyText;
    
    emptyDiv.appendChild(icon);
    emptyDiv.appendChild(text);
    return emptyDiv;
  }
  
  // Create post wrapper
  function createPostWrapper(post, index) {
    const wrapper = document.createElement('div');
    wrapper.className = 'feed-post-wrapper';
    wrapper.dataset.postId = post.id || index;
    wrapper.style.cssText = `
      position: relative;
      margin-bottom: ${finalConfig.postSpacing}px;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      cursor: pointer;
    `;
    
    // Add hover effects
    wrapper.addEventListener('mouseenter', () => {
      wrapper.style.transform = 'translateY(-2px)';
    });
    
    wrapper.addEventListener('mouseleave', () => {
      wrapper.style.transform = 'translateY(0)';
    });
    
    // Add click handler
    wrapper.addEventListener('click', (e) => {
      if (eventHandlers.onPostClick) {
        eventHandlers.onPostClick(post, index, e);
      }
    });
    
    // Add timestamp if enabled
    if (finalConfig.showTimestamps && post.timestamp) {
      const timestamp = document.createElement('div');
      timestamp.className = 'post-timestamp';
      timestamp.style.cssText = `
        position: absolute;
        top: -24px;
        right: 0;
        font-size: 12px;
        color: #999;
        font-style: italic;
      `;
      timestamp.textContent = formatTimestamp(post.timestamp);
      wrapper.appendChild(timestamp);
    }
    
    // Add the post element
    if (post.element) {
      wrapper.appendChild(post.element);
    }
    
    // Add actions if enabled
    if (finalConfig.showActions) {
      const actions = createPostActions(post, index);
      wrapper.appendChild(actions);
    }
    
    return wrapper;
  }
  
  // Create post actions
  function createPostActions(post, index) {
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'post-actions';
    actionsDiv.style.cssText = `
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid #eee;
      opacity: 0;
      transition: opacity 0.2s ease;
    `;
    
    // Show actions on hover
    actionsDiv.parentElement?.addEventListener('mouseenter', () => {
      actionsDiv.style.opacity = '1';
    });
    
    actionsDiv.parentElement?.addEventListener('mouseleave', () => {
      actionsDiv.style.opacity = '0';
    });
    
    // Action buttons
    const actions = [
      { text: 'Share', action: 'share', icon: '📤' },
      { text: 'Edit', action: 'edit', icon: '✏️' },
      { text: 'Delete', action: 'delete', icon: '🗑️' }
    ];
    
    actions.forEach(actionConfig => {
      const button = document.createElement('button');
      button.className = 'post-action-button';
      button.style.cssText = `
        background: none;
        border: 1px solid #ddd;
        border-radius: 4px;
        padding: 4px 8px;
        font-size: 12px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 4px;
        transition: all 0.2s ease;
      `;
      
      button.innerHTML = `${actionConfig.icon} ${actionConfig.text}`;
      
      button.addEventListener('click', (e) => {
        e.stopPropagation();
        if (eventHandlers.onPostAction) {
          eventHandlers.onPostAction(actionConfig.action, post, index, e);
        }
      });
      
      button.addEventListener('mouseenter', () => {
        button.style.background = '#f0f0f0';
      });
      
      button.addEventListener('mouseleave', () => {
        button.style.background = 'none';
      });
      
      actionsDiv.appendChild(button);
    });
    
    return actionsDiv;
  }
  
  // Format timestamp
  function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
    
    return date.toLocaleDateString();
  }
  
  // Render posts
  function renderPosts() {
    // Clear container
    postsContainer.innerHTML = '';
    
    if (state.isLoading) {
      postsContainer.appendChild(createLoadingIndicator());
      return;
    }
    
    if (state.isEmpty || state.filteredPosts.length === 0) {
      postsContainer.appendChild(createEmptyState());
      return;
    }
    
    // Render posts
    state.filteredPosts.forEach((post, index) => {
      const wrapper = createPostWrapper(post, index);
      postsContainer.appendChild(wrapper);
    });
  }
  
  // Sort posts
  function sortPosts() {
    state.filteredPosts.sort((a, b) => {
      let aVal = a[state.sortBy];
      let bVal = b[state.sortBy];
      
      if (state.sortBy === 'timestamp') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }
      
      if (state.sortOrder === 'desc') {
        return bVal > aVal ? 1 : -1;
      } else {
        return aVal > bVal ? 1 : -1;
      }
    });
  }
  
  // Apply filters
  function applyFilters() {
    state.filteredPosts = state.posts.filter(post => {
      for (const [key, value] of Object.entries(state.filters)) {
        if (post[key] !== value) return false;
      }
      return true;
    });
    
    sortPosts();
    state.isEmpty = state.filteredPosts.length === 0;
  }
  
  // Handle scroll events
  container.addEventListener('scroll', (e) => {
    state.scrollPosition = e.target.scrollTop;
    
    if (eventHandlers.onScroll) {
      eventHandlers.onScroll(e.target.scrollTop, e);
    }
    
    // Check for load more
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollTop + clientHeight >= scrollHeight - 100) {
      if (eventHandlers.onLoadMore) {
        eventHandlers.onLoadMore();
      }
    }
  });
  
  // Component interface
  const feedComponent = {
    element: container,
    
    // Data management
    setPosts(posts) {
      state.posts = Array.isArray(posts) ? posts : [];
      applyFilters();
      renderPosts();
    },
    
    addPost(post) {
      state.posts.unshift(post);
      applyFilters();
      renderPosts();
    },
    
    removePost(postId) {
      state.posts = state.posts.filter(post => post.id !== postId);
      applyFilters();
      renderPosts();
    },
    
    updatePost(postId, updates) {
      const index = state.posts.findIndex(post => post.id === postId);
      if (index !== -1) {
        state.posts[index] = { ...state.posts[index], ...updates };
        applyFilters();
        renderPosts();
      }
    },
    
    // Filtering and sorting
    setFilter(key, value) {
      if (value === null || value === undefined) {
        delete state.filters[key];
      } else {
        state.filters[key] = value;
      }
      applyFilters();
      renderPosts();
    },
    
    clearFilters() {
      state.filters = {};
      applyFilters();
      renderPosts();
    },
    
    setSorting(sortBy, sortOrder = 'desc') {
      state.sortBy = sortBy;
      state.sortOrder = sortOrder;
      sortPosts();
      renderPosts();
    },
    
    // Loading states
    setLoading(loading) {
      state.isLoading = loading;
      renderPosts();
    },
    
    // Scrolling
    scrollToTop() {
      container.scrollTo({ top: 0, behavior: 'smooth' });
    },
    
    scrollToPost(postId) {
      const postElement = container.querySelector(`[data-post-id="${postId}"]`);
      if (postElement) {
        postElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    },
    
    getScrollPosition() {
      return state.scrollPosition;
    },
    
    // Event handlers
    onPostClick(handler) {
      eventHandlers.onPostClick = handler;
    },
    
    onPostAction(handler) {
      eventHandlers.onPostAction = handler;
    },
    
    onScroll(handler) {
      eventHandlers.onScroll = handler;
    },
    
    onLoadMore(handler) {
      eventHandlers.onLoadMore = handler;
    },
    
    // State access
    getState() {
      return { ...state };
    },
    
    getPosts() {
      return [...state.filteredPosts];
    }
  };
  
  // Initial render
  renderPosts();
  
  return feedComponent;
}

/**
 * Export default configuration
 */
export { DEFAULT_FEED_CONFIG as feedComponentDefaults };