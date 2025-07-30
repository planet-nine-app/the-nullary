// Text/Blog Feed Component for The Nullary Ecosystem
// Based on screenary's lexary implementation

// Create a text/blog post row with SVG-based rendering
function createTextRow(text, images = [], options = {}) {
    const {
        width = 600,
        backgroundColor = '#252529',
        textColor = '#ffffff',
        borderColor = 'url(#frameGradient)',
        fontFamily = 'Georgia, serif',
        fontSize = 24
    } = options;

    // Calculate dimensions
    const IMAGE_DIMENSION = images && images.length > 0 ? 552 : 0;
    const MORE_THAN_ONE_IMAGE = images && images.length > 1;
    const textHeight = text ? Math.floor((text.length / 32) * 27) : 0;
    const totalHeight = textHeight + (images && images.length > 0 ? IMAGE_DIMENSION : 0) + (16 * (images && images.length > 0 ? 3 : 2)) + 10;

    const svg = `
        <!-- Gradient definitions -->
        <defs>
            <linearGradient id="frameGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="purple"/>
                <stop offset="100%" stop-color="green"/>
            </linearGradient>
        </defs>
        
        <!-- Text Area -->
        <rect x="16" y="0" width="568" height="${textHeight + 16}" rx="8" fill="${backgroundColor}" stroke="${borderColor}" stroke-width="2"></rect>
        <foreignObject x="24" y="8" width="552" height="${textHeight}">
            <div style="margin: 16px; font-family: ${fontFamily}; font-size: ${fontSize}px; color: ${textColor};">
                <p>${text}</p>
            </div>
        </foreignObject>

        ${images && images.length > 0 ? `
        <!-- Image Display Area -->
        <rect x="16" y="${textHeight + 32}" width="568" height="${IMAGE_DIMENSION + 32}" rx="8" fill="${backgroundColor}" stroke="${borderColor}" stroke-width="2"/>
        
        <!-- Current Image Display -->
        <g>
            ${images ? `<image id="image" x="24" y="${textHeight + 40}" width="${IMAGE_DIMENSION}" height="${IMAGE_DIMENSION}" rx="8" stroke="${borderColor}" stroke-width="2" href="${images[0].fullsize || images[0]}"></image>` : ''}
        </g>

        ${MORE_THAN_ONE_IMAGE ? `
        <!-- Navigation Arrows -->
        <g class="nav-arrow prev" style="cursor: pointer;">
            <circle cx="75" cy="${textHeight + 40 + IMAGE_DIMENSION/2}" r="25" fill="${backgroundColor}" stroke="#444" stroke-width="1" opacity="0.8"/>
            <path d="M85,${textHeight + 40 + IMAGE_DIMENSION/2} L65,${textHeight + 40 + IMAGE_DIMENSION/2} M75,${textHeight + 40 + IMAGE_DIMENSION/2 - 10} L65,${textHeight + 40 + IMAGE_DIMENSION/2} L75,${textHeight + 40 + IMAGE_DIMENSION/2 + 10}" stroke="${textColor}" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        </g>
        
        <g class="nav-arrow next" style="cursor: pointer;">
            <circle cx="525" cy="${textHeight + 40 + IMAGE_DIMENSION/2}" r="25" fill="${backgroundColor}" stroke="#444" stroke-width="1" opacity="0.8"/>
            <path d="M515,${textHeight + 40 + IMAGE_DIMENSION/2} L535,${textHeight + 40 + IMAGE_DIMENSION/2} M525,${textHeight + 40 + IMAGE_DIMENSION/2 - 10} L535,${textHeight + 40 + IMAGE_DIMENSION/2} L525,${textHeight + 40 + IMAGE_DIMENSION/2 + 10}" stroke="${textColor}" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        </g>
        
        <!-- Navigation Dots -->
        <g class="nav-dots" transform="translate(300, ${textHeight + IMAGE_DIMENSION + 70})">
            ${images.map((_, index) => `
                <circle cx="${(index - Math.floor(images.length/2)) * 40}" cy="0" r="8" fill="${index === 0 ? '#3eda82' : '#555555'}"/>
                ${index === 0 ? `<circle cx="${(index - Math.floor(images.length/2)) * 40}" cy="0" r="12" fill="none" stroke="#3eda82" stroke-width="2" opacity="0.5">
                    <animate attributeName="r" values="12;16;12" dur="2s" repeatCount="indefinite"/>
                    <animate attributeName="opacity" values="0.5;0.2;0.5" dur="2s" repeatCount="indefinite"/>
                </circle>` : ''}
            `).join('')}
        </g>

        <!-- Swipe Gesture Indicator -->
        <g opacity="0.4">
            <path d="M280,${textHeight + 40 + IMAGE_DIMENSION/2} C310,${textHeight + 40 + IMAGE_DIMENSION/2 - 10} 330,${textHeight + 40 + IMAGE_DIMENSION/2 - 10} 360,${textHeight + 40 + IMAGE_DIMENSION/2}" stroke="${textColor}" stroke-width="2" stroke-dasharray="4,4" fill="none">
                <animate attributeName="opacity" values="0.4;0.1;0.4" dur="3s" repeatCount="indefinite"/>
            </path>
            <path d="M350,${textHeight + 40 + IMAGE_DIMENSION/2 - 5} L360,${textHeight + 40 + IMAGE_DIMENSION/2} L350,${textHeight + 40 + IMAGE_DIMENSION/2 + 5}" stroke="${textColor}" stroke-width="2" fill="none"/>
        </g>` : ''}` : ''}
    `;

    const container = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    container.setAttribute('width', '100%');
    container.setAttribute('height', '100%');

    const svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svgElement.setAttribute('viewBox', `0 0 ${width} ${totalHeight}`);
    svgElement.innerHTML = svg;

    // Add image navigation functionality
    if (images && images.length > 1) {
        let currentIndex = 0;
        
        const imageElement = svgElement.querySelector('#image');
        const dots = svgElement.querySelectorAll('.nav-dots circle');
        const prevButton = svgElement.querySelector('.nav-arrow.prev');
        const nextButton = svgElement.querySelector('.nav-arrow.next');

        function updateImage(index) {
            currentIndex = index;
            if (imageElement) {
                imageElement.setAttribute('href', images[currentIndex].fullsize || images[currentIndex]);
            }
            
            // Update dots
            dots.forEach((dot, i) => {
                dot.setAttribute('fill', i === currentIndex ? '#3eda82' : '#555555');
                const glowCircle = dot.nextElementSibling;
                if (glowCircle && glowCircle.tagName === 'circle') {
                    glowCircle.style.display = i === currentIndex ? 'block' : 'none';
                }
            });
        }

        function showPreviousImage() {
            updateImage(currentIndex > 0 ? currentIndex - 1 : images.length - 1);
        }

        function showNextImage() {
            updateImage(currentIndex < images.length - 1 ? currentIndex + 1 : 0);
        }

        // Add event listeners
        if (prevButton) prevButton.addEventListener('click', showPreviousImage);
        if (nextButton) nextButton.addEventListener('click', showNextImage);

        // Touch/swipe support
        let touchStartX = 0;
        svgElement.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        });
        
        svgElement.addEventListener('touchend', (e) => {
            const touchEndX = e.changedTouches[0].screenX;
            const diff = touchStartX - touchEndX;
            
            if (diff > 50) { 
                showNextImage();
            } else if (diff < -50) { 
                showPreviousImage();
            }
        });
    }

    container.appendChild(svgElement);
    
    // Set aspect ratio and dimensions for layout
    const windowWidth = Math.min(window.innerWidth, width);
    container.aspectRatio = width / totalHeight;
    container.totalHeight = totalHeight * (windowWidth / width);

    return container;
}

