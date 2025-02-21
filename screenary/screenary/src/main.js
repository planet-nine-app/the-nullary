import gestures from './input/gestures.js';
import horizontalLayout from './layouts/horizontal-layout.js';
import verticalLayout from './layouts/vertical-layout.js';

console.log('imports worked');

if(window.innerWidth >= window.innerHeight) {
console.log('horizontal');
  horizontalLayout();
} else {
console.log('vertical');
  verticalLayout();
}



