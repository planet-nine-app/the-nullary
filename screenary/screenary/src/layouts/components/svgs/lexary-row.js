function getLexaryRow(text, images) {
  // TODO handle links and MAGIC here

  const svg = `<!-- Dark Background -->
    <rect width="600" height="500" fill="#1c1c20"/>
    
    <!-- Title Text Area -->
    <rect x="50" y="30" width="500" height="70" rx="8" fill="#252529"/>
    <text x="300" y="65" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="#ffffff" text-anchor="middle">Product Showcase</text>
    <text x="300" y="90" font-family="Arial, sans-serif" font-size="16" fill="#bbbbbb" text-anchor="middle">Swipe through our latest collection</text>
    
    <!-- Image Display Area -->
    <rect x="50" y="120" width="500" height="300" rx="12" fill="#252529" stroke="#444" stroke-width="1"/>
    
    <!-- Placeholder for "Current" Image (Image 2 of 4) -->
    <g>
      <!-- Image Frame with gradient border effect -->
      <linearGradient id="frameGradient" x1="0%" y1="0%" x2="100%" y2="100%">
	<stop offset="0%" stop-color="#3eda82"/>
	<stop offset="50%" stop-color="#6a62d8"/>
	<stop offset="100%" stop-color="#9c42f5"/>
      </linearGradient>
      ${images ? `<rect x="75" y="145" width="450" height="250" rx="8" stroke="url(#frameGradient)" stroke-width="2" fill="#323236">
        <image src="${images[0]}"/>` : ''}
      </rect>
    </g>
    
    <!-- Navigation Arrows -->
    <!-- Left Arrow (Previous) -->
    <g class="nav-arrow prev">
      <!-- Arrow button circle -->
      <circle cx="75" cy="270" r="25" fill="#252529" stroke="#444" stroke-width="1" opacity="0.8"/>
      <!-- Arrow icon -->
      <path d="M85,270 L65,270 M75,260 L65,270 L75,280" stroke="#ffffff" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    </g>
    
    <!-- Right Arrow (Next) -->
    <g class="nav-arrow next">
      <!-- Arrow button circle -->
      <circle cx="525" cy="270" r="25" fill="#252529" stroke="#444" stroke-width="1" opacity="0.8"/>
      <!-- Arrow icon -->
      <path d="M515,270 L535,270 M525,260 L535,270 L525,280" stroke="#ffffff" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    </g>
    
    <!-- Navigation Dots -->
    <g class="nav-dots" transform="translate(300, 440)">
      <!-- Dot 1 -->
      <circle cx="-60" cy="0" r="8" fill="#555555"/>
      
      <!-- Dot 2 (Current - Glowing) -->
      <circle cx="-20" cy="0" r="8" fill="#3eda82"/>
      <!-- Glow effect for current dot -->
      <circle cx="-20" cy="0" r="12" fill="none" stroke="#3eda82" stroke-width="2" opacity="0.5">
	<animate attributeName="r" values="12;16;12" dur="2s" repeatCount="indefinite"/>
	<animate attributeName="opacity" values="0.5;0.2;0.5" dur="2s" repeatCount="indefinite"/>
      </circle>
      
      <!-- Dot 3 -->
      <circle cx="20" cy="0" r="8" fill="#555555"/>
      
      <!-- Dot 4 -->
      <circle cx="60" cy="0" r="8" fill="#555555"/>
    </g>
    
    <!-- Swipe Gesture Indicator (subtle hint) -->
    <g opacity="0.4">
      <path d="M280,270 C310,260 330,260 360,270" stroke="#ffffff" stroke-width="2" stroke-dasharray="4,4" fill="none">
	<animate attributeName="opacity" values="0.4;0.1;0.4" dur="3s" repeatCount="indefinite"/>
      </path>
      <path d="M350,265 L360,270 L350,275" stroke="#ffffff" stroke-width="2" fill="none"/>
    </g>
    
    <!-- Caption for current image -->
    <rect x="150" y="405" width="300" height="25" rx="4" fill="#252529" opacity="0.7"/>
    <text x="300" y="422" font-family="Arial, sans-serif" font-size="14" fill="#ffffff" text-anchor="middle">Modern Design Collection (2/4)</text>`;

  function showPreviousImage() {
    console.log('previous image');
  };

  function showNextImage() {
    console.log('next image');
  };

  const container = document.createElementNS("http://www.w3.org/2000/svg", "svg");

  const newElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  newElement.setAttribute('viewBox', '0 0 600 500');
  newElement.innerHTML = svg;

  newElement.addEventListener('DOMContentLoaded', () => {
console.log('dom content is loaded');
    let currentIndex = 0;
    const imageContainer = newElement.querySelector('.image-container');
    let touchStartX = 0;

    imageContainer.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    });
    
    imageContainer.addEventListener('touchend', (e) => {
      const touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;
      
      if (diff > 50) { 
	showNextImage();
      } else if (diff < -50) { 
	showPrevImage();
      }
    });

    newElement.querySelector('.prev').addEventListener('click', showPrevImage);
    newElement.querySelector('.next').addEventListener('click', showNextImage);
  });

  container.appendChild(newElement);

  return container;
};

export default getLexaryRow;
