import animations from '../animations.js';

function getTeleportal(product, teleported, onClick) {

  const formattedPrice = `$${(product.price / 100).toFixed(2)}`;

  const svg = `
    <!-- Definitions for gradients and filters -->
    <defs>
      <!-- Radial gradient for the portal's glow effect -->
      <radialGradient id="portalGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
	<stop offset="0%" stop-color="#9900ff" />
	<stop offset="70%" stop-color="#00ff99" />
	<stop offset="100%" stop-color="#00ff99" stop-opacity="0" />
      </radialGradient>
      
      <!-- Linear gradient for the teleporting object -->
      <linearGradient id="objectGradient" x1="0%" y1="0%" x2="100%" y2="100%">
	<stop offset="0%" stop-color="#9900ff" />
	<stop offset="100%" stop-color="#00ff99" />
      </linearGradient>
      
      <!-- Mask for the fade-out effect -->
      <mask id="fadeMask">
	<radialGradient id="fadeGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
	  <stop offset="0%" stop-color="white" stop-opacity="1" />
	  <stop offset="70%" stop-color="white" stop-opacity="0.7" />
	  <stop offset="100%" stop-color="white" stop-opacity="0" />
	</radialGradient>
	<circle cx="200" cy="200" r="120" fill="url(#fadeGradient)" />
      </mask>
      
      <!-- Filter for the glow effect -->
      <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
	<feGaussianBlur stdDeviation="10" result="blur" />
	<feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    
    <!-- Background -->
    <rect width="400" height="400" fill="#121212" />

    <text x="50%" y="32" width="400" height="24" fill="#eeeeee" text-anchor="middle">${product.title}</text>
    <text x="50%" y="56" width="400" height="24" fill="#eeeeee" text-anchor="middle">${formattedPrice}</text>
    
    <!-- Portal outer glow -->
    <circle cx="200" cy="200" r="150" fill="url(#portalGradient)" filter="url(#glow)" opacity="0.7" />
    
    <!-- Portal inner ring -->
    <circle cx="200" cy="200" r="120" fill="none" stroke="#00ffcc" stroke-width="3" stroke-opacity="0.8" />
    
    <!-- Energy particles around the portal -->
    <g>
      <circle cx="140" cy="150" r="3" fill="#9900ff" />
      <circle cx="250" cy="120" r="2" fill="#00ff99" />
      <circle cx="270" cy="230" r="4" fill="#9900ff" />
      <circle cx="150" cy="260" r="3" fill="#00ff99" />
      <circle cx="200" cy="130" r="2" fill="#9900ff" />
      <circle cx="180" cy="270" r="3" fill="#00ff99" />
    </g>
    
    <!-- Teleporting object -->
    <g mask="url(#fadeMask)">
      <!-- You can replace this with any shape or image -->
      ${teleported}
    </g>
    
    <!-- Inner portal energy -->
    <circle cx="200" cy="200" r="50" fill="url(#portalGradient)" opacity="0.5">
      <animate attributeName="r" values="40;50;45;50;40" dur="4s" repeatCount="indefinite" />
      <animate attributeName="opacity" values="0.3;0.5;0.3" dur="4s" repeatCount="indefinite" />
    </circle>`;

  const container = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  container.setAttribute('width', '400');
  container.setAttribute('height', '400');

  const newElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  newElement.setAttribute('viewBox', '0 0 400 400');
  newElement.innerHTML = svg;

  container.appendChild(newElement);

  container.addEventListener('click', (evt) => {
console.log('teleportal clicked');
    onClick(evt);
  });

  return container;
}

export default getTeleportal;
