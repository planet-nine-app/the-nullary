/**
 * Post Creator - Form to Post Conversion System
 * Converts form data to post components and handles allyabase integration
 */

import { createTextComponent, createMultilineTextComponent } from '../components/text.js';

/**
 * Default post configuration
 */
const DEFAULT_POST_CONFIG = {
  width: 600,
  padding: 20,
  responsive: true,
  fontFamily: 'Georgia, "Times New Roman", serif',
  lineHeight: 1.6
};

/**
 * Post type definitions
 */
export const POST_TYPES = {
  TEXT: 'text',
  BLOG: 'blog',
  MULTILINE: 'multiline'
};

/**
 * Create a post from form data
 * @param {Object} formData - Data from form component
 * @param {string} postType - Type of post to create
 * @param {Object} theme - Theme configuration
 * @returns {Object} Post creation result
 */
export function createPostFromForm(formData, postType = POST_TYPES.TEXT, theme = {}) {
  console.log('🎭 Creating post from form data:', { formData, postType, theme });
  
  try {
    switch (postType) {
      case POST_TYPES.TEXT:
        return createTextPost(formData, theme);
      
      case POST_TYPES.MULTILINE:
        return createMultilinePost(formData, theme);
      
      case POST_TYPES.BLOG:
        return createBlogPost(formData, theme);
      
      default:
        throw new Error(`Unknown post type: ${postType}`);
    }
  } catch (error) {
    console.error('❌ Failed to create post:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Create a simple text post
 * @param {Object} formData - Form data
 * @param {Object} theme - Theme configuration  
 * @returns {Object} Post creation result
 */
function createTextPost(formData, theme) {
  const text = formData.text || formData.content || '';
  
  if (!text.trim()) {
    throw new Error('Text content is required');
  }
  
  const config = {
    ...DEFAULT_POST_CONFIG,
    text: text,
    fontSize: theme.typography?.fontSize || 16,
    fontFamily: theme.typography?.fontFamily || DEFAULT_POST_CONFIG.fontFamily,
    color: theme.colors?.text || '#2c3e50',
    backgroundColor: theme.colors?.surface || 'transparent',
    width: theme.layout?.maxWidth || DEFAULT_POST_CONFIG.width,
    className: 'created-text-post'
  };
  
  const element = createTextComponent(config);
  
  return {
    success: true,
    type: POST_TYPES.TEXT,
    element: element,
    config: config,
    data: formData,
    timestamp: new Date().toISOString()
  };
}

/**
 * Create a multiline text post
 * @param {Object} formData - Form data
 * @param {Object} theme - Theme configuration
 * @returns {Object} Post creation result
 */
function createMultilinePost(formData, theme) {
  const text = formData.text || formData.content || '';
  
  if (!text.trim()) {
    throw new Error('Text content is required');
  }
  
  const config = {
    ...DEFAULT_POST_CONFIG,
    text: text,
    fontSize: theme.typography?.fontSize || 16,
    fontFamily: theme.typography?.fontFamily || DEFAULT_POST_CONFIG.fontFamily,
    color: theme.colors?.text || '#2c3e50',
    backgroundColor: theme.colors?.surface || 'transparent',
    lineHeight: theme.typography?.lineHeight || DEFAULT_POST_CONFIG.lineHeight,
    width: theme.layout?.maxWidth || DEFAULT_POST_CONFIG.width,
    maxLines: 20,
    wordWrap: true,
    className: 'created-multiline-post'
  };
  
  const element = createMultilineTextComponent(config);
  
  return {
    success: true,
    type: POST_TYPES.MULTILINE,
    element: element,
    config: config,
    data: formData,
    timestamp: new Date().toISOString()
  };
}

/**
 * Create a blog post with title and content
 * @param {Object} formData - Form data
 * @param {Object} theme - Theme configuration
 * @returns {Object} Post creation result
 */
function createBlogPost(formData, theme) {
  const title = formData.title || '';
  const content = formData.content || '';
  
  if (!title.trim() || !content.trim()) {
    throw new Error('Both title and content are required for blog posts');
  }
  
  // Create container SVG
  const containerWidth = theme.layout?.maxWidth || DEFAULT_POST_CONFIG.width;
  const titleHeight = 80;
  const contentHeight = 300; // Will auto-adjust
  const spacing = 20;
  const totalHeight = titleHeight + contentHeight + spacing;
  
  // Title configuration
  const titleConfig = {
    text: title,
    fontSize: theme.typography?.headerSize || 24,
    fontFamily: theme.typography?.headerFont || theme.typography?.fontFamily || DEFAULT_POST_CONFIG.fontFamily,
    color: theme.colors?.primary || '#2c3e50',
    fontWeight: 'bold',
    width: containerWidth,
    height: titleHeight,
    padding: DEFAULT_POST_CONFIG.padding,
    textAlign: 'left',
    className: 'blog-post-title'
  };
  
  // Content configuration
  const contentConfig = {
    text: content,
    fontSize: theme.typography?.fontSize || 16,
    fontFamily: theme.typography?.fontFamily || DEFAULT_POST_CONFIG.fontFamily,
    color: theme.colors?.text || '#2c3e50',
    lineHeight: theme.typography?.lineHeight || DEFAULT_POST_CONFIG.lineHeight,
    width: containerWidth,
    padding: DEFAULT_POST_CONFIG.padding,
    maxLines: 30,
    wordWrap: true,
    className: 'blog-post-content'
  };
  
  // Create components
  const titleElement = createTextComponent(titleConfig);
  const contentElement = createMultilineTextComponent(contentConfig);
  
  // Create container div to hold both elements
  const container = document.createElement('div');
  container.className = 'blog-post-container';
  container.style.cssText = `
    display: flex;
    flex-direction: column;
    gap: ${spacing}px;
    max-width: ${containerWidth}px;
    margin: 0 auto;
  `;
  
  container.appendChild(titleElement);
  container.appendChild(contentElement);
  
  return {
    success: true,
    type: POST_TYPES.BLOG,
    element: container,
    components: {
      title: {
        element: titleElement,
        config: titleConfig
      },
      content: {
        element: contentElement,
        config: contentConfig
      }
    },
    data: formData,
    timestamp: new Date().toISOString()
  };
}

/**
 * Save post to allyabase
 * @param {Object} post - Post object from createPostFromForm
 * @param {Object} allyabaseClient - Allyabase client instance
 * @returns {Promise<Object>} Save result
 */
export async function savePostToAllyabase(post, allyabaseClient) {
  if (!allyabaseClient) {
    throw new Error('Allyabase client is required');
  }
  
  if (!post.success) {
    throw new Error('Cannot save invalid post');
  }
  
  console.log('💾 Saving post to allyabase...', post.type);
  
  try {
    // Prepare post data for storage
    const postData = {
      type: post.type,
      data: post.data,
      config: post.config || post.components,
      timestamp: post.timestamp,
      source: 'rhapsold',
      version: '1.0.0'
    };
    
    // Save to BDO (Big Dumb Object) service
    const result = await allyabaseClient.saveBDO(postData);
    
    console.log('✅ Post saved successfully:', result);
    
    return {
      success: true,
      id: result.id,
      post: postData,
      allyabaseResult: result
    };
    
  } catch (error) {
    console.error('❌ Failed to save post to allyabase:', error);
    
    return {
      success: false,
      error: error.message,
      post: post
    };
  }
}

/**
 * Load post from allyabase
 * @param {string} postId - Post ID
 * @param {Object} allyabaseClient - Allyabase client instance
 * @returns {Promise<Object>} Load result
 */
export async function loadPostFromAllyabase(postId, allyabaseClient) {
  if (!allyabaseClient) {
    throw new Error('Allyabase client is required');
  }
  
  console.log('📖 Loading post from allyabase:', postId);
  
  try {
    const postData = await allyabaseClient.getBDO(postId);
    
    if (!postData) {
      throw new Error('Post not found');
    }
    
    // Recreate post from stored data
    const recreatedPost = await recreatePostFromData(postData);
    
    return {
      success: true,
      post: recreatedPost,
      data: postData
    };
    
  } catch (error) {
    console.error('❌ Failed to load post from allyabase:', error);
    
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Recreate post element from stored data
 * @param {Object} postData - Stored post data
 * @returns {Object} Recreated post
 */
async function recreatePostFromData(postData) {
  const { type, data, config } = postData;
  
  switch (type) {
    case POST_TYPES.TEXT:
      return {
        success: true,
        type: type,
        element: createTextComponent(config),
        config: config,
        data: data,
        timestamp: postData.timestamp
      };
    
    case POST_TYPES.MULTILINE:
      return {
        success: true,
        type: type,
        element: createMultilineTextComponent(config),
        config: config,
        data: data,
        timestamp: postData.timestamp
      };
    
    case POST_TYPES.BLOG:
      // Recreate blog post
      const titleElement = createTextComponent(config.title.config);
      const contentElement = createMultilineTextComponent(config.content.config);
      
      const container = document.createElement('div');
      container.className = 'blog-post-container';
      container.style.cssText = `
        display: flex;
        flex-direction: column;
        gap: 20px;
        max-width: 600px;
        margin: 0 auto;
      `;
      
      container.appendChild(titleElement);
      container.appendChild(contentElement);
      
      return {
        success: true,
        type: type,
        element: container,
        components: {
          title: {
            element: titleElement,
            config: config.title.config
          },
          content: {
            element: contentElement,
            config: config.content.config
          }
        },
        data: data,
        timestamp: postData.timestamp
      };
    
    default:
      throw new Error(`Unknown post type: ${type}`);
  }
}

/**
 * Create complete workflow: form -> post -> save
 * @param {Object} formComponent - Form component instance
 * @param {string} postType - Type of post to create
 * @param {Object} theme - Theme configuration
 * @param {Object} allyabaseClient - Allyabase client instance
 * @returns {Promise<Object>} Complete workflow result
 */
export async function createAndSavePost(formComponent, postType, theme, allyabaseClient) {
  console.log('🔄 Starting complete form-to-post workflow...');
  
  try {
    // Step 1: Validate form
    const validation = formComponent.validate();
    if (!validation.isValid) {
      throw new Error(`Form validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
    }
    
    // Step 2: Get form data
    const formData = formComponent.getData();
    
    // Step 3: Create post
    const post = createPostFromForm(formData, postType, theme);
    if (!post.success) {
      throw new Error(post.error);
    }
    
    // Step 4: Save to allyabase
    const saveResult = await savePostToAllyabase(post, allyabaseClient);
    
    // Step 5: Clear form if successful
    if (saveResult.success) {
      formComponent.clear();
    }
    
    return {
      success: true,
      post: post,
      saveResult: saveResult,
      formData: formData
    };
    
  } catch (error) {
    console.error('❌ Complete workflow failed:', error);
    
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Export post as data URL
 * @param {Object} post - Post object
 * @returns {string} Data URL
 */
export function exportPostAsDataURL(post) {
  if (!post.success || !post.element) {
    throw new Error('Invalid post for export');
  }
  
  // Handle different element types
  let elementToExport = post.element;
  
  if (elementToExport.tagName === 'DIV') {
    // For blog posts, create an SVG container
    const svgs = elementToExport.querySelectorAll('svg');
    if (svgs.length > 0) {
      elementToExport = svgs[0]; // Use first SVG for now
    }
  }
  
  if (elementToExport.tagName === 'svg') {
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(elementToExport);
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`;
  }
  
  throw new Error('Cannot export non-SVG elements');
}