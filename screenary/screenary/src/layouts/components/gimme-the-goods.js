import animations from './animations.js';

console.log('importing gimme the goods');

const theGoodsSVG =  document.createElementNS("http://www.w3.org/2000/svg", "svg");
  theGoodsSVG.setAttribute('viewBox', '0 0 400 400');
  theGoodsSVG.setAttribute('x', '5%');
  theGoodsSVG.setAttribute('y', '45%');
  theGoodsSVG.setAttribute('width', '20%');
  theGoodsSVG.setAttribute('height', '20%');
  theGoodsSVG.setAttribute('style', 'background-color: green;');

  theGoodsSVG.innerHTML = 
  `<defs>
    </defs>

  <g id="main-group">
    <rect class="goods-container" x="0" y="0" width="100%" height="100%" rx="20" ry="20" 
          fill="#e0e0e0" stroke="#333" stroke-width="2" id="the-goods-background"/>
    
    <g id="lexary">
      <circle id="circle1" cx="160" cy="160" r="30" fill="orange">
      </circle>
      <text id="text1" x="160" y="165" text-anchor="middle" fill="#333">lex</text>
    </g>
    
    <g id="photary">
      <circle id="circle2" cx="240" cy="160" r="30" fill="cyan">
      </circle>
      <text id="text2" x="240" y="165" text-anchor="middle" fill="#333">pics</text>
    </g>
    
    <g id="viewary">
      <circle id="circle3" cx="200" cy="220" r="30" fill="pink">
      </circle>
      <text id="text3" x="200" y="225" text-anchor="middle" fill="#333">videos</text>
    </g>
  </g>
`;

const theGoods = {
  svg: theGoodsSVG,
  rect: {x: 0, y: 0, width: 0, height: 0}
};

let expanded = false;

const smallCircle = {width: 60, height: 60};
const bigCircle = {width: 120, height: 120};

const circle1position1 = {x: 130, y: 130, ...smallCircle};
const circle1position2 = {x: 90, y: 230, ...bigCircle};

const circle2position1 = {x: 210, y: 130, ...smallCircle};
const circle2position2 = {x: 210, y: 230, ...bigCircle};

const circle3position1 = {x: 130, y: 210, ...smallCircle};
const circle3position2 = {x: 290, y: 230, ...bigCircle};

const text1position1 = {x: 130, y: 130};
const text1position2 = {x: 90, y: 245};

const text2position1 = {x: 210, y: 130};
const text2position2 = {x: 210, y: 245};

const text3position1 = {x: 130, y: 210};
const text3position2 = {x: 290, y: 245};



function triggerAnimation() {
//  const mainGroup = document.getElementById('main-group');
//  mainGroup.classList.toggle('animated');
  
  expanded = !expanded;

  const fadeOut = animations.fade(expanded ? 1 : 0, expanded ? 0 : 1, 500);
console.log(fadeOut);
  document.getElementById('the-goods-background').appendChild(fadeOut);

  const circle1 = document.getElementById('circle1');
console.log('circle1', circle1);
  const circle2 = document.getElementById('circle2');
  const circle3 = document.getElementById('circle3');

  const text1 = document.getElementById('text1');
  const text2 = document.getElementById('text2');
  const text3 = document.getElementById('text3');

  const from1 = expanded ? circle1position1 : circle1position2;
  const to1 = expanded ? circle1position2 : circle1position1;
  const from2 = expanded ? circle2position1 : circle2position2;
  const to2 = expanded ? circle2position2 : circle2position1;
  const from3 = expanded ? circle3position1 : circle3position2;
  const to3 = expanded ? circle3position2 : circle3position1;

  const from4 = expanded ? text1position1 : text1position2;
  const to4 = expanded ? text1position2 : text1position1;
  const from5 = expanded ? text2position1 : text2position2;
  const to5 = expanded ? text2position2 : text2position1;
  const from6 = expanded ? text3position1 : text3position2;
  const to6 = expanded ? text3position2 : text3position1;

  let move1, move2, move3, move4, move5, move6;

  move1 = animations.fromToSVG(circle1, from1, to1, 200, true);
  move2 = animations.fromToSVG(circle2, from2, to2, 200, true);
  move3 = animations.fromToSVG(circle3, from3, to3, 200, true);

  move4 = animations.fromToSVG(text1, from4, to4, 200, false);
  move5 = animations.fromToSVG(text2, from5, to5, 200, false);
  move6 = animations.fromToSVG(text3, from6, to6, 200, false);

console.log('move1', move1);

  move1.map(animation => {
    circle1.appendChild(animation);
    animation.beginElement();
  });
  move2.map(animation => {
    circle2.appendChild(animation);
    animation.beginElement();
  });
  move3.map(animation => {
    circle3.appendChild(animation);
    animation.beginElement();
  });

console.log(move4);

  move4.map(animation => {
    text1.appendChild(animation);
    animation.beginElement();
  });
  move5.map(animation => {
    text2.appendChild(animation);
    animation.beginElement();
  });
  move6.map(animation => {
    text3.appendChild(animation);
    animation.beginElement();
  });

  console.log('should be animating');
};

const gimmeTheGoods = (position) => {
console.log('should reposition the goods');
  const animationSet = animations.fromToSVG(theGoods.svg, theGoods.rect, position, 500, false);

  if(expanded) {
    triggerAnimation();
  } 

  animationSet.map(animation => {
    theGoods.svg.appendChild(animation);
    animation.beginElement();
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

gimmeTheGoods.attach = (container, startingRect) => {

  theGoods.rect = startingRect;

console.log('appending');
  container.appendChild(theGoods.svg);
console.log('should have attached');

  document.getElementById('viewary').addEventListener('click', () => {
console.log('viewary clicked');
    if(expanded) {
      viewary();
    } else {
      triggerAnimation();
    }
  });
  document.getElementById('photary').addEventListener('click', () => {
console.log('photary clicked');
    if(expanded) {
      photary();
    } else {
      triggerAnimation();
    }
  });
  document.getElementById('lexary').addEventListener('click', () => {
console.log('lexary clicked');
    if(expanded) {
      lexary();
    } else {
      triggerAnimation();
    } 
  });

  document.getElementById('the-goods-background').addEventListener('click', () => {
console.log('background tapped');
    triggerAnimation();
  });
};

console.log('exporting gimme the goods');

export default gimmeTheGoods;
