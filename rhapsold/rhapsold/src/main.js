/**
 * Rhapsold - Main Application Entry Point
 * A minimalist blogging platform using SVG components
 */

// Import shared SVG components
import { createTextComponent, createMultilineTextComponent } from '../../shared/components/text.js';
import { createSVGContainer, makeResponsive } from '../../shared/utils/svg-utils.js';

// Import form components
import { createTextInputForm, createTextareaForm, createBlogPostForm } from '../../shared/components/forms.js';

// Import post creation system
import { 
  createPostFromForm, 
  savePostToAllyabase, 
  createAndSavePost, 
  POST_TYPES 
} from '../../shared/utils/post-creator.js';

// Import layered UI system
import { createBlogUI } from '../../shared/utils/layered-ui.js';

// Import application modules
import { initializeApp } from './components/app.js';
import { loadTheme } from './config/theme.js';
import { connectToAllyabase } from './services/allyabase.js';

/**
 * Application state
 */
const appState = {
  currentTheme: null,
  currentPost: null,
  posts: [],
  isLoading: true,
  connected: false,
  allyabaseClient: null,
  formInstances: {},
  layeredUI: null
};

/**
 * Initialize the application
 */
async function init() {
  try {
    console.log('🎭 Initializing Rhapsold...');
    
    // Load theme configuration
    console.log('📝 Step 1: Loading theme...');
    appState.currentTheme = await loadTheme();
    console.log('🎨 Theme loaded:', appState.currentTheme.name);
    
    // Connect to allyabase
    console.log('📝 Step 2: Connecting to allyabase...');
    try {
      const connection = await connectToAllyabase();
      appState.connected = true;
      appState.allyabaseClient = connection.client;
      console.log('🌐 Connected to allyabase');
    } catch (error) {
      console.warn('⚠️ Could not connect to allyabase:', error.message);
      console.log('📝 Running in offline mode');
      // Still set the client for offline mode
      appState.allyabaseClient = window.allyabase;
    }
    
    // Initialize layered UI
    console.log('📝 Step 3: Initializing layered UI...');
    await initializeLayeredUI();
    
    // Hide loading screen
    console.log('📝 Step 4: Hiding loading screen...');
    hideLoadingScreen();
    
    console.log('✅ Rhapsold initialized successfully');
    
  } catch (error) {
    console.error('❌ Failed to initialize Rhapsold:', error);
    console.error('❌ Error stack:', error.stack);
    
    // Create a simple fallback UI
    try {
      console.log('🔄 Creating fallback UI...');
      createFallbackUI(error);
    } catch (fallbackError) {
      console.error('❌ Fallback UI also failed:', fallbackError);
      showError('Failed to initialize application. Please refresh the page.');
    }
  }
}

/**
 * Initialize the layered UI system
 */
async function initializeLayeredUI() {
  console.log('🏗️ Initializing layered UI...');
  
  // Get the main app container
  console.log('📝 Getting app container...');
  const appContainer = document.getElementById('app') || document.body;
  console.log('📝 App container found:', appContainer);
  
  // Clear existing content
  console.log('📝 Clearing existing content...');
  appContainer.innerHTML = '';
  
  // Create layered UI
  console.log('📝 Creating layered UI...');
  appState.layeredUI = createBlogUI({
    title: 'Rhapsold',
    backgroundColor: appState.currentTheme.colors.background || '#fafafa',
    feedConfig: {
      backgroundColor: 'transparent',
      responsive: true,
      showTimestamps: true,
      showActions: true
    },
    hudConfig: {
      background: 'rgba(255, 255, 255, 0.95)'
    },
    onCompose: async () => {
      console.log('✏️ Compose button clicked');
      await showComposeForm();
    }
  });
  
  // Add to container
  console.log('📝 Adding layered UI to container...');
  appContainer.appendChild(appState.layeredUI.element);
  console.log('📝 Layered UI added successfully');
  
  // Load and display existing posts
  console.log('📝 Loading existing posts...');
  await loadExistingPosts();
  
  // Add demo content if no posts exist
  if (appState.posts.length === 0) {
    await createDemoPost();
  }
  
  // Setup event handlers
  setupEventHandlers();
  
  // Update HUD status
  updateHUDStatus();
  
  console.log('✅ Layered UI initialized');
}

