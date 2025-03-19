import animations from '../animations.js';
import getSpaceship from './spaceship.js';

const SLIDE_DURATION = 150;
let firstTime = true;

function expand(planetNine, spaceship, container, stars) {
  const animationSet = animations.fromToSVG(planetNine, {x: 30, y: 30, width: 35, height: 35}, {x: 45, y: 100, width: 70, height: 70}, SLIDE_DURATION, true); 

console.log('animationSet', animationSet);
  animationSet.map(animation => {
    planetNine.appendChild(animation);
    animation.beginElement();
  });

  const animationSpaceshipSet = animations.fromToSVG(planetNine, {x: 75, y: 75, width: 200, height: 80}, {x: 275, y: 95, width: 225, height: 100}, SLIDE_DURATION, false);

console.log('animationSpaceshipSet', animationSpaceshipSet);
  animationSpaceshipSet.map(animation => {
    spaceship.appendChild(animation);
    animation.beginElement();
  });

  const slideSet = animations.fromToSVG(container, {x: '85%', y: '5%', width: '300', height: '200'}, {x: '55%', y: '5%', width: '400', height: '200'}, SLIDE_DURATION, false, () => {
    console.log('should\'ve animated');
  });    
console.log('slideSet', slideSet);
  slideSet.map(animation => {
    container.appendChild(animation);
    animation.beginElement();
  });

  const starFadeOut = animations.fade(1, 0.4, SLIDE_DURATION);

  stars.appendChild(starFadeOut);
  starFadeOut.beginElement();

  const animate = document.createElementNS("http://www.w3.org/2000/svg", "animate");
  animate.setAttribute("attributeName", "y");
  animate.setAttribute("from", "0");
  animate.setAttribute("to", "50%");
  animate.setAttribute("dur", `200ms`);
  animate.setAttribute("begin", "1ms");
  animate.setAttribute("fill", "freeze");

  document.getElementById('fo').appendChild(animate);
  animate.beginElement();
};

function unexpand(planetNine, spaceship, container, stars) {
  const animationSet = animations.fromToSVG(planetNine, {x: 45, y: 100, width: 70, height: 70}, {x: 30, y: 30, width: 35, height: 35}, SLIDE_DURATION, true); 

console.log('animationSet', animationSet);
  animationSet.map(animation => {
    planetNine.appendChild(animation);
    animation.beginElement();
  });

  const animationSpaceshipSet = animations.fromToSVG(planetNine, {x: 275, y: 95, width: 225, height: 100}, {x: 75, y: 75, width: 200, height: 80}, SLIDE_DURATION, false);

console.log('animationSpaceshipSet', animationSpaceshipSet);
  animationSpaceshipSet.map(animation => {
    spaceship.appendChild(animation);
    animation.beginElement();
  });

  const slideSet = animations.fromToSVG(container, {x: '55%', y: '5%', width: '400', height: '200'}, {x: '85%', y: '5%', width: '300', height: '200'}, SLIDE_DURATION, false, () => {
    console.log('should\'ve animated');
  });
    
console.log('slideSet', slideSet);
  slideSet.map(animation => {
    container.appendChild(animation);
    animation.beginElement();
  });

  const starFadeOut = animations.fade(0.4, 1, SLIDE_DURATION);

  stars.appendChild(starFadeOut);
  starFadeOut.beginElement();

  const animate = document.createElementNS("http://www.w3.org/2000/svg", "animate");
  animate.setAttribute("attributeName", "y");
  animate.setAttribute("from", "50%");
  animate.setAttribute("to", "0");
  animate.setAttribute("dur", `200ms`);
  animate.setAttribute("begin", "1ms");
  animate.setAttribute("fill", "freeze");

  document.getElementById('fo').appendChild(animate);
  animate.beginElement();
};

