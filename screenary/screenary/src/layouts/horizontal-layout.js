import baseCommand from '../base-command.js';
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
  gimmeTheGoods(gridPoints.bottomLeft);
  gimmeTheBases(gridPoints.bottomRight);
};

const moveToMiddle = () => {
  gimmeTheGoods(gridPoints.middleLeft);
  gimmeTheBases(gridPoints.middleRight);
};

const view0 = () => {

  moveToMiddle();

  viewState = 0;
};

const viewary = async () => {
  const feed = await baseCommand.getFeed((_feed) => {
    appendViewary(_feed.videoPosts);
  });
console.log('should have appended viewary');

  moveToBottom();

  viewState = 1;
};

const photary = async () => {
  const feed = await baseCommand.getFeed((_feed) => {
    appendPhotary(_feed.picPosts);
  });

  moveToBottom();

  viewState = 2;
};

const lexary = async () => {
  const feed = await baseCommand.getFeed((_feed) => {
    appendLexary(_feed.allPosts);
  });

  moveToBottom();

  viewState = 3;
};

const discovery = async () => {
console.log('discovery clicked!');
  const basesObj = await baseCommand.getBases();
  const bases = Object.values(basesObj);
console.log('should display these bases', bases);
  appendDiscoverBases(bases);

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
  const fullScreenSVG = document.getElementById('full-screen-svg');
console.log('window dimensions', window.innerWidth, window.innerHeight);
  fullScreenSVG.setAttribute('viewBox', `0 0 ${window.innerWidth} ${window.innerHeight}`);

//  const container = document.getElementById('container');
//console.log('container is', container);

//  const logo = findPlaneNinegid();
  findPlanetNine.addSelections(teleport, pref);
//  findPlanetNine.attach(container, gridPoints.topRight);
  findPlanetNine.attach(fullScreenSVG, gridPoints.topRight);
  
  gimmeTheGoods.addSelections(viewary, photary, lexary);
//  gimmeTheGoods.attach(container, gridPoints.middleLeft);
  gimmeTheGoods.attach(fullScreenSVG, gridPoints.middleLeft);

  gimmeTheBases.addSelections(discovery);
//  gimmeTheBases.attach(container, gridPoints.middleRight);
  gimmeTheBases.attach(fullScreenSVG, gridPoints.middleRight);

console.log('should have attached');

  view0(0);
};

console.log('exporting horizontal');

export default layout;
