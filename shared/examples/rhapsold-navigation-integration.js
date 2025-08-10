/**
 * Example: Rhapsold Navigation Integration
 * Shows how to integrate rhapsold with shared navigation components
 */

// Import shared components
import { createNavigationHUD, createNavigationManager } from '../components/navigation.js';
import { createThemeManager, BLOG_THEME } from '../utils/theme-system.js';
import { createLoadingSpinner, showToast, createEmptyState } from '../utils/common-ui.js';
import { createBlogPostCard, createCardGrid } from '../components/product-card.js';
import { getAvailableBases } from '../utils/base-discovery.js';

/**
 * REPLACE THIS: Existing rhapsold navigation
 * 
 * Currently rhapsold uses ES6 modules and imports from its local shared directory.
 * We'll replace this with the global shared components for consistency.
 * 
 * OLD (in main.js):
 * import { createLayeredUI } from './shared/utils/layered-ui.js';
 * import { createTextComponent } from './shared/components/text.js';
 * 
 * NEW:
 * Use global shared components from ../../shared/
 */

/**
 * NEW WAY: Using global shared components
 */

// Initialize theme management for blogging
const themeManager = createThemeManager('blog');
let currentTheme = themeManager.getCurrentTheme();

// Define rhapsold screens
const screens = [
  { id: 'main', label: '📚 Posts', title: 'Blog Posts' },
  { id: 'new', label: '✍️ New Post', title: 'Create New Post' },
  { id: 'reading', label: '📖 Reading', title: 'Reading Mode' },
  { id: 'base', label: '⚙️ Base', title: 'Server Management' }
];

// Create navigation manager
const navManager = createNavigationManager({
  initialScreen: 'main',
  screens,
  theme: currentTheme,
  onNavigate: (screenId) => {
    console.log(`📝 Rhapsold navigating to: ${screenId}`);
    renderCurrentScreen(screenId);
  }
});

// Create shared HUD for rhapsold
function createRhapsoldHUD() {
  return createNavigationHUD({
    appName: 'Rhapsold',
    logoIcon: '📝',
    screens,
    theme: currentTheme,
    currentScreen: navManager.getCurrentScreen(),
    onNavigate: (screenId) => navManager.navigateTo(screenId)
  });
}

// Replace rhapsold's screen rendering with shared patterns
async function renderCurrentScreen(screenId) {
  const contentContainer = document.getElementById('app-content');
  if (!contentContainer) return;
  
  // Clear and show loading with blog-specific styling
  contentContainer.innerHTML = '';
  const spinner = createLoadingSpinner({ 
    text: `Loading ${screenId}...`,
    color: currentTheme.colors.accent 
  });
  contentContainer.appendChild(spinner);
  
  try {
    await renderScreen(screenId, contentContainer);
    spinner.remove();
    navManager.updateStatus('Ready', 'success');
    
  } catch (error) {
    console.error(`Failed to render screen ${screenId}:`, error);
    spinner.remove();
    
    const errorState = createEmptyState({
      icon: '📝',
      title: 'Screen Error',
      description: `Failed to load ${screenId}. Please try again.`,
      actionText: 'Retry',
      onAction: () => renderCurrentScreen(screenId),
      theme: currentTheme
    });
    contentContainer.appendChild(errorState);
    
    navManager.updateStatus('Error loading screen', 'error');
  }
}

async function renderScreen(screenId, container) {
  switch (screenId) {
    case 'main':
      await renderMainBlogScreen(container);
      break;
    case 'new':
      await renderNewPostScreen(container);
      break;
    case 'reading':
      await renderReadingScreen(container);
      break;
    case 'base':
      await renderBaseScreen(container);
      break;
    default:
      throw new Error(`Unknown screen: ${screenId}`);
  }
}

/**
 * BLOG-SPECIFIC SCREENS using shared components
 */

