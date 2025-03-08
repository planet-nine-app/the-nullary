import gestures from './input/gestures.js';
import getTeleportal from './layouts/components/svgs/telepotal.js';

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

function createProductElement(product) {
  const div = document.createElement('div');
  div.classList.add('post-cell');
  div.classList.add('horizontal-post');

  const productContainer = document.createElement('div');
  productContainer.classList.add('post-container');

  const teleported = constructTeleported(product);
  const teleportal = getTeleportal(teleported, (evt) => {
    console.log('product ${product.uuid} clicked');
  });

  productContainer.appendChild(teleportal);
  
  div.appendChild(productContainer);

  return div;
};
