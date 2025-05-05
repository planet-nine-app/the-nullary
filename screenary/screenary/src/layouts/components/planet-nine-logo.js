import getPlanetNineLogo from './svgs/planet-nine-logo.js';
import animations from './animations.js';

const planetNine = {
  rect: {x: 0, y: 0, width: 0, height: 0}
};

const findPlanetNine = (position) => {
  const animationSet = animations.fromToSVG(planetNine.svg, planetNine.rect, position, 500, false);

  animationSet.map(animation => {
    planetNine.svg.appendChild(animation);
    animation.beginElement();
  });
};

let teleport = () => {};
let pref = () => {};

findPlanetNine.addSelections = (_teleport, _pref) => {
  teleport = _teleport;
  pref = _pref;
};

findPlanetNine.attach = (container, startingRect) => {
  planetNine.svg = getPlanetNineLogo(teleport, pref);
//  planetNine.svg.style.pointerEvents = 'auto';
  planetNine.rect = startingRect;

  container.appendChild(planetNine.svg);
};

findPlanetNine.detach = (container) => {
  container.removeChild(planetNine.svg);
};

export default findPlanetNine;