async function renderMainBlogScreen(container) {
  try {
    // Show loading
    const loadingState = createEmptyState({
      icon: '📚',
      title: 'Loading Blog Posts',
      description: 'Fetching your latest blog posts...',
      theme: currentTheme
    });
    container.appendChild(loadingState);
    
    // Get blog posts (replace with actual Sanora integration)
    const blogPosts = await getBlogPosts();
    loadingState.remove();
    
    if (blogPosts.length === 0) {
      const emptyState = createEmptyState({
        icon: '✍️',
        title: 'No blog posts yet',
        description: 'Start writing your first blog post to see it here',
        actionText: 'Write First Post',
        onAction: () => navManager.navigateTo('new'),
        theme: currentTheme
      });
      container.appendChild(emptyState);
      return;
    }
    
    // Create blog header
    const header = document.createElement('div');
    header.style.cssText = `
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid ${currentTheme.colors.background};
    `;
    header.innerHTML = `
      <h1 style="
        color: ${currentTheme.colors.primary};
        margin-bottom: 12px;
        font-size: 2.5rem;
        font-family: ${currentTheme.typography.fontFamily};
      ">📝 My Blog</h1>
      <p style="
        color: ${currentTheme.colors.secondary};
        font-size: 18px;
        margin: 0;
      ">${blogPosts.length} posts published</p>
    `;
    
    // Create blog grid using shared component
    const grid = createCardGrid({ 
      minCardWidth: '400px',
      gap: '30px',
      padding: '0'
    });
    
    // Create blog post cards using shared component
    blogPosts.forEach(post => {
      const card = createBlogPostCard(post, {
        showDate: true,
        showReadTime: true,
        showAuthor: true
      }, currentTheme, (clickedPost) => {
        // Navigate to reading mode with this post
        showBlogPost(clickedPost);
      });
      
      grid.appendChild(card);
    });
    
    // Add floating action button for new post
    const fab = createFloatingActionButton();
    
    container.appendChild(header);
    container.appendChild(grid);
    container.appendChild(fab);
    
  } catch (error) {
    console.error('Failed to render blog screen:', error);
    throw error;
  }
}

async function renderNewPostScreen(container) {
  // Blog creation interface using shared forms
  const header = document.createElement('div');
  header.style.cssText = `
    text-align: center;
    margin-bottom: 30px;
    padding-bottom: 20px;
    border-bottom: 2px solid ${currentTheme.colors.background};
  `;
  header.innerHTML = `
    <h1 style="
      color: ${currentTheme.colors.primary};
      font-family: ${currentTheme.typography.fontFamily};
    ">✍️ Create New Post</h1>
    <p style="color: ${currentTheme.colors.secondary};">Share your thoughts with the world</p>
  `;
  
  // Use existing blog creation form from shared components
  try {
    const { createBlogCreationForm } = await import('../components/blog-creation-form.js');
    
    const form = createBlogCreationForm({
      theme: currentTheme,
      onSubmit: async (formData) => {
        await handleBlogSubmission(formData);
      },
      onCancel: () => {
        navManager.navigateTo('main');
      }
    });
    
    container.appendChild(header);
    container.appendChild(form);
    
  } catch (error) {
    console.error('Failed to load blog creation form:', error);
    const emptyState = createEmptyState({
      icon: '✍️',
      title: 'Blog Editor Unavailable',
      description: 'Could not load the blog creation interface',
      actionText: 'Back to Posts',
      onAction: () => navManager.navigateTo('main'),
      theme: currentTheme
    });
    container.appendChild(emptyState);
  }
}

async function renderReadingScreen(container) {
  // Full-screen reading interface
  try {
    const { createBlogViewer } = await import('../components/blog-viewer.js');
    
    // Get current post from state
    const currentPost = getCurrentPost();
    
    if (!currentPost) {
      const emptyState = createEmptyState({
        icon: '📖',
        title: 'No Post Selected',
        description: 'Select a post from the main screen to start reading',
        actionText: 'Browse Posts',
        onAction: () => navManager.navigateTo('main'),
        theme: currentTheme
      });
      container.appendChild(emptyState);
      return;
    }
    
    const viewer = createBlogViewer({
      post: currentPost,
      theme: currentTheme,
      fullscreen: true,
      onClose: () => navManager.navigateTo('main')
    });
    
    container.appendChild(viewer);
    
  } catch (error) {
    console.error('Failed to render reading screen:', error);
    const emptyState = createEmptyState({
      icon: '📖',
      title: 'Reading Error',
      description: 'Could not load the blog reader',
      theme: currentTheme
    });
    container.appendChild(emptyState);
  }
}

