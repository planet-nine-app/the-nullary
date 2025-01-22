console.log('heyoooo')

const { invoke } = window.__TAURI__.core;
const { create, mkdir, readTextFile, writeTextFile, BaseDirectory } = window.__TAURI__.fs;

console.log('heereklrjljrlj');

const baseURL = 'https://dev.dolores.allyabase.com/';

let fountUser;
let doloresUser;

try {
  const fountUserString = await readTextFile('fount/user.json', {
    baseDir: BaseDirectory.AppLocalData,
  });
console.log('contents', fountUserString);
  fountUser = JSON.parse(fountUserString);
} catch(err) {
console.log('problem', err);
  try {
    fountUser = await invoke("create_fount_user");
    await mkdir('', {baseDir: BaseDirectory.AppLocalData});
    await mkdir('fount', {baseDir: BaseDirectory.AppLocalData});
//    await create('fount/user', { baseDir: BaseDirectory.AppLocalData })
    await writeTextFile('fount/user.json', JSON.stringify(fountUser), {
      baseDir: BaseDirectory.AppLocalData,
    });
  } catch(err) {
console.warn(err);
  }
}

try {
  const doloresUserString = await readTextFile('dolores/user.json', {
    baseDir: BaseDirectory.AppLocalData,
  });
console.log('dolores contents', doloresUserString);
  doloresUser = JSON.parse(doloresUserString);
} catch(err) {
console.log('dolores problem', err);
  try {
    doloresUser = await invoke("create_dolores_user");
    await mkdir('', {baseDir: BaseDirectory.AppLocalData});
    await mkdir('dolores', {baseDir: BaseDirectory.AppLocalData});
    await writeTextFile('dolores/user.json', JSON.stringify(fountUser), {
      baseDir: BaseDirectory.AppLocalData,
    });
  } catch(err) {
console.warn(err);
  }
}

try {
const feed = await invoke("get_feed", {uuid: doloresUser.uuid, tags: ""});

const uuid = feed.videos[0].uuid;
const videoURL = `${baseURL}user/${doloresUser.uuid}/short-form/video/${uuid}`;

const video = document.createElement('video');
video.setAttribute('style', 'height: 100vh; width: auto; max-width: 100%; object-fit: contain;');
video.setAttribute('src', videoURL);
video.setAttribute('autoplay', true);

document.getElementById('container').appendChild(video);


console.log(feed);
} catch(err) {
console.log('here is the err', err);
}
