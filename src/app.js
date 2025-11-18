import express from 'express';
import errorHandler from './middleware/errorHandler.js';

const app = express();
app.use(express.json());

function getCollection(req) {
  return req.app.locals.collection;
}

app.get('/api/ingatlan', async (req, res) => {
  const col = getCollection(req);
  if (!col) return res.status(500).json({ error: 'no collection' });
  try {
    const items = await col.find().toArray();
    return res.status(200).json(items);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

app.get('/api/ingatlan/:id', async (req, res) => {
  const col = getCollection(req);
  if (!col) return res.status(500).json({ error: 'no collection' });
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: 'invalid id' });
  try {
    const item = await col.findOne({ _id: String(id) });
    if (!item) return res.status(404).json({ error: 'not found' });
    return res.status(200).json(item);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

app.post('/api/ingatlan', async (req, res) => {
  const col = getCollection(req);
  if (!col) return res.status(500).json({ error: 'no collection' });
  const { nev, cim, ar } = req.body || {};
  if (!nev) return res.status(400).json({ error: 'nev is required' });
  try {
    const result = await col.insertOne({ nev, cim, ar });
    const created = await col.findOne({ _id: String(result.insertedId) });
    return res.status(201).json(created);
  } catch (e) {
    if (e && (e.code === 11000 || e.code === 'E11000')) return res.status(409).json({ error: 'duplicate' });
    return res.status(500).json({ error: e.message });
  }
});

app.put('/api/ingatlan/:id', async (req, res) => {
  const col = getCollection(req);
  if (!col) return res.status(500).json({ error: 'no collection' });
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: 'invalid id' });
  const update = req.body || {};
  if (Object.keys(update).length === 0) return res.status(400).json({ error: 'empty payload' });
  try {
    const result = await col.updateOne({ _id: String(id) }, { $set: update });
    if (!result || result.matchedCount === 0) return res.status(404).json({ error: 'not found' });
    const updated = await col.findOne({ _id: String(id) });
    return res.status(200).json(updated);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

app.delete('/api/ingatlan/:id', async (req, res) => {
  const col = getCollection(req);
  if (!col) return res.status(500).json({ error: 'no collection' });
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: 'invalid id' });
  try {
    const result = await col.deleteOne({ _id: String(id) });
    if (!result || result.deletedCount === 0) return res.status(404).json({ error: 'not found' });
    return res.status(204).end();
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Ingatlan API - Express Backend' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler middleware
app.use(errorHandler);

export default app;
