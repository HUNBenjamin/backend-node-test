
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

  // Laci's tests for error cases
  test('GET /api/ingatlan returns empty array when collection is empty', async () => {
    mockCol.__clear();
    const res = await request(app).get('/api/ingatlan');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });

  test('GET /api/ingatlan/:id for non-existing id returns 404', async () => {
    const res = await request(app).get('/api/ingatlan/does-not-exist');
    expect(res.status).toBe(404);
  });

  test('PUT /api/ingatlan/:id for non-existing id returns 404', async () => {
    const res = await request(app).put('/api/ingatlan/000000').send({ ar: 123 });
    expect(res.status).toBe(404);
  });

  test('DELETE /api/ingatlan/:id for non-existing id returns 404', async () => {
    const res = await request(app).delete('/api/ingatlan/000000');
    expect(res.status).toBe(404);
  });

  test('POST returns 500 when collection.insertOne throws', async () => {
    // swap in a collection that throws to simulate server error
    const original = app.locals.collection;
    app.locals.collection = {
      insertOne: async () => { throw new Error('boom'); }
    };

    const res = await request(app).post('/api/ingatlan').send({ nev: 'Err', cim: 'Err', ar: 1 });
    expect(res.status).toBe(500);

    app.locals.collection = original;
  });

  test('GET list returns 500 when collection.find throws', async () => {
    const original = app.locals.collection;
    app.locals.collection = {
      find: () => { throw new Error('boom'); }
    };

    const res = await request(app).get('/api/ingatlan');
    expect(res.status).toBe(500);

    app.locals.collection = original;
  });
});

