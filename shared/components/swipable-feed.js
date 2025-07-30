/**
 * Swipable Feed Component for The Nullary
 * Provides Tinder-like swipe functionality for vertical feeds
 * Right swipe = Accept/Like, Left swipe = Reject/Pass
 */

import { 
  createSVGContainer, 
  createSVGElement, 
  addSVGStyles, 
  generateSVGId 
} from '../utils/svg-utils.js';

/**
 * Default swipable feed configuration
 */
const DEFAULT_SWIPABLE_CONFIG = {
  // Container
  className: 'nullary-swipable-feed',
  
  // Layout
  width: '100%',
  maxWidth: 400,
  height: '100%',
  padding: 20,
  
  // Swipe behavior
  swipeThreshold: 100, // pixels needed to trigger swipe
  swipeVelocityThreshold: 0.5, // pixels per ms
  snapBackDuration: 300, // ms for snap-back animation
  swipeOutDuration: 300, // ms for swipe-out animation
  
  // Card styling
  cardSpacing: 10, // space between stacked cards
  maxVisibleCards: 3, // how many cards to show stacked
  cardBorderRadius: 12,
  cardShadow: '0 4px 20px rgba(0,0,0,0.15)',
  
  // Colors
  acceptColor: '#4CAF50', // green for right swipe
  rejectColor: '#f44336', // red for left swipe
  backgroundColor: 'transparent',
  
  // Text
  acceptText: '❤️ LIKE',
  rejectText: '✖️ PASS',
  emptyText: 'No more posts to swipe!',
  
  // Collections
  enableCollections: true,
  maxCollectionSize: 1000,
  
  // Animation
  enableAnimations: true,
  cardScale: 0.95, // scale for cards behind the top card
};

/**
 * Create a swipable feed component
 * @param {Object} config - Configuration object
 * @returns {Object} Swipable feed component with methods
 */
