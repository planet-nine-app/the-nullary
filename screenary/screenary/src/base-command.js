const { invoke } = window.__TAURI__.core;
const { create, mkdir, readTextFile, writeTextFile, BaseDirectory } = window.__TAURI__.fs;

let bases = {};
let bdoUser;
let doloresUser;

async function createUsers() {
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
    joined: false
  };

  try {
    await connectToBase(devBase);
    devBase.uuid = doloresUser.uuid; 

    bases[devBase.uuid] = devBase;

    try {
      await mkdir('', {baseDir: BaseDirectory.AppLocalData});
    } catch(err) { console.log(err) }

    try {
      await mkdir('services', {baseDir: BaseDirectory.AppLocalData});
    } catch(err) { console.log(err) }

    await writeTextFile('services/bdo.json', JSON.stringify(bdoUser), {
      baseDir: BaseDirectory.AppLocalData
    });
    await writeTextFile('services/dolores.json', JSON.stringify(doloresUser), {
      baseDir: BaseDirectory.AppLocalData
    });

    try {
      await mkdir('bases', {baseDir: BaseDirectory.AppLocalData});
    } catch(err) { console.log(err) }

    await writeTextFile('bases/bases.json', JSON.stringify(bases), {
      baseDir: BaseDirectory.AppLocalData,
    });
  } catch(err) {
    console.warn(err);
  }
};

async function fetchAndSaveBases() {
  try {
    let updatedBases = await invoke('get_bases', {uuid: bdoUser.uuid, bdoUrl: bases[doloresUser.uuid].dns && bases[doloresUser.uuid].dns.bdo});
    const basesString = await readTextFile('bases/bases.json', {
      baseDir: BaseDirectory.AppLocalData,
    });

    bases = {...JSON.parse(basesString), ...updatedBases};

    await writeTextFile('bases/bases.json', JSON.stringify(bases), {
      baseDir: BaseDirectory.AppLocalData,
    });

    return bases;
  } catch(err) {
    await createUsers();
    return fetchAndSaveBases();
  }
};

async function createDoloresUsers() {
  for(var baseId in bases) {
    const base = bases[baseId];
console.log('base before users');
    base.users = base.users || {};
console.log('base after users', base.users);
    for(var service in base.dns) {
      if(base.users[service] && base.users[service].uuid) {
        continue;
      }
      const invokeString = `create_${service}_user`;
      const opts = {};
      opts[`${service}Url`] = base.dns[service];
      try {
        const user = await invoke(invokeString, opts);
console.log(user);
        base.users[service] = user;
console.log('and base', base.users, service, user);
      } catch(err) { console.log(err) }
    }
  }

console.log('after all of that bases are: ', bases);

  await writeTextFile('bases/bases.json', JSON.stringify(bases), {
    baseDir: BaseDirectory.AppLocalData,
  });
};

async function getBases() {
  let bases;
  try {
    bases = await fetchAndSaveBases();
console.log('in first try bases', bases);
  } catch(err) {
    try {
      bdoUser = JSON.parse(fs.readFileSync('services/bdo.json'));
console.log('got saved user', bdoUser);
    } catch(err) {
      await createUsers();
console.log('now bdoUser is: ', bdoUser);
    }
console.log('in catch bases', bases);
    await createDoloresUsers();
    return bases;
  }
};

async function connectToBase(base) {
  try {
    bdoUser = await invoke('create_bdo_user', {bdoUrl: 'https://dev.bdo.allyabase.com/'}); // TODO: make this dynamic
    doloresUser = await invoke('create_dolores_user', {doloresUrl: 'https://dev.dolores.allyabase.com/'});
  } catch(err) {
    console.warn('failed to make dev dolores user', err);
  }
};

async function getFeed() {
  const bases = await getBases();

console.log('bases in getFeed look like: ', bases);

  let feed = {
    videoPosts: [],
    picPosts: [],
    genericPosts: [],
    allPosts: []
  };
  for(let baseUUID in bases) {
    const base = bases[baseUUID];
console.log(base);
    const uuid = base.users && base.users.dolores && base.users.dolores.uuid;
console.log(uuid);
    const doloresURL = base.dns.dolores;
console.log(doloresURL);

    if(!(uuid && doloresURL)) {
console.log('continuing');
      continue;
    }

    try {
      const posts = await invoke('get_feed', {uuid, doloresUrl: doloresURL, tags: '[]'});

//    const posts = await invoke('get_feed', {uuid, doloresUrl: bases[uuid].dns && bases[uuid].dns.dolores, tags: '[]'}); 

      console.log('posts looks like: ', posts);

      feed.videoPosts = [...feed.videoPosts, ...posts.videoPosts];
      feed.picPosts = [...feed.picPosts, ...posts.picPosts];
      feed.genericPosts = [...feed.genericPosts, ...posts.genericPosts];
      feed.allPosts = [...feed.allPosts, ...posts.allPosts];
    
    } catch(err) { console.log(err); }

  }

  return feed;
};

const baseCommand = {
  getBases,
  getFeed
};

export default baseCommand;