/**
 * Show compose form in a modal overlay
 */
async function showComposeForm() {
  console.log('📝 Showing compose form...');
  
  // Create modal overlay
  const modalOverlay = document.createElement('div');
  modalOverlay.className = 'compose-modal-overlay';
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
  modalContent.className = 'compose-modal-content';
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
  
  // Create form header
  const formHeader = createTextComponent({
    text: 'Create New Post',
    fontSize: 24,
    fontFamily: appState.currentTheme.typography.fontFamily,
    color: appState.currentTheme.colors.primary || '#2c3e50',
    textAlign: 'center',
    width: 540,
    height: 50,
    padding: 15,
    className: 'compose-form-header'
  });
  
  modalContent.appendChild(formHeader);
  
  // Create blog post form
  const blogFormConfig = {
    width: 540,
    backgroundColor: appState.currentTheme.colors.surface || '#fafafa',
    borderColor: appState.currentTheme.colors.border || '#ecf0f1',
    borderRadius: 8,
    fontFamily: appState.currentTheme.typography.fontFamily,
    colors: appState.currentTheme.colors,
    postWidth: 540,
    titleFontSize: 20,
    contentFontSize: 16,
    contentLineHeight: 1.6
  };
  
  const blogForm = createBlogPostForm(blogFormConfig);
  appState.formInstances.modalBlogForm = blogForm;
  
  // Set up form submission handler
  blogForm.onSubmit(async (postConfig) => {
    console.log('📤 Modal form submitted:', postConfig);
    
    try {
      // Show loading state
      showMessage('Creating post...', 'info');
      
      // Create and save post
      const result = await createAndSavePost(
        blogForm, 
        POST_TYPES.BLOG, 
        appState.currentTheme, 
        appState.allyabaseClient
      );
      
      if (result.success) {
        showMessage('✅ Post created successfully!', 'success');
        
        // Add to layered UI feed
        addPostToFeed(result.post);
        
        // Update HUD status
        updateHUDStatus();
        
        // Close modal
        closeModal();
        
        console.log('✅ Post created and saved:', result);
      } else {
        showMessage(`❌ Failed to create post: ${result.error}`, 'error');
      }
      
    } catch (error) {
      console.error('❌ Error creating post:', error);
      showMessage(`❌ Error: ${error.message}`, 'error');
    }
  });
  
  // Set up clear handler
  blogForm.onClear(() => {
    console.log('🧹 Modal form cleared');
  });
  
  modalContent.appendChild(blogForm.element);
  
  // Create close button
  const closeButton = document.createElement('button');
  closeButton.textContent = '✕ Close';
  closeButton.style.cssText = `
    position: absolute;
    top: 10px;
    right: 10px;
    background: transparent;
    border: none;
    font-size: 16px;
    cursor: pointer;
    padding: 5px 10px;
    border-radius: 4px;
    color: #666;
  `;
  closeButton.addEventListener('click', closeModal);
  closeButton.addEventListener('mouseenter', () => {
    closeButton.style.background = '#f0f0f0';
  });
  closeButton.addEventListener('mouseleave', () => {
    closeButton.style.background = 'transparent';
  });
  
  modalContent.appendChild(closeButton);
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
    if (e.target === modalOverlay) {
      closeModal();
    }
  });
  
  // Escape key to close
  const escapeHandler = (e) => {
    if (e.key === 'Escape') {
      closeModal();
      document.removeEventListener('keydown', escapeHandler);
    }
  };
  document.addEventListener('keydown', escapeHandler);
  
  // Animate in
  setTimeout(() => {
    modalOverlay.style.opacity = '1';
    modalContent.style.transform = 'scale(1)';
  }, 10);
}

/**
 * Load existing posts from storage
 */
async function loadExistingPosts() {
  console.log('📄 Loading existing posts...');
  
  try {
    // Try to load from allyabase or local storage
    const savedPosts = localStorage.getItem('rhapsold-posts');
    if (savedPosts) {
      const posts = JSON.parse(savedPosts);
      appState.posts = posts;
      
      // Add posts to feed
      if (appState.layeredUI && posts.length > 0) {
        // Convert stored post data back to elements
        const feedPosts = posts.map(post => ({
          id: post.id || Date.now(),
          element: recreatePostElement(post),
          timestamp: post.timestamp,
          type: post.type,
          data: post.data
        }));
        
        appState.layeredUI.setPosts(feedPosts);
      }
      
      console.log(`📄 Loaded ${posts.length} existing posts`);
    }
  } catch (error) {
    console.warn('⚠️ Could not load existing posts:', error);
  }
}

