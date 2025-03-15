import baseCommand from './base-command.js';
import gestures from './input/gestures.js';
import horizontalLayout from './layouts/horizontal-layout.js';
import verticalLayout from './layouts/vertical-layout.js';

window.alertt = (a) => {
  let alertter = document.getElementById('alertter'); 
  if(!alertter) {
    alertter = document.createElement('div');
    document.body.appendChild(alertter);
  }
  alertter.innerHTML = '';
  alertter.innerHTML = a;
  alertter.style.zIndex = 999;
  alertter.style.backgroundColor = 'blue';
  alertter.style.color = 'gray'; 
};


/*try {
const { scan, textRecord, write } = window.__TAURI__.nfc;

setTimeout(() => {
document.addEventListener('click', async () => {
console.log('document clicked!');
  const scanResult = await scan({ type: 'tag', keepSessionAlive: true });
  window.alertt("Scan Result", scanResult);
  const writeResult = await write([textRecord('Tauri is awesome!')]);
  window.alertt("Write Result", JSON.stringify(writeResult));
});
window.alertt('should have added the bizness');
}, 1000);
} catch(err) {
 window.alertt(err);
}*/

console.log('imports worked');

baseCommand.getBases()
  .then(baseCommand.getFeed)
  .then(feed => {
    console.log('got a feed with ' + feed.allPosts.length + ' posts');
  })
  .catch(console.warn);


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



