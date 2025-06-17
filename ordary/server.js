import express from 'express';
import fs from 'fs';
import path from 'path';
import sessionless from 'sessionless-node';

const keys = {
  privateKey: 'd6bfebeafa60e27114a40059a4fe82b3e7a1ddb3806cd5102691c3985d7fa591',
  pubKey: '03f60b3bf11552f5a0c7d6b52fcc415973d30b52ab1d74845f1b34ae8568a47b5f'
};

const baseURL = 'https://livetest.sanora.allyabase.com/';

const app = express();

app.get('/ordary', async (req, res) => {
  res.sendFile(path.join(process.cwd(), 'ordary.html'));
});

app.get('/orders', async (req, res) => {
  await sessionless.generateKeys((_) => { }, () => keys);

  const timestamp = new Date().getTime() + '';
  const uuid = '0592e019-5eb1-46d8-aa94-0c7fefd20ef9';
  const message = timestamp + uuid;
  const signature = await sessionless.sign(message);

  const resp = await fetch(`${baseURL}user/${uuid}/orders/af406a6278f9429ad622c51bae5137d4ac1f6ac2018783e5abfb0c1d1ad079b4?timestamp=${timestamp}&signature=${signature}`);
  let json = await resp.json();
console.log('orders::::::::');
console.log(json.orders.forEach(console.log));
  json.orders = json.orders.map($ => {
    $.status = $.status || 'purchased'
    return $;
  });

  res.send(json.orders);
});

app.post('/shipit', async (req, res) => {
  const timestamp = new Date().getTime() + '';
  const uuid = '0592e019-5eb1-46d8-aa94-0c7fefd20ef9';
  const message = timestamp + uuid;
  const signature = await sessionless.sign(message);

console.log('shipit called');

  const payload = {
    order: req.body.order,
    timestamp,
    signature
  };

  const resp = await fetch(`https://livetest.sanora.allyabase.com/user/${uuid}/orders`, {
    method: 'put',
    body: JSON.stringify(payload),
    headers: {"Content-Type": "application/json"}
  });
const json = await resp.json();
console.log('response from update order', json);

  res.send({success: true});
});

app.listen(1234);
