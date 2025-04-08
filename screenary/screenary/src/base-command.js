const { invoke } = window.__TAURI__.core;
const { create, mkdir, readTextFile, writeTextFile, BaseDirectory } = window.__TAURI__.fs;

const LAST_FEED_THRESHOLD = 600000;
const LAST_BASE_THRESHOLD = 600000;

let bases;
let lastBaseRefresh = 0;
let bdoUser;
let doloresUser;
let _feed = [];
let lastFeedRefresh = 0;

const devBase = {
  name: 'DEV',
  description: 'this is a development base for people to use. It is not gauranteed to work, and may be unstable.',
  location: {
    latitude: 36.788,
    longitude: -119.417,
    postalCode: '94102'
  },
  soma: {
    lexary: [
      'science',
      'books'
    ],
    photary: [
      'cats'
    ],
    viewary: [
      'thevids'
    ]
  },
  dns: {
    bdo: 'https://dev.bdo.allyabase.com/',
    dolores: 'https://dev.dolores.allyabase.com/'
  },
  joined: true
};

async function getHomeBase() {
  try {
    const homeBase = await readTextFile('bases/home.json', {baseDir: BaseDirectory.AppCache});
    return homeBase;
  } catch(err) { 
window.alertt(err);
    return devBase;
  }
};

async function connectToHomeBase() {
  try {    
    let homeBase = await getHomeBase();
    if(!homeBase.users) {
      homeBase = await connectToBase(homeBase);
console.log('after connecting homeBase is: ', homeBase);
    }

    if(!bases) {
      bases = {};
    }

    const localId = Math.random() * 100000 + '';
    homeBase.localId = localId;
    bases[localId] = homeBase; // TODO: what are base ids?

    try {
      await mkdir('', {baseDir: BaseDirectory.AppCache});
    } catch(err) { 
window.alertt('second ' + JSON.stringify(err));
console.log(err) }


    try {
      await mkdir('bases', {baseDir: BaseDirectory.AppCache});
    } catch(err) { console.log(err) }

    try {
      await writeTextFile('bases/bases.json', JSON.stringify(bases), {
        baseDir: BaseDirectory.AppCache,
      });
    } catch(err) { console.log(err) }

    return homeBase;
  } catch(err) {
    console.warn(err);
  }
};

async function fetchAndSaveBases() {
  let homeBase = await getHomeBase();
  try {
    let bdoUser = homeBase.users && homeBase.users.bdo;
    if(!bdoUser) {
      homeBase = await connectToHomeBase();
console.log('homeBase is', homeBase);
      bdoUser = homeBase.users && homeBase.users.bdo;
    }
    let doloresUser = homeBase.users && homeBase.users.dolores;
    let bdoUrl = homeBase.dns && homeBase.dns.bdo;
    if(bdoUrl[bdoUrl.length - 1] !== '/') {
      bdoUrl += '/';
    }
    let updatedBases = await invoke('get_bases', {uuid: bdoUser.uuid, bdoUrl});

    for(var baseId in updatedBases) {
      updatedBases[baseId] = await connectToBase(updatedBases[baseId]);
      updatedBases[baseId].uuid = baseId;
    }

    const basesString = await readTextFile('bases/bases.json', {
      baseDir: BaseDirectory.AppCache,
    });

    const allBases = {...JSON.parse(basesString), ...updatedBases};

    try {
      await writeTextFile('bases/bases.json', JSON.stringify(allBases), {
        baseDir: BaseDirectory.AppCache,
      });
    } catch(err) { console.error('This is a big problem', err) }

    return allBases;
  } catch(err) {
console.error('here\'s the prob bob', err);
    await connectToHomeBase();
    return fetchAndSaveBases();
  }
};

async function getBases() {
  const now = new Date().getTime();
console.log('now', now, 'bases', bases, 'lastBaseRefresh', lastBaseRefresh, 'LAST_BASE_THRESHOLD', LAST_BASE_THRESHOLD);
  if(bases || (now - lastBaseRefresh < LAST_BASE_THRESHOLD)) {
    return bases;
  }
  bases = await fetchAndSaveBases();

console.log('Here are all the bases', bases);

  return bases;
};

async function connectToBase(_base) {
  let base = JSON.parse(JSON.stringify(_base));
  for(var service in base.dns) {
    if(base.users && base.users[service] && base.users[service].uuid) {
      continue;
    }
    const invokeString = `create_${service}_user`;
    const opts = {};
    const serviceURL = `${service}Url`;
    opts[serviceURL] = base.dns[service];
    if(opts[serviceURL][opts[serviceURL].length - 1] !== '/') {
      opts[serviceURL] += '/';
    }
    try {
      const user = await invoke(invokeString, opts);
console.log(user);
      base.users = base.users || {};
      base.users[service] = user;
console.log('and base', base.users, service, user);
    } catch(err) { console.log(err) }
  }

  base.joined = true;

  return base;
};