/**
 * Recreate post element from stored data
 */
function recreatePostElement(post) {
  try {
    if (post.type === 'blog' && post.data) {
      // Recreate blog post element
      const postElement = createPostFromForm(
        post.data,
        POST_TYPES.BLOG,
        appState.currentTheme
      );
      return postElement.element;
    }
    
    // Fallback: create simple text element
    return createTextComponent({
      text: post.data?.content || 'Post content unavailable',
      fontSize: 16,
      fontFamily: appState.currentTheme.typography.fontFamily,
      color: appState.currentTheme.colors.text || '#2c3e50',
      width: 600,
      height: 'auto',
      padding: 20
    });
  } catch (error) {
    console.warn('⚠️ Could not recreate post element:', error);
    return createTextComponent({
      text: 'Error loading post',
      fontSize: 14,
      color: '#ef4444',
      width: 600,
      height: 40
    });
  }
}

/**
 * Add post to the layered UI feed
 */
function addPostToFeed(post) {
  if (!appState.layeredUI || !post.element) return;
  
  // Create feed post object
  const feedPost = {
    id: post.id || Date.now(),
    element: post.element,
    timestamp: post.timestamp,
    type: post.type,
    data: post.data
  };
  
  // Add to layered UI feed
  appState.layeredUI.addPost(feedPost);
  
  // Add to app state
  appState.posts.unshift(post);
  
  // Save to local storage
  try {
    localStorage.setItem('rhapsold-posts', JSON.stringify(appState.posts));
  } catch (error) {
    console.warn('⚠️ Could not save posts to local storage:', error);
  }
  
  console.log('📄 Post added to feed:', post.type);
}

/**
 * Show message to user
 */
function showMessage(text, type = 'info') {
  console.log(`💬 Message (${type}): ${text}`);
  
  // Create temporary message element
  const messageConfig = {
    text: text,
    fontSize: 14,
    fontFamily: appState.currentTheme.typography.fontFamily,
    color: type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#3498db',
    backgroundColor: type === 'error' ? '#fef2f2' : type === 'success' ? '#f0fdf4' : '#eff6ff',
    borderColor: type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#3498db',
    borderWidth: 1,
    textAlign: 'center',
    width: 500,
    height: 50,
    padding: 10,
    className: 'message-toast'
  };
  
  const messageElement = createTextComponent(messageConfig);
  messageElement.style.position = 'fixed';
  messageElement.style.top = '20px';
  messageElement.style.left = '50%';
  messageElement.style.transform = 'translateX(-50%)';
  messageElement.style.zIndex = '1000';
  messageElement.style.opacity = '0';
  messageElement.style.transition = 'opacity 0.3s ease';
  
  document.body.appendChild(messageElement);
  
  // Fade in
  setTimeout(() => {
    messageElement.style.opacity = '1';
  }, 100);
  
  // Fade out and remove
  setTimeout(() => {
    messageElement.style.opacity = '0';
    setTimeout(() => {
      if (messageElement.parentNode) {
        messageElement.parentNode.removeChild(messageElement);
      }
    }, 300);
  }, 3000);
}

/**
 * Create demo blog post
 */
async function createDemoPost() {
  console.log('📄 Creating demo post...');
  
  try {
    // Create demo post data
    const demoPostData = {
      title: 'Welcome to Rhapsold',
      content: `This is a demonstration of Rhapsold's new layered UI system with scrollable feeds and SVG HUD overlays.

The platform now features:
• Scrollable feed with virtual scrolling support
• SVG HUD overlay with transparent scrolling zones
• Layered UI manager for complex interactions
• Modal compose forms for distraction-free writing
• Persistent local storage for your posts
• Smooth animations and responsive design

The feed below is fully scrollable, while the navigation HUD remains fixed on top. The transparent zones allow you to scroll through posts while interacting with the HUD controls.

Try clicking the "Compose" button in the top-right to create your own post!`,
      timestamp: new Date().toISOString()
    };
    
    // Create post element
    const demoPost = createPostFromForm(
      demoPostData,
      POST_TYPES.BLOG,
      appState.currentTheme
    );
    
    if (demoPost.success) {
      // Add to feed
      addPostToFeed(demoPost);
      console.log('✅ Demo post created and added to feed');
    } else {
      console.warn('⚠️ Could not create demo post:', demoPost.error);
    }
    
  } catch (error) {
    console.error('❌ Error creating demo post:', error);
  }
}

