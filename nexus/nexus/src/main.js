/**
 * Nexus - Planet Nine Ecosystem Portal
 * Main application with three screens: Main (feed overview), Bases, Planet Nine
 */

// Initialize environment configuration
initializeEnvironmentControls('nexus');

// Application state
const nexusState = {
    currentScreen: 'main',
    feeds: {
        dolores: { posts: [], loading: false },
        products: { posts: [], loading: false },
        blogs: { posts: [], loading: false }
    },
    bases: [],
    currentFeed: null
};

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🌍 Nexus Portal initializing...');
    
    // Load initial data
    await loadFeedPreviews();
    await loadBases();
    
    console.log('✅ Nexus Portal ready');
});

/**
 * Screen navigation
 */
function showScreen(screenName) {
    console.log(`📱 Switching to ${screenName} screen`);
    
    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Show target screen
    const targetScreen = document.getElementById(`${screenName}-screen`);
    if (targetScreen) {
        targetScreen.classList.add('active');
    }
    
    // Update navigation buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Find and activate the correct button
    const activeButtons = document.querySelectorAll(`[onclick="showScreen('${screenName}')"]`);
    activeButtons.forEach(btn => btn.classList.add('active'));
    
    nexusState.currentScreen = screenName;
    
    // Load screen-specific data
    if (screenName === 'bases') {
        await loadBases();
    }
}

/**
 * Load feed previews for main screen
 */
async function loadFeedPreviews() {
    const feedGrid = document.getElementById('feed-grid');
    
    try {
        console.log('📊 Loading feed previews...');
        
        // Get environment config for service URLs
        const config = getEnvironmentConfig();
        
        // Load preview data for each feed type
        const doloresCount = await getFeedCount('dolores');
        const productsCount = await getFeedCount('products');
        const blogsCount = await getFeedCount('blogs');
        
        feedGrid.innerHTML = `
            <div class="feed-preview" onclick="showFeed('dolores')">
                <h3>📸 Social Media Feed</h3>
                <p>Photos, videos, and social content from Dolores</p>
                <div class="count">${doloresCount}</div>
                <small>posts available</small>
            </div>
            
            <div class="feed-preview" onclick="showFeed('products')">
                <h3>🛍️ Products Feed</h3>
                <p>Digital goods and marketplace items from Sanora</p>
                <div class="count">${productsCount}</div>
                <small>products available</small>
            </div>
            
            <div class="feed-preview" onclick="showFeed('blogs')">
                <h3>📝 Blog Posts</h3>
                <p>Blog posts and articles from Sanora</p>
                <div class="count">${blogsCount}</div>
                <small>blogs available</small>
            </div>
            
            <div class="feed-preview" onclick="showFeed('all')">
                <h3>🌐 All Content</h3>
                <p>Combined view of all content across bases</p>
                <div class="count">${doloresCount + productsCount + blogsCount}</div>
                <small>total items</small>
            </div>
        `;
        
    } catch (error) {
        console.error('❌ Failed to load feed previews:', error);
        feedGrid.innerHTML = `
            <div class="feed-preview">
                <h3>📦 Offline Mode</h3>
                <p>No bases connected. Content will appear when services are available.</p>
                <div class="count">0</div>
                <small>items available</small>
            </div>
        `;
    }
}

/**
 * Get feed count for a specific feed type
 */
async function getFeedCount(feedType) {
    try {
        if (window.__TAURI__) {
            // Use Tauri backend for real service calls
            switch (feedType) {
                case 'dolores':
                    const doloresFeed = await window.__TAURI__.core.invoke('get_dolores_feed');
                    return doloresFeed?.length || 0;
                    
                case 'products':
                    const productsData = await window.__TAURI__.core.invoke('get_products_feed');
                    return productsData?.length || 0;
                    
                case 'blogs':
                    const blogsData = await window.__TAURI__.core.invoke('get_blogs_feed');
                    return blogsData?.length || 0;
                    
                default:
                    return 0;
            }
        } else {
            // No fallback - return 0 if Tauri not available
            console.log(`🔌 Tauri not available, cannot get ${feedType} count`);
            return 0;
        }
    } catch (error) {
        console.warn(`⚠️ Could not get ${feedType} count:`, error);
        return 0;
    }
}