async function joinBase(_base) {
  let base = JSON.parse(JSON.stringify(_base));
  base.joined = true;
  base = connectToBase(base);

  bases[base.uuid] = base;

  try {
    await writeTextFile('bases/bases.json', JSON.stringify(bases), {
      baseDir: BaseDirectory.AppCache,
    });
  } catch(err) { console.log(err) }
};

async function leaveBase(_base) {
  let base = JSON.parse(JSON.stringify(_base));
  base.joined = false;

  bases[base.uuid] = base;
  
  try {
    await writeTextFile('bases/bases.json', JSON.stringify(bases), {
      baseDir: BaseDirectory.AppCache,
    });
  } catch(err) { console.log(err) } 
};

async function getFeed(refreshFeed) {
  const now = new Date().getTime();
  if(_feed && now - lastFeedRefresh < LAST_FEED_THRESHOLD) {
    refreshFeed(_feed);
    return;
  }
  let bases;
  try {
  const basesString = await readTextFile('bases/bases.json', {
    baseDir: BaseDirectory.AppCache,
  });
  bases = JSON.parse(basesString);
  } catch(err) {
console.warn('could not get bases in getFeed', err);
  }

console.log('bases in getFeed look like: ', bases);

  let feed = {
    videoPosts: [],
    picPosts: [],
    genericPosts: [],
    allPosts: []
  };

  let postPromises = [];

  for(let baseUUID in bases) {
    const base = bases[baseUUID];
console.log(base);
    const uuid = base.users && base.users.dolores && base.users.dolores.uuid;
console.log(uuid);
    let doloresURL = base.dns && base.dns.dolores;
    if(doloresURL[doloresURL.length - 1] !== '/') {
      doloresURL += '/';
    }
console.log(doloresURL);

    if(!(uuid && doloresURL)) {
console.log('continuing');
      continue;
    }

    try {
//      const posts = await invoke('get_feed', {uuid, doloresUrl: doloresURL, tags: '[]'});
      postPromises.push(invoke('get_feed', {uuid, doloresUrl: doloresURL, tags: '[]'}));
//    const posts = await invoke('get_feed', {uuid, doloresUrl: bases[uuid].dns && bases[uuid].dns.dolores, tags: '[]'}); 

    } catch(err) { console.log(err); }

    Promise.all(postPromises).then(results => {
      results.forEach(posts => {
        feed.videoPosts = [...feed.videoPosts, ...posts.videoPosts];
	feed.picPosts = [...feed.picPosts, ...posts.picPosts];
	feed.genericPosts = [...feed.genericPosts, ...posts.genericPosts];
	feed.allPosts = [...feed.allPosts, ...posts.allPosts];

        refreshFeed(feed);
      });

      feed.videoPosts = feed.videoPosts.slice(0, Math.min(feed.videoPosts.length, 50)).sort($ => Math.round(Math.random() * 2 - 2));
      feed.picPosts = feed.picPosts.slice(0, Math.min(feed.picPosts.length, 50)).sort($ => Math.round(Math.random() * 2 - 2));
      feed.allPosts = feed.allPosts.slice(0, Math.min(feed.allPosts.length, 50)).sort($ => Math.round(Math.random() * 2 - 2));

      const uuidMap = {};

      feed.videoPosts = feed.videoPosts.filter($ => {
        if(!uuidMap[$.uuid]) {
          uuidMap[$.uuid] = true;
          return $;
        }
        return null;
      });
      feed.picPosts = feed.picPosts.filter($ => {
        if(!uuidMap[$.uuid]) {
          uuidMap[$.uuid] = true;
          return $;
        }
        return null;
      });

console.log('BEFORE', feed.allPosts.length);
      const allMap = {};
      feed.allPosts = feed.allPosts.filter($ => {
console.log('the uuid for this guy is: ', $.uuid, $, allMap);
        if(!allMap[$.uuid]) {
          allMap[$.uuid] = true;
          return true;
        }
        return false;
      });
console.log('AFTER', feed.allPosts.length);

      _feed = feed;
      lastFeedRefresh = now;
    });
  }

  return feed;
};

const baseCommand = {
  getBases,
  getFeed,
  leaveBase,
  joinBase
};

export default baseCommand;