/**
 * Update HUD status text
 */
function updateHUDStatus() {
  if (appState.layeredUI) {
    const statusText = `${appState.posts.length} posts • ${appState.connected ? 'Connected to allyabase' : 'Offline mode'}`;
    
    appState.layeredUI.updateHUDElement('status-text', {
      content: statusText
    });
  }
}

/**
 * Setup event handlers
 */
function setupEventHandlers() {
  if (!appState.layeredUI) return;
  
  // Handle post clicks
  appState.layeredUI.onPostClick((post, index, event) => {
    console.log('📄 Post clicked:', post);
    // Could open post details, edit mode, etc.
  });
  
  // Handle feed scroll
  appState.layeredUI.onFeedScroll((scrollPosition) => {
    // Could implement scroll-based features like infinite loading
    // console.log('📜 Feed scrolled to:', scrollPosition);
  });
  
  // Handle window resize
  window.addEventListener('resize', () => {
    console.log('📐 Window resized, layout will auto-adjust');
  });
}

/**
 * Hide loading screen
 */
function hideLoadingScreen() {
  const loadingElement = document.getElementById('loading');
  if (loadingElement) {
    loadingElement.style.opacity = '0';
    setTimeout(() => {
      loadingElement.style.display = 'none';
      appState.isLoading = false;
    }, 500);
  }
}

/**
 * Show error message
 */
function showError(message) {
  console.error('❌ Application Error:', message);
  
  // Create error display using SVG components
  const errorContainer = document.getElementById('content-container');
  if (errorContainer) {
    errorContainer.innerHTML = '';
    
    const errorConfig = {
      text: `Error: ${message}`,
      fontSize: 18,
      fontFamily: 'Arial, sans-serif',
      color: '#e74c3c',
      textAlign: 'center',
      width: 600,
      height: 100,
      padding: 20,
      backgroundColor: '#fdf2f2',
      borderColor: '#e74c3c',
      borderWidth: 1,
      className: 'error-message'
    };
    
    const errorSVG = createTextComponent(errorConfig);
    errorContainer.appendChild(errorSVG);
  }
}

/**
 * Create a simple fallback UI when main initialization fails
 */
