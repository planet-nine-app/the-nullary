import loadingIndicator from './loading-indicator.js';

function getImageSelector(images) {
  const svg = `<rect x="50" y="120" width="500" height="300" rx="12" fill="#252529" stroke="#444" stroke-width="1"/>
    
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
  </g>`;

  const container = document.createElementNS("http://www.w3.org/2000/svg", "svg");

  const newElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  newElement.setAttribute('viewBox', '0 0 600 500');
  newElement.innerHTML = svg;

  // handle gestures here  

  container.appendChild(newElement);

  return container;
};

export default getImageSelector;
