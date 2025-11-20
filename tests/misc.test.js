import request from 'supertest';
import app from '../src/app.js';

describe('General endpoints and error bodies', () => {
  test('GET / returns API message', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message');
    expect(typeof res.body.message).toBe('string');
  });

  test('GET /health returns OK and timestamp', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'OK');
    expect(res.body).toHaveProperty('timestamp');
    // timestamp should be a string parseable by Date
    expect(() => new Date(res.body.timestamp)).not.toThrow();
  });

  test('Unknown route returns 404 JSON', async () => {
    const res = await request(app).get('/some/unknown/route');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('message', 'Route not found');
  });

  test('POST error returns standard server error body', async () => {
    const original = app.locals.collection;
    app.locals.collection = {
      insertOne: async () => { throw new Error('boom'); }
    };

    const res = await request(app).post('/api/ingatlan').send({ nev: 'Err' });
    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('message');
    expect(typeof res.body.message).toBe('string');

    app.locals.collection = original;
  });

  test('GET list error returns standard server error body', async () => {
    const original = app.locals.collection;
    app.locals.collection = {
      find: () => { throw new Error('boom'); }
    };

    const res = await request(app).get('/api/ingatlan');
    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('message');
    expect(typeof res.body.message).toBe('string');

    app.locals.collection = original;
  });
});