async function renderBaseScreen(container) {
  // Use shared base screen component
  try {
    const { createBaseScreen } = await import('../screens/base-screen.js');
    
    const baseScreen = createBaseScreen({
      title: 'Blog Base Management',
      description: 'Manage your blog\'s base server connections',
      theme: currentTheme
    });
    
    await baseScreen.initialize();
    container.appendChild(baseScreen.element);
    
  } catch (error) {
    console.error('Failed to load base screen:', error);
    const emptyState = createEmptyState({
      icon: '⚙️',
      title: 'Base Management Unavailable',
      description: 'Could not load base server management interface',
      theme: currentTheme
    });
    container.appendChild(emptyState);
  }
}

/**
 * BLOG-SPECIFIC UTILITIES
 */

async function getBlogPosts() {
  // Mock blog posts for demonstration
  // In real implementation, this would integrate with Sanora
  return [
    {
      id: '1',
      title: 'Welcome to My Blog',
      excerpt: 'This is my first blog post using the new Rhapsold interface with shared components.',
      author: 'Blog Author',
      date: new Date().toISOString(),
      readTime: 5,
      image: null,
      content: 'Full blog post content here...'
    },
    {
      id: '2',
      title: 'Building with The Nullary',
      excerpt: 'Exploring the shared component system and how it enables rapid development.',
      author: 'Blog Author',
      date: new Date(Date.now() - 86400000).toISOString(),
      readTime: 8,
      image: null,
      content: 'Full blog post content here...'
    }
  ];
}

function createFloatingActionButton() {
  const fab = document.createElement('button');
  fab.innerHTML = '✍️';
  fab.title = 'Write New Post';
  fab.style.cssText = `
    position: fixed;
    bottom: 30px;
    right: 30px;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: ${currentTheme.colors.accent};
    color: white;
    border: none;
    font-size: 24px;
    cursor: pointer;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    transition: all 0.3s ease;
    z-index: 1000;
  `;
  
  fab.addEventListener('click', () => {
    navManager.navigateTo('new');
  });
  
  fab.addEventListener('mouseenter', () => {
    fab.style.transform = 'scale(1.1)';
    fab.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.3)';
  });
  
  fab.addEventListener('mouseleave', () => {
    fab.style.transform = 'scale(1)';
    fab.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
  });
  
  return fab;
}

function showBlogPost(post) {
  // Set current post and navigate to reading screen
  setCurrentPost(post);
  navManager.navigateTo('reading');
  
  showToast({
    message: `Opening "${post.title}"`,
    type: 'info'
  });
}

async function handleBlogSubmission(formData) {
  try {
    showToast({
      message: 'Publishing blog post...',
      type: 'info'
    });
    
    // Here would integrate with Sanora to save the blog post
    console.log('Publishing blog post:', formData);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    showToast({
      message: 'Blog post published successfully!',
      type: 'success'
    });
    
    // Navigate back to main
    navManager.navigateTo('main');
    
  } catch (error) {
    console.error('Failed to publish blog post:', error);
    showToast({
      message: 'Failed to publish blog post. Please try again.',
      type: 'error'
    });
  }
}

// Simple state management for current post
let currentPost = null;

function setCurrentPost(post) {
  currentPost = post;
}

function getCurrentPost() {
  return currentPost;
}

/**
 * INTEGRATION NOTES FOR RHAPSOLD:
 * 
 * 1. Replace existing ES6 module imports from local shared directory
 * 2. Use global shared navigation instead of custom layered UI
 * 3. Integrate shared theme system for consistent styling
 * 4. Use shared UI components for loading states, empty states
 * 5. Maintain blog-specific functionality while gaining consistency
 * 
 * Changes needed in rhapsold's main.js:
 * 
 * - Update import paths from './shared/' to '../../shared/'
 * - Replace initializeLayeredUI() with createRhapsoldHUD()
 * - Use shared navigation manager instead of custom navigation
 * - Use shared theme system instead of local theme config
 * - Keep blog-specific components (blog creation, viewer) as they are
 * 
 * This maintains rhapsold's sophisticated blog functionality while
 * gaining consistency with other Nullary apps and reducing code duplication.
 */

export {
  createRhapsoldHUD,
  navManager,
  renderCurrentScreen,
  themeManager,
  currentTheme,
  showBlogPost,
  setCurrentPost
};