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

  // --- additional tests (3 per endpoint) ---

  // POST /api/ingatlan - additional 3 tests
  test('insertOne: validation error returns 400/422', async () => {
    const res = await request(app).post('/api/ingatlan').send({ cim: 'No name', ar: 1000 }); // missing nev
    expect([400, 422]).toContain(res.status);
  });

  test('insertOne: database error returns 500', async () => {
    mockCol.insertOne = async () => { throw new Error('db error'); };
    const res = await request(app).post('/api/ingatlan').send({ nev: 'Err', cim: 'Err', ar: 1 });
    expect(res.status).toBe(500);
  });

  test('insertOne: duplicate key returns 409 or 400', async () => {
    mockCol.insertOne = async () => { const e = new Error('dup'); e.code = 11000; throw e; };
    const res = await request(app).post('/api/ingatlan').send({ nev: 'Dup', cim: 'Dup', ar: 1 });
    expect([409, 400]).toContain(res.status);
  });

  // GET /api/ingatlan - additional 3 tests
  test('find: empty collection returns empty array', async () => {
    mockCol.__clear();
    const res = await request(app).get('/api/ingatlan');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  test('find: returns multiple items when present', async () => {
    const a = { nev: 'A', cim: 'A1', ar: 1 };
    const b = { nev: 'B', cim: 'B1', ar: 2 };
    const { insertedId: id1 } = await mockCol.insertOne(a);
    const { insertedId: id2 } = await mockCol.insertOne(b);
    const res = await request(app).get('/api/ingatlan');
    expect(res.status).toBe(200);
    const ids = res.body.map(it => it._id);
    expect(ids).toEqual(expect.arrayContaining([id1, id2]));
  });

  test('find: database error returns 500', async () => {
    mockCol.find = () => { throw new Error('db'); };
    const res = await request(app).get('/api/ingatlan');
    expect(res.status).toBe(500);
  });

  // GET /api/ingatlan/:id - additional 3 tests
  test('findOne: unknown id returns 404', async () => {
    const res = await request(app).get('/api/ingatlan/nonexistent-id-12345');
    expect(res.status).toBe(404);
  });

  test('findOne: invalid id format returns 400/422/404', async () => {
    const res = await request(app).get('/api/ingatlan/$$invalid$$');
    expect([400, 422, 404]).toContain(res.status);
  });

  test('findOne: database error returns 500', async () => {
    const { insertedId } = await mockCol.insertOne({ nev: 'X', cim: 'X', ar: 1 });
    mockCol.findOne = async () => { throw new Error('db'); };
    const res = await request(app).get(`/api/ingatlan/${insertedId}`);
    expect(res.status).toBe(500);
  });

  // PUT /api/ingatlan/:id - additional 3 tests
  test('updateOne: non-existent id returns 404', async () => {
    const res = await request(app).put('/api/ingatlan/does-not-exist-999').send({ ar: 123 });
    expect(res.status).toBe(404);
  });

  test('updateOne: validation error returns 400/422', async () => {
    const { insertedId } = await mockCol.insertOne({ nev: 'U', cim: 'U', ar: 1 });
    const res = await request(app).put(`/api/ingatlan/${insertedId}`).send({}); // invalid payload
    expect([400, 422]).toContain(res.status);
  });

  test('updateOne: database error returns 500', async () => {
    const { insertedId } = await mockCol.insertOne({ nev: 'U2', cim: 'U2', ar: 2 });
    mockCol.updateOne = async () => { throw new Error('db'); };
    const res = await request(app).put(`/api/ingatlan/${insertedId}`).send({ ar: 999 });
    expect(res.status).toBe(500);
  });

  // DELETE /api/ingatlan/:id - additional 3 tests
  test('deleteOne: non-existent id returns 404', async () => {
    const res = await request(app).delete('/api/ingatlan/not-found-321');
    expect(res.status).toBe(404);
  });

  test('deleteOne: invalid id format returns 400/422', async () => {
    const res = await request(app).delete('/api/ingatlan/!!bad-id!!');
    expect([400, 422, 404]).toContain(res.status);
  });

  test('deleteOne: database error returns 500', async () => {
    const { insertedId } = await mockCol.insertOne({ nev: 'D', cim: 'D', ar: 1 });
    mockCol.deleteOne = async () => { throw new Error('db'); };
    const res = await request(app).delete(`/api/ingatlan/${insertedId}`);
    expect(res.status).toBe(500);
  });
});
