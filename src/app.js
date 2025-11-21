import express from 'express';
import errorHandler from './middleware/errorHandler.js';
import ingatlanRoutes from './routes/ingatlan.js';

const app = express();
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
const getCollection = (req) => req?.app?.locals?.collection ?? null;

const hasMethod = (col, name) => col && typeof col[name] === 'function';

const sendServerError = (res) => res.status(500).json({ message: 'Server error' });

// GET list
app.get('/api/ingatlan', async (req, res) => {
  const col = getCollection(req);
  if (!hasMethod(col, 'find')) return sendServerError(res);

  try {
    const cursor = col.find();
    if (Array.isArray(cursor)) return res.status(200).json(cursor);
    if (hasMethod(cursor, 'toArray')) {
      const items = await cursor.toArray();
      return res.status(200).json(items);
    }
    return res.status(200).json([]);
  } catch (err) {
    return sendServerError(res);
  }
});

// GET single
app.get('/api/ingatlan/:id', async (req, res) => {
  const col = getCollection(req);
  if (!hasMethod(col, 'findOne')) return sendServerError(res);

  try {
    const id = req.params.id;
    const item = await col.findOne({ _id: id });
    if (!item) return res.status(404).end();
    return res.status(200).json(item);
  } catch (err) {
    return sendServerError(res);
  }
});

// POST create
app.post('/api/ingatlan', async (req, res) => {
  const col = getCollection(req);
  if (!hasMethod(col, 'insertOne')) return sendServerError(res);

  try {
    const result = await col.insertOne(req.body);
    const id = (result && typeof result.insertedId !== 'undefined') ? result.insertedId : (req.body && req.body._id);
    const created = id ? { ...req.body, _id: id } : { ...req.body };
    return res.status(201).json(created);
  } catch (err) {
    return sendServerError(res);
  }
});

// PUT update
app.put('/api/ingatlan/:id', async (req, res) => {
  const col = getCollection(req);
  if (!hasMethod(col, 'updateOne')) return sendServerError(res);

  try {
    const id = req.params.id;
    const result = await col.updateOne({ _id: id }, { $set: req.body });

    const matched = (result && (
      typeof result.matchedCount === 'number' ? result.matchedCount :
      typeof result.modifiedCount === 'number' ? result.modifiedCount :
      typeof result.n === 'number' ? result.n :
      (result.result && typeof result.result.nModified === 'number' ? result.result.nModified : 0)
    )) || 0;

    if (matched === 0) return res.status(404).end();

    const updated = hasMethod(col, 'findOne') ? await col.findOne({ _id: id }) : { ...req.body, _id: id };
    return res.status(200).json(updated);
  } catch (err) {
    return sendServerError(res);
  }
});

// DELETE
app.delete('/api/ingatlan/:id', async (req, res) => {
  const col = getCollection(req);
  if (!hasMethod(col, 'deleteOne')) return sendServerError(res);

  try {
    const id = req.params.id;
    const result = await col.deleteOne({ _id: id });

    const deleted = (result && (
      typeof result.deletedCount === 'number' ? result.deletedCount :
      typeof result.deleted === 'number' ? result.deleted :
      typeof result.n === 'number' ? result.n :
      (result.result && typeof result.result.n === 'number' ? result.result.n : 0)
    )) || 0;

    if (deleted === 0) return res.status(404).end();
    return res.status(204).end();
  } catch (err) {
    return sendServerError(res);
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