/**
 * Load bases using shared base-command
 */
async function loadBases() {
    const baseList = document.getElementById('base-list');
    
    try {
        console.log('🏗️ Loading bases...');
        
        // Use shared base command
        const bases = await window.baseCommand?.getBases() || [];
        
        if (bases.length === 0) {
            baseList.innerHTML = `
                <div class="base-item">
                    <div class="base-info">
                        <h4>📦 No Bases Connected</h4>
                        <p>Connect to base servers to see content feeds</p>
                    </div>
                    <div class="base-status disconnected">Offline</div>
                </div>
            `;
            return;
        }
        
        let baseHTML = '';
        
        // Handle both array and object base formats
        const baseEntries = Array.isArray(bases) ? bases.map((base, i) => [i, base]) : Object.entries(bases);
        
        for (const [id, base] of baseEntries) {
            const isConnected = base.joined || base.connected || false;
            const baseName = base.name || `Base ${id}`;
            const baseDescription = base.description || 'Planet Nine base server';
            
            baseHTML += `
                <div class="base-item">
                    <div class="base-info">
                        <h4>🏗️ ${baseName}</h4>
                        <p>${baseDescription}</p>
                        ${base.soma ? `<small>Tags: ${Object.values(base.soma).flat().join(', ')}</small>` : ''}
                    </div>
                    <div class="base-status ${isConnected ? 'connected' : 'disconnected'}">
                        ${isConnected ? 'Connected' : 'Disconnected'}
                    </div>
                </div>
            `;
        }
        
        baseList.innerHTML = baseHTML;
        nexusState.bases = bases;
        
    } catch (error) {
        console.error('❌ Failed to load bases:', error);
        baseList.innerHTML = `
            <div class="base-item">
                <div class="base-info">
                    <h4>❌ Connection Error</h4>
                    <p>Could not connect to base servers</p>
                </div>
                <div class="base-status disconnected">Error</div>
            </div>
        `;
    }
}

/**
 * Show specific feed content
 */
async function showFeed(feedType) {
    console.log(`📋 Opening ${feedType} feed`);
    
    nexusState.currentFeed = feedType;
    
    // Update feed title
    const feedTitle = document.getElementById('feed-title');
    const feedTitles = {
        dolores: '📸 Social Media Feed',
        products: '🛍️ Products Feed', 
        blogs: '📝 Blog Posts',
        all: '🌐 All Content'
    };
    feedTitle.textContent = feedTitles[feedType] || 'Feed';
    
    // Show feed screen
    showScreen('feed');
    
    // Load feed content
    await loadFeedContent(feedType);
}

/**
 * Load content for specific feed
 */
