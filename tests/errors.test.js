import request from 'supertest';
import app from '../src/app.js';
import { createMockCollection, attachMockToApp } from './helpers/mockCollection.js';

describe('Ingatlan - error cases and edge conditions', () => {
  let mockCol;

  beforeEach(() => {
    mockCol = createMockCollection();
    attachMockToApp(app, mockCol);
  });

  afterEach(() => {
    if (mockCol && mockCol.__clear) mockCol.__clear();
  });

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
