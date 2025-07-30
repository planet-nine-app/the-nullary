/**
 * Swipe Demo Component
 * Simple demonstration of the swipable feed functionality
 */

import { createSwipableFeed } from './swipable-feed.js';
import { createTextComponent } from './text.js';

/**
 * Create a demo page showing swipable feed functionality
 * @param {Object} config - Configuration object
 * @returns {Object} Demo component with methods
 */
export function createSwipeDemo(config = {}) {
  const container = document.createElement('div');
  container.style.cssText = `
    width: 100%;
    height: 100vh;
    display: flex;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;

  // Create sidebar with collections
  const sidebar = document.createElement('div');
  sidebar.style.cssText = `
    width: 300px;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  `;

  // Sidebar title
  const sidebarTitle = document.createElement('h2');
  sidebarTitle.textContent = 'Collections';
  sidebarTitle.style.cssText = `
    color: white;
    margin: 0;
    font-size: 24px;
    font-weight: 600;
  `;
  sidebar.appendChild(sidebarTitle);

  // Accepted collection
  const acceptedSection = document.createElement('div');
  acceptedSection.innerHTML = `
    <h3 style="color: #4CAF50; margin: 0 0 10px 0; font-size: 18px;">❤️ Liked Posts</h3>
    <div id="accepted-list" style="color: rgba(255,255,255,0.8); font-size: 14px;">
      No posts yet
    </div>
  `;
  sidebar.appendChild(acceptedSection);

  // Rejected collection
  const rejectedSection = document.createElement('div');
  rejectedSection.innerHTML = `
    <h3 style="color: #f44336; margin: 0 0 10px 0; font-size: 18px;">✖️ Passed Posts</h3>
    <div id="rejected-list" style="color: rgba(255,255,255,0.8); font-size: 14px;">
      No posts yet
    </div>
  `;
  sidebar.appendChild(rejectedSection);

  // Stats section
  const statsSection = document.createElement('div');
  statsSection.innerHTML = `
    <h3 style="color: white; margin: 0 0 10px 0; font-size: 18px;">📊 Stats</h3>
    <div style="color: rgba(255,255,255,0.8); font-size: 14px;">
      <div>Remaining: <span id="remaining-count">0</span></div>
      <div>Liked: <span id="liked-count">0</span></div>
      <div>Passed: <span id="passed-count">0</span></div>
    </div>
  `;
  sidebar.appendChild(statsSection);

  container.appendChild(sidebar);

  // Create main swipe area
  const swipeArea = document.createElement('div');
  swipeArea.style.cssText = `
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 40px 20px;
    gap: 20px;
  `;

  // Title
  const title = document.createElement('h1');
  title.textContent = 'Swipable Feed Demo';
  title.style.cssText = `
    color: white;
    font-size: 32px;
    font-weight: 700;
    margin: 0;
    text-shadow: 0 2px 4px rgba(0,0,0,0.3);
  `;
  swipeArea.appendChild(title);

  // Instructions
  const instructions = document.createElement('div');
  instructions.innerHTML = `
    <p style="color: rgba(255,255,255,0.9); text-align: center; margin: 0; font-size: 16px;">
      👈 Swipe left to pass • Swipe right to like 👉
    </p>
    <p style="color: rgba(255,255,255,0.7); text-align: center; margin: 10px 0 0 0; font-size: 14px;">
      Or use keyboard: ← Left Arrow (pass) • → Right Arrow (like)
    </p>
  `;
  swipeArea.appendChild(instructions);

  // Create sample posts data
  const samplePosts = [
    {
      id: 'post-1',
      title: 'The Future of Web Development',
      author: 'Sarah Chen',
      preview: 'Exploring the latest trends in modern web development...',
      element: createPostElement('The Future of Web Development', 'Sarah Chen', 'Exploring the latest trends in modern web development, from serverless architecture to edge computing.', '#3498db')
    },
    {
      id: 'post-2', 
      title: 'Mastering CSS Grid',
      author: 'Mike Johnson',
      preview: 'A comprehensive guide to CSS Grid layout...',
      element: createPostElement('Mastering CSS Grid', 'Mike Johnson', 'A comprehensive guide to CSS Grid layout, with practical examples and best practices.', '#e74c3c')
    },
    {
      id: 'post-3',
      title: 'JavaScript Performance Tips',
      author: 'Emily Rodriguez',
      preview: 'Optimize your JavaScript code for better performance...',
      element: createPostElement('JavaScript Performance Tips', 'Emily Rodriguez', 'Learn how to optimize your JavaScript code for better performance and user experience.', '#f39c12')
    },
    {
      id: 'post-4',
      title: 'React vs Vue Comparison',
      author: 'David Kim',
      preview: 'An in-depth comparison of React and Vue frameworks...',
      element: createPostElement('React vs Vue Comparison', 'David Kim', 'An in-depth comparison of React and Vue frameworks, helping you choose the right tool.', '#9b59b6')
    },
    {
      id: 'post-5',
      title: 'Node.js Best Practices',
      author: 'Lisa Wang',
      preview: 'Essential best practices for Node.js development...',
      element: createPostElement('Node.js Best Practices', 'Lisa Wang', 'Essential best practices for Node.js development, from security to performance.', '#2ecc71')
    }
  ];

  // Create swipable feed
  const swipableFeed = createSwipableFeed({
    maxWidth: 500,
    height: '600px',
    cardBorderRadius: 16,
    cardShadow: '0 8px 32px rgba(0,0,0,0.2)'
  });

  swipableFeed.setPosts(samplePosts);
  swipeArea.appendChild(swipableFeed.element);

  container.appendChild(swipeArea);

  // Event handlers
  swipableFeed.onSwipeRight((post) => {
    console.log('Liked post:', post.title);
    updateCollections();
  });

  swipableFeed.onSwipeLeft((post) => {
    console.log('Passed post:', post.title);
    updateCollections();
  });

  swipableFeed.onEmpty(() => {
    console.log('No more posts!');
    const emptyMessage = document.createElement('div');
    emptyMessage.style.cssText = `
      color: white;
      text-align: center;
      font-size: 18px;
      margin-top: 50px;
    `;
    emptyMessage.innerHTML = `
      <h3>🎉 All done!</h3>
      <p>You've swiped through all the posts.</p>
      <button onclick="location.reload()" style="
        background: rgba(255,255,255,0.2);
        border: 2px solid white;
        color: white;
        padding: 12px 24px;
        border-radius: 25px;
        font-size: 16px;
        cursor: pointer;
        margin-top: 20px;
      ">Try Again</button>
    `;
    swipeArea.appendChild(emptyMessage);
  });

  // Update collections display
  function updateCollections() {
    const accepted = swipableFeed.getAcceptedPosts();
    const rejected = swipableFeed.getRejectedPosts();
    const remaining = swipableFeed.getRemainingCount();

    // Update lists
    const acceptedList = document.getElementById('accepted-list');
    acceptedList.innerHTML = accepted.length ? 
      accepted.map(post => `• ${post.title}`).join('<br>') : 
      'No posts yet';

    const rejectedList = document.getElementById('rejected-list');
    rejectedList.innerHTML = rejected.length ? 
      rejected.map(post => `• ${post.title}`).join('<br>') : 
      'No posts yet';

    // Update stats
    document.getElementById('remaining-count').textContent = remaining;
    document.getElementById('liked-count').textContent = accepted.length;
    document.getElementById('passed-count').textContent = rejected.length;
  }

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      swipableFeed.swipeLeft();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      swipableFeed.swipeRight();
    }
  });

  // Initial stats update
  updateCollections();

  return {
    element: container,
    swipableFeed
  };
}

// Helper function to create post elements
function createPostElement(title, author, content, color) {
  const postDiv = document.createElement('div');
  postDiv.style.cssText = `
    width: 100%;
    height: 100%;
    background: white;
    display: flex;
    flex-direction: column;
    position: relative;
    overflow: hidden;
  `;

  // Header
  const header = document.createElement('div');
  header.style.cssText = `
    background: ${color};
    color: white;
    padding: 20px;
    text-align: center;
  `;
  header.innerHTML = `
    <h2 style="margin: 0 0 8px 0; font-size: 20px; font-weight: 600;">${title}</h2>
    <p style="margin: 0; opacity: 0.9; font-size: 14px;">by ${author}</p>
  `;
  postDiv.appendChild(header);

  // Content
  const contentDiv = document.createElement('div');
  contentDiv.style.cssText = `
    padding: 30px 20px;
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    color: #333;
    font-size: 16px;
    line-height: 1.6;
  `;
  contentDiv.textContent = content;
  postDiv.appendChild(contentDiv);

  // Footer
  const footer = document.createElement('div');
  footer.style.cssText = `
    padding: 15px 20px;
    background: #f8f9fa;
    border-top: 1px solid #e9ecef;
    text-align: center;
    color: #666;
    font-size: 12px;
  `;
  footer.textContent = '👆 Tap to read more or swipe to choose';
  postDiv.appendChild(footer);

  return postDiv;
}

export { createSwipeDemo };