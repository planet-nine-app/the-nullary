/**
 * Example: Rhapsold Two-Column Layout Integration
 * Shows how to use the shared two-column layout with blog posts on left, teleported content on right
 */

import { createTwoColumnLayout } from '../components/two-column-layout.js';
import { createBlogPostCard, createCardGrid } from '../components/product-card.js';
import { createNavigationHUD, createNavigationManager } from '../components/navigation.js';
import { createThemeManager, BLOG_THEME } from '../utils/theme-system.js';
import { createLoadingSpinner, createEmptyState, showToast } from '../utils/common-ui.js';

/**
 * REPLACE THIS: Old rhapsold layered UI system
 * 
 * Instead of the complex layered UI with HUD overlays, use the two-column layout
 * with blog posts on the left and teleported content on the right.
 */

// Initialize theme for blogging
const themeManager = createThemeManager('blog');
const currentTheme = themeManager.getCurrentTheme();

// Create two-column layout for rhapsold
function createRhapsoldTwoColumnLayout() {
  const layout = createTwoColumnLayout({
    theme: currentTheme,
    leftColumn: {
      backgroundColor: currentTheme.colors.surface
    },
    rightColumn: {
      backgroundColor: currentTheme.colors.surface
    },
    teleportation: {
      refreshInterval: 10 * 60 * 1000, // 10 minutes
      cacheTimeout: 5 * 60 * 1000      // 5 minutes
    },
    responsive: true,
    gap: '24px'
  });

  // Set up the left column renderer for blog posts
  layout.setLeftColumnRenderer(async (container) => {
    await renderBlogPostsInLeftColumn(container);
  });

  // Handle teleported item clicks (same as ninefy)
  layout.element.addEventListener('teleported-item-click', (event) => {
    const { item } = event.detail;
    handleTeleportedItemClick(item);
  });

  return layout;
}

/**
 * Render blog posts in the left column (rhapsold's main content)
 */
async function renderBlogPostsInLeftColumn(container) {
  try {
    // Create header for blog section
    const header = document.createElement('div');
    header.style.cssText = `
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 2px solid ${currentTheme.colors.background};
    `;
    
    // Show loading state for post count
    header.innerHTML = `
      <h2 style="
        margin: 0 0 8px 0;
        color: ${currentTheme.colors.primary};
        font-size: 24px;
        font-weight: bold;
        display: flex;
        align-items: center;
        gap: 10px;
      ">
        📝 My Blog
        <span style="
          font-size: 14px;
          background: ${currentTheme.colors.accent}20;
          color: ${currentTheme.colors.accent};
          padding: 4px 8px;
          border-radius: 12px;
          font-weight: normal;
        ">Loading...</span>
      </h2>
      <p style="
        margin: 0;
        color: ${currentTheme.colors.secondary};
        font-size: 16px;
      ">Your thoughts, stories, and insights</p>
    `;
    
    container.appendChild(header);

    // Get blog posts (integrate with Sanora)
    const blogPosts = await getBlogPosts();

    // Update header with post count
    const countBadge = header.querySelector('span');
    if (countBadge) {
      countBadge.textContent = `${blogPosts.length} posts`;
    }

    if (blogPosts.length === 0) {
      const emptyState = createEmptyState({
        icon: '✍️',
        title: 'No blog posts yet',
        description: 'Start writing your first blog post to see it here. Share your thoughts with the world!',
        actionText: 'Write First Post',
        onAction: () => {
          // Navigate to new post screen
          window.dispatchEvent(new CustomEvent('navigate-to-screen', { 
            detail: { screenId: 'new' } 
          }));
        },
        theme: currentTheme
      });
      container.appendChild(emptyState);
      
      // Add floating action button for empty state
      addFloatingActionButton(container);
      return;
    }

    // Create blog post grid
    const blogGrid = createCardGrid({
      minCardWidth: '350px',
      gap: '24px',
      padding: '0'
    });

    // Add blog post cards
    blogPosts.forEach(post => {
      const card = createBlogPostCard(post, {
        showDate: true,
        showReadTime: true,
        showAuthor: true,
        width: '100%'
      }, currentTheme, (clickedPost) => {
        showBlogPost(clickedPost);
      });
      
      blogGrid.appendChild(card);
    });

    container.appendChild(blogGrid);

    // Add floating action button
    addFloatingActionButton(container);

    // Add blog stats
    addBlogStats(container, blogPosts);

  } catch (error) {
    console.error('Failed to render blog posts:', error);
    
    const errorState = createEmptyState({
      icon: '❌',
      title: 'Failed to load blog posts',
      description: 'There was an error loading your blog posts. Please try again.',
      actionText: 'Retry',
      onAction: () => {
        // Trigger re-render
        window.location.reload();
      },
      theme: currentTheme
    });
    
    container.appendChild(errorState);
  }
}

