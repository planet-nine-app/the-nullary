import baseCommand from './base-command.js';
import gestures from './input/gestures.js';
import horizontalLayout from './layouts/horizontal-layout.js';
import verticalLayout from './layouts/vertical-layout.js';

window.alertt = (a) => {
  let alertter = document.getElementById('alertter'); 
  if(!alertter) {
    alertter = document.createElement('div');
    alertter.setAttribute('id', 'alertter');
    document.body.appendChild(alertter);
  }
//  alertter.innerHTML = '';
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

window.alertt('This message is a placeholder for bootstrapping that I haven\'t quite figured out yet. Feeds aren\'t ready until this goes away');

baseCommand.getBases()
  .then(() => { 
    baseCommand.getFeed((_feed) => {
      const alertter = document.getElementById('alertter');
      if(alertter) {
        alertter.remove();
      }
      // TODO: What should happen here?  
    });
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

/*if(window.innerWidth >= window.innerHeight) {
console.log('horizontal');
  horizontalLayout();
} else {
console.log('vertical');
  verticalLayout();
}*/

if(window.innerWidth <= window.innerHeight) {
  const fo = document.getElementById('fo')
  fo.setAttribute('width', '100%');
  fo.setAttribute('x', '0');
}

horizontalLayout();



