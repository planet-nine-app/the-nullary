import baseCommand from './base-command.js';
import gestures from './input/gestures.js';
import horizontalLayout from './layouts/horizontal-layout.js';
import verticalLayout from './layouts/vertical-layout.js';

console.log('imports worked');

/*baseCommand.getBases()
  .then(baseCommand.getFeed)
  .then(feed => {
    console.log('got a feed with ' + feed.allPosts.length + ' posts');
  })
  .catch(console.warn);
*/

if(window.innerWidth >= window.innerHeight) {
console.log('horizontal');
  horizontalLayout();
} else {
console.log('vertical');
  verticalLayout();
}