/**
 * Get blog posts (integrate with Sanora)
 */
async function getBlogPosts() {
  // For demo purposes, return sample blog posts
  // In real implementation, this would integrate with Sanora
  
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return [
    {
      id: '1',
      title: 'Welcome to My Blog on The Nullary',
      excerpt: 'Exploring the decentralized web and what it means for content creators. This is my first post using the new two-column layout.',
      description: 'A deep dive into the benefits of decentralized content creation and how The Nullary ecosystem enables true ownership of your digital presence.',
      author: 'Blog Author',
      date: new Date().toISOString(),
      readTime: 5,
      image: null,
      content: 'Full blog post content here...',
      tags: ['decentralization', 'blogging', 'nullary'],
      published: true
    },
    {
      id: '2',
      title: 'Building with Shared Components',
      excerpt: 'How the shared component system enables rapid development while maintaining consistency across all Nullary applications.',
      description: 'A technical overview of The Nullary\'s shared component architecture and how it facilitates code reuse.',
      author: 'Tech Writer',
      date: new Date(Date.now() - 86400000).toISOString(),
      readTime: 8,
      image: null,
      content: 'Full blog post content here...',
      tags: ['development', 'components', 'architecture'],
      published: true
    },
    {
      id: '3',
      title: 'The Future of Privacy-First Social Media',
      excerpt: 'Why cryptographic authentication and decentralized systems are the key to reclaiming our digital privacy.',
      description: 'An exploration of how sessionless authentication and decentralized systems can create better social media experiences.',
      author: 'Privacy Advocate',
      date: new Date(Date.now() - 2 * 86400000).toISOString(),
      readTime: 12,
      image: null,
      content: 'Full blog post content here...',
      tags: ['privacy', 'social media', 'crypto'],
      published: true
    },
    {
      id: '4',
      title: 'Draft: Upcoming Features in The Nullary',
      excerpt: 'A sneak peek at what\'s coming next in the Planet Nine ecosystem...',
      description: 'Preview of upcoming features including enhanced teleportation, real-time collaboration, and more.',
      author: 'Blog Author',
      date: new Date(Date.now() - 3600000).toISOString(),
      readTime: 6,
      image: null,
      content: 'Draft content...',
      tags: ['features', 'roadmap'],
      published: false
    }
  ].filter(post => post.published); // Only show published posts
}

/**
 * Add floating action button for writing new posts
 */
function addFloatingActionButton(container) {
  const fab = document.createElement('button');
  fab.className = 'blog-fab';
  fab.innerHTML = '✍️';
  fab.title = 'Write New Post';
  fab.style.cssText = `
    position: fixed;
    bottom: 30px;
    right: 380px; /* Account for right column */
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
    
    @media (max-width: 768px) {
      right: 20px;
    }
  `;
  
  fab.addEventListener('click', () => {
    window.dispatchEvent(new CustomEvent('navigate-to-screen', { 
      detail: { screenId: 'new' } 
    }));
  });
  
  fab.addEventListener('mouseenter', () => {
    fab.style.transform = 'scale(1.1)';
    fab.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.3)';
  });
  
  fab.addEventListener('mouseleave', () => {
    fab.style.transform = 'scale(1)';
    fab.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
  });
  
  container.appendChild(fab);
}

/**
 * Add blog statistics
 */
function addBlogStats(container, posts) {
  const stats = document.createElement('div');
  stats.style.cssText = `
    position: sticky;
    top: 10px;
    background: ${currentTheme.colors.surface};
    border: 1px solid ${currentTheme.colors.border};
    border-radius: 8px;
    padding: 12px;
    font-size: 12px;
    color: ${currentTheme.colors.secondary};
    margin: 10px 0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    z-index: 10;
  `;

  const totalPosts = posts.length;
  const totalWords = posts.reduce((acc, post) => acc + (post.readTime * 250), 0); // ~250 words per minute
  const totalReadTime = posts.reduce((acc, post) => acc + post.readTime, 0);
  const recentPosts = posts.filter(post => {
    const postDate = new Date(post.date);
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return postDate > weekAgo;
  }).length;

  stats.innerHTML = `
    <div style="font-weight: bold; margin-bottom: 6px;">📊 Blog Stats</div>
    <div>• ${totalPosts} published posts</div>
    <div>• ~${totalWords.toLocaleString()} words written</div>
    <div>• ${totalReadTime} minutes of reading</div>
    <div>• ${recentPosts} posts this week</div>
  `;

  container.appendChild(stats);
}