async function loadFeedContent(feedType) {
    const feedContent = document.getElementById('feed-content');
    feedContent.innerHTML = '<div class="loading">Loading feed content...</div>';
    
    try {
        let posts = [];
        
        if (window.__TAURI__) {
            // Use Tauri backend for real data
            switch (feedType) {
                case 'dolores':
                    posts = await window.__TAURI__.core.invoke('get_dolores_feed') || [];
                    break;
                case 'products':
                    posts = await window.__TAURI__.core.invoke('get_products_feed') || [];
                    break;
                case 'blogs':
                    posts = await window.__TAURI__.core.invoke('get_blogs_feed') || [];
                    break;
                case 'all':
                    const [doloresPosts, productPosts, blogPosts] = await Promise.all([
                        window.__TAURI__.core.invoke('get_dolores_feed') || [],
                        window.__TAURI__.core.invoke('get_products_feed') || [],
                        window.__TAURI__.core.invoke('get_blogs_feed') || []
                    ]);
                    posts = [...doloresPosts, ...productPosts, ...blogPosts]
                        .sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));
                    break;
            }
        }
        
        // No mock data - handle empty state professionally
        if (posts.length === 0) {
            console.log(`📦 No ${feedType} content available from connected services`);
        }
        
        // Render posts using post-widget style
        let contentHTML = '';
        
        for (const post of posts.slice(0, 10)) { // Limit to 10 posts for performance
            contentHTML += createPostWidget(post);
        }
        
        if (contentHTML) {
            feedContent.innerHTML = contentHTML;
        } else {
            // Show professional empty state
            const emptyState = createEmptyFeedMessage(feedType);
            feedContent.innerHTML = `
                <div style="text-align: center; padding: 60px 40px; color: #4a5568;">
                    <div style="font-size: 64px; margin-bottom: 20px;">${emptyState.icon}</div>
                    <h3 style="margin: 0 0 15px 0; color: #2d3748; font-size: 24px;">${emptyState.title}</h3>
                    <p style="margin: 0; color: #718096; line-height: 1.6; max-width: 400px; margin: 0 auto;">${emptyState.message}</p>
                    <div style="margin-top: 30px; padding: 15px; background: #f7fafc; border-radius: 8px; border-left: 4px solid #667eea;">
                        <small style="color: #4a5568;">💡 <strong>Tip:</strong> Check your base connections in the Bases screen to ensure services are available.</small>
                    </div>
                </div>
            `;
        }
        
    } catch (error) {
        console.error(`❌ Failed to load ${feedType} feed:`, error);
        feedContent.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #e53e3e;">
                <h3>❌ Failed to load content</h3>
                <p>Error: ${error.message}</p>
            </div>
        `;
    }
}

/**
 * Create post widget HTML (simplified version of Dolores post-widget)
 */
function createPostWidget(post) {
    const timestamp = post.timestamp ? new Date(post.timestamp).toLocaleDateString() : 'Recently';
    const author = post.author || 'Anonymous';
    const title = post.title || post.name || 'Untitled';
    const description = post.description || post.content || '';
    const price = post.price !== undefined ? `$${post.price}` : '';
    
    return `
        <div class="post-widget-container">
            <div style="background: white; border-radius: 12px; padding: 20px; margin-bottom: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
                    <div>
                        <h3 style="margin: 0 0 5px 0; color: #2d3748; font-size: 18px;">${title}</h3>
                        <p style="margin: 0; color: #718096; font-size: 14px;">by ${author} • ${timestamp}</p>
                    </div>
                    ${price ? `<div style="background: #667eea; color: white; padding: 6px 12px; border-radius: 20px; font-size: 14px; font-weight: 500;">${price}</div>` : ''}
                </div>
                
                ${description ? `<p style="margin: 0 0 15px 0; color: #4a5568; line-height: 1.6;">${description.substring(0, 200)}${description.length > 200 ? '...' : ''}</p>` : ''}
                
                ${post.images && post.images.length > 0 ? `
                    <div style="margin: 15px 0;">
                        <img src="${post.images[0]}" alt="${title}" style="width: 100%; max-height: 300px; object-fit: cover; border-radius: 8px;">
                        ${post.images.length > 1 ? `<small style="color: #718096;">+${post.images.length - 1} more images</small>` : ''}
                    </div>
                ` : ''}
                
                ${post.tags && post.tags.length > 0 ? `
                    <div style="margin-top: 15px;">
                        ${post.tags.map(tag => `<span style="display: inline-block; background: #e2e8f0; color: #4a5568; padding: 4px 8px; border-radius: 12px; font-size: 12px; margin-right: 8px; margin-bottom: 4px;">#${tag}</span>`).join('')}
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

/**
 * Create professional empty state message for feeds
 */
function createEmptyFeedMessage(feedType) {
    const messages = {
        dolores: {
            icon: '📸',
            title: 'No Social Content Yet',
            message: 'Social media posts will appear here when bases are connected and content is available.'
        },
        products: {
            icon: '🛍️', 
            title: 'No Products Available',
            message: 'Marketplace products will appear here when connected to bases with active marketplaces.'
        },
        blogs: {
            icon: '📝',
            title: 'No Blog Posts Yet', 
            message: 'Blog posts and articles will appear here when bases publish content.'
        },
        all: {
            icon: '🌐',
            title: 'No Content Available',
            message: 'Content from all sources will appear here when bases are connected and active.'
        }
    };
    
    const config = messages[feedType] || messages.all;
    return config;
}

/**
 * Global functions for navigation (called from HTML)
 */
window.showScreen = showScreen;
window.showFeed = showFeed;

// Make environment functions available globally
window.getEnvironmentConfig = getEnvironmentConfig;
window.getServiceUrl = getServiceUrl;

console.log('🔧 Nexus Portal scripts loaded');