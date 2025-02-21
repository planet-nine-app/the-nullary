const { invoke } = window.__TAURI__.core;
//import { upload } from '@tauri-apps/plugin-upload';

let greetInputEl;
let greetMsgEl;

async function greet() {
  // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
//  greetMsgEl.textContent = await invoke("greet", { name: greetInputEl.value });
console.log('let\'s do this');
  const sanoraUser = await invoke("create_sanora_user", {});
console.log('sanoraUser', sanoraUser);

  const event = {
    uuid: sanoraUser.uuid,
    title: 'A Poppy Collective Event',
    description: 'Bring your kiddos for an awesome time!',
    price: 500,
    times: JSON.stringify([new Date().getTime + '']),
    location: 'Sellwood, OR.'
  };

  const productMeta = await invoke("add_product", event);

console.log('productMeta', productMeta);
}

window.addEventListener("DOMContentLoaded", () => {
  greetInputEl = document.querySelector("#greet-input");
  greetMsgEl = document.querySelector("#greet-msg");
  document.querySelector("#greet-form").addEventListener("submit", (e) => {
    e.preventDefault();
    greet();
  });
});
