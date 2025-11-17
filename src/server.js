import 'dotenv/config';
import { MongoClient } from 'mongodb';
import app from './app.js';

const PORT = process.env.PORT || 3000;
const DATABASE_URL = process.env.DATABASE_URL;

async function start() {
  // If DATABASE_URL is provided, connect and attach collection to app.locals
  if (DATABASE_URL) {
    const client = new MongoClient(DATABASE_URL);
    await client.connect();
    // Extract database name from URL or use default
    const url = new URL(DATABASE_URL);
    let dbName = url.pathname.split('/').filter(Boolean)[0];
    if (!dbName) dbName = 'ingatlanDB';
    const db = client.db(dbName);
    const collection = db.collection('ingatlanok');
    app.locals.collection = collection;
    console.log(`Connected to MongoDB database: ${dbName}, collection: ingatlan`);
  } else {
    console.log('No DATABASE_URL provided — starting without DB. Tests can mock app.locals.collection.');
  }

  app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
