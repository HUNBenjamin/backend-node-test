import { MongoClient } from 'mongodb';

let client;

export async function connect(url) {
  if (client) return client;
  client = new MongoClient(url);
  await client.connect();
  return client;
}

export function getClient() {
  return client;
}
