function getBaseRow(title, description, soma, actionCallback) {

  const line1 = `lexary: ${soma.lexary ? 'tags: ' + soma.lexary.join(', ') : 'N/A'}`;
  const line2 = `photary: ${soma.photary ? 'tags: ' + soma.photary.join(', ') : 'N/A'}`;
  const line3 = `viewary: ${soma.viewary ? 'tags: ' + soma.viewary.join(', ') : 'N/A'}`;

  const svg = `<!-- Dark Background for the entire SVG -->
    <rect width="500" height="300" fill="#1c1c20"/>
    <!-- Collapsed State -->
    <g id="collapsed-state">
      <!-- Metallic Background Gradient -->
      <linearGradient id="metallicBackground" x1="0%" y1="0%" x2="100%" y2="100%">
	<stop offset="0%" stop-color="#2a2a2e"/>
	<stop offset="50%" stop-color="#323236"/>
	<stop offset="100%" stop-color="#2a2a2e"/>
      </linearGradient>
      
      <!-- Row Background -->
      <rect x="10" y="10" width="480" height="60" rx="8" fill="url(#metallicBackground)" stroke="#444" stroke-width="1"/>
      
      <!-- Subtle Metallic Highlight -->
      <line x1="10" y1="12" x2="490" y2="12" stroke="#555" stroke-width="1" opacity="0.5"/>
      
      <!-- Title -->
      <text x="30" y="35" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#ffffff">${title}</text>
      
      <!-- Description -->
      <text x="30" y="55" font-family="Arial, sans-serif" font-size="14" fill="#bbbbbb">${description}</text>
      
      <!-- Expand Icon -->
      <path d="M30,80 L40,90 L50,80" stroke="#777777" stroke-width="2" fill="none" opacity="0"/>
      
      <!-- JOIN Button with Gradient -->
      <linearGradient id="buttonGradient" x1="0%" y1="0%" x2="100%" y2="0%">
	<stop offset="0%" stop-color="#3eda82"/>
	<stop offset="100%" stop-color="#9c42f5"/>
      </linearGradient>
      <rect id="actionButton" x="380" y="25" width="80" height="30" rx="15" fill="url(#buttonGradient)"/>
      <text x="420" y="45" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="white" text-anchor="middle">JOIN</text>
    </g>
    
    <!-- Expanded State -->
    <g id="expanded-state">
      <!-- Extended Row Background with Metallic Gradient -->
      <linearGradient id="expandedMetallic" x1="0%" y1="0%" x2="100%" y2="100%">
	<stop offset="0%" stop-color="#252529"/>
	<stop offset="50%" stop-color="#2d2d31"/>
	<stop offset="100%" stop-color="#252529"/>
      </linearGradient>
      <rect id="expandedPart" x="10" y="80" width="480" height="0" rx="8" fill="url(#expandedMetallic)" stroke="#444" stroke-width="1" opacity="0.9"/>
      
      <!-- Subtle Edge Highlights -->
      <line x1="12" y1="82" x2="488" y2="82" stroke="#555" stroke-width="1" opacity="0.3"/>
      
      <!-- Expanded Content - Three Rows of Text -->
      <text x="30" y="110" font-family="Arial, sans-serif" font-size="14" fill="#ffffff">${line1}</text>
      <text x="30" y="140" font-family="Arial, sans-serif" font-size="14" fill="#ffffff">${line2}</text>
      <text x="30" y="170" font-family="Arial, sans-serif" font-size="14" fill="#ffffff">${line3}</text>
      
      <!-- Collapse Icon -->
      <path d="M30,80 L40,70 L50,80" stroke="#777777" stroke-width="2" fill="none"/>
    </g>
    
    <!-- Animation Indicator (Not functional in static SVG) -->
    <text x="250" y="275" font-family="Arial, sans-serif" font-size="12" fill="#bbbbbb" text-anchor="middle">* Tap to expand/collapse (animation shown in static form)</text>
    
    <!-- Divider Line showing separation -->
    <line x1="10" y1="80" x2="490" y2="80" stroke="#555555" stroke-width="1" stroke-dasharray="5,3"/>`;

  const newElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  newElement.setAttribute('viewBox', '0 0 600 300');
  newElement.innerHTML = svg;

  let isExpanded = false;

  newElement.addEventListener('click', () => {
    isExpanded = !isExpanded;

    const animation = document.createElementNS("http://www.w3.org/2000/svg", "animate");
      animation.setAttribute("attributeName", "height");
      animation.setAttribute("from", isExpanded ? 0 : 180);
      animation.setAttribute("to", isExpanded ? 180 : 0);
      animation.setAttribute("dur", `200ms`);
      animation.setAttribute("begin", `1ms`);  
      animation.setAttribute("repeatCount", "0");
      animation.setAttribute("fill", "freeze");

    const expandedPart = newElement.getElementById('expandedPart');
    expandedPart.appendChild(animation);
    animation.beginElement();
  });

  newElement.getElementById('actionButton').addEventListener('click', () => {
    console.log('handle joining here');
  });

  return newElement;
};

export default getBaseRow;
