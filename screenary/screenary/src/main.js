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

if(window.location.search) {
console.log('got a location.search');
  const sliceQ = window.location.search.slice(1, window.location.search.length);
  const searches = sliceQ.split("&");
  const paramTuples = searches.map(search => search.split("="));
  paramTuples.forEach(tuple => query[tuple[0]] = tuple[1]);

  console.log('query', query);
}

if(window.innerWidth >= window.innerHeight) {
console.log('horizontal');
  horizontalLayout();
} else {
console.log('vertical');
  verticalLayout();
}



