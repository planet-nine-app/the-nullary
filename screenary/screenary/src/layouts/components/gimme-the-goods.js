import animations from './animations.js';

console.log('importing gimme the goods');

const theGoodsSVG =  document.createElementNS("http://www.w3.org/2000/svg", "svg");
  theGoodsSVG.setAttribute('viewBox', '0 0 400 400');
  theGoodsSVG.setAttribute('x', '5%');
  theGoodsSVG.setAttribute('y', '45%');
  theGoodsSVG.setAttribute('width', '512');
  theGoodsSVG.setAttribute('height', '512');

  theGoodsSVG.innerHTML = 
  `<defs>
    <style>
      @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
      }
      @keyframes spreadAndGrow {
        from {
          transform: translate(0, 0) scale(1);
        }
        to {
          transform: translate(var(--tx), var(--ty)) scale(2);
        }
      }
      .hidden {
        opacity: 0;
      }
      .container {
        opacity: 1;
        transition: opacity 1s;
      }
      .circle {
        transition: transform 1s;
      }
      .animated .container {
        opacity: 0;
      }
      .animated .circle-1 {
        transform: translate(-100px, -100px) scale(2);
      }
      .animated .circle-2 {
        transform: translate(100px, -100px) scale(2);
      }
      .animated .circle-3 {
        transform: translate(0, 100px) scale(2);
      }
    </style>
  </defs>

  <!-- Main group for animation -->
  <g id="main-group">
    <!-- Rounded square background -->
    <rect class="container" x="100" y="100" width="200" height="200" rx="20" ry="20" 
          fill="#e0e0e0" stroke="#333" stroke-width="2" id="the-goods-background"/>
    
    <!-- Three circles with placeholder content -->
    <g class="circle circle-1" id="lexary">
      <circle cx="160" cy="160" r="30" fill="#ff9999"/>
      <text x="160" y="165" text-anchor="middle" fill="#333">SVG 1</text>
    </g>
    
    <g class="circle circle-2" id="photary">
      <circle cx="240" cy="160" r="30" fill="#99ff99"/>
      <text x="240" y="165" text-anchor="middle" fill="#333">SVG 2</text>
    </g>
    
    <g class="circle circle-3" id="viewary">
      <circle cx="200" cy="220" r="30" fill="#9999ff"/>
      <text x="200" y="225" text-anchor="middle" fill="#333">SVG 3</text>
    </g>
  </g>
`;

const theGoods = {
  svg: theGoodsSVG,
  rect: {
    x: "5%",
    y: "45%",
    width: "10%",
    height: "10%"
  },
};

let expanded = false;

function triggerAnimation() {
  const mainGroup = document.getElementById('main-group');
  mainGroup.classList.toggle('animated');

  expanded = !expanded;
}



const gimmeTheGoods = (position) => {
  const animation = animations.fromTo(theGoods.svg, theGoods.rect, position, 500, () => {
    console.log('animation ended');
  });    
};

let viewary;
let photary;
let lexary;

gimmeTheGoods.addSelections = (_viewary, _photary, _lexary) => {
  viewary = _viewary;
  photary = _photary;
  lexary = _lexary;
};

gimmeTheGoods.attach = (container) => {
console.log('appending');
  container.appendChild(theGoods.svg);
console.log('should have attached');

  document.getElementById('viewary', () => {
    expanded && viewary();
  });
  document.getElementById('photary', () => {
    expanded && viewary();
  });
  document.getElementById('lexary', () => {
    expanded && viewary();
  });

  document.getElementById('the-goods-background').addEventListener('click', triggerAnimation);
};

console.log('exporting gimme the goods');

export default gimmeTheGoods;