// Create a text-only post (no images)
function createTextPost(text, options = {}) {
    return createTextRow(text, [], options);
}

// Create a blog post with optional images
function createBlogPost(title, content, images = [], options = {}) {
    const fullText = title + (content ? '\n\n' + content : '');
    return createTextRow(fullText, images, options);
}

// Create an empty state SVG for when there are no posts
function createTextFeedEmptyState(onRefresh, options = {}) {
    const {
        width = 600,
        height = 400,
        backgroundColor = '#252529',
        textColor = '#ffffff',
        buttonColor = '#4CAF50'
    } = options;

    const svg = `
        <defs>
            <linearGradient id="emptyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="purple"/>
                <stop offset="100%" stop-color="green"/>
            </linearGradient>
        </defs>
        
        <rect width="${width}" height="${height}" fill="${backgroundColor}" rx="12" stroke="url(#emptyGradient)" stroke-width="2"/>
        
        <!-- Empty state icon -->
        <g transform="translate(${width/2}, ${height/2 - 60})">
            <circle r="40" fill="none" stroke="${textColor}" stroke-width="2" opacity="0.5"/>
            <path d="M-20,-10 L-10,0 L-20,10 M-10,0 L20,0" stroke="${textColor}" stroke-width="2" fill="none" opacity="0.5"/>
        </g>
        
        <!-- Empty state text -->
        <text x="${width/2}" y="${height/2}" text-anchor="middle" fill="${textColor}" font-family="Arial, sans-serif" font-size="18" font-weight="bold">
            No text posts available
        </text>
        <text x="${width/2}" y="${height/2 + 25}" text-anchor="middle" fill="${textColor}" font-family="Arial, sans-serif" font-size="14" opacity="0.7">
            Check back later or try refreshing
        </text>
        
        <!-- Refresh button -->
        <g class="refresh-button" style="cursor: pointer;" transform="translate(${width/2 - 40}, ${height/2 + 50})">
            <rect x="0" y="0" width="80" height="35" rx="18" fill="${buttonColor}" opacity="0.8"/>
            <text x="40" y="23" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="14" font-weight="bold">
                Refresh
            </text>
        </g>
    `;

    const container = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    container.setAttribute('width', '100%');
    container.setAttribute('height', '100%');
    container.setAttribute('viewBox', `0 0 ${width} ${height}`);
    container.innerHTML = svg;

    // Add refresh functionality
    const refreshButton = container.querySelector('.refresh-button');
    if (refreshButton && onRefresh) {
        refreshButton.addEventListener('click', onRefresh);
    }

    return container;
}

// Lazy loading implementation for text feed
function attachTextFeedLazyLoading() {
    const lazyImages = document.querySelectorAll('image[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const image = entry.target;
                image.setAttribute('href', image.getAttribute('data-src'));
                image.removeAttribute('data-src');
                observer.unobserve(image);
            }
        });
    }, {
        rootMargin: '500px 0px',
        threshold: 0.01
    });

    lazyImages.forEach(img => {
        imageObserver.observe(img);
    });
}

// Export functions for use in different environments
if (typeof module !== 'undefined' && module.exports) {
    // Node.js environment
    module.exports = {
        createTextRow,
        createTextPost,
        createBlogPost,
        createTextFeedEmptyState,
        attachTextFeedLazyLoading
    };
} else if (typeof window !== 'undefined') {
    // Browser environment - attach to window for global access
    window.TextFeed = {
        createTextRow,
        createTextPost,
        createBlogPost,
        createTextFeedEmptyState,
        attachTextFeedLazyLoading
    };
}