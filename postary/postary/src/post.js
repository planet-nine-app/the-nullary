// Simplified - just update your existing createPostElement function
function createPostElement(post) {
  const title = post.title || 'Untitled Post';
  const description = post.description || '';
  const thumbnailUrl = post.images && post.images.length > 0 ? post.images[0] : null;
  const rowHeight = 120;
  const padding = 16;
  const imageSize = 80;

  const postContainer = document.createElement('div');
  postContainer.classList.add('post-container');
  postContainer.style.margin = '8px 0';
  postContainer.style.width = '100%';
  postContainer.style.height = rowHeight + 'px';

  // Create the SVG row directly
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', rowHeight);
  svg.setAttribute('viewBox', `0 0 400 ${rowHeight}`);
  svg.style.backgroundColor = '#1a1a1a';
  svg.style.borderRadius = '8px';
  svg.style.border = '1px solid #333';
  svg.style.cursor = 'pointer';
  svg.style.transition = 'all 0.2s ease';

  // Background
  const background = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  background.setAttribute('x', '0');
  background.setAttribute('y', '0');
  background.setAttribute('width', '100%');
  background.setAttribute('height', '100%');
  background.setAttribute('fill', '#1a1a1a');
  background.setAttribute('rx', '8');
  svg.appendChild(background);

  // Calculate text positioning
  const textStartX = padding;
  const textWidth = thumbnailUrl ? 400 - imageSize - (padding * 3) : 400 - (padding * 2);
  const imageStartX = thumbnailUrl ? 400 - imageSize - padding : 0;

  // Title
  const titleText = document.createElementNS("http://www.w3.org/2000/svg", "text");
  titleText.setAttribute('x', textStartX);
  titleText.setAttribute('y', padding + 20);
  titleText.setAttribute('fill', '#ffffff');
  titleText.setAttribute('font-family', 'Arial, sans-serif');
  titleText.setAttribute('font-size', '18');
  titleText.setAttribute('font-weight', 'bold');
  titleText.textContent = title;
  svg.appendChild(titleText);

  // Description with wrapping
  if (description) {
    const words = description.split(' ');
    const maxCharsPerLine = Math.floor(textWidth / 8);
    let lines = [];
    let currentLine = '';

    words.forEach(word => {
      if ((currentLine + word).length <= maxCharsPerLine) {
        currentLine += (currentLine ? ' ' : '') + word;
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    });
    if (currentLine) lines.push(currentLine);

    lines.slice(0, 3).forEach((line, index) => {
      const descText = document.createElementNS("http://www.w3.org/2000/svg", "text");
      descText.setAttribute('x', textStartX);
      descText.setAttribute('y', padding + 45 + (index * 16));
      descText.setAttribute('fill', '#cccccc');
      descText.setAttribute('font-family', 'Arial, sans-serif');
      descText.setAttribute('font-size', '14');
      descText.textContent = line;
      svg.appendChild(descText);
    });
  }

  // Thumbnail if available
  if (thumbnailUrl) {
    const imageContainer = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    imageContainer.setAttribute('x', imageStartX);
    imageContainer.setAttribute('y', padding);
    imageContainer.setAttribute('width', imageSize);
    imageContainer.setAttribute('height', imageSize);
    imageContainer.setAttribute('fill', '#333');
    imageContainer.setAttribute('rx', '6');
    svg.appendChild(imageContainer);

    const image = document.createElementNS("http://www.w3.org/2000/svg", "image");
    image.setAttribute('x', imageStartX);
    image.setAttribute('y', padding);
    image.setAttribute('width', imageSize);
    image.setAttribute('height', imageSize);
    image.setAttribute('href', thumbnailUrl);
    image.setAttribute('preserveAspectRatio', 'xMidYMid slice');
    svg.appendChild(image);
  }

  // Hover effects
  svg.addEventListener('mouseenter', () => {
    background.setAttribute('fill', '#252525');
  });

  svg.addEventListener('mouseleave', () => {
    background.setAttribute('fill', '#1a1a1a');
  });

  postContainer.appendChild(svg);
  return postContainer;
}

// Updated mock data with better examples
const mockPosts = [
  {
    uuid: '1',
    title: 'Amazing Discovery in Deep Space',
    description: 'Scientists have discovered a new exoplanet that could potentially harbor life. The planet, located 120 light-years away, shows signs of water vapor in its atmosphere.',
    images: ['https://cdn.bsky.app/img/feed_thumbnail/plain/did:plc:wwdgpsqzc5jeidoyupoyn6lg/bafkreienfrv6xyd4zgj2egqtxikdjl3aycaxgkwkoup6wtvhzgtfxlx45m@jpg'],
    isVertical: true
  },
  {
    uuid: '2',
    title: 'The Future of AI Development',
    description: 'Exploring the latest trends in artificial intelligence and machine learning. How these technologies will shape our world in the coming decade.',
    images: ['https://wallpapercave.com/wp/wp9329705.jpg'],
    isVertical: false,
    mediaType: 'image'
  },
  {
    uuid: '3',
    title: 'Climate Change Solutions',
    description: 'New renewable energy technologies are making significant strides in the fight against climate change. Solar and wind power efficiency has increased dramatically.',
    isVertical: false,
    mediaType: 'image'
  },
  {
    uuid: '4',
    title: 'Breaking News Update',
    description: 'This is a shorter description to test the layout with varying content lengths.',
    images: ['https://cdn.bsky.app/img/feed_thumbnail/plain/did:plc:wwdgpsqzc5jeidoyupoyn6lg/bafkreienfrv6xyd4zgj2egqtxikdjl3aycaxgkwkoup6wtvhzgtfxlx45m@jpg']
  }
];

// CSS to add to your styles.css
const additionalCSS = `
.post-container {
  background: #1a1a1a;
  border-radius: 8px;
  margin: 8px 0;
  transition: transform 0.2s ease;
}

.post-container:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.feed-container {
  padding: 16px;
  max-width: 600px;
  margin: 0 auto;
}

.post-cell {
  margin-bottom: 12px;
}
`;

// Export just what you need
export default createPostElement;
