import request from 'supertest';
import app from '../src/app.js';
import { createMockCollection, attachMockToApp } from './helpers/mockCollection.js';

describe('Ingatlan CRUD - basic operations', () => {
  let mockCol;

  beforeAll(() => {
    mockCol = createMockCollection();
    attachMockToApp(app, mockCol);
  });

  beforeEach(() => {
    if (mockCol && mockCol.__clear) mockCol.__clear();
  });

  afterAll(() => {
    if (mockCol && mockCol.__clear) mockCol.__clear();
    app.locals.collection = null;
  });

  describe('POST /api/ingatlan', () => {
    let res;
    const newItem = { nev: 'Unit House', cim: 'Unit 1', ar: 50000 };

    beforeAll(async () => {
      res = await request(app).post('/api/ingatlan').send(newItem);
    });

    test('returns status 201', () => {
      expect(res.status).toBe(201);
    });

    test('response has _id', () => {
      expect(res.body).toHaveProperty('_id');
    });

    test('response nev matches sent data', () => {
      expect(res.body.nev).toBe(newItem.nev);
    });
  });

  describe('GET /api/ingatlan (list)', () => {
    let res;
    let insertedId;
    const seed = { nev: 'Seed House', cim: 'Seed 1', ar: 70000 };

    beforeAll(async () => {
      const r = await mockCol.insertOne(seed);
      insertedId = r.insertedId;
      res = await request(app).get('/api/ingatlan');
    });

    test('returns status 200', () => {
      expect(res.status).toBe(200);
    });

    test('returns an array', () => {
      expect(Array.isArray(res.body)).toBe(true);
    });

    test('contains the seeded item', () => {
      expect(res.body.find((it) => it._id === insertedId)).toBeDefined();
    });
  });

  describe('GET /api/ingatlan/:id', () => {
    let res;
    let insertedId;
    const seed = { nev: 'Find House', cim: 'Find 1', ar: 80000 };

    beforeAll(async () => {
      const r = await mockCol.insertOne(seed);
      insertedId = r.insertedId;
      res = await request(app).get(`/api/ingatlan/${insertedId}`);
    });

    test('returns status 200', () => {
      expect(res.status).toBe(200);
    });

    test('returns the correct _id', () => {
      expect(res.body).toHaveProperty('_id', insertedId);
    });

    test('nev matches the seeded item', () => {
      expect(res.body.nev).toBe(seed.nev);
    });
  });

  describe('PUT /api/ingatlan/:id', () => {
    let res;
    let insertedId;
    const seed = { nev: 'Update House', cim: 'Up 1', ar: 90000 };

    beforeAll(async () => {
      const r = await mockCol.insertOne(seed);
      insertedId = r.insertedId;
      res = await request(app).put(`/api/ingatlan/${insertedId}`).send({ ar: 95000 });
    });

    test('returns status 200', () => {
      expect(res.status).toBe(200);
    });

    test('updates the ar field', () => {
      expect(res.body).toHaveProperty('ar', 95000);
    });
  });

  describe('DELETE /api/ingatlan/:id', () => {
    let delRes;
    let getAfter;
    let insertedId;
    const seed = { nev: 'Delete House', cim: 'Del 1', ar: 110000 };

    beforeAll(async () => {
      const r = await mockCol.insertOne(seed);
      insertedId = r.insertedId;
      delRes = await request(app).delete(`/api/ingatlan/${insertedId}`);
      getAfter = await request(app).get(`/api/ingatlan/${insertedId}`);
    });

    test('delete returns 204', () => {
      expect(delRes.status).toBe(204);
    });

    test('subsequent GET returns 404', () => {
      expect(getAfter.status).toBe(404);
    });
  });
});