/**
 * Handle blog post viewing
 */
function showBlogPost(post) {
  console.log('Opening blog post:', post);
  
  showToast({
    message: `Opening "${post.title}"`,
    type: 'info'
  });

  // Set current post for reading screen
  window.currentPost = post;

  // Navigate to reading screen
  window.dispatchEvent(new CustomEvent('navigate-to-screen', { 
    detail: { screenId: 'reading' } 
  }));
}

/**
 * Handle teleported content clicks (shared with ninefy)
 */
function handleTeleportedItemClick(item) {
  console.log('Teleported item clicked:', item);
  
  if (item.type === 'product') {
    // Handle product from marketplace bases
    showToast({
      message: `Viewing product "${item.title}" from ${item.baseName}`,
      type: 'info'
    });
    
    // Could open in modal or navigate to external marketplace
    showExternalProduct(item);
    
  } else if (item.type === 'blog') {
    // Handle blog post from other bases
    showToast({
      message: `Reading "${item.title}" by ${item.author}`,
      type: 'info'
    });
    
    // Could open in reading mode or external link
    showExternalBlogPost(item);
  }
}

function showExternalProduct(product) {
  // Show product details from another base
  console.log('Show external product:', product);
  
  showToast({
    message: `💰 ${product.title} - $${(product.price / 100).toFixed(2)} from ${product.baseName}`,
    type: 'success',
    duration: 4000
  });
}

function showExternalBlogPost(post) {
  // Show blog post from another base
  console.log('Show external blog post:', post);
  
  // Could integrate with reading screen or open externally
  showToast({
    message: `📖 "${post.title}" by ${post.author} (${post.readTime} min read) from ${post.baseName}`,
    type: 'info',
    duration: 4000
  });
  
  // Could set as current post and show in reading mode
  window.externalPost = post;
}

/**
 * Initialize rhapsold with two-column layout
 */
export function initializeRhapsoldTwoColumn() {
  console.log('📝 Initializing Rhapsold with two-column layout...');
  
  // Create navigation
  const screens = [
    { id: 'main', label: '📚 Posts', title: 'Blog Posts' },
    { id: 'new', label: '✍️ New Post', title: 'Create New Post' },
    { id: 'reading', label: '📖 Reading', title: 'Reading Mode' },
    { id: 'base', label: '⚙️ Base', title: 'Server Management' }
  ];

  const navManager = createNavigationManager({
    initialScreen: 'main',
    screens,
    theme: currentTheme,
    onNavigate: (screenId) => {
      handleRhapsoldNavigation(screenId);
    }
  });

  const hud = createNavigationHUD({
    appName: 'Rhapsold',
    logoIcon: '📝',
    screens,
    theme: currentTheme,
    currentScreen: 'main',
    onNavigate: (screenId) => navManager.navigateTo(screenId)
  });

  // Create main layout
  const twoColumnLayout = createRhapsoldTwoColumnLayout();
  
  // Set up container
  const appContainer = document.getElementById('app') || document.body;
  appContainer.innerHTML = '';
  appContainer.appendChild(hud);
  
  const contentContainer = document.createElement('div');
  contentContainer.id = 'app-content';
  contentContainer.style.cssText = `
    margin-top: 60px;
    height: calc(100vh - 60px);
  `;
  contentContainer.appendChild(twoColumnLayout.element);
  
  appContainer.appendChild(contentContainer);

  // Set up event listeners
  window.addEventListener('navigate-to-screen', (event) => {
    navManager.navigateTo(event.detail.screenId);
  });

  console.log('✅ Rhapsold two-column layout initialized');
  
  return {
    layout: twoColumnLayout,
    navigation: navManager,
    refreshPosts: () => twoColumnLayout.renderLeftColumn(),
    refreshTeleported: () => twoColumnLayout.refreshTeleportedContent()
  };
}

function handleRhapsoldNavigation(screenId) {
  console.log(`🧭 Rhapsold navigating to: ${screenId}`);
  
  const contentContainer = document.getElementById('app-content');
  if (!contentContainer) return;

  switch (screenId) {
    case 'main':
      // Show two-column layout
      const layout = createRhapsoldTwoColumnLayout();
      contentContainer.innerHTML = '';
      contentContainer.appendChild(layout.element);
      break;
      
    case 'new':
      // Show blog creation interface
      renderNewPostScreen(contentContainer);
      break;
      
    case 'reading':
      // Show blog reading interface
      renderReadingScreen(contentContainer);
      break;
      
    case 'base':
      // Show base management
      contentContainer.innerHTML = '<div style="padding: 20px;">Base Management implementation</div>';
      break;
  }
}