export function createSwipableFeed(config = {}) {
  const finalConfig = { ...DEFAULT_SWIPABLE_CONFIG, ...config };
  
  // Create main container
  const container = document.createElement('div');
  container.className = finalConfig.className;
  container.id = generateSVGId('swipable-feed');
  
  // Apply container styles
  container.style.cssText = `
    position: relative;
    width: ${finalConfig.width};
    max-width: ${finalConfig.maxWidth}px;
    height: ${finalConfig.height};
    background: ${finalConfig.backgroundColor};
    padding: ${finalConfig.padding}px;
    margin: 0 auto;
    box-sizing: border-box;
    overflow: hidden;
    touch-action: none;
    user-select: none;
  `;
  
  // Create cards container
  const cardsContainer = document.createElement('div');
  cardsContainer.className = 'swipable-cards-container';
  cardsContainer.style.cssText = `
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  `;
  
  container.appendChild(cardsContainer);
  
  // State management
  const state = {
    posts: [],
    currentIndex: 0,
    acceptedPosts: [],
    rejectedPosts: [],
    isAnimating: false,
    isEmpty: true,
    dragState: {
      isDragging: false,
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0,
      startTime: 0
    }
  };
  
  // Event handlers
  const eventHandlers = {
    onSwipeRight: null, // (post, index) => {}
    onSwipeLeft: null,  // (post, index) => {}
    onPostClick: null,  // (post, index) => {}
    onEmpty: null,      // () => {}
    onCardChange: null  // (currentIndex, post) => {}
  };
  
  // Create empty state
  function createEmptyState() {
    const emptyDiv = document.createElement('div');
    emptyDiv.className = 'swipable-empty';
    emptyDiv.style.cssText = `
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      height: 100%;
      color: #999;
      text-align: center;
      font-style: italic;
    `;
    
    const icon = document.createElement('div');
    icon.style.cssText = 'font-size: 48px; margin-bottom: 16px; opacity: 0.5;';
    icon.textContent = '📱';
    
    const text = document.createElement('div');
    text.textContent = finalConfig.emptyText;
    
    emptyDiv.appendChild(icon);
    emptyDiv.appendChild(text);
    return emptyDiv;
  }
  
  // Create swipable card
  function createSwipableCard(post, index, stackIndex = 0) {
    const card = document.createElement('div');
    card.className = 'swipable-card';
    card.dataset.postId = post.id || index;
    card.dataset.stackIndex = stackIndex;
    
    const scale = Math.pow(finalConfig.cardScale, stackIndex);
    const translateY = stackIndex * finalConfig.cardSpacing;
    const opacity = Math.max(0.3, 1 - stackIndex * 0.2);
    
    card.style.cssText = `
      position: absolute;
      width: 100%;
      height: 80%;
      background: white;
      border-radius: ${finalConfig.cardBorderRadius}px;
      box-shadow: ${finalConfig.cardShadow};
      cursor: grab;
      transform: scale(${scale}) translateY(${translateY}px);
      opacity: ${opacity};
      transition: transform 0.3s ease, opacity 0.3s ease;
      z-index: ${100 - stackIndex};
      overflow: hidden;
    `;
    
    // Add swipe indicators
    const acceptIndicator = createSwipeIndicator('accept');
    const rejectIndicator = createSwipeIndicator('reject');
    card.appendChild(acceptIndicator);
    card.appendChild(rejectIndicator);
    
    // Add post content
    if (post.element) {
      const contentWrapper = document.createElement('div');
      contentWrapper.style.cssText = `
        width: 100%;
        height: 100%;
        padding: 20px;
        box-sizing: border-box;
        overflow: hidden;
      `;
      contentWrapper.appendChild(post.element.cloneNode(true));
      card.appendChild(contentWrapper);
    }
    
    // Only add interaction to the top card
    if (stackIndex === 0) {
      addSwipeInteraction(card, post, index);
    }
    
    return card;
  }
  
  // Create swipe indicator
  function createSwipeIndicator(type) {
    const indicator = document.createElement('div');
    const isAccept = type === 'accept';
    
    indicator.className = `swipe-indicator-${type}`;
    indicator.style.cssText = `
      position: absolute;
      top: 50%;
      ${isAccept ? 'right: 20px' : 'left: 20px'};
      transform: translateY(-50%) scale(0);
      background: ${isAccept ? finalConfig.acceptColor : finalConfig.rejectColor};
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      font-weight: bold;
      font-size: 14px;
      pointer-events: none;
      transition: transform 0.2s ease, opacity 0.2s ease;
      opacity: 0;
      z-index: 10;
    `;
    
    indicator.textContent = isAccept ? finalConfig.acceptText : finalConfig.rejectText;
    return indicator;
  }
  
  // Add swipe interaction to card
  function addSwipeInteraction(card, post, index) {
    let startX = 0, startY = 0, currentX = 0, currentY = 0;
    let isDragging = false;
    let startTime = 0;
    
    // Mouse/Touch event handlers
    function handleStart(e) {
      if (state.isAnimating) return;
      
      isDragging = true;
      startTime = Date.now();
      card.style.cursor = 'grabbing';
      card.style.transition = 'none';
      
      const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
      const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
      
      startX = clientX;
      startY = clientY;
      currentX = clientX;
      currentY = clientY;
      
      state.dragState = {
        isDragging: true,
        startX,
        startY,
        currentX,
        currentY,
        startTime
      };
    }
    
    function handleMove(e) {
      if (!isDragging || state.isAnimating) return;
      
      e.preventDefault();
      
      const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
      const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
      
      currentX = clientX;
      currentY = clientY;
      
      const deltaX = currentX - startX;
      const deltaY = currentY - startY;
      const rotation = deltaX * 0.1; // subtle rotation
      
      // Update card position
      card.style.transform = `translateX(${deltaX}px) translateY(${deltaY}px) rotate(${rotation}deg)`;
      
      // Update indicators based on swipe direction
      updateSwipeIndicators(card, deltaX);
      
      state.dragState.currentX = currentX;
      state.dragState.currentY = currentY;
    }
    
    function handleEnd(e) {
      if (!isDragging) return;
      
      isDragging = false;
      card.style.cursor = 'grab';
      
      const deltaX = currentX - startX;
      const deltaTime = Date.now() - startTime;
      const velocity = Math.abs(deltaX) / deltaTime;
      
      // Determine if swipe threshold is met
      const shouldSwipe = Math.abs(deltaX) > finalConfig.swipeThreshold || 
                         velocity > finalConfig.swipeVelocityThreshold;
      
      if (shouldSwipe) {
        // Swipe out
        const direction = deltaX > 0 ? 'right' : 'left';
        swipeCard(card, post, index, direction);
      } else {
        // Snap back
        snapCardBack(card);
      }
      
      state.dragState.isDragging = false;
    }
    
    // Add event listeners
    card.addEventListener('mousedown', handleStart);
    card.addEventListener('touchstart', handleStart, { passive: false });
    
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('touchmove', handleMove, { passive: false });
    
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchend', handleEnd);
    
    // Click handler (only if not dragging)
    card.addEventListener('click', (e) => {
      if (state.dragState.isDragging) return;
      if (eventHandlers.onPostClick) {
        eventHandlers.onPostClick(post, index, e);
      }
    });
  }
  
  // Update swipe indicators
  function updateSwipeIndicators(card, deltaX) {
    const acceptIndicator = card.querySelector('.swipe-indicator-accept');
    const rejectIndicator = card.querySelector('.swipe-indicator-reject');
    
    const opacity = Math.min(1, Math.abs(deltaX) / finalConfig.swipeThreshold);
    const scale = Math.min(1, Math.abs(deltaX) / finalConfig.swipeThreshold);
    
    if (deltaX > 0) {
      // Swiping right - show accept
      acceptIndicator.style.opacity = opacity;
      acceptIndicator.style.transform = `translateY(-50%) scale(${scale})`;
      rejectIndicator.style.opacity = 0;
      rejectIndicator.style.transform = 'translateY(-50%) scale(0)';
    } else if (deltaX < 0) {
      // Swiping left - show reject
      rejectIndicator.style.opacity = opacity;
      rejectIndicator.style.transform = `translateY(-50%) scale(${scale})`;
      acceptIndicator.style.opacity = 0;
      acceptIndicator.style.transform = 'translateY(-50%) scale(0)';
    } else {
      // No swipe - hide both
      acceptIndicator.style.opacity = 0;
      acceptIndicator.style.transform = 'translateY(-50%) scale(0)';
      rejectIndicator.style.opacity = 0;
      rejectIndicator.style.transform = 'translateY(-50%) scale(0)';
    }
  }
  
  // Swipe card out
  function swipeCard(card, post, index, direction) {
    if (state.isAnimating) return;
    
    state.isAnimating = true;
    
    const deltaX = direction === 'right' ? window.innerWidth : -window.innerWidth;
    const rotation = direction === 'right' ? 30 : -30;
    
    card.style.transition = `transform ${finalConfig.swipeOutDuration}ms ease-out, opacity ${finalConfig.swipeOutDuration}ms ease-out`;
    card.style.transform = `translateX(${deltaX}px) rotate(${rotation}deg)`;
    card.style.opacity = '0';
    
    // Add to appropriate collection
    if (finalConfig.enableCollections) {
      if (direction === 'right') {
        state.acceptedPosts.push(post);
        if (state.acceptedPosts.length > finalConfig.maxCollectionSize) {
          state.acceptedPosts.shift();
        }
      } else {
        state.rejectedPosts.push(post);
        if (state.rejectedPosts.length > finalConfig.maxCollectionSize) {
          state.rejectedPosts.shift();
        }
      }
    }
    
    // Trigger event handlers
    if (direction === 'right' && eventHandlers.onSwipeRight) {
      eventHandlers.onSwipeRight(post, index);
    } else if (direction === 'left' && eventHandlers.onSwipeLeft) {
      eventHandlers.onSwipeLeft(post, index);
    }
    
    // Advance to next post after animation
    setTimeout(() => {
      advanceToNextPost();
      state.isAnimating = false;
    }, finalConfig.swipeOutDuration);
  }
  
  // Snap card back to center
  function snapCardBack(card) {
    card.style.transition = `transform ${finalConfig.snapBackDuration}ms ease-out`;
    card.style.transform = 'translateX(0) translateY(0) rotate(0deg)';
    
    // Hide indicators
    const indicators = card.querySelectorAll('[class*="swipe-indicator"]');
    indicators.forEach(indicator => {
      indicator.style.opacity = '0';
      indicator.style.transform = 'translateY(-50%) scale(0)';
    });
  }
  
  // Advance to next post
  function advanceToNextPost() {
    state.currentIndex++;
    
    if (state.currentIndex >= state.posts.length) {
      // No more posts
      state.isEmpty = true;
      renderCards();
      if (eventHandlers.onEmpty) {
        eventHandlers.onEmpty();
      }
    } else {
      // Show next post
      renderCards();
      const currentPost = state.posts[state.currentIndex];
      if (eventHandlers.onCardChange) {
        eventHandlers.onCardChange(state.currentIndex, currentPost);
      }
    }
  }
  
  // Render cards
  function renderCards() {
    cardsContainer.innerHTML = '';
    
    if (state.isEmpty || state.currentIndex >= state.posts.length) {
      cardsContainer.appendChild(createEmptyState());
      return;
    }
    
    // Render visible cards (current + upcoming)
    const visibleCards = Math.min(finalConfig.maxVisibleCards, state.posts.length - state.currentIndex);
    
    for (let i = visibleCards - 1; i >= 0; i--) {
      const postIndex = state.currentIndex + i;
      if (postIndex < state.posts.length) {
        const post = state.posts[postIndex];
        const card = createSwipableCard(post, postIndex, i);
        cardsContainer.appendChild(card);
      }
    }
  }
  
  // Component interface
  const swipableFeed = {
    element: container,
    
    // Data management
    setPosts(posts) {
      state.posts = Array.isArray(posts) ? posts : [];
      state.currentIndex = 0;
      state.isEmpty = state.posts.length === 0;
      renderCards();
    },
    
    addPost(post) {
      state.posts.push(post);
      if (state.isEmpty) {
        state.isEmpty = false;
        state.currentIndex = 0;
        renderCards();
      }
    },
    
    // Navigation
    swipeRight() {
      const currentCard = cardsContainer.querySelector('[data-stack-index="0"]');
      const currentPost = state.posts[state.currentIndex];
      if (currentCard && currentPost && !state.isAnimating) {
        swipeCard(currentCard, currentPost, state.currentIndex, 'right');
      }
    },
    
    swipeLeft() {
      const currentCard = cardsContainer.querySelector('[data-stack-index="0"]');
      const currentPost = state.posts[state.currentIndex];
      if (currentCard && currentPost && !state.isAnimating) {
        swipeCard(currentCard, currentPost, state.currentIndex, 'left');
      }
    },
    
    // Collections
    getAcceptedPosts() {
      return [...state.acceptedPosts];
    },
    
    getRejectedPosts() {
      return [...state.rejectedPosts];
    },
    
    clearCollections() {
      state.acceptedPosts = [];
      state.rejectedPosts = [];
    },
    
    // State
    getCurrentPost() {
      return state.posts[state.currentIndex] || null;
    },
    
    getCurrentIndex() {
      return state.currentIndex;
    },
    
    getRemainingCount() {
      return Math.max(0, state.posts.length - state.currentIndex);
    },
    
    isEmpty() {
      return state.isEmpty;
    },
    
    // Event handlers
    onSwipeRight(handler) {
      eventHandlers.onSwipeRight = handler;
    },
    
    onSwipeLeft(handler) {
      eventHandlers.onSwipeLeft = handler;
    },
    
    onPostClick(handler) {
      eventHandlers.onPostClick = handler;
    },
    
    onEmpty(handler) {
      eventHandlers.onEmpty = handler;
    },
    
    onCardChange(handler) {
      eventHandlers.onCardChange = handler;
    }
  };
  
  // Initial render
  renderCards();
  
  return swipableFeed;
}

/**
 * Export default configuration
 */
export { DEFAULT_SWIPABLE_CONFIG as swipableFeedDefaults };