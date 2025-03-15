import animations from '../animations.js';

function getEmptyState(onClick) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500">
  <!-- Definitions for gradients and filters -->
  <defs>
    <!-- Silver gradient for sign -->
    <linearGradient id="signGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="lightgray" />
      <stop offset="50%" stop-color="silver" />
      <stop offset="100%" stop-color="darkgray" />
    </linearGradient>
    
    <!-- Purple to green text gradient -->
    <linearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="purple" />
      <stop offset="50%" stop-color="blue" />
      <stop offset="100%" stop-color="green" />
    </linearGradient>
    
    <!-- Button gradient -->
    <linearGradient id="buttonGradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="purple" />
      <stop offset="100%" stop-color="darkslateblue" />
    </linearGradient>
    
    <!-- Shadow filter -->
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="4" dy="4" stdDeviation="5" flood-opacity="0.3" />
    </filter>
    
    <!-- Glow filter for text -->
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="2" result="blur" />
      <feFlood flood-color="purple" flood-opacity="0.7" result="glow-color" />
      <feComposite in="glow-color" in2="blur" operator="in" result="glow-blur" />
      <feMerge>
        <feMergeNode in="glow-blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>
  
  <!-- No background -->
  
  <!-- Sign post pole -->
  <rect x="390" y="200" width="20" height="250" fill="sienna" />
  <rect x="385" y="200" width="30" height="20" fill="saddlebrown" />
  
  <!-- Ground base -->
  <ellipse cx="400" cy="450" rx="100" ry="20" fill="slategray" opacity="0.6" />
  
  <!-- Sign board -->
  <g transform="translate(400, 170) rotate(-5)">
    <rect x="-200" y="-60" width="400" height="120" rx="10" ry="10" fill="url(#signGradient)" stroke="gray" stroke-width="2" filter="url(#shadow)" />
    
    <!-- Sign text with gradient -->
    <text x="0" y="0" font-family="Arial, sans-serif" font-size="28" font-weight="bold" fill="url(#textGradient)" text-anchor="middle" filter="url(#glow)">
      Doesn't seem to be
    </text>
    <text x="0" y="40" font-family="Arial, sans-serif" font-size="28" font-weight="bold" fill="url(#textGradient)" text-anchor="middle" filter="url(#glow)">
      anything here.
    </text>
  </g>
  
  <!-- Button -->
  <g transform="translate(400, 300)">
    <rect id="button" x="-100" y="-25" width="200" height="50" rx="25" ry="25" fill="url(#buttonGradient)" filter="url(#shadow)" />
    <text x="0" y="8" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="white" text-anchor="middle">
      check again
    </text>
    <path d="M-75,0 a5,5 0 1,0 10,0 a5,5 0 1,0 -10,0 M-65,-5 L-60,0 L-65,5" fill="none" stroke="white" stroke-width="2" />
  </g>
  
  <!-- Decorative elements -->
  <path d="M450,440 L470,380 L490,440" fill="none" stroke="sienna" stroke-width="3" />
  <path d="M330,440 L310,390 L290,440" fill="none" stroke="sienna" stroke-width="3" />
  <path d="M330,440 Q400,420 450,440" fill="none" stroke="slategray" stroke-width="2" stroke-dasharray="5,5" />

  `;

  const container = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  container.setAttribute('width', '500');
  container.setAttribute('height', '500');

  const newElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  newElement.setAttribute('viewBox', '0 0 800 500');
  newElement.innerHTML = svg;

  container.appendChild(newElement);

  container.addEventListener('click', (evt) => {
console.log('empty state clicked');
    onClick(evt);
  });

  return container;
}

export default getEmptyState;