function createFallbackUI(error) {
  console.log('🔄 Creating simple fallback UI...');
  
  // Get the app container
  const appContainer = document.getElementById('app') || document.body;
  appContainer.innerHTML = '';
  
  // Create simple HTML structure
  const fallbackHTML = `
    <div style="
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 20px;
      font-family: Georgia, serif;
      line-height: 1.6;
      color: #2c3e50;
    ">
      <h1 style="
        text-align: center;
        color: #3498db;
        margin-bottom: 30px;
        font-size: 2.5rem;
      ">🎭 Rhapsold</h1>
      
      <div style="
        background: #f8f9fa;
        padding: 30px;
        border-radius: 8px;
        border-left: 4px solid #e74c3c;
        margin-bottom: 30px;
      ">
        <h2 style="color: #e74c3c; margin-bottom: 15px;">⚠️ Initialization Error</h2>
        <p style="margin-bottom: 15px;">The advanced UI system failed to load. This is a fallback interface.</p>
        <p style="font-size: 0.9em; color: #666; font-family: monospace; word-break: break-all;">
          Error: ${error.message}
        </p>
      </div>
      
      <div style="
        display: flex;
        gap: 20px;
        margin-bottom: 30px;
        flex-wrap: wrap;
      ">
        <button id="refresh-btn" style="
          padding: 12px 24px;
          background: #3498db;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
        ">🔄 Retry</button>
        
        <button id="simple-mode-btn" style="
          padding: 12px 24px;
          background: #2ecc71;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
        ">📝 Simple Mode</button>
      </div>
      
      <div id="simple-interface" style="display: none;">
        <h3>Simple Blog Interface</h3>
        <textarea id="simple-content" placeholder="Write your blog post here..." style="
          width: 100%;
          min-height: 200px;
          padding: 15px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-family: Georgia, serif;
          font-size: 16px;
          line-height: 1.6;
          resize: vertical;
        "></textarea>
        <button id="simple-save-btn" style="
          margin-top: 15px;
          padding: 12px 24px;
          background: #27ae60;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
        ">💾 Save Post</button>
        
        <div id="simple-posts" style="margin-top: 30px;">
          <h3>Saved Posts</h3>
          <div id="posts-list"></div>
        </div>
      </div>
    </div>
  `;
  
  appContainer.innerHTML = fallbackHTML;
  
  // Add event handlers
  document.getElementById('refresh-btn')?.addEventListener('click', () => {
    console.log('🔄 Retrying initialization...');
    location.reload();
  });
  
  document.getElementById('simple-mode-btn')?.addEventListener('click', () => {
    console.log('📝 Enabling simple mode...');
    const simpleInterface = document.getElementById('simple-interface');
    if (simpleInterface) {
      simpleInterface.style.display = 'block';
      loadSimplePosts();
    }
  });
  
  document.getElementById('simple-save-btn')?.addEventListener('click', () => {
    console.log('💾 Saving simple post...');
    saveSimplePost();
  });
  
  // Hide loading screen
  hideLoadingScreen();
  
  console.log('✅ Fallback UI created successfully');
}

/**
 * Save a simple post
 */
function saveSimplePost() {
  const content = document.getElementById('simple-content')?.value;
  if (!content.trim()) {
    alert('Please write something first!');
    return;
  }
  
  const post = {
    id: Date.now().toString(),
    content: content.trim(),
    timestamp: new Date().toISOString(),
    type: 'simple'
  };
  
  // Save to localStorage
  const posts = JSON.parse(localStorage.getItem('rhapsold-simple-posts') || '[]');
  posts.unshift(post);
  localStorage.setItem('rhapsold-simple-posts', JSON.stringify(posts));
  
  // Clear textarea
  document.getElementById('simple-content').value = '';
  
  // Reload posts display
  loadSimplePosts();
  
  console.log('✅ Simple post saved');
}

/**
 * Load and display simple posts
 */
function loadSimplePosts() {
  const posts = JSON.parse(localStorage.getItem('rhapsold-simple-posts') || '[]');
  const postsContainer = document.getElementById('posts-list');
  
  if (!postsContainer) return;
  
  if (posts.length === 0) {
    postsContainer.innerHTML = '<p style="color: #666; font-style: italic;">No posts yet. Write your first post above!</p>';
    return;
  }
  
  postsContainer.innerHTML = posts.map(post => `
    <div style="
      background: white;
      padding: 20px;
      margin-bottom: 20px;
      border-radius: 4px;
      border-left: 4px solid #3498db;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    ">
      <p style="margin-bottom: 10px; white-space: pre-wrap;">${post.content}</p>
      <small style="color: #666;">
        ${new Date(post.timestamp).toLocaleDateString()} at ${new Date(post.timestamp).toLocaleTimeString()}
      </small>
    </div>
  `).join('');
  
  console.log(`📄 Loaded ${posts.length} simple posts`);
}

/**
 * Handle application events
 */
window.addEventListener('DOMContentLoaded', init);

// Handle potential Tauri events
if (window.__TAURI__) {
  console.log('🦀 Running in Tauri environment');
  
  // Listen for Tauri events
  window.__TAURI__.event.listen('menu-event', (event) => {
    console.log('📱 Menu event:', event.payload);
  });
  
  // Handle app close
  window.__TAURI__.event.listen('tauri://close-requested', () => {
    console.log('👋 Application closing...');
  });
}

// Export for debugging
window.rhapsold = {
  appState,
  init,
  createTextComponent,
  createMultilineTextComponent,
  createBlogPostForm,
  createPostFromForm,
  POST_TYPES,
  addPostToDisplay,
  showMessage
};

console.log('🎭 Rhapsold main module loaded');