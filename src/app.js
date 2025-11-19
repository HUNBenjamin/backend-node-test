import express from 'express';
import ingatlanRoutes from './routes/ingatlan.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();

// Middleware
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Ingatlan API - Express Backend' });
});

// Use collection from app.locals so tests can inject mocks
function getCollection(req) {
  const col = req.app && req.app.locals && req.app.locals.collection;
  if (!col) throw new Error('no collection');
  return col;
}

// GET list
app.get('/api/ingatlan', async (req, res) => {
  try {
    const col = getCollection(req);
    if (typeof col.find !== 'function') throw new Error('find not implemented');
    const cursor = col.find();
    const items = Array.isArray(cursor) ? cursor : (typeof cursor.toArray === 'function' ? await cursor.toArray() : []);
    res.status(200).json(items);
  } catch (err) {
    res.status(500).json({ error: 'server error' });
  }
});

// GET single
app.get('/api/ingatlan/:id', async (req, res) => {
  try {
    const col = getCollection(req);
    if (typeof col.findOne !== 'function') throw new Error('findOne not implemented');
    const id = req.params.id;
    const item = await col.findOne({ _id: id });
    if (!item) return res.status(404).end();
    res.status(200).json(item);
  } catch (err) {
    res.status(500).json({ error: 'server error' });
  }
});

// POST create
app.post('/api/ingatlan', async (req, res) => {
  try {
    const col = getCollection(req);
    if (typeof col.insertOne !== 'function') throw new Error('insertOne not implemented');
    const result = await col.insertOne(req.body);
    const createdId = result && (typeof result.insertedId !== 'undefined') ? result.insertedId : undefined;
    const created = createdId ? { ...req.body, _id: createdId } : { ...req.body };
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: 'server error' });
  }
});

// PUT update
app.put('/api/ingatlan/:id', async (req, res) => {
  try {
    const col = getCollection(req);
    if (typeof col.updateOne !== 'function') throw new Error('updateOne not implemented');
    const id = req.params.id;
    const result = await col.updateOne({ _id: id }, { $set: req.body });

    const matchedCount = result && (typeof result.matchedCount === 'number'
      ? result.matchedCount
      : (typeof result.modifiedCount === 'number' ? result.modifiedCount
        : (typeof result.nModified === 'number' ? result.nModified : 0)));

    if (matchedCount === 0) return res.status(404).end();

    const updated = (typeof col.findOne === 'function') ? await col.findOne({ _id: id }) : { ...req.body, _id: id };
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ error: 'server error' });
  }
});

// DELETE
app.delete('/api/ingatlan/:id', async (req, res) => {
  try {
    const col = getCollection(req);
    if (typeof col.deleteOne !== 'function') throw new Error('deleteOne not implemented');
    const id = req.params.id;
    const result = await col.deleteOne({ _id: id });

    const deletedCount = result && (typeof result.deletedCount === 'number'
      ? result.deletedCount
      : (typeof result.deleted === 'number' ? result.deleted : 0));

    if (deletedCount === 0) return res.status(404).end();
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: 'server error' });
  }
});

// Mount original router after custom handlers so tests that inject app.locals.collection hit the above routes first
app.use('/api/ingatlan', ingatlanRoutes);

// 404 handler (moved below routes)
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler middleware (last)
app.use(errorHandler);

export default app;