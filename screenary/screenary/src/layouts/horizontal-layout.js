import gridPoints from './constants/grid-points.js';
import appendViewary from '../viewary.js';
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

  moveToMiddle();

  viewState = 2;
};

const lexary = () => {

  moveToMiddle();

  viewState = 3;
};

const discovery = () => {

  moveToBottom();

  viewState = 4;
};

const layout = () => {
console.log('should layout the layout');
  const container = document.getElementById('container');
console.log('window dimensions', window.innerWidth, window.innerHeight);
  container.setAttribute('viewBox', `0 0 ${window.innerWidth} ${window.innerHeight}`);
  
  gimmeTheGoods.addSelections(viewary, photary, lexary);
  gimmeTheGoods.attach(container, gridPoints.middleLeft(LAYOUT_DIRECTION));

  gimmeTheBases.addSelections(discovery);
  gimmeTheBases.attach(container, gridPoints.middleRight(LAYOUT_DIRECTION));

console.log('should have attached');

  view0(0);
};

console.log('exporting horizontal');

export default layout;