async function renderNewPostScreen(container) {
  // Use existing blog creation form
  try {
    const { createBlogCreationForm } = await import('../components/blog-creation-form.js');
    
    container.innerHTML = '';
    
    const header = document.createElement('div');
    header.style.cssText = `
      text-align: center;
      margin-bottom: 30px;
      padding: 20px;
    `;
    header.innerHTML = `
      <h1 style="color: ${currentTheme.colors.primary};">✍️ Create New Post</h1>
      <p style="color: ${currentTheme.colors.secondary};">Share your thoughts with the world</p>
    `;
    
    const form = createBlogCreationForm({
      theme: currentTheme,
      onSubmit: async (formData) => {
        await handleBlogSubmission(formData);
      },
      onCancel: () => {
        window.dispatchEvent(new CustomEvent('navigate-to-screen', { 
          detail: { screenId: 'main' } 
        }));
      }
    });
    
    container.appendChild(header);
    container.appendChild(form);
    
  } catch (error) {
    console.error('Failed to load blog creation form:', error);
    const emptyState = createEmptyState({
      icon: '✍️',
      title: 'Editor Unavailable',
      description: 'Could not load the blog editor',
      theme: currentTheme
    });
    container.appendChild(emptyState);
  }
}

function renderReadingScreen(container) {
  const post = window.currentPost || window.externalPost;
  
  if (!post) {
    const emptyState = createEmptyState({
      icon: '📖',
      title: 'No Post Selected',
      description: 'Select a post to read',
      actionText: 'Browse Posts',
      onAction: () => {
        window.dispatchEvent(new CustomEvent('navigate-to-screen', { 
          detail: { screenId: 'main' } 
        }));
      },
      theme: currentTheme
    });
    container.appendChild(emptyState);
    return;
  }
  
  // Simple reading interface
  container.innerHTML = `
    <div style="max-width: 800px; margin: 0 auto; padding: 20px;">
      <button onclick="window.dispatchEvent(new CustomEvent('navigate-to-screen', { detail: { screenId: 'main' } }))" 
              style="margin-bottom: 20px; padding: 8px 16px; background: none; border: 1px solid ${currentTheme.colors.border}; border-radius: 4px; cursor: pointer;">
        ← Back to Posts
      </button>
      <article>
        <h1 style="color: ${currentTheme.colors.primary}; font-size: 2.5rem; margin-bottom: 10px;">${post.title}</h1>
        <div style="color: ${currentTheme.colors.secondary}; margin-bottom: 20px; font-size: 14px;">
          By ${post.author} • ${new Date(post.date).toLocaleDateString()} • ${post.readTime} min read
        </div>
        <div style="color: ${currentTheme.colors.text}; line-height: 1.7; font-size: 18px;">
          ${post.content || post.description || post.excerpt}
        </div>
      </article>
    </div>
  `;
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
    window.dispatchEvent(new CustomEvent('navigate-to-screen', { 
      detail: { screenId: 'main' } 
    }));
    
  } catch (error) {
    console.error('Failed to publish blog post:', error);
    showToast({
      message: 'Failed to publish blog post. Please try again.',
      type: 'error'
    });
  }
}

/**
 * INTEGRATION NOTES FOR RHAPSOLD:
 * 
 * 1. Replace the existing layered UI system with createRhapsoldTwoColumnLayout()
 * 2. The left column automatically renders blog posts
 * 3. The right column shows the same teleported content as ninefy
 * 4. Both columns are responsive and share the same layout component
 * 5. Maintains blog-specific functionality while gaining consistency
 * 
 * Key benefits:
 * - Same layout structure as ninefy for consistency
 * - Automatic content discovery from Planet Nine network
 * - Blog posts alongside marketplace products in discovery
 * - Responsive design with mobile-friendly interactions
 * - Shared caching and refresh capabilities
 * 
 * To integrate into existing rhapsold:
 * - Replace initializeLayeredUI() with initializeRhapsoldTwoColumn()
 * - Remove custom HUD overlay system
 * - Use shared navigation components
 * - Keep blog-specific components (creation, reading, etc.)
 */

export {
  createRhapsoldTwoColumnLayout,
  renderBlogPostsInLeftColumn,
  handleTeleportedItemClick,
  showBlogPost
};