function getPlanetNineLogo(teleport, pref) {
  const spaceship = getSpaceship(100, 100);
  let expanded = false;

  const svg = `<g id="stars"><rect x="0" y="0" width="100%" height="100%" fill="#100a12"></rect>
  <circle cx="47%" cy="11%" r="2" fill="#dedefd"></circle><circle cx="9%" cy="31%" r="4" fill="#fddefd"></circle><circle cx="84%" cy="29%" r="2" fill="#dedefd"></circle><circle cx="7%" cy="10%" r="4" fill="#dedefd"></circle><circle cx="43%" cy="99%" r="1" fill="#defdde"></circle><circle cx="70%" cy="79%" r="1" fill="#dedefd"></circle><circle cx="14%" cy="98%" r="3" fill="#dedefd"></circle><circle cx="8%" cy="98%" r="2" fill="#fddefd"></circle><circle cx="14%" cy="23%" r="3" fill="#defdde"></circle><circle cx="1%" cy="49%" r="1" fill="#defdde"></circle><circle cx="17%" cy="99%" r="4" fill="#fdfdde"></circle><circle cx="20%" cy="94%" r="1" fill="#fdfdde"></circle><circle cx="93%" cy="33%" r="1" fill="#dedefd"></circle><circle cx="63%" cy="17%" r="4" fill="#defdde"></circle><circle cx="89%" cy="68%" r="2" fill="#dedefd"></circle><circle cx="60%" cy="41%" r="4" fill="#fdfdde"></circle><circle cx="50%" cy="14%" r="2" fill="#dedefd"></circle><circle cx="86%" cy="59%" r="2" fill="#fddefd"></circle><circle cx="15%" cy="81%" r="3" fill="#defdde"></circle><circle cx="11%" cy="31%" r="4" fill="#fddede"></circle><circle cx="11%" cy="54%" r="2" fill="#fddede"></circle><circle cx="78%" cy="98%" r="1" fill="#fddefd"></circle><circle cx="92%" cy="7%" r="4" fill="#fddefd"></circle><circle cx="14%" cy="50%" r="2" fill="#fddede"></circle><circle cx="58%" cy="49%" r="2" fill="#defdde"></circle><circle cx="78%" cy="6%" r="3" fill="#fdfdde"></circle><circle cx="57%" cy="66%" r="1" fill="#dedefd"></circle><circle cx="29%" cy="47%" r="2" fill="#fdfdde"></circle><circle cx="53%" cy="92%" r="3" fill="#fddede"></circle><circle cx="82%" cy="89%" r="3" fill="#dedefd"></circle><circle cx="51%" cy="31%" r="3" fill="#dedefd"></circle><circle cx="79%" cy="91%" r="2" fill="#defdde"></circle><circle cx="33%" cy="41%" r="2" fill="#fddede"></circle><circle cx="47%" cy="75%" r="2" fill="#dedefd"></circle><circle cx="65%" cy="94%" r="3" fill="#fddede"></circle><circle cx="34%" cy="36%" r="3" fill="#defdde"></circle><circle cx="86%" cy="94%" r="2" fill="#fdfdde"></circle><circle cx="26%" cy="51%" r="2" fill="#fdfdde"></circle><circle cx="40%" cy="22%" r="3" fill="#defdde"></circle><circle cx="43%" cy="96%" r="3" fill="#fddede"></circle><circle cx="16%" cy="94%" r="2" fill="#fdfdde"></circle><circle cx="59%" cy="37%" r="4" fill="#fddefd"></circle><circle cx="4%" cy="42%" r="3" fill="#fdfdde"></circle><circle cx="64%" cy="83%" r="1" fill="#fddede"></circle><circle cx="79%" cy="42%" r="3" fill="#defdde"></circle><circle cx="47%" cy="46%" r="3" fill="#defdde"></circle><circle cx="75%" cy="36%" r="1" fill="#fdfdde"></circle><circle cx="48%" cy="73%" r="1" fill="#defdde"></circle><circle cx="42%" cy="37%" r="4" fill="#fdfdde"></circle><circle cx="70%" cy="72%" r="3" fill="#dedefd"></circle><circle cx="49%" cy="97%" r="1" fill="#defdde"></circle><circle cx="48%" cy="2%" r="2" fill="#fddede"></circle><circle cx="41%" cy="39%" r="2" fill="#fddefd"></circle><circle cx="11%" cy="94%" r="1" fill="#dedefd"></circle><circle cx="99%" cy="61%" r="3" fill="#fddefd"></circle><circle cx="93%" cy="69%" r="3" fill="#dedefd"></circle><circle cx="33%" cy="15%" r="1" fill="#fddede"></circle><circle cx="60%" cy="30%" r="3" fill="#fdfdde"></circle><circle cx="57%" cy="85%" r="1" fill="#dedefd"></circle><circle cx="0%" cy="75%" r="4" fill="#dedefd"></circle><circle cx="7%" cy="55%" r="4" fill="#fddede"></circle><circle cx="2%" cy="40%" r="2" fill="#defdde"></circle>

</g><defs>
  <radialGradient id="shine" cx="30%" cy="30%" r="70%" fx="30%" fy="30%">
    <stop offset="0%" style="stop-color:rgb(60,60,60);stop-opacity:1"></stop>
    <stop offset="100%" style="stop-color:rgb(0,0,0);stop-opacity:1"></stop>
  </radialGradient>
  <filter id="glow">
    <feGaussianBlur stdDeviation="2.5" result="coloredBlur"></feGaussianBlur>
    <feMerge>
      <feMergeNode in="coloredBlur"></feMergeNode>
      <feMergeNode in="SourceGraphic"></feMergeNode>
    </feMerge>
  </filter>
</defs>

<defs>
   
    <!-- Glow filter for the text -->
    <filter id="glow">
      <feGaussianBlur stdDeviation="2.5" result="coloredBlur"></feGaussianBlur>
      <feMerge>
        <feMergeNode in="coloredBlur"></feMergeNode>
        <feMergeNode in="SourceGraphic"></feMergeNode>
      </feMerge>
    </filter>
    
    <!-- Clip path to constrain the text within the circle -->
    <clipPath id="circleClip">
      <circle cx="35" cy="35" r="30"></circle>
    </clipPath>
  </defs>

<g>
  <circle id="planetNine" cx="35" cy="35" r="30" fill="url(#shine)">
  
    <g clip-path="url(#circleClip)">
      <text x="35" y="10" font-family="Arial, sans-serif" font-size="6" fill="#00ff00" text-anchor="middle" filter="url(#glow)">
	Planet
      </text>
      <text x="35" y="40" font-family="Arial, sans-serif" font-size="6" fill="#00ff00" text-anchor="middle" filter="url(#glow)">
	Nine
      </text>
    </g>
  </circle>

  ${spaceship}
</g>
<text x="50%" y="85%" text-anchor="middle" font-family="Arial" font-weight="bold" font-size="16" stroke="#fefefe" fill="#fefefe" text-decoration="none" opacity="1">
    A Planet Nine production
    
</text>`;

  const container = document.createElementNS("http://www.w3.org/2000/svg", "svg");
//  container.setAttribute('style', 'z-index: 15;');
//  container.setAttribute('x', '85%');
//  container.setAttribute('y', '5%');
//  container.setAttribute('width', '300');
//  container.setAttribute('height', '200');

  const newElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  newElement.setAttribute('viewBox', '0 0 600 300');
  newElement.innerHTML = svg;
 
  newElement.addEventListener('click', () => {
console.log('logo clicked');
    const planetNine = document.getElementById('planetNine');
    const spaceshipElem = document.getElementById('spaceship');
    const stars = document.getElementById('stars');

    expanded = !expanded;

    if(expanded) {
      expand(planetNine, spaceshipElem, container, stars);
    } else {
      unexpand(planetNine, spaceshipElem, container, stars);
    }

    if(firstTime) {
      firstTime = false;
      planetNine.addEventListener('click', (evt) => {
	if(expanded) {
	  console.log('planet clicked');
console.log(teleport ? 'teleport exists' : 'teleport does not exist');
          teleport();
	  evt.stopPropagation();
	  evt.preventDefault();
	}
      });

      spaceshipElem.addEventListener('click', (evt) => {
	if(expanded) {
	  console.log('spaceship clicked');
          pref();
	  evt.stopPropagation();
	  evt.preventDefault();
	}
      });
    }
  });

  container.appendChild(newElement);

  return container;
};

export default getPlanetNineLogo;
