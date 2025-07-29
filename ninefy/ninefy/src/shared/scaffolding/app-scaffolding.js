/**
 * App Scaffolding for The Nullary
 * Reusable scaffolding architecture for SVG-based Tauri apps
 */

import { createBlogUI, createLayeredUI } from '../utils/layered-ui.js';
import { createHUDOverlay, createNavigationHUD, createStatusHUD } from '../components/hud.js';
import { createScrollableFeed } from '../components/feed.js';
import { createTextComponent, createMultilineTextComponent } from '../components/text.js';
import { createBlogPostForm, createTextInputForm } from '../components/forms.js';
import { createPostFromForm, POST_TYPES } from '../utils/post-creator.js';

/**
 * Default app scaffolding configuration
 */
const DEFAULT_SCAFFOLDING_CONFIG = {
  // App metadata
  appName: 'Nullary App',
  appDescription: 'A Nullary SVG-based application',
  version: '1.0.0',
  
  // UI type
  uiType: 'blog', // 'blog', 'feed', 'custom'
  
  // Theme
  theme: {
    colors: {
      primary: '#2c3e50',
      secondary: '#7f8c8d',
      accent: '#3498db',
      background: '#fafafa',
      surface: '#ffffff',
      text: '#2c3e50',
      muted: '#95a5a6',
      border: '#ecf0f1',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444'
    },
    typography: {
      fontFamily: 'Georgia, serif',
      fontSize: 16,
      lineHeight: 1.6,
      headerSize: 32,
      postTitleSize: 24
    }
  },
  
  // Features
  features: {
    posts: true,
    forms: true,
    storage: true,
    allyabase: true,
    responsive: true,
    animations: true
  },
  
  // Layout
  layout: {
    showNavigation: true,
    showStatus: true,
    enableScrollableContent: true,
    modalCompose: true
  },
  
  // Storage
  storage: {
    key: 'nullary-app-data',
    persistence: 'localStorage' // 'localStorage', 'allyabase', 'both'
  }
};

/**
 * Create app scaffolding
 * @param {Object} config - Configuration object
 * @returns {Object} App scaffolding with methods
 */
