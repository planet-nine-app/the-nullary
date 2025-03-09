import gestures from './input/gestures.js';
import getTeleportal from './layouts/components/svgs/teleportal.js';
import animations from './layouts/components/animations.js';

const mockProducts = [
  {
    uuid: '1',
    images: ['./'],
    price: 500
  },
  {
    uuid: '2',
    images: ['./'],
    price: 600
  },
  {
    uuid: '3',
    images: ['./'],
    price: 700
  }
];

function constructTeleported(product) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 350">
    <!-- Background rectangle (optional) -->
    <rect width="300" height="350" fill="#f8f8f8" />
    
    <!-- Image container with aspect ratio preservation -->
    <svg x="50" y="25" width="200" height="200" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
      <!-- Placeholder image - you can replace this with your own image content -->
      <rect width="100" height="100" fill="#3498db" />
      
      <!-- Example content inside the image -->
      <circle cx="50" cy="50" r="30" fill="#e74c3c" />
      <rect x="35" y="35" width="30" height="30" fill="#2ecc71" />
      <polygon points="50,20 65,35 35,35" fill="#f1c40f" />
    </svg>
    
    <!-- Text below the image -->
    <text x="150" y="260" font-family="Arial, sans-serif" font-size="18" text-anchor="middle" fill="#333">
      Square Image with Preserved Aspect Ratio
    </text>
    
    <!-- Subtitle or additional text -->
    <text x="150" y="290" font-family="Arial, sans-serif" font-size="14" text-anchor="middle" fill="#666">
      This image will maintain its proportions
    </text>
  </svg>`;

  return svg;
};

function createProductElement(product, onClick) {
  const div = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    div.setAttribute('width', '400');
    div.setAttribute('height', '400');
    div.setAttribute('class', 'teleportal');
//    div.setAttribute('style', 'position: relative;');
//  div.classList.add('post-cell');
//  div.classList.add('horizontal-post');

  const productContainer = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  productContainer.classList.add('post-container');

  const teleported = constructTeleported(product);
  const teleportal = getTeleportal(teleported, onClick);

  productContainer.appendChild(teleportal);
  
  div.appendChild(productContainer);

  return div;
};

function teleportEmIn() {
  const container = document.getElementById('container');
  container.classList.add('lexary-container');
  container.classList.remove('container');
  let x = 600;
  let y = 20;
  mockProducts.forEach((product) => {
    const divsY = y;
    const div = createProductElement(product, (evt) => {
console.log('product clicked', product);
      Array.from(container.children).forEach(elem => {
        if(elem === div) {
          const rect = {x: `${x}`, y: `${divsY}`, width: 400, height: 400};
          const fromToAnimations = animations.fromToSVG(elem, rect, {x: 600, y: 50, width: rect.width, height: rect.height}, 250, false);
console.log('fromToAnimations', fromToAnimations);
          fromToAnimations.forEach($ => {
            div.appendChild($);
            $.beginElement();
          });
        } else {
          if(Array.from(elem.classList).indexOf('teleportal') !== -1) {
	    const fadeOut = animations.fade(1, 0, 250);
	    elem.appendChild(fadeOut);
	    fadeOut.beginElement();
          }
        }
      });
    });
    div.setAttribute('x', `${x}`);
    div.setAttribute('y', `${y}`);
    y += 420;
    container.appendChild(div);
  });

  container.setAttribute('viewBox', `0 0 1600 ${y + 20}`);
};

export default teleportEmIn;
