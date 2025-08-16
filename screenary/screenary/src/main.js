import baseCommand from './base-command.js';
import gestures from './input/gestures.js';
import horizontalLayout from './layouts/horizontal-layout.js';
import verticalLayout from './layouts/vertical-layout.js';

// Environment configuration for Screenary
function getEnvironmentConfig() {
  const env = localStorage.getItem('nullary-env') || 'dev';
  
  const configs = {
    dev: {
      sanora: 'https://dev.sanora.allyabase.com/',
      bdo: 'https://dev.bdo.allyabase.com/',
      dolores: 'https://dev.dolores.allyabase.com/',
      fount: 'https://dev.fount.allyabase.com/',
      addie: 'https://dev.addie.allyabase.com/'
    },
    test: {
      sanora: 'http://localhost:5121/',
      bdo: 'http://localhost:5114/',
      dolores: 'http://localhost:5118/',
      fount: 'http://localhost:5117/',
      addie: 'http://localhost:5116/'
    },
    local: {
      sanora: 'http://localhost:7243/',
      bdo: 'http://localhost:3003/',
      dolores: 'http://localhost:3007/',
      fount: 'http://localhost:3002/',
      addie: 'http://localhost:3005/',
      prof: 'http://localhost:3008/'
    }
  };
  
  const config = configs[env] || configs.dev;
  return { env, services: config, name: env };
}

function getServiceUrl(serviceName) {
  const config = getEnvironmentConfig();
  return config.services[serviceName] || config.services.sanora;
}

// Environment switching functions for browser console
window.screenaryEnv = {
  switch: (env) => {
    const envs = { dev: 'dev', test: 'test', local: 'local' };
    if (!envs[env]) {
      console.error(`❌ Unknown environment: ${env}. Available: dev, test, local`);
      return false;
    }
    localStorage.setItem('nullary-env', env);
    console.log(`🔄 Screenary environment switched to ${env}. Refresh app to apply changes.`);
    console.log(`Run: location.reload() to refresh`);
    return true;
  },
  current: () => {
    const config = getEnvironmentConfig();
    console.log(`🌐 Current environment: ${config.env}`);
    console.log(`📍 Services:`, config.services);
    return config;
  },
  list: () => {
    console.log('🌍 Available environments for Screenary:');
    console.log('• dev - https://dev.*.allyabase.com (production dev server)');
    console.log('• test - localhost:5111-5122 (3-base test ecosystem)');
    console.log('• local - localhost:3000-3007 (local development)');
  }
};

// Make functions globally available
window.getEnvironmentConfig = getEnvironmentConfig;
window.getServiceUrl = getServiceUrl;

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

let query = {};

if(window.location.search) {
console.log('got a location.search');
  const sliceQ = window.location.search.slice(1, window.location.search.length);
  const searches = sliceQ.split("&");
  const paramTuples = searches.map(search => search.split("="));
  paramTuples.forEach(tuple => query[tuple[0]] = tuple[1]);

  fetch('dev.orders.allyabase.com', {
    method: 'PUT',
    body: JSON.stringify(query),
    headers: {"Content-Type": "application/json"}
  }).then($ => $.json())
  .then(console.log)
  .catch(console.warn);

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