export function createAppScaffolding(config = {}) {
  const finalConfig = { ...DEFAULT_SCAFFOLDING_CONFIG, ...config };
  
  // Application state
  const appState = {
    isInitialized: false,
    layeredUI: null,
    posts: [],
    forms: {},
    storage: null,
    allyabaseClient: null,
    isConnected: false,
    currentTheme: finalConfig.theme
  };
  
  // Initialize storage
  async function initializeStorage() {
    if (!finalConfig.features.storage) return;
    
    try {
      // Load from localStorage
      const stored = localStorage.getItem(finalConfig.storage.key);
      if (stored) {
        const data = JSON.parse(stored);
        appState.posts = data.posts || [];
        console.log(`📦 Loaded ${appState.posts.length} items from storage`);
      }
    } catch (error) {
      console.warn('⚠️ Could not load from storage:', error);
    }
  }
  
  // Save to storage
  function saveToStorage() {
    if (!finalConfig.features.storage) return;
    
    try {
      const data = {
        posts: appState.posts,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem(finalConfig.storage.key, JSON.stringify(data));
    } catch (error) {
      console.warn('⚠️ Could not save to storage:', error);
    }
  }
  
  // Initialize allyabase connection
  async function initializeAllyabase() {
    if (!finalConfig.features.allyabase) return;
    
    try {
      // Try to connect to allyabase
      if (window.allyabase) {
        appState.allyabaseClient = window.allyabase;
        appState.isConnected = true;
        console.log('🌐 Connected to allyabase');
      }
    } catch (error) {
      console.warn('⚠️ Could not connect to allyabase:', error);
    }
  }
  
  // Create UI based on type
  function createUI() {
    const container = document.getElementById('app') || document.body;
    container.innerHTML = '';
    
    switch (finalConfig.uiType) {
      case 'blog':
        appState.layeredUI = createBlogUI({
          title: finalConfig.appName,
          backgroundColor: finalConfig.theme.colors.background,
          feedConfig: {
            backgroundColor: 'transparent',
            responsive: finalConfig.features.responsive,
            showTimestamps: true,
            showActions: true
          },
          hudConfig: {
            background: 'rgba(255, 255, 255, 0.95)'
          },
          onCompose: () => showComposeModal()
        });
        break;
        
      case 'feed':
        appState.layeredUI = createLayeredUI({
          layers: [
            {
              id: 'background',
              type: 'div',
              zIndex: 1,
              config: { backgroundColor: finalConfig.theme.colors.background }
            },
            {
              id: 'feed',
              type: 'feed',
              zIndex: 100,
              config: {
                backgroundColor: 'transparent',
                responsive: finalConfig.features.responsive
              }
            }
          ]
        });
        break;
        
      case 'custom':
        if (finalConfig.customUIFactory) {
          appState.layeredUI = finalConfig.customUIFactory(finalConfig);
        } else {
          throw new Error('Custom UI type requires customUIFactory function');
        }
        break;
        
      default:
        throw new Error(`Unknown UI type: ${finalConfig.uiType}`);
    }
    
    container.appendChild(appState.layeredUI.element);
  }
  
  // Load and display posts
  function loadPosts() {
    if (appState.posts.length > 0 && appState.layeredUI) {
      const feedPosts = appState.posts.map(post => ({
        id: post.id || Date.now(),
        element: recreatePostElement(post),
        timestamp: post.timestamp,
        type: post.type,
        data: post.data
      }));
      
      appState.layeredUI.setPosts(feedPosts);
    }
  }
  
  // Recreate post element from stored data
  function recreatePostElement(post) {
    try {
      if (post.type === 'blog' && post.data) {
        const postElement = createPostFromForm(
          post.data,
          POST_TYPES.BLOG,
          appState.currentTheme
        );
        return postElement.element;
      }
      
      // Fallback to simple text
      return createTextComponent({
        text: post.data?.content || post.data?.title || 'Post content',
        fontSize: 16,
        fontFamily: finalConfig.theme.typography.fontFamily,
        color: finalConfig.theme.colors.text,
        width: 600,
        height: 'auto',
        padding: 20
      });
    } catch (error) {
      console.warn('⚠️ Could not recreate post:', error);
      return createTextComponent({
        text: 'Error loading post',
        fontSize: 14,
        color: finalConfig.theme.colors.error,
        width: 600,
        height: 40
      });
    }
  }
  
  // Show compose modal
  function showComposeModal() {
    if (!finalConfig.layout.modalCompose) return;
    
    // Create modal overlay
    const modalOverlay = document.createElement('div');
    modalOverlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      z-index: 2000;
      display: flex;
      justify-content: center;
      align-items: center;
      opacity: 0;
      transition: opacity 0.3s ease;
    `;
    
    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
      background: white;
      border-radius: 12px;
      padding: 30px;
      max-width: 600px;
      width: 90%;
      max-height: 90%;
      overflow-y: auto;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      transform: scale(0.9);
      transition: transform 0.3s ease;
    `;
    
    // Create form
    const form = createBlogPostForm({
      width: 540,
      backgroundColor: finalConfig.theme.colors.surface,
      borderColor: finalConfig.theme.colors.border,
      colors: finalConfig.theme.colors,
      fontFamily: finalConfig.theme.typography.fontFamily
    });
    
    // Handle form submission
    form.onSubmit(async (postData) => {
      try {
        const result = createPostFromForm(
          postData,
          POST_TYPES.BLOG,
          appState.currentTheme
        );
        
        if (result.success) {
          addPost(result);
          closeModal();
          showMessage('✅ Post created successfully!', 'success');
        } else {
          showMessage(`❌ Error: ${result.error}`, 'error');
        }
      } catch (error) {
        showMessage(`❌ Error: ${error.message}`, 'error');
      }
    });
    
    modalContent.appendChild(form.element);
    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);
    
    // Close modal function
    function closeModal() {
      modalOverlay.style.opacity = '0';
      modalContent.style.transform = 'scale(0.9)';
      setTimeout(() => {
        if (modalOverlay.parentNode) {
          modalOverlay.parentNode.removeChild(modalOverlay);
        }
      }, 300);
    }
    
    // Close on overlay click
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeModal();
    });
    
    // Animate in
    setTimeout(() => {
      modalOverlay.style.opacity = '1';
      modalContent.style.transform = 'scale(1)';
    }, 10);
  }
  
  // Add post to app
  function addPost(post) {
    const feedPost = {
      id: post.id || Date.now(),
      element: post.element,
      timestamp: post.timestamp || new Date().toISOString(),
      type: post.type,
      data: post.data
    };
    
    // Add to UI
    if (appState.layeredUI && appState.layeredUI.addPost) {
      appState.layeredUI.addPost(feedPost);
    }
    
    // Add to state
    appState.posts.unshift(post);
    
    // Save to storage
    saveToStorage();
  }
  
  // Show message
  function showMessage(text, type = 'info') {
    const messageEl = createTextComponent({
      text,
      fontSize: 14,
      fontFamily: finalConfig.theme.typography.fontFamily,
      color: type === 'error' ? finalConfig.theme.colors.error : 
             type === 'success' ? finalConfig.theme.colors.success : 
             finalConfig.theme.colors.primary,
      backgroundColor: type === 'error' ? '#fef2f2' : 
                      type === 'success' ? '#f0fdf4' : '#eff6ff',
      textAlign: 'center',
      width: 400,
      height: 50,
      padding: 10
    });
    
    messageEl.style.cssText += `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 3000;
      opacity: 0;
      transition: opacity 0.3s ease;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    `;
    
    document.body.appendChild(messageEl);
    
    setTimeout(() => messageEl.style.opacity = '1', 100);
    setTimeout(() => {
      messageEl.style.opacity = '0';
      setTimeout(() => {
        if (messageEl.parentNode) {
          messageEl.parentNode.removeChild(messageEl);
        }
      }, 300);
    }, 3000);
  }
  
  // Scaffolding interface
  const scaffolding = {
    // State access
    getState: () => ({ ...appState }),
    getConfig: () => ({ ...finalConfig }),
    
    // Initialization
    async initialize() {
      if (appState.isInitialized) return;
      
      console.log(`🏗️ Initializing ${finalConfig.appName}...`);
      
      // Initialize storage
      await initializeStorage();
      
      // Initialize allyabase
      await initializeAllyabase();
      
      // Create UI
      createUI();
      
      // Load posts
      loadPosts();
      
      // Setup event handlers
      if (appState.layeredUI) {
        appState.layeredUI.onPostClick?.((post, index, event) => {
          console.log('📄 Post clicked:', post);
        });
      }
      
      appState.isInitialized = true;
      console.log(`✅ ${finalConfig.appName} initialized`);
    },
    
    // Content management
    addPost,
    removePost(postId) {
      appState.posts = appState.posts.filter(p => p.id !== postId);
      if (appState.layeredUI && appState.layeredUI.removePost) {
        appState.layeredUI.removePost(postId);
      }
      saveToStorage();
    },
    
    getPosts: () => [...appState.posts],
    clearPosts() {
      appState.posts = [];
      if (appState.layeredUI && appState.layeredUI.setPosts) {
        appState.layeredUI.setPosts([]);
      }
      saveToStorage();
    },
    
    // UI management
    getLayeredUI: () => appState.layeredUI,
    showCompose: showComposeModal,
    showMessage,
    
    // Theme management
    updateTheme(themeUpdates) {
      appState.currentTheme = { ...appState.currentTheme, ...themeUpdates };
      // Could trigger UI refresh here
    },
    
    // Storage management
    saveToStorage,
    loadFromStorage: initializeStorage,
    
    // Lifecycle
    destroy() {
      if (appState.layeredUI && appState.layeredUI.element) {
        const container = appState.layeredUI.element.parentNode;
        if (container) {
          container.removeChild(appState.layeredUI.element);
        }
      }
      appState.isInitialized = false;
    }
  };
  
  return scaffolding;
}

/**
 * Create blog app scaffolding (convenience function)
 * @param {Object} config - Configuration object
 * @returns {Object} Blog app scaffolding
 */
export function createBlogAppScaffolding(config = {}) {
  return createAppScaffolding({
    ...config,
    uiType: 'blog',
    features: {
      posts: true,
      forms: true,
      storage: true,
      allyabase: true,
      responsive: true,
      animations: true,
      ...config.features
    }
  });
}

/**
 * Create feed app scaffolding (convenience function)
 * @param {Object} config - Configuration object
 * @returns {Object} Feed app scaffolding
 */
export function createFeedAppScaffolding(config = {}) {
  return createAppScaffolding({
    ...config,
    uiType: 'feed',
    layout: {
      showNavigation: false,
      showStatus: false,
      enableScrollableContent: true,
      modalCompose: false,
      ...config.layout
    }
  });
}

/**
 * Export default configuration
 */
export { DEFAULT_SCAFFOLDING_CONFIG as appScaffoldingDefaults };