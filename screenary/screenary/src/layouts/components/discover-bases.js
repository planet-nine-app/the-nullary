import animations from './animations.js';

console.log('importing discover bases');

const discoverBasesSVG = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  discoverBasesSVG.setAttribute('viewBox', '0 0 400 400');
  discoverBasesSVG.setAttribute('x', '85%');
  discoverBasesSVG.setAttribute('y', '45%');
  discoverBasesSVG.setAttribute('width', '20%');
  discoverBasesSVG.setAttribute('height', '20%');
  discoverBasesSVG.setAttribute('style', 'background-color: green;');

discoverBasesSVG.innerHTML = `
  <rect width="100%" height="100%" fill="orange" id="discover-bases-container"/>
  <image x="5" y="5" width="190" height="90" opacity="1" href="./allyabase.jpg">
  </image>
  <text x="55" y="95" style="text-align: center;">allyabase are belong to us</text>
`;

const discoverBases = {
  svg: discoverBasesSVG,
  rect: {x: 0, y: 0, width: 0, height: 0}
};

let expanded = false;

const gimmeTheBases = (position) => {
console.log('should reposition the bases');
  const animationSet = animations.fromToSVG(discoverBases.svg, discoverBases.rect, position, 500, false);

  animationSet.map(animation => {
    discoverBases.svg.appendChild(animation);
    animation.beginElement();
  });
};

let discovery;

gimmeTheBases.addSelections = (_discovery) => {
  discovery = _discovery;
};

gimmeTheBases.attach = (container, startingRect) => {
  discoverBases.rect = startingRect;

  container.appendChild(discoverBases.svg);

  document.getElementById('discover-bases-container').addEventListener('click', discovery);
};

export default gimmeTheBases;
