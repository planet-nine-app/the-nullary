import gridPoints from './constants/grid-points.js';
import appendViewary from '../viewary.js';
import appendPhotary from '../photary.js';
import appendLexary from '../lexary.js';
import appendDiscoverBases from '../discover-bases.js';
import teleportEmIn from '../teleport-em-in.js';
import findPlanetNine from './components/planet-nine-logo.js';
import gimmeTheGoods from './components/gimme-the-goods.js';
import gimmeTheBases from './components/discover-bases.js';

console.log('importing horizontal');

const LAYOUT_DIRECTION = 'horizontal';

let viewState = 0;

const moveToBottom = () => {
  gimmeTheGoods(gridPoints.bottomLeft(LAYOUT_DIRECTION));
  gimmeTheBases(gridPoints.bottomRight(LAYOUT_DIRECTION));
};

const moveToMiddle = () => {
  gimmeTheGoods(gridPoints.middleLeft(LAYOUT_DIRECTION));
  gimmeTheBases(gridPoints.middleRight(LAYOUT_DIRECTION));
};

const view0 = () => {

  moveToMiddle();

  viewState = 0;
};

const viewary = () => {
  appendViewary();
console.log('should have appended viewary');

  moveToMiddle();

  viewState = 1;
};

const photary = () => {
  appendPhotary();

  moveToMiddle();

  viewState = 2;
};

const lexary = () => {
  appendLexary();

  moveToMiddle();

  viewState = 3;
};

const discovery = () => {
  appendDiscoverBases();

  moveToBottom();

  viewState = 4;
};

const teleport = () => {
console.log('the layout\'s teleport gets called');
  teleportEmIn();
console.log('should have telepoted em in');

  moveToBottom();

  viewState = 5;
};

const pref = () => {
  // noop for now
};

const layout = () => {
console.log('should layout the layout');
  const container = document.getElementById('container');
console.log('window dimensions', window.innerWidth, window.innerHeight);
  container.setAttribute('viewBox', `0 0 ${window.innerWidth} ${window.innerHeight}`);

//  const logo = findPlaneNinegid();
  findPlanetNine.addSelections(teleport, pref);
  findPlanetNine.attach(container, gridPoints.topRight(LAYOUT_DIRECTION));
  
  gimmeTheGoods.addSelections(viewary, photary, lexary);
  gimmeTheGoods.attach(container, gridPoints.middleLeft(LAYOUT_DIRECTION));

  gimmeTheBases.addSelections(discovery);
  gimmeTheBases.attach(container, gridPoints.middleRight(LAYOUT_DIRECTION));

console.log('should have attached');

  view0(0);
};

console.log('exporting horizontal');

export default layout;
