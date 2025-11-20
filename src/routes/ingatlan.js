import express from 'express';
import { ObjectId } from 'mongodb';

const router = express.Router();

const getCollectionOr500 = (req, res) => {
  const col = req.app?.locals?.collection;
  if (!col) {
    res.status(500).json({ message: 'Database not connected' });
    return null;
  }
  return col;
};

const buildIdQuery = (id) => (ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id });

// GET all
router.get('/', async (req, res, next) => {
  try {
    const col = getCollectionOr500(req, res);
    if (!col) return;
    const items = await col.find({}).toArray();
    res.json(items);
  } catch (err) {
    next(err);
  }
});

// POST create
router.post('/', async (req, res, next) => {
  try {
    const col = getCollectionOr500(req, res);
    if (!col) return;
    const data = req.body;
    if (!data || Object.keys(data).length === 0) return res.status(400).json({ message: 'Empty body' });
    const result = await col.insertOne(data);
    const created = await col.findOne({ _id: result.insertedId });
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

// GET by id
router.get('/:id', async (req, res, next) => {
  try {
    const col = getCollectionOr500(req, res);
    if (!col) return;
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: 'Invalid id' });
    const query = buildIdQuery(id);
    const item = await col.findOne(query);
    if (!item) return res.status(404).json({ message: 'Not found' });
    res.json(item);
  } catch (err) {
    next(err);
  }
});

// PUT update
router.put('/:id', async (req, res, next) => {
  try {
    const col = getCollectionOr500(req, res);
    if (!col) return;
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: 'Invalid id' });
    const data = req.body;
    if (!data || Object.keys(data).length === 0) return res.status(400).json({ message: 'Empty body' });
    const query = buildIdQuery(id);
    await col.updateOne(query, { $set: data });
    const updated = await col.findOne(query);
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// DELETE
router.delete('/:id', async (req, res, next) => {
  try {
    const col = getCollectionOr500(req, res);
    if (!col) return;
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: 'Invalid id' });
    const query = buildIdQuery(id);
    await col.deleteOne(query);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;
