import 'dotenv/config';
import { MongoClient } from 'mongodb';
import app from './app.js';

const PORT = process.env.PORT || 3000;
const DATABASE_URL = process.env.DATABASE_URL;

async function start() {
  // If DATABASE_URL is provided, connect and attach collection to app.locals
  if (DATABASE_URL) {
    let client;
    try {
      client = new MongoClient(DATABASE_URL);
      await client.connect();
      // Extract database name from URL or use default
      let dbName = 'ingatlanDB';
      try {
        const url = new URL(DATABASE_URL);
        const parsed = url.pathname.split('/').filter(Boolean)[0];
        if (parsed) dbName = parsed;
      } catch (_) {
        // keep default dbName
      }
      const db = client.db(dbName);
      const collection = db.collection('ingatlanok');
      app.locals.collection = collection;
      console.log(`Connected to MongoDB database: ${dbName}, collection: ingatlanok`);
    } catch (err) {
      console.error('Failed to connect to database:', err);
      if (client) await client.close();
      throw err;
    }
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
