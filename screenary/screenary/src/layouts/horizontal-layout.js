import gridPoints from './constants/grid-points.js';
import gimmeTheGoods from './components/gimme-the-goods.js';

console.log('importing horizontal');

const LAYOUT_DIRECTION = 'horizontal';

let viewState = 0;

const view0 = () => {
  switch(viewState) {
    case 0: gimmeTheGoods(gridPoints.middleLeft(LAYOUT_DIRECTION));
      break;
    case 1: console.log(1);
      break;
    default: console.log('default');
  }
  viewState = 0;
};

const viewary = () => {
  switch(viewState) {
    case 0: gimmeTheGoods(gridPoints.bottomLeft(LAYOUT_DIRECTION));
      break;
    case 1: gimmeTheGoods(gridPoints.bottomLeft(LAYOUT_DIRECTION));
      break;
  }
  viewState = 1;
};

const photary = () => {
  switch(viewState) {
    case 0: gimmeTheGoods(gridPoints.bottomLeft(LAYOUT_DIRECTION));
      break;
    case 1: gimmeTheGoods(gridPoints.bottomLeft(LAYOUT_DIRECTION));
      break;
  }
  viewState = 2;
};

const lexary = () => {
  switch(viewState) {
    case 0: gimmeTheGoods(gridPoints.bottomLeft(LAYOUT_DIRECTION));
      break;
    case 1: gimmeTheGoods(gridPoints.bottomLeft(LAYOUT_DIRECTION));
      break;
  }
  viewState = 3;
};

const layout = () => {
console.log('should layout the layout');
  const container = document.getElementById('container');
  
  gimmeTheGoods.addSelections(viewary, photary, lexary);
  gimmeTheGoods.attach(container);

console.log('should have attached');

  view0(0);
};

console.log('exporting horizontal');

export default layout;
