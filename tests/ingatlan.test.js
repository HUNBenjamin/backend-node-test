
import request from 'supertest';
import app from '../src/app.js';

function createMockCollection() {
  const items = new Map();
  return {
    find: () => ({ toArray: async () => Array.from(items.values()) }),
    findOne: async (query) => {
      if (query._id) return items.get(String(query._id)) || null;
      return null;
    },
    insertOne: async (doc) => {
      const id = (Math.floor(Math.random() * 1000000)).toString();
      const stored = { ...doc, _id: id };
      items.set(id, stored);
      return { insertedId: id };
    },
    updateOne: async (query, { $set }) => {
      const id = String(query._id);
      const existing = items.get(id);
      if (!existing) return { matchedCount: 0 };
      const updated = { ...existing, ...$set };
      items.set(id, updated);
      return { matchedCount: 1 };
    },
    deleteOne: async (query) => {
      const id = String(query._id);
      const existed = items.delete(id);
      return { deletedCount: existed ? 1 : 0 };
    },
    // helper for tests
    __clear: () => items.clear(),
  };
}

describe('Ingatlan CRUD - small unit tests', () => {
  let mockCol;

  beforeEach(() => {
    mockCol = createMockCollection();
    app.locals.collection = mockCol;
  });

  afterEach(() => {
    if (mockCol && mockCol.__clear) mockCol.__clear();
  });

  test('insertOne: creates a new item and returns _id', async () => {
    const newItem = { nev: 'Unit House', cim: 'Unit 1', ar: 50000 };
    const res = await request(app).post('/api/ingatlan').send(newItem);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body.nev).toBe(newItem.nev);
  });

  test('find: GET /api/ingatlan returns list of items', async () => {
    // seed directly using mock collection
    const seed = { nev: 'Seed House', cim: 'Seed 1', ar: 70000 };
    const { insertedId } = await mockCol.insertOne(seed);

    const res = await request(app).get('/api/ingatlan');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.find((it) => it._id === insertedId)).toBeDefined();
  });

  test('findOne: GET /api/ingatlan/:id returns the correct item', async () => {
    const seed = { nev: 'Find House', cim: 'Find 1', ar: 80000 };
    const { insertedId } = await mockCol.insertOne(seed);

    const res = await request(app).get(`/api/ingatlan/${insertedId}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('_id', insertedId);
    expect(res.body.nev).toBe(seed.nev);
  });

  test('updateOne: PUT /api/ingatlan/:id updates the item', async () => {
    const seed = { nev: 'Update House', cim: 'Up 1', ar: 90000 };
    const { insertedId } = await mockCol.insertOne(seed);

    const res = await request(app).put(`/api/ingatlan/${insertedId}`).send({ ar: 95000 });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('ar', 95000);
  });

  test('deleteOne: DELETE /api/ingatlan/:id removes the item', async () => {
    const seed = { nev: 'Delete House', cim: 'Del 1', ar: 110000 };
    const { insertedId } = await mockCol.insertOne(seed);

    const del = await request(app).delete(`/api/ingatlan/${insertedId}`);
    expect(del.status).toBe(204);

    const getAfter = await request(app).get(`/api/ingatlan/${insertedId}`);
    expect(getAfter.status).toBe(404);
  });
});
